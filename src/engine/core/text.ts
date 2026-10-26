// Letter-spaced text drawn glyph by glyph, so spacing works the same in every
// browser (canvas letterSpacing support is uneven) and in the video export.

let fontFamily = "sans-serif";

export function setFontFamily(family: string) {
  fontFamily = family;
}

export const font = (weight: 600 | 700, px: number) => `${weight} ${px.toFixed(2)}px ${fontFamily}`;

const widthCache = new Map<string, number>();

function glyphWidth(ctx: CanvasRenderingContext2D, ch: string) {
  const key = ctx.font + "|" + ch;
  let w = widthCache.get(key);
  if (w === undefined) {
    w = ctx.measureText(ch).width;
    widthCache.set(key, w);
  }
  return w;
}

export function spacedWidth(ctx: CanvasRenderingContext2D, text: string, spacing: number) {
  let w = 0;
  for (const ch of text) w += glyphWidth(ctx, ch) + spacing;
  return Math.max(0, w - spacing);
}

/** Draws text with its left edge at x and alphabetic baseline at y. */
export function fillSpaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) {
  let cx = x;
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += glyphWidth(ctx, ch) + spacing;
  }
}

/**
 * Greedy wrap that prefers to break at " · " separators, then at spaces.
 * Uses whatever font is currently set on ctx.
 */
export function wrapLine(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, spacing: number): string[] {
  if (spacedWidth(ctx, text, spacing) <= maxWidth) return [text];
  const sep = " · ";
  const parts = text.includes(sep) ? text.split(sep) : text.split(" ");
  const joiner = text.includes(sep) ? sep : " ";
  const lines: string[] = [];
  let current = "";
  for (const part of parts) {
    const next = current ? current + joiner + part : part;
    if (current && spacedWidth(ctx, next, spacing) > maxWidth) {
      lines.push(current);
      current = part;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.flatMap((line) =>
    joiner === sep && spacedWidth(ctx, line, spacing) > maxWidth ? wrapLine(ctx, line, maxWidth, spacing) : [line],
  );
}

export function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
