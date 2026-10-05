/**
 * Sistem PENCAPAIAN (Achievements) Pigeon SK8.
 * 16 lencana dengan hadiah roti, dievaluasi dari snapshot state UI + statistik
 * seumur hidup (stats.ts). Status done/seen persist di localStorage:
 *  - done  = achievement sudah terbuka (hadiah sudah diberikan)
 *  - seen  = pemain sudah membuka panel & melihatnya (badge merah di tombol hilang)
 */
import { SKINS } from "./skins";
import { getStats } from "./stats";

/** Snapshot state yang dibutuhkan evaluator (dibangun dari store UI). */
export interface AchCtx {
  best: number;
  wallet: number;
  skinsUnlocked: number;
  tricksAllOn: boolean;
  wordDone: boolean;
}

export interface AchDef {
  id: string;
  icon: string;
  title: string;
  desc: string;
  target: number;
  /** hadiah roti saat pertama kali terbuka */
  reward: number;
  read: (c: AchCtx) => number;
}

export const ACHIEVEMENTS: AchDef[] = [
  { id: "run-1", icon: "🐣", title: "Merpati Pemula", desc: "Selesaikan 1 run pertamamu", target: 1, reward: 20, read: () => getStats().runs },
  { id: "run-10", icon: "🔁", title: "Tak Kenal Lelah", desc: "Selesaikan 10 run", target: 10, reward: 30, read: () => getStats().runs },
  { id: "run-50", icon: "🕊️", title: "Veteran Aspal", desc: "Selesaikan 50 run", target: 50, reward: 80, read: () => getStats().runs },
  { id: "score-100", icon: "💯", title: "Nilai Sempurna", desc: "Raih skor 100 dalam satu run", target: 100, reward: 25, read: (c) => c.best },
  { id: "score-500", icon: "🌟", title: "Bintang Jalanan", desc: "Raih skor 500 dalam satu run", target: 500, reward: 60, read: (c) => c.best },
  { id: "score-1500", icon: "👑", title: "Legenda Merpati", desc: "Raih skor 1500 dalam satu run", target: 1500, reward: 150, read: (c) => c.best },
  { id: "dist-1000", icon: "🛣️", title: "Maraton Mini", desc: "Tempuh 1.000 m dalam satu run", target: 1000, reward: 40, read: () => getStats().maxDist },
  { id: "dist-5000", icon: "🏁", title: "Ultramaraton", desc: "Tempuh 5.000 m dalam satu run", target: 5000, reward: 120, read: () => getStats().maxDist },
  { id: "bread-200", icon: "🍞", title: "Pengumpul Roti", desc: "Kumpulkan total 200 roti", target: 200, reward: 40, read: (c) => c.wallet },
  { id: "bread-1000", icon: "🥖", title: "Bankir Roti", desc: "Kumpulkan total 1.000 roti", target: 1000, reward: 120, read: (c) => c.wallet },
  { id: "rocket-5", icon: "🚀", title: "Bahan Bakar Semangat", desc: "Ambil 5 roket langka", target: 5, reward: 50, read: () => getStats().rockets },
  { id: "skins-5", icon: "👕", title: "Fashion Show", desc: "Buka 5 skin merpati", target: 5, reward: 60, read: (c) => c.skinsUnlocked },
  { id: "skins-all", icon: "🌈", title: "Lemari Penuh", desc: "Buka semua skin merpati", target: SKINS.length, reward: 200, read: (c) => c.skinsUnlocked },
  { id: "tricks-all", icon: "🛹", title: "Master Gaya", desc: "Aktifkan semua trick sekaligus", target: 1, reward: 80, read: (c) => (c.tricksAllOn ? 1 : 0) },
  { id: "shibuya-1", icon: "🌆", title: "Warga Shibuya", desc: "Main satu run di Kota Shibuya", target: 1, reward: 25, read: () => getStats().shibuyaRuns },
  { id: "wordhunt-1", icon: "🎁", title: "Pemburu Kata", desc: "Selesaikan satu Daily Word Hunt", target: 1, reward: 80, read: (c) => (c.wordDone ? 1 : 0) },
];

const ACH_MAP = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));
export const getAch = (id: string) => ACH_MAP.get(id);

interface AchSave {
  done: string[];
  seen: string[];
}

const KEY = "pigeon-sk8-ach";

export function loadAch(): AchSave {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(KEY) : null;
    if (raw) {
      const p = JSON.parse(raw) as Partial<AchSave>;
      return { done: Array.isArray(p.done) ? p.done : [], seen: Array.isArray(p.seen) ? p.seen : [] };
    }
  } catch {
    /* abaikan */
  }
  return { done: [], seen: [] };
}

function saveAch(v: AchSave) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
  } catch {
    /* diam-diam gagal */
  }
}

/**
 * Evaluasi semua achievement. Yang baru tercapai dicatat `done` (belum `seen`)
 * dan dikembalikan sebagai daftar id — pemanggil bertugas memberi hadiah roti.
 */
export function evaluate(ctx: AchCtx): string[] {
  const st = loadAch();
  const newly: string[] = [];
  for (const a of ACHIEVEMENTS) {
    if (st.done.includes(a.id)) continue;
    if (a.read(ctx) >= a.target) {
      st.done.push(a.id);
      newly.push(a.id);
    }
  }
  if (newly.length) saveAch(st);
  return newly;
}

/** Jumlah achievement yang sudah terbuka tapi belum dilihat pemain (badge merah). */
export function unseenCount(): number {
  const st = loadAch();
  return st.done.filter((id) => !st.seen.includes(id)).length;
}

/** Tandai semua sudah dilihat (dipanggil saat panel achievement ditutup). */
export function markAllSeen() {
  const st = loadAch();
  st.seen = [...st.done];
  saveAch(st);
}
