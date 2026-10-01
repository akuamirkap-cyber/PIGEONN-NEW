import { useUI } from "../game/store";
import { engine } from "../game/engine";
import { sfx } from "../game/audio";
import { BreadIcon } from "./BreadIcon";

const QUIPS: Record<string, string[]> = {
  obstacle: ["COO-RASH!", "WIPEOUT!", "FEATHERS EVERYWHERE!", "BAILED!", "OUCH, BIRDIE!"],
  car: ["FENDER BENDER!", "PARKED. PERMANENTLY.", "COO-RASH!"],
  oncoming: ["HEAD-ON!", "WRONG WAY, BIRDIE!", "BEEP BEEP... SPLAT"],
  motorcycle: ["DITABRAK MOTOR!", "RIDER DATANG DARI DEPAN!", "SPION KIRI... SPLAT!"],
  chicken: ["FOWL PLAY!", "CHICKEN'D!", "WHY DID THE CHICKEN...?"],
  train: ["TRAIN'D!", "MIND THE GAP!", "KAN KAN KAN... SPLAT"],
  gate: ["BARRIER BONK!", "GATE CRASHER!", "STOP MEANS STOP!"],
  pedestrian: ["EXCUSE ME!", "SIDEWALK ETIQUETTE!", "OOPS, SORRY MA'AM!"],
  roadwork: ["UNDER CONSTRUCTION!", "HARD HAT ZONE!", "DETOUR, BIRDIE!"],
  cross_traffic: ["T-BONED DI PEREMPATAN!", "LOMPAT SISI DEPAN AJA!", "WATCH CROSS TRAFFIC!", "HOOD JUMP MISSED!"],
};

/** Label singkat penyebab tumbang, biar pemain langsung paham kenapa game over. */
const CAUSE_LABEL: Record<string, string> = {
  obstacle: "NUBRUK RINTANGAN",
  car: "KETABRAK MOBIL",
  oncoming: "MOBIL DARI ARAH DEPAN",
  motorcycle: "MOTOR DARI ARAH DEPAN",
  chicken: "AYAM NGEBUT",
  train: "KERETA LEWAT",
  gate: "PALANG TUTUP",
  pedestrian: "NUBRUK PEJALAN KAKI",
  roadwork: "AREA PROYEK",
  cross_traffic: "TABRAKAN DI PEREMPATAN",
};

export function GameOver() {
  const phase = useUI((s) => s.phase);
  const score = useUI((s) => s.score);
  const best = useUI((s) => s.best);
  const bread = useUI((s) => s.bread);
  const wallet = useUI((s) => s.wallet);
  const isNewBest = useUI((s) => s.isNewBest);
  const runs = useUI((s) => s.runs);
  const cause = useUI((s) => s.crashCause);
  const wordHunt = useUI((s) => s.wordHunt);
  const setShowMysteryBox = useUI((s) => s.setShowMysteryBox);
  if (phase !== "gameover") return null;
  const list = QUIPS[cause] ?? QUIPS.obstacle;
  const quip = list[runs % list.length];

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex select-none items-center justify-center bg-black/25">
      <div className="card-in w-[84%] max-w-[440px] overflow-hidden rounded-[30px] bg-white text-center shadow-[0_12px_0_rgba(0,0,0,0.28)]">
        {/* judul + guyon */}
        <div className="bg-[#ef4b4b] px-5 pb-4 pt-3.5">
          <div className="mx-auto w-fit rounded-full bg-black/15 px-3 py-0.5 font-body text-[2.6cqw] font-extrabold tracking-[0.35em] text-white">
            GAME OVER
          </div>
          <div className="mt-1.5 font-display text-[8cqw] leading-none text-white txt-outline-sm">{quip}</div>
        </div>

        <div className="px-5 pb-5 pt-4">
          {/* skor */}
          <div className="rounded-[22px] bg-[#1f2430] px-4 py-3">
            <div className="font-body text-[2.7cqw] font-extrabold tracking-[0.3em] text-white/60">SCORE</div>
            <div className="font-display text-[13cqw] leading-none text-[#ffd60a]">{score}</div>
            {isNewBest ? (
              <div className="mx-auto mt-1.5 w-fit rotate-[-3deg] rounded-full bg-[#ffd60a] px-3 py-0.5 font-display text-[3.4cqw] leading-none text-[#1f2430]">
                NEW BEST!
              </div>
            ) : (
              <div className="mt-1 font-body text-[3.2cqw] font-extrabold text-white/55">BEST {best}</div>
            )}
          </div>

          {/* kenapa tumbang */}
          <div className="mt-2.5 flex items-center justify-center gap-2">
            <span className="rounded-full bg-[#ffe3e3] px-2.5 py-1 font-body text-[2.6cqw] font-extrabold tracking-[0.12em] text-[#c23a3a]">
              {CAUSE_LABEL[cause] ?? "TUMBANG!"}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-[#fff4d6] px-2.5 py-1 font-display text-[3.4cqw] leading-none text-[#8a5a12]">
              <BreadIcon size={18} />+{bread}
              <span className="font-body text-[2.5cqw] font-extrabold text-[#b08340]">· wallet {wallet}</span>
            </span>
          </div>

          {/* Daily Word Hunt progress banner */}
          <div
            onClick={() => {
              sfx.click();
              setShowMysteryBox(true);
            }}
            className="pointer-events-auto mt-3 flex cursor-pointer items-center justify-between rounded-2xl border-2 border-[#ffd21f]/40 bg-[#1c2230] px-3.5 py-2 shadow-sm transition-transform active:scale-95"
          >
            <div className="flex flex-col items-start leading-none">
              <span className="font-body text-[2.2cqw] font-extrabold tracking-wider text-[#ffd21f]">
                DAILY WORD HUNT
              </span>
              <div className="mt-1 flex items-center gap-1 font-display text-[3.6cqw] text-white">
                {wordHunt.word.split("").map((ch, idx) => (
                  <span
                    key={idx}
                    className={wordHunt.collected[idx] ? "text-[#ffd21f] font-bold" : "text-white/25"}
                  >
                    {ch}
                  </span>
                ))}
              </div>
            </div>
            {wordHunt.pendingBox || (wordHunt.collected.every(Boolean) && !wordHunt.claimed) ? (
              <span className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-[#ffd60a] to-[#ff9f1c] px-2.5 py-1.5 font-display text-[2.8cqw] text-[#1c1400] shadow animate-bounce">
                BUKA 🎁
              </span>
            ) : (
              <span className="rounded-full bg-white/10 px-2 py-0.5 font-display text-[2.4cqw] text-white/70">
                {wordHunt.collected.filter(Boolean).length}/{wordHunt.word.length} 🎁
              </span>
            )}
          </div>

          {/* aksi */}
          <button
            type="button"
            onClick={() => engine.input("tap")}
            className="pointer-events-auto mt-4 w-full rounded-2xl bg-[#2ec4b6] py-3.5 font-display text-[5.6cqw] leading-none text-white shadow-[0_5px_0_#1f9a8f] active:translate-y-[3px] active:shadow-[0_2px_0_#1f9a8f]"
          >
            TAP TO RETRY
          </button>
          <button
            type="button"
            onClick={() => {
              sfx.click();
              engine.toMenu();
            }}
            className="pointer-events-auto mt-2.5 w-full rounded-2xl bg-[#eef0f3] py-3 font-display text-[4.2cqw] leading-none text-[#1f2430] shadow-[0_4px_0_#cfd4db] active:translate-y-[2px] active:shadow-[0_2px_0_#cfd4db]"
          >
            MENU · SKINS
          </button>
        </div>
      </div>
    </div>
  );
}
