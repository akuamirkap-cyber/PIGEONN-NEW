import { Builder, P } from './builder';
import type { AssetId, Vec3 } from './types';

export function base(b: Builder, id: AssetId, width = 14, depth = 13, garden = false) {
  const previous = b.part;
  b.part = 'setting';
  b.box([-width / 2, 0, -depth / 2], [width, 0.45, depth], garden ? '#7f9860' : '#7c847c');
  b.box([-width / 2, 0.45, -depth / 2], [width, 0.24, depth], garden ? '#9cc75d' : '#56676c');
  b.box([-width / 2, -0.045, -depth / 2], [width, 0.055, depth], '#465948');
  for (let i = 0; i < Math.floor(width / 0.26); i++) {
    b.box([-width / 2 + i * 0.26 + 0.04, 0.15 + (i % 3) * 0.055, depth / 2 + 0.004],
      [0.16, 0.052, 0.008], garden ? '#b4c584' : '#a2ab97');
  }
  if (garden) {
    for (const z of [-depth / 2, depth / 2 - 0.15]) b.box([-width / 2, 0.69, z], [width, 0.08, 0.15], '#d2d5bc');
    for (const x of [-width / 2, width / 2 - 0.15]) b.box([x, 0.69, -depth / 2], [0.15, 0.08, depth], '#d2d5bc');
  } else {
    paving(b, -width / 2 + 0.23, -depth / 2 + 0.2, width - 2.1, depth - 2.5);
    b.box([-width / 2 + 0.15, 0.71, depth / 2 - 2.35], [width - 2.02, 0.045, 0.13], '#edcb57');
    b.box([-width / 2 + 0.12, 0.71, depth / 2 - 2.1], [width - 1.9, 0.05, 0.13], '#e5e4d2');
    for (let i = 0; i < Math.floor(width / 1.4); i++) {
      b.box([-width / 2 + 0.6 + i * 1.4, 0.696, depth / 2 - 0.85], [0.73, 0.013, 0.07], '#f2eedf');
    }
    for (let i = 0; i < 5; i++) {
      b.box([width / 2 - 4.5 + i * 0.39, 0.698, depth / 2 - 1.8], [0.21, 0.015, 1.45], '#eeeede');
    }
  }
  b.panel(`plaque-${id}`, [0, 0.23, depth / 2 + 0.014], [2.5, 0.26]);
  b.part = previous;
}

export function paving(b: Builder, x: number, z: number, width: number, depth: number, y = 0.69) {
  b.box([x, y, z], [width, 0.02, depth], '#85968d');
  const cols = Math.ceil(width / 0.91), rows = Math.ceil(depth / 0.91);
  const sx = width / cols, sz = depth / rows;
  for (let ix = 0; ix < cols; ix++) {
    for (let iz = 0; iz < rows; iz++) {
      b.box([x + ix * sx + 0.012, y + 0.02, z + iz * sz + 0.012], [sx - 0.024, 0.02, sz - 0.024],
        (ix + iz) % 4 === 0 ? '#c5cdbf' : '#d6dbce');
    }
  }
}

export function bush(b: Builder, x: number, z: number, size = 0.65, y = 0.73) {
  b.box([x - size / 2, y, z - size / 2], [size, size * 0.63, size], '#42792e');
  b.box([x - size * 0.4, y + size * 0.63, z - size * 0.4], [size * 0.8, size * 0.2, size * 0.8], '#7ea940');
  b.box([x - size * 0.52, y + size * 0.18, z], [size * 0.22, size * 0.36, size * 0.4], '#5c9734');
}

