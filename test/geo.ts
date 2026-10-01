import { buildVoxelGeometry } from "../src/game/voxel";
import { buildGroundGeometry } from "../src/game/ground";
import { Track } from "../src/game/track";
import * as M from "../src/game/models";

const tests: [string, () => any][] = [
  ["cone", M.coneParts], ["trash", () => M.trashParts(1)], ["barrier", M.barrierParts], ["bench", M.benchParts],
  ["boxes", M.boxesParts], ["planter", M.planterParts], ["car", () => M.carParts(2)], ["ramp", M.rampParts], ["rail", M.railParts],
  ["bread", M.breadParts], ["building", () => M.buildingParts(M.makeBuildingSpec(5.5))], ["buildingWide", () => M.buildingParts(M.makeBuildingSpec(11.4))],
  ["tree0", () => M.treeParts(0)], ["tree1", () => M.treeParts(1)], ["tree2", () => M.treeParts(2)], ["lamp", M.lampParts], ["hydrant", M.hydrantParts],
  ["bush", () => M.bushParts(0)], ["flowers", () => M.flowersParts(1)],
];

for (const [name, fn] of tests) {
  const parts = fn();
  const g = buildVoxelGeometry(parts);
  const pos = g.attributes.position;
  let maxY = -1e9, minY = 1e9;
  for (let i = 0; i < pos.count; i++) { maxY = Math.max(maxY, pos.getY(i)); minY = Math.min(minY, pos.getY(i)); }
  console.log(name.padEnd(14), "parts", String(parts.length).padStart(3), "verts", String(pos.count).padStart(5), "color?", !!g.attributes.color, "y:", minY.toFixed(2), "..", maxY.toFixed(2));
  g.dispose();
}

// Ground ribbons use their own geometry builder rather than voxel model-part factories.
const track = new Track("tokyo");
for (const kind of ["street", "park", "haruna", "shibuya"] as const) {
  const g = buildGroundGeometry(track, 0, 16, kind);
  const pos = g.attributes.position;
  let minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < pos.count; i++) { minY = Math.min(minY, pos.getY(i)); maxY = Math.max(maxY, pos.getY(i)); }
  console.log(`ground-${kind}`.padEnd(14), "verts", String(pos.count).padStart(5), "color?", !!g.attributes.color, "y:", minY.toFixed(2), "..", maxY.toFixed(2));
  g.dispose();
}
