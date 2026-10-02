import { Builder } from './builder';
import {
  airConditioner, base, bush, greenTree, officeBlock, pedestrian,
  taxi, yamanote,
} from './landmarkKit';
import { addShibuyaNeighborhood } from './shibuyaDistrict';

function trafficLight(b: Builder, x: number, z: number) {
  b.box([x, 0.73, z], [0.12, 2.63, 0.12], '#748d87');
  b.box([x - 0.42, 3.21, z], [1.18, 0.38, 0.3], '#293e3b');
  for (let i = 0; i < 3; i++) b.box([x - 0.31 + i * 0.35, 3.28, z + 0.303], [0.22, 0.22, 0.012],
    ['#e85738', '#d8a449', '#75bd59'][i], { glow: i === 2 ? 0.75 : 0 });
  b.box([x - 0.05, 1.63, z + 0.12], [0.22, 0.43, 0.12], '#293e3b');
  b.box([x + 0.02, 1.72, z + 0.247], [0.08, 0.18, 0.008], '#8fdc6b', { glow: 0.5 });
}

function mast(b: Builder, x: number, y: number, z: number, height = 2.1) {
  for (let i = 0; i < 8; i++) {
    const half = 0.25 - i * 0.022;
    b.box([x - half, y + i * height / 8, z - half], [half * 2, 0.037, half * 2], '#adc1c5');
    for (const side of [-1, 1]) {
      b.line([x + side * half, y + i * height / 8, z - half],
        [x - side * half * 0.91, y + (i + 1) * height / 8, z - half * 0.91], 0.028, '#7f959c');
    }
  }
  b.box([x - 0.025, y, z - 0.025], [0.05, height + 0.3, 0.05], '#80989f');
  b.box([x - 0.035, y + height + 0.3, z - 0.035], [0.07, 0.12, 0.07], '#f96d44', { glow: 0.8 });
}

function dish(b: Builder, x: number, y: number, z: number) {
  b.box([x - 0.2, y, z - 0.21], [0.4, 0.12, 0.42], '#718b94');
  b.box([x - 0.045, y + 0.12, z - 0.045], [0.09, 0.46, 0.09], '#77929b');
  for (let i = -3; i <= 3; i++) {
    const height = Math.abs(i) === 3 ? 0.39 : Math.abs(i) === 2 ? 0.67 : 0.87;
    b.box([x + i * 0.15 - 0.075, y + 0.55 - height / 2, z], [0.15, height, 0.105], '#e1e5d8', { rotation: [-0.55, 0, 0] });
  }
  b.line([x, y + 0.55, z + 0.06], [x + 0.27, y + 0.71, z + 0.48], 0.036, '#647f8b');
  b.box([x + 0.23, y + 0.68, z + 0.45], [0.1, 0.11, 0.12], '#567686');
}

function terrace(b: Builder, x: number, y: number, z: number, width: number, depth: number) {
  b.box([x, y, z], [width, 0.12, depth], '#b6c9c3');
  b.box([x - 0.035, y + 0.12, z + depth - 0.06], [width + 0.07, 0.3, 0.065], '#618fa0');
  b.box([x + width - 0.06, y + 0.12, z], [0.065, 0.3, depth], '#618fa0');
  for (let i = 0; i < Math.floor(width / 0.73); i++) bush(b, x + 0.38 + i * 0.73, z + depth - 0.38, 0.38, y + 0.12);
}

