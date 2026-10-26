import { clamp, easeOutCubic, invLerp, lerp, lerpDeg } from "../core/math";
import type { Beat } from "../core/renderer";
import { sampleTrack, type Key } from "../core/track";
import { depthScale, makeView, sx, sy, type Camera, type FrameInput, type View } from "../core/view";
import { drawCaptions, type CaptionBlock, type CaptionLine } from "../layers/captions";
import type { EarthGlobe } from "../layers/earth/earthGL";
import { PLACES } from "../layers/earth/geoData";
import { bodyToView, projectLonLat } from "../layers/earth/globe";
import { drawArc, drawPin } from "../layers/earth/markers";
import { OrbitSwarm } from "../layers/earth/orbitSwarm";
import { SpaceLayer } from "../layers/space";
import { SunLayer, type SunPlacement } from "../layers/sun";
import { lightFrom, type Assets, type Chapter } from "./chapter";
import { drawMascot, type Pose } from "./mascot";

export type EarthBeatId = "intro" | "home" | "study" | "teach" | "languages" | "outro";
export type EarthCopy = Record<EarthBeatId, CaptionLine[]>;

const BEATS: (Beat & { id: EarthBeatId })[] = [
  { id: "intro", start: 0.4, end: 5 },
  { id: "home", start: 6.8, end: 11.2 },
  { id: "study", start: 12, end: 16.6 },
  { id: "teach", start: 17.8, end: 22.4 },
  { id: "languages", start: 24, end: 28 },
  { id: "outro", start: 29.2, end: 31.6 },
];

export const EARTH_DURATION = 32;
const EARTH = { x: 1240, y: 560, r: 300 };

type Cam = Camera & Record<string, number>;
const CAMERA: Record<"landscape" | "portrait", Key<Cam>[]> = {
  landscape: [
    [0, { x: 960, y: 540, zoom: 1 }],
    [4.2, { x: 960, y: 540, zoom: 1 }],
    [7.4, { x: 1000, y: 560, zoom: 1.55 }],
    [16.8, { x: 1000, y: 560, zoom: 1.55 }],
    [19.2, { x: 1080, y: 560, zoom: 1.15 }],
    [22.6, { x: 1080, y: 560, zoom: 1.15 }],
    [24.6, { x: 1050, y: 520, zoom: 1.7 }],
    [28.2, { x: 1050, y: 520, zoom: 1.7 }],
    [31, { x: 1500, y: 260, zoom: 0.76 }],
    [32, { x: 1540, y: 220, zoom: 0.74 }],
  ],
  portrait: [
    [0, { x: 1240, y: 740, zoom: 1.1 }],
    [4.2, { x: 1240, y: 740, zoom: 1.1 }],
    [7.4, { x: 1240, y: 700, zoom: 1.5 }],
    [16.8, { x: 1240, y: 700, zoom: 1.5 }],
    [19.2, { x: 1240, y: 720, zoom: 1.15 }],
    [22.6, { x: 1240, y: 720, zoom: 1.15 }],
    [24.6, { x: 1240, y: 680, zoom: 1.6 }],
    [28.2, { x: 1240, y: 680, zoom: 1.6 }],
    [31, { x: 1420, y: 320, zoom: 0.68 }],
    [32, { x: 1440, y: 290, zoom: 0.66 }],
  ],
};

// Where the planet looks: free spin, then locked on Barcelona, then Europe.
const FOCUS: Key<{ w: number; lon: number; lat: number }>[] = [
  [4.6, { w: 0, lon: 2.17, lat: 32 }],
  [7.4, { w: 1, lon: 2.17, lat: 32 }],
  [22.6, { w: 1, lon: 2.17, lat: 32 }],
  [24.4, { w: 1, lon: 9, lat: 40 }],
  [28, { w: 1, lon: 9, lat: 40 }],
  [30.6, { w: 0, lon: 9, lat: 40 }],
];

const P = {
  intro: { dx: -1.55, dy: -0.45, rot: -0.15, armL: 2.5, armR: 0.35, wave: 1 },
  home: { dx: -1.12, dy: -0.66, rot: 0.18, armL: 0.5, armR: -0.95, wave: 0 },
  study: { dx: -1.12, dy: -0.66, rot: -0.12, armL: 2.9, armR: 0.2, wave: 0 },
  teach: { dx: 1.5, dy: 0.5, rot: 0.25, armL: 2.3, armR: -0.4, wave: 0.4 },
  languages: { dx: 1.08, dy: -0.68, rot: 0.16, armL: 0.95, armR: 0.3, wave: 0 },
  outro: { dx: 1.25, dy: -1.75, rot: 0.4, armL: 0.3, armR: -2.6, wave: 0 },
} satisfies Record<EarthBeatId, Pose>;

