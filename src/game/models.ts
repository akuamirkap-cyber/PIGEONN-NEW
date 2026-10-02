import type { Part } from "./voxel";
import {
  type ShibuyaBuildingId,
  getShibuyaBuildingParts,
} from "./shibuyaBuildingModels";

export type { ShibuyaBuildingId };

/* ---------- Obstacles ---------- */

export const CAR_COLORS = ["#ef4b4b", "#3b82f6", "#f5b942", "#2dd4bf", "#a855f7", "#f97316", "#ffffff"];

export function coneParts(): Part[] {
  return [
    { x: 0, y: 0.04, z: 0, w: 0.7, h: 0.08, d: 0.7, color: "#e85d04" },
    { x: 0, y: 0.2, z: 0, w: 0.46, h: 0.26, d: 0.46, color: "#ff7a1a" },
    { x: 0, y: 0.36, z: 0, w: 0.4, h: 0.08, d: 0.4, color: "#ffffff" },
    { x: 0, y: 0.48, z: 0, w: 0.32, h: 0.16, d: 0.32, color: "#ff7a1a" },
    { x: 0, y: 0.6, z: 0, w: 0.22, h: 0.1, d: 0.22, color: "#ff8f3a" },
  ];
}

export function trashParts(variant: number): Part[] {
  const body = ["#5f8f6b", "#8b8f96", "#4b6fa8"][variant % 3];
  const lid = ["#41694c", "#6b6f76", "#35507a"][variant % 3];
  return [
    { x: 0, y: 0.45, z: 0, w: 0.7, h: 0.9, d: 0.7, color: body },
    { x: 0, y: 0.6, z: 0, w: 0.74, h: 0.06, d: 0.74, color: lid },
    { x: 0, y: 0.94, z: 0, w: 0.8, h: 0.1, d: 0.8, color: lid },
    { x: 0, y: 1.03, z: 0, w: 0.3, h: 0.08, d: 0.12, color: lid },
  ];
}

export function barrierParts(): Part[] {
  const parts: Part[] = [
    { x: -0.5, y: 0.3, z: -0.18, w: 0.1, h: 0.6, d: 0.1, color: "#4a4f57" },
    { x: -0.5, y: 0.3, z: 0.18, w: 0.1, h: 0.6, d: 0.1, color: "#4a4f57" },
    { x: 0.5, y: 0.3, z: -0.18, w: 0.1, h: 0.6, d: 0.1, color: "#4a4f57" },
    { x: 0.5, y: 0.3, z: 0.18, w: 0.1, h: 0.6, d: 0.1, color: "#4a4f57" },
    { x: 0, y: 0.25, z: 0, w: 1.3, h: 0.08, d: 0.1, color: "#4a4f57" },
  ];
  for (let i = 0; i < 4; i++) {
    parts.push({ x: -0.5 + 0.33 * i + 0.165, y: 0.66, z: 0, w: 0.33, h: 0.3, d: 0.16, color: i % 2 ? "#ffffff" : "#ff6a13" });
  }
  return parts;
}

export function benchParts(): Part[] {
  const wood = "#c8823a";
  const dark = "#3d4046";
  return [
    { x: 0, y: 0.5, z: 0.18, w: 2.2, h: 0.08, d: 0.16, color: wood },
    { x: 0, y: 0.5, z: 0, w: 2.2, h: 0.08, d: 0.16, color: wood },
    { x: 0, y: 0.5, z: -0.18, w: 2.2, h: 0.08, d: 0.16, color: wood },
    { x: 0, y: 0.74, z: -0.3, w: 2.2, h: 0.12, d: 0.08, color: wood },
    { x: 0, y: 0.9, z: -0.3, w: 2.2, h: 0.12, d: 0.08, color: wood },
    { x: -0.85, y: 0.25, z: 0, w: 0.1, h: 0.5, d: 0.6, color: dark },
    { x: 0.85, y: 0.25, z: 0, w: 0.1, h: 0.5, d: 0.6, color: dark },
    { x: -0.85, y: 0.7, z: -0.3, w: 0.1, h: 0.5, d: 0.08, color: dark },
    { x: 0.85, y: 0.7, z: -0.3, w: 0.1, h: 0.5, d: 0.08, color: dark },
  ];
}

export function boxesParts(): Part[] {
  return [
    { x: 0, y: 0.3, z: 0, w: 0.75, h: 0.6, d: 0.75, color: "#c68a4b" },
    { x: 0, y: 0.31, z: 0, w: 0.77, h: 0.12, d: 0.14, color: "#a86f3a" },
    { x: 0.1, y: 0.85, z: -0.05, w: 0.5, h: 0.5, d: 0.5, color: "#d9a25f" },
    { x: 0.1, y: 0.86, z: -0.05, w: 0.52, h: 0.1, d: 0.12, color: "#a86f3a" },
  ];
}

export function planterParts(): Part[] {
  const parts: Part[] = [
    { x: 0, y: 0.25, z: 0, w: 1.2, h: 0.5, d: 0.8, color: "#b8b4ad" },
    { x: 0, y: 0.52, z: 0, w: 1.1, h: 0.06, d: 0.7, color: "#5a3b28" },
  ];
  const colors = ["#ff5c8a", "#ffd166", "#ff9f43", "#ef476f", "#a78bfa"];
  for (let i = 0; i < 5; i++) {
    const x = -0.4 + i * 0.2;
    const z = (i % 2 ? 0.15 : -0.15);
    parts.push({ x, y: 0.62, z, w: 0.06, h: 0.18, d: 0.06, color: "#3f9142" });
    parts.push({ x, y: 0.75, z, w: 0.16, h: 0.14, d: 0.16, color: colors[i] });
  }
  return parts;
}

export function carParts(variant: number): Part[] {
  const v = Math.abs(variant) % 8;
  const glass = "#bfe3ff";
  const tire = "#26282d";
  const chrome = "#cbd2dc";

  // ===== 1. MOBIL POLISI (Police Patrol Car) =====
  if (v === 1) {
    return [
      // Chassis & bumper depan/belakang hitam
      { x: 0, y: 0.6, z: 0, w: 3.25, h: 0.7, d: 1.6, color: "#16181d" },
      // Kap depan putih & bagasi belakang putih (panda police livery)
      { x: 1.05, y: 0.72, z: 0, w: 1.15, h: 0.24, d: 1.52, color: "#f8fafd" },
      { x: -1.25, y: 0.72, z: 0, w: 0.7, h: 0.24, d: 1.52, color: "#f8fafd" },
      // Kabin atas putih
      { x: -0.15, y: 1.22, z: 0, w: 1.7, h: 0.55, d: 1.4, color: "#f8fafd" },
      // Kaca mobil
      { x: 0.72, y: 1.22, z: 0, w: 0.08, h: 0.4, d: 1.2, color: glass },
      { x: -1.02, y: 1.22, z: 0, w: 0.08, h: 0.4, d: 1.2, color: glass },
      { x: -0.15, y: 1.22, z: 0.72, w: 1.3, h: 0.36, d: 0.06, color: glass },
      { x: -0.15, y: 1.22, z: -0.72, w: 1.3, h: 0.36, d: 0.06, color: glass },
      // Lambang bintang emas polisi di pintu samping
      { x: -0.15, y: 0.65, z: 0.81, w: 0.32, h: 0.2, d: 0.02, color: "#ffd700" },
      { x: -0.15, y: 0.65, z: -0.81, w: 0.32, h: 0.2, d: 0.02, color: "#ffd700" },
      // Bumper push-bar / tanduk depan polisi
      { x: 1.66, y: 0.52, z: 0, w: 0.08, h: 0.36, d: 0.88, color: "#22242a" },
      // Roda
      { x: -1.0, y: 0.3, z: 0.75, w: 0.6, h: 0.6, d: 0.25, color: tire },
      { x: -1.0, y: 0.3, z: -0.75, w: 0.6, h: 0.6, d: 0.25, color: tire },
      { x: 1.0, y: 0.3, z: 0.75, w: 0.6, h: 0.6, d: 0.25, color: tire },
      { x: 1.0, y: 0.3, z: -0.75, w: 0.6, h: 0.6, d: 0.25, color: tire },
      // Lampu depan & belakang
      { x: 1.64, y: 0.65, z: 0.5, w: 0.08, h: 0.22, d: 0.3, color: "#fff7c2" },
      { x: 1.64, y: 0.65, z: -0.5, w: 0.08, h: 0.22, d: 0.3, color: "#fff7c2" },
      { x: -1.64, y: 0.65, z: 0.5, w: 0.08, h: 0.2, d: 0.28, color: "#ff3b3b" },
      { x: -1.64, y: 0.65, z: -0.5, w: 0.08, h: 0.2, d: 0.28, color: "#ff3b3b" },
      // PALANG LAMPU SIRENE POLISI DI ATAP (Strobe Bar: Merah di Kiri, Biru di Kanan)
      { x: -0.15, y: 1.52, z: 0, w: 0.2, h: 0.05, d: 0.88, color: chrome },
      { x: -0.15, y: 1.62, z: 0.26, w: 0.24, h: 0.15, d: 0.3, color: "#ff1e27", glow: true },
      { x: -0.15, y: 1.62, z: -0.26, w: 0.24, h: 0.15, d: 0.3, color: "#0066ff", glow: true },
      { x: -0.15, y: 1.6, z: 0, w: 0.18, h: 0.12, d: 0.16, color: "#3a3e47" }, // speaker sirene tengah
    ];
  }

  // ===== 2. TAXI (Taksi Kota Tokyo / Bluebird) =====
  if (v === 2) {
    const taxiPaint = "#f4c430"; // Tokyo Yellow Cab / Yellow Taxi
    return [
      { x: 0, y: 0.6, z: 0, w: 3.2, h: 0.7, d: 1.6, color: taxiPaint },
      { x: -0.15, y: 1.22, z: 0, w: 1.7, h: 0.55, d: 1.4, color: taxiPaint },
      { x: 0.72, y: 1.22, z: 0, w: 0.08, h: 0.4, d: 1.2, color: glass },
      { x: -1.02, y: 1.22, z: 0, w: 0.08, h: 0.4, d: 1.2, color: glass },
      { x: -0.15, y: 1.22, z: 0.72, w: 1.3, h: 0.36, d: 0.06, color: glass },
      { x: -0.15, y: 1.22, z: -0.72, w: 1.3, h: 0.36, d: 0.06, color: glass },
      // Garis strip samping putih & aksen kotak-kotak taxi
      { x: -0.15, y: 0.64, z: 0.81, w: 2.2, h: 0.1, d: 0.02, color: "#ffffff" },
      { x: -0.15, y: 0.64, z: -0.81, w: 2.2, h: 0.1, d: 0.02, color: "#ffffff" },
      // Roda
      { x: -1.0, y: 0.3, z: 0.75, w: 0.6, h: 0.6, d: 0.25, color: tire },
      { x: -1.0, y: 0.3, z: -0.75, w: 0.6, h: 0.6, d: 0.25, color: tire },
      { x: 1.0, y: 0.3, z: 0.75, w: 0.6, h: 0.6, d: 0.25, color: tire },
      { x: 1.0, y: 0.3, z: -0.75, w: 0.6, h: 0.6, d: 0.25, color: tire },
      // Lampu depan & belakang
      { x: 1.62, y: 0.65, z: 0.5, w: 0.08, h: 0.22, d: 0.3, color: "#fff7c2" },
      { x: 1.62, y: 0.65, z: -0.5, w: 0.08, h: 0.22, d: 0.3, color: "#fff7c2" },
      { x: -1.62, y: 0.65, z: 0.5, w: 0.08, h: 0.2, d: 0.28, color: "#ff3b3b" },
      { x: -1.62, y: 0.65, z: -0.5, w: 0.08, h: 0.2, d: 0.28, color: "#ff3b3b" },
      // MAHKOTA LAMPU ATAP TAXI (Andon Lamp: Bersinar Kuning/Putih Terang)
      { x: -0.15, y: 1.52, z: 0, w: 0.28, h: 0.05, d: 0.44, color: chrome },
      { x: -0.15, y: 1.64, z: 0, w: 0.34, h: 0.19, d: 0.52, color: "#fffbe6", glow: true },
      { x: -0.15, y: 1.64, z: 0, w: 0.36, h: 0.08, d: 0.36, color: "#e63946" }, // tulisan "TAXI" merah di tengah
    ];
  }

  // ===== 3. TRUCK (Truk Box Ekspedisi Besar / Cargo Delivery Truck) =====
  if (v === 3) {
    const cabPaint = "#1976d2"; // Kabin biru ekspedisi
    const boxPaint = "#f1f3f6"; // Box kontainer putih/silver
    return [
      // Sasis panjang bawah
      { x: -0.2, y: 0.4, z: 0, w: 3.8, h: 0.35, d: 1.65, color: "#2b2d34" },
      // Kabin depan tinggi
      { x: 1.05, y: 1.05, z: 0, w: 1.35, h: 1.05, d: 1.6, color: cabPaint },
      // Kaca depan truk lebar
      { x: 1.7, y: 1.25, z: 0, w: 0.08, h: 0.58, d: 1.35, color: glass },
      { x: 1.15, y: 1.25, z: 0.81, w: 0.85, h: 0.5, d: 0.04, color: glass },
      { x: 1.15, y: 1.25, z: -0.81, w: 0.85, h: 0.5, d: 0.04, color: glass },
      // Grille depan truk besar & bumper tebal
      { x: 1.74, y: 0.65, z: 0, w: 0.06, h: 0.42, d: 1.1, color: chrome },
      { x: 1.74, y: 0.36, z: 0, w: 0.08, h: 0.22, d: 1.62, color: "#1f2228" },
      // Spion besar truk
      { x: 1.45, y: 1.18, z: 0.9, w: 0.08, h: 0.3, d: 0.12, color: "#22242a" },
      { x: 1.45, y: 1.18, z: -0.9, w: 0.08, h: 0.3, d: 0.12, color: "#22242a" },
      // Talang angin di atap kabin (aerocap)
      { x: 0.85, y: 1.72, z: 0, w: 0.75, h: 0.3, d: 1.45, color: "#ffffff" },
      // BOX KONTAINER BELAKANG BESAR (Tinggi y = 1.4, Atap y = 2.25)
      { x: -0.75, y: 1.45, z: 0, w: 2.65, h: 1.65, d: 1.74, color: boxPaint },
      { x: -0.75, y: 2.3, z: 0, w: 2.68, h: 0.06, d: 1.78, color: "#b0b8c4" }, // bingkai atas
      // Pintu belakang box truk dengan palang kunci baja
      { x: -2.09, y: 1.45, z: 0, w: 0.04, h: 1.45, d: 1.55, color: "#d8dde4" },
      { x: -2.11, y: 1.45, z: 0.25, w: 0.02, h: 1.25, d: 0.04, color: "#5a6270" },
      { x: -2.11, y: 1.45, z: -0.25, w: 0.02, h: 1.25, d: 0.04, color: "#5a6270" },
      // Roda depan truk
      { x: 1.15, y: 0.32, z: 0.76, w: 0.64, h: 0.64, d: 0.26, color: tire },
      { x: 1.15, y: 0.32, z: -0.76, w: 0.64, h: 0.64, d: 0.26, color: tire },
      // Roda ganda belakang truk (dual rear wheels)
      { x: -0.85, y: 0.32, z: 0.76, w: 0.64, h: 0.64, d: 0.34, color: tire },
      { x: -0.85, y: 0.32, z: -0.76, w: 0.64, h: 0.64, d: 0.34, color: tire },
      { x: -1.55, y: 0.32, z: 0.76, w: 0.64, h: 0.64, d: 0.34, color: tire },
      { x: -1.55, y: 0.32, z: -0.76, w: 0.64, h: 0.64, d: 0.34, color: tire },
      // Lampu depan & belakang truk
      { x: 1.74, y: 0.65, z: 0.56, w: 0.08, h: 0.24, d: 0.3, color: "#fff7c2" },
      { x: 1.74, y: 0.65, z: -0.56, w: 0.08, h: 0.24, d: 0.3, color: "#fff7c2" },
      { x: -2.1, y: 0.45, z: 0.6, w: 0.06, h: 0.16, d: 0.25, color: "#ff2222" },
      { x: -2.1, y: 0.45, z: -0.6, w: 0.06, h: 0.16, d: 0.25, color: "#ff2222" },
    ];
  }

  // ===== 5. KEI TRUCK / PICKUP TERBUKA (Japanese Kei Truck) =====
  if (v === 5) {
    const cab = "#f4f6fa";
    return [
      { x: 0, y: 0.4, z: 0, w: 3.1, h: 0.3, d: 1.5, color: "#2b2d34" },
      // Kabin depan
      { x: 0.95, y: 0.95, z: 0, w: 1.15, h: 0.95, d: 1.48, color: cab },
      { x: 1.54, y: 1.15, z: 0, w: 0.06, h: 0.5, d: 1.25, color: glass },
      { x: 1.05, y: 1.15, z: 0.75, w: 0.65, h: 0.45, d: 0.04, color: glass },
      { x: 1.05, y: 1.15, z: -0.75, w: 0.65, h: 0.45, d: 0.04, color: glass },
      // Bak terbuka belakang dengan muatan kardus/box
      { x: -0.7, y: 0.68, z: 0, w: 2.1, h: 0.38, d: 1.54, color: cab },
      // Muatan kargo di bak (kardus & peti kayu)
      { x: -0.4, y: 0.95, z: 0.2, w: 0.7, h: 0.45, d: 0.6, color: "#c89a58" },
      { x: -0.4, y: 0.95, z: -0.25, w: 0.65, h: 0.5, d: 0.55, color: "#a67c48" },
      { x: -1.1, y: 0.9, z: 0, w: 0.75, h: 0.4, d: 1.1, color: "#3a86c8" },
      // Roda
      { x: 0.95, y: 0.28, z: 0.72, w: 0.56, h: 0.56, d: 0.22, color: tire },
      { x: 0.95, y: 0.28, z: -0.72, w: 0.56, h: 0.56, d: 0.22, color: tire },
      { x: -0.85, y: 0.28, z: 0.72, w: 0.56, h: 0.56, d: 0.22, color: tire },
      { x: -0.85, y: 0.28, z: -0.72, w: 0.56, h: 0.56, d: 0.22, color: tire },
      // Lampu
      { x: 1.54, y: 0.6, z: 0.5, w: 0.06, h: 0.2, d: 0.25, color: "#fff7c2" },
      { x: 1.54, y: 0.6, z: -0.5, w: 0.06, h: 0.2, d: 0.25, color: "#fff7c2" },
      { x: -1.56, y: 0.45, z: 0.5, w: 0.06, h: 0.16, d: 0.25, color: "#ff2222" },
      { x: -1.56, y: 0.45, z: -0.5, w: 0.06, h: 0.16, d: 0.25, color: "#ff2222" },
    ];
  }

  // ===== MOBIL SEDAN BIASA / MOBIL KOTA =====
  const color = CAR_COLORS[variant % CAR_COLORS.length];
  return [
    { x: 0, y: 0.6, z: 0, w: 3.2, h: 0.7, d: 1.6, color },
    { x: -0.15, y: 1.22, z: 0, w: 1.7, h: 0.55, d: 1.4, color },
    { x: 0.72, y: 1.22, z: 0, w: 0.08, h: 0.4, d: 1.2, color: glass },
    { x: -1.02, y: 1.22, z: 0, w: 0.08, h: 0.4, d: 1.2, color: glass },
    { x: -0.15, y: 1.22, z: 0.72, w: 1.3, h: 0.36, d: 0.06, color: glass },
    { x: -0.15, y: 1.22, z: -0.72, w: 1.3, h: 0.36, d: 0.06, color: glass },
    { x: -1.0, y: 0.3, z: 0.75, w: 0.6, h: 0.6, d: 0.25, color: tire },
    { x: -1.0, y: 0.3, z: -0.75, w: 0.6, h: 0.6, d: 0.25, color: tire },
    { x: 1.0, y: 0.3, z: 0.75, w: 0.6, h: 0.6, d: 0.25, color: tire },
    { x: 1.0, y: 0.3, z: -0.75, w: 0.6, h: 0.6, d: 0.25, color: tire },
    { x: 1.62, y: 0.65, z: 0.5, w: 0.08, h: 0.22, d: 0.3, color: "#fff7c2" },
    { x: 1.62, y: 0.65, z: -0.5, w: 0.08, h: 0.22, d: 0.3, color: "#fff7c2" },
    { x: -1.62, y: 0.65, z: 0.5, w: 0.08, h: 0.2, d: 0.28, color: "#ff3b3b" },
    { x: -1.62, y: 0.65, z: -0.5, w: 0.08, h: 0.2, d: 0.28, color: "#ff3b3b" },
  ];
}

/**
 * Motor gede + pengendaranya, hadap +x, roda menyentuh y = 0.
 * Dipakai sebagai `MoverKind = "motorcycle"` (lalu lintas dari arah depan).
 */
export function motorcycleParts(variant: number): Part[] {
  const paint = MOTOR_PAINTS[variant % MOTOR_PAINTS.length];
  const tire = "#22242a";
  const chrome = "#c3c9d2";
  const riderJacket = RIDER_JACKETS[variant % RIDER_JACKETS.length];
  const pants = RIDER_PANTS[variant % RIDER_PANTS.length];
  const boots = "#1f2430";
  const helmet = HELMET_COLORS[variant % HELMET_COLORS.length];
  // -0.04: tinggi roda diturunkan sedikit supaya ban benar-benar menapak aspal (y = 0)
  const DROP = -0.04;
  const parts: Part[] = [
    // ---- roda ----
    { x: 0.62, y: 0.26, z: 0, w: 0.4, h: 0.4, d: 0.14, color: tire },
    { x: 0.62, y: 0.26, z: 0, w: 0.16, h: 0.16, d: 0.17, color: chrome },
    { x: -0.56, y: 0.26, z: 0, w: 0.44, h: 0.44, d: 0.17, color: tire },
    { x: -0.56, y: 0.26, z: 0, w: 0.16, h: 0.16, d: 0.2, color: chrome },
    // ---- rangka & mesin ----
    { x: 0.04, y: 0.5, z: 0, w: 0.86, h: 0.24, d: 0.3, color: paint },
    { x: 0.06, y: 0.34, z: 0, w: 0.5, h: 0.2, d: 0.36, color: "#3a3d45" },
    { x: 0.3, y: 0.62, z: 0, w: 0.42, h: 0.2, d: 0.34, color: paint }, // tangki
    { x: -0.32, y: 0.66, z: 0, w: 0.44, h: 0.14, d: 0.3, color: "#1f2126" }, // jok
    { x: -0.56, y: 0.62, z: 0, w: 0.26, h: 0.16, d: 0.26, color: paint }, // buritan
    { x: -0.7, y: 0.62, z: 0, w: 0.06, h: 0.1, d: 0.16, color: "#ff3b3b" }, // lampu belakang
    // knalpot (asap keluar dari sini)
    { x: -0.42, y: 0.3, z: 0.22, w: 0.6, h: 0.1, d: 0.1, color: chrome },
    { x: -0.42, y: 0.3, z: -0.22, w: 0.6, h: 0.1, d: 0.1, color: chrome },
    // ---- garpu depan, setang, lampu ----
    { x: 0.6, y: 0.55, z: 0.11, w: 0.08, h: 0.62, d: 0.08, color: chrome },
    { x: 0.6, y: 0.55, z: -0.11, w: 0.08, h: 0.62, d: 0.08, color: chrome },
    { x: 0.56, y: 0.88, z: 0, w: 0.1, h: 0.09, d: 0.6, color: "#2c2f36" }, // setang
    { x: 0.66, y: 0.86, z: 0, w: 0.14, h: 0.16, d: 0.24, color: "#fff7c2" }, // lampu depan
    { x: 0.62, y: 1.06, z: 0.3, w: 0.06, h: 0.12, d: 0.12, color: "#2c2f36" }, // spion
    { x: 0.62, y: 1.06, z: -0.3, w: 0.06, h: 0.12, d: 0.12, color: "#2c2f36" },
    // pijakan kaki (footpeg) di sisi mesin
    { x: 0.14, y: 0.44, z: 0.25, w: 0.11, h: 0.05, d: 0.16, color: chrome },
    { x: 0.14, y: 0.44, z: -0.25, w: 0.11, h: 0.05, d: 0.16, color: chrome },
    // ================= PENGENDARA =================
    // Duduk straddle di jok: pinggul di jok (atas 0.73), paha maju, betis turun ke footpeg,
    // badan sedikit membungkuk ke depan, kedua tangan benar-benar menggenggam grip setang.
    { x: -0.28, y: 0.83, z: 0, w: 0.26, h: 0.2, d: 0.4, color: pants }, // pinggul
    { x: -0.06, y: 0.78, z: 0.2, w: 0.38, h: 0.16, d: 0.16, color: pants }, // paha kiri
    { x: -0.06, y: 0.78, z: -0.2, w: 0.38, h: 0.16, d: 0.16, color: pants }, // paha kanan
    { x: 0.12, y: 0.62, z: 0.21, w: 0.16, h: 0.26, d: 0.15, color: pants }, // betis kiri
    { x: 0.12, y: 0.62, z: -0.21, w: 0.16, h: 0.26, d: 0.15, color: pants }, // betis kanan
    { x: 0.16, y: 0.5, z: 0.23, w: 0.24, h: 0.11, d: 0.16, color: boots }, // sepatu kiri di footpeg
    { x: 0.16, y: 0.5, z: -0.23, w: 0.24, h: 0.11, d: 0.16, color: boots }, // sepatu kanan
    // badan (jaket) dengan punggung condong ke depan
    { x: -0.3, y: 0.97, z: 0, w: 0.3, h: 0.24, d: 0.42, color: riderJacket }, // perut
    { x: -0.22, y: 1.17, z: 0, w: 0.32, h: 0.22, d: 0.44, color: riderJacket }, // dada
    { x: -0.18, y: 1.29, z: 0, w: 0.3, h: 0.1, d: 0.46, color: riderJacket }, // bahu
    { x: -0.22, y: 1.06, z: 0, w: 0.13, h: 0.36, d: 0.47, color: paint }, // strip resleting senada motor
    { x: -0.22, y: 1.28, z: 0, w: 0.14, h: 0.07, d: 0.44, color: "#f1f3f6" }, // kerah putih
    // lengan dua segmen dari bahu ke grip setang (siku membengkok, tangan pas di grip)
    { x: 0.0, y: 1.2, z: 0.21, w: 0.38, h: 0.14, d: 0.14, rz: -0.36, color: riderJacket }, // lengan atas
    { x: 0.0, y: 1.2, z: -0.21, w: 0.38, h: 0.14, d: 0.14, rz: -0.36, color: riderJacket },
    { x: 0.33, y: 1.0, z: 0.26, w: 0.42, h: 0.13, d: 0.13, rz: -0.58, color: riderJacket }, // lengan bawah
    { x: 0.33, y: 1.0, z: -0.26, w: 0.42, h: 0.13, d: 0.13, rz: -0.58, color: riderJacket },
    { x: 0.52, y: 0.87, z: 0.29, w: 0.18, h: 0.17, d: 0.15, color: "#2b2f38" }, // sarung tangan menggenggam grip (+z)
    { x: 0.52, y: 0.87, z: -0.29, w: 0.18, h: 0.17, d: 0.15, color: "#2b2f38" }, // sarung tangan menggenggam grip (-z)
    // tas punggung kecil
    { x: -0.46, y: 1.06, z: 0, w: 0.2, h: 0.34, d: 0.34, color: "#3f434c" },
    { x: -0.55, y: 1.1, z: 0, w: 0.06, h: 0.16, d: 0.24, color: "#2b2f38" },
    // ---- helm bulat dengan kaca depan (visor) ----
    { x: -0.12, y: 1.34, z: 0, w: 0.15, h: 0.12, d: 0.15, color: "#e0b48f" }, // leher
    { x: -0.1, y: 1.44, z: 0, w: 0.3, h: 0.17, d: 0.32, color: helmet }, // tempurung bawah
    { x: -0.1, y: 1.555, z: 0, w: 0.25, h: 0.09, d: 0.28, color: helmet }, // tempurung atas (membulat)
    { x: -0.1, y: 1.62, z: 0, w: 0.17, h: 0.045, d: 0.2, color: helmet }, // puncak helm
    { x: -0.1, y: 1.36, z: 0, w: 0.32, h: 0.08, d: 0.34, color: helmet }, // dasar helm menutup tengkuk
    { x: -0.1, y: 1.52, z: 0.175, w: 0.24, h: 0.16, d: 0.05, color: helmet }, // pelipis kiri
    { x: -0.1, y: 1.52, z: -0.175, w: 0.24, h: 0.16, d: 0.05, color: helmet },
    { x: 0.06, y: 1.47, z: 0, w: 0.1, h: 0.13, d: 0.29, color: "#20242c" }, // kaca helm (gelap)
    { x: 0.05, y: 1.55, z: 0, w: 0.13, h: 0.05, d: 0.32, color: helmet }, // bibir atas kaca
    { x: 0.04, y: 1.375, z: 0, w: 0.2, h: 0.09, d: 0.28, color: helmet }, // dagu (chin bar)
    { x: -0.1, y: 1.6, z: 0, w: 0.22, h: 0.06, d: 0.33, color: paint }, // strip senada motor
    { x: -0.27, y: 1.46, z: 0, w: 0.1, h: 0.12, d: 0.22, color: paint }, // spoiler belakang
  ];
  return parts.map((p) => ({ ...p, y: p.y + DROP }));
}

/** Warna bodi motor, jaket pengendara, dan helm (satu set per varian). */
export const MOTOR_PAINTS = ["#e63946", "#2ec4b6", "#3d5a80", "#ffd60a", "#c77dff", "#f77f00"];
const RIDER_JACKETS = ["#1f2430", "#3a3d45", "#5c4b3a", "#2b2f38", "#6b3f3f", "#2f4f4f"];
/** Warna celana pengendara (denim gelap .. krem) supaya tiap varian kelihatan beda. */
const RIDER_PANTS = ["#2f3440", "#4a4238", "#33415c", "#3d3a44", "#514a3d", "#2a3b3b"];
const HELMET_COLORS = ["#f1faee", "#ffd60a", "#e63946", "#2ec4b6", "#dfe4ea", "#ff9f1c"];

export function rampParts(): Part[] {
  const parts: Part[] = [];
  const steps = 8;
  const len = 2.4;
  const height = 1.0;
  for (let i = 1; i <= steps; i++) {
    const h = (height * i) / steps;
    parts.push({
      x: -len / 2 + (len / steps) * (i - 0.5),
      y: h / 2,
      z: 0,
      w: len / steps + 0.01,
      h,
      d: 1.7,
      color: i % 2 ? "#d9b47a" : "#c9a36b",
    });
  }
  // side rails
  parts.push({ x: 0.9, y: 0.4, z: 0.88, w: 0.6, h: 0.8, d: 0.08, color: "#8a6a3f" });
  parts.push({ x: 0.9, y: 0.4, z: -0.88, w: 0.6, h: 0.8, d: 0.08, color: "#8a6a3f" });
  return parts;
}

/**
 * Grind rail of arbitrary length. variant 0 = flat round rail on posts; variant 1 = "kinked" rail: the first
 * 40% sits 0.55 higher, then a sloped section brings it down to the standard height (a classic skatepark down-rail).
 * Top of the rail is at RAIL_H (0.6) — the extra height of the kink matches engine.railHeightAt.
 */
export function railParts(length = 7, variant = 0): Part[] {
  const parts: Part[] = [];
  const steel = "#dfe3e8";
  const post = "#8d949c";
  const base = "#6e747c";
  const half = length / 2;
  const topY = 0.55;
  const extra = variant === 1 ? 0.4 : 0;
  const kinkA = -half + length * 0.4; // end of the high section
  const kinkB = -half + length * 0.6; // start of the low section
  if (variant === 1) {
    // high section
    parts.push({ x: (-half + kinkA) / 2, y: topY + extra, z: 0, w: kinkA + half, h: 0.14, d: 0.14, color: steel });
    // sloped section
    const sl = kinkB - kinkA;
    const ang = Math.atan2(extra, sl);
    parts.push({ x: (kinkA + kinkB) / 2, y: topY + extra / 2, z: 0, w: Math.hypot(sl, extra) + 0.1, h: 0.14, d: 0.14, rz: -ang, color: steel });
    // low section
    parts.push({ x: (kinkB + half) / 2, y: topY, z: 0, w: half - kinkB, h: 0.14, d: 0.14, color: steel });
  } else {
    parts.push({ x: 0, y: topY, z: 0, w: length, h: 0.14, d: 0.14, color: steel });
  }
  // end caps
  parts.push({ x: -half + 0.05, y: topY + (variant === 1 ? extra : 0), z: 0, w: 0.1, h: 0.2, d: 0.2, color: "#b8bec7" });
  parts.push({ x: half - 0.05, y: topY, z: 0, w: 0.1, h: 0.2, d: 0.2, color: "#b8bec7" });
  // posts every ~1.5 units, following the rail height
  const n = Math.max(2, Math.round(length / 1.5) + 1);
  for (let i = 0; i < n; i++) {
    const x = -half + 0.4 + (i * (length - 0.8)) / (n - 1);
    let h = topY;
    if (variant === 1) h = x < kinkA ? topY + extra : x < kinkB ? topY + (extra * (kinkB - x)) / (kinkB - kinkA) : topY;
    parts.push({ x, y: h / 2 - 0.02, z: 0, w: 0.12, h: h - 0.04, d: 0.12, color: post });
    parts.push({ x, y: 0.03, z: 0, w: 0.3, h: 0.06, d: 0.3, color: base });
  }
  // long rails get a couple of yellow safety tape wraps so their length reads from afar
  if (length >= 12) for (let x = -half + 3; x < half - 1; x += 6) parts.push({ x, y: topY, z: 0, w: 0.3, h: 0.16, d: 0.16, color: "#ffd21f" });
  return parts;
}

/* ---------- Collectible ---------- */

/** Cute toast slice: rounded crust, a knob of butter, and a happy face. Faces +z. */
export function breadParts(): Part[] {
  // Roti tawar bersih tanpa z-fighting:
  // - potongan crust boleh saling tumpang tindih (warna sama = aman)
  // - crumb dibuat SATU lapisan tembus depan-belakang yang menonjol 0.015 dari crust,
  //   jadi tidak ada dua permukaan beda warna yang koplanar (sumber "permukaan rusak")
  const crust = "#c98a4b";
  const crumb = "#f6dfae";
  const crumb2 = "#f9e8c3";
  return [
    // crust (satu warna, aman saling menimpa)
    { x: 0, y: 0.34, z: 0, w: 0.62, h: 0.56, d: 0.22, color: crust },
    { x: 0, y: 0.68, z: 0, w: 0.5, h: 0.14, d: 0.22, color: crust },
    { x: -0.2, y: 0.64, z: 0, w: 0.22, h: 0.18, d: 0.22, color: crust },
    { x: 0.2, y: 0.64, z: 0, w: 0.22, h: 0.18, d: 0.22, color: crust },
    { x: 0, y: 0.07, z: 0, w: 0.5, h: 0.08, d: 0.22, color: crust },
    // crumb: menonjol jelas di depan & belakang (d 0.25 > crust 0.22)
    { x: 0, y: 0.36, z: 0, w: 0.48, h: 0.44, d: 0.25, color: crumb },
    { x: 0, y: 0.62, z: 0, w: 0.36, h: 0.12, d: 0.25, color: crumb },
    { x: -0.16, y: 0.58, z: 0, w: 0.14, h: 0.12, d: 0.25, color: crumb },
    { x: 0.16, y: 0.58, z: 0, w: 0.14, h: 0.12, d: 0.25, color: crumb },
    // garis crumb terang, menonjol lagi 0.01 dari crumb utama
    { x: 0, y: 0.15, z: 0, w: 0.38, h: 0.06, d: 0.26, color: crumb2 },
    // mentega menempel di muka depan
    { x: 0.03, y: 0.55, z: 0.14, w: 0.2, h: 0.12, d: 0.07, color: "#ffe066" },
    { x: 0.05, y: 0.585, z: 0.165, w: 0.1, h: 0.06, d: 0.05, color: "#fff3b0" },
  ];
}

