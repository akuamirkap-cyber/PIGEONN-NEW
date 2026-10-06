import { useUI } from "../game/store";
import { ACHIEVEMENTS, loadAch } from "../game/achievements";
import { getStats } from "../game/stats";
import { BreadIcon } from "./BreadIcon";
import { sfx } from "../game/audio";

/**
 * Panel PENCAPAIAN — bottom sheet TERANG dengan gaya yang sama seperti panel
 * Karakter & Tricks: kartu putih, pill hadiah kuning roti, aksen teal.
 * Baris: emoji besar tanpa kotak + judul lebar penuh (anti kepotong),
 * pill status/hadiah melayang di pojok kanan-bawah kartu.
 * Menutup panel memanggil markAchSeen() (badge merah di tombol trophy hilang).
 */
export function AchievementsPanel({ onClose }: { onClose: () => void }) {
  const best = useUI((s) => s.best);
  const wallet = useUI((s) => s.wallet);
  const unlocked = useUI((s) => s.unlocked);
  const tricksOn = useUI((s) => s.tricksOn);
  const wordHunt = useUI((s) => s.wordHunt);
  const markAchSeen = useUI((s) => s.markAchSeen);

  const ctx = {
    best,
    wallet,
    skinsUnlocked: unlocked.length,
    tricksAllOn: Object.values(tricksOn).every(Boolean),
    wordDone: wordHunt.claimed,
  };
  const st = loadAch();
  const stats = getStats();
  const doneCount = st.done.length;
  const total = ACHIEVEMENTS.length;
  // baris dengan statistik langsung (biar angka progres segar tanpa recheck)
  const liveRead = (id: string): number | null => {
    if (id.startsWith("run-")) return stats.runs;
    if (id.startsWith("dist-")) return stats.maxDist;
    if (id === "rocket-5") return stats.rockets;
    if (id === "shibuya-1") return stats.shibuyaRuns;
    return null;
  };

  const close = () => {
    markAchSeen();
    sfx.click();
    onClose();
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-40 select-none">
      {/* container-type membuat semua cqw relatif panel — tinggi disamakan panel Karakter (56%) */}
      <div
        className="card-in pointer-events-auto absolute bottom-0 left-0 right-0 flex h-[56%] flex-col rounded-t-[22px] bg-[#fff8ea] shadow-[0_-5px_0_rgba(0,0,0,0.1)]"
        style={{ containerType: "inline-size" }}
      >
        {/* Header: judul + tombol tutup (gaya panel Tricks) */}
        <div className="flex items-center justify-between px-4 pb-1.5 pt-3.5">
          <div className="min-w-0">
            <div className="font-display text-[5.6cqw] leading-none text-[#1f2430]">🏆 PENCAPAIAN</div>
            <div className="mt-1 font-body text-[3.1cqw] font-bold leading-snug text-[#8a8f99]">
              {doneCount}/{total} terbuka · tiap misi berhadiah roti
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1f2430] font-display text-[4.6cqw] text-white shadow-[0_4px_0_rgba(0,0,0,0.2)] active:translate-y-[2px] active:shadow-none"
            aria-label="Tutup pencapaian"
          >
            ✕
          </button>
        </div>

        {/* Progress total */}
        <div className="flex items-center gap-2 px-4 pb-2">
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-black/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#ffd23f] to-[#ff9f1c] transition-all"
              style={{ width: `${Math.round((doneCount / total) * 100)}%` }}
            />
          </div>
          <span className="shrink-0 font-display text-[3.4cqw] text-[#8a8f99]">
            {doneCount}/{total}
          </span>
        </div>

        {/* Daftar achievement (scroll) */}
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden px-4 pb-4" style={{ touchAction: "pan-y" }}>
          {ACHIEVEMENTS.map((a) => {
            const done = st.done.includes(a.id);
            const isNew = done && !st.seen.includes(a.id);
            const raw = liveRead(a.id);
            const value = Math.min(a.target, Math.floor(raw ?? a.read(ctx)));
            const pct = Math.min(100, Math.round((value / a.target) * 100));
            return (
              <div
                key={a.id}
                className={`relative flex gap-2.5 rounded-2xl px-3 py-2.5 ${
                  done
                    ? "bg-[#fff2db] shadow-[0_3px_0_rgba(0,0,0,0.08)] ring-2 ring-[#f59e0b]/40"
                    : "bg-white shadow-[0_3px_0_rgba(0,0,0,0.08)]"
                }`}
              >
                {/* Ikon lencana TANPA kotak — besar seperti area kotak dulu */}
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center pt-1 text-[8cqw] leading-none"
                  style={done ? { filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.35))" } : { filter: "grayscale(1) opacity(0.55)" }}
                >
                  {a.icon}
                </div>
                {/* Kolom teks: judul lebar penuh, info, lalu progres */}
                <div className="min-w-0 flex-1">
                  <div className={`whitespace-nowrap font-display text-[3.9cqw] leading-tight ${done ? "text-[#b45309]" : "text-[#1f2430]"}`}>
                    {a.title}
                  </div>
                  <div className="mt-0.5 pr-[5.5em] font-body text-[3.4cqw] font-bold leading-snug text-[#8a8f99]">{a.desc}</div>
                  {!done && (
                    <div className="mt-1 flex items-center gap-1.5 pr-[5.5em]">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/10">
                        <div className="h-full rounded-full bg-[#38bdf8]" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="shrink-0 font-display text-[3cqw] text-[#8a8f99]">
                        {value}/{a.target}
                      </span>
                    </div>
                  )}
                </div>
                {/* Pill status/hadiah — melayang di pojok kanan-bawah kartu */}
                <div className="absolute bottom-1.5 right-2.5 flex flex-col items-end gap-1">
                  {isNew && (
                    <span className="animate-pulse rounded-full bg-[#ffd60a] px-1.5 py-0.5 font-display text-[2.9cqw] leading-none text-[#1f2430] shadow">
                      BARU
                    </span>
                  )}
                  {done ? (
                    <span className="whitespace-nowrap font-display text-[3cqw] leading-none text-[#2ec4b6]">✓ TERBUKA</span>
                  ) : (
                    <span className="flex items-center gap-1 whitespace-nowrap rounded-full bg-[#fff4d6] px-1.5 py-0.5 font-display text-[3.2cqw] leading-none text-[#8a5a12]">
                      +{a.reward}
                      <BreadIcon size={12} />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {/* Footer tips — kotak navy seperti panel Tricks */}
          <div className="mt-1 rounded-2xl bg-[#1f2430]/85 px-3 py-2 font-body text-[3cqw] font-bold leading-snug text-white/85">
            Tips: selesaikan misi di atas untuk memanen hadiah rotinya 🍞 — achievement baru akan menandai tombol 🏆 dengan badge merah di menu utama!
          </div>
        </div>
      </div>
    </div>
  );
}
