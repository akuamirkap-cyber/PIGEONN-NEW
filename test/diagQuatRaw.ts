import * as THREE from "three";
import { engine, track } from "../src/game/engine";
import { useUI } from "../src/game/store";

useUI.getState().setTrackMode("street");
engine.setTrackMode("street");
engine.startRun();
for (let i = 0; i < 60 * 10; i++) engine.update(1 / 60);
// paksa track generate sampai jauh
const c = track.sample(1455, new (THREE as any).Object3D ? undefined : undefined);
console.log("sample ok?", c);
const samp = (s: number) => {
  const t = track.sample(s);
  // bangun basis T,N,U persis seperti track.quat
  const T = new THREE.Vector3(Math.cos(t.th), t.g, Math.sin(t.th)).normalize();
  const N = new THREE.Vector3(-Math.sin(t.th), 0, Math.cos(t.th));
  const U = new THREE.Vector3().crossVectors(N, T).normalize();
  const q = new THREE.Quaternion();
  track.quat(s, q);
  const e = new THREE.Euler().setFromQuaternion(q, "YXZ");
  // deviasi U dari bidang vertikal terhadap heading: roll = asin(U · N)?  (0 jika N horizontal)
  // sudut U vs up dunia setelah pitch dihilangkan = atan2(|U×up| komponen lateral)
  const up = new THREE.Vector3(0, 1, 0);
  const dotUN = U.dot(N); // harus ~0
  console.log(`s=${s} th=${(t.th % 6.283).toFixed(2)} g=${t.g.toFixed(3)} kappa=${t.kappa?.toFixed(3)} | eulerYXZ x=${(e.x * 57.3).toFixed(1)} y=${(e.y * 57.3).toFixed(1)} z=${(e.z * 57.3).toFixed(1)} | U=(${U.x.toFixed(2)},${U.y.toFixed(2)},${U.z.toFixed(2)}) upAng=${(Math.acos(Math.max(-1, Math.min(1, U.dot(up)))) * 57.3).toFixed(1)}°`);
};
for (const s of [1440, 1455, 1460, 1500, 1600, 2000, 3000]) samp(s);
