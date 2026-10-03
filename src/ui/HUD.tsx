import { useEffect, useRef, useState } from "react";
import { useUI } from "../game/store";
import { BreadIcon } from "./BreadIcon";
import { engine, NOS_MAX } from "../game/engine";
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
  const speedMode = useUI((s) => s.speedMode);
  const trackMode = useUI((s) => s.trackMode);
  const shibuyaTime = useUI((s) => s.shibuyaTime);
  const wordHunt = useUI((s) => s.wordHunt);
  const setShowMysteryBox = useUI((s) => s.setShowMysteryBox);
  const inRun = phase === "playing" || phase === "crashed";
  const nosReady = nos >= NOS_MAX * 0.99 && !nosActive;
  const sprint = useUI((s) => s.sprint);
  const sprintLevel = useUI((s) => s.sprintLevel);
  const sprinting = sprint > 0.02 || sprintLevel > 0;
  const previousBread = useRef(bread);
  const [breadFlash, setBreadFlash] = useState(0);
  useEffect(() => {
    if (bread > previousBread.current) setBreadFlash((value) => value + 1);
    previousBread.current = bread;
  }, [bread]);

  const locationLabel = trackMode === "shibuya"
    ? `SHIBUYA ${shibuyaTime.toUpperCase()} ${dist} M`
    : trackMode === "haruna"
      ? `MT. HARUNA ${dist} M`
      : `TOKYO CITY ${dist} M`;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 select-none">
      {inRun && breadFlash > 0 && (
        <div key={breadFlash} className="bread-pickup-screen absolute left-1/2 top-[46%] z-50 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          <div className="bread-pickup-rays absolute inset-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2">
            {Array.from({ length: 10 }, (_, index) => <span key={index} style={{ transform: `rotate(${index * 36}deg)` }} />)}
          </div>
          <div className="bread-pickup-flare relative flex h-28 w-28 items-center justify-center rounded-full">
            <BreadIcon size={70} />
          </div>
          <div className="bread-pickup-label font-display text-[5.4cqw] leading-none text-white txt-outline-sm">+1 BREAD</div>
        </div>
      )}

      {/* bread counter (top-left) in vibrant royal blue pill + optional small speed indicator */}
      {inRun && (
        <div className="pointer-events-auto absolute left-[3.5%] top-[3%] flex items-center gap-2">
          <div
            key={`bread-count-${bread}`}
            className="bread-counter-pop flex h-[9.5cqw] min-h-[38px] items-center gap-2 rounded-full border-2 border-white/25 bg-gradient-to-b from-[#1687ff] to-[#0b66e4] px-3.5 shadow-[0_3px_0_#0748a3]"
          >
            <BreadIcon size={24} />
            <span className="font-display text-[4.8cqw] leading-none text-white txt-outline-sm">{bread}</span>
          </div>
          {speedMode > 1 && (
            <div className="flex h-[8cqw] min-h-[32px] items-center rounded-full border-2 border-[#1f2430] bg-[#ffd23f] px-2.5 font-display text-[3.6cqw] font-bold text-[#1f2430] shadow-[0_2px_0_#c99a00]">
              {speedMode}×
            </div>
          )}
        </div>
      )}

      {/* score + location banner + Daily Word Hunt "SKATE" berhadiah (top-center, completely unblocked) */}
      {inRun && (
        <div className="absolute left-0 right-0 top-[2.2%] flex flex-col items-center gap-1.5 z-30">
          <div className="font-display txt-outline text-[13.5cqw] leading-none text-white drop-shadow-md">{score}</div>
          <div className="flex items-center gap-1.5 rounded-full border border-white/30 bg-[#0b66e4] px-3.5 py-1 shadow-[0_3px_0_#0748a3]">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" className="text-white" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
            </svg>
            <span className="font-display text-[2.8cqw] tracking-wider text-white">{locationLabel}</span>
          </div>

          {/* Daily Word Hunt letter bar (SKATE berhadiah) — selalu jelas terlihat tanpa tertutup */}
          <button
            type="button"
            onClick={() => {
              unlockAudio();
              setShowMysteryBox(true);
            }}
            className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/25 bg-black/55 px-2.5 py-1 backdrop-blur-[4px] shadow-md transition-transform active:scale-95"
            aria-label="Daily Word Hunt progress"
          >
            {wordHunt.word.split("").map((ch, idx) => {
              const isDone = wordHunt.collected[idx];
              return (
                <div
                  key={idx}
                  className={`flex h-[5.6cqw] w-[5.6cqw] min-h-[22px] min-w-[22px] items-center justify-center rounded-lg border text-[3.0cqw] font-display leading-none transition-all ${
                    isDone
                      ? "border-[#ffd21f] bg-gradient-to-b from-[#ffd60a] to-[#ff9f1c] text-[#1c1400] shadow-[0_0_8px_rgba(255,214,10,0.8)] scale-105 font-bold"
                      : "border-white/20 bg-white/10 text-white/50"
                  }`}
                >
                  {ch}
                </div>
              );
            })}
            <span
              className={`ml-1 flex items-center text-[4cqw] leading-none ${
                wordHunt.pendingBox || (wordHunt.collected.every(Boolean) && !wordHunt.claimed)
                  ? "animate-bounce filter drop-shadow-[0_0_8px_#ffd21f]"
                  : "opacity-75"
              }`}
            >
              🎁
            </span>
          </button>
        </div>
      )}

      {/* top-right control: ONLY MUTE button */}
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

      {/* trick / info popups (ditempatkan di bawah tulisan SKATE berhadiah agar tidak pernah menutupi) */}
      <div className="pointer-events-none absolute left-0 right-0 top-[23%] flex flex-col items-center gap-1 z-10">
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
      </div>

      {/* NOS meter + boost button (bottom-right) — SATU-SATUNYA TOMBOL DI BAWAH SEPERTI PERMINTAAN */}
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
    </div>
  );
}