/* ---------- Decorations ---------- */

export const BUILDING_COLORS = ["#ff795e", "#ffd23f", "#31d391", "#5aaaff", "#ff72b7", "#ff9f43", "#7bd7ff", "#fff0bf", "#c6a6ff"];

export interface BuildingSpec {
  w: number;
  floors: number;
  color: string;
  roof: string;
  awning: boolean;
  awningColor: string;
  lit: number;
  cols: number;
  /** Shibuya Night styling: dark glass facade, almost every window lit in neon hues, rooftop neon trim. */
  night?: boolean;
  /** accent neon hue used for trims / vertical sign when night */
  neon?: string;
  /** zakkyo-biru: how many stacked company signboards climb the facade (0 = none) */
  signStack?: number;
  /** big glowing video screen across the mid floors */
  screen?: boolean;
  /** glowing advertising panel on stilts above the roof */
  roofBillboard?: boolean;
  /** tiered setback top for a distinctive Tokyo silhouette */
  tiered?: boolean;
  /** Shibuya architectural archetype: 0=Stepped Terraces, 1=Cantilever Arcade, 2=Twin Split Bay, 3=Corner Chamfer/Spire, 4=Zakkyo Balcony */
  shibuyaType?: 0 | 1 | 2 | 3 | 4;
  accentColor?: string;
  spandrelColor?: string;
  shibuyaAssetId?: ShibuyaBuildingId;
}

/** Neon hues used across the Shibuya night city (signs, windows, billboards). */
/** Warna sign malam yang realistis ala Jepang: putih hangat, kuning, merah,
 *  oranye, hijau sign, biru sign — TANPA magenta/cyan/ungu cyberpunk. */
export const NEON_COLORS = ["#ffd23f", "#ff4438", "#ff8a3d", "#fff3c4", "#ffe93b", "#58c96b", "#4d9fff", "#ffb84d"];

/** Lightbox colours of real Japanese company signboards (izakaya, karaoke, clinics, pachinko…). */
export const SIGN_COLORS = ["#ffffff", "#ffd23f", "#ff5a5f", "#37c86b", "#2f9bff", "#ff8a3d", "#e8485a", "#3bbfae", "#fff3c4"];

/** Night facades: real Shibuya mix — white/cream tile, warm beige, light concrete grey,
 *  tan brick — plus only a few dark glass towers so the street never reads "cyberpunk". */
const NIGHT_FACADES = [
  "#e7e2d6", // white ceramic tile (paling umum di Jepang)
  "#eceff2", // putih porselen
  "#ded6c4", // krem hangat
  "#cfd2d6", // beton abu terang
  "#c9bda4", // tan / beige
  "#b8bec8", // abu kebiruan terang
  "#c4b49a", // beige tua
  "#9aa4b0", // abu medium terang
  "#9c8674", // bata cokelat muda
  "#3a4051", // dark glass
];

const ACCENT_FACADES = [
  "#282e3c", // dark graphite steel
  "#384252", // charcoal architectural metal
  "#4d3f35", // bronze copper cladding
  "#2c3644", // deep slate
  "#e4ded0", // warm sandstone
  "#d0d8e2", // silver anodized aluminium
];

export function makeShibuyaTowerSpec(w: number, floorCount?: number, assetId?: ShibuyaBuildingId): BuildingSpec {
  const neon = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
  const floors = floorCount ?? (7 + Math.floor(Math.random() * 5)); // 7..11 floors: a proper grand Tokyo canyon
  const shibuyaType = Math.floor(Math.random() * 5) as 0 | 1 | 2 | 3 | 4;
  const primaryColor = NIGHT_FACADES[Math.floor(Math.random() * NIGHT_FACADES.length)];
  const accentColor = ACCENT_FACADES[Math.floor(Math.random() * ACCENT_FACADES.length)];
  return {
    w,
    floors,
    color: primaryColor,
    roof: "#3b4250",
    awning: false,
    awningColor: neon,
    lit: 0.75 + Math.random() * 0.25,
    cols: Math.max(3, Math.floor(w / 1.8)),
    night: true,
    neon,
    signStack: Math.random() < 0.85 ? 3 + Math.floor(Math.random() * (floors - 2)) : 0,
    screen: Math.random() < 0.35,
    roofBillboard: Math.random() < 0.5,
    tiered: floors >= 7 && Math.random() < 0.55,
    shibuyaType,
    accentColor,
    spandrelColor: "#262c3a",
    shibuyaAssetId: assetId,
  };
}

export function makeBuildingSpec(w: number): BuildingSpec {
  const color = BUILDING_COLORS[Math.floor(Math.random() * BUILDING_COLORS.length)];
  return {
    w,
    floors: 3 + Math.floor(Math.random() * 4), // 3..6 floors
    color,
    roof: "#5d6570",
    awning: Math.random() < 0.55,
    awningColor: Math.random() < 0.5 ? "#ff3b50" : "#10c8a8",
    lit: Math.random(),
    cols: Math.max(2, Math.floor(w / 1.8)),
  };
}

/**
 * High-detail Shibuya Commercial Tower generator.
 * Produces 5 distinct architectural archetypes with crisp geometric volumes,
 * rich physical facade depth, recessed window bays, and authentic Tokyo silhouettes.
 */
function shibuyaTowerParts(s: BuildingSpec): Part[] {
  const mapping: Record<number, ShibuyaBuildingId> = {
    0: "qfront",
    1: "neon",
    2: "skyscraper",
    3: "shibuya109",
    4: "station",
    5: "ramen",
    6: "izakaya",
    7: "konbini",
    8: "tokyotower",
    9: "machiya",
    10: "townhouse",
    11: "pagoda",
  };
  const bldId: ShibuyaBuildingId = s.shibuyaAssetId || mapping[(s.shibuyaType ?? 0) % 12] || "skyscraper";
  return getShibuyaBuildingParts(bldId);
}

/** Building whose front face is at z = 0 and extends toward -z. */
export function buildingParts(s: BuildingSpec): Part[] {
  if (s.shibuyaAssetId) {
    return getShibuyaBuildingParts(s.shibuyaAssetId);
  }
  if (s.night) {
    return shibuyaTowerParts(s);
  }

  const depth = 5.8;
  const floorH = 1.95;
  const h = s.floors * floorH + 0.8;
  const parts: Part[] = [
    { x: 0, y: h / 2, z: -depth / 2, w: s.w, h, d: depth, color: s.color },
    { x: 0, y: h + 0.15, z: -depth / 2, w: s.w + 0.3, h: 0.3, d: depth + 0.3, color: s.roof },
    // deep foundation so buildings never float on sloped ground (clean light granite)
    { x: 0, y: -1.2, z: -depth / 2, w: s.w + 0.2, h: 2.8, d: depth + 0.2, color: "#a2acb8" },
  ];
  const winW = 0.85;
  const spacing = s.w / s.cols;

  for (let f = 0; f < s.floors; f++) {
    for (let c = 0; c < s.cols; c++) {
      const x = -s.w / 2 + spacing * (c + 0.5);
      if (f === 0 && c === Math.floor(s.cols / 2)) {
        // Ground floor entrance: warm timber door & golden handle
        parts.push({ x, y: 1.25, z: 0.05, w: 1.2, h: 1.8, d: 0.14, color: "#7c4a28" });
        parts.push({ x: x + 0.35, y: 1.25, z: 0.13, w: 0.14, h: 0.14, d: 0.08, color: "#f5c542" });
        continue;
      }
      const lit = ((f * 7 + c * 3) % 10) / 10 < s.lit * 0.5;
      // Window pane: warm inviting interior glow or serene sky reflection (never black!)
      parts.push({ x, y: 0.7 + f * floorH + 0.95, z: 0.05, w: winW, h: 0.95, d: 0.14, color: lit ? "#fff8e8" : "#c2d6e8", glow: lit });
      // Clean white architectural sill & trim
      parts.push({ x, y: 0.7 + f * floorH + 0.45, z: 0.1, w: winW + 0.15, h: 0.1, d: 0.22, color: "#ffffff" });
    }
  }
  if (s.awning) {
    for (let i = 0; i < Math.floor(s.w / 0.6); i++) {
      parts.push({
        x: -s.w / 2 + 0.3 + i * 0.6,
        y: 2.3,
        z: 0.55,
        w: 0.6,
        h: 0.12,
        d: 1.15,
        color: i % 2 ? "#ffffff" : s.awningColor,
      });
    }
  }
  // rooftop details (clean light equipment, no black)
  parts.push({ x: -s.w / 4, y: h + 0.65, z: -depth / 2, w: 0.95, h: 0.65, d: 0.95, color: "#a8b2be" });
  if (s.floors > 3) parts.push({ x: s.w / 4, y: h + 1.05, z: -depth / 2 - 0.6, w: 0.2, h: 1.6, d: 0.2, color: "#8a94a2" });
  return parts;
}

export function treeParts(variant: number): Part[] {
  const trunk = "#8b5a2b";
  if (variant === 1) {
    // pine
    return [
      { x: 0, y: 0.4, z: 0, w: 0.3, h: 0.8, d: 0.3, color: trunk },
      { x: 0, y: 1.0, z: 0, w: 1.5, h: 0.6, d: 1.5, color: "#2f855a" },
      { x: 0, y: 1.55, z: 0, w: 1.1, h: 0.55, d: 1.1, color: "#38a169" },
      { x: 0, y: 2.05, z: 0, w: 0.7, h: 0.5, d: 0.7, color: "#48bb78" },
      { x: 0, y: 2.45, z: 0, w: 0.35, h: 0.35, d: 0.35, color: "#68d391" },
    ];
  }
  if (variant === 2) {
    // round
    return [
      { x: 0, y: 0.5, z: 0, w: 0.3, h: 1.0, d: 0.3, color: trunk },
      { x: 0, y: 1.5, z: 0, w: 1.4, h: 1.1, d: 1.4, color: "#22c55e" },
      { x: 0, y: 2.25, z: 0, w: 0.9, h: 0.5, d: 0.9, color: "#34d399" },
      { x: 0.35, y: 1.3, z: 0.4, w: 0.7, h: 0.6, d: 0.7, color: "#16a34a" },
    ];
  }
  return [
    { x: 0, y: 0.45, z: 0, w: 0.3, h: 0.9, d: 0.3, color: trunk },
    { x: 0, y: 1.25, z: 0, w: 1.5, h: 0.8, d: 1.5, color: "#22c55e" },
    { x: 0, y: 1.9, z: 0, w: 1.05, h: 0.6, d: 1.05, color: "#34d399" },
    { x: 0, y: 2.35, z: 0, w: 0.55, h: 0.4, d: 0.55, color: "#4ade80" },
  ];
}

export function lampParts(): Part[] {
  return [
    { x: 0, y: 0.1, z: 0, w: 0.4, h: 0.2, d: 0.4, color: "#3f444c" },
    { x: 0, y: 1.7, z: 0, w: 0.16, h: 3.2, d: 0.16, color: "#4a4f57" },
    { x: 0, y: 3.3, z: 0.4, w: 0.14, h: 0.14, d: 0.9, color: "#4a4f57" },
    { x: 0, y: 3.15, z: 0.85, w: 0.4, h: 0.22, d: 0.4, color: "#fff2b0", glow: true },
    { x: 0, y: 3.3, z: 0.85, w: 0.46, h: 0.1, d: 0.46, color: "#4a4f57" },
  ];
}

export function hydrantParts(): Part[] {
  const red = "#e63946";
  return [
    { x: 0, y: 0.32, z: 0, w: 0.32, h: 0.64, d: 0.32, color: red },
    { x: 0, y: 0.7, z: 0, w: 0.24, h: 0.12, d: 0.24, color: red },
    { x: 0, y: 0.4, z: 0, w: 0.56, h: 0.14, d: 0.16, color: red },
    { x: 0, y: 0.05, z: 0, w: 0.4, h: 0.1, d: 0.4, color: "#9b2226" },
  ];
}

export function bushParts(variant: number): Part[] {
  const g1 = variant ? "#5cb85c" : "#4caf50";
  const g2 = variant ? "#7bd07b" : "#66bb6a";
  return [
    { x: 0, y: 0.28, z: 0, w: 0.9, h: 0.56, d: 0.8, color: g1 },
    { x: 0.2, y: 0.55, z: 0.1, w: 0.5, h: 0.35, d: 0.5, color: g2 },
    { x: -0.3, y: 0.5, z: -0.1, w: 0.4, h: 0.3, d: 0.4, color: g2 },
  ];
}

export function flowersParts(variant: number): Part[] {
  const colors = [
    ["#ff5c8a", "#ffd166", "#ffffff"],
    ["#a78bfa", "#ff9f43", "#ff5c8a"],
  ][variant % 2];
  const parts: Part[] = [];
  for (let i = 0; i < 3; i++) {
    const x = -0.3 + i * 0.3;
    const z = i % 2 ? 0.15 : -0.1;
    parts.push({ x, y: 0.12, z, w: 0.06, h: 0.24, d: 0.06, color: "#3f9142" });
    parts.push({ x, y: 0.27, z, w: 0.18, h: 0.12, d: 0.18, color: colors[i] });
  }
  return parts;
}

/* ---------- Critters & signs ---------- */

export const CHUNK_LEN = 12;

/** Crossy Road style chicken, facing +x, feet at y = 0. */
export function chickenParts(): Part[] {
  const white = "#f7f7f7";
  const red = "#e63946";
  const orange = "#f77f00";
  return [
    { x: 0, y: 0.5, z: 0, w: 0.72, h: 0.5, d: 0.56, color: white },
    { x: 0.28, y: 0.9, z: 0, w: 0.38, h: 0.44, d: 0.42, color: white },
    { x: 0.27, y: 1.18, z: 0, w: 0.2, h: 0.14, d: 0.14, color: red },
    { x: 0.15, y: 1.15, z: 0, w: 0.1, h: 0.1, d: 0.14, color: red },
    { x: 0.52, y: 0.9, z: 0, w: 0.14, h: 0.1, d: 0.14, color: orange },
    { x: 0.49, y: 0.77, z: 0, w: 0.08, h: 0.12, d: 0.1, color: red },
    { x: 0.37, y: 0.97, z: 0.21, w: 0.08, h: 0.1, d: 0.03, color: "#111111" },
    { x: 0.37, y: 0.97, z: -0.21, w: 0.08, h: 0.1, d: 0.03, color: "#111111" },
    { x: -0.05, y: 0.5, z: 0.3, w: 0.46, h: 0.3, d: 0.06, color: "#dcdcdc" },
    { x: -0.05, y: 0.5, z: -0.3, w: 0.46, h: 0.3, d: 0.06, color: "#dcdcdc" },
    { x: -0.42, y: 0.7, z: 0, w: 0.18, h: 0.28, d: 0.3, color: white },
    { x: -0.5, y: 0.88, z: 0, w: 0.1, h: 0.14, d: 0.2, color: "#dcdcdc" },
    { x: 0.05, y: 0.15, z: 0.12, w: 0.06, h: 0.3, d: 0.06, color: orange },
    { x: 0.05, y: 0.15, z: -0.12, w: 0.06, h: 0.3, d: 0.06, color: orange },
    { x: 0.1, y: 0.02, z: 0.12, w: 0.22, h: 0.04, d: 0.12, color: orange },
    { x: 0.1, y: 0.02, z: -0.12, w: 0.22, h: 0.04, d: 0.12, color: orange },
  ];
}

/** Anjing penyeberang jalan: Anjing kecil (Shiba Inu / Corgi) vs Anjing besar (Golden Retriever / German Shepherd), hadap +x. */
export function dogParts(variant = 0, big = false): Part[] {
  if (big) {
    // ===== ANJING BESAR (Golden Retriever / German Shepherd) =====
    const isShepherd = variant % 2 === 1;
    const bodyColor = isShepherd ? "#262322" : "#d99738";
    const accentColor = isShepherd ? "#c07832" : "#fbe8c4";
    const collar = isShepherd ? "#d90429" : "#1d3557";
    return [
      // Badan atletis besar
      { x: 0, y: 0.58, z: 0, w: 1.15, h: 0.54, d: 0.54, color: bodyColor },
      // Dada depan gagah
      { x: 0.35, y: 0.62, z: 0, w: 0.45, h: 0.48, d: 0.52, color: accentColor },
      // Leher & Kepala
      { x: 0.48, y: 0.88, z: 0, w: 0.42, h: 0.46, d: 0.42, color: bodyColor },
      // Moncong hidung panjang khas anjing besar
      { x: 0.72, y: 0.82, z: 0, w: 0.34, h: 0.24, d: 0.28, color: isShepherd ? "#1b1918" : accentColor },
      { x: 0.88, y: 0.89, z: 0, w: 0.08, h: 0.1, d: 0.12, color: "#111111" },
      { x: 0.74, y: 0.72, z: 0, w: 0.18, h: 0.08, d: 0.16, color: "#ff758f" },
      // Mata ekspresif
      { x: 0.62, y: 0.96, z: 0.16, w: 0.06, h: 0.08, d: 0.05, color: "#111111" },
      { x: 0.62, y: 0.96, z: -0.16, w: 0.06, h: 0.08, d: 0.05, color: "#111111" },
      // Telinga
      ...(isShepherd
        ? [
            { x: 0.44, y: 1.18, z: 0.17, w: 0.12, h: 0.26, d: 0.12, color: "#1b1918" },
            { x: 0.44, y: 1.18, z: -0.17, w: 0.12, h: 0.26, d: 0.12, color: "#1b1918" },
          ]
        : [
            { x: 0.42, y: 0.88, z: 0.24, w: 0.16, h: 0.32, d: 0.1, color: "#be8127" },
            { x: 0.42, y: 0.88, z: -0.24, w: 0.16, h: 0.32, d: 0.1, color: "#be8127" },
          ]),
      // Kalung leher anjing + bandul medali emas
      { x: 0.42, y: 0.74, z: 0, w: 0.14, h: 0.38, d: 0.54, color: collar },
      { x: 0.48, y: 0.62, z: 0, w: 0.06, h: 0.08, d: 0.08, color: "#ffd700" },
      // Ekor lebat mengibas
      { x: -0.62, y: 0.72, z: 0.06, w: 0.36, h: 0.16, d: 0.16, color: bodyColor },
      { x: -0.86, y: 0.86, z: 0.12, w: 0.32, h: 0.14, d: 0.14, color: accentColor },
      // Kaki depan
      { x: 0.34, y: 0.22, z: 0.18, w: 0.18, h: 0.44, d: 0.18, color: accentColor },
      { x: 0.34, y: 0.22, z: -0.18, w: 0.18, h: 0.44, d: 0.18, color: accentColor },
      // Kaki belakang
      { x: -0.38, y: 0.22, z: 0.18, w: 0.22, h: 0.44, d: 0.2, color: bodyColor },
      { x: -0.38, y: 0.22, z: -0.18, w: 0.22, h: 0.44, d: 0.2, color: bodyColor },
      // Tapak kaki
      { x: 0.37, y: 0.04, z: 0.18, w: 0.22, h: 0.08, d: 0.19, color: accentColor },
      { x: 0.37, y: 0.04, z: -0.18, w: 0.22, h: 0.08, d: 0.19, color: accentColor },
      { x: -0.35, y: 0.04, z: 0.18, w: 0.22, h: 0.08, d: 0.19, color: accentColor },
      { x: -0.35, y: 0.04, z: -0.18, w: 0.22, h: 0.08, d: 0.19, color: accentColor },
    ];
  }

  // ===== ANJING KECIL (Cute Shiba Inu / Corgi) =====
  const coat = variant % 2 === 0 ? "#cf863a" : "#24252a";
  const white = "#fff4e5";
  return [
    // Badan gemuk imut
    { x: 0, y: 0.36, z: 0, w: 0.72, h: 0.36, d: 0.42, color: coat },
    // Dada & perut putih
    { x: 0.16, y: 0.34, z: 0, w: 0.44, h: 0.3, d: 0.44, color: white },
    // Kepala bulat imut
    { x: 0.36, y: 0.54, z: 0, w: 0.36, h: 0.34, d: 0.36, color: coat },
    // Moncong pipi putih
    { x: 0.51, y: 0.48, z: 0, w: 0.18, h: 0.18, d: 0.24, color: white },
    { x: 0.61, y: 0.54, z: 0, w: 0.06, h: 0.07, d: 0.08, color: "#18191c" },
    { x: 0.53, y: 0.41, z: 0, w: 0.12, h: 0.06, d: 0.1, color: "#ff758f" },
    // Alis putih khas Shiba
    { x: 0.52, y: 0.65, z: 0.1, w: 0.04, h: 0.06, d: 0.08, color: white },
    { x: 0.52, y: 0.65, z: -0.1, w: 0.04, h: 0.06, d: 0.08, color: white },
    // Mata hitam bulat
    { x: 0.48, y: 0.58, z: 0.14, w: 0.06, h: 0.07, d: 0.04, color: "#18191c" },
    { x: 0.48, y: 0.58, z: -0.14, w: 0.06, h: 0.07, d: 0.04, color: "#18191c" },
    // Telinga segitiga tegak
    { x: 0.32, y: 0.74, z: 0.14, w: 0.1, h: 0.15, d: 0.1, color: coat },
    { x: 0.33, y: 0.73, z: 0.13, w: 0.08, h: 0.11, d: 0.08, color: "#ffa8b6" },
    { x: 0.32, y: 0.74, z: -0.14, w: 0.1, h: 0.15, d: 0.1, color: coat },
    { x: 0.33, y: 0.73, z: -0.13, w: 0.08, h: 0.11, d: 0.08, color: "#ffa8b6" },
    // Kalung merah manis + lonceng emas
    { x: 0.3, y: 0.44, z: 0, w: 0.08, h: 0.28, d: 0.38, color: "#e63946" },
    { x: 0.35, y: 0.34, z: 0, w: 0.05, h: 0.06, d: 0.06, color: "#ffd700" },
    // Ekor melingkar di punggung
    { x: -0.34, y: 0.54, z: 0, w: 0.16, h: 0.2, d: 0.14, color: coat },
    { x: -0.28, y: 0.64, z: 0, w: 0.14, h: 0.1, d: 0.12, color: white },
    // Kaki pendek
    { x: 0.2, y: 0.12, z: 0.14, w: 0.12, h: 0.24, d: 0.12, color: coat },
    { x: 0.22, y: 0.03, z: 0.14, w: 0.14, h: 0.06, d: 0.14, color: white },
    { x: 0.2, y: 0.12, z: -0.14, w: 0.12, h: 0.24, d: 0.12, color: coat },
    { x: 0.22, y: 0.03, z: -0.14, w: 0.14, h: 0.06, d: 0.14, color: white },
    { x: -0.22, y: 0.12, z: 0.14, w: 0.14, h: 0.24, d: 0.14, color: coat },
    { x: -0.2, y: 0.03, z: 0.14, w: 0.15, h: 0.06, d: 0.14, color: white },
    { x: -0.22, y: 0.12, z: -0.14, w: 0.14, h: 0.24, d: 0.14, color: coat },
    { x: -0.2, y: 0.03, z: -0.14, w: 0.15, h: 0.06, d: 0.14, color: white },
  ];
}

/** Red diamond warning sign (rotate 45deg around z), faces +z. */
export function signDiamondParts(): Part[] {
  return [
    { x: 0, y: 0, z: 0, w: 0.95, h: 0.95, d: 0.1, color: "#e63946" },
    { x: 0, y: 0, z: 0, w: 0.72, h: 0.72, d: 0.12, color: "#ffffff" },
  ];
}

export function signExclaimParts(): Part[] {
  return [
    { x: 0, y: 0.1, z: 0.07, w: 0.14, h: 0.42, d: 0.04, color: "#e63946" },
    { x: 0, y: -0.27, z: 0.07, w: 0.14, h: 0.14, d: 0.04, color: "#e63946" },
  ];
}

/* ---------- Japanese railway crossing (踏切) ---------- */

export const RAIL_LAT_MIN = -17;
export const RAIL_LAT_MAX = 15;
export const ROAD_HALF = 4.05;
export const GATE_LAT = 4.6;
export const ARM_LEN = 3.4;
export const ARM_PIVOT_H = 1.1;
export const TRAIN_CAR_LEN = 4.2;
export const TRAIN_GAP = 0.3;
export const TRAIN_W = 2.6;

const YEL = "#ffd21f";
const BLK = "#15171c";

/** Rails across the road. Local frame: +x = road direction, +z = lateral (toward camera), origin on the road surface. */
export function railsParts(): Part[] {
  const parts: Part[] = [];
  const steel = "#c9ced6";
  const segs: [number, number][] = [
    [RAIL_LAT_MIN, -ROAD_HALF],
    [ROAD_HALF, RAIL_LAT_MAX],
  ];
  for (const [a, b] of segs) {
    const mid = (a + b) / 2;
    const len = b - a;
    parts.push({ x: 0, y: 0.09, z: mid, w: 2.0, h: 0.18, d: len, color: "#9a9088" });
    for (let z = a + 0.4; z < b - 0.2; z += 0.8) parts.push({ x: 0, y: 0.22, z, w: 1.7, h: 0.08, d: 0.28, color: "#6b4a2b" });
    for (const sx of [-0.7, 0.7]) {
      parts.push({ x: sx, y: 0.27, z: mid, w: 0.18, h: 0.02, d: len, color: "#8a8f98" });
      parts.push({ x: sx, y: 0.32, z: mid, w: 0.1, h: 0.1, d: len, color: steel });
    }
  }
  // embedded section on the road
  parts.push({ x: 0, y: 0.02, z: 0, w: 2.1, h: 0.05, d: ROAD_HALF * 2, color: "#474b55" });
  for (const sx of [-0.7, 0.7]) {
    parts.push({ x: sx, y: 0.05, z: 0, w: 0.1, h: 0.07, d: ROAD_HALF * 2, color: steel });
    parts.push({ x: sx - 0.13, y: 0.04, z: 0, w: 0.08, h: 0.05, d: ROAD_HALF * 2, color: "#2e3138" });
  }
  // stop line (停止線) + thin edge line
  parts.push({ x: -3.4, y: 0.01, z: 0, w: 0.3, h: 0.02, d: 7.4, color: "#f0f0f0" });
  // yellow/black hazard strip across the road right before the rails (typical at Japanese crossings)
  for (let i = 0; i < 12; i++) parts.push({ x: -1.85, y: 0.011, z: -3.4 + i * 0.62 + 0.31, w: 0.35, h: 0.02, d: 0.62, color: i % 2 ? "#ffd21f" : "#2b2b2b" });
  // "止まれ" (STOP) painted in each lane, Japanese style: characters stacked along the direction of travel,
  // nearest character read first, each glyph upright for the approaching rider (top = further away).
  const W = "#f0f0f0";
  const bar = (cx: number, cz: number, len: number, wid: number, lane: number, along: "x" | "z") =>
    along === "x"
      ? parts.push({ x: cx, y: 0.011, z: lane + cz, w: len, h: 0.02, d: wid, color: W })
      : parts.push({ x: cx, y: 0.011, z: lane + cz, w: wid, h: 0.02, d: len, color: W });
  for (const lane of [-2.4, 0, 2.4]) {
    // 止  (nearest)
    let cx = -8.0;
    bar(cx - 0.55, 0, 1.0, 0.14, lane, "z"); // base
    bar(cx, 0, 1.2, 0.14, lane, "x"); // center vertical
    bar(cx - 0.25, -0.36, 0.6, 0.14, lane, "x"); // short left vertical
    bar(cx + 0.05, 0.25, 0.5, 0.14, lane, "z"); // middle horizontal (right half)
    // ま
    cx = -6.5;
    bar(cx + 0.35, 0, 0.9, 0.14, lane, "z");
    bar(cx + 0.05, 0, 0.9, 0.14, lane, "z");
    bar(cx, 0.05, 1.2, 0.14, lane, "x");
    bar(cx - 0.55, 0, 0.8, 0.14, lane, "z"); // bottom of the loop
    bar(cx - 0.4, -0.4, 0.3, 0.14, lane, "x"); // loop left side
    bar(cx - 0.25, -0.05, 0.7, 0.14, lane, "z"); // loop top
    // れ  (farthest)
    cx = -5.0;
    bar(cx, -0.32, 1.2, 0.14, lane, "x"); // left vertical
    bar(cx + 0.25, -0.3, 0.5, 0.14, lane, "z"); // cross stroke
    bar(cx - 0.05, 0.22, 1.0, 0.14, lane, "x"); // right vertical
    bar(cx - 0.55, 0.35, 0.4, 0.14, lane, "z"); // hook base
    bar(cx - 0.4, 0.5, 0.3, 0.14, lane, "x"); // hook tick
  }
  // "踏切あり" diamond road marking further back
  for (let k = 0; k < 4; k++) {
    const ang = Math.PI / 4 + (k * Math.PI) / 2;
    parts.push({ x: -13 + 0.7 * Math.cos(ang), y: 0.01, z: 0.7 * Math.sin(ang), w: 0.16, h: 0.02, d: 2.0, ry: Math.PI / 4 + (k % 2 ? Math.PI / 2 : 0), color: "#f0f0f0" });
  }
  return parts;
}

/**
 * Japanese 踏切警報機 (crossing signal). Local: mast at origin, road toward -x (player approaches from -x),
 * lateral +z is away from the road for the "right" gate (the view mirrors it for the other side).
 * Yellow/black hazard mast, black backboard head with a yellow crossbuck, twin red flashers,
 * direction-indicator arrows and an electric bell on top.
 */
export function gatePoleParts(): Part[] {
  const parts: Part[] = [];
  const mastX = 0;
  // concrete base
  parts.push({ x: mastX, y: 0.1, z: 0, w: 0.56, h: 0.2, d: 0.56, color: "#8d949c" });
  // hazard-striped mast (yellow/black diagonal reads as bands at voxel scale)
  for (let i = 0; i < 12; i++) parts.push({ x: mastX, y: 0.2 + i * 0.3 + 0.15, z: 0, w: 0.16, h: 0.3, d: 0.16, color: i % 2 ? BLK : YEL });
  // ---- signal head (faces -x) ----
  const hx = mastX - 0.12; // head sits slightly toward the road
  // black backboard with white rim
  parts.push({ x: hx, y: 2.85, z: 0, w: 0.08, h: 1.15, d: 1.25, color: "#f4f4f4" });
  parts.push({ x: hx - 0.03, y: 2.85, z: 0, w: 0.06, h: 1.03, d: 1.13, color: BLK });
  // twin red flashers (lenses are separate meshes in the view; these are the black hoods)
  for (const z of [-0.32, 0.32]) {
    parts.push({ x: hx - 0.1, y: 2.62, z, w: 0.1, h: 0.36, d: 0.36, color: "#2a2d33" });
    parts.push({ x: hx - 0.22, y: 2.78, z, w: 0.3, h: 0.06, d: 0.42, color: "#2a2d33" }); // visor
  }
  // yellow crossbuck (X) on top of the head, edged black
  for (const r of [Math.PI / 4, -Math.PI / 4]) {
    parts.push({ x: hx - 0.06, y: 3.75, z: 0, w: 0.06, h: 0.2, d: 1.45, rx: r, color: BLK });
    parts.push({ x: hx - 0.08, y: 3.75, z: 0, w: 0.05, h: 0.14, d: 1.36, rx: r, color: YEL });
  }
  // direction indicator box (列車進行方向指示器) under the flashers: two arrows
  parts.push({ x: hx - 0.05, y: 2.25, z: 0, w: 0.08, h: 0.26, d: 1.0, color: BLK });
  parts.push({ x: hx - 0.1, y: 2.25, z: -0.3, w: 0.02, h: 0.06, d: 0.34, color: "#f6d34a" });
  parts.push({ x: hx - 0.1, y: 2.25, z: -0.5, w: 0.02, h: 0.16, d: 0.06, color: "#f6d34a" });
  parts.push({ x: hx - 0.1, y: 2.25, z: 0.3, w: 0.02, h: 0.06, d: 0.34, color: "#f6d34a" });
  parts.push({ x: hx - 0.1, y: 2.25, z: 0.5, w: 0.02, h: 0.16, d: 0.06, color: "#f6d34a" });
  // bell (電鈴) on top of the mast
  parts.push({ x: mastX, y: 4.12, z: 0, w: 0.14, h: 0.12, d: 0.14, color: "#4a4f57" });
  parts.push({ x: mastX, y: 4.32, z: 0, w: 0.34, h: 0.3, d: 0.34, color: "#5c6470" });
  parts.push({ x: mastX, y: 4.5, z: 0, w: 0.2, h: 0.08, d: 0.2, color: "#3a3f47" });
  // arm motor box on the back of the mast (where the boom pivots)
  parts.push({ x: mastX + 0.3, y: ARM_PIVOT_H, z: 0, w: 0.5, h: 0.5, d: 0.34, color: "#3a3f47" });
  parts.push({ x: mastX + 0.3, y: ARM_PIVOT_H + 0.3, z: 0, w: 0.46, h: 0.06, d: 0.3, color: "#5c6470" });
  return parts;
}

/**
 * Boom arm (遮断桿): yellow/black striped rod with a short counterweight, pivot at origin,
 * the arm extends along +z (over the road when lowered).
 */
export function gateArmParts(): Part[] {
  const parts: Part[] = [{ x: 0, y: 0, z: 0, w: 0.22, h: 0.28, d: 0.3, color: "#3a3f47" }];
  const n = 9;
  const seg = ARM_LEN / n;
  for (let i = 0; i < n; i++) {
    const z = 0.15 + seg * (i + 0.5);
    const taper = 0.13 - i * 0.006;
    parts.push({ x: 0, y: 0, z, w: taper, h: taper, d: seg + 0.005, color: i % 2 ? BLK : YEL });
  }
  // little red reflector disc near the tip (typical) and a round tip cap
  parts.push({ x: 0, y: 0, z: 0.15 + ARM_LEN - 0.35, w: 0.03, h: 0.22, d: 0.22, color: "#e63946" });
  parts.push({ x: 0, y: 0, z: 0.15 + ARM_LEN + 0.02, w: 0.1, h: 0.1, d: 0.06, color: BLK });
  // counterweight
  parts.push({ x: 0, y: 0, z: -0.42, w: 0.12, h: 0.14, d: 0.6, color: BLK });
  parts.push({ x: 0, y: -0.02, z: -0.8, w: 0.3, h: 0.4, d: 0.28, color: "#2a2d33" });
  return parts;
}

/**
 * Japanese 踏切あり warning sign: yellow diamond with a black steam-locomotive silhouette, on a grey post.
 * Faces -x (toward the approaching player).
 */
