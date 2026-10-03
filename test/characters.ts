/* Harness karakter & pengendara:
 *   1. bentuk PENGENDARA MOTOR: duduk di jok, tangan menggenggam setang, helm bulat + kaca,
 *   2. karakter baru selain merpati: KUCING OREN BERDIRI, FLAMINGO, GAGAK
 *      (model, anchor rig, dan build grup 3D untuk thumbnail),
 *   3. karakter baru otomatis kebuka (gratis) dan bisa dipakai rig yang sama.
 *
 * Jalankan:
 *   npx esbuild test/characters.ts --bundle --platform=node --outfile=/tmp/characters.cjs && node /tmp/characters.cjs
 */
import { motorcycleParts, MOTOR_PAINTS } from "../src/game/models";
import {
  SKINS,
  getSkin,
  charBodyParts,
  charHeadParts,
  charTailParts,
  charWingParts,
  charLegParts,
  type Skin,
} from "../src/game/skins";
import { buildPigeonGroup, RIG, LEG_T, LEG_S } from "../src/game/pigeonRig";
import { useUI } from "../src/game/store";

let pass = 0;
let fails = 0;
const log: string[] = [];
function check(name: string, ok: boolean, detail = "") {
  if (ok) pass++;
  else fails++;
  log.push(`${ok ? "PASS " : "FAIL "} ${name}${detail ? ` — ${detail}` : ""}`);
}
const finite = (p: { x: number; y: number; z: number; w: number; h: number; d: number }) =>
  [p.x, p.y, p.z, p.w, p.h, p.d].every((v) => Number.isFinite(v) && v > 0 || Number.isFinite(v));
const bounds = (parts: { x: number; y: number; z: number; w: number; h: number; d: number }[]) => ({
  minY: Math.min(...parts.map((p) => p.y - p.h / 2)),
  maxY: Math.max(...parts.map((p) => p.y + p.h / 2)),
  maxX: Math.max(...parts.map((p) => p.x + p.w / 2)),
  minX: Math.min(...parts.map((p) => p.x - p.w / 2)),
});

/* =============== 1. Pengendara motor & helm =============== */
log.push("=== Pengendara motor + helm ===");
const bike = motorcycleParts(0);
check("motor punya pengendara lengkap (bagian banyak)", bike.length >= 40, `${bike.length} part`);
const bb = bounds(bike);
check("pengendara tidak menembus aspal", Math.abs(bb.minY) < 0.005, `bawah y=${bb.minY.toFixed(3)}`);
check("tinggi pengendara + helm wajar", bb.maxY > 1.45 && bb.maxY < 1.75, `atas y=${bb.maxY.toFixed(3)}`);

// duduk di jok: jok lama (-0.32, 0.66, w 0.44 h 0.14) → atas jok 0.73 (minus DROP 0.04 = 0.69)
const seatTop = 0.66 + 0.14 / 2 - 0.04;
const hip = bike.find((p) => p.y > 0.7 && p.y < 0.95 && p.w > 0.2 && p.d > 0.35)!;
check("pinggul pengendara duduk pas di jok", !!hip && Math.abs(hip.y - hip.h / 2 - seatTop) < 0.06, hip ? `pinggul bawah ${(hip.y - hip.h / 2).toFixed(2)} vs jok ${seatTop.toFixed(2)}` : "tidak ada bagian pinggul");

// tangan menggenggam grip setang: grip di (0.56, 0.88, ±0.30) → minus DROP
const gripY = 0.88 - 0.04;
const gloves = bike.filter((p) => p.color === "#2b2f38" && p.y > 0.8 && p.y < 1.0);
const gloveDists = gloves.map((g) => Math.min(Math.hypot(g.x - 0.56, g.y - gripY, g.z - 0.3), Math.hypot(g.x - 0.56, g.y - gripY, g.z + 0.3)));
check("kedua tangan menggenggam setang (tidak mengambang)", gloves.filter((_, i) => gloveDists[i] < 0.14).length >= 2, `jarak terdekat ${Math.min(...gloveDists).toFixed(3)} m`);

// helm: tempurung membulat (melebar ke atas), kaca gelap, dagu tertutup, tidak menembus bahu
const helmPieces = bike.filter((p) => ["#f1faee"].includes(p.color) && p.y > 1.3);
const visor = bike.filter((p) => p.color === "#20242c" && p.y > 1.3);
check("helm berbentuk tempurung (>=3 tingkat)", helmPieces.length >= 3, `${helmPieces.length} bagian helm`);
check("helm punya kaca depan gelap", visor.length >= 1 && Math.abs(visor[0].z) < 0.02 && visor[0].x > 0, visor[0] ? `visor x=${visor[0].x.toFixed(2)}` : "tidak ada");
check("helm menutup dagu (chin bar)", bike.some((p) => p.y > 1.3 && p.y < 1.45 && p.x > 0 && p.h < 0.12), "");
const helmMin = Math.min(...helmPieces.map((p) => p.y - p.h / 2));
check("helm tidak tenggelam ke dalam badan", helmMin > 1.2, `dasar helm y=${helmMin.toFixed(2)}`);

