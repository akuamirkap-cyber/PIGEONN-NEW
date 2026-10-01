/* Harness fitur baru:
 *   1. pengendara MOTOR dari arah depan (dengan lompatan bersih di atasnya),
 *   2. asap knalpot saat mobil/motor jalan,
 *   3. kakek/nenek menyeberang pakai tongkat (wandelstok),
 *   4. warna ban skateboard (default hitam, pilihan merah/hijau/kuning/biru).
 *
 * Jalankan:
 *   npx esbuild test/newFeatures.ts --bundle --platform=node --outfile=/tmp/newFeatures.cjs && node /tmp/newFeatures.cjs
 */
import { engine, MOTOR_CLEAR_H, ONCOMING_MOTORCYCLE_SPEED_MULT, type Mover } from "../src/game/engine";
import { motorcycleParts, caneParts, pedestrianParts, pedestrianTorsoParts, MOTOR_PAINTS, CANE_GRIP_Y } from "../src/game/models";
import { getSkin, SKINS, wheelParts } from "../src/game/skins";
import { useUI, WHEEL_COLORS } from "../src/game/store";

const DT = 1 / 60;
let pass = 0;
let fails = 0;
const log: string[] = [];
function check(name: string, ok: boolean, detail = "") {
  if (ok) pass++;
  else fails++;
  log.push(`${ok ? "PASS " : "FAIL "} ${name}${detail ? ` — ${detail}` : ""}`);
}
const e = engine as unknown as Record<string, any>;
const step = (n: number) => {
  for (let i = 0; i < n; i++) engine.update(DT);
};

/** Matikan spawn acak supaya simulasi bisa dikontrol seperti di test/animalSize.ts */
function quiet() {
  e.nextObstacleS = 1e9;
  e.nextRoadworkS = 1e9;
  e.nextCrossingS = 1e9;
  e.nextOverpassS = 1e9;
  e.nextNosS = 1e9;
  e.nextIntersectionS = 1e9;
  engine.obstacles = [];
  engine.breads = [];
  engine.movers = [];
  engine.crossings = [];
  engine.trains = [];
  engine.intersections = [];
  engine.crossCars = [];
  engine.particles = [];
}

/* ---------- 1. Model motor & tongkat ---------- */
log.push("=== Model: motor + tongkat lansia ===");
const bike0 = motorcycleParts(0);
check("motor punya bodi + roda + pengendara", bike0.length > 18, `${bike0.length} part`);
check("ada helm/warna cat motor", MOTOR_PAINTS.length >= 6, `${MOTOR_PAINTS.length} warna`);
const distinct = new Set([0, 1, 2, 3, 4, 5].map((v) => JSON.stringify(motorcycleParts(v).map((p) => p.color))));
check("6 varian motor berbeda warnanya", distinct.size >= 5, `${distinct.size} varian unik`);
const bikeBottom = Math.min(...bike0.map((p) => p.y - p.h / 2));
const bikeTop = Math.max(...bike0.map((p) => p.y + p.h / 2));
check("ban motor menapak aspal (y = 0)", Math.abs(bikeBottom) < 0.005, `bawah y=${bikeBottom.toFixed(3)}`);
check("tinggi motor+pengendara masuk akal", bikeTop > 1.3 && bikeTop < 1.72, `tinggi ${bikeTop.toFixed(2)} m`);
const cane = caneParts();
check("tongkat lansia punya gagang + batang + karet", cane.length >= 3, `${cane.length} part`);
// rantai tinggi di World.tsx: badan (0.96) + bahu (0.27) + genggaman (CANE_GRIP_Y) + ujung tongkat
const caneBottom = Math.min(...cane.map((p) => p.y - p.h / 2));
const caneTipWorld = 0.96 + 0.27 + CANE_GRIP_Y + caneBottom;
check("ujung tongkat menyentuh aspal (tidak mengambang / terbenam)", Math.abs(caneTipWorld) < 0.08, `ujung di ${caneTipWorld.toFixed(3)} m dari jalan`);

