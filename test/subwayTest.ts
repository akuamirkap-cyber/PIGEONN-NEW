/* Test for Shibuya Subway Tunnel, Oncoming Trains, Warning Horn, and Train Roof Surfing.
 * Run via tsx: npx tsx test/subwayTest.ts
 */
import { engine, type SubwayTrain } from "../src/game/engine";
import { useUI } from "../src/game/store";
import { SUBWAY_ROOF_H } from "../src/game/models";

let pass = 0;
let fail = 0;
const log: string[] = [];

function check(name: string, condition: boolean, detail = "") {
  if (condition) pass++;
  else fail++;
  log.push(`${condition ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}

console.log("=== Testing Shibuya Subway & Oncoming Metro Trains ===");

// 1. Initialize Shibuya mode
useUI.getState().setTrackMode("shibuya");
engine.setTrackMode("shibuya");
engine.startRun();

// 2. Advance the world until subway tunnel is completely within chunk generation window
let spawnedTunnel = false;
for (let step = 0; step < 260; step++) {
  engine.update(0.04);
  if (engine.subwayTunnels.length > 0 && engine.distance > 80) {
    spawnedTunnel = true;
    break;
  }
}

check("Subway tunnel is generated in Shibuya mode", spawnedTunnel, `Tunnels: ${engine.subwayTunnels.length}`);

if (engine.subwayTunnels.length > 0) {
  const tun = engine.subwayTunnels[0];
  check("Subway tunnel has valid start and end bounds", tun.endS > tun.startS, `${tun.startS}m -> ${tun.endS}m`);

  // Verify entry and exit portals in decor
  const chunksInTunnel = engine.chunks.filter((c) => c.s0 >= tun.startS && c.s0 < tun.endS);
  const portals = chunksInTunnel.flatMap((c) => c.decor.filter((d) => d.kind === "subway_portal"));
  check("Subway portals are placed for entry/exit", portals.length >= 1, `Found ${portals.length} portals`);

  // Verify tunnel ribs with bright fluorescent lights ("TIDAK GELAP")
  const ribs = chunksInTunnel.flatMap((c) => c.decor.filter((d) => d.kind === "subway_tunnel_rib"));
  check("Subway tunnel ribs with ceiling lights are placed", ribs.length >= 4, `Found ${ribs.length} ribs`);

  // Verify subway track bed & tiled side walls
  const tracks = chunksInTunnel.flatMap((c) => c.decor.filter((d) => d.kind === "subway_track"));
  const walls = chunksInTunnel.flatMap((c) => c.decor.filter((d) => d.kind === "subway_wall"));
  check("Subway track bed and ceramic walls are present", tracks.length >= 4 && walls.length >= 8, `Tracks: ${tracks.length}, Walls: ${walls.length}`);

  // Verify oncoming subway train
  check("Oncoming subway train is spawned", engine.subwayTrains.length > 0, `Trains: ${engine.subwayTrains.length}`);
  if (engine.subwayTrains.length > 0) {
    const st = engine.subwayTrains[0];
    const prevS = st.s;
    engine.update(0.05);
    check("Oncoming train moves in opposing traffic (-s direction)", st.s < prevS, `moved from ${prevS.toFixed(2)} to ${st.s.toFixed(2)}`);

    // Verify ramp for roof surfing
    const rampsInTunnel = engine.obstacles.filter((o) => o.kind === "ramp" && o.s >= tun.startS && o.s <= tun.endS);
    check("Ramps leading onto train/bus roof exist in tunnel", rampsInTunnel.length >= 1, `Found ${rampsInTunnel.length} ramps`);
  }
}

// 3. Test Roof Surfing mechanics: place train directly under player (player is within train length)
const mockTrain: SubwayTrain = {
  id: 8888,
  s: engine.distance - 4, // front cab is at distance - 4, player is at distance (4m into body)
  lane: 1,
  speed: 18,
  nCars: 3,
  line: 0,
  hasRamp: true,
  horned: false,
  passed: false,
  length: 34,
};
engine.subwayTrains.push(mockTrain);
engine.player.targetLane = 1;
engine.player.lane = 1;
engine.player.lat = 0;
engine.player.h = SUBWAY_ROOF_H; // Player lands on roof
engine.player.grounded = false;

// Update engine - player should start train surfing
engine.update(0.02);
check("Player on subway roof engages roof surfing", engine.player.grinding && engine.player.subwayMover === mockTrain, `Grinding: ${engine.player.grinding}`);

// Test jump dismount from roof
engine.jump();
check("Jumping off subway roof performs clean dismount with combo", !engine.player.subwayMover, `Grind cleared: ${!engine.player.subwayMover}`);

// Summary
console.log("\nResults:");
log.forEach((l) => console.log(" ", l));
console.log(`\nTotal: ${pass} passed, ${fail} failed.`);
if (fail > 0) process.exit(1);
