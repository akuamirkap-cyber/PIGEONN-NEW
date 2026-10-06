/* Verifikasi: where do pedestrians WAIT in shibuya & their heights during a crossing. */
import { engine } from "../src/game/engine";
import { useUI } from "../src/game/store";

useUI.getState().setTrackMode("shibuya");
engine.setTrackMode("shibuya");
engine.startRun();
(engine as any).crash = () => {};

const e = engine as any;
const waits = new Map<number, { lat0: number; logged: boolean }>();
const crossings: string[] = [];
let frames = 0;
while (frames < 60 * 400 && crossings.length < 6) {
  engine.update(1 / 60);
  frames++;
  for (const m of e.movers as Array<any>) {
    if (m.kind !== "pedestrian") continue;
    if (!waits.has(m.id)) waits.set(m.id, { lat0: m.lat, logged: false });
    const w = waits.get(m.id)!;
    if (m.phase === "wait" && !w.logged && m.delay > 0.05) {
      w.logged = true;
      console.log(`WAIT ped#${m.id} lat=${m.lat.toFixed(2)} h=${m.h.toFixed(3)} ${m.lat > 5.0 && m.lat < 12.3 ? "❌ DI JALUR MOBIL!" : "✓"}`);
    }
    if (m.phase === "hop") {
      const key = `${m.id}|${m.lat.toFixed(1)}`;
      if (Math.abs(m.lat - Math.round(m.lat)) < 0.04 && !crossings.includes(key)) {
        crossings.push(key);
        console.log(`CROSS ped#${m.id} lat=${m.lat.toFixed(2)} h=${m.h.toFixed(3)} ${m.lat > 5.15 && m.lat < 12.3 ? "❌ MENYEBERANG KE JALUR SEBERANG" : ""}`);
      }
    }
  }
}
