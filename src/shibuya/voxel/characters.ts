import { Builder } from './builder';
import { CHARACTER_MEMBERS } from './packCatalog';
import { exhibitionFloor, memberLabel, Rig } from './rig';
import type { Vec3 } from './types';

const SKIN = '#e7bd91';
const HAIR = '#303c37';
const IVORY = '#f1eedb';

interface PersonStyle {
  shirt: string;
  pants: string;
  skin?: string;
  shoe?: string;
  width?: number;
  bareArms?: boolean;
  hair?: string;
}

export function humanoid(b: Builder, prefix: string, p: Vec3, style: PersonStyle, member?: string) {
  const r = new Rig(b, prefix);
  const skin = style.skin ?? SKIN;
  const width = style.width ?? 0.82;
  const legWidth = width > 1 ? 0.36 : 0.28;
  r.node('root', p, undefined, undefined, member);
  r.node('body', [0, 1.03, 0], 'root');
  r.node('head', [0, 0.96, 0], 'body');
  r.box('body', [-width / 2, 0, -0.255], [width, 0.9, 0.51], style.shirt);
  r.box('body', [-0.11, 0.9, -0.095], [0.22, 0.1, 0.19], skin);
  r.box('head', [-0.365, 0, -0.31], [0.73, 0.72, 0.62], skin);
  r.box('head', [-0.395, 0.27, -0.07], [0.065, 0.18, 0.18], skin);
  r.box('head', [0.33, 0.27, -0.07], [0.065, 0.18, 0.18], skin);
  for (const x of [-0.23, 0.12]) {
    r.box('head', [x, 0.35, 0.315], [0.105, 0.115, 0.02], '#2b3632');
    r.box('head', [x + 0.059, 0.398, 0.338], [0.031, 0.035, 0.009], '#faf7e9');
    r.box('head', [x - 0.011, 0.49, 0.316], [0.129, 0.027, 0.021], style.hair ?? HAIR);
  }
  r.box('head', [-0.053, 0.255, 0.315], [0.106, 0.089, 0.065], '#d4a27c');
  r.box('head', [-0.076, 0.15, 0.318], [0.152, 0.035, 0.026], '#ae7159');
  r.box('head', [-0.38, 0.645, -0.325], [0.76, 0.13, 0.66], style.hair ?? HAIR);
  r.box('head', [-0.376, 0.45, -0.327], [0.753, 0.26, 0.09], style.hair ?? HAIR);
  for (const side of [-1, 1]) {
    const suffix = side < 0 ? 'L' : 'R';
    const legX = side * (width > 1 ? 0.3 : 0.21);
    r.node(`leg${suffix}`, [legX, 1.04, 0], 'root');
    r.node(`knee${suffix}`, [0, -0.46, 0], `leg${suffix}`);
    r.box(`leg${suffix}`, [-legWidth / 2, -0.46, -0.15], [legWidth, 0.47, 0.3], style.pants);
    r.box(`knee${suffix}`, [-legWidth / 2, -0.45, -0.15], [legWidth, 0.46, 0.3], style.pants);
    r.box(`knee${suffix}`, [-legWidth / 2 - 0.018, -0.57, -0.19], [legWidth + 0.036, 0.12, 0.45], style.shoe ?? '#354039');
    const armWidth = width > 1 ? 0.32 : 0.23;
    r.node(`arm${suffix}`, [side * (width / 2 + armWidth / 2 + 0.016), 0.78, 0], 'body', [0, 0, side * 0.065]);
    r.node(`fore${suffix}`, [0, -0.37, 0], `arm${suffix}`);
    r.box(`arm${suffix}`, [-armWidth / 2, -0.365, -0.142], [armWidth, 0.44, 0.285], style.bareArms ? skin : style.shirt);
    r.box(`fore${suffix}`, [-armWidth / 2 + 0.015, -0.3, -0.127], [armWidth - 0.03, 0.31, 0.255], style.bareArms ? skin : style.shirt);
    r.box(`fore${suffix}`, [-armWidth / 2 + 0.008, -0.43, -0.135], [armWidth - 0.016, 0.16, 0.27], skin);
  }
  return r;
}

function glasses(r: Rig, black = false) {
  for (const x of [-0.279, 0.069]) {
    r.box('head', [x, 0.337, 0.337], [0.22, 0.157, 0.031], '#273c3a');
    if (!black) r.box('head', [x + 0.025, 0.362, 0.371], [0.17, 0.107, 0.011], '#8ab9b5');
  }
  r.box('head', [-0.065, 0.391, 0.339], [0.133, 0.029, 0.033], '#354440');
}

