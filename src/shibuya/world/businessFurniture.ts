import { Builder } from '../voxel/builder';
import { WORLD, type BusinessScene, type District } from './layout';

function stool(b: Builder, x: number, z: number, side: number) {
  for (const xx of [-0.17, 0.17]) for (const zz of [-0.18, 0.18]) {
    b.box([x + xx - 0.034, WORLD.pavementY, z + zz - 0.034], [0.068, 0.45, 0.068], '#88613e');
  }
  b.box([x - 0.25, WORLD.pavementY + 0.45, z - 0.26], [0.5, 0.062, 0.52], '#b65f45');
  b.box([x - 0.234, WORLD.pavementY + 0.512, z - 0.242], [0.468, 0.022, 0.484], '#d18763');
  b.box([x - side * 0.22 - 0.03, WORLD.pavementY + 0.52, z - 0.24], [0.06, 0.17, 0.48], '#a27448');
}

function ramenCounter(b: Builder, scene: BusinessScene) {
  const { x, z, side } = scene;
  for (const zz of [-1.62, 1.14]) {
    for (const xx of [-0.24, 0.24]) b.box([x + xx - 0.04, WORLD.pavementY, z + zz], [0.08, 0.71, 0.09], '#8b633c');
  }
  b.box([x - 0.31, WORLD.pavementY + 0.31, z - 1.67], [0.62, 0.28, 2.98], '#a67545');
  b.box([x - 0.42, WORLD.pavementY + 0.71, z - 1.82], [0.84, 0.08, 3.31], '#d1a16a');
  b.box([x - 0.4, WORLD.pavementY + 0.79, z - 1.8], [0.8, 0.022, 3.27], '#e8be8c');
  b.panel('activity-ramen', [x - side * 0.332, WORLD.pavementY + 0.55, z - 0.08], [2.57, 0.17], { rotation: [0, -side * Math.PI / 2, 0] });
  for (let seat = 0; seat < 2; seat++) {
    const sz = z - 1.05 + seat * 1.45;
    stool(b, side * 10.08, sz, side);
    b.box([x + side * 0.24 - 0.052, WORLD.pavementY + 0.818, sz + 0.46], [0.104, 0.125, 0.104], '#a85e3d');
    b.box([x + side * 0.24 - 0.055, WORLD.pavementY + 0.943, sz + 0.46], [0.11, 0.035, 0.11], '#384b3b');
  }
  b.box([x + side * 0.1 - 0.085, WORLD.pavementY + 0.818, z + 1.18], [0.17, 0.22, 0.16], '#c3b17c');
  for (let i = 0; i < 4; i++) b.box([x + side * 0.1 - 0.055 + i * 0.03, WORLD.pavementY + 1.035, z + 1.2], [0.016, 0.13, 0.018], '#a47d49');
  b.box([side * 9.45 - 0.23, WORLD.pavementY, z - 2.26], [0.46, 0.7, 0.12], '#a77d4e');
  b.panel('activity-menu', [side * 9.45, WORLD.pavementY + 0.42, z - 2.134], [0.38, 0.51]);
}

function groceryDisplay(b: Builder, scene: BusinessScene) {
  const { x, z, side } = scene;
  b.box([x - 0.3, WORLD.pavementY, z - 1.81], [0.6, 0.7, 2.28], '#aab79c');
  b.box([x + side * 0.24 - 0.035, WORLD.pavementY + 0.7, z - 1.81], [0.07, 0.77, 2.28], '#c5caaa');
  const colors = ['#caa25a', '#87a95e', '#cb7a57', '#d8cda8', '#93bec6', '#b291a7'];
  for (let shelf = 0; shelf < 3; shelf++) {
    const y = WORLD.pavementY + 0.7 + shelf * 0.22;
    b.box([x - 0.31, y, z - 1.84], [0.62, 0.04, 2.34], '#e2d6ac');
    for (let item = 0; item < 9; item++) {
      const zz = z - 1.69 + item * 0.236;
      b.box([x - 0.18, y + 0.044, zz], [0.19, 0.16, 0.16], colors[(item + shelf) % colors.length]);
      b.box([x - side * 0.198 - 0.011, y + 0.087, zz], [0.022, 0.045, 0.16], '#f3e5bb');
    }
  }
  b.panel('activity-shop', [x - side * 0.321, WORLD.pavementY + 0.53, z - 0.66], [1.74, 0.22], { rotation: [0, -side * Math.PI / 2, 0] });
  b.box([x - 0.27, WORLD.pavementY, z + 0.54], [0.54, 0.82, 0.66], '#b18c54');
  b.box([x - 0.33, WORLD.pavementY + 0.82, z + 0.49], [0.66, 0.064, 0.76], '#e0d5af');
  b.box([x - 0.16, WORLD.pavementY + 0.891, z + 0.57], [0.32, 0.13, 0.37], '#819783');
  b.box([x + side * 0.035 - 0.019, WORLD.pavementY + 1.02, z + 0.57], [0.038, 0.24, 0.31], '#3c6559');
  b.box([x - side * 0.019, WORLD.pavementY + 1.06, z + 0.59], [0.023, 0.15, 0.26], '#b4d3b2', { glow: 0.12 });
  for (let i = 0; i < 2; i++) b.box([x - side * 0.26 - 0.05, WORLD.pavementY + 0.89, z + 0.92 + i * 0.028], [0.12, 0.027, 0.16], '#e6cea0');
}

export function buildBusinessFurniture(district: District) {
  const b = new Builder();
  for (const scene of district.businesses) {
    if (scene.kind === 'ramen') ramenCounter(b, scene);
    else groceryDisplay(b, scene);
  }
  return b.finish('ramen', 0);
}