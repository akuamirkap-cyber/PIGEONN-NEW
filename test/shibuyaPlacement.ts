/* Regression test for real Shibuya source footprints and safe reserve placement.
 * Run: npx esbuild test/shibuyaPlacement.ts --bundle --platform=node --outfile=/tmp/shibuya-placement.cjs && node /tmp/shibuya-placement.cjs
 */
import { engine, type Chunk } from "../src/game/engine";
import { useUI } from "../src/game/store";
import { ALL_SHIBUYA_BUILDING_IDS, getShibuyaAssetFootprint } from "../src/game/shibuyaBuildingModels";

const e = engine as unknown as Record<string, any>;
let pass = 0;
let fail = 0;
const log: string[] = [];
function check(name: string, condition: boolean, detail = "") {
  if (condition) pass++;
  else fail++;
  log.push(`${condition ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}

useUI.getState().setTrackMode("shibuya");
engine.setTrackMode("shibuya");
engine.startRun();

const footprints = e.shibuyaFootprints as Array<{
  asset: string;
  scale: number;
  sMin: number;
  sMax: number;
  latMin: number;
  latMax: number;
}>;
const gap = 0.9;
let overlaps = 0;
for (let i = 0; i < footprints.length; i++) {
  for (let j = i + 1; j < footprints.length; j++) {
    const a = footprints[i];
    const b = footprints[j];
    if (a.sMin < b.sMax + gap && a.sMax + gap > b.sMin && a.latMin < b.latMax + gap && a.latMax + gap > b.latMin) overlaps++;
  }
}
check("Shibuya stores actual transformed source footprints", footprints.length >= 8, `${footprints.length} placements`);
check("source footprints keep a minimum gap in both track axes", overlaps === 0, `${overlaps} overlaps`);
check("source footprints stay clear of the road", footprints.every((f) => f.latMax <= -6.8 || f.latMin >= 6.8));
check("unsafe oversized copies are not forced into tiny slots", footprints.every((f) => f.scale >= 0.52), `${Math.min(...footprints.map((f) => f.scale)).toFixed(2)} minimum scale`);

const exactDecor = (engine.chunks as Chunk[]).flatMap((chunk) => chunk.decor)
  .filter((decor) => decor.kind === "building" && decor.spec?.shibuyaAssetId);
const sourceIds = new Set(exactDecor.map((decor) => decor.spec!.shibuyaAssetId));
check("all transferred Shibuya source assets remain available in the route window", ALL_SHIBUYA_BUILDING_IDS.every((id) => sourceIds.has(id)),
  `${sourceIds.size}/${ALL_SHIBUYA_BUILDING_IDS.length} source ids`);
check("every rendered source building uses one uniform planned scale", exactDecor.every((decor) => Number.isFinite(decor.spec!.assetScale) && decor.spec!.assetScale! > 0));

// The footprint API itself must include rotated source boxes, not just the declared lot width.
const skyscraper = getShibuyaAssetFootprint("skyscraper");
check("skyscraper footprint exposes its full transferred block", skyscraper.width > 30 && skyscraper.depth > 25,
  `${skyscraper.width.toFixed(1)} x ${skyscraper.depth.toFixed(1)}`);

console.log(log.join("\n"));
console.log(`\n${fail === 0 ? "ALL CHECKS PASSED" : "FAILURES FOUND"} (${pass} passed, ${fail} failed)`);
if (fail) process.exitCode = 1;
