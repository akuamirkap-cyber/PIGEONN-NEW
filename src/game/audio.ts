import { useUI } from "./store";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let unlocked = false;

function ensure() {
  if (typeof window === "undefined" || !unlocked) return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.35;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

export function unlockAudio() {
  unlocked = true;
  ensure();
}

function tone(
  freq: number,
  dur: number,
  type: OscillatorType = "square",
  opts: { to?: number; vol?: number; delay?: number; attack?: number } = {},
) {
  const c = ensure();
  if (!c || !master || useUI.getState().muted) return;
  const t0 = c.currentTime + (opts.delay ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, t0 + dur);
  const vol = opts.vol ?? 0.5;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + (opts.attack ?? 0.008));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise(dur: number, vol = 0.4, filterFreq = 1200) {
  const c = ensure();
  if (!c || !master || useUI.getState().muted) return;
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = filterFreq;
  const g = c.createGain();
  g.gain.value = vol;
  src.connect(f).connect(g).connect(master);
  src.start();
}

export const sfx = {
  jump: () => tone(320, 0.14, "square", { to: 640, vol: 0.25 }),
  land: () => noise(0.06, 0.25, 600),
  bread: () => {
    tone(880, 0.07, "sine", { vol: 0.35 });
    tone(1320, 0.1, "sine", { vol: 0.35, delay: 0.06 });
  },
  trick: () => {
    tone(523, 0.08, "triangle", { vol: 0.4 });
    tone(659, 0.08, "triangle", { vol: 0.4, delay: 0.07 });
    tone(784, 0.14, "triangle", { vol: 0.4, delay: 0.14 });
  },
  bigTrick: () => {
    tone(523, 0.07, "triangle", { vol: 0.4 });
    tone(659, 0.07, "triangle", { vol: 0.4, delay: 0.06 });
    tone(784, 0.07, "triangle", { vol: 0.4, delay: 0.12 });
    tone(1046, 0.18, "triangle", { vol: 0.45, delay: 0.18 });
  },
  grind: () => noise(0.08, 0.12, 3000),
  ramp: () => tone(200, 0.35, "sawtooth", { to: 900, vol: 0.2 }),
  sketchy: () => tone(300, 0.2, "sawtooth", { to: 120, vol: 0.2 }),
  crash: () => {
    noise(0.35, 0.6, 900);
    tone(220, 0.4, "sawtooth", { to: 60, vol: 0.3 });
  },
  coo: () => {
    tone(330, 0.16, "sine", { to: 290, vol: 0.35 });
    tone(330, 0.2, "sine", { to: 270, vol: 0.35, delay: 0.16 });
  },
  start: () => {
    tone(440, 0.08, "square", { vol: 0.25 });
    tone(660, 0.08, "square", { vol: 0.25, delay: 0.09 });
    tone(880, 0.16, "square", { vol: 0.25, delay: 0.18 });
  },
  swish: () => noise(0.05, 0.08, 2500),
  bonk: () => {
    tone(480, 0.12, "sine", { to: 160, vol: 0.35 });
    tone(920, 0.08, "triangle", { to: 280, vol: 0.25 });
  },
  /** Kartun "POW!" tipis: thump bass pendek + noise tabrakan (tanpa slide-whistle). */
  thwack: () => {
    tone(150, 0.13, "square", { to: 62, vol: 0.26 });
    noise(0.1, 0.2, 1400);
  },
  /** Boing kenyal saat hewan mantul di aspal. */
  boing: () => {
    tone(240, 0.26, "sine", { to: 780, vol: 0.22 });
    tone(780, 0.16, "sine", { to: 320, vol: 0.12, delay: 0.14 });
  },
  horn: () => {
    tone(392, 0.13, "square", { vol: 0.22 });
    tone(392, 0.2, "square", { vol: 0.22, delay: 0.18 });
  },
  squawk: () => {
    tone(980, 0.22, "sawtooth", { to: 320, vol: 0.28 });
    noise(0.15, 0.25, 2500);
  },
  /** Motor dari arah depan: raungan mesin pendek (bukan klakson mobil). */
  motor: () => {
    tone(150, 0.3, "sawtooth", { to: 230, vol: 0.2 });
    tone(300, 0.22, "square", { to: 420, vol: 0.12, delay: 0.04 });
    noise(0.18, 0.14, 700);
  },
  cluck: () => tone(720, 0.05, "triangle", { to: 520, vol: 0.18 }),
  click: () => tone(720, 0.05, "square", { vol: 0.16 }),
  unlock: () => {
    tone(523, 0.08, "triangle", { vol: 0.4 });
    tone(659, 0.08, "triangle", { vol: 0.4, delay: 0.08 });
    tone(784, 0.08, "triangle", { vol: 0.4, delay: 0.16 });
    tone(1046, 0.25, "triangle", { vol: 0.45, delay: 0.24 });
  },
  deny: () => tone(160, 0.18, "sawtooth", { to: 110, vol: 0.2 }),
  whoosh: () => noise(0.25, 0.14, 900),
  /** Japanese crossing bell: alternating "kan-kan". */
  bell: (alt: boolean, vol = 0.2) => {
    tone(alt ? 1046 : 830, 0.05, "triangle", { vol, attack: 0.003 });
    tone(alt ? 1046 : 830, 0.28, "sine", { vol: vol * 0.7, attack: 0.003 });
  },
  trainHorn: () => {
    tone(311, 0.75, "sawtooth", { vol: 0.14, attack: 0.03 });
    tone(415, 0.75, "sawtooth", { vol: 0.14, attack: 0.03 });
  },
  rumble: (vol = 0.2) => noise(0.3, vol, 260),
  splash: () => {
    noise(0.18, 0.22, 1800);
    tone(520, 0.12, "sine", { to: 260, vol: 0.12 });
  },
  yelp: () => tone(620, 0.18, "square", { to: 880, vol: 0.16 }),
  nos: () => {
    noise(0.6, 0.35, 2200);
    tone(120, 0.9, "sawtooth", { to: 480, vol: 0.22, attack: 0.02 });
  },
  nosReady: () => {
    tone(660, 0.08, "square", { vol: 0.2 });
    tone(990, 0.16, "square", { vol: 0.2, delay: 0.09 });
  },
  sprint: () => {
    noise(0.28, 0.12, 2000);
    tone(280, 0.28, "triangle", { to: 760, vol: 0.18, attack: 0.02 });
  },
  /** Item LANGKA (roket): chime naik berkilau + whoosh kecil. */
  rare: () => {
    tone(523, 0.09, "triangle", { vol: 0.32, attack: 0.005 });
    tone(784, 0.09, "triangle", { vol: 0.3, delay: 0.07 });
    tone(1046, 0.14, "triangle", { vol: 0.3, delay: 0.14 });
    tone(1568, 0.22, "sine", { vol: 0.24, delay: 0.21 });
    noise(0.5, 0.1, 3200);
  },
  nosPickup: () => {
    tone(440, 0.06, "triangle", { vol: 0.3 });
    tone(660, 0.06, "triangle", { vol: 0.3, delay: 0.06 });
    tone(880, 0.12, "triangle", { vol: 0.3, delay: 0.12 });
  },
  meow: () => {
    // Comical, expressive cat meow: upward vocal glide followed by descending slide
    tone(480, 0.35, "triangle", { to: 820, vol: 0.35, attack: 0.03 });
    tone(780, 0.32, "sine", { to: 360, vol: 0.3, delay: 0.14 });
  },
  purr: () => {
    tone(180, 0.22, "triangle", { to: 140, vol: 0.15 });
  },
  bark: (big = false) => {
    if (big) {
      // Big dog deep boisterous bark "WOOF!"
      tone(260, 0.16, "sawtooth", { to: 140, vol: 0.32, attack: 0.01 });
      noise(0.2, 0.12, 1200);
    } else {
      // Small dog cute perky bark "Yip-yip!"
      tone(560, 0.1, "triangle", { to: 340, vol: 0.28, attack: 0.01 });
      tone(680, 0.11, "triangle", { to: 380, vol: 0.26, delay: 0.08, attack: 0.01 });
    }
  },
  letterPickup: () => {
    tone(784, 0.07, "triangle", { vol: 0.35 });
    tone(988, 0.08, "triangle", { vol: 0.35, delay: 0.06 });
    tone(1318, 0.16, "triangle", { vol: 0.4, delay: 0.12 });
  },
  mysteryBox: () => {
    tone(523, 0.1, "triangle", { vol: 0.4 });
    tone(659, 0.1, "triangle", { vol: 0.4, delay: 0.08 });
    tone(784, 0.1, "triangle", { vol: 0.4, delay: 0.16 });
    tone(1046, 0.28, "triangle", { vol: 0.45, delay: 0.24 });
  },
};

