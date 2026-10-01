import type { Part } from "./voxel";

/**
 * Model karakter NON-MERPATI (kucing oranye berdiri, flamingo, gagak).
 *
 * Semua model dibuat dengan ANCHOR yang sama seperti merpati supaya rig yang sudah ada
 * (kaki IK, sayap/lengan, ekor, kepala yang memantau jalan) langsung bisa dipakai:
 *   - origin badan   = telapak kaki di dek (y = 0), badan naik ke atas, +x = arah lari
 *   - bahu           = (0, 0.72, ±0.3)  ("sayap" bisa berarti lengan depan / sayap burung)
 *   - sendi kepala   = (0.32, 1.04, 0)  (kepala + paruh/moncong dibangun di sekitar origin ini)
 *   - pangkal ekor   = (-0.40, 0.55, 0) (lihat TAIL_ROOT di skins.ts)
 *   - pinggul        = (0, 0.30, ±0.16) (lihat HIP_Y / LEG_Z di skins.ts)
 */
export interface CharPalette {
  body: string;
  belly: string;
  head: string;
  beak: string;
  cere: string;
  wing: string;
  wingTip: string;
  tail: string;
  tailTip: string;
  feet: string;
  neck1: string;
  neck2: string;
}

/* ================================ KUCING ================================ */

/** Badan kucing oranye yang berdiri tegak: perut gempal, dada krem, garis tabby, leher pendek. */
export function catBodyParts(k: CharPalette): Part[] {
  const stripe = k.wingTip;
  return [
    // perut & punggung
    { x: 0.02, y: 0.42, z: 0, w: 0.82, h: 0.42, d: 0.64, color: k.body },
    { x: 0.0, y: 0.62, z: 0, w: 0.74, h: 0.26, d: 0.6, color: k.body },
    // dada & perut bawah krem (bulu terang)
    { x: 0.4, y: 0.44, z: 0, w: 0.18, h: 0.38, d: 0.46, color: k.belly },
    { x: 0.06, y: 0.26, z: 0, w: 0.62, h: 0.14, d: 0.56, color: k.belly },
    // garis-garis tabby di punggung & samping
    { x: -0.08, y: 0.76, z: 0, w: 0.1, h: 0.06, d: 0.58, color: stripe },
    { x: 0.12, y: 0.78, z: 0, w: 0.08, h: 0.05, d: 0.54, color: stripe },
    { x: -0.26, y: 0.62, z: 0.26, w: 0.32, h: 0.09, d: 0.05, color: stripe },
    { x: -0.26, y: 0.62, z: -0.26, w: 0.32, h: 0.09, d: 0.05, color: stripe },
    { x: -0.3, y: 0.5, z: 0.26, w: 0.2, h: 0.08, d: 0.05, color: stripe },
    { x: -0.3, y: 0.5, z: -0.26, w: 0.2, h: 0.08, d: 0.05, color: stripe },
    // leher pendek + kerah bulu menuju sendi kepala
    { x: 0.2, y: 0.82, z: 0, w: 0.34, h: 0.22, d: 0.44, color: k.body },
    { x: 0.24, y: 0.95, z: 0, w: 0.24, h: 0.18, d: 0.3, color: k.body },
    { x: 0.16, y: 0.78, z: 0, w: 0.44, h: 0.12, d: 0.5, color: k.wing },
  ];
}

