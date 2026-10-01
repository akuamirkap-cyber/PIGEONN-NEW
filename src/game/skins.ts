import type { Part } from "./voxel";
import {
  catArmParts,
  catBodyParts,
  catHeadParts,
  catLegParts,
  catTailParts,
  crowBodyParts,
  crowHeadParts,
  crowTailParts,
  crowWingParts,
  flamingoBodyParts,
  flamingoHeadParts,
  flamingoLegParts,
  flamingoTailParts,
  flamingoWingParts,
  type CharPalette,
} from "./chars";

export type HatKind = "cap" | "crown" | "mohawk" | "headband" | "beanie" | "visor" | "tophat" | "mailcap" | "harajuku" | "beret";
export type AccessoryKind = "none" | "mailbag" | "hoodie";
export type DeckKind = "standard" | "baguette";
/** Spesies karakter yang bisa dimainkan. `undefined` di Skin berarti merpati. */
export type CharKind = "pigeon" | "cat" | "flamingo" | "crow";

export interface DeckOption {
  id: "default" | "baguette";
  name: string;
  tagline: string;
  badge: string;
  emoji: string;
  cost: number;
}

export const DECKS: DeckOption[] = [
  {
    id: "default",
    name: "Classic Street Deck",
    tagline: "Papan skateboard griptape pro (warna mengikuti karakter)",
    badge: "STANDARD",
    emoji: "🛹",
    cost: 0,
  },
  {
    id: "baguette",
    name: "Skateboard Roti Baguette",
    tagline: "Papan roti baguette Prancis gurih renyah + roda mentega",
    badge: "FREE / GRATIS",
    emoji: "",
    cost: 0,
  },
];

export interface Skin {
  id: string;
  name: string;
  tagline: string;
  cost: number;
  body: string;
  belly: string;
  head: string;
  neck1: string;
  neck2: string;
  wing: string;
  wingTip: string;
  tail: string;
  tailTip: string;
  beak: string;
  cere: string;
  feet: string;
  deck: string;
  wheels: string;
  hat?: HatKind;
  hatColor?: string;
  hatColor2?: string;
  accessory?: AccessoryKind;
  deckType?: DeckKind;
  /** spesies karakter (default: merpati) */
  kind?: CharKind;
}

const ORANGE = "#ff8c42";

