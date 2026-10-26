import { invLerp, smoothstep } from "../core/math";
import type { Beat } from "../core/renderer";
import { sampleTrack, type Key } from "../core/track";
import { depthScale, makeView, sx, sy, type Camera, type FrameInput } from "../core/view";
import { drawCaptions, type CaptionBlock, type CaptionLine } from "../layers/captions";
import { SkillOrbits } from "../layers/skillOrbits";
import { SpaceLayer } from "../layers/space";
import { SunLayer } from "../layers/sun";
import type { Chapter } from "./chapter";
import { drawMascot, type Pose } from "./mascot";

export type SunBeatId = "approach" | "languages" | "frameworks" | "data" | "design" | "finale";
export type SunCopy = Record<SunBeatId, CaptionLine[]>;

const BEATS: (Beat & { id: SunBeatId })[] = [
  { id: "approach", start: 1.2, end: 5.4 },
  { id: "languages", start: 6.2, end: 10.4 },
  { id: "frameworks", start: 11.2, end: 15.4 },
  { id: "data", start: 16.2, end: 20.4 },
  { id: "design", start: 21.2, end: 24.8 },
  // Ends past the chapter so the closing line stays on screen at the bottom of the scroll.
  { id: "finale", start: 27.4, end: 31 },
];

export const SUN_DURATION = 30;
const SUN = { x: 1150, y: 540, r: 300 };

type Cam = Camera & Record<string, number>;
const CAMERA: Record<"landscape" | "portrait", Key<Cam>[]> = {
  landscape: [
    [0, { x: 1500, y: 560, zoom: 0.62 }],
    [4, { x: 1000, y: 540, zoom: 0.85 }],
    [6.2, { x: 980, y: 540, zoom: 0.95 }],
    [10.6, { x: 960, y: 530, zoom: 0.97 }],
    [15.6, { x: 950, y: 550, zoom: 0.95 }],
    [20.6, { x: 960, y: 540, zoom: 0.93 }],
    [24.8, { x: 960, y: 540, zoom: 0.93 }],
    [26.4, { x: 1150, y: 540, zoom: 3.2 }],
    [27, { x: 1150, y: 540, zoom: 3.2 }],
    [27.6, { x: 900, y: 520, zoom: 0.55 }],
    [30, { x: 880, y: 520, zoom: 0.53 }],
  ],
  portrait: [
    [0, { x: 1150, y: 900, zoom: 0.6 }],
    [4, { x: 1150, y: 760, zoom: 0.8 }],
    [6.2, { x: 1150, y: 720, zoom: 0.85 }],
    [24.8, { x: 1150, y: 720, zoom: 0.85 }],
    [26.4, { x: 1150, y: 540, zoom: 3 }],
    [27, { x: 1150, y: 540, zoom: 3 }],
    [27.6, { x: 1150, y: 700, zoom: 0.6 }],
    [30, { x: 1150, y: 700, zoom: 0.58 }],
  ],
};

// When each skill orbit is traced in, and when it is the one being talked about.
const RINGS = [
  { ignite: 6.4, from: 6.2, to: 10.4 },
  { ignite: 11.4, from: 11.2, to: 15.4 },
  { ignite: 16.4, from: 16.2, to: 20.4 },
  { ignite: 21.4, from: 21.2, to: 24.8 },
];

const P = {
  approach: { dx: -1.25, dy: -1.15, rot: -0.1, armL: 0.3, armR: -1.0, wave: 0 },
  languages: { dx: 1.15, dy: -1.2, rot: 0.15, armL: 1.1, armR: 0.3, wave: 0 },
  frameworks: { dx: 1.3, dy: 0.9, rot: 0.2, armL: 2.2, armR: -0.3, wave: 0.3 },
  data: { dx: -1.2, dy: 1.05, rot: -0.2, armL: 0.3, armR: -2.0, wave: 0 },
  design: { dx: 1.2, dy: -1.1, rot: 0.1, armL: 0.8, armR: 0.2, wave: 0 },
  finale: { dx: 1.9, dy: -0.4, rot: -0.1, armL: 2.5, armR: 0.3, wave: 1 },
} satisfies Record<SunBeatId, Pose>;

const POSES: Key<Pose>[] = [
  // Arrives from the right, carrying on from the Moon chapter's exit.
  [0, { ...P.approach, dx: 5.5, dy: -2.5, rot: -0.5 }], [2.6, P.approach], [5.4, P.approach],
  [6.4, P.languages], [10.6, P.languages],
  [11.4, P.frameworks], [15.6, P.frameworks],
  [16.4, P.data], [20.6, P.data],
  [21.4, P.design], [25, P.design],
  [27.2, P.finale],
];

/** Chapter 3 · Sun: the skills that power the work, then a dive into the light and a goodbye. */
export class SunChapter implements Chapter {
  readonly id = "sun";
  readonly duration = SUN_DURATION;
  readonly beats = BEATS;

  private space = new SpaceLayer();
  private sun = new SunLayer();
  private orbits = new SkillOrbits();
  private captions: CaptionBlock[];

  constructor(copy: SunCopy) {
    this.captions = BEATS.map((b) => ({ start: b.start, end: b.end, lines: copy[b.id] }));
  }

  draw(ctx: CanvasRenderingContext2D, { t, ambient, W, H, calm }: FrameInput) {
    const portrait = W / H < 0.9;
    const view = makeView(W, H, sampleTrack(CAMERA[portrait ? "portrait" : "landscape"], t));
    const unit = depthScale(view, 0.5);
    const sun = { x: sx(view, SUN.x), y: sy(view, SUN.y), r: SUN.r * view.scale };

    const ignite = RINGS.map((r) => invLerp(r.ignite, r.ignite + 2, t));
    const focus = RINGS.map((r) => smoothstep(r.from, r.from + 0.6, t) * (1 - smoothstep(r.to - 0.4, r.to + 0.3, t)));
    const clock = ambient * 0.5 + t * 0.35;

    this.space.draw(ctx, view, ambient);
    this.orbits.draw(ctx, sun, clock, ignite, focus, unit, "back");
    this.sun.draw(ctx, sun, ambient);
    this.orbits.draw(ctx, sun, clock, ignite, focus, unit, "front");

    const look = t > 27 ? { x: view.W * 0.3, y: view.H * 0.6 } : sun;
    drawMascot(ctx, view, POSES, SUN, t, ambient, look);

    // Diving into the Sun warms the frame with a soft glow, then pulls back
    // out. Kept partial and brief so it never becomes a full white flash;
    // skipped entirely for reduced motion.
    const flash = calm ? 0 : smoothstep(25.8, 26.4, t) * (1 - smoothstep(26.8, 27.4, t));
    if (flash > 0) {
      const glow = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.hypot(W, H) / 2);
      glow.addColorStop(0, "rgba(255,226,170,0.55)");
      glow.addColorStop(1, "rgba(255,143,74,0.35)");
      ctx.save();
      ctx.globalAlpha = flash;
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    drawCaptions(ctx, view, this.captions, t);
  }
}
