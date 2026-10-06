/* Dump decor + buildings + tunnels for the first 400m of a Shibuya run. */
import { engine, track, START_S } from "../src/game/engine";
import { useUI } from "../src/game/store";

useUI.getState().setTrackMode("shibuya");
engine.setTrackMode("shibuya");
engine.startRun();
(engine as any).crash = () => {};

const e = engine as any;
const seenChunk = new Set<number>();
const rows: string[] = [];
const seenDecor = new Set<string>();
for (let i = 0; i < 60 * 90; i++) {
  engine.update(1 / 60);
  if (engine.distance > 430) break;
  for (const ch of e.chunks as Array<any>) {
    if (seenChunk.has(ch.id)) continue;
    seenChunk.add(ch.id);
    for (const d of ch.decor as Array<any>) {
      let bestS = ch.s0, bestD = 1e9;
      for (let s = ch.s0 - 2; s <= ch.s0 + 20; s += 0.25) {
        const c = track.sample(s);
        const dd = Math.hypot(d.pos[0] - c.x, d.pos[2] - c.z);
        if (dd < bestD) { bestD = dd; bestS = s; }
      }
      const c = track.sample(bestS);
      const lat = (d.pos[0] - c.x) * -Math.sin(c.th) + (d.pos[2] - c.z) * Math.cos(c.th);
      const dy = d.pos[1] - c.y;
      const key = `${d.kind}@${bestS.toFixed(0)}@${lat.toFixed(1)}`;
      if (seenDecor.has(key)) continue;
      seenDecor.add(key);
      rows.push(`  s=${bestS.toFixed(1).padStart(6)} lat=${lat.toFixed(2).padStart(6)} dy=${dy.toFixed(2).padStart(6)} ${d.kind}${d.spec?.shibuyaAssetId ? ` [${d.spec.shibuyaAssetId}]` : ""}${bestD > 1.5 ? "  (tebakan s buruk)" : ""}`);
    }
  }
}
console.log(`START_S=${START_S} dist=${engine.distance.toFixed(0)}`);
console.log("tunnels:", JSON.stringify((e.subwayTunnels as Array<any>).map((t) => [t.startS.toFixed(0), t.endS.toFixed(0)])));
console.log("=== DEKOR 0..430m (urut s) ===");
console.log(rows.sort().join("\n"));
