import { easeInOutCubic } from "./math";

export type Numeric = Record<string, number>;
export type Key<T extends Numeric> = [time: number, value: T];

/**
 * Samples a keyframe track at time t. Keys must be sorted by time; the value
 * holds before the first key and after the last. Consecutive keys with equal
 * values act as holds.
 */
export function sampleTrack<T extends Numeric>(keys: Key<T>[], t: number, ease = easeInOutCubic): T {
  if (t <= keys[0][0]) return keys[0][1];
  const last = keys[keys.length - 1];
  if (t >= last[0]) return last[1];
  let i = 0;
  while (t > keys[i + 1][0]) i++;
  const [t0, a] = keys[i];
  const [t1, b] = keys[i + 1];
  const k = ease((t - t0) / (t1 - t0));
  const out = {} as Numeric;
  for (const name in a) out[name] = a[name] + (b[name] - a[name]) * k;
  return out as T;
}

/**
 * Describes where t sits relative to the moving segments of a track: progress
 * through the current move (0 when holding) and time since the last move ended.
 * Used to drive squash and stretch on every pose change.
 */
export function motionPhase<T extends Numeric>(keys: Key<T>[], t: number) {
  let sinceArrival = Infinity;
  let moving = 0;
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, a] = keys[i];
    const [t1, b] = keys[i + 1];
    const changes = Object.keys(a).some((k) => a[k] !== b[k]);
    if (!changes) continue;
    if (t >= t0 && t < t1) moving = (t - t0) / (t1 - t0);
    if (t >= t1) sinceArrival = t - t1;
  }
  return { moving, sinceArrival };
}
