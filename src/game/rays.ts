import * as THREE from "three";

/**
 * Tekstur SINAR CAHAYA (raylight) untuk item langka: bintang dengan sinar
 * berselang-seling panjang/pendek plus halo hangat di tengahnya.
 * Dipakai sebagai billboard aditif (selalu menghadap kamera) di belakang roket
 * dan sebagai kilatan besar saat roket diambil.
 */
let rayTex: THREE.Texture | null = null;
export function getRayTexture(): THREE.Texture {
  if (rayTex) return rayTex;
  const S = 256;
  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  const g = c.getContext("2d")!;
  const cx = S / 2;
  const cy = S / 2;
  // halo lembut di tengah
  const halo = g.createRadialGradient(cx, cy, 0, cx, cy, S * 0.5);
  halo.addColorStop(0, "rgba(255,255,255,0.95)");
  halo.addColorStop(0.16, "rgba(255,248,220,0.6)");
  halo.addColorStop(0.45, "rgba(255,238,180,0.18)");
  halo.addColorStop(1, "rgba(255,238,180,0)");
  g.fillStyle = halo;
  g.fillRect(0, 0, S, S);
  // sinar radial: bergantian panjang & pendek
  const N = 18;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + 0.12;
    const long = i % 2 === 0;
    const len = S * 0.5 * (long ? 1 : 0.58);
    const w = long ? 0.06 : 0.034;
    g.save();
    g.translate(cx, cy);
    g.rotate(a);
    const grad = g.createLinearGradient(0, 0, len, 0);
    grad.addColorStop(0, "rgba(255,255,255,0.9)");
    grad.addColorStop(0.4, "rgba(255,247,205,0.4)");
    grad.addColorStop(1, "rgba(255,240,180,0)");
    g.fillStyle = grad;
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(len, -len * w);
    g.lineTo(len, len * w);
    g.closePath();
    g.fill();
    g.restore();
  }
  rayTex = new THREE.CanvasTexture(c);
  rayTex.colorSpace = THREE.SRGBColorSpace;
  rayTex.needsUpdate = true;
  return rayTex;
}
