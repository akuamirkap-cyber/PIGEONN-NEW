import { Builder } from '../voxel/builder';
import { Rig } from '../voxel/rig';
import type { AssetData, Vec3 } from '../voxel/types';

export type CitizenActivity = 'shopping' | 'queue' | 'ramen' | 'serve' | 'checkout';
export type ShoppingStage = 'approach' | 'browse' | 'pay' | 'leave' | 'rest';

export function shoppingStage(time: number, seed: number): ShoppingStage {
  const phase = ((time + seed * 1.63) % 34 + 34) % 34;
  return phase < 9 ? 'approach' : phase < 15 ? 'browse' : phase < 20 ? 'pay' : phase < 30 ? 'leave' : 'rest';
}

export function primaryActivity(activity?: CitizenActivity) {
  return activity === 'ramen' ? 'Eat' : activity === 'serve' ? 'Serve' : activity === 'checkout' ? 'Shop'
    : activity === 'queue' ? 'ShopPause' : activity === 'shopping' ? 'ShopWalk' : 'Walk';
}

function shoppingBag(r: Rig) {
  r.node('shoppingBag', [0, -0.41, 0.05], 'foreL');
  r.box('shoppingBag', [-0.29, -0.52, -0.16], [0.58, 0.44, 0.32], '#e8d6a9');
  r.box('shoppingBag', [-0.31, -0.09, -0.18], [0.62, 0.05, 0.36], '#f1e1bc');
  for (const x of [-0.15, 0.115]) r.box('shoppingBag', [x, -0.12, -0.043], [0.035, 0.23, 0.045], '#9c8b62');
  r.box('shoppingBag', [-0.15, 0.11, -0.043], [0.3, 0.028, 0.045], '#9c8b62');
  r.box('shoppingBag', [-0.23, -0.39, 0.163], [0.46, 0.056, 0.015], '#69a17c');
  r.box('shoppingBag', [-0.23, -0.32, 0.163], [0.46, 0.03, 0.015], '#d88d51');
  r.box('shoppingBag', [-0.049, -0.295, 0.181], [0.098, 0.127, 0.013], '#b55e42');
}

function bowl(r: Rig) {
  r.node('meal', [0, 1.54, 0.98], 'root');
  r.box('meal', [-0.19, 0, -0.19], [0.38, 0.075, 0.38], '#dfcfad');
  r.box('meal', [-0.3, 0.075, -0.29], [0.6, 0.21, 0.58], '#f5e9ce');
  r.box('meal', [-0.319, 0.285, -0.31], [0.638, 0.049, 0.62], '#b45b48');
  r.box('meal', [-0.285, 0.337, -0.27], [0.57, 0.032, 0.54], '#d6a452');
  for (let i = 0; i < 5; i++) r.box('meal', [-0.23, 0.371, -0.19 + i * 0.079], [0.32, 0.02, 0.026], '#f0d089');
  r.box('meal', [0.057, 0.38, 0.047], [0.17, 0.045, 0.18], '#fff0c8');
  r.box('meal', [0.102, 0.425, 0.09], [0.079, 0.017, 0.08], '#e5b94c');
  r.box('meal', [-0.237, 0.37, 0.086], [0.09, 0.23, 0.15], '#416c43');
  r.box('meal', [0.049, 0.384, -0.18], [0.16, 0.03, 0.083], '#9eba61');
  r.box('root', [-0.45, 1.54, 0.91], [0.17, 0.28, 0.16], '#d2e0c5');
  r.box('root', [-0.457, 1.82, 0.903], [0.184, 0.029, 0.176], '#92ada0');
  for (let i = 0; i < 3; i++) {
    r.node(`mealSteam${i}`, [-0.18 + i * 0.17, 0.48, -0.09 + i * 0.1], 'meal');
    r.box(`mealSteam${i}`, [-0.035, 0, -0.035], [0.07, 0.1, 0.07], '#edeed8');
  }
  r.node('chopsticks', [0, -0.43, 0.07], 'foreR');
  for (const x of [-0.085, 0.022]) r.box('chopsticks', [x, -0.35, -0.013], [0.033, 0.54, 0.026], '#a87b43');
  for (let i = 0; i < 3; i++) r.box('chopsticks', [-0.04 + i * 0.036, -0.36, 0.03], [0.016, 0.23, 0.025], '#edce8b');
}

function shopClips(r: Rig) {
  for (const clip of ['Shop', 'Browse', 'ShopPause']) {
    const reaching = clip === 'Shop';
    r.motion(clip, 'root', 'position', 1, 0.009, { wave: 'bounce', cycles: 1 });
    r.motion(clip, 'body', 'rotation', 0, reaching ? 0.055 : 0.023, { offset: reaching ? 0.06 : 0, cycles: 1 });
    r.motion(clip, 'head', 'rotation', 0, clip === 'Browse' ? 0.11 : 0.06, { wave: 'positive', cycles: 1 });
    r.motion(clip, 'head', 'rotation', 1, clip === 'Browse' ? 0.18 : 0.045, { cycles: 1 });
    for (const side of ['L', 'R']) {
      r.motion(clip, `leg${side}`, 'rotation', 0, 0.009, { cycles: 1 });
      r.motion(clip, `knee${side}`, 'rotation', 0, 0.004, { cycles: 1 });
    }
    r.motion(clip, 'armL', 'rotation', 0, 0.012, { offset: -0.09, cycles: 1 });
    r.motion(clip, 'foreL', 'rotation', 0, 0.017, { offset: -0.12, cycles: 1 });
    r.motion(clip, 'armR', 'rotation', 0, reaching ? 0.15 : 0.035, { offset: reaching ? -1.01 : -0.12, cycles: 1 });
    r.motion(clip, 'foreR', 'rotation', 0, reaching ? 0.19 : 0.018, { offset: reaching ? -0.88 : -0.18, phase: 0.5, cycles: 1 });
    r.motion(clip, 'armR', 'rotation', 1, reaching ? 0.075 : 0.02, { cycles: 1 });
  }
}

