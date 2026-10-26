import { drawFinish } from "./finish";
import type { FrameInput } from "./view";

export interface Beat {
  id: string;
  start: number;
  end: number;
}

/** A chapter of the journey. draw() must be a pure function of its FrameInput. */
export interface Story {
  readonly duration: number;
  readonly beats: readonly Beat[];
  init(): Promise<void>;
  draw(ctx: CanvasRenderingContext2D, frame: FrameInput): void;
  dispose(): void;
}

export interface RenderOptions {
  /**
   * Shutter length in seconds. When > 0 two subframes at t ± shutter/4 are
   * blended, which is the motion blur used by the video export.
   */
  shutter?: number;
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private scratch: HTMLCanvasElement | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private story: Story,
  ) {
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("2D canvas is not available");
    this.ctx = ctx;
  }

  get width() {
    return this.canvas.width;
  }
  get height() {
    return this.canvas.height;
  }

  resize(W: number, H: number) {
    if (this.canvas.width !== W || this.canvas.height !== H) {
      this.canvas.width = W;
      this.canvas.height = H;
    }
  }

  /** seek(t): renders the frame for (t, ambient). Same inputs, same pixels. */
  render(t: number, ambient: number, { shutter = 0 }: RenderOptions = {}) {
    const { ctx } = this;
    const W = this.canvas.width;
    const H = this.canvas.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (shutter > 0) {
      const half = shutter / 4;
      this.story.draw(ctx, { t: t - half, ambient: ambient - half, W, H });
      const scratch = this.scratchCanvas(W, H);
      const sctx = scratch.getContext("2d", { alpha: false })!;
      sctx.setTransform(1, 0, 0, 1, 0, 0);
      this.story.draw(sctx, { t: t + half, ambient: ambient + half, W, H });
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.drawImage(scratch, 0, 0);
      ctx.restore();
    } else {
      this.story.draw(ctx, { t, ambient, W, H });
    }

    drawFinish(ctx, W, H, ambient);
  }

  private scratchCanvas(W: number, H: number) {
    if (!this.scratch) this.scratch = document.createElement("canvas");
    if (this.scratch.width !== W || this.scratch.height !== H) {
      this.scratch.width = W;
      this.scratch.height = H;
    }
    return this.scratch;
  }
}
