import { Builder } from '../voxel/builder';
import type { Vec3 } from '../voxel/types';
import { WORLD, isRailCorridor, type District } from './layout';
import { pixelDisc } from './detailKit';
import { STREET_PROPS, type StreetProp } from './propLayout';
import { RAILWAY } from './simulation';

function manhole(b: Builder, x: number, z: number, sakura = false) {
  const y = WORLD.roadY + 0.018;
  pixelDisc(b, [x, y, z], 0.44, 0.014, '#394d4b', 'xz');
  pixelDisc(b, [x, y + 0.008, z], 0.38, 0.01, '#718275', 'xz');
  for (let i = -2; i <= 2; i++) {
    b.box([x - 0.25, y + 0.014, z + i * 0.097], [0.5, 0.005, 0.012], '#879588');
    b.box([x + i * 0.097, y + 0.014, z - 0.25], [0.012, 0.005, 0.5], '#879588');
  }
  if (sakura) {
    pixelDisc(b, [x, y + 0.019, z], 0.15, 0.005, '#5c7168', 'xz');
    for (let i = 0; i < 5; i++) {
      const angle = i / 5 * Math.PI * 2;
      const px = x + Math.cos(angle) * 0.079, pz = z + Math.sin(angle) * 0.079;
      b.box([px - 0.039, y + 0.023, pz - 0.039], [0.078, 0.003, 0.078], '#bdafa1');
    }
    b.box([x - 0.025, y + 0.027, z - 0.025], [0.05, 0.003, 0.05], '#dac598');
  }
  for (const side of [-1, 1]) b.box([x + side * 0.288 - 0.033, y + 0.02, z - 0.027], [0.066, 0.005, 0.054], '#344c43');
}

function drain(b: Builder, x: number, z: number, length = 0.76) {
  const y = WORLD.roadY + 0.016;
  b.box([x - 0.15, y, z - length / 2], [0.3, 0.011, length], '#879387');
  b.box([x - 0.115, y + 0.012, z - length / 2 + 0.034], [0.23, 0.005, length - 0.068], '#3c504b');
  for (let i = 0; i < 8; i++) b.box([x - 0.115, y + 0.018, z - length * 0.41 + i * length * 0.105], [0.23, 0.009, 0.027], '#a0ada0');
}

function warningTiles(b: Builder, x: number, z: number, width: number, depth: number) {
  b.box([x - width / 2, WORLD.pavementY + 0.016, z - depth / 2], [width, 0.012, depth], '#e0ba54');
  for (let xx = -width / 2 + 0.062; xx < width / 2; xx += 0.118) {
    for (let zz = -depth / 2 + 0.062; zz < depth / 2; zz += 0.118) {
      b.box([x + xx - 0.025, WORLD.pavementY + 0.028, z + zz - 0.025], [0.05, 0.011, 0.05], '#f0cf79');
    }
  }
}

function tactileTile(b: Builder, x: number, z: number, horizontal = false) {
  const width = horizontal ? 0.57 : 0.285, depth = horizontal ? 0.285 : 0.57;
  b.box([x - width / 2, WORLD.pavementY + 0.017, z - depth / 2], [width, 0.008, depth], '#dfb954');
  for (let rib = 0; rib < 3; rib++) {
    b.box([x - (horizontal ? 0.24 : 0.08) + (horizontal ? 0 : rib * 0.079), WORLD.pavementY + 0.025,
      z - (horizontal ? 0.08 : 0.24) + (horizontal ? rib * 0.079 : 0)],
      horizontal ? [0.48, 0.01, 0.023] : [0.023, 0.01, 0.48], '#edc977');
  }
}

