import { Builder } from './builder';
import { ANIMAL_MEMBERS } from './packCatalog';
import { exhibitionFloor, memberLabel, Rig } from './rig';
import type { Vec3 } from './types';

const CREAM = '#f0e5ca';
const DARK = '#36433a';

function eyes(r: Rig, z: number, y: number, spread = 0.23, closed = false) {
  for (const side of [-1, 1]) {
    r.box('head', [side * spread - 0.046, y, z], [0.092, closed ? 0.024 : 0.106, 0.018], DARK);
    if (!closed) r.box('head', [side * spread - 0.035, y + 0.069, z + 0.02], [0.03, 0.029, 0.008], '#fff9e6');
  }
}

function quadruped(b: Builder, id: string, p: Vec3, color: string, tall = false) {
  const r = new Rig(b, `animal_${id}`);
  r.node('root', p, undefined, [0, -0.13, 0], id);
  const legHeight = tall ? 0.93 : 0.57;
  r.node('body', [0, legHeight, 0], 'root');
  r.node('head', [0, 0.46, 0.61], 'body');
  r.box('body', [-0.36, 0, -0.62], [0.72, 0.61, 1.24], color);
  r.box('body', [-0.27, 0.02, -0.46], [0.54, 0.17, 0.98], CREAM);
  r.box('head', [-0.345, 0, -0.285], [0.69, 0.6, 0.57], color);
  r.box('head', [-0.27, 0.07, 0.283], [0.54, 0.24, 0.19], CREAM);
  r.box('head', [-0.097, 0.25, 0.474], [0.194, 0.073, 0.039], DARK);
  r.box('head', [-0.066, 0.145, 0.476], [0.132, 0.027, 0.018], '#956448');
  eyes(r, 0.293, 0.37, 0.208);
  for (const side of [-1, 1]) {
    r.box('head', [side * 0.24 - 0.1, 0.6, -0.14], [0.2, 0.28, 0.26], color);
    r.box('head', [side * 0.24 - 0.079, 0.631, 0.117], [0.158, 0.19, 0.014], '#dca19a');
    for (const end of [-1, 1]) {
      const name = `leg${side}_${end}`;
      r.node(name, [side * 0.235, legHeight + 0.055, end * 0.426], 'root');
      r.box(name, [-0.093, -legHeight + 0.03, -0.09], [0.186, legHeight - 0.035, 0.18], color);
      r.box(name, [-0.104, -legHeight - 0.005, -0.115], [0.208, 0.09, 0.27], id === 'deer' ? '#604f3c' : CREAM);
      r.motion('Play', name, 'rotation', 0, tall ? 0.25 : 0.32, { cycles: 3, phase: side * end < 0 ? Math.PI : 0 });
    }
  }
  r.motion('Play', 'body', 'position', 1, 0.03, { cycles: 3, wave: 'bounce' });
  r.motion('Play', 'head', 'rotation', 1, 0.07, { cycles: 1 });
  return r;
}

function shiba(b: Builder, p: Vec3) {
  const r = quadruped(b, 'shiba', p, '#c69051');
  r.box('body', [-0.37, 0.32, 0.49], [0.74, 0.135, 0.2], '#bb5844');
  r.box('body', [-0.17, 0.02, 0.616], [0.34, 0.39, 0.046], '#d27451');
  r.node('tail', [0, 0.43, -0.63], 'body');
  r.box('tail', [-0.1, 0, -0.52], [0.2, 0.17, 0.52], '#c69051');
  r.box('tail', [-0.13, 0.1, -0.62], [0.26, 0.4, 0.21], '#c69051');
  r.box('tail', [-0.13, 0.4, -0.55], [0.26, 0.19, 0.37], CREAM);
  r.box('tail', [-0.13, 0.26, -0.25], [0.26, 0.27, 0.15], CREAM);
  r.motion('Play', 'tail', 'rotation', 1, 0.52, { cycles: 4 });
  r.motion('Iconic', 'tail', 'rotation', 1, 0.63, { cycles: 4 });
  r.motion('Iconic', 'head', 'rotation', 2, 0.14, { offset: -0.08, cycles: 1 });
}

