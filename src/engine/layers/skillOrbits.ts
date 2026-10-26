import { easeOutQuint } from "../core/math";
import { mulberry32, range } from "../core/random";
import type { SunPlacement } from "./sun";

interface Ring {
  radius: number;
  incline: number;
  roll: number;
  orbs: number;
  color: string;
  speed: number;
  dust: { phase: number; offset: number; size: number }[];
}

const SPECS = [
  { radius: 1.45, incline: 0.36, roll: -0.18, orbs: 7, color: "#8fd8e6", speed: 0.35 },
  { radius: 1.78, incline: 0.42, roll: 0.14, orbs: 7, color: "#ffd98a", speed: 0.27 },
  { radius: 2.1, incline: 0.33, roll: -0.32, orbs: 5, color: "#ff8f4a", speed: 0.21 },
  { radius: 2.42, incline: 0.45, roll: 0.26, orbs: 4, color: "#f3f7fb", speed: 0.17 },
];

const PATH_STEPS = 120;

/**
 * Four tilted orbits around the Sun, one per skill group. Each orb is one
 * skill. An orbit is traced in when its group is introduced and keeps
 * circling afterwards, so the finale shows the whole system.
 */
export class SkillOrbits {
  private rings: Ring[];

  constructor(seed = 0x5c1) {
    const rng = mulberry32(seed);
    this.rings = SPECS.map((spec) => ({
      ...spec,
      dust: Array.from({ length: 46 }, () => ({
        phase: rng() * Math.PI * 2,
        offset: range(rng, -0.05, 0.05),
        size: range(rng, 1, 2.4),
      })),
    }));
  }

  /**
   * `ignite[i]` (0–1) traces ring i in; `focus[i]` (0–1) highlights it.
   * Draw the "back" pass before the Sun and the "front" pass after it.
   */
  draw(
    ctx: CanvasRenderingContext2D,
    sun: SunPlacement,
    clock: number,
    ignite: number[],
    focus: number[],
    unit: number,
    pass: "back" | "front",
  ) {
    ctx.save();
    this.rings.forEach((ring, i) => {
      const lit = ignite[i] ?? 0;
      if (lit <= 0) return;
      const hi = focus[i] ?? 0;
      const ci = Math.cos(ring.incline), si = Math.sin(ring.incline);
      const cr = Math.cos(ring.roll), srl = Math.sin(ring.roll);
      const project = (a: number, rho: number) => {
        const px = Math.cos(a) * rho;
        const pz0 = Math.sin(a) * rho;
        const py = -pz0 * si;
        const pz = pz0 * ci;
        return {
          x: sun.x + (px * cr - py * srl) * sun.r,
          y: sun.y - (px * srl + py * cr) * sun.r,
          front: pz >= 0,
        };
      };
      const wanted = pass === "front";

      // Orbit path, traced from angle 0 up to the ignite progress.
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = ring.color;
      ctx.lineWidth = (1.5 + hi * 1.5) * unit;
      ctx.globalAlpha = 0.16 + hi * 0.3;
      ctx.lineCap = "round";
      ctx.beginPath();
      let pen = false;
      const end = Math.floor(PATH_STEPS * easeOutQuint(lit));
      for (let s = 0; s <= end; s++) {
        const p = project((s / PATH_STEPS) * Math.PI * 2 + Math.PI / 2, ring.radius);
        if (p.front !== wanted) {
          pen = false;
          continue;
        }
        if (pen) ctx.lineTo(p.x, p.y);
        else ctx.moveTo(p.x, p.y);
        pen = true;
      }
      ctx.stroke();

      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = ring.color;
      for (const d of ring.dust) {
        const p = project(d.phase + clock * ring.speed * 0.6, ring.radius + d.offset);
        if (p.front !== wanted) continue;
        ctx.globalAlpha = 0.35 * lit;
        ctx.beginPath();
        ctx.arc(p.x, p.y, d.size * unit, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let k = 0; k < ring.orbs; k++) {
        const appear = easeOutQuint((lit * ring.orbs - k) / 1.2);
        if (appear <= 0) continue;
        const p = project(clock * ring.speed + (k / ring.orbs) * Math.PI * 2, ring.radius);
        if (p.front !== wanted) continue;
        const r = (8 + hi * 4) * unit * appear;
        ctx.globalAlpha = 0.22 + hi * 0.15;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();
  }
}
