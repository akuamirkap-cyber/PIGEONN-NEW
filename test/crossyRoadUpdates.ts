/* Regression checks for the Crossy-style camera/light rollout, dense urban traffic,
 * signal-aware pedestrians, and speed-independent jump height.
 * Run: npx esbuild test/crossyRoadUpdates.ts --bundle --platform=node --outfile=/tmp/crossyRoadUpdates.cjs && node /tmp/crossyRoadUpdates.cjs
 */
import {
  engine,
  GRAVITY,
  JUMP_V,
  LANE_LAT,
  ONCOMING_CAR_SPEED_MULT,
  RAMP_TRAIN_CLEARANCE_H,
  RAMP_V,
  START_SPEED,
  TRAFFIC_STOP_LINE_OFFSET,
  type Mover,
} from "../src/game/engine";
import { useUI } from "../src/game/store";

const e = engine as unknown as Record<string, any>;
let pass = 0;
let fail = 0;
const log: string[] = [];
function check(name: string, ok: boolean, detail = "") {
  if (ok) pass++;
  else fail++;
  log.push(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}

function startCityRun(speedMode: 1 | 2 | 3 = 1) {
  useUI.getState().setTrackMode("tokyo");
  engine.setTrackMode("tokyo");
  useUI.getState().setSpeedMode(speedMode);
  engine.startRun();
  e.nextObstacleS = 1e9;
  e.nextRoadworkS = 1e9;
  e.nextCrossingS = 1e9;
  e.nextOverpassS = 1e9;
  e.nextNosS = 1e9;
  e.nextRocketS = 1e9;
  e.nextIntersectionS = 1e9;
  engine.obstacles = [];
  engine.movers = [];
  engine.crossings = [];
  engine.trains = [];
  engine.intersections = [];
  engine.crossCars = [];
  engine.reserved = [];
}

log.push("=== Crossy-style defaults ===");
check("sunny Shibuya city route opens by default", useUI.getState().trackMode === "shibuya");
check("clear daytime is the default city lighting", useUI.getState().weather === "sunny" && useUI.getState().shibuyaTime === "siang");
useUI.getState().setCameraMode("crossy");
check("Crossy Road camera mode can be selected", useUI.getState().cameraMode === "crossy");
useUI.getState().setCameraMode("chase");
check("original chase camera remains available", useUI.getState().cameraMode === "chase");
useUI.getState().setCameraMode("crossy");

log.push("=== Charged boost button uses NOS before sprint ===");
startCityRun(1);
engine.addNos(100);
engine.input("boost");
check("full NOS gauge fires from the shared boost button", engine.nosT > 0 && engine.nos === 0 && engine.sprintTimer === 0);

log.push("=== Jump height remains capped at normal speed ===");
const jumpPeaks: number[] = [];
for (const speed of [1, 2, 3] as const) {
  startCityRun(speed);
  const p = engine.player;
  p.grounded = true;
  p.grinding = false;
  p.h = 0;
  p.vh = 0;
  (e.jump as (v?: number) => void)(JUMP_V);
  const peak = p.h + (p.vh * p.vh) / (2 * GRAVITY);
  jumpPeaks.push(peak);
  check(`ollie at ${speed}× uses the same capped launch velocity`, Math.abs(p.vh - JUMP_V) < 1e-9, `vh=${p.vh.toFixed(2)}`);
}
check("normal/2×/3× ollie peak heights are identical", Math.max(...jumpPeaks) - Math.min(...jumpPeaks) < 1e-9, jumpPeaks.map((h) => h.toFixed(3)).join(" / "));

log.push("=== Ramp jump is fixed-height and clears boosted train crossings ===");
const rampLaunches: number[] = [];
for (const speed of [1, 2, 3] as const) {
  startCityRun(speed);
  const p = engine.player;
  p.grounded = true;
  p.grinding = false;
  p.onRamp = true;
  p.bigAir = false;
  p.h = 1;
  p.vh = 0;
  (e.updatePlayer as (dt: number) => void)(1 / 60);
  rampLaunches.push(p.vh);
  check(`ramp at ${speed}× launches with normal capped velocity`, Math.abs(p.vh - RAMP_V) < 1e-9 && p.bigAir, `vh=${p.vh.toFixed(2)}`);
}
check("ramp launch velocity is independent of speed mode", Math.max(...rampLaunches) - Math.min(...rampLaunches) < 1e-9);

startCityRun(3);
engine.speed = START_SPEED * 3 * 1.8; // 3× speed with a strong active sprint/NOS-style boost
engine.nosT = 2.6;
const crossing = {
  id: 9001,
  s: engine.distance,
  pos: [0, 0, 0] as [number, number, number],
  rotY: 0,
  signPos: [0, 0, 0] as [number, number, number],
  signRotY: 0,
  state: "warning" as const,
  armT: 1,
  timer: 0,
  bellT: 0,
  bellAlt: false,
  lightPhase: 0,
  line: 0,
  placed: true,
  trainScheduled: true,
  train: null,
  rampLanes: [1],
};
const train = { id: 9002, crossing, head: 1.5, dir: 1, speed: 8, nCars: 1, line: 0, horned: true, rumbleT: 0 };
crossing.train = train as any;
e.trains = [train];
const rampPlayer = engine.player;
rampPlayer.targetLane = 1;
rampPlayer.lat = LANE_LAT[1];
rampPlayer.grounded = false;
rampPlayer.grinding = false;
rampPlayer.bigAir = true;
rampPlayer.h = 0.3;
rampPlayer.vh = 0;
rampPlayer.airT = 0.2;
(e.updatePlayer as (dt: number) => void)(1 / 60);
check("boosted ramp flight clears the train without extra speed-scaled height", rampPlayer.h >= RAMP_TRAIN_CLEARANCE_H && engine.phase === "playing", `speed=${engine.speed.toFixed(1)}, h=${rampPlayer.h.toFixed(2)}m, clearance=${RAMP_TRAIN_CLEARANCE_H.toFixed(2)}m`);
check("ramp clearance remains a small margin above the train hitbox", Math.abs(RAMP_TRAIN_CLEARANCE_H - 2.52) < 1e-9);

log.push("=== Denser city traffic and signal-controlled crossings ===");
startCityRun(1);
const intersection = {
  id: 9101,
  s: engine.distance + 60,
  pos: [0, 0, 0] as [number, number, number],
  rotY: 0,
  placed: true,
  signPos: [0, 0, 0] as [number, number, number],
  signRotY: 0,
  spawnTimer1: 1,
  spawnTimer2: 1,
  trafficTimer: 0,
  signalStarted: true,
  lightState: "red" as const,
  scramble: false,
  wide: false,
};
e.intersections = [intersection];
const spawnPedestrians = e.spawnPedestrians.bind(engine) as (s: number, t: number) => number;
spawnPedestrians(intersection.s, 0.7);
const generatedPeds = engine.movers.filter((m: Mover) => m.kind === "pedestrian");
check("city crosswalk groups reliably include at least two people", generatedPeds.length >= 2, `${generatedPeds.length} people`);
check("pedestrian group has people crossing in both directions", new Set(generatedPeds.map((m: Mover) => m.dir)).size === 2);
check("crossers are attached to their traffic light", generatedPeds.every((m: Mover) => m.signalIntersectionId === intersection.id));
check("crossers are staggered instead of marching in a straight row", new Set(generatedPeds.map((m: Mover) => m.s.toFixed(2))).size === generatedPeds.length);

const spawnIntersection = e.addIntersection.bind(engine) as (s: number) => any;
engine.movers = [];
const generatedIntersection = spawnIntersection(engine.distance + 90);
const intersectionPeds = engine.movers.filter((m: Mover) => m.kind === "pedestrian");
check("regular city intersections also spawn crosswalk pedestrians", intersectionPeds.length >= 2, `${intersectionPeds.length} people`);
check("regular intersection walkers wait on their own signal", intersectionPeds.every((m: Mover) => m.signalIntersectionId === generatedIntersection.id));

engine.movers = [];
const throughPed = e.newMover("pedestrian", intersection.s, -1, 0) as Mover;
throughPed.signalIntersectionId = intersection.id;
throughPed.phase = "hop";
engine.movers = [throughPed];
intersection.lightState = "green";
(e.updateIntersections as (dt: number) => void)(0);
check("the vehicle light stays red until pedestrians finish crossing", intersection.lightState === "red");

// Oncoming cars stop before a red pedestrian crossing and move again on green.
engine.movers = [];
intersection.lightState = "red";
const stopLine = intersection.s + TRAFFIC_STOP_LINE_OFFSET;
const trafficCar = e.newMover("car", stopLine + 22, 1, LANE_LAT[1]) as Mover;
trafficCar.speed = 14;
engine.movers = [trafficCar];
const updateMovers = e.updateMovers.bind(engine) as (dt: number) => void;
for (let i = 0; i < 700; i++) updateMovers(1 / 60);
const stoppedAt = trafficCar.s;
check("oncoming car waits behind a red crosswalk signal", stoppedAt >= stopLine - 0.02 && stoppedAt <= stopLine + 0.25, `car=${stoppedAt.toFixed(2)}, line=${stopLine.toFixed(2)}`);
intersection.lightState = "green";
for (let i = 0; i < 12; i++) updateMovers(1 / 60);
check("oncoming car proceeds when the signal turns green", trafficCar.s < stoppedAt - 0.4, `Δs=${(stoppedAt - trafficCar.s).toFixed(2)}m`);

// Prove the advertised 40% car speed increase is applied to actual spawns.
startCityRun(1);
const originalRandom = Math.random;
let randomValues = [0.5, 0.99, 0.99];
Math.random = () => randomValues.shift() ?? 0.99;
try {
  (e.spawnOncoming as (s: number, lane: number, t: number, companion?: boolean) => void)(engine.distance + 60, 1, 0, false);
} finally {
  Math.random = originalRandom;
}
const spawnedCar = engine.movers.find((m: Mover) => m.kind === "car");
const baselineCarSpeed = 3.2 + (4.4 - 3.2) * 0.5;
check("oncoming car spawns 40% faster than the old baseline", !!spawnedCar && Math.abs(spawnedCar.speed - baselineCarSpeed * ONCOMING_CAR_SPEED_MULT) < 1e-9, `speed=${spawnedCar?.speed.toFixed(2)}`);

useUI.getState().setSpeedMode(1);
console.log(log.join("\n"));
console.log(`\n${fail === 0 ? "ALL CHECKS PASSED" : "FAILURES FOUND"} (${pass} passed, ${fail} failed)`);
if (fail) process.exitCode = 1;
