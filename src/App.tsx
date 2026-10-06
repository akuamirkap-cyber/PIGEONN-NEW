import { useEffect, useRef, useState } from "react";
import { Scene } from "./game/Scene";
import { useInput } from "./game/useInput";
import { HUD } from "./ui/HUD";
import { Menu } from "./ui/Menu";
import { GameOver } from "./ui/GameOver";
import { MysteryBoxModal } from "./ui/MysteryBoxModal";
import { Tutorial } from "./ui/Tutorial";
import { suspendAudioForHiddenPage, resumeAudioFromHiddenPage } from "./game/audio";
import { engine, track } from "./game/engine";
import { useUI } from "./game/store";
import { ensureThumbs } from "./game/thumbs";
import ShibuyaApp from "./shibuya/ShibuyaApp";

// debug handle (harmless in production)
if (typeof window !== "undefined") {
  const w = window as unknown as { __pigeon?: Record<string, unknown> };
  w.__pigeon = { ...(w.__pigeon ?? {}), engine, track, ui: useUI };
}

interface StageSize {
  w: number;
  h: number;
  fullscreen: boolean;
}

/** Portrait 9:16 stage: fills the screen on phones, becomes a centered phone-shaped frame on desktop. */
function useStageSize(): StageSize {
  const [size, setSize] = useState<StageSize>({ w: 360, h: 640, fullscreen: true });
  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const portrait = vh >= vw;
      const smallScreen = vw < 640;
      if (portrait && smallScreen) {
        setSize({ w: vw, h: vh, fullscreen: true });
        return;
      }
      let h = Math.min(vh - 40, 900);
      let w = Math.round((h * 9) / 16);
      if (w > vw - 24) {
        w = vw - 24;
        h = Math.round((w * 16) / 9);
      }
      setSize({ w, h, fullscreen: false });
    };
    calc();
    window.addEventListener("resize", calc);
    window.addEventListener("orientationchange", calc);
    return () => {
      window.removeEventListener("resize", calc);
      window.removeEventListener("orientationchange", calc);
    };
  }, []);
  return size;
}

export default function App() {
  const stage = useStageSize();
  const inputRef = useRef<HTMLDivElement>(null);
  useInput(inputRef);
  // Auto-pause & hemat daya HP: AudioContext disuspensi saat tab disembunyikan, dilanjut saat kembali.
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) suspendAudioForHiddenPage();
      else resumeAudioFromHiddenPage();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const [glKey, setGlKey] = useState(0);
  const [glLost, setGlLost] = useState(false);
  const [gameMode, setGameMode] = useState<"pigeon" | "shibuya">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("preferred_game_mode");
      if (saved === "pigeon" || saved === "shibuya") return saved;
    }
    return "pigeon"; // Default ke Pigeon Game
  });

  const switchGameMode = (mode: "pigeon" | "shibuya") => {
    setGameMode(mode);
    try {
      localStorage.setItem("preferred_game_mode", mode);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<"pigeon" | "shibuya">;
      if (custom.detail) switchGameMode(custom.detail);
    };
    window.addEventListener("switch-game-mode", handler);
    return () => window.removeEventListener("switch-game-mode", handler);
  }, []);

  const onContextLost = () => {
    setGlLost(true);
    setTimeout(() => {
      setGlKey((k) => k + 1);
      setGlLost(false);
    }, 900);
  };

  useEffect(() => {
    if (gameMode !== "pigeon") return;
    // pre-render the 3D skin thumbnails lazily after game is running smoothly
    const t = setTimeout(() => {
      try {
        ensureThumbs();
      } catch {
        // ignore
      }
    }, 3500);
    return () => clearTimeout(t);
  }, [gameMode]);

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-[#151823]">
      {/* ── Floating Game Mode Switcher Bar ── */}
      <div className="fixed top-2.5 left-1/2 -translate-x-1/2 z-50 flex items-center p-1 rounded-full bg-white/65 border border-white/90 shadow-[0_4px_14px_rgba(34,77,104,0.2)] backdrop-blur-md font-sans">
        <button
          type="button"
          onClick={() => switchGameMode("pigeon")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-extrabold text-xs transition-all ${
            gameMode === "pigeon"
              ? "bg-[#ffd21f] text-[#151823] shadow-md scale-105"
              : "text-[#1f405b]/70 hover:text-[#1f405b] hover:bg-white/70"
          }`}
          title="Mode Game: Pigeon Skateboard Runner"
        >
          <span>🛹</span>
          <span>PIGEON SK8</span>
        </button>
        <button
          type="button"
          onClick={() => switchGameMode("shibuya")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-extrabold text-xs transition-all ${
            gameMode === "shibuya"
              ? "bg-[#2ec4b6] text-white shadow-md scale-105"
              : "text-[#1f405b]/70 hover:text-[#1f405b] hover:bg-white/70"
          }`}
          title="Mode Game: Shibuya Blocks Voxel World & Asset Studio"
        >
          <span>🏙️</span>
          <span>SHIBUYA BLOCKS</span>
        </button>
      </div>

      {gameMode === "shibuya" ? (
        <ShibuyaApp onBackToPigeon={() => switchGameMode("pigeon")} />
      ) : (
        <div
          className="flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden"
          style={{
            background: stage.fullscreen
              ? "#151823"
              : "radial-gradient(circle at 30% 20%, #2a3150 0%, #151823 55%, #0e1018 100%)",
          }}
        >
          <div
            className="sky @container relative overflow-hidden"
            style={{
              width: stage.w,
              height: stage.h,
              borderRadius: stage.fullscreen ? 0 : 30,
              boxShadow: stage.fullscreen ? "none" : "0 0 0 10px #262b3a, 0 0 0 12px #3a4158, 0 30px 80px rgba(0,0,0,0.6)",
            }}
          >
            <Scene key={glKey} onContextLost={onContextLost} />
            {glLost && (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#151823]/80">
                <div className="rounded-2xl bg-white px-5 py-3 font-body text-sm font-extrabold text-[#1f2430]">Restarting graphics…</div>
              </div>
            )}
            {/* input layer sits above the canvas, below the UI */}
            <div ref={inputRef} className="absolute inset-0 z-10" style={{ touchAction: "none" }} />
            <HUD />
            <Menu />
            <GameOver />
            <MysteryBoxModal />
            <Tutorial />
          </div>
          {!stage.fullscreen && (
            <div className="mt-5 font-body text-sm font-bold tracking-wide text-white/50">
              Keyboard: ← → lanes · ↑ / Space = jump · S = next freestyle · SHIFT = sprint · N = NOS · ↓ shuv‑it
            </div>
          )}
        </div>
      )}
    </div>
  );
}
