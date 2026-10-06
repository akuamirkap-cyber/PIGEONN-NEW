/**
 * Canvas painters for the distant scenery (Mount Fuji + layered hills).
 * Pure 2D canvas, no three.js — flat colours and crisp shapes on purpose (the earlier vertex-colour
 * gradients blended green/pink/blue into mud). Everything here is deterministic.
 */

export const MIST_HEX = "#dbeeff";

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* Mount Fuji                                                          */
/* ------------------------------------------------------------------ */

/**
 * Fuji as a flat illustration: symmetric concave cone with a slightly flat crater rim, periwinkle rock,
 * a jagged white snow cap with long fingers running down the gullies, soft radial ridges, a shaded right
 * flank, two wisps of cloud and a hazy foot that melts into the mist colour.
 */
export function paintFuji(W = 1600, H = 400): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const R = rng(3776);

  const cx = W / 2;
  const top = 36;
  const bot = H + 8;
  const hwTop = 40 * (W / 1600);
  // Fuji is a BROAD cone: flanks ~30° from horizontal (half-width ≈ 1.4–1.55× the height), slightly concave,
  // with a flat crater rim. t = 0 at the summit, 1 at the bottom of the canvas.
  const hw = (t: number) => hwTop + 569 * (W / 1600) * Math.pow(t, 1.35);
  const yOf = (t: number) => top + (bot - top) * t;
  const wob = (t: number, s: number) => (Math.sin(t * 23 + s * 2.1) * 2.6 + Math.sin(t * 57 + s) * 1.3 + Math.sin(t * 11 + s * 4) * 3.4) * Math.min(1, t * 3);
  const STEPS = 90;

  const mountainPath = () => {
    const p = new Path2D();
    p.moveTo(cx - hwTop, top + 9);
    p.quadraticCurveTo(cx - hwTop * 0.7, top - 1, cx - hwTop * 0.3, top);
    p.quadraticCurveTo(cx - hwTop * 0.05, top + 5, cx + hwTop * 0.2, top + 1);
    p.quadraticCurveTo(cx + hwTop * 0.65, top - 3, cx + hwTop, top + 10);
    for (let i = 1; i <= STEPS; i++) {
      const t = i / STEPS;
      p.lineTo(cx + hw(t) + wob(t, 1), yOf(t));
    }
    for (let i = STEPS; i >= 1; i--) {
      const t = i / STEPS;
      p.lineTo(cx - hw(t) - wob(t, -1), yOf(t));
    }
    p.closePath();
    return p;
  };
  const mountain = mountainPath();

  g.save();
  g.clip(mountain);

  // rock: one hue, darker at the summit, hazier toward the foot
  const rock = g.createLinearGradient(0, top, 0, bot);
  rock.addColorStop(0, "#4a70be");
  rock.addColorStop(0.45, "#6892dc");
  rock.addColorStop(0.8, "#9ec0eb");
  rock.addColorStop(1, "#cde2f8");
  g.fillStyle = rock;
  g.fillRect(0, 0, W, H);

  // shaded right flank (a soft diagonal ridge running down from just right of the summit)
  g.beginPath();
  g.moveTo(cx + hwTop * 0.1, top - 4);
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    g.lineTo(cx + hw(t) * (0.1 + 0.1 * t), yOf(t));
  }
  g.lineTo(W, bot);
  g.lineTo(W, 0);
  g.closePath();
  g.fillStyle = "rgba(36,58,128,0.24)";
  g.fill();
  // and a lighter lit rim on the far left edge
  g.beginPath();
  g.moveTo(cx - hwTop, top + 6);
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    g.lineTo(cx - hw(t) * 0.94 - wob(t, -1) * 0.6, yOf(t));
  }
  for (let i = STEPS; i >= 0; i--) {
    const t = i / STEPS;
    g.lineTo(cx - hw(t) - wob(t, -1) - 6, yOf(t));
  }
  g.closePath();
  g.fillStyle = "rgba(255,255,255,0.10)";
  g.fill();

  // radial ridges / gullies (narrow wedges that fan out from the summit)
  const ridges: { u: number; t1: number; w1: number; dark: boolean }[] = [];
  for (let i = 0; i < 26; i++) {
    const u = (R() * 2 - 1) * 0.95;
    ridges.push({ u, t1: 0.55 + R() * 0.45, w1: 4 + R() * 14, dark: R() < 0.62 });
  }
  const drawRidges = (t0: number, darkCol: string, lightCol: string) => {
    for (const r of ridges) {
      const a = { x: cx + r.u * hw(t0), y: yOf(t0) };
      const b = { x: cx + r.u * hw(r.t1), y: yOf(r.t1) };
      g.beginPath();
      g.moveTo(a.x - 0.8, a.y);
      g.lineTo(a.x + 0.8, a.y);
      g.lineTo(b.x + r.w1 / 2, b.y);
      g.lineTo(b.x - r.w1 / 2, b.y);
      g.closePath();
      g.fillStyle = r.dark ? darkCol : lightCol;
      g.fill();
    }
  };
  drawRidges(0.16, "rgba(38,62,132,0.17)", "rgba(255,255,255,0.10)");

  // ---- snow cap ----
  const snowHw = hw(0.34);
  const fingers = [-0.88, -0.63, -0.4, -0.15, 0.12, 0.37, 0.62, 0.87].map((u, i) => ({ x: cx + u * snowHw, w: (26 + ((i * 7) % 5) * 3) * (W / 1600), d: [0.075, 0.105, 0.06, 0.125, 0.07, 0.11, 0.06, 0.09][i] }));
  const snowT = (x: number) => {
    let t = 0.3 + 0.022 * Math.sin(x * 0.03) + 0.016 * Math.sin(x * 0.083 + 1) + 0.01 * Math.sin(x * 0.19 + 2);
    for (const f of fingers) {
      const k = 1 - Math.abs(x - f.x) / f.w;
      if (k > 0) t += f.d * Math.pow(k, 1.35);
    }
    return t;
  };
  const snowY = (x: number) => {
    const t = snowT(x);
    const dx = (x - cx) / Math.max(1, hw(Math.min(1, t)));
    const bulge = 12 * Math.max(0, 1 - dx * dx); // ring seen from slightly above
    return yOf(t) + bulge;
  };
  const snowPath = () => {
    const p = new Path2D();
    p.moveTo(0, 0);
    p.lineTo(W, 0);
    for (let x = W; x >= 0; x -= 2) p.lineTo(x, snowY(x));
    p.closePath();
    return p;
  };
  const snow = snowPath();
  g.fillStyle = "#ffffff";
  g.fill(snow);

  g.save();
  g.clip(snow);
  // snow shading: right flank + bluish gullies + a couple of soft shadow patches
  g.beginPath();
  g.moveTo(cx + hwTop * 0.1, top - 4);
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    g.lineTo(cx + hw(t) * (0.1 + 0.1 * t), yOf(t));
  }
  g.lineTo(W, bot);
  g.lineTo(W, 0);
  g.closePath();
  g.fillStyle = "rgba(120,150,214,0.33)";
  g.fill();
  drawRidges(0.03, "rgba(112,142,210,0.34)", "rgba(255,255,255,0.0)");
  g.fillStyle = "rgba(150,176,228,0.22)";
  g.beginPath();
  g.ellipse(cx - 60, top + 62, 46, 12, -0.25, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.ellipse(cx + 80, top + 100, 60, 14, 0.2, 0, Math.PI * 2);
  g.fill();
  g.restore();

  // hazy foot: same mist colour as the world haze
  const mist = g.createLinearGradient(0, H * 0.68, 0, H);
  mist.addColorStop(0, "rgba(219,238,255,0)");
  mist.addColorStop(1, "rgba(219,238,255,1)");
  g.fillStyle = mist;
  g.fillRect(0, H * 0.68, W, H * 0.32);
  g.restore();

  // two flat wisps of cloud drifting across the slope
  const wisp = (x: number, y: number, w: number, h: number) => {
    g.fillStyle = "#ffffff";
    for (let i = 0; i < 6; i++) {
      const k = i / 5;
      g.beginPath();
      g.ellipse(x + (k - 0.5) * w * 0.8, y - Math.sin(k * Math.PI) * h * 0.45, w * (0.16 + 0.1 * Math.sin(k * Math.PI)), h * (0.5 + 0.3 * Math.sin(k * Math.PI)), 0, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = "#e6eff9";
    g.beginPath();
    g.ellipse(x, y + h * 0.28, w * 0.46, h * 0.2, 0, 0, Math.PI * 2);
    g.fill();
  };
  wisp(cx - 330, top + 235, 330, 38);
  wisp(cx + 370, top + 165, 270, 32);
  return c;
}

/* ------------------------------------------------------------------ */
/* Layered hills, sakura groves, pagoda and fields (360° panorama)      */
/* ------------------------------------------------------------------ */

/** Vertical layout of the panorama (world units, at the cylinder radius): top = +TOP_Y, bottom = -BOT_Y. */
export const PANO = { topY: 14, botY: 50 };

interface Palette {
  /** warna badan tajuk */
  base: string;
  /** sisi yang kena cahaya */
  mid: string;
  /** kilau paling atas */
  hi: string;
  /** bayangan / bagian bawah tajuk */
  shade: string;
}

const GREENS: Palette[] = [
  { base: "#4f9d63", mid: "#63b476", hi: "#93d49f", shade: "#3c7f4f" },
  { base: "#579f68", mid: "#6dbb7e", hi: "#9edaaa", shade: "#41834f" },
  { base: "#489158", mid: "#5cab6c", hi: "#8ccb96", shade: "#376f44" },
];
const PINKS: Palette[] = [
  { base: "#ee8fb7", mid: "#f8aecb", hi: "#ffd7e6", shade: "#cf6e97" },
  { base: "#f19ac1", mid: "#fbbcd4", hi: "#ffe0ec", shade: "#d77aa1" },
  { base: "#e785ae", mid: "#f4a6c4", hi: "#ffcee0", shade: "#c76591" },
];

export function paintHills(W = 4096, H = 512): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const R = rng(20240607);
  const TAU = Math.PI * 2;
  const pxPerUnit = H / (PANO.topY + PANO.botY);
  const yUnits = (u: number) => (PANO.topY - u) * pxPerUnit; // world height (units) -> canvas y
  const s = W / 4096; // feature scale

  const harm = (x: number, terms: [number, number, number][]) => terms.reduce((acc, [k, a, p]) => acc + a * Math.sin((TAU * k * x) / W + p), 0);

  // wrap-aware drawing: draw again at x±W when a shape crosses the seam
  const wrap = (x: number, r: number, draw: (xx: number) => void) => {
    draw(x);
    if (x - r < 0) draw(x + W);
    if (x + r > W) draw(x - W);
  };

  /** Isi satu lapisan bukit dengan gradasi lembut (atas lebih terang, bawah lebih dalam). */
  const fillLayer = (crest: (x: number) => number, top: string, bottom: string, rim?: string) => {
    g.beginPath();
    g.moveTo(0, H);
    for (let x = 0; x <= W; x += 4) g.lineTo(x, crest(x));
    g.lineTo(W, H);
    g.closePath();
    const grad = g.createLinearGradient(0, yUnits(2), 0, H);
    grad.addColorStop(0, top);
    grad.addColorStop(1, bottom);
    g.fillStyle = grad;
    g.fill();
    if (rim) {
      g.beginPath();
      for (let x = 0; x <= W; x += 4) (x === 0 ? g.moveTo : g.lineTo).call(g, x, crest(x) + 2.5 * s);
      g.lineWidth = 5 * s;
      g.strokeStyle = rim;
      g.stroke();
    }
  };

  /** Periode gelombang dalam piksel, tapi jumlah gelombangnya BULAT keliling tabung (anti-jahitan di seam). */
  const cyc = (pxAt4096: number) => W / Math.max(1, Math.round(4096 / pxAt4096));

  /** Sisi atas rimba: gabungan beberapa sinus (gelombang besar + sedang + keriting kecil). */
  const bumpyTop = (crest: (x: number) => number, x: number, dy: number, amp: number, seed: number) =>
    crest(x) +
    dy * pxPerUnit +
    Math.sin((TAU * x) / cyc(9.5) + seed) * amp * pxPerUnit * 0.5 +
    Math.sin((TAU * x) / cyc(4.3) + seed * 1.9) * amp * pxPerUnit * 0.3 +
    Math.sin((TAU * x) / cyc(1.7) + seed * 3.1) * amp * pxPerUnit * 0.15 +
    Math.sin((TAU * x) / cyc(0.86) + seed * 5.3) * amp * pxPerUnit * 0.1;

  /**
   * RIMBA menyatu: bidang dengan sisi atas bergelombang dan sisi bawah mengikuti garis bukit.
   * Ini pengganti deretan bulatan hijau — yang terlihat adalah siluet hutan, bukan untaian manik.
   */
  const forestBand = (
    crest: (x: number) => number,
    o: { dy: number; thick: number; amp: number; seed: number; top: string; bottom: string; rim?: string; x0?: number; x1?: number },
  ) => {
    const x0 = o.x0 ?? 0;
    const x1 = o.x1 ?? W;
    const botAt = (x: number) => crest(x) + (o.dy + o.thick) * pxPerUnit + Math.sin((TAU * x) / cyc(15) + o.seed * 0.7) * o.amp * pxPerUnit * 0.45;
    g.beginPath();
    for (let x = x0; x <= x1; x += 4) {
      const y = bumpyTop(crest, x, o.dy, o.amp, o.seed);
      if (x === x0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    for (let x = x1; x >= x0; x -= 4) g.lineTo(x, botAt(x));
    g.closePath();
    const grad = g.createLinearGradient(0, bumpyTop(crest, (x0 + x1) / 2, o.dy, o.amp, o.seed) - o.amp * pxPerUnit, 0, botAt((x0 + x1) / 2) + o.thick * pxPerUnit);
    grad.addColorStop(0, o.top);
    grad.addColorStop(1, o.bottom);
    g.fillStyle = grad;
    g.fill();
    if (o.rim) {
      g.beginPath();
      for (let x = x0; x <= x1; x += 4) (x === x0 ? g.moveTo : g.lineTo).call(g, x, bumpyTop(crest, x, o.dy, o.amp, o.seed) + 1.1 * s);
      g.lineWidth = 2.6 * s;
      g.strokeStyle = o.rim;
      g.stroke();
    }
  };

  /**
   * Tajuk pohon tunggal berbentuk BLOB tak beraturan (bukan lingkaran), dengan bayangan
   * bawah dan kilau atas. Dipakai hemat: hanya untuk pohon aksen di tepi ladang / kaki bukit.
   */
  const blob = (x: number, y: number, rU: number, pal: Palette, seed: number, trunk = false) => {
    const r = rU * pxPerUnit;
    wrap(x, r * 1.8, (xx) => {
      if (trunk && rU > 1.2) {
        g.fillStyle = "#5c4127";
        g.fillRect(xx - r * 0.07, y + r * 0.5, r * 0.14, r * 0.6);
      }
      const n = 12;
      g.beginPath();
      for (let i = 0; i <= n; i++) {
        const a = (i / n) * TAU;
        const lump = 0.76 + 0.3 * (0.5 + 0.5 * Math.sin(a * 3 + seed)) + 0.1 * Math.sin(a * 5 - seed * 1.7);
        const rr = r * lump;
        const px = xx + Math.cos(a) * rr;
        const py = y + Math.sin(a) * rr * 0.8;
        if (i === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.closePath();
      g.fillStyle = pal.shade;
      g.fill();
      g.save();
      g.clip();
      g.fillStyle = pal.base;
      g.beginPath();
      g.arc(xx - r * 0.16, y - r * 0.2, r * 0.94, 0, TAU);
      g.fill();
      g.fillStyle = pal.mid;
      g.beginPath();
      g.arc(xx - r * 0.34, y - r * 0.42, r * 0.58, 0, TAU);
      g.fill();
      g.fillStyle = pal.hi;
      g.beginPath();
      g.arc(xx - r * 0.48, y - r * 0.58, r * 0.24, 0, TAU);
      g.fill();
      g.restore();
    });
  };

  const pickPal = (arr: Palette[]) => arr[Math.floor(R() * arr.length)];

  /** Kebun sakura: band pink di rentang x tertentu + tepi bergerigi dari pohon blob pink. */
  const grove = (
    x0: number,
    x1: number,
    crest: (x: number) => number,
    rows: { dy: number; thick: number; amp: number; seed: number }[],
  ) => {
    for (const row of rows) {
      forestBand(crest, { ...row, top: PINKS[1].mid, bottom: PINKS[0].base, x0, x1 });
    }
    const n = Math.max(3, Math.round((x1 - x0) / (9 * s)));
    for (let i = 0; i < n; i++) {
      const x = x0 + (i / Math.max(1, n - 1)) * (x1 - x0) + (R() - 0.5) * 8 * s;
      if (x < 4 || x > W - 4) continue;
      const last = rows[rows.length - 1];
      const r = 1.4 + R() * 1.6;
      const pal = R() < 0.88 ? pickPal(PINKS) : pickPal(GREENS);
      blob(x, bumpyTop(crest, x, last.dy, last.amp, last.seed) + (R() - 0.3) * 0.8 * pxPerUnit, r, pal, R() * 6);
    }
  };

  /* --- ridge jauh: biru pucat berkabut, tanpa detail --- */
  const farCrest = (x: number) => yUnits(0.2) + harm(x, [[3, -22 * s, 0.4], [5, 13 * s, 1.3], [9, 9 * s, 2.1], [17, 5 * s, 0.7], [33, 2.5 * s, 3]]);
  fillLayer(farCrest, "#b3d3d9", "#c8e0e4", "#d5e9ec");
  g.fillStyle = "rgba(219,238,255,0.32)";
  g.fillRect(0, yUnits(0.2) - 40 * s, W, H);

  /* --- bukit tengah: hijau muda dengan tiga lapis rimba + kebun sakura + pagoda --- */
  const midCrest = (x: number) => yUnits(-3.2) + harm(x, [[4, -20 * s, 2], [6, 12 * s, 0.6], [11, 8 * s, 1.7], [19, 4 * s, 2.9], [37, 2.5 * s, 0.2]]);
  fillLayer(midCrest, "#a8dcb0", "#8fcb9c", "#c2e9c7");
  // rimba 3 lapis: belakang gelap & kecil (terbaca "jauh"), depan terang & besar
  forestBand(midCrest, { dy: 0.4, thick: 3.2, amp: 1.1, seed: 1.3, top: "#528f65", bottom: "#3f7a51" });
  forestBand(midCrest, { dy: 3.0, thick: 3.6, amp: 1.3, seed: 2.7, top: "#5fae72", bottom: "#4a9660" });
  forestBand(midCrest, { dy: 6.4, thick: 4.4, amp: 1.6, seed: 4.1, top: "#74c485", bottom: "#5cae70", rim: "#a3dea9" });
  // kebun sakura
  for (const [gx, gw] of [
    [0.015, 0.075],
    [0.24, 0.085],
    [0.43, 0.06],
    [0.59, 0.085],
    [0.79, 0.075],
    [0.92, 0.065],
  ] as [number, number][]) {
    grove(W * gx, W * (gx + gw), midCrest, [
      { dy: 1.8, thick: 3.4, amp: 1.1, seed: 6.2 },
      { dy: 5.0, thick: 4.2, amp: 1.4, seed: 7.4 },
    ]);
  }
  // pagoda + rimbun di kakinya
  const pagoda = (x: number, baseY: number, k: number) => {
    wrap(x, 40 * k, (xx) => {
      const tiers = 5;
      let y = baseY;
      g.fillStyle = "#7d8792";
      g.fillRect(xx - 22 * k, y - 5 * k, 44 * k, 5 * k);
      for (let i = 0; i < tiers; i++) {
        const w = (26 - i * 3.6) * k;
        const bh = 7.5 * k;
        y -= bh;
        g.fillStyle = i % 2 ? "#efe6d0" : "#b3271b";
        g.fillRect(xx - w / 2, y, w, bh);
        const rw = w + 9 * k;
        g.fillStyle = "#44505c";
        g.beginPath();
        g.moveTo(xx - rw / 2 - 2 * k, y + 1 * k);
        g.lineTo(xx - rw / 2 + 3 * k, y - 4 * k);
        g.lineTo(xx + rw / 2 - 3 * k, y - 4 * k);
        g.lineTo(xx + rw / 2 + 2 * k, y + 1 * k);
        g.closePath();
        g.fill();
        y -= 4 * k;
      }
      g.fillStyle = "#44505c";
      g.fillRect(xx - 1 * k, y - 12 * k, 2 * k, 12 * k);
      g.fillStyle = "#ffd21f";
      g.fillRect(xx - 3 * k, y - 8 * k, 6 * k, 1.5 * k);
    });
  };
  {
    const px = W * 0.234;
    // rimba rapat di belakang pagoda, jadi pagoda berdiri DI antara pepohonan
    for (let i = 0; i < 18; i++) {
      const x = px - 190 * s + i * 22 * s + (R() - 0.5) * 12 * s;
      const r = 2.2 + R() * 2.2;
      blob(x, midCrest(x) + (4.4 + R() * 2.2) * pxPerUnit, r, i % 4 === 1 ? pickPal(PINKS) : pickPal(GREENS), R() * 6);
    }
    pagoda(px, midCrest(px) + 7.6 * pxPerUnit, 1.35 * s);
  }

  /* --- bukit dekat: rimba lebih besar & gelap di kaki --- */
  const nearCrest = (x: number) => yUnits(-10.5) + harm(x, [[5, -12 * s, 0.9], [8, 8 * s, 2.2], [14, 5 * s, 0.3], [27, 3 * s, 1.4]]);
  fillLayer(nearCrest, "#7cc387", "#6cb679", "#9ad9a2");
  forestBand(nearCrest, { dy: 0.6, thick: 4.0, amp: 1.3, seed: 2.1, top: "#4b8f5c", bottom: "#3d7b4d" });
  forestBand(nearCrest, { dy: 3.8, thick: 4.6, amp: 1.6, seed: 3.8, top: "#5dac6f", bottom: "#48945c" });
  forestBand(nearCrest, { dy: 7.8, thick: 5.4, amp: 1.9, seed: 5.5, top: "#72c283", bottom: "#59aa6c", rim: "#9ddba7" });
  for (const [gx, gw] of [
    [0.06, 0.08],
    [0.32, 0.07],
    [0.52, 0.09],
    [0.74, 0.07],
    [0.9, 0.06],
  ] as [number, number][]) {
    grove(W * gx, W * (gx + gw), nearCrest, [
      { dy: 2.6, thick: 4.6, amp: 1.5, seed: 8.1 },
      { dy: 6.6, thick: 5.6, amp: 1.8, seed: 9.3 },
    ]);
  }
  // pohon aksen di kaki bukit dekat (blob besar dengan batang, bukan manik)
  for (let i = 0; i < 9; i++) {
    const x = (i / 9) * W + R() * 260 * s;
    const r = 3.4 + R() * 2.6;
    const pal = R() < 0.18 ? pickPal(PINKS) : pickPal(GREENS);
    blob(x, nearCrest(x) + (13 + R() * 3.5) * pxPerUnit, r, pal, R() * 6, true);
  }

  /* --- sawah / ladang: pita warna dengan garis alur --- */
  const fieldTop = yUnits(-16.2);
  {
    let y = fieldTop;
    let i = 0;
    while (y < H) {
      const bandH = (8 + i * i * 1.3) * s;
      g.fillStyle = i % 2 ? "#87cc8d" : "#78c07f";
      g.beginPath();
      g.moveTo(0, y + bandH);
      for (let x = 0; x <= W; x += 8) g.lineTo(x, y + Math.sin((TAU * 23 * x) / W + i * 1.7) * 1.2 * s + Math.sin((TAU * 41 * x) / W + i) * 0.8 * s);
      g.lineTo(W, y + bandH);
      g.closePath();
      g.fill();
      g.strokeStyle = i % 2 ? "rgba(88,150,96,0.5)" : "rgba(70,132,80,0.5)";
      g.lineWidth = 1.4 * s;
      g.beginPath();
      for (let x = 0; x <= W; x += 8) {
        const yy = y + bandH * 0.55 + Math.sin((TAU * 31 * x) / W + i * 2.3) * 1.4 * s;
        (x === 0 ? g.moveTo : g.lineTo).call(g, x, yy);
      }
      g.stroke();
      y += bandH;
      i++;
    }
  }
  // pohon peneduh di pematang atas (jarang & kecil, jadi terbaca sebagai pohon, bukan titik)
  {
    let x = R() * 60 * s;
    while (x < W) {
      const rU = 1.2 + R() * 1.5;
      const pal = R() < 0.12 ? pickPal(PINKS) : pickPal(GREENS);
      blob(x, fieldTop + (2.6 + R() * 2.4) * pxPerUnit, rU, pal, R() * 6, true);
      x += rU * pxPerUnit * (2.2 + R() * 3.4);
    }
  }

  // kabut: hanya bagian paling bawah yang melebur ke warna haze dunia
  const m0 = yUnits(-25);
  const m1 = yUnits(-38);
  const mist = g.createLinearGradient(0, m0, 0, m1);
  mist.addColorStop(0, "rgba(219,238,255,0)");
  mist.addColorStop(1, "rgba(219,238,255,1)");
  g.fillStyle = mist;
  g.fillRect(0, m0, W, m1 - m0);
  g.fillStyle = MIST_HEX;
  g.fillRect(0, m1, W, H - m1);
  return c;
}

/* ------------------------------------------------------------------ */
/* Shibuya Night: 360° glittering neon city skyline panorama            */
/* ------------------------------------------------------------------ */

/** Distant-haze colour of the Shibuya night world (deep indigo with a violet cast). */
export const NIGHT_MIST_HEX = "#1b1838";

/**
 * Paints a wrap-safe 360° night-city skyline: three depth layers of tower silhouettes
 * packed with lit windows, rooftop beacons, glowing mega-screens and a Tokyo-Tower
 * style lattice mast. Sky above the roofline stays transparent (alpha cut-out) so the
 * purple night-sky dome shows through.
 */
export function paintCityNight(W = 4096, H = 512): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const R = rng(20261024);
  const pxPerUnit = H / (PANO.topY + PANO.botY);
  const yU = (u: number) => (PANO.topY - u) * pxPerUnit; // world height (units) -> canvas y
  const horizon = yU(0);

  const NEON = ["#ffd23f", "#ff4438", "#ffe93b", "#58c96b", "#ff8a3d", "#fff3c4"];
  const WIN = ["#ffd97a", "#ffe9a3", "#9be8ff", "#ffb3d1", "#fff3c4"];

  interface Layer {
    body: string;
    top: string;
    hMin: number; // tower heights in world units
    hMax: number;
    wMin: number; // tower widths in px (at 4096)
    wMax: number;
    winP: number; // probability a window cell is lit
    detail: boolean; // draw beacons/screens/signs
  }
  const s = W / 4096;
  const layers: Layer[] = [
    { body: "#12152b", top: "#181c36", hMin: 3.5, hMax: 8.5, wMin: 60, wMax: 130, winP: 0.1, detail: false },
    { body: "#181c36", top: "#20254a", hMin: 3, hMax: 11, wMin: 50, wMax: 110, winP: 0.2, detail: false },
    { body: "#20254a", top: "#2a3060", hMin: 2.5, hMax: 13, wMin: 44, wMax: 120, winP: 0.42, detail: true },
  ];

  for (let li = 0; li < layers.length; li++) {
    const L = layers[li];
    let x = (li * 137) % 80; // stagger layer start so seams never align
    let lastH = 0;
    while (x < W) {
      const bw = (L.wMin + R() * (L.wMax - L.wMin)) * s;
      let hU = L.hMin + R() * (L.hMax - L.hMin);
      if (Math.abs(hU - lastH) < 1) hU += 1.4; // force a jagged skyline
      lastH = hU;
      const topY = yU(hU);
      const bwClamped = Math.min(bw, W - x); // last tower ends exactly at the seam
      // body
      g.fillStyle = L.body;
      g.fillRect(x, topY, bwClamped, H - topY);
      // subtle lighter cap so rooflines read against the sky
      g.fillStyle = L.top;
      g.fillRect(x, topY, bwClamped, 3 * s);

      // windows: sparse grid of lit dots (far layers glow dimmer, so depth reads)
      const cw = 7 * s;
      const ch = 9 * s;
      const cols = Math.max(1, Math.floor((bwClamped - 8 * s) / cw));
      const rows = Math.max(1, Math.floor((H - topY - 10 * s) / ch));
      g.globalAlpha = li === 0 ? 0.4 : li === 1 ? 0.65 : 1;
      for (let r = 0; r < Math.min(rows, 46); r++) {
        for (let cc = 0; cc < cols; cc++) {
          if (R() < L.winP) {
            g.fillStyle = WIN[Math.floor(R() * WIN.length)];
            g.fillRect(x + 4 * s + cc * cw, topY + 6 * s + r * ch, 3.2 * s, 4.2 * s);
          }
        }
      }
      g.globalAlpha = 1;

      if (L.detail) {
        // red aircraft beacon on the tallest towers
        if (hU > 9 && R() < 0.75) {
          g.fillStyle = "#39404f";
          g.fillRect(x + bwClamped / 2 - 1.5 * s, topY - 14 * s, 3 * s, 14 * s);
          g.fillStyle = "#ff1f3d";
          g.fillRect(x + bwClamped / 2 - 3 * s, topY - 19 * s, 6 * s, 6 * s);
        }
        // glowing mega-screen on some facades
        if (bwClamped > 60 * s && R() < 0.45) {
          const neon = NEON[Math.floor(R() * NEON.length)];
          const sw = bwClamped * (0.4 + R() * 0.3);
          const sh = (12 + R() * 16) * s;
          const sx = x + (bwClamped - sw) / 2;
          const sy = topY + (10 + R() * 30) * s;
          g.fillStyle = neon;
          g.fillRect(sx, sy, sw, sh);
          g.fillStyle = "rgba(255,255,255,0.85)";
          g.fillRect(sx + sw * 0.12, sy + sh * 0.3, sw * 0.5, sh * 0.22);
        }
        // vertical neon sign strip
        if (R() < 0.5) {
          const neon = NEON[Math.floor(R() * NEON.length)];
          const sx = x + bwClamped - 9 * s;
          const sy = topY + 12 * s;
          const sl = Math.min(H - horizon, (40 + R() * 50) * s);
          g.fillStyle = "#0d1020";
          g.fillRect(sx - 1.5 * s, sy - 2 * s, 8 * s, sl + 4 * s);
          g.fillStyle = neon;
          for (let k = 0; k < sl / (9 * s); k++) g.fillRect(sx, sy + k * 9 * s, 5 * s, 5.5 * s);
        }
      }
      x += bwClamped;
    }
  }

  // one Tokyo-Tower style lattice mast glowing orange above the skyline
  {
    const tx = W * 0.62;
    const baseY = horizon;
    const topY = yU(13.5);
    const hPx = baseY - topY;
    g.fillStyle = "#ff6d2a";
    for (let i = 0; i < 14; i++) {
      const t = i / 14;
      const y = topY + t * hPx;
      const half = (2 + t * 16) * s;
      g.fillRect(tx - half, y, half * 2, hPx / 16);
    }
    g.fillStyle = "#ffd8b8";
    g.fillRect(tx - 10 * s, topY + hPx * 0.32, 20 * s, 5 * s); // observation deck
    g.fillStyle = "#ff1f3d";
    g.fillRect(tx - 2.5 * s, topY - 7 * s, 5 * s, 7 * s); // beacon
  }

  // street-glow: the bottom melts into the night haze colour
  const m0 = yU(-14);
  const m1 = yU(-30);
  const mist = g.createLinearGradient(0, m0, 0, m1);
  mist.addColorStop(0, "rgba(27,24,56,0)");
  mist.addColorStop(1, "rgba(27,24,56,1)");
  g.fillStyle = mist;
  g.fillRect(0, m0, W, m1 - m0);
  g.fillStyle = NIGHT_MIST_HEX;
  g.fillRect(0, m1, W, H - m1);
  return c;
}

/**
 * Panorama SIANG HARI (juga pagi & sore) TANPA tembok kota: pemandangan perbukitan berlapis —
 * ridge jauh berkabut, bukit hutan tiga lapis dengan kebun sakura & pagoda, lalu sabuk sawah
 * dan sungai berkelok di kaki. Gaya ilustratif datar, selaras art-style dengan Gunung Fuji
 * (billboard Fuji sendiri TIDAK diubah).
 */
export function paintScenicDay(W = 4096, H = 512, tod: "pagi" | "siang" | "sore" = "siang", mistHex = "#dbeeff"): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const R = rng(93170415);
  const TAU = Math.PI * 2;
  const pxPerUnit = H / (PANO.topY + PANO.botY);
  const yU = (u: number) => (PANO.topY - u) * pxPerUnit; // world height (units) -> canvas y
  const s = W / 4096;

  const harm = (x: number, terms: [number, number, number][]) => terms.reduce((acc, [k, a, p]) => acc + a * Math.sin((TAU * k * x) / W + p), 0);
  const wrap = (x: number, r: number, draw: (xx: number) => void) => {
    draw(x);
    if (x - r < 0) draw(x + W);
    if (x + r > W) draw(x - W);
  };
  /** Periode gelombang dalam piksel, tapi jumlah gelombangnya BULAT keliling tabung (anti-jahitan di seam). */
  const cyc = (pxAt4096: number) => W / Math.max(1, Math.round(4096 / pxAt4096));

  /** Isi satu lapisan bukit dengan gradasi lembut (atas lebih terang, bawah lebih dalam). */
  const fillLayer = (crest: (x: number) => number, top: string, bottom: string, rim?: string) => {
    g.beginPath();
    g.moveTo(0, H);
    for (let x = 0; x <= W; x += 4) g.lineTo(x, crest(x));
    g.lineTo(W, H);
    g.closePath();
    const grad = g.createLinearGradient(0, yU(2), 0, H);
    grad.addColorStop(0, top);
    grad.addColorStop(1, bottom);
    g.fillStyle = grad;
    g.fill();
    if (rim) {
      g.beginPath();
      for (let x = 0; x <= W; x += 4) (x === 0 ? g.moveTo : g.lineTo).call(g, x, crest(x) + 2.5 * s);
      g.lineWidth = 5 * s;
      g.strokeStyle = rim;
      g.stroke();
    }
  };

  const bumpyTop = (crest: (x: number) => number, x: number, dy: number, amp: number, seed: number) =>
    crest(x) +
    dy * pxPerUnit +
    Math.sin((TAU * x) / cyc(9.5) + seed) * amp * pxPerUnit * 0.5 +
    Math.sin((TAU * x) / cyc(4.3) + seed * 1.9) * amp * pxPerUnit * 0.3 +
    Math.sin((TAU * x) / cyc(1.7) + seed * 3.1) * amp * pxPerUnit * 0.15 +
    Math.sin((TAU * x) / cyc(0.86) + seed * 5.3) * amp * pxPerUnit * 0.1;

  const forestBand = (
    crest: (x: number) => number,
    o: { dy: number; thick: number; amp: number; seed: number; top: string; bottom: string; rim?: string; x0?: number; x1?: number },
  ) => {
    const x0 = o.x0 ?? 0;
    const x1 = o.x1 ?? W;
    const botAt = (x: number) => crest(x) + (o.dy + o.thick) * pxPerUnit + Math.sin((TAU * x) / cyc(15) + o.seed * 0.7) * o.amp * pxPerUnit * 0.45;
    g.beginPath();
    for (let x = x0; x <= x1; x += 4) {
      const y = bumpyTop(crest, x, o.dy, o.amp, o.seed);
      if (x === x0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    for (let x = x1; x >= x0; x -= 4) g.lineTo(x, botAt(x));
    g.closePath();
    const grad = g.createLinearGradient(0, bumpyTop(crest, (x0 + x1) / 2, o.dy, o.amp, o.seed) - o.amp * pxPerUnit, 0, botAt((x0 + x1) / 2) + o.thick * pxPerUnit);
    grad.addColorStop(0, o.top);
    grad.addColorStop(1, o.bottom);
    g.fillStyle = grad;
    g.fill();
    if (o.rim) {
      g.beginPath();
      for (let x = x0; x <= x1; x += 4) (x === 0 ? g.moveTo : g.lineTo).call(g, x, bumpyTop(crest, x, o.dy, o.amp, o.seed) + 1.1 * s);
      g.lineWidth = 2.6 * s;
      g.strokeStyle = o.rim;
      g.stroke();
    }
  };

  const blob = (x: number, y: number, rU: number, pal: Palette, seed: number, trunk = false) => {
    const r = rU * pxPerUnit;
    wrap(x, r * 1.8, (xx) => {
      if (trunk && rU > 1.2) {
        g.fillStyle = "#5c4127";
        g.fillRect(xx - r * 0.07, y + r * 0.5, r * 0.14, r * 0.6);
      }
      const n = 12;
      g.beginPath();
      for (let i = 0; i <= n; i++) {
        const a = (i / n) * TAU;
        const lump = 0.76 + 0.3 * (0.5 + 0.5 * Math.sin(a * 3 + seed)) + 0.1 * Math.sin(a * 5 - seed * 1.7);
        const rr = r * lump;
        const px = xx + Math.cos(a) * rr;
        const py = y + Math.sin(a) * rr * 0.8;
        if (i === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.closePath();
      g.fillStyle = pal.shade;
      g.fill();
      g.save();
      g.clip();
      g.fillStyle = pal.base;
      g.beginPath();
      g.arc(xx - r * 0.16, y - r * 0.2, r * 0.94, 0, TAU);
      g.fill();
      g.fillStyle = pal.mid;
      g.beginPath();
      g.arc(xx - r * 0.34, y - r * 0.42, r * 0.58, 0, TAU);
      g.fill();
      g.fillStyle = pal.hi;
      g.beginPath();
      g.arc(xx - r * 0.48, y - r * 0.58, r * 0.24, 0, TAU);
      g.fill();
      g.restore();
    });
  };

  const pickPal = (arr: Palette[]) => arr[Math.floor(R() * arr.length)];

  const grove = (
    x0: number,
    x1: number,
    crest: (x: number) => number,
    rows: { dy: number; thick: number; amp: number; seed: number }[],
  ) => {
    for (const row of rows) forestBand(crest, { ...row, top: PINKS[1].mid, bottom: PINKS[0].base, x0, x1 });
    const n = Math.max(3, Math.round((x1 - x0) / (9 * s)));
    for (let i = 0; i < n; i++) {
      const x = x0 + (i / Math.max(1, n - 1)) * (x1 - x0) + (R() - 0.5) * 8 * s;
      if (x < 4 || x > W - 4) continue;
      const last = rows[rows.length - 1];
      const r = 1.4 + R() * 1.6;
      const pal = R() < 0.88 ? pickPal(PINKS) : pickPal(GREENS);
      blob(x, bumpyTop(crest, x, last.dy, last.amp, last.seed) + (R() - 0.3) * 0.8 * pxPerUnit, r, pal, R() * 6);
    }
  };

  /* --- ridge jauh: biru pucat berkabut, gelombang landai (terbaca seperti deretan gunung halus) --- */
  const farCrest = (x: number) => yU(0.6) + harm(x, [[2, -26 * s, 0.2], [4, 16 * s, 1.1], [7, 9 * s, 2.4], [13, 5 * s, 0.4], [29, 2.2 * s, 3.2]]);
  fillLayer(farCrest, "#b3d3d9", "#c8e0e4", "#d5e9ec");
  g.fillStyle = "rgba(219,238,255,0.32)";
  g.fillRect(0, yU(0.6) - 40 * s, W, H);

  /* --- bukit tengah: hijau muda dengan tiga lapis rimba + kebun sakura + pagoda --- */
  const midCrest = (x: number) => yU(-3.0) + harm(x, [[3, -22 * s, 2], [5, 13 * s, 0.6], [9, 8 * s, 1.7], [17, 4 * s, 2.9], [33, 2.5 * s, 0.2]]);
  fillLayer(midCrest, "#a8dcb0", "#8fcb9c", "#c2e9c7");
  forestBand(midCrest, { dy: 0.4, thick: 3.2, amp: 1.1, seed: 1.3, top: "#528f65", bottom: "#3f7a51" });
  forestBand(midCrest, { dy: 3.0, thick: 3.6, amp: 1.3, seed: 2.7, top: "#5fae72", bottom: "#4a9660" });
  forestBand(midCrest, { dy: 6.4, thick: 4.4, amp: 1.6, seed: 4.1, top: "#74c485", bottom: "#5cae70", rim: "#a3dea9" });
  for (const [gx, gw] of [
    [0.04, 0.075],
    [0.27, 0.085],
    [0.47, 0.06],
    [0.63, 0.085],
    [0.83, 0.075],
  ] as [number, number][]) {
    grove(W * gx, W * (gx + gw), midCrest, [
      { dy: 1.8, thick: 3.4, amp: 1.1, seed: 6.2 },
      { dy: 5.0, thick: 4.2, amp: 1.4, seed: 7.4 },
    ]);
  }
  // pagoda + rimbun di kakinya (aksen pemandangan, sama gayanya dengan panorama non-shibuya)
  const pagoda = (x: number, baseY: number, k: number) => {
    wrap(x, 40 * k, (xx) => {
      const tiers = 5;
      let y = baseY;
      g.fillStyle = "#7d8792";
      g.fillRect(xx - 22 * k, y - 5 * k, 44 * k, 5 * k);
      for (let i = 0; i < tiers; i++) {
        const w = (26 - i * 3.6) * k;
        const bh = 7.5 * k;
        y -= bh;
        g.fillStyle = i % 2 ? "#efe6d0" : "#b3271b";
        g.fillRect(xx - w / 2, y, w, bh);
        const rw = w + 9 * k;
        g.fillStyle = "#44505c";
        g.beginPath();
        g.moveTo(xx - rw / 2 - 2 * k, y + 1 * k);
        g.lineTo(xx - rw / 2 + 3 * k, y - 4 * k);
        g.lineTo(xx + rw / 2 - 3 * k, y - 4 * k);
        g.lineTo(xx + rw / 2 + 2 * k, y + 1 * k);
        g.closePath();
        g.fill();
        y -= 4 * k;
      }
      g.fillStyle = "#44505c";
      g.fillRect(xx - 1 * k, y - 12 * k, 2 * k, 12 * k);
      g.fillStyle = "#ffd21f";
      g.fillRect(xx - 3 * k, y - 8 * k, 6 * k, 1.5 * k);
    });
  };
  {
    const px = W * 0.53;
    for (let i = 0; i < 18; i++) {
      const x = px - 190 * s + i * 22 * s + (R() - 0.5) * 12 * s;
      const r = 2.2 + R() * 2.2;
      blob(x, midCrest(x) + (4.4 + R() * 2.2) * pxPerUnit, r, i % 4 === 1 ? pickPal(PINKS) : pickPal(GREENS), R() * 6);
    }
    pagoda(px, midCrest(px) + 7.6 * pxPerUnit, 1.35 * s);
  }

  /* --- bukit dekat: rimba lebih besar & gelap di kaki --- */
  const nearCrest = (x: number) => yU(-10.0) + harm(x, [[4, -13 * s, 0.9], [7, 9 * s, 2.2], [12, 5 * s, 0.3], [23, 3 * s, 1.4]]);
  fillLayer(nearCrest, "#7cc387", "#6cb679", "#9ad9a2");
  forestBand(nearCrest, { dy: 0.6, thick: 4.0, amp: 1.3, seed: 2.1, top: "#4b8f5c", bottom: "#3d7b4d" });
  forestBand(nearCrest, { dy: 3.8, thick: 4.6, amp: 1.6, seed: 3.8, top: "#5dac6f", bottom: "#48945c" });
  forestBand(nearCrest, { dy: 7.8, thick: 5.4, amp: 1.9, seed: 5.5, top: "#72c283", bottom: "#59aa6c", rim: "#9ddba7" });
  for (const [gx, gw] of [
    [0.08, 0.08],
    [0.34, 0.07],
    [0.56, 0.09],
    [0.74, 0.07],
    [0.9, 0.06],
  ] as [number, number][]) {
    grove(W * gx, W * (gx + gw), nearCrest, [
      { dy: 2.6, thick: 4.6, amp: 1.5, seed: 8.1 },
      { dy: 6.6, thick: 5.6, amp: 1.8, seed: 9.3 },
    ]);
  }
  for (let i = 0; i < 9; i++) {
    const x = (i / 9) * W + R() * 260 * s;
    const r = 3.4 + R() * 2.6;
    const pal = R() < 0.18 ? pickPal(PINKS) : pickPal(GREENS);
    blob(x, nearCrest(x) + (13 + R() * 3.5) * pxPerUnit, r, pal, R() * 6, true);
  }

  /* --- sawah / ladang: pita warna bergradasi dengan garis alur + SUNGAI berkelok --- */
  const fieldTop = yU(-15.8);
  const riverX = (y: number) => W * 0.5 + Math.sin(((y - fieldTop) / (H - fieldTop)) * TAU * 1.5 + 0.8) * W * 0.13;
  {
    let y = fieldTop;
    let i = 0;
    while (y < H) {
      const bandH = (8 + i * i * 1.3) * s;
      g.fillStyle = i % 2 ? "#87cc8d" : "#78c07f";
      g.beginPath();
      g.moveTo(0, y + bandH);
      for (let x = 0; x <= W; x += 8) g.lineTo(x, y + Math.sin((TAU * 23 * x) / W + i * 1.7) * 1.2 * s + Math.sin((TAU * 41 * x) / W + i) * 0.8 * s);
      g.lineTo(W, y + bandH);
      g.closePath();
      g.fill();
      g.strokeStyle = i % 2 ? "rgba(88,150,96,0.5)" : "rgba(70,132,80,0.5)";
      g.lineWidth = 1.4 * s;
      g.beginPath();
      for (let x = 0; x <= W; x += 8) {
        const yy = y + bandH * 0.55 + Math.sin((TAU * 31 * x) / W + i * 2.3) * 1.4 * s;
        (x === 0 ? g.moveTo : g.lineTo).call(g, x, yy);
      }
      g.stroke();
      y += bandH;
      i++;
    }
  }
  // sungai kebiruan memotong ladang (makin lebar ke bawah/dekat), di atasnya beberapa pohon peneduh
  {
    g.beginPath();
    for (let y = fieldTop; y <= H; y += 6) {
      const rx = riverX(y);
      if (y === fieldTop) g.moveTo(rx, y);
      else g.lineTo(rx, y);
    }
    for (let y = H; y >= fieldTop; y -= 6) {
      const wdt = ((y - fieldTop) / (H - fieldTop)) * 26 * s + 4 * s;
      g.lineTo(riverX(y) + wdt, y);
    }
    g.closePath();
    const rg = g.createLinearGradient(0, fieldTop, 0, H);
    rg.addColorStop(0, "#9fd4e4");
    rg.addColorStop(1, "#bfe4f2");
    g.fillStyle = rg;
    g.fill();
    g.strokeStyle = "rgba(70,132,120,0.45)";
    g.lineWidth = 1.6 * s;
    g.stroke();
    let x = R() * 60 * s;
    while (x < W) {
      const rU = 1.2 + R() * 1.5;
      const pal = R() < 0.12 ? pickPal(PINKS) : pickPal(GREENS);
      blob(x, fieldTop + (2.6 + R() * 2.4) * pxPerUnit, rU, pal, R() * 6, true);
      x += rU * pxPerUnit * (2.2 + R() * 3.4);
    }
  }

  /* --- grading waktu: pagi emas lembut / sore jingga senja --- */
  if (tod !== "siang") {
    g.globalCompositeOperation = "source-atop";
    const grad = g.createLinearGradient(0, H, 0, 0);
    if (tod === "pagi") {
      grad.addColorStop(0, "rgba(255,215,160,0.30)");
      grad.addColorStop(1, "rgba(255,240,215,0.08)");
    } else {
      grad.addColorStop(0, "rgba(255,145,85,0.38)");
      grad.addColorStop(0.6, "rgba(255,175,115,0.18)");
      grad.addColorStop(1, "rgba(115,110,155,0.16)");
    }
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = "source-over";
  }

  /* --- kabut: kaki panorama melebur mulus ke warna haze dunia --- */
  const m0 = yU(-2);
  const m1 = yU(-24);
  const mist = g.createLinearGradient(0, m0, 0, m1);
  mist.addColorStop(0, mistHex + "00");
  mist.addColorStop(0.45, mistHex + "dd");
  mist.addColorStop(1, mistHex);
  g.fillStyle = mist;
  g.fillRect(0, m0, W, m1 - m0);
  g.fillStyle = mistHex;
  g.fillRect(0, m1, W, H - m1);

  return c;
}
