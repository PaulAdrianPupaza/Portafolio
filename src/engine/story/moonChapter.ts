import { DEG, invLerp } from "../core/math";
import type { Beat } from "../core/renderer";
import { sampleTrack, type Key } from "../core/track";
import { depthScale, makeView, sx, sy, type Camera, type FrameInput } from "../core/view";
import { drawCaptions, type CaptionBlock, type CaptionLine } from "../layers/captions";
import type { LonLat } from "../layers/earth/geoData";
import { bodyToView, type Globe } from "../layers/earth/globe";
import { drawBeacon, type BeaconIcon } from "../layers/moon/beacons";
import { SpaceLayer } from "../layers/space";
import type { Assets, Chapter } from "./chapter";
import { drawMascot, type Pose } from "./mascot";

export type MoonBeatId = "arrive" | "bots" | "aios" | "construction" | "outro";
export type MoonCopy = Record<MoonBeatId, CaptionLine[]>;

const BEATS: (Beat & { id: MoonBeatId })[] = [
  { id: "arrive", start: 1.4, end: 5.6 },
  { id: "bots", start: 6.8, end: 11.4 },
  { id: "aios", start: 12.4, end: 17 },
  { id: "construction", start: 18, end: 22.6 },
  { id: "outro", start: 23.8, end: 27.4 },
];

export const MOON_DURATION = 28;
const MOON = { x: 1180, y: 540, r: 320 };
const SMALL_EARTH = { landscape: { x: 560, y: 1120, r: 170 }, portrait: { x: 760, y: 1320, r: 170 } };

type Cam = Camera & Record<string, number>;
const CAMERA: Record<"landscape" | "portrait", Key<Cam>[]> = {
  landscape: [
    [0, { x: 900, y: 780, zoom: 0.7 }],
    [3.6, { x: 960, y: 620, zoom: 0.95 }],
    [6.8, { x: 900, y: 560, zoom: 1.35 }],
    [11.6, { x: 900, y: 560, zoom: 1.35 }],
    [12.6, { x: 920, y: 600, zoom: 1.4 }],
    [17.2, { x: 920, y: 600, zoom: 1.4 }],
    [18.2, { x: 900, y: 540, zoom: 1.35 }],
    [22.8, { x: 900, y: 540, zoom: 1.35 }],
    [25.4, { x: 1000, y: 560, zoom: 1.0 }],
    [28, { x: 700, y: 560, zoom: 0.8 }],
  ],
  portrait: [
    [0, { x: 1100, y: 900, zoom: 0.8 }],
    [3.6, { x: 1180, y: 760, zoom: 1.0 }],
    [6.8, { x: 1180, y: 700, zoom: 1.35 }],
    [22.8, { x: 1180, y: 700, zoom: 1.35 }],
    [25.4, { x: 1180, y: 720, zoom: 1.0 }],
    [28, { x: 950, y: 660, zoom: 0.85 }],
  ],
};

// Sun angle around the Moon in degrees: -180 is behind it, 0 is behind the
// camera (full moon). Scrolling waxes the Moon and each phase lights a site.
const PHASE: Key<{ deg: number }>[] = [
  [0, { deg: -150 }],
  [3.6, { deg: -135 }],
  [6.8, { deg: -100 }],
  [11.6, { deg: -100 }],
  [12.6, { deg: -48 }],
  [17.2, { deg: -48 }],
  [18.2, { deg: 0 }],
  [22.8, { deg: 0 }],
  [25.4, { deg: -45 }],
  [28, { deg: -80 }],
];

interface Site {
  id: MoonBeatId;
  at: LonLat;
  icon: BeaconIcon;
  accent: string;
  on: number;
  off: number;
}

const SITES: Site[] = [
  { id: "bots", at: [-52, 20], icon: "chat", accent: "#ff8f4a", on: 7.2, off: 11.6 },
  { id: "aios", at: [4, -16], icon: "terminal", accent: "#8fd8e6", on: 12.8, off: 17.2 },
  { id: "construction", at: [46, 14], icon: "blocks", accent: "#ffd98a", on: 18.4, off: 22.8 },
];