/** Kepala kucing: telinga segitiga, moncong krem, hidung pink, mata besar, kumis. */
export function catHeadParts(k: CharPalette): Part[] {
  const dark = "#1f2430";
  const whisker = "#f7f3ea";
  return [
    // tengkorak + pipi + dagu
    { x: 0.0, y: 0.04, z: 0, w: 0.5, h: 0.42, d: 0.5, color: k.head },
    { x: 0.04, y: -0.12, z: 0, w: 0.44, h: 0.14, d: 0.44, color: k.head },
    // moncong & hidung
    { x: 0.27, y: -0.06, z: 0, w: 0.16, h: 0.16, d: 0.28, color: k.belly },
    { x: 0.35, y: -0.015, z: 0, w: 0.07, h: 0.07, d: 0.12, color: k.beak },
    { x: 0.33, y: -0.12, z: 0, w: 0.1, h: 0.04, d: 0.2, color: k.wingTip },
    // mata (putih + pupil) — agak ke depan biar kelihatan lucu
    { x: 0.21, y: 0.1, z: 0.15, w: 0.06, h: 0.14, d: 0.13, color: "#ffffff" },
    { x: 0.21, y: 0.1, z: -0.15, w: 0.06, h: 0.14, d: 0.13, color: "#ffffff" },
    { x: 0.25, y: 0.1, z: 0.155, w: 0.04, h: 0.11, d: 0.07, color: dark },
    { x: 0.25, y: 0.1, z: -0.155, w: 0.04, h: 0.11, d: 0.07, color: dark },
    // telinga: 3 kotak mengecil jadi segitiga + bagian dalam pink
    { x: -0.04, y: 0.29, z: 0.17, w: 0.22, h: 0.14, d: 0.2, color: k.head },
    { x: -0.04, y: 0.39, z: 0.17, w: 0.15, h: 0.1, d: 0.15, color: k.head },
    { x: -0.04, y: 0.47, z: 0.17, w: 0.08, h: 0.08, d: 0.1, color: k.head },
    { x: -0.02, y: 0.31, z: 0.19, w: 0.13, h: 0.11, d: 0.06, color: k.cere },
    { x: -0.04, y: 0.29, z: -0.17, w: 0.22, h: 0.14, d: 0.2, color: k.head },
    { x: -0.04, y: 0.39, z: -0.17, w: 0.15, h: 0.1, d: 0.15, color: k.head },
    { x: -0.04, y: 0.47, z: -0.17, w: 0.08, h: 0.08, d: 0.1, color: k.head },
    { x: -0.02, y: 0.31, z: -0.19, w: 0.13, h: 0.11, d: 0.06, color: k.cere },
    // garis dahi khas kucing oranye
    { x: 0.02, y: 0.22, z: 0, w: 0.14, h: 0.05, d: 0.34, color: k.wingTip },
    // kumis
    { x: 0.3, y: 0.0, z: 0.17, w: 0.03, h: 0.03, d: 0.24, color: whisker },
    { x: 0.3, y: -0.04, z: 0.17, w: 0.03, h: 0.03, d: 0.22, color: whisker },
    { x: 0.3, y: 0.0, z: -0.17, w: 0.03, h: 0.03, d: 0.24, color: whisker },
    { x: 0.3, y: -0.04, z: -0.17, w: 0.03, h: 0.03, d: 0.22, color: whisker },
  ];
}

/** "Sayap" kucing = lengan depan dengan telapak berjari (dipakai untuk mengayun saat mendayung). */
export function catArmParts(k: CharPalette, side: 1 | -1): Part[] {
  const s = 0.05 * side;
  return [
    { x: 0.0, y: -0.16, z: s, w: 0.22, h: 0.34, d: 0.2, color: k.body }, // lengan atas
    { x: 0.01, y: -0.36, z: s, w: 0.19, h: 0.22, d: 0.18, color: k.body }, // lengan bawah
    { x: 0.03, y: -0.53, z: s, w: 0.24, h: 0.16, d: 0.22, color: k.belly }, // telapak
    { x: 0.13, y: -0.56, z: s + 0.06, w: 0.09, h: 0.1, d: 0.07, color: k.belly }, // jari
    { x: 0.13, y: -0.56, z: s - 0.06, w: 0.09, h: 0.1, d: 0.07, color: k.belly },
    { x: 0.14, y: -0.56, z: s, w: 0.1, h: 0.09, d: 0.08, color: k.belly },
  ];
}

/** Ekor kucing panjang yang melengkung naik ke belakang, ujung putih. */
export function catTailParts(k: CharPalette): Part[] {
  return [
    { x: -0.16, y: 0.02, z: 0, w: 0.34, h: 0.16, d: 0.18, rz: -0.5, color: k.tail },
    { x: -0.4, y: 0.18, z: 0, w: 0.32, h: 0.15, d: 0.17, rz: -1.05, color: k.tail },
    { x: -0.46, y: 0.44, z: 0, w: 0.3, h: 0.14, d: 0.16, rz: -1.5, color: k.tail },
    { x: -0.38, y: 0.68, z: 0, w: 0.28, h: 0.13, d: 0.15, rz: -1.9, color: k.tail },
    { x: -0.24, y: 0.84, z: 0, w: 0.22, h: 0.13, d: 0.14, rz: -2.3, color: k.tailTip },
  ];
}

