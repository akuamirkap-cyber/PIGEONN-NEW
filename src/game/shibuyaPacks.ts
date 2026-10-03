import * as THREE from "three";
import { buildCharacters } from "../shibuya/voxel/characters";
import { buildAnimals } from "../shibuya/voxel/animals";
import { buildRigAnimations } from "../shibuya/voxel/rig";
import { buildVehicles } from "../shibuya/voxel/vehicles";
import { citizenActivityModel } from "../shibuya/world/citizenActivities";
import { buildVoxelGeometry, type Part, getGeometry, getGeometryPair, voxelMaterial } from "./voxel";
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
  | "honda"
  | "harley"
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
  "honda",
  "harley",
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
    omitHelmet?: boolean;
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

  const boxes = data.boxes.filter((b) => b.part !== "setting" && !(options.omitHelmet && b.helmet));
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

/** Shopping customers reuse the Shibuya Blocks bag/browse rig for Konbini frontage. */
export function getShibuyaShopperParts(id: ShibuyaCharacterId): Part[] {
  const data = citizenActivityModel(buildCharacters(id), id, "shopping");
  return convertRiggedToParts(data, { rotateY: 0, targetHeight: id === "sumo" ? 1.82 : 1.74 });
}

export function getShibuyaShopperGeo(id: ShibuyaCharacterId) {
  return getGeometryPair(`shibuya-shopper-${id}`, () => getShibuyaShopperParts(id));
}

// ---------------------- 2. Little Japan Friends ----------------------
export const ANIMAL_HEIGHT_TARGETS: Record<ShibuyaAnimalId, number> = {
  shiba: 0.82,
  tanuki: 0.78,
  kitsune: 0.85,
  deer: 1.05,
  monkey: 0.74,
  capybara: 0.72,
  crane: 1.12,
  neko: 0.65,
};

/**
 * Playable Friends are normalized against the Pigeon local height (1.23) and
 * then enlarged by exactly 20%. The source model proportions remain untouched;
 * only the whole source mesh receives this uniform display scale.
 */
export const SHIBUYA_PIGEON_REFERENCE_HEIGHT = 1.23;
export const SHIBUYA_PLAYABLE_HEIGHT_MULTIPLIER = 1.2;
export const SHIBUYA_PLAYABLE_HEIGHT = SHIBUYA_PIGEON_REFERENCE_HEIGHT * SHIBUYA_PLAYABLE_HEIGHT_MULTIPLIER;
export function getShibuyaAnimalPlayerScale(id: ShibuyaAnimalId) {
  return SHIBUYA_PLAYABLE_HEIGHT / ANIMAL_HEIGHT_TARGETS[id];
}

export function getShibuyaAnimalParts(id: ShibuyaAnimalId): Part[] {
  const data = buildAnimals(id);
  // Rotated by Math.PI / 2 so animal faces +x along the crossing / travel line
  const targetHeight = ANIMAL_HEIGHT_TARGETS[id] ?? 0.8;
  return convertRiggedToParts(data, { rotateY: Math.PI / 2, targetHeight });
}

export function getShibuyaAnimalGeo(id: ShibuyaAnimalId) {
  return getGeometry(`shibuya-animal-${id}`, () => getShibuyaAnimalParts(id));
}

/**
 * Runtime source rig for playable Friends. Unlike the old flattened preview
 * geometry, this keeps every original Shibuya Blocks node and Play animation,
 * so tails, arms, wings, heads, and legs do not behave like a statue.
 */
export interface ShibuyaAnimalRig {
  group: THREE.Group;
  mixer: THREE.AnimationMixer;
  clips: THREE.AnimationClip[];
  activeClip: string | null;
  dispose: () => void;
}

export function buildShibuyaAnimalRig(id: ShibuyaAnimalId): ShibuyaAnimalRig {
  const data = buildAnimals(id);
  const raw = new THREE.Group();
  raw.name = `animal_${id}_source`;
  const nodes = new Map<string, THREE.Group>();
  for (const node of data.nodes ?? []) {
    const group = new THREE.Group();
    group.name = node.name;
    group.position.set(...node.p);
    if (node.rotation) group.rotation.set(...node.rotation);
    nodes.set(node.name, group);
  }
  for (const node of data.nodes ?? []) {
    const group = nodes.get(node.name)!;
    (node.parent ? nodes.get(node.parent)! : raw).add(group);
  }

  const geometries: THREE.BufferGeometry[] = [];
  for (const box of data.boxes.filter((item) => item.part !== "setting")) {
    const geometry = buildVoxelGeometry([{
      x: box.p[0] + box.s[0] / 2,
      y: box.p[1] + box.s[1] / 2,
      z: box.p[2] + box.s[2] / 2,
      w: box.s[0],
      h: box.s[1],
      d: box.s[2],
      color: box.color,
      rx: box.rotation?.[0],
      ry: box.rotation?.[1],
      rz: box.rotation?.[2],
      glow: (box.glow ?? 0) > 0.1,
    }]);
    geometries.push(geometry);
    const mesh = new THREE.Mesh(geometry, voxelMaterial);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    (box.node ? nodes.get(box.node)! : raw).add(mesh);
  }
  raw.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(raw);
  const rawHeight = Math.max(0.001, bounds.max.y - bounds.min.y);
  raw.position.set(-(bounds.min.x + bounds.max.x) / 2, -bounds.min.y, -(bounds.min.z + bounds.max.z) / 2);

  const group = new THREE.Group();
  group.name = `playable-shibuya-${id}`;
  group.rotation.y = Math.PI / 2;
  group.scale.setScalar((ANIMAL_HEIGHT_TARGETS[id] > 0 ? getShibuyaAnimalPlayerScale(id) : 1) * (ANIMAL_HEIGHT_TARGETS[id] / rawHeight));
  group.add(raw);
  const clips = buildRigAnimations(group, data);
  const mixer = new THREE.AnimationMixer(group);
  const play = clips.find((clip) => clip.name === "Play") ?? clips.find((clip) => clip.name === "Iconic") ?? clips[0];
  if (play) mixer.clipAction(play).play();

  return {
    group,
    mixer,
    clips,
    activeClip: play?.name ?? null,
    dispose: () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(group);
      geometries.forEach((geometry) => geometry.dispose());
    },
  };
}