export const SKINS: Skin[] = [
  {
    id: "classic", name: "Classic Coo", tagline: "The original street bird", cost: 0,
    body: "#aab3bf", belly: "#c3cad4", head: "#9aa3b0", neck1: "#2fa36b", neck2: "#7a5cab",
    wing: "#8f98a5", wingTip: "#4a4f57", tail: "#6e7682", tailTip: "#3b3f47", beak: "#2d2f33", cere: "#f0f0f0", feet: ORANGE,
    deck: "#2ec4b6", wheels: "#fff1d6",
  },
  {
    id: "postman", name: "Merpati Pos Klasik", tagline: "Topi kurir + tas surat kilat (Free Skin)", cost: 0,
    body: "#707f90", belly: "#8f9dae", head: "#667687", neck1: "#1f8b4c", neck2: "#623f99",
    wing: "#5f6c7a", wingTip: "#262b33", tail: "#525e6c", tailTip: "#262b33", beak: "#2b2c30", cere: "#f0f0f0", feet: ORANGE,
    deck: "#1c2d42", wheels: "#ffd60a", hat: "mailcap", hatColor: "#1c2d42", hatColor2: "#ffd60a", accessory: "mailbag",
  },
  {
    id: "harajuku", name: "Merpati Harajuku Streetwear", tagline: "Hoodie oversized + kacamata hitam (Free Skin)", cost: 0,
    body: "#2d2638", belly: "#3d344d", head: "#251f30", neck1: "#c084fc", neck2: "#2dd4bf",
    wing: "#251f30", wingTip: "#131019", tail: "#251f30", tailTip: "#131019", beak: "#ffd60a", cere: "#c084fc", feet: ORANGE,
    deck: "#18181b", wheels: "#a855f7", hat: "harajuku", hatColor: "#8b5cf6", hatColor2: "#111111", accessory: "hoodie",
  },
  {
    id: "baguette", name: "Chef Baguette", tagline: "Papan skateboard roti baguette renyah & baret (Free Skin)", cost: 0,
    body: "#ded0bd", belly: "#f5ece0", head: "#d4c5a6", neck1: "#d99343", neck2: "#b87028",
    wing: "#c4b598", wingTip: "#7e6d4c", tail: "#b8a786", tailTip: "#756342", beak: "#f59e0b", cere: "#ffffff", feet: "#f59e0b",
    deck: "#c68038", wheels: "#ffe066", hat: "beret", hatColor: "#1f2430", deckType: "baguette",
  },
  {
    id: "dove", name: "Snow Dove", tagline: "Peace, love & kickflips", cost: 30,
    body: "#f4f6f8", belly: "#ffffff", head: "#eef1f4", neck1: "#ffd6e0", neck2: "#ffb8cc",
    wing: "#e3e7ec", wingTip: "#c8ced6", tail: "#d5dae0", tailTip: "#b8bfc8", beak: "#f28cb1", cere: "#ffffff", feet: "#f4a261",
    deck: "#ff9ecf", wheels: "#ffffff",
  },
  {
    id: "punk", name: "Punk Coo", tagline: "Too fast to live", cost: 50,
    body: "#3a3f4a", belly: "#4b515d", head: "#343943", neck1: "#e63946", neck2: "#9d0208",
    wing: "#2b3038", wingTip: "#111111", tail: "#2b3038", tailTip: "#111111", beak: "#222222", cere: "#dddddd", feet: ORANGE,
    deck: "#e63946", wheels: "#111111", hat: "mohawk", hatColor: "#ff2d55",
  },
  {
    id: "pinky", name: "Pink Pigeon", tagline: "Rare & fabulous", cost: 80,
    body: "#f4a3c4", belly: "#ffc6dd", head: "#f28fb8", neck1: "#f9c74f", neck2: "#f3722c",
    wing: "#c77d92", wingTip: "#8a4b60", tail: "#c77d92", tailTip: "#8a4b60", beak: "#d64d7a", cere: "#ffffff", feet: ORANGE,
    deck: "#9b5de5", wheels: "#fff1d6",
  },
  {
    id: "frost", name: "Frosty", tagline: "Ice cold tricks", cost: 100,
    body: "#bfe3ff", belly: "#e6f5ff", head: "#a9d6f7", neck1: "#ffffff", neck2: "#7cc4f5",
    wing: "#98c8ea", wingTip: "#5b9bd5", tail: "#98c8ea", tailTip: "#5b9bd5", beak: ORANGE, cere: "#ffffff", feet: ORANGE,
    deck: "#ffffff", wheels: "#7cc4f5", hat: "beanie", hatColor: "#e63946", hatColor2: "#ffffff",
  },
  {
    id: "street", name: "Street Coo", tagline: "Cap backwards, always", cost: 120,
    body: "#aab3bf", belly: "#c3cad4", head: "#9aa3b0", neck1: "#2fa36b", neck2: "#7a5cab",
    wing: "#8f98a5", wingTip: "#4a4f57", tail: "#6e7682", tailTip: "#3b3f47", beak: "#2d2f33", cere: "#f0f0f0", feet: ORANGE,
    deck: "#ffd60a", wheels: "#111111", hat: "cap", hatColor: "#e63946",
  },
  {
    id: "king", name: "King Coo", tagline: "Ruler of the rooftops", cost: 150,
    body: "#f6c453", belly: "#ffe08a", head: "#f4b942", neck1: "#ffffff", neck2: "#e0a100",
    wing: "#e0a100", wingTip: "#b07d00", tail: "#e0a100", tailTip: "#b07d00", beak: "#8a5a00", cere: "#fff5d6", feet: ORANGE,
    deck: "#7b2cbf", wheels: "#ffd60a", hat: "crown", hatColor: "#ffd60a", hatColor2: "#e63946",
  },
  {
    id: "robo", name: "Robo Pigeon", tagline: "Beep boop, ollie", cost: 200,
    body: "#b8c4d6", belly: "#dfe7f2", head: "#9fb0c8", neck1: "#00e5ff", neck2: "#0077ff",
    wing: "#8fa2ba", wingTip: "#46536a", tail: "#8fa2ba", tailTip: "#46536a", beak: "#333333", cere: "#556070", feet: "#556070",
    deck: "#0b0f14", wheels: "#00e5ff", hat: "visor", hatColor: "#ff2d55",
  },
  {
    id: "ninja", name: "Ninja Coo", tagline: "Silent. Deadly. Fluffy.", cost: 300,
    body: "#22252d", belly: "#2f333d", head: "#1c1f26", neck1: "#2a2e38", neck2: "#22252d",
    wing: "#1a1d24", wingTip: "#0d0f13", tail: "#1a1d24", tailTip: "#0d0f13", beak: "#ffd166", cere: "#3a3f4a", feet: ORANGE,
    deck: "#111111", wheels: "#e63946", hat: "headband", hatColor: "#e63946",
  },
  {
    // KUCING OREN BERDIRI — karakter non-merpati pertama (lihat chars.ts)
    id: "cat", name: "Kucing Oren", tagline: "Kucing oranye berdiri, ekor melengkung (Free)", cost: 0, kind: "cat",
    body: "#ff8c42", belly: "#ffe3c2", head: "#ff8c42", neck1: "#d96a22", neck2: "#ffb877",
    wing: "#ff9147", wingTip: "#d96a22", tail: "#ff8c42", tailTip: "#f7f3ea", beak: "#ff6b9a", cere: "#ffc2d4", feet: "#ffd0a0",
    deck: "#ffb703", wheels: "#1c1e22",
  },
  {
    // FLAMINGO — badan kecil + leher panjang, paruh melengkung dengan ujung hitam
    id: "flamingo", name: "Flamingo", tagline: "Flamingo pink berleher panjang (Free)", cost: 0, kind: "flamingo",
    body: "#ff9ec4", belly: "#ffd3e4", head: "#ff9ec4", neck1: "#ff86b6", neck2: "#ffd3e4",
    wing: "#ff8fb8", wingTip: "#e2619a", tail: "#ff8fb8", tailTip: "#e2619a", beak: "#f7d8c4", cere: "#ffe0ef", feet: "#ff9f45",
    deck: "#ff70a6", wheels: "#1c1e22",
  },
  {
    // GAGAK — hitam mengkilap dengan paruh besar dan kilau biru di sayap
    id: "crow", name: "Gagak", tagline: "Gagak hitam mengkilap, paruh besar (Free)", cost: 0, kind: "crow",
    body: "#23262e", belly: "#33373f", head: "#1e2128", neck1: "#2b3040", neck2: "#20242c",
    wing: "#22252c", wingTip: "#171a20", tail: "#22252c", tailTip: "#2b3040", beak: "#3a3f47", cere: "#5b6472", feet: "#3a3f47",
    deck: "#2b2f38", wheels: "#1c1e22",
  },
];

