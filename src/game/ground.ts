import * as THREE from "three";
import type { Track, TrackSample } from "./track";

interface Strip {
  lat0: number;
  lat1: number;
  top: number;
  colors: string[];
  skirt: boolean;
}

const ROAD = "#555a66";
const CURB = "#c9c5bb";
const WALK = "#dcd7cb";
const PLAZA = "#a9a49b";
const G1 = "#8ed04e";
const G2 = "#84c645";

function stripsFor(kind: "street" | "park" | "haruna" | "shibuya"): Strip[] {
  if (kind === "shibuya") {
    return [
      // GRAND 6-LANE AVENUE — the camera & gameplay stay on the near 3 lanes;
      // beyond a tree-lined centre median runs the opposite 3-lane carriageway.
      // playable carriageway (3 lanes)
      { lat0: -3.75, lat1: 3.75, top: 0, colors: ["#343a4c"], skirt: false },
      // near curb + granite sidewalk + plaza under the towers
      { lat0: -4.0, lat1: -3.7, top: 0.14, colors: ["#9aa2b5"], skirt: true },
      { lat0: -8.2, lat1: -4.0, top: 0.12, colors: ["#5b6178", "#525871"], skirt: true },
      { lat0: -24, lat1: -8.2, top: 0.1, colors: ["#3d4257", "#444a61"], skirt: true },
      // raised centre median (street trees & lamps live here)
      { lat0: 3.7, lat1: 5.0, top: 0.16, colors: ["#4b5169", "#454b62"], skirt: true },
      // opposite carriageway (3 more lanes)
      { lat0: 5.0, lat1: 12.3, top: 0, colors: ["#31374a"], skirt: false },
      // far curb + sidewalk + plaza
      { lat0: 12.3, lat1: 12.6, top: 0.14, colors: ["#9aa2b5"], skirt: true },
      { lat0: 12.6, lat1: 16.1, top: 0.12, colors: ["#5b6178", "#525871"], skirt: true },
      { lat0: 16.1, lat1: 26, top: 0.1, colors: ["#3d4257", "#444a61"], skirt: true },
    ];
  }
  if (kind === "haruna") {
    return [
      // Mountain Touge dark asphalt
      { lat0: -3.75, lat1: 3.75, top: 0, colors: ["#383d47"], skirt: false },
      // Akina Gutter / concrete mountain drainage ditch curb
      { lat0: -4.1, lat1: -3.75, top: 0.12, colors: ["#717884"], skirt: true },
      { lat0: 3.75, lat1: 4.1, top: 0.12, colors: ["#717884"], skirt: true },
      // Mountain dirt & gravel shoulder
      { lat0: -6.4, lat1: -4.1, top: 0.1, colors: ["#4a3f32", "#56493a"], skirt: true },
      { lat0: 4.1, lat1: 6.4, top: 0.1, colors: ["#4a3f32", "#56493a"], skirt: true },
      // Dense mountain forest slope & mossy banks
      { lat0: -24, lat1: -6.4, top: 0.08, colors: ["#2c4620", "#365427"], skirt: true },
      { lat0: 6.4, lat1: 22, top: 0.08, colors: ["#2c4620", "#365427"], skirt: true },
    ];
  }
  return [
    { lat0: -3.75, lat1: 3.75, top: 0, colors: [ROAD], skirt: false },
    { lat0: -4.0, lat1: -3.7, top: 0.14, colors: [CURB], skirt: true },
    { lat0: 3.7, lat1: 4.0, top: 0.14, colors: [CURB], skirt: true },
    { lat0: -7.0, lat1: -4.0, top: 0.12, colors: [WALK], skirt: true },
    { lat0: 4.0, lat1: 6.3, top: 0.12, colors: [WALK], skirt: true },
    { lat0: -24, lat1: -7.0, top: 0.1, colors: kind === "park" ? [G1, G2] : [PLAZA], skirt: true },
    { lat0: 6.3, lat1: 22, top: 0.1, colors: [G1, G2], skirt: true },
  ];
}

type P = [number, number, number];
interface S {
  x: number;
  y: number;
  z: number;
  sn: number;
  cs: number;
  ux: number;
  uy: number;
  uz: number;
  kappa: number;
}