const POSES: Key<Pose>[] = [
  [0, P.intro], [5.2, P.intro],
  [7.2, P.home], [11.4, P.home],
  [12.6, P.study], [16.8, P.study],
  [18.2, P.teach], [22.6, P.teach],
  [24, P.languages], [28.2, P.languages],
  [30.2, P.outro], [30.9, P.outro],
  // Flies off towards the Moon so the next chapter can bring it back in.
  [32, { ...P.outro, dx: 5, dy: -4.5, rot: 0.6 }],
];

const PIN_IN = 7.6;
const PIN_OUT = 28.2;
const ARCS = [
  { to: PLACES.dublin, start: 24.2, color: "#8fd8e6" },
  { to: PLACES.bucharest, start: 24.6, color: "#8fd8e6" },
];
const ARC_TIME = 1.6;

/** Chapter 1 · Earth: who I am, where I study, teaching and languages. */
export class EarthChapter implements Chapter {
  readonly id = "earth";
  readonly duration = EARTH_DURATION;
  readonly beats = BEATS;

  private space = new SpaceLayer();
  private sun = new SunLayer();
  private swarm = new OrbitSwarm();
  private captions: CaptionBlock[];

  constructor(copy: EarthCopy) {
    this.captions = BEATS.map((b) => ({ start: b.start, end: b.end, lines: copy[b.id] }));
  }

  draw(ctx: CanvasRenderingContext2D, { t, ambient, W, H }: FrameInput, assets: Assets) {
    const portrait = W / H < 0.9;
    const camera = sampleTrack(CAMERA[portrait ? "portrait" : "landscape"], t);
    const view = makeView(W, H, camera);

    const sun = placeSun(view);
    const globe = placeGlobe(view, sun, t, ambient);
    const m = bodyToView(globe);
    const unit = depthScale(view, 0.5);

    this.space.draw(ctx, view, ambient);
    this.sun.draw(ctx, sun, ambient);

    const swarmCount = easeOutCubic(invLerp(17.9, 20.6, t));
    const swarmExit = invLerp(22.4, 23.3, t);
    const swarmClock = ambient * 0.6 + t * 0.4;
    this.swarm.draw(ctx, globe, swarmClock, swarmCount, swarmExit, unit, "back");

    assets.earth.draw(ctx, globe, W, H);

    const pinExit = invLerp(PIN_OUT, PIN_OUT + 0.5, t);
    drawPin(ctx, globe, m, PLACES.barcelona, t - PIN_IN, pinExit, ambient, unit, "#ffd98a");
    const arcFade = invLerp(28, 28.5, t);
    for (const arc of ARCS) {
      const progress = clamp((t - arc.start) / ARC_TIME);
      drawArc(ctx, globe, m, PLACES.barcelona, arc.to, progress, arcFade, unit, arc.color);
      drawPin(ctx, globe, m, arc.to, t - arc.start - ARC_TIME, arcFade, ambient, unit * 0.75, arc.color);
    }

    this.swarm.draw(ctx, globe, swarmClock, swarmCount, swarmExit, unit, "front");

    drawMascot(ctx, view, POSES, EARTH, t, ambient, lookTarget(view, globe, t));
    drawCaptions(ctx, view, this.captions, t);
  }
}

function lookTarget(view: View, globe: EarthGlobe, t: number) {
  const m = bodyToView(globe);
  if (t < 6) return view.portrait ? { x: view.W / 2, y: view.H * 0.78 } : { x: view.W * 0.2, y: view.H * 0.62 };
  if (t < 17.4) return projectLonLat(globe, m, PLACES.barcelona);
  if (t < 23.4) return { x: globe.x, y: globe.y + globe.r * 0.9 };
  if (t < 28.6) return projectLonLat(globe, m, [9, 47]);
  return { x: view.W, y: 0 };
}

function placeSun(view: View): SunPlacement {
  const drift = (view.camera.x - 960) * view.base * 0.06;
  if (view.portrait) {
    return { x: -drift * 0.5, y: view.H * 0.13 - (view.camera.y - 760) * view.base * 0.05, r: 300 * view.base * 0.8 };
  }
  return {
    x: -drift,
    y: view.H * 0.3 - (view.camera.y - 540) * view.base * 0.08,
    r: 300 * view.base * (1 + (view.zoom - 1) * 0.12),
  };
}

function placeGlobe(view: View, sun: SunPlacement, t: number, ambient: number): EarthGlobe {
  const focus = sampleTrack(FOCUS, t);
  const freeLon = -25 - 0.55 * ambient - 2 * t;
  const x = sx(view, EARTH.x);
  const y = sy(view, EARTH.y);
  return {
    x,
    y,
    r: EARTH.r * view.scale,
    lon: lerpDeg(freeLon, focus.lon, focus.w),
    lat: lerp(12, focus.lat, focus.w),
    // The Sun sits off to the side, slightly towards the camera, so most of
    // the visible face is lit and the night side keeps its city lights.
    light: lightFrom(sun.x, sun.y, x, y, 0.6),
    cloudShift: ambient * 0.0012 + t * 0.002,
  };
}
