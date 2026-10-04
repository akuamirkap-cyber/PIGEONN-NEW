/* Close-up PNG render model motor klasik dari 4 sudut: side, back-high (seperti game), front-high, top. */
import * as THREE from "three";
import { writeFileSync } from "fs";
import { motorcycleParts } from "../src/game/models";

const parts = motorcycleParts(5) as any[];
const W = 300, H = 300;

function render(camPos: THREE.Vector3, lookAt: THREE.Vector3, file: string, label: string) {
  const cam = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  cam.position.copy(camPos);
  cam.up.set(0, 1, 0);
  cam.lookAt(lookAt);
  cam.updateMatrixWorld();
  const img = new Float32Array(W * H * 3).fill(0);
  const zbuf = new Float32Array(W * H).fill(Infinity);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3;
    img[i] = 0.93; img[i + 1] = 0.95; img[i + 2] = 0.98;
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
    const bri = 0.62 + 0.42 * Math.abs(n.dot(nl));
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
  // tanah
  quad(new THREE.Vector3(-3, 0.02, -1.2), new THREE.Vector3(3, 0.02, -1.2), new THREE.Vector3(3, 0.02, 1.2), new THREE.Vector3(-3, 0.02, 1.2), "#6b7280");
  const FACES = [
    [[1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, -1]],
    [[-1, 1, 1], [-1, -1, 1], [-1, -1, -1], [-1, 1, -1]],
    [[1, 1, 1], [-1, 1, 1], [-1, 1, -1], [1, 1, -1]],
    [[1, -1, 1], [-1, -1, 1], [-1, -1, -1], [1, -1, -1]],
    [[1, 1, 1], [-1, 1, 1], [-1, -1, 1], [1, -1, 1]],
    [[1, 1, -1], [-1, 1, -1], [-1, -1, -1], [1, -1, -1]],
  ];
  for (const pt of parts) {
    const rz = pt.rz ?? 0, cos = Math.cos(rz), sin = Math.sin(rz);
    const L = (f: number[]) => {
      const lx = (f[0] * pt.w) / 2, ly = (f[1] * pt.h) / 2, lz = (f[2] * pt.d) / 2;
      return new THREE.Vector3(pt.x + lx * cos - ly * sin, pt.y + lx * sin + ly * cos, pt.z + lz);
    };
    for (const f of FACES) quad(L(f[0]), L(f[1]), L(f[2]), L(f[3]), pt.color);
  }
  // PNG out
  const zlib = require("zlib");
  function crc32(buf: Buffer) { let c = -1; for (let i = 0; i < buf.length; i++) { c ^= buf[i]; for (let j = 0; j < 8; j++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1)); } return ~c >>> 0; }
  function chunk(type: string, data: Buffer) { const t = Buffer.concat([Buffer.from(type, "ascii"), data]); const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(t)); return Buffer.concat([len, t, crc]); }
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) { raw[y * (1 + W * 3)] = 0; for (let x = 0; x < W; x++) { const i = (y * W + x) * 3; raw[y * (1 + W * 3) + 1 + x * 3] = Math.round(Math.min(1, img[i]) * 255); raw[y * (1 + W * 3) + 2 + x * 3] = Math.round(Math.min(1, img[i + 1]) * 255); raw[y * (1 + W * 3) + 3 + x * 3] = Math.round(Math.min(1, img[i + 2]) * 255); } }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
  writeFileSync(file, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]));
  console.log(`${label} -> ${file}`);
}

// depan motor = +x
render(new THREE.Vector3(0.1, 1.1, 5.2), new THREE.Vector3(0, 0.8, 0), "test/moto-side.png", "SIDE (z+)");
render(new THREE.Vector3(-3.6, 2.6, 2.6), new THREE.Vector3(0, 0.75, 0), "test/moto-back34.png", "BACK-3/4 HIGH (seperti game)");
render(new THREE.Vector3(3.8, 2.4, 2.4), new THREE.Vector3(0, 0.75, 0), "test/moto-front34.png", "FRONT-3/4 HIGH");
render(new THREE.Vector3(-5.2, 1.6, 0.2), new THREE.Vector3(0, 0.8, 0), "test/moto-back.png", "BACK (x-)");