export function trainSignParts(): Part[] {
  const b = BLK;
  const fx = -0.06; // face plane
  const parts: Part[] = [
    { x: 0, y: 0.06, z: 0, w: 0.34, h: 0.12, d: 0.34, color: "#6b7078" },
    { x: 0, y: 1.2, z: 0, w: 0.09, h: 2.4, d: 0.09, color: "#8d949c" },
    // diamond plate with black edge
    { x: 0.02, y: 2.75, z: 0, w: 0.06, h: 1.3, d: 1.3, rx: Math.PI / 4, color: b },
    { x: 0.0, y: 2.75, z: 0, w: 0.07, h: 1.18, d: 1.18, rx: Math.PI / 4, color: YEL },
    // ---- locomotive silhouette (side view, facing +z) ----
    { x: fx, y: 2.62, z: 0.02, w: 0.02, h: 0.26, d: 0.78, color: b }, // boiler/body
    { x: fx, y: 2.86, z: -0.26, w: 0.02, h: 0.26, d: 0.26, color: b }, // cab
    { x: fx, y: 2.92, z: 0.22, w: 0.02, h: 0.16, d: 0.1, color: b }, // funnel
    { x: fx, y: 2.84, z: 0.02, w: 0.02, h: 0.1, d: 0.14, color: b }, // dome
    { x: fx, y: 2.44, z: 0.02, w: 0.02, h: 0.1, d: 0.9, color: b }, // frame
    { x: fx, y: 2.36, z: -0.28, w: 0.02, h: 0.14, d: 0.14, color: b }, // wheels
    { x: fx, y: 2.36, z: -0.04, w: 0.02, h: 0.14, d: 0.14, color: b },
    { x: fx, y: 2.36, z: 0.2, w: 0.02, h: 0.14, d: 0.14, color: b },
    { x: fx, y: 2.5, z: 0.44, w: 0.02, h: 0.12, d: 0.08, color: b }, // cowcatcher
  ];
  return parts;
}

/** Yellow/black striped stop-line pole (踏切の停止線ポール) — short bollard at the curb. */
export function stopPoleParts(): Part[] {
  const parts: Part[] = [{ x: 0, y: 0.04, z: 0, w: 0.3, h: 0.08, d: 0.3, color: "#6b7078" }];
  for (let i = 0; i < 5; i++) parts.push({ x: 0, y: 0.08 + i * 0.22 + 0.11, z: 0, w: 0.1, h: 0.22, d: 0.1, color: i % 2 ? YEL : BLK });
  parts.push({ x: 0, y: 1.24, z: 0, w: 0.14, h: 0.06, d: 0.14, color: "#e63946" });
  return parts;
}

/** Overhead 踏切 nameplate board hung between the two masts' side: small white sign on the mast. */
export function crossingNameplateParts(): Part[] {
  return [
    { x: -0.11, y: 1.75, z: 0, w: 0.04, h: 0.34, d: 0.9, color: "#ffffff" },
    { x: -0.135, y: 1.75, z: 0, w: 0.01, h: 0.28, d: 0.84, color: "#f6f6f6" },
    // "踏切" as chunky glyph blocks
    { x: -0.15, y: 1.75, z: -0.22, w: 0.01, h: 0.18, d: 0.05, color: BLK },
    { x: -0.15, y: 1.75, z: -0.14, w: 0.01, h: 0.05, d: 0.2, color: BLK },
    { x: -0.15, y: 1.68, z: -0.14, w: 0.01, h: 0.04, d: 0.2, color: BLK },
    { x: -0.15, y: 1.82, z: -0.14, w: 0.01, h: 0.04, d: 0.2, color: BLK },
    { x: -0.15, y: 1.75, z: 0.14, w: 0.01, h: 0.18, d: 0.05, color: BLK },
    { x: -0.15, y: 1.75, z: 0.24, w: 0.01, h: 0.05, d: 0.16, color: BLK },
    { x: -0.15, y: 1.67, z: 0.2, w: 0.01, h: 0.04, d: 0.16, color: BLK },
    { x: -0.15, y: 1.83, z: 0.2, w: 0.01, h: 0.04, d: 0.16, color: BLK },
  ];
}

/** Commuter train car (Yamanote green / Chuo orange). Local: length along z, width along x. cab: +1 = cab at +z end, -1 = at -z, 0 = none. */
export function trainCarParts(line: number, cab: 0 | 1 | -1, pantograph: boolean): Part[] {
  const silver = "#e1e5ea";
  const dark = "#2b3138";
  const win = "#223448";
  const stripe = line ? "#f0832a" : "#3aa655";
  const L = TRAIN_CAR_LEN;
  const W = TRAIN_W;
  const parts: Part[] = [];
  for (const bz of [-1.3, 1.3]) {
    parts.push({ x: 0, y: 0.22, z: bz, w: 2.0, h: 0.3, d: 0.9, color: dark });
    for (const wx of [-1.05, 1.05]) for (const wz of [-0.3, 0.3]) parts.push({ x: wx, y: 0.2, z: bz + wz, w: 0.12, h: 0.4, d: 0.4, color: "#111" });
  }
  parts.push({ x: 0, y: 0.5, z: 0, w: W - 0.1, h: 0.24, d: L, color: "#3a4048" });
  parts.push({ x: 0, y: 1.45, z: 0, w: W, h: 1.7, d: L, color: silver });
  for (const sx of [-W / 2, W / 2]) {
    const s = Math.sign(sx) * 0.012;
    parts.push({ x: sx + s, y: 1.0, z: 0, w: 0.02, h: 0.3, d: L, color: stripe });
    for (const wz of [-0.9, 0, 0.9]) parts.push({ x: sx + s, y: 1.68, z: wz, w: 0.02, h: 0.55, d: 0.66, color: win });
    for (const dz of [-1.75, 1.75]) {
      parts.push({ x: sx + s, y: 1.35, z: dz, w: 0.02, h: 1.5, d: 0.5, color: "#cfd5dc" });
      parts.push({ x: sx + s * 2, y: 1.68, z: dz, w: 0.02, h: 0.5, d: 0.36, color: win });
    }
  }
  parts.push({ x: 0, y: 2.36, z: 0, w: W - 0.3, h: 0.14, d: L, color: "#c3c9d1" });
  parts.push({ x: 0, y: 2.5, z: 0.2, w: 1.2, h: 0.16, d: 1.4, color: "#a9b0b9" });
  if (pantograph) {
    parts.push({ x: 0, y: 2.62, z: -1.2, w: 0.5, h: 0.08, d: 0.5, color: "#3a4048" });
    parts.push({ x: 0, y: 2.85, z: -1.2, w: 0.06, h: 0.5, d: 0.06, color: "#3a4048" });
    parts.push({ x: 0, y: 3.1, z: -1.2, w: 1.3, h: 0.06, d: 0.12, color: "#3a4048" });
  }
  if (cab !== 0) {
    const z = cab * (L / 2 + 0.02);
    parts.push({ x: 0, y: 1.6, z, w: W - 0.4, h: 1.15, d: 0.06, color: "#14171c" });
    parts.push({ x: 0, y: 1.0, z, w: W, h: 0.3, d: 0.05, color: stripe });
    for (const hx of [-0.8, 0.8]) {
      parts.push({ x: hx, y: 0.78, z: z + cab * 0.02, w: 0.32, h: 0.18, d: 0.06, color: "#fff6c8" });
      parts.push({ x: hx, y: 2.1, z: z + cab * 0.02, w: 0.2, h: 0.12, d: 0.06, color: "#ff3b3b" });
    }
    parts.push({ x: 0, y: 2.0, z, w: 0.7, h: 0.28, d: 0.07, color: "#f4f6f8" });
  }
  return parts;
}


/* ---------- Roadworks, puddles, pedestrians, overpass ---------- */

export function roadworkSignParts(): Part[] {
  const y = "#ffb703";
  const b = "#1f2430";
  return [
    { x: 0, y: 0.03, z: 0, w: 0.5, h: 0.06, d: 0.3, color: "#6b7078" },
    { x: 0, y: 0.75, z: 0, w: 0.08, h: 1.5, d: 0.08, color: "#8d949c" },
    { x: 0, y: 1.6, z: 0, w: 0.8, h: 0.8, d: 0.08, color: y },
    { x: 0, y: 1.6, z: 0.05, w: 0.7, h: 0.7, d: 0.02, color: "#ffd166" },
    { x: 0, y: 1.72, z: 0.07, w: 0.12, h: 0.14, d: 0.02, color: b },
    { x: 0.16, y: 1.55, z: 0.07, w: 0.08, h: 0.28, d: 0.02, color: b, rz: -0.6 },
    { x: -0.05, y: 1.5, z: 0.07, w: 0.34, h: 0.06, d: 0.02, color: b },
    { x: -0.1, y: 1.36, z: 0.07, w: 0.06, h: 0.22, d: 0.02, color: b },
    { x: 0.08, y: 1.36, z: 0.07, w: 0.06, h: 0.22, d: 0.02, color: b },
  ];
}

export function roadworkFenceParts(): Part[] {
  const parts: Part[] = [
    { x: -0.9, y: 0.45, z: 0, w: 0.08, h: 0.9, d: 0.08, color: "#4a4f57" },
    { x: 0.9, y: 0.45, z: 0, w: 0.08, h: 0.9, d: 0.08, color: "#4a4f57" },
    { x: -0.9, y: 0.03, z: 0, w: 0.4, h: 0.06, d: 0.4, color: "#4a4f57" },
    { x: 0.9, y: 0.03, z: 0, w: 0.4, h: 0.06, d: 0.4, color: "#4a4f57" },
  ];
  for (let i = 0; i < 6; i++) parts.push({ x: -0.75 + i * 0.3 + 0.15, y: 0.72, z: 0, w: 0.3, h: 0.34, d: 0.06, color: i % 2 ? "#ffffff" : "#ff6a13" });
  parts.push({ x: 0, y: 0.32, z: 0, w: 1.8, h: 0.06, d: 0.06, color: "#ff6a13" });
  return parts;
}

export function jackhammerParts(): Part[] {
  return [
    { x: 0, y: 0.3, z: 0, w: 0.14, h: 0.6, d: 0.14, color: "#9aa3ad" },
    { x: 0, y: 0.7, z: 0, w: 0.34, h: 0.28, d: 0.3, color: "#ffb703" },
    { x: 0, y: 0.92, z: 0, w: 0.56, h: 0.08, d: 0.08, color: "#1f2430" },
  ];
}

export function dirtPileParts(): Part[] {
  return [
    { x: 0, y: 0.18, z: 0, w: 1.4, h: 0.36, d: 1.1, color: "#8a5a35" },
    { x: 0.1, y: 0.45, z: 0.05, w: 0.9, h: 0.24, d: 0.7, color: "#9c6a42" },
    { x: 0.15, y: 0.62, z: 0.1, w: 0.4, h: 0.14, d: 0.36, color: "#a97a50" },
  ];
}

/** Worker in hi-vis + helmet, facing +x. */
export function workerParts(variant: number, isHit = false): Part[] {
  const vest = variant % 2 ? "#ffb703" : "#ff7f11";
  const parts: Part[] = [
    { x: 0, y: 0.35, z: 0.12, w: 0.2, h: 0.7, d: 0.18, color: "#2b3a55" },
    { x: 0, y: 0.35, z: -0.12, w: 0.2, h: 0.7, d: 0.18, color: "#2b3a55" },
    { x: 0, y: 1.05, z: 0, w: 0.5, h: 0.7, d: 0.6, color: vest },
    { x: 0, y: 1.05, z: 0, w: 0.52, h: 0.12, d: 0.62, color: "#e5e7eb" },
    { x: 0.05, y: 0.75, z: 0, w: 0.53, h: 0.1, d: 0.62, color: "#e5e7eb" },
    { x: 0, y: 1.0, z: 0.4, w: 0.18, h: 0.6, d: 0.18, color: vest },
    { x: 0.3, y: 1.1, z: -0.4, w: 0.18, h: 0.6, d: 0.18, color: vest, rz: -1.1 },
    { x: 0, y: 1.6, z: 0, w: 0.4, h: 0.4, d: 0.42, color: "#f1c9a5" },
    { x: 0, y: 1.9, z: 0, w: 0.48, h: 0.22, d: 0.5, color: "#ffd60a" },
    { x: 0.1, y: 1.8, z: 0, w: 0.5, h: 0.06, d: 0.54, color: "#ffd60a" },
  ];
  if (isHit) {
    // X X eyes & gaping mouth
    parts.push({ x: 0.202, y: 1.62, z: 0.09, w: 0.025, h: 0.12, d: 0.04, rx: Math.PI / 4, color: "#111111" });
    parts.push({ x: 0.202, y: 1.62, z: 0.09, w: 0.025, h: 0.12, d: 0.04, rx: -Math.PI / 4, color: "#111111" });
    parts.push({ x: 0.202, y: 1.62, z: -0.09, w: 0.025, h: 0.12, d: 0.04, rx: Math.PI / 4, color: "#111111" });
    parts.push({ x: 0.202, y: 1.62, z: -0.09, w: 0.025, h: 0.12, d: 0.04, rx: -Math.PI / 4, color: "#111111" });
    parts.push({ x: 0.202, y: 1.48, z: 0, w: 0.035, h: 0.15, d: 0.16, color: "#111111" });
    parts.push({ x: 0.205, y: 1.44, z: 0, w: 0.02, h: 0.04, d: 0.1, color: "#ff5e7e" });
  } else {
    // eyes
    parts.push({ x: 0.202, y: 1.62, z: 0.09, w: 0.02, h: 0.09, d: 0.07, color: "#ffffff" });
    parts.push({ x: 0.202, y: 1.62, z: -0.09, w: 0.02, h: 0.09, d: 0.07, color: "#ffffff" });
    parts.push({ x: 0.212, y: 1.61, z: 0.08, w: 0.015, h: 0.06, d: 0.05, color: "#1f2430" });
    parts.push({ x: 0.212, y: 1.61, z: -0.08, w: 0.015, h: 0.06, d: 0.05, color: "#1f2430" });
    // mouth
    parts.push({ x: 0.202, y: 1.48, z: 0, w: 0.02, h: 0.035, d: 0.1, color: "#8a4030" });
  }
  return parts;
}

export interface PedOutfit {
  top: string;
  pants: string;
  hair: string;
  skin: string;
  gender: "female" | "male";
  glasses?: "sunglasses" | "wire" | "round";
  hat?: "cap" | "bucket" | "beanie" | "beret";
  skirt?: boolean;
}

export const PED_OUTFITS: PedOutfit[] = [
  // 0: Wanita kasual - sweater pink lembut + rok putih + kacamata hitam stylish
  { top: "#ff758f", pants: "#f8f9fa", hair: "#4a2810", skin: "#f6d7bd", gender: "female", skirt: true, glasses: "sunglasses" },
  // 1: Wanita chic - blus cyan segar + rok denim + topi bucket beige
  { top: "#48cae4", pants: "#2b2d42", hair: "#f4a261", skin: "#f1c9a5", gender: "female", skirt: true, hat: "bucket" },
  // 2: Wanita elegan - gaun lilac + kacamata bulat retro
  { top: "#c77dff", pants: "#212529", hair: "#1a1423", skin: "#e8b98e", gender: "female", glasses: "round" },
  // 3: Wanita ceria - baju kuning cerah + rok coral + topi baret merah
  { top: "#ffd166", pants: "#e76f51", hair: "#5c3d2e", skin: "#f6d7bd", gender: "female", skirt: true, hat: "beret" },
  // 4: Pria streetwear - hoodie merah + celana jeans navy + topi baseball hitam (snapback)
  { top: "#e63946", pants: "#1d3557", hair: "#2b1d12", skin: "#f1c9a5", gender: "male", hat: "cap" },
  // 5: Pria salaryman - setelan jas arang (charcoal) berdasi
  { top: "#2e3546", pants: "#2e3546", hair: "#1b1b1f", skin: "#f1c9a5", gender: "male" },
  // 6: Pria salaryman - jas hitam pekat + kacamata kawat formal
  { top: "#23272f", pants: "#23272f", hair: "#111111", skin: "#e8b98e", gender: "male", glasses: "wire" },
  // 7: Pria salaryman - setelan jas navy blue
  { top: "#3d4459", pants: "#3d4459", hair: "#2b1d12", skin: "#f6d7bd", gender: "male" },
  // 8: Pria casual outdoor - jaket bomber hijau olive + celana chino + topi kupluk beanie oranye + kacamata hitam
  { top: "#386641", pants: "#bc6c25", hair: "#1a1a1a", skin: "#c68642", gender: "male", hat: "beanie", glasses: "sunglasses" },
  // 9: Wanita karier - mantel hijau emerald + kacamata hitam trendi
  { top: "#2a9d8f", pants: "#264653", hair: "#111111", skin: "#f1c9a5", gender: "female", glasses: "sunglasses" },
  // 10: Pria Shibuya hypebeast - hoodie ungu oversized + topi baseball merah
  { top: "#7209b7", pants: "#343a40", hair: "#1f2430", skin: "#f6d7bd", gender: "male", hat: "cap" },
  // 11: Wanita Harajuku - jaket pastel pink + rok mini kuning + kacamata frame putih
  { top: "#ff99c8", pants: "#fcf6bd", hair: "#e0aaff", skin: "#f6d7bd", gender: "female", skirt: true, glasses: "wire" },
  // 12: Wanita modis - trenchcoat karamel + rok hitam + kacamata hitam cat-eye + topi baret hitam
  { top: "#c28b52", pants: "#1a1a1a", hair: "#3a2118", skin: "#f6d7bd", gender: "female", skirt: true, hat: "beret", glasses: "sunglasses" },
  // 13: Pria skater - kaos oversized mint + celana kargo krem + topi bucket khaki + kacamata hitam
  { top: "#52b788", pants: "#e9d8a6", hair: "#18181b", skin: "#f1c9a5", gender: "male", hat: "bucket", glasses: "sunglasses" },
  // 14: Wanita trendy Shibuya - jaket varsity biru putih + rok lipit navy + topi baseball biru
  { top: "#277da1", pants: "#1d3557", hair: "#f4a261", skin: "#f6d7bd", gender: "female", skirt: true, hat: "cap" },
  // 15: Pria fotografer / turis - rompi utility abu-abu + kacamata bulat vintage + topi kupluk beanie navy
  { top: "#6c757d", pants: "#343a40", hair: "#2b1d12", skin: "#e8b98e", gender: "male", hat: "beanie", glasses: "round" },
  // 16: Wanita kasual santai - kaos putih + celana boyfriend jeans + topi baseball pastel pink + kacamata kawat
  { top: "#ffffff", pants: "#4895ef", hair: "#1f2430", skin: "#f1c9a5", gender: "female", hat: "cap", glasses: "wire" },
  // 17: Pria seniman - sweater rajut mustard + kacamata bulat klasik + topi baret cokelat
  { top: "#e9c46a", pants: "#264653", hair: "#2d1e18", skin: "#f6d7bd", gender: "male", hat: "beret", glasses: "round" },
];

/** Jumlah varian outfit pejalan kaki. */
export const PED_VARIANTS = PED_OUTFITS.length;
/** Varian 5, 6, 7 adalah salaryman berjas kantor (kemeja putih + dasi + tas kerja dikempit). */
export const isSuitVariant = (v: number) => {
  const idx = v % PED_VARIANTS;
  return idx === 5 || idx === 6 || idx === 7;
};

/** Kakek/nenek yang menyeberang: cardigan hangat, rambut putih, kacamata, dan tongkat. */
const ELDER_OUTFITS: PedOutfit[] = [
  { top: "#b8a389", pants: "#4a4e57", hair: "#e9e9ea", skin: "#e8c9a8", gender: "female", skirt: true, glasses: "round" },
  { top: "#c9a0dc", pants: "#5b5560", hair: "#f2f2f4", skin: "#f0d3b6", gender: "female", glasses: "round" },
  { top: "#8fbf9f", pants: "#454b52", hair: "#e4e4e6", skin: "#dfbb95", gender: "male", glasses: "round" },
];

/** Di mana tongkat digenggam: jarak telapak tangan dari sendi bahu (pakai `pedestrianArmParts`). */
export const CANE_GRIP_Y = -0.56;

/**
 * Tongkat kayu (pegangan + batang + ujung karet). Origin di telapak tangan, batang turun ke -y.
 * Panjangnya pas: ujung karet menyentuh aspal saat lengan menjuntai santai
 * (bahu 0.27 + tinggi badan 0.96 - 0.56 genggaman = 0.67 di atas jalan).
 */
export function caneParts(): Part[] {
  return [
    { x: 0.01, y: -0.04, z: 0, w: 0.075, h: 0.11, d: 0.075, color: "#8a5a2b" },
    { x: 0.02, y: -0.36, z: 0, w: 0.05, h: 0.62, d: 0.05, color: "#a9713a" },
    { x: 0.02, y: -0.66, z: 0, w: 0.06, h: 0.06, d: 0.06, color: "#2f3033" },
  ];
}

/** Pedestrian head with facial features, hair, hats (caps, bucket hats, beanies, berets), and glasses (sunglasses, wire, round). Origin at neck level (y = 0). */
export function pedestrianHeadParts(variant: number, isHit = false, elderly = false): Part[] {
  const o = elderly ? ELDER_OUTFITS[variant % ELDER_OUTFITS.length] : PED_OUTFITS[variant % PED_OUTFITS.length];
  const isFemale = o.gender === "female";
  const parts: Part[] = [
    // head base
    { x: 0, y: 0.18, z: 0, w: 0.38, h: 0.4, d: 0.4, color: o.skin },
    // hair
    { x: -0.03, y: 0.4, z: 0, w: 0.42, h: 0.14, d: 0.44, color: o.hair },
    { x: -0.18, y: 0.23, z: 0, w: 0.1, h: 0.3, d: 0.44, color: o.hair },
    { x: 0.1, y: 0.36, z: 0, w: 0.2, h: 0.08, d: 0.42, color: o.hair },
    { x: -0.05, y: 0.24, z: 0.21, w: 0.26, h: 0.22, d: 0.04, color: o.hair },
    { x: -0.05, y: 0.24, z: -0.21, w: 0.26, h: 0.22, d: 0.04, color: o.hair },
  ];

  // Rambut lansia & sanggul uban nenek
  if (elderly) {
    parts.push({ x: -0.22, y: 0.28, z: 0, w: 0.14, h: 0.18, d: 0.18, color: o.hair });
    parts.push({ x: -0.21, y: 0.38, z: 0, w: 0.12, h: 0.08, d: 0.16, color: o.hair });
    parts.push({ x: 0.04, y: 0.1, z: 0.21, w: 0.12, h: 0.24, d: 0.04, color: o.hair });
    parts.push({ x: 0.04, y: 0.1, z: -0.21, w: 0.12, h: 0.24, d: 0.04, color: o.hair });
  } else if (isFemale) {
    parts.push({ x: -0.2, y: 0.06, z: 0, w: 0.12, h: 0.36, d: 0.34, color: o.hair }); // rambut belakang menjuntai
    parts.push({ x: 0.04, y: 0.1, z: 0.21, w: 0.12, h: 0.24, d: 0.04, color: o.hair }); // poni samping
    parts.push({ x: 0.04, y: 0.1, z: -0.21, w: 0.12, h: 0.24, d: 0.04, color: o.hair });
  }

  // ===== TOPI (Hats / Caps / Beanies / Berets) =====
  if (o.hat === "cap") {
    // Topi baseball / snapback dengan lidah topi maju ke depan
    const capColor = variant === 4 ? "#1f2430" : variant === 10 ? "#d90429" : variant === 14 ? "#1d3557" : variant === 16 ? "#ff758f" : "#2b303a";
    parts.push({ x: -0.02, y: 0.44, z: 0, w: 0.44, h: 0.15, d: 0.44, color: capColor });
    parts.push({ x: 0.26, y: 0.41, z: 0, w: 0.2, h: 0.04, d: 0.36, color: capColor }); // lidah visor topi
    parts.push({ x: -0.02, y: 0.52, z: 0, w: 0.07, h: 0.04, d: 0.07, color: "#ffffff" }); // kancing atas topi
  } else if (o.hat === "bucket") {
    // Topi bucket santai dengan pinggiran melingkar
    const bColor = variant === 13 ? "#c2b280" : "#edd8b4";
    parts.push({ x: 0, y: 0.43, z: 0, w: 0.6, h: 0.04, d: 0.6, color: bColor }); // pinggiran bundar
    parts.push({ x: -0.02, y: 0.5, z: 0, w: 0.42, h: 0.14, d: 0.42, color: bColor }); // mahkota topi
    parts.push({ x: -0.02, y: 0.45, z: 0, w: 0.43, h: 0.04, d: 0.43, color: "#3a3d46" }); // pita topi
  } else if (o.hat === "beanie") {
    // Topi kupluk beanie rajut
    const bColor = variant === 15 ? "#1d3557" : "#f77f00";
    const fColor = variant === 15 ? "#0d1b2a" : "#d62828";
    parts.push({ x: -0.02, y: 0.47, z: 0, w: 0.44, h: 0.18, d: 0.44, color: bColor });
    parts.push({ x: -0.02, y: 0.39, z: 0, w: 0.46, h: 0.07, d: 0.46, color: fColor }); // lipatan kupluk
  } else if (o.hat === "beret") {
    // Topi baret chic miring
    const beretColor = variant === 12 ? "#1a1a1a" : variant === 17 ? "#7f4f24" : "#e63946";
    parts.push({ x: -0.04, y: 0.46, z: 0.04, w: 0.46, h: 0.09, d: 0.46, rx: 0.2, color: beretColor });
  }

  if (isHit) {
    // ---- HIT / KO FACE: X X eyes and gaping open mouth (mangap!) ----
    // Eye white sockets
    parts.push({ x: 0.192, y: 0.2, z: 0.09, w: 0.015, h: 0.13, d: 0.12, color: "#ffffff" });
    parts.push({ x: 0.192, y: 0.2, z: -0.09, w: 0.015, h: 0.13, d: 0.12, color: "#ffffff" });
    // Right eye X
    parts.push({ x: 0.202, y: 0.2, z: 0.09, w: 0.02, h: 0.12, d: 0.035, rx: Math.PI / 4, color: "#181424" });
    parts.push({ x: 0.202, y: 0.2, z: 0.09, w: 0.02, h: 0.12, d: 0.035, rx: -Math.PI / 4, color: "#181424" });
    // Left eye X
    parts.push({ x: 0.202, y: 0.2, z: -0.09, w: 0.02, h: 0.12, d: 0.035, rx: Math.PI / 4, color: "#181424" });
    parts.push({ x: 0.202, y: 0.2, z: -0.09, w: 0.02, h: 0.12, d: 0.035, rx: -Math.PI / 4, color: "#181424" });
    // Shocked angled eyebrows
    parts.push({ x: 0.192, y: 0.3, z: 0.09, w: 0.02, h: 0.035, d: 0.08, rx: 0.35, color: o.hair });
    parts.push({ x: 0.192, y: 0.3, z: -0.09, w: 0.02, h: 0.035, d: 0.08, rx: -0.35, color: o.hair });
    // Wide gaping open mouth ("mulut mangap")
    parts.push({ x: 0.192, y: 0.05, z: 0, w: 0.045, h: 0.15, d: 0.16, color: "#180c0a" });
    // Upper teeth
    parts.push({ x: 0.202, y: 0.11, z: 0, w: 0.02, h: 0.035, d: 0.12, color: "#ffffff" });
    // Gaping pink tongue inside
    parts.push({ x: 0.202, y: 0.005, z: 0, w: 0.02, h: 0.04, d: 0.1, color: "#ff5e7e" });
    // Comic dizzy sweat bead near forehead
    parts.push({ x: 0.2, y: 0.33, z: 0.17, w: 0.025, h: 0.06, d: 0.05, color: "#4cc9f0" });
  } else {
    // ---- NORMAL WALKING FACE: cute eyes with pupils, eyebrows, smile and cheek blush ----
    parts.push({ x: 0.192, y: 0.2, z: 0.09, w: 0.02, h: 0.11, d: 0.08, color: "#ffffff" });
    parts.push({ x: 0.192, y: 0.2, z: -0.09, w: 0.02, h: 0.11, d: 0.08, color: "#ffffff" });
    parts.push({ x: 0.202, y: 0.19, z: 0.08, w: 0.015, h: 0.07, d: 0.05, color: "#1f2430" });
    parts.push({ x: 0.202, y: 0.19, z: -0.08, w: 0.015, h: 0.07, d: 0.05, color: "#1f2430" });
    parts.push({ x: 0.192, y: 0.28, z: 0.09, w: 0.02, h: 0.03, d: 0.08, color: o.hair });
    parts.push({ x: 0.192, y: 0.28, z: -0.09, w: 0.02, h: 0.03, d: 0.08, color: o.hair });
    parts.push({ x: 0.192, y: 0.07, z: 0, w: 0.02, h: 0.035, d: 0.09, color: isFemale ? "#c94d63" : "#9c4a3b" });
    parts.push({ x: 0.192, y: 0.12, z: 0.12, w: 0.015, h: 0.04, d: 0.05, color: "#f7a092" });
    parts.push({ x: 0.192, y: 0.12, z: -0.12, w: 0.015, h: 0.04, d: 0.05, color: "#f7a092" });

    // ===== KACAMATA (Glasses / Sunglasses) =====
    if (o.glasses === "sunglasses") {
      // Kacamata hitam keren (Sunglasses)
      parts.push({ x: 0.205, y: 0.2, z: 0.095, w: 0.025, h: 0.11, d: 0.12, color: "#16171b" });
      parts.push({ x: 0.205, y: 0.2, z: -0.095, w: 0.025, h: 0.11, d: 0.12, color: "#16171b" });
      parts.push({ x: 0.205, y: 0.23, z: 0, w: 0.02, h: 0.028, d: 0.08, color: "#292c34" }); // jembatan hidung
      parts.push({ x: 0.08, y: 0.22, z: 0.21, w: 0.25, h: 0.028, d: 0.02, color: "#292c34" }); // gagang kacamata kiri
      parts.push({ x: 0.08, y: 0.22, z: -0.21, w: 0.25, h: 0.028, d: 0.02, color: "#292c34" }); // gagang kacamata kanan
    } else if (o.glasses === "wire") {
      // Kacamata kawat formal modern (Wireframe)
      parts.push({ x: 0.205, y: 0.2, z: 0.095, w: 0.02, h: 0.1, d: 0.1, color: "#71717a" });
      parts.push({ x: 0.205, y: 0.2, z: -0.095, w: 0.02, h: 0.1, d: 0.1, color: "#71717a" });
      parts.push({ x: 0.205, y: 0.22, z: 0, w: 0.02, h: 0.025, d: 0.08, color: "#71717a" });
    } else if (o.glasses === "round" || elderly) {
      // Kacamata bulat retro / kakek-nenek
      parts.push({ x: 0.202, y: 0.24, z: 0.09, w: 0.02, h: 0.03, d: 0.14, color: "#3b3f4a" });
      parts.push({ x: 0.202, y: 0.2, z: 0.09, w: 0.02, h: 0.11, d: 0.11, color: "#5b6371" });
      parts.push({ x: 0.202, y: 0.2, z: -0.09, w: 0.02, h: 0.11, d: 0.11, color: "#5b6371" });
      parts.push({ x: 0.209, y: 0.2, z: 0.09, w: 0.012, h: 0.05, d: 0.05, color: "#1f2430" });
      parts.push({ x: 0.209, y: 0.2, z: -0.09, w: 0.012, h: 0.05, d: 0.05, color: "#1f2430" });
      if (elderly) {
        parts.push({ x: 0.196, y: 0.12, z: 0.16, w: 0.014, h: 0.02, d: 0.06, color: "#d8b39c" });
        parts.push({ x: 0.196, y: 0.12, z: -0.16, w: 0.014, h: 0.02, d: 0.06, color: "#d8b39c" });
      }
    }
  }

  return parts;
}

/** Pedestrian torso. Origin at torso center (y = 0). Mendukung rok wanita & tas randoseru sekolah. */
export function pedestrianTorsoParts(variant: number, elderly = false, kid = false): Part[] {
  const o = elderly ? ELDER_OUTFITS[variant % ELDER_OUTFITS.length] : PED_OUTFITS[variant % PED_OUTFITS.length];
  const parts: Part[] = [
    { x: 0, y: 0, z: 0, w: 0.42, h: 0.68, d: 0.52, color: o.top },
    { x: 0.12, y: 0.31, z: 0, w: 0.18, h: 0.08, d: 0.22, color: o.skin },
  ];

  // Aksen ROK mekar untuk varian wanita yang memakai rok
  if (o.skirt && !kid) {
    parts.push({ x: 0, y: -0.28, z: 0, w: 0.46, h: 0.28, d: 0.56, color: o.pants });
    parts.push({ x: 0, y: -0.4, z: 0, w: 0.49, h: 0.06, d: 0.6, color: o.pants });
  }

  if (elderly) {
    parts.push({ x: -0.16, y: 0.2, z: 0, w: 0.16, h: 0.3, d: 0.44, color: o.top });
    parts.push({ x: 0.0, y: 0.31, z: 0, w: 0.44, h: 0.06, d: 0.5, color: "#ffffff" });
  } else if (isSuitVariant(variant) && !kid) {
    // SALARYMAN: kemeja putih menyembul di dada + dasi + kerah/lapel jas
    parts.push({ x: 0.215, y: 0.0, z: 0, w: 0.02, h: 0.56, d: 0.2, color: "#f6f7f9" });
    parts.push({ x: 0.228, y: 0.04, z: 0, w: 0.015, h: 0.38, d: 0.085, color: variant % 2 ? "#a8323e" : "#31518f" });
    parts.push({ x: 0.215, y: 0.27, z: 0.12, w: 0.035, h: 0.1, d: 0.1, color: o.top });
    parts.push({ x: 0.215, y: 0.27, z: -0.12, w: 0.035, h: 0.1, d: 0.1, color: o.top });
  }
  if (kid) {
    const rc = variant % 2 ? "#b5323c" : "#262b33";
    parts.push({ x: -0.3, y: 0.0, z: 0, w: 0.17, h: 0.46, d: 0.4, color: rc });
    parts.push({ x: -0.33, y: 0.25, z: 0, w: 0.13, h: 0.07, d: 0.42, color: rc });
    parts.push({ x: -0.22, y: 0.1, z: 0.17, w: 0.045, h: 0.34, d: 0.07, color: "#3a3f47" });
    parts.push({ x: -0.22, y: 0.1, z: -0.17, w: 0.045, h: 0.34, d: 0.07, color: "#3a3f47" });
  }
  return parts;
}

/** Pedestrian arm. Origin at shoulder joint (y = 0), extends downward along -y. */
export function pedestrianArmParts(variant: number, _side: 1 | -1 = 1, elderly = false, holdsCane = false): Part[] {
  const o = elderly ? ELDER_OUTFITS[variant % ELDER_OUTFITS.length] : PED_OUTFITS[variant % PED_OUTFITS.length];
  const arm: Part[] = [
    { x: 0, y: -0.12, z: 0, w: 0.15, h: 0.24, d: 0.15, color: o.top },
    { x: 0, y: -0.38, z: 0, w: 0.13, h: 0.32, d: 0.13, color: o.skin },
  ];
  if (holdsCane) {
    // tangan menggenggam tongkat: kepalan sedikit lebih besar di ujung lengan
    arm.push({ x: 0.01, y: -0.56, z: 0.02, w: 0.16, h: 0.14, d: 0.16, color: o.skin });
  }
  return arm;
}

