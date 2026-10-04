/* Verifikasi rig Friend playable: tidak ada track lambai tangan, pivot bahu bekerja. */
import * as THREE from "three";
import { buildShibuyaAnimalRig } from "../src/game/shibuyaPacks";

for (const id of ["tanuki", "monkey", "neko", "crane"] as const) {
  const rig = buildShibuyaAnimalRig(id);
  // 1. Clip yang dimainkan TIDAK boleh punya track untuk node lengan/sayap
  const clip = new THREE.AnimationClip("x", 1, []);
  void clip;
  const played = rig.mixer.clipAction((rig as any).clipsStillRemoving ?? rig.clips.find(c => c.name === (rig.activeClip ?? "")) ?? rig.clips[0]);
  void played;
  const armNode = (s: string) => `animal_${id}_${s}`;
  const names = id === "crane" ? [armNode("wingL"), armNode("wingR")] : [armNode("armL"), armNode("armR")];

  const baseClip = rig.clips.find(c => c.name === (rig.activeClip?.replace(/_noWave$/, "") ?? ""))!;
  const baseHasArmTracks = baseClip.tracks.some(tr => names.includes(tr.name.slice(0, tr.name.lastIndexOf("."))));
  // played clip content: grep mixer actions

  // 2. Sample rotasi node lengan sumber selama beberapa detik -> harus TETAP (no wave)
  const node = rig.group.getObjectByName(names[1])!;
  const rots = new Set<number>();
  for (let i = 0; i < 60; i++) { rig.mixer.update(0.05); node.updateWorldMatrix(true, false); rots.add(Number(node.rotation.z.toFixed(3))); }
  const waveGone = rots.size === 1;

  // 3. Pivot bahu berada di sendi bahu sumber & setArmPose memutarnya
  const pivot = rig.group.getObjectByName(`${names[1]}_posePivot`)!;
  const shoulderPos = pivot ? pivot.position.toArray().map(v => Number(v.toFixed(2))) : null;
  const mesh = node.children.find(c => (c as THREE.Mesh).isMesh) as THREE.Mesh;
  const sampleVertex = () => {
    const attr = mesh.geometry.getAttribute("position");
    const v = new THREE.Vector3(attr.getX(0), attr.getY(0), attr.getZ(0)); // corner voxel lengan
    return v.applyMatrix4(mesh.matrixWorld);
  };
  rig.group.updateMatrixWorld(true);
  const wBefore = sampleVertex();
  for (let i = 0; i < 40; i++) rig.setArmPose(null, { rx: 0, ry: 0, rz: 1.2 }, 0.3);
  rig.group.updateMatrixWorld(true);
  const wAfter = sampleVertex();
  const dist = wBefore.distanceTo(wAfter);
  const lifted = dist > 0.05;

  console.log(`${id}: baseClip(sementara)=${baseHasArmTracks} waveGone=${waveGone ? "✅" : "❌ " + [...rots]} pivot=${shoulderPos ? "✅@" + shoulderPos : "❌HILANG"} armLift=${lifted ? "✅" : "❌"} movedDy=${(wAfter.y - wBefore.y).toFixed(3)}`);
  rig.dispose();
}
