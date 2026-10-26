import { easeOutQuint, clamp } from "../core/math";
import { fillSpaced, font, roundRectPath, spacedWidth, wrapLine } from "../core/text";
import type { View } from "../core/view";

export type Tone = "white" | "teal" | "gold";
export type Size = "xl" | "lg" | "md" | "sm";

export interface CaptionLine {
  text: string;
  tone: Tone;
  size: Size;
}

export interface CaptionBlock {
  start: number;
  end: number;
  lines: CaptionLine[];
}

const TONES: Record<Tone, string> = { white: "#ffffff", teal: "#8fd8e6", gold: "#ffd98a" };

// Design-unit font sizes and letter spacing. Captions are sentence case, so
// the tracking is lighter than it would be for all caps.
const SIZES: Record<Size, { px: number; weight: 600 | 700; spacing: number; portrait: number }> = {
  // Small enough on phones that the name fits on one line.
  xl: { px: 74, weight: 700, spacing: 2, portrait: 0.95 },
  lg: { px: 58, weight: 700, spacing: 1.5, portrait: 1.35 },
  md: { px: 34, weight: 600, spacing: 1.2, portrait: 1.45 },
  sm: { px: 24, weight: 600, spacing: 1, portrait: 1.6 },
};

const PILL = "rgba(6,20,40,0.62)";
const RISE = 1.3;
const IN_DURATION = 0.6;
const OUT_DURATION = 0.45;
const STAGGER = 0.12;

interface LaidOutLine {
  text: string;
  color: string;
  px: number;
  weight: 600 | 700;
  spacing: number;
  w: number;
  h: number;
}

/**
 * Where the most recently drawn caption block ended, in canvas pixels. The page
 * reads it to place HTML buttons right under the captions, however many lines
 * the current language wraps them into.
 */
export const captionBox = { bottom: 0, canvasHeight: 1 };

/**
 * Captions sit in rounded pills. Each line rises 1.3× its own height
 * through a clip (ease-out-quint) on the way in, and rises out on the way out.
 * Pill and text share one envelope, so a pill is never shown empty and a
 * half-clipped word never lingers between scenes.
 * Returns the screen centre of the block, or null when nothing is on screen.
 */
export function drawCaptions(ctx: CanvasRenderingContext2D, view: View, blocks: CaptionBlock[], t: number) {
  const block = blocks.find((b) => t >= b.start && t <= b.end + OUT_DURATION);
  if (!block) return null;

  const maxWidth = view.portrait ? view.W * 0.88 : view.W * 0.5;
  const lines: LaidOutLine[] = [];
  for (const line of block.lines) {
    const spec = SIZES[line.size];
    const px = spec.px * view.base * (view.portrait ? spec.portrait : 1);
    const spacing = spec.spacing * view.base;
    ctx.font = font(spec.weight, px);
    const padX = px * 0.6;
    for (const text of wrapLine(ctx, line.text, maxWidth - padX * 2, spacing)) {
      const w = spacedWidth(ctx, text, spacing) + padX * 2;
      lines.push({ text, color: TONES[line.tone], px, weight: spec.weight, spacing, w, h: px * 1.5 });
    }
  }

  const gap = 12 * view.base;
  const blockH = lines.reduce((sum, l) => sum + l.h, 0) + gap * (lines.length - 1);
  let top = view.portrait ? view.H * 0.7 : view.H * 0.6 - blockH / 2;
  // Stay clear of the bottom edge (browser toolbars and the scroll hint).
  if (view.portrait) top = Math.min(top, view.H * 0.88 - blockH);
  captionBox.bottom = top + blockH;
  captionBox.canvasHeight = view.H;

  let y = top;
  lines.forEach((line, i) => {
    const inStart = block.start + i * STAGGER;
    const outStart = block.end - OUT_DURATION + i * 0.03;
    const pIn = easeOutQuint((t - inStart) / IN_DURATION);
    const pOut = Math.pow(clamp((t - outStart) / OUT_DURATION), 3);
    const presence = pIn * (1 - pOut);
    if (t >= inStart && presence > 0.01) {
      const x = view.portrait ? (view.W - line.w) / 2 : view.W * 0.07;
      const pillW = line.w * (0.7 + 0.3 * presence);
      const pillX = view.portrait ? x + (line.w - pillW) / 2 : x;
      ctx.save();
      ctx.globalAlpha = presence;
      roundRectPath(ctx, pillX, y, pillW, line.h, line.h / 2);
      ctx.fillStyle = PILL;
      ctx.fill();
      ctx.clip();
      const rise = (1 - pIn) * RISE * line.h - pOut * RISE * line.h;
      ctx.font = font(line.weight, line.px);
      ctx.fillStyle = line.color;
      ctx.textBaseline = "alphabetic";
      fillSpaced(ctx, line.text, x + line.px * 0.6, y + line.h / 2 + line.px * 0.35 + rise, line.spacing);
      ctx.restore();
    }
    y += line.h + gap;
  });

  return {
    x: view.portrait ? view.W / 2 : view.W * 0.07 + maxWidth * 0.4,
    y: top + blockH / 2,
  };
}
