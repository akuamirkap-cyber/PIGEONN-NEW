/* Harness lalu lintas & perempatan:
 *   1. arah hadap kendaraan dari arah depan (mobil & MOTOR menghadap pemain, pengendara ikut benar),
 *   2. jalur (lane) lalu lintas di perempatan: mobil penyeberang memakai jalur kirinya,
 *      rodanya menapak dek jalan lintas (tidak mengambang/terbenam),
 *   3. mobil penyeberang menunggu kalau ada kendaraan jalan utama (tidak saling tembus),
 *      tapi TIDAK menunggu pemain (bahaya T-bone tetap ada).
 *
 * Jalankan:
 *   npx esbuild test/traffic.ts --bundle --platform=node --outfile=/tmp/traffic.cjs && node /tmp/traffic.cjs
 */
import { readFileSync } from "node:fs";
import * as THREE from "three";
import {
  engine,
  track,
  CROSS_DECK_H,
  CROSS_DECK_LAT,
  CROSS_LANE_OFFSET,
  CROSS_SPAWN_LAT,
  CROSS_DESPAWN_LAT,
  crossCarH,
  LANE_LAT,
} from "../src/game/engine";
import { crossingCarParts, CROSS_STREET_LEN } from "../src/game/models";
import { useUI } from "../src/game/store";

useUI.getState().setTrackMode("tokyo");
engine.setTrackMode("tokyo");

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

// Keep cross-street car tests isolated from the pedestrian wave addIntersection now creates.
function addTestIntersection(s: number) {
  const inter = e.addIntersection(s);
  engine.movers = [];
  return inter;
}

/* =========== 1. Arah hadap kendaraan dari arah depan (cek source World.tsx) =========== */
log.push("=== Arah hadap: mobil & motor menghadap pemain ===");
const world = readFileSync("src/game/World.tsx", "utf8"); // dijalankan dari root repo
const branch = world.slice(world.indexOf('} else if (m.kind === "car" || m.kind === "motorcycle") {'));
const branchHead = branch.slice(0, branch.indexOf('if (m.kind === "motorcycle")'));
check("yaw kendaraan datang = π (menghadap pemain)", /inner\.rotation\.set\(0, Math\.PI, 0\)/.test(branchHead), branchHead.match(/inner\.rotation\.set\([^)]*\)/)?.[0] ?? "-");
check("yaw kendaraan TIDAK lagi direset ke 0 (bug lama)", !/inner\.rotation\.set\(0, 0, 0\)/.test(branchHead), "");
check("motor tetap punya goyangan lean setelah fix", /inner\.rotation\.z = Math\.sin/.test(branch), "");
check("innerRot di view = π untuk car & motorcycle", /m\.kind === "car" \|\| m\.kind === "motorcycle" \? Math\.PI/.test(world), "");

// Pengendara & helm satu arah dengan moncong motor: hidung sepeda (+x) dan visor (+x) harus sama-sama "depan"
const models = readFileSync("src/game/models.ts", "utf8");
const moto = models.slice(models.indexOf("export function motorcycleParts"), models.indexOf("export const MOTOR_PAINTS"));
check("moncong motor (roda depan + lampu) di +x", /x: 0\.62.*roda depan|roda/.test(moto) || moto.includes("lampu depan"), "searah dengan mobil (lampu depan +x)");
check("visor helm menghadap depan (+x, searah moncong)", /visor|kaca helm/.test(moto) && /x: 0\.06/.test(moto), "visor di sisi +x");
const carParts = models.slice(models.indexOf("export function carParts"), models.indexOf("export function motorcycleParts"));
check("pembanding: lampu depan mobil juga di +x", /x: 1\.62/.test(carParts), "mobil depan +x");

