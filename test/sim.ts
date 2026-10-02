/* Engine simulation harness (run with esbuild bundle + node). */
import { engine, LANE_LAT, OBSTACLE_DEFS, track, CAR_HALF, trainCovers, type Obstacle } from "../src/game/engine";
import { useUI } from "../src/game/store";

const log: string[] = [];
const allPopups: string[] = [];
useUI.subscribe((s, prev) => {
  if (s.phase !== prev.phase) log.push(`[${engine.runTime.toFixed(2)}s] PHASE ${prev.phase} -> ${s.phase}`);
  if (s.popups !== prev.popups && s.popups.length) {
    const last = s.popups[s.popups.length - 1];
    if (!prev.popups.some((p) => p.id === last.id)) allPopups.push(last.text.split(" +")[0]);
  }
});

const DT = 1 / 60;
function step(n: number) {
  for (let i = 0; i < n; i++) engine.update(DT);
}

/* ---------- Track sanity ---------- */
function trackReport() {
  log.push("=== Track ===");
  track.ensure(1200);
  let minY = 0;
  let maxTh = 0;
  let minTh = 0;
  let curved = 0;
  let sloped = 0;
  let maxKappa = 0;
  let maxG = 0;
  for (let s = 0; s < 1200; s += 1) {
    const c = track.sample(s);
    minY = Math.min(minY, c.y);
    maxTh = Math.max(maxTh, c.th);
    minTh = Math.min(minTh, c.th);
    maxKappa = Math.max(maxKappa, Math.abs(c.kappa));
    maxG = Math.max(maxG, Math.abs(c.g));
    if (Math.abs(c.kappa) > 1e-4) curved++;
    if (Math.abs(c.g) > 0.02) sloped++;
  }
  log.push(
    `end=${track.end.toFixed(0)} minY=${minY.toFixed(1)} heading=[${((minTh * 180) / Math.PI).toFixed(1)}°, ${((maxTh * 180) / Math.PI).toFixed(1)}°] minRadius=${(1 / maxKappa).toFixed(0)} maxGrade=${maxG.toFixed(2)} curved=${curved}/1200 sloped=${sloped}/1200`,
  );
  // smoothness: heading rate and curvature jumps per 0.5 unit
  let maxDth = 0;
  let maxDk = 0;
  let prev = { ...track.sample(0) };
  for (let s = 0.5; s < 1200; s += 0.5) {
    const c = track.sample(s);
    maxDth = Math.max(maxDth, Math.abs(c.th - prev.th));
    maxDk = Math.max(maxDk, Math.abs(c.kappa - prev.kappa));
    prev = { ...c };
  }
  log.push(`max heading change per 0.5u=${((maxDth * 180) / Math.PI).toFixed(2)}° max curvature jump per 0.5u=${maxDk.toFixed(4)} (C1 => tiny)`);
  const q = track.quat(300);
  log.push(`quat(300)=[${q.x.toFixed(2)}, ${q.y.toFixed(2)}, ${q.z.toFixed(2)}, ${q.w.toFixed(2)}]`);
}

/* ---------- Bots ---------- */
function laneBlockedAhead(lane: number, within: number): Obstacle | null {
  const d = engine.distance;
  let best: Obstacle | null = null;
  for (const o of engine.obstacles) {
    if (o.lane !== lane) continue;
    const def = OBSTACLE_DEFS[o.kind];
    const dist = o.s - def.halfLen - d;
    if (dist < -def.halfLen * 2 || dist > within) continue;
    if (!best || o.s < best.s) best = o;
  }
  return best;
}
function carMoverAhead(lane: number, within: number) {
  const d = engine.distance;
  for (const m of engine.movers) {
    if (m.kind !== "car" || m.lane !== lane) continue;
    const dist = m.s - CAR_HALF - d;
    if (dist > -CAR_HALF * 2 && dist < within) return m;
  }
  return null;
}
function chickenNear() {
  const d = engine.distance;
  const p = engine.player;
  for (const m of engine.movers) {
    if (m.kind !== "chicken" || m.phase === "hit" || m.phase === "wait") continue;
    if (m.s - d > -0.5 && m.s - d < 1.6 && Math.abs(m.lat - p.lat) < 2.0) return true;
  }
  return false;
}

function scenarioIdle() {
  log.push("=== Scenario: idle bot ===");
  engine.startRun();
  let frames = 0;
  while (engine.phase === "playing" && frames < 60 * 60) {
    step(1);
    frames++;
  }
  log.push(`idle bot: phase=${engine.phase} after ${(frames / 60).toFixed(1)}s, distance=${engine.runDistance.toFixed(1)}`);
  step(120);
}

