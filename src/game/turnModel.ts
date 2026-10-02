import { clamp } from "./voxel";

/**
 * "NEW" turning model: lane changes come out of wheel steering, not from sliding sideways.
 *
 *   lane target -> smooth reference -> desired heading -> required yaw-rate
 *     -> inverse bicycle model -> lean request (rate limited) -> truck angles (damped)
 *     -> yaw-rate from the trucks -> heading -> lateral velocity = sin(heading) * forward speed -> lat
 *
 * Everything here is in the ROAD FRAME with RIGHT = POSITIVE:
 *   heading > 0  nose points to the right (+z in the game)
 *   lean    > 0  leaning right (into a right turn)
 *   sF      > 0  front truck steers right (rear truck is -REAR_RATIO * sF, i.e. counter-steers)
 * The renderer converts to three.js signs (yaw = -heading, front truck yaw = -sF, roll = +lean * ROLL).
 */
export const TURN = {
  /** distance between the trucks (board units) and the "effective" factor: tuned for smooth, natural carving */
  WHEELBASE: 0.5,
  EFFECTIVE: 3.5,
  REAR_RATIO: 0.85,
  STEER_MAX_GROUND: 0.42, // rad (~24° natural carve)
  STEER_MAX_AIR: 0.28,
  GRIP_GROUND: 1,
  GRIP_AIR: 0.55, // roda tidak mencengkeram kaku di udara
  HEADING_MAX: 0.80,
  DESIRED_MAX: 0.75,
  REF_OMEGA: 11.0, // pegas critically-damped halus menuju pusat jalur (tanpa snap)
  POS_GAIN: 5.0, // tarikan halus ke referensi
  HEADING_GAIN: 18, // 1/s: respons heading yang wajar dan mulus
  LEAN_RATE_GROUND: 14, // lean units / s: badan condong alami, tidak menghentak
  LEAN_RATE_AIR: 17,
  TRUCK_DAMP_GROUND: 18, // 1/s: trucks berputar selaras dengan badan merpati
  TRUCK_DAMP_AIR: 10,
  YAW_DAMP: 18,
  LEAN_VIS_DAMP: 18,
  ROLL_GROUND: 0.5, // rad of bank at lean = 1
  ROLL_AIR: 0.62,
  MIN_FWD: 4.5,
  SUBSTEP: 1 / 120,
  /** how much of the truck/lean lag we compensate when planning the stop (s); trucks hang looser in the air */
  LAG: 0.09,
  LAG_AIR: 0.20,
  /** 0..1: critically damped stopping capability prevents overshoot ("PAS" tepat di tengah jalur) */
  BRAKE_MARGIN: 1.0,
  BRAKE_MARGIN_AIR: 0.40,
  /** the trucks lag the lean command, so we compare the desired heading with where the heading WILL be (s) */
  PREDICT: 0.04,
  PREDICT_AIR: 0.12,
  /** "arrived at the lane" thresholds: smooth lock-on without dragging or creeping */
  ARRIVE_POS: 0.04,
  ARRIVE_HEADING: 0.04,
  ARRIVE_LEAN: 0.06,
};
const effWb = () => TURN.WHEELBASE * TURN.EFFECTIVE;

export interface TurnState {
  lat: number;
  latVel: number;
  refX: number;
  refV: number;
  heading: number; // physical heading of the board
  lean: number; // -1..1, rate limited
  sF: number; // physical front-truck steer angle (damped)
  headingVis: number; // damped copy for the renderer
  leanVis: number;
  airBlend: number; // 0 ground .. 1 air (damped), blends roll/grip-dependent visuals
}

export interface TurnInput {
  target: number;
  fwd: number;
  air: boolean;
  grind: boolean;
  minLat: number;
  maxLat: number;
  dt: number;
}

export function makeTurnState(lat = 0): TurnState {
  return { lat, latVel: 0, refX: lat, refV: 0, heading: 0, lean: 0, sF: 0, headingVis: 0, leanVis: 0, airBlend: 0 };
}

