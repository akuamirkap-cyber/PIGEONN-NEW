/**
 * Statistik seumur hidup (persist di localStorage) — bahan dasar achievements:
 * berapa run selesai, jarak terjauh satu run, roket langka yang diambil,
 * dan berapa kali main di mode Kota Shibuya.
 */

export interface LifeStats {
  runs: number;
  maxDist: number;
  rockets: number;
  shibuyaRuns: number;
}

const KEY = "pigeon-sk8-life";
const DEFAULTS: LifeStats = { runs: 0, maxDist: 0, rockets: 0, shibuyaRuns: 0 };

let cache: LifeStats | null = null;

export function getStats(): LifeStats {
  if (cache) return cache;
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(KEY) : null;
    if (raw) {
      const p = JSON.parse(raw) as Partial<LifeStats>;
      cache = { ...DEFAULTS, ...p };
      return cache;
    }
  } catch {
    /* abaikan data korup */
  }
  cache = { ...DEFAULTS };
  return cache;
}

function saveStats() {
  try {
    localStorage.setItem(KEY, JSON.stringify(getStats()));
  } catch {
    /* penyimpanan penuh — statistik boleh gagal diam-diam */
  }
}

/** Catat satu run selesai (dipanggil engine tepat saat game over). */
export function recordRun(distM: number, rockets: number): LifeStats {
  const s = getStats();
  s.runs += 1;
  s.maxDist = Math.max(s.maxDist, Math.floor(distM));
  s.rockets += Math.max(0, Math.floor(rockets));
  saveStats();
  return s;
}

/** Catat run yang dimainkan di Kota Shibuya (dipanggil engine saat startRun). */
export function recordShibuyaRun(): LifeStats {
  const s = getStats();
  s.shibuyaRuns += 1;
  saveStats();
  return s;
}