function scenarioSmart(seconds: number) {
  log.push("=== Scenario: smart bot ===");
  engine.startRun();
  let frames = 0;
  let jumps = 0;
  let laneChanges = 0;
  let tricks = 0;
  let sawCar = 0;
  let sawChicken = 0;
  const seenMovers = new Set<number>();
  const p = engine.player;
  while (engine.phase === "playing" && frames < seconds * 60) {
    step(1);
    frames++;
    for (const m of engine.movers) {
      if (seenMovers.has(m.id)) continue;
      seenMovers.add(m.id);
      if (m.kind === "car") sawCar++;
      else sawChicken++;
    }
    const lane = p.targetLane;
    // railway crossing ahead: steer into a ramp lane
    const crossingAhead = engine.crossings.find((c) => c.placed && c.s - engine.distance > 0 && c.s - engine.distance < 40);
    if (crossingAhead && !crossingAhead.rampLanes.includes(lane)) {
      p.targetLane = crossingAhead.rampLanes[0];
      laneChanges++;
      continue;
    }
    const oncoming = carMoverAhead(lane, 14);
    if (oncoming) {
      for (const l of [lane - 1, lane + 1, lane - 2, lane + 2]) {
        if (l < 0 || l > 2) continue;
        if (!carMoverAhead(l, 22) && !laneBlockedAhead(l, 5)) {
          p.targetLane = l;
          laneChanges++;
          break;
        }
      }
    }
    const ahead = laneBlockedAhead(lane, 3.2);
    if (ahead) {
      const def = OBSTACLE_DEFS[ahead.kind];
      const dist = ahead.s - def.halfLen - engine.distance;
      if (ahead.kind === "car") {
        for (const l of [lane - 1, lane + 1, lane - 2, lane + 2]) {
          if (l < 0 || l > 2) continue;
          if (!laneBlockedAhead(l, 6) && !carMoverAhead(l, 22)) {
            p.targetLane = l;
            laneChanges++;
            break;
          }
        }
      } else if (ahead.kind === "ramp") {
        /* ride it */
      } else if (ahead.kind === "rail") {
        if (dist < engine.speed * 0.08 + 0.3 && p.grounded) {
          engine.input("tap");
          jumps++;
        }
      } else if (dist < engine.speed * 0.1 + 0.4 && p.grounded) {
        engine.input("tap");
        jumps++;
      }
    }
    if (chickenNear() && p.grounded) {
      engine.input("tap");
      jumps++;
    }
    if (!p.grounded && !p.grinding && p.airT > 0.05 && p.airT < 0.08 && !p.trick) {
      engine.input(frames % 3 === 0 ? "left" : "tap");
      tricks++;
    }
  }
  log.push(
    `smart bot: phase=${engine.phase} t=${(frames / 60).toFixed(1)}s dist=${engine.runDistance.toFixed(1)} speed=${engine.speed.toFixed(1)} score=${engine.score} bread=${engine.breadCount} jumps=${jumps} laneChanges=${laneChanges} tricks=${tricks} oncomingCars=${sawCar} chickens=${sawChicken} y=${engine.center.y.toFixed(1)}`,
  );
  if (engine.phase !== "playing") {
    const d = engine.distance;
    const near = engine.obstacles
      .filter((o) => Math.abs(o.s - d) < 4)
      .map((o) => `${o.kind}@lane${o.lane} rel=${(o.s - d).toFixed(2)}`)
      .join(", ");
    const mv = engine.movers
      .filter((m) => Math.abs(m.s - d) < 5)
      .map((m) => `${m.kind}(${m.phase}) rel=${(m.s - d).toFixed(2)} lat=${m.lat.toFixed(2)}`)
      .join(", ");
    log.push(`  crash near: [${near}] movers: [${mv}]; player lat=${p.lat.toFixed(2)} h=${p.h.toFixed(2)} lane=${p.targetLane}`);
  }
  step(120);
}

function scenarioScripted() {
  log.push("=== Scenario: scripted ramp/rail/chicken ===");
  engine.startRun();
  const e = engine as unknown as { nextObstacleS: number; addObstacle: (k: string, s: number, l: number) => void };
  e.nextObstacleS = 1e9;
  engine.obstacles = [];
  const d0 = engine.distance;
  e.addObstacle("ramp", d0 + 15, 1);
  e.addObstacle("car", d0 + 15 + 1.2 + 3.3, 1);
  e.addObstacle("rail", d0 + 40, 1);
  const rail = engine.obstacles.find((o) => o.kind === "rail")!;
  let maxH = 0;
  let launched = false;
  let grinded = false;
  let frames = 0;
  const p = engine.player;
  while (engine.phase === "playing" && frames < 60 * 12) {
    step(1);
    frames++;
    maxH = Math.max(maxH, p.h);
    if (!p.grounded && p.bigAir) launched = true;
    if (p.grinding) grinded = true;
    const relRail = rail.s - OBSTACLE_DEFS.rail.halfLen - engine.distance;
    if (relRail < 1.0 && relRail > 0.2 && p.grounded) engine.input("tap");
  }
  log.push(`scripted: phase=${engine.phase} launched=${launched} maxH=${maxH.toFixed(2)} grinded=${grinded} score=${engine.score} lanes ok=${LANE_LAT.length === 3}`);
  // chicken collision test: place a chicken hopping right in front
  const m = (engine as unknown as { newMover: (k: string, s: number, lane: number, lat: number) => any }).newMover("chicken", engine.distance + 3, -1, 0);
  m.phase = "pause";
  m.pause = 10;
  engine.movers.push(m);
  let f2 = 0;
  while (engine.phase === "playing" && f2 < 120) {
    step(1);
    f2++;
  }
  log.push(`chicken hit -> phase=${engine.phase} after ${(f2 / 60).toFixed(2)}s, chicken phase=${m.phase}`);
  step(120);
}

