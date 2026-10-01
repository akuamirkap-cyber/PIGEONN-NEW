/* Regression tests for Shibuya signals/pedestrians, readable bread rows, and protected bonus items.
 * Run: npx esbuild test/shibuyaSafety.ts --bundle --platform=node --outfile=/tmp/shibuya-safety.cjs && node /tmp/shibuya-safety.cjs
 */
import { engine, track, TRAFFIC_STOP_LINE_OFFSET, trafficSignalApproach, type Obstacle } from "../src/game/engine";
import { useUI } from "../src/game/store";

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
e.obstacles = [];
e.breads = [];
e.nosCans = [];
e.rockets = [];
e.movers = [];
e.crossCars = [];
e.crossings = [];
e.intersections = [];
e.reserved = [];
e.nextObstacleS = 1e9;
e.nextNosS = 1e9;
e.nextRocketS = 1e9;
e.nextRoadworkS = 1e9;
const s = engine.distance + 120;
const addObstacle = e.addObstacle.bind(engine) as (kind: string, s: number, lane: number, force?: boolean) => void;
const breadLine = e.breadLine.bind(engine) as (s: number, lane: number, n?: number, h?: number) => void;

// Bread rows beside a same-time adjacent-lane obstacle are omitted as a whole; a safely separated row remains intact.
addObstacle("barrier", s, 0);
breadLine(s - 2, 1, 5, 0.5);
check("bread row is not placed alongside an obstacle", engine.breads.length === 0, `${engine.breads.length} pieces`);
breadLine(s + 8, 1, 5, 0.5);
check("clear bread row stays complete and collectible", engine.breads.length === 5, `${engine.breads.length} pieces`);
check("bread row has a clear lateral/forward buffer", engine.breads.every((b: { s: number; lane: number }) => b.lane !== 0 || Math.abs(b.s - s) > 5));

// Items reserve their lane against hazards that spawn later.
const tokenS = s + 40;
e.nosCans.push({ id: 9001, s: tokenS, lane: 1, taken: false });
addObstacle("cone", tokenS, 1);
check("future obstacle cannot cover a NOS can", !engine.obstacles.some((o: Obstacle) => o.s === tokenS && o.lane === 1));
e.rockets.push({ id: 9002, s: tokenS + 20, lane: 2, taken: false, kind: "diamond" });
addObstacle("car", tokenS + 20, 2);
check("future obstacle cannot cover a rare bonus", !engine.obstacles.some((o: Obstacle) => o.s === tokenS + 20 && o.lane === 2));

// Through-traffic obeys the signal and holds at the marked stop line.
const greenApproach = trafficSignalApproach(s + 20, s, "green");
const yellowApproach = trafficSignalApproach(s + 16.2, s, "yellow");
const redAtLine = trafficSignalApproach(s + TRAFFIC_STOP_LINE_OFFSET, s, "red");
const redPastLine = trafficSignalApproach(s + TRAFFIC_STOP_LINE_OFFSET - 2, s, "red");
check("green signal lets through-traffic continue", greenApproach.targetK === 1 && greenApproach.stopLineS === null);
check("yellow signal begins smooth braking", yellowApproach.targetK > 0 && yellowApproach.targetK < 1 && yellowApproach.stopLineS === s + TRAFFIC_STOP_LINE_OFFSET, `factor=${yellowApproach.targetK.toFixed(2)}`);
check("red signal brings cars to a full stop at the bar", redAtLine.targetK === 0 && redAtLine.stopLineS === s + TRAFFIC_STOP_LINE_OFFSET);
check("cars already past the bar are not snapped backward", redPastLine.stopLineS === null && redPastLine.targetK === 1);

// Every Shibuya roadside pedestrian stays on the curb-to-curb crossing, not inside sidewalk fixtures.
e.movers = [];
const spawnPedestrians = e.spawnPedestrians.bind(engine) as (s: number, t: number) => number;
spawnPedestrians(engine.distance + 70, 0.5);
const peds = engine.movers.filter((m: { kind: string }) => m.kind === "pedestrian");
check("Shibuya pedestrian group spawned", peds.length > 0, `${peds.length} pedestrians`);
check("Shibuya pedestrians start at the curb edge", peds.every((m: { crossingEdge?: number; lat: number }) => m.crossingEdge === 4.15 && Math.abs(m.lat) === 4.15));

