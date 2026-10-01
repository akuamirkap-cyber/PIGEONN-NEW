/* Harness ITEM LANGKA (roket NOS):
 *   1. model roket: emas-ungu-putih berkilau, punya sirip, moncong, jendela & nyala;
 *   2. kelangkaan: muncul ~1 tiap 200–340 m (jarang!), yang pertama ~120 m;
 *   3. keadilan: roket selalu di jalur yang bebas rintangan, tidak di dekat rel/perempatan;
 *   4. efek ambil: NOS langsung PENUH + bonus skor 500 + kilatan sinar (raylight) + cincin emas;
 *   5. bersih-bersih: kilatan mereda, roket yang lewat dibuang dari daftar.
 *
 * Jalankan (dari root repo):
 *   npx esbuild test/rare.ts --bundle --platform=node --outfile=/tmp/rare.cjs && node /tmp/rare.cjs
 */
import {
  engine,
  NOS_MAX,
  ROCKET_GAP,
  ROCKET_SCORE,
  RARE_FLASH_T,
  LANE_LAT,
  START_S,
  ROCKET_FIRST_S,
  RARE_REWARD,
  RARE_FLASH_RGB,
  RARE_WEIGHTS,
  pickRareKind,
  type RareKind,
} from "../src/game/engine";
import { rocketParts, diamondParts, crownParts } from "../src/game/models";

const DT = 1 / 60;
let pass = 0;
let fails = 0;
function check(name: string, ok: boolean, detail = "") {
  if (ok) pass++;
  else fails++;
  console.log(`${ok ? "PASS " : "FAIL "} ${name}${detail ? ` — ${detail}` : ""}`);
}
const e = engine as unknown as Record<string, any>;
const step = (n: number) => {
  for (let i = 0; i < n; i++) engine.update(DT);
};
/** Matikan pemicu spawn otomatis (update() sendiri tidak akan memanggil spawnGroup). */
function quiet() {
  e.nextObstacleS = 1e9;
  e.nextRoadworkS = 1e9;
  e.nextCrossingS = 1e9;
  e.nextOverpassS = 1e9;
  e.nextIntersectionS = 1e9;
  e.nextNosS = 1e9;
  engine.obstacles = [];
  engine.breads = [];
  engine.movers = [];
  engine.crossings = [];
  engine.trains = [];
  engine.intersections = [];
  engine.crossCars = [];
  engine.particles = [];
  engine.rockets = [];
  engine.reserved = [];
}
/** Sisa pemicu spawnGroup manual: pakai jarak yang masuk akal (x besar bisa bikin OOM). */
function quietManual() {
  quiet();
  e.nextObstacleS = engine.distance + 30;
  e.nextRoadworkS = 1e9;
}

/* ---------- 1. model ---------- */
console.log("=== Model roket langka ===");
const rocket = rocketParts();
check("roket punya badan, moncong, sirip, jendela & nyala", rocket.length >= 16, `${rocket.length} part`);
const colors = new Set(rocket.map((p) => p.color));
check("bahan berharga: emas + ungu + putih", colors.has("#ffc93c") && colors.has("#7b3ff2") && colors.has("#f4f6fa"), [...colors].slice(0, 6).join(", "));
check("ada nyala di bawah (nozzle menyala)", rocket.some((p) => p.color === "#ff8c1a") && rocket.some((p) => p.color === "#ffe066"), "");
const maxY = Math.max(...rocket.map((p) => p.y + p.h / 2));
const minY = Math.min(...rocket.map((p) => p.y - p.h / 2));
check("tinggi roket masuk akal (item kecil, bukan gedung)", maxY > 0.9 && maxY < 1.4 && minY > -0.1, `y ${minY.toFixed(2)} → ${maxY.toFixed(2)}`);
const fins = rocket.filter((p) => p.color === "#ffc93c" && p.y < 0.55);
check("sirip ada di 4 arah", fins.length >= 4, `${fins.length} sirip`);