/* ---------- Railway crossing ---------- */
function scenarioCrossing(takeRamp: boolean) {
  log.push(`=== Scenario: railway crossing (takeRamp=${takeRamp}) ===`);
  engine.startRun();
  const e = engine as unknown as { nextObstacleS: number; nextCrossingS: number };
  // run until a crossing pattern is placed
  let frames = 0;
  let cr = engine.crossings.find((c) => c.placed);
  const p = engine.player;
  let launched = false;
  let maxH = 0;
  let trainAtArrival = "";
  let armAtArrival = 0;
  let stateAtArrival = "";
  let arrived = false;
  let warnedAt = -1;
  let headAtWarn = 0;
  while (engine.phase === "playing" && frames < 60 * 60) {
    // isolate the test: remove everything except crossing ramps
    if (engine.obstacles.some((o) => o.kind !== "ramp")) engine.obstacles = engine.obstacles.filter((o) => o.kind === "ramp");
    if (engine.movers.length) engine.movers = [];
    step(1);
    frames++;
    cr = cr ?? engine.crossings.find((c) => c.placed);
    if (cr) {
      if (cr.state === "warning" && warnedAt < 0) {
        warnedAt = engine.runTime;
        headAtWarn = cr.train ? cr.train.head : 999;
      }
      const rel = cr.s - engine.distance;
      // choose lane: ramp lane or a non-ramp lane
      if (!takeRamp && cr.rampLanes.includes(1)) {
        // force the middle lane (the gap between the arms) to be ramp-free so the train itself is the hazard
        engine.obstacles = engine.obstacles.filter((o) => !(o.kind === "ramp" && o.lane === 1));
        cr.rampLanes = cr.rampLanes.filter((l) => l !== 1);
        engine.listVersion++;
      }
      if (rel < 40 && rel > 0) {
        const want = takeRamp ? cr.rampLanes[0] : 1;
        if (p.targetLane !== want) p.targetLane = want;
      }
      if (!p.grounded && p.bigAir) launched = true;
      if (rel < 1 && !arrived) {
        arrived = true;
        const tr = cr.train;
        trainAtArrival = tr ? `head=${tr.head.toFixed(1)} covers0=${trainCovers(tr, 0)}` : "none";
        armAtArrival = cr.armT;
        stateAtArrival = cr.state;
      }
      if (rel > 0 && rel < 6) maxH = Math.max(maxH, p.h);
      if (rel < -12) break;
    } else {
      // avoid dying before the crossing: simple dodge logic (jump anything close)
      const ahead = laneBlockedAhead(p.targetLane, 3.2);
      if (ahead && ahead.kind !== "ramp" && ahead.kind !== "car" && p.grounded && ahead.s - OBSTACLE_DEFS[ahead.kind].halfLen - engine.distance < engine.speed * 0.1 + 0.4) engine.input("tap");
      if (ahead && ahead.kind === "car") for (const l of [p.targetLane - 1, p.targetLane + 1]) if (l >= 0 && l <= 2 && !laneBlockedAhead(l, 6)) { p.targetLane = l; break; }
      const car = carMoverAhead(p.targetLane, 14);
      if (car) for (const l of [p.targetLane - 1, p.targetLane + 1]) if (l >= 0 && l <= 2 && !carMoverAhead(l, 22) && !laneBlockedAhead(l, 5)) { p.targetLane = l; break; }
      if (chickenNear() && p.grounded) engine.input("tap");
    }
  }
  log.push(
    `crossing: found=${!!cr} s=${cr?.s.toFixed(0)} rampLanes=${cr?.rampLanes} phase=${engine.phase} cause=${engine.crashCause} launched=${launched} maxH=${maxH.toFixed(2)} arrival: state=${stateAtArrival} arm=${armAtArrival.toFixed(2)} train[${trainAtArrival}] warnedAt=${warnedAt.toFixed(1)}s headAtWarn=${headAtWarn.toFixed(1)} nextCrossing=${e.nextCrossingS.toFixed(0)}`,
  );
  step(120);
}

/* ---------- First crossing at exactly 50 m ---------- */
function scenarioFifty(label: string) {
  log.push(`=== Scenario: first crossing at 50 m (${label}) ===`);
  engine.startRun();
  const cr0 = engine.crossings[0];
  log.push(`  crossing.s=${cr0?.s} -> run distance ${(cr0.s - 14).toFixed(1)} m; speed at start=${engine.speed.toFixed(2)}`);
  const p = engine.player;
  let frames = 0;
  let placedAt = -1;
  let warnAt = -1;
  let armsDownAt = -1;
  let headCenterAt = -1;
  let arrivedAt = -1;
  let coverAtArrival = false;
  let hAtArrival = 0;
  let tailClearAt = -1;
  while (engine.phase === "playing" && frames < 60 * 30) {
    // isolate: keep only crossing ramps
    if (engine.obstacles.some((o) => o.kind !== "ramp")) engine.obstacles = engine.obstacles.filter((o) => o.kind === "ramp");
    if (engine.movers.length) engine.movers = [];
    step(1);
    frames++;
    const cr = engine.crossings[0];
    const t = engine.runTime;
    if (cr.placed && placedAt < 0) placedAt = t;
    if (cr.placed && p.targetLane !== cr.rampLanes[0]) p.targetLane = cr.rampLanes[0];
    if (cr.state === "warning" && warnAt < 0) warnAt = t;
    if (cr.armT >= 1 && armsDownAt < 0) armsDownAt = t;
    const tr = cr.train;
    if (tr && headCenterAt < 0 && ((tr.dir > 0 && tr.head >= 0) || (tr.dir < 0 && tr.head <= 0))) headCenterAt = t;
    if (arrivedAt < 0 && engine.distance >= cr.s) {
      arrivedAt = t;
      coverAtArrival = !!tr && trainCovers(tr, 0);
      hAtArrival = p.h;
    }
    if (tr && tailClearAt < 0 && headCenterAt >= 0 && !trainCovers(tr, 0)) tailClearAt = t;
    if (engine.runDistance > 75) break;
  }
  log.push(
    `  runDist@rails=${(engine.crossings[0].s - 14).toFixed(1)}m placed@${placedAt.toFixed(2)}s bells@${warnAt.toFixed(2)}s armsDown@${armsDownAt.toFixed(2)}s headCenter@${headCenterAt.toFixed(2)}s pigeonArrives@${arrivedAt.toFixed(2)}s (h=${hAtArrival.toFixed(2)}, trainCovering=${coverAtArrival}) tailClear@${tailClearAt.toFixed(2)}s phase=${engine.phase} cause=${engine.crashCause}`,
  );
  // finish this run so the next scenario can start fresh
  (engine as unknown as { crash: (c: string) => void }).crash("obstacle");
  step(120);
}

