import { clamp, smoothstep } from "../core/math";
import type { Beat, Story } from "../core/renderer";
import type { FrameInput } from "../core/view";
import { EarthGL } from "../layers/earth/earthGL";
import { MoonGL } from "../layers/moon/moonGL";
import type { Assets, Chapter } from "./chapter";
import { EARTH_DURATION, EarthChapter, type EarthCopy } from "./earthChapter";
import { MOON_DURATION, MoonChapter, type MoonCopy } from "./moonChapter";
import { SUN_DURATION, SunChapter, type SunCopy } from "./sunChapter";

export interface JourneyCopy {
  earth: EarthCopy;
  moon: MoonCopy;
  sun: SunCopy;
}

/** Seconds during which one chapter dissolves into the next. */
const OVERLAP = 1.2;

export const JOURNEY_DURATION = EARTH_DURATION + MOON_DURATION + SUN_DURATION - 2 * OVERLAP;

/** Global start time of each chapter, for anchors and chapter navigation. */
export const CHAPTER_STARTS = {
  earth: 0,
  moon: EARTH_DURATION - OVERLAP,
  sun: EARTH_DURATION + MOON_DURATION - 2 * OVERLAP,
} as const;

/**
 * Earth → Moon → Sun on a single timeline. Each chapter gets its own local
 * time; where two chapters overlap the next one is blended over the last.
 */
export class Journey implements Story {
  readonly duration = JOURNEY_DURATION;
  readonly beats: Beat[];

  private chapters: { chapter: Chapter; start: number }[];
  private assets: Assets | null = null;
  private scratch: HTMLCanvasElement | null = null;

  constructor(copy: JourneyCopy) {
    const list: Chapter[] = [new EarthChapter(copy.earth), new MoonChapter(copy.moon), new SunChapter(copy.sun)];
    let start = 0;
    this.chapters = list.map((chapter) => {
      const entry = { chapter, start };
      start += chapter.duration - OVERLAP;
      return entry;
    });
    this.beats = this.chapters.flatMap(({ chapter, start }) =>
      chapter.beats.map((b) => ({ id: `${chapter.id} · ${b.id}`, start: start + b.start, end: start + Math.min(b.end, chapter.duration) })),
    );
  }

  async init() {
    this.assets ??= { earth: new EarthGL(), moon: new MoonGL() };
  }

  dispose() {
    this.assets?.earth.dispose();
    this.assets?.moon.dispose();
    this.assets = null;
  }

  draw(ctx: CanvasRenderingContext2D, frame: FrameInput) {
    const assets = this.assets;
    if (!assets) return;
    // A NaN time (e.g. scroll measured before layout) must never leave the frame empty.
    const t = Number.isFinite(frame.t) ? clamp(frame.t, 0, this.duration) : 0;
    const active = this.chapters.filter(({ chapter, start }) => t >= start && t <= start + chapter.duration);
    const [first = this.chapters[0], second] = active;
    first.chapter.draw(ctx, { ...frame, t: t - first.start }, assets);
    if (!second) return;

    const scratch = this.scratchCanvas(frame.W, frame.H);
    const sctx = scratch.getContext("2d", { alpha: false })!;
    sctx.setTransform(1, 0, 0, 1, 0, 0);
    second.chapter.draw(sctx, { ...frame, t: t - second.start }, assets);
    ctx.save();
    ctx.globalAlpha = smoothstep(second.start, first.start + first.chapter.duration, t);
    ctx.drawImage(scratch, 0, 0);
    ctx.restore();
  }

  private scratchCanvas(W: number, H: number) {
    this.scratch ??= document.createElement("canvas");
    if (this.scratch.width !== W || this.scratch.height !== H) {
      this.scratch.width = W;
      this.scratch.height = H;
    }
    return this.scratch;
  }
}
