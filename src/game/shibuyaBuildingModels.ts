import * as THREE from "three";
import { getAssetData } from "../shibuya/voxel/models";
import { type Part, type GeoPair, getGeometryPair } from "./voxel";

export type ShibuyaBuildingId =
  | "ramen"
  | "shibuya109"
  | "qfront"
  | "neon"
  | "skyscraper"
  | "station"
  | "torii"
  | "izakaya"
  | "tokyotower"
  | "konbini"
  | "machiya"
  | "townhouse"
  | "pagoda";

export const SHIBUYA_FRONTAGE_BUILDING_IDS: ShibuyaBuildingId[] = [
  "ramen",
  "shibuya109",
  "qfront",
  "neon",
  "skyscraper",
  "station",
  "torii",
  "izakaya",
  "konbini",
  "machiya",
  "townhouse",
];

export const SHIBUYA_SKYLINE_BUILDING_IDS: ShibuyaBuildingId[] = [
  "skyscraper",
  "tokyotower",
  "qfront",
  "neon",
  "shibuya109",
  "torii",
  "pagoda",
];

export const ALL_SHIBUYA_BUILDING_IDS: ShibuyaBuildingId[] = [
  "ramen",
  "shibuya109",
  "qfront",
  "neon",
  "skyscraper",
  "station",
  "torii",
  "izakaya",
  "tokyotower",
  "konbini",
  "machiya",
  "townhouse",
  "pagoda",
];

/**
 * Bounds of the actual transferred source geometry in its local coordinate system.
 *
 * The old Shibuya placement code used the requested `BuildingSpec.w` as if every
 * source asset had that width. That is not true for the transferred dioramas:
 * the skyscraper and Tokyo Tower, for example, contain a whole block around the
 * landmark. Keeping the local min/max values lets the route planner account for
 * the real footprint after a uniform scale and the front-side half-turn.
 */
export interface ShibuyaAssetFootprint {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  width: number;
  depth: number;
}

const footprintCache = new Map<ShibuyaBuildingId, ShibuyaAssetFootprint>();

export function getShibuyaAssetFootprint(id: ShibuyaBuildingId): ShibuyaAssetFootprint {
  const cached = footprintCache.get(id);
  if (cached) return cached;

  const min = new THREE.Vector3(Infinity, Infinity, Infinity);
  const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
  const half = new THREE.Vector3();
  const corner = new THREE.Vector3();
  const rotation = new THREE.Euler();
  const quaternion = new THREE.Quaternion();
  for (const part of getShibuyaBuildingParts(id)) {
    half.set(part.w / 2, part.h / 2, part.d / 2);
    rotation.set(part.rx ?? 0, part.ry ?? 0, part.rz ?? 0);
    quaternion.setFromEuler(rotation);
    for (const x of [-half.x, half.x]) for (const y of [-half.y, half.y]) for (const z of [-half.z, half.z]) {
      corner.set(part.x + x, part.y + y, part.z + z).applyQuaternion(quaternion);
      min.min(corner);
      max.max(corner);
    }
  }
  const footprint = {
    minX: min.x,
    maxX: max.x,
    minZ: min.z,
    maxZ: max.z,
    width: max.x - min.x,
    depth: max.z - min.z,
  };
  footprintCache.set(id, footprint);
  return footprint;
}

/**
 * Converts a Shibuya Blocks building model into the Pigeon SK8 voxel Part[] system.
 * The model is centered in X, grounded at Y = 0, and has its front facade at Z = 0 extending backwards.
 */
