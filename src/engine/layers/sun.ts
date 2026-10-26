import { mulberry32, range } from "../core/random";

export interface SunPlacement {
  /** Centre and radius in device pixels. */
  x: number;
  y: number;
  r: number;
}

interface Granule {
  angle: number;
  dist: number;
  size: number;
  drift: number;
  phase: number;
}

const HALO_RINGS = [1.23, 1.48, 1.76, 2.1];
const RAY_COUNT = 18;

/**
 * Flat, glowing Sun: gradient body with an offset highlight, additive halo
 * rings, faint rotating ray wedges and drifting granules. Nothing breaks the
 * edge of the disc (no flares or loops).
 */
export class SunLayer {
  private granules: Granule[];

  constructor(seed = 11) {
    const rng = mulberry32(seed);
    this.granules = Array.from({ length: 28 }, () => ({
      angle: rng() * Math.PI * 2,
      dist: Math.sqrt(rng()) * 0.82,
      size: range(rng, 0.035, 0.085),
      drift: range(rng, -0.05, 0.05),
      phase: rng() * Math.PI * 2,
    }));
  }

  draw(ctx: CanvasRenderingContext2D, sun: SunPlacement, ambient: number) {
    const { x, y, r } = sun;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    // Rays: long, faint wedges turning slowly behind the halo.
    const spin = ambient * 0.02;
    for (let i = 0; i < RAY_COUNT; i++) {
      const a = spin + (i / RAY_COUNT) * Math.PI * 2;
      const w = 0.035 + 0.02 * Math.sin(i * 2.7);
      const len = r * (3.4 + 0.6 * Math.sin(i * 1.3 + ambient * 0.15));
      const g = ctx.createRadialGradient(x, y, r, x, y, len);
      g.addColorStop(0, "rgba(255,200,120,0.06)");
      g.addColorStop(1, "rgba(255,200,120,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.arc(x, y, len, a - w, a + w);
      ctx.closePath();
      ctx.fill();
    }

    // Halo rings: hard-edged additive discs, Kurzgesagt style.
    for (let i = HALO_RINGS.length - 1; i >= 0; i--) {
      const breathe = 1 + 0.012 * Math.sin(ambient * 0.8 + i);
      ctx.fillStyle = `rgba(255,190,110,${0.05 + 0.012 * (HALO_RINGS.length - i)})`;
      ctx.beginPath();
      ctx.arc(x, y, r * HALO_RINGS[i] * breathe, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Body.
    const body = ctx.createRadialGradient(x + r * 0.18, y - r * 0.12, r * 0.05, x, y, r);
    body.addColorStop(0, "#fff7dc");
    body.addColorStop(0.45, "#ffc857");
    body.addColorStop(1, "#ff8f4a");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Offset highlight.
    const hx = x + r * 0.32;
    const hy = y - r * 0.28;
    const hl = ctx.createRadialGradient(hx, hy, 0, hx, hy, r * 0.55);
    hl.addColorStop(0, "rgba(255,252,235,0.55)");
    hl.addColorStop(1, "rgba(255,252,235,0)");
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = hl;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);

    // Granules drift around the disc and glow.
    ctx.globalCompositeOperation = "lighter";
    for (const g of this.granules) {
      const a = g.angle + ambient * g.drift;
      const d = g.dist * r * (1 + 0.04 * Math.sin(ambient * 0.3 + g.phase));
      const gx = x + Math.cos(a) * d;
      const gy = y + Math.sin(a) * d;
      const gr = g.size * r * (1 + 0.15 * Math.sin(ambient * 0.9 + g.phase));
      const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
      glow.addColorStop(0, "rgba(255,243,196,0.35)");
      glow.addColorStop(1, "rgba(255,243,196,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(gx - gr, gy - gr, gr * 2, gr * 2);
    }
    ctx.restore();
  }
}
