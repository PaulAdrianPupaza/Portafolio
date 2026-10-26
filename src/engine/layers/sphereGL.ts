import { bodyToView, type Globe } from "./earth/globe";

/** Which GPU path to use: WebGL2 when available, WebGL1 otherwise, or none (2D fallback). */
export type GLMode = "auto" | "webgl1" | "none";

/** Anything that can draw a planet into the 2D frame. */
export interface PlanetRenderer<G extends Globe = Globe> {
  draw(ctx: CanvasRenderingContext2D, globe: G, W: number, H: number): void;
  dispose(): void;
}

type GL = WebGL2RenderingContext | WebGLRenderingContext;

const VERT2 = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const VERT1 = `attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

// Planet shaders are written once in GLSL ES 3.00 style; these preambles let
// the same source compile on WebGL1 (GLSL ES 1.00) devices too.
const PREAMBLE2 = `#version 300 es
precision highp float;
out vec4 outColor;
#define FRAG_OUT outColor
`;

const preamble1 = (precision: "highp" | "mediump") => `precision ${precision} float;
#define FRAG_OUT gl_FragColor
#define texture texture2D
`;

/**
 * Shared fragment body: uniforms every planet uses and a 4x rotated-grid
 * supersampling main(). Each planet supplies `vec4 shade(vec2 p)`, returning
 * premultiplied colour.
 */
const SPHERE_COMMON = `
uniform vec2 uCenter;   // device px, GL coordinates (y up)
uniform float uRadius;  // device px
uniform mat3 uRot;      // view -> body
uniform vec3 uLight;    // view space, towards the Sun
const float PI = 3.14159265;

vec4 shade(vec2 p);

void main() {
  vec2 p = gl_FragCoord.xy;
  vec4 acc = shade(p + vec2(0.125, 0.375))
           + shade(p + vec2(0.375, -0.125))
           + shade(p + vec2(-0.125, -0.375))
           + shade(p + vec2(-0.375, 0.125));
  FRAG_OUT = acc * 0.25;
}
`;

function compile(gl: GL, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader error");
  return s;
}

const CONTEXT_OPTIONS: WebGLContextAttributes = {
  premultipliedAlpha: true,
  alpha: true,
  antialias: false,
  // Some mobile browsers hand back a cleared buffer to drawImage otherwise.
  preserveDrawingBuffer: true,
};

/**
 * An orthographic sphere rendered in its own WebGL canvas and composited into
 * the 2D frame. Only the planet's bounding box (plus halo margin) is shaded
 * and copied. Uses WebGL2, or WebGL1 on devices without it.
 */
export class SphereGL {
  private canvas = document.createElement("canvas");
  protected gl: GL;
  private program: WebGLProgram;
  private buffer: WebGLBuffer;
  private aPos: number;
  private textures: WebGLTexture[] = [];
  protected u: Record<string, WebGLUniformLocation | null> = {};

  constructor(
    shadeSource: string,
    extraUniforms: string[],
    textures: [name: string, source: HTMLCanvasElement][],
    mode: GLMode = "auto",
  ) {
    if (mode === "none") throw new Error("WebGL disabled");
    const gl2 = mode === "auto" ? this.canvas.getContext("webgl2", CONTEXT_OPTIONS) : null;
    const gl = gl2 ?? this.canvas.getContext("webgl", CONTEXT_OPTIONS);
    if (!gl) throw new Error("WebGL is not available");
    this.gl = gl;

    let preamble = PREAMBLE2;
    if (!gl2) {
      const high = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
      preamble = preamble1(high && high.precision > 0 ? "highp" : "mediump");
    }

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, gl2 ? VERT2 : VERT1));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, preamble + SPHERE_COMMON + shadeSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "link error");
    this.program = program;
    gl.useProgram(program);
    const names = ["uCenter", "uRadius", "uRot", "uLight", ...extraUniforms, ...textures.map(([n]) => n)];
    for (const name of names) this.u[name] = gl.getUniformLocation(program, name);

    this.buffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    this.aPos = gl.getAttribLocation(program, "aPos");

    textures.forEach(([name, source], unit) => {
      const tex = gl.createTexture()!;
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform1i(this.u[name], unit);
      this.textures.push(tex);
    });
  }

  /** Shades the sphere described by `globe`; `setUniforms` adds planet-specific values. */
  protected render(ctx: CanvasRenderingContext2D, globe: Globe, W: number, H: number, setUniforms: () => void) {
    const margin = globe.r * 1.2;
    const x0 = Math.max(0, Math.floor(globe.x - margin));
    const y0 = Math.max(0, Math.floor(globe.y - margin));
    const x1 = Math.min(W, Math.ceil(globe.x + margin));
    const y1 = Math.min(H, Math.ceil(globe.y + margin));
    if (x1 <= x0 || y1 <= y0 || globe.r < 1) return;

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
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.enableVertexAttribArray(this.aPos);
    gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 0, 0);
    this.textures.forEach((tex, unit) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
    });
    gl.uniform2f(this.u.uCenter, globe.x, H - globe.y);
    gl.uniform1f(this.u.uRadius, globe.r);
    // Row-major body→view read as column-major is its transpose: view→body.
    gl.uniformMatrix3fv(this.u.uRot, false, bodyToView(globe));
    gl.uniform3fv(this.u.uLight, globe.light);
    setUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    ctx.drawImage(canvas, x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0);
  }

  dispose() {
    for (const t of this.textures) this.gl.deleteTexture(t);
    this.gl.deleteBuffer(this.buffer);
    this.gl.deleteProgram(this.program);
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}
