# Mode Belok BARU (Kemudi Roda) — implementasi di Pigeon SK8

Game punya dua mode belok, dipilih di menu utama lewat tombol **TURNING** (tersimpan di `localStorage`, kunci `pigeon-sk8-turn`):

| Mode | Cara kerja |
|---|---|
| **OLD · SLIDE** | Pegas critically-damped menggeser `lat` ke jalur tujuan. Lean/yaw hanya kosmetik yang mengikuti gerakan. Ada di `docs/PROMPT_HADAP_DAN_BELOK.md`. |
| **NEW · STEERING** (default) | Hidung papan menoleh dulu. Posisi samping adalah **akibat**: `lat += sin(heading) · kecepatanMaju · dt`. Yaw datang dari sudut truck. |

Kode: fisika di `src/game/turnModel.ts` (fungsi murni, tanpa three.js), dipanggil dari `engine.ts` (`updatePlayer`), pose di `Player.tsx`.

---

## 1. Menerjemahkan konvensi sumbu spesifikasi ke game ini

Spesifikasi awal memakai dunia **+X kanan, −Z depan**. Game ini memakai kerangka jalan (mengikuti spline yang berbelok) dengan **+x maju, +z kanan layar**. Semua *isi* aturan sama; hanya nama sumbu yang berbeda:

| Spesifikasi | Game ini |
|---|---|
| depan = −Z | depan = **+x** |
| kanan = +X | kanan = **+z** |
| `heading` positif = hidung ke kanan | sama: `heading > 0` = hidung ke **+z** |
| `lean` positif = miring ke kanan | sama: `lean > 0` = miring ke **+z** |
| yaw visual = `−heading` | sama: `yawG.rotation.y = −headingVis` |
| roll di sumbu papan, `rotation.z = −lean·roll` | sumbu papan di sini adalah **x**: `bank.rotation.x = +lean·roll` |
| urutan Euler `YZX` (yaw dulu, roll di sumbu papan) | grup bersarang `yawG (Y)` → `bank (roll)`: hasilnya identik |
| truck depan `rotation.y = −lean·steerMax` | sama (`truckF = −sF`) |
| truck belakang `= −0.85 × sudut depan` | sama, dengan tanda: `truckR = +0.85·sF` (visual), fisik `sR = −0.85·sF` |

Aturan tanda three.js yang dipakai: `rotation.y` positif memutar hidung ke −z (kiri), jadi belok kanan = yaw **negatif**. `rotation.x` positif menurunkan sisi +z dan memiringkan bagian atas ke +z, jadi condong ke kanan = roll **positif**.

Saat belok kanan: `heading>0`, `lean>0`, `sF>0` (fisik) → `steer<0`, `roll>0`, `truckF<0`, `truckR>0`. Belok kiri semuanya terbalik. Ini diuji otomatis (lihat bagian 6).

---

## 2. Pipeline fisika (per frame, sub-step 120 Hz)

```
swipe ←/→ ─► targetLane (0,1,2)   [posisi TIDAK diset langsung]
   1  referensi halus ke pusat jalur: pegas critically-damped, ω = 11, tanpa overshoot
   2  vDes = refV + (refX − px)·5                      (hanya bila papan tertinggal dari referensi;
                                                        bila sudah melewati referensi, langsung menuju jalur, tidak ditarik mundur)
   2b hukum pengereman: jangan minta kecepatan lateral yang tidak bisa dibatalkan sebelum pusat jalur
   3  desiredHeading = asin(vDes / kecepatanMaju), dibatasi ±0.75 rad
   4  wantRate = (desiredHeading − headingPrediksi)·K + feedforward
      steerDiff = atan(wantRate · wheelbase·3.5 / (kecepatan · grip))     ← balikkan model sepeda
   5  lean diminta = steerDiff / 1.85 / steerMax, dibatasi ±1
      laju lean dibatasi: 14/detik di darat, 17/detik di udara
   6  sudut truck depan mengejar lean·steerMax (peredaman λ 18 darat, λ 10 udara); belakang = −0.85 × depan
   7  turnRate = kecepatan · tan(depan − belakang) · grip / (wheelbase·3.5)
      heading += turnRate·dt, dibatasi ±0.8 rad
   8  latVel = sin(heading) · kecepatanMaju;   lat += latVel·dt;   lat dijepit di dalam jalan
   9  sudah tiba di jalur → heading & lean diluruskan pelan, tidak ada goyangan mikro
```