function obi(r: Rig, color: string, knot = false) {
  r.box('body', [-0.439, 0.12, -0.28], [0.878, 0.24, 0.56], color);
  if (knot) r.box('body', [-0.29, 0.18, -0.42], [0.58, 0.39, 0.15], color);
}

function headband(r: Rig, color = '#d45d46') {
  r.box('head', [-0.389, 0.568, -0.338], [0.778, 0.09, 0.683], color);
  r.box('head', [-0.09, 0.577, 0.351], [0.18, 0.07, 0.015], IVORY);
  r.box('head', [0.13, 0.48, -0.377], [0.085, 0.34, 0.06], color);
  r.box('head', [-0.01, 0.41, -0.369], [0.09, 0.42, 0.06], color);
}

function skirt(r: Rig, color: string, long = false) {
  const y = long ? -0.73 : -0.21;
  const height = long ? 0.85 : 0.32;
  r.box('body', [-0.46, y, -0.29], [0.92, height, 0.58], color);
  for (let i = 0; i < 7; i++) r.box('body', [-0.437 + i * 0.126, y + 0.03, 0.297], [0.026, height - 0.04, 0.012], '#fff0d3');
}

function ramenBowl(r: Rig, node: string, y = -0.39, z = 0.14) {
  r.box(node, [-0.19, y, z], [0.38, 0.06, 0.35], IVORY);
  r.box(node, [-0.26, y + 0.06, z - 0.055], [0.52, 0.2, 0.46], '#f5ebd0');
  r.box(node, [-0.28, y + 0.26, z - 0.065], [0.56, 0.055, 0.48], '#e6bd6b');
  for (let i = 0; i < 4; i++) r.box(node, [-0.19, y + 0.318, z - 0.01 + i * 0.08], [0.26, 0.02, 0.027], '#f5d381');
  r.box(node, [0.055, y + 0.32, z + 0.14], [0.15, 0.03, 0.13], '#f9f3db');
  r.box(node, [0.095, y + 0.352, z + 0.17], [0.066, 0.015, 0.065], '#f4b849');
  r.box(node, [-0.23, y + 0.32, z + 0.1], [0.09, 0.17, 0.11], '#476b44');
}