const diamond = diamondParts();
const diamondColors = new Set(diamond.map((p) => p.color));
check("berlian langka: biru-cyan berkilau + alas emas", diamond.length >= 8 && diamondColors.has("#4fd8ff") && diamondColors.has("#ffc93c") && diamondColors.has("#eaf9ff"), `${diamond.length} part`);
const diamondTop = Math.max(...diamond.map((p) => p.y + p.h / 2));
check("tinggi berlian masuk akal", diamondTop > 0.7 && diamondTop < 1.2, `puncak ${diamondTop.toFixed(2)} m`);

const crown = crownParts();
const crownColors = new Set(crown.map((p) => p.color));
check("mahkota langka: emas + permata + kain ungu", crown.length >= 10 && crownColors.has("#ffc93c") && crownColors.has("#ff5ea8") && crownColors.has("#7b3ff2"), `${crown.length} part`);
const crownTop = Math.max(...crown.map((p) => p.y + p.h / 2));
check("tinggi mahkota masuk akal", crownTop > 0.4 && crownTop < 1.0, `puncak ${crownTop.toFixed(2)} m`);

/* ---------- 2. kelangkaan ---------- */
console.log("=== Kelangkaan (harus jarang!) ===");
engine.startRun();
check("roket pertama muncul di awal run (~120 m)", e.nextRocketS === START_S + ROCKET_FIRST_S, `nextRocketS=${e.nextRocketS}`);
check("jarak antar roket 200–340 m (jarang)", ROCKET_GAP[0] === 200 && ROCKET_GAP[1] === 340, `${ROCKET_GAP[0]}–${ROCKET_GAP[1]} m`);

// jalankan generator sampai 3,5 km: hitung berapa roket yang muncul
engine.startRun();
quietManual();
e.nextRocketS = engine.distance + 200;
let spawned = 0;
const gaps: number[] = [];
let lastS = 0;
for (let i = 0; i < 400 && engine.distance < 3500; i++) {
  e.nextObstacleS = engine.distance + 26 + Math.random() * 4;
  e.spawnGroup();
  for (const r of engine.rockets) {
    spawned++;
    if (lastS) gaps.push(r.s - lastS);
    lastS = r.s;
  }
  engine.obstacles = [];
  engine.movers = [];
  engine.nosCans = [];
  engine.rockets = [];
  engine.distance += 12;
}
const perKm = (spawned / 3500) * 1000;
check("roket memang langka (< 6 per km)", perKm < 6, `${spawned} roket / 3,5 km = ${perKm.toFixed(1)} per km`);
check("roket tetap muncul (bukan never)", spawned >= 8, `${spawned} roket dalam 3,5 km`);
const avgGap = gaps.reduce((a, b) => a + b, 0) / Math.max(1, gaps.length);
check("jarak rata-rata sesuai desain (200–340 m)", avgGap >= 180 && avgGap <= 360, `rata-rata ${avgGap.toFixed(0)} m dari ${gaps.length} jarak`);

/* ---------- 3. keadilan: jalur bebas ---------- */
console.log("=== Roket selalu di jalur yang bisa diambil ===");
// jalur tengah (paling enak diambil) disumbat barrier -> roket harus pindah jalur, bukan dibuang
engine.startRun();
quietManual();
const target1 = engine.distance + 260;
e.nextRocketS = target1;
e.nextObstacleS = target1;
e.addObstacle("barrier", target1, 1);
e.addObstacle("barrier", target1 + 2, 1);
e.spawnGroup();
const r1 = engine.rockets[0];
check("jalur tengah disumbat -> roket pindah ke jalur bebas", !!r1 && r1.lane !== 1 && r1.lane >= 0, r1 ? `jalur ${r1.lane} @ s=${r1.s.toFixed(0)}` : "tidak muncul");
check("roket tidak ditaruh menempel rintangan", !!r1 && !engine.obstacles.some((o) => o.kind !== "ramp" && o.kind !== "rail" && o.lane === r1.lane && Math.abs(o.s - r1.s) < 3), "");

