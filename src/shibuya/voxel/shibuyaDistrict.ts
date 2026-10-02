import { Builder } from './builder';
import { bush, pedestrian, windowGrid } from './landmarkKit';
import {
  billboard, commercialBlock, districtBase, guardrail, lane, parkTree,
  railViaduct, sidewalk, storefront, streetLight, transport, zebra,
} from './urbanKit';

interface CityBlock {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  color: string;
  sign: string;
  awning: string;
}

export const SHIBUYA_BLOCKS: CityBlock[] = [
  { x: -15.2, z: -13.4, w: 5.8, d: 5.1, h: 8.1, color: '#84b2bb', sign: 'sign-jr-station', awning: '#3a924f' },
  { x: -15.2, z: -7.2, w: 5.8, d: 4.8, h: 10.3, color: '#bf7055', sign: 'sign-rakuten', awning: '#e5a055' },
  { x: -15.2, z: -1.25, w: 5.8, d: 5.35, h: 6.7, color: '#758eab', sign: 'sign-game', awning: '#d46182' },
  { x: -15.2, z: 10.0, w: 5.8, d: 3.75, h: 4.35, color: '#d6b96d', sign: 'sign-izakaya', awning: '#d76843' },
  { x: -8.05, z: -13.4, w: 4.45, d: 4.65, h: 12.7, color: '#a8c0ca', sign: 'sign-modern', awning: '#487b95' },
  { x: -2.65, z: -13.4, w: 4.1, d: 4.65, h: 8.8, color: '#d9c89d', sign: 'sign-cafe', awning: '#4c8262' },
  { x: 2.43, z: -13.4, w: 5.18, d: 4.65, h: 10.75, color: '#a5bccc', sign: 'sign-rakuten', awning: '#ce644e' },
  { x: 9.35, z: -13.4, w: 5.8, d: 5.1, h: 8.7, color: '#aa97af', sign: 'sign-hotel', awning: '#785580' },
  { x: 9.35, z: -7.2, w: 5.8, d: 4.8, h: 11.8, color: '#567f9b', sign: 'sign-karaoke', awning: '#dfac48' },
  { x: 9.35, z: -1.25, w: 5.8, d: 5.35, h: 7.8, color: '#b96158', sign: 'sign-izakaya', awning: '#b54332' },
  { x: -7.7, z: 10.9, w: 4.4, d: 2.85, h: 3.5, color: '#9fb2be', sign: 'sign-store', awning: '#3d9b62' },
  { x: -2.2, z: 10.9, w: 5.3, d: 2.85, h: 2.95, color: '#dbc691', sign: 'sign-cafe', awning: '#b58348' },
  { x: 4.19, z: 10.9, w: 3.6, d: 2.85, h: 3.7, color: '#bd8275', sign: 'sign-karaoke', awning: '#488fa4' },
  { x: 9.35, z: 10.0, w: 5.8, d: 3.75, h: 5.3, color: '#d5b963', sign: 'sign-store', awning: '#5c8d48' },
];

function sideSign(b: Builder, kind: string, x: number, y: number, z: number, w: number, h: number) {
  b.box([x, y, z - w / 2], [0.09, h, w], '#324b59');
  b.panel(kind, [x + 0.098, y + h / 2, z], [w - 0.06, h - 0.08], { rotation: [0, Math.PI / 2, 0], glow: 0.4 });
}