/** Pedestrian leg. Origin at hip joint (y = 0), extends downward along -y. */
export function pedestrianLegParts(variant: number, _side: 1 | -1 = 1, elderly = false): Part[] {
  const o = elderly ? ELDER_OUTFITS[variant % ELDER_OUTFITS.length] : PED_OUTFITS[variant % PED_OUTFITS.length];
  return [
    { x: 0, y: -0.26, z: 0, w: 0.18, h: 0.52, d: 0.16, color: o.pants },
    { x: 0.03, y: -0.58, z: 0, w: 0.24, h: 0.12, d: 0.16, color: "#1f2430" },
  ];
}

/** Pedestrian with tote bag / umbrella variants, facing +x. */
export function pedestrianParts(variant: number, isHit = false, elderly = false): Part[] {
  const o = elderly ? ELDER_OUTFITS[variant % ELDER_OUTFITS.length] : PED_OUTFITS[variant % PED_OUTFITS.length];
  const parts: Part[] = [
    { x: 0, y: 0.32, z: 0.11, w: 0.18, h: 0.64, d: 0.16, color: o.pants },
    { x: 0, y: 0.32, z: -0.11, w: 0.18, h: 0.64, d: 0.16, color: o.pants },
    { x: 0, y: 0.98, z: 0, w: 0.42, h: 0.68, d: 0.52, color: o.top },
    { x: 0, y: 0.95, z: 0.34, w: 0.15, h: 0.56, d: 0.15, color: o.top },
    { x: 0, y: 0.95, z: -0.34, w: 0.15, h: 0.56, d: 0.15, color: o.top },
    // head shifted to y = 1.32
    ...pedestrianHeadParts(variant, isHit, elderly).map((p) => ({ ...p, y: p.y + 1.32 })),
  ];
  if (variant % 3 === 1) {
    // tote bag
    parts.push({ x: 0.05, y: 0.7, z: 0.44, w: 0.28, h: 0.34, d: 0.1, color: "#f4e1b5" });
  } else if (variant % 3 === 2) {
    // umbrella
    parts.push({ x: 0.1, y: 1.5, z: -0.34, w: 0.05, h: 1.1, d: 0.05, color: "#333" });
    parts.push({ x: 0.1, y: 2.1, z: -0.34, w: 1.0, h: 0.12, d: 1.0, color: variant % 2 ? "#ff5c8a" : "#4cc9f0" });
    parts.push({ x: 0.1, y: 2.2, z: -0.34, w: 0.6, h: 0.1, d: 0.6, color: variant % 2 ? "#ff8fb1" : "#7fdbff" });
  }
  return parts;
}

/** Tas kerja kulit yang DIKEMPIT salaryman di sisi badan (dipasang pada grup lengan kiri;
 *  origin di sendi bahu, tas menempel rapat antara lengan dan pinggul). */
export function briefcaseParts(variant = 0): Part[] {
  const c = variant % 2 ? "#4a3423" : "#26292f";
  const trim = variant % 2 ? "#5f4830" : "#363b44";
  return [
    { x: 0.04, y: -0.44, z: -0.1, w: 0.52, h: 0.36, d: 0.1, color: c },
    { x: 0.04, y: -0.28, z: -0.1, w: 0.54, h: 0.05, d: 0.12, color: trim },
    { x: 0.04, y: -0.22, z: -0.1, w: 0.16, h: 0.07, d: 0.05, color: "#1c1f24" },
    { x: 0.305, y: -0.4, z: -0.065, w: 0.014, h: 0.06, d: 0.045, color: "#c9a13d" },
    { x: 0.305, y: -0.4, z: -0.135, w: 0.014, h: 0.06, d: 0.045, color: "#c9a13d" },
  ];
}

/** Pagar pembatas trotoar pipa putih khas kota Jepang (横断防止柵): tiang + 2 rel horizontal. */
export function guardFenceParts(len = 3.2): Part[] {
  const white = "#eef1f4";
  const parts: Part[] = [];
  for (let i = 0; i < 3; i++) {
    parts.push({ x: -len / 2 + (len / 2) * i, y: 0.37, z: 0, w: 0.1, h: 0.74, d: 0.1, color: white });
  }
  parts.push({ x: 0, y: 0.72, z: 0, w: len, h: 0.1, d: 0.1, color: white });
  parts.push({ x: 0, y: 0.42, z: 0, w: len, h: 0.07, d: 0.07, color: "#e2e6ea" });
  return parts;
}

/** Planter TROTOAR Shibuya: bak bata/beton berisi semak, rumpun rumput & bunga; varian 2 = pagar tanaman (hedge). */
export function sidewalkPlanterParts(variant: number): Part[] {
  const v = Math.abs(variant) % 3;
  const parts: Part[] = [];
  if (v === 2) {
    // hedge panjang di bak beton rendah
    parts.push({ x: 0, y: 0.14, z: 0, w: 2.6, h: 0.28, d: 0.5, color: "#9aa0a8" });
    parts.push({ x: 0, y: 0.5, z: 0, w: 2.4, h: 0.5, d: 0.4, color: "#3f7a45" });
    parts.push({ x: -0.7, y: 0.78, z: 0, w: 0.8, h: 0.16, d: 0.36, color: "#4c8a4f" });
    parts.push({ x: 0.6, y: 0.76, z: 0, w: 0.9, h: 0.14, d: 0.36, color: "#5e9b57" });
    return parts;
  }
  const box = v === 0 ? "#9c5a3c" : "#a8adb5"; // bak bata merah / beton
  const rim = v === 0 ? "#7d452e" : "#8d939c";
  parts.push({ x: 0, y: 0.2, z: 0, w: 1.5, h: 0.4, d: 0.55, color: box });
  parts.push({ x: 0, y: 0.42, z: 0, w: 1.58, h: 0.08, d: 0.63, color: rim });
  parts.push({ x: 0, y: 0.45, z: 0, w: 1.38, h: 0.06, d: 0.44, color: "#4a3a28" });
  // semak hijau
  parts.push({ x: -0.35, y: 0.58, z: 0, w: 0.5, h: 0.28, d: 0.36, color: "#4c8a4f" });
  parts.push({ x: 0.3, y: 0.56, z: 0.02, w: 0.46, h: 0.24, d: 0.34, color: "#5e9b57" });
  // rumpun rumput
  for (const gx of [-0.6, 0.05, 0.55]) {
    parts.push({ x: gx, y: 0.62, z: -0.1, w: 0.07, h: 0.3, d: 0.07, color: "#6fae5c" });
    parts.push({ x: gx + 0.08, y: 0.58, z: 0.08, w: 0.06, h: 0.24, d: 0.06, color: "#87c46a" });
  }
  // bunga warna-warni
  const fl = v === 0 ? ["#e84855", "#ffd166", "#ff8fa3"] : ["#ffffff", "#b48ce0", "#ffd166"];
  [-0.45, -0.1, 0.25, 0.55].forEach((fx, i) => {
    parts.push({ x: fx, y: 0.72 + (i % 2) * 0.05, z: i % 2 ? 0.12 : -0.08, w: 0.11, h: 0.11, d: 0.11, color: fl[i % fl.length] });
  });
  return parts;
}

export const OVERPASS_H = 5.2;
export const OVERPASS_HALF_W = 3.2;

/** Elevated road crossing above the street (bridge deck on portal-frame piers). Local: +x along the street, +z lateral. */
export function overpassParts(): Part[] {
  const concrete = "#b9bfc8";
  const concreteDark = "#8e959f";
  const asphalt = "#5d6370";
  const L = 34;
  const W = OVERPASS_HALF_W * 2;
  const parts: Part[] = [
    // deck: concrete slab with asphalt top and white edge lines
    { x: 0, y: OVERPASS_H - 0.3, z: 0, w: W, h: 0.6, d: L, color: concrete },
    { x: 0, y: OVERPASS_H + 0.05, z: 0, w: W - 1.0, h: 0.1, d: L, color: asphalt },
    { x: 0, y: OVERPASS_H + 0.11, z: 0, w: 0.12, h: 0.02, d: L, color: "#e9e9e9" },
    { x: -(W / 2 - 0.62), y: OVERPASS_H + 0.11, z: 0, w: 0.1, h: 0.02, d: L, color: "#e9e9e9" },
    { x: W / 2 - 0.62, y: OVERPASS_H + 0.11, z: 0, w: 0.1, h: 0.02, d: L, color: "#e9e9e9" },
    // parapets
    { x: -(W / 2 - 0.25), y: OVERPASS_H + 0.5, z: 0, w: 0.5, h: 0.9, d: L, color: concrete },
    { x: W / 2 - 0.25, y: OVERPASS_H + 0.5, z: 0, w: 0.5, h: 0.9, d: L, color: concrete },
    { x: -(W / 2 - 0.25), y: OVERPASS_H + 0.98, z: 0, w: 0.56, h: 0.08, d: L, color: "#d7dce2" },
    { x: W / 2 - 0.25, y: OVERPASS_H + 0.98, z: 0, w: 0.56, h: 0.08, d: L, color: "#d7dce2" },
    // dark underside girder
    { x: 0, y: OVERPASS_H - 0.85, z: 0, w: W - 1.4, h: 0.5, d: L, color: "#6b7280" },
  ];
  // portal frames (columns at both deck edges + cap beam) — clear of the road (lat ±4) and sidewalks
  for (const z of [-8.6, 8.6, -16, 16]) {
    for (const x of [-(W / 2 - 0.7), W / 2 - 0.7]) {
      parts.push({ x, y: (OVERPASS_H - 1.1) / 2, z, w: 1.2, h: OVERPASS_H - 1.1, d: 1.2, color: concreteDark });
      parts.push({ x, y: 0.15, z, w: 1.6, h: 0.3, d: 1.6, color: "#a0a5ad" });
    }
    parts.push({ x: 0, y: OVERPASS_H - 1.35, z, w: W - 0.2, h: 0.5, d: 1.3, color: concreteDark });
  }
  // street lamps along the parapet
  for (let i = -3; i <= 3; i++) {
    parts.push({ x: -(W / 2 - 0.25), y: OVERPASS_H + 1.7, z: i * 4.5, w: 0.1, h: 1.6, d: 0.1, color: "#4a4f57" });
    parts.push({ x: -(W / 2 - 0.55), y: OVERPASS_H + 2.45, z: i * 4.5, w: 0.7, h: 0.1, d: 0.1, color: "#4a4f57" });
    parts.push({ x: -(W / 2 - 0.9), y: OVERPASS_H + 2.35, z: i * 4.5, w: 0.36, h: 0.14, d: 0.3, color: "#fff2b0" });
  }
  // clearance sign hanging under the deck edge facing the player
  parts.push({ x: -(W / 2 + 0.06), y: OVERPASS_H - 0.55, z: 3.2, w: 0.08, h: 0.5, d: 1.1, color: "#ffffff" });
  parts.push({ x: -(W / 2 + 0.1), y: OVERPASS_H - 0.55, z: 3.2, w: 0.04, h: 0.4, d: 1.0, color: "#e63946" });
  parts.push({ x: -(W / 2 + 0.13), y: OVERPASS_H - 0.55, z: 3.2, w: 0.02, h: 0.26, d: 0.8, color: "#ffffff" });
  return parts;
}

/** Car for the overpass, driving along local +z. */
export function overpassCarParts(variant: number): Part[] {
  const car = carParts(variant);
  return car.map((p) => ({ ...p, x: -p.z, z: p.x, w: p.d, d: p.w }));
}

/** Shallow puddle: a thin bluish plate with lighter ripples. */
export function puddleParts(variant: number): Part[] {
  const w1 = "#7fb8e6";
  const w2 = "#a9d3f5";
  const shapes = [
    [
      [0, 0, 1.6, 1.0],
      [0.5, 0.35, 0.9, 0.7],
      [-0.55, -0.3, 0.8, 0.6],
    ],
    [
      [0, 0, 1.3, 1.3],
      [0.6, -0.2, 0.7, 0.8],
      [-0.5, 0.45, 0.9, 0.5],
    ],
  ][variant % 2];
  const parts: Part[] = shapes.map(([x, z, w, d]) => ({ x, y: 0.012, z, w, h: 0.02, d, color: w1 }));
  parts.push({ x: 0.2, y: 0.026, z: 0.1, w: 0.5, h: 0.005, d: 0.1, color: w2 });
  parts.push({ x: -0.3, y: 0.026, z: -0.2, w: 0.35, h: 0.005, d: 0.08, color: w2 });
  return parts;
}

/* ---------- Perempatan (4-Way Crossroads / Intersection) ---------- */

export const INTERSECTION_W = 8.4;
/** Varian cross-street LEBAR 6 jalur — biar perempatan tidak sempit. */
export const INTERSECTION_W_WIDE = 12.6;
/** Panjang jalan lintas di tiap sisi perempatan (dari dek |lat| 4 sampai ujungnya). */
export const CROSS_STREET_LEN = 38;
/** Titik tengah jalan lintas tiap sisi (|lat| 4 → 42). */
const CROSS_STREET_MID = 4 + CROSS_STREET_LEN / 2;
export const HOOD_JUMP_CLEAR_H = 0.88;

/** Complete 4-way asphalt cross-street with raised lateral roadbeds, sidewalks, corner curb cuts, tactile blocks, and 4-way zebra crossings. */
export function intersectionRoadParts(W: number = INTERSECTION_W): Part[] {
  const asphalt = "#424752";
  const asphaltDark = "#383c44";
  const white = "#f8fafc";
  const yellow = "#f59e0b";
  const curb = "#b8b4aa";
  const curbDark = "#9e9a90";
  const sidewalk = "#dcd7cb";
  const signBlue = "#1d4ed8";
  const signGreen = "#059669";
  const metal = "#4b5563";
  const parts: Part[] = [];

  const halfW = W / 2;

  // 1. Center Junction Asphalt (inside the main street, y = 0.016 to prevent z-fighting with main road y = 0)
  parts.push({ x: 0, y: 0.016, z: 0, w: W, h: 0.024, d: 8.0, color: asphalt });
  // Subtle tire wear grooves across the junction
  parts.push({ x: -halfW * 0.43, y: 0.018, z: 0, w: 1.4, h: 0.025, d: 7.8, color: asphaltDark });
  parts.push({ x: halfW * 0.43, y: 0.018, z: 0, w: 1.4, h: 0.025, d: 7.8, color: asphaltDark });

  // 2. Lateral Cross-Streets (Left: z = -4.0 to -30, Right: z = +4.0 to +30)
  // Raised to y = 0.145 (surface top at y = 0.175) so it cleanly overlays ground sidewalk (0.12) & curbs (0.14)
  for (const sz of [-CROSS_STREET_MID, CROSS_STREET_MID]) {
    // Roadbed asphalt (38m long each side, 8.4m wide)
    parts.push({ x: 0, y: 0.145, z: sz, w: W, h: 0.06, d: CROSS_STREET_LEN, color: asphalt });
    // Underneath skirt foundation down to y = -0.3 to prevent any floating seams
    parts.push({ x: 0, y: -0.05, z: sz, w: W + 0.1, h: 0.35, d: CROSS_STREET_LEN, color: "#2d3139" });
  }

  // Smooth curb-cut ramp connecting main street (y = 0) to cross street (y = 0.145)
  for (const dir of [-1, 1]) {
    parts.push({ x: 0, y: 0.08, z: dir * 4.0, w: W, h: 0.09, d: 0.8, color: asphalt });
  }

  // 3. Sidewalks along both sides of the Cross-Street (x = -halfW - 0.7 and x = +halfW + 0.7)
  for (const side of [-1, 1]) {
    const curbX = side * (halfW + 0.18);
    const walkX = side * (halfW + 1.46);
    for (const dir of [-1, 1]) {
      const walkZ = dir * CROSS_STREET_MID;
      // Curb stone along the side street
      parts.push({ x: curbX, y: 0.18, z: walkZ, w: 0.36, h: 0.14, d: CROSS_STREET_LEN - 0.5, color: curb });
      // Sidewalk paving tiles along the side street — lebar 2.2 m, muat 2 orang berdampingan
      parts.push({ x: walkX, y: 0.165, z: walkZ, w: 2.2, h: 0.11, d: CROSS_STREET_LEN - 0.5, color: sidewalk });
    }
  }

  // 4. 4-Corner Curved Curbs & Pedestrian Ramps
  for (const sx of [-halfW, halfW]) {
    for (const sz of [-4.2, 4.2]) {
      // Corner curb block
      parts.push({ x: sx, y: 0.12, z: sz, w: 0.75, h: 0.22, d: 0.75, color: curb });
      parts.push({ x: sx + Math.sign(sx) * 0.3, y: 0.14, z: sz + Math.sign(sz) * 0.3, w: 0.6, h: 0.18, d: 0.6, color: curbDark });
      // Yellow braille tactile tiles (Tenji blocks) at the 4 corner pedestrian entry ramps
      parts.push({ x: sx - Math.sign(sx) * 0.35, y: 0.155, z: sz - Math.sign(sz) * 0.35, w: 0.6, h: 0.03, d: 0.6, color: yellow });
    }
  }

  // 5. White Stop Lines before the intersection (di belakang zebra, seperti aturan Jepang)
  for (const sz of [-7.0, 7.0]) {
    parts.push({ x: 0, y: 0.18, z: sz, w: W - 1.2, h: 0.022, d: 0.45, color: white });
  }

  // 6. Double Solid Yellow Center Dividing Lines on the Cross-Street
  for (const dir of [-1, 1]) {
    for (let z = 5.2; z <= CROSS_STREET_MID + CROSS_STREET_LEN / 2 - 1; z += 1.8) {
      const cz = dir * z;
      parts.push({ x: -0.15, y: 0.18, z: cz, w: 0.14, h: 0.022, d: 1.3, color: yellow });
      parts.push({ x: 0.15, y: 0.18, z: cz, w: 0.14, h: 0.022, d: 1.3, color: yellow });
    }
    // Solid white shoulder edge lines on the cross street
    for (const sx of [-halfW + 0.5, halfW - 0.5]) {
      parts.push({ x: sx, y: 0.178, z: dir * CROSS_STREET_MID, w: 0.16, h: 0.022, d: CROSS_STREET_LEN - 3, color: white });
    }
    // Painted directional arrows on the cross-street lanes
    const arrowZ = dir * 11;
    const arrowXs = halfW > 5 ? [-4.3, -2.0, 2.0, 4.3] : [-2.0, 2.0];
    for (const ax of arrowXs) {
      parts.push({ x: ax, y: 0.18, z: arrowZ, w: 0.22, h: 0.022, d: 1.6, color: white });
      parts.push({ x: ax - 0.25, y: 0.18, z: arrowZ + dir * 0.4, w: 0.2, h: 0.022, d: 0.5, color: white });
      parts.push({ x: ax + 0.25, y: 0.18, z: arrowZ + dir * 0.4, w: 0.2, h: 0.022, d: 0.5, color: white });
    }
  }

  // 7. ZEBRA CROSS 4 ARAH — desain benar ala Jepang:
  // pita selebar ~2.3 m; tiap garis MEMANJANG searah laju mobil dan berulang
  // searah langkah pejalan kaki, jadi terbaca sebagai zebra sungguhan.
  // A. Menyeberangi main street (pejalan jalan sepanjang z; garis memanjang di x)
  for (const sx of [-(halfW + 1.5), halfW + 1.5]) {
    for (let zi = -4; zi <= 4; zi++) {
      parts.push({ x: sx, y: 0.025, z: zi * 0.82, w: 2.3, h: 0.022, d: 0.46, color: white });
    }
  }
  // B. Menyeberangi cross-street kiri/kanan (pejalan jalan sepanjang x; garis memanjang di z)
  for (const sz of [-5.5, 5.5]) {
    const nx = Math.floor((W - 1.6) / 0.82);
    for (let xi = 0; xi < nx; xi++) {
      const x = -((nx - 1) * 0.82) / 2 + xi * 0.82;
      parts.push({ x, y: 0.182, z: sz, w: 0.46, h: 0.022, d: 2.2, color: white });
    }
  }

  // 8. Overhead Highway / Cross-Street Directional Gantry Sign
  // Steel gantry columns on both sides of main street at x = 0, z = -4.8 and +4.8
  for (const gz of [-4.8, 4.8]) {
    parts.push({ x: 0, y: 2.8, z: gz, w: 0.25, h: 5.6, d: 0.25, color: metal });
    parts.push({ x: 0, y: 0.15, z: gz, w: 0.5, h: 0.3, d: 0.5, color: curb });
  }
  // Overhead truss beam spanning across at y = 5.2
  parts.push({ x: 0, y: 5.3, z: 0, w: 0.28, h: 0.35, d: 9.8, color: metal });
  // Japanese Overhead Directional Signs:
  // Sign 1 (facing incoming player on -x side): Blue sign "渋谷 SHIBUYA ➔"
  parts.push({ x: -0.16, y: 4.8, z: -1.8, w: 0.06, h: 1.1, d: 2.4, color: signBlue });
  parts.push({ x: -0.20, y: 4.8, z: -1.8, w: 0.02, h: 0.85, d: 2.15, color: "#ffffff" });
  parts.push({ x: -0.22, y: 4.8, z: -1.8, w: 0.02, h: 0.7, d: 1.95, color: signBlue });
  // Route 246 badge
  parts.push({ x: -0.24, y: 5.0, z: -2.3, w: 0.02, h: 0.4, d: 0.45, color: "#ffffff" });
  parts.push({ x: -0.25, y: 5.0, z: -2.3, w: 0.02, h: 0.32, d: 0.36, color: signBlue });
  // Arrow on sign
  parts.push({ x: -0.24, y: 4.8, z: -1.1, w: 0.02, h: 0.2, d: 0.45, color: "#ffffff" });

  // Sign 2: Green sign "CROSSROAD / 交差点"
  parts.push({ x: -0.16, y: 4.8, z: 1.8, w: 0.06, h: 1.1, d: 2.4, color: signGreen });
  parts.push({ x: -0.20, y: 4.8, z: 1.8, w: 0.02, h: 0.85, d: 2.15, color: "#ffffff" });
  parts.push({ x: -0.22, y: 4.8, z: 1.8, w: 0.02, h: 0.7, d: 1.95, color: signGreen });
  // Street name glyph blocks on green sign
  parts.push({ x: -0.24, y: 4.85, z: 1.8, w: 0.02, h: 0.3, d: 1.5, color: "#ffffff" });
  parts.push({ x: -0.24, y: 4.6, z: 1.8, w: 0.02, h: 0.15, d: 1.2, color: "#ffffff" });

  // 9. Curbside Storm Drain Grates in the road gutters
  for (const dx of [-3.5, 3.5]) {
    for (const dz of [-4.2, 4.2]) {
      parts.push({ x: dx, y: 0.02, z: dz, w: 0.8, h: 0.015, d: 0.4, color: "#1f2329" });
    }
  }

  return parts;
}

/** Traffic light post with 3-aspect signal (Red, Yellow, Green) and pedestrian signal. */
export function trafficLightParts(lightState: "green" | "yellow" | "red" = "green"): Part[] {
  const metal = "#373c44";
  const darkMetal = "#22252a";
  const hood = "#181a1f";
  const parts: Part[] = [
    // Base & mast pole
    { x: 0, y: 0.1, z: 0, w: 0.45, h: 0.2, d: 0.45, color: metal },
    { x: 0, y: 2.0, z: 0, w: 0.16, h: 3.8, d: 0.16, color: metal },
    // Cantilever arm reaching over the street
    { x: 0, y: 3.6, z: 0.6, w: 0.12, h: 0.12, d: 1.3, color: metal },
    // Signal housing box
    { x: 0, y: 3.45, z: 1.25, w: 0.28, h: 0.9, d: 0.3, color: darkMetal },
    // Signal visor hoods
    { x: 0, y: 3.75, z: 1.42, w: 0.24, h: 0.06, d: 0.12, color: hood },
    { x: 0, y: 3.45, z: 1.42, w: 0.24, h: 0.06, d: 0.12, color: hood },
    { x: 0, y: 3.15, z: 1.42, w: 0.24, h: 0.06, d: 0.12, color: hood },
    // Red lens (top)
    { x: 0, y: 3.75, z: 1.41, w: 0.2, h: 0.2, d: 0.04, color: lightState === "red" ? "#ff3333" : "#4a1212" },
    // Yellow lens (middle)
    { x: 0, y: 3.45, z: 1.41, w: 0.2, h: 0.2, d: 0.04, color: lightState === "yellow" ? "#ffd21f" : "#4a3c08" },
    // Green lens (bottom)
    { x: 0, y: 3.15, z: 1.41, w: 0.2, h: 0.2, d: 0.04, color: lightState === "green" ? "#2ee6a8" : "#0e3d2c" },
    // Pedestrian signal box lower down (y = 1.7)
    { x: 0, y: 1.7, z: 0.16, w: 0.22, h: 0.44, d: 0.18, color: darkMetal },
    { x: 0, y: 1.82, z: 0.26, w: 0.14, h: 0.14, d: 0.03, color: lightState === "green" ? "#ff3333" : "#3a1010" },
    { x: 0, y: 1.58, z: 0.26, w: 0.14, h: 0.14, d: 0.03, color: lightState === "green" ? "#0e3d2c" : "#2ee6a8" },
  ];
  return parts;
}

/** Crossroads warning diamond sign (✚) facing approaching player. */
export function intersectionSignParts(): Part[] {
  const parts: Part[] = [
    // Pole
    { x: 0, y: 0.06, z: 0, w: 0.3, h: 0.12, d: 0.3, color: "#6b7078" },
    { x: 0, y: 1.25, z: 0, w: 0.09, h: 2.5, d: 0.09, color: "#8d949c" },
    // Yellow diamond plate rotated 45 deg around z
    { x: -0.05, y: 2.7, z: 0, w: 0.05, h: 1.25, d: 1.25, rx: Math.PI / 4, color: "#1f2430" },
    { x: -0.06, y: 2.7, z: 0, w: 0.05, h: 1.15, d: 1.15, rx: Math.PI / 4, color: "#ffb703" },
    // Black Crossroad icon (✚)
    { x: -0.09, y: 2.7, z: 0, w: 0.02, h: 0.65, d: 0.18, color: "#1a1d24" },
    { x: -0.09, y: 2.7, z: 0, w: 0.02, h: 0.18, d: 0.65, color: "#1a1d24" },
  ];
  return parts;
}

/**
 * Cross-traffic car: specifically proportioned with a distinct LOW FRONT HOOD
 * (height ~0.76m, jumpable) vs TALL CABIN & ROOF (height ~1.52m, unjumpable).
 * In this local frame: +x is FRONT (hood), -x is REAR (trunk), width along z.
 */
export function crossingCarParts(variant: number): Part[] {
  const v = Math.abs(variant) % 8;
  const glass = "#a8d8f8";
  const darkTire = "#22242a";
  const rim = "#c2c8d2";
  const chrome = "#cbd2dc";

  // Polisi: body hitam-putih
  const isPolice = v === 1;
  const isTaxi = v === 2;
  const isTruck = v === 3;
  const isKeiTruck = v === 5;

  const color = isPolice
    ? "#16181d"
    : isTaxi
      ? "#f4c430"
      : isTruck
        ? "#1976d2"
        : isKeiTruck
          ? "#f4f6fa"
          : CAR_COLORS[variant % CAR_COLORS.length];

  const parts: Part[] = [
    // --- 1. CHASSIS / LOWER BODY ---
    { x: 0, y: 0.42, z: 0, w: 3.25, h: 0.36, d: 1.6, color },

    // --- 2. SISI BODY DEPAN / LOW FRONT HOOD ---
    { x: 1.05, y: 0.68, z: 0, w: 1.15, h: 0.22, d: 1.5, color: isPolice ? "#f8fafd" : color },
    // Hood center air vent / styling line
    { x: 1.05, y: 0.8, z: 0, w: 0.7, h: 0.04, d: 0.4, color: "#1a1c22" },
    // Front grille
    { x: 1.64, y: 0.52, z: 0, w: 0.04, h: 0.18, d: 0.85, color: "#1f2229" },
    // Headlights (beaming forward at +x)
    { x: 1.64, y: 0.64, z: 0.52, w: 0.06, h: 0.18, d: 0.32, color: "#fffbe6" },
    { x: 1.64, y: 0.64, z: -0.52, w: 0.06, h: 0.18, d: 0.32, color: "#fffbe6" },

    // --- 3. HIGH CABIN & ROOF ---
    { x: -0.22, y: 1.15, z: 0, w: 1.55, h: 0.56, d: 1.36, color: isPolice ? "#f8fafd" : color },
    // Sloped Windshield
    { x: 0.58, y: 1.12, z: 0, w: 0.12, h: 0.44, d: 1.2, color: glass },
    // Rear windshield
    { x: -1.02, y: 1.12, z: 0, w: 0.1, h: 0.42, d: 1.2, color: glass },
    // Side windows
    { x: -0.22, y: 1.15, z: 0.69, w: 1.25, h: 0.38, d: 0.04, color: glass },
    { x: -0.22, y: 1.15, z: -0.69, w: 1.25, h: 0.38, d: 0.04, color: glass },

    // --- 4. REAR TRUNK ---
    { x: -1.28, y: 0.68, z: 0, w: 0.65, h: 0.22, d: 1.5, color: isPolice ? "#f8fafd" : color },
    // Taillights
    { x: -1.64, y: 0.64, z: 0.52, w: 0.06, h: 0.16, d: 0.3, color: "#ff2a2a" },
    { x: -1.64, y: 0.64, z: -0.52, w: 0.06, h: 0.16, d: 0.3, color: "#ff2a2a" },

    // --- 5. WHEELS & HUBS ---
    { x: 1.0, y: 0.29, z: 0.74, w: 0.58, h: 0.58, d: 0.26, color: darkTire },
    { x: 1.0, y: 0.29, z: -0.74, w: 0.58, h: 0.58, d: 0.26, color: darkTire },
    { x: 1.0, y: 0.29, z: 0.86, w: 0.26, h: 0.26, d: 0.04, color: rim },
    { x: 1.0, y: 0.29, z: -0.86, w: 0.26, h: 0.26, d: 0.04, color: rim },
    { x: -1.0, y: 0.29, z: 0.74, w: 0.58, h: 0.58, d: 0.26, color: darkTire },
    { x: -1.0, y: 0.29, z: -0.74, w: 0.58, h: 0.58, d: 0.26, color: darkTire },
    { x: -1.0, y: 0.29, z: 0.86, w: 0.26, h: 0.26, d: 0.04, color: rim },
    { x: -1.0, y: 0.29, z: -0.86, w: 0.26, h: 0.26, d: 0.04, color: rim },
  ];

  // Fitur khusus POLISI di perempatan (Lampu sirene merah/biru nyala!)
  if (isPolice) {
    parts.push(
      { x: -0.22, y: 1.45, z: 0, w: 0.2, h: 0.05, d: 0.88, color: chrome },
      { x: -0.22, y: 1.54, z: 0.26, w: 0.24, h: 0.14, d: 0.28, color: "#ff1e27", glow: true },
      { x: -0.22, y: 1.54, z: -0.26, w: 0.24, h: 0.14, d: 0.28, color: "#0066ff", glow: true },
      { x: -0.22, y: 1.52, z: 0, w: 0.18, h: 0.1, d: 0.16, color: "#3a3e47" },
      { x: -0.15, y: 0.65, z: 0.81, w: 0.32, h: 0.2, d: 0.02, color: "#ffd700" },
      { x: -0.15, y: 0.65, z: -0.81, w: 0.32, h: 0.2, d: 0.02, color: "#ffd700" },
      { x: 1.66, y: 0.52, z: 0, w: 0.08, h: 0.36, d: 0.88, color: "#22242a" },
    );
  }

  // Fitur khusus TAXI di perempatan (Mahkota lampu TAXI menyala!)
  if (isTaxi) {
    parts.push(
      { x: -0.22, y: 1.45, z: 0, w: 0.28, h: 0.05, d: 0.44, color: chrome },
      { x: -0.22, y: 1.56, z: 0, w: 0.34, h: 0.18, d: 0.52, color: "#fffbe6", glow: true },
      { x: -0.22, y: 1.56, z: 0, w: 0.36, h: 0.08, d: 0.36, color: "#e63946" },
      { x: -0.15, y: 0.64, z: 0.81, w: 2.2, h: 0.1, d: 0.02, color: "#ffffff" },
      { x: -0.15, y: 0.64, z: -0.81, w: 2.2, h: 0.1, d: 0.02, color: "#ffffff" },
    );
  }

  // Fitur khusus TRUCK di perempatan (Box kontainer tinggi di bagian belakang!)
  if (isTruck) {
    parts.push(
      { x: -0.75, y: 1.45, z: 0, w: 2.2, h: 1.35, d: 1.72, color: "#f1f3f6" },
      { x: -0.75, y: 2.15, z: 0, w: 2.24, h: 0.06, d: 1.76, color: "#b0b8c4" },
      { x: -1.86, y: 1.45, z: 0, w: 0.04, h: 1.25, d: 1.52, color: "#d8dde4" },
      { x: 0.55, y: 1.62, z: 0, w: 0.65, h: 0.25, d: 1.35, color: "#ffffff" }, // aerocap kabin
    );
  }

  // Fitur khusus KEI TRUCK / PICKUP di perempatan (Bak terbuka belakang dengan muatan kardus)
  if (isKeiTruck) {
    parts.push(
      { x: -0.7, y: 0.68, z: 0, w: 2.1, h: 0.38, d: 1.54, color: "#f4f6fa" },
      { x: -0.4, y: 0.95, z: 0.2, w: 0.7, h: 0.45, d: 0.6, color: "#c89a58" },
      { x: -0.4, y: 0.95, z: -0.25, w: 0.65, h: 0.5, d: 0.55, color: "#a67c48" },
      { x: -1.1, y: 0.9, z: 0, w: 0.75, h: 0.4, d: 1.1, color: "#3a86c8" },
    );
  }

  return parts;
}

/* ---------- NOS ---------- */

/**
 * ROCKET — item LANGKA (jarang muncul). Bentuknya roket emas-ungu-putih dengan jendela
 * biru, sirip emas, dan moncong merah; nyalanya menyala di bagian bawah.
 * Dipakai pick-up `engine.rockets`: sekali ambil langsung NOS penuh + skor besar.
 */
