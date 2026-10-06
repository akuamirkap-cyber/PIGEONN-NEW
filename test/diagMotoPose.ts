/* Siluet samping (x-y) pengendara motor klasik — memastikan badan/kepala tegak lurus. */
import { motorcycleParts } from "../src/game/models";

const parts = motorcycleParts(0);
const W = 64, H = 30;
const grid: string[][] = Array.from({ length: H }, () => Array(W).fill(" "));
const X0 = -1.1, X1 = 1.1, Y0 = 0, Y1 = 1.8;
for (const p of parts) {
  // corners dengan rotasi rz
  const corners: [number, number][] = [];
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    let lx = (sx * p.w) / 2, ly = (sy * p.h) / 2;
    const rz = (p as any).rz ?? 0;
    const rx = lx * Math.cos(rz) - ly * Math.sin(rz);
    const ry = lx * Math.sin(rz) + ly * Math.cos(rz);
    corners.push([p.x + rx, p.y + ry]);
  }
  for (let i = 0; i < corners.length; i++) {
    const cx = ((corners[i][0] - X0) / (X1 - X0)) * (W - 1);
    const cy = H - 1 - ((corners[i][1] - Y0) / (Y1 - Y0)) * (H - 1);
    const gi = Math.round(cy), gj = Math.round(cx);
    if (gi >= 0 && gi < H && gj >= 0 && gj < W) grid[gi][gj] = ".";
  }
  // isi garis antar corner
  for (let a = 0; a < corners.length; a++) {
    const [ax, ay] = corners[a], [bx, by] = corners[(a + 1) % corners.length];
    for (let k = 0; k <= 8; k++) {
      const t = k / 8;
      const cx = (((ax + (bx - ax) * t) - X0) / (X1 - X0)) * (W - 1);
      const cy = H - 1 - (((ay + (by - ay) * t) - Y0) / (Y1 - Y0)) * (H - 1);
      const gi = Math.round(cy), gj = Math.round(cx);
      if (gi >= 0 && gi < H && gj >= 0 && gj < W) grid[gi][gj] = "#";
    }
  }
}
console.log("Siluet samping motor+pengendara (depan -> kanan):");
console.log(grid.map((r) => r.join("")).join("\n"));

// ukur kemiringan badan: perut vs bahu vs leher
const perut = parts.find(p => p.y + 0.04 > 0.93 && p.y + 0.04 < 1.01 && p.h === 0.24)!;
const bahu = parts.find(p => p.y + 0.04 > 1.25 && p.y + 0.04 < 1.33 && p.h === 0.1 && p.d > 0.4)!;
const leher = parts.find(p => p.color === "#e0b48f")!;
const leanPerut = perut.x - bahu.x;
const leanTotal = perut.x - leher.x;
console.log(`\noffset perut->bahu: ${leanPerut.toFixed(2)} | perut->leher: ${leanTotal.toFixed(2)} ${Math.abs(leanTotal) < 0.04 ? "✅ TEGAK" : "❌ MASIH MIRING"}`);
