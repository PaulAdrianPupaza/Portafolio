// The world is authored in design units: a 1920×1080 frame for landscape and
// a 1000×1500 frame for portrait. A camera picks a centre and zoom in that
// world; the view maps it onto whatever device-pixel canvas we have.

export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

export interface FrameInput {
  /** Narrative time in seconds (driven by scroll on the web, by the frame clock on export). */
  t: number;
  /** Free-running time in seconds for idle motion (equals t on export). */
  ambient: number;
  /** Canvas size in device pixels. */
  W: number;
  H: number;
}

export interface View {
  W: number;
  H: number;
  portrait: boolean;
  /** Device pixels per design unit at zoom 1; use it for UI that ignores the camera. */
  base: number;
  /** Device pixels per design unit at the current zoom. */
  scale: number;
  zoom: number;
  ox: number;
  oy: number;
  camera: Camera;
}

export const DESIGN = {
  landscape: { w: 1920, h: 1080 },
  portrait: { w: 1000, h: 1500 },
} as const;

export const isPortrait = (W: number, H: number) => W / H < 0.9;

export function makeView(W: number, H: number, camera: Camera): View {
  const portrait = isPortrait(W, H);
  const box = portrait ? DESIGN.portrait : DESIGN.landscape;
  const base = Math.min(W / box.w, H / box.h);
  const scale = base * camera.zoom;
  return {
    W,
    H,
    portrait,
    base,
    scale,
    zoom: camera.zoom,
    ox: W / 2 - camera.x * scale,
    oy: H / 2 - camera.y * scale,
    camera,
  };
}

export const sx = (v: View, x: number) => x * v.scale + v.ox;
export const sy = (v: View, y: number) => y * v.scale + v.oy;

/** Size for elements that should only partly follow the camera zoom (depth 0 = fixed, 1 = world). */
export const depthScale = (v: View, depth: number) => v.base * (1 + (v.zoom - 1) * depth);