export function rocketParts(): Part[] {
  const white = "#f4f6fa";
  const gold = "#ffc93c";
  const goldDark = "#d69a12";
  const purple = "#7b3ff2";
  const red = "#e63946";
  const dark = "#2b2f38";
  return [
    // ---- nozzle + nyala ----
    { x: 0, y: 0.06, z: 0, w: 0.2, h: 0.12, d: 0.2, color: dark },
    { x: 0, y: 0.16, z: 0, w: 0.14, h: 0.12, d: 0.14, color: "#ff8c1a" },
    { x: 0, y: 0.25, z: 0, w: 0.09, h: 0.12, d: 0.09, color: "#ffe066" },
    // ---- sirip emas (4 arah) ----
    { x: 0, y: 0.34, z: 0.19, w: 0.06, h: 0.3, d: 0.22, color: gold },
    { x: 0, y: 0.34, z: -0.19, w: 0.06, h: 0.3, d: 0.22, color: gold },
    { x: 0.19, y: 0.34, z: 0, w: 0.22, h: 0.3, d: 0.06, color: gold },
    { x: -0.19, y: 0.34, z: 0, w: 0.22, h: 0.3, d: 0.06, color: gold },
    // ---- badan roket ----
    { x: 0, y: 0.62, z: 0, w: 0.3, h: 0.46, d: 0.3, color: white },
    { x: 0, y: 0.46, z: 0, w: 0.33, h: 0.08, d: 0.33, color: goldDark }, // ring bawah
    { x: 0, y: 0.62, z: 0, w: 0.31, h: 0.1, d: 0.31, color: purple }, // pita ungu
    { x: 0, y: 0.78, z: 0, w: 0.31, h: 0.04, d: 0.31, color: gold }, // garis emas
    // jendela kokpit
    { x: 0.16, y: 0.66, z: 0, w: 0.04, h: 0.14, d: 0.14, color: "#65d6ff" },
    { x: 0.17, y: 0.66, z: 0.02, w: 0.02, h: 0.06, d: 0.05, color: "#eaf9ff" },
    // ---- moncong meruncing ke atas (merah + emas) ----
    { x: 0, y: 0.9, z: 0, w: 0.3, h: 0.1, d: 0.3, color: red },
    { x: 0, y: 0.99, z: 0, w: 0.22, h: 0.09, d: 0.22, color: red },
    { x: 0, y: 1.06, z: 0, w: 0.14, h: 0.08, d: 0.14, color: red },
    { x: 0, y: 1.126, z: 0, w: 0.07, h: 0.07, d: 0.07, color: gold },
    // bintang emas kecil di badan (tanda item berharga)
    { x: 0, y: 0.7, z: -0.16, w: 0.14, h: 0.14, d: 0.03, color: gold },
    { x: 0, y: 0.7, z: -0.17, w: 0.05, h: 0.05, d: 0.02, color: "#fff3c4" },
  ];
}

/** Item LANGKA #2: berlian raksasa (biru-cyan) — hadiah skor paling gede. */
export function diamondParts(): Part[] {
  const cyan = "#4fd8ff";
  const cyanDark = "#1899c9";
  const white = "#eaf9ff";
  const gold = "#ffc93c";
  return [
    // alas emas kecil
    { x: 0, y: 0.03, z: 0, w: 0.34, h: 0.06, d: 0.34, color: gold },
    { x: 0, y: 0.08, z: 0, w: 0.24, h: 0.05, d: 0.24, color: "#d69a12" },
    // badan berlian: piramida bertingkat (atas -> bawah)
    { x: 0, y: 0.86, z: 0, w: 0.08, h: 0.1, d: 0.08, color: white },
    { x: 0, y: 0.74, z: 0, w: 0.16, h: 0.14, d: 0.16, color: cyan },
    { x: 0, y: 0.58, z: 0, w: 0.26, h: 0.18, d: 0.26, color: cyan },
    { x: 0, y: 0.38, z: 0, w: 0.34, h: 0.22, d: 0.34, color: cyan },
    { x: 0, y: 0.22, z: 0, w: 0.28, h: 0.14, d: 0.28, color: cyanDark },
    // kilap / facet terang
    { x: 0.09, y: 0.6, z: 0.13, w: 0.08, h: 0.24, d: 0.04, color: white },
    { x: -0.13, y: 0.42, z: -0.09, w: 0.05, h: 0.18, d: 0.05, color: white },
    { x: 0, y: 0.44, z: -0.18, w: 0.1, h: 0.1, d: 0.02, color: "#bdf1ff" },
  ];
}

/** Item LANGKA #3 (paling jarang): mahkota emas — jackpot NOS + skor. */
export function crownParts(): Part[] {
  const white = "#eaf9ff";
  const gold = "#ffc93c";
  const goldDark = "#d69a12";
  const red = "#e63946";
  const purple = "#7b3ff2";
  const gem = "#ff5ea8";
  return [
    // bantalan mahkota
    { x: 0, y: 0.1, z: 0, w: 0.46, h: 0.2, d: 0.46, color: gold },
    { x: 0, y: 0.22, z: 0, w: 0.42, h: 0.06, d: 0.42, color: goldDark },
    { x: 0, y: 0.05, z: 0, w: 0.42, h: 0.08, d: 0.42, color: purple }, // kain ungu
    // 4 gigi mahkota
    { x: 0, y: 0.42, z: 0, w: 0.1, h: 0.32, d: 0.1, color: gold },
    { x: 0.19, y: 0.36, z: 0, w: 0.1, h: 0.24, d: 0.1, color: goldDark },
    { x: -0.19, y: 0.36, z: 0, w: 0.1, h: 0.24, d: 0.1, color: goldDark },
    { x: 0, y: 0.36, z: 0.19, w: 0.1, h: 0.24, d: 0.1, color: goldDark },
    { x: 0, y: 0.36, z: -0.19, w: 0.1, h: 0.24, d: 0.1, color: goldDark },
    // bola-bola di ujung gigi
    { x: 0, y: 0.62, z: 0, w: 0.09, h: 0.09, d: 0.09, color: "#fff3c4" },
    { x: 0.19, y: 0.52, z: 0, w: 0.08, h: 0.08, d: 0.08, color: white },
    { x: -0.19, y: 0.52, z: 0, w: 0.08, h: 0.08, d: 0.08, color: white },
    { x: 0, y: 0.52, z: 0.19, w: 0.08, h: 0.08, d: 0.08, color: red },
    { x: 0, y: 0.52, z: -0.19, w: 0.08, h: 0.08, d: 0.08, color: red },
    // permata di ikat pinggang mahkota
    { x: 0, y: 0.11, z: 0.24, w: 0.14, h: 0.14, d: 0.03, color: gem },
    { x: 0.24, y: 0.11, z: 0, w: 0.03, h: 0.14, d: 0.14, color: gem },
    { x: -0.24, y: 0.11, z: 0, w: 0.03, h: 0.14, d: 0.14, color: gem },
  ];
}

/** Nitro canister pickup: blue bottle with a yellow "N" band and a red valve. */
export function nosCanParts(): Part[] {
  const blue = "#1e88e5";
  return [
    { x: 0, y: 0.32, z: 0, w: 0.34, h: 0.64, d: 0.34, color: blue },
    { x: 0, y: 0.32, z: 0, w: 0.36, h: 0.16, d: 0.36, color: "#ffd21f" },
    { x: 0, y: 0.32, z: 0.181, w: 0.16, h: 0.12, d: 0.02, color: "#1f2430" },
    { x: 0, y: 0.32, z: -0.181, w: 0.16, h: 0.12, d: 0.02, color: "#1f2430" },
    { x: 0, y: 0.68, z: 0, w: 0.22, h: 0.08, d: 0.22, color: "#9aa3ad" },
    { x: 0, y: 0.78, z: 0, w: 0.1, h: 0.14, d: 0.1, color: "#e63946" },
    { x: 0, y: 0.03, z: 0, w: 0.3, h: 0.06, d: 0.3, color: "#0d47a1" },
  ];
}

/** Twin nitro tanks strapped under the tail of the deck (rendered on the board when NOS is available). */
export function nosTankParts(): Part[] {
  const p: Part[] = [];
  for (const z of [-0.14, 0.14]) {
    p.push({ x: -0.55, y: 0.09, z, w: 0.34, h: 0.12, d: 0.12, color: "#1e88e5" });
    p.push({ x: -0.55, y: 0.09, z, w: 0.1, h: 0.13, d: 0.13, color: "#ffd21f" });
    p.push({ x: -0.75, y: 0.09, z, w: 0.08, h: 0.08, d: 0.08, color: "#9aa3ad" });
  }
  return p;
}

/* ---------- Sakura (cherry blossom) ---------- */

/** Deterministic pseudo-random for stable per-variant shapes. */
function srand(seed: number) {
  let t = seed * 9301 + 49297;
  return () => {
    t = (t * 9301 + 49297) % 233280;
    return t / 233280;
  };
}

/**
 * Cherry tree in the voxel style: dark, slightly leaning trunk that forks into 3–4 branches, each carrying a
 * cluster of blossom "puffs" in three pinks (deeper in the shade, pale on the sunlit crown) with a few
 * white highlight blossoms. Variants 0–3 change the silhouette; `scale` lets big park trees tower a bit.
 */
export function sakuraParts(variant: number, scale = 1): Part[] {
  const rnd = srand(variant + 1);
  const parts: Part[] = [];
  const bark = "#4a3226";
  const bark2 = "#5b3f30";
  const pinks = ["#ff9ec7", "#ffb7d5", "#ffd1e3"]; // deep -> pale
  const white = "#fff0f6";
  const S = scale;
  // trunk with a gentle lean and a thicker base
  const lean = (rnd() - 0.5) * 0.5;
  parts.push({ x: 0, y: 0.15 * S, z: 0, w: 0.5 * S, h: 0.3 * S, d: 0.5 * S, color: bark });
  parts.push({ x: lean * 0.3 * S, y: 0.9 * S, z: 0, w: 0.36 * S, h: 1.5 * S, d: 0.36 * S, color: bark2, rz: -lean * 0.4 });
  parts.push({ x: lean * 0.6 * S, y: 1.75 * S, z: 0, w: 0.3 * S, h: 0.6 * S, d: 0.3 * S, color: bark });
  // branches fan out from the fork; each ends in a blossom cluster
  const nB = 3 + (variant % 2);
  const clusters: { x: number; y: number; z: number; r: number }[] = [];
  for (let i = 0; i < nB; i++) {
    const a = (i / nB) * Math.PI * 2 + rnd() * 0.8;
    const len = (0.9 + rnd() * 0.5) * S;
    const dx = Math.cos(a) * len;
    const dz = Math.sin(a) * len;
    const up = (0.5 + rnd() * 0.4) * S;
    parts.push({ x: lean * 0.6 * S + dx * 0.5, y: 2.0 * S + up * 0.5, z: dz * 0.5, w: 0.16 * S, h: Math.hypot(len, up) + 0.1 * S, d: 0.16 * S, rz: Math.atan2(dx, up), rx: -Math.atan2(dz, up) * 0.9, color: bark2 });
    clusters.push({ x: lean * 0.6 * S + dx, y: 2.0 * S + up, z: dz, r: (0.9 + rnd() * 0.35) * S });
  }
  // central crown cluster on top
  clusters.push({ x: lean * 0.6 * S, y: 2.75 * S, z: 0, r: 1.25 * S });
  // blossom puffs: each cluster = a big soft block + smaller stepped blocks (voxel "cloud")
  for (const c of clusters) {
    const r = c.r;
    parts.push({ x: c.x, y: c.y, z: c.z, w: r * 1.6, h: r * 0.9, d: r * 1.6, color: pinks[0] });
    parts.push({ x: c.x, y: c.y + r * 0.35, z: c.z, w: r * 1.25, h: r * 0.6, d: r * 1.25, color: pinks[1] });
    parts.push({ x: c.x + (rnd() - 0.5) * r * 0.5, y: c.y + r * 0.65, z: c.z + (rnd() - 0.5) * r * 0.5, w: r * 0.75, h: r * 0.45, d: r * 0.75, color: pinks[2] });
    // side bumps for a fluffy silhouette
    for (let k = 0; k < 3; k++) {
      const a = rnd() * Math.PI * 2;
      parts.push({ x: c.x + Math.cos(a) * r * 0.7, y: c.y + (rnd() - 0.3) * r * 0.4, z: c.z + Math.sin(a) * r * 0.7, w: r * 0.55, h: r * 0.5, d: r * 0.55, color: rnd() < 0.5 ? pinks[1] : pinks[0] });
    }
    // sparkling white blossoms
    for (let k = 0; k < 2; k++) {
      const a = rnd() * Math.PI * 2;
      parts.push({ x: c.x + Math.cos(a) * r * 0.6, y: c.y + r * 0.55, z: c.z + Math.sin(a) * r * 0.6, w: 0.16 * S, h: 0.16 * S, d: 0.16 * S, color: white });
    }
  }
  // fallen petals ring around the base
  for (let k = 0; k < 6; k++) {
    const a = rnd() * Math.PI * 2;
    const rr = (0.6 + rnd() * 1.1) * S;
    parts.push({ x: Math.cos(a) * rr, y: 0.012, z: Math.sin(a) * rr, w: 0.22, h: 0.02, d: 0.16, ry: rnd() * 3, color: rnd() < 0.5 ? pinks[1] : pinks[2] });
  }
  return parts;
}

/** Little stone lantern (灯籠) that goes with the sakura promenade. */
export function stoneLanternParts(): Part[] {
  const stone = "#b8b4ad";
  const dark = "#8e8a83";
  return [
    { x: 0, y: 0.1, z: 0, w: 0.6, h: 0.2, d: 0.6, color: dark },
    { x: 0, y: 0.55, z: 0, w: 0.22, h: 0.7, d: 0.22, color: stone },
    { x: 0, y: 0.95, z: 0, w: 0.5, h: 0.1, d: 0.5, color: dark },
    { x: 0, y: 1.2, z: 0, w: 0.4, h: 0.4, d: 0.4, color: stone },
    { x: 0, y: 1.2, z: 0.2, w: 0.16, h: 0.16, d: 0.04, color: "#ffe9a3" },
    { x: 0.2, y: 1.2, z: 0, w: 0.04, h: 0.16, d: 0.16, color: "#ffe9a3" },
    { x: 0, y: 1.48, z: 0, w: 0.64, h: 0.14, d: 0.64, color: dark },
    { x: 0, y: 1.62, z: 0, w: 0.4, h: 0.14, d: 0.4, color: dark },
    { x: 0, y: 1.76, z: 0, w: 0.16, h: 0.14, d: 0.16, color: stone },
  ];
}

/** A single falling petal (tiny slab); instanced by the renderer. */
export function petalParts(): Part[] {
  return [{ x: 0, y: 0, z: 0, w: 0.14, h: 0.03, d: 0.1, color: "#ff6fa9" }];
}

/* ---------- Japanese street buildings ---------- */
// All face +z (toward the road), front wall at z = 0, extending toward -z. Width along x.

const WOOD = "#6b4a2b";
const WOOD_D = "#4a3220";
const PLASTER = "#f3ead8";
const TILE = "#5b6470";
const TILE_D = "#454c56";
const SHOJI = "#fff7e6";

/** Tiled Japanese roof (kawara) with ridge, eave overhang and stepped slope. Origin at the top of the wall. */
function kawaraRoof(x: number, y: number, z: number, w: number, depth: number, height: number, color = TILE, ridge = TILE_D): Part[] {
  const parts: Part[] = [];
  const steps = 4;
  for (let i = 0; i < steps; i++) {
    const k = i / steps;
    const ww = w + 0.7 - k * 0.7;
    const dd = depth + 0.7 - k * 0.7;
    parts.push({ x, y: y + (height * i) / steps + height / steps / 2, z: z - depth / 2, w: ww, h: height / steps + 0.01, d: dd, color: i % 2 ? color : "#666f7b" });
  }
  // ridge beam + end caps
  parts.push({ x, y: y + height + 0.08, z: z - depth / 2, w: w + 0.2, h: 0.16, d: 0.3, color: ridge });
  parts.push({ x: x - w / 2 - 0.08, y: y + height + 0.1, z: z - depth / 2, w: 0.2, h: 0.24, d: 0.36, color: ridge });
  parts.push({ x: x + w / 2 + 0.08, y: y + height + 0.1, z: z - depth / 2, w: 0.2, h: 0.24, d: 0.36, color: ridge });
  // eave board
  parts.push({ x, y: y - 0.06, z: z + 0.36, w: w + 0.8, h: 0.1, d: 0.14, color: WOOD_D });
  return parts;
}

/** Red paper lantern (chōchin). */
function chochin(x: number, y: number, z: number, color = "#e63946"): Part[] {
  return [
    { x, y: y + 0.02, z, w: 0.3, h: 0.36, d: 0.3, color },
    { x, y: y + 0.02, z, w: 0.34, h: 0.06, d: 0.34, color: "#1f2430" },
    { x, y: y + 0.24, z, w: 0.18, h: 0.06, d: 0.18, color: "#1f2430" },
    { x, y: y - 0.2, z, w: 0.18, h: 0.06, d: 0.18, color: "#1f2430" },
    { x, y: y + 0.02, z: z + 0.16, w: 0.12, h: 0.14, d: 0.02, color: "#ffffff" },
  ];
}

/** Noren curtain with slits hanging over a door. */
function noren(x: number, y: number, z: number, w: number, color: string): Part[] {
  const parts: Part[] = [{ x, y: y + 0.28, z, w, h: 0.14, d: 0.06, color }];
  const n = 3;
  const sw = w / n;
  for (let i = 0; i < n; i++) parts.push({ x: x - w / 2 + sw * (i + 0.5), y: y - 0.05, z: z + (i % 2) * 0.02, w: sw - 0.06, h: 0.56, d: 0.05, color });
  parts.push({ x, y: y - 0.02, z: z + 0.035, w: 0.22, h: 0.22, d: 0.02, color: "#ffffff" }); // shop crest
  return parts;
}

/** Ramen shop: authentic Shibuya Blocks voxel Ramen-ya with curved tile roof, ramen counter, bowls, noren, and lanterns. */
export function ramenShopParts(): Part[] {
  return getShibuyaBuildingParts("ramen");
}

/** Traditional merchant shop (machiya): dark wood lattice (kōshi) front, indigo noren, tiled roof, display shelf. */
export function machiyaShopParts(variant = 0): Part[] {
  const W = 5.4;
  const D = 4.5;
  const norenColor = variant % 2 ? "#1d3557" : "#2a9d8f";
  const parts: Part[] = [
    { x: 0, y: -0.95, z: -D / 2, w: W + 0.15, h: 2.5, d: D + 0.15, color: "#8e8a83" },
    { x: 0, y: 1.5, z: -D / 2, w: W, h: 3.0, d: D, color: PLASTER },
    { x: 0, y: 0.95, z: 0.03, w: W, h: 1.9, d: 0.08, color: WOOD_D }, // dark wood ground floor
    // door opening with warm light
    { x: 1.5, y: 0.95, z: 0.08, w: 1.1, h: 1.7, d: 0.04, color: "#ffd98a" },
  ];
  // kōshi lattice: vertical slats across the left half
  for (let i = 0; i < 9; i++) parts.push({ x: -2.4 + i * 0.3, y: 1.0, z: 0.1, w: 0.08, h: 1.6, d: 0.06, color: WOOD });
  parts.push({ x: -1.2, y: 1.0, z: 0.14, w: 2.6, h: 0.06, d: 0.06, color: WOOD });
  parts.push({ x: -1.2, y: 1.6, z: 0.14, w: 2.6, h: 0.06, d: 0.06, color: WOOD });
  parts.push({ x: -1.2, y: 0.4, z: 0.14, w: 2.6, h: 0.06, d: 0.06, color: WOOD });
  // display shelf with goods (tea tins / pottery)
  parts.push({ x: -1.2, y: 0.5, z: 0.5, w: 2.4, h: 0.08, d: 0.5, color: WOOD });
  for (let i = 0; i < 5; i++) parts.push({ x: -2.1 + i * 0.45, y: 0.68, z: 0.5, w: 0.22, h: 0.28, d: 0.22, color: ["#e76f51", "#264653", "#e9c46a", "#2a9d8f", "#f4a261"][i] });
  // white plaster upper floor with a small mushiko (slatted) window band
  for (let i = 0; i < 12; i++) parts.push({ x: -2.2 + i * 0.4, y: 2.55, z: 0.05, w: 0.14, h: 0.6, d: 0.08, color: WOOD_D });
  // hanging shop sign board (vertical) + noren
  parts.push({ x: 2.55, y: 1.9, z: 0.35, w: 0.36, h: 1.3, d: 0.1, color: "#f3ead8" });
  parts.push({ x: 2.55, y: 2.2, z: 0.41, w: 0.2, h: 0.2, d: 0.02, color: "#1f2430" });
  parts.push({ x: 2.55, y: 1.85, z: 0.41, w: 0.2, h: 0.2, d: 0.02, color: "#1f2430" });
  parts.push({ x: 2.55, y: 1.5, z: 0.41, w: 0.2, h: 0.2, d: 0.02, color: "#1f2430" });
  parts.push(...noren(1.5, 1.6, 0.2, 1.2, norenColor));
  // small tiled awning (hisashi) over the ground floor
  parts.push({ x: 0, y: 2.0, z: 0.4, w: W + 0.3, h: 0.1, d: 0.85, color: TILE });
  parts.push({ x: 0, y: 2.05, z: 0.75, w: W + 0.3, h: 0.06, d: 0.18, color: TILE_D });
  parts.push(...kawaraRoof(0, 3.0, 0, W, D, 0.85));
  parts.push(...chochin(-2.5, 1.55, 0.5, "#f4f1de"));
  return parts;
}

/** Traditional Japanese house (minka): low hip roof, shōji screens, engawa veranda, wooden fence, garden stone. */
export function japaneseHouseParts(variant = 0): Part[] {
  const W = 5.4;
  const D = 4.5;
  const wall = variant % 2 ? "#efe6d2" : "#e8dfc9";
  const parts: Part[] = [
    { x: 0, y: -0.95, z: -D / 2, w: W + 0.15, h: 2.5, d: D + 0.15, color: "#8e8a83" },
    // raised floor on posts
    { x: 0, y: 0.32, z: -D / 2, w: W - 0.4, h: 0.16, d: D + 0.6, color: WOOD_D },
    { x: 0, y: 1.35, z: -D / 2 - 0.3, w: W - 0.8, h: 1.9, d: D - 0.6, color: wall },
    // shōji screens along the front (paper with wooden grid)
    { x: -0.9, y: 1.3, z: -0.55, w: 1.5, h: 1.6, d: 0.06, color: SHOJI },
    { x: 0.9, y: 1.3, z: -0.55, w: 1.5, h: 1.6, d: 0.06, color: SHOJI },
  ];
  for (let i = -3; i <= 3; i++) parts.push({ x: i * 0.5, y: 1.3, z: -0.51, w: 0.04, h: 1.6, d: 0.02, color: WOOD_D });
  for (let j = 0; j < 4; j++) parts.push({ x: 0, y: 0.6 + j * 0.47, z: -0.51, w: 3.4, h: 0.04, d: 0.02, color: WOOD_D });
  // corner posts + engawa (veranda) deck
  for (const x of [-2.2, 2.2]) parts.push({ x, y: 1.3, z: -0.5, w: 0.14, h: 1.9, d: 0.14, color: WOOD_D });
  parts.push({ x: 0, y: 0.42, z: 0.05, w: W - 0.4, h: 0.1, d: 1.0, color: WOOD });
  for (let i = 0; i < 4; i++) parts.push({ x: -1.8 + i * 1.2, y: 0.2, z: 0.4, w: 0.12, h: 0.36, d: 0.12, color: WOOD_D });
  // stepping stone + cushions on the engawa
  parts.push({ x: 0.6, y: 0.08, z: 0.9, w: 0.7, h: 0.16, d: 0.5, color: "#9aa3ad" });
  parts.push({ x: -1.4, y: 0.52, z: 0.1, w: 0.4, h: 0.1, d: 0.4, color: "#c1121f" });
  parts.push({ x: 1.6, y: 0.52, z: 0.1, w: 0.4, h: 0.1, d: 0.4, color: "#1d3557" });
  // big overhanging hip roof (two tiers)
  parts.push(...kawaraRoof(0, 2.35, 0.3, W - 0.2, D - 0.2, 1.2, "#6b7280", "#4b5563"));
  parts.push({ x: 0, y: 2.3, z: 0.25, w: W + 0.6, h: 0.14, d: 1.0, color: "#6b7280" }); // deep front eave
  // low wooden fence with a gate along the sidewalk edge
  for (let i = 0; i < 7; i++) if (i !== 3) parts.push({ x: -2.4 + i * 0.8, y: 0.45, z: 1.35, w: 0.1, h: 0.9, d: 0.1, color: WOOD });
  parts.push({ x: -1.6, y: 0.75, z: 1.35, w: 2.4, h: 0.08, d: 0.06, color: WOOD });
  parts.push({ x: 1.6, y: 0.75, z: 1.35, w: 2.4, h: 0.08, d: 0.06, color: WOOD });
  parts.push({ x: -1.6, y: 0.35, z: 1.35, w: 2.4, h: 0.08, d: 0.06, color: WOOD });
  parts.push({ x: 1.6, y: 0.35, z: 1.35, w: 2.4, h: 0.08, d: 0.06, color: WOOD });
  // garden: small pine + stone lantern beside the gate
  parts.push({ x: -2.0, y: 0.5, z: 0.7, w: 0.16, h: 1.0, d: 0.16, color: WOOD_D });
  parts.push({ x: -2.0, y: 1.1, z: 0.7, w: 0.9, h: 0.4, d: 0.9, color: "#2f855a" });
  parts.push({ x: -2.0, y: 1.45, z: 0.7, w: 0.55, h: 0.3, d: 0.55, color: "#38a169" });
  parts.push({ x: 2.1, y: 0.4, z: 0.75, w: 0.24, h: 0.6, d: 0.24, color: "#b8b4ad" });
  parts.push({ x: 2.1, y: 0.8, z: 0.75, w: 0.5, h: 0.14, d: 0.5, color: "#8e8a83" });
  return parts;
}

/**
 * Traditional multi-story Japanese village houses / inns (gedung tingkat rumah khas jepang desa):
 * 2-story and 3-story traditional wooden architecture with exposed dark timber framing, plaster/clay walls,
 * multiple intermediate tiled eave roofs (hisashi), wooden balconies with delicate railings (kōran),
 * sliding shōji screens with warm ambient lighting, engawa verandas, hanging chōchin lanterns,
 * and flared hip-and-gable kawara tile roofs with ridge-beam crests.
 * Faces +z (toward the road), front facade at z = 0, extending toward -z.
 */
