import { Builder } from '../voxel/builder';
import { bush, stoneLantern } from '../voxel/landmarkKit';
import { isRailCorridor, WORLD, type District } from './layout';

function flowers(b: Builder, x: number, z: number, length = 1.7, terracotta = false) {
  b.box([x - 0.19, WORLD.pavementY, z - length / 2], [0.38, 0.37, length], terracotta ? '#be8165' : '#c7c4a3');
  b.box([x - 0.215, WORLD.pavementY + 0.37, z - length / 2 - 0.015], [0.43, 0.045, length + 0.03], terracotta ? '#dba483' : '#e3d6b4');
  b.box([x - 0.15, 0.738, z - length / 2 + 0.07], [0.3, 0.02, length - 0.14], '#786c48');
  for (let i = 0; i < 6; i++) {
    const zz = z - length * 0.4 + i * length * 0.16;
    b.box([x - 0.11, 0.76, zz], [0.22, 0.15, 0.18], '#7f9d52');
    b.box([x - 0.033, 0.89, zz + 0.036], [0.034, 0.13, 0.04], '#628743');
    const c = ['#d9a3b8', '#e9c879', '#eee0cf'][i % 3];
    b.box([x - 0.084, 0.98, zz + 0.016], [0.14, 0.067, 0.11], c);
    b.box([x - 0.043, 1.025, zz + 0.04], [0.058, 0.028, 0.043], '#f5d87a');
    b.box([x + 0.054, 0.87, zz - 0.01], [0.075, 0.075, 0.075], '#d5898a');
  }
}

function pedestrianRail(b: Builder, side: number, z: number, length: number) {
  const x = side * 6.17;
  for (const zz of [z - length / 2, z + length / 2]) {
    b.box([x - 0.03, WORLD.pavementY, zz - 0.03], [0.06, 0.82, 0.06], '#e6e5d2');
    b.box([x - 0.05, WORLD.pavementY, zz - 0.05], [0.1, 0.06, 0.1], '#879582');
  }
  b.box([x - 0.03, 1.08, z - length / 2], [0.06, 0.06, length], '#ecebd7');
  b.box([x - 0.026, 0.8, z - length / 2], [0.052, 0.048, length], '#e1e5ce');
  b.box([x - 0.047, 0.99, z - 0.22], [0.094, 0.045, 0.44], '#da945c');
}

function stopSign(b: Builder, side: number, z: number) {
  const x = side * 6.5;
  b.box([x - 0.025, WORLD.pavementY, z - 0.025], [0.05, 2.55, 0.05], '#d9ded0');
  for (let row = 0; row < 9; row++) {
    const width = 0.88 - row * 0.086;
    b.box([x - width / 2, 2.82 - row * 0.077, z - 0.045], [width, 0.075, 0.09], row < 1 ? '#ede6d3' : '#c95747');
  }
  b.panel('traffic-stop', [x, 2.606, z + 0.049], [0.61, 0.36]);
  b.box([x - 0.18, 1.54, z - 0.04], [0.36, 0.35, 0.08], '#f0e7cf');
  b.panel('traffic-crossing', [x, 1.715, z + 0.049], [0.3, 0.28]);
}

function convexMirror(b: Builder, side: number) {
  const x = side * 9.04, z = side < 0 ? 8.0 : -8.0;
  b.box([x - 0.035, WORLD.pavementY, z - 0.035], [0.07, 3.37, 0.07], '#c18b4d');
  b.box([x - 0.29, 3.28, z - 0.037], [0.58, 0.58, 0.074], '#d89b53');
  b.box([x - 0.2, 3.18, z - 0.034], [0.4, 0.78, 0.068], '#d89b53');
  b.box([x - 0.21, 3.355, z + 0.04], [0.42, 0.44, 0.022], '#94bdc1');
  b.box([x - 0.133, 3.28, z + 0.04], [0.266, 0.58, 0.022], '#a7d1cf');
  b.box([x - 0.15, 3.64, z + 0.063], [0.09, 0.14, 0.01], '#d7e8d7');
}

