/** Freestyle trick catalog. Air tricks are triggered by tap / swipe / double-tap while airborne. */
export type TrickKind =
  | "kickflip"
  | "heelflip"
  | "spinL"
  | "spinR"
  | "shuvit"
  | "impossible"
  | "method"
  | "indy"
  | "wingflap"
  | "coo540"
  // — 20 gaya baru: flip/shuv family
  | "varial"
  | "treflip"
  | "hardflip"
  | "laser"
  | "inward"
  | "dblflip"
  | "pressure"
  | "fingerflip"
  | "hospital"
  // — spin family
  | "bigspin"
  | "gazelle"
  | "shifty"
  | "air720"
  // — grab & style family
  | "melon"
  | "nosegrab"
  | "tailgrab"
  | "stalefish"
  | "benihana"
  | "rocket"
  | "christ";

export type TrickInput = "tap" | "swipeL" | "swipeR" | "swipeUp" | "swipeDown" | "double" | "hold" | "tapUp";

export interface TrickDef {
  kind: TrickKind;
  name: string;
  short: string;
  pts: number;
  color: string;
  dur: number;
  input: TrickInput;
  /** requires big air (ramp launch) */
  bigAirOnly?: boolean;
  desc: string;
  emoji: string;
}

export const TRICKS: TrickDef[] = [
  { kind: "kickflip", name: "KICKFLIP", short: "Kickflip", pts: 50, color: "#ffd60a", dur: 0.42, input: "tap", desc: "Tap in the air", emoji: "🛹" },
  { kind: "heelflip", name: "HEELFLIP", short: "Heelflip", pts: 50, color: "#ffd60a", dur: 0.42, input: "tap", desc: "Alternates with kickflip", emoji: "🛹" },
  { kind: "shuvit", name: "POP SHUV-IT", short: "Shuv-it", pts: 70, color: "#f4a261", dur: 0.4, input: "swipeDown", desc: "Swipe down in the air", emoji: "🔄" },
  { kind: "spinL", name: "BS 360", short: "BS 360", pts: 100, color: "#4cc9f0", dur: 0.55, input: "swipeL", desc: "Swipe ← twice in the air (or at the left edge)", emoji: "🌀" },
  { kind: "spinR", name: "FS 360", short: "FS 360", pts: 100, color: "#4cc9f0", dur: 0.55, input: "swipeR", desc: "Swipe → twice in the air (or at the right edge)", emoji: "🌀" },
  { kind: "method", name: "METHOD GRAB", short: "Method", pts: 90, color: "#ff5c8a", dur: 0.5, input: "swipeUp", desc: "Swipe up again in the air", emoji: "✋" },
  { kind: "indy", name: "INDY GRAB", short: "Indy", pts: 80, color: "#ff5c8a", dur: 0.45, input: "hold", desc: "Hold the screen in the air", emoji: "🤙" },
  { kind: "impossible", name: "IMPOSSIBLE", short: "Impossible", pts: 150, color: "#c77dff", dur: 0.6, input: "double", desc: "Double-tap in the air", emoji: "✨" },
  { kind: "wingflap", name: "WING FLAP", short: "Wing Flap", pts: 60, color: "#80ed99", dur: 0.55, input: "tap", bigAirOnly: true, desc: "Tap at the top of a ramp jump", emoji: "🪽" },
  { kind: "coo540", name: "COO 540", short: "Coo 540", pts: 200, color: "#ff9f1c", dur: 0.62, input: "swipeL", bigAirOnly: true, desc: "Swipe left/right off a ramp", emoji: "🔥" },

  /* ===== 20 GAYA BARU (super keren!) ===== */
  // — Flip & shuv family: tombol S memainkannya berurutan di udara —
  { kind: "varial", name: "VARIAL FLIP", short: "Varial", pts: 90, color: "#ffd60a", dur: 0.45, input: "tap", desc: "Kickflip + shuvit combo (tap S)", emoji: "🛹" },
  { kind: "inward", name: "INWARD HEEL", short: "Inward Heel", pts: 110, color: "#ffd60a", dur: 0.48, input: "swipeR", desc: "Heelflip + shuvit combo (tap S)", emoji: "🛹" },
  { kind: "hardflip", name: "HARDFLIP", short: "Hardflip", pts: 120, color: "#ffb703", dur: 0.5, input: "tap", desc: "Ilusi flip menggulung ke depan (tap S)", emoji: "🌀" },
  { kind: "fingerflip", name: "FINGER FLIP", short: "Fingerflip", pts: 90, color: "#ffd60a", dur: 0.42, input: "tap", desc: "Papan diputar dengan sentuhan (tap S)", emoji: "☝️" },
  { kind: "pressure", name: "PRESSURE FLIP", short: "Pressure", pts: 130, color: "#ffb703", dur: 0.5, input: "swipeDown", desc: "Putaran tekanan kaki belakang (tap S)", emoji: "🦶" },
  { kind: "dblflip", name: "DOUBLE FLIP", short: "Double Flip", pts: 140, color: "#ffc93c", dur: 0.52, input: "tap", desc: "Kickflip BERPUTAR DUA KALI (tap S)", emoji: "⚡" },
  { kind: "hospital", name: "HOSPITAL FLIP", short: "Hospital", pts: 150, color: "#80ed99", dur: 0.6, input: "swipeUp", desc: "Papan berputar lalu BALIK sendiri (tap S)", emoji: "🪃" },
  { kind: "treflip", name: "360 FLIP", short: "360 Flip", pts: 180, color: "#ff9f1c", dur: 0.55, input: "double", desc: "Flip + shuvit 360° legendaris (tap S)", emoji: "🏆" },
  { kind: "laser", name: "LASER FLIP", short: "Laser Flip", pts: 200, color: "#c77dff", dur: 0.6, input: "double", desc: "Double heelflip + shuvit 360° (tap S)", emoji: "🔮" },
  // — Spin family —
  { kind: "shifty", name: "SHIFTY AIR", short: "Shifty", pts: 80, color: "#4cc9f0", dur: 0.45, input: "swipeL", desc: "Putar badan lalu kembali — gaya! (tap S)", emoji: "⚡" },
  { kind: "bigspin", name: "BIG SPIN", short: "Big Spin", pts: 150, color: "#4cc9f0", dur: 0.55, input: "swipeDown", bigAirOnly: true, desc: "Swipe ↓ lepas ramp: 180 + shuvit 360", emoji: "🌪️" },
  { kind: "gazelle", name: "GAZELLE", short: "Gazelle", pts: 170, color: "#38bdf8", dur: 0.6, input: "swipeL", desc: "Badan & papan berputar BERLAWANAN (tap S)", emoji: "🦌" },
  { kind: "air720", name: "COO 720", short: "Coo 720", pts: 300, color: "#ff9f1c", dur: 0.7, input: "double", bigAirOnly: true, desc: "Double tap lepas ramp: dua putaran penuh!", emoji: "☄️" },
  // — Grab & style family —
  { kind: "melon", name: "MELON GRAB", short: "Melon", pts: 130, color: "#ff5c8a", dur: 0.5, input: "swipeUp", desc: "Grab menyilang sambil 180° (tap S)", emoji: "🍉" },
  { kind: "nosegrab", name: "NOSE GRAB", short: "Nose Grab", pts: 100, color: "#ff5c8a", dur: 0.45, input: "hold", desc: "Pegang hidung papan di udara (tap S)", emoji: "👃" },
  { kind: "tailgrab", name: "TAIL GRAB", short: "Tail Grab", pts: 100, color: "#ff5c8a", dur: 0.45, input: "hold", desc: "Pegang ekor papan di udara (tap S)", emoji: "🤏" },
  { kind: "stalefish", name: "STALEFISH", short: "Stalefish", pts: 120, color: "#ff85a1", dur: 0.48, input: "hold", desc: "Grab klasik gaya sepatu tua (tap S)", emoji: "🐟" },
  { kind: "benihana", name: "BENIHANA", short: "Benihana", pts: 140, color: "#ff85a1", dur: 0.52, input: "swipeUp", desc: "Satu tangan ke bawah, badan meliuk (tap S)", emoji: "🔥" },
  { kind: "rocket", name: "ROCKET AIR", short: "Rocket", pts: 160, color: "#ff6b6b", dur: 0.55, input: "hold", bigAirOnly: true, desc: "Hold lepas ramp: papan meluncur lurus", emoji: "🚀" },
  { kind: "christ", name: "CHRIST AIR", short: "Christ Air", pts: 110, color: "#ffe066", dur: 0.6, input: "swipeUp", bigAirOnly: true, desc: "Swipe ↑ lepas ramp: tangan terbentang!", emoji: "🕊️" },
];

export const TRICK_MAP: Record<TrickKind, TrickDef> = Object.fromEntries(TRICKS.map((t) => [t.kind, t])) as Record<TrickKind, TrickDef>;

export const INPUT_LABEL: Record<TrickInput, string> = {
  tap: "Tap",
  swipeL: "Swipe ← ×2 (air)",
  swipeR: "Swipe → ×2 (air)",
  swipeUp: "Swipe ↑",
  swipeDown: "Swipe ↓",
  double: "Double tap",
  hold: "Hold / G key",
  tapUp: "Tap + ↑",
};
