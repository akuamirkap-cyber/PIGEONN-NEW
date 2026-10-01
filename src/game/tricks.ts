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
  | "coo540";

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
