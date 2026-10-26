import { roundRectPath } from "../core/text";

export interface AstronautPose {
  /** Screen position of the body centre, device px. */
  x: number;
  y: number;
  /** Device px per design unit; the figure is ~180 units tall. */
  unit: number;
  rot: number;
  /** Arm angles in radians; 0 hangs down, positive swings clockwise on screen. */
  armL: number;
  armR: number;
  /** 0–1 amount of waving on the left arm. */
  wave: number;
  /** Squash and stretch factors. */
  sx: number;
  sy: number;
  /** Screen point the eyes follow. */
  lookX: number;
  lookY: number;
}

const SUIT = "#f3f7fb";
const SUIT_SHADE = "#d5e0ea";
const GLOVE = "#e3ebf3";
const BOOT = "#ff8f4a";
const EYE = "#7ff6ff";

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string | CanvasGradient) {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function arm(ctx: CanvasRenderingContext2D, sx: number, sy: number, angle: number) {
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(angle);
  rr(ctx, -10, -6, 20, 56, 10, SUIT);
  rr(ctx, -10, 26, 20, 8, 4, SUIT_SHADE);
  ctx.beginPath();
  ctx.arc(0, 52, 12, 0, Math.PI * 2);
  ctx.fillStyle = GLOVE;
  ctx.fill();
  ctx.restore();
}

/**
 * Small astronaut mascot built only from rounded rectangles and circles:
 * no outlines. Idle bob, blinking antenna light and eye blinks all come from
 * ambient time, so the figure is deterministic like everything else.
 */
export function drawAstronaut(ctx: CanvasRenderingContext2D, pose: AstronautPose, ambient: number) {
  const bob = Math.sin(ambient * 1.6) * 6;
  const sway = Math.sin(ambient * 1.1) * 0.04;
  const u = pose.unit;

  ctx.save();
  ctx.translate(pose.x, pose.y + bob * u);
  ctx.rotate(pose.rot + sway);
  ctx.scale(u * pose.sx, u * pose.sy);

  // Antenna with a blinking light.
  ctx.strokeStyle = SUIT_SHADE;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(14, -112);
  ctx.lineTo(22, -138);
  ctx.stroke();
  const lit = ambient % 1.3 < 0.65;
  ctx.save();
  if (lit) {
    ctx.shadowColor = "#ffd98a";
    ctx.shadowBlur = 18 * u;
  }
  ctx.beginPath();
  ctx.arc(22, -140, 7, 0, Math.PI * 2);
  ctx.fillStyle = lit ? "#ffd98a" : "#b06a3f";
  ctx.fill();
  ctx.restore();

  rr(ctx, -47, -40, 94, 80, 22, SUIT_SHADE); // backpack

  const wave = Math.sin(ambient * 9) * 0.35 * pose.wave;
  arm(ctx, -34, -14, pose.armL + wave);

  // Legs drift a little, as if floating.
  const kick = Math.sin(ambient * 1.3) * 0.08;
  for (const [hx, dir] of [[-14, 1], [14, -1]] as const) {
    ctx.save();
    ctx.translate(hx, 34);
    ctx.rotate(kick * dir);
    rr(ctx, -10, 0, 20, 40, 10, SUIT);
    rr(ctx, -13, 30, 26, 18, 9, BOOT);
    ctx.restore();
  }

  rr(ctx, -38, -28, 76, 76, 30, SUIT); // body
  rr(ctx, 8, -26, 26, 70, 13, "rgba(213,224,234,0.55)"); // side shade
  rr(ctx, -20, -6, 40, 26, 10, SUIT_SHADE); // chest panel
  rr(ctx, -13, 2, 14, 8, 4, "#8fd8e6");
  ctx.beginPath();
  ctx.arc(10, 6, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = BOOT;
  ctx.fill();

  // Helmet and visor.
  rr(ctx, -48, -116, 96, 92, 42, SUIT);
  const visor = ctx.createLinearGradient(0, -104, 0, -42);
  visor.addColorStop(0, "#1f5a73");
  visor.addColorStop(1, "#0a1c2c");
  rr(ctx, -38, -104, 76, 62, 28, visor);
  ctx.save();
  ctx.translate(-18, -92);
  ctx.rotate(-0.5);
  rr(ctx, -12, -4, 24, 8, 4, "rgba(255,255,255,0.22)");
  ctx.restore();

  // Eyes look at whatever matters right now.
  const m = ctx.getTransform();
  const inv = m.inverse();
  const local = inv.transformPoint(new DOMPoint(pose.lookX, pose.lookY));
  const dx = local.x - 0;
  const dy = local.y + 73;
  const len = Math.hypot(dx, dy) || 1;
  const ex = (dx / len) * 8;
  const ey = (dy / len) * 6;
  const phase = ambient % 3.8;
  const blink = phase < 0.14 ? Math.abs(1 - phase / 0.07) : 1;
  ctx.save();
  ctx.shadowColor = EYE;
  ctx.shadowBlur = 14 * u;
  for (const offset of [-13, 13]) {
    const h = 16 * Math.max(0.12, blink);
    rr(ctx, offset - 4.5 + ex, -73 - h / 2 + ey, 9, h, 4.5, EYE);
  }
  ctx.restore();

  arm(ctx, 34, -14, pose.armR);
  ctx.restore();
}
