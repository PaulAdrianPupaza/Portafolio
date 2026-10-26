import type { EarthCopy } from "@/engine/story/earthChapter";

export interface Dictionary {
  meta: { title: string; description: string };
  nav: { faq: string; languageLabel: string; scrollHint: string };
  /** Plain-text version of the journey for screen readers and search engines. */
  story: { heading: string; summary: string[] };
  earth: EarthCopy;
  faq: { title: string; items: { q: string; a: string }[] };
  contact: { title: string; email: string; linkedin: string; github: string };
}
