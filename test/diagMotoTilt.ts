/* Ukur roll/pitch sebenarnya dari SETIAP motor selama run mode pigeon (street+park+haruna):
   - rollMustahil: sudut sumbu-up motor vs up dunia setelah heading & slope dikeluarkan.
   - pitchSlope: pitch mengikuti grade jalan (normal fisik).
   Laporkan maksimum & konteksnya. */
import * as THREE from "three";
import { engine, track } from "../src/game/engine";
import { useUI } from "../src/game/store";

const report = { rollMax: 0, rollAt: "", pitchAbs: 0 };

function scan(mode: "street" | "park" | "haruna") {
  useUI.getState().setTrackMode(mode);
  engine.setTrackMode(mode);
  engine.startRun();
  (engine as any).crash = () => {};
  const e = engine as any;
  for (let i = 0; i < 60 * 240; i++) {
    engine.update(1 / 60);
    for (const m of e.movers) {
      if (m.kind !== "motorcycle") continue;
      const rel = m.s - engine.distance;
      if (rel < 0 || rel > 60) continue;
      const q = new THREE.Quaternion();
      track.quat(m.s, q);
      // up motor (sumbu y lokal) di dunia
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
      // up dunia yang "diharapkan" mengikuti slope: track.quat memang dipakai semua kendaraan.
      // roll murni = komponen deviasi up terhadap bidang (heading): ambil basis normal jalan:
      const c = track.sample(m.s, new (Object.getPrototypeOf(track).constructor as any)());
      void c;
      // roll & pitch via euler setelah yaw dihilangkan:
      const e2 = new THREE.Euler().setFromQuaternion(q, "YXZ"); // yaw utama di y
      const roll = Math.abs(e2.z) * 57.3;
      const pitch = Math.abs(e2.x) * 57.3;
      if (roll > report.rollMax) {
        report.rollMax = roll;
        report.rollAt = `${mode} s=${m.s.toFixed(0)} rel=${rel.toFixed(1)} lat=${m.lat.toFixed(1)}`;
      }
      report.pitchAbs = Math.max(report.pitchAbs, pitch);
    }
  }
  console.log(`${mode}: rollMax so far=${report.rollMax.toFixed(2)}°, pitchMax=${report.pitchAbs.toFixed(2)}°  @ ${report.rollAt}`);
}
scan("street");
scan("park");
scan("haruna");
console.log(`HASIL: rollMax=${report.rollMax.toFixed(2)}° pitchAbs=${report.pitchAbs.toFixed(1)}°`);
