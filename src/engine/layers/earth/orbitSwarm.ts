import { easeOutQuint } from "../../core/math";
import { gauss, mulberry32, range } from "../../core/random";
import type { Globe } from "./globe";

interface Dot {
  angle: number;
  speed: number;
  radius: number;
  height: number;
  size: number;
  color: string;
}

const COUNT = 400;
const INCLINE = 0.42;
const ROLL = -0.35;

/**
 * A ring of 400 tiny satellites, one per reviewed submission, orbiting the
 * planet. Drawn in two passes so dots behind the Earth are hidden by it.
 */
export class OrbitSwarm {
  private dots: Dot[];

  constructor(seed = 400) {
    const rng = mulberry32(seed);
    this.dots = Array.from({ length: COUNT }, () => ({
      angle: rng() * Math.PI * 2,
      speed: range(rng, 0.18, 0.32),
      radius: 1.34 + gauss(rng) * 0.05,
      height: gauss(rng) * 0.035,
      size: range(rng, 2.2, 3.8),
      color: rng() < 0.7 ? "#8fd8e6" : "#ffd98a",
    }));
  }

  /** `count` in [0, 1] reveals dots in order; `exit` in [0, 1] shrinks them away. */
  draw(
    ctx: CanvasRenderingContext2D,
    globe: Globe,
    clock: number,
    count: number,
    exit: number,
    unit: number,
    pass: "back" | "front",
  ) {
    if (count <= 0 || exit >= 1) return;
    const revealed = count * COUNT;
    const ci = Math.cos(INCLINE), si = Math.sin(INCLINE);
    const cr = Math.cos(ROLL), sr = Math.sin(ROLL);
    const leave = 1 - easeOutQuint(exit);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    this.dots.forEach((dot, i) => {
      if (i >= revealed) return;
      const a = dot.angle + clock * dot.speed;
      const px = Math.cos(a) * dot.radius;
      const pz0 = Math.sin(a) * dot.radius;
      const py = dot.height * ci - pz0 * si;
      const pz = dot.height * si + pz0 * ci;
      if ((pass === "back") !== pz < 0) return;
      const x = px * cr - py * sr;
      const y = px * sr + py * cr;
      const pop = easeOutQuint((revealed - i) / 8) * leave;
      const r = dot.size * unit * pop * (0.85 + 0.3 * (pz / dot.radius + 1) / 2);
      const X = globe.x + x * globe.r;
      const Y = globe.y - y * globe.r;
      ctx.fillStyle = dot.color;
      ctx.globalAlpha = 0.18;
      ctx.beginPath();
      ctx.arc(X, Y, r * 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      ctx.arc(X, Y, r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }
}
