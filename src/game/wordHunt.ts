/**
 * Daily Word Hunt & Mystery Box system for Pigeon SK8 (Subway Surfers-style).
 * Picks a deterministic word based on calendar date so all players get the same daily word.
 */

export const DAILY_WORDS = [
  "PIGEON",
  "SKATE",
  "TOKYO",
  "SHIBUYA",
  "TRICKS",
  "HARUNA",
  "STREET",
  "FLIGHT",
  "BURUNG",
  "OLLIE",
  "BOOST",
  "SURF",
];

export interface WordHuntData {
  date: string;
  word: string;
  collected: boolean[]; // matching each character index in word
  pendingBox: boolean; // all letters collected, ready to open
  claimed: boolean; // box already opened today
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Get today's daily word deterministically based on date. */
export function getDailyWord(dateStr = getTodayDateString()): string {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  return DAILY_WORDS[hash % DAILY_WORDS.length];
}

const STORAGE_KEY = "pigeon-sk8-wordhunt";

export function loadWordHunt(): WordHuntData {
  const today = getTodayDateString();
  const word = getDailyWord(today);

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<WordHuntData>;
      if (parsed.date === today && parsed.word === word && Array.isArray(parsed.collected)) {
        // Ensure array length matches today's word length
        const collected = parsed.collected.slice(0, word.length);
        while (collected.length < word.length) collected.push(false);
        const allDone = collected.every(Boolean);
        return {
          date: today,
          word,
          collected,
          pendingBox: parsed.pendingBox ?? (allDone && !parsed.claimed),
          claimed: parsed.claimed ?? false,
        };
      }
    }
  } catch {
    // fallback
  }

  const initial: WordHuntData = {
    date: today,
    word,
    collected: new Array(word.length).fill(false),
    pendingBox: false,
    claimed: false,
  };
  saveWordHunt(initial);
  return initial;
}

export function saveWordHunt(data: WordHuntData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}