Konstanta (`TURN` di `turnModel.ts`):

| Nama | Nilai | Catatan |
|---|---|---|
| `STEER_MAX_GROUND` / `AIR` | 0.42 / 0.28 rad | ~24° di darat |
| `GRIP_GROUND` / `AIR` | 1 / 0.55 | roda tidak mencengkeram di udara |
| `REF_OMEGA`, `POS_GAIN` | 11, 5 | dari spesifikasi |
| `REAR_RATIO` | 0.85 | truck belakang counter-steer |
| `LEAN_RATE_GROUND` / `AIR` | 14 / 17 per detik | badan tidak boleh snap |
| `TRUCK_DAMP_GROUND` / `AIR` | 18 / 10 | truck "menggantung" di udara |
| `WHEELBASE`·`EFFECTIVE` | 0.5 · 3.5 | **disetel**, lihat di bawah |
| `HEADING_GAIN` | 18 | **disetel** |
| `BRAKE_MARGIN` / `_AIR` | 1.0 / 0.4 | **disetel** |
| `PREDICT` / `_AIR` | 0.04 / 0.12 s | **disetel**: kompensasi jeda truck |
| `LAG` / `LAG_AIR` | 0.09 / 0.2 s | **disetel** |

Spesifikasi tidak menyebut nilai wheelbase, gain, atau margin. Angka bertanda "disetel" dipilih lewat pencarian grid di Node agar memenuhi target: settle 0,6–0,75 detik, overshoot ≈ 0, sudut steer mengecil saat makin cepat. Tiga tambahan di luar spesifikasi diperlukan supaya tanpa overshoot: feedforward percepatan referensi, hukum pengereman berbasis kemampuan yaw truck, dan prediksi heading (truck punya jeda).

### Hasil terukur (mesin sungguhan, `test/sim.ts`)

| Kecepatan maju | Settle (jalur 1 → 2) | Overshoot | Puncak heading | Puncak steer depan |
|---|---|---|---|---|
| 7,4 (1×) | 0,67 s | 2,1 cm | 43° | 22° |
| 14,8 (2×) | 0,48 s | 0 | 39° | 16,5° |
| 22,2 (3×) | 0,48 s | 0 | 26° | 11° |

Di kecepatan sangat rendah (≈5 u/s) belok butuh ≈0,95 s, karena papan memang tidak bisa berbelok secepat itu; ini sifat fisika, bukan bug. Lateral terbukti berasal dari heading: Σ sin(heading)·v·dt = 2,44 / 2,39 / 2,40 vs Δlat = 2,40. Di udara sudut truck maksimum 15,3° (batas 16°) dan pindah jalur butuh ≈1,0 s (lebih longgar), lalu dilanjutkan di tanah setelah mendarat.

---

## 3. Animasi (mengikuti fisika, bukan animasi terpisah)

Rantai transform: `root(track.quat)` → `yawG.rotation.y = trikSpin + menuYaw − headingVis (λ16)` → `bank.rotation.x = leanVis · roll` → `board` / `pigeon`.

- **Roll**: 0,50 rad di darat, 0,62 rad di udara (dicampur mulus lewat `airBlend`). Pivot di **tepi kontak roda**, bukan di tengah papan: `bank.position = (0, z₀·sinθ, z₀·(1−cosθ))`, `z₀ = jarak roda + setengah lebar roda = 0,40`. Tanpa ini roda dalam menembus aspal (terukur 0,135 unit di NEW, 0,203 di OLD); sesudahnya sisa 0,03 hanya dari sudut roda kubus yang berputar. Di udara pivot kembali ke tengah (transisi halus).
- **Truck**: depan `= −lean·steerMax`, belakang `= +0,85·lean·steerMax` (visual), λ 18 darat / 10 udara. Roda berputar di as masing-masing: `spin += kecepatan / 0,065 · dt`, ×0,3 saat grind, ×0,6 di udara (freewheel); langkah per frame dibatasi 1,2 rad agar tidak alias.
- **Badan**: torso dibalik terhadap papan `−lean·0,14` (roll bersih lebih kecil dari papan); pinggul geser ke dalam tikungan `lean·0,06`; kepala counter-roll `−lean·0,22` dan menoleh `yaw −0,32 − lean·0,35`; sayap **luar** naik `|lean|·0,5` (darat) / `·0,35` (udara); ekor mengayun `−lean·0,35` (ke sisi luar, lambat, ada flutter kecil); di udara papan miring ekstra `lean·0,2·airBlend`.
- **Grind**: `lat` dikunci ke jalur rail, heading & lean kembali 0, swipe kiri/kanan diabaikan sampai lompat turun.