export function buildRoadDetails(district: District) {
  const b = new Builder();
  for (const side of [-1, 1]) {
    for (const z of [-61, -55, -46.5, -25, -18, -11.7, 11.7, 22, 30.3, 45, 53, 61]) {
      if (isRailCorridor(z, 0.5)) continue;
      drain(b, side * 5.81, z);
      b.box([side * 5.96 - 0.075, WORLD.roadY + 0.011, z - 0.6], [0.15, 0.01, 1.2], '#acb4a3');
    }
    for (let z = -60; z < 62; z += 8) {
      if (Math.abs(z) < 10 || isRailCorridor(z, 0.6)) continue;
      b.box([side * 5.62 - 0.035, WORLD.roadY + 0.016, z - 0.064], [0.07, 0.023, 0.128], '#acb393');
      b.box([side * 5.62 - 0.025, WORLD.roadY + 0.04, z - 0.044], [0.05, 0.008, 0.088], '#e2b15a', { glow: 0.04 });
    }
    manhole(b, side * 1.74, side < 0 ? 44.7 : 22.7, district.id === 'sakura');
    manhole(b, side * 1.55, side < 0 ? -19.9 : -56.4, true);
    manhole(b, side * 22.1, side < 0 ? 1.62 : -1.66);
  }
  for (const side of [-1, 1]) b.panel('road-speed30', [side * 1.5, WORLD.roadY + 0.024, side < 0 ? 25.9 : -20.8],
    [1.43, 2.15], { rotation: [-Math.PI / 2, 0, side < 0 ? 0 : Math.PI] });
  for (const side of [-1, 1]) {
    for (const z of [6.92, -6.92]) {
      b.box([side * 7.7 - 0.87, WORLD.pavementY + 0.014, z - 0.27], [1.74, 0.006, 0.54], '#bdc5ad');
      for (let rib = 0; rib < 4; rib++) b.box([side * 7.7 - 0.75, WORLD.pavementY + 0.02, z - 0.19 + rib * 0.116], [1.5, 0.005, 0.018], '#dce0c7');
    }
  }
  return b.finish('crossing', 0);
}

function mailbox(b: Builder) {
  b.box([-0.13, 0, -0.13], [0.26, 0.105, 0.26], '#8d9b8c');
  b.box([-0.058, 0.105, -0.058], [0.116, 0.63, 0.116], '#8e453d');
  b.box([-0.21, 0.63, -0.18], [0.42, 0.58, 0.36], '#c65e4b');
  b.box([-0.235, 1.21, -0.21], [0.47, 0.06, 0.42], '#d7785c');
  b.box([-0.22, 1.27, -0.19], [0.44, 0.039, 0.38], '#de9772');
  for (const x of [-0.159, 0.014]) {
    b.box([x, 1.056, 0.183], [0.145, 0.041, 0.018], '#6b4738');
    b.box([x - 0.009, 1.098, 0.183], [0.162, 0.027, 0.044], '#edb18b');
    b.box([x, 0.953, 0.185], [0.145, 0.036, 0.013], '#eed6b1');
  }
  b.panel('prop-post', [0, 0.82, 0.191], [0.24, 0.18]);
  b.box([-0.159, 0.66, -0.185], [0.318, 0.48, 0.023], '#b05646');
  b.box([0.159, 0.68, -0.04], [0.018, 0.36, 0.026], '#e5ba94');
}

function utility(b: Builder) {
  b.box([-0.29, 0, -0.23], [0.58, 0.104, 0.46], '#8e9f92');
  b.box([-0.257, 0.104, -0.209], [0.514, 1.0, 0.418], '#b4c1ad');
  b.box([-0.267, 1.104, -0.219], [0.534, 0.058, 0.438], '#d6ddc8');
  b.box([-0.216, 0.205, 0.212], [0.432, 0.78, 0.017], '#bdc8b2');
  b.box([0.133, 0.56, 0.235], [0.021, 0.094, 0.017], '#718773');
  for (let row = 0; row < 7; row++) b.box([-0.144, 0.287 + row * 0.053, 0.233], [0.29, 0.012, 0.016], '#829779');
  b.panel('prop-utility', [0, 0.873, 0.236], [0.24, 0.11]);
}

