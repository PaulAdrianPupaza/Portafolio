import type { JourneyCopy } from "@/engine/story/journey";

export interface Dictionary {
  meta: { title: string; description: string };
  nav: { faq: string; languageLabel: string; scrollHint: string };
  /** Plain-text version of the journey for screen readers and search engines. */
  story: { heading: string; summary: string[] };
  /** On-screen captions for each chapter: caps, no full stops. */
  journey: JourneyCopy;
  faq: { title: string; items: { q: string; a: string }[] };
  contact: { title: string; email: string; linkedin: string; github: string };
}