// setang & garpu masih nyambung ke tangan
check("lengan dua segmen menyambung bahu ke setang", bike.filter((p) => p.color.includes("#") && p.y > 0.9 && p.y < 1.3 && p.w > 0.25).length >= 2, "");
check("tiap varian pengendara tetap punya helm", [0, 1, 2, 3, 4, 5].every((v) => motorcycleParts(v).length === bike.length), "");
check("warna jaket & helm beda per varian", new Set([0, 1, 2].map((v) => motorcycleParts(v).find((p) => p.y > 1.4 && p.color !== "#f1faee")?.color)).size >= 2, "");
check("strip helm senada warna motor", MOTOR_PAINTS.some((c) => bike.some((p) => p.color === c && p.y > 1.35)), "");

/* =============== 2. Karakter baru =============== */
log.push("=== Karakter baru (kucing, flamingo, gagak) ===");
const cat = getSkin("cat");
const flamingo = getSkin("flamingo");
const crow = getSkin("crow");
check("kucing oranye ada di daftar karakter", cat.kind === "cat" && cat.id === "cat", `${cat.name}`);
check("flamingo ada di daftar karakter", flamingo.kind === "flamingo" && flamingo.id === "flamingo", `${flamingo.name}`);
check("gagak ada di daftar karakter", crow.kind === "crow" && crow.id === "crow", `${crow.name}`);
check("ketiganya gratis (langsung bisa dipakai)", [cat, flamingo, crow].every((k) => k.cost === 0), "");
check("warna kucing oranye", cat.body.toLowerCase() === "#ff8c42", cat.body);
check("warna flamingo pink", flamingo.body.toLowerCase().includes("c4") || flamingo.body.toLowerCase().includes("ff9e"), flamingo.body);
check("warna gagak hitam", crow.body.toLowerCase() === "#23262e", crow.body);

for (const k of [cat, flamingo, crow]) {
  const body = charBodyParts(k);
  const head = charHeadParts(k);
  const tail = charTailParts(k);
  const arm = charWingParts(k, 1);
  const bodyB = bounds(body);
  const headB = bounds(head);
  // badan tidak perlu menyentuh dek: pinggul/kaki (rig) yang menapak, badan mulai dari tinggi pinggul.
  // Pembanding: badan merpati mulai di y = 0.20 saat kakinya menapak dek.
  const pigeonBodyMin = bounds(charBodyParts(getSkin("classic"))).minY;
  check(`${k.name}: badan menyambung ke pinggul/kaki`, Math.abs(bodyB.minY - pigeonBodyMin) < 0.1, `bawah ${bodyB.minY.toFixed(2)} (merpati ${pigeonBodyMin.toFixed(2)})`);
  check(`${k.name}: leher nyambung ke sendi kepala`, bodyB.maxY > RIG.headPos[1] - 0.15, `badan atas ${bodyB.maxY.toFixed(2)} vs kepala ${RIG.headPos[1]}`);
  check(`${k.name}: kepala tidak melayang di atas leher`, RIG.headPos[1] + headB.minY < 1.0, `dasar kepala ${(RIG.headPos[1] + headB.minY).toFixed(2)}`);
  check(`${k.name}: bentuk kepala lebih lebar dari sekedar titik`, headB.maxX - headB.minX > 0.2, `lebar ${(headB.maxX - headB.minX).toFixed(2)}`);
  check(`${k.name}: punya ekor`, tail.length >= 2, `${tail.length} bagian ekor`);
  check(`${k.name}: punya lengan/sayap`, arm.length >= 3, `${arm.length} bagian`);
  check(`${k.name}: semua angka geometri valid`, [...body, ...head, ...tail, ...arm].every(finite), "");
}

// kekhususan kucing oranye berdiri
const catHead = charHeadParts(cat);
const catTail = charTailParts(cat);
const catArms = charWingParts(cat, 1);
check("kucing: telinga segitiga di atas kepala", catHead.filter((p) => p.y > 0.25).length >= 6, `${catHead.filter((p) => p.y > 0.25).length} bagian`);
check("kucing: telinga ada dua (kiri & kanan)", new Set(catHead.filter((p) => p.y > 0.25).map((p) => Math.sign(p.z))).size === 2, "");
check("kucing: ada kumis", catHead.filter((p) => p.color === "#f7f3ea").length >= 4, `${catHead.filter((p) => p.color === "#f7f3ea").length} kumis`);
check("kucing: hidung pink", catHead.some((p) => p.color === cat.beak), cat.beak);
check("kucing: ekor melengkung naik ke atas", bounds(catTail).maxY > 0.7, `ekor atas ${bounds(catTail).maxY.toFixed(2)}`);
check("kucing: ujung ekor putih", catTail[catTail.length - 1].color === cat.tailTip, cat.tailTip);
check("kucing: lengan depan berakhir telapak (bukan sayap)", catArms.some((p) => p.color === cat.belly && p.y < -0.45), "");
const catThigh = charLegParts(cat, "thigh", LEG_T, LEG_S);
const pigeonThigh = charLegParts(getSkin("classic"), "thigh", LEG_T, LEG_S);
check("kucing: kaki lebih gempal dari merpati", catThigh[1].w > pigeonThigh[1].w, `${catThigh[1].w} vs ${pigeonThigh[1].w}`);
const catFoot = charLegParts(cat, "foot", LEG_T, LEG_S);
check("kucing: telapak kaki berkuku (paw)", catFoot.length >= 5 && catFoot.some((p) => p.color === cat.cere), `${catFoot.length} bagian`);

