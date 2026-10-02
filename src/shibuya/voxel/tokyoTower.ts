import { Builder } from './builder';
import { bush, pedestrian } from './landmarkKit';
import {
  commercialBlock, districtBase, guardrail, lane, parkTree,
  sidewalk, streetLight, transport, zebra,
} from './urbanKit';
import type { Vec3 } from './types';

const RED = '#de4b32';
const LIGHT_RED = '#ee6440';
const WHITE = '#eeeede';

function squareRing(b: Builder, y: number, half: number, thickness: number, color: string) {
  for (const side of [-1, 1]) {
    b.box([-half, y, side * half - thickness / 2], [half * 2, thickness, thickness], color);
    b.box([side * half - thickness / 2, y, -half], [thickness, thickness, half * 2], color);
  }
}

function latticeSection(b: Builder, bottom: number, top: number, halfBottom: number, halfTop: number,
  levels: number, columns: number, upper = false) {
  for (let level = 0; level < levels; level++) {
    const t0 = level / levels, t1 = (level + 1) / levels;
    const y0 = bottom + (top - bottom) * t0, y1 = bottom + (top - bottom) * t1;
    const h0 = halfBottom + (halfTop - halfBottom) * t0;
    const h1 = halfBottom + (halfTop - halfBottom) * t1;
    const color = upper && y0 >= 17.15 && y0 < 19.6 ? WHITE : RED;
    const beam = upper ? 0.13 : 0.2;
    const brace = upper ? 0.077 : 0.11;
    squareRing(b, y0, h0, upper ? 0.12 : 0.155, color);
    const bays = upper && level > levels - 4 ? 1 : columns;
    for (const side of [-1, 1]) {
      for (let axis = 0; axis < 2; axis++) {
        const point = (offset: number, y: number, half: number): Vec3 => axis === 0
          ? [offset, y, side * half] : [side * half, y, offset];
        for (let col = 0; col <= bays; col++) {
          const ratio = -1 + col * 2 / bays;
          b.line(point(ratio * h0, y0, h0), point(ratio * h1, y1, h1),
            col === 0 || col === bays ? beam : brace, color, { glow: 0.025 });
        }
        for (let col = 0; col < bays; col++) {
          const left = -1 + col * 2 / bays, right = -1 + (col + 1) * 2 / bays;
          b.line(point(left * h0, y0, h0), point(right * h1, y1, h1), brace, color);
          b.line(point(right * h0, y0, h0), point(left * h1, y1, h1), brace, color);
        }
      }
    }
  }
  squareRing(b, top, halfTop, upper ? 0.12 : 0.16, upper ? RED : LIGHT_RED);
}