export function cherryTree(b: Builder, x: number, z: number, scale = 1, y = 0.73, seed = 0) {
  const cube = (p: Vec3, s: Vec3, color: string) => b.box(
    [x + p[0] * scale, y + p[1] * scale, z + p[2] * scale],
    [s[0] * scale, s[1] * scale, s[2] * scale], color,
  );
  const wood = '#51352b';
  cube([-0.22, 0, -0.21], [0.44, 3.5, 0.42], wood);
  cube([-0.13, 0.25, 0.214], [0.1, 2.86, 0.018], '#76503b');
  for (const [dx, dz] of [[-0.34, 0], [0.13, -0.3], [0, 0.15]]) cube([dx, 0, dz], [0.32, 0.26, 0.32], '#654432');
  for (const side of [-1, 1]) {
    b.line([x, y + 2.36 * scale, z], [x + side * 1.2 * scale, y + 3.61 * scale, z + side * 0.35 * scale], 0.22 * scale, wood);
    b.line([x, y + 2.75 * scale, z], [x + side * 0.35 * scale, y + 3.6 * scale, z - side * 1.1 * scale], 0.19 * scale, wood);
  }
  const pinks = ['#d792ac', '#eab0be', '#f3c2c9', '#f8d8d4', '#dfa0b3'];
  cube([-1.25, 3.35, -1.22], [2.5, 0.78, 2.44], pinks[1]);
  cube([-0.92, 4.13, -0.9], [1.84, 0.45, 1.8], pinks[2]);
  cube([-0.61, 4.58, -0.55], [1.22, 0.28, 1.1], pinks[3]);
  const clusters: Vec3[] = [
    [-1.83, 3.1, -0.61], [1.08, 3.24, -0.51], [-0.48, 3.08, 1.02],
    [-0.61, 3.42, -1.76], [-1.18, 3.48, 0.82], [0.85, 3.52, 0.75],
    [-1.44, 3.94, -0.83], [0.71, 3.99, -0.71], [-0.83, 4.02, 0.6],
  ];
  clusters.forEach((p, i) => {
    cube(p, [0.83, 0.57 + (i % 2) * 0.2, 0.83], pinks[((i + seed) % 5 + 5) % 5]);
    if (i % 2 === 0) cube([p[0] - 0.14, p[1] - 0.33, p[2] + 0.17], [0.46, 0.38, 0.46], pinks[((i + seed + 1) % 5 + 5) % 5]);
  });
  for (let i = 0; i < 12; i++) {
    const dx = ((i * 7 + seed) % 17 - 8) * 0.21;
    const dz = ((i * 5 + seed) % 15 - 7) * 0.24;
    cube([dx, 0.007, dz], [0.11, 0.018, 0.09], pinks[2 + i % 2]);
  }
}

export function greenTree(b: Builder, x: number, z: number, scale = 1, y = 0.73) {
  b.box([x - 0.13 * scale, y, z - 0.13 * scale], [0.26 * scale, 2.55 * scale, 0.26 * scale], P.woodDark);
  b.box([x - 0.63 * scale, y + 1.75 * scale, z - 0.58 * scale], [1.26 * scale, 1.34 * scale, 1.16 * scale], '#34843d');
  b.box([x - 0.44 * scale, y + 3.09 * scale, z - 0.4 * scale], [0.88 * scale, 0.32 * scale, 0.8 * scale], '#7eb74c');
  b.box([x - 0.85 * scale, y + 2.14 * scale, z - 0.35 * scale], [0.38 * scale, 0.66 * scale, 0.7 * scale], '#4d9c3e');
  b.box([x + 0.53 * scale, y + 2.0 * scale, z - 0.31 * scale], [0.31 * scale, 0.75 * scale, 0.65 * scale], '#559e37');
}

export function stoneLantern(b: Builder, x: number, z: number, scale = 1) {
  const y = 0.73;
  b.box([x - 0.29 * scale, y, z - 0.29 * scale], [0.58 * scale, 0.13 * scale, 0.58 * scale], '#959f92');
  b.box([x - 0.19 * scale, y + 0.13 * scale, z - 0.19 * scale], [0.38 * scale, 0.13 * scale, 0.38 * scale], '#b3bbab');
  b.box([x - 0.12 * scale, y + 0.26 * scale, z - 0.12 * scale], [0.24 * scale, 0.75 * scale, 0.24 * scale], '#9aa694');
  b.box([x - 0.25 * scale, y + 1.01 * scale, z - 0.25 * scale], [0.5 * scale, 0.37 * scale, 0.5 * scale], '#b5beab');
  b.box([x - 0.16 * scale, y + 1.11 * scale, z + 0.252 * scale], [0.32 * scale, 0.17 * scale, 0.012 * scale], '#f9d58f', { glow: 0.35 });
  b.box([x + 0.252 * scale, y + 1.11 * scale, z - 0.16 * scale], [0.012 * scale, 0.17 * scale, 0.32 * scale], '#f9d58f', { glow: 0.35 });
  for (let i = 0; i < 3; i++) {
    const width = (0.7 - i * 0.18) * scale;
    b.box([x - width / 2, y + (1.38 + i * 0.12) * scale, z - width / 2], [width, 0.12 * scale, width], '#9aa694');
  }
}

