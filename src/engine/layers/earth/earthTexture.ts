import { gauss, mulberry32, range, type Rng } from "../../core/random";
import { BIOMES, CITIES, INLAND_WATER, LAND, type Biome, type Polygon } from "./geoData";

// Paints the equirectangular maps the globe shader samples:
//   map: surface colour
//   aux: R = city lights, G = clouds, B = ocean mask (1 = water)

export const MAP_W = 2048;
export const MAP_H = 1024;

const COLORS = {
  land: "#5fc47a",
  forest: "#48ad6b",
  desert: "#f5c75f",
  rainforest: "#3a9d62",
  ice: "#f1f8ff",
  shallow: "#4dc7eb",
  deep: "#1a66b8",
} as const;

const BIOME_COLORS: Record<Biome, string> = {
  desert: COLORS.desert,
  forest: COLORS.forest,
  rainforest: COLORS.rainforest,
  ice: COLORS.ice,
};

const X = (lon: number) => ((lon + 180) / 360) * MAP_W;
const Y = (lat: number) => ((90 - lat) / 180) * MAP_H;

function addPolygon(ctx: CanvasRenderingContext2D, poly: Polygon) {
  poly.forEach(([lon, lat], i) => (i === 0 ? ctx.moveTo(X(lon), Y(lat)) : ctx.lineTo(X(lon), Y(lat))));
  ctx.closePath();
}

function fillPolygons(ctx: CanvasRenderingContext2D, polys: Polygon[], style: string) {
  ctx.fillStyle = style;
  ctx.beginPath();
  polys.forEach((p) => addPolygon(ctx, p));
  ctx.fill();
}

function makeCanvas() {
  const c = document.createElement("canvas");
  c.width = MAP_W;
  c.height = MAP_H;
  return c;
}

function paintSurface() {
  const canvas = makeCanvas();
  const ctx = canvas.getContext("2d")!;

  const ocean = ctx.createLinearGradient(0, 0, 0, MAP_H);
  ocean.addColorStop(0, COLORS.deep);
  ocean.addColorStop(0.5, "#2079c6");
  ocean.addColorStop(1, COLORS.deep);
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, MAP_W, MAP_H);

  // Shallow water glows around every coast.
  ctx.filter = "blur(26px)";
  ctx.globalAlpha = 0.75;
  fillPolygons(ctx, LAND, COLORS.shallow);
  ctx.filter = "blur(7px)";
  ctx.globalAlpha = 0.9;
  fillPolygons(ctx, LAND, COLORS.shallow);
  ctx.filter = "none";
  ctx.globalAlpha = 1;

  fillPolygons(ctx, LAND, COLORS.land);

  ctx.save();
  ctx.beginPath();
  LAND.forEach((p) => addPolygon(ctx, p));
  ctx.clip();
  ctx.filter = "blur(4px)";
  for (const { biome, poly } of BIOMES) fillPolygons(ctx, [poly], BIOME_COLORS[biome]);
  ctx.restore();

  fillPolygons(ctx, INLAND_WATER, "#2f93d3");

  // Arctic sea ice cap.
  const cap = ctx.createLinearGradient(0, 0, 0, Y(78));
  cap.addColorStop(0, COLORS.ice);
  cap.addColorStop(0.7, COLORS.ice);
  cap.addColorStop(1, "rgba(241,248,255,0)");
  ctx.fillStyle = cap;
  ctx.fillRect(0, 0, MAP_W, Y(78));

  return canvas;
}

function drawClouds(ctx: CanvasRenderingContext2D, rng: Rng) {
  const bands = [
    { lat: 6, sd: 5, w: 0.3 },
    { lat: 48, sd: 9, w: 0.25 },
    { lat: -48, sd: 9, w: 0.25 },
    { lat: 64, sd: 5, w: 0.1 },
    { lat: -60, sd: 4, w: 0.1 },
  ];
  ctx.strokeStyle = "rgb(0,255,0)";
  ctx.lineCap = "round";
  for (let cluster = 0; cluster < 62; cluster++) {
    let pick = rng();
    const band = bands.find((b) => (pick -= b.w) < 0) ?? bands[0];
    const cx = rng() * MAP_W;
    const cy = Y(band.lat + gauss(rng) * band.sd);
    const pieces = 1 + Math.floor(rng() * 3);
    for (let i = 0; i < pieces; i++) {
      const len = range(rng, 26, 95);
      const width = range(rng, 7, 14);
      const x = cx + gauss(rng) * 40;
      const y = cy + i * width * 1.1 * (rng() < 0.5 ? -1 : 1);
      const tilt = range(rng, -0.08, 0.08);
      const dx = Math.cos(tilt) * len * 0.5;
      const dy = Math.sin(tilt) * len * 0.5;
      ctx.lineWidth = width;
      for (const wrap of [-MAP_W, 0, MAP_W]) {
        ctx.beginPath();
        ctx.moveTo(x - dx + wrap, y - dy);
        ctx.lineTo(x + dx + wrap, y + dy);
        ctx.stroke();
      }
    }
  }
}

function drawCityLights(ctx: CanvasRenderingContext2D, rng: Rng, isLand: (x: number, y: number) => boolean) {
  const total = CITIES.reduce((s, c) => s + c[2], 0);
  let placed = 0;
  let attempts = 0;
  while (placed < 380 && attempts < 4000) {
    attempts++;
    let pick = rng() * total;
    const city = CITIES.find((c) => (pick -= c[2]) < 0) ?? CITIES[0];
    const spread = 0.6 + 0.5 * Math.sqrt(city[2]);
    const x = X(city[0] + gauss(rng) * spread * 1.2);
    const y = Y(city[1] + gauss(rng) * spread);
    if (!isLand(x, y)) continue;
    const r = range(rng, 2.2, 4.8);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(255,0,0,0.95)");
    g.addColorStop(1, "rgba(255,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    placed++;
  }
}

function paintAux() {
  const canvas = makeCanvas();
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = "rgb(0,0,255)";
  ctx.fillRect(0, 0, MAP_W, MAP_H);
  fillPolygons(ctx, LAND, "rgb(0,0,0)");
  fillPolygons(ctx, INLAND_WATER, "rgb(0,0,255)");

  const mask = ctx.getImageData(0, 0, MAP_W, MAP_H).data;
  const isLand = (x: number, y: number) => {
    const ix = Math.floor(x), iy = Math.floor(y);
    if (ix < 0 || iy < 0 || ix >= MAP_W || iy >= MAP_H) return false;
    return mask[(iy * MAP_W + ix) * 4 + 2] < 128;
  };

  ctx.globalCompositeOperation = "lighter";
  drawCityLights(ctx, mulberry32(0xc17), isLand);
  drawClouds(ctx, mulberry32(0xc10d));
  ctx.globalCompositeOperation = "source-over";
  return canvas;
}

export function paintEarthTextures() {
  return { map: paintSurface(), aux: paintAux() };
}