export function getSkin(id: string): Skin {
  return SKINS.find((s) => s.id === id) ?? SKINS[0];
}

/* ---------- Dispatcher model per spesies (merpati / kucing / flamingo / gagak) ---------- */

/** Semua karakter bisa berbagi palet warna yang sama; modelnya beda per spesies. */
const pal = (k: Skin): CharPalette => k;

/** Part badan (termasuk leher). Untuk kucing/… dipakai model khusus dari chars.ts. */
export function charBodyParts(k: Skin): Part[] {
  switch (k.kind) {
    case "cat":
      return catBodyParts(pal(k));
    case "flamingo":
      return flamingoBodyParts(pal(k));
    case "crow":
      return crowBodyParts(pal(k));
    default:
      return pigeonBodyParts(k);
  }
}

/** Part kepala (+ paruh/moncong/telinga). Origin = sendi kepala (0.32, 1.04, 0). */
export function charHeadParts(k: Skin): Part[] {
  switch (k.kind) {
    case "cat":
      return catHeadParts(pal(k));
    case "flamingo":
      return flamingoHeadParts(pal(k));
    case "crow":
      return crowHeadParts(pal(k));
    default:
      return pigeonHeadParts(k);
  }
}

/** Part sayap: burung = sayap, kucing = lengan depan dengan telapak. */
export function charWingParts(k: Skin, side: 1 | -1): Part[] {
  switch (k.kind) {
    case "cat":
      return catArmParts(pal(k), side);
    case "flamingo":
      return flamingoWingParts(pal(k), side);
    case "crow":
      return crowWingParts(pal(k), side);
    default:
      return wingParts(k, side);
  }
}

