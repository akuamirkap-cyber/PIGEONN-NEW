/* Repro headless persis: transform World.tsx + kamera PLAY Scene.tsx -> ASCII screen. */
import * as THREE from "three";
import { engine, track } from "../src/game/engine";
import { useUI } from "../src/game/store";
import { motorcycleParts } from "../src/game/models";

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
    if (rel > 11 && rel < 14) { moto = m; break; }
  }
  if (moto) break;
}
if (!moto) { console.log("TIDAK ADA MOTOR KLASIK"); process.exit(1); }

// --- kamera PLAY persis Scene.tsx (steady state) ---
const C = { back: 8.4, up: 5.0, lookAhead: 13, lookUp: 0.38, fov: 60, latFollow: 0.55 };
const ahead = 4 + engine.speed * 0.3;
const th = track.sample(engine.distance + ahead).th;
const fwd = new THREE.Vector3(Math.cos(th), 0, Math.sin(th));
const side = new THREE.Vector3(-Math.sin(th), 0, Math.cos(th));
const ctr = engine.center;
const base = new THREE.Vector3(ctr.x, ctr.y, ctr.z);
const p = engine.player;
const camLat = p.lat * C.latFollow;
const hFollow = Math.max(0, p.h) * 0.25;
const gAhead = track.sample(engine.distance + C.lookAhead).y - ctr.y;
const gBack = track.sample(Math.max(0, engine.distance - C.back)).y - ctr.y;
const pos = base.clone().addScaledVector(fwd, -C.back).addScaledVector(side, camLat);
pos.y += C.up + hFollow + gBack * 0.6;
const target = base.clone().addScaledVector(fwd, C.lookAhead).addScaledVector(side, camLat * 0.6);
target.y += C.lookUp + hFollow * 0.8 + gAhead * 0.85;
const cam = new THREE.PerspectiveCamera(60, 4 / 3, 0.1, 500);
cam.position.copy(pos);
cam.up.set(0, 1, 0);
cam.lookAt(target);
cam.updateMatrixWorld();

const CW = 90, CH = 34;
const grid: string[][] = Array.from({ length: CH }, () => Array(CW).fill(" "));
const v = new THREE.Vector3();
const plot = (x: number, y: number, z: number, ch = "#") => {
  v.set(x, y, z).project(cam);
  const sx = Math.round(((v.x + 1) / 2) * (CW - 1));
  const sy = Math.round(((1 - v.y) / 2) * (CH - 1));
  if (sx >= 0 && sx < CW && sy >= 0 && sy < CH) grid[sy][sx] = ch;
};

// garis referensi AS JALAN (pusat trek, tinggi 0) di sekitar motor: '-' supaya kelihatan arah jalan
for (let ds = -40; ds <= 60; ds += 0.5) {
  const fp = new THREE.Vector3();
  track.frame(engine.distance + ds, 0, 0, fp);
  plot(fp.x, fp.y, fp.z, "-");
}

// --- transform motor persis World.tsx ---
const gQ = new THREE.Quaternion();
track.quat(moto.s, gQ);
const gE = new THREE.Euler().setFromQuaternion(gQ, "XYZ");
const gPos = new THREE.Vector3();
track.frame(moto.s, moto.lat, moto.h, gPos);
const M = new THREE.Matrix4().compose(gPos, gQ, new THREE.Vector3(1, 1, 1));
M.multiply(new THREE.Matrix4().makeRotationY(Math.PI));

console.log(`moto variant=${moto.variant} rel=${(moto.s - engine.distance).toFixed(1)} lat=${moto.lat.toFixed(2)} trackEulerDeg x=${(gE.x * 57.3).toFixed(1)} y=${(gE.y * 57.3).toFixed(1)} z=${(gE.z * 57.3).toFixed(1)}`);
const parts = motorcycleParts(moto.variant);
for (const pt of parts) {
  const rz = (pt as any).rz ?? 0;
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
    let lx = (sx * pt.w) / 2, ly = (sy * pt.h) / 2, lz = (sz * pt.d) / 2;
    if (rz) { const rx = lx * Math.cos(rz) - ly * Math.sin(rz); const ry = lx * Math.sin(rz) + ly * Math.cos(rz); lx = rx; ly = ry; }
    v.set(pt.x + lx, pt.y + ly, pt.z + lz).applyMatrix4(M).project(cam);
    const sx2 = Math.round(((v.x + 1) / 2) * (CW - 1));
    const sy2 = Math.round(((1 - v.y) / 2) * (CH - 1));
    if (sx2 >= 0 && sx2 < CW && sy2 >= 0 && sy2 < CH) grid[sy2][sx2] = "#";
    v.set(pt.x + lx * 0.5, pt.y + ly * 0.5, pt.z + lz * 0.5).applyMatrix4(M).project(cam);
    const sx3 = Math.round(((v.x + 1) / 2) * (CW - 1));
    const sy3 = Math.round(((1 - v.y) / 2) * (CH - 1));
    if (sx3 >= 0 && sx3 < CW && sy3 >= 0 && sy3 < CH) grid[sy3][sx3] = "+";
  }
}
console.log(grid.map((r) => r.join("")).join("\n"));
// sudut miring di layar: roda depan vs belakang
const proj = (x: number, y: number, z: number) => { const q = new THREE.Vector3(x, y, z).applyMatrix4(M).project(cam); return [((q.x + 1) / 2) * CW, ((1 - q.y) / 2) * CH] as const; };
const [fX, fY] = proj(0.62, 0.22, 0), [rX, rY] = proj(-0.56, 0.26, 0);
const leanScreen = Math.atan2(fY - rY, fX - rX) * 57.3;
const [tX, tY] = proj(-0.29, 1.3, 0), [hX, hY] = proj(-0.28, 1.3, 0);
console.log(`garis rodaBelakang->rodaDepan di layar: ${leanScreen.toFixed(1)} derajat (0 = lurus horizontal)`);
const [headX, headY] = proj(-0.28, 1.62, 0);
console.log(`garis jok->helm: dx=${(headX - tX).toFixed(1)}px dy=${(headY - tY).toFixed(1)}px (tegak = dx mendekati 0, dy negatif)`);
