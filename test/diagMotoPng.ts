/* Software-render PNG (painter + z-buffer): motor klasik persis seperti game (CROSSY cam),
   jalan + zebra crosswalk, supaya bisa dibandingkan dengan screenshot user. */
import * as THREE from "three";
import { writeFileSync } from "fs";
import { engine, track } from "../src/game/engine";
import { useUI } from "../src/game/store";
import { motorcycleParts } from "../src/game/models";

useUI.getState().setTrackMode("street");
engine.setTrackMode("street");
engine.startRun();
(engine as any).crash = () => {};
for (let i = 0; i < 60 * 20; i++) engine.update(1 / 60);

// CROSSY
const C = { back: 8.2, up: 9.2, lookAhead: 6.0, lookUp: 0.45, fov: 48, latFollow: 0.38 };
const aheadCam = 4 + engine.speed * 0.3;
const th = track.sample(engine.distance + aheadCam).th;
const fwd = new THREE.Vector3(Math.cos(th), 0, Math.sin(th));
const side = new THREE.Vector3(-Math.sin(th), 0, Math.cos(th));
const ctr = engine.center;
const camLat = engine.player.lat * C.latFollow;
const gAhead = track.sample(engine.distance + C.lookAhead).y - ctr.y;
const gBack = track.sample(Math.max(0, engine.distance - C.back)).y - ctr.y;
const pos = new THREE.Vector3(ctr.x, ctr.y, ctr.z).addScaledVector(fwd, -C.back).addScaledVector(side, camLat);
pos.y += C.up + gBack * 0.6;
const target = new THREE.Vector3(ctr.x, ctr.y, ctr.z).addScaledVector(fwd, C.lookAhead).addScaledVector(side, camLat * 0.6);
target.y += C.lookUp + gAhead * 0.85;
const cam = new THREE.PerspectiveCamera(48, 171 / 191, 0.1, 500);
cam.position.copy(pos); cam.up.set(0, 1, 0); cam.lookAt(target); cam.updateMatrixWorld();

const W = 342, H = 382;
const img = new Float32Array(W * H * 3).fill(0);
const zbuf = new Float32Array(W * H).fill(Infinity);
// langit
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const k = y / H;
  const i = (y * W + x) * 3;
  img[i] = 0.55 + 0.25 * (1 - k); img[i + 1] = 0.72 + 0.2 * (1 - k); img[i + 2] = 0.95;
}

const V = new THREE.Vector3();
const C3 = new THREE.Color();
function tri(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, color: string) {
  const pa = a.clone().project(cam), pb = b.clone().project(cam), pc = c.clone().project(cam);
  if (pa.z > 1 && pb.z > 1 && pc.z > 1) return;
  const xs = [((pa.x + 1) / 2) * W, ((pb.x + 1) / 2) * W, ((pc.x + 1) / 2) * W];
  const ys = [((1 - pa.y) / 2) * H, ((1 - pb.y) / 2) * H, ((1 - pc.y) / 2) * H];
  const zs = [pa.z, pb.z, pc.z];
  const minX = Math.max(0, Math.floor(Math.min(...xs))); const maxX = Math.min(W - 1, Math.ceil(Math.max(...xs)));
  const minY = Math.max(0, Math.floor(Math.min(...ys))); const maxY = Math.min(H - 1, Math.ceil(Math.max(...ys)));
  const d = (xs[1] - xs[0]) * (ys[2] - ys[0]) - (xs[2] - xs[0]) * (ys[1] - ys[0]);
  if (Math.abs(d) < 1e-9) return;
  C3.set(color);
  // flat shading sederhana: warna * arah normal ke cahaya
  const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a)).normalize();
  const nl = new THREE.Vector3(0.5, 0.85, 0.2).normalize();
  const bri = 0.55 + 0.5 * Math.abs(n.dot(nl));
  const r = Math.min(1, C3.r * bri), g = Math.min(1, C3.g * bri), bb = Math.min(1, C3.b * bri);
  for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
    const w0 = ((xs[1] - x) * (ys[2] - y) - (xs[2] - x) * (ys[1] - y)) / d;
    const w1 = ((xs[2] - x) * (ys[0] - y) - (xs[0] - x) * (ys[2] - y)) / d;
    const w2 = 1 - w0 - w1;
    if (w0 < 0 || w1 < 0 || w2 < 0) continue;
    const z = w0 * zs[0] + w1 * zs[1] + w2 * zs[2];
    const ii = y * W + x;
    if (z >= zbuf[ii]) continue;
    zbuf[ii] = z;
    img[ii * 3] = r; img[ii * 3 + 1] = g; img[ii * 3 + 2] = bb;
  }
}
function quad(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3, color: string) {
  tri(a, b, c, color); tri(a, c, d, color);
}