function addOutfit(r: Rig, id: string) {
  if (id === 'yakuza') {
    r.box('body', [-0.143, 0.4, 0.26], [0.286, 0.46, 0.019], SKIN);
    for (const side of [-1, 1]) {
      for (let i = 0; i < 4; i++) r.box('body', [side * (0.115 + i * 0.035) - 0.045, 0.69 - i * 0.067, 0.281], [0.08, 0.09, 0.024], '#e5e4d4');
    }
    glasses(r, true);
    r.box('head', [-0.283, 0.734, -0.23], [0.568, 0.14, 0.53], '#28342f');
    for (let i = 0; i < 7; i++) r.box('head', [-0.265 + i * 0.084, 0.88, -0.215], [0.027, 0.025, 0.45], '#586459');
    r.box('body', [-0.11, 0.585, 0.3], [0.22, 0.028, 0.025], '#d9b45c');
    r.box('body', [-0.039, 0.46, 0.299], [0.078, 0.09, 0.024], '#e7bf5d');
    r.box('body', [0.25, 0.53, 0.266], [0.095, 0.066, 0.018], '#d5a249');
  } else if (id === 'samurai') {
    r.box('body', [-0.32, 0.15, 0.265], [0.64, 0.65, 0.16], '#94493b');
    for (let i = 0; i < 5; i++) r.box('body', [-0.335, 0.19 + i * 0.124, 0.422], [0.67, 0.033, 0.018], '#dfb569');
    for (const side of ['L', 'R']) {
      r.box(`arm${side}`, [-0.17, -0.18, -0.18], [0.34, 0.32, 0.36], '#a04e3c');
      r.box(`knee${side}`, [-0.12, -0.31, 0.151], [0.24, 0.31, 0.095], '#a04e3c');
      for (let i = 0; i < 3; i++) r.box(`arm${side}`, [-0.174, -0.12 + i * 0.086, 0.185], [0.348, 0.025, 0.012], '#d8b56b');
    }
    obi(r, '#d1a55b');
    r.box('head', [-0.45, 0.59, -0.405], [0.9, 0.22, 0.81], '#354653');
    r.box('head', [-0.29, 0.81, -0.3], [0.58, 0.13, 0.54], '#425465');
    r.box('head', [-0.055, 0.79, 0.411], [0.11, 0.25, 0.066], '#d8b064');
    for (const side of [-1, 1]) r.box('head', [side * 0.21 - 0.04, 0.81, 0.38], [0.08, 0.2, 0.055], '#e6bd6a', [0, 0, side * 0.43]);
    r.box('body', [-0.69, 0.03, 0.04], [0.095, 0.91, 0.105], '#2e414d', [0.23, 0, -0.43]);
    r.box('body', [-0.725, 0.74, 0.21], [0.15, 0.04, 0.22], '#d8b76e');
  } else if (id === 'ninja') {
    r.box('head', [-0.38, -0.019, -0.33], [0.76, 0.31, 0.67], '#404d65');
    r.box('head', [-0.38, 0.51, -0.33], [0.76, 0.16, 0.67], '#404d65');
    headband(r);
    obi(r, '#b94d47');
    r.node('scarf', [0.16, 0.87, -0.31], 'body');
    r.box('scarf', [-0.08, -0.12, -0.47], [0.16, 0.15, 0.52], '#c55446');
    r.box('scarf', [-0.07, -0.18, -0.75], [0.14, 0.09, 0.31], '#dc6850');
    r.box('body', [-0.36, 0.13, -0.37], [0.1, 0.97, 0.1], '#7a867f', [0, 0, -0.48]);
    r.motion('Walk', 'scarf', 'rotation', 1, 0.17, { cycles: 3 });
    r.motion('Iconic', 'scarf', 'rotation', 1, 0.1, { cycles: 2 });
  } else if (id === 'maiko') {
    skirt(r, '#ce7b95', true);
    obi(r, '#dbc072', true);
    for (let i = 0; i < 8; i++) {
      const x = -0.32 + (i % 3) * 0.27, y = -0.57 + Math.floor(i / 3) * 0.47;
      r.box('body', [x, y, 0.314], [0.08, 0.08, 0.015], '#f6ddda');
      r.box('body', [x - 0.03, y + 0.025, 0.314], [0.14, 0.03, 0.015], '#f6ddda');
    }
    r.box('head', [-0.26, 0.76, -0.24], [0.52, 0.22, 0.4], '#31392f');
    r.box('head', [-0.39, 0.28, -0.44], [0.78, 0.38, 0.17], '#31392f');
    r.box('head', [-0.43, 0.76, -0.018], [0.86, 0.035, 0.055], '#d6b360');
    r.box('head', [0.36, 0.74, 0.056], [0.13, 0.11, 0.13], '#e795a8');
    r.box('head', [0.415, 0.53, 0.07], [0.045, 0.2, 0.06], '#e9c277');
    for (const x of [-0.26, 0.17]) r.box('head', [x, 0.27, 0.343], [0.09, 0.042, 0.009], '#d99190');
    r.box('head', [-0.055, 0.13, 0.348], [0.11, 0.046, 0.009], '#c65558');
    for (let i = 0; i < 5; i++) r.box('foreR', [-0.32 + i * 0.12, -0.5 + Math.abs(i - 2) * 0.05, 0.16], [0.105, 0.36 - Math.abs(i - 2) * 0.07, 0.036], i % 2 ? '#e8b3bd' : '#efcc95');
  } else if (id === 'salaryman') {
    r.box('body', [-0.13, 0.35, 0.262], [0.26, 0.5, 0.018], IVORY);
    r.box('body', [-0.04, 0.38, 0.285], [0.08, 0.43, 0.018], '#b25242');
    r.box('body', [-0.065, 0.7, 0.304], [0.13, 0.14, 0.015], '#cf7154');
    glasses(r);
    r.box('foreR', [-0.31, -0.89, -0.16], [0.62, 0.39, 0.28], '#674d3b');
    r.box('foreR', [-0.12, -0.51, -0.13], [0.24, 0.11, 0.21], '#3c4237');
    r.box('foreR', [-0.058, -0.72, 0.128], [0.116, 0.072, 0.025], '#e2bd6f');
    r.box('body', [0.29, 0.52, 0.262], [0.072, 0.12, 0.016], '#c4dfdb');
  } else if (id === 'student') {
    skirt(r, '#415575');
    r.box('body', [-0.416, 0.63, -0.26], [0.832, 0.27, 0.035], '#3f5877');
    for (const side of [-1, 1]) r.box('body', [side * 0.22 - 0.047, 0.52, 0.273], [0.09, 0.34, 0.024], '#3f5877', [0, 0, side * 0.55]);
    r.box('body', [-0.067, 0.48, 0.285], [0.134, 0.1, 0.025], '#bd5147');
    for (const side of [-1, 1]) r.box('body', [side * 0.14 - 0.085, 0.47, 0.289], [0.17, 0.12, 0.02], '#d4675b');
    r.box('head', [-0.382, 0.6, 0.15], [0.764, 0.1, 0.176], HAIR);
    r.node('ponytail', [0.22, 0.54, -0.34], 'head');
    r.box('ponytail', [-0.1, -0.42, -0.17], [0.2, 0.51, 0.18], '#3c4538');
    r.box('ponytail', [-0.12, -0.01, -0.1], [0.24, 0.07, 0.18], '#bd5147');
    for (const side of ['L', 'R']) {
      r.box(`knee${side}`, [-0.142, -0.4, -0.16], [0.284, 0.37, 0.32], IVORY);
    }
    r.box('foreR', [-0.27, -0.82, -0.11], [0.54, 0.3, 0.23], '#6a533e');
    r.motion('Walk', 'ponytail', 'rotation', 0, 0.2, { cycles: 3 });
    r.motion('Iconic', 'ponytail', 'rotation', 2, 0.12, { cycles: 2 });
  } else if (id === 'chef') {
    headband(r, IVORY);
    r.box('head', [-0.06, 0.58, 0.361], [0.12, 0.065, 0.012], '#c7503c');
    r.box('body', [-0.37, -0.24, 0.27], [0.74, 0.88, 0.055], '#3d6c68');
    r.box('body', [-0.39, 0.71, 0.28], [0.065, 0.23, 0.033], '#3d6c68');
    r.box('body', [0.32, 0.71, 0.28], [0.065, 0.23, 0.033], '#3d6c68');
    r.box('body', [-0.2, -0.07, 0.328], [0.4, 0.25, 0.025], '#6e9b8d');
    ramenBowl(r, 'foreL');
    for (const side of ['L', 'R']) {
      r.motion('Walk', `arm${side}`, 'rotation', 0, 0.045, { offset: -0.6 });
      r.motion('Walk', `fore${side}`, 'rotation', 0, 0, { offset: -1.0 });
    }
  } else if (id === 'sumo') {
    // Shibuya street variant: still broad and unmistakably sumo, but dressed for the city
    // in a proper T-shirt and full-length trousers (not a bare mawashi).
    r.box('body', [-0.54, -0.13, -0.35], [1.08, 0.77, 0.7], '#2f7183');
    r.box('body', [-0.57, -0.24, -0.37], [1.14, 0.25, 0.74], '#344c64');
    r.box('body', [-0.601, -0.115, -0.363], [1.202, 0.1, 0.726], '#243a50');
    r.box('body', [-0.07, 0.2, 0.362], [0.14, 0.07, 0.018], '#c49071');
    r.box('body', [-0.21, -0.38, 0.36], [0.42, 0.52, 0.06], '#344c64');
    r.box('head', [-0.17, 0.75, -0.06], [0.34, 0.17, 0.31], '#394033');
    r.box('head', [-0.24, 0.9, -0.13], [0.48, 0.08, 0.2], '#394033');
  } else if (id === 'miko') {
    skirt(r, '#c35443', true);
    obi(r, '#9d3f33', true);
    r.box('head', [-0.373, -0.13, -0.395], [0.746, 0.8, 0.12], '#303a34');
    r.box('head', [-0.37, 0.59, 0.23], [0.74, 0.12, 0.1], '#303a34');
    r.box('head', [-0.077, 0.47, -0.421], [0.154, 0.11, 0.026], '#d55d45');
    r.box('foreR', [-0.033, -0.42, 0.13], [0.066, 0.92, 0.065], '#b1894a');
    for (let i = 0; i < 4; i++) r.box('foreR', [i % 2 ? 0.085 : -0.21, 0.34 - i * 0.115, 0.168], [0.18, 0.055, 0.04], IVORY);
  } else if (id === 'bosozoku') {
    r.box('body', [-0.43, -0.61, -0.265], [0.86, 0.75, 0.045], IVORY);
    for (const side of [-1, 1]) {
      r.box('body', [side * 0.38 - 0.045, -0.61, -0.25], [0.09, 0.75, 0.5], IVORY);
      r.box('body', [side * 0.18 - 0.067, 0.47, 0.265], [0.13, 0.4, 0.029], '#d6b567');
    }
    headband(r);
    r.box('head', [-0.26, 0.764, -0.21], [0.52, 0.16, 0.64], '#414739');
    r.box('head', [-0.19, 0.924, -0.03], [0.38, 0.07, 0.47], '#546048');
    r.panel('body', 'costume-bosozoku', [0, 0.58, -0.312], [0.58, 0.53], [0, Math.PI, 0]);
    obi(r, '#a68346');
  }
}

