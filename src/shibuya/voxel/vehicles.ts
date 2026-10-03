import { Builder } from './builder';
import { humanoid } from './characters';
import { CAR_MEMBERS, MOTORCYCLE_MEMBERS, VEHICLE_MEMBERS, isMotorcycle } from './packCatalog';
import { exhibitionFloor, memberLabel, Rig } from './rig';
import type { Vec3 } from './types';

function wheel(r: Rig, name: string, p: Vec3, radius: number, width: number, parent = 'chassis') {
  r.node(name, p, parent);
  const unit = radius / 5;
  for (let y = -5; y <= 5; y++) for (let z = -5; z <= 5; z++) {
    const d = Math.hypot(y, z);
    if (d >= 3.25 && d <= 5.18) r.box(name, [-width / 2, (y - 0.5) * unit, (z - 0.5) * unit], [width, unit, unit], '#2d3937');
  }
  r.box(name, [-width * 0.56, -radius * 0.27, -radius * 0.27], [width * 1.12, radius * 0.54, radius * 0.54], '#bdc6bb');
  r.box(name, [-width * 0.56, -radius * 0.7, -radius * 0.045], [width * 1.12, radius * 1.4, radius * 0.09], '#819491');
  r.box(name, [-width * 0.56, -radius * 0.045, -radius * 0.7], [width * 1.12, radius * 0.09, radius * 1.4], '#819491');
  r.box(name, [-width * 0.575, -radius * 0.12, -radius * 0.12], [width * 1.15, radius * 0.24, radius * 0.24], '#667e7b');
  r.motion('Ride', name, 'rotation', 0, 1, { wave: 'spin', cycles: 8 });
  r.motion('Iconic', name, 'rotation', 0, 1, { wave: 'spin', cycles: 2 });
}

function helmetBox(r: Rig, p: Vec3, s: Vec3, color: string) {
  r.box('head', p, s, color, undefined, undefined, { helmet: true });
}

function helmet(r: Rig, color: string, full = false) {
  helmetBox(r, [-0.423, 0.475, -0.365], [0.846, 0.34, 0.72], color);
  for (const x of [-0.423, 0.342]) helmetBox(r, [x, 0.095, -0.365], [0.081, 0.5, 0.67], color);
  helmetBox(r, [-0.41, 0.1, -0.39], [0.82, 0.56, 0.12], color);
  helmetBox(r, [-0.31, 0.346, 0.363], [0.62, 0.205, 0.05], '#4e7987');
  helmetBox(r, [-0.27, 0.499, 0.421], [0.29, 0.025, 0.012], '#b0ded9');
  helmetBox(r, [-0.028, 0.685, -0.35], [0.056, 0.13, 0.68], '#f1e8cb');
  if (full) helmetBox(r, [-0.364, 0.06, 0.25], [0.728, 0.2, 0.14], color);
}