export function toriiGate(b: Builder, x: number, z: number, scale = 1) {
  const y = 0.73;
  for (const side of [-1, 1]) {
    b.box([x + side * 1.18 * scale - 0.13 * scale, y, z - 0.15 * scale], [0.26 * scale, 3.05 * scale, 0.3 * scale], '#e34b2a');
    b.box([x + side * 1.18 * scale - 0.18 * scale, y, z - 0.2 * scale], [0.36 * scale, 0.23 * scale, 0.4 * scale], '#333b2c');
  }
  b.box([x - 1.68 * scale, y + 2.43 * scale, z - 0.17 * scale], [3.36 * scale, 0.23 * scale, 0.34 * scale], '#f07137');
  b.box([x - 1.98 * scale, y + 3.01 * scale, z - 0.2 * scale], [3.96 * scale, 0.18 * scale, 0.4 * scale], '#ef5c2d');
  b.box([x - 2.15 * scale, y + 3.2 * scale, z - 0.23 * scale], [4.3 * scale, 0.16 * scale, 0.46 * scale], '#384034');
  for (const side of [-1, 1]) b.box([x + side * 2.01 * scale - 0.09 * scale, y + 3.36 * scale, z - 0.23 * scale], [0.18 * scale, 0.1 * scale, 0.46 * scale], '#384034');
  b.box([x - 0.17 * scale, y + 2.56 * scale, z + 0.18 * scale], [0.34 * scale, 0.45 * scale, 0.06 * scale], '#deb560');
}

export function balcony(b: Builder, x: number, z: number, half: number, y: number, entrance = false) {
  const red = '#db4d2a';
  b.box([x - half - 0.12, y, z - half - 0.12], [half * 2 + 0.24, 0.12, half * 2 + 0.24], '#9a5c34');
  for (const railY of [y + 0.36, y + 0.82]) {
    b.box([x - half, railY, z - half], [half * 2, 0.1, 0.1], red);
    for (const side of [-1, 1]) b.box([x + side * half - 0.05, railY, z - half], [0.1, 0.1, half * 2], red);
    if (entrance) {
      b.box([x - half, railY, z + half - 0.1], [half - 0.7, 0.1, 0.1], red);
      b.box([x + 0.7, railY, z + half - 0.1], [half - 0.7, 0.1, 0.1], red);
    } else b.box([x - half, railY, z + half - 0.1], [half * 2, 0.1, 0.1], red);
  }
  const count = Math.ceil(half * 2 / 0.65);
  for (let i = 0; i <= count; i++) {
    const t = -half + i * half * 2 / count;
    for (const side of [-1, 1]) {
      if (!(entrance && side === 1 && Math.abs(t) < 0.68)) {
        b.box([x + t - 0.055, y + 0.12, z + side * half - 0.055], [0.11, 0.81, 0.11], red);
        b.box([x + t - 0.065, y + 0.93, z + side * half - 0.065], [0.13, 0.07, 0.13], '#be9347');
      }
      b.box([x + side * half - 0.055, y + 0.12, z + t - 0.055], [0.11, 0.81, 0.11], red);
    }
  }
}

export function pagodaRoof(b: Builder, x: number, z: number, half: number, y: number) {
  b.box([x - half + 0.13, y - 0.12, z - half + 0.13], [half * 2 - 0.26, 0.15, half * 2 - 0.26], '#d8542d');
  for (let layer = 0; layer < 9; layer++) {
    const h = half - layer * half * 0.083;
    b.box([x - h, y + layer * 0.138, z - h], [h * 2, 0.12, h * 2], layer % 3 === 0 ? '#475047' : '#35403b');
    if (layer < 6) {
      for (let tile = 0; tile < Math.ceil(h * 2 / 0.38); tile++) {
        b.box([x - h + tile * 0.38, y + layer * 0.138 + 0.121, z + h - 0.1], [0.045, 0.02, 0.11], '#667064');
        b.box([x + h - 0.1, y + layer * 0.138 + 0.121, z - h + tile * 0.38], [0.11, 0.02, 0.045], '#667064');
      }
    }
  }
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      for (let step = 0; step < 5; step++) {
        const p = half - 0.58 + step * 0.16;
        b.box([x + sx * p - 0.1, y + 0.06 + step * step * 0.019, z + sz * p - 0.1], [0.2, 0.18, 0.2], '#293a32');
      }
      b.box([x + sx * (half + 0.06) - 0.11, y + 0.37, z + sz * (half + 0.06) - 0.11], [0.22, 0.25, 0.22], '#293a32');
    }
  }
}

