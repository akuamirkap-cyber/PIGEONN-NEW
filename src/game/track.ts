import * as THREE from "three";
import { rand } from "./voxel";

/** Sample of the road centerline at arc length s. th = heading (rad, from +x toward +z), g = grade (dy/ds). */
export interface TrackSample {
  x: number;
  y: number;
  z: number;
  th: number;
  g: number;
  kappa: number;
}

const DS = 0.5; // integration step (world units)
const DEG = Math.PI / 180;

interface Turn {
  s0: number;
  s1: number;
  dth: number;
}
interface Ramp {
  s0: number;
  s1: number;
  g0: number;
  g1: number;
}

/** Raised-cosine bump, integral over [0,1] equals 1 -> curvature eases in and out (no jerks). */
function bump(u: number) {
  return 1 - Math.cos(2 * Math.PI * u);
}
function smooth(u: number) {
  return u * u * (3 - 2 * u);
}

const _T = new THREE.Vector3();
const _N = new THREE.Vector3();
const _U = new THREE.Vector3();
const _M = new THREE.Matrix4();
const _s: TrackSample = { x: 0, y: 0, z: 0, th: 0, g: 0, kappa: 0 };

/**
 * Procedural road built by numerically integrating a smooth curvature profile (sum of raised-cosine
 * bumps) and a smooth grade profile (smoothstep ramps). Every feature returns the heading to 0 and the
 * grade to 0, so the road keeps flowing along +x with gentle, wide S-curves and soft descents.
 */
export class Track {
  end = 0;
  mode: "tokyo" | "haruna" | "shibuya" = "haruna";
  private turns: Turn[] = [];
  private ramps: Ramp[] = [];
  private planEnd = 0;
  private xs: number[] = [];
  private ys: number[] = [];
  private zs: number[] = [];
  private ths: number[] = [];
  private gs: number[] = [];
  private ks: number[] = [];
  private n = 0;
  private ix = 0;
  private iy = 0;
  private iz = 0;
  private ith = 0;

  constructor(mode: "tokyo" | "haruna" | "shibuya" = "haruna") {
    this.mode = mode;
    this.reset(mode);
  }

  reset(mode?: "tokyo" | "haruna" | "shibuya") {
    if (mode) this.mode = mode;
    this.featureCount = 0;
    this.turns = [];
    this.ramps = [];
    this.xs = [0];
    this.ys = [0];
    this.zs = [0];
    this.ths = [0];
    this.gs = [0];
    this.ks = [0];
    this.n = 1;
    this.ix = this.iy = this.iz = this.ith = 0;
    this.end = 0;
    this.planEnd = 120; // opening straight (menu + run start)
    this.ensure(300);
  }

  private kappaAt(s: number) {
    let k = 0;
    for (const t of this.turns) {
      if (s >= t.s0 && s < t.s1) {
        const L = t.s1 - t.s0;
        k += (t.dth / L) * bump((s - t.s0) / L);
      }
    }
    return k;
  }

  private gradeAt(s: number) {
    let g = 0;
    for (const r of this.ramps) {
      if (s >= r.s1) g = r.g1;
      else if (s >= r.s0) {
        g = r.g0 + (r.g1 - r.g0) * smooth((s - r.s0) / (r.s1 - r.s0));
        break;
      } else break;
    }
    return g;
  }

  private featureCount = 0;

  /** Add a downhill: grade ramps in, holds, ramps out. Returns the total length. */
  private addDescent(s: number, G: number, hold: number, rampL: number) {
    this.ramps.push({ s0: s, s1: s + rampL, g0: 0, g1: -G }, { s0: s + rampL + hold, s1: s + 2 * rampL + hold, g0: -G, g1: 0 });
    return 2 * rampL + hold;
  }

