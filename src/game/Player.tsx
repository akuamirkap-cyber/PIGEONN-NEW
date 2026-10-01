import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { buildVoxelGeometry, clamp, voxelMaterial } from "./voxel";
import { engine, LANE_LAT } from "./engine";
import { useUI } from "./store";
import { charBodyParts, charHeadParts, charTailParts, charWingParts, deckParts, getSkin, truckParts, wheelParts, HIP_Y, LEG_Z, TAIL_ROOT } from "./skins";
import { RIG, LegRig } from "./pigeonRig";
import { nosTankParts } from "./models";

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
  const torso = useRef<THREE.Group>(null); // body+head+wings; leans about the hips while the legs stay planted
  const head = useRef<THREE.Mesh>(null);
  const wingL = useRef<THREE.Mesh>(null);
  const wingR = useRef<THREE.Mesh>(null);
  const wheels = useRef<(THREE.Mesh | null)[]>([]);
  const tail = useRef<THREE.Mesh>(null);
  const tailSway = useRef(0);
  const restBlend = useRef(0);
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
    const [legPush, legPlant] = legs;

    const crashed = engine.phase === "crashed" || engine.phase === "gameover";
    const flapping = p.wing > 0.05;

    // follow the track frame
    r.position.set(p.wx, p.wy, p.wz);
    r.quaternion.copy(p.quat);

    const nm = engine.newTurn; // physics turning mode
    const spr = engine.sprint; // 0..1 SHIFT sprint intensity (fast kicks, forward lean)
    if (nm) {
      // wheel radius ~0.065: spin = speed / r; 0.3x while grinding (wheels barely turn), 0.6x airborne (freewheel).
      // The per-frame step is capped so a fast board does not alias into a flickering wheel.
      const mult = p.grinding ? 0.3 : p.grounded ? 1 : 0.6;
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
      if (tr && (tr.kind === "kickflip" || tr.kind === "heelflip" || tr.kind === "shuvit" || tr.kind === "impossible")) hop = Math.sin(Math.PI * Math.min(1, tr.t / tr.dur)) * 0.28;
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

        // 1. Torso: organic spine bending with inertia & air drag, smoothly settling to rest
        const dynRoll = clamp(body.wx * 0.12, -0.25, 0.25);
        const dynArch = -0.32 * drag;
        const dynYaw = clamp(body.wy * 0.10, -0.20, 0.20);

        const restRoll = 0.14 * p.impactDir;
        const restArch = -0.16;
        const restYaw = 0.08 * p.impactDir;

        leanTorso(
          lerp(dynRoll, restRoll, rb),
          lerp(dynArch, restArch, rb),
          0,
          -0.04 * limp,
          lerp(0, 0.05 * p.impactDir, rb),
          lerp(dynYaw, restYaw, rb)
        );

        // 2. Head & Neck: loose floppy dummy neck with smooth inertia (no buzzing/seizure)
        const dynHeadX = -0.28 * drag;
        const dynHeadY = -0.12 * drag;
        const dynHeadZ = -0.48 * drag;
        const dynHeadPos = [0.30, 0.98 - 0.05 * drag, 0];

        const restHeadX = 0.50 * p.impactDir;
        const restHeadY = -0.20;
        const restHeadZ = -0.62;
        const restHeadPos = [0.28, 0.94, 0.05 * p.impactDir];

        hd.position.set(
          lerp(dynHeadPos[0], restHeadPos[0], rb),
          lerp(dynHeadPos[1], restHeadPos[1], rb),
          lerp(dynHeadPos[2], restHeadPos[2], rb)
        );
        hd.rotation.set(
          lerp(dynHeadX, restHeadX, rb),
          lerp(dynHeadY, restHeadY, rb),
          lerp(dynHeadZ, restHeadZ, rb)
        );

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
        // Clean smooth droop down along pitch axis (Z) without jitter
        tail.current.rotation.set(0, 0, -0.30 * limp);
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

      // Flight wings: trail backward naturally along body from air resistance
      const dynWr = [-0.85 * drag, -0.35 * drag, 0.40 * drag];
      const dynWl = [0.85 * drag, 0.35 * drag, -0.40 * drag];

      // Rest wings: drape flat and limp on the road beside the body
      const restWr = [-0.25, -0.15 * p.impactDir, 0.65];
      const restWl = [0.25, 0.15 * p.impactDir, -0.65];

      // Smooth interpolation using restBlend (rb) - zero popping or abrupt snaps
      wr.rotation.set(
        lerp(dynWr[0], restWr[0], rb),
        lerp(dynWr[1], restWr[1], rb),
        lerp(dynWr[2], restWr[2], rb)
      );
      wl.rotation.set(
        lerp(dynWl[0], restWl[0], rb),
        lerp(dynWl[1], restWl[1], rb),
        lerp(dynWl[2], restWl[2], rb)
      );
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
              {/* legs hang from the hips; the pushing leg is on the camera side (+z) */}
              <primitive object={legs[0].root} position={[0, HIP_Y, LEG_Z]} />
              <primitive object={legs[1].root} position={[0, HIP_Y, -LEG_Z]} />
              <group ref={torso} name="pigeon-torso">
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
