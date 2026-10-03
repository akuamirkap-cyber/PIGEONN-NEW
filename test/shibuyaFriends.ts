/* Regression coverage for the Shibuya Blocks Little Japan Friends transfer.
 * Run: npx esbuild test/shibuyaFriends.ts --bundle --platform=node --outfile=/tmp/shibuya-friends.cjs && node /tmp/shibuya-friends.cjs
 */
import { readFileSync } from "node:fs";
import { DISTRICTS } from "../src/shibuya/world/layout";
import { useUI } from "../src/game/store";
import { engine } from "../src/game/engine";
import {
  ANIMAL_HEIGHT_TARGETS,
  PIGEON_SHIBUYA_ANIMALS,
  SHIBUYA_ANIMALS,
  SHIBUYA_PLAYABLE_HEIGHT,
  SHIBUYA_CRANE_DISPLAY_MULTIPLIER,
  buildShibuyaAnimalRig,
  getShibuyaAnimalParts,
  getShibuyaAnimalPlayerScale,
  getShibuyaCharacterParts,
  getShibuyaRamenCustomerParts,
} from "../src/game/shibuyaPacks";
import { SKINS } from "../src/game/skins";

let pass = 0;
let fail = 0;
const log: string[] = [];
function check(name: string, ok: boolean, detail = "") {
  if (ok) pass++;
  else fail++;
  log.push(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}

const friendSkinIds = PIGEON_SHIBUYA_ANIMALS.map((id) => `friend-${id}`);
const friendSkins = SKINS.filter((skin) => skin.kind === "littleJapanFriend");
check("canonical roster has exactly eight source animals", SHIBUYA_ANIMALS.length === 8 && new Set(SHIBUYA_ANIMALS).size === 8, SHIBUYA_ANIMALS.join(", "));
check("all eight source animal geometries resolve from Shibuya Blocks", SHIBUYA_ANIMALS.every((id) => getShibuyaAnimalParts(id).length > 0));
check("retained Friends are 20 percent taller and Crane is 2x display size", PIGEON_SHIBUYA_ANIMALS.every((id) => {
  const expected = SHIBUYA_PLAYABLE_HEIGHT * (id === "crane" ? SHIBUYA_CRANE_DISPLAY_MULTIPLIER : 1);
  return Math.abs(ANIMAL_HEIGHT_TARGETS[id] * getShibuyaAnimalPlayerScale(id) - expected) < 1e-9;
}));
check("Shiba, Kitsune, Deer, and Capybara use upright source body posture", ["shiba", "kitsune", "deer", "capybara"].every((id) => {
  const rig = buildShibuyaAnimalRig(id as typeof SHIBUYA_ANIMALS[number]);
  const body = rig.group.getObjectByName(`animal_${id}_body`);
  const upright = body ? Math.abs(Math.abs(body.rotation.x) - Math.PI / 2) < 1e-6 : false;
  rig.dispose();
  return upright;
}));
check("playable Capybara source excludes the bath setting", !getShibuyaAnimalParts("capybara").some((part) => part.color === "#9b9f8f"));
check("Shift push uses source leg pivots instead of replacement body meshes", readFileSync("src/game/shibuyaPacks.ts", "utf8").includes("pushPivot") && !readFileSync("src/game/shibuyaPacks.ts", "utf8").includes("PushFootGeo"));
const animatedRigs = SHIBUYA_ANIMALS.map((id) => buildShibuyaAnimalRig(id));
check("all eight retained/source animal rigs keep an active source Play animation", animatedRigs.every((rig) => rig.group.children.length > 0 && rig.clips.length > 0 && rig.activeClip === "Play"));
animatedRigs.forEach((rig) => rig.dispose());
check("only the retained four Friends are free selectable Pigeon skins", friendSkins.length === PIGEON_SHIBUYA_ANIMALS.length && friendSkinIds.every((id) => friendSkins.some((skin) => skin.id === id && skin.cost === 0 && skin.friend)) && !["friend-shiba", "friend-kitsune", "friend-deer", "friend-capybara"].some((id) => friendSkins.some((skin) => skin.id === id)), friendSkins.map((skin) => skin.id).join(", "));

useUI.getState().setTrackMode("shibuya");
engine.setTrackMode("shibuya");
const openingFriends = engine.movers.filter((m) => m.kind === "shibuya_animal");
const openingRoster = new Set(openingFriends.map((m) => m.shibuyaAnimal));
check("opening Shibuya route seeds only the four retained Friends", openingRoster.size === PIGEON_SHIBUYA_ANIMALS.length && PIGEON_SHIBUYA_ANIMALS.every((id) => openingRoster.has(id)) && !["shiba", "kitsune", "deer", "capybara"].some((id) => openingRoster.has(id)), [...openingRoster].join(", "));
check("opening Friends include crossing, sidewalk waving, and bathing", openingFriends.some((m) => m.shibuyaAnimalActivity === "crossing")
  && openingFriends.some((m) => m.shibuyaAnimalActivity === "waving")
  && openingFriends.some((m) => m.shibuyaAnimalActivity === "bathing"));
check("retained Monkey stays assigned to the bathing scene and Capybara is absent", openingFriends.filter((m) => m.shibuyaAnimal === "monkey").every((m) => m.shibuyaAnimalActivity === "bathing") && !openingFriends.some((m) => m.shibuyaAnimal === "capybara"));
check("waving Friends stay on a sidewalk-facing side", openingFriends.filter((m) => m.shibuyaAnimalActivity === "waving").every((m) => Math.abs(m.lat) >= 5 && m.shibuyaAnimalSide));

const ramenBusinessCounts = DISTRICTS.map((district) => district.businesses.filter((business) => business.kind === "ramen").length);
const ramenActivityCounts = DISTRICTS.map((district) => district.activities.filter((actor) => actor.activity === "ramen").length);
check("every Shibuya Blocks ramen shop receives two eating customers", ramenBusinessCounts.every((count, index) => count > 0 && ramenActivityCounts[index] === count * 2), `${ramenBusinessCounts.join(",")} shops / ${ramenActivityCounts.join(",")} customers`);
const ramenRigParts = getShibuyaRamenCustomerParts("salaryman");
const ramenColors = new Set(ramenRigParts.map((part) => part.color));
check("ramen customer rig contains bowl, chopsticks, and steam source parts", ramenRigParts.length > 50 && ["#b45b48", "#a87b43", "#edeed8"].every((color) => ramenColors.has(color)), `${ramenRigParts.length} parts`);

const sumo = getShibuyaCharacterParts("sumo");
const sumoColors = new Set(sumo.map((part) => part.color));
check("sumo pedestrian keeps teal shirt and navy trousers", sumoColors.has("#2f7183") && sumoColors.has("#344c64"));
const spawnPedestrians = (engine as unknown as { spawnPedestrians: (s: number, t: number) => number }).spawnPedestrians.bind(engine);
spawnPedestrians(engine.distance + 120, 0.5);
check("sumo remains a deterministic Shibuya pedestrian candidate", engine.movers.some((m) => m.shibuyaChar === "sumo"));

console.log(log.join("\n"));
console.log(`\n${fail === 0 ? "ALL CHECKS PASSED" : "CHECKS FAILED"} (${pass} passed, ${fail} failed)`);
if (fail > 0) process.exitCode = 1;
