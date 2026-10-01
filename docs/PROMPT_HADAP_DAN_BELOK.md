# Prompt: Cara Hadap (Facing) & Animasi Belok — Pigeon SK8

Dokumen ini menjelaskan **persis** bagaimana merpati di game ini menghadap ke arah tertentu dan bagaimana animasi
belok (pindah jalur) dibuat. Semua angka diambil dari kode yang sedang berjalan.
Bagian **[8. Prompt siap salin]** bisa langsung dipakai untuk meminta AI membuat ulang atau mengubah sistem ini.

File kode yang relevan:

| Tugas | File |
|---|---|
| Pegas jalur, lean, steer, twist, aturan swipe | `src/game/engine.ts` (`updatePlayer`, `input`) |
| Rantai transform, truck, torso, kepala, sayap | `src/game/Player.tsx` |
| Kerangka jalan (posisi + orientasi akar) | `src/game/track.ts` (`frame`, `quat`) |
| Sudut kamera mengikuti jalan | `src/game/Scene.tsx` (`CameraRig`) |
| Model kaki/truck/roda | `src/game/pigeonRig.ts`, `src/game/skins.ts` |
| Tes arah lean/hidung/truck | `test/sim.ts` → `scenarioLeanDirection` |

---

## 1. Sistem koordinat dan tanda arah (baca dulu, ini sumber bug terbesar)

Semua model dan logika memakai **kerangka jalan**, bukan koordinat dunia:

- `+x` = **maju** (arah jalan), `+y` = **atas** (tegak lurus permukaan jalan), `+z` = **kanan layar**.
- `lat` = posisi lateral. **Jalur 0 = kiri, 1 = tengah, 2 = kanan**: `LANE_LAT = [-2.4, 0, 2.4]`.
- Kamera ada di belakang merpati melihat ke `+x`, jadi kanan layar = `+z`.
- Belok kanan = bergerak ke `+z` = `latVel > 0`.

Aturan three.js (right-hand rule) yang dipakai. **Jangan ditebak, sudah diuji numerik:**

| Operasi | Hasil |
|---|---|
| `rotation.y = +a` | hidung (+x) berputar ke **-z** (kiri). Jadi belok kanan butuh `rotation.y` **negatif**. |
| `rotation.x = +a` | bagian atas condong ke **+z** (kanan) dan sisi **+z turun**. Condong ke kanan butuh `rotation.x` **positif**. |
| `rotation.z = +a` | hidung naik (pitch up). Condong ke depan = negatif. |

Tabel tanda saat **belok kanan** (untuk belok kiri semua terbalik):

| Variabel | Tanda | Arti fisik |
|---|---|---|
| `p.latVel` | `> 0` | bergerak ke +z |
| `p.steer` | `< 0` | seluruh rig menghadap ke kanan |
| `p.carve` | `< 0` | konvensi internal: "+ = condong ke -z (kiri)" |
| `p.roll` | `> 0` | `roll = -carve`; atas condong ke kanan, sisi kanan turun |
| yaw truck depan | `< 0` | roda depan menunjuk ke kanan |
| yaw truck belakang | `> 0` | roda belakang menunjuk ke kiri (berlawanan) |

---

## 2. Rantai hadap (hierarki transform)

Dari luar ke dalam, di `Player.tsx`:

```
root                     posisi  = track.frame(s, lat, h)            (dihitung engine.updateTransform)
│                        quaternion = track.quat(s)                   -> merpati MENGHADAP +x jalan (mengikuti belokan & kemiringan jalan)
└─ yawG                  rotation.y = p.yaw + p.showYaw + p.steer
   │                       p.yaw     = spin trik (BS/FS 360, Coo 540)
   │                       p.showYaw = putaran menu/podium (0 saat bermain)
   │                       p.steer   = BELOK ASLI (lihat bagian 3)
   └─ group scale=RIG.rootScale (0.805)
      └─ bank              rotation.x = p.roll     <- pivot di garis kontak roda (origin di level jalan)
         ├─ board          y=RIG.boardY; rotation(flip + grab, boardYaw + boardTwist, pitch)
         │   ├─ truckFront (kingpin +0.55x)  rotation.y = +steerTruck   (roda depan)
         │   └─ truckRear  (kingpin -0.55x)  rotation.y = -steerTruck   (roda belakang)
         └─ pigeon         y=RIG.pigeonY
             ├─ legs (IK, sol kaki dikunci ke deck)
             └─ torso      lean dengan pivot di PINGGUL (HIP_Y = 0.3), bukan di kaki
                 ├─ head   yaw dasar -0.32 (pandangan 3/4) + look + roll kecil
                 └─ wings
```

