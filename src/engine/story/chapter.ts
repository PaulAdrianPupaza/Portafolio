import type { Vec3 } from "../core/math";
import type { Beat } from "../core/renderer";
import type { FrameInput } from "../core/view";
import type { EarthGlobe } from "../layers/earth/earthGL";
import type { PlanetRenderer } from "../layers/sphereGL";

/** Planet renderers shared by every chapter: WebGL when available, 2D otherwise. */
export interface Assets {
  earth: PlanetRenderer<EarthGlobe>;
  moon: PlanetRenderer;
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