/**
 * A tiny detachable right-foot contact piece for the playable push rig. It uses
 * the same source foot palette, while the untouched full animal remains the
 * visual body. At the bottom of the push cycle this piece is exactly on road
 * level, like the original Pigeon kick.
 */
const SOURCE_FOOT_COLORS: Record<ShibuyaAnimalId, string> = {
  shiba: "#f0e5ca",
  tanuki: "#c5ae7e",
  kitsune: "#f0e5ca",
  deer: "#604f3c",
  monkey: "#c4b6a0",
  capybara: "#b09265",
  crane: "#6c755d",
  neko: "#d8c793",
};
export function getShibuyaAnimalPushFootGeo(id: ShibuyaAnimalId) {
  return getGeometry(`shibuya-animal-${id}-push-foot`, () => [
    { x: 0, y: 0.08, z: 0, w: 0.12, h: 0.16, d: 0.12, color: SOURCE_FOOT_COLORS[id] },
    { x: 0.07, y: 0.018, z: 0.12, w: 0.34, h: 0.036, d: 0.2, color: SOURCE_FOOT_COLORS[id] },
  ]);
}

/** Small bath scene added around the untouched source animal for onsen activity movers. */
const shibuyaBathParts = (): Part[] => [
  { x: -0.72, y: 0.06, z: -0.58, w: 1.44, h: 0.12, d: 1.16, color: "#9b9f8f" },
  { x: -0.62, y: 0.16, z: -0.49, w: 1.24, h: 0.055, d: 0.98, color: "#95c2bb", opacity: 0.82 },
  { x: -0.78, y: 0.18, z: -0.58, w: 0.12, h: 0.27, d: 1.16, color: "#bbc1aa" },
  { x: 0.66, y: 0.18, z: -0.58, w: 0.12, h: 0.27, d: 1.16, color: "#bbc1aa" },
  { x: -0.72, y: 0.18, z: -1.1, w: 1.44, h: 0.27, d: 0.12, color: "#aab2a0" },
  { x: -0.72, y: 0.18, z: 0.0, w: 1.44, h: 0.27, d: 0.12, color: "#aab2a0" },
  { x: -0.36, y: 0.52, z: -0.45, w: 0.1, h: 0.26, d: 0.1, color: "#e8efdf" },
  { x: 0.0, y: 0.66, z: -0.28, w: 0.1, h: 0.22, d: 0.1, color: "#e8efdf" },
  { x: 0.34, y: 0.78, z: -0.12, w: 0.1, h: 0.18, d: 0.1, color: "#e8efdf" },
];

export function getShibuyaBathGeo() {
  return getGeometry("shibuya-animal-bath", shibuyaBathParts);
}

// ---------------------- 3. Japan Vehicle Pack: Motorcycles with Riders ----------------------
// Honda is represented by the source Super Cub and Harley by the source custom/cruiser
// silhouette. The aliases keep the route vocabulary explicit without duplicating the
// underlying Shibuya Blocks geometry.
const MOTORCYCLE_SOURCE_IDS: Record<ShibuyaMotorcycleId, string> = {
  honda: "cub",
  harley: "custom",
  cub: "cub",
  custom: "custom",
  sport: "sport",
  delivery: "delivery",
  retro: "retro",
  cafe: "cafe",
  trail: "trail",
  police: "police",
};

export function getShibuyaMotorcycleParts(id: ShibuyaMotorcycleId, helmet = true): Part[] {
  const data = buildVehicles(MOTORCYCLE_SOURCE_IDS[id]);
  // Rotated by Math.PI / 2 so motorcycle and rider face +x (oncoming traffic).
  // Target height ~1.52m (standard motorcycle + rider height, below MOTOR_CLEAR_H = 1.55).
  // No-helmet variants keep the source face/head, but remove only boxes explicitly
  // tagged as helmet geometry; the rider and bike remain one connected silhouette.
  return convertRiggedToParts(data, {
    rotateY: Math.PI / 2,
    targetHeight: helmet ? 1.52 : 1.42,
    omitHelmet: !helmet,
  });
}

export function getShibuyaMotorcycleGeo(id: ShibuyaMotorcycleId, helmet = true) {
  return getGeometry(`shibuya-moto-${id}-${helmet ? "helmet" : "no-helmet"}`, () => getShibuyaMotorcycleParts(id, helmet));
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
