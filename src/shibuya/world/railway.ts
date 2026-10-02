import { Group, Mesh, MeshBasicMaterial, BoxGeometry, MeshStandardMaterial } from 'three';
import { Builder } from '../voxel/builder';
import { buildAssetObject, disposeAsset } from '../voxel/renderModel';
import { bakeScenery } from './scenery';
import { WORLD } from './layout';
import { RAILWAY, type RailState } from './simulation';
import { pixelDisc, stripedCrossbuck } from './detailKit';

const YELLOW = '#e7bf4f';
const BLACK = '#35433d';

const SIGNAL_HEIGHT = 3.375;

function signalHead(b: Builder, x: number, z: number) {
  for (const offset of [-0.28, 0.28]) {
    pixelDisc(b, [x + offset, SIGNAL_HEIGHT, z], 0.242, 0.145, '#33423b');
    for (const face of [-1, 1]) {
      pixelDisc(b, [x + offset, SIGNAL_HEIGHT, z + face * 0.091], 0.181, 0.032, '#697b65');
      pixelDisc(b, [x + offset, SIGNAL_HEIGHT, z + face * 0.115], 0.153, 0.027, '#37483d');
      b.box([x + offset - 0.21, SIGNAL_HEIGHT + 0.179, z + (face > 0 ? 0.055 : -0.239)], [0.42, 0.057, 0.184], '#374a3f');
      b.box([x + offset - 0.211, SIGNAL_HEIGHT - 0.035, z + (face > 0 ? 0.061 : -0.22)], [0.043, 0.21, 0.159], '#374a3f');
      b.box([x + offset + 0.168, SIGNAL_HEIGHT - 0.035, z + (face > 0 ? 0.061 : -0.22)], [0.043, 0.21, 0.159], '#374a3f');
    }
  }
  b.box([x - 0.357, 2.817, z - 0.088], [0.714, 0.286, 0.176], '#31493e');
  for (const face of [-1, 1]) b.box([x - 0.303, 2.855, z + face * 0.093 - 0.012], [0.606, 0.209, 0.024], '#223e32');
  stripedCrossbuck(b, [x, 4.073, z], 1.77, 0.18, YELLOW, BLACK);
  b.box([x - 0.09, 4.785, z - 0.095], [0.18, 0.16, 0.19], '#788368');
  b.box([x - 0.075, 4.945, z - 0.073], [0.15, 0.035, 0.146], '#b7bea1');
}

function pixelLampGeometry(arrow = false) {
  const b = new Builder();
  if (arrow) {
    b.box([-0.24, -0.022, -0.016], [0.41, 0.044, 0.032], '#ffffff');
    for (let i = 0; i < 4; i++) for (const side of [-1, 1]) b.box([0.205 - i * 0.045, side * i * 0.04 - 0.022, -0.016], [0.048, 0.044, 0.032], '#ffffff');
  } else pixelDisc(b, [0, 0, 0], 0.137, 0.026, '#ffffff');
  const raw = buildAssetObject(b.finish('station', 0));
  const mesh = raw.getObjectByName('Voxels_ffffff') as Mesh;
  const geometry = mesh.geometry.clone();
  disposeAsset(raw);
  return geometry;
}

export const GATE_POINTS = [
  { x: -6.18, z: RAILWAY.z + RAILWAY.gateOffset, length: 6.48, side: 1, car: true },
  { x: 6.18, z: RAILWAY.z - RAILWAY.gateOffset, length: 6.48, side: -1, car: true },
  { x: -8.99, z: RAILWAY.z + RAILWAY.gateOffset, length: 2.91, side: 1, car: false },
  { x: 8.99, z: RAILWAY.z + RAILWAY.gateOffset, length: 2.91, side: -1, car: false },
  { x: -8.99, z: RAILWAY.z - RAILWAY.gateOffset, length: 2.91, side: 1, car: false },
  { x: 8.99, z: RAILWAY.z - RAILWAY.gateOffset, length: 2.91, side: -1, car: false },
];