function bench(b: Builder, x: number, z: number, side: number) {
  for (const zz of [-0.58, 0.58]) {
    b.box([x - 0.2, WORLD.pavementY, z + zz - 0.03], [0.4, 0.48, 0.07], '#6b8476');
    b.box([x + side * 0.15 - 0.03, 0.73, z + zz - 0.03], [0.06, 0.5, 0.07], '#6b8476');
  }
  for (let i = 0; i < 3; i++) b.box([x - 0.23 + i * 0.17, 0.82, z - 0.82], [0.14, 0.075, 1.64], '#c6a376');
  for (let i = 0; i < 2; i++) b.box([x + side * 0.21 - 0.037, 1.0 + i * 0.15, z - 0.82], [0.075, 0.1, 1.64], '#c6a376');
}

function busShelter(b: Builder, side: number) {
  const x = side * 8.57, z = side < 0 ? 24.5 : -24.5;
  for (const zz of [-1.37, 1.37]) b.box([x - 0.035, WORLD.pavementY, z + zz], [0.07, 2.05, 0.07], '#668c85');
  b.box([x - 0.035, 1.06, z - 1.33], [0.025, 1.22, 2.66], '#a1c9c4', { opacity: 0.28 });
  b.box([x + (side < 0 ? -0.09 : -0.81), 2.37, z - 1.5], [0.9, 0.09, 3], '#e8e0c4');
  b.box([x + (side < 0 ? -0.06 : -0.65), 1.0, z - 0.68], [0.63, 0.065, 1.36], '#89a881');
  b.box([x + side * 0.16 - 0.017, WORLD.pavementY, z + 1.94], [0.034, 2.18, 0.034], '#80988c');
  b.box([x + side * 0.16 - 0.2, 2.49, z + 1.9], [0.4, 0.32, 0.08], '#477c61');
  b.panel('sign-bus-stop', [x + side * 0.16, 2.65, z + 1.99], [0.35, 0.26]);
}

export function buildStreetFurniture(district: District) {
  const b = new Builder();
  for (const side of [-1, 1]) {
    for (const half of [-1, 1]) {
      for (const z of [19.5, 53]) {
        bench(b, side * 8.73, half * z, side);
        flowers(b, side * 9.48, half * (z + 0.35));
        b.box([side * 8.89 - 0.16, WORLD.pavementY, half * (z + 1.32)], [0.32, 0.62, 0.31], '#6e8d78');
        b.box([side * 8.89 - 0.175, 0.941, half * (z + 1.32) - 0.016], [0.35, 0.04, 0.342], '#adc0a0');
      }
      for (const z of [14, 25, 47, 58.5]) {
        b.box([side * 9.39 - 0.27, WORLD.pavementY, half * z], [0.54, 1.15, 0.6], half === 1 ? '#b85c4c' : '#5a859b');
        b.box([side * 9.39 - 0.233, 0.76, half * z + 0.603], [0.466, 0.6, 0.015], '#d6dfc7', { glow: 0.11 });
        for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) b.box([side * 9.39 - 0.195 + j * 0.098, 0.79 + i * 0.16, half * z + 0.621], [0.058, 0.11, 0.019], ['#debc61', '#7dab75', '#a8caca', '#d28469'][j]);
      }
    }
    for (const z of [-58.4, -48, -26, -14.8, 14.8, 26.5, 37, 48.5, 58.4]) {
      flowers(b, side * 6.76, z, 1.35, Math.floor(Math.abs(z)) % 2 === 0);
    }
    for (const z of [-60, -51, -22, -13.5, 13.5, 27.5, 41, 52.5, 60]) pedestrianRail(b, side, z, 2.2);
    stopSign(b, side, side < 0 ? 9.6 : -9.6);
    convexMirror(b, side);
    for (const z of [-8.8, 8.8]) {
      b.box([side * 6.58 - 0.063, WORLD.pavementY, z - 0.063], [0.126, 0.76, 0.126], '#d9bc68');
      for (let i = 0; i < 3; i++) b.box([side * 6.58 - 0.068, 0.55 + i * 0.19, z - 0.068], [0.136, 0.065, 0.136], '#394b44');
    }
    busShelter(b, side);
    for (const z of [-11, 11]) {
      b.box([side * 6.38 - 0.04, WORLD.pavementY, z - 0.04], [0.08, 3.35, 0.08], '#697f78');
      b.box([side * 6.38 - 0.32, 3.67, z - 0.08], [0.64, 0.37, 0.16], '#4c8776');
      b.panel(`zone-${district.id}`, [side * 6.38, 3.857, z + 0.088], [0.56, 0.27]);
    }
  }
  if (district.id === 'yokocho' || district.id === 'shibuya') {
    for (const side of [-1, 1]) for (const half of [-1, 1]) {
      const x = side * 19.81;
      for (let i = 0; i < 26; i++) {
        const z = half * (10.3 + i * 2.03);
        if (isRailCorridor(z, 2.0)) continue;
        b.box([x - 0.019, 3.14, z], [0.038, 0.038, 2.03], '#4c6356');
        b.box([x - 0.037, 2.93, z + 0.43], [0.074, 0.21, 0.074], '#556751');
        b.box([x - 0.13, 2.54, z + 0.32], [0.26, 0.38, 0.25], i % 3 ? '#d77854' : '#eac681', { glow: 0.22 });
        b.box([x - 0.14, 2.91, z + 0.31], [0.28, 0.04, 0.27], '#495b43');
      }
    }
  }
  return b.finish('konbini', 0);
}