export function buildSkyscraper() {
  const b = new Builder();
  addShibuyaNeighborhood(b);
  officeBlock(b, -3.84, -3.3, 7.68, 6.23, 3.64, 3, '#476678');
  b.box([-3.56, 0.83, 2.965], [7.1, 2.14, 0.026], '#72bcca');
  for (const x of [-3.62, -1.16, 1.04, 3.45]) b.box([x, 0.74, 2.95], [0.13, 3.58, 0.15], '#d0dedb');
  b.box([-0.79, 0.74, 3.0], [1.58, 2.0, 0.055], '#9cdad8');
  b.box([-0.035, 0.76, 3.065], [0.07, 1.97, 0.018], '#e6ebdf');
  b.panel('sign-office', [0, 3.51, 2.96], [4.75, 0.63], { glow: 0.3 });
  b.box([-3.89, 4.38, -3.35], [7.78, 0.14, 6.33], '#b9cdca');
  terrace(b, -3.88, 4.53, -3.29, 7.76, 6.23);
  officeBlock(b, -2.9, -2.74, 5.8, 5.15, 15.19, 18, '#adc3ca', 4.68);
  for (const x of [-2.98, -1.58, 1.48, 2.86]) b.box([x, 4.68, 2.445], [0.09, 15.19, 0.075], '#3f5b6e');
  for (const z of [-2.76, -1.31, 1.15, 2.35]) b.box([2.945, 4.68, z], [0.075, 15.19, 0.09], '#3f5b6e');
  b.box([1.45, 11.21, 2.51], [1.73, 3.64, 0.33], '#53788c');
  for (let i = 0; i < 4; i++) {
    const y = 11.45 + i * 0.82;
    b.box([1.57, y, 2.854], [1.48, 0.44, 0.03], '#8bd2df', { glow: 0.08 });
    b.box([1.44, y + 0.46, 2.51], [1.76, 0.095, 0.43], '#c1d1cc');
  }
  terrace(b, 1.18, 11.07, 2.43, 2.17, 0.97);
  terrace(b, 2.77, 8.52, -1.75, 0.82, 3.43);
  b.box([-3.05, 19.98, -2.89], [6.1, 1.09, 5.43], '#24465f');
  for (let i = 0; i < 26; i++) b.box([-2.98 + i * 0.23, 20.04, 2.544], [0.048, 0.98, 0.022], '#648395');
  for (let i = 0; i < 23; i++) b.box([3.054, 20.04, -2.83 + i * 0.23], [0.022, 0.98, 0.048], '#648395');
  b.panel('sign-tower', [0, 19.59, 2.5], [4.05, 0.53], { glow: 0.25 });
  b.box([-2.81, 17.97, 2.484], [2.37, 1.66, 0.08], '#284c63');
  b.panel('shibuya-tower-large', [-1.625, 18.8, 2.572], [2.31, 1.57], { glow: 0.28 });
  b.box([-3.15, 21.07, -2.99], [6.3, 0.17, 5.63], '#8fadb5');
  b.box([-2.92, 21.24, -2.76], [5.84, 0.05, 5.17], '#b1c3be');
  b.box([-1.38, 21.29, -1.4], [2.76, 0.18, 2.76], '#596e79');
  b.panel('helipad', [0, 21.476, -0.02], [2.73, 2.73], { rotation: [-Math.PI / 2, 0, 0] });
  mast(b, -2.34, 21.3, -1.92, 2.17);
  dish(b, 1.93, 21.3, -1.67);
  dish(b, 2.27, 21.3, 0.17);
  mast(b, -1.42, 21.3, -2.21, 1.65);
  airConditioner(b, -2.54, 21.3, 0.15, 0.83);
  airConditioner(b, 1.61, 21.3, 0.93, 0.76);
  bush(b, -1.72, 1.69, 0.31, 21.3);
  b.box([2.54, 21.3, -2.29], [0.047, 1.68, 0.047], '#7798a5');
  b.box([-2.9, 21.3, 2.24], [0.047, 1.15, 0.047], '#7798a5');
  for (const z of [-2.82, 2.45]) {
    b.box([-2.9, 21.3, z], [5.79, 0.35, 0.04], '#567789');
    b.box([-2.9, 21.65, z], [5.79, 0.04, 0.04], '#b5c9c9');
  }
  for (const x of [-2.93, 2.93]) {
    b.box([x, 21.3, -2.82], [0.04, 0.35, 5.31], '#567789');
    b.box([x, 21.65, -2.82], [0.04, 0.04, 5.31], '#b5c9c9');
  }
  for (const x of [-2.95, 2.95]) for (const z of [-2.85, 2.43]) {
    b.box([x - 0.035, 21.69, z - 0.035], [0.07, 0.1, 0.07], '#ed7654', { glow: 0.9 });
  }
  return b.finish('skyscraper');
}