/** Paha + betis + telapak kaki kucing (rig kaki bersama tetap dipakai). */
export function catLegParts(k: CharPalette, seg: "thigh" | "shin" | "foot", thighLen: number, shinLen: number): Part[] {
  if (seg === "thigh") {
    return [
      { x: 0, y: 0, z: 0, w: 0.2, h: 0.2, d: 0.2, color: k.body },
      { x: 0, y: -thighLen / 2, z: 0, w: 0.19, h: thighLen, d: 0.2, color: k.body },
    ];
  }
  if (seg === "shin") {
    return [
      { x: 0, y: 0, z: 0, w: 0.17, h: 0.17, d: 0.17, color: k.body },
      { x: 0, y: -shinLen / 2, z: 0, w: 0.15, h: shinLen, d: 0.16, color: k.body },
    ];
  }
  // telapak: origin di SOL, jari ke +x
  return [
    { x: 0, y: 0.06, z: 0, w: 0.17, h: 0.12, d: 0.19, color: k.belly },
    { x: 0.05, y: 0.035, z: 0, w: 0.3, h: 0.07, d: 0.21, color: k.belly },
    { x: 0.17, y: 0.03, z: 0.06, w: 0.09, h: 0.06, d: 0.06, color: k.cere },
    { x: 0.17, y: 0.03, z: -0.06, w: 0.09, h: 0.06, d: 0.06, color: k.cere },
    { x: 0.2, y: 0.03, z: 0, w: 0.09, h: 0.06, d: 0.06, color: k.cere },
    { x: -0.12, y: 0.03, z: 0, w: 0.08, h: 0.06, d: 0.08, color: k.belly },
  ];
}

/* =============================== FLAMINGO =============================== */

/** Badan flamingo: badan gempal kecil + leher panjang melengkung (leher = bagian badan, bukan kepala). */
export function flamingoBodyParts(k: CharPalette): Part[] {
  const pale = k.belly;
  return [
    // badan (lebih kecil dari merpati karena lehernya yang panjang)
    { x: 0.0, y: 0.4, z: 0, w: 0.74, h: 0.3, d: 0.56, color: k.body },
    { x: -0.1, y: 0.6, z: 0, w: 0.6, h: 0.18, d: 0.5, color: k.body },
    // dada & perut lebih terang
    { x: 0.32, y: 0.4, z: 0, w: 0.16, h: 0.26, d: 0.44, color: pale },
    { x: 0.06, y: 0.27, z: 0, w: 0.5, h: 0.12, d: 0.48, color: pale },
    // bulu ekor belakang dengan ujung gelap
    { x: -0.36, y: 0.5, z: 0, w: 0.34, h: 0.24, d: 0.46, color: k.tail },
    { x: -0.56, y: 0.6, z: 0, w: 0.24, h: 0.18, d: 0.4, color: k.tailTip },
    // LEHER PANJANG: naik dari dada, sedikit S, sampai sendi kepala (0.32, 1.04)
    { x: 0.26, y: 0.66, z: 0, w: 0.19, h: 0.2, d: 0.22, color: k.body },
    { x: 0.3, y: 0.82, z: 0, w: 0.17, h: 0.18, d: 0.2, color: k.body },
    { x: 0.28, y: 0.96, z: 0, w: 0.16, h: 0.16, d: 0.19, color: k.body },
    { x: 0.3, y: 1.06, z: 0, w: 0.15, h: 0.12, d: 0.18, color: k.body },
    // gelang warna di pangkal leher
    { x: 0.27, y: 0.74, z: 0, w: 0.2, h: 0.05, d: 0.23, color: k.wingTip },
  ];
}