  private addFeature() {
    const isHaruna = this.mode === "haruna";
    const s = this.planEnd + (isHaruna ? rand(4, 10) : rand(8, 18));
    const dir = Math.random() < 0.5 ? 1 : -1;
    const idx = this.featureCount++;

    if (isHaruna) {
      // Mount Haruna (Gunma Touge Downhill Pass / Initial D Akina)
      const r = Math.random();
      if (idx === 0) {
        // Immediate start of the Haruna mountain downhill touge right after starting line
        const total = this.addDescent(s, 0.24, 75, 12);
        this.turns.push(
          { s0: s + 10, s1: s + 38, dth: dir * 24 * DEG },
          { s0: s + 38, s1: s + 66, dth: -dir * 24 * DEG }
        );
        this.planEnd = s + total + 6;
        return;
      }
      if (r < 0.35) {
        // The legendary 5 consecutive hairpins of Mount Haruna (5-ren hairpin)!
        const hpL = rand(24, 30);
        const hpDth = dir * rand(26, 36) * DEG;
        let curS = s;
        // Continuous downhill descent during the hairpins
        const totalDesc = this.addDescent(s, rand(0.20, 0.30), hpL * 5 + 16, 10);
        let curDir = 1;
        for (let k = 0; k < 5; k++) {
          this.turns.push({ s0: curS, s1: curS + hpL, dth: curDir * hpDth });
          curS += hpL + rand(4, 8); // brief straight between hairpins
          curDir = -curDir;
        }
        this.planEnd = Math.max(curS, s + totalDesc);
      } else if (r < 0.65) {
        // Double hairpin S-chicane downhill
        const L = rand(26, 36);
        const dth = dir * rand(24, 34) * DEG;
        const G = rand(0.22, 0.32);
        const total = this.addDescent(s, G, L * 2 + 12, 10);
        this.turns.push({ s0: s, s1: s + L, dth }, { s0: s + L, s1: s + 2 * L, dth: -dth });
        this.planEnd = s + Math.max(total, 2 * L);
      } else if (r < 0.85) {
        // Steep mountain plunge ("Akina Gutter Drop") with high-speed sweeping turn
        const L = rand(32, 44);
        const dth = dir * rand(18, 26) * DEG;
        const G = rand(0.28, 0.36);
        const total = this.addDescent(s, G, L + 20, 10);
        this.turns.push({ s0: s + 4, s1: s + 4 + L, dth });
        this.planEnd = s + Math.max(total, L + 16);
      } else {
        // Mountain high-speed straight with rolling downhill descent
        const total = this.addDescent(s, rand(0.18, 0.28), rand(35, 60), 10);
        this.planEnd = s + total;
      }
      return;
    }

    // Tokyo City mode — Shibuya Night shares the city plan but stays flatter with long neon
    // boulevards and gentle sweepers so the glowing building canyon reads well at speed.
    if (this.mode === "shibuya") {
      const dthS = dir * rand(7, 13) * DEG;
      const LS = rand(34, 48);
      const rS = Math.random();
      if (rS < 0.3) {
        this.planEnd = s + rand(16, 30); // long straight under the billboards
      } else if (rS < 0.66) {
        this.turns.push({ s0: s, s1: s + LS, dth: dthS }, { s0: s + LS, s1: s + 2 * LS, dth: -dthS });
        this.planEnd = s + 2 * LS;
      } else if (rS < 0.82) {
        this.turns.push({ s0: s, s1: s + LS, dth: dthS }, { s0: s + LS, s1: s + 3 * LS, dth: -2 * dthS }, { s0: s + 3 * LS, s1: s + 4 * LS, dth: dthS });
        this.planEnd = s + 4 * LS;
      } else {
        // gentle downhill boulevard (Dogenzaka slope vibes)
        this.planEnd = s + this.addDescent(s, rand(0.1, 0.18), rand(35, 55), 14);
      }
      return;
    }
    const dth = dir * rand(9, 16) * DEG;
    const L = rand(30, 42);
    const r = Math.random();
    if (idx === 1) {
      // guaranteed early downhill so every run gets a proper descent (starts ~200 m in)
      this.planEnd = s + this.addDescent(s, 0.26, 55, 14);
      return;
    }
    if (r < 0.22) {
      // plain straight
      this.planEnd = s + rand(10, 24);
    } else if (r < 0.45) {
      // wide S-curve
      this.turns.push({ s0: s, s1: s + L, dth }, { s0: s + L, s1: s + 2 * L, dth: -dth });
      this.planEnd = s + 2 * L;
    } else if (r < 0.58) {
      // triple S (out - back through - return)
      this.turns.push({ s0: s, s1: s + L, dth }, { s0: s + L, s1: s + 3 * L, dth: -2 * dth }, { s0: s + 3 * L, s1: s + 4 * L, dth });
      this.planEnd = s + 4 * L;
    } else if (r < 0.8) {
      // real downhill: 18–30% grade held for a good while, sometimes winding
      const G = rand(0.18, 0.3);
      const total = this.addDescent(s, G, rand(40, 70), 14);
      if (Math.random() < 0.5) {
        const half = total / 2;
        this.turns.push({ s0: s, s1: s + half, dth: dth * 0.7 }, { s0: s + half, s1: s + total, dth: -dth * 0.7 });
      }
      this.planEnd = s + total;
    } else {
      // "the drop": short, steep plunge (35–42%) with a gentle run-out
      const G = rand(0.35, 0.42);
      const total = this.addDescent(s, G, rand(22, 34), 10);
      this.planEnd = s + total + 12;
    }
  }

