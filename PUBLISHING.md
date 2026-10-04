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

## 🔧 Wajib teknis (est. ½–1 hari — bisa aku kerjakan langsung)
1. **PWA**: `manifest.webmanifest` + ikon 192/512 + apple-touch-icon + Service Worker (cache offline). Tanpa ini game tidak bisa "Add to Home Screen" & offline.
2. **Auto-pause saat tab disembunyikan** (`visibilitychange`) + resume mulus — penting di HP (telepon masuk, ganti aplikasi).
3. **Safe-area** notch: padding HUD pakai `env(safe-area-inset-*)` supaya skor/tombol tidak terpotong iPhone.
4. **Tutorial 10 detik** untuk pemain baru (overlay "geser untuk pindah lajur" dll.) — krusial untuk rating store.
5. **Haptics**: `navigator.vibrate(30-80)` saat crash / ambil koin (opsional tapi kerasa banget di HP).
6. **`<html lang="id">`** + title/description konsisten (sekarang campur EN/ID).

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
