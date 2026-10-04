/* PNG: gedung kota baru (lantai lebih tinggi & lebih banyak) + pohon-pohon yang DIBESARIN. */
import * as THREE from "three";
import { writeFileSync } from "fs";
import { buildingParts, treeParts, makeBuildingSpec } from "../src/game/models";

const W = 460, H = 300;
const peds: { parts: any[]; cx: number; cz: number }[] = [];
peds.push({ parts: buildingParts({ w: 10, floors: 5, color: "#c9a884", roof: "#5d6570", awning: true, awningColor: "#10c8a8", lit: 0.4, cols: 5 }), cx: -1.5, cz: -4.5 });
peds.push({ parts: treeParts(0), cx: -8.2, cz: 0.3 });
peds.push({ parts: treeParts(1), cx: -5.4, cz: 0.0 });
peds.push({ parts: treeParts(2), cx: 5.6, cz: 0.2 });

const cam = new THREE.PerspectiveCamera(32, W / H, 0.1, 200);
cam.position.set(10.5, 7.0, 23.0);
cam.up.set(0, 1, 0);
cam.lookAt(-1.4, 5.2, -3.0);
cam.updateMatrixWorld();

const img = new Float32Array(W * H * 3).fill(0);
const zbuf = new Float32Array(W * H).fill(Infinity);
for (let y = 0; y < H; y++) {
  const t = y / H;
  const r = t < 0.55 ? 0.62 + 0.3 * t : 0.78, g = t < 0.55 ? 0.74 + 0.22 * t : 0.8, b = t < 0.55 ? 0.94 : 0.82;
  for (let x = 0; x < W; x++) { const i = (y * W + x) * 3; img[i] = Math.min(1, r); img[i + 1] = Math.min(1, g); img[i + 2] = Math.min(1, b); }
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
  const bri = 0.66 + 0.38 * Math.abs(n.dot(nl));
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
// tanah
quad(new THREE.Vector3(-11, 0, 2.4), new THREE.Vector3(9, 0, 2.4), new THREE.Vector3(9, 0, -9), new THREE.Vector3(-11, 0, -9), "#8b97a3");
for (const { parts, cx, cz } of peds) {
  for (const pt of parts as any[]) {
    const hw = pt.w / 2, hh = pt.h / 2, hd = pt.d / 2;
    for (const f of FACES) {
      const v = f.map(((mn: number[]) => new THREE.Vector3(pt.x + cx + mn[0] * hw, pt.y + mn[1] * hh, pt.z + cz + mn[2] * hd)) as any);
      quad(v[0], v[1], v[2], v[3], pt.color);
    }
  }
}
function chunk(type: string, data: Buffer) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const buf = Buffer.concat([Buffer.from(type), data]);
  const crcTable: number[] = [];
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcTable[n] = c >>> 0; }
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
writeFileSync("test/big-world.png", Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]));
console.log("saved test/big-world.png");
