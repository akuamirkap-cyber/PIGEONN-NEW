/* Painter-raster ASCII: persis apa yang digambar GPU (tanpa shader curve) untuk
   motor + referensi jalan. 0=tidak ada tilt yang seharusnya. */
import * as THREE from "three";
import { engine, track } from "../src/game/engine";
import { useUI } from "../src/game/store";
import { motorcycleParts } from "../src/game/models";
import { stripsFor, laneMarkingQuads } from "../src/game/ground";

useUI.getState().setTrackMode("street");
engine.setTrackMode("street");
engine.startRun();
(engine as any).crash = () => {};
const e = engine as any;

let moto: any = null;
for (let i = 0; i < 60 * 600; i++) {
  engine.update(1 / 60);
  for (const m of e.movers) if (m.kind === "motorcycle" && !m.shibuyaMoto) {
    const rel = m.s - engine.distance;
    if (rel > 6.0 && rel < 8.5 && Math.abs(m.lat) < 0.1 && engine.player.lat === 0) { moto = m; break; }
  }
  if (moto) break;
}
if (!moto) { console.log("no moto"); process.exit(1); }

// kamera PLAY persis
const C = { back: 8.2, up: 9.2, lookAhead: 6.0, lookUp: 0.45, fov: 48, latFollow: 0.38 };
const aheadCam = 4 + engine.speed * 0.3;
const th = track.sample(engine.distance + aheadCam).th;
const fwd = new THREE.Vector3(Math.cos(th), 0, Math.sin(th));
const side = new THREE.Vector3(-Math.sin(th), 0, Math.cos(th));
const ctr = engine.center;
const camLat = engine.player.lat * C.latFollow;
const hFollow = Math.max(0, engine.player.h) * 0.25;
const gAhead = track.sample(engine.distance + C.lookAhead).y - ctr.y;
const gBack = track.sample(Math.max(0, engine.distance - C.back)).y - ctr.y;
const pos = new THREE.Vector3(ctr.x, ctr.y, ctr.z).addScaledVector(fwd, -C.back).addScaledVector(side, camLat);
pos.y += C.up + hFollow + gBack * 0.6;
const target = new THREE.Vector3(ctr.x, ctr.y, ctr.z).addScaledVector(fwd, C.lookAhead).addScaledVector(side, camLat * 0.6);
target.y += C.lookUp + hFollow * 0.8 + gAhead * 0.85;
const cam = new THREE.PerspectiveCamera(60, 4 / 3, 0.1, 500);
cam.position.copy(pos); cam.up.set(0, 1, 0); cam.lookAt(target); cam.updateMatrixWorld();

const CW = 110, CH = 38;
const zbuf: number[][] = Array.from({ length: CH }, () => Array(CW).fill(Infinity));
const grid: string[][] = Array.from({ length: CH }, () => Array(CW).fill(" "));
const P = new THREE.Vector3();
function shade(color: string) {
  const c = new THREE.Color(color);
  const l = 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
  return l > 0.66 ? "." : l > 0.36 ? "+" : "#";
}
function fillQuad(ws: THREE.Vector3[], color: string) {
  const pts = ws.map((w) => w.clone().project(cam));
  if (pts.every((p) => p.z > 1 || p.z < -1)) return;
  const sxp = pts.map((p) => ((p.x + 1) / 2) * (CW - 1));
  const syp = pts.map((p) => ((1 - p.y) / 2) * (CH - 1));
  const depth = pts.reduce((a, p) => a + p.z, 0) / pts.length;
  const ch = shade(color);
  const minX = Math.max(0, Math.floor(Math.min(...sxp)));
  const maxX = Math.min(CW - 1, Math.ceil(Math.max(...sxp)));
  const minY = Math.max(0, Math.floor(Math.min(...syp)));
  const maxY = Math.min(CH - 1, Math.ceil(Math.max(...syp)));
  const inTri = (px: number, py: number, a: number, b: number, c: number) => {
    const X = (i: number) => sxp[i], Y = (i: number) => syp[i];
    const s = (i: number, j: number) => (X(j) - X(i)) * (py - Y(i)) - (Y(j) - Y(i)) * (px - X(i));
    const d1 = s(a, b), d2 = s(b, c), d3 = s(c, a);
    const hasNeg = d1 < 0 || d2 < 0 || d3 < 0, hasPos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(hasNeg && hasPos);
  };
  for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
    const inside = inTri(x, y, 0, 1, 2) || inTri(x, y, 0, 2, 3);
    if (inside && depth < zbuf[y][x] && (y < CH) && (grid as any)) {
      // kedalaman per-piksel diaproks rata2 — cukup untuk siluet
      zbuf[y][x] = depth;
      grid[y][x] = ch;
    }
  }
}

// ---- lantai jalan + garis lajur (referensi lurus!) ----
const d0 = engine.distance;
for (let s = d0 - 10; s < d0 + 55; s += 2.5) {

}

// ---- MOTOR persis World.tsx ----
const gQ = new THREE.Quaternion(); track.quat(moto.s, gQ);
const gPos = new THREE.Vector3(); track.frame(moto.s, moto.lat, moto.h, gPos);
const M = new THREE.Matrix4().compose(gPos, gQ, new THREE.Vector3(1, 1, 1));
M.multiply(new THREE.Matrix4().makeRotationY(Math.PI));

interface Box { c: THREE.Vector3; e: THREE.Vector3; rz: number; color: string }
const boxes: Box[] = motorcycleParts(moto.variant).map((pt: any) => ({ c: new THREE.Vector3(pt.x, pt.y, pt.z), e: new THREE.Vector3(pt.w / 2, pt.h / 2, pt.d / 2), rz: pt.rz ?? 0, color: pt.color }));
// semua 6 sisi setiap kotak
const FACES = [
  [[1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, -1]],
  [[-1, 1, 1], [-1, -1, 1], [-1, -1, -1], [-1, 1, -1]],
  [[1, 1, 1], [-1, 1, 1], [-1, 1, -1], [1, 1, -1]],
  [[1, -1, 1], [-1, -1, 1], [-1, -1, -1], [1, -1, -1]],
  [[1, 1, 1], [-1, 1, 1], [-1, -1, 1], [1, -1, 1]],
  [[1, 1, -1], [-1, 1, -1], [-1, -1, -1], [1, -1, -1]],
];
for (const b of boxes) {
  const cos = Math.cos(b.rz), sin = Math.sin(b.rz);
  const local = (f: number[]) => {
    const lx = f[0] * b.e.x, ly = f[1] * b.e.y, lz = f[2] * b.e.z;
    const rx = lx * cos - ly * sin, ry = lx * sin + ly * cos;
    return new THREE.Vector3(b.c.x + rx, b.c.y + ry, b.c.z + lz).applyMatrix4(M);
  };
  for (const f of FACES) fillQuad(f.map(local), b.color);
}

console.log(`variant=${moto.variant} rel=${(moto.s - d0).toFixed(1)} lat=${moto.lat.toFixed(2)} h=${moto.h.toFixed(2)}`);
console.log(grid.map((r) => r.join("")).join("\n"));