/* ---------- New features ---------- */
function scenarioFeatures() {
  log.push("=== Scenario: tricks / puddles / pedestrians / roadworks ===");
  engine.startRun();
  const e = engine as unknown as {
    nextObstacleS: number; nextRoadworkS: number; nextCrossingS: number; addPuddle: (s: number, l: number) => void;
    newMover: (k: string, s: number, l: number, lat: number) => any; spawnRoadworks: (x: number, t: number) => number; spawnPedestrians: (x: number, t: number) => number;
  };
  e.nextObstacleS = 1e9; e.nextRoadworkS = 1e9; e.nextCrossingS = 1e9;
  engine.obstacles = []; engine.breads = []; engine.movers = []; engine.crossings = []; engine.trains = [];
  const p = engine.player;
  // wait to get rolling
  step(90);
  // 1) each trick input in the air
  const inputs: [string, string][] = [["tap", "kickflip/heelflip"], ["down", "shuvit"], ["left2", "spinL"], ["up", "method"], ["double", "impossible"], ["holdStart", "indy"]];
  const landed: string[] = [];
  const popups = new Set<string>();
  const unsub = useUI.subscribe((st, prev) => { if (st.popups.length > prev.popups.length) popups.add(st.popups[st.popups.length - 1].text.split(" +")[0]); });
  for (const [inp] of inputs) {
    while (!p.grounded) step(1);
    engine.input("tap"); // ollie
    step(6);
    if (inp === "left2") {
      engine.input("left");
      step(3);
      engine.input("left");
    } else engine.input(inp as any);
    let f = 0;
    while (!p.grounded && f++ < 120) { step(1); if (inp === "holdStart" && f === 30) engine.input("holdEnd"); }
    landed.push(`${inp}:${p.trick ? "unfinished" : "ok"}`);
    step(20);
  }
  unsub();
  log.push(`  trick inputs -> ${landed.join(" ")} | popups seen: ${[...popups].join(", ")}`);
  // 2) big-air tricks off a ramp
  const d0 = engine.distance;
  (engine as unknown as { addObstacle: (k: string, s: number, l: number, f?: boolean) => void }).addObstacle("ramp", d0 + 12, p.targetLane, true);
  let big = false; let wingflapDone = false; let coo = false; let maxAir = 0; let fired = "";
  const pops2 = new Set<string>();
  const unsub2 = useUI.subscribe((st, prev) => { if (st.popups.length > prev.popups.length) pops2.add(st.popups[st.popups.length - 1].text.split(" +")[0]); });
  for (let f = 0; f < 600; f++) {
    step(1);
    if (p.bigAir && !p.grounded) { big = true; maxAir = Math.max(maxAir, p.airT); }
    if (big && !p.grounded && p.airT > 0.15 && !wingflapDone) { engine.input("tap"); wingflapDone = true; fired += `tap@${p.airT.toFixed(2)}(trick=${p.trick?.kind}) `; }
    if (big && !p.grounded && wingflapDone && !p.trick && !coo && p.airT > 0.75) { engine.input("right"); step(2); engine.input("right"); coo = true; fired += `right×2@${p.airT.toFixed(2)}(trick=${p.trick?.kind}) `; }
    if (big && p.grounded && wingflapDone) break;
  }
  unsub2();
  log.push(`  big air -> launched=${big} maxAir=${maxAir.toFixed(2)} fired=[${fired}] popups: ${[...pops2].join(", ")} | all popups so far: ${[...new Set(allPopups)].join(", ")}`);
  // 3) puddle: must not crash, should splash
  const before = engine.particles.length;
  e.addPuddle(engine.distance + 6, p.targetLane);
  let splashed = false;
  for (let f = 0; f < 90; f++) { step(1); if (engine.particles.some((pt) => pt.b > 0.9 && pt.r < 0.6)) splashed = true; }
  log.push(`  puddle -> phase=${engine.phase} splashed=${splashed} wet=${engine.wet.toFixed(2)} (particles before=${before})`);
  // 4) roadworks: check lane blocked + sign; then jump over the fence? (fence hit 0.7 => jumpable)
  const rwLen = e.spawnRoadworks(engine.distance + 15, 0.2);
  const rwLane = engine.obstacles.find((o) => o.kind === "fence")!.lane;
  const kinds = engine.obstacles.filter((o) => o.s > engine.distance).map((o) => o.kind);
  log.push(`  roadworks -> len=${rwLen.toFixed(1)} lane=${rwLane} kinds=${[...new Set(kinds)].join(",")}`);
  // steer away from the closed lane
  p.targetLane = [0, 1, 2].find((l) => l !== rwLane)!;
  for (let f = 0; f < 60 * 6; f++) { step(1); if (engine.distance > engine.obstacles[engine.obstacles.length - 1].s + 2) break; }
  log.push(`  passed roadworks in other lane -> phase=${engine.phase}`);
  // 5) pedestrian hit
  const m = e.newMover("pedestrian", engine.distance + 4, -1, p.lat);
  m.phase = "wait"; m.delay = 99; m.speed = 0;
  engine.movers.push(m);
  let f2 = 0;
  while (engine.phase === "playing" && f2++ < 120) step(1);
  log.push(`  pedestrian hit -> phase=${engine.phase} cause=${engine.crashCause} after ${(f2 / 60).toFixed(2)}s`);
  step(120);
}

/* ---------- Ragdoll & paragliding ---------- */
function scenarioRagdoll() {
  log.push("=== Scenario: ragdoll crash ===");
  engine.startRun();
  const e = engine as unknown as { nextObstacleS: number; nextRoadworkS: number; nextCrossingS: number; nextGapS: number; addObstacle: (k: string, s: number, l: number, f?: boolean) => void };
  e.nextObstacleS = 1e9; e.nextRoadworkS = 1e9; e.nextCrossingS = 1e9; e.nextGapS = 1e9;
  engine.obstacles = []; engine.breads = []; engine.movers = []; engine.crossings = []; engine.trains = []; engine.gaps = [];
  step(120);
  const p = engine.player;
  e.addObstacle("car", engine.distance + 5, p.targetLane, true);
  let f = 0;
  while (engine.phase === "playing" && f++ < 200) step(1);
  const v0 = engine.crashSpeed;
  const b = p.body!;
  const launch = `vs=${b.vs.toFixed(1)} vh=${b.vh.toFixed(1)} vlat=${b.vlat.toFixed(1)} spin=${b.wz.toFixed(1)}`;
  let maxH = 0; let bounces = 0; let traveled = 0; let restAt = -1; let boardDist = 0;
  const s0 = b.s;
  for (let i = 0; i < 60 * 5; i++) {
    step(1);
    maxH = Math.max(maxH, b.h);
    bounces = b.bounces;
    traveled = b.s - s0;
    if (b.rest && restAt < 0) restAt = engine.crashT;
    if (p.board) boardDist = p.board.s - s0;
  }
  log.push(`  crash at speed ${v0.toFixed(1)} -> body launch [${launch}] maxH=${maxH.toFixed(2)} bounces=${bounces} slid=${traveled.toFixed(1)}u restAt=${restAt.toFixed(2)}s boardAhead=${boardDist.toFixed(1)}u phase=${engine.phase} slowMo=${engine.slowMo.toFixed(2)}`);
  step(120);
}