export function addShibuyaNeighborhood(b: Builder) {
  districtBase(b, 'skyscraper', 32.8, 29.8);
  sidewalk(b, -4.8, -4.45, 9.6, 9.25);
  for (const block of SHIBUYA_BLOCKS) {
    sidewalk(b, block.x - 0.34, block.z - 0.34, block.w + 0.68, block.d + 0.94);
    commercialBlock(b, block.x, block.z, block.w, block.d, block.h, block.color, block.sign, block.awning);
  }

  // Buildings occupy separate city blocks, leaving a continuous road loop around the tower.
  lane(b, -15.95, 6.69, 32.0);
  lane(b, -15.95, -6.6, 32.0);
  lane(b, -6.64, -14.3, 28.5, true);
  lane(b, 6.64, -14.3, 28.5, true);
  for (const x of [-4.57, 1.75]) zebra(b, x, 4.89, 2.7, 3.46);
  for (const x of [-8.43, 4.93]) {
    zebra(b, x, -3.37, 2.95, 3.39, true);
    zebra(b, x, 1.2, 2.95, 3.39, true);
    zebra(b, x, 9.46, 2.73, 3.39, true);
  }
  zebra(b, -2.85, -8.34, 2.95, 3.44);
  railViaduct(b, -16.1, -6.94, 32.1);
  billboard(b, 'sign-jr-station', -12.3, 9.39, -8.17, 5.72, 1.92);
  billboard(b, 'sign-rakuten', -12.3, 11.6, -2.33, 5.0, 1.98);
  billboard(b, 'sign-rakuten', 5.02, 12.02, -8.69, 4.42, 1.81);
  billboard(b, 'sign-karaoke', 12.25, 13.06, -2.32, 5.49, 1.85);
  billboard(b, 'sign-shibuya109', 12.25, 9.08, 4.19, 5.21, 1.38);
  billboard(b, 'sign-karaoke', 5.99, 4.99, 13.81, 3.3, 1.05);
  billboard(b, 'sign-game', -12.27, 7.9, 4.17, 4.95, 1.55);
  sideSign(b, 'sign-jr', -9.31, 4.17, -10.3, 2.07, 1.25);
  sideSign(b, 'vertical-karaoke', 15.165, 3.65, -4.0, 0.87, 6.9);
  sideSign(b, 'vertical-neon', -9.315, 3.53, -4.3, 0.87, 5.84);
  sideSign(b, 'sign-izakaya', 15.165, 2.01, 1.0, 2.35, 0.65);
  storefront(b, -14.3, 13.828, 3.9, 'sign-izakaya', '#b74a39');
  b.box([15.2, 1.01, 1.62], [0.015, 1.27, 1.96], '#b6d8cc');
  b.box([15.24, 2.33, 1.48], [0.45, 0.17, 2.25], '#b74932');
  windowGrid(b, -6.74, 3.74, 15.19, 4.32, 6.77, 5, 7, true, 2);

  const trees: [number, number, number][] = [
    [-4.54, 3.59, 0.76], [4.47, 3.62, 0.77], [-4.55, -3.96, 0.7], [4.48, -3.96, 0.68],
    [-8.83, -11.73, 0.83], [-8.83, -8.35, 0.83], [-8.83, -1.49, 0.85], [-8.83, 2.49, 0.79],
    [8.87, -11.73, 0.81], [8.87, -8.43, 0.87], [8.87, -1.61, 0.83], [8.87, 2.49, 0.84],
    [-14.41, 9.44, 0.85], [-9.33, 9.47, 0.78], [10.26, 9.47, 0.76], [14.76, 9.46, 0.81],
    [-3.1, 9.97, 0.71], [3.77, 10.14, 0.72], [7.96, 13.85, 0.66], [-15.58, -0.29, 0.77],
    [-15.55, -11.5, 0.74], [15.56, -11.4, 0.74], [15.56, 1.36, 0.72],
  ];
  trees.forEach(([x, z, s], i) => parkTree(b, x, z, s, i % 4));
  for (const x of [-4.5, 4.5]) {
    for (const z of [-1.97, 0.72]) bush(b, x, z, 0.53);
  }
  guardrail(b, -3.98, 4.53, 2.73);
  guardrail(b, 1.49, 4.53, 2.7);
  guardrail(b, -4.55, -2.77, 2.64, true);
  guardrail(b, 4.49, -2.77, 2.64, true);
  guardrail(b, -13.83, 9.59, 3.62);
  for (const [x, z] of [[-4.65, 4.56], [4.46, 4.56], [-8.8, 4.58], [8.68, 4.58], [-4.56, -4.44], [4.5, -4.44]]) streetLight(b, x, z, true);
  for (const [x, z] of [[-14.9, 9.61], [-1.09, 10.54], [12.51, 9.68], [8.84, -10.03]]) streetLight(b, x, z);

  const vehicles: ['taxi' | 'car' | 'bus' | 'truck', number, number, string, number][] = [
    ['bus', -14.08, 5.4, '#4b9254', 0], ['taxi', -10.14, 7.46, '#e7c33f', 0],
    ['taxi', -4.01, 5.62, '#e7c33f', 0], ['car', -0.83, 5.65, '#ce6449', 0],
    ['taxi', 2.12, 7.46, '#e7c33f', 2], ['truck', 9.03, 5.45, '#45899e', 0],
    ['taxi', 13.28, 7.46, '#e7c33f', 2], ['car', -14.51, 7.47, '#3c7ea9', 2],
    ['bus', -7.92, -2.87, '#4b9254', 1], ['car', -5.91, -4.67, '#397fa9', 3],
    ['taxi', -7.91, 7.94, '#e7c33f', 1], ['truck', -5.92, -0.02, '#d56747', 3],
    ['taxi', 5.51, 0.1, '#e7c33f', 1], ['car', 7.5, 1.94, '#578f98', 3],
    ['truck', 5.41, -4.4, '#4d899c', 1], ['taxi', 8.21, -11.73, '#e7c33f', 3],
    ['car', -5.88, 7.47, '#c9624f', 1], ['bus', 9.02, -7.79, '#4b9254', 0],
    ['car', -13.35, -7.94, '#db7859', 2], ['truck', -2.32, -7.87, '#4e8d91', 0],
  ];
  vehicles.forEach(([kind, x, z, color, turn]) => transport(b, kind, x, z, color, turn));
  const shirts = ['#a55343', '#38678c', '#6a8d4d', '#c49b58', '#a070a0', '#467f70'];
  for (let i = 0; i < 11; i++) {
    pedestrian(b, -3.86 + i * 0.7, 3.46 + (i % 2) * 0.36, shirts[i % 6]);
  }
  for (let i = 0; i < 7; i++) {
    pedestrian(b, -4.42, -3.53 + i * 0.9, shirts[(i + 2) % 6]);
    pedestrian(b, 4.07, -3.45 + i * 0.9, shirts[(i + 4) % 6]);
  }
  for (let i = 0; i < 8; i++) {
    pedestrian(b, -14.34 + (i % 4) * 1.12, i < 4 ? -1.95 : 4.54, shirts[(i + 1) % 6]);
    pedestrian(b, 9.96 + (i % 4) * 1.07, i < 4 ? -1.97 : 4.54, shirts[(i + 3) % 6]);
  }
  for (let i = 0; i < 5; i++) pedestrian(b, -1.65 + i * 1.12, 10.28, shirts[i % 6]);
  b.part = 'store';
}