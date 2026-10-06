import { useState, useRef } from "react";
import { useUI, WHEEL_COLORS } from "../game/store";
import { engine } from "../game/engine";
import { getSkin } from "../game/skins";
import { sfx, unlockAudio } from "../game/audio";
import { BreadIcon } from "./BreadIcon";
import { SkinsPanel } from "./SkinsPanel";
import { TricksPanel } from "./TricksPanel";
import { PigeonIcon } from "./PigeonIcon";
import { AchievementsPanel } from "./AchievementsPanel";

function ShirtIcon() {
  return (
    <svg viewBox="0 0 24 24" width="62%" height="62%" fill="currentColor" aria-hidden="true" className="drop-shadow-sm">
      <path d="M12 4.5c1.1 0 2 .5 2.7 1.2.6-.4 1.3-.7 2.1-.7H19l3 6-3 1.5-1.5-3V20c0 .6-.4 1-1 1H7.5c-.6 0-1-.4-1-1V9.5L5 12.5 2 11l3-6h2.2c.8 0 1.5.3 2.1.7.7-.7 1.6-1.2 2.7-1.2z" />
    </svg>
  );
}

function SkateboardIcon() {
  return (
    <svg viewBox="0 0 24 24" width="66%" height="66%" fill="currentColor" aria-hidden="true" className="drop-shadow-sm" style={{ transform: "rotate(-25deg)" }}>
      {/* Board deck */}
      <rect x="2" y="9.5" width="20" height="5" rx="2.5" />
      {/* Wheels */}
      <circle cx="6" cy="17" r="2.2" />
      <circle cx="18" cy="17" r="2.2" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="60%" height="60%" fill="currentColor" aria-hidden="true" className="drop-shadow-sm">
      {/* Badan piala */}
      <path d="M6.5 2h11a1 1 0 0 1 1 1v5.2a6.5 6.5 0 0 1-13 0V3a1 1 0 0 1 1-1z" />
      {/* Gagang kiri-kanan */}
      <path d="M5.5 3.5H3A1.5 1.5 0 0 0 1.5 5v1A4.5 4.5 0 0 0 6 10.5h.6A8 8 0 0 1 5.5 7V3.5zM3.5 5.5h2V7a6 6 0 0 0 .5 2.4A2.5 2.5 0 0 1 3.5 6v-.5z" />
      <path d="M18.5 3.5H21A1.5 1.5 0 0 1 22.5 5v1a4.5 4.5 0 0 1-4.5 4.5h-.6a8 8 0 0 0 1.1-3.5V3.5zm2 2h-2V7a6 6 0 0 1-.5 2.4A2.5 2.5 0 0 0 20.5 6v-.5z" />
      {/* Batang + alas */}
      <path d="M11 13h2v4h3.2a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H7.8a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1H11v-4z" />
      {/* Bintang kecil di piala */}
      <path d="M12 4.2l.9 1.8 2 .3-1.45 1.4.35 2L12 8.75 10.2 9.7l.35-2L9.1 6.3l2-.3.9-1.8z" fill="#ffd23f" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" width="58%" height="58%" fill="currentColor" aria-hidden="true" className="drop-shadow-sm">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
    </svg>
  );
}

/** Compact setting pill: shows the current value and cycles to the next one on tap. */
function CyclePill({
  label,
  value,
  onTap,
  accent,
  dot,
}: {
  label: string;
  value: string;
  onTap: () => void;
  /** warna aksen saat nilai aktif (non-default) */
  accent?: string;
  /** warna bulatan kecil di kiri (untuk indikator warna ban) */
  dot?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        unlockAudio();
        sfx.click();
        onTap();
      }}
      className="pointer-events-auto flex min-h-[46px] flex-1 flex-col items-center justify-center rounded-2xl bg-white/95 px-1.5 py-1.5 leading-none shadow-[0_3px_0_rgba(0,0,0,0.12)] transition-transform active:translate-y-[2px] active:shadow-none"
    >
      <span className="font-body text-[2.1cqw] font-extrabold tracking-[0.14em] text-[#1f2430]/55">{label}</span>
      <span className="mt-1 flex max-w-full items-center gap-1 font-display text-[3.1cqw] leading-none text-[#1f2430]">
        {dot && <span className="h-[2.6cqw] w-[2.6cqw] shrink-0 rounded-full border border-black/20" style={{ background: dot }} />}
        <span className="truncate px-0.5" style={accent ? { color: accent } : undefined}>
          {value}
        </span>
      </span>
    </button>
  );
}

