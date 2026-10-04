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

/** Label singkat penyebab tumbang — dirasionalkan jadi satu caption kecil di bawah skor. */
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

/**
 * Layar Game Over — gaya hypercasual: satu fokus besar (skor), info sekunder tipis & rapi,
 * dua tombol jelas (RETRY utama, MENU ghost). Tidak ada duplikasi info / panel bertumpuk.
 */
export function GameOver() {
  const phase = useUI((s) => s.phase);
  const score = useUI((s) => s.score);
  const best = useUI((s) => s.best);
  const bread = useUI((s) => s.bread);
  const isNewBest = useUI((s) => s.isNewBest);
  const runs = useUI((s) => s.runs);
  const cause = useUI((s) => s.crashCause);
  const wordHunt = useUI((s) => s.wordHunt);
  const setShowMysteryBox = useUI((s) => s.setShowMysteryBox);
  if (phase !== "gameover") return null;
  const list = QUIPS[cause] ?? QUIPS.obstacle;
  const quip = list[runs % list.length];
  const got = wordHunt.collected.filter(Boolean).length;
  const canOpen = wordHunt.pendingBox || (wordHunt.collected.every(Boolean) && !wordHunt.claimed);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex select-none items-center justify-center bg-black/25">
      <div className="card-in w-[84%] max-w-[400px] overflow-hidden rounded-[26px] bg-white text-center shadow-[0_10px_0_rgba(0,0,0,0.22)]">
        {/* header: judul + guyon dalam satu blok ramping */}
        <div className="bg-[#ef4b4b] px-5 pb-3.5 pt-3">
          <div className="font-display text-[6.4cqw] leading-none text-white txt-outline-sm">GAME OVER</div>
          <div className="mt-1 font-body text-[2.6cqw] font-extrabold tracking-[0.14em] text-white/85">{quip}</div>
        </div>

        <div className="px-5 pb-5 pt-4">
          {/* skor — SATU pusat perhatian */}
          <div className="relative rounded-2xl bg-[#1f2430] px-4 pb-3 pt-2.5">
            {isNewBest && (
              <div className="absolute -right-2 -top-2.5 rotate-6 rounded-full bg-[#ffd60a] px-2.5 py-0.5 font-display text-[3cqw] leading-none text-[#1f2430] shadow"
              >
                NEW BEST!
              </div>
            )}
            <div className="font-body text-[2.3cqw] font-extrabold tracking-[0.3em] text-white/55">SCORE</div>
            <div className="font-display text-[12.5cqw] leading-[1.02] text-[#ffd60a]">{score}</div>
            <div className="mt-1 flex items-center justify-center gap-3">
              <span className="font-body text-[2.7cqw] font-extrabold text-white/60">BEST {best}</span>
              {bread > 0 && (
                <span className="flex items-center gap-1 font-display text-[3.1cqw] leading-none text-[#ffd60a]">
                  <BreadIcon size={15} />+{bread}
                </span>
              )}
            </div>
          </div>

          {/* kenapa tumbang — caption tipis, tidak menyaingi skor */}
          <div className="mt-2 font-body text-[2.6cqw] font-extrabold tracking-[0.1em] text-[#c0564c]">
            {CAUSE_LABEL[cause] ?? "TUMBANG!"}
          </div>

          {/* Daily Word Hunt — strip tipis, jadi emas hanya saat box siap dibuka */}
          <div
            onClick={() => {
              sfx.click();
              setShowMysteryBox(true);
            }}
            className={`pointer-events-auto mt-2.5 flex cursor-pointer items-center justify-between rounded-xl px-3 py-1.5 transition-transform active:scale-95 ${
              canOpen ? "bg-[#1c2230]" : "bg-[#f3f5f8]"
            }`}
          >
            <span className={`font-body text-[2.1cqw] font-extrabold tracking-[0.18em] ${canOpen ? "text-[#ffd21f]" : "text-[#9aa4b2]"}`}>
              WORD HUNT
            </span>
            <span className="flex items-center gap-1 font-display text-[3cqw] leading-none">
              {wordHunt.word.split("").map((ch, idx) => (
                <span key={idx} className={wordHunt.collected[idx] ? "text-[#e8b10c]" : canOpen ? "text-white/25" : "text-[#c6cdd6]"}>
                  {ch}
                </span>
              ))}
            </span>
            {canOpen ? (
              <span className="rounded-lg bg-gradient-to-r from-[#ffd60a] to-[#ff9f1c] px-2 py-1 font-display text-[2.6cqw] leading-none text-[#1c1400] shadow animate-bounce">
                BUKA 🎁
              </span>
            ) : (
              <span className="font-body text-[2.2cqw] font-extrabold text-[#9aa4b2]">{got}/{wordHunt.word.length}</span>
            )}
          </div>

          {/* aksi */}
          <button
            type="button"
            onClick={() => engine.input("tap")}
            className="pointer-events-auto mt-3.5 w-full rounded-2xl bg-[#2ec4b6] py-3.5 font-display text-[5.4cqw] leading-none text-white shadow-[0_5px_0_#1f9a8f] active:translate-y-[3px] active:shadow-[0_2px_0_#1f9a8f]"
          >
            TAP TO RETRY
          </button>
          <button
            type="button"
            onClick={() => {
              sfx.click();
              engine.toMenu();
            }}
            className="pointer-events-auto mt-2 w-full rounded-2xl bg-white py-2.5 font-display text-[3.9cqw] leading-none text-[#667085] shadow-[0_3px_0_#dfe3e8] ring-1 ring-[#e6e9ee] active:translate-y-[2px] active:shadow-[0_1px_0_#dfe3e8]"
          >
            MENU · SKINS
          </button>
        </div>
      </div>
    </div>
  );
}
