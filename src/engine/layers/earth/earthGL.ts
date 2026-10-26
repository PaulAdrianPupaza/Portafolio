import { paintEarthTextures } from "./earthTexture";
import { bodyToView, type Globe } from "./globe";

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `#version 300 es
precision highp float;
uniform sampler2D uMap;
uniform sampler2D uAux;
uniform vec2 uCenter;   // device px, GL coordinates (y up)
uniform float uRadius;  // device px
uniform mat3 uRot;      // view -> body
uniform vec3 uLight;    // view space, towards the Sun
uniform float uCloudShift;
out vec4 outColor;

const vec3 NAVY = vec3(0.055, 0.10, 0.26);
const vec3 CORAL = vec3(1.0, 0.50, 0.43);
const vec3 CYAN = vec3(0.45, 0.90, 1.0);
const vec3 CITY = vec3(1.0, 0.78, 0.42);
const float PI = 3.14159265;

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

void main() {
  vec2 p = gl_FragCoord.xy;
  // 4x supersampling on a rotated grid.
  vec4 acc = shade(p + vec2(0.125, 0.375))
           + shade(p + vec2(0.375, -0.125))
           + shade(p + vec2(-0.125, -0.375))
           + shade(p + vec2(-0.375, 0.125));
  outColor = acc * 0.25;
}
`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader error");
  return s;
}

function uploadTexture(gl: WebGL2RenderingContext, unit: number, source: HTMLCanvasElement) {
  const tex = gl.createTexture()!;
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return tex;
}

/**
 * Orthographic globe rendered in its own WebGL2 canvas and composited into
 * the 2D frame. Only the planet's bounding box is shaded and copied.
 */
export class EarthGL {
  private canvas = document.createElement("canvas");
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private vao: WebGLVertexArrayObject;
  private textures: WebGLTexture[] = [];
  private u: Record<string, WebGLUniformLocation | null> = {};

  constructor() {
    const gl = this.canvas.getContext("webgl2", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) throw new Error("WebGL2 is not available");
    this.gl = gl;

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "link error");
    this.program = program;
    gl.useProgram(program);
    for (const name of ["uMap", "uAux", "uCenter", "uRadius", "uRot", "uLight", "uCloudShift"]) {
      this.u[name] = gl.getUniformLocation(program, name);
    }

    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const { map, aux } = paintEarthTextures();
    this.textures.push(uploadTexture(gl, 0, map), uploadTexture(gl, 1, aux));
    gl.uniform1i(this.u.uMap, 0);
    gl.uniform1i(this.u.uAux, 1);
  }

  draw(ctx: CanvasRenderingContext2D, globe: Globe, W: number, H: number) {
    const margin = globe.r * 1.2;
    const x0 = Math.max(0, Math.floor(globe.x - margin));
    const y0 = Math.max(0, Math.floor(globe.y - margin));
    const x1 = Math.min(W, Math.ceil(globe.x + margin));
    const y1 = Math.min(H, Math.ceil(globe.y + margin));
    if (x1 <= x0 || y1 <= y0) return;

    const { gl, canvas } = this;
    if (canvas.width !== W || canvas.height !== H) {
      canvas.width = W;
      canvas.height = H;
    }
    gl.viewport(0, 0, W, H);
    gl.disable(gl.SCISSOR_TEST);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(x0, H - y1, x1 - x0, y1 - y0);

    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);
    gl.uniform2f(this.u.uCenter, globe.x, H - globe.y);
    gl.uniform1f(this.u.uRadius, globe.r);
    // Row-major body→view read as column-major is its transpose: view→body.
    gl.uniformMatrix3fv(this.u.uRot, false, bodyToView(globe));
    gl.uniform3fv(this.u.uLight, globe.light);
    gl.uniform1f(this.u.uCloudShift, globe.cloudShift);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    ctx.drawImage(canvas, x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0);
  }

  dispose() {
    for (const t of this.textures) this.gl.deleteTexture(t);
    this.gl.deleteProgram(this.program);
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}