function characterMotion(r: Rig, id: string, index: number) {
  const cycles = id === 'ninja' || id === 'student' || id === 'salaryman' ? 3 : 2;
  const stride = id === 'maiko' || id === 'miko' ? 0.17 : id === 'ninja' ? 0.69 : id === 'sumo' ? 0.31 : id === 'samurai' ? 0.3 : 0.43;
  const phase = index * 0.39;
  r.motion('Walk', 'root', 'position', 1, id === 'sumo' ? 0.06 : 0.045, { wave: 'bounce', cycles, phase });
  r.motion('Walk', 'body', 'rotation', 2, id === 'sumo' ? 0.13 : id === 'yakuza' ? 0.055 : 0.024, { cycles, phase });
  r.motion('Walk', 'body', 'rotation', 1, id === 'bosozoku' ? 0.12 : 0.036, { cycles, phase });
  r.motion('Walk', 'head', 'rotation', 1, 0.039, { cycles: 1, phase });
  if (id === 'ninja') r.motion('Walk', 'body', 'rotation', 0, 0.02, { offset: 0.22, cycles });
  for (const side of ['L', 'R']) {
    const offset = side === 'L' ? 0 : Math.PI;
    r.motion('Walk', `leg${side}`, 'rotation', 0, stride, { cycles, phase: phase + offset });
    r.motion('Walk', `knee${side}`, 'rotation', 0, -stride * 0.72, { cycles, phase: phase + offset, wave: 'positive' });
    if (id !== 'chef') {
      r.motion('Walk', `arm${side}`, 'rotation', 0, id === 'maiko' || id === 'miko' ? 0.085 : id === 'ninja' ? 0.17 : stride * 0.71,
        { cycles, phase: phase + offset + Math.PI, offset: id === 'ninja' ? 0.82 : id === 'yakuza' ? -0.13 : 0 });
      r.motion('Walk', `fore${side}`, 'rotation', 0, 0.026, { cycles, phase, offset: id === 'yakuza' ? -0.43 : -0.1 });
    }
  }
  r.motion('Iconic', 'root', 'position', 1, 0.022, { cycles: 2, wave: 'bounce' });
  if (id === 'yakuza') {
    r.motion('Iconic', 'armL', 'rotation', 0, 0.11, { offset: -0.82, cycles: 1 });
    r.motion('Iconic', 'foreL', 'rotation', 0, 0.18, { offset: -1.38, cycles: 1 });
    r.motion('Iconic', 'head', 'rotation', 1, 0.19, { cycles: 1 });
  } else if (id === 'samurai' || id === 'salaryman') {
    r.motion('Iconic', 'body', 'rotation', 0, id === 'salaryman' ? 0.62 : 0.36, { cycles: 1, wave: 'positive' });
    r.motion('Iconic', 'head', 'rotation', 0, 0.12, { cycles: 1, wave: 'positive' });
  } else if (id === 'ninja') {
    r.motion('Iconic', 'armL', 'rotation', 2, 0.11, { offset: -0.65 });
    r.motion('Iconic', 'armR', 'rotation', 2, 0.11, { offset: 0.65 });
    for (const side of ['L', 'R']) r.motion('Iconic', `fore${side}`, 'rotation', 0, 0.08, { offset: -1.7 });
    r.motion('Iconic', 'body', 'rotation', 1, 0.17, { cycles: 1 });
  } else if (id === 'maiko') {
    r.motion('Iconic', 'armR', 'rotation', 0, 0.1, { offset: -1.22 });
    r.motion('Iconic', 'foreR', 'rotation', 2, 0.27, { offset: -0.32 });
    r.motion('Iconic', 'head', 'rotation', 2, 0.035, { offset: -0.08, cycles: 1 });
  } else if (id === 'student') {
    r.motion('Iconic', 'armL', 'rotation', 2, 0.19, { offset: -2.43, cycles: 3 });
    r.motion('Iconic', 'foreL', 'rotation', 2, 0.28, { cycles: 4 });
    r.motion('Iconic', 'body', 'rotation', 2, 0.055, { cycles: 2 });
  } else if (id === 'chef') {
    for (const side of ['L', 'R']) {
      r.motion('Iconic', `arm${side}`, 'rotation', 0, 0.14, { offset: -0.65, cycles: 1 });
      r.motion('Iconic', `fore${side}`, 'rotation', 0, 0.07, { offset: -1.02, cycles: 1 });
    }
    r.motion('Iconic', 'head', 'rotation', 0, 0.13, { cycles: 1, wave: 'positive' });
  } else if (id === 'sumo') {
    r.motion('Iconic', 'legL', 'rotation', 2, -0.91, { cycles: 1, wave: 'positive' });
    r.motion('Iconic', 'body', 'rotation', 2, 0.17, { cycles: 1, wave: 'positive' });
    r.motion('Iconic', 'armL', 'rotation', 2, -0.45, { offset: -0.32 });
    r.motion('Iconic', 'armR', 'rotation', 2, 0.22, { offset: 0.33 });
  } else if (id === 'miko') {
    r.motion('Iconic', 'armR', 'rotation', 0, 0.17, { offset: -0.64, cycles: 1 });
    r.motion('Iconic', 'foreR', 'rotation', 2, 0.12, { offset: -0.15, cycles: 2 });
    r.motion('Iconic', 'head', 'rotation', 0, 0.09, { cycles: 1, wave: 'positive' });
  } else {
    r.motion('Iconic', 'armL', 'rotation', 2, -0.13, { offset: -0.42 });
    r.motion('Iconic', 'armR', 'rotation', 2, 0.13, { offset: 0.42 });
    r.motion('Iconic', 'foreL', 'rotation', 0, 0.06, { offset: -0.7 });
    r.motion('Iconic', 'foreR', 'rotation', 0, 0.06, { offset: -0.7 });
    r.motion('Iconic', 'head', 'rotation', 0, 0.14, { cycles: 2 });
  }
}

