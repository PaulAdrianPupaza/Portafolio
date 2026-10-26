"use client";

import { useEffect, useRef, useState } from "react";
import { Renderer } from "@/engine/core/renderer";
import { renderContactSheet } from "@/engine/export/contactSheet";
import { exportMp4 } from "@/engine/export/mp4";
import { EARTH_DURATION, EarthChapter, type EarthCopy } from "@/engine/story/earthChapter";
import { loadCanvasFonts } from "./StoryCanvas";
import styles from "./Studio.module.css";

type Output = { url: string; name: string };

/**
 * Development-only tools: scrub any moment with seek(t), generate the
 * contact sheet of every beat, and export the chapter as a 1080p30 MP4.
 */
export function Studio({ copy, locale }: { copy: EarthCopy; locale: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const storyRef = useRef<EarthChapter | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [ready, setReady] = useState(false);
  const [t, setT] = useState(8);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [sheet, setSheet] = useState<Output | null>(null);
  const [video, setVideo] = useState<Output | null>(null);
  const [error, setError] = useState<string | null>(null);
  const duration = EARTH_DURATION;

  useEffect(() => {
    const story = new EarthChapter(copy);
    let cancelled = false;
    (async () => {
      await loadCanvasFonts();
      await story.init();
      if (cancelled) return;
      storyRef.current = story;
      const renderer = new Renderer(canvasRef.current!, story);
      renderer.resize(1920, 1080);
      rendererRef.current = renderer;
      setReady(true);
    })().catch((e) => setError(String(e)));
    return () => {
      cancelled = true;
      story.dispose();
    };
  }, [copy]);

  useEffect(() => {
    if (ready) rendererRef.current?.render(t, t);
  }, [t, ready]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setT((prev) => (prev + dt) % duration);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, duration]);

  const makeSheet = () => {
    const story = storyRef.current;
    if (!story) return;
    renderContactSheet(story).toBlob((blob) => {
      if (!blob) return;
      if (sheet) URL.revokeObjectURL(sheet.url);
      setSheet({ url: URL.createObjectURL(blob), name: `earth-contact-sheet-${locale}.png` });
    });
    rendererRef.current?.render(t, t);
  };

  const makeVideo = async () => {
    const story = storyRef.current;
    if (!story) return;
    setError(null);
    setPlaying(false);
    const abort = new AbortController();
    abortRef.current = abort;
    try {
      const blob = await exportMp4(story, {
        signal: abort.signal,
        onProgress: (done, total) => setProgress(done / total),
      });
      if (video) URL.revokeObjectURL(video.url);
      setVideo({ url: URL.createObjectURL(blob), name: `earth-${locale}-1080p30.mp4` });
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError(String(e));
    } finally {
      setProgress(null);
      abortRef.current = null;
      rendererRef.current?.render(t, t);
    }
  };

  const busy = progress !== null;

  return (
    <div className={styles.studio}>
      <h1 className={styles.title}>Studio · Earth chapter</h1>
      <canvas ref={canvasRef} className={styles.preview} />

      <div className={styles.row}>
        <button onClick={() => setPlaying((p) => !p)} disabled={!ready || busy}>
          {playing ? "Pause" : "Play"}
        </button>
        <input
          type="range"
          min={0}
          max={duration}
          step={1 / 30}
          value={t}
          onChange={(e) => setT(Number(e.target.value))}
          disabled={!ready || busy}
          aria-label="Seek"
        />
        <output className={styles.time}>{t.toFixed(2)}s</output>
      </div>

      <div className={styles.row}>
        <button onClick={makeSheet} disabled={!ready || busy}>
          Contact sheet
        </button>
        <button onClick={makeVideo} disabled={!ready || busy}>
          Export MP4 · 1920×1080 · 30 fps
        </button>
        {busy && (
          <>
            <progress value={progress ?? 0} max={1} />
            <span className={styles.time}>{Math.round((progress ?? 0) * 100)}%</span>
            <button onClick={() => abortRef.current?.abort()}>Cancel</button>
          </>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {video && (
        <section className={styles.output}>
          <a href={video.url} download={video.name}>
            Download {video.name}
          </a>
          <video src={video.url} controls className={styles.media} />
        </section>
      )}
      {sheet && (
        <section className={styles.output}>
          <a href={sheet.url} download={sheet.name}>
            Download {sheet.name}
          </a>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sheet.url} alt="Contact sheet of every beat" className={styles.media} />
        </section>
      )}
    </div>
  );
}