function kitsune(b: Builder, p: Vec3) {
  const r = quadruped(b, 'kitsune', p, '#ece8d8');
  for (const side of [-1, 1]) {
    r.box('head', [side * 0.25 - 0.061, 0.884, -0.105], [0.122, 0.16, 0.14], '#b55643');
    r.box('head', [side * 0.26 - 0.07, 0.29, 0.3], [0.14, 0.043, 0.018], '#c9674c');
  }
  r.box('body', [-0.38, 0.33, 0.51], [0.76, 0.094, 0.14], '#b3523f');
  r.box('body', [-0.068, 0.24, 0.666], [0.136, 0.15, 0.11], '#d4b158');
  for (let i = -1; i <= 1; i++) {
    const tail = `tail${i}`;
    r.node(tail, [i * 0.17, 0.25, -0.6], 'body', [-0.29, i * 0.55, 0]);
    r.box(tail, [-0.12, 0.015, -0.83], [0.24, 0.24, 0.83], '#e8e2cb');
    r.box(tail, [-0.19, 0.15, -1.04], [0.38, 0.42, 0.54], '#f3edda');
    r.box(tail, [-0.13, 0.57, -0.95], [0.26, 0.22, 0.32], '#f9f3e3');
    r.motion('Play', tail, 'rotation', 1, 0.24, { phase: i * 0.8, cycles: 2 });
    r.motion('Iconic', tail, 'rotation', 1, 0.4, { phase: i * 0.8, cycles: 2 });
  }
  r.motion('Iconic', 'head', 'rotation', 0, 0.33, { cycles: 1, wave: 'positive' });
}

function deer(b: Builder, p: Vec3) {
  const r = quadruped(b, 'deer', p, '#a78252', true);
  for (const side of [-1, 1]) {
    r.box('head', [side * 0.41 - 0.13, 0.46, -0.19], [0.26, 0.17, 0.24], '#b59464');
    r.box('head', [side * 0.22 - 0.038, 0.61, -0.18], [0.076, 0.6, 0.074], '#725a39');
    r.box('head', [side * 0.29 - 0.093, 0.91, -0.19], [0.186, 0.076, 0.077], '#725a39');
    r.box('head', [side * 0.35 - 0.035, 0.98, -0.19], [0.07, 0.26, 0.07], '#725a39');
    for (let i = 0; i < 5; i++) r.box('body', [side * 0.363, 0.24 + (i % 2) * 0.16, -0.46 + i * 0.19], [0.014, 0.067, 0.066], '#e6d5ad');
  }
  r.node('tail', [0, 0.34, -0.66], 'body');
  r.box('tail', [-0.07, -0.09, -0.23], [0.14, 0.24, 0.25], CREAM);
  r.box('root', [0.44, 0.045, 0.91], [0.37, 0.045, 0.32], '#cfb278');
  r.motion('Play', 'tail', 'rotation', 1, 0.2, { cycles: 2 });
  r.motion('Iconic', 'head', 'rotation', 0, 0.65, { cycles: 2, wave: 'positive' });
}

function upright(b: Builder, id: string, p: Vec3, color: string, belly: string) {
  const r = new Rig(b, `animal_${id}`);
  r.node('root', p, undefined, [0, -0.14, 0], id);
  r.node('body', [0, 0.37, 0], 'root');
  r.node('head', [0, 0.78, 0.02], 'body');
  r.box('body', [-0.44, 0, -0.29], [0.88, 0.84, 0.58], color);
  r.box('body', [-0.32, 0.05, 0.294], [0.64, 0.53, 0.105], belly);
  r.box('head', [-0.41, 0, -0.32], [0.82, 0.66, 0.64], color);
  for (const side of [-1, 1]) {
    const arm = side < 0 ? 'armL' : 'armR';
    r.node(arm, [side * 0.46, 0.66, 0.065], 'body');
    r.box(arm, [-0.13, -0.41, -0.12], [0.26, 0.45, 0.24], color);
    r.box(arm, [-0.11, -0.45, 0.02], [0.22, 0.17, 0.18], belly);
    r.box('root', [side * 0.24 - 0.13, 0.016, -0.19], [0.26, 0.38, 0.39], color);
  }
  r.motion('Play', 'body', 'rotation', 2, 0.06, { cycles: 2 });
  r.motion('Iconic', 'body', 'rotation', 2, 0.065, { cycles: 2 });
  return r;
}