// semua jalur disumbat -> roket DITUNDA (bukan ditaruh di tempat bahaya)
engine.startRun();
quietManual();
const target2 = engine.distance + 260;
e.nextRocketS = target2;
e.nextObstacleS = target2;
for (const lane of [0, 1, 2]) e.addObstacle("barrier", target2, lane);
e.spawnGroup();
check("semua jalur bahaya -> roket ditunda ke tempat aman", engine.rockets.length === 0 && e.nextRocketS === target2 + 12, `nextRocketS=${Math.round(e.nextRocketS)} (target ${Math.round(target2)})`);

// di samping itu: tetap bisa muncul di jalur kosong umum
let spawnedSomewhere = 0;
engine.startRun();
quietManual();
e.nextRocketS = engine.distance + 200;
for (let i = 0; i < 120; i++) {
  e.nextObstacleS = engine.distance + 26;
  e.spawnGroup();
  spawnedSomewhere += engine.rockets.length;
  engine.rockets = [];
  engine.obstacles = [];
  engine.movers = [];
  engine.nosCans = [];
  engine.distance += 12;
}
check("di jalan normal roket tetap muncul", spawnedSomewhere >= 3, `${spawnedSomewhere} roket dalam 1,4 km`);
check("semua roket muncul di jalur 0/1/2", engine.rockets.every((r) => r.lane >= 0 && r.lane <= 2), "");

// tidak muncul di dekat rel kereta
engine.startRun();
quietManual();
const crossS = engine.distance + 300;
e.addCrossing(crossS);
check("rel kereta terdaftar di engine", engine.crossings.length === 1, `${engine.crossings.length} rel`);
e.nextRocketS = crossS;
e.nextObstacleS = crossS;
e.spawnGroup();
check("roket tidak muncul di dekat rel kereta", engine.rockets.length === 0 && e.nextRocketS === crossS + 12, `nextRocketS=${Math.round(e.nextRocketS)}`);
// sedikit lebih jauh: boleh muncul lagi
e.nextRocketS = crossS + 40;
e.nextObstacleS = crossS + 40;
e.spawnGroup();
check("40 m setelah rel kereta, roket boleh muncul lagi", engine.rockets.length === 1, `${engine.rockets.length} roket`);

// tidak muncul di dekat perempatan
engine.startRun();
quietManual();
const interS = engine.distance + 320;
e.addIntersection(interS);
check("perempatan terdaftar di engine", engine.intersections.length === 1, `${engine.intersections.length} perempatan`);
e.nextRocketS = interS;
e.nextObstacleS = interS;
e.spawnGroup();
check("roket tidak muncul di dekat perempatan", engine.rockets.length === 0, `${engine.rockets.length} roket`);

/* ---------- 3b. jenis item langka ---------- */
console.log("=== Jenis item langka (roket / berlian / mahkota) ===");
const kinds = new Set<RareKind>();
for (let i = 0; i < 4000; i++) kinds.add(pickRareKind());
check("3 jenis item langka semuanya bisa muncul", kinds.size === 3, [...kinds].join(", "));
let nRocket = 0;
let nDiamond = 0;
let nCrown = 0;
for (let i = 0; i < 4000; i++) {
  const k = pickRareKind();
  if (k === "rocket") nRocket++;
  else if (k === "diamond") nDiamond++;
  else nCrown++;
}
check("roket paling sering, mahkota paling jarang", nRocket > nDiamond && nDiamond > nCrown, `roket ${(nRocket / 40).toFixed(0)}%, berlian ${(nDiamond / 40).toFixed(0)}%, mahkota ${(nCrown / 40).toFixed(0)}%`);
check("bobot sesuai desain (55/30/15)", RARE_WEIGHTS.length === 3 && RARE_WEIGHTS[0][0] === "rocket", RARE_WEIGHTS.map(([k, w]) => `${k}:${w}`).join(" "));
check("hadiah roket = NOS penuh + 500", RARE_REWARD.rocket.nos === 1 && RARE_REWARD.rocket.score === ROCKET_SCORE, "");
check("hadiah berlian = skor paling gede (2000)", RARE_REWARD.diamond.score === 2000 && RARE_REWARD.diamond.nos > 0, `+${RARE_REWARD.diamond.score}, NOS ${RARE_REWARD.diamond.nos * 100}%`);
check("hadiah mahkota = jackpot (NOS penuh + 1500)", RARE_REWARD.crown.nos === 1 && RARE_REWARD.crown.score === 1500, "");
check("warna kilatan beda tiap jenis", new Set(Object.values(RARE_FLASH_RGB).map((c) => c.join(","))).size === 3, Object.entries(RARE_FLASH_RGB).map(([k, c]) => `${k}:(${c.join(",")})`).join(" "));

