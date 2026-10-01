# Pengendara Motor & Karakter Baru (Kucing Oren, Flamingo, Gagak)

Dokumen ini mencatat dua perubahan besar di `85e7329` → `ebace71` → (commit berikutnya):

1. **Bentuk pengendara motor dari arah depan + helmnya diperbaiki** (dulu cuma tumpukan kotak, tangan mengambang di atas setang).
2. **Karakter selain merpati**: Kucing Oren berdiri, Flamingo, dan Gagak — semua bisa dimainkan.

## 1. Pengendara motor (`src/game/models.ts` → `motorcycleParts`)

Model motor sekarang 52 part dan dibangun dengan anatomi yang benar:

| Bagian | Detail |
| --- | --- |
| Pinggul | Duduk **tepat di atas jok** (bawah pinggul = atas jok = 0.69) |
| Kaki | Paha maju ke tangki, betis turun ke **footpeg** baru di sisi mesin, sepatu menginjak footpeg |
| Badan | Punggung condong ke depan (perut → dada → bahu), strip resleting senada warna motor, kerah putih |
| Lengan | Dua segmen dengan **siku membengkok** (rz −0.36 lalu −0.58); sarung tangan duduk **pas di grip setang** (jarak < 0.05) |
| Helm | Tempurung **membulat 4 tingkat** (makin kecil ke atas), dasar helm menutup tengkuk, pelipis kiri/kanan, **kaca gelap** dengan bibir atas, chin bar menutup dagu, strip warna senada motor, spoiler belakang |

Ditambah: footpeg, warna celana (`RIDER_PANTS`) dan jaket per varian supaya tiap varian (0–5) kelihatan berbeda.

Uji: `test/characters.ts` (bagian "Pengendara motor + helm") memastikan pinggul duduk di jok, dua tangan menggenggam grip, helm punya kaca + chin bar, dan tidak ada bagian yang menembus aspal.

## 2. Karakter baru (`src/game/chars.ts` + `src/game/skins.ts`)

Karakter baru memakai **rig dan nama fungsi yang sama** dengan merpati (`Player.tsx`, `pigeonRig.ts`, `thumbs.ts`),
jadi animasi (dayung, grind, trick, crash ragdoll, kepala memantau jalan) langsung jalan tanpa kode baru.

Anchor yang wajib dipatuhi setiap spesies (lihat komentar `chars.ts`):

```
telapak kaki    y = 0            (badan mulai dari tinggi pinggul, kaki dari rig)
bahu            (0, 0.72, ±0.3)  ("sayap" = lengan depan / sayap)
sendi kepala    (0.32, 1.04, 0)  (kepala + paruh/moncong dibangun di sekitar origin ini)
pangkal ekor    (−0.40, 0.55, 0)
pinggul         (0, 0.30, ±0.16)
```

| Karakter | Ciri model |
| --- | --- |
| **Kucing Oren** (`kind: "cat"`) | Badan gempal oranye + dada krem, garis tabby di punggung/samping, kepala besar dengan **telinga segitiga** (luar + dalam pink), moncong krem, hidung pink, **kumis**, mata putih+pupil; "sayap" jadi **lengan depan bertelapak**; ekor panjang **melengkung naik** dengan ujung putih; kaki lebih gempal dari merpati dengan **telapak berkuku** |
| **Flamingo** (`kind: "flamingo"`) | Badan kecil, **leher panjang** (bagian dari badan) naik ke sendi kepala, gelang warna di pangkal leher, dada lebih terang, bulu ekor gelap; kepala kecil, **paruh 3 segmen melengkung ke bawah** dengan ujung hitam; sayap panjang ramping; **kaki paling ramping** dengan telapak berselaput |
| **Gagak** (`kind: "crow"`) | Badan hitam dengan **kilau biru** di punggung, dada abu gelap, **bulu tengkuk menjuntai**; kepala dengan **paruh besar panjang** (pangkal lebih terang, ujung menukik), **mata pucat** khas gagak; sayap lebih panjang dari merpati, ekor berbentuk baji |

Ketiganya **gratis** (`cost: 0`), jadi otomatis kebuka (`store.ts` menambahkan semua skin gratis ke `unlocked`).

Pemilihnya ada di menu **SKINS → tab "KARAKTER"** (dulu "MERPATI"), plus bisa di-swap dari karusel di menu utama.
Kalau WebGL mati, ikon SVG cadangan (`PigeonIcon`) juga sudah mengenal tiap spesies.

