import { ArrayBufferTarget, Muxer } from "mp4-muxer";
import { Renderer, type Story } from "../core/renderer";

export interface ExportOptions {
  width?: number;
  height?: number;
  fps?: number;
  /** Shutter as a fraction of the frame interval; 0.5 is a 180° shutter. */
  shutter?: number;
  bitrate?: number;
  onProgress?: (done: number, total: number) => void;
  signal?: AbortSignal;
}

const CODECS = ["avc1.640028", "avc1.4d0028", "avc1.42e028"];

async function pickCodec(config: Omit<VideoEncoderConfig, "codec">) {
  for (const codec of CODECS) {
    const { supported } = await VideoEncoder.isConfigSupported({ ...config, codec });
    if (supported) return codec;
  }
  throw new Error("This browser cannot encode H.264 video (WebCodecs)");
}

/**
 * Renders the story frame by frame with seek(t) — ambient time equals story
 * time, so the result is fully deterministic — and encodes an H.264 MP4 in
 * the browser with WebCodecs. Each frame blends two subframes (motion blur).
 */
export async function exportMp4(story: Story, opts: ExportOptions = {}): Promise<Blob> {
  const { width = 1920, height = 1080, fps = 30, shutter = 0.5, bitrate = 16_000_000, onProgress, signal } = opts;
  if (typeof VideoEncoder === "undefined") throw new Error("WebCodecs is not available in this browser");

  const base = { width, height, bitrate, framerate: fps };
  const codec = await pickCodec(base);
  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: "avc", width, height, frameRate: fps },
    fastStart: "in-memory",
  });

  let failure: unknown = null;
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => (failure = e),
  });
  encoder.configure({ ...base, codec });

  const canvas = document.createElement("canvas");
  const renderer = new Renderer(canvas, story);
  renderer.resize(width, height);

  const total = Math.round(story.duration * fps);
  const frameUs = 1e6 / fps;
  for (let i = 0; i < total; i++) {
    if (signal?.aborted) throw new DOMException("Export cancelled", "AbortError");
    if (failure) throw failure;
    const t = i / fps;
    renderer.render(t, t, { shutter: shutter / fps });
    const frame = new VideoFrame(canvas, { timestamp: Math.round(i * frameUs), duration: Math.round(frameUs) });
    encoder.encode(frame, { keyFrame: i % (fps * 2) === 0 });
    frame.close();
    onProgress?.(i + 1, total);
    // Back-pressure: let the encoder drain and keep the page responsive.
    while (encoder.encodeQueueSize > 4) await new Promise((r) => setTimeout(r, 4));
    if (i % 10 === 0) await new Promise((r) => setTimeout(r, 0));
  }

  await encoder.flush();
  encoder.close();
  if (failure) throw failure;
  muxer.finalize();
  return new Blob([muxer.target.buffer], { type: "video/mp4" });
}