function eatClips(r: Rig) {
  for (const clip of ['Eat', 'EatPause']) {
    const active = clip === 'Eat';
    r.motion(clip, 'root', 'position', 1, 0.006, { offset: -0.34, cycles: 1 });
    r.motion(clip, 'body', 'rotation', 0, active ? 0.041 : 0.016, { offset: 0.025, cycles: 2 });
    r.motion(clip, 'head', 'rotation', 0, active ? 0.16 : 0.045, { offset: active ? 0.045 : 0, wave: 'positive', cycles: 2 });
    r.motion(clip, 'head', 'rotation', 1, active ? 0.025 : 0.1, { cycles: 1 });
    for (const side of ['L', 'R']) {
      r.motion(clip, `leg${side}`, 'rotation', 0, 0.004, { offset: -1.38, cycles: 1 });
      r.motion(clip, `knee${side}`, 'rotation', 0, 0.004, { offset: 1.38, cycles: 1 });
    }
    r.motion(clip, 'armL', 'rotation', 0, 0.02, { offset: -0.7, cycles: 2 });
    r.motion(clip, 'foreL', 'rotation', 0, 0.035, { offset: -0.87, cycles: 2 });
    r.motion(clip, 'armR', 'rotation', 0, active ? 0.1 : 0.025, { offset: -0.94, cycles: 2 });
    r.motion(clip, 'foreR', 'rotation', 0, active ? 0.39 : 0.015, { offset: active ? -1.14 : -0.85, cycles: 2, phase: 0.5 });
    r.motion(clip, 'foreR', 'rotation', 1, active ? 0.07 : 0.01, { cycles: 2, phase: 0.6 });
    for (let i = 0; i < 3; i++) r.motion(clip, `mealSteam${i}`, 'position', 1, 0.15, { offset: 0.16, cycles: 2, phase: i * 2.1 });
  }
}

export function citizenActivityModel(data: AssetData, member: string, activity?: CitizenActivity): AssetData {
  if (!activity) return data;
  const b = new Builder();
  b.nodes = (data.nodes ?? []).map(node => ({ ...node, p: [...node.p] as Vec3, rotation: node.rotation ? [...node.rotation] as Vec3 : undefined }));
  b.panels = [...data.panels];
  b.boxes = data.boxes.filter(box => {
    const accessory = box.node?.endsWith('_foreR') && (member === 'salaryman' || member === 'student') && box.p[1] < -0.46;
    return !accessory;
  });
  b.animations = (data.animations ?? []).map(clip => ({ ...clip, channels: clip.channels.map(channel => ({ ...channel })) }));
  const r = new Rig(b, `character_${member}`);
  if (activity === 'ramen') {
    bowl(r);
    eatClips(r);
  } else if (activity === 'serve') {
    const source = b.animations.find(clip => clip.name === 'Iconic');
    if (source) b.animations.push({ ...source, name: 'Serve', channels: source.channels.map(channel => ({ ...channel })) });
  } else {
    if (activity !== 'checkout') shoppingBag(r);
    r.box('foreR', [-0.065, -0.48, 0.12], [0.13, 0.14, 0.13], activity === 'checkout' ? '#4b6d60' : '#daae63');
    r.box('foreR', [-0.063, -0.433, 0.254], [0.126, 0.035, 0.011], '#e8e3cb');
    shopClips(r);
    const walking = b.animations.find(clip => clip.name === 'Walk');
    if (walking) b.animations.push({ ...walking, name: 'ShopWalk', channels: walking.channels.map(channel => ({ ...channel })) });
    if (activity !== 'checkout') {
      for (const clip of ['ShopWalk', 'Shop', 'Browse', 'ShopPause']) r.motion(clip, 'shoppingBag', 'rotation', 2, clip === 'ShopWalk' ? 0.08 : 0.017, { cycles: 2 });
    }
  }
  return b.finish('characters', data.floorY);
}

export function validateDailyLifeCycles() {
  const seen = new Set<ShoppingStage>();
  for (let t = 0; t < 34; t += 0.25) seen.add(shoppingStage(t, 0));
  if (seen.size !== 5 || shoppingStage(0, 0) !== shoppingStage(34, 0)) throw new Error('Invalid shopping activity loop.');
  if (primaryActivity('ramen') !== 'Eat' || primaryActivity('queue') !== 'ShopPause') throw new Error('Invalid customer animation.');
  return true;
}

validateDailyLifeCycles();