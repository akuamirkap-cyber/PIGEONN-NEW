# Ukuran Kucing & Ayam — BESARIN 1.7x / 1.2x

Permintaan: **objek KUCING dibesarkan 1.7x dan objek AYAM 1.2x.**

Semua angka ukuran hewan sekarang ada di satu blok di `src/game/engine.ts`
(blok `Ukuran hewan (BESARIN): kucing 1.7x, ayam 1.2x`), dan `World.tsx` cuma
memakai hasilnya untuk menggambar. Tujuannya: skala model, hitbox tabrakan, dan
radius ragdoll tidak pernah beda angka lagi.

## 1. Angka sebelum & sesudah

| | Sebelum | Sesudah |
|---|---|---|
| Skala ayam (`CHICKEN_SCALE`) | 0.58 | **0.696** (0.58 x 1.2) |
| Skala kucing (`CAT_SCALE`) | 0.70 | **1.19** (0.70 x 1.7) |
| Tinggi ayam (jengger teratas) | 0.72 m | **0.87 m** |
| Tinggi kucing (ujung ekor/ekor berdiri) | 0.54 m | **0.92 m** |
| Loaf kucing tidur di atap mobil | 0.23 m | **0.40 m** |
| Hitbox clearance ayam (`CHICKEN_HIT`) | 0.72 | **0.87** (= tinggi model) |
| Clearance lompat kucing (`CAT_CLEAR_H`) | 1.2 | **1.2** (tidak diubah) |
| Radius ragdoll hewan | 0.22 | **0.374** kucing, **0.264** ayam |
| Puncak lompatan merpati | 1.84 m | 1.84 m (tidak diubah) |

Kucing 1.7x tetap bisa dilewati: tinggi modelnya 0.92 m, sedangkan puncak
lompatan merpati 1.84 m.

## 2. Apa saja yang ikut menyesuaikan

| Bagian | File | Kenapa ikut berubah |
|---|---|---|
| Skala model kucing (jalan, loaf di atap mobil, ragdoll terbang) | `World.tsx` (`CAT_SCALE`) | Ini objek yang diperbesar |
| Skala model ayam (jalan, hop, ragdoll) | `World.tsx` (`CHICKEN_SCALE`) | Ini objek yang diperbesar |
| Clearance lompat ayam | `engine.ts` (`CHICKEN_HIT`) | Badan ayam kini 0.87 m; kalau hitbox tetap 0.72, merpati bisa lewat *menembus* kepala ayam |
| Radius ragdoll + tinggi lempar | `engine.ts` (`launchVictim`) | Badan besar butuh bola tabrakan besar, supaya hewan ter-`YEET` mendarat **di atas** aspal, bukan terbenam |
| Offset badan pada pose ragdoll ayam | `World.tsx` (`-0.32 * CHICKEN_SIZE_BOOST`) | Pivot ragdoll naik, offset badan harus ikut supaya ayam tetap rebah rata |

Hitbox **lateral & memanjang** (`0.45 + PLAYER_HALF` untuk maju, `0.85` untuk samping)
tidak diubah: karena model membesar, hitbox itu justru makin pas menutupi badan
(model kucing selebar 0.48 m di sumbu lintang vs toleransi 0.85 m), jadi tidak ada
bagian badan yang bisa ditembus pemain.

## 3. Retune di masa depan

Cukup ubah **satu** angka di `src/game/engine.ts`:

```ts
export const CAT_SIZE_BOOST = 1.7;      // <-- BESARIN kucing 1.7x
export const CHICKEN_SIZE_BOOST = 1.2;  // <-- BESARIN ayam 1.2x
```

Turunannya otomatis: `CAT_SCALE`, `CHICKEN_SCALE`, `CAT_HEIGHT`, `CHICKEN_HEIGHT`,
`CHICKEN_HIT`. Kalau bentuk model di `models.ts` diubah (mis. jengger ayam
ditinggikan), update `CAT_MODEL_H` / `CHICKEN_MODEL_H` — harness di bawah akan
langsung gagal kalau angkanya tidak lagi cocok dengan geometry aslinya.

## 4. Cara memverifikasi

```bash
npx esbuild test/animalSize.ts --bundle --platform=node --outfile=/tmp/animalSize.cjs && node /tmp/animalSize.cjs
```

Harness `test/animalSize.ts` mengukur tinggi model dari geometry `models.ts`
(bukan angka hafalan), lalu mengecek:

1. boost = 1.2x (ayam) & 1.7x (kucing), dan skala akhirnya;
2. hitbox clearance `>=` tinggi model asli, tapi masih `<=` puncak lompatan (1.84 m);
3. simulasi tabrakan: hewan ter-`YEET`, radius ragdoll = `0.22 x boost`, lalu rebah di aspal (`h == radius`);
4. simulasi lompat bersih: tepat di atas clearance, hewan **tidak** ter-`YEET`.

Output terakhir yang tersimpan: 32 PASS, 0 FAIL.

Catatan: `test/sim.ts` (harness besar) sudah punya crash pra-eksisting di
`scenarioSprint()` dan `scenarioFifty()` — dijalankan juga di commit basis tanpa
perubahan ini, jadi itu bukan efek dari pembesaran kucing/ayam.

## 5. Terkait

Efek tabrakan hewan (mental ala kartun + denyut tipis, tanpa shake/freeze) dijelaskan di
[`EFEK_MENTAL_DENYUT_SAAT_TABRAK_HEWAN.md`](./EFEK_MENTAL_DENYUT_SAAT_TABRAK_HEWAN.md).
Harness `test/animalSize.ts` sekarang mengecek ukuran **dan** efek tersebut (32 cek).
