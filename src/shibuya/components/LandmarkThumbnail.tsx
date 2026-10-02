import type { ReactNode } from 'react';
import type { AssetId } from '../voxel/models';
import type { Vec3 } from '../voxel/types';

function shade(color: string, factor: number) {
  const value = parseInt(color.slice(1), 16);
  return `rgb(${Math.min(255, (value >> 16) * factor)},${Math.min(255, ((value >> 8) & 255) * factor)},${Math.min(255, (value & 255) * factor)})`;
}

const project = (x: number, y: number, z: number) => `${64 + (x - z) * 4.1},${79 + (x + z) * 1.7 - y * 3.5}`;

function Cube({ x, y, z, w, h, d, c }: { x: number; y: number; z: number; w: number; h: number; d: number; c: string }) {
  return <g>
    <polygon points={[project(x, y, z + d), project(x + w, y, z + d), project(x + w, y + h, z + d), project(x, y + h, z + d)].join(' ')} fill={c} />
    <polygon points={[project(x + w, y, z), project(x + w, y, z + d), project(x + w, y + h, z + d), project(x + w, y + h, z)].join(' ')} fill={shade(c, 0.73)} />
    <polygon points={[project(x, y + h, z), project(x + w, y + h, z), project(x + w, y + h, z + d), project(x, y + h, z + d)].join(' ')} fill={shade(c, 1.14)} />
  </g>;
}

function Beam({ a, b, c, width = 1 }: { a: Vec3; b: Vec3; c: string; width?: number }) {
  return <polyline points={`${project(...a)} ${project(...b)}`} fill="none" stroke={c} strokeWidth={width} strokeLinecap="square" />;
}

function Tree({ x, z, pink = false, scale = 1 }: { x: number; z: number; pink?: boolean; scale?: number }) {
  return <g><Cube x={x - 0.13} y={0.5} z={z - 0.13} w={0.26} h={2.9 * scale} d={0.26} c="#76503b" />
    <Cube x={x - scale} y={2.3 * scale} z={z - scale} w={2 * scale} h={0.95 * scale} d={2 * scale} c={pink ? '#e7adbe' : '#649844'} />
    <Cube x={x - 0.7 * scale} y={3.25 * scale} z={z - 0.7 * scale} w={1.4 * scale} h={0.4 * scale} d={1.4 * scale} c={pink ? '#f6cdd4' : '#89b052'} />
  </g>;
}

function Office({ x = -2.5, z = -2.2, h = 13, w = 5, d = 4.4 }: { x?: number; z?: number; h?: number; w?: number; d?: number }) {
  return <g><Cube x={x} y={0.5} z={z} w={w} h={h} d={d} c="#8caaba" />
    {Array.from({ length: Math.floor(h) }, (_, row) => Array.from({ length: 5 }, (_, col) => <g key={`${row}-${col}`}>
      <Cube x={x + col * w / 5 + 0.12} y={0.75 + row} z={z + d + 0.01} w={w / 5 - 0.24} h={0.6} d={0.03} c="#81cdd7" />
      <Cube x={x + w + 0.01} y={0.75 + row} z={z + col * d / 5 + 0.12} w={0.03} h={0.6} d={d / 5 - 0.24} c="#5299bd" />
    </g>))}
    <Cube x={x - 0.13} y={h + 0.5} z={z - 0.13} w={w + 0.26} h={0.45} d={d + 0.26} c="#36536a" />
  </g>;
}