function tanuki(b: Builder, p: Vec3) {
  const r = upright(b, 'tanuki', p, '#8e714e', '#c5ae7e');
  r.box('head', [-0.367, 0.24, 0.33], [0.734, 0.18, 0.027], '#514c35');
  r.box('head', [-0.18, 0.08, 0.33], [0.36, 0.23, 0.14], '#c5ae7e');
  r.box('head', [-0.077, 0.285, 0.47], [0.154, 0.064, 0.039], DARK);
  eyes(r, 0.36, 0.27, 0.229);
  for (const x of [-0.42, 0.25]) r.box('head', [x, 0.62, -0.14], [0.17, 0.15, 0.24], '#6b5f43');
  r.box('head', [-0.56, 0.73, -0.47], [1.12, 0.085, 0.94], '#ccab63');
  r.box('head', [-0.37, 0.815, -0.31], [0.74, 0.16, 0.64], '#dec588');
  r.box('head', [-0.25, 0.975, -0.21], [0.5, 0.09, 0.43], '#ebd99b');
  r.node('tail', [0, 0.23, -0.31], 'body', [-0.32, 0, 0]);
  for (let i = 0; i < 4; i++) r.box('tail', [-0.16, -0.04, -0.24 - i * 0.15], [0.32, 0.28, 0.15], i % 2 ? '#9b8459' : '#635741');
  for (const clip of ['Play', 'Iconic']) {
    r.motion(clip, 'armL', 'rotation', 0, 0.31, { offset: -0.5, cycles: 3 });
    r.motion(clip, 'armR', 'rotation', 0, 0.31, { offset: -0.5, cycles: 3, phase: Math.PI });
    r.motion(clip, 'tail', 'rotation', 1, 0.22, { cycles: 2 });
  }
}

function monkey(b: Builder, p: Vec3) {
  const r = upright(b, 'monkey', p, '#ac9b89', '#c4b6a0');
  r.box('head', [-0.292, 0.07, 0.33], [0.584, 0.41, 0.054], '#d69989');
  r.box('head', [-0.22, 0.032, 0.351], [0.44, 0.28, 0.076], '#dba392');
  r.box('head', [-0.057, 0.174, 0.43], [0.114, 0.065, 0.029], '#ad7566');
  eyes(r, 0.386, 0.324, 0.196);
  for (const side of [-1, 1]) r.box('head', [side * 0.44 - 0.085, 0.27, -0.02], [0.17, 0.22, 0.2], '#d69989');
  r.box('head', [-0.27, 0.663, -0.23], [0.54, 0.105, 0.44], '#eeedde');
  r.box('head', [-0.25, 0.768, -0.21], [0.5, 0.04, 0.4], '#fff7e4');
  r.motion('Play', 'armR', 'rotation', 2, 0.19, { offset: 2.35, cycles: 3 });
  r.motion('Play', 'head', 'rotation', 0, 0.15, { cycles: 2 });
  r.motion('Iconic', 'armR', 'rotation', 2, 0.19, { offset: 2.35, cycles: 3 });
}