function descentReport() {
  log.push("=== Descents ===");
  track.reset();
  track.ensure(1500);
  let inDesc = false; let start = 0; let maxG = 0; const list: string[] = [];
  for (let s = 0; s < 1500; s += 1) {
    const c = track.sample(s);
    if (c.g < -0.05 && !inDesc) { inDesc = true; start = s; maxG = 0; }
    if (inDesc) maxG = Math.min(maxG, c.g);
    if (c.g >= -0.05 && inDesc) { inDesc = false; const y0 = track.sample(start).y; const y1 = track.sample(s).y; list.push(`${start}..${s} (${s - start}u, ${(maxG * 100).toFixed(0)}%, drop ${(y0 - y1).toFixed(1)})`); }
  }
  log.push(`  ${list.length} descents in 1500u: ${list.join(" | ")}`);
}


/* ---------- Long rails ---------- */
function scenarioLongRail(L: number, variant: number) {
  log.push(`=== Scenario: rail L=${L} variant=${variant} ===`);
  engine.startRun();
  const e = engine as unknown as { nextObstacleS: number; nextRoadworkS: number; nextCrossingS: number; nextOverpassS: number; nextNosS: number; nextIntersectionS: number; addObstacle: (k: string, s: number, l: number, f?: boolean, half?: number, v?: number) => void };
  e.nextObstacleS = 1e9; e.nextRoadworkS = 1e9; e.nextCrossingS = 1e9; e.nextOverpassS = 1e9; e.nextNosS = 1e9; e.nextIntersectionS = 1e9;
  engine.obstacles = []; engine.breads = []; engine.movers = []; engine.crossings = []; engine.trains = []; engine.intersections = []; engine.crossCars = [];
  step(120);
  const p = engine.player;
  const cx = engine.distance + 10 + L / 2;
  e.addObstacle("rail", cx, p.targetLane, true, L / 2, variant);
  const rail = engine.obstacles[0];
  let grindT = 0; let maxH = 0; let minH = 99; let started = false; let ended = false; let jumped = false;
  for (let f = 0; f < 60 * 12; f++) {
    step(1);
    const relStart = rail.s - L / 2 - engine.distance;
    if (!jumped && relStart < engine.speed * 0.08 + 0.3 && relStart > 0 && p.grounded) { engine.input("up"); jumped = true; }
    if (p.grinding) { started = true; grindT += 1 / 60; maxH = Math.max(maxH, p.h); minH = Math.min(minH, p.h); }
    if (started && !p.grinding) { ended = true; }
    if (ended && p.grounded) break;
    if (engine.phase !== "playing") break;
  }
  log.push(`  grind: started=${started} time=${grindT.toFixed(2)}s expected≈${(L / engine.speed).toFixed(2)}s heights=[${minH.toFixed(2)}, ${maxH.toFixed(2)}] phase=${engine.phase} score=${engine.trickScore}`);
  (engine as unknown as { crash: (c: string) => void }).crash("obstacle");
  step(150);
}

/* ---------- Air lane change: smooth, completes within the jump, no overshoot ---------- */
function scenarioAirLane() {
  log.push("=== Scenario: air lane change ===");
  engine.startRun();
  const e = engine as unknown as { nextObstacleS: number; nextRoadworkS: number; nextCrossingS: number; nextOverpassS: number; nextNosS: number; nextIntersectionS: number };
  e.nextObstacleS = 1e9; e.nextRoadworkS = 1e9; e.nextCrossingS = 1e9; e.nextOverpassS = 1e9; e.nextNosS = 1e9; e.nextIntersectionS = 1e9;
  engine.obstacles = []; engine.breads = []; engine.movers = []; engine.crossings = []; engine.trains = []; engine.intersections = []; engine.crossCars = [];
  step(150);
  const p = engine.player;
  engine.input("up");
  step(5);
  engine.input("right");
  let minCarve = 0; let maxTwist = 0; let landedAt = -1; let reachedAt = -1; let f = 0; let spun = false; let maxOver = 0; let minSteer = 0;
  while (f++ < 120) {
    step(1);
    maxOver = Math.max(maxOver, p.lat - 2.4);
    minCarve = Math.min(minCarve, p.carve);
    maxTwist = Math.max(maxTwist, p.boardTwist);
    minSteer = Math.min(minSteer, p.steer);
    if (p.trick && (p.trick.kind === "spinL" || p.trick.kind === "spinR")) spun = true;
    if (reachedAt < 0 && Math.abs(p.lat - 2.4) < 0.05) reachedAt = f / 60;
    if (landedAt < 0 && p.grounded && f > 5) landedAt = f / 60;
  }
  log.push(`  lane reached at ${reachedAt.toFixed(2)}s, landed at ${landedAt.toFixed(2)}s, overshoot=${maxOver.toFixed(3)} peakLean=${(-minCarve * 180 / Math.PI).toFixed(0)}° peakSteer=${(-minSteer * 180 / Math.PI).toFixed(0)}° spinTriggered=${spun} finalLat=${p.lat.toFixed(2)} steerNow=${p.steer.toFixed(3)}`);
  engine.input("up"); step(5); engine.input("right");
  step(2);
  const edgeSpin = !!p.trick && p.trick.kind === "spinR";
  while (!p.grounded) step(1);
  step(10);
  engine.input("up"); step(5); engine.input("left"); step(3); engine.input("left");
  step(2);
  const dblSpin = !!p.trick && p.trick.kind === "spinL";
  log.push(`  edgeSwipeSpin=${edgeSpin} doubleSwipeSpin=${dblSpin} laneAfter=${p.targetLane}`);
  (engine as unknown as { crash: (c: string) => void }).crash("obstacle");
  step(150);
}

