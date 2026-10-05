import { useUI } from "../game/store";
import { ACHIEVEMENTS, loadAch } from "../game/achievements";
import { getStats } from "../game/stats";
import { BreadIcon } from "./BreadIcon";
import { sfx } from "../game/audio";

/**
 * Panel PENCAPAIAN: daftar 16 lencana dengan progress bar, hadiah roti,
 * dan penanda BARU untuk yang belum dilihat. Menutup panel memanggil
 * markAchSeen() di store (badge merah di tombol trophy hilang).
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
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm card-in">
      <div className="flex max-h-[82%] w-full max-w-sm flex-col gap-2 rounded-3xl border border-white/10 bg-[#1c2230] p-4 text-white shadow-2xl">
        {/* Header + progres total */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <span className="font-display text-[4cqw] text-[#ffd23f]">🏆 PENCAPAIAN</span>
          <button
            type="button"
            onClick={close}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 font-display text-sm text-white active:scale-95"
            aria-label="Tutup pencapaian"
          >
            ✕
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#ffd23f] to-[#ff9f1c] transition-all"
              style={{ width: `${Math.round((doneCount / total) * 100)}%` }}
            />
          </div>
          <span className="font-display text-[3.2cqw] text-white/85">
            {doneCount}/{total}
          </span>
        </div>

        {/* Daftar achievement (scroll) */}
        <div className="flex flex-col gap-1.5 overflow-y-auto pr-0.5">
          {ACHIEVEMENTS.map((a) => {
            const done = st.done.includes(a.id);
            const isNew = done && !st.seen.includes(a.id);
            const raw = liveRead(a.id);
            const value = Math.min(a.target, Math.floor(raw ?? a.read(ctx)));
            const pct = Math.min(100, Math.round((value / a.target) * 100));
            return (
              <div
                key={a.id}
                className={`relative flex items-center gap-2.5 rounded-2xl border px-2.5 py-2 ${
                  done
                    ? "border-[#ffd23f]/45 bg-gradient-to-r from-[#ffd23f]/15 to-transparent"
                    : "border-white/8 bg-white/[0.045]"
                }`}
              >
                {/* Ikon lencana */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl ${
                    done ? "bg-gradient-to-b from-[#ffe89a] to-[#f5b71f] shadow-[0_2px_0_#a67c00]" : "bg-white/10 grayscale"
                  }`}
                  style={done ? undefined : { filter: "grayscale(1) opacity(0.55)" }}
                >
                  {a.icon}
                </div>
                {/* Judul + deskripsi + progress */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`truncate font-display text-[3.1cqw] leading-tight ${done ? "text-[#ffe89a]" : "text-white/85"}`}>
                      {a.title}
                    </span>
                    {isNew && (
                      <span className="shrink-0 animate-pulse rounded-md bg-[#ffd60a] px-1 py-0.5 font-display text-[2cqw] leading-none text-[#1f2430]">
                        BARU
                      </span>
                    )}
                  </div>
                  <div className="truncate font-body text-[2.5cqw] leading-snug text-white/55">{a.desc}</div>
                  {!done && (
                    <div className="mt-1 flex items-center gap-1.5">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-[#38bdf8]" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="font-display text-[2.3cqw] text-white/50">
                        {value}/{a.target}
                      </span>
                    </div>
                  )}
                </div>
                {/* Kanan: status terbuka / hadiah */}
                <div className="flex w-14 shrink-0 flex-col items-center justify-center">
                  {done ? (
                    <span className="font-display text-[2.6cqw] leading-tight text-[#2ecc71]">✓ TERBUKA</span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-lg bg-white/8 px-1.5 py-1 font-display text-[2.5cqw] text-[#ffd60a]">
                      +{a.reward}
                      <BreadIcon size={11} />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-1 text-center font-body text-[2.5cqw] font-bold text-white/45">
          Selesaikan misi di atas & panen hadiah rotinya! 🍞
        </div>
      </div>
    </div>
  );
}