function motorcycleRider(b: Builder, id: string, vehicle: Rig) {
  const color = id === 'custom' ? '#f0e8d0' : id === 'delivery' ? '#4f8967' : id === 'sport' ? '#3e5879'
    : id === 'cafe' ? '#72583e' : id === 'trail' ? '#769543' : id === 'police' ? '#4d7698' : id === 'retro' ? '#b8886a' : '#496477';
  const rider = humanoid(b, `rider_${id}`, [0, 0.34, 0], { shirt: color, pants: '#435765', shoe: '#39463c' });
  b.nodes.find(node => node.name === rider.name('root'))!.parent = vehicle.name('chassis');
  helmet(rider, id === 'sport' ? '#d35d44' : id === 'delivery' ? '#e6b055' : id === 'trail' ? '#e5d59b' : id === 'cafe' ? '#b7996f' : '#dedcc4', id === 'sport' || id === 'trail');
  for (const side of ['L', 'R']) {
    const sign = side === 'L' ? -1 : 1;
    b.nodes.find(node => node.name === rider.name(`leg${side}`))!.p[0] = sign * 0.39;
    rider.rotation(`leg${side}`, [-1.15, 0, 0]);
    rider.rotation(`knee${side}`, [1.1, 0, 0]);
    rider.rotation(`arm${side}`, [-1.0, 0, sign * 0.065]);
    rider.rotation(`fore${side}`, [-0.44, 0, 0]);
    for (const clip of ['Ride', 'Iconic']) {
      rider.motion(clip, `leg${side}`, 'rotation', 0, 0.015);
      rider.motion(clip, `knee${side}`, 'rotation', 0, 0.015);
      rider.motion(clip, `arm${side}`, 'rotation', 0, 0.013);
      rider.motion(clip, `fore${side}`, 'rotation', 0, 0.016);
    }
    rider.box(`fore${side}`, [-0.113, -0.437, -0.143], [0.226, 0.17, 0.286], '#3b4c43');
  }
  if (id === 'custom') {
    rider.box('body', [-0.422, -0.43, -0.3], [0.844, 0.63, 0.07], '#f0e8d0');
    rider.box('body', [-0.064, 0.14, 0.268], [0.128, 0.66, 0.04], '#cead62');
    rider.panel('body', 'costume-bosozoku', [0, 0.54, -0.376], [0.58, 0.5], [0, Math.PI, 0]);
    rider.motion('Iconic', 'armL', 'rotation', 2, -0.19, { offset: -1.77 });
    rider.motion('Iconic', 'head', 'rotation', 1, 0.17, { cycles: 1 });
  } else {
    for (const x of [-0.37, 0.26]) rider.box('body', [x, 0.2, 0.264], [0.11, 0.54, 0.026], id === 'sport' ? '#d16850' : '#d9dabf');
    rider.motion('Iconic', 'head', 'rotation', 1, 0.14, { cycles: 1 });
  }
  if (id === 'police') {
    rider.box('body', [-0.034, 0.2, 0.269], [0.068, 0.66, 0.029], '#ede8d0');
    rider.box('body', [0.18, 0.56, 0.272], [0.12, 0.14, 0.019], '#d5b965');
    rider.box('body', [-0.421, 0.16, -0.268], [0.842, 0.095, 0.536], '#3c4b4b');
    rider.motion('Iconic', 'armL', 'rotation', 2, -0.15, { offset: -1.5, cycles: 1 });
  } else if (id === 'trail') {
    rider.box('head', [-0.33, 0.554, 0.368], [0.66, 0.06, 0.28], '#e4cd91');
    for (const side of ['L', 'R']) rider.box(`arm${side}`, [-0.143, -0.2, 0.152], [0.286, 0.14, 0.04], '#c4c9a5');
  } else if (id === 'cafe') rider.motion('Iconic', 'foreR', 'rotation', 1, 0.17, { cycles: 2 });
  if (id === 'sport') for (const clip of ['Ride', 'Iconic']) rider.motion(clip, 'body', 'rotation', 0, 0.014, { offset: 0.13 });
  rider.motion('Ride', 'root', 'position', 1, 0.018, { cycles: 4, wave: 'bounce' });
  rider.motion('Ride', 'head', 'rotation', 0, 0.015, { cycles: 4 });
  return rider;
}

