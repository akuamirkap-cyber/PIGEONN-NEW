import * as THREE from "three";
import { buildCharacters } from "../shibuya/voxel/characters";
import { buildAnimals } from "../shibuya/voxel/animals";
import { buildVehicles } from "../shibuya/voxel/vehicles";
import { citizenActivityModel } from "../shibuya/world/citizenActivities";
import { type Part, getGeometry, getGeometryPair } from "./voxel";
import type { AssetData } from "../shibuya/voxel/types";

export type ShibuyaCharacterId = "salaryman" | "student" | "chef" | "yakuza" | "sumo";

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

export const SHIBUYA_CHARACTERS: ShibuyaCharacterId[] = [
  "salaryman",
  "student",
  "chef",
  "yakuza",
  "sumo",
];

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

/**
 * Resolves rigged hierarchy from Shibuya Blocks (nodes and boxes) into
 * accurately placed, grounded Pigeon SK8 Part[] boxes.
 */
function convertRiggedToParts(
  data: AssetData,
  options: {
    rotateY?: number;
    targetHeight?: number;
  } = {}
): Part[] {
  const rotateY = options.rotateY ?? Math.PI / 2;
  const store = new THREE.Group();
  const rigGroups = new Map<string, THREE.Group>();

  for (const node of data.nodes ?? []) {
    const group = new THREE.Group();
    group.name = node.name;
    group.position.set(...node.p);
    if (node.rotation) group.rotation.set(...node.rotation);
    rigGroups.set(node.name, group);
  }
  for (const node of data.nodes ?? []) {
    (node.parent ? rigGroups.get(node.parent)! : store).add(rigGroups.get(node.name)!);
  }
  store.updateMatrixWorld(true);

  const boxes = data.boxes.filter((b) => b.part !== "setting");
  let minX = 1e9,
    maxX = -1e9;
  let minY = 1e9,
    maxY = -1e9;
  let minZ = 1e9,
    maxZ = -1e9;

  const resolvedBoxes: {
    center: THREE.Vector3;
    size: [number, number, number];
    color: string;
    glow: boolean;
  }[] = [];

  const tempBoxPos = new THREE.Vector3();

  for (const b of boxes) {
    const parent = b.node ? rigGroups.get(b.node) : store;
    tempBoxPos.set(b.p[0] + b.s[0] / 2, b.p[1] + b.s[1] / 2, b.p[2] + b.s[2] / 2);
    if (parent) {
      tempBoxPos.applyMatrix4(parent.matrixWorld);
    }
    const hx = b.s[0] / 2;
    const hy = b.s[1] / 2;
    const hz = b.s[2] / 2;
    minX = Math.min(minX, tempBoxPos.x - hx);
    maxX = Math.max(maxX, tempBoxPos.x + hx);
    minY = Math.min(minY, tempBoxPos.y - hy);
    maxY = Math.max(maxY, tempBoxPos.y + hy);
    minZ = Math.min(minZ, tempBoxPos.z - hz);
    maxZ = Math.max(maxZ, tempBoxPos.z + hz);

    resolvedBoxes.push({
      center: tempBoxPos.clone(),
      size: [b.s[0], b.s[1], b.s[2]],
      color: b.color,
      glow: (b.glow ?? 0) > 0.1,
    });
  }

  const cx = (minX + maxX) / 2;
  const cz = (minZ + maxZ) / 2;
  const floorY = minY;
  const rawH = maxY - minY;
  const scale = options.targetHeight && rawH > 0.001 ? options.targetHeight / rawH : 1.0;

  const cos = Math.cos(rotateY);
  const sin = Math.sin(rotateY);

  return resolvedBoxes.map((rb) => {
    const rawX = (rb.center.x - cx) * scale;
    const rawY = (rb.center.y - floorY) * scale;
    const rawZ = (rb.center.z - cz) * scale;

    const rx = rawX * cos + rawZ * sin;
    const rz = -rawX * sin + rawZ * cos;

    const rw = Math.abs(rotateY) > 0.1 ? rb.size[2] * scale : rb.size[0] * scale;
    const rd = Math.abs(rotateY) > 0.1 ? rb.size[0] * scale : rb.size[2] * scale;

    return {
      x: rx,
      y: rawY,
      z: rz,
      w: rw,
      h: rb.size[1] * scale,
      d: rd,
      color: rb.color,
      glow: rb.glow,
    };
  });
}