Poin penting:
1. **Arah dasar** hanya berasal dari `track.quat`. Merpati selalu menghadap sepanjang jalan; di tikungan jalan, akar ikut berputar otomatis.
2. **Belok pindah jalur** adalah tambahan kecil di `yawG` (`p.steer`), bukan mengubah `root`. Setelah sampai di jalur baru, `steer` kembali ke 0.
3. **Bank** memutar seluruh rig di sekitar **garis kontak roda**: roda sisi dalam menapak, sisi luar terangkat. Ini yang membuat papan tampak carving.
4. **Torso** berputar di pinggul, jadi kaki dan papan tetap menyatu. Merpati tidak berputar dari ujung kaki.
5. Saat **crash**, `yawG.rotation.y = 0`, `bank.rotation.x = 0`. Ragdoll (`body.rx/ry/rz`) mengambil alih rotasi grup `pigeon`.

### Hadap di menu (karakter select)
- `FRONT_YAW = 3.75` rad: merpati menghadap kamera dalam tampilan 3/4.
- Di podium `showYaw += 0.35 rad/s` (berputar pelan seperti turntable). `skinPop()` dan `faceCamera()` mengembalikannya ke `FRONT_YAW`.
- Saat START: `showYaw = wrapPi(showYaw)` lalu meluruh `showYaw *= exp(-6·dt)` sampai < 0.005 → hidung berputar mulus menghadap jalan.
- Kamera menu memakai `orbit = -0.55` rad.

### Hadap kamera saat bermain
`CameraRig` mengejar heading jalan di titik `distance + 4 + 0.3·speed` dengan `yaw += (th - yaw)·(1 - exp(-3.5·dt))`.
Jadi kamera selalu berada di belakang merpati mengikuti jalan.

---

## 3. Pipeline belok (urutan per frame di `updatePlayer`)

```
input swipe ←/→
  └─ targetLane ±1  (dibatasi 0..2)                       [engine.input]
       │
       ▼
(1) PEGAS JALUR  — critically damped, integrasi eksak
       ω = (udara ? 10.5 : 11) · √speedMult   rad/s
       x0 = lat - tl,  v0 = latVel,  e = exp(-ω·dt),  c2 = v0 + ω·x0
       lat    = tl + (x0 + c2·dt)·e
       latVel = (v0 - ω·c2·dt)·e
       snap bila |tl-lat| < 0.004 dan |latVel| < 0.02
       → mulus, TANPA overshoot, tiba ~0.57 s (mendarat ~0.62 s jika sedang lompat)
       │
       ▼
(2) LEAN ("carve") — niat gerak, bukan percepatan mentah
       remaining = clamp((tl - lat)/2.4, -1, 1)      sisa jarak menuju jalur
       moving    = clamp(latVel/7, -1, 1)            menahan lean di tengah gerakan
       leanAmt   = clamp(0.7·remaining + 0.55·moving, -1, 1)
       leanMax   = udara ? 0.5 : 0.62  rad
       carve     = lerp(carve, -leanAmt·leanMax, 1 - exp(-16·dt))
       roll      = -carve                            → ke Player: bank.rotation.x
       │
       ▼
(3) STEER (belok asli) — rig menghadap ke vektor kecepatan
       fwd         = max(speed, 6)
       steerTarget = -atan2(latVel, fwd) · (udara ? 0.85 : 1.0)
       steer       = lerp(steer, clamp(steerTarget, ±0.55), 1 - exp(-18·dt))   → yawG.rotation.y
       boardTwist  = lerp(boardTwist, clamp(steerTarget·0.25, ±0.2), 1 - exp(-14·dt))
       │              papan sedikit memimpin belokan, ditambahkan ke board.rotation.y
       ▼
(4) airShift  = udara ? clamp(|latVel|/6, 0, 1) : 0     (naik 16/s, turun 6/s)
```

### Animasi lanjutan di `Player.tsx` (semua memakai `carve`, `steer`, `latVel`, `airShift`)

**Truck (mekanisme skateboard asli).** Miring papan memutar hanger:
```
steerTruck = clamp(carve / 0.62, -1, 1) · TRUCK_MAX(0.42 rad ≈ 24°) · k     k = 1 di tanah/grind, 0.6 di udara
truckFront.rotation.y = +steerTruck      // depan mengikuti arah belok
truckRear.rotation.y  = -steerTruck      // belakang berlawanan → roda menggelinding di busur
```
Roda tetap berputar di as masing-masing (`wheel.rotation.z -= speed·dt·7`).

