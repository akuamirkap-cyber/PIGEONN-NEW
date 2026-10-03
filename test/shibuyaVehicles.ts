/* Regression test for Shibuya motorcycle variants and connected traffic-car bodies.
 * Run: npx esbuild test/shibuyaVehicles.ts --bundle --platform=node --outfile=/tmp/shibuya-vehicles.cjs && node /tmp/shibuya-vehicles.cjs
 */
import { carParts } from "../src/game/models";
import {
  getShibuyaMotorcycleParts,
  SHIBUYA_MOTORCYCLES,
} from "../src/game/shibuyaPacks";

let pass = 0;
let fail = 0;
const log: string[] = [];
function check(name: string, condition: boolean, detail = "") {
  if (condition) pass++;
  else fail++;
  log.push(`${condition ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}

check("Shibuya traffic includes explicit Honda and Harley aliases",
  SHIBUYA_MOTORCYCLES.includes("honda") && SHIBUYA_MOTORCYCLES.includes("harley"));

const hondaHelmet = getShibuyaMotorcycleParts("honda", true);
const hondaBareheaded = getShibuyaMotorcycleParts("honda", false);
const harleyHelmet = getShibuyaMotorcycleParts("harley", true);
const harleyBareheaded = getShibuyaMotorcycleParts("harley", false);
check("Honda rider can render with and without a helmet", hondaHelmet.length > hondaBareheaded.length,
  `${hondaHelmet.length}/${hondaBareheaded.length} parts`);
check("Harley rider can render with and without a helmet", harleyHelmet.length > harleyBareheaded.length,
  `${harleyHelmet.length}/${harleyBareheaded.length} parts`);

function overlaps(a: { x: number; y: number; z: number; w: number; h: number; d: number }, b: typeof a) {
  return Math.abs(a.x - b.x) * 2 < a.w + b.w
    && Math.abs(a.y - b.y) * 2 < a.h + b.h
    && Math.abs(a.z - b.z) * 2 < a.d + b.d;
}

const cars = [0, 1, 2, 3, 4, 5, 6].map((variant) => carParts(variant));
check("every traffic-car variant has one continuous lower body envelope", cars.every((parts) => {
  const body = parts[0];
  return body.w >= 3.1 && body.h >= 0.49 && body.d >= 1.5
    && parts.slice(1).filter((part) => overlaps(body, part)).length >= 4;
}));
check("traffic-car envelope reaches the cabin/chassis seam", cars.every((parts) => {
  const body = parts[0];
  return parts.slice(1).some((part) => part.y > 0.9 && overlaps(body, part));
}));

console.log(log.join("\n"));
console.log(`\n${fail === 0 ? "ALL CHECKS PASSED" : "FAILURES FOUND"} (${pass} passed, ${fail} failed)`);
if (fail) process.exitCode = 1;