// kekhususan flamingo
const flamBody = charBodyParts(flamingo);
const flamHead = charHeadParts(flamingo);
const flamLeg = charLegParts(flamingo, "thigh", LEG_T, LEG_S);
check("flamingo: leher panjang sampai atas", bounds(flamBody).maxY > 1.05, `badan atas ${bounds(flamBody).maxY.toFixed(2)}`);
check("flamingo: paruh melengkung ke bawah", flamHead.filter((p) => (p.rz ?? 0) < -0.4).length >= 2, `${flamHead.filter((p) => (p.rz ?? 0) < -0.4).length} segmen`);
check("flamingo: ujung paruh hitam", flamHead.some((p) => p.color === "#20242c" && p.x > 0.3), "");
check("flamingo: kaki paling ramping", flamLeg[1].w < pigeonThigh[1].w, `${flamLeg[1].w} vs ${pigeonThigh[1].w}`);
check("flamingo: telapak berselaput (3 jari)", charLegParts(flamingo, "foot", LEG_T, LEG_S).length >= 5, "");

// kekhususan gagak
const crowBody = charBodyParts(crow);
const crowHead = charHeadParts(crow);
check("gagak: paruh besar panjang", bounds(crowHead).maxX > 0.6, `paruh ujung x=${bounds(crowHead).maxX.toFixed(2)}`);
check("gagak: mata pucat khas gagak", crowHead.some((p) => p.color === "#d9dee6"), "");
check("gagak: bulu tengkuk menjuntai", crowBody.filter((p) => p.color === crow.wingTip).length >= 2, "");
check("gagak: kilau biru di punggung", crowBody.some((p) => p.color === crow.tailTip), crow.tailTip);
check("gagak: sayap lebih panjang dari merpati", bounds(charWingParts(crow, 1)).minX < bounds(charWingParts(getSkin("classic"), 1)).minX, "");

/* =============== 3. Semua karakter jalan di rig yang sama =============== */
log.push("=== Kompatibilitas rig + build 3D ===");
for (const k of SKINS) {
  const { group, dispose } = buildPigeonGroup(k, "default", "black");
  let meshes = 0;
  group.traverse((o) => {
    if ((o as { isMesh?: boolean }).isMesh) meshes++;
  });
  check(`rig bisa membangun "${k.id}"`, meshes >= 8, `${meshes} mesh`);
  dispose();
}
check("semua karakter unik (tidak ada id dobel)", new Set(SKINS.map((s) => s.id)).size === SKINS.length, `${SKINS.length} karakter`);
const species = new Set(SKINS.map((s) => s.kind ?? "pigeon"));
check("ada 5 spesies karakter termasuk Little Japan Friends", species.size === 5 && species.has("littleJapanFriend"), [...species].join(", "));
check("jumlah merpati tetap utuh", SKINS.filter((s) => !s.kind).length >= 12, `${SKINS.filter((s) => !s.kind).length} merpati`);
const unlocked = useUI.getState().unlocked;
check("kucing/flamingo/gagak otomatis kebuka (free)", ["cat", "flamingo", "crow"].every((id) => unlocked.includes(id)), unlocked.length + " karakter terbuka");
// ganti karakter tidak merusak geometri (simulasi pilih dari menu)
useUI.getState().selectSkin("cat");
check("bisa ganti ke kucing dari menu", useUI.getState().skin === "cat", useUI.getState().skin);
useUI.getState().selectSkin("flamingo");
check("bisa ganti ke flamingo dari menu", useUI.getState().skin === "flamingo", useUI.getState().skin);
useUI.getState().selectSkin("crow");
check("bisa ganti ke gagak dari menu", useUI.getState().skin === "crow", useUI.getState().skin);
useUI.getState().selectSkin("classic");

console.log(log.join("\n"));
console.log(`\n${fails === 0 ? "SEMUA CEK LOLOS" : "ADA YANG GAGAL"} (${pass} pass, ${fails} fail)`);
if (fails > 0) process.exitCode = 1;