function motorcycle(b: Builder, id: string, p: Vec3) {
  const r = new Rig(b, `vehicle_${id}`);
  const color = id === 'custom' ? '#c95542' : id === 'sport' ? '#416f9e' : id === 'delivery' ? '#d89045'
    : id === 'retro' ? '#78a5a1' : id === 'cafe' ? '#45586a' : id === 'trail' ? '#91b44f' : id === 'police' ? '#e9e6d3' : '#72a18c';
  r.node('root', p, undefined, [0, -0.28, 0], id);
  r.node('chassis', [0, 0, 0], 'root');
  r.node('steering', [0, 1.2, 0.81], 'chassis');
  const radius = id === 'retro' ? 0.34 : id === 'trail' ? 0.51 : 0.46;
  wheel(r, 'wheelRear', [0, radius + 0.04, -1.08], radius, id === 'trail' ? 0.24 : 0.22);
  wheel(r, 'wheelFront', [0, radius + 0.04, 1.06], radius, id === 'trail' ? 0.24 : 0.22);
  if (id === 'trail') for (const name of ['wheelRear', 'wheelFront']) for (let i = 0; i < 16; i++) {
    const angle = i / 16 * Math.PI * 2;
    r.box(name, [-0.143, Math.cos(angle) * 0.51 - 0.045, Math.sin(angle) * 0.51 - 0.045], [0.286, 0.09, 0.09], '#34433a');
  }
  r.box('chassis', [-0.16, 0.59, -0.9], [0.32, 0.29, 1.88], '#7d9995');
  r.box('chassis', [-0.34, 0.79, -0.53], [0.68, 0.43, 0.74], color);
  r.box('chassis', [-0.36, 1.23, -0.73], [0.72, 0.14, 0.95], id === 'cafe' ? '#9f774a' : '#495146');
  r.box('chassis', [-0.27, 1.06, 0.16], [0.54, 0.24, 0.51], color);
  r.box('chassis', [-0.2, 0.72, 0.18], [0.4, 0.54, 0.22], id === 'cub' ? '#ece7ce' : color);
  for (const x of [-0.125, 0.075]) r.box('chassis', [x, 0.47, 0.93], [0.05, 0.79, 0.07], '#c9cdc0', [-0.2, 0, 0]);
  r.box('steering', [-0.34, 0.43, 0.06], [0.68, 0.26, 0.26], color);
  r.box('steering', [-0.14, 0.477, 0.323], [0.28, 0.19, 0.019], '#fff0bb', undefined, 0.6);
  r.box('steering', [-0.52, 0.68, -0.027], [1.04, 0.062, 0.062], '#839790');
  for (const x of [-0.56, 0.43]) {
    r.box('steering', [x, 0.66, -0.067], [0.13, 0.09, 0.15], '#33443b');
    r.box('steering', [x + 0.038, 0.75, -0.011], [0.035, 0.31, 0.035], '#9eb0a2');
    r.box('steering', [x - 0.02, 1.061, -0.075], [0.18, 0.12, 0.048], '#b9d7ce');
  }
  r.box('chassis', [-0.28, 0.43, -1.2], [0.06, 0.11, 1.18], '#acbcb2');
  r.box('chassis', [0.25, 0.43, -1.2], [0.14, 0.14, 1.18], '#b8c4b5');
  r.box('chassis', [-0.34, 0.87, -1.35], [0.68, 0.1, 0.33], color);
  r.box('chassis', [-0.26, 0.52, -1.425], [0.52, 0.21, 0.035], '#f2e8c9');
  r.box('chassis', [-0.14, 0.76, -1.431], [0.28, 0.095, 0.023], '#d75138', undefined, 0.15);
  r.box('chassis', [-0.66, 0.63, -0.25], [1.32, 0.065, 0.16], '#727f73');
  for (let i = 0; i < 5; i++) r.box('chassis', [-0.35, 0.82 + i * 0.062, -0.48], [0.7, 0.021, 0.68], '#bcc7ba');
  if (id === 'cub') {
    r.box('chassis', [-0.33, 0.94, 0.52], [0.66, 0.49, 0.24], '#ece7ce');
    r.box('steering', [-0.3, 0.036, 0.36], [0.6, 0.37, 0.42], '#b9c3af');
    r.box('steering', [-0.269, 0.32, 0.383], [0.538, 0.018, 0.366], '#566b58');
    for (let i = 0; i < 5; i++) r.box('steering', [-0.273 + i * 0.116, 0.03, 0.78], [0.025, 0.31, 0.012], '#738977');
  } else if (id === 'custom') {
    r.box('chassis', [-0.28, 1.34, -1.12], [0.56, 1.32, 0.15], '#d6b675', [-0.17, 0, 0]);
    r.box('chassis', [-0.23, 1.39, -1.231], [0.46, 1.14, 0.07], '#945446', [-0.17, 0, 0]);
    r.box('chassis', [0.36, 0.53, -1.35], [0.13, 1.01, 0.13], '#c5cab9', [-0.46, 0, 0]);
    r.box('steering', [-0.17, 0.62, 0.33], [0.34, 0.8, 0.13], '#e9c079', [-0.29, 0, 0]);
  } else if (id === 'sport') {
    for (const x of [-0.45, 0.27]) {
      r.box('chassis', [x, 0.61, -0.18], [0.18, 0.63, 1.12], color);
      r.box('chassis', [x - 0.007, 0.88, -0.1], [0.194, 0.1, 0.91], '#ce6950');
    }
    r.box('steering', [-0.34, 0.12, 0.23], [0.68, 0.41, 0.45], color);
    r.box('steering', [-0.21, 0.54, 0.35], [0.42, 0.23, 0.054], '#638f9b', [-0.4, 0, 0]);
    r.box('chassis', [-0.24, 1.14, -1.2], [0.48, 0.17, 0.67], '#c66048');
  } else if (id === 'delivery') {
    r.box('chassis', [-0.45, 1.39, -1.31], [0.9, 0.66, 0.74], '#54885e');
    r.box('chassis', [-0.48, 2.05, -1.34], [0.96, 0.07, 0.8], '#699975');
    r.panel('chassis', 'vehicle-delivery', [0, 1.77, -1.32], [0.74, 0.41], [0, Math.PI, 0]);
    r.box('chassis', [-0.32, 0.67, -0.15], [0.64, 0.035, 0.7], '#ecce8b');
  } else if (id === 'retro') {
    r.box('chassis', [-0.44, 0.56, 0.36], [0.88, 0.74, 0.25], '#e8dabc');
    r.box('chassis', [-0.35, 1.3, 0.35], [0.7, 0.19, 0.23], '#eedfc3');
    r.box('chassis', [-0.48, 0.67, -1.0], [0.96, 0.37, 0.83], color);
    r.box('chassis', [-0.31, 0.62, -0.27], [0.62, 0.047, 0.71], '#dfc58f');
    r.box('chassis', [-0.25, 0.64, 0.88], [0.5, 0.09, 0.43], color);
    r.box('chassis', [-0.43, 0.83, -1.18], [0.86, 0.055, 0.33], '#ede4c8');
  } else if (id === 'cafe') {
    r.box('chassis', [-0.32, 1.27, -0.19], [0.64, 0.19, 0.73], color);
    r.box('chassis', [-0.24, 1.46, -0.09], [0.48, 0.12, 0.47], '#63767b');
    r.box('steering', [-0.22, 0.4, 0.33], [0.44, 0.32, 0.11], '#a4b2a7');
    r.box('steering', [-0.155, 0.457, 0.443], [0.31, 0.2, 0.013], '#f6e9bd', undefined, 0.5);
    r.box('chassis', [-0.26, 1.31, -1.08], [0.52, 0.2, 0.41], '#af8552');
    r.box('chassis', [0.32, 0.54, -1.31], [0.17, 0.16, 1.41], '#aebbae');
  } else if (id === 'trail') {
    r.box('chassis', [-0.28, 1.4, -0.95], [0.56, 0.1, 1.06], '#465843');
    r.box('chassis', [-0.19, 1.26, 0.68], [0.38, 0.087, 0.86], color);
    r.box('steering', [-0.27, 0.24, 0.36], [0.54, 0.58, 0.083], '#f0edd4');
    r.box('steering', [-0.08, 0.46, 0.445], [0.16, 0.2, 0.015], '#497a8c');
    for (const x of [-0.38, 0.25]) r.box('chassis', [x, 0.87, -0.33], [0.13, 0.42, 0.67], color);
    r.box('chassis', [-0.18, 0.53, -0.51], [0.36, 0.073, 0.57], '#b6bb9f');
  } else if (id === 'police') {
    for (const x of [-0.64, 0.35]) {
      r.box('chassis', [x, 0.81, -1.19], [0.29, 0.48, 0.7], '#e6e5d1');
      r.box('chassis', [x - 0.018, 1.29, -1.21], [0.326, 0.067, 0.74], '#b5c8c2');
      r.box('chassis', [x + 0.019, 0.96, -1.213], [0.25, 0.09, 0.016], '#537b97');
    }
    r.box('steering', [-0.39, 0.2, 0.21], [0.78, 0.58, 0.25], color);
    b.box([-0.32, 1.95, 1.12], [0.64, 0.56, 0.034], '#9ec8cb', { node: r.name('chassis'), opacity: 0.55 });
    r.node('beacon', [0.47, 1.29, -0.96], 'chassis');
    r.box('beacon', [-0.09, 0, -0.09], [0.18, 0.24, 0.18], '#df7155', undefined, 0.4);
    r.box('beacon', [-0.055, 0.24, -0.055], [0.11, 0.054, 0.11], '#f2b181');
    r.motion('Ride', 'beacon', 'rotation', 1, 1, { wave: 'spin', cycles: 4 });
    r.panel('chassis', 'vehicle-police', [0, 1.42, -1.44], [0.64, 0.14], [0, Math.PI, 0]);
  }
  motorcycleRider(b, id, r);
  r.motion('Ride', 'chassis', 'position', 1, 0.012, { cycles: 4, wave: 'bounce' });
  r.motion('Ride', 'steering', 'rotation', 1, 0.043, { cycles: 1 });
  r.motion('Iconic', 'steering', 'rotation', 1, 0.09, { cycles: 1 });
}

