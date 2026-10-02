export const RAILWAY = {
  z: -36,
  reserveHalfWidth: 5.5,
  trackHalfWidth: 2.35,
  gateOffset: 4.65,
  vehicleStopOffset: 7.45,
  pedestrianStopOffset: 5.95,
  cycle: 46,
  warningEnd: 3,
  loweringEnd: 5,
  trainStart: 7,
  trainEnd: 26,
  clearanceEnd: 28,
  raisingEnd: 30,
  advanceWarningAt: 42,
  pedestrianCrossingSpeed: 1.45,
  trainLength: 25.45,
  trackLength: 168,
} as const;

export type RailPhase = 'open' | 'warning' | 'lowering' | 'passing' | 'clearing' | 'raising';
export interface RailState {
  phase: RailPhase;
  label: string;
  blocked: boolean;
  angle: number;
  flash: number;
  trainX: number;
  trainVisible: boolean;
  secondsToOpen: number;
}

export const wrap = (value: number, span: number) => ((value % span) + span) % span;
const smooth = (value: number) => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t); };

export function railState(time: number, index = 0, eventStarted?: number): RailState {
  const phase = wrap(eventStarted === undefined ? time + index * 8 : time - eventStarted, RAILWAY.cycle);
  const state: RailPhase = phase >= RAILWAY.advanceWarningAt || phase < RAILWAY.warningEnd ? 'warning' : phase < RAILWAY.loweringEnd ? 'lowering'
    : phase < RAILWAY.trainEnd ? 'passing' : phase < RAILWAY.clearanceEnd ? 'clearing'
      : phase < RAILWAY.raisingEnd ? 'raising' : 'open';
  const angle = state === 'warning' || state === 'open' ? Math.PI / 2
    : state === 'lowering' ? Math.PI / 2 * (1 - smooth((phase - RAILWAY.warningEnd) / 2))
      : state === 'raising' ? Math.PI / 2 * smooth((phase - RAILWAY.clearanceEnd) / 2) : 0;
  const label = { open: 'Perlintasan terbuka', warning: 'Kereta mendekat', lowering: 'Palang menutup',
    passing: 'Kereta melintas', clearing: 'Menunggu rel aman', raising: 'Palang membuka' }[state];
  return {
    phase: state, label, blocked: state !== 'open', angle,
    flash: Math.floor(phase * 2.6) % 2,
    trainX: -67 + 134 * Math.max(0, Math.min(1, (phase - RAILWAY.trainStart) / (RAILWAY.trainEnd - RAILWAY.trainStart))),
    trainVisible: phase >= RAILWAY.trainStart && phase < RAILWAY.trainEnd,
    secondsToOpen: state === 'open' ? 0 : Math.ceil(phase >= RAILWAY.advanceWarningAt
      ? RAILWAY.cycle - phase + RAILWAY.raisingEnd : RAILWAY.raisingEnd - phase),
  };
}

export function stopAdvance(current: number, next: number, direction: number, stopLine: number) {
  return (current - stopLine) * direction <= 0.001 && (next - stopLine) * direction > 0
    ? stopLine : next;
}

export function railwayStop(direction: number, halfLength = 0, pedestrian = false) {
  return RAILWAY.z - direction * ((pedestrian ? RAILWAY.pedestrianStopOffset : RAILWAY.vehicleStopOffset) + halfLength);
}

export function actorPose(time: number, seed: number) {
  return wrap(time + seed * 2.37, 17 + seed % 5) > 13 + seed % 5;
}

export function validateRailSimulation() {
  for (let t = 0; t < RAILWAY.cycle; t += 0.25) {
    const state = railState(t);
    const occupiesRoad = state.trainVisible && Math.abs(state.trainX) < 6 + RAILWAY.trainLength / 2;
    if (occupiesRoad && (!state.blocked || state.angle > 0.001)) throw new Error('Train entered an unprotected crossing.');
    if (state.phase === 'open' && state.angle < 1.5) throw new Error('Crossing opened before its arms were raised.');
  }
  for (const direction of [-1, 1]) {
    const stop = railwayStop(direction, 2.75);
    const current = stop - direction * 0.1;
    const next = stop + direction * 0.6;
    if (stopAdvance(current, next, direction, stop) !== stop) throw new Error('Vehicle failed to stop at the railway.');
    if (stopAdvance(stop + direction * 0.2, next, direction, stop) !== next) throw new Error('Vehicle inside crossing could not clear the track.');
    const pedestrianStop = railwayStop(direction, 0.28, true);
    if (Math.abs(pedestrianStop - RAILWAY.z) <= RAILWAY.gateOffset) throw new Error('Pedestrian waits inside the lowered gate.');
  }
  if (RAILWAY.warningEnd + 4 > RAILWAY.trainStart) throw new Error('Insufficient time to clear the crossing before the train.');
  const pedestrianClearance = 2 * (RAILWAY.pedestrianStopOffset + 0.28) / RAILWAY.pedestrianCrossingSpeed;
  if (pedestrianClearance > RAILWAY.cycle - RAILWAY.advanceWarningAt + RAILWAY.loweringEnd) {
    throw new Error('A pedestrian cannot clear the crossing before the gates finish closing.');
  }
  if (RAILWAY.trackLength / 2 < 67 + RAILWAY.trainLength / 2) throw new Error('Train extends beyond the supported railway.');
  return true;
}

validateRailSimulation();