export function japaneseVillageHouseParts(variant = 0): Part[] {
  const parts: Part[] = [];
  const v = Math.abs(variant) % 3;

  if (v === 1) {
    // ---- VARIANT 1: 3-STOREY JAPANESE VILLAGE RYOKAN / TOWER INN (三階建て和風旅館) ----
    const W = 5.8;
    const D = 4.8;
    // Foundation stone
    parts.push({ x: 0, y: -0.95, z: -D / 2, w: W + 0.3, h: 2.5, d: D + 0.3, color: "#7e7a73" });
    parts.push({ x: 0, y: 0.15, z: -D / 2, w: W + 0.1, h: 0.3, d: D + 0.1, color: "#9e9a93" });

    // --- FLOOR 1 (Ground Floor: y = 0.3 to 2.4) ---
    parts.push({ x: 0, y: 1.35, z: -D / 2, w: W, h: 2.1, d: D, color: PLASTER });
    // Heavy corner and center timber pillars (yakisugi dark wood)
    for (const sx of [-W / 2 + 0.1, W / 2 - 0.1]) {
      parts.push({ x: sx, y: 1.35, z: 0.05, w: 0.22, h: 2.1, d: 0.22, color: WOOD_D });
    }
    // Dark timber skirting and horizontal tie-beam
    parts.push({ x: 0, y: 0.45, z: 0.06, w: W, h: 0.3, d: 0.12, color: WOOD_D });
    parts.push({ x: 0, y: 2.3, z: 0.06, w: W, h: 0.16, d: 0.14, color: WOOD_D });

    // Entrance sliding doors (Genkan) with wooden lattice and warm glowing panes
    parts.push({ x: -0.8, y: 1.25, z: 0.08, w: 1.8, h: 1.7, d: 0.08, color: "#3a2516" });
    parts.push({ x: -0.8, y: 1.35, z: 0.12, w: 1.5, h: 1.3, d: 0.04, color: "#ffeab0" });
    // Grid slats over entry shoji
    for (let k = 0; k < 4; k++) parts.push({ x: -1.35 + k * 0.36, y: 1.35, z: 0.14, w: 0.04, h: 1.3, d: 0.02, color: "#3a2516" });
    for (let j = 0; j < 3; j++) parts.push({ x: -0.8, y: 0.9 + j * 0.45, z: 0.14, w: 1.5, h: 0.04, d: 0.02, color: "#3a2516" });

    // Indigo noren over entrance
    parts.push(...noren(-0.8, 2.05, 0.2, 1.6, "#1d3557"));

    // Right side: Engawa porch & ground floor window
    parts.push({ x: 1.6, y: 1.35, z: 0.08, w: 1.6, h: 1.1, d: 0.06, color: "#ffeab0" });
    for (let k = 0; k < 3; k++) parts.push({ x: 1.1 + k * 0.5, y: 1.35, z: 0.11, w: 0.05, h: 1.1, d: 0.03, color: WOOD });
    parts.push({ x: 1.6, y: 0.4, z: 0.5, w: 1.9, h: 0.14, d: 1.0, color: WOOD });
    parts.push({ x: 1.6, y: 0.1, z: 0.8, w: 0.7, h: 0.2, d: 0.5, color: "#8e8a83" }); // stepping stone

    // Hanging lanterns flanking entrance
    parts.push(...chochin(-2.2, 1.85, 0.5, "#d92525"));
    parts.push(...chochin(0.6, 1.85, 0.5, "#d92525"));

    // --- INTERMEDIATE ROOF 1 (Tiled Eave between Floor 1 and Floor 2) ---
    parts.push({ x: 0, y: 2.45, z: 0.45, w: W + 0.6, h: 0.14, d: 1.1, color: TILE });
    parts.push({ x: 0, y: 2.52, z: 0.88, w: W + 0.6, h: 0.08, d: 0.25, color: TILE_D });
    for (let r = 0; r < 8; r++) parts.push({ x: -W / 2 + 0.4 + r * 0.72, y: 2.38, z: 0.4, w: 0.08, h: 0.08, d: 0.8, color: WOOD_D });

    // --- FLOOR 2 (Middle Floor: y = 2.55 to 4.7) ---
    const W2 = W - 0.2;
    const D2 = D - 0.2;
    parts.push({ x: 0, y: 3.65, z: -D2 / 2, w: W2, h: 2.1, d: D2, color: PLASTER });
    for (const sx of [-W2 / 2 + 0.1, W2 / 2 - 0.1, 0]) {
      parts.push({ x: sx, y: 3.65, z: 0.02, w: 0.18, h: 2.1, d: 0.18, color: WOOD_D });
    }
    // Floor 2 Wooden Balcony (Kōran)
    parts.push({ x: 0, y: 2.7, z: 0.35, w: W2 + 0.1, h: 0.1, d: 0.75, color: WOOD });
    parts.push({ x: 0, y: 3.25, z: 0.7, w: W2 + 0.1, h: 0.08, d: 0.08, color: WOOD_D });
    for (let b = 0; b < 9; b++) {
      parts.push({ x: -W2 / 2 + 0.2 + b * ((W2 - 0.4) / 8), y: 2.97, z: 0.7, w: 0.06, h: 0.48, d: 0.06, color: WOOD });
    }
    // Floor 2 Shoji windows
    parts.push({ x: -1.3, y: 3.75, z: 0.05, w: 1.6, h: 1.25, d: 0.05, color: "#ffeab0" });
    parts.push({ x: 1.3, y: 3.75, z: 0.05, w: 1.6, h: 1.25, d: 0.05, color: "#bfe8ff" });
    for (let k = 0; k < 3; k++) {
      parts.push({ x: -1.8 + k * 0.5, y: 3.75, z: 0.07, w: 0.04, h: 1.25, d: 0.02, color: WOOD_D });
      parts.push({ x: 0.8 + k * 0.5, y: 3.75, z: 0.07, w: 0.04, h: 1.25, d: 0.02, color: WOOD_D });
    }

    // Wooden sign "旅館" (Ryokan) on upper beam
    parts.push({ x: 0, y: 4.4, z: 0.1, w: 1.0, h: 0.35, d: 0.06, color: "#3a2516" });
    parts.push({ x: -0.22, y: 4.4, z: 0.14, w: 0.2, h: 0.22, d: 0.02, color: "#f5d47a" });
    parts.push({ x: 0.22, y: 4.4, z: 0.14, w: 0.2, h: 0.22, d: 0.02, color: "#f5d47a" });

    // --- INTERMEDIATE ROOF 2 (Tiled Eave between Floor 2 and Floor 3) ---
    parts.push({ x: 0, y: 4.75, z: 0.3, w: W2 + 0.6, h: 0.14, d: 1.0, color: TILE });
    parts.push({ x: 0, y: 4.82, z: 0.72, w: W2 + 0.6, h: 0.08, d: 0.22, color: TILE_D });

    // --- FLOOR 3 (Top Floor / Lookout Pavilion: y = 4.85 to 6.8) ---
    const W3 = W - 0.8;
    const D3 = D - 0.8;
    parts.push({ x: 0, y: 5.75, z: -D3 / 2 - 0.2, w: W3, h: 1.8, d: D3, color: PLASTER });
    for (const sx of [-W3 / 2 + 0.1, W3 / 2 - 0.1]) {
      parts.push({ x: sx, y: 5.75, z: -0.15, w: 0.16, h: 1.8, d: 0.16, color: WOOD_D });
    }
    // Floor 3 upper balcony
    parts.push({ x: 0, y: 5.0, z: 0.15, w: W3, h: 0.08, d: 0.65, color: WOOD });
    parts.push({ x: 0, y: 5.42, z: 0.45, w: W3, h: 0.06, d: 0.06, color: WOOD_D });
    for (let b = 0; b < 6; b++) parts.push({ x: -W3 / 2 + 0.2 + b * ((W3 - 0.4) / 5), y: 5.22, z: 0.45, w: 0.05, h: 0.38, d: 0.05, color: WOOD });
    // Floor 3 viewing windows
    parts.push({ x: 0, y: 5.9, z: -0.16, w: 2.2, h: 1.1, d: 0.05, color: "#ffeab0" });
    for (let k = 0; k < 4; k++) parts.push({ x: -0.9 + k * 0.6, y: 5.9, z: -0.13, w: 0.04, h: 1.1, d: 0.02, color: WOOD_D });

    // --- MAIN TOP ROOF (Grand Pagoda / Irimoya Roof) ---
    parts.push(...kawaraRoof(0, 6.75, -0.1, W3 + 0.4, D3 + 0.4, 1.3, "#4b5563", "#374151"));
    // Gold crest on roof peak
    parts.push({ x: 0, y: 8.25, z: -D3 / 2 - 0.3, w: 0.24, h: 0.32, d: 0.24, color: "#e0a943" });

    // Outdoor courtyard details
    parts.push({ x: 2.4, y: 1.3, z: 0.8, w: 0.14, h: 2.6, d: 0.14, color: WOOD_D });
    parts.push({ x: 2.4, y: 2.1, z: 0.8, w: 0.32, h: 1.1, d: 0.08, color: "#f4f1de" });
    parts.push({ x: 2.4, y: 2.25, z: 0.85, w: 0.18, h: 0.2, d: 0.02, color: "#111" });
    parts.push({ x: 2.4, y: 1.9, z: 0.85, w: 0.18, h: 0.2, d: 0.02, color: "#111" });
    parts.push({ x: -2.3, y: 0.35, z: 0.9, w: 0.4, h: 0.5, d: 0.4, color: "#8e8a83" });
    parts.push({ x: -2.3, y: 0.85, z: 0.9, w: 0.75, h: 0.45, d: 0.75, color: "#2f855a" });
    return parts;
  }

  if (v === 2) {
    // ---- VARIANT 2: 2.5-STOREY VILLAGE TEA HOUSE & MANOR (街道の茶屋・町屋風民家) ----
    const W = 6.2;
    const D = 4.8;
    parts.push({ x: 0, y: -0.95, z: -D / 2, w: W + 0.2, h: 2.5, d: D + 0.2, color: "#837f78" });
    parts.push({ x: 0, y: 0.12, z: -D / 2, w: W + 0.1, h: 0.24, d: D + 0.1, color: "#9c9890" });

    // --- FLOOR 1 (Ground Floor: y = 0.24 to 2.4) ---
    parts.push({ x: 0, y: 1.35, z: -D / 2, w: W, h: 2.2, d: D, color: "#ebe2cf" });
    for (const sx of [-W / 2 + 0.1, -0.6, 0.6, W / 2 - 0.1]) {
      parts.push({ x: sx, y: 1.35, z: 0.05, w: 0.2, h: 2.2, d: 0.2, color: "#3d2716" });
    }
    parts.push({ x: 0, y: 1.15, z: 0.08, w: 2.8, h: 1.6, d: 0.06, color: "#ffeab0" });
    parts.push(...noren(0, 1.85, 0.18, 2.6, "#2a9d8f"));

    // Red tea benches (chadokoro)
    parts.push({ x: -1.9, y: 0.38, z: 0.65, w: 1.5, h: 0.08, d: 0.6, color: "#c1121f" });
    parts.push({ x: -1.9, y: 0.18, z: 0.65, w: 1.4, h: 0.32, d: 0.5, color: WOOD_D });
    parts.push({ x: -1.5, y: 0.46, z: 0.65, w: 0.16, h: 0.1, d: 0.16, color: "#264653" });
    parts.push({ x: -1.8, y: 0.45, z: 0.65, w: 0.1, h: 0.06, d: 0.1, color: "#ffffff" });

    // Wooden barrels on right
    parts.push({ x: 2.2, y: 0.35, z: 0.6, w: 0.6, h: 0.6, d: 0.6, color: "#c49a62" });
    parts.push({ x: 2.2, y: 0.35, z: 0.6, w: 0.62, h: 0.1, d: 0.62, color: "#2a1b10" });
    parts.push({ x: 2.2, y: 0.85, z: 0.6, w: 0.5, h: 0.5, d: 0.5, color: "#c49a62" });

    // Ground floor intermediate eave roof
    parts.push({ x: 0, y: 2.4, z: 0.45, w: W + 0.6, h: 0.14, d: 1.05, color: TILE });
    parts.push({ x: 0, y: 2.46, z: 0.88, w: W + 0.6, h: 0.08, d: 0.22, color: TILE_D });

    // --- FLOOR 2 (Upper Floor: y = 2.5 to 4.7) ---
    parts.push({ x: 0, y: 3.65, z: -D / 2, w: W, h: 2.2, d: D, color: "#ebe2cf" });
    // Projecting bay window with vertical lattice (de-kōshi)
    parts.push({ x: -1.5, y: 3.6, z: 0.3, w: 2.2, h: 1.4, d: 0.55, color: WOOD_D });
    parts.push({ x: -1.5, y: 3.6, z: 0.58, w: 1.9, h: 1.1, d: 0.04, color: "#ffeab0" });
    for (let s = 0; s < 7; s++) parts.push({ x: -2.3 + s * 0.27, y: 3.6, z: 0.6, w: 0.04, h: 1.1, d: 0.03, color: WOOD_D });
    parts.push({ x: -1.5, y: 4.35, z: 0.35, w: 2.5, h: 0.1, d: 0.7, color: TILE });

    // Right side: Upper balcony with shoji screen
    parts.push({ x: 1.5, y: 2.65, z: 0.35, w: 2.4, h: 0.08, d: 0.7, color: WOOD });
    parts.push({ x: 1.5, y: 3.15, z: 0.68, w: 2.4, h: 0.08, d: 0.06, color: WOOD_D });
    for (let b = 0; b < 5; b++) parts.push({ x: 0.5 + b * 0.5, y: 2.9, z: 0.68, w: 0.06, h: 0.42, d: 0.06, color: WOOD });
    parts.push({ x: 1.5, y: 3.65, z: 0.05, w: 2.0, h: 1.4, d: 0.05, color: "#bfe8ff" });

    // Lanterns hanging under intermediate eave
    parts.push(...chochin(-2.2, 2.0, 0.45, "#d92525"));
    parts.push(...chochin(2.2, 2.0, 0.45, "#f4f1de"));

    // --- MAIN ROOF ---
    parts.push(...kawaraRoof(0, 4.65, 0, W, D, 1.25, "#535d6b", "#3b434e"));

    // Bamboo fence & stone water basin (tsukubai)
    for (let p = 0; p < 5; p++) parts.push({ x: -2.8, y: 0.45, z: 0.2 + p * 0.35, w: 0.06, h: 0.9, d: 0.06, color: "#7a9a60" });
    parts.push({ x: -2.8, y: 0.65, z: 0.9, w: 0.04, h: 0.08, d: 1.4, color: "#627d4c" });
    parts.push({ x: -2.4, y: 0.25, z: 1.1, w: 0.45, h: 0.35, d: 0.45, color: "#7a7770" });
    parts.push({ x: -2.4, y: 0.43, z: 1.1, w: 0.28, h: 0.02, d: 0.28, color: "#6093b5" });
    return parts;
  }

  // ---- VARIANT 0: 2-STOREY TRADITIONAL VILLAGE KOMINKA (古民家) ----
  const W = 5.8;
  const D = 4.8;
  parts.push({ x: 0, y: -0.95, z: -D / 2, w: W + 0.2, h: 2.5, d: D + 0.2, color: "#8e8a83" });
  parts.push({ x: 0, y: 0.12, z: -D / 2, w: W + 0.1, h: 0.24, d: D + 0.1, color: "#a29e97" });

  // --- FLOOR 1 (Ground Floor: y = 0.24 to 2.45) ---
  parts.push({ x: 0, y: 1.35, z: -D / 2, w: W, h: 2.2, d: D, color: PLASTER });
  for (const sx of [-W / 2 + 0.1, W / 2 - 0.1]) {
    parts.push({ x: sx, y: 1.35, z: 0.05, w: 0.22, h: 2.2, d: 0.22, color: WOOD_D });
  }
  parts.push({ x: 0, y: 0.4, z: 0.06, w: W, h: 0.28, d: 0.12, color: WOOD_D });
  parts.push({ x: 0, y: 2.3, z: 0.06, w: W, h: 0.16, d: 0.14, color: WOOD_D });

  // Sliding timber entry door with shoji windows
  parts.push({ x: -1.2, y: 1.25, z: 0.08, w: 1.7, h: 1.7, d: 0.08, color: "#3b2717" });
  parts.push({ x: -1.2, y: 1.32, z: 0.12, w: 1.4, h: 1.3, d: 0.04, color: "#ffeab0" });
  for (let k = 0; k < 3; k++) parts.push({ x: -1.6 + k * 0.4, y: 1.32, z: 0.14, w: 0.04, h: 1.3, d: 0.02, color: "#3b2717" });
  for (let j = 0; j < 3; j++) parts.push({ x: -1.2, y: 0.95 + j * 0.38, z: 0.14, w: 1.4, h: 0.04, d: 0.02, color: "#3b2717" });

  // Right side: Engawa porch & lattice window
  parts.push({ x: 1.4, y: 1.35, z: 0.08, w: 2.0, h: 1.2, d: 0.06, color: "#ffeab0" });
  for (let s = 0; s < 5; s++) parts.push({ x: 0.6 + s * 0.4, y: 1.35, z: 0.12, w: 0.04, h: 1.2, d: 0.03, color: WOOD });
  parts.push({ x: 1.4, y: 0.45, z: 0.45, w: 2.2, h: 0.12, d: 0.9, color: WOOD });
  parts.push({ x: 1.4, y: 0.12, z: 0.75, w: 0.7, h: 0.2, d: 0.5, color: "#9aa3ad" });

  // Red chōchin lanterns
  parts.push(...chochin(-2.2, 1.8, 0.45, "#d92525"));
  parts.push(...chochin(-0.2, 1.8, 0.45, "#d92525"));

  // Stacked firewood logs at side
  for (let f = 0; f < 3; f++) {
    for (let r = 0; r < 2; r++) {
      parts.push({ x: -2.35 + r * 0.25, y: 0.3 + f * 0.2, z: 0.5, w: 0.2, h: 0.16, d: 0.7, color: "#7a5030" });
    }
  }

  // Ground floor intermediate eave roof (Hisashi)
  parts.push({ x: 0, y: 2.45, z: 0.45, w: W + 0.6, h: 0.14, d: 1.05, color: TILE });
  parts.push({ x: 0, y: 2.52, z: 0.88, w: W + 0.6, h: 0.08, d: 0.22, color: TILE_D });
  for (let r = 0; r < 7; r++) parts.push({ x: -W / 2 + 0.4 + r * 0.82, y: 2.38, z: 0.4, w: 0.08, h: 0.08, d: 0.75, color: WOOD_D });

  // --- FLOOR 2 (Upper Floor: y = 2.55 to 4.7) ---
  parts.push({ x: 0, y: 3.65, z: -D / 2, w: W, h: 2.2, d: D, color: PLASTER });
  for (const sx of [-W / 2 + 0.1, 0, W / 2 - 0.1]) {
    parts.push({ x: sx, y: 3.65, z: 0.04, w: 0.2, h: 2.2, d: 0.2, color: WOOD_D });
  }
  // Full-width Wooden Balcony (Kōran) with balusters
  parts.push({ x: 0, y: 2.7, z: 0.35, w: W + 0.1, h: 0.1, d: 0.75, color: WOOD });
  parts.push({ x: 0, y: 3.25, z: 0.7, w: W + 0.1, h: 0.08, d: 0.08, color: WOOD_D });
  for (let b = 0; b < 9; b++) {
    parts.push({ x: -W / 2 + 0.3 + b * ((W - 0.6) / 8), y: 2.97, z: 0.7, w: 0.06, h: 0.48, d: 0.06, color: WOOD });
  }

  // Upper Floor Shoji windows with warm glowing light
  parts.push({ x: -1.3, y: 3.75, z: 0.05, w: 1.7, h: 1.25, d: 0.05, color: "#ffeab0" });
  parts.push({ x: 1.3, y: 3.75, z: 0.05, w: 1.7, h: 1.25, d: 0.05, color: "#ffeab0" });
  for (let k = 0; k < 3; k++) {
    parts.push({ x: -1.8 + k * 0.5, y: 3.75, z: 0.08, w: 0.04, h: 1.25, d: 0.02, color: WOOD_D });
    parts.push({ x: 0.8 + k * 0.5, y: 3.75, z: 0.08, w: 0.04, h: 1.25, d: 0.02, color: WOOD_D });
  }

  // Hanging village crest sign on upper floor
  parts.push({ x: 0, y: 4.15, z: 0.12, w: 0.7, h: 0.7, d: 0.06, color: "#3a2516" });
  parts.push({ x: 0, y: 4.15, z: 0.16, w: 0.5, h: 0.5, d: 0.02, color: "#f4f1de" });
  parts.push({ x: 0, y: 4.15, z: 0.18, w: 0.28, h: 0.28, d: 0.02, color: "#c1121f" });

  // --- MAIN TOP ROOF (Grand Irimoya Tiled Roof) ---
  parts.push(...kawaraRoof(0, 4.65, 0, W, D, 1.2, "#4a5360", "#38404a"));

  // Stone garden lantern beside house
  parts.push({ x: 2.4, y: 0.4, z: 0.8, w: 0.24, h: 0.6, d: 0.24, color: "#8e8a83" });
  parts.push({ x: 2.4, y: 0.8, z: 0.8, w: 0.5, h: 0.16, d: 0.5, color: "#6b6760" });
  return parts;
}

/**
 * Classic Japanese railcar (Shōwa-era commuter, two-tone brown/cream with a rounded roof, small round headlight,
 * rivet lines). Same footprint/axes as trainCarParts so the crossing logic is unchanged.
 */
export function classicTrainCarParts(cab: 0 | 1 | -1, pantograph: boolean): Part[] {
  const brown = "#6d3b2c";
  const cream = "#e7d3a6";
  const roof = "#4a4f57";
  const win = "#1e2a36";
  const dark = "#2b3138";
  const L = TRAIN_CAR_LEN;
  const W = TRAIN_W;
  const parts: Part[] = [];
  // bogies + wheels
  for (const bz of [-1.3, 1.3]) {
    parts.push({ x: 0, y: 0.22, z: bz, w: 2.0, h: 0.3, d: 0.9, color: dark });
    for (const wx of [-1.05, 1.05]) for (const wz of [-0.3, 0.3]) parts.push({ x: wx, y: 0.2, z: bz + wz, w: 0.12, h: 0.4, d: 0.4, color: "#111" });
  }
  parts.push({ x: 0, y: 0.5, z: 0, w: W - 0.1, h: 0.24, d: L, color: dark });
  // body: brown lower, cream window band, brown upper strip
  parts.push({ x: 0, y: 1.0, z: 0, w: W, h: 0.8, d: L, color: brown });
  parts.push({ x: 0, y: 1.72, z: 0, w: W, h: 0.65, d: L, color: cream });
  parts.push({ x: 0, y: 2.15, z: 0, w: W, h: 0.22, d: L, color: brown });
  // rounded roof (stepped) + roof vents
  parts.push({ x: 0, y: 2.36, z: 0, w: W - 0.2, h: 0.2, d: L, color: roof });
  parts.push({ x: 0, y: 2.52, z: 0, w: W - 0.7, h: 0.14, d: L, color: roof });
  parts.push({ x: 0, y: 2.62, z: 0, w: W - 1.3, h: 0.1, d: L, color: "#3f444c" });
  for (let i = -1; i <= 1; i++) parts.push({ x: 0, y: 2.72, z: i * 1.2, w: 0.5, h: 0.1, d: 0.4, color: "#3f444c" });
  // windows (small, many) + a centre sliding door per side
  for (const sx of [-W / 2, W / 2]) {
    const s = Math.sign(sx) * 0.012;
    for (const wz of [-1.5, -0.95, 0.95, 1.5]) parts.push({ x: sx + s, y: 1.72, z: wz, w: 0.02, h: 0.5, d: 0.42, color: win });
    parts.push({ x: sx + s, y: 1.35, z: 0, w: 0.02, h: 1.5, d: 0.72, color: "#5a3124" }); // door
    parts.push({ x: sx + s * 2, y: 1.72, z: 0, w: 0.02, h: 0.42, d: 0.5, color: win });
    parts.push({ x: sx + s, y: 0.66, z: 0, w: 0.02, h: 0.06, d: L, color: cream }); // rivet/sill line
  }
  if (pantograph) {
    parts.push({ x: 0, y: 2.8, z: -1.0, w: 0.5, h: 0.08, d: 0.5, color: dark });
    parts.push({ x: 0, y: 3.0, z: -1.0, w: 0.06, h: 0.42, d: 0.06, color: dark });
    parts.push({ x: 0, y: 3.22, z: -1.0, w: 1.2, h: 0.06, d: 0.1, color: dark });
  }
  if (cab !== 0) {
    const z = cab * (L / 2 + 0.02);
    parts.push({ x: 0, y: 1.72, z, w: W - 0.6, h: 0.6, d: 0.06, color: win }); // cab windows
    parts.push({ x: 0, y: 1.72, z, w: 0.08, h: 0.6, d: 0.07, color: cream }); // centre pillar
    parts.push({ x: 0, y: 2.45, z: z + cab * 0.02, w: 0.3, h: 0.3, d: 0.08, color: "#fff6c8" }); // single round headlight
    parts.push({ x: 0, y: 2.45, z: z + cab * 0.04, w: 0.36, h: 0.36, d: 0.04, color: "#9aa3ad" });
    for (const hx of [-0.8, 0.8]) parts.push({ x: hx, y: 0.9, z: z + cab * 0.02, w: 0.2, h: 0.12, d: 0.06, color: "#ff3b3b" }); // tail lamps
    parts.push({ x: 0, y: 0.95, z: z + cab * 0.04, w: 1.2, h: 0.14, d: 0.06, color: cream }); // number board strip
    parts.push({ x: 0, y: 0.55, z: z + cab * 0.1, w: 0.7, h: 0.3, d: 0.2, color: dark }); // coupler
  }
  return parts;
}

/* ---------- Hakone-Tozan style railcar (white upper, vermilion lower, big tinted windows) ---------- */

/** World height of the overhead contact wire above the road plane (crossing frame). */
export const WIRE_Y = 3.5;

/**
 * Small mountain-railway car after the Hakone Tozan 3000 series: white body with a vermilion lower half,
 * large dark-tinted windows with slim white pillars, two sliding doors' worth of glass, grey rounded roof with
 * A/C units and a single-arm pantograph, and a flat cab end with a three-pane windshield, glowing red destination
 * sign, twin headlights, number plate, plow-style bumper and coupler.
 * Same footprint/axes as the other car models (length along z, width along x, cab at +z or -z).
 */
export function hakoneTrainCarParts(cab: 0 | 1 | -1, pantograph: boolean): Part[] {
  const WHITE = "#f5f4ee";
  const RED = "#d8351f";
  const RED_D = "#a92616";
  const ROOF = "#b9bec6";
  const ROOF_D = "#9ea5ae";
  const DARK = "#2b3138";
  const GLASS = "#16212c";
  const FRAME = "#1b1e23";
  const L = TRAIN_CAR_LEN;
  const W = TRAIN_W;
  const parts: Part[] = [];

  // bogies + wheels
  for (const bz of [-1.3, 1.3]) {
    parts.push({ x: 0, y: 0.22, z: bz, w: 2.0, h: 0.3, d: 0.9, color: DARK });
    for (const wx of [-1.05, 1.05]) for (const wz of [-0.3, 0.3]) parts.push({ x: wx, y: 0.2, z: bz + wz, w: 0.12, h: 0.4, d: 0.4, color: "#111" });
  }
  // underframe, red lower body with a darker sill, white upper body
  parts.push({ x: 0, y: 0.42, z: 0, w: W - 0.2, h: 0.2, d: L - 0.1, color: DARK });
  parts.push({ x: 0, y: 0.89, z: 0, w: W, h: 0.74, d: L, color: RED });
  parts.push({ x: 0, y: 0.545, z: 0, w: W + 0.02, h: 0.05, d: L, color: RED_D });
  parts.push({ x: 0, y: 1.86, z: 0, w: W, h: 1.2, d: L, color: WHITE });
  // rounded roof (stepped) + rain gutters + A/C units and vents
  parts.push({ x: 0, y: 2.52, z: 0, w: W - 0.12, h: 0.12, d: L, color: ROOF });
  parts.push({ x: 0, y: 2.62, z: 0, w: W - 0.6, h: 0.1, d: L, color: ROOF });
  parts.push({ x: 0, y: 2.7, z: 0, w: W - 1.15, h: 0.08, d: L, color: ROOF_D });
  for (const sx of [-1, 1]) parts.push({ x: sx * (W / 2 - 0.03), y: 2.46, z: 0, w: 0.06, h: 0.05, d: L, color: "#9aa0a8" });
  parts.push({ x: 0, y: 2.86, z: 0.35, w: 0.9, h: 0.22, d: 1.0, color: "#c8ccd2" });
  parts.push({ x: 0, y: 2.86, z: -1.5, w: 0.5, h: 0.14, d: 0.4, color: ROOF_D });
  parts.push({ x: 0, y: 2.86, z: 1.6, w: 0.5, h: 0.14, d: 0.4, color: ROOF_D });

  // side windows (big, tinted) with slim white pillars between them + sliding doors
  for (const sx of [-W / 2, W / 2]) {
    const s = Math.sign(sx) * 0.012;
    for (const wz of [-1.55, -0.98, 0.98, 1.55]) parts.push({ x: sx + s, y: 1.86, z: wz, w: 0.02, h: 0.74, d: 0.5, color: GLASS });
    // door: pale panel, red lower part, two narrow windows, centre seam
    parts.push({ x: sx + s, y: 1.4, z: 0, w: 0.02, h: 1.72, d: 0.84, color: "#e6e9ec" });
    parts.push({ x: sx + s * 2, y: 0.95, z: 0, w: 0.02, h: 0.62, d: 0.84, color: RED_D });
    for (const dz of [-0.2, 0.2]) parts.push({ x: sx + s * 2, y: 1.98, z: dz, w: 0.02, h: 0.66, d: 0.26, color: GLASS });
    parts.push({ x: sx + s * 3, y: 1.45, z: 0, w: 0.02, h: 1.6, d: 0.03, color: "#9aa0a8" });
  }

  if (pantograph) {
    // single-arm pantograph reaching the contact wire (top at WIRE_Y - 0.16 in the car frame)
    parts.push({ x: 0, y: 2.83, z: -1.05, w: 0.8, h: 0.06, d: 0.5, color: DARK });
    for (const ix of [-0.3, 0.3]) parts.push({ x: ix, y: 2.9, z: -1.05, w: 0.08, h: 0.1, d: 0.08, color: "#e9e6df" });
    parts.push({ x: 0, y: 3.02, z: -1.15, w: 0.05, h: 0.48, d: 0.05, rx: 0.65, color: DARK });
    parts.push({ x: 0, y: 3.2, z: -1.02, w: 0.05, h: 0.48, d: 0.05, rx: -0.65, color: DARK });
    parts.push({ x: 0, y: WIRE_Y - 0.16 - 0.02, z: -1.1, w: 1.15, h: 0.05, d: 0.09, color: "#3a3f47" });
  }

  // ends: cab (front) or gangway (rubber hood)
  for (const e of [1, -1] as const) {
    const z = e * (L / 2 + 0.02);
    if (cab !== e) {
      parts.push({ x: 0, y: 1.55, z: e * (L / 2 + 0.08), w: W - 0.5, h: 1.7, d: 0.14, color: "#2b2f36" });
      continue;
    }
    // front plates so the face sits slightly proud of the body
    parts.push({ x: 0, y: 0.89, z, w: W - 0.02, h: 0.74, d: 0.06, color: RED });
    parts.push({ x: 0, y: 1.86, z, w: W - 0.02, h: 1.2, d: 0.06, color: WHITE });
    parts.push({ x: 0, y: 0.62, z: z + e * 0.035, w: W - 0.3, h: 0.2, d: 0.08, color: RED_D }); // chin
    parts.push({ x: 0, y: 2.52, z: z + e * 0.04, w: W - 0.12, h: 0.12, d: 0.1, color: ROOF }); // roof lip
    // three-pane windshield in a black frame (centre pane larger)
    parts.push({ x: 0, y: 1.8, z: z + e * 0.035, w: W - 0.3, h: 0.88, d: 0.03, color: FRAME });
    parts.push({ x: 0, y: 1.8, z: z + e * 0.055, w: 1.0, h: 0.76, d: 0.02, color: GLASS });
    for (const px of [-0.79, 0.79]) parts.push({ x: px, y: 1.8, z: z + e * 0.055, w: 0.5, h: 0.76, d: 0.02, color: GLASS });
    // destination sign: black box with glowing red panel and a white marker
    parts.push({ x: 0, y: 2.31, z: z + e * 0.045, w: 0.78, h: 0.18, d: 0.04, color: FRAME });
    parts.push({ x: 0, y: 2.31, z: z + e * 0.07, w: 0.66, h: 0.11, d: 0.02, color: "#ff3b2f" });
    parts.push({ x: -0.18, y: 2.31, z: z + e * 0.085, w: 0.16, h: 0.05, d: 0.01, color: "#ffe8e3" });
    parts.push({ x: 0.14, y: 2.31, z: z + e * 0.085, w: 0.22, h: 0.05, d: 0.01, color: "#ffe8e3" });
    // headlights (cream) with dark rims, tail lamps above
    for (const hx of [-0.98, 0.98]) {
      parts.push({ x: hx, y: 0.86, z: z + e * 0.04, w: 0.28, h: 0.22, d: 0.02, color: FRAME });
      parts.push({ x: hx, y: 0.86, z: z + e * 0.06, w: 0.22, h: 0.16, d: 0.02, color: "#fff3c4" });
      parts.push({ x: hx, y: 1.12, z: z + e * 0.05, w: 0.14, h: 0.08, d: 0.02, color: "#e23d3d" });
    }
    // number plate ("1003" as chunky blocks) on the red
    parts.push({ x: 0.55, y: 0.92, z: z + e * 0.05, w: 0.42, h: 0.16, d: 0.02, color: "#ffffff" });
    for (let k = 0; k < 4; k++) parts.push({ x: 0.55 - 0.15 + k * 0.1, y: 0.92, z: z + e * 0.065, w: 0.05, h: 0.1, d: 0.01, color: FRAME });
    // plow-style bumper + coupler
    parts.push({ x: 0, y: 0.5, z: z + e * 0.1, w: W - 0.15, h: 0.14, d: 0.12, color: "#8d939c" });
    parts.push({ x: 0, y: 0.5, z: z + e * 0.2, w: 0.5, h: 0.14, d: 0.14, color: DARK });
    // wiper stubs
    parts.push({ x: -0.25, y: 1.5, z: z + e * 0.075, w: 0.04, h: 0.03, d: 0.3, color: FRAME, ry: 0.2 * e });
  }
  return parts;
}

/**
 * Overhead line equipment for the crossing (frame: +z along the rails, +x along the road):
 * concrete poles on both sides of the track at a few stations, steel cross-beams with insulators,
 * a contact wire at WIRE_Y, a messenger wire above it, and droppers between them.
 */
export function catenaryParts(zMin = -16.5, zMax = 14.5): Part[] {
  const parts: Part[] = [];
  const pole = "#8f8a80";
  const steel = "#575c64";
  const stations = [-12.5, -6.7, 6.7, 12.5];
  for (const z of stations) {
    for (const x of [-2.15, 2.15]) {
      parts.push({ x, y: 0.1, z, w: 0.36, h: 0.2, d: 0.36, color: "#a7a297" });
      parts.push({ x, y: 2.5, z, w: 0.2, h: 5.0, d: 0.2, color: pole });
      parts.push({ x, y: 2.5, z: z + 0.11, w: 0.1, h: 5.0, d: 0.04, color: "#7a756c" });
    }
    // cross-beam + diagonal braces + insulators
    parts.push({ x: 0, y: 4.75, z, w: 4.5, h: 0.14, d: 0.14, color: steel });
    for (const sx of [-1, 1]) parts.push({ x: sx * 1.6, y: 4.35, z, w: 0.08, h: 1.0, d: 0.08, color: steel, rz: sx * 0.9 });
    parts.push({ x: 0, y: 4.5, z, w: 0.12, h: 0.32, d: 0.12, color: "#eeeae0" });
    parts.push({ x: 0, y: 4.32, z, w: 0.05, h: 0.2, d: 0.05, color: "#3a3f47" });
  }
  const mid = (zMin + zMax) / 2;
  const len = zMax - zMin;
  parts.push({ x: 0, y: WIRE_Y, z: mid, w: 0.045, h: 0.045, d: len, color: "#2f343b" }); // contact wire
  parts.push({ x: 0, y: 4.25, z: mid, w: 0.04, h: 0.04, d: len, color: "#3a3f47" }); // messenger wire
  for (let z = zMin + 1.4; z < zMax - 0.5; z += 2.6) parts.push({ x: 0, y: (WIRE_Y + 4.25) / 2, z, w: 0.025, h: 4.25 - WIRE_Y, d: 0.025, color: "#3a3f47" });
  // feeder line running along the pole tops
  for (const x of [-2.15, 2.15]) parts.push({ x, y: 5.02, z: mid, w: 0.04, h: 0.04, d: len, color: "#2f343b" });
  return parts;
}

/* ---------- Mount Haruna (Gunma Touge) Models ---------- */

/** Mountain W-beam guardrail with red/amber reflectors. */
export function guardrailParts(len = 6): Part[] {
  const metal = "#d8dee9";
  const post = "#718096";
  const reflector = "#ef4444";
  const parts: Part[] = [
    { x: 0, y: 0.44, z: 0, w: len, h: 0.28, d: 0.08, color: metal },
    { x: 0, y: 0.58, z: 0, w: len, h: 0.06, d: 0.1, color: "#edf2f7" },
    { x: 0, y: 0.30, z: 0, w: len, h: 0.06, d: 0.1, color: "#edf2f7" },
  ];
  const n = Math.max(2, Math.round(len / 1.5) + 1);
  for (let i = 0; i < n; i++) {
    const x = -len / 2 + 0.3 + (i * (len - 0.6)) / (n - 1);
    parts.push({ x, y: 0.25, z: 0.02, w: 0.1, h: 0.52, d: 0.1, color: post });
    parts.push({ x, y: 0.62, z: 0.03, w: 0.08, h: 0.08, d: 0.08, color: reflector });
  }
  return parts;
}

/** Sharp turn warning chevron sign (>>>). */
export function chevronSignParts(dir: 1 | -1 = 1): Part[] {
  return [
    { x: 0, y: 0.8, z: 0, w: 0.1, h: 1.6, d: 0.1, color: "#4a4f57" },
    { x: 0, y: 1.5, z: 0, w: 0.9, h: 0.9, d: 0.06, color: "#1f2430" },
    { x: 0, y: 1.5, z: 0.04, w: 0.8, h: 0.8, d: 0.02, color: "#ff2a2a" },
    { x: 0.08 * dir, y: 1.5, z: 0.06, w: 0.45, h: 0.45, d: 0.02, rz: Math.PI / 4, color: "#ffffff" },
  ];
}

/** Japanese mountain autumn maple / momiji tree (scarlet red, crimson, golden amber). */
export function autumnTreeParts(variant: number): Part[] {
  const trunk = "#5c4033";
  const colors = [
    ["#e63946", "#f26419", "#ff9e00"],
    ["#d90429", "#ef233c", "#f77f00"],
    ["#f3722c", "#f8961e", "#f9c74f"],
  ][variant % 3];
  return [
    { x: 0, y: 0.5, z: 0, w: 0.35, h: 1.0, d: 0.35, color: trunk },
    { x: 0, y: 1.4, z: 0, w: 1.6, h: 0.9, d: 1.6, color: colors[0] },
    { x: 0.2, y: 2.0, z: 0.1, w: 1.2, h: 0.7, d: 1.2, color: colors[1] },
    { x: -0.1, y: 2.5, z: -0.1, w: 0.7, h: 0.5, d: 0.7, color: colors[2] },
  ];
}

/** Mountain rock boulders along Haruna roadside. */
export function mountainRockParts(variant: number): Part[] {
  const c1 = variant % 2 ? "#6b7280" : "#5d6570";
  const c2 = variant % 2 ? "#4b5563" : "#374151";
  return [
    { x: 0, y: 0.4, z: 0, w: 1.2, h: 0.8, d: 1.1, color: c1 },
    { x: 0.2, y: 0.65, z: 0.1, w: 0.8, h: 0.5, d: 0.7, color: c2 },
    { x: -0.25, y: 0.3, z: 0.2, w: 0.6, h: 0.4, d: 0.5, color: c2 },
  ];
}

/* ---------- Tokyo Street & Mount Haruna Atmosphere Models ---------- */

/** Japanese sidewalk drink vending machine (Jihanki / 自動販売機). */
export function vendingParts(variant: number): Part[] {
  const themes = [
    { main: "#d90429", header: "#ffffff", stripe: "#b91c1c", accent: "#ef233c" }, // Red Boss/Coke
    { main: "#0284c7", header: "#ffffff", stripe: "#0369a1", accent: "#38bdf8" }, // Blue Pocari/Water
    { main: "#15803d", header: "#ffffff", stripe: "#166534", accent: "#22c55e" }, // Green Tea (Ito En)
  ];
  const t = themes[variant % themes.length];
  const glass = "#e0f2fe";
  const dark = "#1e293b";

  return [
    // Base plinth
    { x: 0, y: 0.06, z: 0, w: 0.96, h: 0.12, d: 0.7, color: dark },
    // Main metal cabinet
    { x: 0, y: 0.98, z: 0, w: 0.94, h: 1.72, d: 0.68, color: t.main },
    // Top glowing brand header
    { x: 0, y: 1.72, z: 0.33, w: 0.86, h: 0.22, d: 0.05, color: t.header },
    { x: 0, y: 1.63, z: 0.335, w: 0.82, h: 0.03, d: 0.04, color: t.stripe },
    // Illuminated product showcase display
    { x: 0, y: 1.15, z: 0.33, w: 0.86, h: 0.76, d: 0.06, color: glass },
    // Row 1 drinks (top shelf)
    { x: -0.3, y: 1.35, z: 0.34, w: 0.09, h: 0.16, d: 0.05, color: "#22c55e" },
    { x: -0.15, y: 1.35, z: 0.34, w: 0.09, h: 0.16, d: 0.05, color: "#f97316" },
    { x: 0, y: 1.35, z: 0.34, w: 0.09, h: 0.16, d: 0.05, color: "#e11d48" },
    { x: 0.15, y: 1.35, z: 0.34, w: 0.09, h: 0.16, d: 0.05, color: "#0284c7" },
    { x: 0.3, y: 1.35, z: 0.34, w: 0.09, h: 0.16, d: 0.05, color: "#eab308" },
    // Row 2 drinks (bottom shelf)
    { x: -0.3, y: 1.05, z: 0.34, w: 0.09, h: 0.16, d: 0.05, color: "#0284c7" },
    { x: -0.15, y: 1.05, z: 0.34, w: 0.09, h: 0.16, d: 0.05, color: "#38bdf8" },
    { x: 0, y: 1.05, z: 0.34, w: 0.09, h: 0.16, d: 0.05, color: "#22c55e" },
    { x: 0.15, y: 1.05, z: 0.34, w: 0.09, h: 0.16, d: 0.05, color: "#f59e0b" },
    { x: 0.3, y: 1.05, z: 0.34, w: 0.09, h: 0.16, d: 0.05, color: "#e11d48" },
    // Push buttons under drinks
    { x: 0, y: 0.94, z: 0.34, w: 0.82, h: 0.04, d: 0.04, color: "#334155" },
    // Coin slot & bill validator area
    { x: 0.28, y: 0.65, z: 0.34, w: 0.22, h: 0.3, d: 0.03, color: dark },
    { x: 0.31, y: 0.72, z: 0.35, w: 0.04, h: 0.06, d: 0.02, color: "#22c55e" }, // glowing LED slot
    // Retrieval flap at bottom
    { x: -0.06, y: 0.35, z: 0.33, w: 0.54, h: 0.32, d: 0.06, color: dark },
    { x: -0.06, y: 0.35, z: 0.35, w: 0.46, h: 0.24, d: 0.03, color: "#475569" }, // push flap
  ];
}