function lowerLegs(b: Builder) {
  const levels = [
    { y: 0.95, half: 4.78, width: 0.78 },
    { y: 2.43, half: 4.21, width: 0.69 },
    { y: 3.93, half: 3.64, width: 0.58 },
    { y: 5.54, half: 3.05, width: 0.47 },
  ];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    b.box([sx * 4.78 - 0.57, 0.73, sz * 4.78 - 0.57], [1.14, 0.2, 1.14], '#c4c8b8');
    b.box([sx * 4.78 - 0.43, 0.93, sz * 4.78 - 0.43], [0.86, 0.08, 0.86], '#9daa9f');
    for (let level = 0; level < levels.length - 1; level++) {
      const a = levels[level], c = levels[level + 1];
      for (const dx of [-1, 1]) for (const dz of [-1, 1]) {
        b.line([sx * a.half + dx * a.width / 2, a.y, sz * a.half + dz * a.width / 2],
          [sx * c.half + dx * c.width / 2, c.y, sz * c.half + dz * c.width / 2], 0.19, RED, { glow: 0.025 });
      }
      for (let axis = 0; axis < 2; axis++) {
        for (const edge of [-1, 1]) {
          const point = (side: number, y: number, half: number, w: number): Vec3 => axis === 0
            ? [sx * half + side * w / 2, y, sz * half + edge * w / 2]
            : [sx * half + edge * w / 2, y, sz * half + side * w / 2];
          b.line(point(-1, a.y, a.half, a.width), point(1, c.y, c.half, c.width), 0.11, LIGHT_RED);
          b.line(point(1, a.y, a.half, a.width), point(-1, c.y, c.half, c.width), 0.11, RED);
          b.line(point(-1, a.y, a.half, a.width), point(1, a.y, a.half, a.width), 0.135, LIGHT_RED);
        }
      }
    }
  }
  // Four arch openings remain empty beneath the lattice, including behind Foot Town.
  const arch = [[-4.78, 0.97, 4.78], [-3.62, 2.48, 4.18], [-2.35, 3.89, 3.66],
    [-1.19, 4.77, 3.33], [0, 5.05, 3.21], [1.19, 4.77, 3.33], [2.35, 3.89, 3.66], [3.62, 2.48, 4.18], [4.78, 0.97, 4.78]];
  for (const side of [-1, 1]) for (let axis = 0; axis < 2; axis++) {
    for (let i = 0; i < arch.length - 1; i++) {
      const a = arch[i], c = arch[i + 1];
      b.line(axis === 0 ? [a[0], a[1], side * a[2]] : [side * a[2], a[1], a[0]],
        axis === 0 ? [c[0], c[1], side * c[2]] : [side * c[2], c[1], c[0]], 0.24, LIGHT_RED);
    }
  }
}

function observationDeck(b: Builder, y: number, size: number, small = false) {
  const half = size / 2;
  b.box([-half, y, -half], [size, 0.13, size], '#acb8b9');
  b.box([-half - 0.13, y + 0.13, -half - 0.13], [size + 0.26, 0.14, size + 0.26], WHITE);
  const h = small ? 0.43 : 0.83;
  b.box([-half, y + 0.27, -half], [size, h, size], '#eff0df');
  const cols = small ? 5 : 16;
  for (const side of [-1, 1]) {
    b.box([-half + 0.1, y + 0.39, side * half + (side > 0 ? 0.01 : -0.021)], [size - 0.2, h * 0.45, 0.017], '#89bdce', { glow: 0.19 });
    b.box([side * half + (side > 0 ? 0.01 : -0.021), y + 0.39, -half + 0.1], [0.017, h * 0.45, size - 0.2], '#78aabd', { glow: 0.19 });
    for (let i = 0; i <= cols; i++) {
      const offset = -half + 0.1 + i * (size - 0.2) / cols;
      b.box([offset, y + 0.38, side * half - 0.023], [0.04, h * 0.51, 0.059], '#e3e9d9');
      b.box([side * half - 0.023, y + 0.38, offset], [0.059, h * 0.51, 0.04], '#e3e9d9');
    }
  }
  b.box([-half - 0.11, y + h + 0.26, -half - 0.11], [size + 0.22, 0.09, size + 0.22], '#c9d5c9');
  b.box([-half - 0.15, y + h + 0.35, -half - 0.15], [size + 0.3, 0.14, size + 0.3], WHITE);
  if (!small) b.panel('sign-tokyo-deck', [0, y + 0.88, half + 0.032], [2.1, 0.2], { glow: 0.26 });
}