function capybara(b: Builder, p: Vec3) {
  const r = new Rig(b, 'animal_capybara');
  r.node('root', p, undefined, [0, -0.13, 0], 'capybara');
  r.node('body', [0, 0.4, -0.09], 'root');
  r.node('head', [0, 0.53, 0.58], 'body');
  r.node('yuzu', [0, 0.58, -0.06], 'head');
  r.box('body', [-0.48, 0, -0.75], [0.96, 0.75, 1.5], '#b09265');
  r.box('head', [-0.44, 0, -0.38], [0.88, 0.55, 0.76], '#bda177');
  r.box('head', [-0.38, 0.01, 0.386], [0.76, 0.27, 0.11], '#c1a779');
  r.box('head', [-0.118, 0.19, 0.501], [0.236, 0.045, 0.025], '#8b7857');
  eyes(r, 0.398, 0.339, 0.253, true);
  for (const x of [-0.39, 0.25]) r.box('head', [x, 0.53, -0.27], [0.14, 0.15, 0.18], '#a2835d');
  r.box('yuzu', [-0.17, 0, -0.16], [0.34, 0.25, 0.32], '#e5c959');
  r.box('yuzu', [-0.12, 0.25, -0.1], [0.24, 0.067, 0.2], '#efd883');
  r.box('yuzu', [0.015, 0.31, -0.015], [0.13, 0.034, 0.085], '#6c9b4e');
  // The onsen platform belongs to the activity scene, not to the playable
  // capybara source body. The runner filters setting parts while World adds
  // the same source bath beside the shop.
  b.part = 'setting';
  r.box('root', [-1.01, 0.012, -1.3], [2.02, 0.14, 2.64], '#9b9f8f');
  r.box('root', [-0.91, 0.36, -1.2], [1.82, 0.05, 2.44], '#95c2bb');
  for (const x of [-1.06, 0.81]) for (let i = 0; i < 5; i++) r.box('root', [x, 0.12 + i % 2 * 0.025, -1.34 + i * 0.52], [0.25, 0.49, 0.5], i % 2 ? '#aab2a0' : '#bbc1aa');
  for (const z of [-1.38, 1.12]) for (let i = 0; i < 4; i++) r.box('root', [-0.94 + i * 0.48, 0.12, z], [0.46, 0.48, 0.25], i % 2 ? '#adb6a3' : '#c3c9b5');
  for (let i = 0; i < 3; i++) {
    r.node(`steam${i}`, [0.63 + (i % 2) * 0.16, 0.65 + i * 0.15, -0.57 + i * 0.47], 'root');
    r.box(`steam${i}`, [-0.045, 0, -0.045], [0.09, 0.13, 0.09], '#e8efdf');
    r.motion('Play', `steam${i}`, 'position', 1, 0.27, { cycles: 1, phase: i * 1.8, offset: 0.19 });
    r.motion('Iconic', `steam${i}`, 'position', 1, 0.27, { cycles: 1, phase: i * 1.8, offset: 0.19 });
  }
  for (const clip of ['Play', 'Iconic']) {
    r.motion(clip, 'body', 'position', 1, 0.025, { cycles: 1 });
    r.motion(clip, 'head', 'rotation', 0, 0.065, { cycles: 1 });
    r.motion(clip, 'yuzu', 'rotation', 2, 0.12, { cycles: 2 });
  }
  b.part = 'store';
}

function crane(b: Builder, p: Vec3) {
  const r = new Rig(b, 'animal_crane');
  r.node('root', p, undefined, [0, -0.13, 0], 'crane');
  r.node('body', [0, 1.36, 0], 'root');
  r.node('head', [0, 0.69, 0.16], 'body');
  r.box('body', [-0.34, 0, -0.44], [0.68, 0.65, 0.88], '#edeedc');
  r.box('body', [-0.2, 0.12, -0.66], [0.4, 0.33, 0.37], '#3b453b');
  r.box('head', [-0.095, -0.26, -0.005], [0.19, 0.91, 0.21], '#ececdc');
  r.box('head', [-0.075, -0.2, 0.213], [0.15, 0.62, 0.028], '#414a3d');
  r.box('head', [-0.17, 0.63, -0.08], [0.34, 0.28, 0.36], '#f0eedb');
  r.box('head', [-0.124, 0.911, -0.06], [0.248, 0.066, 0.25], '#c55844');
  r.box('head', [-0.064, 0.69, 0.285], [0.128, 0.075, 0.49], '#bfa972');
  eyes(r, 0.289, 0.785, 0.11);
  for (const side of [-1, 1]) {
    const wing = side < 0 ? 'wingL' : 'wingR';
    const leg = side < 0 ? 'legL' : 'legR';
    r.node(wing, [side * 0.31, 0.47, -0.04], 'body');
    r.box(wing, [side < 0 ? -0.87 : 0.03, -0.13, -0.39], [0.84, 0.15, 0.79], '#e3e4d0');
    for (let i = 0; i < 4; i++) r.box(wing, [side < 0 ? -1.12 + i * 0.17 : 0.52 + i * 0.17, -0.12, -0.45 + i * 0.09], [0.18, 0.14, 0.65 - i * 0.08], '#41493c');
    r.node(leg, [side * 0.14, 1.37, 0.03], 'root');
    r.box(leg, [-0.033, -1.32, -0.03], [0.066, 1.34, 0.06], '#6c755d');
    r.box(leg, [-0.076, -1.36, -0.06], [0.152, 0.045, 0.37], '#6c755d');
    for (const clip of ['Play', 'Iconic']) r.motion(clip, wing, 'rotation', 2, side * 0.81, { cycles: 2 });
  }
  r.motion('Play', 'legL', 'rotation', 0, -0.25, { wave: 'positive', cycles: 2 });
  r.motion('Iconic', 'head', 'rotation', 1, 0.19, { cycles: 1 });
}