// ---------------------- 1. Shibuya Characters (Salaryman / Office Worker) ----------------------
export function getShibuyaCharacterParts(id: ShibuyaCharacterId): Part[] {
  const data = buildCharacters(id);
  // Scale salaryman / student / chef / yakuza to standard pedestrian height (~1.74m)
  return convertRiggedToParts(data, { rotateY: 0, targetHeight: 1.74 });
}

export function getShibuyaCharacterGeo(id: ShibuyaCharacterId) {
  return getGeometry(`shibuya-char-${id}`, () => getShibuyaCharacterParts(id));
}

export function getShibuyaSalarymanParts(): Part[] {
  return getShibuyaCharacterParts("salaryman");
}

export function getShibuyaSalarymanGeo(key = "normal") {
  return getGeometry(`shibuya-salaryman-${key}`, () => getShibuyaSalarymanParts());
}

/**
 * The runner reuses the same activity rig as Shibuya Blocks for the ramen frontage.
 * This keeps the bowl, chopsticks, steam, and eating pose from the source mode instead
 * of inventing a second approximation just for Pigeon SK8.
 */
export function getShibuyaRamenCustomerParts(id: ShibuyaCharacterId): Part[] {
  const data = citizenActivityModel(buildCharacters(id), id, "ramen");
  return convertRiggedToParts(data, { rotateY: 0, targetHeight: id === "sumo" ? 1.82 : 1.74 });
}

export function getShibuyaRamenCustomerGeo(id: ShibuyaCharacterId) {
  return getGeometryPair(`shibuya-ramen-customer-${id}`, () => getShibuyaRamenCustomerParts(id));
}

// ---------------------- 2. Little Japan Friends ----------------------
const ANIMAL_HEIGHT_TARGETS: Record<ShibuyaAnimalId, number> = {
  shiba: 0.82,
  tanuki: 0.78,
  kitsune: 0.85,
  deer: 1.05,
  monkey: 0.74,
  capybara: 0.72,
  crane: 1.12,
  neko: 0.65,
};

export function getShibuyaAnimalParts(id: ShibuyaAnimalId): Part[] {
  const data = buildAnimals(id);
  // Rotated by Math.PI / 2 so animal faces +x along the crossing / travel line
  const targetHeight = ANIMAL_HEIGHT_TARGETS[id] ?? 0.8;
  return convertRiggedToParts(data, { rotateY: Math.PI / 2, targetHeight });
}

export function getShibuyaAnimalGeo(id: ShibuyaAnimalId) {
  return getGeometry(`shibuya-animal-${id}`, () => getShibuyaAnimalParts(id));
}

// ---------------------- 3. Japan Vehicle Pack: Motorcycles with Riders ----------------------
export function getShibuyaMotorcycleParts(id: ShibuyaMotorcycleId): Part[] {
  const data = buildVehicles(id);
  // Rotated by Math.PI / 2 so motorcycle and rider face +x (oncoming traffic)
  // Target height ~1.52m (standard motorcycle + rider with helmet height, below MOTOR_CLEAR_H = 1.55)
  return convertRiggedToParts(data, { rotateY: Math.PI / 2, targetHeight: 1.52 });
}

export function getShibuyaMotorcycleGeo(id: ShibuyaMotorcycleId) {
  return getGeometry(`shibuya-moto-${id}`, () => getShibuyaMotorcycleParts(id));
}

/** Glowing headlight and taillight for Shibuya motorcycle at night */
export function getShibuyaMotorcycleLightsParts(): Part[] {
  return [
    // Front headlight (at +x)
    { x: 1.15, y: 0.78, z: 0, w: 0.12, h: 0.2, d: 0.22, color: "#fffbe6", glow: true },
    // Rear red taillight (at -x)
    { x: -1.15, y: 0.74, z: 0, w: 0.1, h: 0.16, d: 0.2, color: "#ff2a2a", glow: true },
  ];
}

export function getShibuyaMotorcycleLightsGeo() {
  return getGeometry("shibuya-moto-lights", getShibuyaMotorcycleLightsParts);
}
