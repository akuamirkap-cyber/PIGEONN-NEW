import * as THREE from "three";
import { buildVoxelGeometry, type Part } from "./voxel";

/** Distances (world units) of the backdrop layers from the camera. All layers are unlit and drawn behind the world. */
export const BACK = { fuji: 120, cloud: 104, hills: 100 };

/** Fuji billboard: canvas is 4:1 (1600x400); the summit sits 36px below the top edge. */
export const FUJI = { w: 140, h: 35, summitY: 26.6 };
// plane centre so that the summit is at FUJI.summitY
export const FUJI_CY = FUJI.summitY + (36 / 400) * FUJI.h - FUJI.h / 2;

/** Stepped "pixel" clouds (wide base slab, two narrower tiers, side bumps); returns geometry + placement per cloud. */
export function buildClouds(): { geo: THREE.BufferGeometry; theta: number; y: number; scale: number }[] {
  let seed = 11;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const list: { geo: THREE.BufferGeometry; theta: number; y: number; scale: number }[] = [];
  const N = 8;
  for (let i = 0; i < N; i++) {
    const w = 7 + rnd() * 5;
    const h = 1.2;
    const d = 2.6;
    const parts: Part[] = [
      { x: 0, y: -h * 0.55, z: 0, w: w * 0.92, h: h * 0.5, d: d * 0.9, color: "#dfeaf5" }, // soft underside
      { x: 0, y: 0, z: 0, w, h, d, color: "#fbfdff" },
      { x: (rnd() - 0.5) * w * 0.25, y: h * 0.95, z: 0, w: w * (0.5 + rnd() * 0.15), h: h * 0.95, d: d * 0.85, color: "#ffffff" },
      { x: (rnd() - 0.5) * w * 0.3, y: h * 1.8, z: 0, w: w * (0.22 + rnd() * 0.1), h: h * 0.8, d: d * 0.7, color: "#ffffff" },
      { x: -w * 0.52, y: h * 0.15, z: 0, w: w * 0.18, h: h * 0.7, d: d * 0.7, color: "#fbfdff" },
      { x: w * 0.53, y: h * 0.1, z: 0, w: w * 0.16, h: h * 0.6, d: d * 0.7, color: "#fbfdff" },
    ];
    list.push({ geo: buildVoxelGeometry(parts), theta: (i / N) * Math.PI * 2 + rnd() * 0.5, y: 24 + rnd() * 13, scale: 0.75 + rnd() * 0.4 });
  }
  return list;
}