/** Part ekor. Origin = TAIL_ROOT. */
export function charTailParts(k: Skin): Part[] {
  switch (k.kind) {
    case "cat":
      return catTailParts(pal(k));
    case "flamingo":
      return flamingoTailParts(pal(k));
    case "crow":
      return crowTailParts(pal(k));
    default:
      return pigeonTailParts(k);
  }
}

/** Kaki merpati/burung: paha + betis + cakar (dipakai rig kaki 2-tulang). */
function pigeonLegParts(k: Skin, seg: "thigh" | "shin" | "foot", thighLen: number, shinLen: number): Part[] {
  if (seg === "thigh") {
    return [
      { x: 0, y: 0, z: 0, w: 0.13, h: 0.13, d: 0.13, color: k.feet }, // penutup pinggul (di dalam badan)
      { x: 0, y: -thighLen / 2, z: 0, w: 0.1, h: thighLen, d: 0.1, color: k.feet },
    ];
  }
  if (seg === "shin") {
    return [
      { x: 0, y: 0, z: 0, w: 0.12, h: 0.12, d: 0.12, color: k.feet }, // sendi lutut
      { x: 0, y: -shinLen / 2, z: 0, w: 0.08, h: shinLen, d: 0.08, color: k.feet },
    ];
  }
  // Cakar: origin di TELAPAK, jari ke +x
  return [
    { x: 0, y: 0.05, z: 0, w: 0.1, h: 0.1, d: 0.1, color: k.feet },
    { x: 0.03, y: 0.025, z: 0, w: 0.26, h: 0.05, d: 0.13, color: k.feet },
    { x: 0.17, y: 0.02, z: 0.045, w: 0.07, h: 0.04, d: 0.045, color: k.feet },
    { x: 0.17, y: 0.02, z: -0.045, w: 0.07, h: 0.04, d: 0.045, color: k.feet },
    { x: 0.18, y: 0.02, z: 0, w: 0.08, h: 0.04, d: 0.04, color: k.feet },
    { x: -0.12, y: 0.02, z: 0, w: 0.06, h: 0.04, d: 0.05, color: k.feet },
  ];
}

/** Part kaki (rig kaki 2-tulang yang sama): burung = cakar, kucing = telapak kaki. */
export function charLegParts(k: Skin, seg: "thigh" | "shin" | "foot", thighLen: number, shinLen: number): Part[] {
  switch (k.kind) {
    case "cat":
      return catLegParts(pal(k), seg, thighLen, shinLen);
    case "flamingo":
      return flamingoLegParts(pal(k), seg, thighLen, shinLen);
    default:
      return pigeonLegParts(k, seg, thighLen, shinLen);
  }
}

/* ---------- Voxel model builders ---------- */

/** Hip pivot (pigeon-local, above the deck top) where the legs attach — inside the lower body. */
export const HIP_Y = 0.3;
export const LEG_Z = 0.16;