function voxelDisc(b: Builder, y: number, radius: number, height: number, color: string) {
  const step = 0.4;
  const count = Math.floor(radius / step);
  for (let i = -count; i <= count; i++) {
    const z = i * step;
    const half = Math.floor(Math.sqrt(Math.max(0, radius * radius - z * z)) / step) * step;
    if (half > 0) b.box([-half, y, z - step / 2], [half * 2, height, step], color);
  }
}

export function build109() {
  const b = new Builder();
  base(b, 'shibuya109', 13.6, 12.5);
  b.part = 'setting';
  greenTree(b, -5.1, 1.96, 0.83);
  greenTree(b, 4.96, 2.06, 0.82);
  taxi(b, 1.26, 5.02);
  pedestrian(b, -1.9, 4.17, '#a4654e');
  pedestrian(b, 1.23, 4.08, '#467e60');
  b.part = 'store';
  voxelDisc(b, 0.73, 3.4, 12.9, '#c8d5cd');
  for (let floor = 0; floor < 11; floor++) {
    const y = 1.46 + floor * 1.075;
    voxelDisc(b, y, 3.52, 0.34, floor % 3 === 0 ? '#82c2d1' : '#5c8ba5');
    voxelDisc(b, y + 0.35, 3.57, 0.075, '#f0efdd');
  }
  voxelDisc(b, 13.63, 3.45, 0.26, '#6f8e93');
  voxelDisc(b, 13.89, 2.97, 0.12, '#b6c6bb');
  b.box([-0.39, 14.0, -0.32], [0.78, 2.3, 0.64], '#abbdb6');
  b.box([-1.63, 15.23, -0.21], [3.26, 1.48, 0.36], '#eee9da');
  b.panel('sign-109', [0, 15.97, 0.157], [3.04, 1.31], { glow: 0.4 });
  b.panel('sign-109', [0, 15.97, -0.218], [3.04, 1.31], { rotation: [0, Math.PI, 0], glow: 0.4 });
  b.box([-1.5, 0.75, 3.02], [3.0, 1.9, 0.52], '#79b5bb');
  for (const x of [-1.52, -0.04, 1.39]) b.box([x, 0.73, 3.55], [0.1, 1.96, 0.08], '#e2e6d5');
  b.box([-1.87, 2.66, 3.04], [3.74, 0.32, 0.86], '#dc5747');
  b.panel('sign-109', [0, 2.82, 3.908], [1.0, 0.27], { glow: 0.3 });
  return b.finish('shibuya109');
}

export function buildQFront() {
  const b = new Builder();
  base(b, 'qfront', 13.8, 12.6);
  b.part = 'setting';
  greenTree(b, -4.97, 2.29, 0.85);
  taxi(b, 1.08, 5.06);
  pedestrian(b, -1.39, 3.67, '#a6614b');
  pedestrian(b, 2.71, 3.55, '#567f62');
  b.part = 'store';
  officeBlock(b, -3.46, -2.77, 6.92, 5.35, 13.24, 13, '#b7c4c0');
  b.box([-3.28, 5.5, 2.656], [6.56, 7.76, 0.22], '#2a454d');
  b.panel('led-screen', [0, 9.4, 2.884], [6.24, 7.39], { glow: 0.55 });
  b.box([-3.53, 4.98, 2.58], [7.06, 0.2, 0.34], '#e2e0c5');
  b.box([-3.18, 0.76, 2.661], [6.36, 2.2, 0.025], '#8fc3c1');
  b.box([-3.56, 2.98, 2.59], [7.12, 0.42, 0.55], '#2d7e58');
  b.panel('sign-cafe', [0, 3.185, 3.152], [4.48, 0.32], { glow: 0.3 });
  for (const x of [-3.1, -1.56, 0, 1.51, 3.03]) b.box([x, 0.75, 2.706], [0.082, 2.19, 0.027], '#ece6cf');
  airConditioner(b, -2.57, 14.24, -2.09, 1.0);
  mast(b, 2.19, 14.25, -1.73, 1.52);
  return b.finish('qfront');
}