// Scramble waves are released only on red; the extended scramble red covers a complete walk cycle.
const signalInter = {
  id: 777,
  s: engine.distance + 60, 
  pos: [0, 0, 0],
  rotY: 0,
  placed: true,
  signPos: [0, 0, 0],
  signRotY: 0,
  spawnTimer1: 100,
  spawnTimer2: 100,
  trafficTimer: 5,
  signalStarted: false,
  lightState: "green" as "green" | "yellow" | "red",
  scramble: true,
  wide: false,
};
e.intersections = [signalInter];
const updateIntersections = e.updateIntersections.bind(engine) as (dt: number) => void;
updateIntersections(0);
check("scramble red starts when the intersection comes within approach range", signalInter.signalStarted === true && signalInter.lightState === "red", signalInter.lightState);
const walker = {
  id: 7771, kind: "pedestrian", s: engine.distance + 100, lat: -6.8, lane: -1, speed: 2,
  variant: 0, dir: 1, h: 0, vh: 0, phase: "wait", hopT: 0, hopFrom: 0, hopTo: 0,
  pause: 0, delay: 0, warned: false, squash: 0, spin: 0, hitT: 0, signalIntersectionId: signalInter.id,
};
e.movers = [walker];
signalInter.lightState = "green";
const updateMovers = e.updateMovers.bind(engine) as (dt: number) => void;
updateMovers(0.016);
check("scramble pedestrian waits through green", walker.phase === "wait", walker.phase);
signalInter.lightState = "red";
updateMovers(0.016);
check("scramble pedestrian starts crossing on red", walker.phase === "hop", walker.phase);
walker.phase = "wait";
signalInter.trafficTimer = 0.01;
updateIntersections(0);
check("scramble pedestrian phase begins with a long red", signalInter.lightState === "red", signalInter.lightState);
signalInter.trafficTimer = 9.99;
updateIntersections(0);
check("scramble red phase is held for 10 seconds", signalInter.lightState === "red", `timer=${signalInter.trafficTimer.toFixed(2)}, state=${signalInter.lightState}`);
signalInter.trafficTimer = 10.01;
updateIntersections(0);
check("scramble traffic resumes on green after the pedestrian phase", signalInter.lightState === "green", signalInter.lightState);
walker.phase = "hop";
updateIntersections(0);
check("active pedestrian holds the traffic light red until clearing", signalInter.lightState === "red", signalInter.lightState);
e.movers = [];
updateIntersections(0);
check("traffic signal resumes its scheduled green after the crossing", signalInter.lightState === "green", signalInter.lightState);

// Side-street cars wait before the avenue on green, then receive their turn during red.
signalInter.scramble = false;
signalInter.lightState = "green";
e.movers = [];
const crossCar = {
  id: 8881, intersectionId: signalInter.id, s: engine.distance + 100, lat: 17.5, dir: -1,
  speed: 8, variant: 0, horn: false, passed: false, speedK: 1,
};
e.crossCars = [crossCar];
const updateCrossCars = e.updateCrossCars.bind(engine) as (dt: number) => void;
updateCrossCars(0.05);
check("cross traffic waits outside the avenue during main-road green", crossCar.waiting === true && crossCar.lat > 12, `lat=${crossCar.lat.toFixed(2)}`);
signalInter.lightState = "red";
updateCrossCars(0.05);
check("cross traffic moves only after the avenue turns red", crossCar.waiting === false && crossCar.lat < 17.5, `lat=${crossCar.lat.toFixed(2)}`);

// Shibuya through-traffic must use all three lanes the player actively rides, with staggered arrivals.
e.movers = [];
e.crossCars = [];
e.crossings = [];
e.reserved = [];
const spawnShibuyaTrafficWave = e.spawnShibuyaTrafficWave.bind(engine) as (s: number, t: number) => number;
const waveLength = spawnShibuyaTrafficWave(engine.distance + 140, 0.8);
const waveCars = engine.movers.filter((m: { kind: string }) => m.kind === "car" || m.kind === "motorcycle");
const waveLanes = new Set(waveCars.map((m: { lane: number }) => m.lane));
check("Shibuya oncoming wave places active vehicles in all 3 player lanes", waveCars.length === 3 && [0, 1, 2].every((lane) => waveLanes.has(lane)), `lanes=${[...waveLanes].sort().join(",")}`);
check("three-lane traffic wave staggers encounters instead of blocking all lanes together", waveLength >= 30 && engine.reserved.length === 3, `length=${waveLength}, reservations=${engine.reserved.length}`);

console.log(log.join("\n"));
console.log(`\n${fail === 0 ? "ALL CHECKS PASSED" : "FAILURES FOUND"} (${pass} passed, ${fail} failed)`);
if (fail) process.exitCode = 1;