export function pigeonBodyParts(k: Skin): Part[] {
  const parts: Part[] = [
    // body
    { x: 0, y: 0.36, z: 0, w: 0.84, h: 0.32, d: 0.54, color: k.body },
    { x: -0.06, y: 0.62, z: 0, w: 0.72, h: 0.28, d: 0.6, color: k.body },
    { x: 0.4, y: 0.48, z: 0, w: 0.3, h: 0.4, d: 0.46, color: k.belly },
    // neck
    { x: 0.32, y: 0.85, z: 0, w: 0.18, h: 0.24, d: 0.34, color: k.neck1 },
    { x: 0.16, y: 0.85, z: 0, w: 0.16, h: 0.24, d: 0.34, color: k.neck2 },
  ];

  if (k.accessory === "mailbag") {
    // Tas surat selempang kulit khas kurir pos + amplop surat mengintip & cap pos merah
    // Pouch tas di samping pinggul (+z)
    parts.push({ x: -0.05, y: 0.44, z: 0.33, w: 0.44, h: 0.34, d: 0.15, color: "#874d26" });
    // Penutup tas (flap) & gesper kuningan emas
    parts.push({ x: -0.05, y: 0.57, z: 0.34, w: 0.46, h: 0.12, d: 0.16, color: "#6a3917" });
    parts.push({ x: -0.05, y: 0.50, z: 0.415, w: 0.1, h: 0.1, d: 0.04, color: "#ffd60a" });
    parts.push({ x: -0.05, y: 0.57, z: 0.42, w: 0.14, h: 0.05, d: 0.02, color: "#ffd60a" });
    // Surat / amplop putih mengintip keluar
    parts.push({ x: -0.08, y: 0.65, z: 0.33, w: 0.24, h: 0.18, d: 0.05, rz: 0.18, color: "#ffffff" });
    parts.push({ x: -0.05, y: 0.71, z: 0.358, w: 0.07, h: 0.07, d: 0.02, color: "#e63946" }); // prangko merah
    parts.push({ x: -0.11, y: 0.61, z: 0.358, w: 0.14, h: 0.03, d: 0.02, color: "#2563eb" }); // garis airmail biru
    parts.push({ x: 0.06, y: 0.63, z: 0.34, w: 0.2, h: 0.16, d: 0.04, rz: -0.15, color: "#f5f5f5" });
    // Tali selempang kulit melintang di dada
    parts.push({ x: 0.12, y: 0.65, z: 0.08, w: 0.14, h: 0.52, d: 0.62, rx: 0.38, rz: 0.25, color: "#592f13" });
  } else if (k.accessory === "hoodie") {
    // Oversized street hoodie: saku kanguru di perut, tali hoodie putih (drawstrings) & tudung di belakang
    const hoodieColor = k.hatColor ?? "#8b5cf6";
    // Saku kanguru di perut depan
    parts.push({ x: 0.38, y: 0.40, z: 0, w: 0.22, h: 0.24, d: 0.44, color: hoodieColor });
    parts.push({ x: 0.39, y: 0.45, z: 0.21, w: 0.16, h: 0.04, d: 0.05, color: "#ffffff" });
    parts.push({ x: 0.39, y: 0.45, z: -0.21, w: 0.16, h: 0.04, d: 0.05, color: "#ffffff" });
    // Tali hoodie menggantung di dada
    parts.push({ x: 0.37, y: 0.72, z: 0.08, w: 0.04, h: 0.24, d: 0.04, color: "#ffffff" });
    parts.push({ x: 0.37, y: 0.59, z: 0.08, w: 0.06, h: 0.06, d: 0.06, color: "#ffd60a" });
    parts.push({ x: 0.37, y: 0.72, z: -0.08, w: 0.04, h: 0.24, d: 0.04, color: "#ffffff" });
    parts.push({ x: 0.37, y: 0.59, z: -0.08, w: 0.06, h: 0.06, d: 0.06, color: "#ffd60a" });
    // Lipatan tudung (hood) di belakang leher
    parts.push({ x: -0.10, y: 0.78, z: 0, w: 0.38, h: 0.22, d: 0.58, color: hoodieColor });
    parts.push({ x: -0.12, y: 0.85, z: 0, w: 0.30, h: 0.12, d: 0.50, color: "#6d28d9" });
  }

  return parts;
}

/** Tail feathers. Origin at the tail root (pigeon-local TAIL_ROOT); extends toward -x. */
export const TAIL_ROOT: [number, number, number] = [-0.4, 0.55, 0];
export function pigeonTailParts(k: Skin): Part[] {
  return [
    { x: -0.12, y: -0.01, z: 0, w: 0.34, h: 0.1, d: 0.38, color: k.tail },
    { x: -0.34, y: 0.05, z: 0, w: 0.16, h: 0.1, d: 0.38, color: k.tailTip },
  ];
}