export function buildStation() {
  const b = new Builder();
  base(b, 'station', 15.0, 12.9);
  b.part = 'setting';
  greenTree(b, -5.66, 1.35, 0.89);
  greenTree(b, 5.48, 1.46, 0.8);
  pedestrian(b, -1.83, 4.12, '#b08448');
  pedestrian(b, -0.21, 3.9, '#507c65');
  pedestrian(b, 1.01, 3.84, '#3d6592');
  b.part = 'store';
  b.box([-4.62, 0.73, -2.78], [9.24, 3.48, 5.47], '#e4e4d1');
  b.box([-4.64, 3.25, -2.8], [9.28, 0.35, 5.51], '#419348');
  b.box([-4.86, 4.21, -3.02], [9.72, 0.25, 5.95], '#405e71');
  for (let i = 0; i < 4; i++) {
    const x = -3.95 + i * 2.1;
    b.box([x, 0.74, 2.701], [1.51, 2.02, 0.025], '#578a9b');
    b.box([x + 0.1, 0.8, 2.731], [1.3, 1.87, 0.027], '#97d0d0');
    b.box([x + 0.713, 0.8, 2.76], [0.05, 1.85, 0.035], '#dce8d7');
    b.box([x + 0.23, 0.74, 2.12], [0.16, 0.74, 0.46], '#769585');
  }
  b.panel('sign-station', [0, 3.05, 2.702], [4.21, 0.47], { glow: 0.35 });
  b.box([-5.3, 4.46, -2.39], [10.6, 0.38, 2.3], '#879da0');
  for (const z of [-2.1, -0.47]) b.box([-5.3, 4.846, z], [10.6, 0.06, 0.085], '#d1d9ce');
  for (let i = 0; i < 24; i++) b.box([-5.24 + i * 0.44, 4.842, -2.28], [0.08, 0.07, 2.06], '#635848');
  yamanote(b, -5.02, 4.94, -2.09, 10.04);
  b.box([-4.7, 5.91, -2.14], [0.045, 1.0, 0.045], '#6b8686');
  b.box([4.63, 5.91, -2.14], [0.045, 1.0, 0.045], '#6b8686');
  b.box([-4.7, 6.91, -2.14], [9.38, 0.035, 0.04], '#647a79');
  b.box([2.29, 0.73, 3.26], [1.32, 0.52, 1.15], '#8c9c8b');
  b.box([2.48, 1.25, 3.42], [0.86, 0.6, 0.68], '#846b45');
  b.box([2.72, 1.71, 3.71], [0.46, 0.59, 0.39], '#977951');
  b.box([2.69, 2.28, 3.76], [0.53, 0.3, 0.43], '#95764c');
  for (const x of [2.72, 3.06]) b.box([x, 2.58, 3.8], [0.13, 0.2, 0.14], '#755d3d');
  b.box([2.81, 2.37, 4.19], [0.34, 0.15, 0.19], '#a28455');
  b.box([2.91, 2.45, 4.372], [0.11, 0.064, 0.019], '#4e4833');
  b.box([2.74, 1.26, 4.07], [0.17, 0.74, 0.17], '#80643e');
  b.box([3.05, 1.26, 4.07], [0.17, 0.74, 0.17], '#80643e');
  b.box([2.46, 1.4, 3.26], [0.19, 0.17, 0.27], '#846b45');
  b.panel('sign-hachiko', [2.95, 0.982, 4.416], [0.81, 0.2]);
  return b.finish('station');
}