const STYLES: Record<string, PersonStyle> = {
  yakuza: { shirt: '#394852', pants: '#34424b' },
  samurai: { shirt: '#394d60', pants: '#3c5266', shoe: '#74513b' },
  ninja: { shirt: '#404d65', pants: '#404d65', shoe: '#333f55' },
  maiko: { shirt: '#cf819a', pants: '#f2ecd6', skin: '#f2dcc0', shoe: '#99734d' },
  salaryman: { shirt: '#3e6180', pants: '#3e6180' },
  student: { shirt: IVORY, pants: '#e7bd91', shoe: '#624e3a' },
  chef: { shirt: '#edead6', pants: '#485d57', shoe: '#b29b6b' },
  sumo: { shirt: '#2f7183', pants: '#344c64', skin: '#e7bd91', width: 1.17, bareArms: false, shoe: '#283746' },
  miko: { shirt: IVORY, pants: '#c35443', shoe: '#9e7951' },
  bosozoku: { shirt: IVORY, pants: '#dcd8bd', shoe: '#775744' },
};

export function buildCharacters(focus?: string | null) {
  const b = new Builder();
  const members = focus ? CHARACTER_MEMBERS.filter(item => item.id === focus) : CHARACTER_MEMBERS;
  if (!members.length) throw new Error('Unknown character.');
  exhibitionFloor(b, focus ? 4.7 : 24.6, 4.3, '#d8dfc6');
  members.forEach((member, index) => {
    const x = focus ? 0 : (index - 4.5) * 2.36;
    const r = humanoid(b, `character_${member.id}`, [x, 0.15, -0.15], STYLES[member.id], member.id);
    addOutfit(r, member.id);
    characterMotion(r, member.id, CHARACTER_MEMBERS.findIndex(item => item.id === member.id));
    memberLabel(b, member, x, 1.25, CHARACTER_MEMBERS.findIndex(item => item.id === member.id), 2.1);
  });
  return b.finish('characters', 0.15);
}