function driver(r: Rig, x: number, y: number, z: number, passenger = false) {
  r.box('chassis', [x - 0.12, y, z - 0.09], [0.24, 0.28, 0.18], passenger ? '#bd7358' : '#4e6775');
  r.box('chassis', [x - 0.13, y + 0.28, z - 0.12], [0.26, 0.25, 0.24], '#e4bd8d');
  r.box('chassis', [x - 0.138, y + 0.49, z - 0.128], [0.276, 0.063, 0.256], '#3e4539');
}

function car(b: Builder, id: string, p: Vec3) {
  const r = new Rig(b, `vehicle_${id}`);
  const bus = id === 'bus', truck = id === 'keitruck', kei = id === 'kei';
  const length = bus ? 5.45 : truck ? 3.7 : kei ? 3.17 : 3.91;
  const width = bus ? 1.79 : kei || truck ? 1.44 : 1.72;
  const color = id === 'gt' ? '#4c7eb0' : id === 'taxi' ? '#ddbd4f' : id === 'kei' ? '#92bca0' : id === 'bus' ? '#5f9358' : '#ebe8d5';
  r.node('root', p, undefined, [0, -0.28, 0], id);
  r.node('chassis', [0, 0, 0], 'root');
  const radius = bus ? 0.34 : 0.29;
  for (const side of [-1, 1]) for (const end of [-1, 1]) wheel(r, `wheel_${side}_${end}`, [side * (width / 2 + 0.015), radius + 0.04, end * length * 0.3], radius, 0.16);
  r.box('chassis', [-width / 2, 0.39, -length / 2], [width, 0.51, length], color);
  r.box('chassis', [-width / 2 - 0.018, 0.39, -length / 2 - 0.043], [width + 0.036, 0.13, 0.13], '#637265');
  r.box('chassis', [-width / 2 - 0.018, 0.39, length / 2 - 0.07], [width + 0.036, 0.13, 0.13], '#8f9e91');
  r.box('chassis', [-width / 2 - 0.017, 0.54, -length / 2 + 0.05], [0.034, 0.05, length - 0.1], '#424e44');
  r.box('chassis', [width / 2 - 0.017, 0.54, -length / 2 + 0.05], [0.034, 0.05, length - 0.1], '#424e44');
  const cabinZ = truck ? 0.47 : bus ? -length / 2 + 0.14 : -0.77;
  const cabinLength = truck ? 1.18 : bus ? length - 0.3 : kei ? 2.02 : 1.77;
  const cabinHeight = bus ? 1.12 : kei ? 0.78 : 0.62;
  r.box('chassis', [-width / 2 + 0.075, 0.9, cabinZ], [width - 0.15, cabinHeight, 0.026], '#709eaa');
  for (const side of [-1, 1]) {
    b.box([side * (width / 2 - 0.068), 1.04, cabinZ + 0.04], [0.022, cabinHeight - 0.14, cabinLength - 0.08], '#9ec8cd', { node: r.name('chassis'), opacity: 0.35 });
  }
  r.box('chassis', [-width / 2 + 0.018, 0.9, cabinZ], [width - 0.036, 0.16, cabinLength], color);
  for (const side of [-1, 1]) for (const zz of [cabinZ, cabinZ + cabinLength / 2, cabinZ + cabinLength - 0.1]) {
    r.box('chassis', [side * (width / 2 - 0.098), 0.91, zz], [0.095, cabinHeight, 0.1], color);
  }
  r.box('chassis', [-width / 2 + 0.04, 0.9 + cabinHeight, cabinZ - 0.035], [width - 0.08, 0.1, cabinLength + 0.07], kei || bus ? '#efe9cf' : color);
  for (const side of [-1, 1]) {
    r.box('chassis', [side * (width / 2 + 0.03) - 0.045, 1.01, cabinZ + cabinLength - 0.1], [0.14, 0.1, 0.22], color);
  }
  const front = cabinZ + cabinLength + 0.015;
  b.box([-width / 2 + 0.11, 1.07, front], [width - 0.22, cabinHeight - 0.2, 0.019], '#bddbd6', { node: r.name('chassis'), opacity: 0.34 });
  driver(r, width * 0.23, 0.99, front - 0.24);
  for (const side of [-1, 1]) {
    r.box('chassis', [side * width * 0.31 - 0.14, 0.652, length / 2 + 0.007], [0.28, 0.15, 0.02], '#fff0c4', undefined, 0.45);
    r.box('chassis', [side * width * 0.31 - 0.14, 0.652, -length / 2 - 0.022], [0.28, 0.15, 0.02], '#c35e44', undefined, 0.18);
  }
  r.box('chassis', [-0.21, 0.434, length / 2 + 0.065], [0.42, 0.11, 0.014], kei || truck ? '#e9d787' : '#efeadd');
  r.box('chassis', [-0.37, 0.681, length / 2 + 0.018], [0.74, 0.088, 0.026], '#45584e');
  if (id === 'hachiroku') {
    for (const side of [-1, 1]) {
      r.node(`popup${side}`, [side * 0.49, 0.91, 1.49], 'chassis');
      r.box(`popup${side}`, [-0.21, -0.05, -0.21], [0.42, 0.15, 0.43], color);
      r.box(`popup${side}`, [-0.16, -0.03, 0.228], [0.32, 0.11, 0.019], '#fff5d4', undefined, 0.35);
      r.motion('Iconic', `popup${side}`, 'rotation', 0, -0.61, { wave: 'positive', cycles: 1 });
    }
    r.box('chassis', [-0.88, 0.54, -1.89], [1.76, 0.24, 3.78], '#3c4742');
    r.box('chassis', [-0.81, 0.9, -1.66], [1.62, 0.08, 0.27], '#3e4c46');
  } else if (id === 'gt') {
    r.box('chassis', [-0.91, 0.36, -length / 2], [1.82, 0.12, length], '#396087');
    for (const x of [-0.6, 0.52]) r.box('chassis', [x, 0.9, -1.82], [0.08, 0.35, 0.14], color);
    r.box('chassis', [-0.94, 1.25, -1.87], [1.88, 0.065, 0.24], color);
    for (let i = 0; i < 4; i++) r.box('chassis', [-0.71 + i * 0.37, 0.65, -1.99], [0.19, 0.16, 0.018], '#d3684e', undefined, 0.18);
  } else if (id === 'taxi') {
    r.box('chassis', [-0.22, 1.63, 0.05], [0.44, 0.21, 0.24], '#e5e6bf');
    r.panel('chassis', 'vehicle-taxi', [0, 1.742, 0.298], [0.36, 0.12]);
  } else if (truck) {
    r.box('chassis', [-0.65, 0.91, -1.72], [1.3, 0.048, 2.13], '#8b9d8d');
    for (const x of [-0.725, 0.64]) r.box('chassis', [x, 0.9, -1.8], [0.085, 0.39, 2.22], color);
    r.box('chassis', [-0.68, 0.9, -1.837], [1.36, 0.37, 0.058], color);
    r.node('crate', [0, 1.0, -0.67], 'chassis');
    r.box('crate', [-0.52, 0, -0.43], [1.04, 0.45, 0.88], '#b28c46');
    for (let i = 0; i < 9; i++) r.box('crate', [-0.4 + (i % 3) * 0.26, 0.45, -0.32 + Math.floor(i / 3) * 0.23], [0.21, 0.2, 0.19], i % 2 ? '#87ad55' : '#dab05e');
    r.motion('Ride', 'crate', 'rotation', 2, 0.024, { cycles: 3 });
  } else if (bus) {
    for (let i = 0; i < 7; i++) {
      b.box([-width / 2 - 0.024, 1.42, -2.4 + i * 0.68], [0.028, 0.44, 0.42], '#bad7d0', { node: r.name('chassis'), opacity: 0.4 });
      b.box([width / 2 - 0.004, 1.42, -2.4 + i * 0.68], [0.028, 0.44, 0.42], '#9ac4c2', { node: r.name('chassis'), opacity: 0.4 });
    }
    for (let row = 0; row < 4; row++) for (const side of [-1, 1]) {
      const z = -1.9 + row * 0.88;
      r.box('chassis', [side * 0.45 - 0.2, 0.99, z - 0.16], [0.4, 0.18, 0.35], '#749c76');
      r.box('chassis', [side * 0.45 - 0.2, 1.16, z - 0.17], [0.4, 0.43, 0.08], '#749c76');
      if ((row + side) % 2) driver(r, side * 0.45, 1.17, z + 0.12, true);
    }
    r.box('chassis', [-width / 2, 1.06, -length / 2], [width, 0.19, length], '#84a856');
    r.box('chassis', [-0.36, 2.12, -0.46], [0.72, 0.16, 1.18], '#b7c5ae');
    r.box('chassis', [-0.61, 1.85, 2.69], [1.22, 0.24, 0.046], '#304c45');
    r.panel('chassis', 'vehicle-bus', [0, 1.973, 2.74], [1.14, 0.18]);
  }
  r.motion('Ride', 'chassis', 'position', 1, 0.018, { cycles: 4, wave: 'bounce' });
  r.motion('Ride', 'chassis', 'rotation', 2, 0.006, { cycles: 2 });
  r.motion('Iconic', 'chassis', 'position', 1, 0.017, { cycles: 2, wave: 'bounce' });
}

export function buildVehicles(focus?: string | null) {
  const b = new Builder();
  const members = focus ? VEHICLE_MEMBERS.filter(item => item.id === focus) : VEHICLE_MEMBERS;
  if (!members.length) throw new Error('Unknown vehicle.');
  exhibitionFloor(b, focus ? 7 : 28, focus ? 7.5 : 21.7, '#c2cec4');
  members.forEach(member => {
    const index = VEHICLE_MEMBERS.findIndex(item => item.id === member.id);
    const motor = isMotorcycle(member.id);
    const typeIndex = (motor ? MOTORCYCLE_MEMBERS : CAR_MEMBERS).findIndex(item => item.id === member.id);
    const x = focus ? 0 : motor ? (typeIndex % 4 - 1.5) * 5.2 : (typeIndex - 2.5) * 4.3;
    const z = focus ? -0.3 : motor ? (typeIndex < 4 ? 6.5 : 0) : -6.7;
    if (motor) motorcycle(b, member.id, [x, 0.15, z]);
    else car(b, member.id, [x, 0.15, z]);
    memberLabel(b, member, x, z + (member.id === 'bus' ? 3.13 : 2.08), index, 3.35);
  });
  return b.finish('vehicles', 0.15);
}