/* Diagnostic harness (accumulative): find ramp/rail proximity, decor poles in roads.
 * Run: npx esbuild test/diagIssues.ts --bundle --platform=node --outfile=/tmp/diag.cjs && node /tmp/diag.cjs
 */
import { engine, OBSTACLE_DEFS, track } from "../src/game/engine";
import { useUI } from "../src/game/store";

useUI.getState().setTrackMode("shibuya");
engine.setTrackMode("shibuya");
engine.startRun();
(engine as any).crash = () => {}; // god mode: jangan pernah mati

const e = engine as any;

interface DecorRec { kind: string; s: number; lat: number; dy: number }
interface InterRec { s: number; scramble: boolean; wide: boolean }
const decorAll: (DecorRec & { bestD: number })[] = [];
const interAll: InterRec[] = [];
const obstMap = new Map<number, { kind: string; s: number; lane: number; half: number; variant?: number }>();
const removedObst = new Set<number>();
const seenInter = new Set<number>();
const seenChunk = new Set<number>();

function sampleAll() {
  for (const it of e.intersections as Array<any>) {
    if (!seenInter.has(it.id)) {
      seenInter.add(it.id);
      interAll.push({ s: it.s, scramble: !!it.scramble, wide: !!it.wide });
    }
  }
  const liveIds = new Set<number>();
  for (const o of e.obstacles as Array<any>) {
    liveIds.add(o.id);
    removedObst.delete(o.id);
    obstMap.set(o.id, { kind: o.kind, s: o.s, lane: o.lane, half: o.half ?? OBSTACLE_DEFS[o.kind as keyof typeof OBSTACLE_DEFS].halfLen, variant: o.variant });
  }
  for (const id of obstMap.keys()) if (!liveIds.has(id) && !removedObst.has(id)) removedObst.add(id);

  for (const ch of e.chunks as Array<any>) {
    if (seenChunk.has(ch.id)) continue;
    seenChunk.add(ch.id);
    for (const d of ch.decor as Array<any>) {
      // invert track.frame: find s by scanning chunk range
      let bestS = ch.s0, bestD = 1e9;
      for (let s = ch.s0 - 24; s <= ch.s0 + 36; s += 0.5) {
        const c = track.sample(s);
        const dd = Math.hypot(d.pos[0] - c.x, d.pos[2] - c.z);
        if (dd < bestD) { bestD = dd; bestS = s; }
      }
      const c = track.sample(bestS);
      const lat = (d.pos[0] - c.x) * -Math.sin(c.th) + (d.pos[2] - c.z) * Math.cos(c.th);
      const dy = d.pos[1] - c.y;
      decorAll.push({ kind: d.kind, s: bestS, lat, dy, bestD });
    }
  }
}

const DT = 1 / 60;
for (let i = 0; i < 60 * 600; i++) {
  engine.update(DT);
  if (i % 30 === 0) sampleAll();
}
sampleAll();

const obstAll = [...obstMap.values()];
console.log(`distance=${engine.distance.toFixed(0)} decor=${decorAll.length} intersections=${interAll.length} obstacles=${obstAll.length}`);

// 1. Ramp <-> rail proximity
console.log("\n=== RAMP vs RAIL berdekatan/tumpang-tindih (lane sama, jarak antar tepi < 2.5m) ===");
let rampRail = 0;
for (const a of obstAll) {
  if (a.kind !== "ramp") continue;
  for (const b of obstAll) {
    if (b.kind !== "rail" || a.lane !== b.lane) continue;
    const gap = Math.abs(a.s - b.s) - a.half - b.half;
    if (gap < 2.5) {
      rampRail++;
      if (rampRail <= 20) console.log(`  ramp@s=${a.s.toFixed(1)} L${a.lane} <-> rail@cx=${b.s.toFixed(1)} L${(b.half * 2).toFixed(0)} v${b.variant} gap=${gap.toFixed(2)} ${gap < 0 ? "KETEMBUS!!" : ""}`);
    }
  }
}
console.log(`total: ${rampRail}`);
// also any two obstacles of any kind in same lane physically overlapping
let sameOverlap = 0;
for (let i = 0; i < obstAll.length; i++) for (let j = i + 1; j < obstAll.length; j++) {
  const a = obstAll[i], b = obstAll[j];
  if (a.lane !== b.lane) continue;
  const gap = Math.abs(a.s - b.s) - a.half - b.half;
  if (gap < -0.05) {
    sameOverlap++;
    if (sameOverlap <= 20) console.log(`  OVERLAP ${a.kind}@s=${a.s.toFixed(1)} vs ${b.kind}@s=${b.s.toFixed(1)} lane=${a.lane} gap=${gap.toFixed(2)}`);
  }
}
console.log(`overlap antar obstacle apapun: ${sameOverlap}`);