function neighborhood(b: Builder) {
  districtBase(b, 'tokyotower', 23.8, 22.5);
  sidewalk(b, -5.85, -5.77, 11.7, 11.55);
  const buildings: [number, number, number, number, number, string, string][] = [
    [-10.84, -10.47, 3.0, 2.08, 4.35, '#83b1b4', 'sign-store'],
    [-7.06, -10.47, 3.08, 2.08, 3.27, '#d9c67d', 'sign-cafe'],
    [-3.08, -10.47, 2.52, 2.08, 5.13, '#b96155', 'sign-hotel'],
    [0.44, -10.47, 2.7, 2.08, 3.89, '#b1b7ad', 'sign-store'],
    [4.11, -10.47, 2.89, 2.08, 4.82, '#c59faa', 'sign-karaoke'],
    [8.01, -10.47, 2.91, 2.08, 3.51, '#dfc96e', 'sign-cafe'],
    [-11.06, -6.03, 1.85, 3.45, 4.07, '#88a5b5', 'sign-store'],
    [-11.06, -1.5, 1.85, 3.45, 3.12, '#d3b37b', 'sign-cafe'],
    [9.24, -6.03, 1.85, 3.45, 4.96, '#92bbb6', 'sign-hotel'],
    [9.24, -1.5, 1.85, 3.45, 3.45, '#cfa189', 'sign-store'],
  ];
  buildings.forEach(([x, z, w, d, h, color, sign], i) => {
    sidewalk(b, x - 0.16, z - 0.18, w + 0.32, d + 0.52);
    commercialBlock(b, x, z, w, d, h, color, sign, i % 2 ? '#dd7951' : '#597f5b');
  });
  for (const z of [-7.2, 7.31]) lane(b, -11.38, z, 22.5);
  for (const x of [-7.55, 7.44]) lane(b, x, -10.76, 21.4, true);
  zebra(b, -4.01, 5.97, 2.21, 2.92);
  zebra(b, 3.37, 5.97, 2.21, 2.92);
  zebra(b, -8.89, -3.01, 2.55, 2.71, true);
  zebra(b, 6.03, -3.01, 2.55, 2.71, true);
  zebra(b, 0.55, -8.15, 2.21, 2.29);
  for (const [x, z] of [[-5.66, 5.59], [5.51, 5.59], [-5.66, -5.6], [5.54, -5.6]]) streetLight(b, x, z, true);
  const trees: [number, number, number][] = [
    [-5.17, -1.32, 0.84], [-5.17, 1.78, 0.79], [5.17, -1.43, 0.85], [5.17, 1.75, 0.81],
    [-5.13, -5.23, 0.63], [5.19, -5.14, 0.65], [-1.62, 5.09, 0.62], [1.65, 5.09, 0.64],
    [-10.12, 3.45, 0.88], [-10.12, 5.71, 0.81], [-10.12, 8.51, 0.79],
    [10.06, 3.43, 0.83], [10.06, 5.7, 0.87], [10.06, 8.3, 0.84],
    [-7.76, 9.7, 0.77], [7.99, 9.7, 0.74],
  ];
  trees.forEach(([x, z, s], i) => parkTree(b, x, z, s, i % 4));
  for (const [x, z] of [[-3.02, 3.52], [3.06, 3.46], [-3.22, -3.39], [3.29, -3.41]]) bush(b, x, z, 0.53);
  guardrail(b, -1.8, 5.57, 3.6);
  guardrail(b, -5.6, -1.39, 2.69, true);
  guardrail(b, 5.56, -1.37, 2.69, true);
  b.box([1.96, 1.29, 3.61], [1.67, 0.1, 0.46], '#b1b5a4');
  for (const x of [2.08, 3.36]) b.box([x, 0.74, 3.65], [0.12, 0.55, 0.36], '#728e86');
  const traffic: ['taxi' | 'car' | 'truck', number, number, string, number][] = [
    ['taxi', -6.67, 6.21, '#e7c33f', 0], ['taxi', -1.17, 6.2, '#e7c33f', 0],
    ['car', 1.78, 6.2, '#3e929d', 0], ['taxi', 6.27, 8.23, '#e7c33f', 2],
    ['truck', -5.69, 8.03, '#d36241', 2], ['car', -1.52, 8.23, '#dd7d52', 2],
    ['truck', -8.72, 0.49, '#419294', 1], ['car', -6.73, -5.27, '#4b85b5', 3],
    ['car', 6.22, 0.92, '#d6634f', 1], ['truck', 8.29, -5.89, '#4c97a5', 3],
    ['car', -5.11, -8.15, '#dd7851', 0], ['taxi', 4.2, -6.81, '#e7c33f', 2],
  ];
  traffic.forEach(([kind, x, z, color, turn]) => transport(b, kind, x, z, color, turn));
  const shirts = ['#668c52', '#3c7196', '#b37054', '#b09255', '#9079a7'];
  for (let i = 0; i < 8; i++) pedestrian(b, -2.95 + i * 0.8, 4.78, shirts[i % 5]);
  for (let i = 0; i < 5; i++) {
    pedestrian(b, -5.48, -3.92 + i * 1.42, shirts[(i + 2) % 5]);
    pedestrian(b, 5.14, -3.92 + i * 1.42, shirts[(i + 4) % 5]);
  }
  for (let i = 0; i < 6; i++) pedestrian(b, -9.8 + i * 3.63, -8.28, shirts[(i + 3) % 5]);
  b.part = 'store';
}

