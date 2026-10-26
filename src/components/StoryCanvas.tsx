"use client";

import { useEffect, useRef, useState } from "react";
import { clamp } from "@/engine/core/math";
import { Renderer } from "@/engine/core/renderer";
import { setFontFamily } from "@/engine/core/text";
import { captionBox } from "@/engine/layers/captions";
import type { GLMode } from "@/engine/layers/sphereGL";
import { CHAPTER_STARTS, JOURNEY_DURATION, Journey, type JourneyCopy } from "@/engine/story/journey";
import styles from "./StoryCanvas.module.css";

/** Viewport heights of scrolling per second of narrative time. */
const VH_PER_SECOND = 13;
/** Keeps very large screens from shading more pixels than they need. */
const MAX_PIXELS = 3.4e6;
/** A jump larger than this (seconds) cuts straight to the target instead of replaying the way there. */
const SNAP_SECONDS = 2.5;

export type ChapterId = "about" | "projects" | "skills" | "contact";

/** Where each in-story anchor lands, in narrative seconds: just after the chapter has arrived. */
const ANCHORS: Record<Exclude<ChapterId, "contact">, number> = {
  about: 0,
  projects: CHAPTER_STARTS.moon + 2.4,
  skills: CHAPTER_STARTS.sun + 2.2,
};

export interface StoryLink {
  label: string;
  href: string;
  external?: boolean;
  primary?: boolean;
}

interface Props {
  copy: JourneyCopy;
  scrollHint: string;
  chaptersLabel: string;
  chapters: { id: ChapterId; label: string }[];
  /** Buttons shown over the story while a beat is on screen, keyed by beat id (e.g. "moon · bots"). */
  links: Record<string, StoryLink[]>;
  /** Plain content shown if the canvas cannot run. */
  fallback: { heading: string; summary: string[] };
}

/**
 * Waits (briefly) for the caption font. A font that fails or is slow to load
 * must never stop the story: captions then start in the fallback font.
 */
export async function loadCanvasFonts() {
  const family = getComputedStyle(document.body).fontFamily;
  setFontFamily(family);
  try {
    await Promise.race([
      Promise.all([document.fonts.load(`600 32px ${family}`), document.fonts.load(`700 32px ${family}`)]),
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]);
  } catch (err) {
    console.warn("Caption font did not load", err);
  }
}

/** `?renderer=webgl1` or `?renderer=2d` forces a fallback path, for testing on any device. */
function requestedGLMode(): GLMode {
  const value = new URLSearchParams(window.location.search).get("renderer");
  return value === "webgl1" ? "webgl1" : value === "2d" ? "none" : "auto";
}

function chapterAt(t: number): ChapterId {
  if (t < CHAPTER_STARTS.moon) return "about";
  if (t < CHAPTER_STARTS.sun) return "projects";
  return "skills";
}

export function StoryCanvas({ copy, scrollHint, chaptersLabel, chapters, links, fallback }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [atTop, setAtTop] = useState(true);
  /** Error message when the animation could not run; the plain-text version shows instead. */
  const [failed, setFailed] = useState<string | null>(null);
  const [chapter, setChapter] = useState<ChapterId>("about");
  const [activeBeat, setActiveBeat] = useState<string | null>("earth · intro");

  useEffect(() => {
    const section = sectionRef.current!;
    const canvas = canvasRef.current!;
    const stage = canvas.parentElement!;
    const story = new Journey(copy);
    const linkedBeats = story.beats.filter((b) => links[b.id]);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let renderer: Renderer | null = null;
    let disposed = false;
    let visible = true;
    let raf = 0;
    let t = 0;
    let last = performance.now();
    let shownChapter: ChapterId = "about";
    let shownBeat: string | null = "earth · intro";
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
      if (!(span > 0)) return 0;
      return clamp(-rect.top / span) * story.duration;
    };

    const syncOverlay = () => {
      const nextChapter = visible ? chapterAt(t) : "contact";
      if (nextChapter !== shownChapter) setChapter((shownChapter = nextChapter));
      const beat = linkedBeats.find((b) => t >= b.start && t <= b.end)?.id ?? null;
      if (beat !== shownBeat) setActiveBeat((shownBeat = beat));
    };

    // Any failure shows the plain-text version, with the error so it can be reported.
    const fail = (err: unknown) => {
      console.error("Story failed", err);
      if (!disposed) setFailed(err instanceof Error ? `${err.name}: ${err.message}` : String(err));
    };

    const frame = (now: number) => {
      if (!renderer || !visible) {
        raf = 0;
        return;
      }
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const goal = scrollTime();
      const snap = reduceMotion || Math.abs(goal - t) > SNAP_SECONDS;
      t = snap ? goal : t + (goal - t) * (1 - Math.exp(-dt * 6));
      try {
        renderer.render(t, reduceMotion ? 0 : (now - start) / 1000, { calm: reduceMotion });
      } catch (err) {
        renderer = null;
        raf = 0;
        fail(err);
        return;
      }
      // Buttons follow the real bottom of the captions, which depends on how
      // many lines the current language needed.
      stage.style.setProperty("--captions-bottom", `${(captionBox.bottom / captionBox.canvasHeight) * 100}%`);
      syncOverlay();
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
      syncOverlay();
      wake();
    });
    observer.observe(section);

    const onScroll = () => setAtTop(window.scrollY < 40);
    onScroll(); // a reload or deep link can start mid-page
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });

    (async () => {
      await loadCanvasFonts();
      await story.init(requestedGLMode());
      if (disposed) return;
      renderer = new Renderer(canvas, story);
      canvas.dataset.renderer = story.renderer ?? "";
      resize();
      t = scrollTime();
      wake();
    })().catch(fail);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      story.dispose();
    };
  }, [copy, links]);

  const fallbackContent = (
    <div className={styles.fallback}>
      <p className={styles.fallbackHeading}>{fallback.heading}</p>
      {fallback.summary.map((line) => (
        <p key={line}>{line}</p>
      ))}
      {failed && <p className={styles.fallbackError}>{failed}</p>}
    </div>
  );
  const beatLinks = activeBeat ? links[activeBeat] : undefined;

  return (
    <section
      ref={sectionRef}
      className={styles.story}
      style={{ height: `calc(${JOURNEY_DURATION * VH_PER_SECOND}vh + 100vh)` }}
    >
      <div className={styles.stage}>
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
        {failed && fallbackContent}
        <noscript>{fallbackContent}</noscript>

        {!failed && beatLinks && (
          <div key={activeBeat} className={styles.actions}>
            {beatLinks.map((link) => (
              <a
                key={link.href + link.label}
                href={link.href}
                className={link.primary ? styles.primary : styles.action}
                {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        <p className={styles.hint} data-hidden={!atTop} aria-hidden="true">
          {scrollHint}
        </p>
      </div>

      {(Object.keys(ANCHORS) as (keyof typeof ANCHORS)[]).map((id) => (
        <span key={id} id={id} className={styles.anchor} style={{ top: `${ANCHORS[id] * VH_PER_SECOND}vh` }} />
      ))}

      <nav className={styles.chapters} aria-label={chaptersLabel} data-section={chapter}>
        {chapters.map((c) => (
          <a key={c.id} href={`#${c.id}`} aria-current={c.id === chapter ? "step" : undefined}>
            <span className={styles.chapterLabel}>{c.label}</span>
            <span className={styles.dot} aria-hidden="true" />
          </a>
        ))}
      </nav>
    </section>
  );
}
