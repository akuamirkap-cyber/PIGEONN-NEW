import { Builder } from './builder';
import { airConditioner, officeBlock, paving, taxi, yamanote } from './landmarkKit';
import type { AssetId, Vec3 } from './types';

export function districtBase(b: Builder, id: AssetId, width: number, depth: number) {
  b.part = 'setting';
  b.box([-width / 2, 0, -depth / 2], [width, 0.47, depth], '#858678');
  b.box([-width / 2, 0.47, -depth / 2], [width, 0.22, depth], '#475a63');
  b.box([-width / 2, -0.045, -depth / 2], [width, 0.055, depth], '#344b4b');
  for (let i = 0; i < width / 0.31; i++) {
    b.box([-width / 2 + i * 0.31 + 0.035, 0.15 + (i % 3) * 0.055, depth / 2 + 0.003],
      [0.18, 0.04, 0.008], i % 3 ? '#b0b399' : '#a0a28e');
  }
  b.panel(`plaque-${id}`, [0, 0.25, depth / 2 + 0.012], [3.7, 0.31]);
}

export function sidewalk(b: Builder, x: number, z: number, width: number, depth: number) {
  paving(b, x, z, width, depth);
  for (const zz of [z - 0.03, z + depth - 0.09]) b.box([x - 0.02, 0.7, zz], [width + 0.04, 0.065, 0.12], '#e1e2d2');
  for (const xx of [x - 0.03, x + width - 0.09]) b.box([xx, 0.7, z], [0.12, 0.065, depth], '#e1e2d2');
}

export function lane(b: Builder, x: number, z: number, length: number, vertical = false) {
  for (let i = 0; i < length / 1.45; i++) {
    const size: Vec3 = vertical ? [0.063, 0.015, 0.69] : [0.69, 0.015, 0.063];
    b.box([x + (vertical ? 0 : i * 1.45), 0.697, z + (vertical ? i * 1.45 : 0)], size, '#ecefdd');
  }
}

export function zebra(b: Builder, x: number, z: number, width = 2.5, length = 1.72, vertical = false) {
  const count = Math.floor(width / 0.37);
  for (let i = 0; i < count; i++) {
    b.box([x + (vertical ? 0 : i * 0.37), 0.699, z + (vertical ? i * 0.37 : 0)],
      vertical ? [length, 0.016, 0.2] : [0.2, 0.016, length], '#f8f5df');
  }
}

export function guardrail(b: Builder, x: number, z: number, length: number, vertical = false) {
  for (const y of [1.05, 1.38]) b.box([x, y, z], vertical ? [0.047, 0.047, length] : [length, 0.047, 0.047], '#6c8985');
  for (let i = 0; i <= Math.floor(length / 0.63); i++) {
    b.box([x + (vertical ? 0 : i * 0.63), 0.73, z + (vertical ? i * 0.63 : 0)], [0.055, 0.73, 0.055], '#79958d');
  }
}

export function streetLight(b: Builder, x: number, z: number, signal = false) {
  b.box([x - 0.15, 0.73, z - 0.15], [0.3, 0.12, 0.3], '#69857f');
  b.box([x - 0.04, 0.85, z - 0.04], [0.08, 3.16, 0.08], '#728d88');
  b.box([x - 0.04, 3.96, z - 0.04], [0.67, 0.07, 0.08], '#728d88');
  b.box([x + 0.42, 3.89, z - 0.08], [0.33, 0.11, 0.21], '#526f6c');
  b.box([x + 0.46, 3.878, z - 0.049], [0.25, 0.022, 0.15], '#f6e3b0', { glow: 0.7 });
  if (signal) {
    b.box([x - 0.35, 2.85, z - 0.1], [0.99, 0.32, 0.22], '#253e3d');
    for (let i = 0; i < 3; i++) b.box([x - 0.29 + i * 0.29, 2.917, z + 0.128], [0.19, 0.19, 0.012],
      ['#d44d39', '#e3bd49', '#74c358'][i], { glow: i === 2 ? 0.65 : 0 });
  }
}

