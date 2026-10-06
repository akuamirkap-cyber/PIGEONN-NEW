/* Wireframe perspektif: motor klasik dari kamera CROSSY dekat — verifikasi bentuk akhir. */
import * as THREE from "three";
import { engine, track } from "../src/game/engine";
import { useUI } from "../src/game/store";
import { motorcycleParts } from "../src/game/models";

useUI.getState().setTrackMode("street");
engine.setTrackMode("street");
engine.startRun();
(engine as any).crash = () => {};
const e = engine as any;
for (let i = 0; i < 60 * 30; i++) engine.update(1 / 60);

// kamera CROSSY persis Scene.tsx
const C = { back: 8.2, up: 9.2, lookAhead: 6.0, lookUp: 0.45, fov: 48, latFollow: 0.38 };
const aheadCam = 4 + engine.speed * 0.3;
const th = track.sample(engine.distance + aheadCam).th;
const fwd = new THREE.Vector3(Math.cos(th), 0, Math.sin(th));
const side = new THREE.Vector3(-Math.sin(th), 0, Math.cos(th));
const ctr = engine.center;
const camLat = engine.player.lat * C.latFollow;
const hFollow = 0;
const gAhead = track.sample(engine.distance + C.lookAhead).y - ctr.y;
const gBack = track.sample(Math.max(0, engine.distance - C.back)).y - ctr.y;
const pos = new THREE.Vector3(ctr.x, ctr.y, ctr.z).addScaledVector(fwd, -C.back).addScaledVector(side, camLat);
pos.y += C.up + hFollow + gBack * 0.6;
const target = new THREE.Vector3(ctr.x, ctr.y, ctr.z).addScaledVector(fwd, C.lookAhead).addScaledVector(side, camLat * 0.6);
target.y += C.lookUp + hFollow * 0.8 + gAhead * 0.85;
const cam = new THREE.PerspectiveCamera(48, 4 / 3, 0.1, 500);
cam.position.copy(pos); cam.up.set(0, 1, 0); cam.lookAt(target); cam.updateMatrixWorld();

const CW = 120, CH = 44;
const grid: string[][] = Array.from({ length: CH }, () => Array(CW).fill(" "));
const zbuf: number[][] = Array.from({ length: CH }, () => Array(CW).fill(Infinity));
const put = (w: THREE.Vector3, ch: string) => {
  const p = w.clone().project(cam);
  const sx = Math.round(((p.x + 1) / 2) * (CW - 1));
  const sy = Math.round(((1 - p.y) / 2) * (CH - 1));
  if (sx >= 0 && sx < CW && sy >= 0 && sy < CH && p.z < zbuf[sy][sx]) { zbuf[sy][sx] = p.z; grid[sy][sx] = ch; }
};
const line = (a: THREE.Vector3, b: THREE.Vector3, ch: string) => {
  const n = 24;
  for (let i = 0; i <= n; i++) put(a.clone().lerp(b, i / n), ch);
};

// referensi: garis tengah jalan lurus ke depan '|' dan garis horizontal tanah '='
const d0 = engine.distance;
for (let s = d0 - 6; s <= d0 + 30; s += 1) {
  const a = new THREE.Vector3(), b = new THREE.Vector3();
  track.frame(s, 0, 0.02, a); track.frame(s + 1, 0, 0.02, b); line(a, b, "|");
}
// dua garis lajur posisi motor pada dist motor
const relS = d0 + 7.5;
for (const lat of [-1.3, 0, 1.3]) {
  const a = new THREE.Vector3(), b = new THREE.Vector3();
  track.frame(relS - 2, lat, 0.02, a); track.frame(relS + 2, lat, 0.02, b); line(a, b, "-");
}

// MOTOR pada rel 7.5 lat 0, transform persis World.tsx
const ms = d0 + 7.5;
const gQ = new THREE.Quaternion(); track.quat(ms, gQ);
const gPos = new THREE.Vector3(); track.frame(ms, 0, 0, gPos);
const M = new THREE.Matrix4().compose(gPos, gQ, new THREE.Vector3(1, 1, 1));
M.multiply(new THREE.Matrix4().makeRotationY(Math.PI));
console.log(`grade@${ms - d0 | 0}m rel: g=${track.sample(ms).g.toFixed(3)} th=${track.sample(ms).th.toFixed(3)}`);

const L = (pt: any, sx: number, sy: number, sz: number) => {
  const rz = pt.rz ?? 0;
  const lx = (sx * pt.w) / 2, ly = (sy * pt.h) / 2, lz = (sz * pt.d) / 2;
  const rx = lx * Math.cos(rz) - ly * Math.sin(rz);
  const ry = lx * Math.sin(rz) + ly * Math.cos(rz);
  return new THREE.Vector3(pt.x + rx, pt.y + ry, pt.z + lz).applyMatrix4(M);
};
for (const pt of motorcycleParts(5) as any[]) {
  const E = [
    [[1, 1, 1], [-1, 1, 1]], [[-1, 1, 1], [-1, -1, 1]], [[-1, -1, 1], [1, -1, 1]], [[1, -1, 1], [1, 1, 1]],
    [[1, 1, -1], [-1, 1, -1]], [[-1, 1, -1], [-1, -1, -1]], [[-1, -1, -1], [1, -1, -1]], [[1, -1, -1], [1, 1, -1]],
    [[1, 1, 1], [1, 1, -1]], [[-1, 1, 1], [-1, 1, -1]], [[-1, -1, 1], [-1, -1, -1]], [[1, -1, 1], [1, -1, -1]],
  ];
  for (const [a, b] of E) line(L(pt, ...(a as any)), L(pt, ...(b as any)), pt.w > 0.3 && pt.h > 0.3 ? "#" : "+");
}
console.log(grid.map((r) => r.join("")).join("\n"));