function recycling(b: Builder) {
  for (let i = 0; i < 3; i++) {
    const x = -0.55 + i * 0.387;
    b.box([x, 0, -0.175], [0.343, 0.65, 0.35], '#afbea8');
    b.box([x - 0.018, 0.65, -0.19], [0.379, 0.079, 0.38], ['#769f94', '#bc9a61', '#8d95ae'][i]);
    b.box([x + 0.069, 0.668, 0.015], [0.2, 0.039, 0.038], '#3b584b');
    b.panel(`prop-recycle-${i}`, [x + 0.171, 0.43, 0.181], [0.275, 0.18]);
    b.box([x + 0.037, 0.026, 0.179], [0.27, 0.026, 0.012], '#85957d');
  }
}

function bicycle(b: Builder, x: number, z: number, color: string, basket: boolean) {
  const y = 0.295;
  for (const offset of [-0.59, 0.59]) {
    for (let i = 0; i < 20; i++) {
      const angle = i / 20 * Math.PI * 2;
      b.box([x + offset + Math.round(Math.cos(angle) * 5) * 0.053 - 0.04,
        y + Math.round(Math.sin(angle) * 5) * 0.053 - 0.04, z - 0.037], [0.08, 0.08, 0.075], '#42554a');
    }
    b.line([x + offset - 0.235, y, z], [x + offset + 0.235, y, z], 0.025, '#aabca4');
    b.line([x + offset, y - 0.24, z], [x + offset, y + 0.24, z], 0.025, '#aabca4');
  }
  const a: Vec3 = [x - 0.59, y, z], c: Vec3 = [x - 0.11, 0.66, z], d: Vec3 = [x + 0.06, y, z], e: Vec3 = [x + 0.42, 0.68, z];
  b.line(a, c, 0.042, color); b.line(c, d, 0.042, color); b.line(d, a, 0.042, color);
  b.line(c, e, 0.042, color); b.line(e, d, 0.042, color); b.line(e, [x + 0.59, y, z], 0.047, color);
  b.box([x - 0.228, 0.721, z - 0.086], [0.287, 0.06, 0.172], '#4d5140');
  b.box([x + 0.348, 0.761, z - 0.15], [0.182, 0.027, 0.3], '#83977f');
  b.box([x + 0.397, 0.716, z - 0.021], [0.039, 0.12, 0.042], '#899d87');
  if (basket) {
    b.box([x + 0.478, 0.586, z - 0.123], [0.265, 0.23, 0.246], '#adbea5');
    b.box([x + 0.505, 0.81, z - 0.097], [0.214, 0.015, 0.194], '#6b866c');
    for (let i = 0; i < 5; i++) b.box([x + 0.477 + i * 0.061, 0.615, z + 0.126], [0.017, 0.159, 0.009], '#688064');
  }
  b.box([x - 0.655, 0.655, z - 0.14], [0.45, 0.029, 0.28], '#8c9d81');
}

function bikeRack(b: Builder) {
  b.box([-1.8, 0, -0.39], [3.6, 0.036, 0.78], '#a2b09a');
  for (const x of [-1.24, 0.7]) {
    for (const z of [-0.28, 0.28]) b.box([x - 0.022, 0.036, z - 0.022], [0.044, 0.42, 0.044], '#8b9f86');
    b.box([x - 0.022, 0.456, -0.28], [0.044, 0.032, 0.56], '#b0bea0');
  }
  bicycle(b, -0.85, -0.098, '#537f83', true);
  bicycle(b, 1.07, 0.09, '#be9964', false);
  b.box([-1.69, 0.037, 0.21], [0.04, 1.24, 0.042], '#899f84');
  b.box([-1.86, 1.12, 0.209], [0.38, 0.29, 0.051], '#69845f');
  b.panel('prop-bicycle', [-1.67, 1.267, 0.267], [0.32, 0.235]);
}