/** Kepala flamingo kecil + paruh panjang yang melengkung ke bawah dengan ujung hitam. */
export function flamingoHeadParts(k: CharPalette): Part[] {
  return [
    { x: 0.0, y: 0.0, z: 0, w: 0.28, h: 0.26, d: 0.28, color: k.head },
    { x: 0.11, y: -0.03, z: 0, w: 0.14, h: 0.18, d: 0.24, color: k.belly }, // muka pucat
    { x: 0.13, y: 0.08, z: 0.1, w: 0.05, h: 0.08, d: 0.06, color: "#20242c" }, // mata
    { x: 0.13, y: 0.08, z: -0.1, w: 0.05, h: 0.08, d: 0.06, color: "#20242c" },
    // paruh melengkung ke bawah: 3 segmen
    { x: 0.2, y: -0.03, z: 0, w: 0.2, h: 0.11, d: 0.13, rz: -0.22, color: k.beak },
    { x: 0.38, y: -0.11, z: 0, w: 0.18, h: 0.1, d: 0.12, rz: -0.7, color: k.beak },
    { x: 0.46, y: -0.24, z: 0, w: 0.13, h: 0.09, d: 0.11, rz: -1.1, color: "#20242c" }, // ujung hitam
    // sedikit jambul
    { x: -0.04, y: 0.16, z: 0, w: 0.16, h: 0.08, d: 0.16, color: k.wingTip },
  ];
}

/** Sayap flamingo: panel panjang ramping, ujung lebih gelap (khas flamingo). */
export function flamingoWingParts(k: CharPalette, side: 1 | -1): Part[] {
  const z = 0.05 * side;
  return [
    { x: -0.04, y: -0.16, z, w: 0.74, h: 0.3, d: 0.1, color: k.wing },
    { x: -0.1, y: -0.3, z, w: 0.66, h: 0.06, d: 0.11, color: k.wingTip },
    { x: -0.46, y: -0.1, z, w: 0.26, h: 0.16, d: 0.1, color: k.wingTip },
    { x: 0.2, y: -0.02, z, w: 0.3, h: 0.12, d: 0.09, color: k.wing },
  ];
}

/** Ekor flamingo (bulu pendek). */
export function flamingoTailParts(k: CharPalette): Part[] {
  return [
    { x: -0.12, y: -0.01, z: 0, w: 0.3, h: 0.1, d: 0.34, color: k.tail },
    { x: -0.34, y: 0.04, z: 0, w: 0.18, h: 0.1, d: 0.3, color: k.tailTip },
  ];
}

/** Kaki flamingo: sangat ramping, telapak berselaput dengan 3 jari. */
export function flamingoLegParts(k: CharPalette, seg: "thigh" | "shin" | "foot", thighLen: number, shinLen: number): Part[] {
  if (seg === "thigh") {
    return [
      { x: 0, y: 0, z: 0, w: 0.11, h: 0.11, d: 0.11, color: k.feet },
      { x: 0, y: -thighLen / 2, z: 0, w: 0.09, h: thighLen, d: 0.09, color: k.feet },
    ];
  }
  if (seg === "shin") {
    return [
      { x: 0, y: 0, z: 0, w: 0.1, h: 0.1, d: 0.1, color: k.feet },
      { x: 0, y: -shinLen / 2, z: 0, w: 0.07, h: shinLen, d: 0.07, color: k.feet },
    ];
  }
  return [
    { x: 0, y: 0.045, z: 0, w: 0.09, h: 0.09, d: 0.09, color: k.feet },
    { x: 0.03, y: 0.02, z: 0, w: 0.24, h: 0.04, d: 0.12, color: k.feet },
    { x: 0.15, y: 0.02, z: 0.05, w: 0.1, h: 0.04, d: 0.05, color: k.feet },
    { x: 0.15, y: 0.02, z: -0.05, w: 0.1, h: 0.04, d: 0.05, color: k.feet },
    { x: -0.11, y: 0.02, z: 0, w: 0.09, h: 0.04, d: 0.05, color: k.feet },
  ];
}

/* ================================= GAGAK ================================= */

