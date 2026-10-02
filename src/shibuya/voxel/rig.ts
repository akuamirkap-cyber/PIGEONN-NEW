import { AnimationClip, Euler, Quaternion, QuaternionKeyframeTrack, VectorKeyframeTrack, type Group, type KeyframeTrack } from 'three';
import type { Builder } from './builder';
import type { AssetData, MotionChannel, RigAnimation, Vec3 } from './types';
import type { PackMember } from './packCatalog';

export class Rig {
  constructor(public b: Builder, public prefix: string) {}

  name(node: string) { return `${this.prefix}_${node}`; }

  node(node: string, p: Vec3, parent?: string, rotation?: Vec3, member?: string) {
    this.b.nodes.push({ name: this.name(node), p, parent: parent ? this.name(parent) : undefined, rotation, member });
  }

  rotation(node: string, rotation: Vec3) {
    const target = this.b.nodes.find(item => item.name === this.name(node));
    if (!target) throw new Error(`Missing rig node ${node}.`);
    target.rotation = rotation;
  }

  box(node: string, p: Vec3, s: Vec3, color: string, rotation?: Vec3, glow?: number) {
    this.b.box(p, s, color, { node: this.name(node), rotation, glow });
  }

  panel(node: string, kind: string, p: Vec3, s: [number, number], rotation?: Vec3) {
    this.b.panel(kind, p, s, { node: this.name(node), rotation });
  }

  motion(clip: string, node: string, property: 'rotation' | 'position', axis: 0 | 1 | 2,
    amplitude: number, options: Partial<MotionChannel> = {}) {
    let animation = this.b.animations.find(item => item.name === clip);
    if (!animation) {
      animation = { name: clip, duration: 4, channels: [] };
      this.b.animations.push(animation);
    }
    animation.channels.push({ node: this.name(node), property, axis, amplitude, ...options });
  }
}

export function exhibitionFloor(b: Builder, width: number, depth: number, color = '#c7d5bc') {
  b.part = 'setting';
  b.box([-width / 2, -0.04, -depth / 2], [width, 0.13, depth], '#849b79');
  b.box([-width / 2, 0.09, -depth / 2], [width, 0.035, depth], color);
  b.box([-width / 2, 0.125, -depth / 2], [width, 0.016, 0.05], '#e9eddb');
  b.box([-width / 2, 0.125, depth / 2 - 0.05], [width, 0.016, 0.05], '#e9eddb');
  for (let i = 0; i < width / 0.8; i++) {
    b.box([-width / 2 + i * 0.8 + 0.2, 0.126, depth / 2 - 0.25], [0.12, 0.013, 0.07], '#a3b89b');
  }
  b.part = 'store';
}

export function memberLabel(b: Builder, member: PackMember, x: number, z: number, index: number, width = 1.9) {
  b.part = 'setting';
  b.panel(`member-${member.id}`, [x, 0.147, z], [width, 0.43], { rotation: [-Math.PI / 2, 0, 0] });
  b.box([x - 0.055, 0.132, z - 0.59], [0.11, 0.009, 0.19], member.color);
  for (let i = 0; i < 3; i++) b.box([x - 0.09, 0.131, z - 1.03 - i * 0.31], [0.18, 0.01, 0.027], '#afbf9e');
  b.panel(`index-${String(index + 1).padStart(2, '0')}`, [x, 0.146, z + 0.31], [0.39, 0.22], { rotation: [-Math.PI / 2, 0, 0] });
  b.part = 'store';
}

export function sampleMotion(channel: MotionChannel, time: number, duration: number) {
  const cycles = channel.cycles ?? 2;
  const theta = (time / duration * cycles) * Math.PI * 2 + (channel.phase ?? 0);
  if (channel.wave === 'spin') return (channel.offset ?? 0) + channel.amplitude * time / duration * cycles * Math.PI * 2;
  const wave = Math.sin(theta);
  return (channel.offset ?? 0) + channel.amplitude * (channel.wave === 'bounce' ? Math.abs(wave) : channel.wave === 'positive' ? Math.max(0, wave) : wave);
}

export function buildRigAnimations(root: Group, data: AssetData): AnimationClip[] {
  return (data.animations ?? []).map((animation: RigAnimation) => {
    const groups = new Map<string, MotionChannel[]>();
    animation.channels.forEach(channel => {
      const key = `${channel.node}|${channel.property}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(channel);
    });
    const tracks: KeyframeTrack[] = [];
    const count = Math.ceil(animation.duration * 30);
    const times = Float32Array.from({ length: count + 1 }, (_, i) => i / count * animation.duration);
    const quaternion = new Quaternion();
    const euler = new Euler();
    for (const channels of groups.values()) {
      const { node, property } = channels[0];
      const object = root.getObjectByName(node);
      if (!object) throw new Error(`Missing animation node ${node}.`);
      const base: Vec3 = property === 'position' ? [object.position.x, object.position.y, object.position.z] : [object.rotation.x, object.rotation.y, object.rotation.z];
      const values: number[] = [];
      for (let i = 0; i <= count; i++) {
        const pose: Vec3 = [...base];
        for (const channel of channels) pose[channel.axis] += sampleMotion(channel, times[i], animation.duration);
        if (property === 'position') values.push(...pose);
        else {
          quaternion.setFromEuler(euler.set(...pose));
          values.push(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
        }
      }
      tracks.push(property === 'position'
        ? new VectorKeyframeTrack(`${node}.position`, times, values)
        : new QuaternionKeyframeTrack(`${node}.quaternion`, times, values));
    }
    const clip = new AnimationClip(animation.name, animation.duration, tracks);
    if (!clip.validate()) throw new Error(`Invalid clip ${animation.name}.`);
    return clip;
  });
}