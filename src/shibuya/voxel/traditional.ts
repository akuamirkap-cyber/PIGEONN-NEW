import { Builder, P } from './builder';
import { balcony, base, bush, cherryTree, pagodaRoof, paving, stoneLantern, toriiGate } from './landmarkKit';

export function buildPagoda() {
  const b = new Builder();
  base(b, 'pagoda', 16, 15.8, true);
  b.part = 'setting';
  paving(b, -4.35, -4.05, 8.7, 8.15);
  paving(b, -1.12, 3.98, 2.24, 3.73);
  for (const [x, z, scale] of [
    [-6.1, -4.95, 0.98], [-6.1, -1.12, 1.04], [-6.1, 3.9, 0.96],
    [5.96, -4.8, 1.02], [6.06, -0.8, 1.06], [6.16, 3.55, 0.98],
    [-4.14, 6.36, 0.87], [4.05, 6.44, 0.87],
  ]) cherryTree(b, x, z, scale, 0.73, Math.round(x * 2));
  for (const [x, z] of [[-3.48, 4.15], [3.39, 4.15], [-4.82, -2.8], [4.8, -2.85], [-2.34, 6.55], [2.32, 6.55]]) bush(b, x, z, 0.68);
  toriiGate(b, 0, 6.42, 0.72);
  toriiGate(b, 0, 4.86, 0.61);
  for (const x of [-1.85, 1.85]) {
    stoneLantern(b, x, 5.89, 0.73);
    stoneLantern(b, x, 3.92, 0.73);
  }
  b.part = 'store';
  b.box([-3.08, 0.73, -3.68], [6.16, 0.26, 6.16], '#9ca697');
  b.box([-2.87, 0.99, -3.47], [5.74, 0.35, 5.74], '#b4bd9e');
  const zCenter = -0.6;
  for (let tier = 0; tier < 5; tier++) {
    const half = 2.43 - tier * 0.255;
    const y = 1.34 + tier * 3.05;
    const wall = tier === 0 ? '#9c633c' : '#b93625';
    b.box([-half, y, zCenter - half], [half * 2, 1.85, half * 2], wall);
    balcony(b, 0, zCenter, half + 0.32, y - 0.03, tier === 0);
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const span = half * 2 / 3;
        const offset = -half + i * span + span * 0.27;
        b.box([offset, y + 0.48, zCenter + side * (half + 0.018)], [span * 0.46, 0.77, 0.023], '#ebdfc9');
        b.box([side * (half + 0.018), y + 0.48, zCenter + offset], [0.023, 0.77, span * 0.46], '#e2d3b7');
        if (tier === 0) {
          for (let slat = 0; slat < 3; slat++) {
            b.box([offset + slat * span * 0.15, y + 0.5, zCenter + half + 0.045], [0.05, 0.75, 0.028], '#8b5b31');
            b.box([half + 0.045, y + 0.5, zCenter + offset + slat * span * 0.15], [0.028, 0.75, 0.05], '#8b5b31');
          }
        }
      }
      b.box([-half - 0.07, y + 1.69, zCenter + side * half - 0.08], [half * 2 + 0.14, 0.18, 0.16], '#ec6130');
      b.box([side * half - 0.08, y + 1.69, zCenter - half - 0.07], [0.16, 0.18, half * 2 + 0.14], '#ec6130');
      for (const cross of [-1, 1]) b.box([side * half - 0.09, y, zCenter + cross * half - 0.09], [0.18, 1.88, 0.18], '#eb5c2e');
    }
    const roofY = y + 1.95;
    pagodaRoof(b, 0, zCenter, half + 0.93, roofY);
    for (let i = 0; i < 9; i++) {
      const offset = -half + i * half / 4;
      b.box([offset - 0.08, roofY - 0.24, zCenter + half], [0.16, 0.26, 0.55], '#b27139');
      b.box([half, roofY - 0.24, zCenter + offset - 0.08], [0.55, 0.26, 0.16], '#b27139');
    }
  }
  b.box([-0.61, 1.34, 1.85], [1.22, 1.61, 0.08], '#df5730');
  b.box([-0.48, 1.4, 1.943], [0.96, 1.41, 0.028], '#74482c');
  b.box([-0.025, 1.41, 1.976], [0.05, 1.38, 0.025], '#d89953');
  for (let step = 0; step < 5; step++) {
    b.box([-0.72, 0.73, 2.36 + step * 0.27], [1.44, (5 - step) * 0.122, 0.285], '#c18b48');
    b.box([-0.74, 0.73 + (5 - step) * 0.122, 2.36 + step * 0.27], [1.48, 0.04, 0.3], '#dfac61');
  }
  for (const side of [-1, 1]) {
    b.line([side * 0.88, 2.08, 2.41], [side * 0.88, 1.25, 3.53], 0.1, '#df4a24');
    for (let i = 0; i < 4; i++) b.box([side * 0.88 - 0.055, 0.73 + (4 - i) * 0.15, 2.42 + i * 0.3], [0.11, 0.72, 0.11], '#e8592e');
  }
  const spireY = 1.34 + 4 * 3.05 + 1.95 + 1.245;
  for (let step = 0; step < 3; step++) {
    const width = 0.93 - step * 0.22;
    b.box([-width / 2, spireY + step * 0.17, zCenter - width / 2], [width, 0.17, width], '#d8a84e');
  }
  b.box([-0.07, spireY + 0.51, zCenter - 0.07], [0.14, 2.33, 0.14], '#b88a39');
  for (let ring = 0; ring < 9; ring++) {
    const size = 0.49 - ring * 0.022;
    b.box([-size / 2, spireY + 0.61 + ring * 0.18, zCenter - size / 2], [size, 0.09, size], ring % 2 ? '#ba8b36' : '#e1b962');
  }
  b.box([-0.19, spireY + 2.32, zCenter - 0.11], [0.38, 0.1, 0.22], '#e6bc60');
  b.box([-0.11, spireY + 2.42, zCenter - 0.11], [0.22, 0.27, 0.22], '#dcad4b');
  b.box([-0.065, spireY + 2.69, zCenter - 0.065], [0.13, 0.2, 0.13], '#ebc372');
  return b.finish('pagoda');
}