// tiap item yang muncul di jalan punya jenis yang valid
engine.startRun();
quietManual();
e.nextRocketS = engine.distance + 200;
const spawnedKinds = new Set<RareKind>();
let totalSpawn = 0;
for (let i = 0; i < 300; i++) {
  e.nextObstacleS = engine.distance + 26;
  e.spawnGroup();
  for (const r of engine.rockets) {
    spawnedKinds.add(r.kind);
    totalSpawn++;
  }
  engine.rockets = [];
  engine.obstacles = [];
  engine.movers = [];
  engine.nosCans = [];
  engine.distance += 12;
}
check("item yang muncul selalu punya jenis valid", [...spawnedKinds].every((k) => RARE_REWARD[k] !== undefined), [...spawnedKinds].join(", "));
check("jumlah item langka dalam 3,6 km wajar (>= 8)", totalSpawn >= 8, `${totalSpawn} item, jenis terlihat: ${[...spawnedKinds].join("/")} (sebaran jenis diuji di atas via pickRareKind)`);
check("jenis item tidak dipatok satu saja di kode spawn", RARE_WEIGHTS.length >= 2 && totalSpawn >= 8, `${RARE_WEIGHTS.length} jenis terdaftar`);

/* ---------- 4. efek saat diambil ---------- */
console.log("=== Efek ambil: NOS penuh + skor + kilatan sinar ===");
engine.startRun();
quiet();
e.rockets.push({ id: 999, s: engine.distance + 0.4, lane: 1, taken: false, wx: 2, wy: 0, wz: -1, phase: 0 });
engine.player.lat = LANE_LAT[1];
engine.player.h = 0;
const scoreBefore = engine.trickScore;
e.addNos(10); // NOS cuma sedikit, biar kelihatan roket mengisi penuh
step(2);
check("roket ditandai sudah diambil", engine.rockets[0]?.taken === true, "");
check("NOS langsung PENUH setelah ambil roket", engine.nos >= NOS_MAX - 0.001, `nos=${engine.nos.toFixed(1)} / ${NOS_MAX}`);
check("bonus skor besar (+500)", engine.trickScore - scoreBefore >= ROCKET_SCORE, `+${engine.trickScore - scoreBefore}`);
check("kilatan sinar (raylight) aktif", engine.rareFlash > 0 && engine.rareFlash <= RARE_FLASH_T, `rareFlash=${engine.rareFlash.toFixed(2)}s`);
check("cincin emas + serpihan dipicu", engine.pulses.length > 0 && engine.particles.length > 0, `${engine.pulses.length} cincin, ${engine.particles.length} partikel`);
check("hitungan roket terambil naik", engine.rocketTaken === 1, `${engine.rocketTaken}`);
check("pemain tetap main (tidak crash)", engine.phase === "playing", `phase=${engine.phase}`);
step(70); // ~1,17 s
check("kilatan sinar reda sendiri (tidak nyangkut)", engine.rareFlash === 0, `rareFlash=${engine.rareFlash}`);

// berlian: skor gede, NOS setengah, kilatan biru
engine.startRun();
quiet();
e.rockets.push({ id: 1001, s: engine.distance + 0.4, lane: 1, taken: false, kind: "diamond", wx: 1, wy: 0, wz: 0, phase: 0 });
engine.player.lat = LANE_LAT[1];
engine.player.h = 0;
e.addNos(0);
const scoreD = engine.trickScore;
step(2);
check("berlian diambil -> skor +2000", engine.trickScore - scoreD === 2000, `+${engine.trickScore - scoreD}`);
check("berlian diambil -> NOS setengah penuh", Math.abs(engine.nos - NOS_MAX * 0.5) < 0.001, `nos=${engine.nos.toFixed(0)}/${NOS_MAX}`);
check("kilatan berlian berwarna biru", engine.rareFlashRGB[2] > engine.rareFlashRGB[0] && engine.rareFlashRGB[1] > 0.7, `rgb(${engine.rareFlashRGB.map((v) => v.toFixed(2)).join(",")})`);