const oldBody = pedestrianParts(0, false, true);
const youngBody = pedestrianParts(0, false, false);
check("lansia beda model dari pejalan biasa", JSON.stringify(oldBody) !== JSON.stringify(youngBody), `${oldBody.length} vs ${youngBody.length} part`);
check("lansia dapat kacamata/rambut putih (part tambahan)", oldBody.length > youngBody.length, `+${oldBody.length - youngBody.length} part`);
const elderTorso = pedestrianTorsoParts(0, true);
const youngTorso = pedestrianTorsoParts(0, false);
check("badan lansia bungkuk ke depan (ada punuk)", elderTorso.length === youngTorso.length + 2 && elderTorso.some((p) => p.x < -0.1), `${elderTorso.length} part, punuk x=${Math.min(...elderTorso.map((p) => p.x))}`);

/* ---------- 2. Warna ban ---------- */
log.push("=== Warna ban: default hitam + pilihan warna ===");
const skin = getSkin(SKINS[0].id);
const autoWheel = wheelParts(skin, "default", "auto").map((p) => p.color);
const blackWheel = wheelParts(skin, "default", "black").map((p) => p.color);
check("pilihan HITAM dipakai apa adanya", blackWheel.includes("#1c1e22"), blackWheel.join(","));
check("AUTO mengikuti warna ban skin", autoWheel.includes(skin.wheels) || autoWheel.includes("#ffe066"), `skin=${skin.wheels}`);
for (const c of WHEEL_COLORS.filter((w) => ["red", "green", "yellow", "blue"].includes(w.id))) {
  check(`ban ${c.label} = ${c.hex}`, wheelParts(skin, "default", c.id).some((p) => p.color === c.hex));
}
check("papan baguette tetap pakai roda mentega", wheelParts(skin, "baguette", "auto").some((p) => p.color === "#ffe066"));
check("warna ban tersimpan di store (default hitam)", useUI.getState().wheelColor === "black", useUI.getState().wheelColor);
useUI.getState().setWheelColor("blue");
check("setWheelColor mengganti pilihan", useUI.getState().wheelColor === "blue");
useUI.getState().setWheelColor("black");

/* ---------- 3. Spawn motor dari arah depan ---------- */
log.push("=== Motor dari arah depan ===");
engine.startRun();
quiet();
let bikes = 0;
let spawned = 0;
for (let i = 0; i < 400; i++) {
  const before = engine.movers.length;
  e.spawnOncoming(engine.distance + 60, 1, 0.6);
  if (engine.movers.length > before) spawned++;
  bikes += engine.movers.filter((m: Mover) => m.kind === "motorcycle").length;
  engine.movers = [];
}
check("lalu lintas datang kadang berupa motor", bikes > 0, `${bikes} motor dari ${spawned} spawn`);

engine.startRun();
quiet();
const v = 4;
e.spawnMotorcycle(engine.distance + 40, 1, v);
const bike: Mover = engine.movers[engine.movers.length - 1];
check("motor dari depan 30% lebih cepat dari baseline", bike.speed >= v * 1.05 * ONCOMING_MOTORCYCLE_SPEED_MULT - 1e-9 && bike.speed <= v * 1.2 * ONCOMING_MOTORCYCLE_SPEED_MULT + 1e-9, `speed=${bike.speed.toFixed(2)} (input ${v})`);
check("motor punya varian 0..5", bike.variant >= 0 && bike.variant <= 5, `variant=${bike.variant}`);
check("motor punya timer asap knalpot", typeof bike.smokeT === "number" && bike.smokeT! >= 0 && bike.smokeT! <= 0.08, `smokeT=${bike.smokeT}`);
const bikeS0 = bike.s;
step(30);
check("motor melaju mendekat (s mengecil)", bike.s < bikeS0 - 1, `Δs=${(bikeS0 - bike.s).toFixed(2)} m dalam 0.5 s`);

