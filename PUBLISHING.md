# Publishing Checklist — Pigeon SK8 (HP + Komputer)

Audit dilakukan 2026-10-04 terhadap repo `arena/01a1004f-pigeonn-new`.

## ✅ Yang SUDAH siap (jangan dikerjakan ulang)
- Input sentuh (swipe) + keyboard berdampingan; `viewport-fit=cover`, meta mobile lengkap
- Deteksi perangkat HP: bayangan 1024px, DPR dibatasi `[1, 1.5]`
- Audio unlock saat tap pertama (aturan browser) + tombol MUTE tersimpan
- Penyimpanan progres di localStorage (best score, koin, skin, cuaca, dst.)
- Penanganan `webglcontextlost` (restart grafik, tidak blank)
- Loading screen inline + build single-file (`dist/index.html`, ±2.1 MB) — gampang di-upload di mana pun
- Handler `orientationchange` / `resize`

## ✅ Wajib teknis — SUDAH DIKERJAKAN (2026-10-04)
1. **PWA lengkap**: `manifest.webmanifest` ✓ · ikon voxel 192/512 + maskable ✓ · `apple-touch-icon` ✓ · `sw.js` offline-first app shell ✓ · registrasi di `src/main.tsx` (khusus build produksi) ✓ · favicon ✓
2. **Auto-pause**: `visibilitychange` → AudioContext suspensi/lanjut (`src/game/audio.ts`) + loop `engine.update` dibekukan saat `document.hidden` (`src/game/Scene.tsx` `Loop`) ✓
3. **Safe-area notch**: inset `env(safe-area-inset-*)` pada root overlay HUD & Menu ✓
4. **Tutorial sekali-tampil** (`src/ui/Tutorial.tsx`, flag `pigeon-sk8-tutor`) ✓
5. **Haptics**: `navigator.vibrate` saat tabrakan `[30,40,60]` & ambil roti `14ms` (`src/game/engine.ts` `buzz`) ✓
6. **`<html lang="id">`** + deskripsi ID ✓
> Catatan deploy: naikkan `CACHE` (`pigeon-sk8-v1.0.0`) di `public/sw.js` tiap rilis supaya PWA mendapat bundle baru.

## 📦 Jalur distribusi (pilih)
| Target | Jalan | Biaya | Catatan |
|---|---|---|---|
| HP (semua) | **PWA** di-hosting sendiri (Netlify/Vercel/itch.io) | Gratis | Tercepat; tanpa antre review; offline dengan SW |
| Android | Google Play via **TWA/Bubblewrap** atau Capacitor | $25 1× | Perlu PWA dulu + assetlinks |
| iPhone | App Store via **Capacitor/Tauri** | $99/tahun + Mac | Review 1–3 hari |
| Komputer | **itch.io** (upload zip web) | Gratis | Paling cocok hypercasual; bisa pay-what-you-want |
| Komputer | **Steam** via Electron/Tauri | $100/game | Perlu achievement/leaderboard sendiri |
| Web portal | **CrazyGames / Poki / GameDistribution / Yandex Games** | Gratis (rev-share iklan) | Audiens hypercasual besar; mereka bantu marketing; perlu integrasi SDK iklan masing-masing |

## 💰 Monetisasi (kalau mau)
- Portal (CrazyGames dkk.) sudah include iklan rewarded — tinggal integrasi SDK-nya.
- Kalau tetap di PWA sendiri: iklan tidak praktis; alternatif = skin premium small-IAP di versi Play/App Store.

## 🧪 QA sebelum rilis
- Test nyata: iPhone Safari + Android Chrome (60fps? panas? baterai?), desktop Chrome/Firefox/Edge.
- Mode malam Shibuya (efek bloom) → cek performa HP kentang.
- Semua teks UI konsisten bahasanya; cek typo.

## 📜 Legal & aset store
- Lisensi font `8-BIT WONDER` (1001fonts "free for commercial use" — arsipkan halaman lisensinya di `/credits`).
- Privacy policy sederhana (game menyimpan data hanya di localStorage, tanpa server/akun).
- Aset toko: ikon 512×512, 6–10 screenshot (HP + desktop), feature graphic 1024×500, deskripsi EN+ID, trailer 15–30 detik (screen-record gameplay).

## Urutan rekomendasi
1. Kerjakan bagian "Wajib teknis" (PWA + autopause + safe-area + tutorial) → host PWA online → main di HP asli.
2. Upload ke **itch.io** (komputer) & ajukan ke **CrazyGames** (portal; kalau diterima → SDK ads → penghasilan).
3. Kalau rame: Google Play via TWA; iOS menyusul dengan Capacitor bila ada Mac.
