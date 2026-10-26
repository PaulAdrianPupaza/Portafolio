import { Renderer, type Story } from "../core/renderer";

const LANDSCAPE = { w: 1920, h: 1080, cols: 4, thumbW: 400 };
const PORTRAIT = { w: 720, h: 1560, cols: 9 };
const PAD = 16;
const LABEL = 26;

/** The moment of each beat worth inspecting: once its captions have settled. */
const beatMoment = (start: number, end: number) => start + (end - start) * 0.55;

/**
 * Renders every beat with seek(t) into one image: a landscape grid followed
 * by a portrait grid, so desktop and mobile framing can be checked together.
 */
export function renderContactSheet(story: Story): HTMLCanvasElement {
  const beats = story.beats;
  const width = PAD + LANDSCAPE.cols * (LANDSCAPE.thumbW + PAD);
  const lThumbH = (LANDSCAPE.thumbW * LANDSCAPE.h) / LANDSCAPE.w;
  const lRows = Math.ceil(beats.length / LANDSCAPE.cols);
  const pThumbW = (width - PAD) / PORTRAIT.cols - PAD;
  const pThumbH = (pThumbW * PORTRAIT.h) / PORTRAIT.w;
  const pRows = Math.ceil(beats.length / PORTRAIT.cols);
  const portraitTop = PAD + lRows * (lThumbH + LABEL + PAD);

  const sheet = document.createElement("canvas");
  sheet.width = width;
  sheet.height = portraitTop + pRows * (pThumbH + LABEL + PAD);
  const ctx = sheet.getContext("2d")!;
  ctx.fillStyle = "#050c16";
  ctx.fillRect(0, 0, sheet.width, sheet.height);
  ctx.font = "600 14px system-ui, sans-serif";
  ctx.fillStyle = "#8fd8e6";

  const frame = document.createElement("canvas");
  const renderer = new Renderer(frame, story);

  renderer.resize(LANDSCAPE.w, LANDSCAPE.h);
  beats.forEach((beat, i) => {
    const t = beatMoment(beat.start, beat.end);
    renderer.render(t, t);
    const x = PAD + (i % LANDSCAPE.cols) * (LANDSCAPE.thumbW + PAD);
    const y = PAD + Math.floor(i / LANDSCAPE.cols) * (lThumbH + LABEL + PAD);
    ctx.fillText(`${i + 1} · ${beat.id} · t=${t.toFixed(2)}s`, x, y + 17);
    ctx.drawImage(frame, x, y + LABEL, LANDSCAPE.thumbW, lThumbH);
  });

  renderer.resize(PORTRAIT.w, PORTRAIT.h);
  beats.forEach((beat, i) => {
    const t = beatMoment(beat.start, beat.end);
    renderer.render(t, t);
    const x = PAD + (i % PORTRAIT.cols) * (pThumbW + PAD);
    const y = portraitTop + Math.floor(i / PORTRAIT.cols) * (pThumbH + LABEL + PAD);
    ctx.fillText(`${i + 1} · mobile`, x, y + 17);
    ctx.drawImage(frame, x, y + LABEL, pThumbW, pThumbH);
  });

  return sheet;
}