export function buildRailInfrastructure() {
  const b = new Builder();
  const z = RAILWAY.z;
  const trackHalf = RAILWAY.trackLength / 2;
  b.box([-trackHalf, WORLD.groundY, z - 2.19], [RAILWAY.trackLength, 0.055, 4.38], '#a99f87');
  b.box([-9.1, WORLD.roadY, z - 2.2], [18.2, 0.019, 4.4], '#91a99a');
  for (let x = -trackHalf + 0.2; x < trackHalf; x += 0.5) {
    b.box([x, 0.193, z - 1.32], [0.145, 0.025, 2.64], '#685d47');
    for (const zz of [-0.72, 0.72]) b.box([x + 0.043, 0.218, z + zz - 0.094], [0.062, 0.017, 0.19], '#7b8577');
    if (Math.abs(x) > 9.2) {
      b.box([x + 0.16, 0.192, z + (Math.round(x * 2) % 2 ? 1.53 : -1.7)], [0.16, 0.033, 0.12], '#c5b99e');
    }
  }
  for (const zz of [-0.72, 0.72]) {
    b.box([-trackHalf, 0.216, z + zz - 0.049], [RAILWAY.trackLength, 0.032, 0.098], '#9bacab');
    b.box([-trackHalf, 0.248, z + zz - 0.035], [RAILWAY.trackLength, 0.019, 0.07], '#dbe2d6');
  }
  for (let x = -8.8; x < 9.1; x += 0.48) {
    for (const zz of [-1.97, 0.91]) b.box([x, 0.226, z + zz], [0.42, 0.014, 0.99], '#9b9e93');
  }

  for (const side of [-1, 1]) {
    const x = side < 0 ? -40 : 10.1;
    for (const zz of [-2.58, 2.58]) {
      b.box([x, 1.16, z + zz], [29.9, 0.051, 0.054], '#d9ddc6');
      b.box([x, 0.75, z + zz], [29.9, 0.05, 0.05], '#ccd2bd');
      for (let i = 0; i < 30; i++) {
        b.box([x + i, 0.3, z + zz - 0.04], [0.08, 0.98, 0.08], '#a1b399');
        b.box([x + i + 0.32, 0.55, z + zz], [0.036, 0.66, 0.045], '#c3cdb6');
      }
    }
    const line = z + (side < 0 ? RAILWAY.vehicleStopOffset : -RAILWAY.vehicleStopOffset);
    b.box([side < 0 ? -5.9 : 0.23, WORLD.roadY + 0.017, line], [5.65, 0.014, 0.15], '#f5eedb');
    b.panel('rail-warning', [side * 3.25, WORLD.roadY + 0.034, line + (side < 0 ? 2.5 : -2.5)], [3.7, 0.87], { rotation: [-Math.PI / 2, 0, side < 0 ? 0 : Math.PI] });
    for (const end of [-1, 1]) {
      const sx = side * 7.0, sz = z + end * RAILWAY.gateOffset;
      b.box([sx - 0.15, WORLD.pavementY, sz - 0.15], [0.3, 0.13, 0.3], '#8e9b8b');
      b.box([sx - 0.065, 0.45, sz - 0.065], [0.13, 4.36, 0.13], YELLOW);
      for (let stripe = 0; stripe < 14; stripe++) b.box([sx - 0.069, 0.54 + stripe * 0.3, sz - 0.069], [0.138, 0.117, 0.138], BLACK);
      signalHead(b, sx, sz);
      b.box([sx - 0.27, 1.76, sz - 0.048], [0.54, 0.72, 0.097], '#efdfaa');
      b.panel('rail-warning', [sx, 2.15, sz + 0.053], [0.46, 0.41]);
      b.box([sx + side * 0.25 - 0.12, 0.35, sz - 0.26], [0.24, 0.64, 0.28], '#b6bca5');
      b.box([sx - 0.13, 1.236, sz + end * 0.09 - 0.036], [0.26, 0.36, 0.072], '#e4bb59');
      b.box([sx - 0.093, 1.315, sz + end * 0.134 - 0.011], [0.186, 0.14, 0.022], '#c46b50');
      b.panel('rail-sos', [sx, 1.56, sz + end * 0.151], [0.19, 0.067], { rotation: end < 0 ? [0, Math.PI, 0] : undefined });
      b.panel('rail-id', [sx + side * 0.25, 0.693, sz + 0.031], [0.18, 0.13]);
    }
  }
  for (const gate of GATE_POINTS) {
    b.box([gate.x - 0.12, WORLD.pavementY, gate.z - 0.13], [0.24, 0.17, 0.26], '#a2a792');
    b.box([gate.x - 0.084, 0.49, gate.z - 0.083], [0.168, 0.73, 0.166], YELLOW);
    b.box([gate.x - 0.089, 0.64, gate.z - 0.089], [0.178, 0.14, 0.178], BLACK);
    b.box([gate.x - 0.19, 0.77, gate.z - 0.2], [0.38, 0.54, 0.4], '#87947a');
    b.box([gate.x - 0.175, 1.31, gate.z - 0.19], [0.35, 0.061, 0.38], '#b0b99a');
    b.box([gate.x - 0.14, 1.22, gate.z - 0.16], [0.28, 0.32, 0.32], '#656d53');
    pixelDisc(b, [gate.x, 1.366, gate.z + 0.174], 0.11, 0.038, '#b9c1a8');
    pixelDisc(b, [gate.x, 1.366, gate.z + 0.198], 0.055, 0.016, '#76856b');
    for (const dx of [-0.138, 0.138]) b.box([gate.x + dx - 0.014, 0.85, gate.z + 0.205], [0.028, 0.033, 0.019], '#d4d8b8');
    for (let i = 0; i < 4; i++) b.box([gate.x - 0.135, 0.99 + i * 0.043, gate.z + 0.203], [0.27, 0.014, 0.012], '#626f5a');
  }
  for (const x of [-68, -36, -20, 20, 36, 68]) {
    for (const zz of [-2.95, 2.95]) b.box([x, 0.22, z + zz], [0.15, 5.85, 0.15], '#8b9f92');
    b.box([x - 0.1, 6.05, z - 3.08], [0.33, 0.11, 6.35], '#617d78');
    for (const zz of [-1.17, 1.17]) b.box([x + 0.033, 5.55, z + zz], [0.041, 0.54, 0.045], '#8b9f92');
  }
  for (const zz of [-1.17, 1.17]) b.box([-trackHalf, 5.55, z + zz], [RAILWAY.trackLength, 0.028, 0.027], '#495f55');
  return b.finish('station', 0);
}