/** Japanese city commuter bicycle with front basket (Mamachari / ママチャリ). */
export function mamachariParts(variant: number): Part[] {
  const frameColors = ["#1e3a8a", "#831843", "#334155", "#065f46"];
  const frameColor = frameColors[variant % frameColors.length];
  const chrome = "#cbd5e1";
  const tire = "#1e293b";
  const saddle = "#3e2723";

  return [
    // Front wheel
    { x: 0.58, y: 0.32, z: 0, w: 0.08, h: 0.64, d: 0.64, color: tire },
    { x: 0.58, y: 0.32, z: 0, w: 0.06, h: 0.48, d: 0.48, color: chrome },
    // Rear wheel
    { x: -0.58, y: 0.32, z: 0, w: 0.08, h: 0.64, d: 0.64, color: tire },
    { x: -0.58, y: 0.32, z: 0, w: 0.06, h: 0.48, d: 0.48, color: chrome },
    // Low-step curved frame tube
    { x: 0.04, y: 0.34, z: 0, w: 0.64, h: 0.06, d: 0.06, color: frameColor },
    // Seat tube
    { x: -0.22, y: 0.52, z: 0, w: 0.06, h: 0.44, d: 0.06, color: frameColor },
    // Front fork
    { x: 0.48, y: 0.56, z: 0, w: 0.06, h: 0.48, d: 0.06, rx: 0.2, color: frameColor },
    // Leather saddle
    { x: -0.24, y: 0.77, z: 0, w: 0.22, h: 0.07, d: 0.16, color: saddle },
    // Curved handlebars
    { x: 0.46, y: 0.88, z: 0, w: 0.08, h: 0.18, d: 0.06, color: chrome },
    { x: 0.46, y: 0.96, z: 0, w: 0.08, h: 0.05, d: 0.44, color: chrome }, // handlebar bar
    { x: 0.46, y: 0.96, z: 0.22, w: 0.08, h: 0.05, d: 0.08, color: "#0f172a" }, // grip
    { x: 0.46, y: 0.96, z: -0.22, w: 0.08, h: 0.05, d: 0.08, color: "#0f172a" }, // grip
    // Front chrome headlight
    { x: 0.56, y: 0.76, z: 0, w: 0.1, h: 0.09, d: 0.09, color: "#fffbeb" },
    // Front wire basket (keranjang belanja)
    { x: 0.62, y: 0.72, z: 0, w: 0.26, h: 0.22, d: 0.32, color: "#94a3b8" },
    { x: 0.62, y: 0.74, z: 0, w: 0.22, h: 0.18, d: 0.28, color: "#64748b" }, // inside hollow
    // Rear package rack
    { x: -0.48, y: 0.68, z: 0, w: 0.36, h: 0.04, d: 0.16, color: chrome },
    // Rear red reflector
    { x: -0.66, y: 0.56, z: 0, w: 0.04, h: 0.06, d: 0.06, color: "#ef4444" },
    // Kickstand
    { x: -0.3, y: 0.16, z: -0.12, w: 0.04, h: 0.32, d: 0.04, rx: -0.3, color: "#64748b" },
  ];
}

/** Japanese 24-hour convenience store (Konbini / コンビニ) from Shibuya Blocks. */
export function konbiniShopParts(): Part[] {
  return getShibuyaBuildingParts("konbini");
}

/** Illuminated sidewalk signboard: warm traditional wooden lantern or minimalist Japanese boutique lightbox. */
export function neonSignboardParts(variant: number): Part[] {
  if (variant % 2 === 0) {
    // Warm traditional Japanese cedar andon / izakaya lantern
    return [
      { x: 0, y: 0.4, z: 0, w: 0.45, h: 0.8, d: 0.45, color: "#7c4a28" }, // cedar wood frame
      { x: 0, y: 0.85, z: 0, w: 0.38, h: 0.7, d: 0.38, color: "#fff8e2", glow: true }, // warm washi paper lightbox
      { x: 0, y: 0.85, z: 0.2, w: 0.24, h: 0.46, d: 0.02, color: "#b91c1c" }, // traditional crimson kanji emblem
      { x: 0, y: 1.22, z: 0, w: 0.44, h: 0.08, d: 0.44, color: "#543018" }, // wooden cap
    ];
  }
  // Modern minimalist Japanese boutique acrylic lightbox
  return [
    { x: 0, y: 0.1, z: 0, w: 0.45, h: 0.2, d: 0.4, color: "#94a3b8" }, // brushed silver base
    { x: 0, y: 0.7, z: 0, w: 0.38, h: 1.0, d: 0.22, color: "#cbd5e1" }, // clean aluminum trim
    { x: 0, y: 0.7, z: 0, w: 0.34, h: 0.92, d: 0.24, color: "#ffffff", glow: true }, // pure white acrylic panel
    { x: 0, y: 0.9, z: 0.13, w: 0.24, h: 0.24, d: 0.02, color: "#1e3a5f" }, // refined navy emblem
    { x: 0, y: 0.6, z: 0.13, w: 0.22, h: 0.08, d: 0.02, color: "#b91c1c" }, // subtle crimson mark
  ];
}

/** Shibuya architectural department store billboard on clean steel scaffold (faces +z toward the road). */
export function billboardParts(variant: number): Part[] {
  const v = ((variant % 3) + 3) % 3;
  const steel = "#8c96a4"; // clean brushed architectural steel (NOT solid black!)
  const parts: Part[] = [
    // scaffold legs + cross beam
    { x: -1.5, y: 1.4, z: -0.3, w: 0.16, h: 2.8, d: 0.16, color: steel },
    { x: 1.5, y: 1.4, z: -0.3, w: 0.16, h: 2.8, d: 0.16, color: steel },
    { x: 0, y: 2.55, z: -0.3, w: 3.3, h: 0.14, d: 0.14, color: steel },
  ];
  const y0 = 2.8; // bottom of the screen
  const W = 4.2;
  const H = 2.4;
  // clean architectural aluminum casing (never solid black!)
  parts.push({ x: 0, y: y0 + H / 2, z: -0.18, w: W + 0.3, h: H + 0.3, d: 0.3, color: "#cbd5e1" });
  if (v === 0) {
    // Tokyo Ginza luxury department store billboard
    parts.push({ x: 0, y: y0 + H / 2, z: 0.02, w: W, h: H, d: 0.08, color: "#fcfbfa", glow: true });
    parts.push({ x: -0.5, y: y0 + H * 0.68, z: 0.09, w: W * 0.55, h: 0.32, d: 0.03, color: "#b91c1c" });
    parts.push({ x: -0.8, y: y0 + H * 0.42, z: 0.09, w: W * 0.42, h: 0.22, d: 0.03, color: "#1e3a5f" });
    parts.push({ x: 1.25, y: y0 + H * 0.5, z: 0.09, w: 0.85, h: 0.85, d: 0.03, color: "#d4af37" });
    parts.push({ x: -1.1, y: y0 + H * 0.18, z: 0.09, w: 0.9, h: 0.18, d: 0.03, color: "#64748b" });
  } else if (v === 1) {
    // Omotesando modern art & lifestyle billboard
    parts.push({ x: 0, y: y0 + H / 2, z: 0.02, w: W, h: H, d: 0.08, color: "#f0f4f8", glow: true });
    parts.push({ x: 0.65, y: y0 + H * 0.62, z: 0.09, w: W * 0.48, h: H * 0.48, d: 0.03, color: "#1e3a5f" });
    parts.push({ x: -1.0, y: y0 + H * 0.7, z: 0.09, w: W * 0.36, h: 0.45, d: 0.03, color: "#2d6a4f" });
    parts.push({ x: 0, y: y0 + 0.24, z: 0.09, w: W * 0.86, h: 0.22, d: 0.03, color: "#64748b" });
    parts.push({ x: -1.4, y: y0 + 0.24, z: 0.12, w: 0.48, h: 0.14, d: 0.03, color: "#d97706" });
    parts.push({ x: 1.35, y: y0 + H * 0.32, z: 0.09, w: 0.6, h: 0.55, d: 0.03, color: "#b91c1c" });
  } else {
    // Roppongi Hills seasonal exhibition billboard
    parts.push({ x: 0, y: y0 + H / 2, z: 0.02, w: W, h: H, d: 0.08, color: "#fff9ee", glow: true });
    parts.push({ x: 0, y: y0 + H * 0.74, z: 0.09, w: W * 0.9, h: 0.48, d: 0.03, color: "#b91c1c" });
    parts.push({ x: -0.8, y: y0 + H * 0.74, z: 0.12, w: W * 0.42, h: 0.24, d: 0.03, color: "#ffffff" });
    parts.push({ x: -0.4, y: y0 + H * 0.34, z: 0.09, w: W * 0.52, h: 0.28, d: 0.03, color: "#1e3a5f" });
    parts.push({ x: 1.25, y: y0 + H * 0.3, z: 0.09, w: 0.88, h: 0.68, d: 0.03, color: "#d4af37" });
  }
  // maintenance catwalk + warm spotlights pointing at the board
  parts.push({ x: 0, y: y0 - 0.12, z: 0.28, w: W * 0.9, h: 0.08, d: 0.35, color: steel });
  parts.push({ x: -W * 0.3, y: y0 - 0.02, z: 0.42, w: 0.18, h: 0.12, d: 0.18, color: "#fff8e2", glow: true });
  parts.push({ x: W * 0.3, y: y0 - 0.02, z: 0.42, w: 0.18, h: 0.12, d: 0.18, color: "#fff8e2", glow: true });
  return parts;
}

/** Slow-and-go night traffic on the opposite carriageway: sedans, a taxi and a city bus,
 *  built FACING -x so they read as oncoming (headlights toward the player). Purely decorative. */
export function jamCarParts(variant: number): Part[] {
  const v = ((variant % 5) + 5) % 5;
  const glass = "#7fb6de";
  const tire = "#22242a";
  if (v === 4) {
    // green city bus (Toei style) with a row of warm lit windows
    const body = "#3f7d5a";
    const parts: Part[] = [
      { x: 0, y: 1.05, z: 0, w: 5.4, h: 1.7, d: 1.7, color: body },
      { x: 0, y: 0.35, z: 0, w: 5.4, h: 0.3, d: 1.7, color: "#2c5940" },
      { x: -2.72, y: 1.2, z: 0, w: 0.06, h: 0.9, d: 1.5, color: glass }, // front glass (-x!)
      { x: 2.72, y: 1.2, z: 0, w: 0.06, h: 0.8, d: 1.5, color: "#28323c" },
      { x: -2.74, y: 0.62, z: 0.55, w: 0.06, h: 0.2, d: 0.34, color: "#fffbe6", glow: true }, // headlights
      { x: -2.74, y: 0.62, z: -0.55, w: 0.06, h: 0.2, d: 0.34, color: "#fffbe6", glow: true },
      { x: 2.74, y: 0.62, z: 0.55, w: 0.06, h: 0.18, d: 0.3, color: "#ff2a2a", glow: true }, // taillights
      { x: 2.74, y: 0.62, z: -0.55, w: 0.06, h: 0.18, d: 0.3, color: "#ff2a2a", glow: true },
      { x: -2.7, y: 1.95, z: 0, w: 0.5, h: 0.24, d: 1.2, color: "#ffd23f", glow: true }, // route sign box
    ];
    for (let i = 0; i < 5; i++) {
      parts.push({ x: -1.7 + i * 0.95, y: 1.35, z: 0.86, w: 0.7, h: 0.5, d: 0.04, color: "#ffe9a3", glow: true });
      parts.push({ x: -1.7 + i * 0.95, y: 1.35, z: -0.86, w: 0.7, h: 0.5, d: 0.04, color: "#ffe9a3", glow: true });
    }
    for (const wx of [-1.9, 1.9]) {
      parts.push({ x: wx, y: 0.32, z: 0.8, w: 0.62, h: 0.62, d: 0.24, color: tire });
      parts.push({ x: wx, y: 0.32, z: -0.8, w: 0.62, h: 0.62, d: 0.24, color: tire });
    }
    return parts;
  }
  // sedans / taxi — compact voxel car mirrored to face -x
  const bodies = ["#d7dbe2", "#2f3a4c", "#8c2f3b", "#f2c230"]; // white, dark blue, red, TAXI yellow
  const body = bodies[v];
  const parts: Part[] = [
    { x: 0, y: 0.42, z: 0, w: 3.25, h: 0.36, d: 1.6, color: body },
    { x: -1.05, y: 0.68, z: 0, w: 1.15, h: 0.22, d: 1.5, color: body }, // hood toward -x
    { x: -1.64, y: 0.52, z: 0, w: 0.04, h: 0.18, d: 0.85, color: "#1f2229" }, // grille
    { x: -1.64, y: 0.64, z: 0.52, w: 0.06, h: 0.18, d: 0.32, color: "#fffbe6", glow: true }, // headlights ON
    { x: -1.64, y: 0.64, z: -0.52, w: 0.06, h: 0.18, d: 0.32, color: "#fffbe6", glow: true },
    { x: 0.22, y: 1.15, z: 0, w: 1.55, h: 0.56, d: 1.36, color: body }, // cabin
    { x: -0.58, y: 1.12, z: 0, w: 0.12, h: 0.44, d: 1.2, color: glass },
    { x: 1.02, y: 1.12, z: 0, w: 0.1, h: 0.42, d: 1.2, color: glass },
    { x: 0.22, y: 1.15, z: 0.69, w: 1.25, h: 0.38, d: 0.04, color: glass },
    { x: 0.22, y: 1.15, z: -0.69, w: 1.25, h: 0.38, d: 0.04, color: glass },
    { x: 1.28, y: 0.68, z: 0, w: 0.65, h: 0.22, d: 1.5, color: body }, // trunk toward +x
    { x: 1.64, y: 0.64, z: 0.52, w: 0.06, h: 0.16, d: 0.3, color: "#ff2a2a", glow: true }, // brake lights ON
    { x: 1.64, y: 0.64, z: -0.52, w: 0.06, h: 0.16, d: 0.3, color: "#ff2a2a", glow: true },
  ];
  if (v === 3) parts.push({ x: 0.22, y: 1.55, z: 0, w: 0.5, h: 0.2, d: 0.4, color: "#ffe9a3", glow: true }); // taxi roof lamp
  for (const wx of [-1.0, 1.0]) {
    parts.push({ x: wx, y: 0.29, z: 0.74, w: 0.58, h: 0.58, d: 0.26, color: tire });
    parts.push({ x: wx, y: 0.29, z: -0.74, w: 0.58, h: 0.58, d: 0.26, color: tire });
  }
  return parts;
}

/** Shibuya landmark: authentic Shibuya Blocks voxel Shibuya 109 building. */
export function tower109Parts(): Part[] {
  return getShibuyaBuildingParts("shibuya109");
}

/** Mount Haruna Touge Route 33 Sign (Gunma Prefecture Road / 県道33号). */
export function tougeRouteSignParts(): Part[] {
  const steel = "#64748b";
  const blue = "#1d4ed8";
  const white = "#ffffff";
  return [
    // Support pole
    { x: 0, y: 1.0, z: 0, w: 0.08, h: 2.0, d: 0.08, color: steel },
    // Hexagonal Japanese Route shield
    { x: 0, y: 1.75, z: 0.05, w: 0.72, h: 0.68, d: 0.04, color: blue },
    { x: 0, y: 1.75, z: 0.07, w: 0.64, h: 0.6, d: 0.02, color: white },
    { x: 0, y: 1.75, z: 0.08, w: 0.58, h: 0.54, d: 0.02, color: blue },
    // Route number "33"
    { x: 0, y: 1.72, z: 0.09, w: 0.38, h: 0.28, d: 0.02, color: white },
    // Kanji header "群馬 / 県道"
    { x: 0, y: 1.92, z: 0.09, w: 0.34, h: 0.08, d: 0.02, color: white },
  ];
}

/** Classic Mount Haruna Touge curved mercury/sodium streetlamp. */
export function tougeStreetlampParts(): Part[] {
  const pole = "#334155";
  const lampHousing = "#475569";
  const amberGlow = "#f59e0b";
  return [
    // Tall steel pole
    { x: 0, y: 1.8, z: 0, w: 0.1, h: 3.6, d: 0.1, color: pole },
    // Curved cantilever arm extending toward the road
    { x: 0, y: 3.65, z: -0.35, w: 0.08, h: 0.18, d: 0.7, color: pole },
    // Rounded lamp shade
    { x: 0, y: 3.58, z: -0.72, w: 0.32, h: 0.14, d: 0.38, color: lampHousing },
    // Glowing warm sodium lamp bulb
    { x: 0, y: 3.5, z: -0.72, w: 0.24, h: 0.06, d: 0.28, color: amberGlow, glow: true },
  ];
}

/** Falling Momiji autumn maple leaf (scarlet/golden star). */
export function momijiLeafParts(): Part[] {
  return [
    { x: 0, y: 0, z: 0, w: 0.15, h: 0.025, d: 0.13, color: "#e63946" },
    { x: 0.04, y: 0.004, z: 0.02, w: 0.08, h: 0.02, d: 0.07, color: "#f26419" },
    { x: -0.04, y: 0.004, z: -0.02, w: 0.08, h: 0.02, d: 0.07, color: "#f59e0b" },
  ];
}

/* ---------- Cats: Oren, Hitam, Putih, Hitam-Putih ---------- */

export interface CatPalette {
  body: string;
  accent: string;
  belly: string;
  snout: string;
  ears: string;
  eye: string;
  pupil: string;
  nose: string;
}

export function getCatPalette(variant: number): CatPalette {
  const v = Math.abs(variant) % 4;
  if (v === 0) {
    // 0: Orange / Oren tabby cat
    return {
      body: "#f97316",
      accent: "#c2410c",
      belly: "#ffedd5",
      snout: "#ffedd5",
      ears: "#fb7185",
      eye: "#16a34a",
      pupil: "#0f172a",
      nose: "#f472b6",
    };
  }
  if (v === 1) {
    // 1: Hitam (Black cat)
    return {
      body: "#18181b",
      accent: "#27272a",
      belly: "#18181b",
      snout: "#27272a",
      ears: "#f43f5e",
      eye: "#facc15",
      pupil: "#09090b",
      nose: "#3f3f46",
    };
  }
  if (v === 2) {
    // 2: Putih (White cat)
    return {
      body: "#ffffff",
      accent: "#f1f5f9",
      belly: "#ffffff",
      snout: "#ffffff",
      ears: "#f472b6",
      eye: "#38bdf8",
      pupil: "#0284c7",
      nose: "#f472b6",
    };
  }
  // 3: Hitam-Putih (Tuxedo cat with white socks & bib)
  return {
    body: "#1e293b",
    accent: "#0f172a",
    belly: "#ffffff",
    snout: "#ffffff",
    ears: "#f472b6",
    eye: "#84cc16",
    pupil: "#0f172a",
    nose: "#f472b6",
  };
}

/** Sleeping cat loaf/curled up peacefully (e.g. on top of parked cars). */
export function catSleepingParts(variant: number): Part[] {
  const pal = getCatPalette(variant);
  const isTabby = (Math.abs(variant) % 4) === 0;
  const parts: Part[] = [
    // Main loaf body
    { x: 0, y: 0.12, z: 0, w: 0.54, h: 0.24, d: 0.38, color: pal.body },
    { x: -0.22, y: 0.11, z: 0, w: 0.16, h: 0.22, d: 0.32, color: pal.body },
    { x: 0.2, y: 0.11, z: 0, w: 0.16, h: 0.22, d: 0.32, color: pal.body },
    // Soft underbelly / chest
    { x: 0.05, y: 0.06, z: 0.12, w: 0.38, h: 0.12, d: 0.16, color: pal.belly },
    // Tucked front paws
    { x: 0.14, y: 0.04, z: 0.15, w: 0.12, h: 0.08, d: 0.1, color: pal.belly },
    { x: 0.02, y: 0.04, z: 0.15, w: 0.12, h: 0.08, d: 0.1, color: pal.belly },
    // Head resting low, cozy
    { x: 0.26, y: 0.16, z: 0.04, w: 0.26, h: 0.22, d: 0.26, color: pal.body },
    { x: 0.37, y: 0.13, z: 0.04, w: 0.08, h: 0.12, d: 0.18, color: pal.snout },
    { x: 0.415, y: 0.16, z: 0.04, w: 0.03, h: 0.04, d: 0.05, color: pal.nose },
    // Peaceful sleeping closed eyes (curved lines)
    { x: 0.39, y: 0.2, z: 0.1, w: 0.04, h: 0.02, d: 0.05, color: pal.accent },
    { x: 0.39, y: 0.2, z: -0.02, w: 0.04, h: 0.02, d: 0.05, color: pal.accent },
    // Ears tilted back peacefully
    { x: 0.22, y: 0.29, z: 0.12, w: 0.08, h: 0.09, d: 0.08, color: pal.body },
    { x: 0.24, y: 0.28, z: 0.12, w: 0.06, h: 0.07, d: 0.05, color: pal.ears },
    { x: 0.22, y: 0.29, z: -0.04, w: 0.08, h: 0.09, d: 0.08, color: pal.body },
    { x: 0.24, y: 0.28, z: -0.04, w: 0.06, h: 0.07, d: 0.05, color: pal.ears },
    // Tail wrapped around side
    { x: -0.28, y: 0.08, z: -0.08, w: 0.12, h: 0.1, d: 0.2, color: pal.body },
    { x: -0.16, y: 0.08, z: -0.19, w: 0.32, h: 0.09, d: 0.1, color: pal.body },
    { x: 0.06, y: 0.08, z: -0.17, w: 0.16, h: 0.08, d: 0.09, color: pal.accent },
  ];
  if (isTabby) {
    parts.push(
      { x: -0.05, y: 0.245, z: 0, w: 0.06, h: 0.02, d: 0.34, color: pal.accent },
      { x: -0.14, y: 0.23, z: 0, w: 0.06, h: 0.02, d: 0.3, color: pal.accent },
    );
  }
  return parts;
}

/** Walking/crossing cat facing +x, standing on pavement. */
export function catWalkParts(variant: number): Part[] {
  const pal = getCatPalette(variant);
  const isTabby = (Math.abs(variant) % 4) === 0;
  const parts: Part[] = [
    // Torso
    { x: 0, y: 0.32, z: 0, w: 0.52, h: 0.26, d: 0.28, color: pal.body },
    { x: 0, y: 0.23, z: 0, w: 0.44, h: 0.08, d: 0.22, color: pal.belly },
    { x: 0.24, y: 0.33, z: 0, w: 0.08, h: 0.2, d: 0.22, color: pal.belly },
    // Legs with cute paws/socks
    { x: 0.16, y: 0.12, z: 0.11, w: 0.08, h: 0.24, d: 0.08, color: pal.belly },
    { x: 0.16, y: 0.12, z: -0.11, w: 0.08, h: 0.24, d: 0.08, color: pal.belly },
    { x: -0.18, y: 0.12, z: 0.11, w: 0.08, h: 0.24, d: 0.08, color: pal.belly },
    { x: -0.18, y: 0.12, z: -0.11, w: 0.08, h: 0.24, d: 0.08, color: pal.belly },
    // Thighs
    { x: -0.18, y: 0.24, z: 0.12, w: 0.12, h: 0.14, d: 0.08, color: pal.body },
    { x: -0.18, y: 0.24, z: -0.12, w: 0.12, h: 0.14, d: 0.08, color: pal.body },
    // Head
    { x: 0.32, y: 0.44, z: 0, w: 0.26, h: 0.24, d: 0.26, color: pal.body },
    { x: 0.44, y: 0.38, z: 0, w: 0.08, h: 0.12, d: 0.18, color: pal.snout },
    { x: 0.485, y: 0.41, z: 0, w: 0.03, h: 0.04, d: 0.05, color: pal.nose },
    // Whiskers
    { x: 0.45, y: 0.39, z: 0.13, w: 0.06, h: 0.015, d: 0.08, color: "#cbd5e1" },
    { x: 0.45, y: 0.39, z: -0.13, w: 0.06, h: 0.015, d: 0.08, color: "#cbd5e1" },
    // Eyes with slit pupils
    { x: 0.42, y: 0.47, z: 0.1, w: 0.05, h: 0.07, d: 0.06, color: pal.eye },
    { x: 0.445, y: 0.47, z: 0.1, w: 0.02, h: 0.06, d: 0.02, color: pal.pupil },
    { x: 0.42, y: 0.47, z: -0.1, w: 0.05, h: 0.07, d: 0.06, color: pal.eye },
    { x: 0.445, y: 0.47, z: -0.1, w: 0.02, h: 0.06, d: 0.02, color: pal.pupil },
    // Ears
    { x: 0.28, y: 0.6, z: 0.09, w: 0.08, h: 0.12, d: 0.07, color: pal.body },
    { x: 0.3, y: 0.58, z: 0.09, w: 0.05, h: 0.09, d: 0.04, color: pal.ears },
    { x: 0.28, y: 0.6, z: -0.09, w: 0.08, h: 0.12, d: 0.07, color: pal.body },
    { x: 0.3, y: 0.58, z: -0.09, w: 0.05, h: 0.09, d: 0.04, color: pal.ears },
    // Upright curled tail
    { x: -0.28, y: 0.44, z: 0, w: 0.08, h: 0.22, d: 0.08, color: pal.body },
    { x: -0.32, y: 0.62, z: 0, w: 0.07, h: 0.2, d: 0.07, color: pal.body },
    { x: -0.28, y: 0.74, z: 0, w: 0.1, h: 0.07, d: 0.07, color: pal.accent },
  ];
  if (isTabby) {
    parts.push(
      { x: -0.05, y: 0.455, z: 0, w: 0.06, h: 0.02, d: 0.26, color: pal.accent },
      { x: 0.08, y: 0.455, z: 0, w: 0.06, h: 0.02, d: 0.26, color: pal.accent },
    );
  }
  return parts;
}

/** Comical flying ragdoll cat: front arms & rear legs stretched wide out ("tangan & kaki melebar gitu"), shocked face & screaming mouth! */
export function catRagdollFlyingParts(variant: number): Part[] {
  const pal = getCatPalette(variant);
  return [
    // Elongated star/parachute body centered at (0, 0, 0)
    { x: 0, y: 0, z: 0, w: 0.64, h: 0.16, d: 0.28, color: pal.body },
    { x: 0.04, y: -0.05, z: 0, w: 0.5, h: 0.08, d: 0.24, color: pal.belly },

    // FRONT LEGS / ARMS ("tangan melebar") - outstretched wide sideways and forward
    // Left front arm
    { x: 0.18, y: 0.02, z: 0.28, w: 0.16, h: 0.09, d: 0.28, color: pal.body },
    { x: 0.24, y: 0.04, z: 0.44, w: 0.14, h: 0.08, d: 0.16, color: pal.belly },
    { x: 0.26, y: 0.04, z: 0.53, w: 0.1, h: 0.06, d: 0.08, color: "#fca5a5" }, // splayed claws/beans
    // Right front arm
    { x: 0.18, y: 0.02, z: -0.28, w: 0.16, h: 0.09, d: 0.28, color: pal.body },
    { x: 0.24, y: 0.04, z: -0.44, w: 0.14, h: 0.08, d: 0.16, color: pal.belly },
    { x: 0.26, y: 0.04, z: -0.53, w: 0.1, h: 0.06, d: 0.08, color: "#fca5a5" },

    // REAR LEGS / FEET ("kaki melebar") - outstretched wide sideways and backward
    // Left rear leg
    { x: -0.24, y: 0.02, z: 0.32, w: 0.2, h: 0.09, d: 0.34, color: pal.body },
    { x: -0.34, y: 0.04, z: 0.48, w: 0.15, h: 0.08, d: 0.16, color: pal.belly },
    { x: -0.4, y: 0.04, z: 0.56, w: 0.1, h: 0.06, d: 0.08, color: "#fca5a5" },
    // Right rear leg
    { x: -0.24, y: 0.02, z: -0.32, w: 0.2, h: 0.09, d: 0.34, color: pal.body },
    { x: -0.34, y: 0.04, z: -0.48, w: 0.15, h: 0.08, d: 0.16, color: pal.belly },
    { x: -0.4, y: 0.04, z: -0.56, w: 0.1, h: 0.06, d: 0.08, color: "#fca5a5" },

    // Puffed-out startled trailing tail (bottlebrush tail)
    { x: -0.42, y: 0.06, z: 0, w: 0.24, h: 0.16, d: 0.16, color: pal.body },
    { x: -0.62, y: 0.12, z: 0, w: 0.22, h: 0.14, d: 0.14, color: pal.accent },
    { x: -0.48, y: 0.18, z: 0, w: 0.08, h: 0.08, d: 0.08, color: pal.body },
    { x: -0.58, y: -0.04, z: 0, w: 0.08, h: 0.08, d: 0.08, color: pal.accent },

    // Head thrust forward in shock
    { x: 0.38, y: 0.08, z: 0, w: 0.28, h: 0.24, d: 0.28, color: pal.body },

    // Airplane ears flattened sideways
    { x: 0.32, y: 0.18, z: 0.18, w: 0.08, h: 0.06, d: 0.16, color: pal.body },
    { x: 0.34, y: 0.18, z: 0.18, w: 0.06, h: 0.05, d: 0.12, color: pal.ears },
    { x: 0.32, y: 0.18, z: -0.18, w: 0.08, h: 0.06, d: 0.16, color: pal.body },
    { x: 0.34, y: 0.18, z: -0.18, w: 0.06, h: 0.05, d: 0.12, color: pal.ears },

    // GIANT SHOCKED ROUND EYES (cartoon O_O)
    { x: 0.48, y: 0.14, z: 0.09, w: 0.08, h: 0.11, d: 0.1, color: "#ffffff" },
    { x: 0.525, y: 0.14, z: 0.09, w: 0.02, h: 0.04, d: 0.04, color: "#000000" },
    { x: 0.48, y: 0.14, z: -0.09, w: 0.08, h: 0.11, d: 0.1, color: "#ffffff" },
    { x: 0.525, y: 0.14, z: -0.09, w: 0.02, h: 0.04, d: 0.04, color: "#000000" },

    // WIDE OPEN SCREAMING MOUTH ("MEOWWW!")
    { x: 0.48, y: 0.01, z: 0, w: 0.09, h: 0.12, d: 0.14, color: "#450a0a" },
    { x: 0.49, y: -0.03, z: 0, w: 0.06, h: 0.04, d: 0.08, color: "#f43f5e" },
    // Tiny fangs
    { x: 0.51, y: 0.05, z: 0.04, w: 0.02, h: 0.03, d: 0.02, color: "#ffffff" },
    { x: 0.51, y: 0.05, z: -0.04, w: 0.02, h: 0.03, d: 0.02, color: "#ffffff" },
    // Nose
    { x: 0.525, y: 0.08, z: 0, w: 0.02, h: 0.03, d: 0.04, color: pal.nose },
  ];
}




/* ---------- Rambu & perlengkapan perempatan ---------- */

/** Rambu STOP Jepang (止まれ): segitiga merah terbalik di tiang — dipasang di sudut perempatan. */
export function stopSignParts(): Part[] {
  const red = "#d90429";
  return [
    { x: 0, y: 0.05, z: 0, w: 0.28, h: 0.1, d: 0.28, color: "#6b7078" },
    { x: 0, y: 1.05, z: 0, w: 0.08, h: 2.1, d: 0.08, color: "#8d949c" },
    // segitiga terbalik: 3 pelat menyempit ke bawah (menyala biar kebaca malam)
    { x: 0, y: 2.32, z: 0.03, w: 0.05, h: 0.3, d: 0.96, color: red, glow: true },
    { x: 0, y: 2.06, z: 0.03, w: 0.05, h: 0.24, d: 0.62, color: red, glow: true },
    { x: 0, y: 1.86, z: 0.03, w: 0.05, h: 0.18, d: 0.3, color: red, glow: true },
    // tulisan 止まれ (bar putih)
    { x: 0, y: 2.36, z: 0.07, w: 0.02, h: 0.12, d: 0.66, color: "#ffffff", glow: true },
    // garis tepi putih atas
    { x: 0, y: 2.5, z: 0.05, w: 0.03, h: 0.06, d: 0.9, color: "#ffffff", glow: true },
  ];
}

/** Rambu penyeberangan pejalan kaki Jepang: panel biru persegi dengan figur pejalan putih. */
export function pedCrossingSignParts(): Part[] {
  const blue = "#1d4ed8";
  return [
    { x: 0, y: 0.05, z: 0, w: 0.28, h: 0.1, d: 0.28, color: "#6b7078" },
    { x: 0, y: 1.1, z: 0, w: 0.08, h: 2.2, d: 0.08, color: "#8d949c" },
    // panel biru menyala
    { x: 0, y: 2.5, z: 0.03, w: 0.06, h: 0.86, d: 0.86, color: blue, glow: true },
    // figur pejalan kaki (putih): kepala, badan, kaki melangkah
    { x: 0, y: 2.76, z: 0.07, w: 0.03, h: 0.14, d: 0.14, color: "#ffffff", glow: true },
    { x: 0, y: 2.56, z: 0.07, w: 0.03, h: 0.26, d: 0.16, color: "#ffffff", glow: true },
    { x: 0, y: 2.32, z: 0.13, w: 0.03, h: 0.24, d: 0.08, color: "#ffffff", glow: true },
    { x: 0, y: 2.32, z: 0.0, w: 0.03, h: 0.22, d: 0.08, color: "#ffffff", glow: true },
    // zebra kecil di bawah figur
    { x: 0, y: 2.16, z: 0.05, w: 0.03, h: 0.05, d: 0.6, color: "#ffffff", glow: true },
  ];
}

/** Lampu jalan avenue dua kepala untuk median Shibuya (menyinari dua arah jalur). */
export function avenueLampParts(): Part[] {
  const pole = "#3f444c";
  return [
    { x: 0, y: 0.12, z: 0, w: 0.5, h: 0.24, d: 0.5, color: pole },
    { x: 0, y: 2.4, z: 0, w: 0.18, h: 4.6, d: 0.18, color: "#4a4f57" },
    // lengan silang dua arah
    { x: 0, y: 4.6, z: 0, w: 0.14, h: 0.14, d: 2.6, color: "#4a4f57" },
    // dua kepala lampu + bohlam menyala hangat
    { x: 0, y: 4.52, z: 1.2, w: 0.5, h: 0.14, d: 0.55, color: "#4a4f57" },
    { x: 0, y: 4.42, z: 1.2, w: 0.42, h: 0.1, d: 0.46, color: "#fff2b0", glow: true },
    { x: 0, y: 4.52, z: -1.2, w: 0.5, h: 0.14, d: 0.55, color: "#4a4f57" },
    { x: 0, y: 4.42, z: -1.2, w: 0.42, h: 0.1, d: 0.46, color: "#fff2b0", glow: true },
    // aksen banner kota kecil di tiang (khas avenue Jepang)
    { x: 0, y: 3.2, z: 0.28, w: 0.06, h: 0.9, d: 0.42, color: "#ff5fa2", glow: true },
  ];
}

/**
 * SHIBUYA SCRAMBLE CROSSING: perempatan raksasa selebar avenue 6 jalur.
 * Frame lokal: +x searah jalan pemain, +z = arah lat (median di z≈4.35, jalur lawan z 5..12.3).
 * Zebra putihnya self-luminous supaya menyala bersih di malam hari.
 */