// 2. Decor poles inside intersection zones (cross car lanes)
console.log("\n=== DEKOR DI ZONA PEREMPATAN ===");
const POLEY = new Set(["lamp", "avenue_lamp", "tree", "lantern", "touge_lamp", "sakura", "neon_sign", "vending", "mamachari", "sidewalk_planter", "autumn_tree", "bush", "hydrant", "rock"]);
let inInter = 0;
for (const d of decorAll) {
  if (!POLEY.has(d.kind)) continue;
  for (const it of interAll) {
    // cross-street half width: scramble spans full avenue; wide/normal spans INTERSECTION_W/2 roughly
    const hw = it.scramble ? 11.5 : it.wide ? 6.3 : 4.2;
    if (Math.abs(d.s - it.s) < hw) {
      // di zona jalan lintas, jika lat-nya di luar main carriageway (|lat| > 3.75) berarti menancap di jalan lintas
      if (d.bestD <= 0.8 && Math.abs(d.lat) > 3.75 && Math.abs(d.lat) < 17) {
        inInter++;
        if (inInter <= 30) console.log(`  ${d.kind}@s=${d.s.toFixed(1)} lat=${d.lat.toFixed(1)} dy=${d.dy.toFixed(2)} dlm ${it.scramble ? "SCRAMBLE" : it.wide ? "WIDE" : "normal"}@${it.s.toFixed(1)}`);
      }
    }
  }
}
console.log(`total: ${inInter}`);

// 3. Decor poles ON player roadway far from intersections
console.log("\n=== DEKOR DI ASPAL JALUR PEMAIN (|lat| <= 3.75, di luar perempatan) ===");
let roadPole = 0;
for (const d of decorAll) {
  if (!POLEY.has(d.kind)) continue;
  if (d.bestD > 0.8) continue;
  if (Math.abs(d.lat) > 3.75) continue;
  const nearInter = interAll.some((it) => Math.abs(d.s - it.s) < 12);
  if (nearInter) continue;
  roadPole++;
  if (roadPole <= 30) console.log(`  ${d.kind}@s=${d.s.toFixed(1)} lat=${d.lat.toFixed(2)} dy=${d.dy.toFixed(2)}`);
}
console.log(`total: ${roadPole}`);

// 4. Decor on the far carriageway (shibuya, lat 5.0..12.3 = jalan mobil seberang)
console.log("\n=== DEKOR DI ASPAL JALUR SEBERANG (lat 5.0..12.3, di luar perempatan) ===");
let farPole = 0;
for (const d of decorAll) {
  if (!POLEY.has(d.kind)) continue;
  if (d.bestD > 0.8) continue;
  if (d.lat < 5.0 || d.lat > 12.3) continue;
  const nearInter = interAll.some((it) => Math.abs(d.s - it.s) < 12);
  if (nearInter) continue;
  farPole++;
  if (farPole <= 30) console.log(`  ${d.kind}@s=${d.s.toFixed(1)} lat=${d.lat.toFixed(2)} dy=${d.dy.toFixed(2)}`);
}
console.log(`total: ${farPole}`);

// 5. ringkasan decor lat histogram untuk pole types di shibuya
console.log("\n=== HISTOGRAM LAT dekor tiang-ish ===");
const hist: Record<string, Record<string, number>> = {};
for (const d of decorAll) {
  if (!POLEY.has(d.kind)) continue;
  const band = d.lat.toFixed(1);
  (hist[d.kind] ??= {})[band] = ((hist[d.kind] ??= {})[band] ?? 0) + 1;
}
for (const k of Object.keys(hist)) console.log(` ${k}: ${JSON.stringify(hist[k])}`);