/** Badan gagak hitam mengkilap: dada abu gelap, bulu tengkuk, kilau biru di punggung. */
export function crowBodyParts(k: CharPalette): Part[] {
  return [
    { x: 0.0, y: 0.38, z: 0, w: 0.8, h: 0.34, d: 0.56, color: k.body },
    { x: -0.06, y: 0.62, z: 0, w: 0.7, h: 0.28, d: 0.58, color: k.body },
    // kilau biru-ungu di punggung (ciri gagak)
    { x: -0.18, y: 0.7, z: 0.16, w: 0.44, h: 0.14, d: 0.16, color: k.tailTip },
    { x: -0.18, y: 0.7, z: -0.16, w: 0.44, h: 0.14, d: 0.16, color: k.tailTip },
    // dada abu gelap
    { x: 0.36, y: 0.42, z: 0, w: 0.22, h: 0.34, d: 0.44, color: k.belly },
    // leher + bulu tengkuk menjuntai
    { x: 0.28, y: 0.86, z: 0, w: 0.2, h: 0.24, d: 0.34, color: k.body },
    { x: 0.12, y: 0.86, z: 0, w: 0.18, h: 0.24, d: 0.34, color: k.neck1 },
    { x: -0.12, y: 0.76, z: 0, w: 0.4, h: 0.2, d: 0.5, color: k.wingTip },
    { x: -0.2, y: 0.62, z: 0, w: 0.3, h: 0.16, d: 0.42, color: k.wingTip },
  ];
}

/** Kepala gagak: paruh besar kokoh, mata pucat, bulu kepala sedikit berdiri. */
export function crowHeadParts(k: CharPalette): Part[] {
  const dark = "#111318";
  return [
    { x: -0.02, y: 0.02, z: 0, w: 0.42, h: 0.38, d: 0.44, color: k.head },
    { x: 0.02, y: 0.2, z: 0, w: 0.34, h: 0.08, d: 0.36, color: k.body }, // ubun-ubun
    // bulu kepala berdiri (3 kotak miring)
    { x: -0.14, y: 0.26, z: 0, w: 0.16, h: 0.12, d: 0.3, rz: 0.35, color: k.head },
    { x: -0.24, y: 0.3, z: 0.06, w: 0.12, h: 0.1, d: 0.12, rz: 0.5, color: k.head },
    { x: -0.24, y: 0.3, z: -0.06, w: 0.12, h: 0.1, d: 0.12, rz: 0.5, color: k.head },
    // mata pucat khas gagak
    { x: 0.16, y: 0.08, z: 0.13, w: 0.07, h: 0.12, d: 0.1, color: "#d9dee6" },
    { x: 0.16, y: 0.08, z: -0.13, w: 0.07, h: 0.12, d: 0.1, color: "#d9dee6" },
    { x: 0.2, y: 0.08, z: 0.135, w: 0.05, h: 0.09, d: 0.07, color: dark },
    { x: 0.2, y: 0.08, z: -0.135, w: 0.05, h: 0.09, d: 0.07, color: dark },
    // paruh: pangkal lebih terang, ujung runcing dan sedikit menukik
    { x: 0.26, y: -0.02, z: 0, w: 0.14, h: 0.14, d: 0.16, color: k.beak },
    { x: 0.42, y: -0.04, z: 0, w: 0.22, h: 0.1, d: 0.1, color: k.beak },
    { x: 0.58, y: -0.055, z: 0, w: 0.14, h: 0.07, d: 0.07, color: k.cere },
    { x: 0.3, y: -0.1, z: 0, w: 0.14, h: 0.05, d: 0.12, color: dark }, // garis mulut
  ];
}

/** Sayap gagak: lebih panjang dari merpati, ujung berkilau biru. */
export function crowWingParts(k: CharPalette, side: 1 | -1): Part[] {
  const z = 0.05 * side;
  return [
    { x: -0.02, y: -0.16, z, w: 0.72, h: 0.34, d: 0.1, color: k.wing },
    { x: -0.04, y: -0.28, z, w: 0.68, h: 0.06, d: 0.11, color: k.wingTip },
    { x: -0.4, y: -0.1, z, w: 0.26, h: 0.18, d: 0.1, color: k.wingTip },
    { x: 0.18, y: -0.02, z, w: 0.32, h: 0.14, d: 0.09, color: k.wing },
  ];
}

/** Ekor gagak: berbentuk baji, lebih panjang dari merpati. */
export function crowTailParts(k: CharPalette): Part[] {
  return [
    { x: -0.14, y: -0.01, z: 0, w: 0.36, h: 0.11, d: 0.42, color: k.tail },
    { x: -0.42, y: 0.05, z: 0, w: 0.24, h: 0.1, d: 0.3, color: k.tailTip },
    { x: -0.56, y: 0.06, z: 0, w: 0.12, h: 0.09, d: 0.16, color: k.tailTip },
  ];
}