/* ---------- 4. Asap knalpot saat jalan ---------- */
log.push("=== Asap knalpot kendaraan yang jalan ===");
engine.startRun();
quiet();
const car = e.newMover("car", engine.distance + 30, 1, 0);
car.speed = 4;
engine.movers.push(car);
step(24); // 0.4 s → beberapa gumpalan asap
const smoke = engine.particles.filter((p) => (p.grow ?? 0) > 1);
check("mobil mengeluarkan asap knalpot", smoke.length >= 3, `${smoke.length} partikel asap`);
check("asap membesar seiring umur (grow > 1)", smoke.every((p) => (p.grow ?? 0) > 1), smoke[0] ? `grow=${smoke[0].grow}` : "-");
check("asap abu-abu & naik pelan", smoke.every((p) => Math.abs(p.r - p.b) < 0.06 && p.vy > 0 && p.vy < 1.6), smoke[0] ? `g=${smoke[0].g.toFixed(2)} vy=${smoke[0].vy.toFixed(2)}` : "-");
const smokeS = smoke.map((p) => p.y);
check("asap keluar di tinggi knalpot (dekat tanah)", smokeS.every((y) => y > -0.2 && y < 1.2), `y=${smokeS[0]?.toFixed(2)}`);

quiet();
e.spawnMotorcycle(engine.distance + 30, 1, 4);
step(24);
const bikeSmoke = engine.particles.filter((p) => (p.grow ?? 0) > 1).length;
check("motor juga mengeluarkan asap knalpot (lebih rapat)", bikeSmoke >= 5, `${bikeSmoke} partikel asap`);

quiet();
e.updateCrossCars?.(0.016); // cross traffic tetap hidup tanpa error
check("cross traffic aman dipanggil tanpa error", true);

/* ---------- 5. Tabrakan motor & lompatan bersih ---------- */
log.push("=== Tabrakan motor vs lompatan bersih ===");
/** Motor diam tepat di depan moncong merpati (window kontak ±(0.62 + PLAYER_HALF)). */
function bikeAhead(ahead: number): Mover {
  const m = e.newMover("motorcycle", engine.distance + ahead, 1, engine.player.lat);
  m.speed = 0;
  engine.movers.push(m);
  return m;
}
engine.startRun();
quiet();
bikeAhead(0.6);
step(1);
check("nabrak motor = tumbang dengan sebab 'motorcycle'", engine.phase !== "playing" && (engine as any).crashCause === "motorcycle", `phase=${engine.phase} cause=${(engine as any).crashCause}`);

engine.startRun();
quiet();
const flying = bikeAhead(6.0);
let passed = false;
for (let i = 0; i < 400 && engine.phase === "playing"; i++) {
  engine.player.h = MOTOR_CLEAR_H + 0.05; // anggap merpati di puncak ollie
  engine.player.vh = 0;
  step(1);
  if (flying.s - engine.distance < -0.5) {
    passed = true;
    break;
  }
}
check(`lompat tinggi (h=${(MOTOR_CLEAR_H + 0.05).toFixed(2)} m) >> motor = lewat bersih`, passed && engine.phase === "playing", `phase=${engine.phase}`);

/* ---------- 6. Kakek/nenek menyeberang ---------- */
log.push("=== Kakek/nenek bertongkat ===");
engine.startRun();
quiet();
for (let i = 0; i < 60; i++) e.spawnPedestrians(engine.distance + 40 + i * 20, 0.6);
const peds: Mover[] = engine.movers.filter((m: Mover) => m.kind === "pedestrian");
const elders = peds.filter((m) => m.elderly);
check("kadang muncul pejalan lansia", elders.length > 0, `${elders.length}/${peds.length} pejalan = lansia`);
check("lansia jalan lebih lambat dari yang muda", elders.every((m) => m.speed >= 0.85 && m.speed <= 1.25) && peds.filter((m) => !m.elderly).every((m) => m.speed >= 1.6), `elder≈${elders[0]?.speed.toFixed(2)} young≈${peds.find((m) => !m.elderly)?.speed.toFixed(2)}`);
check("lansia pakai varian outfit khusus (0..2)", elders.every((m) => m.variant >= 0 && m.variant <= 2), `variant=${elders[0]?.variant}`);
check("lansia tidak lebih dari satu per grup", (() => {
  engine.movers = [];
  for (let i = 0; i < 40; i++) {
    const before = engine.movers.length;
    e.spawnPedestrians(engine.distance + 40, 0.6);
    const grp = engine.movers.slice(before);
    if (grp.filter((m: Mover) => m.elderly).length > 1) return false;
  }
  return true;
})());

console.log(log.join("\n"));
console.log(`\n${fails === 0 ? "SEMUA CEK LOLOS" : "ADA YANG GAGAL"} (${pass} pass, ${fails} fail)`);
if (fails > 0) process.exitCode = 1;