export function getShibuyaBuildingParts(id: ShibuyaBuildingId): Part[] {
  const d = getAssetData(id);
  const floorY = d.floorY ?? 0.73;
  const storeBoxes = d.boxes.filter((b) => b.part !== "setting");
  // Shibuya Blocks marks the surrounding diorama as `setting`. Keep the small props
  // (trees, poles, lamps, planters, bicycle parts and frontage trim), but leave out
  // the large road/ground slabs because Pigeon SK8 owns the playable road surface.
  const settingDecor = d.boxes.filter((b) =>
    b.part === "setting" &&
    b.s[0] <= 4.2 &&
    b.s[2] <= 4.2 &&
    b.s[1] >= 0.08 &&
    b.p[1] + b.s[1] > 0.42,
  );

  let minX = 1e9,
    maxX = -1e9,
    minZ = 1e9,
    maxZ = -1e9;

  for (const b of storeBoxes) {
    minX = Math.min(minX, b.p[0]);
    maxX = Math.max(maxX, b.p[0] + b.s[0]);
    minZ = Math.min(minZ, b.p[2]);
    maxZ = Math.max(maxZ, b.p[2] + b.s[2]);
  }

  const cx = (minX + maxX) / 2;
  const frontZ = maxZ;
  const buildingW = maxX - minX;
  const buildingD = maxZ - minZ;

  const parts: Part[] = [];

  // 1. Foundation slab underneath so the building never floats on terrain gradients or curves
  parts.push({
    x: 0,
    y: -1.2,
    z: -buildingD / 2,
    w: buildingW + 0.3,
    h: 2.4,
    d: buildingD + 0.3,
    color: "#2a313d",
  });

  // 2. All architectural boxes (walls, windows, roofs, stairs, counters, ramen bowls, etc.)
  for (const b of storeBoxes) {
    const x = b.p[0] + b.s[0] / 2 - cx;
    const y = b.p[1] + b.s[1] / 2 - floorY;
    const z = b.p[2] + b.s[2] / 2 - frontZ;

    parts.push({
      x,
      y,
      z,
      w: b.s[0],
      h: b.s[1],
      d: b.s[2],
      color: b.color,
      rx: b.rotation ? b.rotation[0] : undefined,
      ry: b.rotation ? b.rotation[1] : undefined,
      rz: b.rotation ? b.rotation[2] : undefined,
      glow: (b.glow ?? 0) > 0.1,
      opacity: b.opacity,
    });
  }

  // 2b. Small diorama details copied from the same source asset. These are deliberately
  // kept in the same local coordinate system as the shop so the street frontage reads
  // like Shibuya Blocks instead of a bare floating building.
  for (const b of settingDecor) {
    const x = b.p[0] + b.s[0] / 2 - cx;
    const y = b.p[1] + b.s[1] / 2 - floorY;
    const z = b.p[2] + b.s[2] / 2 - frontZ;
    parts.push({
      x,
      y,
      z,
      w: b.s[0],
      h: b.s[1],
      d: b.s[2],
      color: b.color,
      rx: b.rotation ? b.rotation[0] : undefined,
      ry: b.rotation ? b.rotation[1] : undefined,
      rz: b.rotation ? b.rotation[2] : undefined,
      glow: (b.glow ?? 0) > 0.1,
      opacity: b.opacity,
    });
  }

  // 3. Graphic panels translated into glowing voxel signs and billboards
  for (const panel of d.panels.filter((p) => p.part !== "setting")) {
    const x = panel.p[0] - cx;
    const y = panel.p[1] - floorY;
    const z = panel.p[2] - frontZ;
    const pw = panel.s[0];
    const ph = panel.s[1];

    if (panel.kind.includes("109")) {
      // Iconic red Shibuya 109 signage with glowing white emblem
      parts.push({ x, y, z, w: pw, h: ph, d: 0.08, color: "#dc5747", glow: true });
      parts.push({ x, y, z: z + 0.05, w: pw * 0.72, h: ph * 0.65, d: 0.04, color: "#ffffff", glow: true });
    } else if (panel.kind.includes("led-screen")) {
      // Q-FRONT massive glowing electronic LED screen
      parts.push({ x, y, z, w: pw, h: ph, d: 0.1, color: "#1f8eed", glow: true });
      parts.push({ x, y: y + ph * 0.2, z: z + 0.06, w: pw * 0.88, h: ph * 0.35, d: 0.04, color: "#00f5d4", glow: true });
      parts.push({ x, y: y - ph * 0.2, z: z + 0.06, w: pw * 0.82, h: ph * 0.3, d: 0.04, color: "#ffd166", glow: true });
    } else if (panel.kind.includes("cafe")) {
      // Q-FRONT Starbucks cafe frontage
      parts.push({ x, y, z, w: pw, h: ph, d: 0.08, color: "#00704a", glow: true });
      parts.push({ x, y, z: z + 0.05, w: pw * 0.75, h: ph * 0.55, d: 0.04, color: "#fff3c4", glow: true });
    } else if (panel.kind.includes("station")) {
      // JR Shibuya Station green & white header
      parts.push({ x, y, z, w: pw, h: ph, d: 0.08, color: "#2e7d32", glow: true });
      parts.push({ x, y, z: z + 0.05, w: pw * 0.82, h: ph * 0.5, d: 0.04, color: "#ffffff", glow: true });
    } else if (panel.kind.includes("neon-board")) {
      // Center-gai stacked neon advertisements
      const neonHues = ["#f72585", "#ffd166", "#06d6a0", "#118ab2", "#7209b7", "#ff6b6b", "#4ecdc4"];
      const hue = neonHues[Math.abs(Math.round(y * 5)) % neonHues.length];
      parts.push({ x, y, z, w: pw, h: ph, d: 0.08, color: hue, glow: true });
      parts.push({ x, y, z: z + 0.05, w: pw * 0.7, h: ph * 0.6, d: 0.04, color: "#ffffff", glow: true });
    } else if (panel.kind.includes("vertical-neon")) {
      // Vertical neon column
      parts.push({ x, y, z, w: pw, h: ph, d: 0.08, color: "#151823" });
      parts.push({ x, y, z: z + 0.05, w: pw * 0.6, h: ph * 0.9, d: 0.05, color: "#00f5d4", glow: true });
    } else if (panel.kind.includes("sign-neon")) {
      // Center-gai roof billboard
      parts.push({ x, y, z, w: pw, h: ph, d: 0.08, color: "#ff007f", glow: true });
      parts.push({ x, y, z: z + 0.05, w: pw * 0.85, h: ph * 0.65, d: 0.04, color: "#fff475", glow: true });
    } else if (panel.kind.includes("noren")) {
      // Ramen restaurant noren curtains
      parts.push({ x, y, z, w: pw, h: ph, d: 0.04, color: "#c92a2a" });
      parts.push({ x, y: y - ph * 0.15, z: z + 0.025, w: pw * 0.65, h: ph * 0.45, d: 0.02, color: "#f8f9fa" });
    } else if (panel.kind.includes("ramen")) {
      // Ramen main front vertical signboard
      parts.push({ x, y, z, w: pw, h: ph, d: 0.08, color: "#991b1b", glow: true });
      parts.push({ x, y, z: z + 0.05, w: pw * 0.78, h: ph * 0.85, d: 0.04, color: "#fef08a", glow: true });
    } else if (panel.kind.includes("lantern")) {
      // Glowing paper lantern
      parts.push({ x, y, z, w: pw, h: ph, d: 0.06, color: "#ff4500", glow: true });
      parts.push({ x, y, z: z + 0.03, w: pw * 0.6, h: ph * 0.6, d: 0.03, color: "#ffd23f", glow: true });
    } else if (panel.kind.includes("izakaya")) {
      // Izakaya timber sign
      parts.push({ x, y, z, w: pw, h: ph, d: 0.06, color: "#b93b2a", glow: true });
      parts.push({ x, y, z: z + 0.03, w: pw * 0.8, h: ph * 0.5, d: 0.03, color: "#ffd166", glow: true });
    } else if (panel.kind.includes("office") || panel.kind.includes("tower")) {
      // Corporate tower sign
      parts.push({ x, y, z, w: pw, h: ph, d: 0.06, color: "#1e3a8a", glow: true });
      parts.push({ x, y, z: z + 0.03, w: pw * 0.75, h: ph * 0.5, d: 0.03, color: "#f59e0b", glow: true });
    } else if (panel.kind.includes("menu")) {
      // Ramen menu board
      parts.push({ x, y, z, w: pw, h: ph, d: 0.05, color: "#7f1d1d" });
      parts.push({ x, y, z: z + 0.03, w: pw * 0.7, h: ph * 0.6, d: 0.02, color: "#fef08a", glow: true });
    } else if (panel.kind.includes("logo") || panel.kind.includes("24-hours") || panel.kind.includes("atm")) {
      // Konbini 24H logo and notices
      parts.push({ x, y, z, w: pw, h: ph, d: 0.06, color: "#16a34a", glow: true });
      parts.push({ x, y, z: z + 0.03, w: pw * 0.7, h: ph * 0.6, d: 0.03, color: "#ea580c", glow: true });
    } else {
      // General illuminated storefront panel
      parts.push({ x, y, z, w: pw, h: ph, d: 0.06, color: "#ffb703", glow: true });
    }
  }

  return parts;
}

/** Cache of geometry pairs for each Shibuya Blocks building */
export function getShibuyaBuildingGeoPair(id: ShibuyaBuildingId): GeoPair {
  return getGeometryPair(`shibuya-blocks-bld-${id}`, () => getShibuyaBuildingParts(id));
}
