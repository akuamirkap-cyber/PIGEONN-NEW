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
  check("Subway tunnel is 10x longer (1440m)", tun.endS - tun.startS >= 1440, `Length: ${(tun.endS - tun.startS).toFixed(0)}m`);

  // Verify no crossings or intersections inside subway tunnel
  const crossingsInTunnel = engine.crossings.filter((cr) => cr.s >= tun.startS && cr.s <= tun.endS);
  check("No railroad crossings inside subway tunnel (no cross trains)", crossingsInTunnel.length === 0, `Found: ${crossingsInTunnel.length}`);

  const intersInTunnel = engine.intersections.filter((it) => it.s >= tun.startS && it.s <= tun.endS);
  check("No crossroads / intersections inside subway tunnel", intersInTunnel.length === 0, `Found: ${intersInTunnel.length}`);

  const animalsInTunnel = engine.movers.filter((m) => (m.kind === "chicken" || m.kind === "cat") && m.s >= tun.startS && m.s <= tun.endS);
  check("No chickens or stray cats inside subway tunnel", animalsInTunnel.length === 0, `Found: ${animalsInTunnel.length}`);

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
engine.phase = "playing";
engine.crashT = 0;
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
// Test airborne player above bus is NOT prematurely snapped to roof
engine.player.targetLane = 1;
engine.player.lane = 1;
engine.player.lat = 0;
engine.player.h = 4.2; // High in the air performing freestyle
engine.player.vh = 5.0; // Still rising/in air
engine.player.grounded = false;
engine.player.grinding = false;
engine.player.subwayMover = null;
engine.update(0.02);
check("Airborne player above bus is not force-snapped to roof", !engine.player.subwayMover && engine.player.h > SUBWAY_ROOF_H + 0.5, `Height: ${engine.player.h.toFixed(2)}m, Mover: ${engine.player.subwayMover}`);

// Now test player landing on roof as they descend
engine.player.h = SUBWAY_ROOF_H; // Player touches down on roof
engine.player.vh = 0; // Descended/touchdown
engine.player.grounded = false;

// Update engine - player should start bus surfing upon landing
engine.update(0.02);
check("Player descending onto bus roof engages roof surfing", engine.player.grinding && engine.player.subwayMover === mockTrain, `Grinding: ${engine.player.grinding}`);

// Test jump dismount from roof
engine.jump();
check("Jumping off bus roof performs clean dismount with combo", !engine.player.subwayMover, `Grind cleared: ${!engine.player.subwayMover}`);

// Summary
console.log("\nResults:");
log.forEach((l) => console.log(" ", l));
console.log(`\nTotal: ${pass} passed, ${fail} failed.`);
if (fail > 0) process.exit(1);