export function buildNeon() {
  const b = new Builder();
  base(b, 'neon', 12.8, 11.7);
  b.part = 'setting';
  greenTree(b, -4.68, 1.2, 0.78);
  pedestrian(b, 1.11, 3.27, '#a27c49');
  b.part = 'store';
  officeBlock(b, -2.8, -2.6, 5.6, 4.8, 10.91, 11, '#9aaba2');
  for (let i = 0; i < 7; i++) {
    const y = 1.8 + i * 1.28;
    b.box([-2.84, y, 2.29], [1.45, 1.06, 0.25], '#253f40');
    b.panel(`neon-board-${i}`, [-2.115, y + 0.53, 2.548], [1.27, 0.9], { glow: 0.64 });
  }
  b.box([2.77, 2.67, 0.22], [0.3, 6.7, 1.21], '#233d49');
  b.panel('vertical-neon', [3.079, 6.025, 0.825], [1.01, 6.42], { rotation: [0, Math.PI / 2, 0], glow: 0.58 });
  b.box([-1.12, 0.75, 2.234], [3.76, 1.71, 0.04], '#a6cbbb');
  b.box([-1.32, 2.43, 2.22], [4.16, 0.38, 0.37], '#aa507e');
  b.panel('sign-store', [0.75, 2.63, 2.597], [3.66, 0.29], { glow: 0.45 });
  b.box([-2.16, 11.92, 0.5], [0.14, 1.47, 0.14], '#728b81');
  b.box([1.97, 11.92, 0.5], [0.14, 1.47, 0.14], '#728b81');
  b.box([-2.49, 13.01, 0.41], [4.98, 1.73, 0.25], '#25414a');
  b.panel('sign-neon', [0, 13.875, 0.668], [4.78, 1.53], { glow: 0.58 });
  airConditioner(b, -1.84, 11.92, -2.1, 0.85);
  return b.finish('neon');
}

export function buildIzakaya() {
  const b = new Builder();
  base(b, 'izakaya', 12.8, 11.5);
  b.part = 'setting';
  greenTree(b, -4.8, -0.1, 0.85);
  pedestrian(b, 2.65, 3.52, '#78843f');
  b.part = 'store';
  for (let unit = 0; unit < 2; unit++) {
    const x = -3.3 + unit * 3.44;
    const h = 3.57 + unit * 0.46;
    b.box([x, 0.73, -2.49], [3.15, h, 4.3], unit ? '#79503b' : '#9e693d');
    for (let row = 0; row < 12; row++) b.box([x, 0.88 + row * h / 12, 1.816], [3.15, 0.024, 0.009], '#604b34');
    b.box([x + 0.22, 0.74, 1.824], [1.12, 2.02, 0.055], '#b98846');
    b.box([x + 0.31, 1.31, 1.884], [0.92, 1.03, 0.026], '#5e8984', { glow: 0.14 });
    b.box([x + 1.63, 1.21, 1.824], [1.08, 0.96, 0.034], '#eacfa1', { glow: 0.27 });
    b.box([x + 0.57, 3.19, 1.824], [1.61, 0.59, 0.034], '#b8d3bd', { glow: unit ? 0 : 0.24 });
    b.box([x + 0.13, 2.0, 1.916], [1.31, 0.72, 0.045], unit ? '#c54730' : '#334f67');
    for (let curtain = 0; curtain < 3; curtain++) b.box([x + 0.16 + curtain * 0.42, 2.02, 1.964], [0.35, 0.05, 0.008], '#e4d5ac');
    b.box([x - 0.13, 2.71, 1.76], [3.42, 0.15, 0.64], '#42544a');
    for (let layer = 0; layer < 4; layer++) {
      b.box([x - 0.18 + layer * 0.18, 0.73 + h + layer * 0.13, -2.7 + layer * 0.15],
        [3.51 - layer * 0.36, 0.12, 4.72 - layer * 0.3], unit ? '#53665e' : '#3e514d');
    }
    for (let lamp = 0; lamp < 3; lamp++) {
      const xx = x + 0.3 + lamp * 1.0;
      b.box([xx + 0.11, 3.19, 2.18], [0.04, 0.35, 0.05], '#354235');
      b.box([xx, 2.58, 2.05], [0.31, 0.55, 0.31], lamp % 2 ? '#e8b65f' : '#e9522c', { glow: 0.35 });
      b.box([xx - 0.02, 2.55, 2.03], [0.35, 0.055, 0.35], '#343d30');
      b.box([xx - 0.02, 3.14, 2.03], [0.35, 0.055, 0.35], '#343d30');
      b.panel('lantern', [xx + 0.155, 2.875, 2.37], [0.2, 0.41], { glow: 0.3 });
    }
    airConditioner(b, x + 0.5, h + 1.25, -1.8, 0.65);
    b.box([x + 1.82, h + 1.11, -1.35], [0.26, 0.69, 0.26], '#a6b9aa');
    b.box([x + 0.4, 0.73, 2.81], [1.86, 0.1, 0.54], '#b68247');
    b.box([x + 0.5, 0.83, 2.86], [0.11, 0.41, 0.4], '#8b5b32');
    b.box([x + 2.02, 0.83, 2.86], [0.11, 0.41, 0.4], '#8b5b32');
    b.box([x + 0.35, 1.24, 2.79], [1.96, 0.11, 0.59], '#c39652');
  }
  b.panel('sign-izakaya', [-1.71, 4.05, 1.822], [2.39, 0.31], { glow: 0.28 });
  for (let i = 0; i < 3; i++) {
    b.box([3.47, 0.73 + i * 0.32, 0.91], [0.58, 0.28, 0.55], i % 2 ? '#be3d2a' : '#d1a73b');
    for (let col = 0; col < 4; col++) b.box([3.52 + col * 0.13, 0.77 + i * 0.32, 1.466], [0.057, 0.13, 0.009], '#3b4e35');
  }
  b.box([-4.06, 0.73, 1.07], [0.55, 0.73, 0.47], '#627f71');
  return b.finish('izakaya');
}

