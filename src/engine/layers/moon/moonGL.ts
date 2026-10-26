import { gauss, mulberry32, range } from "../../core/random";
import type { Globe } from "../earth/globe";
import { SphereGL, type GLMode, type PlanetRenderer } from "../sphereGL";

const MAP_W = 1024;
const MAP_H = 512;

/** Flat, stylised lunar map: pale highlands, dark maria, craters lit from the upper left. */
export function paintMoonMap() {
  const c = document.createElement("canvas");
  c.width = MAP_W;
  c.height = MAP_H;
  const ctx = c.getContext("2d")!;
  const rng = mulberry32(0x300a);
  const X = (lon: number) => ((lon + 180) / 360) * MAP_W;
  const Y = (lat: number) => ((90 - lat) / 180) * MAP_H;

  ctx.fillStyle = "#bfcadb";
  ctx.fillRect(0, 0, MAP_W, MAP_H);

  // Maria: soft dark seas, mostly on the near side like the real Moon.
  ctx.filter = "blur(6px)";
  ctx.fillStyle = "#8f9db4";
  const maria: [number, number, number][] = [
    [-20, 32, 26], [12, 20, 16], [30, 8, 14], [-45, 10, 20], [52, -8, 12], [-12, -20, 13], [38, 30, 10], [-62, 30, 11],
  ];
  for (const [lon, lat, size] of maria) {
    for (let i = 0; i < 5; i++) {
      const cx = X(lon + gauss(rng) * size * 0.45);
      const cy = Y(lat + gauss(rng) * size * 0.35);
      const r = (size * 0.55 + rng() * size * 0.4) * (MAP_W / 360);
      ctx.beginPath();
      ctx.ellipse(cx, cy, r / Math.max(0.35, Math.cos(((90 - (cy / MAP_H) * 180) * Math.PI) / 180)), r, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.filter = "none";

  // Craters: lit rim towards the upper left, darker floor, a few ejecta dots.
  for (let i = 0; i < 190; i++) {
    const lat = (Math.asin(rng() * 2 - 1) * 180) / Math.PI;
    const lon = rng() * 360 - 180;
    const r = 3 + Math.pow(rng(), 3) * 30;
    const stretch = 1 / Math.max(0.3, Math.cos((lat * Math.PI) / 180));
    const x = X(lon);
    const y = Y(lat);
    for (const wrap of [-MAP_W, 0, MAP_W]) {
      const cx = x + wrap;
      if (cx < -60 || cx > MAP_W + 60) continue;
      ctx.fillStyle = "#e1e8f2";
      ctx.beginPath();
      ctx.ellipse(cx - r * 0.16 * stretch, y - r * 0.16, r * stretch, r, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#9dabc1";
      ctx.beginPath();
      ctx.ellipse(cx + r * 0.06 * stretch, y + r * 0.06, r * 0.84 * stretch, r * 0.84, 0, 0, Math.PI * 2);
      ctx.fill();
      if (r > 14) {
        ctx.fillStyle = "#b3bfd1";
        ctx.beginPath();
        ctx.ellipse(cx, y, r * 0.28 * stretch, r * 0.28, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (r > 18) {
      ctx.fillStyle = "rgba(225,232,242,0.55)";
      for (let k = 0; k < 6; k++) {
        const a = rng() * Math.PI * 2;
        const d = r * range(rng, 1.3, 1.9);
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * d * stretch, y + Math.sin(a) * d, range(rng, 1.5, 3), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  return c;
}

const SHADE = `
uniform sampler2D uMap;
const vec3 NIGHT = vec3(0.055, 0.09, 0.19);

vec4 shade(vec2 p) {
  vec2 d = (p - uCenter) / uRadius;
  float r2 = dot(d, d);
  vec2 l2 = normalize(uLight.xy + vec2(1e-5));

  if (r2 > 1.0) {
    float r = sqrt(r2);
    float h = pow(1.0 - smoothstep(1.0, 1.1, r), 2.0);
    float lit = smoothstep(-0.4, 0.9, dot(d / r, l2)) * smoothstep(-0.4, 0.3, uLight.z + 0.3);
    float a = h * (0.06 + 0.4 * lit);
    return vec4(vec3(0.78, 0.86, 1.0) * a, a);
  }

  float z = sqrt(1.0 - r2);
  vec3 N = vec3(d, z);
  vec3 b = uRot * N;
  float lat = asin(clamp(b.y, -1.0, 1.0));
  float lon = atan(b.x, b.z);
  vec3 base = texture(uMap, vec2(lon / (2.0 * PI) + 0.5, 0.5 - lat / PI)).rgb;

  float ndl = dot(N, uLight);
  float day = smoothstep(-0.05, 0.12, ndl);
  vec3 dayCol = base * (0.84 + 0.22 * clamp(ndl, 0.0, 1.0));
  vec3 nightCol = NIGHT + base * 0.09;   // faint earthshine
  vec3 col = mix(nightCol, dayCol, day);
  col = mix(col, vec3(1.0, 0.86, 0.62), exp(-pow((ndl - 0.02) / 0.04, 2.0)) * 0.22);
  col += vec3(0.6, 0.8, 1.0) * pow(1.0 - z, 3.0) * 0.28 * day;
  return vec4(col, 1.0);
}
`;

/** The Moon: crater map with a sharp terminator so phases read clearly. */
export class MoonGL extends SphereGL implements PlanetRenderer {
  constructor(map: HTMLCanvasElement, mode: GLMode = "auto") {
    super(SHADE, [], [["uMap", map]], mode);
  }

  draw(ctx: CanvasRenderingContext2D, globe: Globe, W: number, H: number) {
    this.render(ctx, globe, W, H, () => {});
  }
}