**Badan.**
- `torsoCarve = -carve · (udara ? 0.55 : 0.35)` → torso condong **lebih jauh ke dalam tikungan** daripada papan (berat di sisi dalam).
- `hipShift = sign(latVel) · min(1, |latVel|/6) · (udara ? 0.10 : 0.06)` → pinggul bergeser ke sisi dalam.
- `torso.rotation.y = -steer · 0.35` → bahu sedikit *counter-steer* (tetap lebih terbuka ke arah jalan daripada papan).
- Pivot lean di `HIP_Y`, jadi kaki dan papan tidak ikut terpelintir.

**Kepala.** `look = clamp(latVel · 0.12, ±0.5)` ditambahkan ke yaw dasar `-0.32` (menoleh ke jalur tujuan); roll `-carve · 0.3`.

**Sayap.**
- Tanah: sayap luar membuka `groundCarve = min(0.8, |carve|·1.4)` untuk keseimbangan.
- Udara: kedua sayap terbentang; sayap arah gerak menjangkau ke jalur baru (skala `airShift`).

**Kaki.** IK dua-tulang: sol kaki selalu dikunci ke deck (target dalam ruang deck), jadi saat rig miring dan berputar kaki tidak "putus".

---

## 4. Aturan input yang mempengaruhi belok

- Swipe kiri/kanan **di tanah**: `targetLane ± 1`.
- Swipe kiri/kanan **di udara**: tetap pindah jalur dengan carve halus (tidak memicu trik).
- **360 spin di udara** hanya jika swipe dua kali ke arah yang sama dalam 0.3 s **atau** swipe ke arah tepi saat tidak ada jalur lagi.
- Kecepatan skate 2×/3× mengalikan `ω` dengan `√speedMult` supaya pindah jalur menempuh jarak jalan yang mirip.

---

## 5. Timeline satu pindah jalur (jalur tengah → kanan, 1× speed)

| t (s) | lat | latVel | yang terlihat |
|---|---|---|---|
| 0.00 | 0.0 | 0 | lurus |
| 0.08 | ~0.6 | ~9.7 | lean ke kanan cepat naik, hidung mulai berputar ke kanan, truck depan ke kanan |
| 0.17 | ~1.4 | ~7.4 | puncak lean/steer, torso ke dalam tikungan |
| 0.33 | ~2.1 | ~2.3 | mulai menegak |
| 0.57 | 2.40 | ~0 | tiba di jalur; roll, steer, carve ≈ 0 |

Nilai terukur di simulasi: puncak lean tanah ≈ 31°, udara ≈ 25°; puncak yaw 13°–31° tergantung kecepatan maju
(batas keras `±0.55 rad`); overshoot = 0.000.

---

## 6. Jebakan yang pernah terjadi (jangan diulang)

1. **Lean terbalik.** Sempat `roll = carve` sehingga saat belok kanan rig **condong ke kiri**, kepala di atas sisi kiri dan roda kanan terangkat,
   sementara hidung dan truck berbelok ke kanan. Penyebab: salah membaca right-hand rule (`rotation.x` positif menurunkan sisi +z).
   Perbaikan: `roll = -carve`, `torsoCarve = -carve·k`, `head roll = -carve·0.3`.
2. Memutar dari kaki, bukan dari pinggul, membuat kaki terlihat putus. Lean harus berpivot di `HIP_Y`.
3. Roll di grup yang origin-nya bukan di level jalan membuat papan melayang saat miring. `bank` harus berorigin di garis kontak roda.
4. Menyimpan `steer` sebagai rotasi `root` merusak orientasi di tikungan jalan. Steer harus di `yawG` (relatif ke kerangka jalan).
5. Percepatan lateral mentah sebagai sumber lean menghasilkan dua ayunan (masuk-keluar). Pakai niat gerak (`remaining` + `moving`).

---

## 7. Cara verifikasi (harus lolos semua)

Tes otomatis: `npx esbuild test/sim.ts --bundle --platform=node --format=esm --outfile=/tmp/sim.mjs --define:window=undefined && node /tmp/sim.mjs`

