import type { Globe } from "./earth/globe";
import type { PlanetRenderer } from "./sphereGL";

interface FlatStyle {
  /** Atmosphere glow colour at the rim. */
  glow: string;
  /** Colour of the night side. */
  night: string;
}

/**
 * Canvas-2D stand-in for the WebGL planets on devices without WebGL: the map
 * scrolls inside a disc (half the globe across the diameter) and a gradient
 * along the light direction draws the terminator. Simpler, but every chapter
 * keeps its planets, phases and motion.
 */
export class FlatPlanet implements PlanetRenderer {
  constructor(
    private map: HTMLCanvasElement,
    private style: FlatStyle,
  ) {}

  draw(ctx: CanvasRenderingContext2D, g: Globe) {
    const { x, y, r } = g;
    if (r < 1) return;
    const { map } = this;

    const halo = ctx.createRadialGradient(x, y, r * 0.95, x, y, r * 1.16);
    halo.addColorStop(0, this.style.glow);
    halo.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(x - r * 1.2, y - r * 1.2, r * 2.4, r * 2.4);

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();

    // 180° of longitude centred on the facing meridian, wrapping at the seam.
    const span = map.width / 2;
    const sx = ((((g.lon - 90 + 180) / 360) * map.width) % map.width + map.width) % map.width;
    const first = Math.min(span, map.width - sx);
    ctx.drawImage(map, sx, 0, first, map.height, x - r, y - r, (first / span) * 2 * r, 2 * r);
    if (first < span) {
      const rest = span - first;
      ctx.drawImage(map, 0, 0, rest, map.height, x - r + (first / span) * 2 * r, y - r, (rest / span) * 2 * r, 2 * r);
    }

    // Night side: where N·L = 0 crosses the axis along the light direction.
    const [lx, ly, lz] = g.light;
    const lxy = Math.hypot(lx, ly);
    const dx = lxy > 1e-4 ? lx / lxy : 1;
    const dy = lxy > 1e-4 ? -ly / lxy : 0;
    const a = lz / Math.max(1e-4, Math.hypot(lxy, lz));
    const p = (1 + a) / 2;
    const night = ctx.createLinearGradient(x + dx * r, y + dy * r, x - dx * r, y - dy * r);
    night.addColorStop(0, "rgba(0,0,0,0)");
    night.addColorStop(Math.max(0, Math.min(1, p - 0.07)), "rgba(0,0,0,0)");
    night.addColorStop(Math.max(0, Math.min(1, p)), this.style.night);
    night.addColorStop(1, this.style.night);
    ctx.fillStyle = night;
    ctx.fillRect(x - r, y - r, 2 * r, 2 * r);

    const rim = ctx.createRadialGradient(x, y, r * 0.7, x, y, r);
    rim.addColorStop(0, "rgba(0,0,0,0)");
    rim.addColorStop(1, "rgba(4,10,30,0.28)");
    ctx.fillStyle = rim;
    ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
    ctx.restore();
  }

  dispose() {}
}