const P = {
  arrive: { dx: -1.5, dy: -0.55, rot: -0.12, armL: 2.5, armR: 0.3, wave: 1 },
  bots: { dx: -1.45, dy: -0.85, rot: 0.15, armL: 0.4, armR: -1.1, wave: 0 },
  aios: { dx: 1.05, dy: 0.95, rot: 0.2, armL: 1.3, armR: 0.2, wave: 0 },
  // Kept clear of the header controls in the top-right corner.
  construction: { dx: 1.05, dy: -0.5, rot: 0.1, armL: 0.9, armR: 0.2, wave: 0 },
  outro: { dx: -1.3, dy: -1.2, rot: -0.35, armL: 2.6, armR: 0.4, wave: 0 },
} satisfies Record<MoonBeatId, Pose>;

const POSES: Key<Pose>[] = [
  // Flies in from the lower left, carrying on from the Earth chapter's exit.
  [0, { ...P.arrive, dx: -5, dy: 3.5, rot: 0.5, wave: 0 }], [2.6, P.arrive], [5.4, P.arrive],
  [7, P.bots], [11.6, P.bots],
  [12.6, P.aios], [17.2, P.aios],
  [18.2, P.construction], [22.8, P.construction],
  [24.4, P.outro], [26.8, P.outro],
  // Leaves towards the Sun.
  [28, { ...P.outro, dx: -5.5, dy: -3.5, rot: -0.6 }],
];

/** Chapter 2 · Moon: one project per lunar phase, each a beacon on the surface. */
export class MoonChapter implements Chapter {
  readonly id = "moon";
  readonly duration = MOON_DURATION;
  readonly beats = BEATS;

  private space = new SpaceLayer();
  private captions: CaptionBlock[];

  constructor(copy: MoonCopy) {
    this.captions = BEATS.map((b) => ({ start: b.start, end: b.end, lines: copy[b.id] }));
  }

  draw(ctx: CanvasRenderingContext2D, { t, ambient, W, H }: FrameInput, assets: Assets) {
    const portrait = W / H < 0.9;
    const view = makeView(W, H, sampleTrack(CAMERA[portrait ? "portrait" : "landscape"], t));
    const unit = depthScale(view, 0.5);

    this.space.draw(ctx, view, ambient);

    // The Earth we left behind, small and far, lit from the off-screen Sun.
    const e = SMALL_EARTH[portrait ? "portrait" : "landscape"];
    assets.earth.draw(
      ctx,
      {
        x: sx(view, e.x),
        y: sy(view, e.y),
        r: e.r * view.scale,
        lon: -20 - 0.55 * ambient - t,
        lat: 15,
        light: [-0.8, 0.25, 0.55],
        cloudShift: ambient * 0.0012,
      },
      W,
      H,
    );

    const phase = sampleTrack(PHASE, t).deg * DEG;
    const ly = 0.12;
    const ln = Math.hypot(Math.sin(phase), ly, Math.cos(phase));
    const moon: Globe = {
      x: sx(view, MOON.x),
      y: sy(view, MOON.y),
      r: MOON.r * view.scale,
      lon: -6 + t * 0.4 + Math.sin(ambient * 0.12) * 3,
      lat: 6,
      tilt: 0.08,
      light: [Math.sin(phase) / ln, ly / ln, Math.cos(phase) / ln],
    };
    assets.moon.draw(ctx, moon, W, H);

    const m = bodyToView(moon);
    let look: { x: number; y: number } | null = null;
    for (const site of SITES) {
      const badge = drawBeacon(
        ctx,
        moon,
        m,
        site.at,
        site.icon,
        site.accent,
        { age: t - site.on, exit: invLerp(site.off, site.off + 0.5, t), visited: t > site.off },
        ambient,
        unit,
      );
      if (badge && t >= site.on && t < site.off) look = badge;
    }

    look ??= t < 6 ? { x: view.W * 0.25, y: view.H * 0.6 } : { x: 0, y: view.H * 0.3 };
    drawMascot(ctx, view, POSES, MOON, t, ambient, look);
    drawCaptions(ctx, view, this.captions, t);
  }
}