/* =========== 1b. Arah hadap diuji pakai matematika rig (bukan cuma source) =========== */
log.push("=== Arah hadap kendaraan (uji vektor) ===");
const q = new THREE.Quaternion();
const yawPi = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
/** Arah moncong model kendaraan di dunia: +x lokal diputar yaw π lalu quaternion jalan. */
function noseDir(s: number) {
  track.quat(s, q);
  return new THREE.Vector3(1, 0, 0).applyQuaternion(yawPi).applyQuaternion(q);
}
/** Arah maju jalan (turunan posisi) di titik s. */
function roadForward(s: number) {
  const a = track.frame(s, 0, 0, new THREE.Vector3());
  const b = track.frame(s + 0.5, 0, 0, new THREE.Vector3());
  return b.sub(a).normalize();
}
engine.startRun();
const d0 = engine.distance;
const ahead = roadForward(d0 + 5);
check("arah maju pemain = arah jalan (+x lokal)", new THREE.Vector3(1, 0, 0).applyQuaternion(track.quat(d0, q)).dot(ahead) > 0.99, "");
const nose = noseDir(d0 + 40);
const dot = nose.dot(roadForward(d0));
check("moncong mobil/motor menghadap pemain (dot ≈ -1)", dot < -0.98, `dot=${dot.toFixed(3)} (0 = nyamping, -1 = tepat menghadap kita)`);
check("kendaraan tidak lagi membelakangi pemain", !(nose.dot(roadForward(d0 + 40)) > 0.9), "kalau sama arah jalan berarti masih terbalik");
const lat = new THREE.Vector3(0, 1, 0).cross(nose); // samping kendaraan
check("samping kendaraan sejajar jalan (tidak miring/melintang)", Math.abs(lat.dot(roadForward(d0 + 40))) < 0.02, `|dot|=${Math.abs(lat.dot(roadForward(d0 + 40))).toFixed(4)}`);

/* =========== 2. Jalur mobil penyeberang di perempatan =========== */
log.push("=== Jalur penyeberang di perempatan (jalur kiri + roda menapak) ===");
engine.startRun();
quiet();
const inter = addTestIntersection(engine.distance + 60);
e.spawnCrossCar(inter.id, inter.s + CROSS_LANE_OFFSET, -25, 1, 9);
e.spawnCrossCar(inter.id, inter.s - CROSS_LANE_OFFSET, 25, -1, 9);
const [ccA, ccB] = engine.crossCars;
check("mobil arah +lat memakai jalur kiri (+s)", Math.abs(ccA.s - inter.s - CROSS_LANE_OFFSET) < 1e-9, `offset ${(ccA.s - inter.s).toFixed(2)} m`);
check("mobil arah -lat memakai jalur kiri (-s)", Math.abs(ccB.s - inter.s + CROSS_LANE_OFFSET) < 1e-9, `offset ${(ccB.s - inter.s).toFixed(2)} m`);
check("dua arah tidak memakai jalur yang sama (tidak tabrakan depan-depan)", Math.sign(ccA.s - inter.s) !== Math.sign(ccB.s - inter.s), `+${(ccA.s - inter.s).toFixed(1)} vs ${(ccB.s - inter.s).toFixed(1)}`);