export function buildTokyoTower() {
  const b = new Builder();
  neighborhood(b);
  b.box([-2.7, 0.73, -2.65], [5.4, 0.16, 5.3], '#abae9c');
  b.box([-2.51, 0.89, -2.46], [5.02, 2.2, 4.92], '#6d4e41');
  b.box([-2.61, 3.09, -2.56], [5.22, 0.19, 5.12], '#c7c8bc');
  b.box([-2.45, 3.28, -2.4], [4.9, 0.05, 4.8], '#b4b9b0');
  for (const x of [-2.22, -0.67, 0.88]) {
    b.box([x, 1.39, 2.467], [1.28, 1.19, 0.023], '#8fbac6');
    b.box([x + 0.015, 2.51, 2.49], [1.24, 0.11, 0.16], '#e6e8db');
    b.box([x + 0.47, 1.29, 2.5], [0.33, 1.44, 0.16], '#efebde');
    b.box([x + 0.33, 2.72, 2.5], [0.61, 0.16, 0.21], '#efebde');
  }
  b.box([-0.58, 0.9, 2.48], [1.16, 1.64, 0.065], '#98c5ca');
  b.box([-0.022, 0.91, 2.55], [0.044, 1.62, 0.04], '#efebde');
  b.box([2.515, 1.56, -1.56], [0.024, 0.69, 3.1], '#839fa3');
  b.box([2.55, 1.64, 0.36], [0.5, 0.12, 1.68], '#f1eee0');
  b.panel('sign-foot-town', [0, 2.955, 2.489], [3.5, 0.26], { glow: 0.2 });
  lowerLegs(b);
  latticeSection(b, 5.54, 12.7, 3.05, 1.85, 6, 4);
  observationDeck(b, 12.75, 5.14);
  latticeSection(b, 14.19, 22.51, 1.71, 0.47, 9, 2, true);
  observationDeck(b, 22.53, 1.61, true);
  const spire: [number, number, number, string][] = [
    [23.45, 0.9, 0.69, RED], [24.35, 1.56, 0.45, WHITE],
    [25.91, 1.32, 0.38, LIGHT_RED], [27.23, 1.39, 0.26, WHITE],
    [28.62, 0.9, 0.23, RED], [29.52, 1.04, 0.11, LIGHT_RED],
  ];
  spire.forEach(([y, h, width, color]) => {
    b.box([-width / 2, y, -width / 2], [width, h, width], color, { glow: 0.035 });
  });
  b.box([-0.39, 23.84, -0.39], [0.78, 0.18, 0.78], '#ec6445');
  for (const side of [-1, 1]) {
    b.box([side * 0.65, 23.52, -0.017], [0.035, 0.42, 0.035], '#d6dcca');
    b.box([-0.017, 23.52, side * 0.65], [0.035, 0.42, 0.035], '#d6dcca');
  }
  b.box([-0.075, 30.56, -0.075], [0.15, 0.11, 0.15], '#f08c62', { glow: 1.4 });
  b.box([-0.22, 14.18, -0.2], [0.44, 8.29, 0.4], '#d6a27a');
  for (const x of [-1.1, 1.1]) {
    b.box([x - 0.042, 12.93, 2.736], [0.084, 0.059, 0.018], '#ffe2ab', { glow: 0.7 });
  }
  return b.finish('tokyotower');
}