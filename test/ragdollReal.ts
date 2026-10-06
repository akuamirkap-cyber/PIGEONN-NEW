/* Ragdoll realism harness: run a crash several times, verify the body arcs, bounces,
 * keeps tumbling naturally (no instant lock), and always settles to rest. */
import { engine } from "../src/game/engine";

const DT = 1 / 60;
function step(n: number) {
  for (let i = 0; i < n; i++) engine.update(DT);
}

function runOnce(tag: string) {
  engine.startRun();
  const e = engine as unknown as {
    nextObstacleS: number; nextRoadworkS: number; nextCrossingS: number; nextGapS: number;
    addObstacle: (k: string, s: number, l: number, f?: boolean) => void;
  };
  e.nextObstacleS = 1e9; e.nextRoadworkS = 1e9; e.nextCrossingS = 1e9; e.nextGapS = 1e9;
  engine.obstacles = []; engine.breads = []; engine.movers = []; engine.crossings = []; engine.trains = []; engine.gaps = [];
  step(90);
  const p = engine.player;
  e.addObstacle("car", engine.distance + 5, p.targetLane, true);
  let f = 0;
  while (engine.phase === "playing" && f++ < 200) step(1);
  const b = p.body!;
  if (!b) {
    console.log(`${tag}: NO BODY?!`);
    return;
  }
  let maxH = 0;
  let restAt = -1;
  let sumW = 0;
  let frames = 0;
  let stillFramesAfter80pct = 0; // frames the spin is near-zero while NOT resting = stiffness indicator
  const totalRestAt = 6;
  for (let i = 0; i < 60 * totalRestAt; i++) {
    step(1);
    maxH = Math.max(maxH, b.h);
    const w = Math.abs(b.wx) + Math.abs(b.wy) + Math.abs(b.wz);
    if (!b.rest) {
      sumW += w;
      frames++;
    }
    if (engine.crashT > 0.8 && !b.rest && w < 0.05 && Math.abs(b.vs) < 0.1) stillFramesAfter80pct++;
    if (b.rest && restAt < 0) restAt = engine.crashT;
  }
  const avgSpin = frames ? sumW / frames : 0;
  console.log(
    `${tag}: launch vs=${b.vs.toFixed(1)} maxH=${maxH.toFixed(2)} bounces=${b.bounces} ` +
      `avgSpin=${avgSpin.toFixed(2)}rad/s rest=${b.rest ? `@${restAt.toFixed(2)}s` : "NO!"} ` +
      `stillNotRest=${stillFramesAfter80pct} phase=${engine.phase}`,
  );
  if (!b.rest) console.log(`${tag}: FAIL — ragdoll never rested (kaku/nggantung)`);
}

for (let i = 1; i <= 4; i++) runOnce(`run${i}`);
console.log("DONE");