function hatParts(k: Skin): Part[] {
  const c = k.hatColor ?? "#e63946";
  const c2 = k.hatColor2 ?? "#ffffff";
  switch (k.hat) {
    case "cap":
      return [
        { x: 0, y: 0.25, z: 0, w: 0.46, h: 0.13, d: 0.44, color: c },
        { x: -0.33, y: 0.215, z: 0, w: 0.24, h: 0.05, d: 0.4, color: c },
        { x: 0, y: 0.33, z: 0, w: 0.08, h: 0.05, d: 0.08, color: "#ffffff" },
      ];
    case "mailcap":
      // Topi kurir pos resmi (peaked service cap) dengan lidah pet hitam mengkilap & lencana pos emas
      return [
        { x: 0, y: 0.25, z: 0, w: 0.48, h: 0.14, d: 0.46, color: c },
        { x: 0, y: 0.18, z: 0, w: 0.49, h: 0.04, d: 0.47, color: c2 },
        { x: 0.27, y: 0.16, z: 0, w: 0.22, h: 0.04, d: 0.42, color: "#111111" },
        { x: 0.24, y: 0.25, z: 0, w: 0.04, h: 0.09, d: 0.12, color: c2 },
      ];
    case "harajuku":
      // Beanie streetwear dengan tag neon + kacamata hitam slick (shades) dengan kilau putih
      return [
        // Beanie Harajuku
        { x: 0, y: 0.26, z: 0, w: 0.48, h: 0.18, d: 0.46, color: c },
        { x: 0, y: 0.21, z: 0, w: 0.50, h: 0.07, d: 0.48, color: "#111111" },
        { x: 0.22, y: 0.22, z: 0, w: 0.04, h: 0.05, d: 0.14, color: "#2dd4bf" },
        // Kacamata Hitam (Sunglasses) keren di depan mata
        { x: 0.21, y: 0.06, z: 0, w: 0.06, h: 0.09, d: 0.46, color: "#111111" },
        { x: 0.22, y: 0.05, z: 0.14, w: 0.05, h: 0.14, d: 0.17, color: "#15171e" },
        { x: 0.22, y: 0.05, z: -0.14, w: 0.05, h: 0.14, d: 0.17, color: "#15171e" },
        // Kilau pantulan diagonal putih pada kacamata
        { x: 0.24, y: 0.08, z: 0.14, w: 0.02, h: 0.05, d: 0.08, rz: 0.25, color: "#ffffff" },
        { x: 0.24, y: 0.08, z: -0.14, w: 0.02, h: 0.05, d: 0.08, rz: 0.25, color: "#ffffff" },
      ];
    case "beret":
      // Topi baret khas baker / pelukis Prancis
      return [
        { x: -0.05, y: 0.27, z: 0.05, w: 0.54, h: 0.12, d: 0.52, rx: 0.15, rz: -0.15, color: c },
        { x: -0.05, y: 0.35, z: 0.05, w: 0.32, h: 0.08, d: 0.32, color: c },
        { x: -0.05, y: 0.41, z: 0.05, w: 0.04, h: 0.06, d: 0.04, color: c },
      ];
    case "crown":
      return [
        { x: 0, y: 0.25, z: 0, w: 0.36, h: 0.12, d: 0.36, color: c },
        { x: 0.14, y: 0.37, z: 0.14, w: 0.08, h: 0.12, d: 0.08, color: c },
        { x: -0.14, y: 0.37, z: 0.14, w: 0.08, h: 0.12, d: 0.08, color: c },
        { x: 0.14, y: 0.37, z: -0.14, w: 0.08, h: 0.12, d: 0.08, color: c },
        { x: -0.14, y: 0.37, z: -0.14, w: 0.08, h: 0.12, d: 0.08, color: c },
        { x: 0, y: 0.4, z: 0, w: 0.08, h: 0.18, d: 0.08, color: c },
        { x: 0.19, y: 0.25, z: 0, w: 0.03, h: 0.07, d: 0.07, color: c2 },
      ];
    case "mohawk": {
      const parts: Part[] = [];
      const hs = [0.2, 0.28, 0.34, 0.28, 0.2];
      for (let i = 0; i < 5; i++) parts.push({ x: -0.16 + i * 0.08, y: 0.19 + hs[i] / 2, z: 0, w: 0.08, h: hs[i], d: 0.1, color: c });
      return parts;
    }
    case "headband":
      return [
        { x: 0, y: 0.14, z: 0, w: 0.45, h: 0.08, d: 0.43, color: c },
        { x: -0.32, y: 0.12, z: 0.06, w: 0.24, h: 0.04, d: 0.05, color: c },
        { x: -0.34, y: 0.07, z: -0.03, w: 0.28, h: 0.04, d: 0.05, color: c },
      ];
    case "beanie":
      return [
        { x: 0, y: 0.26, z: 0, w: 0.46, h: 0.16, d: 0.44, color: c },
        { x: 0, y: 0.2, z: 0, w: 0.47, h: 0.06, d: 0.45, color: c2 },
        { x: 0, y: 0.4, z: 0, w: 0.16, h: 0.16, d: 0.16, color: c2 },
      ];
    case "visor":
      return [
        { x: 0.17, y: 0.05, z: 0, w: 0.1, h: 0.15, d: 0.5, color: "#1a1d24" },
        { x: 0.225, y: 0.05, z: 0, w: 0.01, h: 0.04, d: 0.46, color: c },
      ];
    case "tophat":
      return [
        { x: 0, y: 0.42, z: 0, w: 0.32, h: 0.44, d: 0.32, color: "#1a1d24" },
        { x: 0.215, y: 0.215, z: 0, w: 0.5, h: 0.05, d: 0.48, color: "#1a1d24" },
        { x: 0, y: 0.27, z: 0, w: 0.33, h: 0.06, d: 0.33, color: c },
      ];
    default:
      return [];
  }
}