function armGeometry(length: number) {
  const b = new Builder();
  b.box([-0.36, -0.055, -0.079], [length + 0.36, 0.11, 0.158], YELLOW);
  for (let i = 0; i < length / 0.47; i++) b.box([i * 0.47, -0.062, -0.089], [0.215, 0.124, 0.178], BLACK);
  b.box([length - 0.15, -0.048, -0.12], [0.17, 0.097, 0.24], '#f4d877');
  for (const face of [-1, 1]) {
    for (let i = 0; i < Math.floor(length / 1.2); i++) b.box([0.46 + i * 1.2, -0.028, face * 0.099 - 0.009], [0.12, 0.056, 0.018], '#eee8c9');
    b.box([-0.11, -0.115, face * 0.101 - 0.012], [0.22, 0.23, 0.024], '#9fac8d');
  }
  b.box([-0.75, -0.16, -0.142], [0.35, 0.32, 0.284], '#58634d');
  b.box([-0.719, -0.129, -0.17], [0.29, 0.258, 0.056], '#a5b18e');
  b.box([-0.18, -0.126, -0.12], [0.36, 0.252, 0.24], '#8b9e7b');
  const raw = buildAssetObject(b.finish('station', 0));
  const result = bakeScenery(raw, 'Striped_Barrier_Arm');
  disposeAsset(raw);
  return result;
}

