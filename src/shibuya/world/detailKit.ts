import type { Builder } from '../voxel/builder';
import type { Vec3 } from '../voxel/types';

export function pixelDisc(b: Builder, center: Vec3, radius: number, thickness: number, color: string,
  plane: 'xy' | 'xz' = 'xy', glow?: number) {
  const step = radius / 5;
  for (let row = -4; row <= 4; row++) {
    const offset = row * step;
    const half = Math.floor(Math.sqrt(radius * radius - offset * offset) / step) * step;
    if (plane === 'xy') b.box([center[0] - half, center[1] + offset - step / 2, center[2] - thickness / 2],
      [half * 2, step, thickness], color, { glow });
    else b.box([center[0] - half, center[1] - thickness / 2, center[2] + offset - step / 2],
      [half * 2, thickness, step], color, { glow });
  }
}

export function stripedCrossbuck(b: Builder, center: Vec3, length: number, width: number,
  yellow: string, black: string) {
  for (const angle of [-Math.PI / 4, Math.PI / 4]) {
    b.box([center[0] - length / 2, center[1] - width / 2, center[2] - 0.083], [length, width, 0.166], yellow,
      { rotation: [0, 0, angle] });
    const bands = 9;
    for (let i = 0; i < bands; i++) {
      if (i % 2 === 0) continue;
      const offset = -length / 2 + (i + 0.5) * length / bands;
      const x = center[0] + offset * Math.cos(angle), y = center[1] + offset * Math.sin(angle);
      for (const face of [-1, 1]) b.box([x - length / bands / 2, y - width / 2 - 0.003, center[2] + face * 0.093 - 0.01],
        [length / bands, width + 0.006, 0.02], black, { rotation: [0, 0, angle] });
    }
  }
}