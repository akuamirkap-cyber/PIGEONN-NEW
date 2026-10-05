/* Software-render PNG: close-up Kamen Rider (desain cute-heroic baru). */
import * as THREE from "three";
import { writeFileSync } from "fs";
import { kamenRiderHeadParts, kamenRiderTorsoParts, kamenRiderArmParts, kamenRiderLegParts } from "../src/game/models";
import type { Part } from "../src/game/voxel";

const W = 700, H = 700;
const img = new Float32Array(W * H * 3);
const zbuf = new Float32Array(W * H).fill(Infinity);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const i = (y * W + x) * 3;
  img[i] = 0.55; img[i + 1] = 0.78; img[i + 2] = 0.96;
}
const cam = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
cam.position.set(3.4, 2.2, 2.6);
cam.up.set(0, 1, 0);
cam.lookAt(0, 1.05, 0);
cam.updateMatrixWorld();
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
  const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a)).normalize();
  const nl = new THREE.Vector3(0.5, 0.85, 0.35).normalize();
  const bri = 0.6 + 0.45 * Math.abs(n.dot(nl));
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
const FACES = [
  [[1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, -1]],
  [[-1, 1, 1], [-1, -1, 1], [-1, -1, -1], [-1, 1, -1]],
  [[1, 1, 1], [-1, 1, 1], [-1, 1, -1], [1, 1, -1]],
  [[1, -1, 1], [-1, -1, 1], [-1, -1, -1], [1, -1, -1]],
  [[1, 1, -1], [-1, 1, -1], [-1, -1, -1], [1, -1, -1]],
  [[1, 1, 1], [-1, 1, 1], [-1, -1, -1], [1, 1, -1]],
];
function drawParts(parts: Part[], M: THREE.Matrix4) {
  for (const pt of parts) {
    const rot = new THREE.Matrix4()
      .makeRotationZ(pt.rz ?? 0)
      .multiply(new THREE.Matrix4().makeRotationY(pt.ry ?? 0))
      .multiply(new THREE.Matrix4().makeRotationX(pt.rx ?? 0));
    rot.setPosition(pt.x, pt.y, pt.z);
    const Local = new THREE.Matrix4().copy(M).multiply(rot);
    for (const f of FACES) {
      const vs = f.map((fv) => new THREE.Vector3((fv[0] * pt.w) / 2, (fv[1] * pt.h) / 2, (fv[2] * pt.d) / 2).applyMatrix4(Local));
      quad(vs[0], vs[1], vs[2], vs[3], pt.color);
    }
  }
}
const at = (x: number, y: number, z: number, ry = 0) => {
  const m = new THREE.Matrix4().makeRotationY(ry);
  m.setPosition(x, y, z);
  return m;
};
// lantai
for (let gx = -3; gx < 3; gx += 0.6) for (let gz = -3; gz < 3; gz += 0.6)
  quad(new THREE.Vector3(gx, 0, gz), new THREE.Vector3(gx + 0.6, 0, gz), new THREE.Vector3(gx + 0.6, 0, gz + 0.6), new THREE.Vector3(gx, 0, gz + 0.6), "#55606e");
// susun seperti AmbientWalker (seperti test renderSpecial), menghadap kamera
const S = 1.06;
const kr = (ox: number, oy: number, oz: number) =>
  at(ox * S, 1.0 + oy * S, oz * S, 0.5).multiply(new THREE.Matrix4().makeScale(S, S, S));
drawParts(kamenRiderTorsoParts(), kr(0, 0, 0));
drawParts(kamenRiderHeadParts(), kr(0, 0.34, 0));
drawParts(kamenRiderArmParts(), kr(0, 0.27, 0.34));
drawParts(kamenRiderArmParts(), kr(0, 0.27, -0.34));
drawParts(kamenRiderLegParts(), kr(0, -0.34, 0.11));
drawParts(kamenRiderLegParts(), kr(0, -0.34, -0.11));
// ---- PNG ----
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
writeFileSync("test/kamen-new.png", png);
console.log("OK test/kamen-new.png");