Terukur di rig sungguhan saat belok masuk kanan (mode NEW): truck depan +19° dan belakang −16° terhadap papan; roll papan +25,8°, torso 18,5°, kepala 7,2° (hampir tegak); roda kanan lebih rendah dari roda kiri. Di OLD torso 34,8° dan kepala 43,6° (menyender ke tikungan) — perbedaan ini memang disengaja.

---

## 4. Penyimpangan dari spesifikasi (disengaja)

1. **Stance**: spesifikasi menulis burung berdiri menyamping (regular stance, badan menghadap +X). Di game ini burung menghadap **searah papan** (paruh ke depan, kamera melihat punggungnya). Memutar stance akan merusak animasi dorong (kaki keluar ke samping), kaki IK, pose menu, dan thumbnail, jadi tidak dilakukan. Semua aturan belok, lean, dan truck tidak bergantung pada stance.
2. Batas "tiba di jalur" diperlebar dari 0,02 ke 0,05 (posisi), 0,03 ke 0,05 (heading), 0,06 ke 0,1 (lean), supaya 5 cm terakhir tidak merayap. Sisa maksimal 5 cm digeser halus (tidak terlihat; lebar jalur ±1 unit).
3. Tiga tambahan kontrol di atas (feedforward, pengereman, prediksi) — tidak ada di spesifikasi, tapi tidak mengubah alurnya.

---

## 5. Prompt siap salin

> Buat sistem belok skateboard untuk endless runner 3-jalur (react-three-fiber, kamera chase). Jangan geser karakter menyamping;
> belok harus keluar dari kemudi roda. Kerangka jalan: +x maju, +z kanan layar, jalur 0/1/2 di lat −2.4/0/2.4.
> Swipe hanya mengubah jalur tujuan. Buat referensi critically-damped (ω=11) ke pusat jalur, `vDes = refV + (refX−px)·5`
> (hanya bila tertinggal; bila sudah melewati referensi menujulah ke jalur), `desiredHeading = asin(vDes/v)` ±0.75 rad, lalu
> balikkan model sepeda: `steerDiff = atan(wantRate·wb·3.5/(v·grip))`, `lean = steerDiff/1.85/steerMax`, laju lean ≤14/s (17 udara).
> Truck depan `= lean·steerMax` (0.42 darat, 0.28 udara), belakang `−0.85×`, teredam λ18/λ10. Yaw keluar dari truck:
> `rate = v·tan(depan−belakang)·grip/(wb·3.5)`, `heading += rate·dt` ±0.8; grip 1 di darat, 0.55 di udara. Lateral HANYA `sin(heading)·v`.
> Tambahkan feedforward percepatan referensi, hukum pengereman `θ=acos(1−c·m·jarak)` dan prediksi heading agar tidak overshoot.
> Visual: `yaw = −heading` (λ16), roll `= +lean·(0.5 darat / 0.62 udara)` dengan pivot di tepi kontak roda, torso counter-roll `−lean·0.14`,
> pinggul ke dalam, kepala counter-roll `−lean·0.22` dan menoleh ke belokan, sayap luar naik, ekor mengayun, roda berputar `v/0.065`
> (×0.3 grind, ×0.6 udara), kunci lateral saat grind. Sediakan pilihan mode LAMA/BARU di menu.
> Kriteria: lean, hidung, truck searah di kiri dan kanan; semua kembali 0 saat tiba; overshoot ≈0; settle 0.6–0.75 s;
> sudut steer mengecil saat makin cepat; roda dalam tidak menembus aspal; ada tes numerik yang membuktikan semuanya.