const tmp: TrackSample = { x: 0, y: 0, z: 0, th: 0, g: 0, kappa: 0 };
const color = new THREE.Color();

/** Builds one chunk of road + sidewalks + grass as a ribbon swept along the track. */
export function buildGroundGeometry(
  track: Track,
  s0: number,
  len: number,
  kind: "street" | "park" | "haruna" | "shibuya",
  skipRailing?: (s: number) => boolean,
): THREE.BufferGeometry {
  const pos: number[] = [];
  const nrm: number[] = [];
  const col: number[] = [];
  const steps = Math.max(1, Math.round(len));

  const sampleAt = (s: number): S => {
    const t = track.sample(s, tmp);
    const sn = Math.sin(t.th);
    const cs = Math.cos(t.th);
    // U = N x T3 with N = (-sn, 0, cs), T3 = (cs, g, sn)
    const ux = -cs * t.g;
    const uy = 1;
    const uz = -sn * t.g;
    const l = Math.hypot(ux, uy, uz);
    return { x: t.x, y: t.y, z: t.z, sn, cs, ux: ux / l, uy: uy / l, uz: uz / l, kappa: t.kappa };
  };
  const smp: S[] = [];
  for (let i = 0; i <= steps; i++) smp.push(sampleAt(s0 + i));

  const shade = (hex: string, k: number): P => {
    color.set(hex);
    return [Math.min(1, color.r * k), Math.min(1, color.g * k), Math.min(1, color.b * k)];
  };
  const vert = (p: P, n: P, c: P) => {
    pos.push(p[0], p[1], p[2]);
    nrm.push(n[0], n[1], n[2]);
    col.push(c[0], c[1], c[2]);
  };
  const tri = (a: P, b: P, c: P, n: P, cl: P) => {
    vert(a, n, cl);
    vert(b, n, cl);
    vert(c, n, cl);
  };
  const pt = (m: S, lat: number, top: number): P => [m.x - m.sn * lat, m.y + top, m.z + m.cs * lat];
  const quad = (a: S, b: S, l0: number, l1: number, top: number, n: P, cl: P) => {
    const p00 = pt(a, l0, top);
    const p01 = pt(a, l1, top);
    const p10 = pt(b, l0, top);
    const p11 = pt(b, l1, top);
    tri(p00, p11, p10, n, cl);
    tri(p00, p01, p11, n, cl);
  };
  const quadVert = (a: S, b: S, lat0: number, lat1: number, top0: number, top1: number, n: P, cl: P) => {
    const p00 = pt(a, lat0, top0);
    const p01 = pt(a, lat1, top1);
    const p10 = pt(b, lat0, top0);
    const p11 = pt(b, lat1, top1);
    tri(p00, p11, p10, n, cl);
    tri(p00, p01, p11, n, cl);
  };

  for (const st of stripsFor(kind)) {
    for (let i = 0; i < steps; i++) {
      const a = smp[i];
      const b = smp[i + 1];
      const hex = st.colors.length > 1 ? st.colors[Math.round(s0 + i) & 1] : st.colors[0];
      const n: P = [(a.ux + b.ux) / 2, (a.uy + b.uy) / 2, (a.uz + b.uz) / 2];
      quad(a, b, st.lat0, st.lat1, st.top, n, shade(hex, 1.05));
      if (st.skirt) {
        const sc = shade(hex, 0.86);
        const bottom = st.top - 0.5;
        const nOut: P = [-(a.sn + b.sn) / 2, 0, (a.cs + b.cs) / 2];
        const nIn: P = [-nOut[0], 0, -nOut[2]];
        const p00 = pt(a, st.lat0, st.top);
        const p01 = pt(a, st.lat1, st.top);
        const p10 = pt(b, st.lat0, st.top);
        const p11 = pt(b, st.lat1, st.top);
        const q00 = pt(a, st.lat0, bottom);
        const q01 = pt(a, st.lat1, bottom);
        const q10 = pt(b, st.lat0, bottom);
        const q11 = pt(b, st.lat1, bottom);
        tri(q01, q11, p11, nOut, sc);
        tri(q01, p11, p01, nOut, sc);
        tri(q00, p10, q10, nIn, sc);
        tri(q00, p00, p10, nIn, sc);
      }
    }
  }

  const white = shade("#e9e9e9", 1);
  if (kind === "haruna") {
    // Mount Haruna Touge: continuous double solid orange/yellow center line and white edge lines along gutters
    const yellow = shade("#f59e0b", 1.05);
    for (let sc = s0; sc < s0 + len; sc += 1) {
      const a = sampleAt(sc);
      const b = sampleAt(sc + 1);
      const n: P = [(a.ux + b.ux) / 2, (a.uy + b.uy) / 2, (a.uz + b.uz) / 2];
      quad(a, b, -0.16, -0.06, 0.009, n, yellow);
      quad(a, b, 0.06, 0.16, 0.009, n, yellow);
      quad(a, b, -3.65, -3.52, 0.009, n, white);
      quad(a, b, 3.52, 3.65, 0.009, n, white);
    }

    // Drift tire skid marks baked into hairpin turns
    const skidColor = shade("#1f2227", 0.95);
    for (let i = 0; i < steps; i++) {
      const a = smp[i];
      const b = smp[i + 1];
      const kappa = Math.abs(a.kappa);
      if (kappa > 0.005) {
        const n: P = [(a.ux + b.ux) / 2, (a.uy + b.uy) / 2, (a.uz + b.uz) / 2];
        const dir = a.kappa > 0 ? 1 : -1;
        quad(a, b, -dir * 1.45 - 0.14, -dir * 1.45 + 0.14, 0.003, n, skidColor);
        quad(a, b, -dir * 2.35 - 0.16, -dir * 2.35 + 0.16, 0.003, n, skidColor);
      }
    }

    // Japanese Touge "40" speed limit markings painted on asphalt
    const chunkIdx = Math.floor(s0 / len);
    if (chunkIdx % 7 === 2) {
      const midS = s0 + 4.5;
      for (let di = 0; di < 3; di++) {
        const sa = sampleAt(midS + di * 0.85);
        const sb = sampleAt(midS + (di + 1) * 0.85);
        const n: P = [(sa.ux + sb.ux) / 2, (sa.uy + sb.uy) / 2, (sa.uz + sb.uz) / 2];
        // "4": stem, left leg, horizontal bar
        quad(sa, sb, -0.9, -0.7, 0.008, n, white);
        if (di >= 1) quad(sa, sb, -1.6, -1.4, 0.008, n, white);
        if (di === 1) quad(sa, sb, -1.6, -0.7, 0.008, n, white);
        // "0": two sides + top/bottom caps
        quad(sa, sb, 0.7, 0.9, 0.008, n, white);
        quad(sa, sb, 1.4, 1.6, 0.008, n, white);
        if (di === 0 || di === 2) quad(sa, sb, 0.7, 1.6, 0.008, n, white);
      }
    }

    // Seamless W-Beam Highway Guardrail swept on both sides along the outer gutter rim
    const railFace = shade("#dce3ec", 1.1);
    const railGroove = shade("#94a3b8", 0.95);
    const railCap = shade("#e2e8f0", 1.15);
    const postCol = shade("#64748b", 0.9);
    const refCol = shade("#ef4444", 1.25);

    for (let i = 0; i < steps; i++) {
      const a = smp[i];
      const b = smp[i + 1];
      const sc = s0 + i;

      for (const side of [-1, 1]) {
        // Positioned cleanly along outer gutter edge: lat = ±4.14
        const baseLat = side * 4.14;
        const innerLat = baseLat - side * 0.04;
        const outerLat = baseLat + side * 0.04;
        const nFacing: P = [-side * (a.sn + b.sn) / 2, 0, side * (a.cs + b.cs) / 2];
        const nBack: P = [-nFacing[0], 0, -nFacing[2]];
        const nUp: P = [0, 1, 0];

        // 1. W-Beam corrugated double-wave guardrail
        // Upper wave facet: 0.50m -> 0.64m
        quadVert(a, b, innerLat, innerLat - side * 0.02, 0.50, 0.64, nFacing, railFace);
        // Lower wave facet: 0.36m -> 0.50m
        quadVert(a, b, innerLat - side * 0.02, innerLat, 0.36, 0.50, nFacing, railGroove);
        // Top cap facet (thickness):
        quadVert(a, b, innerLat, outerLat, 0.64, 0.64, nUp, railCap);
        // Back of rail:
        quadVert(a, b, outerLat, outerLat, 0.36, 0.64, nBack, railGroove);

        // 2. Guardrail steel support posts every 2 meters:
        if (Math.round(sc) % 2 === 0 && Math.abs(sc - Math.round(sc)) < 0.1) {
          quadVert(a, b, outerLat - side * 0.03, outerLat + side * 0.03, 0.10, 0.68, nFacing, postCol);
          // Red reflector disc facing traffic
          quadVert(a, b, innerLat - side * 0.015, innerLat - side * 0.015, 0.52, 0.60, nFacing, refCol);
        }
      }
    }
  } else {
    // lane dashes (Tokyo City / Shibuya playable lanes)
    for (let sc = s0 + 1; sc < s0 + len; sc += 2) {
      const a = sampleAt(sc - 0.5);
      const b = sampleAt(sc + 0.5);
      const n: P = [a.ux, a.uy, a.uz];
      quad(a, b, -1.27, -1.13, 0.008, n, white);
      quad(a, b, 1.13, 1.27, 0.008, n, white);
      if (kind === "shibuya") {
        // opposite carriageway lane dividers (3 lanes: 5.0..12.3)
        quad(a, b, 7.36, 7.5, 0.008, n, white);
        quad(a, b, 9.8, 9.94, 0.008, n, white);
      }
    }
    if (kind === "shibuya") {
      // solid white edge lines hugging the median & the far curb
      for (let sc = s0; sc < s0 + len; sc += 1) {
        const a = sampleAt(sc);
        const b = sampleAt(sc + 1);
        const n: P = [a.ux, a.uy, a.uz];
        quad(a, b, 5.12, 5.26, 0.008, n, white);
        quad(a, b, 12.04, 12.18, 0.008, n, white);
      }
    }
    // sidewalk seams (dark grout lines on Shibuya's night granite, warm concrete by day)
    const seam = shade(kind === "shibuya" ? "#454b62" : "#cbc6ba", 1);
    for (let s = s0; s < s0 + len; s += 2) {
      const a = sampleAt(s - 0.03);
      const b = sampleAt(s + 0.03);
      const n: P = [a.ux, a.uy, a.uz];
      quad(a, b, kind === "shibuya" ? -8.2 : -7, -4, 0.126, n, seam);
      if (kind === "shibuya") quad(a, b, 12.6, 16.1, 0.126, n, seam);
      else quad(a, b, 4, 6.3, 0.126, n, seam);
    }

    // Pagar pembatas trotoar pipa putih khas Jepang (横断防止柵)
    // Tersambung rapi, mulus, dan kontinu 3D volumetrik mengikuti tanjakan/turunan dan kelokan jalan tanpa patah atau anak tangga
    const whitePipe = shade("#f8fafd", 1.2);
    const whiteLower = shade("#e2e8f2", 1.08);
    const whiteTop = shade("#ffffff", 1.25);
    const whiteBack = shade("#cbd5e1", 0.95);
    const whiteBottom = shade("#b0bac8", 0.85);
    const whitePost = shade("#f1f5f9", 1.15);
    const amberRef = shade("#ff9f1c", 1.4);

    const isShibuya = kind === "shibuya";
    const farCurbLat = isShibuya ? 12.45 : 4.12;
    const railSides = [-4.12, farCurbLat];

    const sweptBox = (
      sa: S,
      sb: S,
      lat0: number,
      lat1: number,
      y0: number,
      y1: number,
      colRoad: P,
      colTopFace: P,
      colSide: P,
      colBot: P,
    ) => {
      const l0 = Math.min(lat0, lat1);
      const l1 = Math.max(lat0, lat1);
      const p000 = pt(sa, l0, y0);
      const p001 = pt(sa, l0, y1);
      const p010 = pt(sa, l1, y0);
      const p011 = pt(sa, l1, y1);

      const p100 = pt(sb, l0, y0);
      const p101 = pt(sb, l0, y1);
      const p110 = pt(sb, l1, y0);
      const p111 = pt(sb, l1, y1);

      // 1. Sisi menghadap arah jalan (+lat): normal pointing in +lat
      const nRoad: P = [-(sa.sn + sb.sn) / 2, 0, (sa.cs + sb.cs) / 2];
      tri(p010, p110, p111, nRoad, colRoad);
      tri(p010, p111, p011, nRoad, colRoad);

      // 2. Sisi menghadap trotoar (-lat): normal pointing in -lat
      const nSide: P = [-nRoad[0], 0, -nRoad[2]];
      tri(p000, p001, p101, nSide, colSide);
      tri(p000, p101, p100, nSide, colSide);

      // 3. Puncak pipa / tiang (menghadap ATAS +Y): normal = [0, 1, 0]
      const nUp: P = [0, 1, 0];
      tri(p001, p011, p111, nUp, colTopFace);
      tri(p001, p111, p101, nUp, colTopFace);

      // 4. Bawah pipa / tiang (menghadap BAWAH -Y): normal = [0, -1, 0]
      const nDown: P = [0, -1, 0];
      tri(p000, p100, p110, nDown, colBot);
      tri(p000, p110, p010, nDown, colBot);
    };

    for (const lat of railSides) {
      // 1. Rel Pipa Horizontal: pipa atas (y=0.67 s/d 0.74) & pipa bawah (y=0.38 s/d 0.44)
      for (let i = 0; i < steps; i++) {
        const sc = s0 + i;
        if (skipRailing && (skipRailing(sc + 0.2) || skipRailing(sc + 0.8))) continue;
        const a = smp[i];
        const b = smp[i + 1];

        // Pipa atas (top rail, 7cm x 7cm 3D box)
        sweptBox(a, b, lat - 0.035, lat + 0.035, 0.67, 0.74, whitePipe, whiteTop, whiteBack, whiteBottom);
        // Pipa bawah (lower rail, 6cm x 6cm 3D box)
        sweptBox(a, b, lat - 0.03, lat + 0.03, 0.38, 0.44, whiteLower, whiteTop, whiteBack, whiteBottom);
      }

      // 2. Tiang Pipa Tegak 3D setiap 2 meter (sc = s0 + 0, 2, 4, 6, 8, 10, 12)
      for (let offset = 0; offset <= steps; offset += 2) {
        const sc = s0 + offset;
        if (skipRailing && skipRailing(sc)) continue;
        const pa = sampleAt(sc - 0.045);
        const pb = sampleAt(sc + 0.045);
        const l0 = lat - 0.045;
        const l1 = lat + 0.045;
        const y0 = 0.12; // menancap rapi di trotoar
        const y1 = 0.77; // puncak tiang sedikit di atas rel atas

        // 4 sisi tegak + cap atas tiang
        sweptBox(pa, pb, l0, l1, y0, y1, whitePost, whiteTop, whitePost, whiteBottom);

        // Cap depan tiang (menghadap arus datang / -s):
        const nA: P = [-pa.cs, 0, -pa.sn];
        const pA00 = pt(pa, l0, y0);
        const pA10 = pt(pa, l1, y0);
        const pA11 = pt(pa, l1, y1);
        const pA01 = pt(pa, l0, y1);
        tri(pA00, pA10, pA11, nA, whitePost);
        tri(pA00, pA11, pA01, nA, whitePost);

        // Reflektor bulat oranye khas pagar trotoar Jepang di muka tiang
        const pR00 = pt(pa, l0 + 0.012, 0.54);
        const pR10 = pt(pa, l1 - 0.012, 0.54);
        const pR11 = pt(pa, l1 - 0.012, 0.62);
        const pR01 = pt(pa, l0 + 0.012, 0.62);
        tri(pR00, pR10, pR11, nA, amberRef);
        tri(pR00, pR11, pR01, nA, amberRef);

        // Cap belakang tiang (menghadap +s):
        const nB: P = [pb.cs, 0, pb.sn];
        const pB00 = pt(pb, l0, y0);
        const pB10 = pt(pb, l1, y0);
        const pB11 = pt(pb, l1, y1);
        const pB01 = pt(pb, l0, y1);
        tri(pB00, pB01, pB11, nB, whitePost);
        tri(pB00, pB11, pB10, nB, whitePost);
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  geo.computeBoundingSphere();
  return geo;
}