/* ---------- Lean / yaw / truck direction must all agree (turn right => lean right, nose right, front wheels right) ---------- */
function scenarioLeanDirection() {
  log.push("=== Scenario: lean direction ===");
  engine.startRun();
  const e = engine as unknown as { nextObstacleS: number; nextRoadworkS: number; nextCrossingS: number; nextOverpassS: number; nextNosS: number; nextIntersectionS: number };
  e.nextObstacleS = 1e9; e.nextRoadworkS = 1e9; e.nextCrossingS = 1e9; e.nextOverpassS = 1e9; e.nextNosS = 1e9; e.nextIntersectionS = 1e9;
  engine.obstacles = []; engine.breads = []; engine.movers = []; engine.crossings = []; engine.trains = []; engine.intersections = []; engine.crossCars = [];
  step(150);
  const p = engine.player;
  for (const dir of ["right", "left"] as const) {
    let maxRoll = 0; let minRoll = 0; let maxSteer = 0; let minSteer = 0; let maxCarve = 0; let minCarve = 0;
    engine.input(dir);
    for (let f = 0; f < 60; f++) {
      step(1);
      maxRoll = Math.max(maxRoll, p.roll); minRoll = Math.min(minRoll, p.roll);
      maxSteer = Math.max(maxSteer, p.steer); minSteer = Math.min(minSteer, p.steer);
      maxCarve = Math.max(maxCarve, p.carve); minCarve = Math.min(minCarve, p.carve);
    }
    const sign = dir === "right" ? 1 : -1;
    // right: roll>0 (top toward +z), steer<0 (nose toward +z), carve<0 (trucks: front yaw negative => +z)
    const rollOk = sign > 0 ? maxRoll > 0.2 && minRoll > -0.05 : minRoll < -0.2 && maxRoll < 0.05;
    const steerOk = sign > 0 ? minSteer < -0.05 && maxSteer < 0.05 : maxSteer > 0.05 && minSteer > -0.05;
    const carveOk = sign > 0 ? minCarve < -0.2 && maxCarve < 0.05 : maxCarve > 0.2 && minCarve > -0.05;
    log.push(`  ${dir}: roll[${minRoll.toFixed(2)}, ${maxRoll.toFixed(2)}] steer[${minSteer.toFixed(2)}, ${maxSteer.toFixed(2)}] carve[${minCarve.toFixed(2)}, ${maxCarve.toFixed(2)}] -> leanIntoTurn=${rollOk} noseIntoTurn=${steerOk} trucksIntoTurn=${carveOk} settled(lat=${p.lat.toFixed(2)}, roll=${p.roll.toFixed(3)}, steer=${p.steer.toFixed(3)})`);
  }
  (engine as unknown as { crash: (c: string) => void }).crash("obstacle");
  step(150);
}

/* ---------- S-cycle, NOS, speed modes, steering ---------- */
function scenarioCycleNosSpeed() {
  log.push("=== Scenario: S-cycle / NOS / speed / steering ===");
  engine.startRun();
  const e = engine as unknown as { nextObstacleS: number; nextRoadworkS: number; nextCrossingS: number; nextOverpassS: number; nextNosS: number; nextIntersectionS: number };
  e.nextObstacleS = 1e9; e.nextRoadworkS = 1e9; e.nextCrossingS = 1e9; e.nextOverpassS = 1e9; e.nextNosS = 1e9; e.nextIntersectionS = 1e9;
  engine.obstacles = []; engine.breads = []; engine.movers = []; engine.crossings = []; engine.trains = []; engine.intersections = []; engine.crossCars = [];
  step(150);
  const p = engine.player;
  // S-cycle: press S repeatedly; collect the sequence of tricks started
  const seq: string[] = [];
  let last = "";
  for (let press = 0; press < 12; press++) {
    engine.input("cycle");
    let f = 0;
    while (f++ < 90) {
      step(1);
      if (p.trick && p.trick.kind !== last) { seq.push(p.trick.kind); last = p.trick.kind; }
      if (!p.trick && p.grounded && f > 5) break;
    }
    last = "";
    step(20);
  }
  log.push(`  S sequence: ${seq.join(" → ")}`);
  const on = useUI.getState().tricksOn;
  const expected = Object.keys(on).filter((k) => (on as Record<string, boolean>)[k] && k !== "wingflap" && k !== "coo540");
  log.push(`  enabled (non-ramp): ${expected.join(", ")} | covered: ${expected.filter((k) => seq.includes(k)).length}/${expected.length}`);
  // NOS: fill via addNos, fire, check speed multiplier
  const base = engine.speed;
  engine.addNos(100);
  engine.input("nos");
  let peak = 0; let f2 = 0;
  while (f2++ < 200) { step(1); peak = Math.max(peak, engine.speed); if (engine.nosT <= 0 && f2 > 30) break; }
  log.push(`  NOS: base=${base.toFixed(1)} peak=${peak.toFixed(1)} (x${(peak / base).toFixed(2)}) ended after ${(f2 / 60).toFixed(2)}s nos=${engine.nos}`);
  // speed modes: only the skate speed changes; world time (chicken hops etc.) must not
  for (const m of [1, 2, 3] as const) {
    useUI.getState().setSpeedMode(m);
    const t0 = engine.time;
    step(180);
    log.push(`  speedMode ${m}x -> skate speed ${engine.speed.toFixed(1)} (target ${engine.targetSpeed().toFixed(1)}), world time advanced ${(engine.time - t0).toFixed(2)}s in 3s of frames`);
  }
  useUI.getState().setSpeedMode(1);
  // steering: lane change should yaw the rig toward +z (negative steer) then return to 0
  engine.input("right");
  let minSteer = 0; let f3 = 0;
  while (f3++ < 60) { step(1); minSteer = Math.min(minSteer, p.steer); }
  log.push(`  steering: peak yaw ${(minSteer * 180 / Math.PI).toFixed(0)}° toward the new lane, settled steer=${p.steer.toFixed(3)} lat=${p.lat.toFixed(2)}`);
  (engine as unknown as { crash: (c: string) => void }).crash("obstacle");
  step(150);
}

function scenarioFiftyAtSpeed(m: 1 | 2 | 3) {
  useUI.getState().setSpeedMode(m);
  scenarioFifty(`skate speed ${m}x`);
  useUI.getState().setSpeedMode(1);
}


/* ---------- NEW turning mode (wheel steering) ---------- */
type AnyEngine = { nextObstacleS: number; nextRoadworkS: number; nextCrossingS: number; nextOverpassS: number; nextNosS: number; nextIntersectionS: number; addObstacle: (k: string, s: number, l: number, f?: boolean, half?: number, v?: number) => void };
function quiet() {
  const e = engine as unknown as AnyEngine;
  e.nextObstacleS = 1e9; e.nextRoadworkS = 1e9; e.nextCrossingS = 1e9; e.nextOverpassS = 1e9; e.nextNosS = 1e9; e.nextIntersectionS = 1e9;
  engine.obstacles = []; engine.breads = []; engine.movers = []; engine.crossings = []; engine.trains = []; engine.intersections = []; engine.crossCars = [];
}
const DEG = 180 / Math.PI;