export function windowGrid(b: Builder, x: number, y: number, z: number, width: number, height: number,
  cols: number, rows: number, side = false, seed = 0, reverse = false) {
  const direction = reverse ? -1 : 1;
  const sx = width / cols, sy = height / rows;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const a = x + col * sx + sx * 0.12;
      const yy = y + row * sy + sy * 0.14;
      const w = sx * 0.7, h = sy * 0.68;
      const lit = (row * 7 + col * 3 + seed) % 13 === 0;
      const color = lit ? '#e8d4a1' : ['#69c1d5', '#a8dae1', '#4fa7c7'][(row + col + seed) % 3];
      if (side) {
        b.box([z, yy, a], [0.042, h, w], '#203e52');
        b.box([z + direction * 0.045, yy + 0.055, a + 0.055], [0.016, h - 0.11, w - 0.11], color, { glow: lit ? 0.4 : 0.06 });
        b.box([z + direction * 0.063, yy + 0.07, a + 0.066], [0.007, h - 0.14, 0.065], '#c1e8e5');
      } else {
        b.box([a, yy, z], [w, h, 0.042], '#203e52');
        b.box([a + 0.055, yy + 0.055, z + direction * 0.045], [w - 0.11, h - 0.11, 0.016], color, { glow: lit ? 0.4 : 0.06 });
        b.box([a + 0.065, yy + 0.07, z + direction * 0.063], [0.065, h - 0.14, 0.007], '#c1e8e5');
      }
    }
  }
}

export function officeBlock(b: Builder, x: number, z: number, width: number, depth: number, height: number,
  floors: number, color = '#94a7b0', y = 0.73) {
  b.box([x, y, z], [width, height, depth], color);
  const cols = Math.max(3, Math.round(width / 0.75));
  const sideCols = Math.max(3, Math.round(depth / 0.75));
  windowGrid(b, x + 0.08, y + 0.25, z + depth + 0.008, width - 0.16, height - 0.52, cols, floors);
  windowGrid(b, z + 0.08, y + 0.25, x + width + 0.008, depth - 0.16, height - 0.52, sideCols, floors, true, 5);
  windowGrid(b, x + 0.08, y + 0.25, z - 0.075, width - 0.16, height - 0.52, cols, floors, false, 7, true);
  windowGrid(b, z + 0.08, y + 0.25, x - 0.075, depth - 0.16, height - 0.52, sideCols, floors, true, 3, true);
  for (let row = 1; row < floors; row++) {
    const yy = y + row * height / floors;
    b.box([x - 0.035, yy, z + depth], [width + 0.07, 0.045, 0.07], '#bfd0ce');
    b.box([x + width, yy, z - 0.035], [0.07, 0.045, depth + 0.07], '#bfd0ce');
  }
  b.box([x - 0.1, y + height, z - 0.1], [width + 0.2, 0.18, depth + 0.2], '#3b5362');
  b.box([x + 0.25, y + height + 0.18, z + 0.25], [width - 0.5, 0.09, depth - 0.5], '#adb9b5');
}

export function airConditioner(b: Builder, x: number, y: number, z: number, scale = 1) {
  b.box([x, y, z], [1.15 * scale, 0.53 * scale, 0.85 * scale], '#b5c1b8');
  b.box([x - 0.03 * scale, y + 0.53 * scale, z - 0.03 * scale], [1.21 * scale, 0.045 * scale, 0.91 * scale], '#dde0cd');
  for (let i = 0; i < 6; i++) {
    b.box([x + 0.07 * scale, y + (0.08 + i * 0.065) * scale, z + 0.853 * scale], [0.97 * scale, 0.023 * scale, 0.014 * scale], '#81958b');
    b.box([x + (0.08 + i * 0.17) * scale, y + 0.58 * scale, z + 0.12 * scale], [0.06 * scale, 0.01 * scale, 0.62 * scale], '#6d837b');
  }
}

