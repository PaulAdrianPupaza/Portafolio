import { mulberry32, range } from "../core/random";
import { depthScale, type View } from "../core/view";

interface Star {
  x: number;
  y: number;
  size: number;
  phase: number;
  speed: number;
  sparkle: boolean;
  color: string;
}

interface StarLayer {
  depth: number;
  stars: Star[];
}

const TILE = 2600;
const STAR_COLORS = ["#ffffff", "#ffffff", "#e3f6ff", "#fff3d6"];

// rgb and opacity per blob; the fifth reuses the blue at a lower strength.
const NEBULAE = [
  { u: 0.12, v: 0.22, r: 0.55, rgb: "24,150,160", a: 0.2 },
  { u: 0.84, v: 0.16, r: 0.62, rgb: "40,95,195", a: 0.16 },
  { u: 0.7, v: 0.88, r: 0.48, rgb: "220,95,110", a: 0.1 },
  { u: 0.24, v: 0.86, r: 0.6, rgb: "60,70,175", a: 0.15 },
  { u: 0.98, v: 0.55, r: 0.45, rgb: "40,95,195", a: 0.1 },
];

export class SpaceLayer {
  private layers: StarLayer[];

  constructor(seed = 7) {
    const rng = mulberry32(seed);
    const specs = [
      { depth: 0.12, count: 300, size: [0.7, 1.4], sparkles: 0 },
      { depth: 0.35, count: 170, size: [1.1, 2.1], sparkles: 0 },
      { depth: 0.6, count: 90, size: [1.8, 3.2], sparkles: 0.4 },
    ];
    this.layers = specs.map((spec) => ({
      depth: spec.depth,
      stars: Array.from({ length: spec.count }, () => ({
        x: rng() * TILE,
        y: rng() * TILE,
        size: range(rng, spec.size[0], spec.size[1]),
        phase: rng() * Math.PI * 2,
        speed: range(rng, 0.6, 2.2),
        sparkle: rng() < spec.sparkles,
        color: STAR_COLORS[Math.floor(rng() * STAR_COLORS.length)],
      })),
    }));
  }

  draw(ctx: CanvasRenderingContext2D, view: View, ambient: number) {
    const { W, H } = view;
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#081d2c");
    sky.addColorStop(1, "#102348");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    this.drawNebulae(ctx, view, ambient);
    for (const layer of this.layers) this.drawStars(ctx, view, layer, ambient);
  }

  private drawNebulae(ctx: CanvasRenderingContext2D, view: View, ambient: number) {
    const { W, H } = view;
    const size = Math.max(W, H);
    const px = (view.camera.x - 960) * view.base * 0.05;
    const py = (view.camera.y - 540) * view.base * 0.05;
    NEBULAE.forEach((n, i) => {
      const x = n.u * W - px + Math.sin(ambient * 0.05 + i * 1.7) * size * 0.015;
      const y = n.v * H - py + Math.cos(ambient * 0.04 + i * 2.3) * size * 0.015;
      const r = n.r * size;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${n.rgb},${n.a})`);
      g.addColorStop(0.55, `rgba(${n.rgb},${n.a * 0.45})`);
      g.addColorStop(1, `rgba(${n.rgb},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    });
  }

  private drawStars(ctx: CanvasRenderingContext2D, view: View, layer: StarLayer, ambient: number) {
    const s = depthScale(view, layer.depth);
    const camX = view.camera.x * layer.depth;
    const camY = view.camera.y * layer.depth;
    const halfW = view.W / 2 / s;
    const halfH = view.H / 2 / s;
    const copies = halfW > TILE / 2 || halfH > TILE / 2 ? [-1, 0, 1] : [0];

    for (const star of layer.stars) {
      const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(ambient * star.speed + star.phase));
      const wx = ((((star.x - camX) % TILE) + TILE) % TILE) - TILE / 2;
      const wy = ((((star.y - camY) % TILE) + TILE) % TILE) - TILE / 2;
      for (const kx of copies) {
        for (const ky of copies) {
          const ux = wx + kx * TILE;
          const uy = wy + ky * TILE;
          if (Math.abs(ux) > halfW + 10 || Math.abs(uy) > halfH + 10) continue;
          const x = view.W / 2 + ux * s;
          const y = view.H / 2 + uy * s;
          const r = star.size * view.base * (1 + (view.zoom - 1) * layer.depth * 0.5);
          ctx.globalAlpha = twinkle;
          ctx.fillStyle = star.color;
          if (star.sparkle) drawSparkle(ctx, x, y, r * (2.6 + twinkle));
          else {
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
    ctx.globalAlpha = 1;
  }
}

function drawSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, L: number) {
  ctx.beginPath();
  ctx.moveTo(x, y - L);
  ctx.quadraticCurveTo(x, y, x + L, y);
  ctx.quadraticCurveTo(x, y, x, y + L);
  ctx.quadraticCurveTo(x, y, x - L, y);
  ctx.quadraticCurveTo(x, y, x, y - L);
  ctx.fill();
}
