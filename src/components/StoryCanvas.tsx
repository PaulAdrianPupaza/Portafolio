"use client";

import { useEffect, useRef, useState } from "react";
import { clamp } from "@/engine/core/math";
import { Renderer } from "@/engine/core/renderer";
import { setFontFamily } from "@/engine/core/text";
import { EARTH_DURATION, EarthChapter, type EarthCopy } from "@/engine/story/earthChapter";
import styles from "./StoryCanvas.module.css";

/** Viewport heights of scrolling per second of narrative time. */
const VH_PER_SECOND = 30;
/** Keeps very large screens from shading more pixels than they need. */
const MAX_PIXELS = 3.4e6;

export async function loadCanvasFonts() {
  const family = getComputedStyle(document.body).fontFamily;
  setFontFamily(family);
  await Promise.all([document.fonts.load(`600 32px ${family}`), document.fonts.load(`700 32px ${family}`)]);
}

export function StoryCanvas({ copy, scrollHint }: { copy: EarthCopy; scrollHint: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    const section = sectionRef.current!;
    const canvas = canvasRef.current!;
    const story = new EarthChapter(copy);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let renderer: Renderer | null = null;
    let disposed = false;
    let visible = true;
    let raf = 0;
    let t = 0;
    let last = performance.now();
    const start = last;

    const resize = () => {
      if (!renderer) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth * dpr;
      const h = window.innerHeight * dpr;
      const k = Math.min(1, Math.sqrt(MAX_PIXELS / (w * h)));
      renderer.resize(Math.round(w * k), Math.round(h * k));
    };

    // Scroll position within the section maps linearly onto narrative time.
    const scrollTime = () => {
      const rect = section.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      return clamp(-rect.top / span) * story.duration;
    };

    const frame = (now: number) => {
      if (!renderer || !visible) {
        raf = 0;
        return;
      }
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const goal = scrollTime();
      t = reduceMotion ? goal : t + (goal - t) * (1 - Math.exp(-dt * 6));
      renderer.render(t, reduceMotion ? 0 : (now - start) / 1000);
      raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (!raf && renderer && visible) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      wake();
    });
    observer.observe(section);

    const onScroll = () => setAtTop(window.scrollY < 40);
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });

    (async () => {
      await loadCanvasFonts();
      await story.init();
      if (disposed) return;
      renderer = new Renderer(canvas, story);
      resize();
      t = scrollTime();
      wake();
    })().catch((err) => console.error("Story failed to start", err));

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      story.dispose();
    };
  }, [copy]);

  return (
    <section ref={sectionRef} className={styles.story} style={{ height: `calc(${EARTH_DURATION * VH_PER_SECOND}vh + 100vh)` }}>
      <div className={styles.stage}>
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
        <p className={styles.hint} data-hidden={!atTop} aria-hidden="true">
          {scrollHint}
        </p>
      </div>
    </section>
  );
}