export function taxi(b: Builder, x: number, z: number, color = '#eac34c', rotate = false, y = 0.73) {
  const cube = (p: Vec3, s: Vec3, c: string, glow = 0) => {
    const position: Vec3 = rotate ? [x + p[2], p[1] + y - 0.73, z + p[0]] : [x + p[0], p[1] + y - 0.73, z + p[2]];
    const size: Vec3 = rotate ? [s[2], s[1], s[0]] : s;
    b.box(position, size, c, { glow });
  };
  cube([0, 0.86, 0], [1.72, 0.43, 0.81], color);
  cube([0.4, 1.29, 0.08], [0.9, 0.37, 0.65], '#dbe9dc');
  cube([0.46, 1.34, 0.073], [0.72, 0.26, 0.015], '#5899ad');
  cube([0.46, 1.34, 0.735], [0.72, 0.26, 0.015], '#76b5c0');
  cube([0.38, 1.66, 0.05], [0.95, 0.06, 0.71], color);
  cube([0.77, 1.72, 0.29], [0.28, 0.13, 0.22], '#fff3ce', 0.2);
  for (const xx of [0.23, 1.25]) {
    for (const zz of [-0.05, 0.74]) {
      cube([xx, 0.73, zz], [0.29, 0.29, 0.13], '#273b3b');
      cube([xx + 0.075, 0.8, zz + 0.006], [0.14, 0.14, 0.13], '#8ba4a3');
    }
  }
  for (const zz of [0.12, 0.54]) cube([1.723, 1.01, zz], [0.018, 0.1, 0.15], '#fff4ca', 0.3);
  cube([1.7, 0.9, 0.12], [0.056, 0.09, 0.58], '#c1cbbd');
}

export function pedestrian(b: Builder, x: number, z: number, color = '#b25541', y = 0.73) {
  b.box([x, y, z], [0.12, 0.41, 0.15], '#334753');
  b.box([x + 0.17, y, z], [0.12, 0.41, 0.15], '#334753');
  b.box([x - 0.012, y - 0.015, z + 0.008], [0.15, 0.065, 0.21], '#303a32');
  b.box([x + 0.166, y - 0.015, z + 0.008], [0.15, 0.065, 0.21], '#303a32');
  b.box([x - 0.022, y + 0.41, z - 0.028], [0.34, 0.37, 0.23], color);
  b.box([x + 0.02, y + 0.78, z - 0.02], [0.25, 0.25, 0.23], '#e9c79f');
  b.box([x + 0.005, y + 0.96, z - 0.04], [0.28, 0.1, 0.25], '#443e31');
  b.box([x + 0.064, y + 0.85, z + 0.214], [0.029, 0.026, 0.009], '#443e31');
  b.box([x + 0.202, y + 0.85, z + 0.214], [0.029, 0.026, 0.009], '#443e31');
  b.box([x - 0.1, y + 0.49, z - 0.02], [0.08, 0.26, 0.16], color);
  b.box([x + 0.32, y + 0.43, z - 0.015], [0.085, 0.31, 0.16], color);
}

export function yamanote(b: Builder, x: number, y: number, z: number, length = 12) {
  b.box([x, y, z], [length, 0.84, 1.23], '#d6ded3');
  b.box([x, y + 0.24, z - 0.008], [length, 0.19, 1.249], '#63a535');
  b.box([x - 0.03, y + 0.84, z - 0.04], [length + 0.06, 0.09, 1.31], '#71898e');
  const cars = Math.ceil(length / 2.6);
  for (let i = 0; i < cars; i++) {
    const xx = x + i * length / cars;
    for (let win = 0; win < 3; win++) {
      b.box([xx + 0.2 + win * 0.65, y + 0.44, z + 1.24], [0.46, 0.3, 0.016], '#468f9f');
      b.box([xx + 0.26 + win * 0.65, y + 0.47, z + 1.258], [0.057, 0.24, 0.008], '#bde0d7');
    }
    b.box([xx + 0.82, y + 0.93, z + 0.3], [0.72, 0.12, 0.54], '#b1bfb9');
    if (i > 0) b.box([xx - 0.05, y, z], [0.08, 0.82, 1.23], '#3f575f');
    for (const wheel of [0.45, 1.8]) b.box([xx + wheel, y - 0.12, z + 0.13], [0.24, 0.18, 1.01], '#2a3b3f');
  }
}