Keluaran yang diharapkan di `scenarioLeanDirection`:
```
right: roll[0.00, 0.54] steer[-0.54, 0.00] carve[-0.54, 0.00] -> leanIntoTurn=true noseIntoTurn=true trucksIntoTurn=true settled(roll=0.000, steer=-0.000)
left : roll[-0.54, 0.00] steer[0.00, 0.54] carve[0.00, 0.54]   -> leanIntoTurn=true noseIntoTurn=true trucksIntoTurn=true settled(...)
```
Dan di `scenarioAirLane`: `overshoot=0.000`, `lane reached ≈ 0.57s`, `landed ≈ 0.62s`.

Cek geometri manual (Node): buat hierarki `root → yawG → scale → bank`, set `bank.rotation.x = +0.5`, `yawG.rotation.y = -0.3`.
Harus terbukti: kepala berada di `z > 0`, roda kanan lebih rendah dari roda kiri, dan titik hidung punya `z > 0`.

---

## 8. Prompt siap salin

> Kamu adalah developer game 3D (React + three.js / react-three-fiber). Game: endless skater voxel dengan kamera chase
> di belakang karakter (gaya Subway Surfers), 3 jalur, jalan berbelok/menurun. Implementasikan **arah hadap** dan **animasi belok**
> dengan aturan berikut, tanpa mengubah gameplay lain.
>
> **Koordinat (kerangka jalan):** `+x` maju, `+y` atas, `+z` kanan layar. Jalur 0/1/2 = kiri/tengah/kanan di `lat = -2.4/0/2.4`.
> Posisi dan orientasi akar karakter dihitung dari spline jalan (`track.frame`, `track.quat`), sehingga karakter selalu menghadap sepanjang jalan
> dan ikut tikungan/kemiringan jalan. Belok pindah jalur adalah **tambahan kecil** di anak `yawG`, bukan di akar.
>
> **Hierarki:** `root(track) → yawG(rotation.y = trikSpin + menuYaw + steer) → scale → bank(rotation.x = roll, origin di level jalan)
> → { board(rotation.y += boardTwist; truckFront/truckRear di kingpin), pigeon(legs IK, torso berpivot di pinggul → head, wings) }`.
>
> **Gerak lateral:** pegas critically damped dengan integrasi eksak, `ω = 11 rad/s` (10.5 di udara) `× √speedMult`.
> Dari `latVel` hitung: `remaining = clamp((targetLat-lat)/2.4,-1,1)`, `moving = clamp(latVel/7,-1,1)`,
> `leanAmt = clamp(0.7·remaining + 0.55·moving,-1,1)`, `carve = lerp(carve, -leanAmt·leanMax, 1-exp(-16dt))` dengan `leanMax = 0.62` (0.5 di udara),
> `roll = -carve`. **Belok asli:** `steerTarget = -atan2(latVel, max(speed,6))·(udara?0.85:1)`,
> `steer = lerp(steer, clamp(steerTarget,±0.55), 1-exp(-18dt))`, `boardTwist = lerp(.., clamp(steerTarget·0.25,±0.2), 1-exp(-14dt))`.
>
> **Truck:** `steerTruck = clamp(carve/0.62,-1,1)·0.42·(tanah?1:0.6)`; depan `rotation.y = +steerTruck`, belakang `-steerTruck`.
> **Badan:** torso condong ke dalam tikungan `-carve·(tanah 0.35 / udara 0.55)`, pinggul bergeser ke sisi dalam, bahu counter-steer `-steer·0.35`,
> kepala menoleh `clamp(latVel·0.12,±0.5)`, sayap luar membuka saat carve di tanah; kaki memakai IK dengan sol dikunci ke deck.
>
> **Aturan tanda (three.js right-hand rule):** `rotation.y` positif memutar hidung ke -z (kiri) → belok kanan butuh yaw negatif.
> `rotation.x` positif menurunkan sisi +z dan menggeser atas ke +z → condong ke kanan butuh `rotation.x` positif.
> Saat belok kanan: `latVel>0, steer<0, carve<0, roll>0`, truck depan yaw negatif.
>
> **Kriteria lolos:** (1) lean, hidung, dan truck searah dengan belokan di kiri dan kanan; (2) semua kembali ke 0 tepat saat tiba di jalur;
> (3) overshoot 0.000; (4) jalur tercapai ≈0.57 s; (5) kaki tidak terlepas dari papan saat miring; (6) di udara pose tetap mulus dan mendarat di jalur baru;
> (7) tambahkan tes numerik yang membuktikan arah lean/hidung/truck untuk belok kiri dan kanan.