export function pigeonHeadParts(k: Skin): Part[] {
  return [
    { x: 0, y: 0, z: 0, w: 0.42, h: 0.38, d: 0.4, color: k.head },
    { x: 0.12, y: 0.06, z: 0.2, w: 0.13, h: 0.16, d: 0.06, color: "#ffffff" },
    { x: 0.12, y: 0.06, z: -0.2, w: 0.13, h: 0.16, d: 0.06, color: "#ffffff" },
    { x: 0.15, y: 0.05, z: 0.225, w: 0.07, h: 0.1, d: 0.03, color: "#111111" },
    { x: 0.15, y: 0.05, z: -0.225, w: 0.07, h: 0.1, d: 0.03, color: "#111111" },
    { x: 0.29, y: -0.04, z: 0, w: 0.2, h: 0.09, d: 0.12, color: k.beak },
    { x: 0.23, y: 0.03, z: 0, w: 0.1, h: 0.07, d: 0.14, color: k.cere },
    ...hatParts(k),
  ];
}

export function wingParts(k: Skin, side: 1 | -1): Part[] {
  const z = 0.05 * side;
  return [
    { x: 0, y: -0.15, z, w: 0.66, h: 0.32, d: 0.1, color: k.wing },
    { x: 0, y: -0.24, z, w: 0.66, h: 0.06, d: 0.11, color: k.wingTip },
    { x: -0.38, y: -0.1, z, w: 0.22, h: 0.14, d: 0.1, color: k.wingTip },
  ];
}

/** Skateboard berbentuk roti Baguette asli Prancis dengan guratan renyah & mentega */
export function baguetteDeckParts(): Part[] {
  const crust = "#c68038";
  const crustDark = "#9e5f24";
  const crustHigh = "#d99042";
  const crumb = "#fef6e2";
  const crumbWhite = "#ffffff";
  const scoreEdge = "#7a4216";

  const parts: Part[] = [
    // Baseplates penyangga trucks
    { x: 0.55, y: -0.05, z: 0, w: 0.2, h: 0.03, d: 0.3, color: "#a9afb8" },
    { x: -0.55, y: -0.05, z: 0, w: 0.2, h: 0.03, d: 0.3, color: "#a9afb8" },

    // Bodi utama roti baguette
    { x: 0, y: 0.02, z: 0, w: 1.76, h: 0.12, d: 0.54, color: crust },
    { x: 0, y: -0.02, z: 0, w: 1.72, h: 0.06, d: 0.48, color: crustDark },
    { x: 0, y: 0.08, z: 0, w: 1.68, h: 0.04, d: 0.50, color: crustHigh },

    // Ujung depan (nose) melancip khas baguette
    { x: 0.94, y: 0.02, z: 0, w: 0.18, h: 0.10, d: 0.44, color: crust },
    { x: 1.04, y: 0.01, z: 0, w: 0.14, h: 0.07, d: 0.30, color: crustDark },

    // Ujung belakang (tail) melancip khas baguette
    { x: -0.94, y: 0.02, z: 0, w: 0.18, h: 0.10, d: 0.44, color: crust },
    { x: -1.04, y: 0.01, z: 0, w: 0.14, h: 0.07, d: 0.30, color: crustDark },

    // Mentega leleh di ujung depan (butter pat)
    { x: 0.78, y: 0.11, z: 0.06, w: 0.14, h: 0.06, d: 0.14, color: "#ffe066" },
    { x: 0.78, y: 0.13, z: 0.06, w: 0.08, h: 0.03, d: 0.08, color: "#fff3b0" },
  ];

  // 5 Guratan sayatan diagonal (baker's scores) memperlihatkan remah roti putih lembut
  const slashes = [-0.6, -0.3, 0.0, 0.3, 0.6];
  for (const sx of slashes) {
    parts.push({ x: sx, y: 0.105, z: 0, w: 0.12, h: 0.025, d: 0.44, ry: 0.35, color: crumb });
    parts.push({ x: sx, y: 0.106, z: 0, w: 0.06, h: 0.027, d: 0.36, ry: 0.35, color: crumbWhite });
    parts.push({ x: sx + 0.04, y: 0.102, z: 0, w: 0.03, h: 0.022, d: 0.42, ry: 0.35, color: scoreEdge });
  }

  // Taburan tepung halus (flour dust) di atas roti
  parts.push({ x: -0.15, y: 0.102, z: 0.14, w: 0.09, h: 0.01, d: 0.09, color: "#faf5ea" });
  parts.push({ x: 0.42, y: 0.102, z: -0.14, w: 0.09, h: 0.01, d: 0.09, color: "#faf5ea" });

  return parts;
}