export function buildCrossing() {
  const b = new Builder();
  base(b, 'crossing', 13.0, 13.0);
  b.part = 'setting';
  greenTree(b, -5.5, -4.7, 0.67);
  greenTree(b, 5.03, -4.68, 0.67);
  b.part = 'store';
  b.box([-5.8, 0.73, -5.8], [11.6, 0.21, 11.6], '#455a62');
  for (const x of [-5.8, 3.75]) {
    for (const z of [-5.8, 3.75]) b.box([x, 0.94, z], [2.05, 0.13, 2.05], '#c9d1c0');
  }
  for (let i = 0; i < 9; i++) {
    const a = -2.35 + i * 0.56;
    for (const side of [-1, 1]) {
      b.box([a, 0.947, side === 1 ? 3.43 : -5.28], [0.29, 0.019, 1.86], '#f4f1dc');
      b.box([side === 1 ? 3.43 : -5.28, 0.947, a], [1.86, 0.019, 0.29], '#f4f1dc');
    }
  }
  for (let i = 0; i < 7; i++) {
    b.box([-1.61 + i * 0.47, 0.947, -1.54 + i * 0.47], [0.27, 0.019, 2.05], '#ebe9d9', { rotation: [0, -Math.PI / 4, 0] });
    b.box([-1.61 + i * 0.47, 0.947, 1.54 - i * 0.47], [0.27, 0.019, 2.05], '#ebe9d9', { rotation: [0, Math.PI / 4, 0] });
  }
  for (const [x, z] of [[-4.2, -4.15], [4.15, 4.06], [-4.18, 4.16], [4.14, -4.18]]) trafficLight(b, x, z);
  taxi(b, 0.71, -4.36, '#eac34c', false, 0.94);
  for (const [x, z, color] of [[-1.2, -0.35, '#b96c4a'], [0.65, 1.1, '#577844'], [1.65, -1.64, '#5d82a0'], [-4.61, 4.31, '#a46170']] as [number, number, string][]) {
    pedestrian(b, x, z, color, 0.97);
  }
  return b.finish('crossing');
}