const d0 = engine.distance;
// aspal
for (let s = d0 - 6; s < d0 + 42; s += 1) {
  const p1 = new THREE.Vector3(), p2 = new THREE.Vector3(), p3 = new THREE.Vector3(), p4 = new THREE.Vector3();
  track.frame(s, -4.2, -0.01, p1); track.frame(s + 1, -4.2, -0.01, p2); track.frame(s + 1, 4.2, -0.01, p3); track.frame(s, 4.2, -0.01, p4);
  quad(p1, p2, p3, p4, "#454b58");
  // garis putus tengah + tepi
  if (Math.floor(s / 3) % 2 === 0) for (const lat of [-1.3, 1.3]) {
    const q1 = new THREE.Vector3(), q2 = new THREE.Vector3(), q3 = new THREE.Vector3(), q4 = new THREE.Vector3();
    track.frame(s, lat, 0.005, q1); track.frame(s + 1.6, lat, 0.005, q2); track.frame(s + 1.6, lat + 0.15, 0.005, q3); track.frame(s, lat + 0.15, 0.005, q4);
    quad(q1, q2, q3, q4, "#e8e2cc");
  }
  // zebra crosswalk di s = d0+12 .. +16 (batang melintang)
  if (s >= d0 + 12 && s <= d0 + 16) for (let lat = -3.6; lat < 3.6; lat += 0.85) {
    const q1 = new THREE.Vector3(), q2 = new THREE.Vector3(), q3 = new THREE.Vector3(), q4 = new THREE.Vector3();
    track.frame(s, lat, 0.005, q1); track.frame(s + 0.6, lat, 0.005, q2); track.frame(s + 0.6, lat + 0.5, 0.005, q3); track.frame(s, lat + 0.5, 0.005, q4);
    quad(q1, q2, q3, q4, "#d8d2c0");
  }
}

// MOTOR rel 7.3 lat 0 (classic variant 5 = oranye)
const ms = d0 + 7.3;
const gQ = new THREE.Quaternion(); track.quat(ms, gQ);
const gPos = new THREE.Vector3(); track.frame(ms, 0, 0, gPos);
const M = new THREE.Matrix4().compose(gPos, gQ, new THREE.Vector3(1, 1, 1));
M.multiply(new THREE.Matrix4().makeRotationY(Math.PI));
console.log("g:", track.sample(ms).g.toFixed(3), "th:", track.sample(ms).th.toFixed(3));

const FACES = [
  [[1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, -1]],
  [[-1, 1, 1], [-1, -1, 1], [-1, -1, -1], [-1, 1, -1]],
  [[1, 1, 1], [-1, 1, 1], [-1, 1, -1], [1, 1, -1]],
  [[1, -1, 1], [-1, -1, 1], [-1, -1, -1], [1, -1, -1]],
  [[1, 1, 1], [-1, 1, 1], [-1, -1, 1], [1, -1, 1]],
  [[1, 1, -1], [-1, 1, -1], [-1, -1, -1], [1, -1, -1]],
];
let partsRaw = [...(motorcycleParts(5) as any[])];
// MODE "OLD": kembalikan bungkuk lama (dada/bahu/leher/helm geser maju, tas mundur dikit, lengan lama)
if (process.env.OLD_MODEL === "1") {
  for (const pt of partsRaw) {
    const y = pt.y + 0.04;
    if (pt.d > 0.4 && y > 0.9 && y < 1.4 && pt.x <= -0.18 && pt.x >= -0.31 && pt.h <= 0.36) pt.x += Math.abs(y - 0.85) * 0.42; // dada/bahu/strip/kerah
    if (pt.color === "#e0b48f") pt.x = -0.12;
    if (y > 1.35 && y < 1.66 && pt.x < -0.2) pt.x += 0.18; // helm cluster
    if (y > 1.35 && y < 1.6 && pt.x >= -0.2 && pt.x <= 0.1) pt.x += 0.18; // kaca/bibir/dagu
    if (pt.rz === -0.63) { pt.z = pt.z > 0 ? 0.21 : -0.21; pt.x = 0.0; pt.y = 1.2 - 0.04; pt.rz = -0.36; pt.w = 0.38; }
    if (pt.rz === -0.33) { pt.z = pt.z > 0 ? 0.26 : -0.26; pt.x = 0.33; pt.y = 1.0 - 0.04; pt.rz = -0.58; pt.w = 0.42; }
    if (y > 1.0 && y < 1.2 && pt.x < -0.45) pt.x += 0.06; // tas
  }
}
const parts = partsRaw;
for (const pt of parts) {
  const rz = pt.rz ?? 0, cos = Math.cos(rz), sin = Math.sin(rz);
  const L = (f: number[]) => {
    const lx = (f[0] * pt.w) / 2, ly = (f[1] * pt.h) / 2, lz = (f[2] * pt.d) / 2;
    return new THREE.Vector3(pt.x + lx * cos - ly * sin, pt.y + lx * sin + ly * cos, pt.z + lz).applyMatrix4(M);
  };
  for (const f of FACES) quad(L(f[0]), L(f[1]), L(f[2]), L(f[3]), pt.color);
}

// tulis PNG
function crc32(buf: Buffer) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) { c ^= buf[i]; for (let j = 0; j < 8; j++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1)); }
  return ~c >>> 0;
}
function chunk(type: string, data: Buffer) {
  const t = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(t));
  return Buffer.concat([len, t, crc]);
}
const zlib = require("zlib");
const raw = Buffer.alloc(H * (1 + W * 3));
for (let y = 0; y < H; y++) {
  raw[y * (1 + W * 3)] = 0;
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3;
    raw[y * (1 + W * 3) + 1 + x * 3] = Math.round(Math.min(1, img[i]) * 255);
    raw[y * (1 + W * 3) + 2 + x * 3] = Math.round(Math.min(1, img[i + 1]) * 255);
    raw[y * (1 + W * 3) + 3 + x * 3] = Math.round(Math.min(1, img[i + 2]) * 255);
  }
}
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk("IHDR", ihdr),
  chunk("IDAT", zlib.deflateSync(raw, { level: 6 })),
  chunk("IEND", Buffer.alloc(0)),
]);
writeFileSync("/home/user/PIGEONN-NEW/test/moto-render.png", png);
console.log("saved test/moto-render.png");
