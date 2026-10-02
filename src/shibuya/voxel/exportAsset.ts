import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { ASSET_INFO, getAssetData, type AssetId } from './models';
import { buildAssetObject, disposeAsset, setDiorama } from './renderModel';

export async function exportAssetGlb(id: AssetId, diorama: boolean, focus?: string | null): Promise<Blob> {
  const root = buildAssetObject(getAssetData(id, focus));
  setDiorama(root, diorama);
  root.updateMatrixWorld(true);
  try {
    const buffer = await new GLTFExporter().parseAsync(root, {
      binary: true, onlyVisible: true, maxTextureSize: 512, animations: root.animations, trs: root.animations.length > 0,
    });
    if (!(buffer instanceof ArrayBuffer)) throw new Error('Expected a binary GLB.');
    return new Blob([buffer], { type: 'model/gltf-binary' });
  } finally {
    disposeAsset(root);
  }
}

export function downloadBlob(blob: Blob, id: AssetId, extension: 'glb' | 'png', focus?: string | null) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${ASSET_INFO[id].file}${focus ? `-${focus}` : ''}.${extension}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export async function captureAsset(canvas: HTMLCanvasElement): Promise<Blob> {
  const cropped = document.createElement('canvas');
  const source = document.createElement('canvas');
  source.width = canvas.width; source.height = canvas.height;
  const ctx = source.getContext('2d')!;
  ctx.drawImage(canvas, 0, 0);
  const pixels = ctx.getImageData(0, 0, source.width, source.height).data;
  let left = source.width, right = 0, top = source.height, bottom = 0;
  // Trim the transparent studio space; the PNG contains the asset, not the interface.
  for (let y = 0; y < source.height; y += 2) {
    for (let x = 0; x < source.width; x += 2) {
      if (pixels[(y * source.width + x) * 4 + 3] > 22) {
        left = Math.min(left, x); right = Math.max(right, x);
        top = Math.min(top, y); bottom = Math.max(bottom, y);
      }
    }
  }
  if (left >= right || top >= bottom) throw new Error('The 3D canvas is not ready.');
  const padding = 48;
  cropped.width = right - left + padding * 2;
  cropped.height = bottom - top + padding * 2;
  cropped.getContext('2d')!.drawImage(source, left, top, right - left, bottom - top, padding, padding, right - left, bottom - top);
  return new Promise((resolve, reject) => {
    cropped.toBlob(blob => blob ? resolve(blob) : reject(new Error('PNG export failed.')), 'image/png');
  });
}