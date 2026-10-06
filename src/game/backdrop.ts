import * as THREE from "three";
import { buildVoxelGeometry, type Part } from "./voxel";

/** Distances (world units) of the backdrop layers from the camera. All layers are unlit and drawn behind the world. */
export const BACK = { fuji: 120, cloud: 104, hills: 100 };

/** Fuji billboard: canvas is 4:1 (1600x400); the summit sits 36px below the top edge. */
export const FUJI = { w: 140, h: 35, summitY: 26.6 };
// plane centre so that the summit is at FUJI.summitY
export const FUJI_CY = FUJI.summitY + (36 / 400) * FUJI.h - FUJI.h / 2;

/** Stepped "pixel" clouds — cumulus cantik berlapis: alas lembut, beberapa gumpalan mengembung
 *  bertangga dengan bayangan bawah kebiru-lembutan; returns geometry + placement per cloud. */
export function buildClouds(): { geo: THREE.BufferGeometry; theta: number; y: number; scale: number }[] {
  let seed = 11;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const list: { geo: THREE.BufferGeometry; theta: number; y: number; scale: number }[] = [];
  const N = 10; // langit siang lebih ramai & ceria
  for (let i = 0; i < N; i++) {
    const w = 7 + rnd() * 6.5;
    const h = 1.2;
    const d = 2.6;
    const parts: Part[] = [
      { x: 0, y: -h * 0.55, z: 0, w: w * 0.94, h: h * 0.5, d: d * 0.92, color: "#d7e6f5" }, // bayangan bawah biru lembut
      { x: 0, y: -h * 0.1, z: 0, w, h: h * 0.9, d, color: "#f2f8ff" },                      // dasar putih kebiruan
      { x: (rnd() - 0.5) * w * 0.25, y: h * 0.85, z: 0, w: w * (0.55 + rnd() * 0.12), h: h * 0.95, d: d * 0.88, color: "#fbfdff" },
      { x: (rnd() - 0.5) * w * 0.2, y: h * 1.65, z: 0, w: w * (0.34 + rnd() * 0.1), h: h * 0.9, d: d * 0.78, color: "#ffffff" },
      { x: (rnd() - 0.5) * w * 0.3, y: h * 2.35, z: 0, w: w * (0.15 + rnd() * 0.08), h: h * 0.75, d: d * 0.6, color: "#ffffff" }, // puncak gulung
      { x: -w * 0.52, y: h * 0.25, z: 0, w: w * 0.2, h: h * 0.85, d: d * 0.75, color: "#f7fbff" },
      { x: w * 0.52, y: h * 0.2, z: 0, w: w * 0.17, h: h * 0.7, d: d * 0.7, color: "#f7fbff" },
      // dua gumpalan samping kecil biar bentuknya organik, bukan balok simetris
      { x: -w * 0.3, y: h * 0.5, z: (rnd() - 0.5) * d, w: w * 0.24, h: h * 0.7, d: d * 0.55, color: "#ffffff" },
      { x: w * 0.3, y: h * 0.55, z: (rnd() - 0.5) * d, w: w * 0.2, h: h * 0.6, d: d * 0.5, color: "#ffffff" },
    ];
    list.push({ geo: buildVoxelGeometry(parts), theta: (i / N) * Math.PI * 2 + rnd() * 0.5, y: 23 + rnd() * 15, scale: 0.72 + rnd() * 0.5 });
  }
  return list;
}