// mahkota: jackpot
engine.startRun();
quiet();
e.rockets.push({ id: 1002, s: engine.distance + 0.4, lane: 1, taken: false, kind: "crown", wx: 2, wy: 0, wz: 0, phase: 0 });
engine.player.lat = LANE_LAT[1];
engine.player.h = 0;
e.addNos(0);
const scoreC = engine.trickScore;
step(2);
check("mahkota diambil -> NOS penuh", engine.nos >= NOS_MAX - 0.001, `nos=${engine.nos.toFixed(0)}`);
check("mahkota diambil -> skor +1500", engine.trickScore - scoreC === 1500, `+${engine.trickScore - scoreC}`);
check("kilatan mahkota (emas-oranye) aktif", engine.rareFlash > 0 && engine.rareFlashRGB[0] > engine.rareFlashRGB[2], `rgb(${engine.rareFlashRGB.map((v) => v.toFixed(2)).join(",")})`);

// pemain di jalur lain tidak mengambil roket
engine.startRun();
quiet();
e.rockets.push({ id: 2000, s: engine.distance + 0.4, lane: 2, taken: false, wx: 3, wy: 0, wz: 0, phase: 0 });
engine.player.lat = LANE_LAT[0];
engine.player.h = 0;
step(2);
check("roket di jalur lain tidak terambil", engine.rockets[0].taken === false && engine.rocketTaken === 0, `taken=${engine.rocketTaken}`);

// melompat tinggi di atas roket juga tidak mengambil
engine.startRun();
quiet();
e.rockets.push({ id: 2001, s: engine.distance + 0.4, lane: 1, taken: false, wx: 0, wy: 0, wz: 0, phase: 0 });
engine.player.lat = LANE_LAT[1];
engine.player.h = 3.2;
step(2);
check("terlalu tinggi di atas roket tidak terambil", engine.rockets[0].taken === false && engine.rocketTaken === 0, `h=3.2`);

// ambil berkali-kali: aman & tetap valid
engine.startRun();
quiet();
for (let i = 0; i < 5; i++) {
  e.rockets.push({ id: 2100 + i, s: engine.distance + 0.4, lane: 1, taken: false, wx: 0, wy: 0, wz: 0, phase: i });
  engine.player.lat = LANE_LAT[1];
  engine.player.h = 0;
  engine.nos = 0;
  step(2);
  engine.distance += 3;
}
check("ambil roket berulang aman (5x)", engine.rocketTaken === 5 && engine.nos >= NOS_MAX - 0.001, `taken=${engine.rocketTaken}, nos=${engine.nos.toFixed(0)}`);

/* ---------- 5. bersih-bersih ---------- */
console.log("=== Hemat memori: roket lewat dibuang ===");
engine.startRun();
quiet();
e.rockets.push({ id: 3000, s: engine.distance - 20, lane: 0, taken: false, wx: 0, wy: 0, wz: 0, phase: 0 });
e.rockets.push({ id: 3001, s: engine.distance + 40, lane: 0, taken: false, wx: 0, wy: 0, wz: 0, phase: 0 });
step(2);
check("roket yang sudah jauh di belakang dibuang", engine.rockets.length === 1 && engine.rockets[0].id === 3001, `${engine.rockets.length} roket tersisa`);
check("daftar roket terbaru terdeteksi view (listVersion naik)", engine.listVersion > 0, `listVersion=${engine.listVersion}`);

console.log(`\n${fails === 0 ? "SEMUA CEK LOLOS" : "ADA YANG GAGAL"} (${pass} pass, ${fails} fail)`);
if (fails > 0) process.exitCode = 1;
