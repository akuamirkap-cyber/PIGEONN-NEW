import { useEffect, useRef, useState } from "react";
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

const CONFETTI_COLORS = ["#ffd60a", "#2ec4b6", "#ff6b6b", "#a855f7", "#4cc9f0", "#ff9f1c"];

/**
 * Layar Game Over — hypercasual & HIDUP:
 *  - sinar sunburst pelan berputar di belakang kartu
 *  - skor DIHITUNG NAIK 0 → final dengan tik-tik nada-naik yang satisfying (tap untuk skip)
 *  - "TENG!" saat berhenti, lalu roti dihitung "pling-pling-pling" menaiki tangga nada
 *  - NEW BEST! → parade fanfare + letusan confetti
 *  - tombol RETRY menyala berdenyut mengundang tap
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
  const newAch = useUI((s) => s.newAch);

  const [disp, setDisp] = useState(0); // skor yang sedang ditampilkan (naik)
  const [dispB, setDispB] = useState(0); // roti yang sedang dihitung
  const [done, setDone] = useState(false); // hitung skor selesai → TENG!
  const [bDone, setBDone] = useState(false); // hitung roti selesai → tombol menyala
  const raf = useRef(0);
  const skip = useRef(false);

  // Fase 1: hitung skor naik dengan tik yang makin tinggi (ease-out).
  useEffect(() => {
    if (phase !== "gameover") return;
    skip.current = false;
    const D = score >= 3000 ? 1.9 : score >= 1000 ? 1.5 : 1.15; // skor besar = sweep lebih panjang
    const t0 = performance.now();
    let lastTick = 0;
    let lastVal = -1;
    const step = (now: number) => {
      let t = Math.min(1, (now - t0) / (D * 1000));
      if (skip.current) t = 1;
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(score * eased);
      if (val !== lastVal) {
        lastVal = val;
        setDisp(val);
        if (t < 1 && now - lastTick > 45) {
          lastTick = now;
          sfx.countTick(eased);
        }
      }
      if (t < 1) raf.current = requestAnimationFrame(step);
      else {
        setDone(true);
        if (!skip.current || score > 0) sfx.countDone();
      }
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [phase, score]);

  // Fase 2: setelah TENG — NEW BEST merayakan, lalu roti dihitung "pling-pling".
  useEffect(() => {
    if (!done) return;
    if (isNewBest && score > 0) sfx.fanfare();
    if (bread <= 0) {
      setBDone(true);
      return;
    }
    const per = Math.max(30, Math.min(85, 950 / bread)); // roti banyak → tempo cepat ("hujan pling")
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setDispB(i);
      sfx.breadCoin(i - 1);
      if (i >= bread) {
        window.clearInterval(id);
        setBDone(true);
      }
    }, per);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  if (phase !== "gameover") return null;
  const list = QUIPS[cause] ?? QUIPS.obstacle;
  const quip = list[runs % list.length];
  const got = wordHunt.collected.filter(Boolean).length;
  const canOpen = wordHunt.pendingBox || (wordHunt.collected.every(Boolean) && !wordHunt.claimed);

  const confetti = done && isNewBest;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex select-none items-center justify-center overflow-hidden bg-black/30">
      {/* sunburst hidup di belakang kartu */}
      <div className="go-rays pointer-events-none absolute" />

      <div className="card-in w-[84%] max-w-[400px] overflow-hidden rounded-[26px] bg-white text-center shadow-[0_10px_0_rgba(0,0,0,0.22)]">
        {/* header: judul ber-goyang + guyon dalam satu blok ramping */}
        <div className="bg-gradient-to-b from-[#ff5d5d] to-[#e23e3e] px-5 pb-3.5 pt-3">
          <div className="go-wobble font-display text-[6.4cqw] leading-none text-white txt-outline-sm">GAME OVER</div>
          <div className="mt-1 font-body text-[2.6cqw] font-extrabold tracking-[0.14em] text-white/85">{quip}</div>
        </div>

        <div className="px-5 pb-5 pt-4">
          {/* skor — SATU pusat perhatian; TAP untuk lewati perhitungan */}
          <div
            onClick={() => {
              skip.current = true;
            }}
            title={!done ? "tap untuk langsung ke skor akhir" : undefined}
            className="relative cursor-pointer rounded-2xl bg-[#1f2430] px-4 pb-3 pt-2.5 shadow-[0_4px_0_rgba(10,13,20,0.5),inset_0_0_22px_rgba(255,214,10,0.06)]"
          >
            {confetti && (
              <div className="pointer-events-none absolute inset-0 overflow-visible">
                {Array.from({ length: 18 }, (_, i) => (
                  <i
                    key={i}
                    className="go-confetti-piece"
                    style={{
                      left: "50%",
                      top: "30%",
                      ["--dx" as string]: `${((i * 97) % 220) - 110}px`,
                      ["--dy" as string]: `${-40 - ((i * 53) % 130)}px`,
                      ["--r" as string]: `${160 + ((i * 61) % 400)}deg`,
                      ["--cd" as string]: `${(i % 6) * 0.03}s`,
                      background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                    }}
                  />
                ))}
              </div>
            )}
            {isNewBest && (
              <div
                className={`${done ? "go-badge" : "opacity-0"} absolute -right-2 -top-2.5 rotate-6 rounded-full bg-[#ffd60a] px-2.5 py-0.5 font-display text-[3cqw] leading-none text-[#1f2430] shadow`}
                style={{ ["--tilt" as string]: "6deg" }}
              >
                NEW BEST!
              </div>
            )}
            {newAch.length > 0 && (
              <div
                className={`${done ? "go-badge" : "opacity-0"} absolute -left-2 -top-2.5 -rotate-6 rounded-full bg-[#a855f7] px-2.5 py-0.5 font-display text-[3cqw] leading-none text-white shadow`}
                style={{ ["--tilt" as string]: "-6deg", ["--d" as string]: "0.12s" }}
              >
                🏆 {newAch.length > 1 ? `${newAch.length} ACH BARU!` : "ACH BARU!"}
              </div>
            )}
            <div className="font-body text-[2.3cqw] font-extrabold tracking-[0.3em] text-white/55">SCORE</div>
            <div key={done ? "d" : "c"} className={`${done && score > 0 ? "go-numpop" : ""} font-display text-[12.5cqw] leading-[1.02] text-[#ffd60a] [text-shadow:0_3px_0_rgba(120,72,0,0.55),0_0_18px_rgba(255,214,10,0.35)]`}>
              {disp}
            </div>
            <div className="mt-1 flex items-center justify-center gap-3">
              <span className="font-body text-[2.7cqw] font-extrabold text-white/60">BEST {best}</span>
              {bread > 0 && (
                <span className={`flex items-center gap-1 font-display text-[3.1cqw] leading-none transition-colors ${bDone ? "text-[#ffd60a]" : "text-[#ffb64d]"}`}>
                  <BreadIcon size={15} />+{dispB}
                </span>
              )}
            </div>
          </div>

          {/* kenapa tumbang — pill muncul setelah hitungan beres */}
          <div className={`${done ? "go-fade" : "opacity-0"} mt-2`} style={{ ["--d" as string]: "0.05s" }}>
            <span className="inline-block rounded-full bg-[#ffe9e9] px-3 py-1 font-body text-[2.6cqw] font-extrabold tracking-[0.1em] text-[#c0564c]">
              {CAUSE_LABEL[cause] ?? "TUMBANG!"}
            </span>
          </div>

          {/* Daily Word Hunt — strip tipis, jadi emas hanya saat box siap dibuka */}
          <div
            onClick={() => {
              sfx.click();
              setShowMysteryBox(true);
            }}
            className={`${done ? "go-fade" : "opacity-0"} pointer-events-auto mt-2.5 flex cursor-pointer items-center justify-between rounded-xl px-3 py-1.5 transition-transform active:scale-95 ${
              canOpen ? "bg-[#1c2230]" : "bg-[#f3f5f8]"
            }`}
            style={{ ["--d" as string]: "0.12s" }}
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
              <span className="animate-bounce rounded-lg bg-gradient-to-r from-[#ffd60a] to-[#ff9f1c] px-2 py-1 font-display text-[2.6cqw] leading-none text-[#1c1400] shadow">
                BUKA 🎁
              </span>
            ) : (
              <span className="font-body text-[2.2cqw] font-extrabold text-[#9aa4b2]">{got}/{wordHunt.word.length}</span>
            )}
          </div>

          {/* aksi — RETRY pop masuk, lalu berdenyut mengundang setelah semua hitungan tuntas */}
          {done ? (
            <button
              type="button"
              onClick={() => engine.input("tap")}
              className={`pointer-events-auto mt-3.5 w-full rounded-2xl bg-gradient-to-b from-[#3ad6c8] to-[#25b3a5] py-3.5 font-display text-[5.4cqw] leading-none text-white active:translate-y-[3px] ${bDone ? "go-glow" : "shadow-[0_5px_0_#1f9a8f]"}`}
            >
              TAP TO RETRY
            </button>
          ) : (
            <div className="mt-3.5 w-full rounded-2xl border-2 border-dashed border-[#dfe3e8] py-3.5 font-body text-[3.4cqw] font-extrabold tracking-[0.2em] text-[#aab2bd]">
              MENGHITUNG SKOR…
            </div>
          )}
          {done && (
            <button
              type="button"
              onClick={() => {
                sfx.click();
                engine.toMenu();
              }}
              className="go-fade pointer-events-auto mt-2 w-full rounded-2xl bg-white py-2.5 font-display text-[3.9cqw] leading-none text-[#667085] shadow-[0_3px_0_#dfe3e8] ring-1 ring-[#e6e9ee] active:translate-y-[2px] active:shadow-[0_1px_0_#dfe3e8]"
              style={{ ["--d" as string]: "0.18s" }}
            >
              MENU · SKINS
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