function neko(b: Builder, p: Vec3) {
  const r = upright(b, 'neko', p, '#edead6', '#f5efda');
  for (const side of [-1, 1]) {
    r.box('head', [side * 0.26 - 0.096, 0.66, -0.18], [0.192, 0.22, 0.25], '#edead6');
    r.box('head', [side * 0.26 - 0.06, 0.69, 0.078], [0.12, 0.145, 0.014], '#d99b93');
    r.box('head', [side * 0.29 - 0.076, 0.2, 0.349], [0.152, 0.028, 0.017], '#796f53');
  }
  eyes(r, 0.328, 0.384, 0.216);
  r.box('head', [-0.053, 0.256, 0.337], [0.106, 0.073, 0.026], '#bf796e');
  r.box('head', [-0.022, 0.18, 0.343], [0.044, 0.065, 0.016], '#76614c');
  r.box('body', [-0.43, 0.69, -0.312], [0.86, 0.105, 0.644], '#b95640');
  r.box('body', [-0.073, 0.54, 0.333], [0.146, 0.17, 0.072], '#e1c269');
  r.box('body', [0.024, 0.08, 0.412], [0.38, 0.54, 0.06], '#dfba61');
  r.box('body', [0.1, 0.25, 0.477], [0.23, 0.046, 0.013], '#8f7844');
  r.box('body', [0.13, 0.15, 0.477], [0.17, 0.28, 0.013], '#8f7844');
  r.node('tail', [0, 0.05, -0.32], 'body');
  r.box('tail', [-0.09, -0.07, -0.51], [0.18, 0.16, 0.53], '#d8c793');
  r.box('tail', [-0.09, 0.075, -0.51], [0.18, 0.35, 0.17], '#d8c793');
  for (const clip of ['Play', 'Iconic']) {
    r.motion(clip, 'armL', 'rotation', 0, 0.3, { offset: -2.45, cycles: 3 });
    r.motion(clip, 'head', 'rotation', 2, 0.055, { cycles: 1 });
  }
}

const BUILDERS: Record<string, (b: Builder, p: Vec3) => void> = { shiba, tanuki, kitsune, deer, monkey, capybara, crane, neko };

export function buildAnimals(focus?: string | null) {
  const b = new Builder();
  const members = focus ? ANIMAL_MEMBERS.filter(item => item.id === focus) : ANIMAL_MEMBERS;
  if (!members.length) throw new Error('Unknown animal.');
  exhibitionFloor(b, focus ? 5.7 : 17.6, focus ? 5.9 : 10.9, '#d1ddbf');
  members.forEach(member => {
    const index = ANIMAL_MEMBERS.findIndex(item => item.id === member.id);
    const x = focus ? 0 : (index % 4 - 1.5) * 4.13;
    const z = focus ? -0.22 : Math.floor(index / 4) * 4.9 - 2.7;
    BUILDERS[member.id](b, [x, 0.15, z]);
    memberLabel(b, member, x, z + 1.72, index, 3.15);
  });
  return b.finish('animals', 0.15);
}