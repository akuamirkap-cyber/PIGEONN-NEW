import { engine, SubwayTrain } from "../src/game/engine";
import { SUBWAY_CAR_LEN, SUBWAY_CAR_W } from "../src/game/models";
import { useUI } from "../src/game/store";

let pass = 0;
let fail = 0;
const log: string[] = [];

function check(name: string, ok: boolean, detail = "") {
  if (ok) pass++;
  else fail++;
  log.push(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}

console.log("=== Testing Bus Anti-Clipping & Collision Avoidance ===");

// 1. Bus dimensions & lane width clearance
check(
  "Bus width has proper lane clearance (width <= 2.2m for 2.4m lane)",
  SUBWAY_CAR_W <= 2.2,
  `Width: ${SUBWAY_CAR_W}m`
);

// 2. Moving bus behind a stationary bus: must decelerate and stop safely without penetrating
engine.startRun();
engine.subwayTrains = [];

const stoppedBus: SubwayTrain = {
  id: 101,
  s: 200,
  lane: 1,
  speed: 0,
  baseSpeed: 0,
  nCars: 2,
  line: 0,
  isStopped: true,
  horned: true,
  passed: false,
  length: SUBWAY_CAR_LEN * 2, // 22m length: spans from s=200 to s=222
};

const movingBus: SubwayTrain = {
  id: 102,
  s: 260, // starts 38m behind the rear of stopped bus (260 - 222 = 38m)
  lane: 1,
  speed: 22, // traveling fast toward smaller s
  baseSpeed: 22,
  nCars: 1,
  line: 1,
  horned: false,
  passed: false,
  length: SUBWAY_CAR_LEN, // 11m
};

engine.subwayTrains.push(stoppedBus, movingBus);

let minGapSeen = Infinity;
let penetrated = false;

// Simulate 500 frames (~8.3 seconds)
for (let frame = 0; frame < 500; frame++) {
  engine.update(1 / 60);

  const rearOfStopped = stoppedBus.s + stoppedBus.length;
  const frontOfMoving = movingBus.s;
  const gap = frontOfMoving - rearOfStopped;

  if (gap < minGapSeen) minGapSeen = gap;
  if (gap < 4.0) {
    penetrated = true;
  }
}

check(
  "Moving bus stops behind stationary bus without clipping/penetrating",
  !penetrated && movingBus.speed === 0 && movingBus.isStopped === true,
  `Final Gap: ${minGapSeen.toFixed(2)}m (Min allowed: >= 4.0m), Speed: ${movingBus.speed}`
);

// 3. Fast moving bus behind slower moving bus: matches speed and maintains headway
engine.startRun();
engine.subwayTrains = [];

const slowLeadBus: SubwayTrain = {
  id: 201,
  s: 300,
  lane: 0,
  speed: 12,
  baseSpeed: 12,
  nCars: 1,
  line: 0,
  horned: false,
  passed: false,
  length: SUBWAY_CAR_LEN, // 11m: spans 300 to 311
};

const fastFollowerBus: SubwayTrain = {
  id: 202,
  s: 345, // 34m behind leader
  lane: 0,
  speed: 24, // traveling twice as fast
  baseSpeed: 24,
  nCars: 1,
  line: 1,
  horned: false,
  passed: false,
  length: SUBWAY_CAR_LEN,
};

engine.subwayTrains.push(slowLeadBus, fastFollowerBus);

let minMovingGap = Infinity;
let movingPenetrated = false;

for (let frame = 0; frame < 400; frame++) {
  engine.update(1 / 60);

  const leadRear = slowLeadBus.s + slowLeadBus.length;
  const followerFront = fastFollowerBus.s;
  const gap = followerFront - leadRear;

  if (gap < minMovingGap) minMovingGap = gap;
  if (gap < 4.0) {
    movingPenetrated = true;
  }
}

check(
  "Fast bus behind slower bus decelerates and never penetrates leader",
  !movingPenetrated && fastFollowerBus.speed <= slowLeadBus.speed + 0.1,
  `Min gap: ${minMovingGap.toFixed(2)}m, Follower speed: ${fastFollowerBus.speed.toFixed(2)}, Leader: ${slowLeadBus.speed.toFixed(2)}`
);

// 4. Test tunnel dynamic spawning prevents overlapping spawns
useUI.getState().setTrackMode("shibuya");
engine.startRun();

// Advance world through the subway tunnel
for (let step = 0; step < 1200; step++) {
  engine.update(1 / 60);

  // Check all buses in subwayTrains for overlaps in the same lane
  for (let l = 0; l < 3; l++) {
    const buses = engine.subwayTrains.filter((b) => b.lane === l).sort((a, b) => a.s - b.s);
    for (let k = 1; k < buses.length; k++) {
      const leader = buses[k - 1];
      const follower = buses[k];
      const gap = follower.s - (leader.s + leader.length);
      if (gap < 3.5) {
        check("No bus overlaps another bus in tunnel run", false, `Lane ${l}: gap = ${gap.toFixed(2)}m between bus ${leader.id} and ${follower.id}`);
        process.exit(1);
      }
    }
  }
}

check("No bus overlaps or clips into another bus throughout full tunnel run", true, "All buses respect headway and clear lanes");

console.log("\nResults:");
log.forEach((l) => console.log(" ", l));
console.log(`\nTotal: ${pass} passed, ${fail} failed.`);
if (fail > 0) process.exit(1);