function sign(b: Builder, kind: 'speed-sign' | 'direction-sign') {
  b.box([-0.077, 0, -0.076], [0.154, 0.083, 0.152], '#b5baa4');
  b.box([-0.024, 0.083, -0.024], [0.048, 2.64, 0.048], '#c5cdba');
  if (kind === 'speed-sign') {
    pixelDisc(b, [0, 2.57, 0], 0.277, 0.035, '#c26756');
    pixelDisc(b, [0, 2.57, 0.023], 0.216, 0.017, '#f5ebd1');
    b.panel('traffic-speed30', [0, 2.57, 0.04], [0.35, 0.28]);
    pixelDisc(b, [0, 1.958, 0], 0.19, 0.03, '#c06b5e');
    pixelDisc(b, [0, 1.958, 0.02], 0.151, 0.013, '#5c8495');
    b.box([-0.156, 1.94, 0.032], [0.312, 0.04, 0.008], '#d68a68', { rotation: [0, 0, -Math.PI / 4] });
  } else {
    b.box([-0.57, 2.52, -0.065], [1.14, 0.55, 0.09], '#568094');
    b.box([-0.6, 3.07, -0.07], [1.2, 0.045, 0.1], '#b7c9c2');
    b.panel('prop-direction', [0, 2.795, 0.032], [1.06, 0.46]);
    b.box([-0.19, 1.74, -0.038], [0.38, 0.2, 0.056], '#d7d5bb');
    b.panel('prop-address', [0, 1.845, 0.025], [0.33, 0.155]);
  }
}

function placedProp(b: Builder, placement: StreetProp) {
  const local = new Builder();
  if (placement.kind === 'mailbox') mailbox(local);
  else if (placement.kind === 'utility') utility(local);
  else if (placement.kind === 'recycling') recycling(local);
  else if (placement.kind === 'bike-rack') bikeRack(local);
  else sign(local, placement.kind);
  const angle = placement.orientation ?? 0;
  const cos = Math.cos(angle), sin = Math.sin(angle);
  for (const box of local.boxes) {
    const cx = box.p[0] + box.s[0] / 2, cz = box.p[2] + box.s[2] / 2;
    b.box([placement.x + cx * cos + cz * sin - box.s[0] / 2, box.p[1] + WORLD.pavementY,
      placement.z - cx * sin + cz * cos - box.s[2] / 2], box.s, box.color,
      { rotation: [box.rotation?.[0] ?? 0, angle + (box.rotation?.[1] ?? 0), box.rotation?.[2] ?? 0], glow: box.glow });
  }
  for (const panel of local.panels) b.panel(panel.kind,
    [placement.x + panel.p[0] * cos + panel.p[2] * sin, WORLD.pavementY + panel.p[1], placement.z - panel.p[0] * sin + panel.p[2] * cos], panel.s,
    { rotation: [panel.rotation?.[0] ?? 0, angle + (panel.rotation?.[1] ?? 0), panel.rotation?.[2] ?? 0] });
}

export function buildSidewalkDetails() {
  const b = new Builder();
  for (const side of [-1, 1]) {
    for (let z = -63.6; z < 63.6; z += 0.61) {
      if (Math.abs(z) < 8.35 || isRailCorridor(z, 0.7)) continue;
      tactileTile(b, side * 8.15, z);
    }
    for (const z of [-6.5, 6.5]) {
      warningTiles(b, side * 7.6, z, 2.33, 0.56);
      for (let x = 6.68; x < 8.15; x += 0.6) tactileTile(b, side * x, z + (z < 0 ? -1.1 : 1.1), true);
    }
    for (const end of [-1, 1]) warningTiles(b, side * 7.6, RAILWAY.z + end * (RAILWAY.pedestrianStopOffset + 0.42), 2.45, 0.33);
  }
  STREET_PROPS.forEach(prop => placedProp(b, prop));
  return b.finish('machiya', 0);
}