export function scrambleRoadParts(): Part[] {
  const asphalt = "#3b4152";
  const asphaltDark = "#343a4a";
  const zebra = "#e4e8ef";
  const parts: Part[] = [];
  const avenueW = 13.4;

  // A single, level intersection apron: two carriageways and a paved-over median.
  parts.push({ x: 0, y: 0.016, z: 0, w: avenueW, h: 0.024, d: 8.0, color: asphalt });
  parts.push({ x: 0, y: 0.016, z: 8.65, w: avenueW, h: 0.024, d: 7.35, color: asphalt });
  parts.push({ x: 0, y: 0.09, z: 4.35, w: avenueW, h: 0.175, d: 1.6, color: asphaltDark });

  // Cross streets on all four corners; keep the curb edges straight and uncluttered.
  for (const [z0, z1] of [[-30, -4.0], [12.3, 30]] as const) {
    const mid = (z0 + z1) / 2;
    parts.push({ x: 0, y: 0.145, z: mid, w: avenueW, h: 0.06, d: z1 - z0, color: asphalt });
  }

  // Two crisp, evenly spaced zebra bands across the six-lane avenue.
  for (const x of [-5.0, 5.0]) {
    for (let z = -3.4; z <= 12.1; z += 0.95) {
      const onMedian = z > 3.4 && z < 5.3;
      parts.push({ x, y: onMedian ? 0.19 : 0.04, z, w: 2.25, h: 0.022, d: 0.46, color: zebra });
    }
  }

  // Matching zebra crossings on the north/south side streets.
  for (const z of [-5.4, 13.7]) {
    for (let x = -5.5; x <= 5.5; x += 0.9) {
      parts.push({ x, y: 0.19, z, w: 0.44, h: 0.022, d: 2.0, color: zebra });
    }
  }

  // Signature diagonal scramble paths, confined to the center so they do not pile onto the straight zebras.
  const diagonals = [
    { x0: -2.8, z0: -2.6, x1: 2.8, z1: 10.2 },
    { x0: -2.8, z0: 10.2, x1: 2.8, z1: -2.6 },
  ];
  const stripeCount = 13;
  for (let d = 0; d < diagonals.length; d++) {
    const line = diagonals[d];
    const dx = line.x1 - line.x0;
    const dz = line.z1 - line.z0;
    const ry = Math.atan2(dx, dz);
    for (let i = 1; i < stripeCount - 1; i++) {
      const t = i / (stripeCount - 1);
      // Leave a small clean center tile where the two diagonal routes meet; no z-fighting pile-up.
      if (t > 0.44 && t < 0.56) continue;
      const x = line.x0 + t * dx;
      const z = line.z0 + t * dz;
      const onMedian = z > 3.4 && z < 5.3;
      const y = (onMedian ? 0.19 : 0.04) + d * 0.003;
      parts.push({ x, y, z, w: 1.7, h: 0.022, d: 0.42, ry, color: zebra });
    }
  }

  // Bold stop bars frame the junction and make the approach geometry easy to read.
  for (const x of [-6.45, 6.45]) {
    for (const [z, width] of [[0, 7.0], [8.65, 7.0]] as const) {
      const onMedian = z > 3.4 && z < 5.3;
      parts.push({ x, y: onMedian ? 0.19 : 0.04, z, w: 0.16, h: 0.022, d: width, color: zebra });
    }
  }

  return parts;
}

/* ---------- Lampu kendaraan malam hari (overlay glow, hanya dirender saat mode malam) ---------- */

/** Lampu mobil `carParts` (hadap +x): headlight hangat menyala + taillight merah. */
export function carLightParts(): Part[] {
  return [
    { x: 1.66, y: 0.65, z: 0.5, w: 0.1, h: 0.26, d: 0.34, color: "#fff8d8", glow: true },
    { x: 1.66, y: 0.65, z: -0.5, w: 0.1, h: 0.26, d: 0.34, color: "#fff8d8", glow: true },
    { x: -1.66, y: 0.65, z: 0.5, w: 0.1, h: 0.22, d: 0.3, color: "#ff3b3b", glow: true },
    { x: -1.66, y: 0.65, z: -0.5, w: 0.1, h: 0.22, d: 0.3, color: "#ff3b3b", glow: true },
  ];
}

/** Lampu motor `motorcycleParts` (hadap +x). */
export function motoLightParts(): Part[] {
  return [
    { x: 0.7, y: 0.86, z: 0, w: 0.1, h: 0.18, d: 0.26, color: "#fff8d8", glow: true },
    { x: -0.73, y: 0.62, z: 0, w: 0.08, h: 0.12, d: 0.18, color: "#ff3b3b", glow: true },
  ];
}

/** Lampu mobil silang `crossingCarParts` (hadap +x). */
export function crossCarLightParts(): Part[] {
  return [
    { x: 1.66, y: 0.64, z: 0.52, w: 0.1, h: 0.24, d: 0.36, color: "#fff8d8", glow: true },
    { x: 1.66, y: 0.64, z: -0.52, w: 0.1, h: 0.24, d: 0.36, color: "#fff8d8", glow: true },
    { x: -1.62, y: 0.64, z: 0.52, w: 0.1, h: 0.2, d: 0.3, color: "#ff3b3b", glow: true },
    { x: -1.62, y: 0.64, z: -0.52, w: 0.1, h: 0.2, d: 0.3, color: "#ff3b3b", glow: true },
  ];
}

/* ---------- Daily Word Hunt Letter Badge (Subway Surfers-style) ---------- */

const LETTER_5X5: Record<string, number[]> = {
  A: [0x0e, 0x11, 0x1f, 0x11, 0x11],
  B: [0x1e, 0x11, 0x1e, 0x11, 0x1e],
  C: [0x0f, 0x10, 0x10, 0x10, 0x0f],
  D: [0x1c, 0x12, 0x11, 0x12, 0x1c],
  E: [0x1f, 0x10, 0x1e, 0x10, 0x1f],
  F: [0x1f, 0x10, 0x1e, 0x10, 0x10],
  G: [0x0f, 0x10, 0x17, 0x11, 0x0f],
  H: [0x11, 0x11, 0x1f, 0x11, 0x11],
  I: [0x1f, 0x04, 0x04, 0x04, 0x1f],
  J: [0x07, 0x02, 0x02, 0x12, 0x0c],
  K: [0x11, 0x12, 0x1c, 0x12, 0x11],
  L: [0x10, 0x10, 0x10, 0x10, 0x1f],
  M: [0x11, 0x1b, 0x15, 0x11, 0x11],
  N: [0x11, 0x19, 0x15, 0x13, 0x11],
  O: [0x0e, 0x11, 0x11, 0x11, 0x0e],
  P: [0x1e, 0x11, 0x1e, 0x10, 0x10],
  Q: [0x0e, 0x11, 0x11, 0x13, 0x0f],
  R: [0x1e, 0x11, 0x1e, 0x14, 0x12],
  S: [0x0f, 0x10, 0x0e, 0x01, 0x1e],
  T: [0x1f, 0x04, 0x04, 0x04, 0x04],
  U: [0x11, 0x11, 0x11, 0x11, 0x0e],
  V: [0x11, 0x11, 0x11, 0x0a, 0x04],
  W: [0x11, 0x11, 0x15, 0x15, 0x0a],
  X: [0x11, 0x0a, 0x04, 0x0a, 0x11],
  Y: [0x11, 0x11, 0x0e, 0x04, 0x04],
  Z: [0x1f, 0x02, 0x04, 0x08, 0x1f],
};

/**
 * 3D Voxel Letter Badge:
 * Golden framed plaque with glowing royal-blue center and illuminated 3D extruded voxel letter.
 * Origin at (0, 0.55, 0) so it floats naturally above the track.
 */
export function letterBadgeParts(char: string): Part[] {
  const c = char.toUpperCase();
  const rows = LETTER_5X5[c] ?? LETTER_5X5.P;
  const gold = "#ffd21f";
  const goldDark = "#d69a12";
  const bluePlate = "#0b66e4";
  const letterColor = "#ffffff";

  const parts: Part[] = [
    // Golden outer frame
    { x: 0, y: 0.55, z: 0, w: 0.88, h: 0.88, d: 0.22, color: gold },
    { x: 0, y: 0.55, z: 0, w: 0.94, h: 0.72, d: 0.2, color: goldDark },
    { x: 0, y: 0.55, z: 0, w: 0.72, h: 0.94, d: 0.2, color: goldDark },

    // Royal blue glossy inner plaque
    { x: 0, y: 0.55, z: 0, w: 0.74, h: 0.74, d: 0.25, color: bluePlate },

    // Corner golden studs
    { x: -0.34, y: 0.89, z: 0, w: 0.08, h: 0.08, d: 0.27, color: gold },
    { x: 0.34, y: 0.89, z: 0, w: 0.08, h: 0.08, d: 0.27, color: gold },
    { x: -0.34, y: 0.21, z: 0, w: 0.08, h: 0.08, d: 0.27, color: gold },
    { x: 0.34, y: 0.21, z: 0, w: 0.08, h: 0.08, d: 0.27, color: gold },
  ];

  // 5x5 voxel letter extruded on both FRONT (+z) and BACK (-z) sides
  const step = 0.11;
  const startX = -2 * step;
  const startY = 0.55 + 2 * step;

  for (let r = 0; r < 5; r++) {
    const rowBits = rows[r];
    const y = startY - r * step;
    for (let col = 0; col < 5; col++) {
      const bit = (rowBits >> (4 - col)) & 1;
      if (bit) {
        const x = startX + col * step;
        // Front face letter voxel (+z)
        parts.push({
          x,
          y,
          z: 0.135,
          w: step * 0.94,
          h: step * 0.94,
          d: 0.05,
          color: letterColor,
          glow: true,
        });
        // Back face letter voxel (-z)
        parts.push({
          x,
          y,
          z: -0.135,
          w: step * 0.94,
          h: step * 0.94,
          d: 0.05,
          color: letterColor,
          glow: true,
        });
      }
    }
  }

  return parts;
}

/* ---------- Shibuya Subway / Metro Underground System ---------- */

export const SUBWAY_CAR_LEN = 11.0;
export const SUBWAY_CAR_W = 2.18;
export const SUBWAY_GAP = 0.5;
export const SUBWAY_ROOF_H = 2.45;
export const BUS_ROOF_H = 2.05;

/**
 * Pintu masuk & keluar terowongan subway Shibuya (Portal Terowongan Metro Raksasa):
 * Balok beton bertulang megah & sangat tinggi membentang melintang di atas 3 jalur + trotoar lebar (W = 21.0m),
 * tinggi plafon H = 17.5m (sangat tinggi & lapang, kamera game masuk dengan leluasa tanpa terbentur plafon),
 * papan penunjuk stasiun akrilik biru/emas menyala, logo cincin Tokyo Metro,
 * lampu clearance hijau/merah, dan deretan lampu sorot LED menyinari mulut terowongan.
 */
export function subwayPortalParts(isExit = false): Part[] {
  const concrete = "#7b828e";
  const concreteDark = "#545a64";
  const metal = "#373b42";
  const navy = "#071e40";
  const cyanMetro = "#00b2e3";
  const yellow = "#ffd21f";
  const white = "#ffffff";
  const amber = "#f59e0b";

  const W = 21.0; // bentang melintang sangat lebar & lapang (z)
  const H = 17.5; // tinggi portal sangat tinggi & lega untuk kamera (y)
  const D = 3.8;  // ketebalan pilar portal (x)
  const parts: Part[] = [
    // Kolom kiri & kanan tebal beton bertulang raksasa
    { x: 0, y: H / 2, z: -W / 2 + 0.9, w: D, h: H, d: 1.8, color: concrete },
    { x: 0, y: H / 2, z: W / 2 - 0.9, w: D, h: H, d: 1.8, color: concrete },
    // Balok atas penopang utama lengkungan portal (tinggi di atas, clearance buka hingga y = 16.0m)
    { x: 0, y: H - 0.75, z: 0, w: D + 0.5, h: 1.5, d: W, color: concrete },
    // Dinding penutup atas tanah
    { x: -0.6, y: H + 0.75, z: 0, w: 2.6, h: 1.5, d: W + 2.4, color: concreteDark },

    // Papan nama stasiun besar menyala (Marquee header menghadap pemain di -x)
    { x: -D / 2 - 0.15, y: H - 0.75, z: 0, w: 0.12, h: 1.2, d: W - 3.2, color: navy },
    { x: -D / 2 - 0.22, y: H - 0.75, z: 0, w: 0.05, h: 1.0, d: W - 3.6, color: isExit ? "#1e3a5f" : "#00388d", glow: true },

    // Logo Metro (lingkaran cincin cyan / gold)
    { x: -D / 2 - 0.28, y: H - 0.75, z: -6.8, w: 0.05, h: 0.8, d: 0.8, color: cyanMetro, glow: true },
    { x: -D / 2 - 0.31, y: H - 0.75, z: -6.8, w: 0.05, h: 0.46, d: 0.46, color: white, glow: true },
    { x: -D / 2 - 0.33, y: H - 0.75, z: -6.8, w: 0.05, h: 0.32, d: 0.32, color: cyanMetro, glow: true },

    // Tulisan stasiun: "渋谷 地下鉄 / SHIBUYA METRO LINE"
    { x: -D / 2 - 0.28, y: H - 0.6, z: 0.8, w: 0.05, h: 0.4, d: 10.5, color: white, glow: true },
    { x: -D / 2 - 0.28, y: H - 0.98, z: 0.8, w: 0.05, h: 0.25, d: 9.0, color: isExit ? amber : cyanMetro, glow: true },

    // Strip hazard garis kuning/hitam di bibir portal
    { x: -D / 2 - 0.08, y: H - 1.55, z: 0, w: 0.12, h: 0.18, d: W - 2.0, color: yellow, glow: true },

    // Lampu sorot LED di portal menyinari pintu masuk
    { x: -D / 2 + 0.2, y: H - 1.65, z: -5.4, w: 0.35, h: 0.14, d: 0.8, color: "#fff9e6", glow: true },
    { x: -D / 2 + 0.2, y: H - 1.65, z: 0.0, w: 0.35, h: 0.14, d: 0.8, color: "#fff9e6", glow: true },
    { x: -D / 2 + 0.2, y: H - 1.65, z: 5.4, w: 0.35, h: 0.14, d: 0.8, color: "#fff9e6", glow: true },

    // Rambu lampu clearance hijau di atas tiap jalur
    { x: -D / 2 - 0.18, y: H - 1.45, z: -2.4, w: 0.08, h: 0.26, d: 0.26, color: "#00e676", glow: true },
    { x: -D / 2 - 0.18, y: H - 1.45, z: 0.0, w: 0.08, h: 0.26, d: 0.26, color: "#00e676", glow: true },
    { x: -D / 2 - 0.18, y: H - 1.45, z: 2.4, w: 0.08, h: 0.26, d: 0.26, color: "#00e676", glow: true },

    // Rangka baja penahan di dalam
    { x: 1.2, y: H - 1.8, z: 0, w: 0.45, h: 0.35, d: W - 2.2, color: metal },
  ];

  return parts;
}

/**
 * Kerangka Rusuk Terowongan Bersih & Lapang (Tunnel Rib Arch):
 * Membentang melintang di atas jalan selebar W = 20.2m (lateral z = -10.1 s.d +10.1),
 * tinggi plafon H = 17.2m (sangat tinggi & lapang, kamera leluasa di dalam tanpa terpotong),
 * dilengkapi tabung lampu fluorescent plafon yang terang benderang ("TIDAK GELAP!"),
 * kolom samping yang bersih dan serasi dengan dinding, tanpa rambu/papan matrix yang ribet.
 */
export function subwayTunnelRibParts(line = 0): Part[] {
  const steel = "#383f4b";
  const whiteTile = "#eaeff5";
  const fluoLight = "#fffdf0";
  const lineColors = ["#f39200", "#00a7e1", "#00b060", "#e60012"]; // Ginza, Tozai, Chiyoda, Marunouchi
  const stripe = lineColors[line % 4];

  const W = 20.2; // bentang melintang jalan sangat lebar & lapang (z)
  const H = 17.2; // tinggi plafon terowongan sangat tinggi (y)
  const parts: Part[] = [
    // Lengkungan balok atas melintang di plafon yang kokoh & rapi
    { x: 0, y: H, z: 0, w: 0.65, h: 0.55, d: W, color: steel },
    // Plafon beton atas penutup langit terowongan
    { x: 0, y: H + 0.35, z: 0, w: 1.4, h: 0.2, d: W + 0.8, color: "#282d37" },

    // Kolom kiri & kanan bersih & mulus (di z = -W / 2 + 0.7 dan W / 2 - 0.7)
    { x: 0, y: H / 2, z: -W / 2 + 0.7, w: 0.75, h: H, d: 1.1, color: whiteTile },
    { x: 0, y: H / 2, z: W / 2 - 0.7, w: 0.75, h: H, d: 1.1, color: whiteTile },

    // Satu garis aksen selaras di ketinggian mata pada kolom (y = 2.2m)
    { x: 0, y: 2.2, z: -W / 2 + 0.7, w: 0.77, h: 0.22, d: 1.12, color: stripe },
    { x: 0, y: 2.2, z: W / 2 - 0.7, w: 0.77, h: 0.22, d: 1.12, color: stripe },

    // TABUNG LAMPU FLUORESCENT PLAFON: TERANG BENDERANG & TIDAK GELAP
    // Deret lampu rapi di plafon menyinari terowongan secara merata
    { x: 0, y: H - 0.35, z: -5.0, w: 0.22, h: 0.1, d: 3.6, color: fluoLight, glow: true },
    { x: 0, y: H - 0.35, z: 0.0, w: 0.22, h: 0.1, d: 3.6, color: fluoLight, glow: true },
    { x: 0, y: H - 0.35, z: 5.0, w: 0.22, h: 0.1, d: 3.6, color: fluoLight, glow: true },
    // Casing lampu
    { x: 0, y: H - 0.28, z: -5.0, w: 0.26, h: 0.06, d: 3.7, color: "#1f232a" },
    { x: 0, y: H - 0.28, z: 0.0, w: 0.26, h: 0.06, d: 3.7, color: "#1f232a" },
    { x: 0, y: H - 0.28, z: 5.0, w: 0.26, h: 0.06, d: 3.7, color: "#1f232a" },
  ];

  return parts;
}

/**
 * Dinding Terowongan Bersih & Minimalis (Clean Subway Wall):
 * Desain bersih, elegan, dan tidak ribet — dinding mulus terang dengan dasar kokoh,
 * satu garis aksen horizontal ramping yang rapi, tanpa papan pengumuman/iklan berjejal
 * dan tanpa kabel/pipa yang membingungkan pandangan.
 */
export function subwayWallParts(len = 6.0, line = 0): Part[] {
  const wallSurface = "#eaeff5";
  const darkBase = "#282d37";
  const lineColors = ["#f39200", "#00a7e1", "#00b060", "#e60012"];
  const stripe = lineColors[line % 4];

  const H = 17.2; // tinggi dinding mengikuti plafon lapang (y)
  const parts: Part[] = [
    // Dasar fondasi dinding bawah yang kokoh & rapi
    { x: 0, y: 0.25, z: 0, w: len, h: 0.5, d: 0.4, color: darkBase },
    // Dinding utama yang mulus, bersih, dan terang
    { x: 0, y: H / 2, z: 0, w: len, h: H, d: 0.25, color: wallSurface },
    // Satu garis aksen horizontal yang ramping dan rapi di ketinggian mata (y = 2.2m)
    { x: 0, y: 2.2, z: 0.01, w: len, h: 0.22, d: 0.26, color: stripe },
  ];

  return parts;
}

/**
 * Landasan Jalan Khusus Terowongan / Busway Shibuya:
 * Permukaan jalan 100% mulus mengikuti mesh jalan tanpa anak tangga.
 * Hanya meletakkan list trotoar tepi yang rapi di luar jalur berkendara (|z| = 8.5m).
 */
export function subwayTrackParts(len = 6.0): Part[] {
  const curbConcrete = "#7e8898";
  const curbDark = "#3a404c";

  const parts: Part[] = [
    // Trotoar samping jalan busway jauh di luar jalur jalan (|z| = 8.5m)
    // Tanpa ada slab datar di atas aspal agar jalanan tidak patah / bertingkat
    { x: 0, y: 0.12, z: -8.5, w: len, h: 0.24, d: 2.2, color: curbConcrete },
    { x: 0, y: 0.12, z: 8.5, w: len, h: 0.24, d: 2.2, color: curbConcrete },
    // List pembatas tepi jalan yang rapi
    { x: 0, y: 0.13, z: -7.4, w: len, h: 0.26, d: 0.16, color: curbDark },
    { x: 0, y: 0.13, z: 7.4, w: len, h: 0.26, d: 0.16, color: curbDark },
  ];

  return parts;
}

/**
 * Armada Bus Kota Tokyo & Bus Highway Express (Subway / Highway Bus):
 * Menggantikan kereta menjadi bus kota & bus ekspres modern (Toei Green, Keikyu Red, Highway Blue, Night VIP).
 * Dimensi: panjang L = 10.6m, lebar W = 2.4m, tinggi atap H = 2.45m.
 * Dilengkapi: kaca depan besar aerodinamis menghadap pemain di -x, lampu depan LED terang,
 * rollsign tujuan menyala "渋谷駅前 / SHIBUYA BUS", roda bus berpelat pelek krom,
 * jendela samping panorama, dan ATAP DATAR + CATWALK tempat merpati berselancar (ROOF SURFING).
 */
export function subwayTrainCarParts(
  line = 0,
  isFrontCab = false,
  isRearCab = false,
  isShinkansen = false,
  isStopped = false,
): Part[] {
  const lineIdx = line % 4;
  // Livery bus khas Tokyo:
  // 0: Tokyo Toei City Bus (Hijau hutan Tokyo, strip kuning, bodi putih)
  // 1: Keikyu Expressway Highway Coach (Merah crimson, strip perak putih)
  // 2: Tokyo Airport Limousine Bus (Biru navy royal, strip cyan elektrik)
  // 3: Shinjuku Night VIP Express (Ungu malam / emas mewah)
  const primaryColors = ["#1b7a43", "#b91c1c", "#00509d", "#312e81"];
  const accentColors = ["#f4b41a", "#ffffff", "#00b4d8", "#f59e0b"];
  const primary = isShinkansen ? "#00509d" : primaryColors[lineIdx];
  const accent = isShinkansen ? "#00b4d8" : accentColors[lineIdx];
  const bodyWhite = "#ffffff";
  const darkChassis = "#1e2229";
  const tireColor = "#15181e";
  const rimColor = "#cbd5e1";
  const glassTint = "#1a2433";
  const warmInterior = "#fff7d6";

  const L = SUBWAY_CAR_LEN; // 11.0m panjang bus
  const W = SUBWAY_CAR_W;   // 2.4m lebar bus
  const H = 2.45;           // tinggi atap (y = 2.45m)
  const parts: Part[] = [];

  // RODA BUS KARET DENGAN PELEK KROM
  // 2 roda depan & 4 roda belakang (dual axle)
  const wheelPositions = [
    { x: -L * 0.35, z: -W / 2 + 0.08 },
    { x: -L * 0.35, z: W / 2 - 0.08 },
    { x: L * 0.22, z: -W / 2 + 0.08 },
    { x: L * 0.22, z: W / 2 - 0.08 },
    { x: L * 0.36, z: -W / 2 + 0.08 },
    { x: L * 0.36, z: W / 2 - 0.08 },
  ];
  for (const wp of wheelPositions) {
    // Ban luar
    parts.push({ x: wp.x, y: 0.38, z: wp.z, w: 0.76, h: 0.76, d: 0.28, color: tireColor });
    // Pelek krom tengah
    parts.push({ x: wp.x, y: 0.38, z: wp.z + (wp.z > 0 ? 0.03 : -0.03), w: 0.42, h: 0.42, d: 0.26, color: rimColor });
    // Poros tengah
    parts.push({ x: wp.x, y: 0.38, z: wp.z + (wp.z > 0 ? 0.05 : -0.05), w: 0.18, h: 0.18, d: 0.24, color: "#475569" });
  }

  // SASIS & BEJANA BAWAH BUS
  parts.push({ x: 0, y: 0.48, z: 0, w: L - 0.4, h: 0.24, d: W - 0.22, color: darkChassis });
  // Bumper pelindung depan & belakang
  parts.push({ x: -L / 2 + 0.1, y: 0.45, z: 0, w: 0.35, h: 0.32, d: W, color: "#111418" });
  parts.push({ x: L / 2 - 0.1, y: 0.45, z: 0, w: 0.35, h: 0.32, d: W, color: "#111418" });

  // BADAN BAWAH BUS (WARNA UTAMA LIVERY)
  parts.push({ x: 0, y: 0.95, z: 0, w: L, h: 0.72, d: W, color: primary });

  // STRIP AKSEN WARNA MEWAH SEPANJANG BADAN BUS
  for (const sz of [-W / 2 - 0.015, W / 2 + 0.015]) {
    parts.push({ x: 0, y: 1.18, z: sz, w: L, h: 0.18, d: 0.03, color: accent, glow: true });
    parts.push({ x: 0, y: 1.34, z: sz, w: L, h: 0.06, d: 0.03, color: bodyWhite });
  }

  // BADAN ATAS BUS (PUTIH BERSIH)
  parts.push({ x: 0, y: 1.88, z: 0, w: L, h: 0.98, d: W, color: bodyWhite });

  // JENDELA SAMPING PANORAMA (KACA TINTED + PENUMPANG MENYALA HANGAT)
  const nWindows = 5;
  for (let i = 0; i < nWindows; i++) {
    const wx = -L * 0.34 + i * (L * 0.68 / (nWindows - 1));
    for (const sz of [-W / 2 - 0.018, W / 2 + 0.018]) {
      // Bingkai kaca hitam
      parts.push({ x: wx, y: 1.72, z: sz, w: 1.15, h: 0.68, d: 0.03, color: glassTint });
      // Cahaya interior hangat
      parts.push({ x: wx, y: 1.72, z: sz, w: 1.05, h: 0.56, d: 0.035, color: warmInterior, glow: true });
    }
  }

  // PINTU PENUMPANG BUS (DI SISI KIRI JEPANG / z = W/2)
  for (const dx of [-L * 0.26, L * 0.18]) {
    parts.push({ x: dx, y: 1.25, z: W / 2 + 0.02, w: 0.85, h: 1.35, d: 0.03, color: "#334155" });
    parts.push({ x: dx, y: 1.55, z: W / 2 + 0.025, w: 0.65, h: 0.65, d: 0.03, color: glassTint });
  }

  // ATAP BUS DATAR TEMPAT BERSELANCAR (ROOF SURFING PLATFORM at y = 2.45m)
  parts.push({ x: 0, y: H - 0.06, z: 0, w: L, h: 0.12, d: W - 0.15, color: "#dbe2ea" });
  // Catwalk anti-selip bertekstur di atap
  parts.push({ x: 0, y: H + 0.02, z: 0, w: L - 0.6, h: 0.04, d: 0.95, color: "#f8fafc" });
  // Strip marka neon di tepi atap bus
  parts.push({ x: 0, y: H + 0.01, z: -W / 2 + 0.15, w: L, h: 0.025, d: 0.08, color: accent, glow: true });
  parts.push({ x: 0, y: H + 0.01, z: W / 2 - 0.15, w: L, h: 0.025, d: 0.08, color: accent, glow: true });
  // Rel coping logam perak di pinggiran atap bus untuk freestyle menyeimbangkan skate (50-50 / Edge Grind)
  parts.push({ x: 0, y: H + 0.045, z: -W / 2 + 0.1, w: L, h: 0.05, d: 0.09, color: "#f1f5f9" });
  parts.push({ x: 0, y: H + 0.045, z: W / 2 - 0.1, w: L, h: 0.05, d: 0.09, color: "#f1f5f9" });

  // DUA UNIT AC PENDINGIN BUS (BUS ROOFTOP AC UNITS) DI ATAP
  for (const acX of [-L * 0.22, L * 0.24]) {
    // Kotak AC
    parts.push({ x: acX, y: H + 0.16, z: 0, w: 1.9, h: 0.24, d: 1.55, color: "#94a3b8" });
    // Kisi-kisi ventilasi atas AC
    parts.push({ x: acX, y: H + 0.28, z: 0, w: 1.5, h: 0.04, d: 1.25, color: "#334155" });
    // Strip aksen AC
    parts.push({ x: acX, y: H + 0.18, z: 0.8, w: 1.7, h: 0.06, d: 0.04, color: primary });
  }

  // SAMBUNGAN AKORDEON BUS GANDENG (ARTICULATED BUS BELLOWS) BILA GERBONG TENGAH
  if (!isFrontCab && !isRearCab) {
    parts.push({ x: -L / 2, y: 1.5, z: 0, w: 0.6, h: 1.8, d: W + 0.1, color: "#1e2229" });
    parts.push({ x: -L / 2, y: 1.5, z: 0, w: 0.45, h: 1.85, d: W + 0.15, color: "#282d37" });
  }

  // MONCONG DEPAN BUS (MENGHADAP PEMAIN DI -x)
  if (isFrontCab) {
    const fx = -L / 2 - 0.02;
    // Kaca depan lebar aerodinamis (Windshield)
    parts.push({ x: fx - 0.08, y: 1.75, z: 0, w: 0.12, h: 0.88, d: W - 0.35, color: glassTint });
    // Kaca depan interior glow lembut
    parts.push({ x: fx - 0.05, y: 1.72, z: 0, w: 0.06, h: 0.78, d: W - 0.5, color: warmInterior, glow: true });

    // PAPAN ROLLSIGN TUJUAN BUS BERCAHAYA: "回送 / PARKED" atau "渋谷駅前 / SHIBUYA BUS"
    parts.push({ x: fx - 0.12, y: 2.22, z: 0, w: 0.06, h: 0.25, d: 1.55, color: "#111827" });
    parts.push({ x: fx - 0.14, y: 2.22, z: 0, w: 0.04, h: 0.18, d: 1.45, color: isStopped ? "#ff9f1c" : "#ffd21f", glow: true });

    // LAMPU DEPAN BUS TWIN HIGH-BEAM LED MENYALA TERANG
    parts.push({ x: fx - 0.14, y: 0.82, z: -0.78, w: 0.08, h: 0.24, d: 0.36, color: isStopped ? "#ffe599" : "#fffde6", glow: true });
    parts.push({ x: fx - 0.14, y: 0.82, z: 0.78, w: 0.08, h: 0.24, d: 0.36, color: isStopped ? "#ffe599" : "#fffde6", glow: true });
    // Lampu sein / hazard amber di sudut bawah
    parts.push({ x: fx - 0.14, y: 0.82, z: -1.02, w: 0.08, h: 0.22, d: 0.18, color: "#ff9f1c", glow: true });
    parts.push({ x: fx - 0.14, y: 0.82, z: 1.02, w: 0.08, h: 0.22, d: 0.18, color: "#ff9f1c", glow: true });

    // Grille depan bus & emblem
    parts.push({ x: fx - 0.12, y: 0.78, z: 0, w: 0.06, h: 0.28, d: 0.9, color: "#1e2430" });
    parts.push({ x: fx - 0.14, y: 0.78, z: 0, w: 0.04, h: 0.12, d: 0.35, color: "#cbd5e1" });

    // Kaca spion samping bus (Side rearview mirrors)
    parts.push({ x: fx - 0.2, y: 1.85, z: -W / 2 - 0.08, w: 0.14, h: 0.38, d: 0.10, color: "#111827" });
    parts.push({ x: fx - 0.2, y: 1.85, z: W / 2 + 0.08, w: 0.14, h: 0.38, d: 0.10, color: "#111827" });
  }

  // BAGIAN BELAKANG BUS (BILA EKOR / REAR BUS)
  if (isRearCab) {
    const rx = L / 2 + 0.02;
    // Kaca belakang
    parts.push({ x: rx + 0.06, y: 1.78, z: 0, w: 0.08, h: 0.65, d: W - 0.6, color: glassTint });
    // Lampu rem belakang merah menyala terang
    parts.push({ x: rx + 0.12, y: 0.85, z: -0.85, w: 0.06, h: 0.35, d: 0.22, color: "#ef233c", glow: true });
    parts.push({ x: rx + 0.12, y: 0.85, z: 0.85, w: 0.06, h: 0.35, d: 0.22, color: "#ef233c", glow: true });
    // Pelat nomor hijau Jepang di belakang
    parts.push({ x: rx + 0.12, y: 0.62, z: 0, w: 0.04, h: 0.18, d: 0.38, color: "#00e676", glow: true });
  }

  return parts;
}

/**
 * Saluran Ventilasi Jet Fan & Rel Utilitas Gantung Jalan Raya:
 * Kipas ventilasi terowongan industri (Jet Fan) dipasang tinggi di atas,
 * dengan rel utilitas kabel baja di y = 3.15m yang bisa di-ollie & grind pemain!
 */
export function subwayOverheadRailParts(_len = 11.0): Part[] {
  return [];
}

/**
 * Bus Kota Tokyo (Toei Bus) sebagai platform atap berselancar:
 * Bus beratap datar di ketinggian y = 2.05m dengan tanjakan (ramp) di depannya.
 */
export function cityBusObstacleParts(variant = 0): Part[] {
  const v = Math.abs(variant) % 2;
  const greenToei = "#2f7a4d";
  const yellowToei = "#f4b41a";
  const white = "#f5f7fa";
  const tire = "#1f2228";
  const glass = "#72a8d4";
  const primary = v === 0 ? greenToei : "#c1121f"; // Toei green or Tokyo red bus

  const L = 8.4; // panjang bus sepanjang x
  const W = 2.3; // lebar bus sepanjang z
  const H = BUS_ROOF_H; // tinggi atap bus (y = 2.05m)

  const parts: Part[] = [
    // Roda bus
    { x: -2.4, y: 0.36, z: -1.0, w: 0.72, h: 0.72, d: 0.28, color: tire },
    { x: -2.4, y: 0.36, z: 1.0, w: 0.72, h: 0.72, d: 0.28, color: tire },
    { x: 2.4, y: 0.36, z: -1.0, w: 0.72, h: 0.72, d: 0.28, color: tire },
    { x: 2.4, y: 0.36, z: 1.0, w: 0.72, h: 0.72, d: 0.28, color: tire },

    // Badan bus bawah
    { x: 0, y: 0.65, z: 0, w: L, h: 0.5, d: W, color: primary },
    // Garis aksen kuning/putih
    { x: 0, y: 0.95, z: 0, w: L, h: 0.12, d: W + 0.02, color: v === 0 ? yellowToei : white },

    // Badan bus atas (putih)
    { x: 0, y: 1.48, z: 0, w: L, h: 0.95, d: W, color: white },

    // Kaca depan menghadap -x (ke arah pemain)
    { x: -L / 2 - 0.02, y: 1.48, z: 0, w: 0.06, h: 0.85, d: W - 0.3, color: glass },
    // Lampu depan bus menyala
    { x: -L / 2 - 0.03, y: 0.65, z: -0.75, w: 0.06, h: 0.2, d: 0.3, color: "#fffbe6", glow: true },
    { x: -L / 2 - 0.03, y: 0.65, z: 0.75, w: 0.06, h: 0.2, d: 0.3, color: "#fffbe6", glow: true },
    // Papan tujuan rollsign bus: "渋谷駅前 / SHIBUYA STA."
    { x: -L / 2 - 0.04, y: 1.95, z: 0, w: 0.06, h: 0.2, d: 1.4, color: "#ffd21f", glow: true },

    // Jendela samping
    { x: 0, y: 1.5, z: 0, w: L - 1.2, h: 0.6, d: W + 0.02, color: glass },

    // ATAP BUS DATAR TEMPAT BERSELANCAR (y = 2.05m)
    { x: 0, y: H, z: 0, w: L, h: 0.1, d: W - 0.1, color: "#dbe1e8" },
    // Catwalk / non-slip atap bus
    { x: 0, y: H + 0.06, z: 0, w: L - 0.6, h: 0.03, d: 0.85, color: "#eef2f7" },
    // AC bus di belakang
    { x: 1.8, y: H + 0.18, z: 0, w: 1.8, h: 0.22, d: 1.4, color: "#9ca3af" },
  ];

  return parts;
}


