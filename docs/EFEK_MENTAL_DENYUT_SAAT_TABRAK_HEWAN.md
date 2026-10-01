# Efek tabrakan kucing & ayam: MENTAL + denyut tipis

Permintaan (versi final): **hewan tetap "mental" ala kartun saat ditabrak, tapi
TANPA screen shake, TANPA freeze-frame, dan efek denyutnya disederhanakan jadi
tipis saja — seperti ripple knockback.**

Yang tersisa setelah penyederhanaan: hewannya tetap dilontarkan tinggi sambil
muter-muter dan mantul-mantul, plus **satu** cincin tipis di titik tabrakan.
Semua efek khusus hewan (`cat` & `chicken`) — mobil, pejalan kaki, train, gate
tidak terpengaruh.

## 1. Yang DIHAPUS (permintaan tuning)

| Efek lama | Status | Catatan |
|---|---|---|
| **HIT-STOP** (freeze-frame 0.11 s) | ❌ dihapus total | `HITSTOP_TIME`/`HITSTOP_SCALE`/`engine.hitStop` sudah tidak ada; `update()` langsung memakai `dt` penuh |
| **Screen shake** minimal 1.15 | ❌ dihapus | `cartoonImpact()` tidak lagi menyentuh `engine.shake` (shake tetap ada untuk kecelakaan/train, hanya tidak dipicu hewan) |
| **Punch kamera** (geser posisi 0.5 m + naik 0.32 m) | ❌ dihapus | posisi kamera sekarang selalu mulus, tidak ada sentakan |
| Kilatan inti + cincin ganda + shockwave tanah | ➖ diganti | sekarang **1 cincin tipis** saja |
| Popup berdenyut 3× (`.popup-punch`) | ❌ dihapus | kembali ke popup standar 1.1 s |
| Slide-whistle di SFX | ❌ dihapus | `thwack` jadi thump + noise tipis |
| Kilatan badan berkedip 70 rad/s | ➖ dilembutkan | nyala pelan `0.85`, luruh dalam 0.22 s |

## 2. Yang TETAP (bagian "mental" ala kartun)

| Efek | Nilai | Kode |
|---|---|---|
| Lontaran maju | `v·0.62 + 1.6…3.2` | `launchVictim()` |
| Lontaran naik | **5.2–7.3 m/s** | `launchVictim()` |
| Lontaran samping | **2.2–3.8 m/s** | `launchVictim()` |
| Putaran badan | **10–17 rad/s** (muter-muter) | `launchVictim()` |
| Hang time | gravitasi ×0.72 (`ANIMAL_GRAVITY_SCALE`) | `Ragdoll.gravityScale` |
| Mantul kenyal | koefisien pantul ×1.45 (`ANIMAL_BOUNCE`), maks 0.78 | `Ragdoll.bouncy` |
| Mantul-mantul + bunyi | 3–4× mantulan: `boing`, `boing`, lalu `bonk` + debu kecil | `updateMovers()` |
| Suara kena | `thwack` (POW tipis) + `bonk` + `meow`/`squawk` | `audio.ts` |

Hasil ukur: kucing puncak **1.14 m** / 3× mantul, ayam puncak **0.85 m** / 3× mantul.

## 3. Denyut yang baru (tipis & simple)

Satu cincin saja, langsung di titik tabrakan:

| Parameter | Nilai |
|---|---|
| Jumlah cincin | **1** (dulu: 1 kilatan + 2 cincin + 1 shockwave tanah) |
| Bentuk | band tipis: `RingGeometry(0.94, 1, 40)` (tebal 6% radius) |
| Waktu hidup | 0.28 s (dulu 0.18–0.56 s) |
| Radius | 0.35 → 1.7 (dulu sampai 4.0) |
| Opasitas | `0.6 · (1−k)^1.6` — tipis dan cepat hilang (dulu hingga 0.95) |
| Warna | disesuaikan hewan (ayam oranye, kucing kuning) |
| Orientasi | billboard menghadap kamera |

Serpihan: dari 16 → **7 partikel** `pow`; mantulan aspal tidak lagi menyemburkan
partikel `pow`, cuma 3–5 kepulan debu tipis.

Kamera: bukan punch lagi — cuma nudge FOV tipis (`ANIMAL_PUNCH = 0.35`,
pengaruh FOV = `punch² × 4.5` ≈ **0.55°**, dulu 4.5°). Posisi kamera tidak
bergeser sama sekali.

## 4. File yang terlibat

| Bagian | File |
|---|---|
| `animalImpactFx()` (1 cincin + 7 serpihan + nudge tipis) | `src/game/engine.ts` |
| `Pulse` (tanpa `kind`/`flat`) + `spawnPulse`/`updatePulses` | `src/game/engine.ts` |
| Fisika ragdoll kenyal (`gravityScale`, `bouncy`) | `src/game/engine.ts` |
| Lontaran mental + FX per hewan | `src/game/engine.ts` (`launchVictim`, `hitCat`, `hitChicken`) |
| Cincin denyut (render, pool 4, ring-only) | `src/game/World.tsx` (`Pulses`) |
| Kilatan badan tipis | `src/game/World.tsx` (`MoverView.flashMat`) |
| Nudge FOV (tanpa geser kamera) | `src/game/Scene.tsx` |
| SFX `thwack` / `boing` | `src/game/audio.ts` |
| Cek otomatis | `test/animalSize.ts` (32 pasar) |

## 5. Retune cepat

```ts
export const ANIMAL_BOUNCE = 1.45;        // kenyalnya mantulan
export const ANIMAL_GRAVITY_SCALE = 0.72; // < 1 = hang time makin lebay
export const ANIMAL_PUNCH = 0.35;         // 0 = matikan nudge FOV
```

Set `ANIMAL_PUNCH = 0` kalau tidak mau ada perubahan FOV sama sekali.
Mau cinein cincinnya? Ubah rentang radius di `animalImpactFx()` (`r0: 0.35, r1: 1.7`).

## 6. Verifikasi

```bash
npx esbuild test/animalSize.ts --bundle --platform=node --outfile=/tmp/animalSize.cjs && node /tmp/animalSize.cjs
```

Harness sekarang mengecek **kebalikan** dari sebelumnya, yaitu:

1. **tanpa freeze**: `engine.time` maju tepat `dt` (1/60) dan `engine.distance` tetap jalan;
2. **tanpa screen shake**: `engine.shake === 0` tepat setelah tabrakan;
3. denyut cuma **1 cincin tipis** (`pulses.length === 1`, `r1 ≤ 2`);
4. kamera cuma nudge tipis (`punch ≤ 0.35`, dulu 1.0);
5. serpihan ≤ 12 (terukur 7);
6. lontaran tetap mental (`vh ≥ 5`, spin ≥ 10), puncak > 0.8 m, ≥3 mantulan;
7. semua efek reda lagi (`punch`/`pulses`/`shake` kembali nol).