function scenarioTurnNew(mult: 1 | 2 | 3, dir: "right" | "left") {
  useUI.getState().setTurnMode("new");
  useUI.getState().setSpeedMode(mult);
  engine.startRun();
  quiet();
  step(60 * 5); // reach cruising speed
  const p = engine.player;
  const sgn = dir === "right" ? 1 : -1;
  const target = LANE_LAT[p.targetLane + sgn];
  const from = p.lat;
  const fwd = engine.speed;
  engine.input(dir);
  let settleAt = -1; let over = 0; let pkHeading = 0; let pkFront = 0; let pkRoll = 0; let maxRatioErr = 0;
  let integ = 0; let wobble = 0; let signsOk = true; let steerSeen = 0; let frames = 0; let lastOutside = 0;
  for (let f = 0; f < 90; f++) {
    const lat0 = p.lat;
    step(1); frames++;
    const T = engine.turn;
    integ += Math.sin(T.heading) * Math.max(engine.speed, 4.5) * (1 / 60);
    pkHeading = Math.max(pkHeading, Math.abs(T.heading)); pkFront = Math.max(pkFront, Math.abs(T.sF)); pkRoll = Math.max(pkRoll, Math.abs(p.roll));
    maxRatioErr = Math.max(maxRatioErr, Math.abs(p.truckR + 0.85 * p.truckF));
    over = Math.max(over, sgn * (p.lat - target));
    steerSeen = Math.max(steerSeen, Math.abs(p.steer));
    // direction agreement (only while clearly turning)
    if (Math.abs(T.lean) > 0.25 && Math.abs(T.heading) > 0.05 && Math.sign(T.lean) === sgn) {
      if (!(Math.sign(p.roll) === sgn && Math.sign(p.steer) === -sgn && Math.sign(p.truckF) === -sgn && Math.sign(p.truckR) === sgn)) signsOk = false;
    }
    const t = (f + 1) / 60;
    if (Math.abs(p.lat - target) >= 0.08) lastOutside = t;
    if (t > lastOutside + 0.25) wobble = Math.max(wobble, Math.abs(p.lat - lat0) * 60);
  }
  settleAt = lastOutside;
  const dLat = p.lat - from;
  log.push(
    `  NEW ${dir} @${mult}x fwd=${fwd.toFixed(1)}: settle=${settleAt.toFixed(2)}s over=${(over * 100).toFixed(1)}cm peakHeading=${(pkHeading * DEG).toFixed(0)}° peakFrontTruck=${(pkFront * DEG).toFixed(1)}° peakRoll=${(pkRoll * DEG).toFixed(0)}° ` +
      `rear=-0.85*front(err ${maxRatioErr.toExponential(0)}) signsOk=${signsOk} | lateral from heading: Σsin(h)·v·dt=${integ.toFixed(2)} vs Δlat=${dLat.toFixed(2)} | wobble=${wobble.toFixed(3)} settled(steer=${p.steer.toFixed(3)} roll=${p.roll.toFixed(3)} truckF=${p.truckF.toFixed(3)})`,
  );
  (engine as unknown as { crash: (c: string) => void }).crash("obstacle");
  step(150);
  useUI.getState().setSpeedMode(1);
}

function scenarioTurnNewAir() {
  useUI.getState().setTurnMode("new");
  engine.startRun();
  quiet();
  step(60 * 5);
  const p = engine.player;
  engine.input("up"); // ollie
  step(4);
  engine.input("right");
  let pkTruckAir = 0; let reached = -1; let landed = -1; let f = 0; let gripSlow = true;
  while (f++ < 150) {
    step(1);
    if (!p.grounded) pkTruckAir = Math.max(pkTruckAir, Math.abs(engine.turn.sF));
    if (reached < 0 && Math.abs(p.lat - 2.4) < 0.08) reached = f / 60;
    if (landed < 0 && p.grounded && f > 5) landed = f / 60;
  }
  // air authority is lower than ground authority (steerMax 0.48 vs 0.65, grip 0.85): air takes longer than on the ground
  gripSlow = reached > 0.42;
  log.push(`  NEW air lane change: peakFrontTruckInAir=${(pkTruckAir * DEG).toFixed(1)}° (max ${(0.48 * DEG).toFixed(1)}°) laneReached=${reached.toFixed(2)}s landed=${landed.toFixed(2)}s looserThanGround=${gripSlow} finalLat=${p.lat.toFixed(2)} steer=${p.steer.toFixed(3)}`);
  (engine as unknown as { crash: (c: string) => void }).crash("obstacle");
  step(150);
}

function scenarioTurnNewGrind() {
  useUI.getState().setTurnMode("new");
  engine.startRun();
  quiet();
  step(60 * 4);
  const p = engine.player;
  const e = engine as unknown as AnyEngine;
  e.addObstacle("rail", engine.distance + 12, p.targetLane, true, 8, 0);
  const rail = engine.obstacles[0];
  let jumped = false; let started = false; let latOnRail = 0; let laneBefore = p.targetLane; let swiped = false; let maxHead = 0; let maxLatMove = 0; let latRef = 0;
  for (let f = 0; f < 60 * 8; f++) {
    step(1);
    const rel = rail.s - 8 - engine.distance;
    if (!jumped && rel < engine.speed * 0.08 + 0.3 && rel > 0 && p.grounded) { engine.input("up"); jumped = true; }
    if (p.grinding && !started) { started = true; latRef = p.lat; laneBefore = p.targetLane; }
    if (p.grinding && started && !swiped && f % 10 === 0) { engine.input("right"); engine.input("left"); swiped = true; }
    if (p.grinding) { maxHead = Math.max(maxHead, Math.abs(engine.turn.heading)); maxLatMove = Math.max(maxLatMove, Math.abs(p.lat - latRef)); latOnRail = p.lat; }
    if (started && !p.grinding) break;
  }
  log.push(`  NEW grind lock: grinding=${started} swipesIgnored=${p.targetLane === laneBefore} maxLateralMoveOnRail=${maxLatMove.toFixed(3)} maxHeading=${(maxHead * DEG).toFixed(2)}° latOnRail=${latOnRail.toFixed(2)}`);
  (engine as unknown as { crash: (c: string) => void }).crash("obstacle");
  step(150);
}