function trainGeometry() {
  const b = new Builder();
  const wheelPoints: [number, number][] = [];
  for (let car = 0; car < 4; car++) {
    const x = -RAILWAY.trainLength / 2 + car * 6.44;
    b.box([x, 0.53, -1.08], [6.05, 1.84, 2.16], '#e0e5d6');
    b.box([x - 0.03, 2.37, -1.13], [6.11, 0.13, 2.26], '#b6c4bd');
    b.box([x + 0.09, 2.5, -1.02], [5.87, 0.075, 2.04], '#edf0dd');
    b.box([x - 0.005, 0.95, -1.087], [6.06, 0.24, 2.174], '#77b142');
    b.box([x + 0.12, 0.58, -1.095], [5.81, 0.07, 2.19], '#6d9495');
    for (const side of [-1, 1]) {
      for (let win = 0; win < 7; win++) {
        b.box([x + 0.27 + win * 0.8, 1.44, side > 0 ? 1.086 : -1.115], [0.59, 0.57, 0.025], '#568c9d', { glow: 0.055 });
        b.box([x + 0.31 + win * 0.8, 1.48, side > 0 ? 1.114 : -1.123], [0.075, 0.46, 0.009], '#b6dad2');
      }
      for (const offset of [1.77, 4.17]) {
        b.box([x + offset, 0.56, side > 0 ? 1.08 : -1.114], [0.73, 1.61, 0.028], '#b8c7b9');
        b.box([x + offset + 0.07, 1.44, side > 0 ? 1.11 : -1.126], [0.59, 0.48, 0.019], '#58949f');
        b.box([x + offset + 0.345, 0.64, side > 0 ? 1.131 : -1.135], [0.04, 1.47, 0.012], '#839c8e');
      }
    }
    b.box([x + 1.78, 2.58, -0.51], [1.92, 0.2, 1.02], '#b3c1b3');
    for (let slat = 0; slat < 9; slat++) b.box([x + 1.86 + slat * 0.2, 2.783, -0.46], [0.075, 0.012, 0.92], '#789385');
    if (car < 3) b.box([x + 6.05, 0.7, -0.57], [0.4, 1.34, 1.14], '#486366');
    for (const offset of [1.14, 4.63]) {
      b.box([x + offset - 0.49, 0.37, -0.79], [0.98, 0.23, 1.58], '#617e78');
      for (const zz of [-0.72, 0.72]) wheelPoints.push([x + offset, zz]);
    }
  }
  const front = RAILWAY.trainLength / 2;
  b.box([front + 0.019, 1.34, -0.79], [0.031, 0.77, 1.58], '#407c8b');
  b.box([front + 0.054, 1.37, -0.72], [0.014, 0.063, 1.44], '#bedaca');
  b.box([front + 0.056, 1.33, -0.026], [0.012, 0.78, 0.052], '#c4d6c8');
  for (const z of [-0.86, 0.63]) b.box([front + 0.061, 0.77, z], [0.033, 0.15, 0.23], '#fff1c5', { glow: 0.8 });
  b.panel('rail-destination', [front + 0.065, 2.255, 0], [0.89, 0.17], { rotation: [0, Math.PI / 2, 0], glow: 0.2 });
  const raw = buildAssetObject(b.finish('station', 0));
  const body = bakeScenery(raw, 'Yamanote_Train');
  disposeAsset(raw);
  const w = new Builder();
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2;
    w.box([Math.cos(a) * 0.239 - 0.052, Math.sin(a) * 0.239 - 0.052, -0.067], [0.104, 0.104, 0.134], '#344742');
  }
  w.box([-0.12, -0.12, -0.078], [0.24, 0.24, 0.156], '#a0b4aa');
  w.box([-0.19, -0.033, -0.081], [0.38, 0.066, 0.162], '#778f85');
  w.box([-0.033, -0.19, -0.081], [0.066, 0.38, 0.162], '#778f85');
  const rawWheel = buildAssetObject(w.finish('station', 0));
  const wheel = bakeScenery(rawWheel, 'Train_Wheel');
  disposeAsset(rawWheel);
  return { body, wheel, wheelPoints };
}

export interface RailwayInstance {
  root: Group;
  train: Group;
  arms: Group[];
  wheels: Group[];
  redMaterials: MeshBasicMaterial[];
  arrowMaterial: MeshBasicMaterial;
  reflectorMaterial: MeshBasicMaterial;
  state: RailState | null;
}

export class RailwayLibrary {
  private arm = armGeometry(6.48);
  private pedestrianArm = armGeometry(2.91);
  private prototype = trainGeometry();
  private lampGeometry = pixelLampGeometry();
  private arrowGeometry = pixelLampGeometry(true);
  private reflectorGeometry = new BoxGeometry(0.071, 0.054, 0.024);