export function deckParts(k: Skin, deckOverride: "default" | "baguette" = "default"): Part[] {
  if (deckOverride === "baguette" || k.deckType === "baguette") {
    return baguetteDeckParts();
  }
  return [
    { x: 0, y: 0, z: 0, w: 1.7, h: 0.08, d: 0.56, color: k.deck },
    { x: 0, y: 0.05, z: 0, w: 1.6, h: 0.02, d: 0.5, color: "#2b2b2b" },
    { x: 0.9, y: 0.05, z: 0, w: 0.22, h: 0.1, d: 0.5, color: k.deck },
    { x: -0.9, y: 0.05, z: 0, w: 0.22, h: 0.1, d: 0.5, color: k.deck },
    // baseplates (fixed to the deck); the hangers + wheels are separate parts that steer
    { x: 0.55, y: -0.05, z: 0, w: 0.2, h: 0.03, d: 0.3, color: "#a9afb8" },
    { x: -0.55, y: -0.05, z: 0, w: 0.2, h: 0.03, d: 0.3, color: "#a9afb8" },
  ];
}

/** Truck hanger + axle, origin at the kingpin (under the baseplate); steers about the local y axis. */
export function truckParts(): Part[] {
  return [
    { x: 0, y: -0.03, z: 0, w: 0.12, h: 0.06, d: 0.64, color: "#c0c5cc" }, // axle/hanger
    { x: 0, y: -0.02, z: 0, w: 0.16, h: 0.08, d: 0.2, color: "#b1b7c0" }, // hanger body
    { x: 0, y: 0.0, z: 0, w: 0.05, h: 0.05, d: 0.05, color: "#8a8f98" }, // kingpin nut
  ];
}

/** Warna ban pilihan pemain: default HITAM, bisa merah/hijau/kuning/biru (atau ikut warna skin). */
export const WHEEL_HEX: Record<string, string> = {
  black: "#1c1e22",
  red: "#e63946",
  green: "#2ec46b",
  yellow: "#ffd60a",
  blue: "#2e7de6",
};

/** Wheel + bearing; axis along z. `wheelOverride` = pilihan warna ban pemain (default: hitam). */
export function wheelParts(k: Skin, deckOverride: "default" | "baguette" = "default", wheelOverride: string = "auto"): Part[] {
  const isBaguette = deckOverride === "baguette" || k.deckType === "baguette";
  const wheelColor =
    wheelOverride !== "auto" && WHEEL_HEX[wheelOverride]
      ? WHEEL_HEX[wheelOverride]
      : isBaguette
        ? "#ffe066" // Roda mentega gurih saat memakai roti baguette
        : k.wheels;
  return [
    { x: 0, y: 0, z: 0, w: 0.18, h: 0.18, d: 0.14, color: wheelColor },
    { x: 0, y: 0, z: 0, w: 0.08, h: 0.08, d: 0.16, color: "#c0c5cc" },
  ];
}



