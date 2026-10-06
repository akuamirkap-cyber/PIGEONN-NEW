import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { applyCurve } from "./curve";

/** A single axis-aligned colored box, the building block of every voxel model. */
export interface Part {
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  d: number;
  color: string | number;
  /** optional rotations (radians) applied before translation */
  rx?: number;
  ry?: number;
  rz?: number;
  /** self-luminous part (neon sign, lit window, headlight): rendered unlit at full brightness */
  glow?: boolean;
  /** translucent source voxel, used by Shibuya Blocks glass panes */
  opacity?: number;
}

const tmpColor = new THREE.Color();

/** Build one merged BufferGeometry (with vertex colors) from a list of boxes. */
export function buildVoxelGeometry(parts: Part[]): THREE.BufferGeometry {
  const geos: THREE.BufferGeometry[] = [];
  for (const p of parts) {
    const g = new THREE.BoxGeometry(p.w, p.h, p.d);
    if (p.rx) g.rotateX(p.rx);
    if (p.ry) g.rotateY(p.ry);
    if (p.rz) g.rotateZ(p.rz);
    g.translate(p.x, p.y, p.z);
    tmpColor.set(p.color);
    const count = g.attributes.position.count;
    const colors = new Float32Array(count * 3);
    // subtle per-face shading like Crossy Road: bottom faces a bit darker, top faces a bit lighter
    const normals = g.attributes.normal;
    for (let i = 0; i < count; i++) {
      const ny = normals.getY(i);
      const nx = normals.getX(i);
      // glow parts keep their exact colour on every face (smooth, even light like a real lightbox)
      const shade = p.glow ? 1 : ny > 0.5 ? 1.05 : ny < -0.5 ? 0.75 : nx > 0.5 ? 0.97 : 1;
      colors[i * 3] = Math.min(1, tmpColor.r * shade);
      colors[i * 3 + 1] = Math.min(1, tmpColor.g * shade);
      colors[i * 3 + 2] = Math.min(1, tmpColor.b * shade);
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geos.push(g);
  }
  const merged = mergeGeometries(geos, false);
  geos.forEach((g) => g.dispose());
  if (!merged) return new THREE.BufferGeometry();
  merged.computeBoundingSphere();
  return merged;
}

const cache = new Map<string, THREE.BufferGeometry>();

/** Buang semua geometri ter-cache — dipakai saat HMR mengganti sumber model
 *  supaya mesh lama (mis. pengendara motor versi sebelumnya) tidak terus dipakai. */
export function bustGeometryCache() {
  cache.clear();
  pairCache.clear();
}

/** Cached geometry by key so identical props share one geometry. */
export function getGeometry(key: string, make: () => Part[]): THREE.BufferGeometry {
  let g = cache.get(key);
  if (!g) {
    g = buildVoxelGeometry(make());
    cache.set(key, g);
  }
  return g;
}

/** A model split into a lit half (scene lighting) and a glow half (self-luminous neon). */
export interface GeoPair {
  lit: THREE.BufferGeometry;
  glow: THREE.BufferGeometry | null;
  /** Translucent geometry is kept separate so source storefront interiors remain visible. */
  transparent: THREE.BufferGeometry | null;
}

/** Split parts into lit, glow, and translucent geometries so source glass stays readable. */
export function buildVoxelPair(parts: Part[]): GeoPair {
  const glowParts = parts.filter((p) => p.glow);
  const transparentParts = parts.filter((p) => !p.glow && (p.opacity ?? 1) < 0.98);
  const litParts = parts.filter((p) => !p.glow && (p.opacity ?? 1) >= 0.98);
  return {
    lit: buildVoxelGeometry(litParts),
    glow: glowParts.length ? buildVoxelGeometry(glowParts) : null,
    transparent: transparentParts.length ? buildVoxelGeometry(transparentParts) : null,
  };
}

const pairCache = new Map<string, GeoPair>();

/** Cached lit/glow geometry pair by key. */
export function getGeometryPair(key: string, make: () => Part[]): GeoPair {
  let p = pairCache.get(key);
  if (!p) {
    p = buildVoxelPair(make());
    pairCache.set(key, p);
  }
  return p;
}

/** Shared flat-shaded material for all voxel models. */
export const voxelMaterial = applyCurve(new THREE.MeshLambertMaterial({ vertexColors: true }));
/** Shared low-opacity material for source glass panels; storefront contents remain visible. */
export const transparentVoxelMaterial = applyCurve(
  new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide }),
);

/** Unlit material for self-luminous parts: neon boxes glow evenly no matter how dark the night is
 *  (still bends with the world curve and fades into the distance haze). */
export const glowMaterial = applyCurve(new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }));

/** Boost HDR untuk material glow: > 1 saat malam supaya HANYA glow yang melewati
 *  threshold bloom (permukaan putih biasa mentok di 1.0 dan tidak ikut mekar). */
export function setGlowBoost(v: number) {
  (glowMaterial as THREE.MeshBasicMaterial).color.setScalar(v);
}

/** Aspal malam Shibuya yang bersih & elegan: Phong dengan specular neutral slate supaya jalan
 *  memantulkan kilau cahaya jalan kota tanpa warna ungu cyberpunk. */
export const glossyGroundMaterial = applyCurve(
  new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 45, specular: new THREE.Color("#444d5c"), side: THREE.DoubleSide }),
);

export function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}
export function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}
export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
export function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}