  create(): RailwayInstance {
    const root = new Group(); root.name = 'Live_Railway';
    const train = new Group(); train.name = 'Moving_Yamanote'; train.position.z = RAILWAY.z;
    train.add(this.prototype.body.clone(true));
    const wheels = this.prototype.wheelPoints.map(([x, z]) => {
      const wheel = this.prototype.wheel.clone(true);
      wheel.position.set(x, 0.555, z);
      train.add(wheel);
      return wheel;
    });
    root.add(train);
    const reflectorMaterial = new MeshBasicMaterial({ color: '#ecbb64', toneMapped: false });
    const arms = GATE_POINTS.map(gate => {
      const parent = new Group();
      parent.position.set(gate.x, 1.37, gate.z);
      parent.rotation.y = gate.side > 0 ? 0 : Math.PI;
      const pivot = new Group(); pivot.name = 'Automatic_Gate';
      pivot.add((gate.car ? this.arm : this.pedestrianArm).clone(true));
      for (let light = 0; light < (gate.car ? 3 : 2); light++) for (const face of [-1, 1]) {
        const reflector = new Mesh(this.reflectorGeometry, reflectorMaterial);
        reflector.position.set(gate.length * (light + 1) / (gate.car ? 4 : 3), 0, face * 0.111);
        pivot.add(reflector);
      }
      parent.add(pivot); root.add(parent);
      return pivot;
    });
    const redMaterials = [0, 1].map(() => new MeshBasicMaterial({ color: '#703c31', toneMapped: false }));
    const arrowMaterial = new MeshBasicMaterial({ color: '#754b33', toneMapped: false });
    for (const side of [-1, 1]) for (const end of [-1, 1]) for (let bulb = 0; bulb < 2; bulb++) {
      for (const face of [-1, 1]) {
        const lamp = new Mesh(this.lampGeometry, redMaterials[bulb]);
        lamp.position.set(side * 7 - 0.28 + bulb * 0.56, SIGNAL_HEIGHT, RAILWAY.z + end * RAILWAY.gateOffset + face * 0.142);
        lamp.rotation.y = face < 0 ? Math.PI : 0;
        root.add(lamp);
      }
    }
    for (const side of [-1, 1]) for (const end of [-1, 1]) for (const face of [-1, 1]) {
      const arrow = new Mesh(this.arrowGeometry, arrowMaterial);
      arrow.position.set(side * 7, 2.96, RAILWAY.z + end * RAILWAY.gateOffset + face * 0.113);
      root.add(arrow);
    }
    return { root, train, arms, wheels, redMaterials, arrowMaterial, reflectorMaterial, state: null };
  }

  update(instance: RailwayInstance, state: RailState, night: boolean) {
    instance.state = state;
    instance.train.visible = state.trainVisible;
    instance.train.position.x = state.trainX;
    instance.arms.forEach(arm => { arm.rotation.z = state.angle; });
    instance.wheels.forEach(wheel => { wheel.rotation.z = -state.trainX / 0.239; });
    instance.redMaterials.forEach((material, i) => { material.color.set(state.blocked && state.flash === i ? '#ff6450' : '#683b31'); });
    instance.arrowMaterial.color.set(state.blocked ? '#f2ab57' : '#5f583b');
    instance.reflectorMaterial.color.set(state.blocked && state.flash ? '#ffcf80' : '#b7a66a');
    instance.train.traverse(node => {
      if (node instanceof Mesh && node.material instanceof MeshStandardMaterial) {
        const material = node.material;
        if (material.userData.glow) material.emissiveIntensity = material.userData.glow * (night ? 2.4 : 0.55);
      }
    });
  }

  release(instance: RailwayInstance) {
    instance.redMaterials.forEach(material => material.dispose());
    instance.arrowMaterial.dispose(); instance.reflectorMaterial.dispose(); instance.root.clear();
  }
  dispose() {
    disposeAsset(this.arm); disposeAsset(this.pedestrianArm);
    disposeAsset(this.prototype.body); disposeAsset(this.prototype.wheel);
    this.lampGeometry.dispose();
    this.arrowGeometry.dispose(); this.reflectorGeometry.dispose();
  }
}