/** Track mode selector: Mount Haruna, Tokyo City, and Shibuya Scramble. */
function TrackModeRow() {
  const trackMode = useUI((s) => s.trackMode);
  const setTrackMode = useUI((s) => s.setTrackMode);
  const addPopup = useUI((s) => s.addPopup);

  const selectTrack = (mode: "haruna" | "tokyo" | "shibuya") => {
    if (mode === trackMode) return;
    unlockAudio();
    setTrackMode(mode);
    engine.setTrackMode(mode);
    if (mode === "haruna") {
      sfx.unlock();
      addPopup("TRACK: MT. HARUNA", "#ff9f1c", "Gunma Touge Downhill & Hairpins");
    } else if (mode === "shibuya") {
      sfx.click();
      addPopup("TRACK: SHIBUYA SCRAMBLE", "#c77dff", "Daylight, neon, and busy crosswalks");
    } else {
      sfx.click();
      addPopup("TRACK: TOKYO CITY", "#2ec4b6", "Classic City Skate");
    }
  };

  const cell = (mode: "haruna" | "tokyo" | "shibuya", name: string, badge: string, activeBg: string, activeShadow: string) => {
    const active = trackMode === mode;
    return (
      <button
        type="button"
        onClick={() => selectTrack(mode)}
        className={`pointer-events-auto flex flex-1 items-center justify-center gap-1 rounded-xl py-2 font-display text-[3cqw] leading-none transition-transform active:translate-y-[2px] ${
          active ? `${activeBg} text-[#1f2430] font-black shadow-[0_3px_0_${activeShadow}]` : "bg-white/60 text-[#1f2430]/70 hover:bg-white/80"
        }`}
      >
        <span>{name}</span>
        <span className={`rounded px-1 py-0.5 font-body text-[1.9cqw] font-black ${active ? "bg-black/15" : "bg-black/10"}`}>{badge}</span>
      </button>
    );
  };

  return (
    <div className="flex w-full items-center gap-1 rounded-2xl bg-[#1f2430]/25 p-1 backdrop-blur-[3px]">
      {cell("haruna", "HARUNA", "GUNMA", "bg-[#ffc46b]", "#c9700a")}
      {cell("tokyo", "TOKYO", "CITY", "bg-[#7ce0d4]", "#1f9a8f")}
      {cell("shibuya", "SHIBUYA", "CITY", "bg-[#d5a8ff]", "#8b3fd6")}
    </div>
  );
}

/** Setelan cepat dalam grid rapi (mobile friendly) */
function SettingsRow() {
  const speed = useUI((s) => s.speedMode);
  const setSpeed = useUI((s) => s.setSpeedMode);
  const turn = useUI((s) => s.turnMode);
  const setTurn = useUI((s) => s.setTurnMode);
  const cameraMode = useUI((s) => s.cameraMode);
  const setCameraMode = useUI((s) => s.setCameraMode);
  const deck = useUI((s) => s.deckOverride);
  const setDeck = useUI((s) => s.setDeckOverride);
  const curve = useUI((s) => s.worldCurve);
  const setCurve = useUI((s) => s.setWorldCurve);
  const wheel = useUI((s) => s.wheelColor);
  const setWheel = useUI((s) => s.setWheelColor);
  const weather = useUI((s) => s.weather);
  const toggleWeather = useUI((s) => s.toggleWeather);
  const nightBright = useUI((s) => s.nightBright);
  const cycleNightBright = useUI((s) => s.cycleNightBright);
  const shibuyaTime = useUI((s) => s.shibuyaTime);
  const cycleShibuyaTime = useUI((s) => s.cycleShibuyaTime);
  const addPopup = useUI((s) => s.addPopup);
  const [tips, setTips] = useState(false);

  const toggleDeck = () => {
    const order = ["default", "baguette", "hoverboard", "broom", "silver", "ufo"] as const;
    const next = order[(order.indexOf(deck) + 1) % order.length];
    setDeck(next);
    engine.skinPop();
    if (next === "baguette") {
      sfx.unlock();
      addPopup("PAPAN ROTI BAGUETTE!", "#ff9f1c", "Free Baguette Skateboard");
    } else {
      sfx.unlock();
      const labels = { default: "PAPAN STANDAR", hoverboard: "HOVERBOARD NEON", broom: "SAPU TERBANG", silver: "SILVER SURFER", ufo: "UFO SKATE" } as const;
      addPopup(labels[next as keyof typeof labels] ?? "PAPAN", next === "silver" ? "#8fd3ff" : "#2ec4b6", "Free skateboard skin");
    }
  };

  const toggleCurve = () => {
    const next = curve === "subway" ? "flat" : "subway";
    setCurve(next);
    if (next === "subway") {
      sfx.unlock();
      addPopup("SUBWAY CURVE", "#4cc9f0", "World Curvature ON");
    } else {
      sfx.click();
      addPopup("FLAT WORLD", "#a0aec0", "World Curvature OFF");
    }
  };

  const cycleSpeed = () => {
    const next = speed === 1 ? 2 : speed === 2 ? 3 : 1;
    setSpeed(next);
    sfx.click();
    addPopup(next === 1 ? "KECEPATAN NORMAL" : next === 2 ? "KECEPATAN 2×" : "KECEPATAN 3× (SUPER CEPAT)", next === 1 ? "#2ec4b6" : next === 2 ? "#ffd60a" : "#ff5964");
  };

  const cycleWheel = () => {
    const idx = WHEEL_COLORS.findIndex((c) => c.id === wheel);
    const next = WHEEL_COLORS[(idx + 1) % WHEEL_COLORS.length];
    setWheel(next.id);
    sfx.click();
  };

  const curWheelObj = WHEEL_COLORS.find((c) => c.id === wheel);
  const wheelLabel = curWheelObj?.label.toUpperCase() ?? "HITAM";
  const wheelDot = curWheelObj?.hex ?? "#1f2430";

  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="flex w-full gap-1.5">
        <CyclePill label="SPEED" value={`${speed}×`} accent={speed > 1 ? "#d98b3d" : undefined} onTap={cycleSpeed} />
        <CyclePill label="CURVE" value={curve === "subway" ? "SUBWAY" : "FLAT"} accent={curve === "subway" ? "#168879" : undefined} onTap={toggleCurve} />
        <CyclePill label="BOARD" value={deck === "baguette" ? "BAGUETTE" : deck === "hoverboard" ? "HOVER" : deck === "broom" ? "SAPU" : deck === "silver" ? "SILVER" : "PRO"} accent={deck !== "default" ? "#d98b3d" : undefined} onTap={toggleDeck} />
      </div>
      <div className="flex w-full gap-1.5">
        <CyclePill
          label="CUACA"
          value={weather === "cloudy" ? "BERAWAN" : weather === "snow" ? "SALJU" : "CERAH"}
          accent={weather === "cloudy" ? "#6b7f93" : weather === "snow" ? "#8fb8d8" : undefined}
          onTap={() => {
            toggleWeather();
            sfx.click();
            if (weather === "cloudy") {
              addPopup("CUACA BERSALJU ❄️", "#a8cdec", "dunia tertutup salju tipis — indah & adem");
            } else if (weather === "snow") {
              addPopup("SIANG CERAH ☀️", "#ffc46b", "matahari penuh");
            } else {
              addPopup("SIANG BERAWAN ☁️", "#8fa3b8", "langit lembut keperakan");
            }
          }}
        />
        <CyclePill
          label="LAMPU"
          value={nightBright === 0 ? "REDUP" : nightBright === 1 ? "PAS" : "TERANG"}
          accent={nightBright === 2 ? "#c9a13d" : undefined}
          onTap={() => {
            cycleNightBright();
            sfx.click();
          }}
        />
        <CyclePill
          label="WAKTU"
          value={shibuyaTime.toUpperCase()}
          accent={shibuyaTime !== "malam" ? "#d98b3d" : undefined}
          onTap={() => {
            cycleShibuyaTime();
            sfx.click();
          }}
        />
      </div>
      <div className="flex w-full gap-1.5">
        <CyclePill label="KAMERA" value={cameraMode === "crossy" ? "CROSSY" : "CHASE"} accent={cameraMode === "crossy" ? "#168879" : undefined} onTap={() => setCameraMode(cameraMode === "crossy" ? "chase" : "crossy")} />
        <CyclePill label="TURN" value={turn === "new" ? "STEER" : "SLIDE"} onTap={() => setTurn(turn === "new" ? "old" : "new")} />
        <CyclePill label="BAN" value={wheelLabel} dot={wheelDot} onTap={cycleWheel} />
        <button
          type="button"
          onClick={() => {
            sfx.click();
            setTips((v) => !v);
          }}
          aria-label="Cara main"
          className={`pointer-events-auto flex min-h-[46px] w-[16%] shrink-0 items-center justify-center rounded-2xl font-display text-[4cqw] leading-none shadow-[0_3px_0_rgba(0,0,0,0.12)] transition-transform active:translate-y-[2px] active:shadow-none ${
            tips ? "bg-[#1f2430] text-white" : "bg-white/95 text-[#1f2430]"
          }`}
        >
          ?
        </button>
      </div>
      {tips && (
        <div className="rounded-2xl bg-white/90 px-3 py-2 text-center font-body text-[2.7cqw] font-extrabold leading-snug text-[#1f2430]/75 backdrop-blur-[2px]">
          Swipe ↔ pindah jalur · tap / ↑ lompat · SPRINT = kayuh cepat · NOS kalau penuh
        </div>
      )}
    </div>
  );
}

function MainMenu() {
  const best = useUI((s) => s.best);
  const wallet = useUI((s) => s.wallet);
  const previewId = useUI((s) => s.preview);
  const unlocked = useUI((s) => s.unlocked);
  const cycleSkin = useUI((s) => s.cycleSkin);
  const unlockSkin = useUI((s) => s.unlockSkin);
  const setMenuView = useUI((s) => s.setMenuView);
  const [shakeKey, setShakeKey] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showAch, setShowAch] = useState(false);
  const unseenAch = useUI((s) => s.unseenAch);
  const skin = getSkin(previewId);
  const isUnlocked = unlocked.includes(skin.id);
  const affordable = wallet >= skin.cost;

  const setPreview = useUI((s) => s.setPreview);
  const equippedId = useUI((s) => s.skin);
  const wordHunt = useUI((s) => s.wordHunt);
  const setShowMysteryBox = useUI((s) => s.setShowMysteryBox);

  const start = () => {
    unlockAudio();
    sfx.click();
    if (!isUnlocked) setPreview(equippedId);
    engine.startRun();
  };

  const cycle = (dir: -1 | 1) => {
    unlockAudio();
    sfx.click();
    cycleSkin(dir);
    engine.skinPop();
  };

  const unlock = () => {
    unlockAudio();
    if (unlockSkin(skin.id)) {
      sfx.unlock();
      engine.skinPop();
    } else {
      sfx.deny();
      setShakeKey((k) => k + 1);
    }
  };

  const open = (v: "skins" | "tricks" | "exit") => {
    unlockAudio();
    sfx.click();
    engine.faceCamera();
    setMenuView(v);
  };

  // Swipe on stage to cycle skins seamlessly
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    touchStart.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!touchStart.current) return;
    const dx = e.clientX - touchStart.current.x;
    touchStart.current = null;
    if (Math.abs(dx) > 30) {
      cycle(dx > 0 ? -1 : 1);
    }
  };

  return (
    <div
      className="menu-overlay pointer-events-none absolute inset-0 z-20 select-none"
      style={{ inset: "env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px)" }}
    >
      {/* ── Top Bar: compact, aligned wallet + best cards ── */}
      <div className="absolute left-[4%] top-[3.5%] flex h-11 min-w-[25%] items-center gap-2 px-1">
        <BreadIcon size={25} />
        <span className="crossy-ui-number font-display text-[4.8cqw] leading-none text-white">{wallet}</span>
      </div>

      <div className="absolute right-[4%] top-[3.5%] flex h-11 min-w-[28%] items-center justify-center gap-1.5 px-1">
        <span className="font-display text-[3.9cqw] leading-none text-[#ffe04b]" style={{ textShadow: "0 2px 7px rgba(15,20,32,0.45)" }}>BEST</span>
        <span className="crossy-ui-number font-display text-[4.4cqw] leading-none text-white">{best}</span>
      </div>

      {/* ── Title: lockup miring ringan ala logo Crossy Road ── */}
      <div
        className="absolute left-0 right-0 top-[9%] z-10 flex flex-col items-center"
        style={{ transform: "rotate(-4deg)" }}
      >
        <div className="crossy-title crossy-title-white font-display text-[11.8cqw] leading-[0.88] tracking-[-0.03em] text-white">
          PIGEON
        </div>
        <div className="crossy-title crossy-title-yellow font-display text-[15.5cqw] leading-[0.84] tracking-[-0.04em] text-[#ffd23f]">
          SK8
        </div>
      </div>

      {/* ── Invisible swipe zone over the pigeon turntable ── */}
      <div
        className="pointer-events-auto absolute inset-x-0 top-[42%] bottom-[25%]"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      />

      {/* ── Bottom Controls: START button (GREEN) + 3 Icon Buttons (Skins=YELLOW, Tricks=BLUE, Settings=DARK) ── */}
      <div className="absolute bottom-[3.5%] left-[6%] right-[6%] flex flex-col items-center gap-3">
        {/* START button (hijau seperti permintaan user) or UNLOCK if preview is locked */}
        {isUnlocked ? (
          <button
            type="button"
            onClick={start}
            className="pointer-events-auto relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#2ecc71] to-[#27ae60] py-[4cqw] font-display text-[8.5cqw] leading-none text-white shadow-[0_6px_0_#1b7a43] active:translate-y-[3px] active:shadow-[0_2px_0_#1b7a43]"
          >
            <span className="relative z-10">START</span>
            <span className="shine pointer-events-none absolute inset-y-0 w-[22%] -rotate-12 bg-white/25 blur-[2px]" />
          </button>
        ) : (
          <div key={shakeKey} className={`w-full ${shakeKey ? "shake" : ""}`}>
            <button
              type="button"
              onClick={unlock}
              className={`pointer-events-auto flex w-full items-center justify-center gap-2 rounded-2xl py-[3.8cqw] font-display text-[6.5cqw] leading-none ${
                affordable
                  ? "bg-[#ffd60a] text-[#1f2430] shadow-[0_6px_0_#c9a400] active:translate-y-[3px] active:shadow-[0_2px_0_#c9a400]"
                  : "bg-[#d9dde3] text-[#6b7280] shadow-[0_6px_0_#b3b9c2]"
              }`}
            >
              {affordable ? "UNLOCK" : "NEED"}
              <span className="flex items-center gap-1.5">
                <BreadIcon size={24} />
                {skin.cost}
              </span>
            </button>
          </div>
        )}

        {/* ── 3 SQUIRCLE ICON BUTTONS ROW (Identical to Image 1) ── */}
        <div className="flex w-full items-center justify-center gap-4">
          {/* 1. Skins button (KUNING dengan ikon baju/t-shirt sesuai request user) */}
          <button
            type="button"
            onClick={() => open("skins")}
            aria-label="Skins (Karakter)"
            title="Koleksi Skin Burung Merpati"
            className="pointer-events-auto flex aspect-square w-[20cqw] max-w-[74px] items-center justify-center rounded-2xl bg-[#ffd60a] text-white shadow-[0_5px_0_#c9a400] active:translate-y-[2px] active:shadow-none"
          >
            <ShirtIcon />
          </button>

          {/* 2. Tricks / Skateboard button (BIRU dengan ikon skateboard) */}
          <button
            type="button"
            onClick={() => open("tricks")}
            aria-label="Tricks (Gaya)"
            title="Katalog Trick Skate"
            className="pointer-events-auto flex aspect-square w-[20cqw] max-w-[74px] items-center justify-center rounded-2xl bg-[#38bdf8] text-white shadow-[0_5px_0_#0284c7] active:translate-y-[2px] active:shadow-none"
          >
            <SkateboardIcon />
          </button>

          {/* 3. Achievement button (UNG dengan ikon piala + badge merah kalau ada yang belum dilihat) */}
          <button
            type="button"
            onClick={() => {
              unlockAudio();
              sfx.click();
              engine.faceCamera();
              setShowAch(true);
            }}
            aria-label="Pencapaian"
            title="Pencapaian (Achievements)"
            className="pointer-events-auto relative flex aspect-square w-[20cqw] max-w-[74px] items-center justify-center rounded-2xl bg-[#a855f7] text-white shadow-[0_5px_0_#7e22ce] active:translate-y-[2px] active:shadow-none"
          >
            <TrophyIcon />
            {unseenAch > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-[6cqw] max-h-6 min-w-[6cqw] items-center justify-center rounded-full border-2 border-white bg-[#ef4b4b] px-1 font-display text-[2.6cqw] leading-none text-white shadow-md">
                {unseenAch}
              </span>
            )}
          </button>

          {/* 4. Settings button (NAVY GELAP dengan ikon gear/pengaturan) */}
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            aria-label="Pengaturan Game"
            title="Pengaturan & Pilihan Track"
            className="pointer-events-auto flex aspect-square w-[20cqw] max-w-[74px] items-center justify-center rounded-2xl bg-[#2a3447] text-white shadow-[0_5px_0_#18202d] active:translate-y-[2px] active:shadow-none"
          >
            <GearIcon />
          </button>
        </div>
      </div>

      {/* ── Achievement Panel (badge merah di tombol hilang saat panel ditutup) ── */}
      {showAch && <AchievementsPanel onClose={() => setShowAch(false)} />}

      {/* ── Settings Modal Overlay (Diakses lewat tombol gear agar main menu tetap bersih) ── */}
      {showSettings && (
        <div className="pointer-events-auto absolute inset-0 z-40 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm card-in">
          <div className="flex w-full max-w-sm flex-col gap-2 rounded-3xl border border-white/10 bg-[#1c2230] p-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-display text-[4cqw] text-[#ffd23f]">PENGATURAN & TRACK</span>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 font-display text-sm text-white active:scale-95"
                aria-label="Tutup pengaturan"
              >
                ✕
              </button>
            </div>
            <TrackModeRow />
            <SettingsRow />
            <button
              type="button"
              onClick={() => {
                setShowSettings(false);
                unlockAudio();
                sfx.click();
                setShowMysteryBox(true);
              }}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ffd451] to-[#ff9f1c] py-2.5 font-display text-[3.4cqw] text-[#1f405b] shadow-[0_4px_0_#d5a92e] active:translate-y-[2px]"
            >
              <span>🎁</span>
              <span>DAILY WORD HUNT · {wordHunt.collected.filter(Boolean).length}/{wordHunt.word.length}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowSettings(false);
                unlockAudio();
                sfx.click();
                window.dispatchEvent(new CustomEvent("switch-game-mode", { detail: "shibuya" }));
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#2ec4b6] to-[#3a86ff] py-2.5 font-display text-[3.4cqw] text-white shadow-[0_4px_0_#1f9a8f] active:translate-y-[2px]"
            >
              <span>🏙️</span>
              <span>PINDAH KE MODE KOTA SHIBUYA</span>
            </button>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowSettings(false);
                  open("exit");
                }}
                className="flex-1 rounded-2xl bg-[#ef4b4b] py-2.5 font-display text-[3.8cqw] text-white shadow-[0_4px_0_#b83232] active:translate-y-[2px]"
              >
                EXIT PARK
              </button>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="flex-1 rounded-2xl bg-[#2ec4b6] py-2.5 font-display text-[3.8cqw] text-white shadow-[0_4px_0_#1f9a8f] active:translate-y-[2px]"
              >
                SELESAI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExitDialog() {
  const setMenuView = useUI((s) => s.setMenuView);
  const skin = getSkin(useUI((s) => s.skin));
  const stay = () => {
    sfx.click();
    setMenuView("main");
  };
  const leave = () => {
    sfx.click();
    setMenuView("bye");
  };
  return (
    <div className="pointer-events-auto absolute inset-0 z-30 flex select-none items-center justify-center bg-black/60 p-6 backdrop-blur-sm card-in">
      <div className="flex w-full max-w-xs flex-col items-center rounded-3xl bg-white p-6 text-center shadow-2xl">
        <PigeonIcon skin={skin} size={84} />
        <div className="mt-2 font-display text-[6.5cqw] leading-none text-[#1f2430]">LEAVE THE PARK?</div>
        <div className="mt-2 font-body text-[3.4cqw] font-bold text-[#6b7280]">Your bread and skins are saved.</div>
        <div className="mt-6 flex w-full gap-3">
          <button
            type="button"
            onClick={stay}
            className="flex-1 rounded-2xl bg-[#2ec4b6] py-3 font-display text-[4.6cqw] text-white shadow-[0_5px_0_#1f9a8f] active:translate-y-[3px] active:shadow-[0_2px_0_#1f9a8f]"
          >
            STAY
          </button>
          <button
            type="button"
            onClick={leave}
            className="flex-1 rounded-2xl bg-[#ef4b4b] py-3 font-display text-[4.6cqw] text-white shadow-[0_5px_0_#b83232] active:translate-y-[3px] active:shadow-[0_2px_0_#b83232]"
          >
            EXIT
          </button>
        </div>
      </div>
    </div>
  );
}

function ByeScreen() {
  const setMenuView = useUI((s) => s.setMenuView);
  const best = useUI((s) => s.best);
  const skin = getSkin(useUI((s) => s.skin));
  return (
    <div className="pointer-events-auto absolute inset-0 z-30 flex select-none flex-col items-center justify-center bg-[#151823] px-8 text-center">
      <div className="flex justify-center">
        <PigeonIcon skin={skin} size={120} />
      </div>
      <div className="font-display mt-4 text-[9cqw] leading-none text-white">THANKS FOR</div>
      <div className="font-display text-[9cqw] leading-none text-[#ffd60a]">PLAYING!</div>
      <div className="mt-4 font-body text-[3.6cqw] font-bold text-white/60">Coo coo. See you on the next ride.</div>
      {best > 0 && <div className="mt-2 font-display text-[4cqw] text-[#2ec4b6]">BEST {best}</div>}
      <button
        type="button"
        onClick={() => {
          sfx.click();
          setMenuView("main");
        }}
        className="mt-8 rounded-2xl bg-[#2ec4b6] px-8 py-3.5 font-display text-[5cqw] text-white shadow-[0_5px_0_#1f9a8f] active:translate-y-[3px] active:shadow-[0_2px_0_#1f9a8f]"
      >
        BACK TO MENU
      </button>
    </div>
  );
}

export function Menu() {
  const phase = useUI((s) => s.phase);
  const view = useUI((s) => s.menuView);
  if (phase !== "menu") return null;
  return (
    <>
      {view === "main" && <MainMenu />}
      {view === "skins" && <SkinsPanel />}
      {view === "tricks" && <TricksPanel />}
      {view === "exit" && (
        <>
          <MainMenu />
          <ExitDialog />
        </>
      )}
      {view === "bye" && <ByeScreen />}
    </>
  );
}
