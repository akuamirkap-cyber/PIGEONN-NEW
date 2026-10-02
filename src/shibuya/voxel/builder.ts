import type { AssetData, AssetId, GraphicPanel, Part, RigAnimation, RigNode, Vec3, VoxelBox } from './types';

export const P = {
  ivory: '#f3efe0', white: '#fcfaf0', concrete: '#bcc7bc', concreteLight: '#d6ddd0',
  charcoal: '#2c3b34', asphalt: '#58615d', wood: '#ba7b42', woodLight: '#d59a56',
  woodDark: '#72482f', red: '#e3422d', orange: '#f29b38', green: '#168348',
  glass: '#c2e6dd', darkGlass: '#577c79', steel: '#a8b9b2', yellow: '#edc443',
  roof: '#354451', roofLight: '#4c5b65', roofDark: '#253540',
};

export class Builder {
  boxes: VoxelBox[] = [];
  panels: GraphicPanel[] = [];
  part: Part = 'store';
  nodes: RigNode[] = [];
  animations: RigAnimation[] = [];

  box(p: Vec3, s: Vec3, color: string, options: Partial<VoxelBox> = {}) {
    this.boxes.push({ p, s, color, part: this.part, ...options });
  }

  panel(kind: string, p: Vec3, s: [number, number], options: Partial<GraphicPanel> = {}) {
    this.panels.push({ kind, p, s, part: this.part, ...options });
  }

  line(a: Vec3, b: Vec3, thickness: number, color: string, options: Partial<VoxelBox> = {}) {
    const steps = Math.max(2, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / thickness));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      this.box([
        a[0] + (b[0] - a[0]) * t - thickness / 2,
        a[1] + (b[1] - a[1]) * t - thickness / 2,
        a[2] + (b[2] - a[2]) * t - thickness / 2,
      ], [thickness, thickness, thickness], color, options);
    }
  }

  finish(id: AssetId, floorY = 0.73): AssetData {
    const nodeNames = new Set(this.nodes.map(node => node.name));
    if (nodeNames.size !== this.nodes.length) throw new Error(`Duplicate rig nodes in ${id}.`);
    for (const node of this.nodes) {
      if (node.parent && !nodeNames.has(node.parent)) throw new Error(`Unknown parent ${node.parent}.`);
      if (node.p.some(value => !Number.isFinite(value)) || node.rotation?.some(value => !Number.isFinite(value))) throw new Error(`Invalid rig node ${node.name}.`);
      const visited = new Set<string>([node.name]);
      let parent = node.parent;
      while (parent) {
        if (visited.has(parent)) throw new Error(`Cyclic rig in ${id}.`);
        visited.add(parent);
        parent = this.nodes.find(item => item.name === parent)?.parent;
      }
    }
    for (const [index, box] of this.boxes.entries()) {
      if (box.p.some(value => !Number.isFinite(value)) || box.s.some(value => !Number.isFinite(value) || value <= 0)
        || box.rotation?.some(value => !Number.isFinite(value))
        || !/^#[0-9a-f]{6}$/i.test(box.color)) {
        throw new Error(`Invalid voxel ${index} in ${id}.`);
      }
      if (box.node && !nodeNames.has(box.node)) throw new Error(`Unknown voxel rig node ${box.node}.`);
    }
    for (const panel of this.panels) {
      if (panel.p.some(value => !Number.isFinite(value)) || panel.s.some(value => !Number.isFinite(value) || value <= 0)) {
        throw new Error(`Invalid graphic panel ${panel.kind} in ${id}.`);
      }
      if (panel.node && !nodeNames.has(panel.node)) throw new Error(`Unknown graphic rig node ${panel.node}.`);
    }
    for (const animation of this.animations) {
      if (animation.duration <= 0) throw new Error(`Invalid animation duration in ${id}.`);
      for (const channel of animation.channels) {
        if (!nodeNames.has(channel.node) || [channel.amplitude, channel.offset ?? 0, channel.phase ?? 0, channel.cycles ?? 2].some(value => !Number.isFinite(value))) {
          throw new Error(`Invalid animation channel in ${id}.`);
        }
      }
    }
    return { id, boxes: this.boxes, panels: this.panels, floorY, nodes: this.nodes, animations: this.animations };
  }
}