## 3. Cara menambah karakter/spesies baru

1. Tambah `kind` baru di `CharKind` (`skins.ts`) dan satu entri di `SKINS` dengan palet warnanya.
2. Buat builder di `chars.ts` (`body`, `head`, `wing`/lengan, `tail`, kaki) mengikuti anchor di atas.
3. Sambungkan di dispatcher `charBodyParts` / `charHeadParts` / `charWingParts` / `charTailParts` / `charLegParts`.
4. Tambah cabang ikon di `PigeonIcon.tsx` (cadangan bila thumbnail 3D gagal).
5. Jalankan `npx esbuild test/characters.ts --bundle --platform=node --outfile=/tmp/characters.cjs && node /tmp/characters.cjs`.

## 4. Arah hadap kendaraan dari arah depan & jalur perempatan

**Bug yang diperbaiki:** di `World.tsx` (komponen `Movers`), cabang animasi `car || motorcycle`
memanggil `inner.rotation.set(0, 0, 0)` tiap frame. Baris itu **menimpa yaw π** yang dipasang
`<group rotation-y={innerRot}>`, jadi mobil & motor dari arah depan selama ini melaju **mundur**
(moncong + pengendaranya membelakangi pemain). Sekarang yaw dijaga:
`inner.rotation.set(0, Math.PI, 0)` → moncong motor, pengendara, dan visor helm menghadap pemain.
Diuji pakai vektor rig: `dot(moncong, arah pemain) = −1.000`.

**Jalur (lane) di perempatan:**
- Mobil penyeberang sekarang memakai **jalur kiri** masing-masing arah
  (`CROSS_LANE_OFFSET = 2.0`, tepat di tengah panah jalur yang dicat di dek jalan lintas):
  yang melaju ke `+lat` di jalur `+s`, yang ke `−lat` di jalur `−s` — tidak ada dua arah di jalur yang sama.
- Rodanya **menapak dek jalan lintas**: `crossCarH()` sekarang rata di jalan utama, naik mulus
  lewat curb-cut (|lat| 3.6 → 4.0), dan **tepat setinggi dek 0.175 m mulai dari bibir dek** —
  sebelumnya ramp baru penuh di |lat| 4.2 sehingga roda sempat terbenam ~9 cm di bibir perempatan.
  Model mobil penyeberang juga dinaikkan 2 cm (tapak ban kini pas di y = 0, tidak lagi -0.02).
- **Jalan lintas diperpanjang** dari 26 m jadi 38 m per sisi (`CROSS_STREET_LEN`) dan mobil
  muncul/hilang di |lat| 38/41 (`CROSS_SPAWN_LAT`/`CROSS_DESPAWN_LAT`) — tidak lagi nongol atau
  lenyap tepat di depan pemain; marka, trotoar, dan kanstin ikut memanjang.
- **Tidak ada mobil bertumpuk sejalur**: mobil baru tidak disusulkan kalau mobil searah masih
  dalam 14 m dari titik muncul.
- **Rem halus**: mobil penyeberang memperlambat (`speedK`) lalu berhenti, bukan menghentak.
- Penyeberang **tidak menembus** lalu lintas jalan utama: kalau ada mobil/motor di/dekat perempatan
  mereka berhenti menunggu di tepi (`waiting`), lalu jalan lagi saat bebas. Pemain **tidak** dihitung,
  jadi bahaya T-bone + HOOD JUMP tetap ada. Kendaraan yang sudah di tengah perempatan tidak berhenti mendadak.

## 5. Verifikasi

```bash
./node_modules/.bin/tsc --noEmit                     # bersih
npx esbuild test/animalSize.ts --bundle --platform=node --outfile=/tmp/a.cjs && node /tmp/a.cjs   # 32/32
npx esbuild test/newFeatures.ts --bundle --platform=node --outfile=/tmp/n.cjs && node /tmp/n.cjs  # 36/36
npx esbuild test/characters.ts --bundle --platform=node --outfile=/tmp/c.cjs && node /tmp/c.cjs   # 82/82
npx esbuild test/traffic.ts --bundle --platform=node --outfile=/tmp/t.cjs && node /tmp/t.cjs      # 32/32
# catatan: test/traffic.ts membaca src/game/World.tsx, jalankan dari root repo
npx vite build                                       # sukses
```