export function resetTurnState(s: TurnState, lat = 0) {
  Object.assign(s, makeTurnState(lat));
}

/** Physical rear truck angle for a given front angle. */
export const rearOf = (sF: number) => -TURN.REAR_RATIO * sF;

/** Yaw-rate produced by the trucks: fwd * tan(front - rear) * grip / (wheelbase * 3.5). */
export function yawRate(sF: number, fwd: number, grip: number) {
  return (fwd * Math.tan(sF - rearOf(sF)) * grip) / effWb();
}

function stepOnce(s: TurnState, i: TurnInput, dt: number) {
  const T = TURN;
  const fwd = Math.max(i.fwd, T.MIN_FWD);
  const grip = i.air ? T.GRIP_AIR : T.GRIP_GROUND;
  const steerMax = i.air ? T.STEER_MAX_AIR : T.STEER_MAX_GROUND;
  const prevLat = s.lat;
  s.airBlend += ((i.air ? 1 : 0) - s.airBlend) * (1 - Math.exp(-dt * 10));

  if (i.grind) {
    // rails: lock to the rail lane, straighten everything, never go diagonal on the rail
    const k = 1 - Math.exp(-dt * 22);
    s.lat += (i.target - s.lat) * k;
    s.refX = s.lat;
    s.refV = 0;
    s.heading *= Math.exp(-dt * 16);
    s.lean *= Math.exp(-dt * 16);
    s.sF *= Math.exp(-dt * 20);
    s.latVel = (s.lat - prevLat) / dt;
  } else {
    // 1) smooth reference to the lane centre: critically damped spring, exact integration
    {
      const x0 = s.refX - i.target;
      const e = Math.exp(-T.REF_OMEGA * dt);
      const c2 = s.refV + T.REF_OMEGA * x0;
      s.refX = i.target + (x0 + c2 * dt) * e;
      s.refV = (s.refV - T.REF_OMEGA * c2 * dt) * e;
    }
    const err = i.target - s.lat;
    const arrived = Math.abs(err) < T.ARRIVE_POS && Math.abs(s.heading) < T.ARRIVE_HEADING && Math.abs(s.lean) < T.ARRIVE_LEAN && Math.abs(s.refV) < 0.12;
    if (arrived) {
      // settle: straighten heading and lean slowly, no micro wobble
      s.heading *= Math.exp(-dt * 10);
      s.lean *= Math.exp(-dt * 12);
      s.sF *= Math.exp(-dt * 18);
      s.lat += err * (1 - Math.exp(-dt * 14));
      if (Math.abs(s.heading) < 0.002 && Math.abs(s.lean) < 0.004 && Math.abs(err) < 0.002) {
        s.heading = 0;
        s.lean = 0;
        s.sF = 0;
        s.lat = i.target;
      }
      s.latVel = (s.lat - prevLat) / dt;
    } else {
      // 2) desired lateral speed = reference speed + position correction (spec: refV + (refX - px) * 5)
      // The reference is a *guide*: while the board is behind it we chase it (spec formula). If the board gets
      // ahead of it we must not be pulled back (that would reverse the sideways motion); it just heads for the lane.
      const dirT = Math.sign(i.target - s.lat);
      const past = dirT !== 0 && dirT * (s.lat - s.refX) > 0;
      let vDes = past ? (i.target - s.lat) * T.POS_GAIN * 1.5 : s.refV + (s.refX - s.lat) * T.POS_GAIN;
      const refAcc = -T.REF_OMEGA * T.REF_OMEGA * (s.refX - i.target) - 2 * T.REF_OMEGA * s.refV;
      let limited = past;
      // 2b) braking law: a board can only stop its sideways drift by turning back to straight, and that takes
      //     (1 - cos(heading)) / c of lateral distance (c = yaw authority / forward speed). Never ask for more
      //     lateral speed than we can still cancel before the lane centre => no overshoot, also in the air.
      {
        const c = (Math.tan((1 + T.REAR_RATIO) * steerMax) * grip) / effWb();
        const toGo = i.target - s.lat;
        const dir = Math.sign(toGo);
        const eff = Math.max(0, Math.abs(toGo) - (i.air ? T.LAG_AIR : T.LAG) * Math.max(0, s.latVel * dir));
        const thBrake = Math.acos(clamp(1 - c * (i.air ? T.BRAKE_MARGIN_AIR : T.BRAKE_MARGIN) * eff, -1, 1));
        const vBrake = fwd * Math.sin(Math.min(thBrake, T.DESIRED_MAX));
        if (dir > 0 && vDes > vBrake) {
          vDes = vBrake;
          limited = true;
        } else if (dir < 0 && vDes < -vBrake) {
          vDes = -vBrake;
          limited = true;
        }
      }
      // 3) desired heading from lateral speed, limited
      const sinMax = Math.sin(T.DESIRED_MAX);
      if (Math.abs(vDes / fwd) >= sinMax) limited = true;
      const desired = Math.asin(clamp(vDes / fwd, -sinMax, sinMax));
      // 4) yaw-rate we need (P on heading + feed-forward of how fast the desired heading itself is changing),
      //    then invert the bicycle model to get the truck angle difference
      const rateFF = limited ? 0 : (refAcc + T.POS_GAIN * (s.refV - s.latVel)) / (fwd * Math.max(0.3, Math.cos(desired)));
      const headingNow = yawRate(s.sF, fwd, grip);
      const headingPred = s.heading + headingNow * (i.air ? T.PREDICT_AIR : T.PREDICT);
      const wantRate = (desired - headingPred) * T.HEADING_GAIN + rateFF;
      const steerDiff = Math.atan((wantRate * effWb()) / (fwd * grip));
      // 5) lean request (front - rear = (1 + ratio) * front), rate limited so the body cannot snap
      const leanReq = clamp(steerDiff / (1 + T.REAR_RATIO) / steerMax, -1, 1);
      const maxStep = (i.air ? T.LEAN_RATE_AIR : T.LEAN_RATE_GROUND) * dt;
      s.lean += clamp(leanReq - s.lean, -maxStep, maxStep);
      // 6) the lean moves the trucks (damped, hangs looser in the air)
      s.sF += (s.lean * steerMax - s.sF) * (1 - Math.exp(-dt * (i.air ? T.TRUCK_DAMP_AIR : T.TRUCK_DAMP_GROUND)));
      // 7) yaw comes out of the trucks
      s.heading = clamp(s.heading + yawRate(s.sF, fwd, grip) * dt, -T.HEADING_MAX, T.HEADING_MAX);
      // 8) lateral motion is ONLY the consequence of the heading
      s.lat += Math.sin(s.heading) * fwd * dt;
      s.latVel = (s.lat - prevLat) / dt;
    }
  }
  // stay inside the road: pushing against the edge kills the heading that points outward
  if (s.lat < i.minLat) {
    s.lat = i.minLat;
    if (s.heading < 0) s.heading *= 0.5;
  } else if (s.lat > i.maxLat) {
    s.lat = i.maxLat;
    if (s.heading > 0) s.heading *= 0.5;
  }
  s.headingVis += (s.heading - s.headingVis) * (1 - Math.exp(-dt * T.YAW_DAMP));
  s.leanVis += (s.lean - s.leanVis) * (1 - Math.exp(-dt * T.LEAN_VIS_DAMP));
}

/** Advance the model by dt (sub-stepped at 120 Hz so it stays stable on slow frames). */
export function stepTurn(s: TurnState, i: TurnInput) {
  const n = Math.max(1, Math.ceil(i.dt / TURN.SUBSTEP));
  const h = i.dt / n;
  for (let k = 0; k < n; k++) stepOnce(s, i, h);
}
