import * as THREE from "three";
import { buildCharacters } from "../shibuya/voxel/characters";
import { buildAnimals } from "../shibuya/voxel/animals";
import { buildRigAnimations } from "../shibuya/voxel/rig";
import { buildVehicles } from "../shibuya/voxel/vehicles";
import { citizenActivityModel } from "../shibuya/world/citizenActivities";
import { buildVoxelGeometry, type Part, getGeometry, getGeometryPair, voxelMaterial } from "./voxel";
import type { AssetData, RigNode, Vec3 } from "../shibuya/voxel/types";

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

/** Complete source roster retained from Shibuya Blocks. */
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

/** Pigeon SK8 gameplay roster after removing the four requested Friends. */
export const PIGEON_SHIBUYA_ANIMALS: ShibuyaAnimalId[] = ["tanuki", "monkey", "crane", "neko"];

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

const STANDING_QUADRUPEDS = new Set<ShibuyaAnimalId>(["shiba", "kitsune", "deer"]);

/**
 * A Friend keeps every original source box, but the playable posture is a
 * bipedal standing posture rather than a four-legged crawl. Only the source
 * node transforms change; no silhouette/body replacement is made.
 */
function sourceAnimalNodePose(id: ShibuyaAnimalId, node: RigNode): { position: Vec3; rotation: Vec3 } {
  const position: Vec3 = [...node.p];
  const rotation: Vec3 = [...(node.rotation ?? [0, 0, 0])];
  const prefix = `animal_${id}_`;
  if (STANDING_QUADRUPEDS.has(id)) {
    if (node.name === `${prefix}body`) {
      // Turn the original source torso upright while its original legs remain
      // grounded below it.
      position[1] += 0.65;
      rotation[0] += Math.PI / 2;
    } else if (node.name === `${prefix}head`) {
      // The source head was in front of a horizontal torso. Move it to the top
      // of the same rotated torso, keeping its original boxes and face.
      position[2] = -0.75;
    } else if (node.name.startsWith(`${prefix}tail`)) {
      // Keep the original tail attached to the lower/back side after the turn.
      position[2] = 0.35;
    }
  } else if (id === "capybara") {
    if (node.name === `${prefix}body`) {
      position[1] = 1.05;
      rotation[0] += Math.PI / 2;
    } else if (node.name === `${prefix}head`) {
      position[2] = -1.0;
    } else if (node.name === `${prefix}yuzu`) {
      position[2] = -0.3;
    }
  }
  return { position, rotation };
}

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
    animalId?: ShibuyaAnimalId;
  } = {}
): Part[] {
  const rotateY = options.rotateY ?? Math.PI / 2;
  const store = new THREE.Group();
  const rigGroups = new Map<string, THREE.Group>();

  for (const node of data.nodes ?? []) {
    const group = new THREE.Group();
    group.name = node.name;
    const pose = options.animalId ? sourceAnimalNodePose(options.animalId, node) : { position: node.p, rotation: node.rotation ?? [0, 0, 0] as Vec3 };
    group.position.set(...pose.position);
    group.rotation.set(...pose.rotation);
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
    rotation: Vec3;
    color: string;
    glow: boolean;
  }[] = [];

  const tempBoxPos = new THREE.Vector3();
  const sourceQuaternion = new THREE.Quaternion();
  const worldQuaternion = new THREE.Quaternion();
  const finalQuaternion = new THREE.Quaternion();
  const globalQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotateY);
  const localEuler = new THREE.Euler();
  const worldEuler = new THREE.Euler();
  const corner = new THREE.Vector3();

  for (const b of boxes) {
    const parent = b.node ? rigGroups.get(b.node) : store;
    tempBoxPos.set(b.p[0] + b.s[0] / 2, b.p[1] + b.s[1] / 2, b.p[2] + b.s[2] / 2);
    if (parent) {
      tempBoxPos.applyMatrix4(parent.matrixWorld);
      parent.getWorldQuaternion(worldQuaternion);
    } else {
      worldQuaternion.identity();
    }
    sourceQuaternion.setFromEuler(localEuler.set(...(b.rotation ?? [0, 0, 0])));
    worldQuaternion.multiply(sourceQuaternion);
    finalQuaternion.copy(worldQuaternion).premultiply(globalQuaternion);
    worldEuler.setFromQuaternion(finalQuaternion);
    const hx = b.s[0] / 2;
    const hy = b.s[1] / 2;
    const hz = b.s[2] / 2;
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
      corner.set(sx * hx, sy * hy, sz * hz).applyQuaternion(worldQuaternion).add(tempBoxPos);
      minX = Math.min(minX, corner.x);
      maxX = Math.max(maxX, corner.x);
      minY = Math.min(minY, corner.y);
      maxY = Math.max(maxY, corner.y);
      minZ = Math.min(minZ, corner.z);
      maxZ = Math.max(maxZ, corner.z);
    }

    resolvedBoxes.push({
      center: tempBoxPos.clone(),
      size: [b.s[0], b.s[1], b.s[2]],
      rotation: [worldEuler.x, worldEuler.y, worldEuler.z],
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

    return {
      x: rx,
      y: rawY,
      z: rz,
      w: rb.size[0] * scale,
      h: rb.size[1] * scale,
      d: rb.size[2] * scale,
      rx: rb.rotation[0],
      ry: rb.rotation[1],
      rz: rb.rotation[2],
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
export const SHIBUYA_CRANE_DISPLAY_MULTIPLIER = 2;
export function getShibuyaAnimalPlayerScale(id: ShibuyaAnimalId) {
  const displayMultiplier = id === "crane" ? SHIBUYA_CRANE_DISPLAY_MULTIPLIER : 1;
  return (SHIBUYA_PLAYABLE_HEIGHT * displayMultiplier) / ANIMAL_HEIGHT_TARGETS[id];
}

export function getShibuyaAnimalParts(id: ShibuyaAnimalId): Part[] {
  const data = buildAnimals(id);
  // Rotated by Math.PI / 2 so animal faces +x along the crossing / travel line
  const targetHeight = ANIMAL_HEIGHT_TARGETS[id] ?? 0.8;
  return convertRiggedToParts(data, { rotateY: Math.PI / 2, targetHeight, animalId: id });
}

export function getShibuyaAnimalGeo(id: ShibuyaAnimalId) {
  return getGeometry(`shibuya-animal-${id}`, () => getShibuyaAnimalParts(id));
}

/** World pedestrians keep the source activity posture; the playable/preview
 * geometry above uses the standing Friend posture. Setting boxes remain
 * filtered, so Capybara's bath is supplied separately by getShibuyaBathGeo. */
export function getShibuyaAnimalWorldGeo(id: ShibuyaAnimalId) {
  return getGeometry(`shibuya-world-animal-${id}`, () => {
    const data = buildAnimals(id);
    return convertRiggedToParts(data, { rotateY: Math.PI / 2, targetHeight: ANIMAL_HEIGHT_TARGETS[id] });
  });
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
  /** Adds the Shift push pose to source leg nodes; no replacement body parts are created. */
  setPush: (progress: number, roadY: number) => void;
  dispose: () => void;
}

export function buildShibuyaAnimalRig(id: ShibuyaAnimalId): ShibuyaAnimalRig {
  const data = buildAnimals(id);
  const raw = new THREE.Group();
  raw.name = `animal_${id}_source`;
  const nodes = new Map<string, THREE.Group>();
  const pushNodeNames = new Set<string>(
    id === "shiba" || id === "kitsune" || id === "deer"
      ? [`animal_${id}_leg-1_-1`]
      : id === "crane"
        ? [`animal_${id}_legR`]
        : id === "capybara"
          ? [`animal_${id}_body`]
          : [`animal_${id}_armR`],
  );
  const pushContactNodes = new Set<string>(
    id === "shiba" || id === "kitsune" || id === "deer"
      ? [`animal_${id}_leg-1_-1`]
      : id === "crane" ? [`animal_${id}_legR`] : [],
  );
  const pushPivots = new Map<string, THREE.Group>();
  for (const node of data.nodes ?? []) {
    const group = new THREE.Group();
    group.name = node.name;
    const pose = sourceAnimalNodePose(id, node);
    group.position.set(...pose.position);
    group.rotation.set(...pose.rotation);
    nodes.set(node.name, group);
  }
  for (const node of data.nodes ?? []) {
    const group = nodes.get(node.name)!;
    const parent = node.parent ? nodes.get(node.parent)! : raw;
    if (pushNodeNames.has(node.name)) {
      // This is only an animation pivot around the original source node. The
      // leg node and every one of its source boxes remain untouched.
      const pivot = new THREE.Group();
      pivot.name = `${node.name}_pushPivot`;
      pushPivots.set(node.name, pivot);
      parent.add(pivot);
      pivot.add(group);
    } else {
      parent.add(group);
    }
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

  const setPush = (progress: number, roadY: number) => {
    // Progress follows the same smooth kick window as the Pigeon. The actual
    // contact is applied to a pivot parent of the original source leg node,
    // never to a newly drawn foot mesh.
    let contact = 0;
    if (progress >= 0 && progress < 0.24) contact = progress < 0.12 ? 0 : (progress - 0.12) / 0.12;
    else if (progress >= 0.24 && progress < 0.62) contact = 1;
    else if (progress >= 0.62 && progress < 0.82) contact = 1 - (progress - 0.62) / 0.2;
    const intensity = Math.max(0, Math.min(1, contact));
    for (const [nodeName, pivot] of pushPivots) {
      if (pushContactNodes.has(nodeName)) {
        // Quadrupeds and the crane use their own original leg node. The source
        // foot reaches ROAD_Y; no replacement foot is introduced.
        pivot.position.y = (roadY * intensity) / group.scale.y;
        pivot.rotation.x = -0.34 * intensity;
      } else {
        // Upright Friends do not have a separate leg node in the source rig;
        // their own arm/body node performs an animal-specific push gesture.
        pivot.position.y = (-0.055 * intensity) / group.scale.y;
        pivot.rotation.x = -0.16 * intensity;
        pivot.rotation.z = nodeName.endsWith("_armR") ? -0.42 * intensity : 0.08 * intensity;
      }
    }
  };

  return {
    group,
    mixer,
    clips,
    activeClip: play?.name ?? null,
    setPush,
    dispose: () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(group);
      geometries.forEach((geometry) => geometry.dispose());
    },
  };
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
