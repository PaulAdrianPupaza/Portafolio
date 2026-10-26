import { hash1, mulberry32 } from "./random";

// Final pass shared by every chapter: vignette to rgba(4,4,20,.45) and a 6%
// film grain that changes 24 times per second of ambient time.

const GRAIN_TILE = 256;
const GRAIN_VARIANTS = 6;
let grainTiles: HTMLCanvasElement[] | null = null;

function buildGrain() {
  const rng = mulberry32(0x6a1);
  return Array.from({ length: GRAIN_VARIANTS }, () => {
    const c = document.createElement("canvas");
    c.width = c.height = GRAIN_TILE;
    const g = c.getContext("2d")!;
    const img = g.createImageData(GRAIN_TILE, GRAIN_TILE);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = rng() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return c;
  });
}

export function drawFinish(ctx: CanvasRenderingContext2D, W: number, H: number, ambient: number) {
  const diag = Math.hypot(W, H) / 2;
  const vignette = ctx.createRadialGradient(W / 2, H / 2, diag * 0.42, W / 2, H / 2, diag);
  vignette.addColorStop(0, "rgba(4,4,20,0)");
  vignette.addColorStop(1, "rgba(4,4,20,0.45)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);

  grainTiles ??= buildGrain();
  const tick = Math.floor(ambient * 24);
  const tile = grainTiles[Math.floor(hash1(tick) * GRAIN_VARIANTS)];
  const pattern = ctx.createPattern(tile, "repeat")!;
  const dx = Math.floor(hash1(tick * 3 + 1) * GRAIN_TILE);
  const dy = Math.floor(hash1(tick * 7 + 2) * GRAIN_TILE);
  pattern.setTransform(new DOMMatrix([1, 0, 0, 1, dx, dy]));
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
