import type { Vec3 } from "../core/math";
import type { Beat } from "../core/renderer";
import type { FrameInput } from "../core/view";
import type { EarthGL } from "../layers/earth/earthGL";
import type { MoonGL } from "../layers/moon/moonGL";

/** GPU-backed resources shared by every chapter (one WebGL context per planet). */
export interface Assets {
  earth: EarthGL;
  moon: MoonGL;
}

/** One stop of the journey. draw() receives chapter-local time and must be pure. */
export interface Chapter {
  readonly id: string;
  readonly duration: number;
  readonly beats: readonly Beat[];
  draw(ctx: CanvasRenderingContext2D, frame: FrameInput, assets: Assets): void;
}

/** View-space light direction from a body at (x, y) towards a light at (lx, ly), in screen px. */
export function lightFrom(lx: number, ly: number, x: number, y: number, towardsCamera: number): Vec3 {
  const dx = lx - x;
  const dy = ly - y;
  const lz = towardsCamera * (Math.hypot(dx, dy) || 1);
  const n = Math.hypot(dx, dy, lz);
  return [dx / n, -dy / n, lz / n];
}
