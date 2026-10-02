import { buildCharacters } from "../shibuya/voxel/characters";
import { buildAnimals } from "../shibuya/voxel/animals";
import { buildVehicles } from "../shibuya/voxel/vehicles";
import { type Part, type GeoPair, getGeometry, getGeometryPair, buildVoxelGeometry } from "./voxel";

export type ShibuyaCharacterId = "salaryman" | "student" | "chef" | "yakuza";

export type ShibuyaAnimalId =
  | "shiba"
  | "tanuki"
  | "kitsune"
  | "deer"
  | "monkey"
  | "capybara"
  | "crane"
  | "neko";

export type ShibuyaMotorcycleId =
  | "cub"
  | "custom"
  | "sport"
  | "delivery"
  | "retro"
  | "cafe"
  | "trail"
  | "police";

export const SHIBUYA_ANIMALS: ShibuyaAnimalId[] = [
  "shiba",
  "tanuki",
  "kitsune",
  "deer",
  "monkey",
  "capybara",
  "crane",
  "neko",
];

export const SHIBUYA_MOTORCYCLES: ShibuyaMotorcycleId[] = [
  "cub",
  "custom",
  "sport",
  "delivery",
  "retro",
  "cafe",
  "trail",
  "police",
];

/** Convert Shibuya Blocks voxel boxes to Pigeon SK8 Part[], grounded at Y = 0 and facing +x */
function convertToParts(data: { boxes: { p: [number, number, number]; s: [number, number, number]; color: string; part?: string; rotation?: [number, number, number]; glow?: number }[] }, rotateY = Math.PI / 2): Part[] {
  const store = data.boxes.filter((b) => b.part !== "setting");
  let minX = 1e9,
    maxX = -1e9,
    minY = 1e9,
    maxY = -1e9,
    minZ = 1e9,
    maxZ = -1e9;
  for (const b of store) {
    minX = Math.min(minX, b.p[0]);
    maxX = Math.max(maxX, b.p[0] + b.s[0]);
    minY = Math.min(minY, b.p[1]);
    maxY = Math.max(maxY, b.p[1] + b.s[1]);
    minZ = Math.min(minZ, b.p[2]);
    maxZ = Math.max(maxZ, b.p[2] + b.s[2]);
  }
  const cx = (minX + maxX) / 2;
  const cz = (minZ + maxZ) / 2;
  const floorY = minY;

  const cos = Math.cos(rotateY);
  const sin = Math.sin(rotateY);

  return store.map((b) => {
    const rawX = b.p[0] + b.s[0] / 2 - cx;
    const rawY = b.p[1] + b.s[1] / 2 - floorY;
    const rawZ = b.p[2] + b.s[2] / 2 - cz;

    const rx = rawX * cos + rawZ * sin;
    const rz = -rawX * sin + rawZ * cos;

    const rw = Math.abs(rotateY) > 0.1 ? b.s[2] : b.s[0];
    const rd = Math.abs(rotateY) > 0.1 ? b.s[0] : b.s[2];

    return {
      x: rx,
      y: rawY,
      z: rz,
      w: rw,
      h: b.s[1],
      d: rd,
      color: b.color,
      glow: (b.glow ?? 0) > 0.1,
    };
  });
}

// ---------------------- 1. Salaryman / Pekerja Kantor ----------------------
export function getShibuyaSalarymanParts(): Part[] {
  const data = buildCharacters("salaryman");
  // Scale salaryman slightly up to match pedestrian height (~1.75m)
  const parts = convertToParts(data, 0); // facing +z originally, rendered in pedestrian group
  return parts;
}

export function getShibuyaSalarymanGeo(key = "normal") {
  return getGeometry(`shibuya-salaryman-${key}`, () => getShibuyaSalarymanParts());
}

// ---------------------- 2. Little Japan Friends ----------------------
export function getShibuyaAnimalParts(id: ShibuyaAnimalId): Part[] {
  const data = buildAnimals(id);
  // Rotated by Math.PI / 2 so animal faces +x along the crossing / travel line
  const parts = convertToParts(data, Math.PI / 2);
  return parts;
}

export function getShibuyaAnimalGeo(id: ShibuyaAnimalId) {
  return getGeometry(`shibuya-animal-${id}`, () => getShibuyaAnimalParts(id));
}

// ---------------------- 3. Japan Vehicle Pack: Motorcycles with Riders ----------------------
export function getShibuyaMotorcycleParts(id: ShibuyaMotorcycleId): Part[] {
  const data = buildVehicles(id);
  // Rotated by Math.PI / 2 so motorcycle and rider face +x (oncoming traffic)
  const parts = convertToParts(data, Math.PI / 2);
  return parts;
}

export function getShibuyaMotorcycleGeo(id: ShibuyaMotorcycleId) {
  return getGeometry(`shibuya-moto-${id}`, () => getShibuyaMotorcycleParts(id));
}

/** Glowing headlight and taillight for Shibuya motorcycle at night */
export function getShibuyaMotorcycleLightsParts(): Part[] {
  return [
    // Front headlight (at +x)
    { x: 1.25, y: 0.85, z: 0, w: 0.12, h: 0.22, d: 0.24, color: "#fffbe6", glow: true },
    // Rear red taillight (at -x)
    { x: -1.25, y: 0.8, z: 0, w: 0.1, h: 0.16, d: 0.22, color: "#ff2a2a", glow: true },
  ];
}

export function getShibuyaMotorcycleLightsGeo() {
  return getGeometry("shibuya-moto-lights", getShibuyaMotorcycleLightsParts);
}