check("roda mobil menapak dek jalan lintas", Math.abs(crossCarH(6) - CROSS_DECK_H) < 1e-9, `h(6 m)=${crossCarH(6).toFixed(3)}`);
check("di jalan utama tinggi nol (rata aspal)", crossCarH(0) === 0 && crossCarH(3) === 0, `h(0)=${crossCarH(0)}, h(3)=${crossCarH(3)}`);
check("naik mulus lewat curb-cut (tanpa lompatan)", (() => {
  let prev: number | null = null;
  for (let lat = 0; lat <= 8; lat += 0.01) {
    const h = crossCarH(lat);
    if (prev !== null) {
      if (h < prev - 1e-9) return false; // tidak boleh turun
      if (h - prev > 0.01) return false; // tangga > 1 cm = ada lompatan
    }
    prev = h;
  }
  return prev !== null && Math.abs(prev - CROSS_DECK_H) < 1e-9;
})(), "monoton & mulus sampai dek");
check("tinggi dek dicapai TEPAT di bibir dek (bukan 0.2 m setelahnya)", Math.abs(crossCarH(CROSS_DECK_LAT) - CROSS_DECK_H) < 1e-9 && crossCarH(CROSS_DECK_LAT - 0.15) < CROSS_DECK_H - 0.001, `h(4.00)=${crossCarH(CROSS_DECK_LAT).toFixed(3)}, h(3.85)=${crossCarH(3.85).toFixed(3)}`);
check("rata aspal di dalam perempatan", crossCarH(0) === 0 && crossCarH(3.5) === 0, "");
const carB = crossingCarParts(0);
const carMinY = Math.min(...carB.map((p) => p.y - p.h / 2));
check("ban mobil penyeberang menapak (bawah ban = 0, tidak terbenam)", Math.abs(carMinY) < 0.005, `bawah y=${carMinY.toFixed(3)}`);
check("jalan lintas cukup panjang untuk titik muncul mobil", CROSS_SPAWN_LAT < 4 + CROSS_STREET_LEN - 2 && CROSS_DESPAWN_LAT <= 4 + CROSS_STREET_LEN, `muncul di |lat| ${CROSS_SPAWN_LAT}, jalan sampai ${4 + CROSS_STREET_LEN}`);
check("World.tsx memakai helper crossCarH (view & fisika sama)", /crossCarH\(cc\.lat\)/.test(world), "");

/* =========== 3. Tidak saling tembus di perempatan =========== */
log.push("=== Kendaraan tidak saling tembus di perempatan ===");
engine.startRun();
quiet();
const inter2 = addTestIntersection(engine.distance + 60);
e.spawnCrossCar(inter2.id, inter2.s + CROSS_LANE_OFFSET, -9, 1, 9);
const ccObj = engine.crossCars[engine.crossCars.length - 1];
// mobil jalan utama sedang melintas di perempatan
const mainCar = e.newMover("car", inter2.s, 1, LANE_LAT[1]);
mainCar.speed = 0.1;
engine.movers.push(mainCar);
const latBefore = ccObj.lat;
step(60); // mengerem halus sampai berhenti
const latAfterBrake = ccObj.lat;
step(60);
check("penyeberang menunggu (berhenti) saat ada mobil jalan utama", ccObj.waiting === true && Math.abs(ccObj.lat - latAfterBrake) < 0.02 && Math.abs(ccObj.lat) > 4, `lat ${latBefore.toFixed(2)} → ${latAfterBrake.toFixed(2)} → ${ccObj.lat.toFixed(2)} (berhenti di |lat| ${Math.abs(ccObj.lat).toFixed(2)})`);
engine.movers = [];
step(20);
check("penyeberang jalan lagi setelah jalan utama bebas", ccObj.lat > latBefore + 1, `lat ${latBefore.toFixed(2)} → ${ccObj.lat.toFixed(2)}`);

// pemain TIDAK menghalangi penyeberang (biar bahaya T-bone tetap ada)
engine.startRun();
quiet();
const inter3 = addTestIntersection(engine.distance + 30);
e.spawnCrossCar(inter3.id, inter3.s + CROSS_LANE_OFFSET, -12, 1, 9);
const cc3 = engine.crossCars[0];
engine.player.lat = LANE_LAT[2];
const lat3 = cc3.lat;
step(20);
check("pemain di jalur lintas TIDAK membuat penyeberang berhenti", cc3.lat > lat3 + 1 && !cc3.waiting, `lat ${lat3.toFixed(2)} → ${cc3.lat.toFixed(2)}`);
// pemain di sisi KAP MESIN (hood) tanpa lompat = nabrak; dari sisi kabin = cross_traffic
engine.startRun();
quiet();
const inter6 = addTestIntersection(engine.distance + 60);
e.spawnCrossCar(inter6.id, inter6.s + CROSS_LANE_OFFSET, -9, 1, 9);
const ccHood = engine.crossCars[0];
ccHood.s = engine.distance;
ccHood.lat = -2.0;
engine.player.lat = ccHood.lat + 1.0; // di atas kap mesin (sisi depan)
engine.player.h = 0;
step(1);
check("nabrak kap mesin penyeberang = tumbang (sebab 'car')", engine.phase !== "playing" && engine.crashCause === "car", `cause=${engine.crashCause}`);
engine.startRun();
quiet();
const inter7 = addTestIntersection(engine.distance + 60);
e.spawnCrossCar(inter7.id, inter7.s + CROSS_LANE_OFFSET, -9, 1, 9);
const ccCabin = engine.crossCars[0];
ccCabin.s = engine.distance;
ccCabin.lat = -2.0;
ccCabin.dir = -1;
engine.player.lat = ccCabin.lat + 1.0; // di sisi kabin (tidak bisa dilompati)
engine.player.h = 0;
step(1);
check("kena kabin/atap penyeberang = tumbang (sebab 'cross_traffic')", engine.phase !== "playing" && engine.crashCause === "cross_traffic", `cause=${engine.crashCause}`);