export function billboard(b: Builder, kind: string, x: number, y: number, z: number, width: number, height: number) {
  for (const xx of [x - width * 0.38, x + width * 0.38]) b.box([xx, y - 0.64, z - 0.12], [0.12, 0.7, 0.18], '#6b8b91');
  b.box([x - width / 2 - 0.1, y, z - 0.23], [width + 0.2, height, 0.24], '#38596c');
  b.box([x - width / 2 - 0.14, y + height, z - 0.29], [width + 0.28, 0.09, 0.4], '#98b0b2');
  b.panel(kind, [x, y + height / 2, z + 0.023], [width, height - 0.1], { glow: 0.36 });
  b.line([x - width / 2, y, z - 0.3], [x + width / 2, y + height, z - 0.3], 0.064, '#6b8b91');
  b.line([x + width / 2, y, z - 0.3], [x - width / 2, y + height, z - 0.3], 0.064, '#6b8b91');
}

export function storefront(b: Builder, x: number, z: number, width: number, kind: string, awning = '#dc7053') {
  b.box([x + 0.12, 0.8, z + 0.015], [width - 0.24, 1.44, 0.04], '#8ac1cd');
  for (let i = 0; i < 4; i++) b.box([x + 0.18 + i * (width - 0.44) / 3, 0.74, z + 0.065], [0.065, 1.57, 0.07], '#e4e7d9');
  b.box([x + width * 0.37, 0.74, z + 0.095], [width * 0.26, 1.54, 0.029], '#b4dcd5');
  b.box([x - 0.04, 2.35, z - 0.01], [width + 0.08, 0.19, 0.44], awning);
  for (let i = 0; i < width / 0.29; i++) {
    b.box([x + i * 0.29, 2.35, z + 0.33], [0.105, 0.18, 0.1], '#ecd8ae');
  }
  b.box([x + 0.12, 2.61, z + 0.02], [width - 0.24, 0.49, 0.026], awning);
  b.panel(kind, [x + width / 2, 2.85, z + 0.052], [width - 0.42, 0.4], { glow: 0.25 });
}

export function commercialBlock(b: Builder, x: number, z: number, width: number, depth: number,
  height: number, color: string, sign: string, awning = '#bf6a48') {
  officeBlock(b, x, z, width, depth, height, Math.max(3, Math.floor(height / 1.18)), color);
  storefront(b, x, z + depth + 0.076, width, sign, awning);
  airConditioner(b, x + 0.42, height + 1.0, z + 0.5, 0.65);
  airConditioner(b, x + width - 1.4, height + 1.0, z + depth - 1.15, 0.61);
  b.box([x + width - 0.31, height + 1.0, z + 0.29], [0.05, 1.13, 0.05], '#839aa0');
}

export function transport(b: Builder, kind: 'taxi' | 'car' | 'bus' | 'truck', x: number, z: number,
  color = '#da694b', turn = 0) {
  if (kind === 'taxi' && turn < 2) { taxi(b, x, z, '#e7c33f', turn === 1, 0.7); return; }
  const length = kind === 'bus' ? 3.5 : kind === 'truck' ? 2.65 : 1.72;
  const width = kind === 'bus' ? 1.06 : kind === 'truck' ? 0.99 : 0.81;
  const cube = (p: Vec3, s: Vec3, c: string, glow = 0) => {
    let xx = p[0], zz = p[2], ww = s[0], dd = s[2];
    if (turn === 1) { xx = width - p[2] - s[2]; zz = p[0]; ww = s[2]; dd = s[0]; }
    if (turn === 2) { xx = length - p[0] - s[0]; zz = width - p[2] - s[2]; }
    if (turn === 3) { xx = p[2]; zz = length - p[0] - s[0]; ww = s[2]; dd = s[0]; }
    b.box([x + xx, p[1], z + zz], [ww, s[1], dd], c, { glow });
  };
  cube([0, 0.87, 0], [length, 0.38, width], color);
  if (kind === 'bus') {
    cube([0.05, 1.25, 0.03], [length - 0.1, 0.77, width - 0.06], '#dfebd9');
    for (let i = 0; i < 6; i++) {
      for (const zz of [0.024, width - 0.044]) cube([0.21 + i * 0.49, 1.49, zz], [0.35, 0.39, 0.024], '#4c889b');
    }
    cube([0, 1.29, -0.009], [length, 0.2, width + 0.018], '#4d9b48');
    cube([0.17, 2.02, 0.075], [length - 0.34, 0.075, width - 0.15], '#f1eed1');
    cube([1.35, 2.1, 0.29], [0.8, 0.08, 0.49], '#879d90');
    cube([length - 0.14, 1.58, 0.12], [0.025, 0.32, width - 0.24], '#527f8f');
  } else if (kind === 'truck') {
    cube([0.05, 1.25, 0.035], [1.7, 1.0, width - 0.07], '#f3f0df');
    cube([0.01, 2.25, 0], [1.8, 0.08, width], '#d4dfcf');
    cube([1.8, 1.25, 0.04], [0.76, 0.64, width - 0.08], color);
    for (const zz of [0.024, width - 0.044]) cube([1.95, 1.5, zz], [0.48, 0.26, 0.025], '#74afb7');
    cube([2.55, 1.51, 0.11], [0.017, 0.29, width - 0.22], '#9ac6c5');
  } else {
    cube([0.4, 1.25, 0.07], [0.93, 0.37, width - 0.14], '#acd0d0');
    cube([0.37, 1.62, 0.055], [0.99, 0.05, width - 0.11], color);
    cube([0.78, 1.3, -0.014], [0.057, 0.29, width + 0.028], color);
  }
  for (const xx of [0.23, length - 0.53]) {
    for (const zz of [-0.045, width - 0.045]) {
      cube([xx, 0.71, zz], [0.3, 0.3, 0.12], '#293d43');
      cube([xx + 0.082, 0.79, zz - 0.008], [0.136, 0.136, 0.136], '#b2c3ba');
    }
  }
  for (const zz of [0.11, width - 0.27]) cube([length + 0.003, 0.97, zz], [0.012, 0.1, 0.15], '#fff0be', 0.3);
}

