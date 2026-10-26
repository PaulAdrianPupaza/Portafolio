import { DEG, mat3Apply, mat3Mul, rotX, rotY, rotZ, type Mat3, type Vec3 } from "../../core/math";
import type { LonLat } from "./geoData";

export const TILT = 0.26;

/** Everything needed to draw the globe and things pinned to it, in device pixels. */
export interface Globe {
  x: number;
  y: number;
  r: number;
  /** Sub-viewer point in degrees: the place facing the camera. */
  lon: number;
  lat: number;
  /** Unit vector towards the Sun in view space (x right, y up, z to camera). */
  light: Vec3;
  /** Cloud layer offset in texture units. */
  cloudShift: number;
}

/** Body (lon/lat) space → view space. The axis leans right by TILT. */
export const bodyToView = (g: Globe): Mat3 =>
  mat3Mul(rotZ(-TILT), mat3Mul(rotX(g.lat * DEG), rotY(-g.lon * DEG)));

export function lonLatToBody([lon, lat]: LonLat): Vec3 {
  const la = lat * DEG, lo = lon * DEG;
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
}

export interface Projected {
  x: number;
  y: number;
  /** View-space depth; > 0 faces the camera. */
  z: number;
  /** False when the point is hidden behind the planet. */
  visible: boolean;
}

/** Projects a body-space vector, optionally lifted above the surface. */
export function projectBody(g: Globe, m: Mat3, b: Vec3, lift = 1): Projected {
  const v = mat3Apply(m, b);
  const x = v[0] * lift, y = v[1] * lift, z = v[2] * lift;
  const behind = z < 0 && x * x + y * y < 1;
  return { x: g.x + x * g.r, y: g.y - y * g.r, z: v[2], visible: !behind };
}

export const projectLonLat = (g: Globe, m: Mat3, p: LonLat, lift = 1) => projectBody(g, m, lonLatToBody(p), lift);

/** Spherical interpolation between two unit vectors. */
export function slerp(a: Vec3, b: Vec3, t: number): Vec3 {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const omega = Math.acos(dot);
  if (omega < 1e-5) return a;
  const s = Math.sin(omega);
  const ka = Math.sin((1 - t) * omega) / s;
  const kb = Math.sin(t * omega) / s;
  return [a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb];
}
