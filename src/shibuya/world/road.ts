import { Builder } from '../voxel/builder';
import { getAssetData } from '../voxel/models';
import { parkTree } from '../voxel/urbanKit';
import { isRailCorridor, sakuraPlacements, WORLD, type District } from './layout';
import { RAILWAY } from './simulation';

export const SIDEWALK_TREE_Z = [-60.3, -49.5, -28.5, -17.8, -10, 10, 21, 32, 43, 54, 61] as const;

function pavement(b: Builder, x: number, z: number, width: number, depth: number) {
  b.box([x, WORLD.groundY, z], [width, WORLD.pavementY - WORLD.groundY, depth], '#adb9a6');
  const cols = Math.max(1, Math.ceil(width / 1.05)), rows = Math.max(1, Math.ceil(depth / 1.05));
  for (let ix = 0; ix < cols; ix++) for (let iz = 0; iz < rows; iz++) {
    b.box([x + ix * width / cols + 0.008, WORLD.pavementY, z + iz * depth / rows + 0.008],
      [width / cols - 0.016, 0.013, depth / rows - 0.016], (ix + iz) % 4 ? '#d3d7c2' : '#c7ceb8');
  }
}

export function buildWorldRoad(district: District) {
  const b = new Builder();
  const halfLength = WORLD.chunkLength / 2;
  b.box([-40, -0.26, -halfLength], [80, 0.37, WORLD.chunkLength], '#829b68');
  b.box([-40, 0.11, -halfLength], [80, 0.025, WORLD.chunkLength], district.id === 'sakura' ? '#aec789' : '#bcc9a0');
  b.box([-6, 0.14, -halfLength], [12, 0.057, WORLD.chunkLength], '#4c5b62');
  b.box([-40, 0.14, -6], [80, 0.057, 12], '#4c5b62');

  const sections = [[-halfLength + 0.02, RAILWAY.z - RAILWAY.reserveHalfWidth],
    [RAILWAY.z + RAILWAY.reserveHalfWidth, -9.05], [9.05, halfLength - 0.02]];
  for (const side of [-1, 1]) for (const [z, end] of sections) {
    const x = side < 0 ? -39.7 : 9.05;
    pavement(b, x, z, 30.65, end - z);
    const alley = side * 19.82;
    b.box([alley - 0.75, WORLD.pavementY + 0.014, z], [1.5, 0.009, end - z], '#b8c2b2');
    b.box([side * 29.4 - 0.24, WORLD.pavementY + 0.014, z], [0.48, 0.009, end - z], '#a9baad');
    for (let zz = z + 5.5; zz < end; zz += 11.2) b.box([x, WORLD.pavementY + 0.014, zz - 0.17], [30.65, 0.009, 0.34], '#b2bfaa');
  }

  for (const side of [-1, 1]) {
    const x = side < 0 ? -9 : 6;
    for (const [z, end] of [[-halfLength, RAILWAY.z - RAILWAY.reserveHalfWidth], [RAILWAY.z + RAILWAY.reserveHalfWidth, -7.02], [7.02, halfLength]]) {
      pavement(b, x, z, 3, end - z);
      b.box([side < 0 ? -6.17 : 6.04, 0.21, z], [0.13, 0.126, end - z], '#e6e4d0');
      b.box([side < 0 ? -8.24 : 8.06, 0.336, z], [0.17, 0.009, end - z], '#e8bf58');
    }
    b.box([x, WORLD.groundY, RAILWAY.z - RAILWAY.reserveHalfWidth], [3, 0.07, RAILWAY.reserveHalfWidth * 2], '#9ea8a0');
    for (const z of [-9.06, 6.06]) {
      pavement(b, side < 0 ? -40 : 9, z, 31, 3);
      b.box([side < 0 ? -40 : 9, 0.21, z < 0 ? -6.2 : 6.04], [31, 0.126, 0.13], '#e6e4d0');
    }
    for (const z of [-9.06, 6.06]) pavement(b, x, z, 3, 3);
  }

  for (let z = -halfLength + 1; z < halfLength; z += 4) {
    if (Math.abs(z) < 8 || isRailCorridor(z, 2.5)) continue;
    for (const x of [-0.115, 0.055]) b.box([x, 0.199, z], [0.06, 0.015, Math.min(2.2, halfLength - z)], '#ebc777');
    for (const x of [-3.028, 2.972]) b.box([x, 0.199, z], [0.056, 0.015, Math.min(1.9, halfLength - z)], '#e9eddc');
    for (const x of [-5.67, 5.61]) b.box([x, 0.199, z], [0.066, 0.015, Math.min(3.99, halfLength - z)], '#d3dbce');
  }
  for (let x = -38; x < 39; x += 4) {
    if (Math.abs(x) < 8) continue;
    for (const z of [-0.115, 0.055]) b.box([x, 0.199, z], [2.2, 0.015, 0.06], '#ebc777');
    for (const z of [-3.028, 2.972]) b.box([x, 0.199, z], [1.9, 0.015, 0.056], '#e9eddc');
  }

  // Reuse the existing Scramble Crossing markings, flush with the common road surface.
  for (const box of getAssetData('crossing').boxes) {
    if (box.part !== 'store' || !['#f4f1dc', '#ebe9d9'].includes(box.color)) continue;
    b.box([box.p[0], 0.199, box.p[2]], [box.s[0], 0.015, box.s[2]], box.color, { rotation: box.rotation });
  }
  for (const side of [-1, 1]) for (const direction of [-1, 1]) {
    b.box([side < 0 ? -5.85 : 0.25, 0.199, direction * 8.16], [5.6, 0.015, 0.11], '#efeedd');
    b.box([direction * 8.16, 0.199, side < 0 ? -5.85 : 0.25], [0.11, 0.015, 5.6], '#efeedd');
  }

  for (const x of [-4.5, -1.5, 1.5, 4.5]) for (const z of [-54, -20, 16, 42, 58]) {
    const direction = x < 0 ? -1 : 1;
    b.box([x - 0.045, 0.199, z - 0.5], [0.09, 0.015, 1.0], '#e8ebd9');
    for (let step = 0; step < 3; step++) b.box([x - 0.32 + step * 0.075, 0.199, z + direction * (0.44 - step * 0.115)], [0.64 - step * 0.15, 0.015, 0.08], '#e8ebd9');
  }

  for (const lot of district.buildings) {
    const x = lot.x - lot.width / 2, z = lot.z - lot.depth / 2;
    b.box([x + 0.04, WORLD.pavementY + 0.014, z + 0.04], [lot.width - 0.08, 0.018, lot.depth - 0.08], lot.park ? '#acc785' : lot.tier === 'home' ? '#ddd2b6' : '#c8cfc0');
    for (const zz of [z + 0.03, z + lot.depth - 0.11]) b.box([x + 0.04, WORLD.pavementY + 0.033, zz], [lot.width - 0.08, 0.022, 0.08], lot.park ? '#ede4ca' : '#e3dfcd');
    if (lot.park) {
      const entranceX = lot.x < 0 ? lot.x + 1.5 : x + 0.08;
      b.box([entranceX, WORLD.pavementY + 0.035, lot.z - 0.85], [lot.width / 2 - 1.52, 0.018, 1.7], '#ded9bc');
    }
  }
  for (const side of [-1, 1]) {
    for (const z of SIDEWALK_TREE_Z) {
      const x = side * 6.47;
      b.box([x - 0.4, WORLD.pavementY, z - 0.4], [0.8, 0.17, 0.8], '#a2895d');
      b.box([x - 0.35, WORLD.pavementY + 0.17, z - 0.35], [0.7, 0.019, 0.7], '#86a45f');
    }
    for (const z of [-54, -22, 16, 42, 58]) {
      const x = side * 6.53;
      b.box([x - 0.06, WORLD.pavementY, z - 0.06], [0.12, 4.95, 0.12], '#627e78');
      b.box([x + (side < 0 ? -0.1 : -0.99), 5.22, z - 0.1], [1.09, 0.07, 0.18], '#718b81');
      b.box([x + (side < 0 ? 0.71 : -0.99), 5.1, z - 0.15], [0.36, 0.16, 0.3], '#f4dfb1', { glow: 0.55 });
    }
  }
  for (const x of [-6.65, 6.65]) for (const z of [-6.65, 6.65]) {
    b.box([x - 0.12, WORLD.pavementY, z - 0.12], [0.24, 0.12, 0.24], '#77918a');
    b.box([x - 0.052, WORLD.pavementY + 0.12, z - 0.052], [0.104, 3.35, 0.104], '#6a8680');
    b.box([x - 0.48, 3.31, z - 0.15], [0.96, 0.29, 0.3], '#314d48');
    b.box([x - 0.15, 2.79, z - 0.48], [0.3, 0.29, 0.96], '#314d48');
  }
  return b.finish('crossing', 0);
}

export function buildWorldTrees(district: District) {
  const b = new Builder();
  const temp = new Builder();
  const cherry = sakuraPlacements(district);
  for (const side of [-1, 1]) for (const z of SIDEWALK_TREE_Z) parkTree(temp, side * 6.47, z, 0.78, z < 0 ? 1 : 2);
  for (const side of [-1, 1]) for (const half of [-1, 1]) {
    for (const z of [19.5, 53, 41.5]) {
      if (isRailCorridor(half * z, 1)) continue;
      if (!cherry.some(([cx, cz]) => Math.hypot(cx - side * 19.82, cz - half * z) < 1)) {
        parkTree(temp, side * 19.82, half * z, 0.64, half < 0 ? 1 : 0);
      }
    }
  }
  for (const lot of district.buildings.filter(item => item.park)) {
    for (const zz of [-1.9, 1.3]) parkTree(temp, lot.x + Math.sign(lot.x) * 8.0, lot.z + zz, 1.04, zz < 0 ? 1 : 2);
  }
  for (const box of temp.boxes) b.box([box.p[0], box.p[1] - 0.73 + WORLD.pavementY + 0.18, box.p[2]], box.s, box.color, { rotation: box.rotation, glow: box.glow });
  return b.finish('sakura', 0);
}