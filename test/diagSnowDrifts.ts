/* PNG render: jajaran pedestrian MODE SALJU (jaket tebal + kupluk + boot) vs satu normal. */
import * as THREE from "three";
import { writeFileSync } from "fs";
import { snowDriftParts } from "../src/game/models";

const W = 460, H = 300;

const LINEUP = [0, 1, 2, 3];
const SPACING = 3.1;
const peds = LINEUP.map((v, i) => ({
  parts: snowDriftParts(v) as any[],
  cx: (i - (LINEUP.length - 1) / 2) * SPACING,
}));
// alas jalan + trotoar supaya konteks "di sekitar jalan" terbaca
const GROUND = [
  { x: 0, y: -0.03, z: 0, w: 16, h: 0.06, d: 3.2, color: "#454a55" }, // aspal
  { x: 0, y: 0.01, z: 1.9, w: 16, h: 0.16, d: 0.9, color: "#9aa2ae" }, // trotoar
  { x: 0, y: 0.09, z: 1.46, w: 16, h: 0.18, d: 0.12, color: "#7e8794" }, // kansteen
];
for (const g of GROUND) peds.unshift({ parts: [g as any], cx: 0 });

const cam = new THREE.PerspectiveCamera(30, W / H, 0.1, 100);
cam.position.set(6.8, 3.0, 8.2);
cam.up.set(0, 1, 0);
cam.lookAt(0, 0.05, 1.0);
cam.updateMatrixWorld();

const img = new Float32Array(W * H * 3).fill(0);
const zbuf = new Float32Array(W * H).fill(Infinity);
// latar salju: langit blush -> lantai putih
for (let y = 0; y < H; y++) {
  const t = y / H;
  const r = t < 0.62 ? 0.72 + 0.2 * (t / 0.62) : 0.95, g = t < 0.62 ? 0.82 + 0.12 * (t / 0.62) : 0.96, b = t < 0.62 ? 0.96 : 0.99;
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3;
    img[i] = r; img[i + 1] = g; img[i + 2] = b;
  }
}
const C3 = new THREE.Color();
function tri(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, color: string) {
  const pa = a.clone().project(cam), pb = b.clone().project(cam), pc = c.clone().project(cam);
  if (pa.z > 1 || pb.z > 1 || pc.z > 1) return;
  const xs = [((pa.x + 1) / 2) * W, ((pb.x + 1) / 2) * W, ((pc.x + 1) / 2) * W];
  const ys = [((1 - pa.y) / 2) * H, ((1 - pb.y) / 2) * H, ((1 - pc.y) / 2) * H];
  const zs = [pa.z, pb.z, pc.z];
  const minX = Math.max(0, Math.floor(Math.min(...xs))), maxX = Math.min(W - 1, Math.ceil(Math.max(...xs)));
  const minY = Math.max(0, Math.floor(Math.min(...ys))), maxY = Math.min(H - 1, Math.ceil(Math.max(...ys)));
  const d = (xs[1] - xs[0]) * (ys[2] - ys[0]) - (xs[2] - xs[0]) * (ys[1] - ys[0]);
  if (Math.abs(d) < 1e-9) return;
  C3.set(color);
  const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a)).normalize();
  const nl = new THREE.Vector3(0.4, 0.9, 0.35).normalize();
  const bri = 0.68 + 0.36 * Math.abs(n.dot(nl));
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
const quad = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3, col: string) => { tri(a, b, c, col); tri(a, c, d, col); };
const FACES = [
  [[1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, -1]],
  [[-1, 1, 1], [-1, -1, 1], [-1, -1, -1], [-1, 1, -1]],
  [[1, 1, 1], [-1, 1, 1], [-1, 1, -1], [1, 1, -1]],
  [[1, -1, 1], [-1, -1, 1], [-1, -1, -1], [1, -1, -1]],
  [[1, 1, 1], [-1, 1, 1], [-1, -1, 1], [1, -1, 1]],
  [[1, 1, -1], [-1, 1, -1], [-1, -1, -1], [1, -1, -1]],
];
for (const { parts, cx } of peds) {
  for (const pt of parts as any[]) {
    const hw = pt.w / 2, hh = pt.h / 2, hd = pt.d / 2;
    for (const f of FACES) {
      const v = f.map(((mn: number[]) =>
        new THREE.Vector3(pt.x + cx + mn[0] * hw, pt.y + mn[1] * hh, pt.z + mn[2] * hd)) as any);
      quad(v[0], v[1], v[2], v[3], pt.color);
    }
  }
}

// PNG encode minimal
function chunk(type: string, data: Buffer) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const buf = Buffer.concat([Buffer.from(type), data]);
  const crcTable: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crcTable[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (const b of buf) crc = crcTable[(crc ^ b) & 0xff] ^ (crc >>> 8);
  const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([len, buf, crcBuf]);
}
const zlib = require("zlib");
const raw = Buffer.alloc(H * (1 + W * 3));
for (let y = 0; y < H; y++) {
  raw[y * (1 + W * 3)] = 0;
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3, o = y * (1 + W * 3) + 1 + x * 3;
    raw[o] = Math.round(Math.pow(Math.min(1, Math.max(0, img[i])), 1 / 2.2) * 255);
    raw[o + 1] = Math.round(Math.pow(Math.min(1, Math.max(0, img[i + 1])), 1 / 2.2) * 255);
    raw[o + 2] = Math.round(Math.pow(Math.min(1, Math.max(0, img[i + 2])), 1 / 2.2) * 255);
  }
}
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; ihdr[9] = 2;
writeFileSync("test/snow-drifts.png", Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]));
console.log("saved test/snow-drifts.png");