function withMode<T>(mode: "old" | "new", fn: () => T): T {
  useUI.getState().setTurnMode(mode);
  log.push(`--- turn mode: ${mode} ---`);
  return fn();
}


/* ---------- SHIFT sprint (no NOS): faster kicks, real speed-up, fades back to normal ---------- */
function scenarioSprint() {
  log.push("=== Scenario: SHIFT sprint (NOS not ready) ===");
  engine.startRun();
  quiet();
  const p = engine.player;
  step(60 * 6.6); // past the "early" phase so normal kicks are the relaxed maintenance kind
  let minG = 0;
  const window = (secs: number) => {
    let cycles = 0; let prev = p.push; let sum = 0; let n = 0; let peak = 0; let maxSprint = 0; let minDur = 9; let curStart = -1; let tsum = 0;
    for (let f = 0; f < secs * 60; f++) {
      step(1);
      minG = Math.min(minG, engine.center.g);
      if (prev < 0 && p.push >= 0) { cycles++; curStart = f; }
      if (prev >= 0 && p.push < 0 && curStart >= 0) { minDur = Math.min(minDur, (f - curStart) / 60); curStart = -1; }
      prev = p.push; sum += engine.speed; n++; peak = Math.max(peak, engine.speed); maxSprint = Math.max(maxSprint, engine.sprint);
      // the speed the board is heading for WITHOUT any sprint (cruise curve + downhill bonus)
      tsum += engine.targetSpeed() + Math.max(0, -engine.center.g) * 9 * engine.speedMult;
    }
    return { cycles, avg: sum / n, peak, maxSprint, minDur, target: tsum / n };
  };
  const nosBefore = engine.nos;
  const base = window(3);
  log.push(`  baseline (3 s): kicks=${base.cycles} avgSpeed=${base.avg.toFixed(2)} nos=${nosBefore} (not ready) sprint=${engine.sprint.toFixed(2)}`);
  engine.input("boost");
  const t0 = engine.time;
  const rows: string[] = [];
  const cyclesPerWindow: number[] = [];
  const speeds: number[] = [];
  const intens: number[] = [];
  for (let w = 0; w < 9; w++) {
    const r = window(0.75);
    cyclesPerWindow.push(r.cycles); speeds.push(r.avg); intens.push(engine.sprint);
    rows.push(`t+${((w + 1) * 0.75).toFixed(2)}s sprint=${engine.sprint.toFixed(2)} kicks=${r.cycles} speed=${r.avg.toFixed(1)}`);
    if (w === 0) engine.input("boost"); // pressing again during the cooldown must be ignored
  }
  log.push("  after SHIFT: " + rows.join(" | "));
  const peakSpeed = Math.max(...speeds);
  const peakKicks = Math.max(...cyclesPerWindow);
  const late = window(2.5);
  log.push(
    `  peak speed x${(peakSpeed / base.avg).toFixed(2)} of baseline, peak kick rate ${(peakKicks / 0.75).toFixed(1)}/s vs ${(base.cycles / 3).toFixed(1)}/s baseline (${(peakKicks / 0.75 / Math.max(0.05, base.cycles / 3)).toFixed(1)}x), ` +
      `fastest kick cycle ${(0.55 / 2.5).toFixed(2)}–${(0.95 / 2.5).toFixed(2)}s | faded: sprint=${engine.sprint.toFixed(2)} sprintTimer=${engine.sprintTimer.toFixed(2)} speed=${late.avg.toFixed(2)} (its own no-sprint target ${late.target.toFixed(2)}, deviation ${(Math.abs(late.avg / late.target - 1) * 100).toFixed(0)}%) kicks(2.5s)=${late.cycles} | slope check minG=${minG.toFixed(2)} | cooldown active=${engine.sprintTimer > 0}`,
  );
  // NOS ready: SHIFT must fire NOS, not the sprint
  engine.addNos(100);
  const sprintBefore = engine.sprintTimer;
  engine.input("boost");
  log.push(`  NOS charged + SHIFT -> nosT=${engine.nosT.toFixed(2)} (NOS fired=${engine.nosT > 0}) sprintStarted=${engine.sprintTimer > sprintBefore}`);
  (engine as unknown as { crash: (c: string) => void }).crash("obstacle");
  step(150);
}

trackReport();
descentReport();
// Crossing scenarios require a city route; Haruna deliberately has no railway crossings.
useUI.getState().setTrackMode("tokyo");
engine.setTrackMode("tokyo");
withMode("old", () => {
  scenarioSprint();
  scenarioLeanDirection();
  scenarioCycleNosSpeed();
  scenarioFiftyAtSpeed(2);
  scenarioFiftyAtSpeed(3);
  scenarioAirLane();
  scenarioLongRail(7, 0);
  scenarioLongRail(18, 0);
  scenarioLongRail(24, 1);
  scenarioRagdoll();
  scenarioFeatures();
  scenarioFifty("cold start from menu, speed 0");
  scenarioFifty("retry");
  scenarioCrossing(true);
  step(60);
  scenarioCrossing(false);
  step(60);
  scenarioIdle();
  step(60);
  scenarioSmart(150);
  step(60);
  scenarioScripted();
  step(60);
  scenarioSmart(200);
});

withMode("new", () => {
  scenarioSprint();
  scenarioSprint();
  for (const m of [1, 2, 3] as const) for (const d of ["right", "left"] as const) scenarioTurnNew(m, d);
  scenarioTurnNewAir();
  scenarioTurnNewGrind();
  scenarioAirLane();
  scenarioLongRail(18, 0);
  scenarioLongRail(24, 1);
  scenarioFifty("NEW turn mode, cold start");
  scenarioFiftyAtSpeed(3);
  scenarioCrossing(true);
  step(60);
  scenarioCrossing(false);
  step(60);
  scenarioRagdoll();
  scenarioFeatures();
  scenarioSmart(150);
  step(60);
  scenarioSmart(200);
  step(60);
  scenarioSmart(200);
});

console.log(log.join("\n"));
