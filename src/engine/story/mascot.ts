import { springKick } from "../core/math";
import { motionPhase, sampleTrack, type Key } from "../core/track";
import { depthScale, sx, sy, type View } from "../core/view";
import { drawAstronaut } from "../layers/astronaut";

/** Astronaut pose relative to an anchor body: offsets are in body radii. */
export type Pose = { dx: number; dy: number; rot: number; armL: number; armR: number; wave: number };

export interface Anchor {
  x: number;
  y: number;
  r: number;
}

/**
 * Draws the mascot following a pose track around an anchor in world units.
 * Every pose change stretches the figure while it travels and squashes it on
 * arrival. Portrait framing pulls the figure in towards the anchor.
 */
export function drawMascot(
  ctx: CanvasRenderingContext2D,
  view: View,
  poses: Key<Pose>[],
  anchor: Anchor,
  t: number,
  ambient: number,
  look: { x: number; y: number },
) {
  const pose = sampleTrack(poses, t);
  const { moving, sinceArrival } = motionPhase(poses, t);
  let squash = 1 + 0.1 * Math.sin(Math.PI * moving);
  squash *= 1 - 0.16 * springKick(sinceArrival, 5, 11);

  const dx = view.portrait ? pose.dx * 0.55 : pose.dx;
  const dy = view.portrait ? pose.dy * 1.15 : pose.dy;

  drawAstronaut(
    ctx,
    {
      x: sx(view, anchor.x + dx * anchor.r),
      y: sy(view, anchor.y + dy * anchor.r),
      unit: depthScale(view, 0.4) * (view.portrait ? 0.85 : 1),
      rot: pose.rot,
      armL: pose.armL,
      armR: pose.armR,
      wave: pose.wave,
      sx: 1 / Math.sqrt(squash),
      sy: squash,
      lookX: look.x,
      lookY: look.y,
    },
    ambient,
  );
}
