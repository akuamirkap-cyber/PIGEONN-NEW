import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { buildVoxelGeometry, clamp, rand, voxelMaterial } from "./voxel";
import { engine, LANE_LAT } from "./engine";
import { useUI } from "./store";
import { charBodyParts, charHeadParts, charTailParts, charWingParts, deckParts, getSkin, truckParts, wheelParts, HIP_Y, LEG_Z, TAIL_ROOT } from "./skins";
import { RIG, LegRig } from "./pigeonRig";
import { nosTankParts } from "./models";
import { buildShibuyaAnimalRig } from "./shibuyaPacks";

/** Max truck steering angle (rad) at full lean — real trucks turn ~10–20° with the deck tilted ~15–20° */
const TRUCK_MAX = 0.42;
const tmpV = new THREE.Vector3();
const pivotV = new THREE.Vector3();
const PS = RIG.pigeonScale; // chunky pigeon scale
const ROAD_Y = -RIG.deckToRoad; // street level in deck space (deck top = 0)

/* Push cycle keyframes for the SOLE of the kicking foot, in deck space (x fwd, y up, z out to the camera side). */
type K = [number, number, number];
const K_REST: K = [0.02, 0, LEG_Z];
const K_LIFT: K = [0.14, 0.07, 0.31];
const K_DOWN: K = [0.16, ROAD_Y, 0.36];
const K_BACK: K = [-0.15, ROAD_Y, 0.36];
const K_UP: K = [-0.1, 0.06, 0.3];
const smooth = (k: number) => k * k * (3 - 2 * k);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Spring-damper 1D: gerak sekunder ragdoll (kepala/sayap/ekor/torso) supaya lunglai
 *  & berayun dengan inersia seperti boneka kain — bukan pose kaku hasil fungsi langsung. */
function springStep(x: number, v: number, target: number, stiff: number, damp: number, dt: number): [number, number] {
  v += (target - x) * stiff * dt;
  v *= Math.exp(-damp * dt);
  x += v * dt;
  return [x, v];
}
function lerpK(a: K, b: K, k: number, out: K) {
  out[0] = a[0] + (b[0] - a[0]) * k;
  out[1] = a[1] + (b[1] - a[1]) * k;
  out[2] = a[2] + (b[2] - a[2]) * k;
}
const kTmp: K = [0, 0, 0];

/** Sole target of the pushing foot for cycle progress u (0..1). Also returns the drive factor (foot on the street). */
function pushTarget(u: number, out: K): number {
  if (u < 0.12) lerpK(K_REST, K_LIFT, smooth(u / 0.12), out);
  else if (u < 0.24) lerpK(K_LIFT, K_DOWN, smooth((u - 0.12) / 0.12), out);
  else if (u < 0.62) lerpK(K_DOWN, K_BACK, (u - 0.24) / 0.38, out);
  else if (u < 0.82) lerpK(K_BACK, K_UP, smooth((u - 0.62) / 0.2), out);
  else lerpK(K_UP, K_REST, smooth((u - 0.82) / 0.18), out);
  return u > 0.2 && u < 0.66 ? Math.sin(Math.PI * ((u - 0.2) / 0.46)) : 0;
}

