import type { Mat3 } from "../../core/math";
import { easeOutQuint, smoothstep, springKick } from "../../core/math";
import type { LonLat } from "./geoData";
import { lonLatToBody, projectBody, projectLonLat, slerp, type Globe } from "./globe";

/**
 * Pin on the surface. `age` is seconds since it appeared (negative = hidden),
 * `exit` goes 0 → 1 as it leaves. `unit` is device px per design unit.
 */
export function drawPin(
  ctx: CanvasRenderingContext2D,
  globe: Globe,
  m: Mat3,
  place: LonLat,
  age: number,
  exit: number,
  ambient: number,
  unit: number,
  color: string,
) {
  if (age < 0 || exit >= 1) return;
  const p = projectLonLat(globe, m, place);
  if (!p.visible) return;
  const facing = smoothstep(0, 0.2, p.z);
  const pop = easeOutQuint(age / 0.5) * (1 + 0.3 * springKick(age, 5, 12)) * (1 - easeOutQuint(exit));
  if (pop <= 0.01 || facing <= 0) return;
  const s = unit * pop;

  ctx.save();
  ctx.globalAlpha = facing;
  const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 26 * s);
  glow.addColorStop(0, color);
  glow.addColorStop(1, "rgba(255,217,138,0)");
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = facing * 0.45;
  ctx.fillStyle = glow;
  ctx.fillRect(p.x - 26 * s, p.y - 26 * s, 52 * s, 52 * s);
  ctx.globalCompositeOperation = "source-over";

  const phase = (ambient * 0.6) % 1;
  ctx.globalAlpha = facing * (1 - phase) * 0.8;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5 * s;
  ctx.beginPath();
  ctx.arc(p.x, p.y, (8 + 26 * phase) * s, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = facing;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 7 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(p.x, p.y, 3 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Great-circle arc lifted above the surface, drawn up to `progress`. */
export function drawArc(
  ctx: CanvasRenderingContext2D,
  globe: Globe,
  m: Mat3,
  from: LonLat,
  to: LonLat,
  progress: number,
  fade: number,
  unit: number,
  color: string,
) {
  if (progress <= 0 || fade >= 1) return;
  const a = lonLatToBody(from);
  const b = lonLatToBody(to);
  const steps = 48;
  const end = Math.min(1, progress);

  ctx.save();
  ctx.globalAlpha = 1 - fade;
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const [width, alpha] of [[11, 0.18], [4, 1]] as const) {
    ctx.lineWidth = width * unit;
    ctx.globalAlpha = (1 - fade) * alpha;
    ctx.beginPath();
    let drawing = false;
    for (let i = 0; i <= steps; i++) {
      const s = Math.min(end, i / steps);
      const p = projectBody(globe, m, slerp(a, b, s), 1 + 0.14 * Math.sin(Math.PI * s));
      if (!p.visible) {
        drawing = false;
        continue;
      }
      if (drawing) ctx.lineTo(p.x, p.y);
      else ctx.moveTo(p.x, p.y);
      drawing = true;
      if (s >= end) break;
    }
    ctx.stroke();
  }

  const head = projectBody(globe, m, slerp(a, b, end), 1 + 0.14 * Math.sin(Math.PI * end));
  if (head.visible) {
    ctx.globalAlpha = 1 - fade;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(head.x, head.y, 4.5 * unit, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