export function railViaduct(b: Builder, x: number, z: number, length: number) {
  for (let i = 0; i <= length / 4.6; i++) {
    b.box([x + 0.21 + i * 4.6, 0.73, z + 0.6], [0.44, 3.8, 0.67], '#9bb2b3');
    b.box([x - 0.15 + i * 4.6, 4.12, z + 0.22], [1.16, 0.21, 1.39], '#7e9ea4');
  }
  b.box([x, 4.33, z], [length, 0.32, 1.89], '#6c8894');
  b.box([x, 4.65, z + 0.08], [length, 0.07, 1.73], '#a1997e');
  for (let i = 0; i < length / 0.37; i++) b.box([x + i * 0.37, 4.72, z + 0.17], [0.074, 0.035, 1.55], '#6c604a');
  for (const zz of [z + 0.41, z + 1.48]) b.box([x, 4.76, zz], [length, 0.05, 0.065], '#c4d5cf');
  yamanote(b, x + 0.28, 4.94, z + 0.3, length - 0.64);
  for (let i = 0; i <= length / 5.5; i++) {
    const xx = x + i * 5.5;
    for (const zz of [z - 0.07, z + 1.92]) b.box([xx, 4.66, zz], [0.071, 2.11, 0.08], '#5d7b8a');
    b.box([xx, 6.77, z - 0.1], [0.075, 0.07, 2.11], '#5d7b8a');
    b.line([xx + 0.038, 6.1, z - 0.025], [xx + 0.038, 6.72, z + 0.6], 0.034, '#72939b');
  }
  for (const zz of [z + 0.68, z + 1.08]) b.box([x, 6.79, zz], [length, 0.027, 0.027], '#334f57');
}

export function parkTree(b: Builder, x: number, z: number, scale = 1, variant = 0) {
  b.box([x - 0.35 * scale, 0.73, z - 0.35 * scale], [0.7 * scale, 0.1, 0.7 * scale], '#90b962');
  b.box([x - 0.12 * scale, 0.82, z - 0.12 * scale], [0.24 * scale, 2.2 * scale, 0.24 * scale], '#825331');
  const greens = ['#50a537', '#74bd37', '#91cf40', '#62ad32'];
  b.box([x - 0.61 * scale, 0.73 + 1.57 * scale, z - 0.56 * scale], [1.22 * scale, 1.17 * scale, 1.12 * scale], greens[variant % 4]);
  b.box([x - 0.41 * scale, 0.73 + 2.74 * scale, z - 0.38 * scale], [0.82 * scale, 0.34 * scale, 0.76 * scale], greens[(variant + 2) % 4]);
  b.box([x - 0.84 * scale, 0.73 + 1.98 * scale, z - 0.28 * scale], [0.39 * scale, 0.55 * scale, 0.66 * scale], greens[(variant + 1) % 4]);
  b.box([x + 0.48 * scale, 0.73 + 1.69 * scale, z - 0.3 * scale], [0.38 * scale, 0.65 * scale, 0.68 * scale], greens[(variant + 3) % 4]);
}