export function Player() {
  // in the menu the carousel preview is shown; during a run the equipped skin
  const skinId = useUI((s) => (s.phase === "menu" ? s.preview : s.skin));
  const deckOverride = useUI((s) => s.deckOverride);
  const skin = getSkin(skinId);

  const root = useRef<THREE.Group>(null);
  const yawG = useRef<THREE.Group>(null);
  const bank = useRef<THREE.Group>(null);
  const board = useRef<THREE.Group>(null);
  const pigeon = useRef<THREE.Group>(null);
  const friendModel = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null); // body+head+wings; leans about the hips while the legs stay planted
  const head = useRef<THREE.Mesh>(null);
  const wingL = useRef<THREE.Mesh>(null);
  const wingR = useRef<THREE.Mesh>(null);
  const wheels = useRef<(THREE.Mesh | null)[]>([]);
  const tail = useRef<THREE.Mesh>(null);
  const tailSway = useRef(0);
  const restBlend = useRef(0);
  /** State spring ragdoll: posisi+kecepatan sekunder tiap anggota badan (di-reset tiap ronde) */
  const flop = useRef({
    hx: 0, hy: 0, hz: 0, hvx: 0, hvy: 0, hvz: 0,
    wrx: 0, wrz: 0, wrvx: 0, wrvz: 0,
    wlx: 0, wlz: 0, wlvx: 0, wlvz: 0,
    tz: 0, tvz: 0, arch: 0, archv: 0,
    prevBounces: 0,
    seeded: false,
    justSeeded: false,
  });
  /** sudut kepala yang dihaluskan (low-pass): fokus ke depan + memantau situasi, santai */
  const headLook = useRef({ yaw: 0, pitch: 0 });
  const contactK = useRef(0); // 0 airborne .. 1 rolling on the ground/rail (smoothed so takeoff/landing do not pop)
  const truckFront = useRef<THREE.Group>(null);
  const truckRear = useRef<THREE.Group>(null);

  const wheelColor = useUI((s) => s.wheelColor);
  const geos = useMemo(
    () => ({
      body: buildVoxelGeometry(charBodyParts(skin)),
      head: buildVoxelGeometry(charHeadParts(skin)),
      wingR: buildVoxelGeometry(charWingParts(skin, 1)),
      wingL: buildVoxelGeometry(charWingParts(skin, -1)),
      deck: buildVoxelGeometry(deckParts(skin, deckOverride)),
      wheel: buildVoxelGeometry(wheelParts(skin, deckOverride, wheelColor)),
      truck: buildVoxelGeometry(truckParts()),
      tail: buildVoxelGeometry(charTailParts(skin)),
      tanks: buildVoxelGeometry(nosTankParts()),
    }),
    [skin, deckOverride, wheelColor],
  );
  // Little Japan Friends use the original Shibuya Blocks geometry as one full
  // mesh. Do not run it through the pigeon body/head rig: that would distort
  // quadrupeds, the crane, and the capybara's bath setting.
  const friendRig = useMemo(() => (skin.kind === "littleJapanFriend" && skin.friend ? buildShibuyaAnimalRig(skin.friend) : null), [skin.kind, skin.friend]);
  const flameMats = useMemo(
    () => ({
      core: new THREE.MeshBasicMaterial({ color: "#bfe9ff", transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }),
      mid: new THREE.MeshBasicMaterial({ color: "#4cc9f0", transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }),
      outer: new THREE.MeshBasicMaterial({ color: "#ff9f1c", transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }),
    }),
    [],
  );
  const flames = useRef<THREE.Group>(null);
  const tanks = useRef<THREE.Mesh>(null);
  const dizzyRef = useRef<THREE.Group>(null);
  const starGeo = useMemo(() => new THREE.OctahedronGeometry(0.065, 0), []);
  const starMat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#ffd166" }), []);
  useEffect(() => () => { starGeo.dispose(); starMat.dispose(); }, [starGeo, starMat]);
  useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);
  useEffect(() => () => friendRig?.dispose(), [friendRig]);
  // IK legs: [0] = pushing leg on the camera side (+z), [1] = planted leg (-z)
  const legs = useMemo(() => [new LegRig(skin), new LegRig(skin)], [skin]);
  useEffect(() => () => legs.forEach((l) => l.dispose()), [legs]);

  useFrame((_, dt) => {
    const p = engine.player;
    const t = engine.time;
    const r = root.current;
    const yg = yawG.current;
    const bk = bank.current;
    const bd = board.current;
    const pg = pigeon.current;
    const ts = torso.current;
    const hd = head.current;
    if (!r || !yg || !bk || !bd || !pg || !ts || !hd) return;
    // Keep source animation deterministic on tab/frame stalls and clear any
    // active Shift gesture before the Pigeon ragdoll takes over.
    friendRig?.mixer.update(Math.min(dt, 0.05));
    const [legPush, legPlant] = legs;

    const crashed = engine.phase === "crashed" || engine.phase === "gameover";
    if (crashed) friendRig?.setPush(-1, ROAD_Y);
    const flapping = p.wing > 0.05;

    // follow the track frame
    r.position.set(p.wx, p.wy, p.wz);
    r.quaternion.copy(p.quat);

    const nm = engine.newTurn; // physics turning mode
    const spr = engine.sprint; // 0..1 SHIFT sprint intensity (fast kicks, forward lean)
    if (nm) {
      // wheel radius ~0.065: spin = speed / r; 0.3x while grinding rails (wheels barely turn), 1.0x on bus roof, 0.6x airborne (freewheel).
      // The per-frame step is capped so a fast board does not alias into a flickering wheel.
      const mult = p.subwayMover ? 1 : p.grinding ? 0.3 : p.grounded ? 1 : 0.6;
      const spin = Math.min((engine.speed / 0.065) * dt * mult, 1.2);
      for (const w of wheels.current) if (w) w.rotation.z -= spin;
    } else {
      for (const w of wheels.current) if (w) w.rotation.z -= engine.speed * dt * 7;
    }

    // ---- truck steering (the physics of a real carve) ----
    // Tilting the deck turns the hangers: the FRONT truck steers into the turn, the REAR truck steers the
    // opposite way, so the wheels roll along the arc the board is carving instead of scrubbing sideways.
    // carve > 0 = leaning toward -z (screen-left) => the board should turn toward -z => front yaw positive.
    {
      const tf = truckFront.current;
      const trr = truckRear.current;
      if (tf && trr) {
        if (crashed) {
          tf.rotation.y = 0;
          trr.rotation.y = 0;
        } else if (nm) {
          // NEW: the angles come straight from the physics (front = lean * steerMax, rear = -0.85 * front,
          // damped with lambda 18 on the ground / 10 in the air) — they are what turns the board.
          tf.rotation.y = p.truckF;
          trr.rotation.y = p.truckR;
        } else {
          const lean = p.carve; // rad
          const steer = clamp(lean / 0.62, -1, 1) * TRUCK_MAX;
          // in the air the wheels hang: they still follow the tilt, but softer
          const k = p.grounded || p.grinding ? 1 : 0.6;
          tf.rotation.y = steer * k;
          trr.rotation.y = -steer * k;
        }
      }
    }

    // torso lean helper: rotate about the hip line, not the feet
    const leanTorso = (rx: number, rz: number, dx: number, dy: number, dz: number, ry = 0) => {
      ts.rotation.set(rx, ry, rz);
      pivotV.set(0, HIP_Y, 0);
      tmpV.copy(pivotV).applyEuler(ts.rotation);
      ts.position.set(pivotV.x - tmpV.x + dx, pivotV.y - tmpV.y + dy, pivotV.z - tmpV.z + dz);
    };

    // Smooth rest state blend: 0 = dynamic flight/tumble, 1 = resting flat on asphalt
    if (crashed && p.body) {
      restBlend.current += ((p.body.rest ? 1 : 0) - restBlend.current) * (1 - Math.exp(-dt * 6));
    } else {
      restBlend.current = 0;
    }
    const rb = restBlend.current;
    const sdt = Math.min(dt, 0.05);
    const fl2 = flop.current;
    fl2.justSeeded = false;
    if (!crashed && fl2.seeded) {
      // ronde baru: kosongkan state flop supaya crash berikutnya mulai fresh
      fl2.seeded = false;
      fl2.prevBounces = 0;
      fl2.hvx = fl2.hvy = fl2.hvz = 0;
      fl2.wrvx = fl2.wrvz = 0;
      fl2.wlvx = fl2.wlvz = 0;
      fl2.tvz = 0;
      fl2.archv = 0;
    }

    if (!crashed) {
      // whole rig yaws into the turn (real steering), plus trick spins and the menu turntable
      yg.rotation.y = p.yaw + p.showYaw + p.steer;
      // bank the whole rig about the wheel contact line (the bank group's origin sits at road level),
      // so the outside wheels lift and the inside edge digs in like a real carve
      bk.rotation.x = p.roll;
      // NEW: lift the whole rig a hair while carving (the outer wheels ride higher; keeps the inner ones out of the road)
      const lv = nm ? engine.turn.leanVis : 0; // right-positive lean
      // Bank about the wheel CONTACT EDGE instead of the board centre, otherwise the inside wheels sink into the
      // road (z * sin(roll), ~0.13 world units at 28°). Rotating about P = (0, 0, ±z0) is the same as rotating about the
      // origin and moving the group by (0, z0 sin(roll), z0 (1 - cos(roll))). z0 = wheel offset + half wheel width.
      contactK.current += ((p.grounded || p.grinding ? 1 : 0) - contactK.current) * (1 - Math.exp(-dt * 14));
      const z0 = (p.roll >= 0 ? 1 : -1) * (RIG.wheelZ + 0.07);
      bk.position.set(0, contactK.current * z0 * Math.sin(p.roll), contactK.current * z0 * (1 - Math.cos(p.roll)));
      const tr = p.trick;
      const g = p.grab; // +1 method (board pulled up behind), -1 indy (board tucked under)
      const grabLift = g > 0 ? g * 0.25 : 0;
      const grabTuck = g < 0 ? -g * 0.18 : 0;
      bd.position.set(g > 0 ? -g * 0.2 : 0, RIG.boardY + grabLift + grabTuck, 0);
      // board yaws into the carve (nose points where the pigeon is going) on top of any trick rotation
      // NEW: in the air the feet steer the board, so it tilts a little MORE than the body (lean * 0.2)
      const airTilt = nm ? lv * 0.2 * p.airBlend : 0;
      bd.rotation.set(p.flip + (g > 0 ? g * 0.9 : 0) + airTilt, p.boardYaw + p.boardTwist, p.pitch + (g < 0 ? g * 0.35 : 0));

      let hop = 0;
      // semua trick flip/shuv-family mendapat "pop" papan naik-turun ala ollie
      const FLIP_HOP: readonly string[] = [
        "kickflip", "heelflip", "shuvit", "impossible",
        "varial", "inward", "hardflip", "fingerflip", "pressure", "dblflip", "hospital", "treflip", "laser", "bigspin",
      ];
      if (tr && FLIP_HOP.includes(tr.kind)) hop = Math.sin(Math.PI * Math.min(1, tr.t / tr.dur)) * 0.28;
      const idle = engine.phase === "menu" ? Math.sin(t * 6) * 0.02 : 0;
      const grounded = p.grounded || p.grinding;
      const airborne = !grounded;

      // ---- legs & body crouch ----
      const u = p.push; // -1 idle, 0..1 push cycle
      let dip = 0; // body crouch (the standing knee bends)
      let drive = 0;
      let out = 0;
      if (u >= 0) {
        drive = pushTarget(u, kTmp);
        out = u < 0.12 ? smooth(u / 0.12) : u < 0.82 ? 1 : 1 - smooth((u - 0.82) / 0.18);
        dip = 0.1 * drive + 0.05 * spr;
      } else if (airborne) {
        dip = 0.06 * Math.min(1, p.airT * 6); // knees bend as the pigeon pulls the board up
      }
      // grabs: crouch toward the board
      const crouch = g > 0 ? g * 0.12 : g < 0 ? -g * 0.1 : 0;
      const s = p.squash;
      pg.position.set(0, RIG.pigeonY + hop - crouch - dip + grabLift + grabTuck, -0.03 * out);
      pg.rotation.set(0, 0, p.pitch * 0.5 + (g > 0 ? g * 0.35 : 0) + (g < 0 ? g * 0.25 : 0));
      pg.scale.set(PS * (1 + 0.18 * s), PS * (1 - 0.32 * s + idle), PS * (1 + 0.18 * s));

      if (friendModel.current && friendRig) {
        // Keep the source animal recognizable in the air: a small centered tuck
        // and board-following lean, while the source Play clip animates its
        // individual tail, arms, wings, head, and legs underneath.
        const jumpPose = airborne ? Math.min(1, p.airT * 7) : 0;
        friendModel.current.position.y = 0.018 * jumpPose;
        friendModel.current.rotation.set(-0.14 * jumpPose + p.pitch * 0.22, p.boardYaw * 0.12, p.roll * 0.18);
        friendModel.current.scale.set(
          1 + 0.035 * jumpPose,
          1 - 0.075 * jumpPose,
          1 + 0.035 * jumpPose,
        );
      }
      // Shift animates the selected source leg node itself. No replacement
      // foot/body geometry is attached to the Friend rig.
      friendRig?.setPush(u, ROAD_Y);

      // ---- LENGAN/SAYAP: pose sesuai freestyle, BUKAN melambai ----
      if (friendRig) {
        const armK = 1 - Math.exp(-dt * 9);
        const breathe = Math.sin(t * 2.3) * 0.035;
        // stance santai: bahu sedikit ke belakang, lengan renggang tipis menjaga balance
        let rxL = -0.24, rxR = -0.24;
        let spL = 0.16 + breathe, spR = 0.16 + breathe;
        const grabbing = Math.abs(g) > 0.05 && tr?.kind !== "christ";
        const flapTrick = tr?.kind === "wingflap";
        const christTrick = tr?.kind === "christ";
        if (u >= 0) {
          // ayunan balik mengikuti hentakan kaki (mirroring pushSwing sayap merpati)
          const swing = 0.4 * (1 + 0.8 * spr) * Math.sin(Math.PI * Math.min(1, u));
          rxL -= swing;
          rxR -= swing * 0.7;
        } else if (christTrick) {
          // CHRIST AIR: kedua lengan terbentang lurus membentuk huruf T!
          rxL = -0.02; rxR = -0.02;
          spL = 1.05; spR = 1.05;
        } else if (grabbing) {
          // GRAB (method/indy): tangan kanan menjangkau papan, kiri membuka lebar
          rxR = g > 0 ? 0.95 : 0.8;
          spR = 0.06;
          rxL = -0.28;
          spL = 0.75;
        } else if (flapTrick) {
          // wingflap: lengan/sayap mengepak sesuai irama trick
          const flapA = 0.55 + Math.sin(t * 40) * 0.5;
          spL = flapA; spR = flapA;
          rxL = -0.1; rxR = -0.1;
        } else if (airborne) {
          // flip/ollie di udara: kedua tangan terbuka lebar menjaga keseimbangan
          const openT = Math.min(1, p.airT * 5);
          rxL = -0.12 + openT * 0.12; rxR = -0.12 + openT * 0.12;
          spL = 0.3 + 0.5 * openT; spR = 0.3 + 0.5 * openT;
        } else if (p.grinding) {
          // grind: rapat & rendah menjaga posisi di atas rail
          rxL = 0.12; rxR = 0.12; spL = 0.42; spR = 0.42;
        } else {
          // carve/berbelok: lengan sisi LUAR sedikit terangkat (seperti sayap luar merpati)
          const lvA = nm ? engine.turn.leanVis : -p.carve * 1.6;
          const amt = Math.abs(lvA) * 0.45;
          if (lvA > 0) spL += amt; else spR += amt;
        }
        // rz: lengan kanan terbuka = +, kiri terbuka = - (konvensi clip sumber)
        friendRig.setArmPose({ rx: rxL, ry: 0, rz: -spL }, { rx: rxR, ry: 0, rz: spR }, armK);
      }

      // hips in deck space (the pigeon group moved by hop/dip; the board is the reference)
      const hipY = HIP_Y + hop - dip - crouch;
      // planted leg: sole stays on the deck under the body (slightly forward when driving)
      legPlant.solve(0.02 + 0.03 * drive - 0, -hipY, 0);
      if (u >= 0) {
        legPush.solve(kTmp[0], kTmp[1] - hipY, kTmp[2] - LEG_Z);
      } else {
        // riding stance: both feet on the deck; tiny knee flex with the head bob
        legPush.solve(0.02, -hipY, 0);
      }
      // torso: lean forward & over the planted foot during the drive, dip a touch on the kick.
      // While carving, the upper body leans a little further INTO the turn than the board (weight over the
      // inside edge) and the hips shift toward it; in the air the shoulders lead the lateral move.
      const carve = p.carve; // + = leaning toward -z (left on screen)
      const shift = p.airShift;
      const bob = grounded ? Math.sin(t * (engine.phase === "menu" ? 7 : 12)) : 1;
      // ---- KEPALA: fokus ke depan, aktif memantau situasi, tapi tetap smooth & santai ----
      const hl = headLook.current;
      // 1) pemindaian santai: dua gelombang lambat (kepala terlihat hidup, bukan robot)
      const scan = Math.sin(t * 0.5) * 0.13 + Math.sin(t * 0.21 + 1.7) * 0.06;
      // 2) aktif melihat situasi: menoleh halus ke arah bahaya terdekat di depan
      let watchYaw = 0;
      let watchW = 0;
      {
        const dd = engine.distance;
        let best = 18;
        let bestLat = 0;
        for (const mv of engine.movers) {
          const rel = mv.s - dd;
          if (rel < -0.5 || rel > best) continue;
          best = rel;
          bestLat = mv.lat;
        }
        for (const ob of engine.obstacles) {
          if (ob.kind === "ramp" || ob.kind === "rail") continue;
          const rel = ob.s - dd;
          if (rel < 1 || rel > best) continue;
          best = rel;
          bestLat = LANE_LAT[ob.lane];
        }
        if (best < 18) {
          watchYaw = clamp(Math.atan2(bestLat - p.lat, Math.max(best, 2.5)), -0.3, 0.3);
          watchW = clamp(1 - best / 18, 0, 1);
        }
      }
      // 3) ikut melihat ke arah jalur tujuan saat menyalip (lebih halus dari sebelumnya)
      const turnLook = clamp(p.latVel * 0.07, -0.24, 0.24);
      const yawTarget = scan * 0.55 + watchYaw * watchW * 0.85 + turnLook;
      const pitchTarget = -0.05 + Math.sin(t * 0.37 + 0.6) * 0.04 + watchW * 0.05 - engine.center.g * 0.1;
      const ease = 1 - Math.exp(-dt * 3.4); // low-pass: gerakan santai, tidak nyentak
      hl.yaw += (yawTarget - hl.yaw) * ease;
      hl.pitch += (pitchTarget - hl.pitch) * ease;

      if (nm) {
        // NEW body language (counter-balance, not glued to the board):
        //  - torso rolls LESS than the board (counter-roll -lean*0.14) so the head stays over the deck
        //  - hips slide toward the inside of the turn (lean * 0.06)
        //  - head counter-rolls (-lean*0.22) to keep the horizon level and looks into the turn (yaw - lean*0.35)
        leanTorso(-0.12 * out - lv * 0.14, -0.2 * drive - 0.04 * out - 0.14 * spr, 0.04 * drive + 0.03 * spr, -0.02 * drive, -0.05 * out + lv * 0.06, 0);
        hd.position.set(0.32 + bob * 0.05 + (grounded ? 0 : 0.06) + 0.04 * drive, 1.04 + Math.abs(bob) * 0.02 + (grounded ? 0 : 0.04), 0);
        hd.rotation.set(hl.pitch - lv * 0.1, hl.yaw, grounded ? -0.06 * drive : -0.12);
      } else {
        // extra torso roll INTO the turn (rotation.x > 0 tips the top toward +z, so it is -carve)
        const torsoCarve = -carve * (airborne ? 0.55 : 0.35);
        const hipShift = Math.sign(p.latVel) * Math.min(1, Math.abs(p.latVel) / 6) * (airborne ? 0.1 : 0.06);
        leanTorso(-0.12 * out + torsoCarve, -0.2 * drive - 0.04 * out - 0.14 * spr + 0.12 * shift, 0.04 * drive + 0.03 * spr, -0.02 * drive - 0.03 * shift, -0.05 * out + hipShift, -p.steer * 0.35);
        // head bob (pigeons!) + look into the turn
        hd.position.set(0.32 + bob * 0.05 + (grounded ? 0 : 0.06) + 0.04 * drive, 1.04 + Math.abs(bob) * 0.02 + (grounded ? 0 : 0.04), 0);
        hd.rotation.set(hl.pitch - carve * 0.18, hl.yaw, grounded ? -0.06 * drive : -0.12);
      }
    } else {
      // ---- ragdoll dummy physics ----
      const body = p.body;
      yg.rotation.y = 0;
      bk.rotation.x = 0;
      bk.position.set(0, 0, 0);
      pg.scale.set(PS, PS, PS);
      if (friendModel.current && friendRig) {
        friendModel.current.position.set(0, 0, 0);
        friendModel.current.rotation.set(0, 0, 0);
        friendModel.current.scale.setScalar(1);
        // lengan lunglai kembali ke bawah saat ragdoll (tanpa snap)
        friendRig.setArmPose(null, null, 1 - Math.exp(-dt * 5));
      }
      if (body) {
        // Pigeon ragdoll: rotate smoothly about center of mass (≈0.50 above feet)
        pg.rotation.set(body.rx, body.ry, body.rz);

        // Continuous smooth position: never jumps or twitches
        tmpV.set(0, -0.50, 0).applyEuler(pg.rotation);
        const comHeight = body.radius / RIG.rootScale;
        pg.position.set(tmpV.x, comHeight + tmpV.y, tmpV.z);

        const limp = Math.min(1, p.limbT * 3.0);
        const vel = Math.hypot(body.vs, body.vh, body.vlat);
        const drag = clamp(vel / 14, 0, 1) * limp;

        // 0. Sekunder: waktu wobble kontinyu + whip impulse setiap pantulan aspal
        const wob = p.limbT;
        if (body.bounces !== fl2.prevBounces) {
          const first = !fl2.seeded;
          fl2.prevBounces = body.bounces;
          if (!first) {
            // tiap benturan: kepala/sayap/ekor "kelebat" — inersia boneka sungguhan
            const kick = clamp(Math.abs(body.vh) * 0.5 + Math.abs(body.wz) * 0.3, 0.35, 2.6);
            fl2.hvx += rand(-1, 1) * kick;
            fl2.hvy += rand(-0.8, 0.8) * kick;
            fl2.hvz += rand(-1.6, 1.6) * kick;
            fl2.wrvx += rand(-2, 0.5) * kick;
            fl2.wrvz += rand(1.1, 2.8) * kick;
            fl2.wlvx += rand(-0.5, 2) * kick;
            fl2.wlvz += rand(-2.8, -1.1) * kick;
            fl2.tvz += rand(-1.4, 1.4) * kick;
            fl2.archv += rand(-0.8, 0.8) * kick * 0.5;
          }
        }

        // 1. Torso: organic spine bending with inertia & air drag, smoothly settling to rest
        const dynRoll = clamp(body.wx * 0.12, -0.25, 0.25);
        const dynArch = -0.32 * drag + Math.sin(wob * 9.7) * 0.06 * drag * (1 - rb);
        const dynYaw = clamp(body.wy * 0.10, -0.20, 0.20);

        const restRoll = 0.14 * p.impactDir;
        const restArch = -0.16;
        const restYaw = 0.08 * p.impactDir;

        const archT = lerp(dynArch, restArch, rb);
        if (!fl2.seeded) fl2.arch = archT;
        [fl2.arch, fl2.archv] = springStep(fl2.arch, fl2.archv, archT, 100, 7.5, sdt);

        leanTorso(
          lerp(dynRoll, restRoll, rb),
          fl2.arch,
          0,
          -0.04 * limp,
          lerp(0, 0.05 * p.impactDir, rb),
          lerp(dynYaw, restYaw, rb)
        );

        // 2. Head & Neck: leher boneka kain — kepala dilempar gaya sentrifugal spin tubuh,
        //    bergoyang dengan inersia (spring), bukan ikut kaku seperti sambungan las
        const dynHeadX = -0.28 * drag + clamp(body.wx * 0.11, -0.42, 0.42) + Math.sin(wob * 12.7) * 0.10 * drag * (1 - rb);
        const dynHeadY = -0.12 * drag + Math.sin(wob * 9.1 + 1.3) * 0.09 * drag * (1 - rb);
        const dynHeadZ = -0.48 * drag + clamp(-body.wz * 0.10, -0.5, 0.5) + Math.sin(wob * 14.3 + 0.6) * 0.08 * drag * (1 - rb);
        const dynHeadPos = [0.30, 0.98 - 0.05 * drag, 0];

        const restHeadX = 0.50 * p.impactDir;
        const restHeadY = -0.20;
        const restHeadZ = -0.62;
        const restHeadPos = [0.28, 0.94, 0.05 * p.impactDir];

        const htx = lerp(dynHeadX, restHeadX, rb);
        const hty = lerp(dynHeadY, restHeadY, rb);
        const htz = lerp(dynHeadZ, restHeadZ, rb);
        if (!fl2.seeded) {
          fl2.hx = htx;
          fl2.hy = hty;
          fl2.hz = htz;
          fl2.arch = archT;
          fl2.justSeeded = true;
        }
        // leher paling kendor: overshoot & geliat halus saat badan berhenti
        [fl2.hx, fl2.hvx] = springStep(fl2.hx, fl2.hvx, htx, 68, 5, sdt);
        [fl2.hy, fl2.hvy] = springStep(fl2.hy, fl2.hvy, hty, 68, 5, sdt);
        [fl2.hz, fl2.hvz] = springStep(fl2.hz, fl2.hvz, htz, 68, 5, sdt);

        hd.position.set(
          lerp(dynHeadPos[0], restHeadPos[0], rb),
          lerp(dynHeadPos[1], restHeadPos[1], rb),
          lerp(dynHeadPos[2], restHeadPos[2], rb)
        );
        hd.rotation.set(fl2.hx, fl2.hy, fl2.hz);
        fl2.seeded = true;

        // 3. Legs: floppy cords trailing in the wind and smoothly resting on the asphalt
        const dynLegPush = [-0.14 - 0.12 * drag, -0.28, 0.06];
        const dynLegPlant = [-0.11 - 0.12 * drag, -0.30, -0.06];

        const restLegPush = [-0.16, -0.20, 0.08];
        const restLegPlant = [-0.13, -0.22, -0.07];

        legPush.solve(
          lerp(dynLegPush[0], restLegPush[0], rb),
          lerp(dynLegPush[1], restLegPush[1], rb),
          lerp(dynLegPush[2], restLegPush[2], rb)
        );
        legPlant.solve(
          lerp(dynLegPlant[0], restLegPlant[0], rb),
          lerp(dynLegPlant[1], restLegPlant[1], rb),
          lerp(dynLegPlant[2], restLegPlant[2], rb)
        );
      } else {
        leanTorso(0, 0, 0, 0, 0);
      }
      // the board flies separately
      const bdr = p.board;
      if (bdr) {
        // convert the board's road-frame position into the pigeon root's local frame
        const ds = bdr.s - (body ? body.s : engine.distance);
        const dl = bdr.lat - (body ? body.lat : p.lat);
        const dh = bdr.h - (body ? body.h - body.radius : p.h);
        const inv = 1 / RIG.rootScale;
        bd.position.set(ds * inv, dh * inv, dl * inv);
        bd.rotation.set(bdr.rx, bdr.ry, bdr.rz);
      }
    }

    // Dizzy cartoon stars circling above the head during crash
    if (dizzyRef.current) {
      if (crashed) {
        dizzyRef.current.visible = true;
        dizzyRef.current.position.set(hd.position.x, hd.position.y + 0.38, hd.position.z);
        dizzyRef.current.rotation.y += dt * 4.2;
      } else {
        dizzyRef.current.visible = false;
      }
    }

    // NOS: tanks visible when the meter is charged, flames while boosting
    const fl = flames.current;
    if (fl) {
      const f = engine.nosFlame;
      fl.visible = f > 0.03;
      const flick = 1 + 0.25 * Math.sin(t * 60) + 0.15 * Math.sin(t * 37 + 1);
      fl.scale.set(f * flick * (1.2 + 0.5 * f), f * (0.8 + 0.3 * flick), f * (0.9 + 0.2 * flick));
      fl.rotation.z = 0.08 * Math.sin(t * 25);
    }
    if (tanks.current) tanks.current.visible = engine.nos > 1 || engine.nosT > 0;

    // tail: swings with the lean, trailing toward the OUTSIDE of the turn (inertia), with a lag and a small flutter
    if (tail.current) {
      if (crashed) {
        const limp = Math.min(1, p.limbT * 3.0);
        const bodyB = p.body;
        // Ekor = bandul kendor: terayun mengikuti spin & skid badan dengan inersia spring
        const sway = bodyB ? clamp(bodyB.wz * 0.055, -0.32, 0.32) + clamp(bodyB.vlat * 0.02, -0.2, 0.2) : 0;
        const tzTgt = -0.30 * limp + sway + Math.sin(p.limbT * 10.2) * 0.07 * limp * (1 - rb);
        if (fl2.justSeeded) fl2.tz = tzTgt;
        [fl2.tz, fl2.tvz] = springStep(fl2.tz, fl2.tvz, tzTgt, 78, 5.5, sdt);
        tail.current.rotation.set(0, 0, fl2.tz);
      } else {
        const lvT = nm ? engine.turn.leanVis : -p.carve * 1.6; // right-positive
        const target = -lvT * 0.35 + Math.sin(t * 9) * 0.02 * Math.abs(lvT);
        tailSway.current += (target - tailSway.current) * (1 - Math.exp(-dt * 9));
        // Reset X and Z to 0 so the tail is strictly upright and NEVER slanted/miring!
        tail.current.rotation.set(0, tailSway.current, 0);
      }
    }

    const wl = wingL.current;
    const wr = wingR.current;
    if (wl && wr && crashed) {
      const limp = Math.min(1, p.limbT * 3.0);
      const body = p.body;
      const vel = body ? Math.hypot(body.vs, body.vh, body.vlat) : 0;
      const drag = clamp(vel / 14, 0, 1) * limp;
      const wob = p.limbT;

      // Gaya sentrifugal spin badan melempar sayap keluar + flutter acak-halus saat tumbling.
      // Sayap kiri/kanan bergerak BEDA fase — organik, tidak cermin kaku seperti animasi satu sisi.
      const flail = body ? clamp((Math.abs(body.wz) + Math.abs(body.wx)) * 0.11, 0, 0.95) * limp : 0;
      const wrFlutter = flail * (0.55 + 0.45 * Math.sin(wob * 11.0)) + Math.sin(wob * 15.7) * 0.05 * drag * (1 - rb);
      const wlFlutter = flail * (0.55 + 0.45 * Math.sin(wob * 13.1 + 2.2)) + Math.sin(wob * 17.3 + 1.1) * 0.05 * drag * (1 - rb);

      // Flight wings: trail backward naturally along body from air resistance
      const dynWr = [-0.85 * drag + Math.sin(wob * 9.4) * 0.09 * drag * (1 - rb), -0.35 * drag, 0.40 * drag + wrFlutter];
      const dynWl = [0.85 * drag + Math.sin(wob * 10.6 + 0.8) * 0.09 * drag * (1 - rb), 0.35 * drag, -0.40 * drag - wlFlutter];

      // Rest wings: drape flat and limp on the road beside the body
      const restWr = [-0.25, -0.15 * p.impactDir, 0.65];
      const restWl = [0.25, 0.15 * p.impactDir, -0.65];

      const wrxT = lerp(dynWr[0], restWr[0], rb);
      const wrzT = lerp(dynWr[2], restWr[2], rb);
      const wlxT = lerp(dynWl[0], restWl[0], rb);
      const wlzT = lerp(dynWl[2], restWl[2], rb);
      if (fl2.justSeeded) {
        fl2.wrx = wrxT;
        fl2.wrz = wrzT;
        fl2.wlx = wlxT;
        fl2.wlz = wlzT;
      }
      // Sendi bahu kendor: sayap berayun & overshoot alami (bukan nempel kaku di tubuh)
      [fl2.wrx, fl2.wrvx] = springStep(fl2.wrx, fl2.wrvx, wrxT, 82, 4.6, sdt);
      [fl2.wrz, fl2.wrvz] = springStep(fl2.wrz, fl2.wrvz, wrzT, 82, 4.6, sdt);
      [fl2.wlx, fl2.wlvx] = springStep(fl2.wlx, fl2.wlvx, wlxT, 82, 4.6, sdt);
      [fl2.wlz, fl2.wlvz] = springStep(fl2.wlz, fl2.wlvz, wlzT, 82, 4.6, sdt);

      wr.rotation.set(fl2.wrx, lerp(dynWr[1], restWr[1], rb), fl2.wrz);
      wl.rotation.set(fl2.wlx, lerp(dynWl[1], restWl[1], rb), fl2.wlz);
    } else if (wl && wr) {
      const tr2 = p.trick;
      const isFlap = tr2 && tr2.kind === "wingflap";
      const grabbing = Math.abs(p.grab) > 0.05;
      const flap = isFlap ? Math.sin(t * 40) * 0.9 : flapping ? Math.sin(t * 26) * 0.35 : 0;
      const base = grabbing ? 0.4 : 1.75;
      // wings swing a little for balance while pushing
      const pushSwing = p.push >= 0 ? 0.35 * (1 + 0.9 * spr) * Math.sin(Math.PI * Math.min(1, p.push)) : 0;
      // carving on the ground: the outside wing opens a bit for balance; in the air both spread and the
      // leading wing reaches toward the new lane
      const a = p.wing * (base + flap) + pushSwing;
      if (nm) {
        // NEW: the OUTER wing (opposite the lean) lifts a little on hard carves: |lean| * 0.5 on the ground, * 0.35 in the air.
        // wr is the +z wing (screen right), wl the -z wing; leaning right (lean > 0) => the left wing is the outer one.
        const lv2 = engine.turn.leanVis;
        const amt = grabbing ? 0 : Math.abs(lv2) * (0.5 + (0.35 - 0.5) * p.airBlend);
        wr.rotation.x = -a - (lv2 < 0 ? amt : 0);
        wl.rotation.x = a + (lv2 > 0 ? amt : 0);
        wr.rotation.z = grabbing ? (p.grab > 0 ? 1.1 : -0.9) : 0;
        wl.rotation.z = 0;
      } else {
        const dir = Math.sign(p.latVel); // + = moving toward +z (screen right)
        const groundCarve = grabbing ? 0 : Math.min(0.8, Math.abs(p.carve) * 1.4);
        const shift = p.airShift;
        // wr is the +z wing (screen right), wl the -z wing
        wr.rotation.x = -a - (dir > 0 ? 0.25 : 0.9) * shift - (dir < 0 ? groundCarve : 0);
        wl.rotation.x = a + (dir < 0 ? 0.25 : 0.9) * shift + (dir > 0 ? groundCarve : 0);
        if (grabbing) {
          wr.rotation.z = p.grab > 0 ? 1.1 : -0.9;
          wl.rotation.z = 0;
        } else {
          // leading wing sweeps forward slightly during the air shift
          wr.rotation.z = dir > 0 ? 0.35 * shift : 0;
          wl.rotation.z = dir < 0 ? -0.35 * shift : 0;
        }
      }
    }
  });

  return (
    <group ref={root}>
      <group ref={yawG}>
        <group scale={RIG.rootScale}>
          <group ref={bank} name="rig-bank">
            <group ref={board} name="rig-board" position={[0, RIG.boardY, 0]}>
              <mesh geometry={geos.deck} material={voxelMaterial} castShadow receiveShadow />
              <mesh ref={tanks} geometry={geos.tanks} material={voxelMaterial} position={[0, -0.16, 0]} visible={false} />
              {/* nitro flames out of the tail: three nested cones pointing backward (-x) */}
              <group ref={flames} position={[-0.85, -0.07, 0]} visible={false}>
                <mesh material={flameMats.outer} position={[-0.7, 0, 0]} rotation-z={Math.PI / 2}>
                  <coneGeometry args={[0.26, 1.6, 8]} />
                </mesh>
                <mesh material={flameMats.mid} position={[-0.5, 0, 0]} rotation-z={Math.PI / 2}>
                  <coneGeometry args={[0.18, 1.2, 8]} />
                </mesh>
                <mesh material={flameMats.core} position={[-0.32, 0, 0]} rotation-z={Math.PI / 2}>
                  <coneGeometry args={[0.1, 0.8, 8]} />
                </mesh>
              </group>
              {/* trucks: hanger + 2 wheels each, pivoting about the kingpin */}
              <group ref={truckFront} name="truck-front" position={[RIG.truckX, RIG.truckY, 0]}>
                <mesh geometry={geos.truck} material={voxelMaterial} castShadow />
                {[RIG.wheelZ, -RIG.wheelZ].map((z, i) => (
                  <mesh
                    key={i}
                    ref={(m) => {
                      wheels.current[i] = m;
                    }}
                    geometry={geos.wheel}
                    material={voxelMaterial}
                    position={[0, RIG.wheelDrop, z]}
                    castShadow
                  />
                ))}
              </group>
              <group ref={truckRear} name="truck-rear" position={[-RIG.truckX, RIG.truckY, 0]}>
                <mesh geometry={geos.truck} material={voxelMaterial} castShadow />
                {[RIG.wheelZ, -RIG.wheelZ].map((z, i) => (
                  <mesh
                    key={i}
                    ref={(m) => {
                      wheels.current[2 + i] = m;
                    }}
                    geometry={geos.wheel}
                    material={voxelMaterial}
                    position={[0, RIG.wheelDrop, z]}
                    castShadow
                  />
                ))}
              </group>
              <mesh ref={tanks} geometry={geos.tanks} material={voxelMaterial} position={[0, -0.16, 0]} visible={false} />
              {/* nitro flames out of the tail: three nested cones pointing backward (-x) */}
              <group ref={flames} position={[-0.85, -0.07, 0]} visible={false}>
                <mesh material={flameMats.outer} position={[-0.7, 0, 0]} rotation-z={Math.PI / 2}>
                  <coneGeometry args={[0.26, 1.6, 8]} />
                </mesh>
                <mesh material={flameMats.mid} position={[-0.5, 0, 0]} rotation-z={Math.PI / 2}>
                  <coneGeometry args={[0.18, 1.2, 8]} />
                </mesh>
                <mesh material={flameMats.core} position={[-0.32, 0, 0]} rotation-z={Math.PI / 2}>
                  <coneGeometry args={[0.1, 0.8, 8]} />
                </mesh>
              </group>
            </group>
            <group ref={pigeon} position={[0, RIG.pigeonY, 0]}>
              {friendRig && (
                <group ref={friendModel}>
                  <primitive object={friendRig.group} />
                </group>
              )}
              {/* Keep the legacy rig mounted (and its refs alive) while hiding it for a full source animal rig. */}
              <group visible={!friendRig}>
                {/* legs hang from the hips; the pushing leg is on the camera side (+z) */}
                <primitive object={legs[0].root} position={[0, HIP_Y, LEG_Z]} />
                <primitive object={legs[1].root} position={[0, HIP_Y, -LEG_Z]} />
              </group>
              <group ref={torso} name="pigeon-torso" visible={!friendRig}>
                <mesh geometry={geos.body} material={voxelMaterial} castShadow receiveShadow />
                <mesh ref={tail} geometry={geos.tail} material={voxelMaterial} position={TAIL_ROOT} castShadow />
                <mesh ref={head} name="pigeon-head" geometry={geos.head} material={voxelMaterial} position={[0.32, 1.04, 0]} rotation={[0, 0, 0]} castShadow />
                <mesh ref={wingR} geometry={geos.wingR} material={voxelMaterial} position={[-0.05, 0.72, 0.3]} castShadow />
                <mesh ref={wingL} geometry={geos.wingL} material={voxelMaterial} position={[-0.05, 0.72, -0.3]} castShadow />
                {/* Cartoon dizzy stars halo when crashed */}
                <group ref={dizzyRef} visible={false}>
                  {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, i) => (
                    <mesh
                      key={i}
                      geometry={starGeo}
                      material={starMat}
                      position={[Math.cos(angle) * 0.28, Math.sin(i * 2.1) * 0.05, Math.sin(angle) * 0.28]}
                      rotation={[0.3, angle, 0.4]}
                    />
                  ))}
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
