import { SphereGL } from "../sphereGL";
import { paintEarthTextures } from "./earthTexture";
import type { Globe } from "./globe";

const SHADE = `
uniform sampler2D uMap;
uniform sampler2D uAux;
uniform float uCloudShift;

const vec3 NAVY = vec3(0.055, 0.10, 0.26);
const vec3 CORAL = vec3(1.0, 0.50, 0.43);
const vec3 CYAN = vec3(0.45, 0.90, 1.0);
const vec3 CITY = vec3(1.0, 0.78, 0.42);

vec4 shade(vec2 p) {
  vec2 d = (p - uCenter) / uRadius;
  float r2 = dot(d, d);
  vec2 l2 = normalize(uLight.xy + vec2(1e-5));

  if (r2 > 1.0) {
    // Atmosphere halo, stronger on the lit side.
    float r = sqrt(r2);
    float h = pow(1.0 - smoothstep(1.0, 1.17, r), 1.7);
    float lit = smoothstep(-0.6, 0.9, dot(d / r, l2));
    float a = h * (0.18 + 0.72 * lit);
    vec3 c = mix(vec3(0.22, 0.45, 1.0), vec3(0.55, 0.92, 1.0), lit);
    return vec4(c * a, a);
  }

  float z = sqrt(1.0 - r2);
  vec3 N = vec3(d, z);
  vec3 b = uRot * N;
  float lat = asin(clamp(b.y, -1.0, 1.0));
  float lon = atan(b.x, b.z);
  vec2 uv = vec2(lon / (2.0 * PI) + 0.5, 0.5 - lat / PI);

  vec3 base = texture(uMap, uv).rgb;
  vec4 aux = texture(uAux, uv);
  float cloud = texture(uAux, vec2(uv.x + uCloudShift, uv.y)).g;
  float ocean = aux.b;

  float ndl = dot(N, uLight);
  float day = smoothstep(-0.12, 0.24, ndl);

  vec3 dayCol = base * (0.9 + 0.16 * clamp(ndl, 0.0, 1.0));
  vec3 H = normalize(uLight + vec3(0.0, 0.0, 1.0));
  dayCol += vec3(1.0, 0.97, 0.88) * pow(max(dot(N, H), 0.0), 70.0) * ocean * 0.55;
  dayCol = mix(dayCol, vec3(1.0), cloud * 0.92);

  vec3 nightCol = mix(NAVY, base * 0.22 + NAVY * 0.6, 0.35);
  nightCol = mix(nightCol, NAVY * 1.6, cloud * 0.55);
  nightCol += CITY * aux.r * (1.0 - cloud * 0.7) * 1.3;

  vec3 col = mix(nightCol, dayCol, day);
  float band = exp(-pow((ndl + 0.01) / 0.045, 2.0));
  col = mix(col, CORAL, band * 0.42);
  col += CYAN * pow(1.0 - z, 3.0) * (0.22 + 0.55 * day);
  return vec4(col, 1.0);
}
`;

export type EarthGlobe = Globe & {
  /** Cloud layer offset in texture units. */
  cloudShift: number;
};

/** The Earth: painted map, drifting clouds, night-side city lights, ocean glint. */
export class EarthGL extends SphereGL {
  constructor() {
    const { map, aux } = paintEarthTextures();
    super(SHADE, ["uCloudShift"], [["uMap", map], ["uAux", aux]]);
  }

  draw(ctx: CanvasRenderingContext2D, globe: EarthGlobe, W: number, H: number) {
    this.render(ctx, globe, W, H, () => this.gl.uniform1f(this.u.uCloudShift, globe.cloudShift));
  }
}
