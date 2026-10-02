export type AssetId = 'konbini' | 'ramen' | 'pagoda' | 'sakura' | 'skyscraper' | 'tokyotower'
  | 'shibuya109' | 'qfront' | 'station' | 'neon' | 'torii' | 'izakaya' | 'crossing'
  | 'characters' | 'vehicles' | 'animals' | 'machiya' | 'townhouse';
export type PackId = 'characters' | 'vehicles' | 'animals';
export type Vec3 = [number, number, number];
export type Part = 'store' | 'setting';

export interface VoxelBox {
  p: Vec3;
  s: Vec3;
  color: string;
  rotation?: Vec3;
  glow?: number;
  opacity?: number;
  part: Part;
  node?: string;
}

export interface GraphicPanel {
  kind: string;
  p: Vec3;
  s: [number, number];
  rotation?: Vec3;
  glow?: number;
  part: Part;
  node?: string;
}

export interface RigNode {
  name: string;
  p: Vec3;
  rotation?: Vec3;
  parent?: string;
  member?: string;
}

export interface MotionChannel {
  node: string;
  property: 'rotation' | 'position';
  axis: 0 | 1 | 2;
  amplitude: number;
  offset?: number;
  phase?: number;
  cycles?: number;
  wave?: 'sin' | 'bounce' | 'positive' | 'spin';
}

export interface RigAnimation {
  name: string;
  duration: number;
  channels: MotionChannel[];
}

export interface AssetData {
  id: AssetId;
  boxes: VoxelBox[];
  panels: GraphicPanel[];
  floorY: number;
  nodes?: RigNode[];
  animations?: RigAnimation[];
}