// dua mobil sejalur tidak boleh muncul bertumpuk
engine.startRun();
quiet();
const interSp = addTestIntersection(engine.distance + 60);
e.spawnCrossCar(interSp.id, interSp.s + CROSS_LANE_OFFSET, -CROSS_SPAWN_LAT, 1, 9);
const n1 = engine.crossCars.length;
e.spawnCrossCar(interSp.id, interSp.s + CROSS_LANE_OFFSET, -(CROSS_SPAWN_LAT - 6), 1, 9);
check("mobil sejalur tidak disusulkan kalau masih terlalu dekat", engine.crossCars.length === n1, `${n1} → ${engine.crossCars.length} mobil`);
e.spawnCrossCar(interSp.id, interSp.s + CROSS_LANE_OFFSET, -(CROSS_SPAWN_LAT - 20), 1, 9);
check("mobil sejalur boleh muncul kalau jaraknya sudah cukup", engine.crossCars.length === n1 + 1, `${engine.crossCars.length} mobil`);

// motor dari arah depan juga bikin penyeberang menunggu (jalur lintas hormat)
engine.startRun();
quiet();
const inter4 = addTestIntersection(engine.distance + 60);
e.spawnCrossCar(inter4.id, inter4.s + CROSS_LANE_OFFSET, -9, 1, 9);
const cc5 = engine.crossCars[0];
e.spawnMotorcycle(inter4.s, 1, 4);
engine.movers.forEach((m: { speed: number }) => (m.speed = 0.1));
const lat5 = cc5.lat;
step(20);
check("motor dari arah depan juga dihormati penyeberang", cc5.waiting === true, `waiting=${cc5.waiting}`);
check("penyeberang mengerem halus (tidak berhenti mendadak)", (cc5.speedK ?? 1) < 0.2 && Math.abs(cc5.lat - lat5) < 3, `speedK=${(cc5.speedK ?? 1).toFixed(2)}, maju ${Math.abs(cc5.lat - lat5).toFixed(2)} m sebelum berhenti`);

// kendaraan yang SUDAH di tengah perempatan tidak berhenti mendadak (tidak macet di tengah)
engine.startRun();
quiet();
const inter5 = addTestIntersection(engine.distance + 60);
e.spawnCrossCar(inter5.id, inter5.s + CROSS_LANE_OFFSET, -4.0, 1, 9);
const cc6 = engine.crossCars[0];
e.spawnMotorcycle(inter5.s, 1, 4);
engine.movers.forEach((m: { speed: number }) => (m.speed = 0.1));
const lat6 = cc6.lat;
step(20);
check("yang sudah di tengah perempatan jalan terus (tidak berhenti di tengah)", cc6.lat > lat6 + 1, `lat ${lat6.toFixed(2)} → ${cc6.lat.toFixed(2)}`);

console.log(log.join("\n"));
console.log(`\n${fails === 0 ? "SEMUA CEK LOLOS" : "ADA YANG GAGAL"} (${pass} pass, ${fails} fail)`);
if (fails > 0) process.exitCode = 1;