export function buildSakura() {
  const b = new Builder();
  base(b, 'sakura', 9.2, 8.2, true);
  b.part = 'setting';
  paving(b, -4.1, 2.15, 8.2, 1.55);
  for (const x of [-3.5, 3.5]) {
    bush(b, x, 1.75, 0.6);
    stoneLantern(b, x, 2.95, 0.65);
  }
  b.box([-3.2, 1.36, 2.49], [2.1, 0.14, 0.53], '#bf9455');
  for (const x of [-3.07, -1.43]) b.box([x, 0.73, 2.53], [0.13, 0.63, 0.44], '#8d693d');
  b.part = 'store';
  cherryTree(b, 0.1, -0.55, 1.43, 0.73, 2);
  return b.finish('sakura');
}

export function buildShrine() {
  const b = new Builder();
  base(b, 'torii', 12.4, 11.8, true);
  b.part = 'setting';
  paving(b, -3.5, -3.85, 7, 6.4);
  paving(b, -0.9, 2.55, 1.8, 3.12);
  cherryTree(b, -4.6, -1.6, 0.9);
  cherryTree(b, 4.65, -1.45, 0.88, 0.73, 3);
  stoneLantern(b, -2.4, 2.3, 0.92);
  stoneLantern(b, 2.4, 2.3, 0.92);
  for (const x of [-4.3, 4.3]) bush(b, x, 2.1, 0.74);
  b.part = 'store';
  toriiGate(b, 0, 4.05, 0.97);
  b.box([-2.65, 0.73, -3.58], [5.3, 0.36, 4.6], '#a6ad99');
  b.box([-2.36, 1.09, -3.29], [4.72, 0.31, 4.02], '#c6c4a7');
  b.box([-2.1, 1.4, -3.0], [4.2, 2.03, 3.6], P.wood);
  for (const x of [-2.16, -0.58, 0.44, 2.0]) b.box([x, 1.4, 0.57], [0.15, 2.08, 0.18], '#845231');
  b.box([-0.52, 1.4, 0.61], [1.02, 1.66, 0.06], '#71442d');
  for (const x of [-1.81, 0.8]) {
    b.box([x, 1.93, 0.61], [1.0, 0.75, 0.036], '#e6d8b7');
    for (let i = 0; i < 4; i++) b.box([x + 0.07 + i * 0.23, 1.94, 0.65], [0.035, 0.74, 0.02], '#9a6938');
  }
  pagodaRoof(b, 0, -1.16, 2.91, 3.5);
  b.box([-1.65, 4.76, -1.26], [3.3, 0.14, 0.21], '#beaa62');
  b.box([-0.5, 1.42, 0.8], [1, 0.46, 0.51], '#b67a41');
  b.box([-0.58, 1.87, 0.75], [1.16, 0.08, 0.61], '#d5ac68');
  for (let i = 0; i < 6; i++) b.box([-0.48 + i * 0.18, 1.96, 0.82], [0.07, 0.02, 0.47], '#725234');
  for (let step = 0; step < 3; step++) b.box([-0.72, 0.73, 1.03 + step * 0.29], [1.44, 0.67 - step * 0.21, 0.32], '#c2bd9b');
  return b.finish('torii');
}