  ensure(sMax: number) {
    while (this.end < sMax) {
      while (this.planEnd < this.end + 200) this.addFeature();
      const sm = this.end + DS / 2;
      const k = this.kappaAt(sm);
      const thMid = this.ith + (k * DS) / 2;
      this.ix += Math.cos(thMid) * DS;
      this.iz += Math.sin(thMid) * DS;
      this.ith += k * DS;
      this.iy += this.gradeAt(sm) * DS;
      this.end += DS;
      this.xs.push(this.ix);
      this.ys.push(this.iy);
      this.zs.push(this.iz);
      this.ths.push(this.ith);
      this.gs.push(this.gradeAt(this.end));
      this.ks.push(this.kappaAt(this.end));
      this.n++;
      // prune features that can no longer influence the integration
      if (this.turns.length && this.turns[0].s1 < this.end - 1) this.turns.shift();
      if (this.ramps.length > 2 && this.ramps[1].s1 < this.end - 1) this.ramps.shift();
    }
  }

  sample(s: number, out: TrackSample = _s): TrackSample {
    if (s < 0) s = 0;
    if (s >= this.end - DS) this.ensure(s + 80);
    const f = s / DS;
    const i = Math.min(Math.floor(f), this.n - 1);
    const j = Math.min(i + 1, this.n - 1);
    const t = f - i;
    out.x = this.xs[i] + (this.xs[j] - this.xs[i]) * t;
    out.y = this.ys[i] + (this.ys[j] - this.ys[i]) * t;
    out.z = this.zs[i] + (this.zs[j] - this.zs[i]) * t;
    out.th = this.ths[i] + (this.ths[j] - this.ths[i]) * t;
    out.g = this.gs[i] + (this.gs[j] - this.gs[i]) * t;
    out.kappa = this.ks[i] + (this.ks[j] - this.ks[i]) * t;
    return out;
  }

  /** World position at arc length s, lateral offset lat (+ = toward camera) and height h above the road. */
  frame(s: number, lat: number, h: number, out: THREE.Vector3 = new THREE.Vector3()): THREE.Vector3 {
    const c = this.sample(s, _s);
    return out.set(c.x - Math.sin(c.th) * lat, c.y + h, c.z + Math.cos(c.th) * lat);
  }

  /** Orientation following heading and slope (local +x = forward, +y = up, +z = toward camera). */
  quat(s: number, out: THREE.Quaternion = new THREE.Quaternion()): THREE.Quaternion {
    const c = this.sample(s, _s);
    _T.set(Math.cos(c.th), c.g, Math.sin(c.th)).normalize();
    _N.set(-Math.sin(c.th), 0, Math.cos(c.th));
    _U.crossVectors(_N, _T).normalize();
    _M.makeBasis(_T, _U, _N);
    return out.setFromRotationMatrix(_M);
  }

  yaw(s: number) {
    return -this.sample(s, _s).th;
  }
}
