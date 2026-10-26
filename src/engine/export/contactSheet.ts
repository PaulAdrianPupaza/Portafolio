import { Renderer, type Story } from "../core/renderer";

const LANDSCAPE = { w: 1920, h: 1080, thumbW: 480 };
const PORTRAIT = { w: 720, h: 1560, thumbW: 150 };
const PAD = 16;
const LABEL = 28;

/** The moment of each beat worth inspecting: once its captions have settled. */
const beatMoment = (start: number, end: number) => start + (end - start) * 0.55;

/**
 * Renders every beat with seek(t) into one image: a landscape grid plus a
 * portrait row, so desktop and mobile framing can be checked together.
 */
export function renderContactSheet(story: Story): HTMLCanvasElement {
  const beats = story.beats;
  const cols = 3;
  const rows = Math.ceil(beats.length / cols);
  const lThumbH = (LANDSCAPE.thumbW * LANDSCAPE.h) / LANDSCAPE.w;
  const pThumbH = (PORTRAIT.thumbW * PORTRAIT.h) / PORTRAIT.w;

  const sheet = document.createElement("canvas");
  sheet.width = PAD + cols * (LANDSCAPE.thumbW + PAD);
  sheet.height = PAD + rows * (lThumbH + LABEL + PAD) + pThumbH + LABEL + PAD;
  const ctx = sheet.getContext("2d")!;
  ctx.fillStyle = "#050c16";
  ctx.fillRect(0, 0, sheet.width, sheet.height);
  ctx.font = "600 15px system-ui, sans-serif";
  ctx.fillStyle = "#8fd8e6";

  const frame = document.createElement("canvas");
  const renderer = new Renderer(frame, story);

  renderer.resize(LANDSCAPE.w, LANDSCAPE.h);
  beats.forEach((beat, i) => {
    const t = beatMoment(beat.start, beat.end);
    renderer.render(t, t);
    const x = PAD + (i % cols) * (LANDSCAPE.thumbW + PAD);
    const y = PAD + Math.floor(i / cols) * (lThumbH + LABEL + PAD);
    ctx.fillText(`${i + 1} · ${beat.id} · t=${t.toFixed(2)}s`, x, y + 18);
    ctx.drawImage(frame, x, y + LABEL, LANDSCAPE.thumbW, lThumbH);
  });

  renderer.resize(PORTRAIT.w, PORTRAIT.h);
  const py = PAD + rows * (lThumbH + LABEL + PAD);
  const step = (sheet.width - PAD) / beats.length;
  beats.forEach((beat, i) => {
    const t = beatMoment(beat.start, beat.end);
    renderer.render(t, t);
    const x = PAD + i * step;
    ctx.fillText(`${i + 1} · mobile`, x, py + 18);
    ctx.drawImage(frame, x, py + LABEL, PORTRAIT.thumbW, pThumbH);
  });

  return sheet;
}
