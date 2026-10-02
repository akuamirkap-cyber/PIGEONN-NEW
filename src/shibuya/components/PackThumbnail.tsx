import { Euler, Matrix4, Quaternion, Vector3 } from 'three';
import { useMemo } from 'react';
import { getAssetData } from '../voxel/models';
import type { PackId, Vec3 } from '../voxel/types';
import { sampleMotion } from '../voxel/rig';

const MEMBERS: Record<PackId, string[]> = {
  characters: ['yakuza', 'maiko', 'sumo'],
  vehicles: ['cub', 'gt'],
  animals: ['shiba', 'neko', 'capybara'],
};

function shade(color: string, amount: number) {
  const value = parseInt(color.slice(1), 16);
  return `rgb(${Math.min(255, Math.round((value >> 16) * amount))},${Math.min(255, Math.round(((value >> 8) & 255) * amount))},${Math.min(255, Math.round((value & 255) * amount))})`;
}

export default function PackThumbnail({ asset }: { asset: PackId }) {
  const faces = useMemo(() => {
    const result: { key: string; points: string; color: string; depth: number; opacity: number }[] = [];
    const q = new Quaternion();
    const v = new Vector3();
    const project = (p: Vector3) => `${64 + p.x * 11 - p.z * 3.7},${72 - p.y * 16 + p.z * 4.2 + p.x * 1.25}`;
    MEMBERS[asset].forEach((id, index) => {
      const data = getAssetData(asset, id);
      const nodeMatrices = new Map<string, Matrix4>();
      const animation = data.animations?.find(item => item.name !== 'Iconic');
      for (const node of data.nodes ?? []) {
        const position: Vec3 = [...node.p];
        const rotation: Vec3 = [...(node.rotation ?? [0, 0, 0])];
        for (const channel of animation?.channels ?? []) {
          if (channel.node === node.name) (channel.property === 'position' ? position : rotation)[channel.axis] += sampleMotion(channel, 0, animation!.duration);
        }
        const matrix = new Matrix4().compose(new Vector3(...position), q.setFromEuler(new Euler(...rotation)), new Vector3(1, 1, 1));
        if (node.parent) matrix.premultiply(nodeMatrices.get(node.parent)!);
        nodeMatrices.set(node.name, matrix);
      }
      const shift = asset === 'vehicles' ? (index - 0.5) * 4.65 : (index - 1) * 3.0;
      data.boxes.filter(box => box.part === 'store').forEach((box, boxIndex) => {
        const corners: Vector3[] = [];
        const rotation = q.setFromEuler(new Euler(...(box.rotation ?? [0, 0, 0]))).clone();
        const center: Vec3 = [box.p[0] + box.s[0] / 2, box.p[1] + box.s[1] / 2, box.p[2] + box.s[2] / 2];
        for (let i = 0; i < 8; i++) {
          v.set((i & 1 ? 0.5 : -0.5) * box.s[0], (i & 2 ? 0.5 : -0.5) * box.s[1], (i & 4 ? 0.5 : -0.5) * box.s[2]).applyQuaternion(rotation).add(new Vector3(...center));
          if (box.node) v.applyMatrix4(nodeMatrices.get(box.node)!);
          v.x += shift;
          corners.push(v.clone());
        }
        [[4, 5, 7, 6], [1, 3, 7, 5], [2, 6, 7, 3]].forEach((indices, faceIndex) => {
          const points = indices.map(i => corners[i]);
          const center = points.reduce((acc, item) => acc.add(item), new Vector3()).multiplyScalar(0.25);
          result.push({ key: `${id}-${boxIndex}-${faceIndex}`, points: points.map(project).join(' '),
            color: shade(box.color, [1, 0.77, 1.12][faceIndex]), depth: center.z + center.x * 0.25 - center.y * 0.08, opacity: box.opacity ?? 1 });
        });
      });
    });
    return result.sort((a, b) => a.depth - b.depth);
  }, [asset]);
  return <svg className="asset-thumbnail" viewBox="0 0 128 94" fill="none" aria-hidden="true">
    <path d="M6 67L82 52L124 75L49 91Z" fill={asset === 'vehicles' ? '#bfcfc5' : '#d1ddbd'} />
    <path d="M6 67L49 91V94L6 70Z" fill="#9bad8c" />
    <path d="M49 91L124 75V78L49 94Z" fill="#849e7c" />
    {faces.map(face => <polygon key={face.key} points={face.points} fill={face.color} opacity={face.opacity} />)}
  </svg>;
}