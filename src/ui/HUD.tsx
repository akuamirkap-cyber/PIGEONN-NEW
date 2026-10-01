import { useUI } from "../game/store";
import { BreadIcon } from "./BreadIcon";
import { engine, NOS_MAX } from "../game/engine";
import { TRICKS } from "../game/tricks";
import { unlockAudio } from "../game/audio";

function SpeakerIcon({ muted }: { muted: boolean }) {
  if (muted) {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}

export function HUD() {
  const phase = useUI((s) => s.phase);
  const score = useUI((s) => s.score);
  const bread = useUI((s) => s.bread);
  const dist = useUI((s) => s.dist);
  const popups = useUI((s) => s.popups);
  const muted = useUI((s) => s.muted);
  const toggleMute = useUI((s) => s.toggleMute);
  const nos = useUI((s) => s.nos);
  const nosActive = useUI((s) => s.nosActive);
  const cycleIndex = useUI((s) => s.cycleIndex);
  const tricksOn = useUI((s) => s.tricksOn);
  const speedMode = useUI((s) => s.speedMode);
  const trackMode = useUI((s) => s.trackMode);
  const shibuyaTime = useUI((s) => s.shibuyaTime);
  const wordHunt = useUI((s) => s.wordHunt);
  const setShowMysteryBox = useUI((s) => s.setShowMysteryBox);
  const inRun = phase === "playing" || phase === "crashed";
  const enabled = TRICKS.filter((t) => tricksOn[t.kind]);
  const nextTrick = enabled.length ? enabled[cycleIndex % enabled.length] : null;
  const nosReady = nos >= NOS_MAX * 0.99 && !nosActive;
  const sprint = useUI((s) => s.sprint);
  const sprintLevel = useUI((s) => s.sprintLevel);
  const sprinting = sprint > 0.02 || sprintLevel > 0;

  const locationLabel = trackMode === "shibuya"
    ? `SHIBUYA ${shibuyaTime.toUpperCase()} ${dist} M`
    : trackMode === "haruna"
      ? `MT. HARUNA ${dist} M`
      : `TOKYO CITY ${dist} M`;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 select-none">
      {/* bread counter (top-left) in vibrant royal blue pill */}
      {inRun && (
        <div className="pointer-events-auto absolute left-[3.5%] top-[3%] flex h-[9.5cqw] min-h-[38px] items-center gap-2 rounded-full border-2 border-white/20 bg-[#0b66e4] px-3.5 shadow-[0_3px_0_#0748a3]">
          <BreadIcon size={24} />
          <span className="font-display text-[4.8cqw] leading-none text-white txt-outline-sm">{bread}</span>
        </div>
      )}

      {/* score + location banner (top-center) */}
      {inRun && (
        <div className="absolute left-0 right-0 top-[2.2%] flex flex-col items-center gap-1.5">
          <div className="font-display txt-outline text-[13.5cqw] leading-none text-white drop-shadow-md">{score}</div>
          <div className="flex items-center gap-1.5 rounded-full border border-white/30 bg-[#0b66e4] px-3.5 py-1 shadow-[0_3px_0_#0748a3]">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" className="text-white" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
            </svg>
            <span className="font-display text-[2.8cqw] tracking-wider text-white">{locationLabel}</span>
          </div>

          {/* Daily Word Hunt letter bar (Subway Surfers-style) */}
          <button
            type="button"
            onClick={() => {
              unlockAudio();
              setShowMysteryBox(true);
            }}
            className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/25 bg-black/45 px-2.5 py-0.5 backdrop-blur-[3px] shadow-sm transition-transform active:scale-95"
            aria-label="Daily Word Hunt progress"
          >
            {wordHunt.word.split("").map((ch, idx) => {
              const isDone = wordHunt.collected[idx];
              return (
                <div
                  key={idx}
                  className={`flex h-[5.2cqw] w-[5.2cqw] min-h-[20px] min-w-[20px] items-center justify-center rounded-lg border text-[2.7cqw] font-display leading-none transition-all ${
                    isDone
                      ? "border-[#ffd21f] bg-gradient-to-b from-[#ffd60a] to-[#ff9f1c] text-[#1c1400] shadow-[0_0_8px_rgba(255,214,10,0.8)] scale-105 font-bold"
                      : "border-white/20 bg-white/10 text-white/40"
                  }`}
                >
                  {ch}
                </div>
              );
            })}
            <span
              className={`ml-1 flex items-center text-[3.8cqw] leading-none ${
                wordHunt.pendingBox || (wordHunt.collected.every(Boolean) && !wordHunt.claimed)
                  ? "animate-bounce filter drop-shadow-[0_0_6px_#ffd21f]"
                  : "opacity-60"
              }`}
            >
              🎁
            </span>
          </button>
        </div>
      )}

      {/* top-right control: ONLY MUTE button (SIANG & CHASE are hidden as requested) */}
      {inRun && (
        <div className="pointer-events-auto absolute right-[3.5%] top-[3%] flex flex-col items-end">
          <button
            type="button"
            onClick={toggleMute}
            className="flex h-[10cqw] w-[10cqw] min-h-[38px] min-w-[38px] items-center justify-center rounded-full border-2 border-white/20 bg-[#ff9500] text-white shadow-[0_3px_0_#c96f00] active:translate-y-[2px] active:shadow-none"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            <SpeakerIcon muted={muted} />
          </button>
        </div>
      )}

      {/* trick / info popups (NEVER cropped or truncated, scaled smoothly) + centered 2x SKATE badge */}
      <div className="pointer-events-none absolute left-0 right-0 top-[16%] flex flex-col items-center gap-1">
        {popups.slice(-1).map((p) => {
          const len = p.text.length;
          const fontClass = len > 20 ? "text-[3.3cqw]" : len > 15 ? "text-[3.8cqw]" : len > 11 ? "text-[4.3cqw]" : "text-[4.8cqw]";
          return (
            <div key={p.id} className="popup flex max-w-[96%] flex-col items-center text-center">
              <div
                className={`font-display txt-outline whitespace-nowrap ${fontClass} leading-tight tracking-wide drop-shadow-md`}
                style={{ color: p.color === "#ff5c8a" ? "#ff2e93" : p.color }}
              >
                {p.text}
              </div>
              {p.sub && (
                <div className="mt-1 max-w-[96%] whitespace-nowrap rounded-full bg-black/45 px-3 py-0.5 font-display text-[2.5cqw] leading-tight text-white/95 backdrop-blur-[2px]">
                  {p.sub}
                </div>
              )}
            </div>
          );
        })}

        {/* 2x SKATE speed multiplier badge */}
        {inRun && speedMode > 1 && (
          <div className="mt-1 flex items-center justify-center rounded-2xl border-[3px] border-[#1f2430] bg-[#ffd23f] px-4 py-1.5 font-display text-[4.2cqw] leading-none text-[#1f2430] shadow-[0_4px_0_#c99a00] active:translate-y-[1px]">
            {speedMode}× SKATE
          </div>
        )}
      </div>

      {/* NOS meter + boost button (bottom-right thumb reach) */}
      {phase === "playing" && (
        <div className="pointer-events-auto absolute bottom-[4.5%] right-[4%] flex flex-col items-center gap-2">
          {/* NOS vertical capsule */}
          <div className="relative h-[25cqw] w-[6.8cqw] overflow-hidden rounded-full border-[3.5px] border-[#0091ff] bg-[#001838]/90 p-[2px] shadow-[0_0_14px_rgba(0,145,255,0.65)]">
            <div
              className={`absolute bottom-0 left-[2px] right-[2px] rounded-full transition-[height] duration-150 ${
                nosActive ? "nos-burn" : nosReady ? "nos-ready" : "bg-gradient-to-t from-[#00d2ff] to-[#38ef7d]"
              }`}
              style={{ height: `${nosActive ? 100 : nos}%` }}
            />
          </div>
          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              unlockAudio();
              engine.input("boost");
            }}
            className={`flex h-[15cqw] w-[15cqw] flex-col items-center justify-center rounded-full font-display leading-none border-[3px] shadow-[0_4px_0_rgba(0,0,0,0.3)] active:translate-y-[2px] active:shadow-none transition-all duration-150 ${
              nosReady
                ? "border-[#ffd60a] bg-gradient-to-b from-[#ffd60a] to-[#ff9f1c] text-[#1f2430] animate-pulse"
                : nosActive
                  ? "border-white bg-[#00e5ff] text-white"
                  : sprintLevel >= 3
                    ? "border-[#ffd60a] bg-[#ff9f1c] text-white"
                    : sprintLevel === 2
                      ? "border-[#64b5f6] bg-[#0b66e4] text-white"
                      : sprintLevel === 1
                        ? "border-[#4dd0e1] bg-[#00b4d8] text-white"
                        : "border-[#0091ff] bg-[#0066cc] text-white"
            }`}
            style={{
              boxShadow: nosReady || nosActive
                ? "0 0 16px rgba(0, 229, 255, 0.8), 0 4px 0 rgba(0,0,0,0.25)"
                : sprinting
                  ? `0 0 ${Math.round(8 + sprint * 18)}px ${
                      sprintLevel >= 3 ? "rgba(255,159,28,0.7)" : sprintLevel === 2 ? "rgba(58,134,255,0.7)" : "rgba(46,196,182,0.7)"
                    }, 0 4px 0 rgba(0,0,0,0.25)`
                  : undefined,
            }}
            aria-label={nosReady || nosActive ? "Aktifkan NOS" : "Sprint kick"}
          >
            {nosReady || nosActive ? (
              <span className="text-[4.2cqw]">NOS</span>
            ) : sprintLevel > 0 ? (
              <>
                <span className="text-[3.8cqw] font-black tracking-tight drop-shadow-md">
                  {sprintLevel === 1 ? "+40" : sprintLevel === 2 ? "+50" : sprintLevel === 3 ? "+70" : `+${Math.min(110, 70 + (sprintLevel - 3) * 15)}`}
                </span>
                <span className="mt-[0.4cqw] text-[1.9cqw] font-extrabold uppercase tracking-wider text-white/90">SPRINT</span>
              </>
            ) : (
              <>
                <span className="text-[3.2cqw]">SPRINT</span>
                <span className="mt-[0.6cqw] hidden font-body text-[1.9cqw] font-extrabold tracking-wider opacity-80 [@media(hover:hover)]:block">SHIFT</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* S = sequential freestyle button (bottom-left) */}
      {phase === "playing" && nextTrick && (
        <div className="pointer-events-auto absolute bottom-[4.5%] left-[4%] flex flex-col items-center gap-1.5">
          <div className="max-w-[34cqw] truncate rounded-full border border-white/20 bg-[#0b66e4]/90 px-2.5 py-1 font-body text-[2.6cqw] font-extrabold text-white shadow-md">
            next: {nextTrick.short}
          </div>
          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              unlockAudio();
              engine.input("cycle");
            }}
            className="flex h-[15cqw] w-[15cqw] items-center justify-center rounded-full border-2 border-white/30 bg-[#c77dff] font-display text-[7cqw] leading-none text-white shadow-[0_4px_0_#8f4fcf] active:translate-y-[2px] active:shadow-none"
            aria-label="Next freestyle trick"
          >
            S
          </button>
        </div>
      )}
    </div>
  );
}
