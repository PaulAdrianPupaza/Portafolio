import { clamp, easeOutQuint, smoothstep, springKick, type Mat3 } from "../../core/math";
import { roundRectPath } from "../../core/text";
import type { LonLat } from "../earth/geoData";
import { projectLonLat, type Globe } from "../earth/globe";

export type BeaconIcon = "chat" | "terminal" | "blocks";

export interface BeaconState {
  /** Seconds since the beacon switched on (negative = not yet). */
  age: number;
  /** 0 → 1 as the beacon switches off again. */
  exit: number;
  /** Once visited, a small dot stays on the surface. */
  visited: boolean;
}

const DARK = "#0a1c2c";
const PILL = "rgba(6,20,40,0.62)";

function fillRR(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string) {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawIcon(ctx: CanvasRenderingContext2D, icon: BeaconIcon, accent: string, ambient: number) {
  if (icon === "chat") {
    fillRR(ctx, -21, -17, 42, 29, 11, accent);
    ctx.beginPath();
    ctx.moveTo(-12, 9);
    ctx.lineTo(-17, 20);
    ctx.lineTo(-2, 10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = DARK;
    [-9, 0, 9].forEach((x, i) => {
      ctx.beginPath();
      ctx.arc(x, -3 - Math.max(0, Math.sin(ambient * 6 - i * 0.9)) * 3, 3.2, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (icon === "terminal") {
    fillRR(ctx, -23, -18, 46, 36, 9, DARK);
    fillRR(ctx, -23, -18, 46, 9, 4.5, accent);
    for (const dir of [1, -1]) {
      ctx.save();
      ctx.translate(-10, 5);
      ctx.rotate(dir * 0.7);
      fillRR(ctx, -1, -2.2, 12, 4.4, 2.2, accent);
      ctx.restore();
    }
    if (ambient % 1 < 0.6) fillRR(ctx, 3, 9, 13, 4.4, 2.2, accent);
  } else {
    fillRR(ctx, -19, 1, 17, 17, 4, accent);
    fillRR(ctx, 2, 1, 17, 17, 4, "#ffe9b8");
    fillRR(ctx, -8.5, -18, 17, 17, 4, accent);
  }
}

/**
 * A project site on the Moon. When switched on, a beam of light rises from
 * the surface to a badge holding the project's icon. Returns the badge centre
 * (for the mascot's eyes), or null when hidden.
 */
export function drawBeacon(
  ctx: CanvasRenderingContext2D,
  globe: Globe,
  m: Mat3,
  site: LonLat,
  icon: BeaconIcon,
  accent: string,
  state: BeaconState,
  ambient: number,
  unit: number,
) {
  const p = projectLonLat(globe, m, site);
  if (!p.visible) return null;
  const facing = smoothstep(0, 0.2, p.z);
  if (facing <= 0) return null;

  ctx.save();
  ctx.globalAlpha = facing;

  if (state.visited || state.age >= 0) {
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5 * unit, 0, Math.PI * 2);
    ctx.fill();
  }

  const on = state.age >= 0 ? easeOutQuint(state.age / 0.6) * (1 - easeOutQuint(state.exit)) : 0;
  if (on <= 0.01) {
    ctx.restore();
    return null;
  }

  const lift = 165 * unit * on;
  const bx = p.x;
  const by = p.y - lift;

  ctx.globalCompositeOperation = "lighter";
  const beam = ctx.createLinearGradient(0, p.y, 0, by);
  beam.addColorStop(0, accent);
  beam.addColorStop(1, "rgba(255,255,255,0)");
  ctx.globalAlpha = facing * 0.5;
  ctx.fillStyle = beam;
  const bw = 12 * unit;
  ctx.fillRect(bx - bw / 2, by, bw, lift);

  const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 34 * unit);
  glow.addColorStop(0, accent);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalAlpha = facing * 0.55 * on;
  ctx.fillStyle = glow;
  ctx.fillRect(p.x - 34 * unit, p.y - 34 * unit, 68 * unit, 68 * unit);

  const ring = (ambient * 0.7) % 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = facing * (1 - ring) * 0.7 * on;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.5 * unit;
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, (10 + 30 * ring) * unit, (4 + 12 * ring) * unit, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Badge with squash and stretch as it pops up.
  const kick = springKick(state.age - 0.25, 5, 12);
  const s = unit * clamp(on) * (1 + 0.18 * kick);
  ctx.globalAlpha = facing;
  ctx.translate(bx, by - 40 * unit * on);
  ctx.scale(s * (1 - 0.08 * kick), s * (1 + 0.08 * kick));
  fillRR(ctx, -38, -38, 76, 76, 26, PILL);
  drawIcon(ctx, icon, accent, ambient);
  ctx.restore();

  return { x: bx, y: by - 40 * unit * on };
}