export function buildParkDetails(district: District) {
  const b = new Builder();
  for (const lot of district.buildings.filter(item => item.park)) {
    const edge = lot.x < 0 ? lot.x + lot.width / 2 - 0.58 : lot.x - lot.width / 2 + 0.58;
    const rear = lot.x < 0 ? lot.x - lot.width / 2 + 0.55 : lot.x + lot.width / 2 - 0.55;
    for (const z of [lot.z - 9.85, lot.z + 9.85]) {
      b.box([lot.x - lot.width / 2 + 0.4, 0.34, z], [lot.width - 0.8, 0.25, 0.16], '#b4b79c');
      for (let i = 0; i < 7; i++) b.box([lot.x - lot.width / 2 + 0.45 + i * (lot.width - 1) / 6, 0.33, z - 0.036], [0.11, 0.51, 0.23], '#9eaa8a');
    }
    for (const z of [-4.3, 4.3]) {
      const temp = new Builder();
      stoneLantern(temp, edge + Math.sign(lot.x) * 0.5, lot.z + z, 0.75);
      for (const box of temp.boxes) b.box([box.p[0], box.p[1] - 0.73 + WORLD.pavementY, box.p[2]], box.s, box.color, { glow: box.glow });
    }
    for (const z of [-8.55, -5.5, 5.5, 8.55]) {
      const temp = new Builder();
      bush(temp, rear, lot.z + z, 0.8);
      for (const box of temp.boxes) b.box([box.p[0], box.p[1] - 0.73 + WORLD.pavementY, box.p[2]], box.s, box.color);
    }
    b.box([lot.x - 2.4, 0.355, lot.z + 7.7], [4.8, 0.08, 1.6], '#a4b6a0');
    b.box([lot.x - 2.29, 0.437, lot.z + 7.78], [4.58, 0.019, 1.42], '#9ec9c2');
    for (let i = 0; i < 3; i++) b.box([lot.x - 1.8 + i * 1.3, 0.46, lot.z + 8.16], [0.39, 0.13, 0.48], '#c2c4a9');
  }
  return b.finish('torii', 0);
}