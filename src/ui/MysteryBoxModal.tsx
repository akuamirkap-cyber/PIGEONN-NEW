import { useState } from "react";
import { useUI } from "../game/store";
import { sfx } from "../game/audio";
import { BreadIcon } from "./BreadIcon";
import { engine, NOS_MAX } from "../game/engine";

export function MysteryBoxModal() {
  const show = useUI((s) => s.showMysteryBox);
  const setShow = useUI((s) => s.setShowMysteryBox);
  const wordHunt = useUI((s) => s.wordHunt);
  const claimMysteryBox = useUI((s) => s.claimMysteryBox);

  const [opening, setOpening] = useState(false);
  const [reward, setReward] = useState<{ bread: number; score: number; title: string } | null>(null);

  if (!show) return null;

  const allCollected = wordHunt.collected.every(Boolean);
  const canOpen = allCollected && !wordHunt.claimed && !reward;

  const handleOpen = () => {
    if (!canOpen || opening) return;
    setOpening(true);
    sfx.mysteryBox();

    setTimeout(() => {
      const res = claimMysteryBox();
      setReward(res);
      setOpening(false);
      engine.addNos(NOS_MAX);
      engine.trickScore += res.score;
      sfx.start();
    }, 1200);
  };

  const handleClose = () => {
    sfx.click();
    setShow(false);
    setReward(null);
    setOpening(false);
  };

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-50 flex select-none items-center justify-center bg-black/75 p-4 backdrop-blur-[4px]"
      onClick={handleClose}
    >
      <div
        className="card-in relative w-full max-w-[340px] overflow-hidden rounded-[28px] border-4 border-[#ffd21f] bg-gradient-to-b from-[#1c2230] to-[#0e121a] p-5 text-center shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_24px_rgba(255,210,31,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 font-display text-sm text-white/80 transition-colors hover:bg-white/20 active:scale-95"
          aria-label="Tutup"
        >
          ✕
        </button>

        {/* Title Badge */}
        <div className="mx-auto w-fit rounded-full bg-gradient-to-r from-[#ffd21f] to-[#ff9f1c] px-4 py-1 shadow-md">
          <span className="font-display text-[11px] tracking-wider text-[#1a1200]">
            🎁 DAILY WORD HUNT
          </span>
        </div>

        <h3 className="mt-2.5 font-display text-[22px] leading-tight text-white txt-outline-sm">
          {reward
            ? "SELAMAT! 🎉"
            : allCollected
              ? wordHunt.claimed
                ? "KATA HARI INI SELESAI"
                : "PETI MISTERI SIAP!"
              : "KUMPULKAN HURUF"}
        </h3>

        {/* Letters Display */}
        <div className="mt-3.5 flex items-center justify-center gap-1.5">
          {wordHunt.word.split("").map((ch, idx) => {
            const isDone = wordHunt.collected[idx];
            return (
              <div
                key={idx}
                className={`flex h-10 w-9 flex-col items-center justify-center rounded-xl border-2 transition-all duration-200 ${
                  isDone
                    ? "border-[#ffd21f] bg-gradient-to-b from-[#ffd60a] to-[#ff9f1c] text-[#1c1400] shadow-[0_3px_0_#b37400,0_0_10px_rgba(255,214,10,0.6)]"
                    : "border-white/15 bg-white/5 text-white/35"
                }`}
              >
                <span className="font-display text-base leading-none drop-shadow-sm">{ch}</span>
                {isDone && <span className="text-[8px] leading-none">✓</span>}
              </div>
            );
          })}
        </div>

        {/* Word Progress / Date Subtext */}
        <p className="mt-2 text-xs font-bold text-white/60">
          {allCollected
            ? wordHunt.claimed
              ? "Semua huruf hari ini sudah ditemukan!"
              : "Semua huruf lengkap! Buka hadiahmu!"
            : `Temukan huruf di lintasan (${wordHunt.collected.filter(Boolean).length}/${wordHunt.word.length})`}
        </p>

        {/* Mystery Box Visual */}
        <div className="relative my-4 flex items-center justify-center py-2">
          {opening ? (
            <div className="shake relative flex flex-col items-center">
              <div className="text-[72px] filter drop-shadow-[0_0_20px_#ffd21f]">🎁</div>
              <div className="mt-2 font-display text-xs text-[#ffd21f] animate-pulse">
                MEMBUKA PETI...
              </div>
            </div>
          ) : reward ? (
            <div className="flex flex-col items-center gap-3">
              <div className="text-[64px] animate-bounce filter drop-shadow-[0_0_24px_#ffd21f]">
                ✨🎁✨
              </div>
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-center gap-2 rounded-2xl border-2 border-[#ffd21f]/40 bg-[#ffd21f]/15 py-2.5 px-4 shadow-inner">
                  <BreadIcon size={28} />
                  <span className="font-display text-2xl text-[#ffd21f] txt-outline-sm">
                    +{reward.bread} ROTI
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 rounded-2xl border-2 border-[#00e5ff]/40 bg-[#00e5ff]/15 py-2 px-4 shadow-inner">
                  <span className="font-display text-lg text-[#00e5ff] txt-outline-sm">
                    +{reward.score} SKOR BONUS
                  </span>
                </div>
                <div className="text-[11px] font-bold text-[#38ef7d]">
                  ⚡ NOS NITRO LANGSUNG TERISI PENUH!
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`relative flex flex-col items-center ${
                canOpen ? "cursor-pointer group" : "opacity-80"
              }`}
              onClick={canOpen ? handleOpen : undefined}
            >
              <div
                className={`text-[76px] transition-transform duration-200 ${
                  canOpen
                    ? "pulse group-hover:scale-110 filter drop-shadow-[0_0_22px_rgba(255,210,31,0.7)]"
                    : "filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] grayscale-[0.4]"
                }`}
              >
                🎁
              </div>
              {canOpen && (
                <div className="absolute -bottom-1 rounded-full bg-[#ff3b30] px-2.5 py-0.5 font-display text-[9px] text-white shadow-md animate-bounce">
                  TAP UNTUK BUKA!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        {reward ? (
          <button
            type="button"
            onClick={handleClose}
            className="w-full rounded-2xl bg-gradient-to-r from-[#2ec4b6] to-[#00b4d8] py-3.5 font-display text-sm text-white shadow-[0_5px_0_#1f9a8f] active:translate-y-[2px] active:shadow-none"
          >
            KLAIM & LANJUT
          </button>
        ) : canOpen ? (
          <button
            type="button"
            onClick={handleOpen}
            disabled={opening}
            className="w-full rounded-2xl bg-gradient-to-r from-[#ffd60a] to-[#ff9f1c] py-3.5 font-display text-sm text-[#1a1200] shadow-[0_5px_0_#b37400] active:translate-y-[2px] active:shadow-none"
          >
            BUKA SEKARANG! 🎁
          </button>
        ) : wordHunt.claimed ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-white/50">
            Peti harian sudah diklaim hari ini! Kembalilah besok untuk kata baru.
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClose}
            className="w-full rounded-2xl bg-[#0b66e4] py-3 font-display text-xs text-white shadow-[0_4px_0_#0748a3] active:translate-y-[2px] active:shadow-none"
          >
            LARI & CARI HURUF 🛹
          </button>
        )}
      </div>
    </div>
  );
}