export default function LandmarkThumbnail({ asset }: { asset: AssetId }) {
  let scene: ReactNode;
  if (asset === 'machiya' || asset === 'townhouse') {
    scene = <><Cube x={-2.6} y={0.5} z={-2.3} w={5.2} h={0.25} d={4.6} c="#b0b69d" />
      <Cube x={-2.4} y={0.75} z={-2.15} w={4.8} h={4.9} d={4.3} c={asset === 'machiya' ? '#e1cda3' : '#e9e1c8'} />
      {[-1.93, 0.4].map(x => <g key={x}>
        <Cube x={x} y={1.25} z={2.17} w={1.5} h={1.16} d={0.065} c="#9fc6bf" />
        <Cube x={x} y={3.7} z={2.17} w={1.5} h={1.16} d={0.065} c="#afcfbf" />
        {asset === 'machiya' && [0.16, 0.48, 0.8, 1.12].map(xx => <Cube key={xx} x={x + xx} y={3.72} z={2.244} w={0.05} h={1.14} d={0.02} c="#9d7a4a" />)}
      </g>)}
      <Cube x={-0.36} y={0.75} z={2.175} w={0.72} h={1.9} d={0.1} c="#94764e" />
      {Array.from({ length: 5 }, (_, i) => <Cube key={i} x={-2.95 + i * 0.43} y={5.66 + i * 0.21} z={-2.5} w={5.9 - i * 0.86} h={0.16} d={5} c="#52676a" />)}
      {asset === 'machiya' ? <>
        {[-2.46, -0.09, 2.36].map(x => <Cube key={x} x={x} y={0.76} z={2.22} w={0.09} h={4.88} d={0.08} c="#9a6d41" />)}
        <Cube x={-2.6} y={3.07} z={2.17} w={5.2} h={0.18} d={0.53} c="#435b5d" />
      </> : <>
        <Cube x={-2.5} y={3.04} z={2.17} w={5.0} h={0.14} d={0.59} c="#a9bba6" />
        <Cube x={-2.5} y={3.24} z={2.7} w={5.0} h={0.64} d={0.05} c="#7e9a91" />
      </>}
      <Tree x={-4.3} z={2.65} scale={0.68} /><Tree x={3.96} z={2.5} scale={0.62} />
    </>;
  } else if (asset === 'pagoda') {
    scene = <><Tree x={-4.5} z={0} pink scale={0.8} /><Tree x={3.8} z={-2.5} pink scale={0.8} />
      {Array.from({ length: 5 }, (_, tier) => {
        const y = 0.7 + tier * 2.9, half = 2.0 - tier * 0.18;
        return <g key={tier}><Cube x={-half} y={y} z={-half} w={half * 2} h={1.62} d={half * 2} c="#cb5739" />
          <Cube x={-half * 0.65} y={y + 0.52} z={half + 0.01} w={half * 0.48} h={0.7} d={0.02} c="#f5ddbc" />
          <Cube x={half * 0.2} y={y + 0.52} z={half + 0.01} w={half * 0.48} h={0.7} d={0.02} c="#f5ddbc" />
          <Cube x={-half - 0.3} y={y + 0.35} z={half + 0.14} w={half * 2 + 0.6} h={0.13} d={0.13} c="#f38642" />
          {Array.from({ length: 4 }, (_, layer) => <Cube key={layer} x={-half - 0.67 + layer * 0.43} y={y + 1.65 + layer * 0.24} z={-half - 0.67 + layer * 0.43} w={half * 2 + 1.34 - layer * 0.86} h={0.17} d={half * 2 + 1.34 - layer * 0.86} c="#3b493e" />)}
        </g>;
      })}<Cube x={-0.06} y={15.06} z={-0.06} w={0.12} h={2.8} d={0.12} c="#c39943" />
      {Array.from({ length: 7 }, (_, i) => <Cube key={i} x={-0.25} y={15.1 + i * 0.3} z={-0.25} w={0.5} h={0.08} d={0.5} c="#e5be62" />)}
      <Tree x={1.9} z={4.1} pink scale={0.72} /></>;
  } else if (asset === 'sakura') {
    scene = <><Tree x={0} z={0} pink scale={2.15} /><Cube x={-3.7} y={0.5} z={2.7} w={2.5} h={0.55} d={0.4} c="#c69759" /></>;
  } else if (asset === 'skyscraper') {
    scene = <><Office x={-7.5} z={-4.7} w={2.9} d={2.5} h={8.1} /><Office x={4.4} z={-4.7} w={2.8} d={3} h={9.0} />
      <Office x={-2.9} z={-6.8} w={2.4} d={2.2} h={9.4} /><Office x={0.4} z={-6.8} w={2.5} d={2.2} h={6.7} />
      <Cube x={-7.8} y={8.8} z={-2.16} w={3.5} h={1.05} d={0.12} c="#3f9249" />
      <Cube x={4.36} y={9.7} z={-1.6} w={2.95} h={1.09} d={0.12} c="#3192b3" />
      <Cube x={-8.15} y={4.3} z={-3.64} w={16.3} h={0.8} d={1.0} c="#e1e7d2" />
      <Cube x={-8.15} y={4.48} z={-3.65} w={16.3} h={0.21} d={1.04} c="#65a149" />
      <Office h={19.2} w={5.6} d={5} />
      <Cube x={-3.3} y={0.5} z={2.5} w={7} h={2.5} d={0.75} c="#385d79" />
      <Cube x={-1.75} y={19.75} z={-1.4} w={2.4} h={0.2} d={2.4} c="#e2cb72" />
      <Cube x={-1.6} y={19.96} z={-1.25} w={2.1} h={0.02} d={2.1} c="#7e969b" />
      <Cube x={-2.1} y={19.75} z={-1.8} w={0.12} h={2.4} d={0.12} c="#b7c9c5" />
      <Tree x={-4.5} z={4} scale={0.7} /><Tree x={4.2} z={4} scale={0.7} />
      <Office x={-7.4} z={3.1} w={2.6} d={2.1} h={3.7} /><Office x={5.4} z={3.1} w={2.3} d={2.1} h={3.7} />
      <Cube x={-3.65} y={0.59} z={5.12} w={1.6} h={0.36} d={0.75} c="#edd151" />
      <Cube x={0.1} y={0.59} z={5.12} w={1.6} h={0.36} d={0.75} c="#edd151" /></>;
  } else if (asset === 'tokyotower') {
    scene = <><Office x={-6.5} z={-5.6} w={2.2} d={1.7} h={3.9} /><Office x={-3.5} z={-5.6} w={2.2} d={1.7} h={4.6} />
      <Office x={0.1} z={-5.6} w={2.2} d={1.7} h={3.0} /><Office x={3.7} z={-5.6} w={2.2} d={1.7} h={4.3} />
      <Tree x={-6.5} z={0.9} scale={0.9} /><Tree x={6.1} z={0.9} scale={0.9} />
      <Cube x={-2.3} y={0.5} z={-2.3} w={4.6} h={2.0} d={4.6} c="#765649" />
      <Cube x={-2.4} y={2.5} z={-2.4} w={4.8} h={0.19} d={4.8} c="#d2d4c6" />
      {[-1.8, -0.5, 0.8].map(x => <Cube key={x} x={x} y={1.1} z={2.31} w={0.99} h={0.9} d={0.04} c="#a6cacf" />)}
      {[-1, 1].map(sx => [-1, 1].map(sz => <g key={`${sx}-${sz}`}>
        <Cube x={sx * 4.4 - 0.34} y={0.5} z={sz * 4.4 - 0.34} w={0.68} h={0.19} d={0.68} c="#d6d8c5" />
        <Beam a={[sx * 4.4, 0.7, sz * 4.4]} b={[sx * 1.77, 12.55, sz * 1.77]} c="#d44732" width={1.7} />
      </g>))}
      {Array.from({ length: 6 }, (_, i) => {
        const y0 = 4.25 + i * 1.39, y1 = y0 + 1.39;
        const h0 = 3.64 - i * 0.31, h1 = h0 - 0.31;
        return <g key={i}>{[0, 1].map(axis => [0, 1, 2].map(col => {
          const a0 = -h0 + col * h0 * 2 / 3, a1 = -h0 + (col + 1) * h0 * 2 / 3;
          const c0 = -h1 + col * h1 * 2 / 3, c1 = -h1 + (col + 1) * h1 * 2 / 3;
          return <g key={`${axis}-${col}`}>
            <Beam a={axis ? [h0, y0, a0] : [a0, y0, h0]} b={axis ? [h1, y1, c1] : [c1, y1, h1]} c="#e65b3c" width={0.8} />
            <Beam a={axis ? [h0, y0, a1] : [a1, y0, h0]} b={axis ? [h1, y1, c0] : [c0, y1, h1]} c="#c94231" width={0.8} />
          </g>;
        }))}<Beam a={[-h0, y0, h0]} b={[h0, y0, h0]} c="#e65b3c" width={1.05} /><Beam a={[h0, y0, -h0]} b={[h0, y0, h0]} c="#cf4230" width={1.05} /></g>;
      })}
      <Cube x={-2.51} y={12.61} z={-2.51} w={5.02} h={0.89} d={5.02} c="#edeedd" />
      <Cube x={-2.42} y={12.87} z={2.52} w={4.84} h={0.29} d={0.02} c="#94bdc9" />
      <Cube x={2.52} y={12.87} z={-2.42} w={0.02} h={0.29} d={4.84} c="#749baa" />
      {Array.from({ length: 8 }, (_, i) => {
        const y0 = 13.65 + i * 1.2, h0 = 1.62 - i * 0.145, h1 = h0 - 0.145;
        const color = i === 3 || i === 4 ? '#eeefdf' : '#df5137';
        return <g key={i}>
          <Beam a={[-h0, y0, h0]} b={[h1, y0 + 1.2, h1]} c={color} width={1.0} /><Beam a={[h0, y0, h0]} b={[-h1, y0 + 1.2, h1]} c={color} width={1.0} />
          <Beam a={[h0, y0, -h0]} b={[h1, y0 + 1.2, h1]} c={color} width={0.9} /><Beam a={[h0, y0, h0]} b={[h1, y0 + 1.2, -h1]} c={color} width={0.9} />
          <Beam a={[-h0, y0, h0]} b={[h0, y0, h0]} c={color} width={0.9} /><Beam a={[h0, y0, -h0]} b={[h0, y0, h0]} c={color} width={0.9} />
        </g>;
      })}
      <Cube x={-0.81} y={23.26} z={-0.81} w={1.62} h={0.44} d={1.62} c="#ebecdc" />
      {[0, 1, 2, 3, 4].map(i => <Cube key={i} x={-0.32 + i * 0.05} y={23.75 + i * 1.22} z={-0.32 + i * 0.05} w={0.64 - i * 0.1} h={1.22} d={0.64 - i * 0.1} c={i % 2 ? '#eceee1' : '#e15a3d'} />)}
      <Cube x={-0.07} y={29.85} z={-0.07} w={0.14} h={1.01} d={0.14} c="#d84732" />
      <Tree x={-4.4} z={5.1} scale={0.65} /><Tree x={4.4} z={5.1} scale={0.65} />
      <Cube x={-2.89} y={0.57} z={5.83} w={1.71} h={0.39} d={0.78} c="#ead04b" />
      <Cube x={0.68} y={0.57} z={5.83} w={1.71} h={0.39} d={0.78} c="#5aafab" /></>;
  } else if (asset === 'shibuya109') {
    scene = <>{Array.from({ length: 11 }, (_, i) => <g key={i}>
      <Cube x={-2.8} y={0.5 + i * 1.08} z={-1.8} w={5.6} h={0.85} d={3.6} c="#cdd8ce" />
      <Cube x={-1.8} y={0.5 + i * 1.08} z={-2.8} w={3.6} h={0.85} d={5.6} c="#d4ded3" />
      <Cube x={-2.82} y={0.74 + i * 1.08} z={-1.8} w={5.64} h={0.34} d={3.6} c="#5b98b6" />
      <Cube x={-1.8} y={0.74 + i * 1.08} z={-2.82} w={3.6} h={0.34} d={5.64} c="#77b5c3" />
    </g>)}<Cube x={-0.18} y={12.45} z={-0.2} w={0.36} h={2.0} d={0.4} c="#bdcdc5" />
      <Cube x={-1.65} y={13.6} z={0} w={3.3} h={1.2} d={0.2} c="#f1e8d5" />
      <text x="64" y="29" textAnchor="middle" fontFamily="monospace" fontSize="9" fontWeight="bold" fill="#ce4b3c">109</text></>;
  } else if (asset === 'qfront') {
    scene = <><Office h={12.0} /><Cube x={-2.1} y={4.9} z={2.24} w={4.25} h={7.2} d={0.15} c="#68bdc6" />
      <Cube x={-1.64} y={8.1} z={2.405} w={1.54} h={1.7} d={0.02} c="#e7979d" />
      <Cube x={0.13} y={5.5} z={2.405} w={1.56} h={3.65} d={0.02} c="#305e76" />
      <Cube x={-2.64} y={2.6} z={2.2} w={5.3} h={0.5} d={0.5} c="#458159" /></>;
  } else if (asset === 'station') {
    scene = <><Cube x={-4.4} y={0.5} z={-2.3} w={8.8} h={3.5} d={4.6} c="#e2e3cc" />
      <Cube x={-4.5} y={3.0} z={-2.4} w={9} h={0.34} d={4.8} c="#4c9748" />
      <Cube x={-4.85} y={4.1} z={-1.7} w={9.7} h={0.3} d={2} c="#879995" />
      <Cube x={-4.6} y={4.4} z={-1.5} w={9.2} h={1.0} d={1.6} c="#dce5d2" />
      <Cube x={-4.6} y={4.7} z={-1.51} w={9.2} h={0.22} d={1.64} c="#7bb648" />
      {Array.from({ length: 9 }, (_, i) => <Cube key={i} x={-4.25 + i} y={4.95} z={0.12} w={0.62} h={0.34} d={0.03} c="#5897ab" />)}
      {[-3, -0.5, 2].map(x => <Cube key={x} x={x} y={0.51} z={2.32} w={1.32} h={2.0} d={0.04} c="#88b9b8" />)}</>;
  } else if (asset === 'torii') {
    scene = <><Tree x={-4.5} z={-1.5} pink scale={0.8} /><Cube x={-2.1} y={0.5} z={-3.1} w={4.2} h={2.5} d={3.4} c="#ba8950" />
      {Array.from({ length: 4 }, (_, i) => <Cube key={i} x={-3 + i * 0.4} y={3.0 + i * 0.2} z={-4 + i * 0.4} w={6 - i * 0.8} h={0.15} d={5 - i * 0.8} c="#455345" />)}
      {[-1.45, 1.45].map(x => <Cube key={x} x={x} y={0.5} z={3.2} w={0.23} h={3.2} d={0.28} c="#e56035" />)}
      <Cube x={-2.3} y={3.1} z={3.2} w={4.83} h={0.2} d={0.35} c="#e56035" />
      <Cube x={-2.58} y={3.74} z={3.1} w={5.36} h={0.18} d={0.5} c="#414a35" /></>;
  } else if (asset === 'izakaya') {
    scene = <>{[-3.1, 0.1].map((x, i) => <g key={x}><Cube x={x} y={0.5} z={-2.7} w={2.9} h={3.8 + i * 0.4} d={4.1} c={i ? '#76553a' : '#a87545'} />
      <Cube x={x - 0.2} y={4.3 + i * 0.4} z={-2.9} w={3.3} h={0.3} d={4.5} c="#435346" />
      <Cube x={x + 0.23} y={0.55} z={1.44} w={0.99} h={1.8} d={0.03} c="#ad8c54" />
      <Cube x={x + 1.5} y={1.3} z={1.44} w={0.88} h={0.86} d={0.03} c="#f1c783" />
      {[0.2, 1.2, 2.2].map(xx => <Cube key={xx} x={x + xx} y={2.8} z={1.75} w={0.34} h={0.7} d={0.34} c="#e76439" />)}
    </g>)}</>;
  } else if (asset === 'crossing') {
    scene = <><Cube x={-5} y={0.45} z={-5} w={10} h={0.2} d={10} c="#4b6265" />
      {Array.from({ length: 7 }, (_, i) => <g key={i}><Cube x={-2.2 + i * 0.62} y={0.66} z={-4.6} w={0.31} h={0.018} d={1.8} c="#f8efda" /><Cube x={-4.6} y={0.66} z={-2.2 + i * 0.62} w={1.8} h={0.018} d={0.31} c="#f8efda" /></g>)}
      <Cube x={1.1} y={0.7} z={2.5} w={2.2} h={0.49} d={0.95} c="#e9c64b" />
      <Cube x={1.7} y={1.19} z={2.6} w={1.1} h={0.39} d={0.75} c="#9ec8c3" />
      <Cube x={-3.8} y={0.6} z={2.8} w={0.14} h={3} d={0.14} c="#8c9d93" /><Cube x={-4.2} y={3.4} z={2.8} w={1.1} h={0.4} d={0.25} c="#334e40" /></>;
  } else {
    scene = <><Office h={10.7} w={4.0} d={3.9} />
      {Array.from({ length: 7 }, (_, i) => <Cube key={i} x={-2.65} y={1.3 + i * 1.3} z={1.82} w={1.23} h={1} d={0.28} c={['#d05e48', '#e3b84f', '#60a8ad', '#ba749b'][i % 4]} />)}
      <Cube x={-2.26} y={12.05} z={0.48} w={4.6} h={1.67} d={0.23} c="#6fb1b7" /></>;
  }
  return <svg className="asset-thumbnail" viewBox="0 0 128 94" fill="none" aria-hidden="true">
    <g transform={asset === 'tokyotower' ? 'translate(20 22) scale(.69)' : asset === 'skyscraper' ? 'translate(12 9) scale(.78)' : undefined}>
      <Cube x={asset === 'skyscraper' ? -8.6 : -6.4} y={0.1} z={asset === 'skyscraper' ? -7.0 : -5.6} w={asset === 'skyscraper' ? 17.2 : 12.8} h={0.36} d={asset === 'skyscraper' ? 14.0 : 11.2} c={['pagoda', 'sakura', 'torii'].includes(asset) ? '#aac47e' : '#c2ccba'} />
      {scene}
    </g>
  </svg>;
}