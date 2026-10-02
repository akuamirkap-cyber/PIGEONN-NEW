import type { Vec3 } from '../voxel/types';
import { RAILWAY } from './simulation';

export type StreetPropKind = 'mailbox' | 'bike-rack' | 'utility' | 'recycling' | 'speed-sign' | 'direction-sign';
export interface StreetProp {
  kind: StreetPropKind;
  x: number;
  z: number;
  footprint: [number, number];
  orientation?: number;
}

export const STREET_PROPS: StreetProp[] = [
  { kind: 'mailbox', x: -9.43, z: 30.7, footprint: [0.48, 0.48], orientation: Math.PI / 2 },
  { kind: 'mailbox', x: 9.43, z: -44.65, footprint: [0.48, 0.48], orientation: -Math.PI / 2 },
  { kind: 'bike-rack', x: -28.55, z: 7.57, footprint: [3.8, 0.8] },
  { kind: 'bike-rack', x: 28.55, z: -7.57, footprint: [3.8, 0.8], orientation: Math.PI },
  { kind: 'utility', x: 9.42, z: 42.2, footprint: [0.52, 0.62], orientation: -Math.PI / 2 },
  { kind: 'utility', x: -36.2, z: -7.86, footprint: [0.62, 0.52] },
  { kind: 'recycling', x: -9.46, z: -51.0, footprint: [0.4, 1.15], orientation: Math.PI / 2 },
  { kind: 'recycling', x: 36.4, z: 7.67, footprint: [1.15, 0.4] },
  { kind: 'speed-sign', x: -6.36, z: 23.5, footprint: [0.18, 0.18] },
  { kind: 'speed-sign', x: 6.36, z: -24.1, footprint: [0.18, 0.18], orientation: Math.PI },
  { kind: 'direction-sign', x: -6.37, z: 46.1, footprint: [0.18, 0.18] },
  { kind: 'direction-sign', x: 6.37, z: -55.6, footprint: [0.18, 0.18], orientation: Math.PI },
];

export const DETAIL_FOCUS: Vec3 = [-9.25, 0.9, 30.7];

export const DECORATION_FEATURES = [
  { name: 'Perlintasan', items: 'Crossbuck bergaris, lampu berpelindung, engsel, pemberat, reflektor, dan indikator arah kereta.' },
  { name: 'Permukaan jalan', items: 'Manhole motif sakura, gutter, drainase kisi, marka 30, dan reflektor tepi jalan.' },
  { name: 'Trotoar', items: 'Tactile paving bergaris dan berbintik, pot bunga, pagar putih, rambu, kotak pos, sepeda, dan kabinet utilitas.' },
] as const;

export function validateStreetProps() {
  for (const [index, prop] of STREET_PROPS.entries()) {
    const [width, depth] = prop.footprint;
    if (width <= 0 || depth <= 0 || !Number.isFinite(prop.x + prop.z)) throw new Error('Invalid street prop footprint.');
    if (Math.abs(prop.x) - width / 2 < 6.06 || Math.abs(prop.z) + depth / 2 > 63.9) {
      throw new Error(`${prop.kind} occupies a traffic lane or block connector.`);
    }
    if (Math.abs(prop.z - RAILWAY.z) < depth / 2 + RAILWAY.reserveHalfWidth + 0.2) {
      throw new Error(`${prop.kind} obstructs the railway or barrier arm.`);
    }
    if (Math.abs(prop.z) > 9 && Math.abs(prop.x) > 6.9 && Math.abs(prop.x) - width / 2 < 9.16) {
      throw new Error(`${prop.kind} blocks the pedestrian corridor.`);
    }
    for (const other of STREET_PROPS.slice(index + 1)) {
      if (Math.abs(prop.x - other.x) < (width + other.footprint[0]) / 2
        && Math.abs(prop.z - other.z) < (depth + other.footprint[1]) / 2) throw new Error('Street props overlap.');
    }
  }
  return true;
}

validateStreetProps();