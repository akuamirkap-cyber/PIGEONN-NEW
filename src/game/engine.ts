import * as THREE from "three";
import { ARM_LEN, CHUNK_LEN, GATE_LAT, TRAIN_CAR_LEN, TRAIN_GAP, TRAIN_W, HOOD_JUMP_CLEAR_H, makeBuildingSpec, makeShibuyaTowerSpec, type BuildingSpec } from "./models";
import { TRICK_MAP, TRICKS, type TrickKind } from "./tricks";
import { useUI, type Phase } from "./store";
import { sfx } from "./audio";
import { clamp, lerp, pick, rand, randInt } from "./voxel";
import { Track, type TrackSample } from "./track";
import { TURN, makeTurnState, resetTurnState, stepTurn, rearOf } from "./turnModel";

export const track = new Track();

/* ---------- Constants ---------- */
export const LANE_LAT = [-2.4, 0, 2.4]; // lane 0 = left, 1 = middle, 2 = right (chase camera)
export const GRAVITY = 30;
export const JUMP_V = 10.5;
/** Fixed ramp launch speed: ramps stay equally high at NORMAL, 2×, and 3× game speed. */
export const RAMP_V = 16;
export const START_SPEED = 7;
export const MAX_SPEED = 12.5;
export const ACCEL = 0.08;
export const MENU_SPEED = 0;
export const PODIUM_H = 0;
export const PODIUM_R = 0;
/** Turntable angle that shows the pigeon's face in a 3/4 view for the fixed camera. */
export const FRONT_YAW = 3.75;
export const RAIL_H = 0.6;
export const PLAYER_HALF = 0.22;
export const START_S = 14;
export const CAR_HALF = 1.7;
export const CAR_HIT = 1.6;
export const CAR_ROOF_H = 1.52;
/* ---------- Ukuran hewan (BESARIN): kucing 1.7x, ayam 1.2x ----------
 * Semua angka ukuran hewan ada di blok ini supaya skala model di World.tsx,
 * hitbox tabrakan, dan radius ragdoll tidak pernah beda. Yang diubah kalau mau
 * retune cukup CAT_SIZE_BOOST / CHICKEN_SIZE_BOOST.
 */
/** Tinggi model pada skala 1 (unit `models.ts`: catWalkParts(), chickenParts()). */
export const CAT_MODEL_H = 0.775;
export const CHICKEN_MODEL_H = 1.25;
export const CAT_MODEL_SCALE = 0.63; // ukuran dasar kucing (dikecilkan 10%)
export const CHICKEN_MODEL_SCALE = 0.522; // ukuran dasar ayam (dikecilkan 10%)
export const CAT_SIZE_BOOST = 1.7; // BESARIN kucing 1.7x
export const CHICKEN_SIZE_BOOST = 1.2; // BESARIN ayam 1.2x
/** Skala akhir yang dipakai World.tsx untuk menggambar hewannya. */
export const CAT_SCALE = CAT_MODEL_SCALE * CAT_SIZE_BOOST; // = 1.071
export const CHICKEN_SCALE = CHICKEN_MODEL_SCALE * CHICKEN_SIZE_BOOST; // = 0.626
/** Tinggi akhir model (m), dipakai untuk clearance lompatan & radius ragdoll. */
export const CAT_HEIGHT = CAT_MODEL_H * CAT_SCALE; // ~0.92 m
export const CHICKEN_HEIGHT = CHICKEN_MODEL_H * CHICKEN_SCALE; // ~0.87 m
/** Ayam: tingginya naik bareng ukuran, hitbox clearance ikut naik (dulu 0.72). */
export const CHICKEN_HIT = CHICKEN_HEIGHT;
/** Kucing: 1.2 masih di atas kucing 1.7x (0.92) dan di bawah puncak lompatan (~1.84). */
export const CAT_CLEAR_H = 1.2;
const CHICKEN_HOP_T = 0.32;
const CHICKEN_STEP = 1.2;
const CHICKEN_EDGE = 6.6;
const CHICKEN_HOP_H = 0.45;
export const SIGN_AHEAD = 7.8;
/** Tinggi lompatan yang cukup untuk melewati pengendara motor (helm + badan motor). */
export const MOTOR_CLEAR_H = 1.55;
/* ---------- Tabrakan hewan ala kartun: MENTAL + denyut tipis ----------
 * Hewan yang ditabrak dilontarkan tinggi & muter-muter, plus SATU cincin denyut
 * tipis di titik tabrakan (ala ripple knockback). TANPA screen shake, TANPA
 * freeze-frame, dan kamera cuma dapat nudge zoom tipis.
 */
/** Pantulan ekstra kenyal untuk hewan yang mental. */
export const ANIMAL_BOUNCE = 1.45;
/** Gayaberat hewan saat mental (lebih kecil = hang time ala kartun). */
export const ANIMAL_GRAVITY_SCALE = 0.72;
/** Denyut kamera: cuma sedikit zoom halus, bukan guncangan layar. */
export const ANIMAL_PUNCH = 0.35;
// railway crossing
export const TRAIN_HIT = 2.3;
/** A tiny clearance margin used only while a ramp-launched skater passes through a train. */
export const RAMP_TRAIN_CLEARANCE_H = TRAIN_HIT + 0.22;
export const TRAIN_SPEED = 8;
/** Oncoming vehicles are faster, but their approach timing is recalculated to keep each encounter fair. */
export const ONCOMING_CAR_SPEED_MULT = 1.4;
export const ONCOMING_MOTORCYCLE_SPEED_MULT = 1.3;
export const ARM_S = -2.0; // arm position relative to the rails
export const ARM_HIT = 0.8;
export const CROSSING_RAMP_S = -4.8;
/** Run distance (m) of the first railway crossing; later ones follow every CROSSING_GAP. */
export const FIRST_CROSSING_M = 50;
export const CROSSING_GAP: [number, number] = [150, 260];
export const ARM_INNER = GATE_LAT - 0.3 - ARM_LEN; // lateral reach of a lowered arm (from its gate)
export type CrashCause = "obstacle" | "car" | "oncoming" | "motorcycle" | "chicken" | "train" | "gate" | "pedestrian" | "roadwork" | "cross_traffic";
// NOS (nitro boost)
export const NOS_MAX = 100;
export const NOS_DURATION = 2.6;
export const NOS_SPEED_MULT = 1.75;
export const NOS_PER_BREAD = 6;
export const NOS_PER_TRICK = 10;
export const NOS_CAN_S = 50;
/** Jarak antar-item LANGKA (roket NOS): jarang, rata-rata ~1 tiap 270 m. */
export const ROCKET_GAP: [number, number] = [200, 340];
/**
 * Jenis ITEM LANGKA yang muncul di jalan. Roket = NOS, Berlian = skor paling gede,
 * Mahkota = jackpot (paling jarang). Semua bercahaya raylight & wajib bisa diambil.
 */
export type RareKind = "rocket" | "diamond" | "crown";
/** Bobot undian jenis item langka (roket paling sering, mahkota paling jarang). */
export function pickRareKind(): RareKind {
  const total = RARE_WEIGHTS.reduce((sum, [, w]) => sum + w, 0);
  let roll = Math.random() * total;
  for (const [kind, w] of RARE_WEIGHTS) {
    roll -= w;
    if (roll <= 0) return kind;
  }
  return RARE_WEIGHTS[0][0];
}

export const RARE_WEIGHTS: [RareKind, number][] = [
  ["rocket", 55],
  ["diamond", 30],
  ["crown", 15],
];
/** Hadiah tiap jenis: NOS (0..1 dari NOS_MAX) + skor + teks popup. */
export const RARE_REWARD: Record<RareKind, { nos: number; score: number; title: string; sub: string }> = {
  rocket: { nos: 1, score: 500, title: "ROCKET LANGKA!", sub: "NOS LANGSUNG PENUH" },
  diamond: { nos: 0.5, score: 2000, title: "BERLIAN LANGKA!", sub: "SKOR +2000" },
  crown: { nos: 1, score: 1500, title: "MAHKOTA LANGKA!", sub: "JACKPOT! NOS PENUH +1500" },
};
/** Warna kilatan sinar tiap jenis (dipakai view). */
export const RARE_FLASH_RGB: Record<RareKind, [number, number, number]> = {
  rocket: [1, 0.86, 0.42],
  diamond: [0.45, 0.88, 1],
  crown: [1, 0.72, 0.32],
};
/** Roket langka pertama muncul ~120 m setelah start (biar pemain cepat lihat itemnya). */
export const ROCKET_FIRST_S = 120;
/** Skor bonus sekali ambil roket. */
export const ROCKET_SCORE = 500;
/** Berapa lama kilatan sinar (raylight) bertahan setelah roket diambil. */
export const RARE_FLASH_T = 0.9;
// SPRINT: SHIFT / boost button. Each press advances speed (+40 -> +50 -> +70...), resets a 2s timer.
// If not pressed within 2s, speed smoothly decays back to normal ("perlahan").
// The kicking swing animation remains smooth and natural ("ayunanya jangan dicepetin ttp smooth").
export const SPRINT_WINDOW = 2.0; // 2 seconds idle window before decay begins
export interface Puddle {
  id: number;
  s: number;
  lane: number;
  variant: number;
  pos: Vec3;
  rotY: number;
  splashT: number;
}
export interface OverpassCar {
  id: number;
  s: number;
  lat: number;
  dir: number;
  speed: number;
  variant: number;
}

export type ObstacleKind = "cone" | "trash" | "barrier" | "bench" | "boxes" | "planter" | "car" | "ramp" | "rail" | "fence" | "dirt" | "jackhammer" | "worker";

/** halfLen/height drive physics; `hit` is the (forgiving) collision height. */
export const OBSTACLE_DEFS: Record<ObstacleKind, { halfLen: number; height: number; hit: number }> = {
  cone: { halfLen: 0.35, height: 0.6, hit: 0.42 },
  trash: { halfLen: 0.4, height: 1.0, hit: 0.78 },
  barrier: { halfLen: 0.65, height: 0.8, hit: 0.6 },
  bench: { halfLen: 1.0, height: 0.85, hit: 0.62 },
  boxes: { halfLen: 0.45, height: 1.05, hit: 0.82 },
  planter: { halfLen: 0.65, height: 0.65, hit: 0.48 },
  car: { halfLen: CAR_HALF, height: 1.55, hit: CAR_HIT },
  ramp: { halfLen: 1.2, height: 1.0, hit: 0 },
  rail: { halfLen: 3.5, height: RAIL_H, hit: RAIL_H },
  fence: { halfLen: 0.15, height: 0.9, hit: 0.7 },
  dirt: { halfLen: 0.7, height: 0.7, hit: 0.5 },
  jackhammer: { halfLen: 0.3, height: 1.0, hit: 0.75 },
  worker: { halfLen: 0.35, height: 2.0, hit: 1.7 },
};
const JUMPABLES: ObstacleKind[] = ["cone", "trash", "barrier", "bench", "boxes", "planter"];
const SMALL_JUMPABLES: ObstacleKind[] = ["cone", "trash", "barrier", "boxes"];

export type Vec3 = [number, number, number];
export type Quat = [number, number, number, number];

export interface Obstacle {
  id: number;
  kind: ObstacleKind;
  s: number;
  lane: number;
  variant: number;
  flip: boolean;
  pos: Vec3;
  quat: Quat;
  /** per-instance half length (rails come in several lengths) */
  half?: number;
  /** Sleeping cat on car roof: variant 0=oren, 1=hitam, 2=putih, 3=hitam-putih. undefined if no cat. */
  catVariant?: number;
  catHit?: boolean;
}
export const RAIL_LENGTHS = [7, 12, 18, 24];
export function obstacleHalf(o: Obstacle) {
  return o.half ?? OBSTACLE_DEFS[o.kind].halfLen;
}
export interface Bread {
  id: number;
  s: number;
  lane: number;
  h: number;
  taken: boolean;
  phase: number;
  wx: number;
  wy: number;
  wz: number;
}
export type DecorKind =
  | "building"
  | "tree"
  | "lamp"
  | "hydrant"
  | "bush"
  | "flowers"
  | "roadsign"
  | "overpass"
  | "puddle"
  | "sakura"
  | "lantern"
  | "ramen"
  | "machiya"
  | "house"
  | "village_house"
  | "guardrail"
  | "chevron"
  | "autumn_tree"
  | "rock"
  | "vending"
  | "mamachari"
  | "konbini"
  | "neon_sign"
  | "touge_sign"
  | "touge_lamp"
  | "billboard"
  | "jam_car"
  | "tower109"
  | "avenue_lamp"
  | "guard_fence"
  | "sidewalk_planter";
export interface Decor {
  kind: DecorKind;
  pos: Vec3;
  rotY: number;
  variant: number;
  spec?: BuildingSpec;
  /** placed on the camera side of the road (positive lat) => model is turned to face the road */
  frontSide?: boolean;
}
export interface Chunk {
  id: number;
  s0: number;
  kind: "street" | "park" | "haruna" | "shibuya";
  decor: Decor[];
}
export type MoverKind = "car" | "motorcycle" | "chicken" | "pedestrian" | "cat" | "dog";
export type MoverPhase = "drive" | "wait" | "hop" | "pause" | "hit";
export interface Mover {
  id: number;
  kind: MoverKind;
  rag?: Ragdoll;
  s: number;
  lat: number;
  lane: number;
  speed: number;
  variant: number;
  dir: number;
  h: number;
  vh: number;
  phase: MoverPhase;
  hopT: number;
  hopFrom: number;
  hopTo: number;
  pause: number;
  delay: number;
  warned: boolean;
  squash: number;
  spin: number;
  hitT: number;
  hitRagdoll?: boolean;
  /** anjing besar (Golden Retriever / Shepherd) vs anjing kecil (Shiba Inu / Corgi) */
  isBigDog?: boolean;
  /** batas lateral rute pejalan kaki, supaya penyeberang Shibuya tidak melewati mesin/pagar trotoar */
  crossingEdge?: number;
  /** perempatan tempat penyeberang menunggu lampu merah dan menahan arus kendaraan sampai aman */
  signalIntersectionId?: number;
  /** pejalan kaki lansia (kakek/nenek) — jalannya lambat, bungkuk, bawa tongkat */
  elderly?: boolean;
  /** timer asap knalpot untuk kendaraan yang sedang jalan */
  smokeT?: number;
  /** Smooth signal-controlled throttle for through-traffic approaching a red light. */
  signalSpeedK?: number;
  /** ban selip / lean visual motor */
  leanT?: number;
}

export type CrossingState = "idle" | "warning" | "clearing" | "done";
export interface Crossing {
  id: number;
  s: number;
  pos: Vec3;
  rotY: number;
  signPos: Vec3;
  signRotY: number;
  state: CrossingState;
  armT: number;
  timer: number;
  bellT: number;
  bellAlt: boolean;
  lightPhase: number;
  line: number;
  placed: boolean;
  trainScheduled: boolean;
  train: Train | null;
  rampLanes: number[];
}
export interface Train {
  id: number;
  crossing: Crossing;
  head: number;
  dir: number;
  speed: number;
  nCars: number;
  line: number;
  horned: boolean;
  rumbleT: number;
}
export function trainLength(tr: Train) {
  return tr.nCars * TRAIN_CAR_LEN + (tr.nCars - 1) * TRAIN_GAP;
}
export function trainCovers(tr: Train, lat: number) {
  const tail = tr.head - tr.dir * trainLength(tr);
  return lat >= Math.min(tr.head, tail) && lat <= Math.max(tr.head, tail);
}

/**
 * Jarak jalur jalan lintas dari titik tengah perempatan (jalur kiri masing-masing arah).
 * 2.0 = tepat di tengah panah jalur yang dicat di dek jalan lintas (lihat intersectionRoadParts).
 */
export const CROSS_LANE_OFFSET = 2.0;
/** Mobil penyeberang muncul di bibir jalan lintas (|lat| 18), sehingga tiba tepat waktu saat pemain sampai. */
export const CROSS_SPAWN_LAT = 18;
export const CROSS_DESPAWN_LAT = 22;

/** Tinggi DEK jalan lintas di perempatan (atas aspal: 0.145 + 0.06/2). Roda mobil penyeberang menapak di sini. */
export const CROSS_DECK_H = 0.175;
/** Dek jalan lintas mulai di |lat| 4.0 (lihat intersectionRoadParts di models.ts). */
export const CROSS_DECK_LAT = 4.0;
/** Ujung ramp curb-cut di model perempatan (box ramp di |lat| 3.6 → 4.0). */
export const CROSS_RAMP_START = 3.6;

/**
 * Tinggi mobil penyeberang di perempatan:
 * rata dengan jalan utama saat melintasi perempatan, lalu naik mulus lewat curb-cut
 * dan TEPAT setinggi dek jalan lintas mulai dari bibir dek (|lat| 4.0).
 * Sebelumnya ramp baru penuh di |lat| 4.2, jadi roda sempat terbenam ~9 cm di bibir dek.
 */
export function crossCarH(lat: number): number {
  const a = Math.abs(lat);
  if (a >= CROSS_DECK_LAT) return CROSS_DECK_H;
  if (a <= CROSS_RAMP_START) return 0;
  const u = (a - CROSS_RAMP_START) / (CROSS_DECK_LAT - CROSS_RAMP_START);
  const smooth = u * u * (3 - 2 * u); // halus di kedua ujung, tanpa lompatan
  return smooth * CROSS_DECK_H;
}

export interface Intersection {
  id: number;
  s: number;
  pos: Vec3;
  rotY: number;
  placed: boolean;
  signPos: Vec3;
  signRotY: number;
  spawnTimer1: number;
  spawnTimer2: number;
  trafficTimer: number;
  /** scramble signal begins its pedestrian phase as the player approaches, not while still far away */
  signalStarted?: boolean;
  lightState: "green" | "yellow" | "red";
  /** Shibuya Scramble Crossing: perempatan raksasa selebar avenue dengan zebra diagonal & kerumunan */
  scramble?: boolean;
  /** cross-street LEBAR 6 jalur (kadang muncul di semua mode biar perempatan tidak sempit) */
  wide?: boolean;
}

/** Center-of-car position that keeps its nose just behind the painted scramble stop bars. */
export const TRAFFIC_STOP_LINE_OFFSET = 8.2;

/** Smooth approach policy for through-traffic: green passes, red/yellow stop at the bar. */
export function trafficSignalApproach(
  carS: number,
  intersectionS: number,
  lightState: Intersection["lightState"],
): { targetK: number; stopLineS: number | null } {
  if (lightState === "green") return { targetK: 1, stopLineS: null };
  const stopLineS = intersectionS + TRAFFIC_STOP_LINE_OFFSET;
  const remaining = carS - stopLineS;
  if (remaining < -0.001 || remaining >= 24) return { targetK: 1, stopLineS: null };
  return { targetK: clamp(remaining / 12, 0, 1), stopLineS };
}

export interface CrossTrafficCar {
  id: number;
  intersectionId: number;
  s: number;
  lat: number;
  dir: 1 | -1;
  speed: number;
  variant: number;
  horn: boolean;
  passed: boolean;
  hitRagdoll?: boolean;
  /** timer asap knalpot */
  smokeT?: number;
  /** sedang menunggu di tepi perempatan (ada kendaraan jalan utama lewat) */
  waiting?: boolean;
  /** 0 = berhenti, 1 = jalan penuh (diperhalus biar tidak menghentak) */
  speedK?: number;
}

export type { TrickKind } from "./tricks";
export interface Trick {
  kind: TrickKind;
  t: number;
  dur: number;
}

/** Rigid-body ragdoll in the road frame: s (forward), lat (lateral), h (height). */
export interface Ragdoll {
  s: number;
  lat: number;
  h: number;
  vs: number;
  vlat: number;
  vh: number;
  rx: number;
  ry: number;
  rz: number;
  wx: number;
  wy: number;
  wz: number;
  radius: number;
  bounces: number;
  rest: boolean;
  restT: number;
  /** pengali gravitasi (hewan kartun = < 1 supaya melayang lebih lama) */
  gravityScale?: number;
  /** pengali koefisien pantulan (hewan = > 1 supaya mantul-mantul) */
  bouncy?: number;
}

function makeRagdoll(s: number, lat: number, h: number, radius: number): Ragdoll {
  return { s, lat, h, vs: 0, vlat: 0, vh: 0, rx: 0, ry: 0, rz: 0, wx: 0, wy: 0, wz: 0, radius, bounces: 0, rest: false, restT: 0 };
}

function stepRagdoll(r: Ragdoll, dt: number, floor: number, friction = 4.2, bounce = 0.28) {
  if (r.rest) {
    r.restT += dt;
    // Smoothly ease to nearest flat orientation without ANY snapping
    const q = Math.PI / 2;
    const targetRz = Math.round(r.rz / q) * q;
    const targetRx = Math.round(r.rx / q) * q;
    r.rz += (targetRz - r.rz) * (1 - Math.exp(-dt * 5));
    r.rx += (targetRx - r.rx) * (1 - Math.exp(-dt * 5));
    return;
  }
  r.vh -= GRAVITY * (r.gravityScale ?? 1) * dt;
  r.s += r.vs * dt;
  r.lat += r.vlat * dt;
  r.h += r.vh * dt;
  r.rx += r.wx * dt;
  r.ry += r.wy * dt;
  r.rz += r.wz * dt;

  // Air drag: gentle aerodynamic drag so the pigeon can soar far forward down the street
  const drag = Math.exp(-dt * 0.12);
  r.vs *= drag;
  r.vlat *= drag;
  const angDrag = Math.exp(-dt * 1.5);
  r.wx *= angDrag;
  r.wy *= angDrag;
  r.wz *= angDrag;

  if (r.h <= floor) {
    r.h = floor;
    if (r.vh < -0.8) {
      // Rubbery comical bounce: first bounce is high and springy, forward momentum preserved
      const bCoeff = Math.min(0.78, (r.bounces === 0 ? 0.48 : r.bounces === 1 ? 0.35 : 0.22) * (r.bouncy ?? 1));
      r.vh = -r.vh * bCoeff;
      r.vs *= 0.88; // skips forward on ground impact!
      r.bounces++;
      // Ground contact imparts a hilarious forward roll/somersault tumble from street friction
      const rollImpulse = -Math.sign(r.vs) * Math.min(Math.abs(r.vs) * 0.42, 3.2);
      r.wz = r.wz * 0.35 + rollImpulse;
      r.wx = r.wx * 0.35 + rand(-0.8, 0.8) * bounce;
      r.wy *= 0.35;
    } else {
      r.vh = 0;
    }
    // Ground friction: heavy road drag and rotational settling
    const f = Math.exp(-dt * friction);
    r.vs *= f;
    r.vlat *= f;
    r.wx *= Math.exp(-dt * 6.5);
    r.wy *= Math.exp(-dt * 6.0);
    r.wz *= Math.exp(-dt * 6.5);

    if (Math.abs(r.vs) < 0.22 && Math.abs(r.vlat) < 0.22 && Math.abs(r.vh) < 0.45) {
      r.rest = true;
      r.vs = r.vlat = r.vh = 0;
      r.wx = r.wy = r.wz = 0;
    }
  }
}

export interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  max: number;
  size: number;
  r: number;
  g: number;
  b: number;
  rx: number;
  ry: number;
  spin: number;
  gravity: number;
  floor: number;
  /** >1 = partikel membesar seiring umur (asap knalpot), default mengecil */
  grow?: number;
}

/**
 * Efek "denyut" tipis ala kartun: SATU cincin tipis yang mengembang dari titik
 * tabrakan lalu memudar. Dirender di World.tsx (Pulses) sebagai mesh additive.
 */
export interface Pulse {
  x: number;
  y: number;
  z: number;
  /** umur (detik) dan umur maksimum */
  t: number;
  max: number;
  /** jari-jari awal -> akhir (unit dunia) */
  r0: number;
  r1: number;
  /** warna 0..1 */
  cr: number;
  cg: number;
  cb: number;
}

export type InputAction = "tap" | "up" | "down" | "left" | "right" | "double" | "holdStart" | "holdEnd" | "nos" | "boost" | "cycle";

const TRICK_INFO = TRICK_MAP;

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
function wrapPi(a: number) {
  return ((((a + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;
}

const tmpS: TrackSample = { x: 0, y: 0, z: 0, th: 0, g: 0, kappa: 0 };
const tmpV = new THREE.Vector3();
const tmpQ = new THREE.Quaternion();

/* ---------- Engine ---------- */
class Engine {
  phase: Phase = "menu";
  time = 0;
  distance = START_S;
  runDistance = 0;
  runTime = 0;
  speed = MENU_SPEED;
  trickScore = 0;
  breadCount = 0;
  shake = 0;
  crashT = 0;
  overT = 0;
  hudT = 0;
  menuT = 0;
  /** time scale used for the GTA-style slow motion on impact */
  slowMo = 1;
  /** denyut kamera halus (zoom tipis) 1 -> 0 setelah hewan ditabrak */
  punch = 0;
  crashSpeed = 0;
  private pushDustT = 0;
  private downhillFlag = false;
  /** ambient cherry-blossom petals drifting across the road (world-space, recycled) */
  petals: { x: number; y: number; z: number; vx: number; vy: number; vz: number; rx: number; ry: number; rz: number; wr: number; ph: number }[] = [];
  private lastSwipeDir = 0;
  private lastSwipeT = -10;
  /** physics turning model state (NEW mode) and the mode it was last initialised for */
  turn = makeTurnState(0);
  private turnModeApplied: "old" | "new" | "" = "";
  get newTurn() {
    return useUI.getState().turnMode === "new";
  }
  /** index into the enabled-trick list for the sequential "S" freestyle cycle */
  cycleIndex = 0;
  menuTrickPending = false;

  obstacles: Obstacle[] = [];
  breads: Bread[] = [];
  chunks: Chunk[] = [];
  movers: Mover[] = [];
  crossings: Crossing[] = [];
  trains: Train[] = [];
  intersections: Intersection[] = [];
  crossCars: CrossTrafficCar[] = [];
  /** Efek roti tersedot ke badan merpati saat diambil — disimpan di ruang track
   *  (rel terhadap pemain) supaya ikut maju bersama pemain dan tidak "nembus bablas". */
  breadFx: { rel: number; lat: number; h: number; age: number }[] = [];
  puddles: Puddle[] = [];
  overpassCars: OverpassCar[] = [];
  roadSigns: Decor[] = [];
  // NOS
  nos = 0; // 0..NOS_MAX
  nosT = 0; // remaining boost time
  nosFlame = 0; // 0..1 visual intensity
  /** 0..1 current sprint intensity (drives visual forward lean and dust) */
  sprint = 0;
  sprintTimer = 0; // 2.0s countdown before decay
  sprintBonus = 0; // current active bonus (0.40, 0.50, 0.70...)
  sprintStage = 0; // stage 0, 1 (+40), 2 (+50), 3 (+70)...
  targetSprintBonus = 0;
  /** Responsive jump buffer (seconds) to jump the exact millisecond wheels touch the asphalt */
  jumpBuffer = 0;
  nosCans: { id: number; s: number; lane: number; taken: boolean; wx: number; wy: number; wz: number; phase: number }[] = [];
  /** Item LANGKA: roket NOS berkilau sinar. Jarang muncul, sekali ambil NOS penuh. */
  rockets: { id: number; s: number; lane: number; taken: boolean; kind: RareKind; wx: number; wy: number; wz: number; phase: number }[] = [];
  /** statistik: jumlah roket yang sudah diambil (untuk uji & pencapaian) */
  rocketTaken = 0;
  /** kilatan sinar saat roket diambil (0 = tidak ada) */
  rareFlash = 0;
  rareFlashPos: Vec3 = [0, 0, 0];
  rareFlashRGB: [number, number, number] = [1, 0.86, 0.42];
  nextNosS = 0;
  /** jarak (s) tempat roket langka berikutnya muncul */
  nextRocketS = 0;

  nextRoadworkS = 0;
  nextOverpassS = 0;
  holdT = -1;
  lastTapT = -10;
  wet = 0;
  nextCrossingS = 0;
  nextIntersectionS = 0;
  /** hitungan perempatan (untuk cadence Shibuya Scramble tiap 2 perempatan) */
  private interCount = 0;
  crashCause: CrashCause = "obstacle";
  particles: Particle[] = [];
  /** gelombang "denyut" yang sedang aktif (lihat Pulse) */
  pulses: Pulse[] = [];
  reserved: { lane: number; from: number; until: number }[] = [];
  listVersion = 0;
  moverVersion = 0;
  nextChunkS = 0;
  nextObstacleS = 0;
  center: TrackSample = { x: 0, y: 0, z: 0, th: 0, g: 0, kappa: 0 };
  private nextId = 1;
  private flipToggle = false;
  private sparkT = 0;
  private patternIndex = 0;

  player = {
    lane: 1,
    targetLane: 1,
    lat: 0,
    h: 0,
    vh: 0,
    grounded: true,
    grinding: false,
    rail: null as Obstacle | null,
    carMover: null as Mover | null,
    carObstacle: null as Obstacle | null,
    carGrace: 0,
    railGrace: 0,
    onRamp: false,
    trick: null as Trick | null,
    tricksThisAir: 0,
    bigAir: false,
    grindPts: 0,
    squash: 0,
    latVel: 0,
    latAcc: 0,
    /** NEW turn mode outputs (right-positive physical values; the renderer flips signs): */
    heading: 0,
    lean: 0,
    truckF: 0, // visual yaw of the front truck (three.js sign)
    truckR: 0, // visual yaw of the rear truck
    airBlend: 0,
    /** lean angle (rad) for body+board: + = leaning toward -z (left), derived from lateral acceleration */
    carve: 0,
    /** yaw twist of the board toward the movement direction (air carve / ground carve) */
    boardTwist: 0,
    /** heading of the whole rig relative to the road (rad): the board really turns toward where it is going */
    steer: 0,
    /** 0..1 "air lane change" gesture amount (wings out, body tilt) */
    airShift: 0,
    airT: 0,
    // visual outputs
    flip: 0,
    yaw: 0,
    showYaw: FRONT_YAW,
    grab: 0,
    boardYaw: 0,
    pitch: 0,
    roll: 0,
    wing: 0,
    crashVx: 0,
    crashVy: 0,
    body: null as Ragdoll | null,
    board: null as Ragdoll | null,
    impactDir: 1,
    limbT: 0,
    // push (kick) cycle: -1 = idle, otherwise 0..1 progress
    push: -1,
    pushCooldown: 0.6,
    pushCount: 0,
    // world transform
    wx: 0,
    wy: 0,
    wz: 0,
    quat: new THREE.Quaternion(),
  };

  constructor() {
    this.reset();
  }

  get score() {
    return Math.floor(this.runDistance) + this.trickScore + this.breadCount * 10;
  }

  reset() {
    const currentMode = useUI.getState().trackMode || "haruna";
    track.reset(currentMode);
    track.ensure(280);
    this.distance = START_S;
    this.runDistance = 0;
    this.runTime = 0;
    this.speed = this.phase === "menu" ? MENU_SPEED : START_SPEED * 0.6;
    this.trickScore = 0;
    this.breadCount = 0;
    this.shake = 0;
    this.crashT = 0;
    this.overT = 0;
    this.menuT = 0;
    this.menuTrickPending = false;
    this.obstacles = [];
    this.breads = [];
    this.chunks = [];
    this.movers = [];
    this.crossings = [];
    this.trains = [];
    this.intersections = [];
    this.interCount = 0;
    this.crossCars = [];
    this.breadFx = [];
    this.puddles = [];
    this.overpassCars = [];
    this.roadSigns = [];
    this.sprint = 0;
    this.sprintTimer = 0;
    this.sprintBonus = 0;
    this.sprintStage = 0;
    this.targetSprintBonus = 0;
    this.jumpBuffer = 0;
    this.nos = 0;
    this.nosT = 0;
    this.nosFlame = 0;
    this.nosCans = [];
    this.rockets = [];
    this.rocketTaken = 0;
    this.rareFlash = 0;
    this.rareFlashRGB = [1, 0.86, 0.42];
    this.nextNosS = this.distance + 70;
    this.cycleIndex = 0;
    this.nextRoadworkS = this.distance + 120 + rand(0, 60);
    this.nextOverpassS = this.distance + 90 + rand(0, 40);
    this.holdT = -1;
    this.lastTapT = -10;
    this.wet = 0;
    this.nextCrossingS = START_S + FIRST_CROSSING_M;
    this.nextIntersectionS = START_S + 68;
    this.nextRocketS = START_S + ROCKET_FIRST_S; // roket pertama muncul agak awal biar pemain lihat itemnya
    this.particles = [];
    this.reserved = [];
    this.nextChunkS = 0;
    this.nextObstacleS = this.distance + 40;
    this.patternIndex = 0;
    const p = this.player;
    p.lane = 1;
    p.targetLane = 1;
    p.lat = 0;
    p.h = 0;
    p.vh = 0;
    p.grounded = true;
    p.grinding = false;
    p.rail = null;
    p.carMover = null;
    p.carObstacle = null;
    p.carGrace = 0;
    p.railGrace = 0;
    p.onRamp = false;
    p.trick = null;
    p.tricksThisAir = 0;
    p.bigAir = false;
    p.grindPts = 0;
    p.squash = 0;
    p.latVel = 0;
    p.latAcc = 0;
    p.heading = 0;
    p.lean = 0;
    p.truckF = 0;
    p.truckR = 0;
    p.airBlend = 0;
    p.carve = 0;
    p.boardTwist = 0;
    p.steer = 0;
    p.airShift = 0;
    p.airT = 0;
    p.flip = 0;
    p.yaw = 0;
    p.showYaw = FRONT_YAW;
    p.grab = 0;
    p.pitch = 0;
    p.roll = 0;
    p.wing = 0;
    resetTurnState(this.turn, 0);
    p.body = null;
    p.board = null;
    p.limbT = 0;
    p.push = -1;
    p.pushCooldown = 0.6;
    p.pushCount = 0;
    this.slowMo = 1;
    this.punch = 0;
    this.pulses = [];
    this.downhillFlag = false;
    while (this.nextChunkS < this.distance + 90) this.spawnChunk();
    track.sample(this.distance, this.center);
    this.updateTransform();
    this.listVersion++;
    this.moverVersion++;
  }

  startRun() {
    if (this.phase !== "menu") {
      this.phase = "playing";
      this.reset();
    }
    this.phase = "playing";
    this.runTime = 0;
    this.runDistance = 0;
    this.nextObstacleS = this.distance + 34;
    // hop off the podium, turning to face down the road
    const p = this.player;
    p.showYaw = wrapPi(p.showYaw);
    p.trick = null;
    p.flip = 0;
    p.grinding = false;
    p.carMover = null;
    p.carObstacle = null;
    p.carGrace = 0;
    p.onRamp = false;
    p.grounded = false;
    p.h = Math.max(p.h, PODIUM_H);
    p.vh = 4.5;
    p.airT = 0;
    useUI.getState().setPhase("playing");
    useUI.getState().setHud(0, 0, 0, 0, 0, false);
    sfx.start();
  }

  /** Turn the showcase pigeon to face the camera (used when opening menu panels). */
  faceCamera() {
    if (this.phase !== "menu") return;
    this.player.showYaw = FRONT_YAW;
    this.menuT = 0;
  }

  setTrackMode(mode: "tokyo" | "haruna" | "shibuya") {
    track.reset(mode);
    this.reset();
    this.listVersion++;
    this.moverVersion++;
  }

  /** Little hop + squash when the player browses to another skin in the menu. */
  skinPop() {
    if (this.phase !== "menu") return;
    const p = this.player;
    p.showYaw = FRONT_YAW;
    p.squash = 1;
    this.menuT = 0;
    if (p.grounded) {
      p.trick = null;
      p.flip = 0;
      this.jump(5);
    }
    this.emit("dust", 0, PODIUM_H + 0.05, 0, 8);
  }

  toMenu() {
    this.phase = "menu";
    this.reset();
    useUI.getState().setPhase("menu");
    useUI.getState().setMenuView("main");
  }

  /* ---------- Input ---------- */
  input(a: InputAction) {
    if (this.phase === "menu") return;
    if (this.phase === "gameover") {
      if (this.overT > 0.6) this.startRun();
      return;
    }
    if (this.phase !== "playing") return;
    const p = this.player;
    const airborne = !p.grounded && !p.grinding;
    // Subway-Surfers scheme: swipe left/right = change lane, swipe up = jump, swipe down = shuv-it / fast fall
    // lane 0 = left (far side), 2 = right (camera side)
    switch (a) {
      case "left":
      case "right": {
        // Swipe ↔ = lane change (also in the air: a smooth carve/drift). The 360 spin is a deliberate move:
        // a second swipe in the same direction within 0.3 s, or a swipe toward the edge when no lane is left.
        // NEW turn mode: while grinding a rail the board is locked to the rail lane (no diagonal moves on a rail);
        // jump off first, then steer. On cars, player can steer/dismount to adjacent lanes.
        if (this.newTurn && p.grinding && p.rail) break;
        const dir = a === "left" ? -1 : 1;
        const now = this.time;
        const repeat = this.lastSwipeDir === dir && now - this.lastSwipeT < 0.3;
        this.lastSwipeDir = dir;
        this.lastSwipeT = now;
        const nextLane = p.targetLane + dir;
        const canMove = nextLane >= 0 && nextLane <= 2;
        if (airborne && (repeat || !canMove)) {
          if (this.tryTrick(dir < 0 ? "swipeL" : "swipeR")) break;
        }
        if (canMove) {
          p.targetLane = nextLane;
          sfx.swish();
        }
        break;
      }
      case "up": {
        const groundY = this.groundInfo(p.lat).y;
        const nearGround = !airborne || p.h <= groundY + 0.35 || (p.vh <= 0.5 && p.h <= groundY + 0.6);
        if (nearGround) {
          this.jump();
        } else if (p.vh < 0 && p.h - groundY < 1.6) {
          this.jumpBuffer = 0.25;
        } else {
          this.tryTrick("swipeUp");
        }
        break;
      }
      case "down":
        if (airborne) {
          if (!this.tryTrick("swipeDown")) {
            // fast fall
            p.vh = Math.min(p.vh, -6);
          }
        }
        break;
      case "tap": {
        const groundY = this.groundInfo(p.lat).y;
        const nearGround = !airborne || p.h <= groundY + 0.35 || (p.vh <= 0.5 && p.h <= groundY + 0.6);
        if (nearGround) {
          this.jump();
        } else if (p.vh < 0 && p.h - groundY < 1.6) {
          this.jumpBuffer = 0.25;
        } else {
          this.tryTrick("tap");
        }
        break;
      }
      case "double":
        if (airborne) this.tryTrick("double");
        break;
      case "holdStart":
        this.holdT = 0;
        break;
      case "holdEnd":
        this.holdT = -1;
        break;
      case "nos":
        this.fireNos();
        break;
      case "boost":
        this.boost();
        break;
      case "cycle":
        // "S": run the enabled tricks in catalog order, one per press (auto-ollie when on the ground)
        this.cycleTrick();
        break;
    }
  }

  /** Sequential freestyle: each press performs the next enabled trick in the list (wraps around). */
  cycleTrick() {
    const p = this.player;
    if (p.trick) return;
    const on = useUI.getState().tricksOn;
    const list = TRICKS.filter((t) => on[t.kind]);
    if (!list.length) return;
    const airborne = !p.grounded && !p.grinding;
    if (!airborne) {
      // pop an ollie first; the trick starts on the next press (or immediately after take-off if queued)
      this.jump();
      this.queuedCycle = true;
      return;
    }
    this.queuedCycle = false;
    // find the next trick that is possible right now (big-air tricks need a ramp launch)
    for (let k = 0; k < list.length; k++) {
      const t = list[(this.cycleIndex + k) % list.length];
      if (t.bigAirOnly && !(p.bigAir && p.airT > 0.12)) continue;
      this.cycleIndex = (this.cycleIndex + k + 1) % list.length;
      if (t.kind === "coo540") this.startTrick("coo540", t.dur, this.flipToggle ? -1 : 1);
      else this.startTrick(t.kind, t.dur);
      useUI.getState().setCycle(this.cycleIndex);
      return;
    }
  }
  private queuedCycle = false;

  /** SHIFT / boost button: sprint kicks that advance speed (+40 -> +50 -> +70) on each press, with a 2s timer before decaying smoothly back to normal. */
  boost() {
    if (this.phase !== "playing" || this.nosT > 0) return;
    // The shared sprint/NOS button fires a full can before stacking another sprint tier.
    if (this.nos >= NOS_MAX * 0.99) {
      this.fireNos();
      return;
    }

    // Advance sprint stage:
    // If within active 2s window or currently boosted, stack up to the next tier!
    if (this.sprintTimer > 0 || this.sprintBonus > 0.05) {
      this.sprintStage = Math.min(6, this.sprintStage + 1);
    } else {
      this.sprintStage = 1;
    }

    // Reset 2.0-second timer ("jika dlm 2 detik ga dipencet")
    this.sprintTimer = SPRINT_WINDOW;

    // Determine target speed bonus:
    // Stage 1: +40% (0.40)
    // Stage 2: +50% (0.50)
    // Stage 3: +70% (0.70)
    // Stage 4+: +85%, +100%...
    let bonus = 0.40;
    let label = "+40";
    let color = "#2ec4b6";
    let sub = "SPRINT! 🛹💨";

    if (this.sprintStage === 1) {
      bonus = 0.40;
      label = "+40";
      color = "#2ec4b6";
      sub = "SPRINT! 🛹💨";
    } else if (this.sprintStage === 2) {
      bonus = 0.50;
      label = "+50";
      color = "#3a86ff";
      sub = "NAIK LAGI! 🔥";
    } else if (this.sprintStage === 3) {
      bonus = 0.70;
      label = "+70";
      color = "#ff9f1c";
      sub = "SUPER NAIK! ⚡";
    } else {
      const extra = (this.sprintStage - 3) * 15;
      const total = Math.min(110, 70 + extra);
      bonus = total / 100;
      label = `+${total}`;
      color = "#f72585";
      sub = "MAX SPEED! 🚀";
    }

    this.targetSprintBonus = bonus;

    // Initiate smooth foot kick ("ngayun pake kaki") if grounded
    if (this.player.grounded && !this.player.grinding) {
      this.player.pushCooldown = 0;
      if (this.player.push < 0) {
        this.player.push = 0; // begins the smooth kick stroke
      }
    }

    // Direct kinetic kick impulse
    const m = this.speedMult;
    const target = (this.targetSpeed() + Math.max(0, -this.center.g) * 9 * m) * (1 + bonus);
    this.speed = Math.min(target, this.speed + 1.8 * m);

    // Dust particles from kick
    this.emit("dust", -0.45, 0.03, this.player.lat + 0.28, 4);

    useUI.getState().addPopup(`${label} SPRINT`, color, sub);
    sfx.sprint();
  }

  /** Activate NOS: 2.6 s of boost, flames, camera FOV kick. */
  fireNos() {
    if (this.phase !== "playing" || this.nosT > 0 || this.nos < NOS_MAX * 0.99) return;
    this.nos = 0;
    this.nosT = NOS_DURATION;
    this.shake = Math.max(this.shake, 0.35);
    useUI.getState().addPopup("NOS!", "#4cc9f0", "hold on!");
    sfx.nos();
  }

  addNos(v: number) {
    if (this.nosT > 0) return;
    const before = this.nos;
    this.nos = Math.min(NOS_MAX, this.nos + v);
    if (before < NOS_MAX && this.nos >= NOS_MAX) {
      sfx.nosReady();
    }
  }

  /** Pick the enabled trick bound to this input (big-air variants take priority off a ramp). */
  private tryTrick(input: "tap" | "swipeL" | "swipeR" | "swipeUp" | "swipeDown" | "double" | "hold"): boolean {
    const p = this.player;
    if (p.trick) return false;
    const on = useUI.getState().tricksOn;
    const candidates = TRICKS.filter((t) => on[t.kind] && (t.input === input || (input === "swipeR" && t.kind === "coo540")));
    if (!candidates.length) return false;
    let pickT = candidates.find((t) => t.bigAirOnly && p.bigAir && p.airT > 0.12) ?? candidates.find((t) => !t.bigAirOnly);
    if (!pickT) return false;
    if (pickT.kind === "kickflip" || pickT.kind === "heelflip") {
      const kf = on.kickflip;
      const hf = on.heelflip;
      if (kf && hf) pickT = TRICK_MAP[this.flipToggle ? "heelflip" : "kickflip"];
      else pickT = TRICK_MAP[kf ? "kickflip" : "heelflip"];
    }
    if (pickT.kind === "coo540" && input === "swipeR") this.startTrick("coo540", pickT.dur, -1);
    else this.startTrick(pickT.kind, pickT.dur);
    return true;
  }

  private jump(v = JUMP_V) {
    const p = this.player;
    if (p.grinding) {
      if (p.carMover || p.carObstacle) this.endCarGrind();
      else this.endGrind();
    }
    p.grounded = false;
    p.grinding = false;
    p.onRamp = false;
    this.jumpBuffer = 0;
    // Vertical jump height is independent of speed mode; 2×/3× only changes forward travel speed.
    p.vh = v;
    p.airT = 0;
    sfx.jump();
  }

  private startTrick(kind: TrickKind, dur = TRICK_INFO[kind].dur, dir = 1) {
    const p = this.player;
    if (p.trick) return;
    if (kind === "kickflip" || kind === "heelflip") this.flipToggle = !this.flipToggle;
    p.trick = { kind, t: 0, dur };
    this.trickDir = dir;
    if (kind === "wingflap") sfx.whoosh();
  }
  private trickDir = 1;

  private completeTrick() {
    const p = this.player;
    const tr = p.trick;
    if (!tr) return;
    p.trick = null;
    p.flip = 0;
    if (this.phase !== "playing") return;
    const info = TRICK_INFO[tr.kind];
    p.tricksThisAir++;
    const mult = p.tricksThisAir;
    const pts = info.pts * mult;
    this.trickScore += pts;
    this.addNos(NOS_PER_TRICK * mult);
    useUI.getState().addPopup(`${info.name} +${pts}`, info.color, mult > 1 ? `COMBO x${mult}` : undefined);
    if (mult > 1) sfx.bigTrick();
    else sfx.trick();
  }

  /** Grind height along a rail: flat rails are RAIL_H; kinked rails start higher and slope down in the middle. */
  railHeightAt(o: Obstacle, s: number) {
    if (o.variant !== 1) return RAIL_H;
    const half = obstacleHalf(o);
    const rel = (s - o.s) / half; // -1..1
    const extra = 0.4;
    if (rel < -0.2) return RAIL_H + extra;
    if (rel < 0.2) return RAIL_H + (extra * (0.2 - rel)) / 0.4;
    return RAIL_H;
  }

  private startGrind(rail: Obstacle) {
    const p = this.player;
    p.grinding = true;
    p.grounded = false;
    p.rail = rail;
    p.h = this.railHeightAt(rail, this.distance);
    p.vh = 0;
    p.grindPts = 0;
    if (p.trick) {
      p.trick.t = p.trick.dur;
      this.completeTrick();
    }
    useUI.getState().addPopup("GRIND!", "#ff9f1c");
    sfx.grind();
  }

  private endGrind() {
    const p = this.player;
    if (!p.grinding) return;
    p.grinding = false;
    p.rail = null;
    p.railGrace = 0.3;
    const base = Math.max(10, Math.round(p.grindPts / 10) * 10);
    p.tricksThisAir++;
    const pts = base * p.tricksThisAir;
    this.trickScore += pts;
    useUI.getState().addPopup(`GRIND +${pts}`, "#ff9f1c", p.tricksThisAir > 1 ? `COMBO x${p.tricksThisAir}` : undefined);
    sfx.trick();
  }

  private startCarGrind(car: Mover | Obstacle, isOncoming = true) {
    const p = this.player;
    p.grinding = true;
    p.grounded = false;
    p.carMover = isOncoming ? (car as Mover) : null;
    p.carObstacle = !isOncoming ? (car as Obstacle) : null;
    if (!isOncoming) {
      const obs = car as Obstacle;
      if (obs.catVariant !== undefined && !obs.catHit) {
        obs.catHit = true;
        this.launchCatFromCar(obs);
      }
    }
    p.rail = null;
    p.h = CAR_ROOF_H;
    p.vh = 0;
    p.squash = 0.4;
    p.grindPts = 0;
    if (isOncoming) {
      (car as Mover).squash = 0.25;
    }
    if (p.trick) {
      p.trick.t = p.trick.dur;
      this.completeTrick();
    }
    useUI.getState().addPopup(isOncoming ? "CAR SURF! 🛹" : "ROOF GRIND! 🛹", "#00f5d4", "car roof!");
    sfx.grind();
    this.emit("spark", -0.5, CAR_ROOF_H - 0.05, p.lat, 4);
  }

  private endCarGrind() {
    const p = this.player;
    if (!p.grinding && !p.carMover && !p.carObstacle) return;
    p.grinding = false;
    p.carMover = null;
    p.carObstacle = null;
    p.rail = null;
    p.carGrace = 0.45;
    p.railGrace = 0.2;
    const base = Math.max(30, Math.round(p.grindPts / 10) * 10);
    p.tricksThisAir++;
    const pts = base * p.tricksThisAir;
    this.trickScore += pts;
    this.addNos(NOS_PER_TRICK * p.tricksThisAir);
    useUI.getState().addPopup(`CAR SURF +${pts}`, "#00f5d4", p.tricksThisAir > 1 ? `COMBO x${p.tricksThisAir}` : "CLEAN DISMOUNT! ✨");
    sfx.trick();
  }

  private land() {
    const p = this.player;
    p.grounded = true;
    p.vh = 0;
    p.squash = 1;
    if (p.trick) {
      const tr = p.trick;
      const prog = tr.t / tr.dur;
      if (prog < 0.72) {
        p.trick = null;
        p.flip = 0;
        if (this.phase === "playing") {
          useUI.getState().addPopup("SKETCHY!", "#ff6b6b");
          sfx.sketchy();
        }
      } else {
        tr.t = tr.dur;
        this.completeTrick();
      }
    }
    if (this.phase === "playing" && p.bigAir && p.tricksThisAir === 0) {
      this.trickScore += 20;
      useUI.getState().addPopup("BIG AIR +20", "#ff2e93");
    }
    p.tricksThisAir = 0;
    p.bigAir = false;
    p.yaw = 0;
    this.emit("dust", 0, p.h + 0.05, p.lat, 6);
    sfx.land();

    // If jump was buffered as wheels touch the asphalt, jump immediately!
    if (this.jumpBuffer > 0) {
      this.jumpBuffer = 0;
      this.jump();
    }
  }

  /**
   * GTA-style crash: the pigeon becomes a rigid body launched by the collision, the board flies off
   * separately, the world keeps its momentum (speed decays instead of stopping dead) and time briefly slows.
   */
  private crash(cause: CrashCause = "obstacle", opts: { hardness?: number; side?: number } = {}) {
    if (this.phase !== "playing") return;
    this.crashCause = cause;
    const p = this.player;
    this.phase = "crashed";
    this.crashT = 0;
    this.shake = 1;
    this.crashSpeed = this.speed;
    this.slowMo = 0.24;
    p.trick = null;
    p.grinding = false;
    p.carMover = null;
    p.carObstacle = null;
    p.carGrace = 0;
    p.grab = 0;
    const v = Math.max(this.speed, 8);
    const hard = opts.hardness ?? 1; // 1 = solid wall (car/train), lower = soft (chicken, pedestrian)
    const side = opts.side ?? (p.lat > 0.3 ? 1 : p.lat < -0.3 ? -1 : Math.random() < 0.5 ? 1 : -1);

    // Obstacle hit
    const hitObs = this.obstacles.find(
      (o) => o.kind !== "ramp" && o.kind !== "rail" && Math.abs(o.s - this.distance) <= obstacleHalf(o) + 1.2 && Math.abs(LANE_LAT[o.lane] - p.lat) <= 1.2
    );
    if (hitObs && hitObs.catVariant !== undefined && !hitObs.catHit) {
      hitObs.catHit = true;
      this.launchCatFromCar(hitObs);
    }
    const obsTop = hitObs ? OBSTACLE_DEFS[hitObs.kind].height : 0.8;
    const initialH = Math.max(p.h, obsTop * 0.65) + 0.45;
    const initialS = this.distance + 0.35;

    // Body: catapulted FORWARD and HIGH UP into the stratosphere with epic forward momentum!
    // Stunt-man flight: launches high above the city avenue in a dramatic soaring parabola!
    const body = makeRagdoll(initialS, p.lat, initialH, 0.35);
    // Forward velocity: rockets forward at 135% to 170% of speed + bonus push!
    body.vs = v * (1.35 + rand(0.15, 0.35)) + rand(2.5, 5.0);
    // Upward launch velocity: high vaulted trajectory soaring over obstacles
    body.vh = 7.8 + Math.min(v, 18) * 0.28 * hard + rand(1.0, 2.5);
    // Lateral deflection
    body.vlat = side * (1.2 + rand(0.4, 1.0));
    // Comical forward somersault tumble
    body.wz = -(3.2 + Math.min(v, 14) * 0.15);
    body.wx = side * rand(1.5, 2.8);
    body.wy = rand(-0.8, 0.8);
    p.body = body;
    // board: clatters and skids away low
    const board = makeRagdoll(this.distance + 0.1, p.lat, p.h + 0.12, 0.08);
    board.vs = v * 0.75 + rand(0.5, 1.5);
    board.vh = 1.6 + rand(0, 0.8);
    board.vlat = -side * rand(0.4, 1.2);
    board.wz = rand(4, 7);
    board.wy = rand(-2, 2);
    board.wx = rand(-2, 2);
    p.board = board;
    p.impactDir = side;
    p.limbT = 0;
    this.emit("feather", 0, p.h + 0.5, p.lat, 42);
    this.emit("dust", 0, 0.05, p.lat, 24);
    sfx.crash();
    sfx.bonk();
    sfx.whoosh();
    useUI.getState().setPhase("crashed");
  }

  /* ---------- Main update ---------- */
  /** Skate speed multiplier from the menu setting (NORMAL / 2x / 3x). Only the board goes faster —
   *  the world, animations and timers run at normal time. */
  get speedMult() {
    return useUI.getState().speedMode;
  }

  /** Target cruising speed for the current run time (before NOS / downhill). */
  targetSpeed(runTime = this.runTime) {
    const m = this.speedMult;
    return Math.min(MAX_SPEED * m, (START_SPEED + ACCEL * runTime) * m);
  }

  update(rawDt: number) {
    let dt = Math.min(rawDt, 0.05);
    this.time += dt;
    const p = this.player;

    if (this.jumpBuffer > 0) {
      this.jumpBuffer = Math.max(0, this.jumpBuffer - dt);
      const groundY = this.groundInfo(p.lat).y;
      if (p.grounded || p.h <= groundY + 0.05) {
        this.jumpBuffer = 0;
        this.jump();
      }
    }

    // sprint: active for 2.0s after each press, then smoothly decays back to normal ("perlahan")
    if (this.phase === "playing") {
      if (this.sprintTimer > 0) {
        this.sprintTimer = Math.max(0, this.sprintTimer - dt);
        this.sprintBonus = lerp(this.sprintBonus, this.targetSprintBonus, 1 - Math.exp(-dt * 14));
      } else {
        // 2 seconds have passed without pressing Shift:
        // "lalu normal lagi perlahan jika dlm 2 detik ga dipencet"
        this.sprintBonus = lerp(this.sprintBonus, 0, 1 - Math.exp(-dt * 1.6));
        if (this.sprintBonus < 0.01) {
          this.sprintBonus = 0;
          this.sprintStage = 0;
          this.targetSprintBonus = 0;
        }
      }
      this.sprint = clamp(this.sprintBonus / 0.70, 0, 1);
    } else {
      this.sprint = 0;
      this.sprintTimer = 0;
      this.sprintBonus = 0;
      this.sprintStage = 0;
      this.targetSprintBonus = 0;
    }

    // speed
    if (this.phase === "menu") {
      this.speed = lerp(this.speed, MENU_SPEED, 1 - Math.exp(-dt * 3));
    } else if (this.phase === "playing") {
      this.runTime += dt;
      const boost = Math.max(0, -this.center.g) * 9; // downhill = faster (a 30% grade adds ~2.7)
      // "DOWNHILL!" callout when a descent begins
      if (this.center.g < -0.12 && !this.downhillFlag) {
        this.downhillFlag = true;
        useUI.getState().addPopup("DOWNHILL!", "#4cc9f0", "hold on tight");
        sfx.whoosh();
      } else if (this.center.g > -0.04) this.downhillFlag = false;
      const m = this.speedMult;
      // sprint raises the cruising target significantly, then the bonus fades out with the sprint
      const target = (this.targetSpeed() + boost * m) * (1 + this.sprintBonus);
      // the pigeon accelerates by kicking: powerful forward propulsion during foot contact ("ngayun pake kaki")
      const kicking = this.pushContact && p.grounded;
      const sprintThrust = this.sprintBonus > 0 ? 1 + 2.0 * this.sprintBonus : 1;
      const up = (kicking ? dt * (18 + 24 * this.sprintBonus) : dt * (2.8 + 4.0 * this.sprintBonus)) * m * sprintThrust;
      if (this.nosT > 0) {
        // nitro: shoot to the boosted speed, then decay back once it runs out
        this.nosT = Math.max(0, this.nosT - dt);
        const boosted = target * NOS_SPEED_MULT;
        this.speed += clamp(boosted - this.speed, -dt * 2.5, dt * 40);
      } else {
        const decayRate = this.sprintTimer > 0 ? -dt * 1.5 : -dt * 2.4;
        this.speed += clamp(target - this.speed, decayRate, up);
      }
      this.nosFlame = lerp(this.nosFlame, this.nosT > 0 ? 1 : 0, 1 - Math.exp(-dt * (this.nosT > 0 ? 18 : 5)));
      if (kicking) {
        if (this.sprintBonus > 0) {
          // Direct kinetic push propulsion on every foot contact when sprinting
          this.speed = Math.min(target, this.speed + dt * 10 * this.sprintBonus * m);
        }
        this.pushDustT -= dt;
        if (this.pushDustT <= 0) {
          this.pushDustT = 0.08;
          this.emit("dust", -0.45, 0.03, p.lat + 0.28, this.sprintBonus > 0.3 ? 3 : 1);
          if (this.sprintBonus > 0.4) {
            this.emit("spark", -0.5, 0.04, p.lat + 0.28, 1);
          }
        }
      }
      this.runDistance += this.speed * dt;
    } else {
      // GTA-style: slow motion for a moment, momentum bleeds off, camera follows the tumbling body
      this.slowMo = Math.min(1, this.slowMo + dt * 0.55);
      dt *= this.slowMo;
      this.speed = Math.max(0, this.speed - dt * 14);
      this.crashT += dt;
      if (this.phase === "crashed" && this.crashT > 3.8) {
        this.phase = "gameover";
        this.overT = 0;
        useUI.getState().finishRun(this.score, this.breadCount, this.crashCause);
        sfx.coo();
      }
      if (this.phase === "gameover") this.overT += dt;
    }
    this.distance += this.speed * dt;
    if ((this.phase === "crashed" || this.phase === "gameover") && this.player.body) {
      // camera eases toward the body as it slides ahead
      const target = this.player.body.s - 1.2;
      if (target > this.distance) this.distance += (target - this.distance) * (1 - Math.exp(-dt * 4));
    }
    track.sample(this.distance, this.center);
    this.shake = Math.max(0, this.shake - dt * 2.5);
    this.punch = Math.max(0, this.punch - dt * 3.4);
    // kilatan sinar roket langka mereda dalam RARE_FLASH_T detik
    this.rareFlash = Math.max(0, this.rareFlash - dt);

    // world generation
    track.ensure(this.distance + 240);
    while (this.nextChunkS < this.distance + 90) this.spawnChunk();
    if (this.phase === "playing") while (this.nextObstacleS < this.distance + 70) this.spawnGroup();
    this.cull();

    this.updateMovers(dt);
    this.updateOverpass(dt);
    this.updateCrossings(dt);
    this.updateIntersections(dt);
    this.updateCrossCars(dt);
    if (this.phase === "menu" || this.phase === "playing") this.updatePlayer(dt);
    else this.updateCrash(dt);

    this.updateParticles(dt);
    this.updatePulses(dt);
    this.updatePetals(dt);
    this.updateTransform();

    this.hudT += dt;
    if (this.hudT > 0.1) {
      this.hudT = 0;
      if (this.phase === "playing") useUI.getState().setSprint(this.sprintBonus, this.nosT <= 0, this.sprintStage);
      if (this.phase === "playing") useUI.getState().setHud(this.score, this.breadCount, p.tricksThisAir, Math.floor(this.runDistance), this.nos, this.nosT > 0);
    }
  }

  private updateTransform() {
    const p = this.player;
    if (p.body && (this.phase === "crashed" || this.phase === "gameover")) {
      const b = p.body;
      track.frame(b.s, b.lat, b.h - b.radius, tmpV);
      p.wx = tmpV.x;
      p.wy = tmpV.y;
      p.wz = tmpV.z;
      track.quat(b.s, p.quat);
      return;
    }
    const c = this.center;
    p.wx = c.x - Math.sin(c.th) * p.lat;
    p.wy = c.y + p.h;
    p.wz = c.z + Math.cos(c.th) * p.lat;
    track.quat(this.distance, p.quat);
  }

  private groundInfo(lat: number): { y: number; ramp: Obstacle | null } {
    const d = this.distance;
    if (Math.abs(d - START_S) < PODIUM_R && Math.abs(lat) < PODIUM_R) return { y: PODIUM_H, ramp: null };
    for (const o of this.obstacles) {
      if (o.kind !== "ramp") continue;
      const rel = d - o.s;
      const def = OBSTACLE_DEFS.ramp;
      if (Math.abs(rel) > def.halfLen) continue;
      if (Math.abs(LANE_LAT[o.lane] - lat) > 1.0) continue;
      return { y: (def.height * (rel + def.halfLen)) / (def.halfLen * 2), ramp: o };
    }
    return { y: 0, ramp: null };
  }

  private updatePlayer(dt: number) {
    const p = this.player;
    const d = this.distance;

    // menu showcase: turntable + idle tricks on the podium
    if (this.phase === "menu") {
      this.menuT += dt;
      p.showYaw = (p.showYaw + dt * 0.35) % (Math.PI * 2);
      if (p.grounded && this.menuT > 3.4) {
        this.menuT = 0;
        this.jump(7.5);
        this.menuTrickPending = true;
      }
      if (this.menuTrickPending && !p.grounded && p.airT > 0.06) {
        this.menuTrickPending = false;
        this.startTrick(pick(["kickflip", "heelflip", "spinL", "spinR", "shuvit", "method", "impossible"] as TrickKind[]), 0.45);
      }
    } else {
      // un-spin after leaving the podium
      p.showYaw *= Math.exp(-dt * 6);
      if (Math.abs(p.showYaw) < 0.005) p.showYaw = 0;
    }

    const tl = LANE_LAT[p.targetLane];
    const airborneNow = !p.grounded && !p.grinding;
    const newTurn = this.newTurn;
    const prevVel = p.latVel;
    // switching mode mid-run (or the first frame): start the physics model from the current pose
    const modeNow = newTurn ? "new" : "old";
    if (this.turnModeApplied !== modeNow) {
      this.turnModeApplied = modeNow;
      resetTurnState(this.turn, p.lat);
      this.turn.latVel = p.latVel;
      p.heading = 0;
      p.lean = 0;
      p.truckF = 0;
      p.truckR = 0;
    }
    if (newTurn) {
      // ---- NEW: lateral motion is a CONSEQUENCE of the board's heading (wheel steering) ----
      // lane target -> reference -> desired heading -> bicycle-model inversion -> lean -> trucks -> yaw -> heading
      // -> lateral speed = sin(heading) * forward speed. Position is never set directly.
      const T = this.turn;
      T.lat = p.lat;
      T.latVel = p.latVel;
      stepTurn(T, {
        target: tl,
        fwd: this.speed,
        air: airborneNow,
        grind: p.grinding,
        minLat: LANE_LAT[0] - 0.35,
        maxLat: LANE_LAT[2] + 0.35,
        dt,
      });
      p.lat = T.lat;
      p.latVel = T.latVel;
      p.heading = T.heading;
      p.lean = T.lean;
      p.airBlend = T.airBlend;
      // truck yaws for the renderer (three.js: +yaw turns the nose to -z, so right = negative). The rear counter-steers.
      p.truckF = -T.sF;
      p.truckR = -rearOf(T.sF);
    } else {
      // ---- OLD: critically damped spring => smooth ease-in / ease-out with no snap,
      // slightly softer in the air (the pigeon "drifts" across) than on the ground (a quick carve)
      const omega = (airborneNow ? 10.5 : 11) * Math.sqrt(this.speedMult); // natural frequency (rad/s), stiffer for faster boards
      // exact integration of the critically damped spring x'' + 2ωx' + ω²(x - tl) = 0
      const x0 = p.lat - tl;
      const v0 = p.latVel;
      const e = Math.exp(-omega * dt);
      const c2 = v0 + omega * x0;
      p.lat = tl + (x0 + c2 * dt) * e;
      p.latVel = (v0 - omega * c2 * dt) * e;
      if (Math.abs(tl - p.lat) < 0.004 && Math.abs(p.latVel) < 0.02) {
        p.lat = tl;
        p.latVel = 0;
      }
    }
    p.latAcc = (p.latVel - prevVel) / Math.max(dt, 1e-4);
    p.lane = p.targetLane;
    p.railGrace = Math.max(0, p.railGrace - dt);
    p.carGrace = Math.max(0, p.carGrace - dt);

    const ground = this.groundInfo(p.lat);
    const prevH = p.h;

    if (p.grinding && p.rail) {
      const r = p.rail;
      const rel = d - r.s;
      if (Math.abs(rel) > obstacleHalf(r) || Math.abs(LANE_LAT[r.lane] - p.lat) > 0.7) {
        this.endGrind();
        p.grounded = false;
        p.vh = 0;
        p.airT = 0;
      } else {
        p.h = this.railHeightAt(r, d);
        p.grindPts += dt * 100;
        this.sparkT += dt;
        if (this.sparkT > 0.05) {
          this.sparkT = 0;
          this.emit("spark", -0.5, 0.55, p.lat, 2);
        }
      }
    }

    if (p.grinding && p.carMover) {
      const m = p.carMover;
      const rel = d - m.s;
      if (m.phase === "hit" || Math.abs(rel) > CAR_HALF + 0.35 || Math.abs(m.lat - p.lat) > 1.15) {
        this.endCarGrind();
        p.grounded = false;
        p.vh = 0;
        p.airT = 0;
      } else {
        p.h = CAR_ROOF_H;
        p.grindPts += dt * 150;
        this.sparkT += dt;
        if (this.sparkT > 0.05) {
          this.sparkT = 0;
          this.emit("spark", -0.5, CAR_ROOF_H - 0.04, p.lat, 3);
        }
      }
    }

    if (p.grinding && p.carObstacle) {
      const o = p.carObstacle;
      const rel = d - o.s;
      if (Math.abs(rel) > obstacleHalf(o) + 0.25 || Math.abs(LANE_LAT[o.lane] - p.lat) > 1.15) {
        this.endCarGrind();
        p.grounded = false;
        p.vh = 0;
        p.airT = 0;
      } else {
        p.h = CAR_ROOF_H;
        p.grindPts += dt * 100;
        this.sparkT += dt;
        if (this.sparkT > 0.05) {
          this.sparkT = 0;
          this.emit("spark", -0.5, CAR_ROOF_H - 0.04, p.lat, 2);
        }
      }
    }

    if (!p.grinding) {
      if (p.grounded) {
        // fast boards can step over a whole ramp in one frame: detect a ramp between the previous and current s
        if (!ground.ramp && !p.onRamp) {
          const prevS = d - this.speed * dt;
          for (const o of this.obstacles) {
            if (o.kind !== "ramp" || Math.abs(LANE_LAT[o.lane] - p.lat) > 1.0) continue;
            const top = o.s + OBSTACLE_DEFS.ramp.halfLen;
            if (prevS < top && d >= top) {
              p.onRamp = true;
              break;
            }
          }
        }
        if (ground.ramp) {
          p.h = ground.y;
          p.onRamp = true;
        } else if (p.onRamp) {
          p.onRamp = false;
          p.grounded = false;
          // Ramp airtime stays at the normal-speed ceiling, even when the board is boosted or set to 2×/3×.
          p.vh = RAMP_V;
          p.bigAir = true;
          p.airT = 0;
          sfx.ramp();
        } else if (p.h > ground.y + 0.1) {
          // ground dropped away (e.g. riding off the podium): fall naturally
          p.grounded = false;
          p.vh = 0;
          p.airT = 0;
        } else {
          p.h = ground.y;
        }
      } else {
        p.airT += dt;
        const flap = p.trick && p.trick.kind === "wingflap" ? 0.55 : 1;
        p.vh -= GRAVITY * flap * dt;
        p.h += p.vh * dt;
        // Ramp jumps are normally ballistic, but an unusually fast boost can compress the
        // flight so much that the board reaches a passing train before it has enough height.
        // Keep just above the train's hitbox while traversing that tiny collision window;
        // this is a clearance assist, not extra jump height or speed-mode scaling.
        if (p.bigAir && p.h < RAMP_TRAIN_CLEARANCE_H) {
          const crossingTrain = this.trains.find(
            (tr) =>
              Math.abs(tr.crossing.s - d) <= TRAIN_W / 2 + PLAYER_HALF &&
              trainCovers(tr, p.lat),
          );
          if (crossingTrain) {
            p.h = RAMP_TRAIN_CLEARANCE_H;
            p.vh = Math.max(0, p.vh);
          }
        }
        if (p.railGrace <= 0) {
          for (const o of this.obstacles) {
            if (o.kind !== "rail") continue;
            const rel = d - o.s;
            if (Math.abs(rel) > obstacleHalf(o) - 0.2) continue;
            if (Math.abs(LANE_LAT[o.lane] - p.lat) > 0.6) continue;
            const rh = this.railHeightAt(o, d);
            // "magnet" grind: lock on when the board passes near the rail top, going up or coming down
            const falling = prevH > p.h;
            const near = falling ? p.h <= rh + 0.25 && p.h >= rh - 0.45 : Math.abs(p.h - rh) <= 0.22;
            if (near) {
              this.startGrind(o);
              break;
            }
          }
        }
        if (!p.grinding && p.carGrace <= 0) {
          // Landing on oncoming cars ("mobil yg arah depan") only if physically touching down onto the roof
          const isFalling = p.vh <= 0.05 && prevH >= p.h;
          for (const m of this.movers) {
            if (m.kind !== "car" || m.phase === "hit") continue;
            const rel = d - m.s;
            if (Math.abs(rel) > CAR_HALF - 0.15) continue;
            if (Math.abs(m.lat - p.lat) > 0.95) continue;
            // Only land when descending right onto the roof plane (CAR_ROOF_H ~1.52)
            const touchesRoof = isFalling && prevH >= CAR_ROOF_H - 0.05 && p.h <= CAR_ROOF_H + 0.08 && p.h >= CAR_ROOF_H - 0.22;
            if (touchesRoof) {
              this.startCarGrind(m, true);
              break;
            }
          }
          // Also landing on parked obstacle cars only if touching roof
          if (!p.grinding) {
            for (const o of this.obstacles) {
              if (o.kind !== "car") continue;
              const rel = d - o.s;
              if (Math.abs(rel) > obstacleHalf(o) - 0.15) continue;
              if (Math.abs(LANE_LAT[o.lane] - p.lat) > 0.95) continue;
              const touchesRoof = isFalling && prevH >= CAR_ROOF_H - 0.05 && p.h <= CAR_ROOF_H + 0.08 && p.h >= CAR_ROOF_H - 0.22;
              if (touchesRoof) {
                this.startCarGrind(o, false);
                break;
              }
            }
          }
        }
        if (!p.grinding && p.h <= ground.y) {
          p.h = ground.y;
          this.land();
          p.onRamp = !!ground.ramp;
        }
      }
    }

    // queued "S" trick: fire as soon as we are airborne
    if (this.queuedCycle && !p.grounded && !p.grinding && !p.trick && p.airT > 0.05) this.cycleTrick();

    // hold gesture → indy grab
    if (this.holdT >= 0) {
      this.holdT += dt;
      if (this.holdT > 0.22 && !p.grounded && !p.grinding && !p.trick && this.phase === "playing") this.tryTrick("hold");
    }

    // tricks
    if (p.trick) {
      p.trick.t += dt;
      if (p.trick.t >= p.trick.dur) this.completeTrick();
    }

    // visuals
    const tr = p.trick;
    let flip = 0;
    let yaw = 0;
    let grab = 0;
    let boardYaw = 0;
    if (tr) {
      const u = clamp(tr.t / tr.dur, 0, 1);
      const e = easeInOut(u);
      const hump = Math.sin(Math.PI * u);
      switch (tr.kind) {
        case "kickflip":
          flip = e * Math.PI * 2;
          break;
        case "heelflip":
          flip = -e * Math.PI * 2;
          break;
        case "spinL":
          yaw = e * Math.PI * 2;
          break;
        case "spinR":
          yaw = -e * Math.PI * 2;
          break;
        case "shuvit":
          boardYaw = e * Math.PI;
          break;
        case "impossible":
          flip = e * Math.PI * 2;
          boardYaw = e * Math.PI;
          break;
        case "method":
          grab = hump;
          break;
        case "indy":
          grab = -hump;
          break;
        case "wingflap":
          grab = hump * 0.3;
          break;
        case "coo540":
          yaw = this.trickDir * e * Math.PI * 3;
          break;
      }
    }
    p.flip = flip;
    p.yaw = yaw;
    p.grab = grab;
    p.boardYaw = boardYaw;
    let pitch = 0;
    if (!p.grounded && !p.grinding) pitch = clamp(p.vh / JUMP_V, -0.5, 1) * 0.45;
    else if (p.onRamp) pitch = 0.39;
    p.pitch = lerp(p.pitch, pitch, 1 - Math.exp(-dt * 12));
    // ---- lean ("carve") ----
    // A skater leans into the direction of travel for the whole move and straightens up as the board
    // settles into the new lane. We model it as a first-order response to the lane offset (the "intent"),
    // blended with a little acceleration so the initial snap feels weighty: lean(t) ≈ how far we still have
    // to go, peaking early and easing back to 0 exactly when the lane is reached — no overshoot, no double-swing.
    if (newTurn) {
      // NEW: everything visual follows the physics state. Yaw = -heading (damped), roll = +lean * ROLL
      // (right-hand rule: positive rotation.x tips the top toward +z = into a right turn). The board yaw comes from
      // the trucks and the heading, never from an extra twist.
      const T = this.turn;
      p.steer = -T.headingVis;
      p.boardTwist = 0;
      const rollMax = TURN.ROLL_GROUND + (TURN.ROLL_AIR - TURN.ROLL_GROUND) * T.airBlend;
      p.roll = T.leanVis * rollMax;
      p.carve = -T.leanVis; // legacy convention (+ = left); only the old-mode poses read it
    } else {
      const remaining = clamp((tl - p.lat) / 2.4, -1, 1); // + = still moving toward +z (screen right)
      const moving = clamp(p.latVel / 7, -1, 1); // holds the lean through the middle of the move
      let leanAmt = clamp(remaining * 0.7 + moving * 0.55, -1, 1); // + = leaning toward +z
      const leanMax = airborneNow ? 0.5 : 0.62;
      // carve keeps the convention "+ = leaning toward -z (screen-left)"; the truck steering is derived from it
      // (leaning left => front truck yaws toward -z), so carve is NEGATIVE while turning right.
      const leanTarget = -leanAmt * leanMax;
      p.carve = lerp(p.carve, leanTarget, 1 - Math.exp(-dt * 16));
      // The bank group rotates about +x. Right-hand rule: a POSITIVE rotation.x tips the top toward +z and dips the
      // +z side. Leaning INTO a right turn (top toward +z, right edge down) therefore needs roll > 0, i.e. roll = -carve.
      p.roll = -p.carve;
      // Real turning: the rig's heading follows the velocity vector (forward speed vs lateral speed), so a
      // lane change is a genuine S-shaped carve — nose turns toward the new lane, straightens as it arrives.
      // In our frame +z is screen-right and yaw about +y turns +x toward -z, hence the minus sign.
      const fwd = Math.max(this.speed, 6);
      const steerTarget = -Math.atan2(p.latVel, fwd) * (airborneNow ? 0.85 : 1.0);
      p.steer = lerp(p.steer, clamp(steerTarget, -0.55, 0.55), 1 - Math.exp(-dt * 18));
      // the board turns a touch further than the body (it leads the carve), body counter-steers slightly
      const twistTarget = clamp(steerTarget * 0.25, -0.2, 0.2);
      p.boardTwist = lerp(p.boardTwist, twistTarget, 1 - Math.exp(-dt * 14));
    }
    // air lane-change gesture: how much lateral motion is happening while airborne
    const shiftTarget = airborneNow ? clamp(Math.abs(p.latVel) / 6, 0, 1) : 0;
    p.airShift = lerp(p.airShift, shiftTarget, 1 - Math.exp(-dt * (shiftTarget > p.airShift ? 16 : 6)));
    const wingTarget = !p.grounded && !p.grinding ? 1 : 0;
    p.wing = lerp(p.wing, wingTarget, 1 - Math.exp(-dt * 14));
    p.squash = Math.max(0, p.squash - dt * 5);
    this.updatePush(dt);

    if (this.phase !== "playing") return;

    // static collisions
    for (const o of this.obstacles) {
      if (o.kind === "ramp") continue;
      if (p.carObstacle === o) continue;
      const def = OBSTACLE_DEFS[o.kind];
      const rel = d - o.s;
      if (Math.abs(rel) > obstacleHalf(o) + PLAYER_HALF) continue;
      if (Math.abs(LANE_LAT[o.lane] - p.lat) > 1.05) continue;
      if (o.kind === "rail") {
        if (p.grinding || p.railGrace > 0) continue;
        if (p.h >= this.railHeightAt(o, d) - 0.5) continue;
        this.crash();
        return;
      }
      if (o.kind === "car") {
        if (p.carObstacle === o || p.carGrace > 0) continue;
        // Flying clean over the car (no forced suction)
        if (p.h >= def.hit - 0.04) {
          if (o.catVariant !== undefined && !o.catHit && p.h < CAR_ROOF_H + 0.7) {
            o.catHit = true;
            this.launchCatFromCar(o);
          }
          continue;
        }
        const touchesRoof = p.vh <= 0.05 && prevH >= p.h && prevH >= CAR_ROOF_H - 0.05 && p.h <= CAR_ROOF_H + 0.08 && p.h >= CAR_ROOF_H - 0.22;
        if (touchesRoof) {
          if (!p.grinding) this.startCarGrind(o, false);
          continue;
        }
      }
      if (p.h >= def.hit - 0.04) continue;
      this.crash(o.kind === "car" ? "car" : o.kind === "fence" || o.kind === "dirt" || o.kind === "jackhammer" || o.kind === "worker" ? "roadwork" : "obstacle");
      return;
    }

    // railway crossings: lowered arms and passing trains
    for (const cr of this.crossings) {
      if (Math.abs(cr.s - d) > 6) continue;
      if (cr.armT > 0.85 && Math.abs(cr.s + ARM_S + 0.3 - d) < 0.12 + PLAYER_HALF && Math.abs(p.lat) > ARM_INNER && p.h < ARM_HIT) {
        this.crash("gate");
        return;
      }
    }
    for (const tr of this.trains) {
      if (Math.abs(tr.crossing.s - d) > TRAIN_W / 2 + PLAYER_HALF) continue;
      if (!trainCovers(tr, p.lat)) continue;
      if (p.h >= TRAIN_HIT) continue;
      this.crash("train", { hardness: 1.6, side: tr.dir });
      return;
    }

    // moving collisions
    for (const m of this.movers) {
      if (m.phase === "hit") continue;
      if (m.kind === "car") {
        if (p.carMover === m || p.carGrace > 0) continue;
        if (Math.abs(m.s - d) > CAR_HALF + PLAYER_HALF) continue;
        if (Math.abs(m.lat - p.lat) > 1.05) continue;
        // If jumping high above car (flying over), do NOT force onto car roof - fly clean!
        if (p.h >= CAR_HIT - 0.04) continue;
        // Only land if genuinely descending right onto the roof surface:
        const touchesRoof = p.vh <= 0.05 && prevH >= p.h && prevH >= CAR_ROOF_H - 0.05 && p.h <= CAR_ROOF_H + 0.08 && p.h >= CAR_ROOF_H - 0.22;
        if (touchesRoof) {
          if (!p.grinding) this.startCarGrind(m, true);
          continue;
        }
        this.crash("oncoming", { hardness: 1.4 });
        return;
      }
      if (m.kind === "motorcycle") {
        if (Math.abs(m.s - d) > 0.62 + PLAYER_HALF) continue;
        if (Math.abs(m.lat - p.lat) > 1.0) continue;
        if (p.h >= MOTOR_CLEAR_H) continue; // lompatan bersih di atas motor
        this.crash("motorcycle", { hardness: 1.15, side: m.lat >= p.lat ? -1 : 1 });
        return;
      }
      if (m.kind === "pedestrian") {
        if (Math.abs(m.s - d) > 0.32 + PLAYER_HALF) continue;
        if (Math.abs(m.lat - p.lat) > 0.55) continue;
        if (p.h >= 1.75) continue; // orang kini jauh lebih kecil (~1.68 m visual); ollie tinggi bisa lolos tipis
        this.hitPedestrian(m);
        this.crash("pedestrian", { hardness: 0.75, side: m.lat >= p.lat ? -1 : 1 });
        return;
      }
      if (m.kind === "cat") {
        if (Math.abs(m.s - d) > 0.45 + PLAYER_HALF) continue;
        if (Math.abs(m.lat - p.lat) > 0.85) continue;
        if (p.h >= CAT_CLEAR_H) continue; // clean jump over cat
        this.hitCat(m);
        continue;
      }
      if (m.kind === "chicken") {
        if (Math.abs(m.s - d) > 0.45 + PLAYER_HALF) continue;
        if (Math.abs(m.lat - p.lat) > 0.85) continue;
        if (p.h >= CHICKEN_HIT) continue;
        this.hitChicken(m);
        continue;
      }
    }

    // cross-traffic cars at perempatan (intersection)
    for (const cc of this.crossCars) {
      if (Math.abs(cc.s - d) > 0.82 + PLAYER_HALF) continue;
      if (Math.abs(cc.lat - p.lat) > 1.65 + PLAYER_HALF) continue;

      // Check whether player is over the FRONT HOOD (sisi body depan) vs CABIN/ROOF/REAR:
      // When dir === 1 (+lat is forward): front hood is at cc.lat + 0.35 to cc.lat + 1.7
      // When dir === -1 (-lat is forward): front hood is at cc.lat - 1.7 to cc.lat - 0.35
      const isOverHood = cc.dir === 1 ? p.lat >= cc.lat + 0.35 : p.lat <= cc.lat - 0.35;

      if (isOverHood) {
        // Can only jump over the FRONT BODY (hood)!
        if (p.h >= HOOD_JUMP_CLEAR_H - 0.04) {
          // Successfully leaped over the front hood!
          if (!cc.passed) {
            cc.passed = true;
            this.trickScore += 150;
            useUI.getState().addPopup("HOOD JUMP! +150", "#2ec4b6", "nice timing!");
            sfx.swish();
          }
        } else {
          // Grounded or didn't jump high enough: crashed into the front bumper/hood!
          this.crash("car", { hardness: 1.35, side: cc.dir });
          return;
        }
      } else {
        // Cabin / Roof / Rear body:
        // Rule: HANYA BISA NGELOMPATIN SISI BODY DEPAN MOBIL
        // You cannot jump over the tall cabin & roof (1.55m) on normal street ollie!
        if (p.h < 1.6) {
          this.crash("cross_traffic", { hardness: 1.5, side: cc.dir });
          return;
        }
      }
    }

    // NOS canisters
    for (const c of this.nosCans) {
      if (c.taken) continue;
      if (Math.abs(c.s - d) > 0.9 || Math.abs(LANE_LAT[c.lane] - p.lat) > 1.0 || p.h > 1.6) continue;
      c.taken = true;
      this.addNos(NOS_MAX * 0.5);
      this.emitWorld("spark", c.wx, c.wy + 0.4, c.wz, c.wy, 10, 0, 0);
      sfx.nosPickup();
    }

    // item LANGKA: ROCKET — sekali ambil langsung NOS penuh + skor besar + kilatan sinar
    for (const r of this.rockets) {
      if (r.taken) continue;
      if (Math.abs(r.s - d) > 1.0 || Math.abs(LANE_LAT[r.lane] - p.lat) > 1.05 || p.h > 1.7) continue;
      this.collectRocket(r);
    }

    // puddles: safe, just a splash (and a wet trail)
    this.wet = Math.max(0, this.wet - dt * 0.8);
    for (const pu of this.puddles) {
      if (Math.abs(pu.s - d) > 1.0 || Math.abs(LANE_LAT[pu.lane] - p.lat) > 1.0) continue;
      if (!p.grounded || p.h > 0.05) continue;
      pu.splashT -= dt;
      if (pu.splashT <= 0) {
        pu.splashT = 0.12;
        this.emit("splash", -0.2, 0.05, p.lat, 6);
        if (this.wet < 0.2) sfx.splash();
        this.wet = 1;
      }
    }

    // bread
    for (const b of this.breads) {
      if (b.taken) continue;
      if (Math.abs(b.s - d) > 0.9) continue;
      if (Math.abs(LANE_LAT[b.lane] - p.lat) > 1.0) continue;
      if (Math.abs(b.h - (p.h + 0.55)) > 0.95) continue;
      b.taken = true;
      this.breadCount++;
      this.addNos(NOS_PER_BREAD);
      this.breadFx.push({ rel: b.s - d, lat: LANE_LAT[b.lane], h: b.h, age: 0 });
      if (this.breadFx.length > 8) this.breadFx.shift();
      this.emitWorld("crumb", b.wx, b.wy, b.wz, b.wy - b.h, 5, 0, 0);
      sfx.bread();
    }
  }

  private launchVictim(m: Mover, mass: number) {
    const p = this.player;
    const v = Math.max(this.speed, 5);
    const side = m.lat >= p.lat ? 1 : -1;
    const isAnimal = m.kind === "cat" || m.kind === "chicken";
    // Animals that got the size boost also get a bigger body sphere, so the bigger
    // model still rests/bounces ON the road instead of sinking into it.
    const animalBoost = m.kind === "cat" ? CAT_SIZE_BOOST : m.kind === "chicken" ? CHICKEN_SIZE_BOOST : 1;
    const r = makeRagdoll(
      m.s,
      m.lat,
      m.h + (m.kind === "pedestrian" ? 0.49 : 0.25 * animalBoost),
      m.kind === "pedestrian" ? 0.3 : 0.22 * animalBoost
    );
    if (isAnimal) {
      // MENTAL ala kartun: hewan dilontarkan tinggi, jauh, dan muter-muter kocak.
      // Gayaberat dikecilkan + pantulan ekstra kenyal supaya hang time-nya lucu.
      r.vs = v * 0.62 + rand(1.6, 3.2);
      r.vh = 5.2 + rand(0.9, 2.1);
      r.vlat = side * (2.2 + rand(0.7, 1.6));
      r.wz = -rand(10, 17);
      r.wx = side * rand(6, 11);
      r.wy = rand(-6, 6);
      r.gravityScale = ANIMAL_GRAVITY_SCALE;
      r.bouncy = ANIMAL_BOUNCE;
    } else {
      r.vs = v * (1.1 / mass) + rand(0, 2);
      r.vh = 4 + v * (0.5 / mass) + rand(0, 2);
      r.vlat = side * (1.5 + rand(0, 2.5)) / mass;
      r.wz = -rand(6, 14) / mass;
      r.wx = side * rand(3, 9) / mass;
      r.wy = rand(-4, 4);
    }
    m.rag = r;
    m.phase = "hit";
    m.hitT = 0;
  }

  private hitChicken(m: Mover) {
    if (m.phase === "hit") return;
    this.launchVictim(m, 0.55);
    track.frame(m.s, m.lat, m.h + 0.6, tmpV);
    const floor = tmpV.y - m.h - 0.6;
    this.animalImpactFx(tmpV.x, tmpV.y, tmpV.z, floor, [1, 0.55, 0.25]);
    this.emitWorld("feather", tmpV.x, tmpV.y, tmpV.z, floor, 18, 0, 0);
    sfx.thwack();
    sfx.bonk();
    sfx.squawk();
    this.player.squash = 0.35;
    this.trickScore += 75;
    useUI.getState().addPopup("CHICKEN +75", "#ef4444");
  }

  private hitCat(m: Mover) {
    if (m.phase === "hit") return;
    this.launchVictim(m, 0.42);
    track.frame(m.s, m.lat, m.h + 0.35, tmpV);
    const floor = tmpV.y - m.h - 0.35;
    this.animalImpactFx(tmpV.x, tmpV.y, tmpV.z, floor, [1, 0.78, 0.28]);
    this.emitWorld("dust", tmpV.x, tmpV.y, tmpV.z, floor, 12, 0, 0);
    sfx.thwack();
    sfx.bonk();
    sfx.meow();
    this.player.squash = 0.35;
    this.trickScore += 75;
    useUI.getState().addPopup("CAT +75", "#f59e0b");
  }

  private launchCatFromCar(o: Obstacle) {
    if (o.catVariant === undefined) return;
    const m = this.newMover("cat", o.s - 0.15, o.lane, LANE_LAT[o.lane]);
    m.variant = o.catVariant;
    m.h = CAR_ROOF_H + 0.1;
    this.hitCat(m);
    this.movers.push(m);
    this.moverVersion++;
  }

  private hitPedestrian(m: Mover) {
    this.launchVictim(m, 1.4);
    track.frame(m.s, m.lat, m.h + 1.2, tmpV);
    this.emitWorld("dust", tmpV.x, tmpV.y, tmpV.z, tmpV.y - m.h - 1.2, 10, 0, 0);
    // tongkatnya terlempar ikut tuannya :)
    if (m.elderly) this.emitWorld("pow", tmpV.x, tmpV.y - 0.6, tmpV.z, tmpV.y - m.h - 1.2, 4, 0, 0);
    sfx.yelp();
  }

  private updateCrash(dt: number) {
    const p = this.player;
    p.squash = 0;
    p.wing = 0;
    p.limbT += dt;

    if (p.body) {
      const b = p.body;
      const prevBounces = b.bounces;

      // 1. Calculate floor height (including ground, ramps, and solid tops of obstacles)
      let floor = 0;
      for (const o of this.obstacles) {
        const def = OBSTACLE_DEFS[o.kind];
        const halfS = obstacleHalf(o);
        const laneLat = LANE_LAT[o.lane];
        const halfLat = o.kind === "car" ? 1.05 : o.kind === "barrier" || o.kind === "bench" ? 0.9 : 0.65;
        if (Math.abs(b.s - o.s) <= halfS + b.radius && Math.abs(b.lat - laneLat) <= halfLat + b.radius) {
          if (o.kind === "ramp") {
            const rel = b.s - o.s;
            const rampH = (def.height * (rel + def.halfLen)) / (def.halfLen * 2);
            floor = Math.max(floor, rampH);
          } else {
            // If the pigeon lands on top of an obstacle (e.g. car roof, dumpster, bench), support it!
            if (b.h >= def.height - 0.25) {
              floor = Math.max(floor, def.height);
            }
          }
        }
      }

      // Step ragdoll with generous floor support
      stepRagdoll(b, dt, floor + b.radius, 4.2, 0.28);

      // Comical sound effects and feather/dust bursts on ground bounces
      if (b.bounces > prevBounces) {
        if (b.bounces === 1) {
          sfx.bonk();
          this.emitWorld("feather", p.wx, p.wy + 0.15, p.wz, p.wy, 14, 0, 0);
          this.emitWorld("dust", p.wx, p.wy - 0.05, p.wz, p.wy, 10, 0, 0);
        } else if (b.bounces === 2) {
          sfx.squawk();
          this.emitWorld("feather", p.wx, p.wy + 0.15, p.wz, p.wy, 8, 0, 0);
          this.emitWorld("dust", p.wx, p.wy - 0.05, p.wz, p.wy, 6, 0, 0);
        } else {
          sfx.land();
          this.emitWorld("dust", p.wx, p.wy - 0.05, p.wz, p.wy, 4, 0, 0);
        }
      }

      // 2. Obstacle collision resolution:
      // Forward momentum takes priority: ragdoll catapults FORWARD over obstacles in a dramatic arc,
      // never bouncing backward unless moving backward or blocked by an impassable wall.
      for (const o of this.obstacles) {
        if (o.kind === "ramp" || o.kind === "rail") continue;
        const def = OBSTACLE_DEFS[o.kind];
        const halfS = obstacleHalf(o);
        const laneLat = LANE_LAT[o.lane];
        const halfLat = o.kind === "car" ? 1.05 : o.kind === "barrier" || o.kind === "bench" ? 0.9 : 0.65;
        const topH = def.height;

        // If the pigeon is below the obstacle's top:
        if (b.h < topH + b.radius + 0.05) {
          const overlapS = halfS + b.radius - Math.abs(b.s - o.s);
          const overlapLat = halfLat + b.radius - Math.abs(b.lat - laneLat);

          if (overlapS > 0 && overlapLat > 0) {
            // Forward momentum: catapult forward over the obstacle!
            if (b.vs > 0 && b.s < o.s + halfS + 0.2) {
              b.h = Math.max(b.h, topH + b.radius + 0.08);
              b.vh = Math.max(b.vh, 3.8); // upward boost over top
              b.vs = Math.max(b.vs * 0.92, 5.5); // maintain strong forward momentum!
              b.wz = -Math.abs(b.wz) - 1.2; // forward somersault tumble
              sfx.bonk();
              this.emitWorld("feather", p.wx, p.wy + 0.2, p.wz, p.wy, 10, 0, 0);
            } else if (b.vs <= 0) {
              // Only if stationary or moving backward, push away from the obstacle
              const signS = b.s >= o.s ? 1 : -1;
              b.s = o.s + signS * (halfS + b.radius + 0.03);
              b.vs = 0;
            } else {
              const signLat = b.lat >= laneLat ? 1 : -1;
              b.lat = laneLat + signLat * (halfLat + b.radius + 0.03);
              b.vlat *= 0.5;
            }
          }
        }
      }

      // 3. Moving car collisions during ragdoll: "bisa mental ketabrak mobil kalo ada mobil lewat"
      // Check oncoming traffic cars
      for (const m of this.movers) {
        if (m.kind !== "car" || m.phase === "hit") continue;
        const carHalfS = CAR_HALF;
        const carHalfLat = 1.05;
        const carTopH = 1.55;

        const overlapS = carHalfS + b.radius - Math.abs(b.s - m.s);
        const overlapLat = carHalfLat + b.radius - Math.abs(b.lat - m.lat);

        if (overlapS > 0 && overlapLat > 0 && b.h < carTopH + b.radius) {
          // Push in front of moving car to prevent interior penetration
          b.s = m.s - carHalfS - b.radius - 0.05;

          if (!m.hitRagdoll) {
            m.hitRagdoll = true;
            sfx.horn();
            sfx.bonk();
            sfx.squawk();
            this.shake = Math.max(this.shake, 1.4);
            track.frame(b.s, b.lat, b.h, tmpV);
            this.emitWorld("feather", tmpV.x, tmpV.y + 0.35, tmpV.z, tmpV.y, 30, 0, 0);
            this.emitWorld("dust", tmpV.x, tmpV.y, tmpV.z, tmpV.y, 18, 0, 0);

            // Launch the pigeon flying into orbit!
            const hitSide = b.lat >= m.lat ? 1 : -1;
            b.vs = -m.speed * 1.35 - rand(4.0, 8.0);
            b.vh = 8.8 + rand(2.0, 4.0);
            b.vlat = hitSide * rand(5.0, 8.5);
            b.wz = -rand(10, 18);
            b.wx = hitSide * rand(6, 12);
            b.wy = rand(-6, 6);
            b.rest = false;
            b.restT = 0;
            b.bounces = 0;
            p.limbT = 0;
            useUI.getState().addPopup("KETABRAK MOBIL! 💥", "#ff0055", "terpental ke langit");
          }
        }
      }

      // Check cross-traffic cars at intersections
      for (const cc of this.crossCars) {
        const carHalfS = 0.95;
        const carHalfLat = 1.85;
        const carTopH = 1.55;

        const overlapS = carHalfS + b.radius - Math.abs(b.s - cc.s);
        const overlapLat = carHalfLat + b.radius - Math.abs(b.lat - cc.lat);

        if (overlapS > 0 && overlapLat > 0 && b.h < carTopH + b.radius) {
          // Push outside the car body
          b.lat = cc.lat + cc.dir * (carHalfLat + b.radius + 0.05);

          if (!cc.hitRagdoll) {
            cc.hitRagdoll = true;
            sfx.horn();
            sfx.bonk();
            sfx.squawk();
            this.shake = Math.max(this.shake, 1.4);
            track.frame(b.s, b.lat, b.h, tmpV);
            this.emitWorld("feather", tmpV.x, tmpV.y + 0.35, tmpV.z, tmpV.y, 35, 0, 0);
            this.emitWorld("dust", tmpV.x, tmpV.y, tmpV.z, tmpV.y, 20, 0, 0);

            // Launched high sideways across the road
            b.vlat = cc.dir * (cc.speed * 1.25 + rand(5, 9));
            b.vh = 9.2 + rand(2.0, 4.5);
            b.vs = rand(-4, 4);
            b.wx = -cc.dir * rand(9, 15);
            b.wz = rand(-8, 8);
            b.rest = false;
            b.restT = 0;
            b.bounces = 0;
            p.limbT = 0;
            useUI.getState().addPopup("KETABRAK! 💥", "#ff0055", "homerun!");
          }
        }
      }

      // Keep body within the street corridor (never clip into building facades)
      b.lat = clamp(b.lat, -3.8, 3.8);
      // Support pigeon transform strictly at or above floor
      p.lat = b.lat;
      p.h = Math.max(floor, b.h - b.radius);
    }

    if (p.board) {
      const bd = p.board;
      stepRagdoll(bd, dt, bd.radius, 4.8, 0.32);
      bd.lat = clamp(bd.lat, -4.2, 4.2);
    }
  }

  private updateMovers(dt: number) {
    if (this.breadFx.length) {
      for (const fx of this.breadFx) fx.age += dt;
      this.breadFx = this.breadFx.filter((fx) => fx.age < 0.34);
    }
    const d = this.distance;
    let changed = false;
    for (let i = this.movers.length - 1; i >= 0; i--) {
      const m = this.movers[i];
      let remove = false;
      if (m.phase === "hit" && m.rag) {
        m.hitT += dt;
        const isAnimal = m.kind === "cat" || m.kind === "chicken";
        const bounceDamping = isAnimal ? 3.4 : 3.0; // hewan: gesekan lebih kecil -> makin mental
        const bBefore = m.rag.bounces;
        stepRagdoll(m.rag, dt, m.rag.radius, bounceDamping, 0.45);
        // setiap mantul di aspal: kepulan debu + bunyi kenyal (makin lucu & satisfying)
        if (isAnimal && m.rag.bounces > bBefore) {
          track.frame(m.rag.s, m.rag.lat, m.rag.h - m.rag.radius, tmpV);
          this.emitWorld("dust", tmpV.x, tmpV.y + 0.05, tmpV.z, tmpV.y, m.rag.bounces === 1 ? 5 : 3, 0, 0);
          if (m.rag.bounces <= 2) sfx.boing();
          else sfx.bonk();
        }
        m.s = m.rag.s;
        m.lat = clamp(m.rag.lat, -7, 7);
        m.h = m.rag.h - m.rag.radius;
        if (m.hitT > 5 || m.s < d - 16) remove = true;
      } else if (m.kind === "cat") {
        if (m.phase === "wait") {
          m.delay -= dt;
          if (m.delay <= 0) m.phase = "hop"; // walking across street
        } else if (m.phase === "hop") {
          m.lat += m.dir * m.speed * dt;
          m.hopT += dt;
          m.h = Math.abs(Math.sin(m.hopT * 12)) * 0.035;
          if (!m.warned && Math.abs(m.s - d) < 18) {
            m.warned = true;
            sfx.meow();
          }
          if (Math.abs(m.lat) > 6.8) remove = true;
        }
        if (m.s < d - 16) remove = true;
      } else if (m.kind === "pedestrian") {
        if (m.phase === "wait") {
          m.delay -= dt;
          const signal = m.signalIntersectionId == null
            ? undefined
            : this.intersections.find((inter) => inter.id === m.signalIntersectionId);
          // Scramble pedestrians wait at the curb until the vehicle light is fully red.
          if (m.delay <= 0 && (!signal || signal.lightState === "red")) m.phase = "hop";
        } else if (m.phase === "hop") {
          // PENYEBERANG HATI-HATI: kalau merpati melaju mendekat, tunggu dulu di tepi
          // jalan (tengok kanan-kiri); kalau terlanjur di jalur main, buru-buru menepi.
          let v = m.speed;
          const gap = m.s - d;
          if (this.phase === "playing" && gap > 0.5 && gap < 6.5) {
            const inLanes = Math.abs(m.lat) < 2.4;
            if (inLanes) v = m.speed * 1.55; // lari kecil biar cepat keluar jalur
            else if (Math.abs(m.lat) < 4.8) v = 0; // berhenti dulu di tepi / median
          }
          m.lat += m.dir * v * dt;
          if (v > 0.01) {
            m.hopT += dt * (v / m.speed);
            m.h = Math.abs(Math.sin(m.hopT * 9)) * 0.06;
          } else {
            m.h = Math.max(0, m.h - dt * 0.3); // berdiri tenang menunggu
          }
          if (Math.abs(m.lat) > (m.crossingEdge ?? 7.2) + 0.45) remove = true;
        }
        if (m.s < d - 16) remove = true;
      } else if (m.kind === "car" || m.kind === "motorcycle") {
        const isBike = m.kind === "motorcycle";
        let signalStopLine: number | null = null;
        let approach: Intersection | undefined;
        let closestGap = Infinity;
        for (const inter of this.intersections) {
          const gap = m.s - inter.s;
          if (gap < 0 || gap > TRAFFIC_STOP_LINE_OFFSET + 24 || gap >= closestGap) continue;
          closestGap = gap;
          approach = inter;
        }

        // PENTING: Kereta & palang pintu kereta (level crossing).
        // Mobil dan motor dari arah depan (m.s > cr.s) TIDAK BOLEH menembus kereta yang lewat!
        // Berhenti di garis stop palang pintu kereta (cr.s + 3.2m).
        let railStopLine: number | null = null;
        let closestRailGap = Infinity;
        for (const cr of this.crossings) {
          const railStopS = cr.s + 3.2; // Garis stop di depan palang pintu kereta
          const gap = m.s - railStopS;
          const isRailActive = cr.trainScheduled && (cr.state === "warning" || cr.state === "clearing" || cr.armT > 0.05 || (cr.train && Math.abs(cr.train.head) < 55));
          if (isRailActive && gap >= -0.5 && gap < 36 && gap < closestRailGap) {
            closestRailGap = gap;
            railStopLine = railStopS;
          }
        }

        let speedK = 1;
        if (railStopLine !== null) {
          const gap = m.s - railStopLine;
          const targetK = gap <= 0.6 ? 0 : clamp((gap - 0.6) / 16, 0, 0.55);
          m.signalSpeedK = lerp(m.signalSpeedK ?? 1, targetK, 1 - Math.exp(-dt * 10));
          speedK = m.signalSpeedK;
        } else if (approach) {
          const signal = trafficSignalApproach(m.s, approach.s, approach.lightState);
          signalStopLine = signal.stopLineS;
          const targetK = signal.targetK;
          m.signalSpeedK = lerp(m.signalSpeedK ?? 1, targetK, 1 - Math.exp(-dt * 8));
          speedK = m.signalSpeedK;
        } else if (m.signalSpeedK !== undefined) {
          m.signalSpeedK = lerp(m.signalSpeedK, 1, 1 - Math.exp(-dt * 8));
          speedK = m.signalSpeedK;
        }

        const effectiveStopLine = railStopLine !== null ? railStopLine : signalStopLine;
        const previousS = m.s;
        m.s -= m.speed * speedK * dt;
        // Keep the vehicle behind the stop line if it reaches or skips across it.
        if (effectiveStopLine !== null && previousS >= effectiveStopLine && m.s < effectiveStopLine) {
          m.s = effectiveStopLine;
        }
        m.squash = Math.max(0, m.squash - dt * 4.5);
        if (!m.warned && m.s - d < (isBike ? 34 : 32)) {
          m.warned = true;
          if (this.phase === "playing") (isBike ? sfx.motor() : sfx.horn());
        }
        // asap knalpot keluar selama kendaraan jalan (di belakang kendaraan)
        this.emitExhaust(m, isBike ? 0.52 : 1.05, isBike ? 0.3 : 0.26, isBike ? 0.05 : 0.08, dt);
        if (m.s < d - 16) remove = true;
      } else {
        if (m.phase === "wait") {
          m.delay -= dt;
          if (m.delay <= 0) {
            m.phase = "pause";
            m.pause = 0.05;
            if (Math.abs(m.s - d) < 30) sfx.cluck();
          }
        } else if (m.phase === "pause") {
          m.pause -= dt;
          m.squash = Math.max(0, m.squash - dt * 6);
          if (m.pause <= 0) {
            m.phase = "hop";
            m.hopT = 0;
            m.hopFrom = m.lat;
            m.hopTo = m.lat + m.dir * CHICKEN_STEP;
          }
        } else if (m.phase === "hop") {
          m.hopT += dt / CHICKEN_HOP_T;
          const u = Math.min(1, m.hopT);
          m.lat = lerp(m.hopFrom, m.hopTo, u);
          m.h = CHICKEN_HOP_H * Math.sin(Math.PI * u);
          if (u >= 1) {
            m.h = 0;
            m.phase = "pause";
            m.pause = rand(0.04, 0.3);
            m.squash = 1;
          }
        }
        if (Math.abs(m.lat) > CHICKEN_EDGE + 0.4 && m.phase !== "wait") remove = true;
        if (m.s < d - 16) remove = true;
      }
      if (remove) {
        this.movers.splice(i, 1);
        changed = true;
      }
    }
    if (changed) this.moverVersion++;
  }

  /* ---------- Push cycle (kicking the ground) ---------- */
  private updatePush(dt: number) {
    const p = this.player;
    const menu = this.phase === "menu";
    const canPush = p.grounded && !p.grinding && !p.onRamp && !p.trick && (this.phase === "playing" || menu) && (this.center.g > -0.1 || this.sprintBonus > 0) && this.nosT <= 0;
    if (p.push >= 0) {
      if (!canPush) {
        // interrupted (jump, ramp, crash): snap the foot back onto the deck
        p.push = -1;
        p.pushCooldown = 0.45;
        return;
      }
      // cycle duration: smooth, natural kicking motion, NOT sped up frantically!
      // "ayunanya jangan dicepetin ttp smooth"
      const dur = clamp(0.88 - this.speed * 0.012, 0.72, 0.88);
      p.push += dt / dur;
      if (p.push >= 1) {
        p.push = -1;
        p.pushCount++;
        // several pushes while getting up to speed, then an occasional maintenance push
        const early = this.runTime < 6 || this.speed < START_SPEED * this.speedMult * 0.9;
        const normal = menu ? rand(1.4, 2.4) : early ? rand(0.25, 0.5) : rand(1.6, 3.2);
        // while sprinting, kicks follow a smooth, comfortable cadence (0.35s - 0.5s pause)
        p.pushCooldown = this.sprintStage > 0 ? rand(0.35, 0.5) : normal;
      }
      return;
    }
    if (!canPush) {
      p.pushCooldown = Math.max(p.pushCooldown, 0.35);
      return;
    }
    p.pushCooldown -= dt;
    if (p.pushCooldown <= 0) p.push = 0;
  }

  /** True while the foot is on the ground during a push (used for the little speed nudge + dust). */
  get pushContact() {
    const u = this.player.push;
    return u >= 0.24 && u <= 0.62;
  }

  /* ---------- Railway crossings ---------- */
  private scheduleTrain(cr: Crossing) {
    const dir = Math.random() < 0.5 ? 1 : -1;
    // Rangkaian panjang 8-10 gerbong (110-135m): megah dan aktif melintas di jalan
    const nCars = 8 + randInt(0, 2);
    const speed = 19;
    // Kereta mulai tepat di samping jalan (|head| = 22m), sehingga begitu palang pintu tertutup,
    // lokomotif langsung memasuki jalan dan menderu melintas di depan pemain!
    const tr: Train = {
      id: this.nextId++,
      crossing: cr,
      head: -dir * 22,
      dir,
      speed,
      nCars,
      line: cr.line,
      horned: false,
      rumbleT: 0,
    };
    cr.train = tr;
    cr.trainScheduled = true;
    cr.state = "warning";
    cr.armT = 0;
    this.trains.push(tr);
    this.moverVersion++;
  }

  private updateOverpass(dt: number) {
    const d = this.distance;
    let changed = false;
    for (let i = this.overpassCars.length - 1; i >= 0; i--) {
      const c = this.overpassCars[i];
      c.lat += c.dir * c.speed * dt;
      if (Math.abs(c.lat) > 20 || c.s < d - 30) {
        this.overpassCars.splice(i, 1);
        changed = true;
      }
    }
    if (changed) this.moverVersion++;
  }

  private updateCrossings(dt: number) {
    const d = this.distance;
    for (const cr of this.crossings) {
      if (cr.placed && !cr.trainScheduled && this.phase === "playing" && d >= cr.s - 68) {
        this.scheduleTrain(cr);
      }
      const near = Math.abs(cr.s - d) < 55;

      if (cr.state === "idle") {
        if (cr.trainScheduled) {
          cr.state = "warning";
        }
      } else if (cr.state === "warning") {
        // Palang pintu turun cepat dan mantap (1.0s)
        cr.armT = Math.min(1, cr.armT + dt / 1.0);
        cr.lightPhase += dt;
        cr.bellT -= dt;
        if (cr.bellT <= 0) {
          cr.bellT = 0.38;
          cr.bellAlt = !cr.bellAlt;
          if (near) sfx.bell(cr.bellAlt, clamp(1 - Math.abs(cr.s - d) / 60, 0.25, 1) * 0.22);
        }

        const tr = cr.train;
        if (tr) {
          const tail = tr.head - tr.dir * trainLength(tr);
          const playerHasPassed = d > cr.s + 4.0;
          const trainHasCrossed = (tr.dir > 0 && tail > 8) || (tr.dir < 0 && tail < -8);
          if (trainHasCrossed && playerHasPassed) {
            cr.state = "clearing";
            cr.timer = 0.9;
          }
        }
      } else if (cr.state === "clearing") {
        cr.lightPhase += dt;
        cr.timer -= dt;
        if (cr.timer <= 0) {
          cr.armT = Math.max(0, cr.armT - dt / 1.4);
          if (cr.armT === 0) cr.state = "done";
        }
      }
    }

    let changed = false;
    for (let i = this.trains.length - 1; i >= 0; i--) {
      const tr = this.trains[i];
      // Pergerakan murni fisika: posisi ditambah kecepatan x dt (sangat mulus tanpa patah-patah/teleport)
      tr.head += tr.dir * tr.speed * dt;
      const dist = Math.abs(tr.crossing.s - d);
      if (!tr.horned && Math.abs(tr.head) < 26 && dist < 60) {
        tr.horned = true;
        sfx.trainHorn();
      }
      if (dist < 30 && trainCovers(tr, 0)) {
        tr.rumbleT -= dt;
        if (tr.rumbleT <= 0) {
          tr.rumbleT = 0.28;
          sfx.rumble(clamp(1 - dist / 30, 0.2, 1) * 0.22);
        }
      }
      const tail = tr.head - tr.dir * trainLength(tr);
      if (Math.abs(tail) > 55 && Math.sign(tail) === tr.dir && d > tr.crossing.s + 8) {
        this.trains.splice(i, 1);
        changed = true;
      }
    }
    if (changed) this.moverVersion++;
  }

  private updateIntersections(dt: number) {
    const d = this.distance;
    const t = clamp((this.speed / this.speedMult - START_SPEED) / (MAX_SPEED - START_SPEED), 0, 1);
    for (const inter of this.intersections) {
      inter.trafficTimer += dt;
      const dist = inter.s - d;
      let scheduledLight: Intersection["lightState"];
      if (inter.scramble) {
        if (!inter.signalStarted && dist < 70) {
          inter.signalStarted = true;
          inter.trafficTimer = 0;
        }
        if (!inter.signalStarted) scheduledLight = "green";
        else {
          const cycle = inter.trafficTimer % 30;
          scheduledLight = cycle < 10 ? "red" : cycle < 25 ? "green" : "yellow";
        }
      } else {
        const phase = Math.floor(inter.trafficTimer * 0.7) % 6;
        scheduledLight = phase < 3 ? "green" : phase === 3 ? "yellow" : "red";
      }

      // Saat pemain mendekati perempatan (dist 5 s.d 60m), pasang lampu merah untuk jalan utama
      // agar kendaraan jalur utama berhenti dan mobil penyeberang jalan lintas melaju menyeberang!
      if (dist > 5 && dist < 60) {
        scheduledLight = "red";
      }

      const pedestrianInJunction = this.movers.some(
        (m) => m.kind === "pedestrian" && m.signalIntersectionId === inter.id && m.phase === "hop",
      );
      const crossTrafficInJunction = this.crossCars.some(
        (car) => car.intersectionId === inter.id && Math.abs(car.lat) < 12,
      );
      inter.lightState = pedestrianInJunction || crossTrafficInJunction ? "red" : scheduledLight;

      // Jendela pendekatan: munculkan mobil penyeberang yang akan melintas tepat saat pemain tiba
      if (this.phase === "playing" && dist > -16 && dist < 65) {
        if (!inter.signalStarted) {
          inter.signalStarted = true;
          // Spawn mobil pertama segera agar langsung melintas di depan pemain
          this.spawnCrossCar(inter.id, inter.s + CROSS_LANE_OFFSET, -CROSS_SPAWN_LAT, 1, 11.5 + rand(0, 2) + t * 2);
          this.spawnCrossCar(inter.id, inter.s - CROSS_LANE_OFFSET, CROSS_SPAWN_LAT, -1, 11.5 + rand(0, 2) + t * 2);
          inter.spawnTimer1 = rand(1.1, 1.7);
          inter.spawnTimer2 = rand(1.3, 1.9);
        }

        inter.spawnTimer1 -= dt;
        if (inter.spawnTimer1 <= 0) {
          inter.spawnTimer1 = rand(1.2, 1.8) - t * 0.35;
          // Jalur kiri (Jepang/Indonesia): yang melaju ke +lat memakai jalur +s (sisi kiri jalannya)
          this.spawnCrossCar(inter.id, inter.s + CROSS_LANE_OFFSET, -CROSS_SPAWN_LAT, 1, 11 + rand(0, 2.5) + t * 2);
        }

        inter.spawnTimer2 -= dt;
        if (inter.spawnTimer2 <= 0) {
          inter.spawnTimer2 = rand(1.3, 1.9) - t * 0.35;
          this.spawnCrossCar(inter.id, inter.s - CROSS_LANE_OFFSET, CROSS_SPAWN_LAT, -1, 11 + rand(0, 2.5) + t * 2);
        }
      }
    }
  }

  private spawnCrossCar(intersectionId: number, s: number, startLat: number, dir: 1 | -1, speed: number) {
    // jangan susulkan mobil baru kalau mobil sejalur masih dekat titik muncul
    const blocked = this.crossCars.some(
      (o) => o.dir === dir && Math.abs(Math.abs(o.lat) - Math.abs(startLat)) < 7.5,
    );
    if (blocked) return;
    const cc: CrossTrafficCar = {
      id: this.nextId++,
      intersectionId,
      s,
      lat: startLat,
      dir,
      speed,
      variant: randInt(0, 6),
      horn: false,
      passed: false,
    };
    this.crossCars.push(cc);
    this.moverVersion++;
  }

  private updateCrossCars(dt: number) {
    const d = this.distance;
    let changed = false;
    for (let i = this.crossCars.length - 1; i >= 0; i--) {
      const cc = this.crossCars[i];

      // Mobil penyeberang melaju menyeberang jalan lintas; hanya melambat jika ada mobil lain tepat di depannya
      const carAhead = this.crossCars.some(
        (o) => o !== cc && o.dir === cc.dir && Math.abs(o.s - cc.s) < 1.4 && (o.lat - cc.lat) * cc.dir > 0 && (o.lat - cc.lat) * cc.dir < 5.0
      );
      const yielding = carAhead;
      cc.waiting = yielding;

      // rem / gas halus
      const target = yielding ? 0 : 1;
      const k0 = cc.speedK ?? 1;
      let k = k0 + (target - k0) * (1 - Math.exp(-dt * 8));
      if (yielding && k < 0.05) k = 0;
      cc.speedK = k;
      cc.lat += cc.dir * cc.speed * k * dt;

      // asap knalpot mobil yang menyeberang di perempatan
      cc.smokeT = (cc.smokeT ?? 0) - dt;
      if (cc.smokeT <= 0) {
        cc.smokeT = 0.09;
        const pl = this.place(cc.s, cc.lat - cc.dir * 1.5, 0.26);
        this.emitWorld("smoke", pl.pos[0], pl.pos[1], pl.pos[2], pl.pos[1] - 0.4, 1, Math.cos(pl.rotY), Math.sin(pl.rotY));
      }
      // Honk horn as car approaches the middle road
      if (!cc.horn && Math.abs(cc.lat) < 7.5 && Math.abs(cc.s - d) < 42) {
        cc.horn = true;
        if (this.phase === "playing" && Math.random() < 0.7) {
          sfx.horn();
        }
      }

      if (Math.abs(cc.lat) > CROSS_DESPAWN_LAT || cc.s < d - 24) {
        this.crossCars.splice(i, 1);
        changed = true;
      }
    }
    if (changed) this.moverVersion++;
  }

  private addIntersection(s: number): Intersection {
    const c = track.sample(s, tmpS);
    track.frame(s, 0, 0, tmpV);
    const pos: Vec3 = [tmpV.x, tmpV.y, tmpV.z];
    const sc = track.sample(s - 26, tmpS);
    track.frame(s - 26, 4.9, 0.12, tmpV);
    const signPos: Vec3 = [tmpV.x, tmpV.y, tmpV.z];
    // Di Shibuya, setiap perempatan ke-2 adalah SCRAMBLE CROSSING raksasa ala pusat Shibuya
    const scramble = track.mode === "shibuya" && this.interCount++ % 2 === 1;
    // Kadang cross-street-nya LEBAR 6 jalur (semua mode) biar perempatan tidak sempit
    const wide = !scramble && Math.random() < 0.4;
    const inter: Intersection = {
      id: this.nextId++,
      s,
      pos,
      rotY: -c.th,
      placed: true,
      signPos,
      signRotY: -sc.th,
      spawnTimer1: rand(0.2, 0.8),
      spawnTimer2: rand(0.7, 1.4),
      trafficTimer: rand(0, 6),
      signalStarted: false,
      lightState: "green",
      scramble,
      wide,
    };
    this.intersections.push(inter);
    if (track.mode !== "haruna") {
      // Every urban crosswalk gets a real, signal-controlled pedestrian wave. Scrambles
      // are busier, while random longitudinal offsets keep the group from marching in a row.
      const n = scramble ? 4 + randInt(0, 2) : 2 + randInt(0, 2);
      const edge = 6.8;
      const est = Math.max(this.speed, START_SPEED);
      const elderIndex = Math.random() < 0.28 ? randInt(0, n - 1) : -1;
      const offsets: number[] = [];
      for (let i = 0; i < n; i++) {
        let offset = rand(-6.5, 6.5);
        for (let attempt = 0; attempt < 8 && offsets.some((other) => Math.abs(other - offset) < 1.6); attempt++) {
          offset = rand(-6.5, 6.5);
        }
        offsets.push(offset);
      }
      offsets.sort((a, b) => a - b);
      const firstDir = Math.random() < 0.5 ? 1 : -1;
      for (let i = 0; i < n; i++) {
        const dir = i === 0 ? firstDir : i === 1 ? -firstDir : Math.random() < 0.5 ? 1 : -1;
        const px = s + offsets[i];
        const m = this.newMover("pedestrian", px, -1, -dir * edge);
        m.dir = dir;
        m.crossingEdge = edge;
        m.signalIntersectionId = inter.id;
        const elderly = i === elderIndex;
        m.elderly = elderly;
        m.speed = elderly ? rand(0.85, 1.25) : rand(1.7, 2.4);
        m.variant = elderly ? randInt(0, 2) : Math.random() < 0.4 ? randInt(5, 7) : randInt(0, 4);
        const eta = (px - this.distance) / est;
        const walk = (edge - 1.2) / m.speed;
        m.delay = Math.max(0.1, eta - walk + rand(-0.8, 0.8));
        this.movers.push(m);
      }
      this.moverVersion++;
    }
    // clear static obstacles & bread directly in the crossroads area (s - 8.5 to s + 8.5)
    const half = scramble ? 11 : wide ? 10.5 : 8.5;
    this.obstacles = this.obstacles.filter((o) => o.s < s - half || o.s > s + half);
    this.breads = this.breads.filter((b) => b.s < s - (half - 1) || b.s > s + (half - 1));
    this.nosCans = this.nosCans.filter((c) => c.s < s - half - 8 || c.s > s + half + 8);
    this.rockets = this.rockets.filter((r) => r.s < s - half - 8 || r.s > s + half + 8);
    this.puddles = this.puddles.filter((pu) => pu.s < s - half || pu.s > s + half);
    this.listVersion++;
    return inter;
  }

  private addCrossing(s: number): Crossing {
    const c = track.sample(s, tmpS);
    track.frame(s, 0, 0, tmpV);
    const pos: Vec3 = [tmpV.x, tmpV.y, tmpV.z];
    const sc = track.sample(s - 24, tmpS);
    track.frame(s - 24, 4.9, 0.12, tmpV);
    const cr: Crossing = {
      id: this.nextId++,
      s,
      pos,
      rotY: -c.th,
      signPos: [tmpV.x, tmpV.y, tmpV.z],
      signRotY: -sc.th,
      state: "idle",
      armT: 0,
      timer: 0,
      bellT: 0,
      bellAlt: false,
      lightPhase: 0,
      line: randInt(0, 1),
      placed: false,
      trainScheduled: false,
      train: null,
      rampLanes: [],
    };
    this.crossings.push(cr);
    this.listVersion++;
    return cr;
  }

  /** Ramps + bread guiding into the crossing; clears anything else that was generated in the way. */
  private spawnCrossingPattern(cr: Crossing, x: number) {
    const X = cr.s;
    const t = clamp((this.speed / this.speedMult - START_SPEED) / (MAX_SPEED - START_SPEED), 0, 1);
    const lo = X - 24;
    const hi = X + 10;
    this.obstacles = this.obstacles.filter((o) => o.s < lo || o.s > hi);
    this.breads = this.breads.filter((b) => b.s < lo || b.s > hi);
    this.nosCans = this.nosCans.filter((c) => c.s < lo - 8 || c.s > hi + 8);
    this.rockets = this.rockets.filter((r) => r.s < lo - 8 || r.s > hi + 8);
    this.puddles = this.puddles.filter((pu) => pu.s < lo || pu.s > hi);
    this.movers = this.movers.filter((m) => m.kind !== "chicken" || m.s < lo || m.s > hi);
    const lanes = [0, 1, 2].sort(() => Math.random() - 0.5);
    const nRamps = t < 0.55 ? 2 : 1;
    cr.rampLanes = lanes.slice(0, nRamps);
    const rampS = X + CROSSING_RAMP_S;
    const end = rampS + OBSTACLE_DEFS.ramp.halfLen;
    const v = this.targetSpeed(this.runTime + (X - this.distance) / Math.max(this.speed, START_SPEED)) + 0.3;
    for (const lane of cr.rampLanes) {
      this.addObstacle("ramp", rampS, lane, true);
      this.breadLine(X - 19, lane, 6, 0.5);
      for (let i = 0; i < 6; i++) {
        const dx = 0.8 + i * 1.15;
        const tt = dx / v;
        const y = 1 + RAMP_V * tt - 0.5 * GRAVITY * tt * tt;
        if (y > 0.5) this.addBread(end + dx, lane, y + 0.2);
      }
    }
    cr.placed = true;
    this.listVersion++;
    this.moverVersion++;
    this.nextObstacleS = Math.max(x, hi) + 6 + rand(0, 3);
  }

  /* ---------- Generation ---------- */
  private place(s: number, lat: number, dy: number): { pos: Vec3; rotY: number } {
    track.frame(s, lat, dy, tmpV);
    const th = track.sample(s, tmpS).th;
    return { pos: [tmpV.x, tmpV.y, tmpV.z], rotY: -th };
  }

  private spawnChunk() {
    const isHaruna = track.mode === "haruna";
    const isShibuya = track.mode === "shibuya";
    const s0 = this.nextChunkS;
    this.nextChunkS += CHUNK_LEN;
    const id = this.nextId++;
    const mid = track.sample(s0 + 6, tmpS);
    const straight = Math.abs(mid.kappa) < 1e-4 && Math.abs(mid.g) < 0.04;
    let crossing: Crossing | null = null;
    if (!isHaruna && this.nextCrossingS < s0 + CHUNK_LEN) {
      const cs = Math.max(this.nextCrossingS, s0 + 2);
      const cc = track.sample(cs, tmpS);
      if (cs <= s0 + CHUNK_LEN - 2 && Math.abs(cc.kappa) < 0.004 && Math.abs(cc.g) < 0.03) {
        crossing = this.addCrossing(cs);
        // Shibuya nights are busier: railway crossings come around more often
        this.nextCrossingS = cs + (isShibuya ? rand(110, 190) : rand(CROSSING_GAP[0], CROSSING_GAP[1]));
      } else {
        this.nextCrossingS = s0 + CHUNK_LEN + 2; // road is bending/sloping here: try the next chunk
      }
    }
    if (!isHaruna && !crossing && this.nextIntersectionS < s0 + CHUNK_LEN) {
      const is_s = Math.max(this.nextIntersectionS, s0 + 3);
      const ic = track.sample(is_s, tmpS);
      if (is_s <= s0 + CHUNK_LEN - 3 && Math.abs(ic.kappa) < 0.005 && Math.abs(ic.g) < 0.035) {
        this.addIntersection(is_s);
        // City intersections recur more often; Shibuya keeps the denser scramble-crossing cadence.
        this.nextIntersectionS = isShibuya ? is_s + rand(78, 125) : is_s + rand(100, 160);
      } else {
        this.nextIntersectionS = s0 + CHUNK_LEN + 3;
      }
    }
    const kind: Chunk["kind"] = isHaruna ? "haruna" : isShibuya ? "shibuya" : crossing ? "park" : Math.random() < 0.28 ? "park" : "street";
    const decor: Decor[] = [];
    const add = (k: DecorKind, lx: number, lat: number, dy: number, variant = 0, spec?: BuildingSpec) => {
      // Keep cross-road clear of sidewalk decor, buildings, and trees (minimum 8.2m clearance)
      const absS = s0 + lx;
      if (this.intersections.some((it) => Math.abs(absS - it.s) < 9.6) || Math.abs(absS - this.nextIntersectionS) < 9.6) return;
      const pl = this.place(absS, lat, dy);
      decor.push({ kind: k, pos: pl.pos, rotY: pl.rotY, variant, spec, frontSide: lat > 0 });
    };

    if (isHaruna) {
      // Mount Haruna (Gunma Touge) mountain pass scenery
      // 1. Sharp turn warning chevron signs on hairpin curves pointing in curve direction (behind guardrail)
      const curvature = mid.kappa;
      if (Math.abs(curvature) > 0.008 && Math.random() < 0.7) {
        const dir = curvature > 0 ? 1 : -1;
        const chevLat = dir > 0 ? 4.45 : -4.45;
        add("chevron", 6, chevLat, 0.12, dir);
      }

      // 2. Dense Japanese mountain forest: Momiji autumn maples (scarlet/amber), mountain cedars, and pine trees
      for (let i = 0; i < 3; i++) {
        const lx = 2 + i * 4 + rand(-0.6, 0.6);
        if (Math.random() < 0.65) {
          add("autumn_tree", lx, rand(-6.5, -9.8), 0.08, randInt(0, 2));
        } else {
          add("tree", lx, rand(-6.5, -9.8), 0.08, randInt(0, 2));
        }
        if (Math.random() < 0.65) {
          add("autumn_tree", lx, rand(6.5, 9.8), 0.08, randInt(0, 2));
        } else {
          add("tree", lx, rand(6.5, 9.8), 0.08, randInt(0, 2));
        }
      }

      // 4. Mountain boulders and rocks along the dirt shoulder
      if (Math.random() < 0.75) {
        add("rock", rand(1.5, 10.5), rand(-4.9, -5.8), 0.1, randInt(0, 1));
      }
      if (Math.random() < 0.75) {
        add("rock", rand(1.5, 10.5), rand(4.9, 5.8), 0.1, randInt(0, 1));
      }

      // 5. Roadside mountain bushes
      for (let i = 0; i < 2; i++) {
        add("bush", rand(0.5, 11.5), rand(-6.2, -7.5), 0.08, randInt(0, 1));
        add("bush", rand(0.5, 11.5), rand(6.2, 7.5), 0.08, randInt(0, 1));
      }

      // 6. Occasional traditional mountain shrine lantern or rest hut
      if (id % 5 === 0) {
        add("lantern", 6, -4.5, 0.12);
        if (Math.random() < 0.5) {
          add("village_house", 6, -9.2, 0.08, randInt(0, 2));
        }
      }

      // 7. Mount Haruna Prefecture Route 33 sign
      if (id % 5 === 1) {
        add("touge_sign", 3, -4.5, 0.12);
      }

      // 8. Curved touge mercury/sodium streetlamps along guardrails
      if (id % 2 === 0) {
        add("touge_lamp", 6, 4.4, 0.12);
      }
      if (id % 3 === 0) {
        add("touge_lamp", 2, -4.4, 0.12);
      }

      this.chunks.push({ id, s0, kind: "haruna", decor });
      this.listVersion++;
      return;
    }

    if (isShibuya) {
      // ---- SHIBUYA: grand open avenue with spacious, towering Japanese architecture ----
      // Spacing: ONE substantial lot per 12m chunk (centered at lx = 6) with clean alleyway gaps.
      // 1. Near frontage:
      if (id % 21 === 7) {
        add("tower109", 6, -10.8, -0.12);
      } else {
        const r = Math.random();
        if (r < 0.70) add("building", 6, -10.2, 0.1, 0, makeShibuyaTowerSpec(rand(9.8, 12.8)));
        else if (r < 0.86) add("konbini", 6, -10.2, 0.1, 0); // large 10.4m wide 24h konbini
        else add("ramen", 6, -10.2, 0.1, 0); // large 8.6m wide 2-storey ramen house
      }

      // 2. Far frontage across all 6 lanes:
      if (Math.random() < 0.88) {
        const rFar = Math.random();
        if (rFar < 0.78) add("building", 6, 23.8, -0.14, 0, makeShibuyaTowerSpec(rand(12.5, 16.5), 8 + Math.floor(Math.random() * 6)));
        else if (rFar < 0.90) add("konbini", 6, 23.8, -0.14, 0);
        else add("ramen", 6, 23.8, -0.14, 0);
      }

      // 3. Second skyline row: towering background skyscrapers (placed every 2 chunks so no clutter)
      if (id % 2 === 0) add("building", 6, -18.5, -0.15, 0, makeShibuyaTowerSpec(rand(14.0, 18.5), 12 + Math.floor(Math.random() * 8)));
      if (id % 2 === 1) add("building", 6, 32.5, -0.28, 0, makeShibuyaTowerSpec(rand(14.0, 18.5), 12 + Math.floor(Math.random() * 8)));

      // 4. Department store display billboards across the wide boulevard (far background only)
      if (id % 6 === 3) add("billboard", 6, 27.5, -0.16, randInt(0, 2));

      // railway crossings span the whole avenue — keep the median & opposite lanes clear there
      const nearCrossing = (lx: number) => {
        const sAbs = s0 + lx;
        return this.crossings.some((cr) => Math.abs(cr.s - sAbs) < 9) || Math.abs(sAbs - this.nextCrossingS) < 9;
      };

      // 5. Tree-lined centre median: zelkova street trees + lamps down the avenue
      for (const lx of [3, 9]) {
        if (!nearCrossing(lx)) add("tree", lx, 4.35, 0.16, randInt(0, 2));
      }
      if (id % 2 === 1 && !nearCrossing(6)) add("lamp", 6, 4.35, 0.16);

      // 6. Sidewalk atmosphere: pleasantly spaced out (not packed edge-to-edge)
      if (Math.random() < 0.45) add("vending", rand(2.5, 9.5), -5.2, 0.12, randInt(0, 3));
      if (Math.random() < 0.35) add("neon_sign", rand(2.5, 9.5), -4.8, 0.12, randInt(0, 2));
      if (Math.random() < 0.3) add("mamachari", rand(2.5, 9.5), -4.9, 0.12, randInt(0, 3));
      if (Math.random() < 0.4) add("tree", rand(2.5, 9.5), -6.6, 0.12, randInt(0, 2));
      if (Math.random() < 0.35) add("tree", rand(2.5, 9.5), 16.2, 0.12, randInt(0, 2));

      // 7. Lampu jalan: di kedua trotoar + median
      add("lamp", id % 2 === 0 ? 3 : 9, -4.3, 0.06);
      add("lamp", id % 2 === 0 ? 9 : 3, 12.55, 0.14);
      if (id % 2 === 0 && !nearCrossing(6.5)) add("avenue_lamp", 6.5, 4.35, 0.16);

      // 8. Pagar pembatas trotoar pipa putih khas Jepang
      for (const flx of [2.0, 6.0, 10.0]) {
        if (!nearCrossing(flx)) {
          add("guard_fence", flx, -4.14, 0.12);
          add("guard_fence", flx, 12.78, 0.12);
        }
      }
      // 9. Planter trotoar
      if (Math.random() < 0.5) add("sidewalk_planter", rand(2.5, 9.5), -4.85, 0.12, randInt(0, 2));

      this.chunks.push({ id, s0, kind: "shibuya", decor });
      this.listVersion++;
      return;
    }
    // Sakura promenade: every ~4th chunk is a full cherry-blossom avenue; other chunks still get a tree or two
    const avenue = id % 4 === 1;
    if (avenue) {
      // rows of cherry trees on both sidewalks + stone lanterns
      for (let i = 0; i < 3; i++) {
        add("sakura", 2 + i * 4 + rand(-0.5, 0.5), -5.2 + rand(-0.3, 0.3), 0.12, randInt(0, 3));
        add("sakura", 2 + i * 4 + rand(-0.5, 0.5), 5.1 + rand(-0.2, 0.2), 0.12, randInt(0, 3));
      }
      add("lantern", 6, -4.35, 0.12);
      add("lantern", 6, 4.4, 0.12);
      // a few big ones in the background + varied traditional houses
      add("sakura", rand(1, 5), rand(-8, -10), -0.12, randInt(0, 3), undefined);
      add("sakura", rand(7, 11), rand(8, 10.5), -0.12, randInt(0, 3), undefined);
      const rAve = Math.random();
      if (rAve < 0.35) add("house", rand(3, 9), rand(-8.5, -11), -0.12, randInt(0, 1));
      else if (rAve < 0.65) add("village_house", rand(3, 9), rand(-8.5, -11), -0.12, randInt(0, 3));
      else if (rAve < 0.85) add("machiya", rand(3, 9), rand(-8.5, -11), -0.12, randInt(0, 1));
      add("flowers", rand(1, 11), rand(6.4, 8), 0.08, randInt(0, 1));
      this.chunks.push({ id, s0, kind: "park", decor });
      this.listVersion++;
      return;
    }
    if (kind === "street") {
      // Balanced streetscape: grand city buildings, ramen shops, machiya merchant shops, houses
      const lot = (lx: number) => {
        const r = Math.random();
        if (r < 0.32) add("building", lx, -7.5, 0.1, 0, makeBuildingSpec(rand(8.2, 11.2)));
        else if (r < 0.50) add("house", lx, -7.5, 0.1, randInt(0, 1)); // traditional house
        else if (r < 0.68) add("machiya", lx, -7.5, 0.1, randInt(0, 1)); // machiya shop
        else if (r < 0.84) add("ramen", lx, -7.5, 0.1, 0); // 8.6m grand ramen shop
        else add("village_house", lx, -7.5, 0.1, randInt(0, 3)); // 2-3 story village house
      };
      if (straight && id % 6 === 2) {
        add("konbini", 6, -7.5, 0.1, 0);
      } else {
        lot(6); // One grand, spacious lot per 12m chunk
      }

      // Vending machines (Jihanki) on sidewalk
      if (Math.random() < 0.45) add("vending", rand(2.5, 9.5), -4.8, 0.12, randInt(0, 3));
      if (Math.random() < 0.3) add("vending", rand(2.5, 9.5), 4.8, 0.12, randInt(0, 3));

      // Mamachari commuter bicycles parked along sidewalks
      if (Math.random() < 0.4) add("mamachari", rand(2.5, 9.5), -4.55, 0.12, randInt(0, 3));
      if (Math.random() < 0.25) add("mamachari", rand(2.5, 9.5), 4.55, 0.12, randInt(0, 3));

      // Illuminated sidewalk neon / ramen lantern signboards
      if (Math.random() < 0.35) add("neon_sign", rand(2.5, 9.5), -4.4, 0.12, randInt(0, 2));
      // a sakura in front of the shops now and then
      if (Math.random() < 0.4) add("sakura", rand(2.5, 9.5), -5.2, 0.12, randInt(0, 3));
      // Front sidewalk buildings & houses (facing the street)
      const rFront = Math.random();
      if (rFront < 0.22) add("house", 6, 11.2, -0.1, randInt(0, 1));
      else if (rFront < 0.45) add("building", 6, 11.2, -0.1, 0, makeBuildingSpec(rand(8.0, 10.5)));
      else if (rFront < 0.60) add("machiya", 6, 11.2, -0.1, randInt(0, 1));
      else if (rFront < 0.75) add("village_house", 6, 11.2, -0.1, randInt(0, 3));
    } else {
      // Scenic park / countryside: greenery with occasional 1-story house, ramen shop, or village house
      const rBack = Math.random();
      if (rBack < 0.22) add("house", rand(3, 9), rand(-8.5, -11), -0.12, randInt(0, 1));
      else if (rBack < 0.36) add("village_house", rand(3, 9), rand(-8.5, -11), -0.12, randInt(0, 3));
      else if (rBack < 0.46) add("ramen", rand(3, 9), rand(-8.5, -11), -0.12, 0);

      if (Math.random() < 0.16) add("house", rand(3, 9), rand(8.5, 11), -0.12, randInt(0, 1));
      else if (Math.random() < 0.1) add("village_house", rand(3, 9), rand(8.5, 11), -0.12, randInt(0, 3));

      for (let i = 0; i < 3; i++) {
        if (Math.random() < 0.55) add("sakura", 1.5 + i * 4 + rand(-0.8, 0.8), rand(-7.6, -10.5), -0.12, randInt(0, 3));
        else add("tree", 1.5 + i * 4 + rand(-0.8, 0.8), rand(-7.6, -10.5), -0.12, randInt(0, 2));
      }
      add("bush", rand(1, 11), rand(-7.4, -8.5), 0.05, randInt(0, 1));
      add("flowers", rand(1, 11), rand(-7.4, -9), 0.08, randInt(0, 1));
    }
    if (id % 2 === 0) add("lamp", 6, -4.3, 0.06);
    if (Math.random() < 0.3) add("hydrant", rand(1.5, 10.5), 4.7, 0.12);
    const nTrees = randInt(1, 2);
    for (let i = 0; i < nTrees; i++) {
      if (Math.random() < 0.6) add("sakura", rand(1, 11), rand(7.2, 10.5), -0.12, randInt(0, 3));
      else add("tree", rand(1, 11), rand(7.4, 11), -0.12, randInt(0, 2));
    }
    if (Math.random() < 0.4) add("sakura", rand(1, 11), 5.1, 0.12, randInt(0, 3));
    for (let i = 0; i < randInt(1, 2); i++) add("bush", rand(0.5, 11.5), rand(6.6, 11), 0.05, randInt(0, 1));
    for (let i = 0; i < randInt(1, 3); i++) add("flowers", rand(0.5, 11.5), rand(6.4, 11.5), 0.08, randInt(0, 1));
    this.chunks.push({ id, s0, kind, decor });
    this.listVersion++;
  }

  private laneReserved(lane: number, s: number) {
    for (const r of this.reserved) if (r.lane === lane && s > r.from && s < r.until) return true;
    return false;
  }

  private isNearObstacle(s: number, lane: number, extraBuffer = 5.0): boolean {
    for (const o of this.obstacles) {
      const laneGap = Math.abs(o.lane - lane);
      const buffer = laneGap === 0 ? extraBuffer : laneGap === 1 ? 2.6 : 0;
      if (buffer > 0 && Math.abs(o.s - s) < obstacleHalf(o) + buffer) return true;
    }
    for (const m of this.movers) {
      const laneGap = Math.abs(m.lane - lane);
      const buffer = laneGap === 0 ? extraBuffer + 2.0 : laneGap === 1 ? 2.6 : 0;
      if (buffer > 0 && Math.abs(m.s - s) < buffer) return true;
    }
    if (this.laneReserved(lane, s)) return true;
    return false;
  }

  private isNearBread(s: number, lane: number, extraBuffer = 5.0): boolean {
    for (const b of this.breads) {
      const laneGap = Math.abs(b.lane - lane);
      const buffer = laneGap === 0 ? extraBuffer : laneGap === 1 ? Math.min(extraBuffer, 3.0) : 0;
      if (buffer > 0 && Math.abs(b.s - s) < buffer) return true;
    }
    return false;
  }

  /** Pickups always get a clear runway; later obstacle patterns must respect this reservation too. */
  private isNearBonusItem(s: number, lane: number, buffer = 8.0): boolean {
    return (
      this.nosCans.some((c) => !c.taken && c.lane === lane && Math.abs(c.s - s) < buffer) ||
      this.rockets.some((r) => !r.taken && r.lane === lane && Math.abs(r.s - s) < buffer)
    );
  }

  private addObstacle(kind: ObstacleKind, s: number, lane: number, force = false, half?: number, variant?: number) {
    // Jaring pengaman per-item: pattern panjang tidak boleh menjulurkan obstacle
    // ke dalam zona perempatan (apalagi scramble crossing yang penuh penyeberang)
    if (this.intersections.some((it) => Math.abs(it.s - s) < (it.scramble ? 11 : it.wide ? 10.5 : 8.5))) return;
    if (!force && this.laneReserved(lane, s)) return;
    const hLen = half ?? OBSTACLE_DEFS[kind].halfLen;
    // Jangan pernah menutup roti / bonus dengan obstacle, termasuk obstacle yang datang dari pola berikutnya.
    if (this.isNearBonusItem(s, lane, hLen + 8.0)) return;
    // Bread lines must stay readable; don't place hazards in their immediate approach/landing space.
    if (this.isNearBread(s, lane, hLen + 5.0)) return;
    track.frame(s, LANE_LAT[lane], 0, tmpV);
    track.quat(s, tmpQ);
    const catVariant = kind === "car" && Math.random() < 0.48 ? randInt(0, 3) : undefined;
    this.obstacles.push({
      id: this.nextId++,
      kind,
      s,
      lane,
      variant: variant ?? randInt(0, 6),
      flip: Math.random() < 0.3,
      pos: [tmpV.x, tmpV.y, tmpV.z],
      quat: [tmpQ.x, tmpQ.y, tmpQ.z, tmpQ.w],
      half,
      catVariant,
    });
    // Remove any bread that might somehow collide or be within the safety buffer of this obstacle
    this.breads = this.breads.filter((b) => !(b.lane === lane && Math.abs(b.s - s) < hLen + 5.0));
    this.listVersion++;
  }
  private addBread(s: number, lane: number, h: number) {
    // Roti tidak pernah ditempelkan ke rel/ramp: collectible harus terbaca dan punya ruang mendarat.
    if (this.isNearObstacle(s, lane, 5.5) || this.isNearBonusItem(s, lane, 4.0)) return;
    track.frame(s, LANE_LAT[lane], h, tmpV);
    this.breads.push({ id: this.nextId++, s, lane, h, taken: false, phase: Math.random() * Math.PI * 2, wx: tmpV.x, wy: tmpV.y, wz: tmpV.z });
  }
  private breadLine(s: number, lane: number, n = 5, h = 0.5) {
    // Entire row is either clear or omitted; never leave a broken trail tangled with a hazard.
    for (let i = 0; i < n; i++) {
      if (this.isNearObstacle(s + i, lane, 5.5) || this.isNearBonusItem(s + i, lane, 4.0)) return;
    }
    for (let i = 0; i < n; i++) this.addBread(s + i * 1.0, lane, h);
  }
  private breadArc(s: number, lane: number) {
    for (let k = -3; k <= 3; k++) {
      if (this.isNearObstacle(s + k * 0.75, lane, 5.5)) return;
    }
    for (let k = -3; k <= 3; k++) this.addBread(s + k * 0.75, lane, 0.5 + 1.35 * (1 - (k * k) / 9));
  }
  private otherLane(exclude: number[]) {
    const opts = [0, 1, 2].filter((l) => !exclude.includes(l));
    return pick(opts);
  }
  private newMover(kind: MoverKind, s: number, lane: number, lat: number): Mover {
    return {
      id: this.nextId++,
      kind,
      s,
      lat,
      lane,
      speed: 0,
      variant: randInt(0, 6),
      dir: 1,
      h: 0,
      vh: 0,
      phase: kind === "car" || kind === "motorcycle" ? "drive" : "wait",
      hopT: 0,
      hopFrom: 0,
      hopTo: 0,
      pause: 0,
      delay: 0,
      warned: false,
      squash: 0,
      spin: 0,
      hitT: 0,
    };
  }
  private spawnOncoming(meetS: number, lane: number, t: number, allowCompanion = true) {
    const d = this.distance;
    const baseSpeed = rand(3.2, 4.4) + 1.4 * t;
    const isMotorcycle = Math.random() < 0.34;
    const motorcycleFactor = isMotorcycle
      ? rand(1.05, 1.2) * ONCOMING_MOTORCYCLE_SPEED_MULT
      : 1;
    const vehicleSpeed = baseSpeed * (isMotorcycle ? motorcycleFactor : ONCOMING_CAR_SPEED_MULT);
    const est = Math.max(this.speed, 6);
    // Schedule the new faster vehicle to meet the player at the intended point, not early.
    const s0 = meetS + (vehicleSpeed * (meetS - d)) / est;
    // Jangan pernah spawn kendaraan mendekati atau di atas rel kereta api
    if (this.crossings.some((c) => Math.abs(c.s - meetS) < 14 || Math.abs(c.s - s0) < 12)) {
      return;
    }
    // One in three oncoming vehicles is a slightly quicker motorcycle.
    if (isMotorcycle) {
      this.spawnMotorcycle(s0, lane, baseSpeed, motorcycleFactor);
      this.reserved.push({ lane, from: meetS - 7, until: s0 + 6 });
      if (allowCompanion && t > 0.35 && Math.random() < 0.35) {
        const companionLane = this.otherLane([lane]);
        const companionS = s0 + 2.4;
        this.spawnMotorcycle(companionS, companionLane, baseSpeed * rand(0.92, 1.06));
        this.reserved.push({ lane: companionLane, from: meetS - 5, until: companionS + 6 });
      }
      return;
    }
    const m = this.newMover("car", s0, lane, LANE_LAT[lane]);
    m.speed = vehicleSpeed;
    this.movers.push(m);
    this.reserved.push({ lane, from: meetS - 7, until: s0 + 6 });
    this.moverVersion++;
  }

  /**
   * Busy city traffic wave on the three playable lanes. Vehicles arrive one at a time
   * in a shuffled lane order, leaving two clear choices at every encounter.
   */
  private spawnShibuyaTrafficWave(meetS: number, t: number): number {
    const firstLane = randInt(0, 2);
    const lanes = [firstLane, (firstLane + 1) % 3, (firstLane + 2) % 3];
    const headway = 12;
    for (let i = 0; i < lanes.length; i++) {
      this.spawnOncoming(meetS + i * headway, lanes[i], t, false);
    }
    return headway * (lanes.length - 1) + 8;
  }

  /** Motor dari arah depan: 30% lebih cepat daripada baseline motor sebelumnya. */
  private spawnMotorcycle(
    s0: number,
    lane: number,
    v: number,
    speedFactor = rand(1.05, 1.2) * ONCOMING_MOTORCYCLE_SPEED_MULT,
  ) {
    const m = this.newMover("motorcycle", s0, lane, LANE_LAT[lane]);
    m.speed = v * speedFactor;
    m.variant = randInt(0, 5);
    m.smokeT = rand(0, 0.08);
    this.movers.push(m);
    this.moverVersion++;
  }

  private addPuddle(s: number, lane: number) {
    const pl = this.place(s, LANE_LAT[lane], 0.0);
    this.puddles.push({ id: this.nextId++, s, lane, variant: randInt(0, 1), pos: pl.pos, rotY: pl.rotY, splashT: 0 });
    this.listVersion++;
  }

  private spawnRoadworks(x: number, t: number) {
    // one lane closed with fences, dirt piles, a jackhammer worker and a sign; puddles nearby
    const lane = randInt(0, 2);
    const len = 12 + 6 * t;
    const signPl = this.place(x - 8, 4.6, 0.12);
    this.roadSigns.push({ kind: "roadsign", pos: signPl.pos, rotY: signPl.rotY, variant: x });
    this.addObstacle("fence", x, lane, true);
    this.addObstacle("dirt", x + 3, lane, true);
    this.addObstacle("jackhammer", x + 6, lane, true);
    this.addObstacle("worker", x + 6.8, lane, true);
    if (len > 14) this.addObstacle("dirt", x + 10, lane, true);
    this.addObstacle("fence", x + len, lane, true);
    for (let i = 0; i < 3; i++) this.addObstacle("cone", x + 1.5 + i * ((len - 3) / 2), lane, true);
    this.reserved.push({ lane, from: x - 1, until: x + len + 1 });
    const other = this.otherLane([lane]);
    this.breadLine(x + len + 4, other, 6, 0.5);
    this.addPuddle(x + len / 2, this.otherLane([lane, other]));
    // Open bread lane 'other' is kept completely clear of obstacles!
    this.listVersion++;
    return len + 2;
  }

  private spawnPedestrians(x: number, t: number) {
    const n = 2 + (Math.random() < 0.7 ? 1 : 0) + (t > 0.4 && Math.random() < 0.5 ? 1 : 0);
    const est = Math.max(this.speed, START_SPEED);
    const d = this.distance;
    // Urban crossers start at the curb and cross the live carriageway without reaching sidewalk fixtures.
    const edge = track.mode === "shibuya" ? 4.15 : 6.8;
    // One occasional elderly pedestrian per group; everyone else gets independent timing and direction.
    const elderIndex = Math.random() < 0.3 ? randInt(0, n - 1) : -1;
    const offsets: number[] = [];
    for (let i = 0; i < n; i++) {
      let offset = rand(-1.5, 8.5);
      for (let attempt = 0; attempt < 8 && offsets.some((other) => Math.abs(other - offset) < 1.4); attempt++) {
        offset = rand(-1.5, 8.5);
      }
      offsets.push(offset);
    }
    offsets.sort((a, b) => a - b);
    const firstDir = Math.random() < 0.5 ? 1 : -1;
    for (let i = 0; i < n; i++) {
      const dir = i === 0 ? firstDir : i === 1 ? -firstDir : Math.random() < 0.5 ? 1 : -1;
      const pedestrianS = x + offsets[i];
      const m = this.newMover("pedestrian", pedestrianS, -1, -dir * edge);
      m.dir = dir;
      m.crossingEdge = edge;
      // Any nearby city signal controls the crossing, not just Shibuya's scramble lights.
      const signal = this.intersections
        .filter((inter) => Math.abs(inter.s - pedestrianS) < 18)
        .sort((a, b) => Math.abs(a.s - pedestrianS) - Math.abs(b.s - pedestrianS))[0];
      if (signal) m.signalIntersectionId = signal.id;
      const elderly = i === elderIndex;
      m.elderly = elderly;
      m.speed = elderly ? rand(0.85, 1.25) : rand(1.6, 2.3);
      // Mix casual walkers and salarymen; jittered positions and delays avoid parade-like rows.
      m.variant = elderly ? randInt(0, 2) : Math.random() < 0.35 ? randInt(5, 7) : randInt(0, 4);
      const eta = (pedestrianS - d) / est;
      const walk = (edge - 1.2) / m.speed;
      m.delay = Math.max(0.1, eta - walk + rand(-1.0, 1.0) + rand(0, 0.45));
      this.movers.push(m);
    }
    this.moverVersion++;
    return n * 2.8 + 3.5;
  }

  /**
   * Jalur yang bebas rintangan & kendaraan di sekitar jarak `s` — dipakai item langka biar
   * roketnya benar-benar bisa diambil (bukan muncul di dalam barrier atau di jalur mobil datang).
   * Kembalikan -1 kalau semua jalur sedang penuh.
   */
  private clearLaneNear(s: number): number {
    const lanes = [1, 0, 2]; // tengah dulu (paling gampang diambil), lalu pinggir
    const inIntersection = this.intersections.some((it) => Math.abs(it.s - s) < 14);
    const atRailCrossing = this.crossings.some((cr) => Math.abs(cr.s - s) < 14);
    if (inIntersection || atRailCrossing) return -1;
    for (const lane of lanes) {
      const blocked =
        // Termasuk ramp dan rail: bonus tidak boleh berada tepat di atas / di belakang obstacle.
        this.obstacles.some((o) => o.lane === lane && Math.abs(o.s - s) < obstacleHalf(o) + 9) ||
        this.movers.some((m) => m.kind !== "pedestrian" && Math.abs(m.lane - lane) < 0.5 && Math.abs(m.s - s) < 12) ||
        this.crossCars.some((cc) => Math.abs(cc.s - s) < 8) ||
        this.breads.some((b) => !b.taken && b.lane === lane && Math.abs(b.s - s) < 7) ||
        this.isNearBonusItem(s, lane, 7) ||
        this.reserved.some((r) => r.lane === lane && s > r.from - 2 && s < r.until + 2);
      if (!blocked) return lane;
    }
    return -1;
  }

  private spawnGroup() {
    const t = clamp((this.speed / this.speedMult - START_SPEED) / (MAX_SPEED - START_SPEED), 0, 1);
    const x = this.nextObstacleS;
    const d = this.distance;
    if (x >= this.nextNosS) {
      const lane = this.clearLaneNear(x);
      if (lane >= 0) {
        track.frame(x, LANE_LAT[lane], 0, tmpV);
        this.nosCans.push({ id: this.nextId++, s: x, lane, taken: false, wx: tmpV.x, wy: tmpV.y, wz: tmpV.z, phase: Math.random() * 6 });
        this.listVersion++;
        this.nextNosS = x + NOS_CAN_S + rand(0, 30);
      } else {
        // Coba lagi sedikit lebih depan; jangan paksa NOS muncul di obstacle/perempatan.
        this.nextNosS = x + 12;
      }
    }
    // ---- item LANGKA: roket NOS (jarang, dan selalu di jalur yang bebas rintangan) ----
    if (x >= this.nextRocketS) {
      const tooCloseToSpecial =
        this.crossings.some((c) => Math.abs(c.s - x) < 14) ||
        this.intersections.some((it) => Math.abs(it.s - x) < 16);
      const lane = this.clearLaneNear(x);
      if (tooCloseToSpecial || lane < 0) {
        // tempatnya tidak aman: coba lagi beberapa meter kemudian
        this.nextRocketS = x + 12;
      } else {
        track.frame(x, LANE_LAT[lane], 0, tmpV);
        this.rockets.push({ id: this.nextId++, s: x, lane, taken: false, kind: pickRareKind(), wx: tmpV.x, wy: tmpV.y, wz: tmpV.z, phase: Math.random() * 6 });
        this.listVersion++;
        this.nextRocketS = x + rand(ROCKET_GAP[0], ROCKET_GAP[1]);
      }
    }
    if (x >= this.nextRoadworkS && !this.crossings.some((c) => Math.abs(c.s - x) < 40)) {
      const len = this.spawnRoadworks(x, t);
      this.nextRoadworkS = x + rand(160, 260);
      this.nextObstacleS = x + len + lerp(10, 6, t) + rand(0, 3);
      return;
    }
    const weights: [string, number][] = [
      ["single", 5],
      ["car", 3],
      ["double", 1 + 4 * t],
      ["wall", 1 + 2 * t],
      ["zigzag", 0.4 + 2.5 * t],
      ["ramp", 2.2],
      ["rail", 2.2],
      ["bread", 1.6],
      ["oncoming", track.mode === "haruna" ? 3.2 + 2.4 * t : 11 + 5 * t],
      ["chickens", 2.6 + 1.0 * t],
      ["cats", 2.4 + 1.0 * t],
      ["pedestrians", (track.mode === "haruna" ? 2.2 : 5.0) + 1.2 * t], // frequent city crossings, without crowding mountain roads
      ["puddles", 1.8],
    ];
    const cr = this.crossings.find((c) => !c.placed);
    if (cr && x > cr.s - 46) {
      this.spawnCrossingPattern(cr, x);
      return;
    }
    const nearbyInter = this.intersections.find((it) => Math.abs(it.s - x) < (it.scramble ? 12.5 : it.wide ? 12 : 10));
    if (nearbyInter) {
      this.nextObstacleS = Math.max(x + 6, nearbyInter.s + (nearbyInter.scramble ? 14.5 : nearbyInter.wide ? 14 : 12) + rand(1, 4));
      return;
    }
    const total = weights.reduce((s, w) => s + w[1], 0);
    let r = Math.random() * total;
    let pattern = "single";
    for (const [name, w] of weights) {
      r -= w;
      if (r <= 0) {
        pattern = name;
        break;
      }
    }
    // guarantee the signature obstacles show up early in every run
    const idx = this.patternIndex++;
    if (idx === 1) pattern = "chickens";
    else if (idx === 2) pattern = "cats";
    else if (idx === 4) pattern = "oncoming";
    else if (idx === 0 && (pattern === "oncoming" || pattern === "chickens" || pattern === "cats")) pattern = "single";
    let len = 1;
    switch (pattern) {
      case "single": {
        const lane = randInt(0, 2);
        const kind = pick(JUMPABLES);
        this.addObstacle(kind, x, lane);
        const freeLane = this.otherLane([lane]);
        const rr = Math.random();
        if (rr < 0.6) this.breadLine(x + 8, freeLane);
        len = OBSTACLE_DEFS[kind].halfLen * 2;
        break;
      }
      case "car": {
        const lane = randInt(0, 2);
        this.addObstacle("car", x, lane);
        const freeLane = this.otherLane([lane]);
        if (t > 0.35 && Math.random() < 0.5) {
          const l2 = freeLane;
          this.addObstacle(pick(SMALL_JUMPABLES), x + 4, l2);
          const safeLane = this.otherLane([lane, l2]);
          this.breadLine(x + 8, safeLane);
          len = 5;
        } else {
          if (Math.random() < 0.6) this.breadLine(x + 8, freeLane);
          len = 3.4;
        }
        break;
      }
      case "double": {
        const free = randInt(0, 2);
        const lanes = [0, 1, 2].filter((l) => l !== free);
        const twoCars = t > 0.4 && Math.random() < 0.4;
        for (const l of lanes) {
          const kind = twoCars ? "car" : Math.random() < 0.45 ? "car" : pick(JUMPABLES);
          this.addObstacle(kind, x, l);
        }
        this.breadLine(x + 8, free);
        len = 3.4;
        break;
      }
      case "wall": {
        const kind = pick(["cone", "barrier", "planter"] as ObstacleKind[]);
        for (let l = 0; l < 3; l++) this.addObstacle(kind, x, l);
        // Wall is a jump-check: no misleading bread arcs over obstacles!
        len = OBSTACLE_DEFS[kind].halfLen * 2;
        break;
      }
      case "zigzag": {
        const step = lerp(5.5, 4.8, t);
        let free = randInt(0, 2);
        for (let i = 0; i < 3; i++) {
          if (i > 0) free = pick([free - 1, free + 1].filter((l) => l >= 0 && l <= 2));
          const rx = x + i * step;
          let carUsed = false;
          for (const l of [0, 1, 2]) {
            if (l === free) continue;
            const useCar = !carUsed && t > 0.35 && Math.random() < 0.45;
            if (useCar) carUsed = true;
            this.addObstacle(useCar ? "car" : pick(SMALL_JUMPABLES), rx, l);
          }
          this.addBread(rx, free, 0.5);
          this.addBread(rx + 1, free, 0.5);
        }
        len = step * 2 + 2;
        break;
      }
      case "ramp": {
        const lane = randInt(0, 2);
        this.addObstacle("ramp", x, lane);
        const end = x + OBSTACLE_DEFS.ramp.halfLen;
        const v = this.speed + 1;
        for (let i = 0; i < 7; i++) {
          const dx = 1 + i * 1.1;
          const tt = dx / v;
          const y = 1 + RAMP_V * tt - 0.5 * GRAVITY * tt * tt;
          if (y > 0.4) this.addBread(end + dx, lane, y + 0.2);
        }
        // Landing zone is completely safe - no trap cars!
        len = OBSTACLE_DEFS.ramp.halfLen + v * 1.05 + 1.5;
        break;
      }
      case "rail": {
        const lane = randInt(0, 2);
        const weights = [3, 2 + 2 * t, 1 + 3 * t, 0.5 + 3 * t];
        let rr = Math.random() * weights.reduce((a, b) => a + b, 0);
        let li = 0;
        for (; li < weights.length - 1; li++) {
          rr -= weights[li];
          if (rr <= 0) break;
        }
        const L = RAIL_LENGTHS[li];
        const half = L / 2;
        const cx = x + half;
        const variant = L >= 18 && Math.random() < 0.4 ? 1 : 0;
        this.addObstacle("rail", cx, lane, false, half, variant);
        if (L >= 12 && t > 0.3 && Math.random() < 0.6) {
          const l2 = this.otherLane([lane]);
          const L2 = pick([7, 12]);
          this.addObstacle("rail", cx + rand(-2, 2), l2, false, L2 / 2, 0);
        }
        len = L + 0.5;
        break;
      }
      case "bread": {
        const lane = randInt(0, 2);
        if (Math.random() < 0.4) this.breadLine(x, lane, 6);
        else if (Math.random() < 0.7) this.breadArc(x + 2, lane);
        else {
          const l2 = this.otherLane([lane]);
          this.breadLine(x, lane, 3);
          this.breadLine(x + 3.5, l2, 3);
        }
        len = 6.5;
        break;
      }
      case "oncoming": {
        if (track.mode !== "haruna") {
          // City waves fill all three lanes in staggered order, never side-by-side.
          len = this.spawnShibuyaTrafficWave(x, t);
          break;
        }
        const lane = randInt(0, 2);
        this.spawnOncoming(x, lane, t);
        if (t > 0.5 && Math.random() < 0.4) {
          const l2 = this.otherLane([lane]);
          this.spawnOncoming(x + 10, l2, t);
          const safeLane = this.otherLane([lane, l2]);
          this.breadLine(x + 8, safeLane);
          len = 18;
        } else {
          const safeLane = this.otherLane([lane]);
          if (Math.random() < 0.6) this.breadLine(x + 8, safeLane);
          len = 8;
        }
        break;
      }
      case "pedestrians": {
        len = this.spawnPedestrians(x, t);
        break;
      }
      case "puddles": {
        const lane = randInt(0, 2);
        const l2 = this.otherLane([lane]);
        this.addPuddle(x, lane);
        this.addPuddle(x + 2.2, l2);
        const dryLane = this.otherLane([lane, l2]);
        this.breadLine(x - 0.5, dryLane, 5, 0.5);
        len = 7;
        break;
      }
      case "chickens": {
        const n = 1 + (Math.random() < 0.55 ? 1 : 0) + (t > 0.4 && Math.random() < 0.4 ? 1 : 0);
        const dir = Math.random() < 0.5 ? 1 : -1;
        const est = Math.max(this.speed, 6);
        const eta = (x - d) / est;
        const base = Math.max(0.2, eta - 2.9 + rand(-0.7, 0.7));
        for (let i = 0; i < n; i++) {
          const m = this.newMover("chicken", x + i * 1.1, -1, -dir * CHICKEN_EDGE);
          m.dir = dir;
          m.delay = base + i * 0.42;
          m.variant = i;
          this.movers.push(m);
        }
        this.moverVersion++;
        len = n * 1.1 + 3;
        break;
      }
      case "cats": {
        const n = 1 + (Math.random() < 0.45 ? 1 : 0);
        const dir = Math.random() < 0.5 ? 1 : -1;
        const est = Math.max(this.speed, 6);
        const eta = (x - d) / est;
        const base = Math.max(0.2, eta - 2.8 + rand(-0.5, 0.5));
        for (let i = 0; i < n; i++) {
          const m = this.newMover("cat", x + i * 1.4, -1, -dir * 4.2);
          m.dir = dir;
          m.speed = rand(1.8, 2.5);
          m.delay = base + i * 0.45;
          m.variant = randInt(0, 3); // 0: oren, 1: hitam, 2: putih, 3: hitam-putih
          this.movers.push(m);
        }
        this.moverVersion++;
        len = n * 1.4 + 3;
        break;
      }
    }
    // Denser than the old 10–13 m opening gap, but keep a readable landing/reset window.
    const gap = lerp(8.5, 5.5, t) + rand(0, 2.5);
    this.nextObstacleS = x + len + gap;
  }

  private cull() {
    const d = this.distance;
    let changed = false;
    if (this.chunks.length && this.chunks[0].s0 + CHUNK_LEN < d - 20) {
      this.chunks.shift();
      changed = true;
    }
    const before = this.obstacles.length;
    this.obstacles = this.obstacles.filter((o) => o.s + obstacleHalf(o) > d - 16);
    if (this.obstacles.length !== before) changed = true;
    if (this.breads.length && this.breads[0].s < d - 14) this.breads = this.breads.filter((b) => b.s > d - 14);
    if (this.puddles.length && this.puddles[0].s < d - 14) {
      this.puddles = this.puddles.filter((pu) => pu.s > d - 14);
      changed = true;
    }
    if (this.nosCans.length && this.nosCans[0].s < d - 14) {
      this.nosCans = this.nosCans.filter((c) => c.s > d - 14);
      changed = true;
    }
    if (this.rockets.length && this.rockets[0].s < d - 16) {
      this.rockets = this.rockets.filter((r) => r.s > d - 16);
      changed = true;
    }
    if (this.roadSigns.length && this.roadSigns[0].variant < d - 30) {
      this.roadSigns.shift();
      changed = true;
    }
    if (this.reserved.length && this.reserved[0].until < d) this.reserved = this.reserved.filter((r) => r.until > d);
    if (this.crossings.length && this.crossings[0].s < d - 30) {
      const gone = this.crossings.shift()!;
      const n = this.trains.length;
      this.trains = this.trains.filter((tr) => tr.crossing !== gone);
      if (this.trains.length !== n) this.moverVersion++;
      changed = true;
    }
    if (this.intersections.length && this.intersections[0].s < d - 32) {
      const gone = this.intersections.shift()!;
      const n = this.crossCars.length;
      this.crossCars = this.crossCars.filter((cc) => cc.intersectionId !== gone.id);
      if (this.crossCars.length !== n) this.moverVersion++;
      changed = true;
    }
    if (changed) this.listVersion++;
  }

  /* ---------- Sakura petals ---------- */
  private updatePetals(dt: number) {
    const N = 90;
    const c = this.center;
    const fx = Math.cos(c.th);
    const fz = Math.sin(c.th);
    const spawn = (ahead: number) => {
      const s = this.distance + ahead;
      const side = Math.random() < 0.5 ? -1 : 1;
      const lat = Math.random() < 0.75 ? side * rand(4, 9.5) : rand(-4, 4);
      track.frame(s, lat, rand(1.5, 6.5), tmpV);
      return {
        x: tmpV.x, y: tmpV.y, z: tmpV.z,
        vx: rand(-0.6, 0.2) - fx * 0.4, vy: rand(-0.9, -0.45), vz: rand(-0.5, 0.5) + fz * 0.2,
        rx: rand(0, 6), ry: rand(0, 6), rz: rand(0, 6), wr: rand(1.5, 4), ph: rand(0, 6.28),
      };
    };
    while (this.petals.length < N) this.petals.push(spawn(rand(-4, 40)));
    const t = this.time;
    for (let i = 0; i < this.petals.length; i++) {
      const p = this.petals[i];
      // flutter: sideways sway + tumbling
      p.x += (p.vx + Math.sin(t * 1.7 + p.ph) * 0.5) * dt;
      p.y += (p.vy + Math.sin(t * 2.3 + p.ph) * 0.25) * dt;
      p.z += (p.vz + Math.cos(t * 1.3 + p.ph) * 0.5) * dt;
      p.rx += p.wr * dt;
      p.rz += p.wr * 0.6 * dt;
      // recycle when it lands or falls behind the camera
      const rel = (p.x - c.x) * fx + (p.z - c.z) * fz;
      const groundY = track.sample(this.distance + rel).y;
      if (p.y < groundY + 0.05 || rel < -8 || rel > 45) this.petals[i] = spawn(rand(6, 40));
    }
  }

  /* ---------- Denyut (cincin tipis) ---------- */
  /** Tambah satu cincin "denyut" di titik tabrakan. */
  spawnPulse(x: number, y: number, z: number, opts: { max: number; r0: number; r1: number; color: [number, number, number] }) {
    this.pulses.push({
      x,
      y,
      z,
      t: 0,
      max: opts.max,
      r0: opts.r0,
      r1: opts.r1,
      cr: opts.color[0],
      cg: opts.color[1],
      cb: opts.color[2],
    });
    if (this.pulses.length > 8) this.pulses.splice(0, this.pulses.length - 8);
  }

  /**
   * Ambil item LANGKA (roket): NOS langsung penuh, bonus skor besar, kilatan sinar
   * (raylight) + cincin emas, dan getaran kecil di kamera biar terasa "berharga".
   */
  private collectRocket(r: { taken: boolean; kind: RareKind; wx: number; wy: number; wz: number }) {
    const reward = RARE_REWARD[r.kind] ?? RARE_REWARD.rocket;
    const rgb = RARE_FLASH_RGB[r.kind] ?? RARE_FLASH_RGB.rocket;
    r.taken = true;
    this.rocketTaken++;
    this.trickScore += reward.score;
    this.addNos(NOS_MAX * reward.nos);
    this.rareFlash = RARE_FLASH_T;
    this.rareFlashPos = [r.wx, r.wy, r.wz];
    this.rareFlashRGB = [rgb[0], rgb[1], rgb[2]];
    this.punch = Math.max(this.punch, 0.22);
    this.spawnPulse(r.wx, r.wy + 0.5, r.wz, { max: 0.55, r0: 0.6, r1: 4.2, color: [rgb[0], rgb[1], rgb[2]] });
    this.emitWorld("pow", r.wx, r.wy + 0.6, r.wz, r.wy, 14, 0, 0);
    this.emitWorld("spark", r.wx, r.wy + 0.5, r.wz, r.wy, 18, 0, 0);
    useUI.getState().addPopup(reward.title, r.kind === "diamond" ? "#4fd8ff" : "#ffc93c", reward.sub);
    sfx.rare();
  }

  private updatePulses(dt: number) {
    for (let i = this.pulses.length - 1; i >= 0; i--) {
      const q = this.pulses[i];
      q.t += dt;
      if (q.t >= q.max) this.pulses.splice(i, 1);
    }
  }

  /**
   * Efek tabrakan hewan: CUKUP satu cincin denyut tipis yang mengembang cepat
   * (ripple ala knockback) + sedikit serpihan. Tanpa screen shake, tanpa freeze,
   * dan kamera cuma dapat nudge zoom tipis.
   */
  private animalImpactFx(x: number, y: number, z: number, floorY: number, color: [number, number, number]) {
    this.spawnPulse(x, y, z, { max: 0.28, r0: 0.35, r1: 1.7, color });
    this.emitWorld("pow", x, y, z, floorY, 7, 0, 0);
    this.punch = ANIMAL_PUNCH;
  }

  /** Asap knalpot untuk kendaraan yang sedang berjalan (dipanggil tiap frame, dibatasi timer). */
  private emitExhaust(m: Mover, back: number, h: number, interval: number, dt: number) {
    if (this.phase !== "playing" && this.phase !== "menu") return;
    m.smokeT = (m.smokeT ?? 0) - dt;
    if (m.smokeT > 0) return;
    m.smokeT = interval;
    // posisi knalpot: di belakang kendaraan yang sedang melaju mendekat (+s)
    const sPos = m.s + back;
    const c = track.sample(sPos, tmpS);
    const lat = m.lat + rand(-0.16, 0.16);
    const x = c.x - Math.sin(c.th) * lat;
    const z = c.z + Math.cos(c.th) * lat;
    this.emitWorld("smoke", x, c.y + h, z, c.y - 0.4, 1, Math.cos(c.th), Math.sin(c.th));
  }

  /* ---------- Particles ---------- */
  emit(kind: "feather" | "crumb" | "spark" | "dust" | "splash" | "pow", ds: number, h: number, lat: number, n: number) {
    const c = track.sample(this.distance + ds, tmpS);
    const x = c.x - Math.sin(c.th) * lat;
    const z = c.z + Math.cos(c.th) * lat;
    this.emitWorld(kind, x, c.y + h, z, c.y + 0.02, n, Math.cos(c.th), Math.sin(c.th));
  }

  emitWorld(kind: "feather" | "crumb" | "spark" | "dust" | "splash" | "pow" | "smoke", x: number, y: number, z: number, floor: number, n: number, tx: number, tz: number) {
    for (let i = 0; i < n; i++) {
      let pt: Particle;
      if (kind === "smoke") {
        // asap knalpot: abu-abu, naik pelan sambil membesar lalu memudar
        const g = rand(0.42, 0.62);
        pt = {
          x: x + rand(-0.06, 0.06), y: y + rand(-0.03, 0.05), z: z + rand(-0.06, 0.06),
          vx: -tx * rand(0.5, 1.6) + rand(-0.35, 0.35),
          vy: rand(0.5, 1.15),
          vz: -tz * rand(0.5, 1.6) + rand(-0.35, 0.35),
          life: 0, max: rand(0.45, 0.8), size: rand(0.07, 0.12),
          r: g, g: g, b: g + 0.03,
          rx: rand(0, 6), ry: rand(0, 6), spin: rand(-2, 2),
          gravity: -0.35, floor, grow: 2.6,
        };
      } else if (kind === "pow") {
        // serpihan komik ala "POW!": menyebar radial, putih/keemasan, muter cepat
        const a = (i / Math.max(1, n)) * Math.PI * 2 + rand(-0.18, 0.18);
        const sp = rand(4, 8.5);
        const gold = Math.random() < 0.5;
        pt = {
          x, y, z,
          vx: Math.cos(a) * sp, vy: rand(1.2, 4.6), vz: Math.sin(a) * sp,
          life: 0, max: rand(0.22, 0.42), size: rand(0.17, 0.3),
          r: 1, g: gold ? rand(0.7, 0.9) : 1, b: gold ? rand(0.12, 0.35) : 0.9,
          rx: rand(0, 6), ry: rand(0, 6), spin: rand(-16, 16), gravity: 3, floor,
        };
      } else if (kind === "feather") {
        const g = rand(0.55, 0.95);
        pt = {
          x: x + rand(-0.3, 0.3), y: y + rand(-0.3, 0.3), z: z + rand(-0.3, 0.3),
          vx: rand(-3, 3), vy: rand(1, 6), vz: rand(-3, 3),
          life: 0, max: rand(0.8, 1.5), size: 0.2, r: g, g: g, b: g + 0.04,
          rx: rand(0, 6), ry: rand(0, 6), spin: rand(-8, 8), gravity: 4, floor,
        };
      } else if (kind === "crumb") {
        pt = {
          x, y, z, vx: rand(-2, 2), vy: rand(2, 5), vz: rand(-2, 2),
          life: 0, max: rand(0.35, 0.6), size: 0.1, r: 0.9, g: 0.68, b: 0.4,
          rx: 0, ry: 0, spin: rand(-6, 6), gravity: 22, floor,
        };
      } else if (kind === "splash") {
        const side = Math.random() < 0.5 ? -1 : 1;
        pt = {
          x: x + rand(-0.2, 0.2), y, z: z + side * rand(0.2, 0.5),
          vx: -tx * rand(1, 3) + rand(-0.5, 0.5), vy: rand(2.5, 5), vz: -tz * rand(1, 3) + side * rand(1.5, 3.5),
          life: 0, max: rand(0.3, 0.5), size: rand(0.08, 0.16), r: 0.55, g: 0.75, b: 0.95,
          rx: 0, ry: 0, spin: rand(-4, 4), gravity: 18, floor,
        };
      } else if (kind === "spark") {
        const back = rand(2, 6);
        pt = {
          x, y, z: z + rand(-0.1, 0.1), vx: -tx * back + rand(-1, 1), vy: rand(1, 4), vz: -tz * back + rand(-1, 1),
          life: 0, max: rand(0.2, 0.4), size: 0.09, r: 1, g: rand(0.6, 0.9), b: 0.1,
          rx: 0, ry: 0, spin: 0, gravity: 18, floor,
        };
      } else {
        pt = {
          x: x + rand(-0.4, 0.4), y, z: z + rand(-0.4, 0.4), vx: rand(-1.5, 1.5), vy: rand(0.5, 1.5), vz: rand(-1.5, 1.5),
          life: 0, max: rand(0.3, 0.5), size: 0.16, r: 0.85, g: 0.85, b: 0.82,
          rx: 0, ry: 0, spin: 0, gravity: -1, floor,
        };
      }
      this.particles.push(pt);
    }
    if (this.particles.length > 150) this.particles.splice(0, this.particles.length - 150);
  }

  private updateParticles(dt: number) {
    const arr = this.particles;
    for (let i = arr.length - 1; i >= 0; i--) {
      const pt = arr[i];
      pt.life += dt;
      if (pt.life >= pt.max) {
        arr.splice(i, 1);
        continue;
      }
      pt.vy -= pt.gravity * dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.z += pt.vz * dt;
      if (pt.y < pt.floor && pt.gravity > 0) {
        pt.y = pt.floor;
        pt.vy *= -0.3;
        pt.vx *= 0.7;
        pt.vz *= 0.7;
      }
      pt.rx += pt.spin * dt;
      pt.ry += pt.spin * 0.7 * dt;
    }
  }
}

export const engine = new Engine();
