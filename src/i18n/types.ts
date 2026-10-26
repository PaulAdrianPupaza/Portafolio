import type { ProjectId } from "@/content/links";
import type { JourneyCopy } from "@/engine/story/journey";

export interface Dictionary {
  meta: { title: string; description: string };
  nav: {
    languageLabel: string;
    chaptersLabel: string;
    scrollHint: string;
    about: string;
    faq: string;
    projects: string;
    skills: string;
    contact: string;
  };
  /** Labels for buttons that leave the page. */
  actions: { email: string; linkedin: string; github: string; cv: string; code: string; demo: string };
  projects: Record<ProjectId, string>;
  /** Plain-text version of the journey for screen readers, search engines and the no-canvas fallback. */
  story: { heading: string; summary: string[] };
  /** On-screen captions for each chapter: sentence case, no full stops. */
  journey: JourneyCopy;
  /** `projects: true` adds the project link buttons under that answer. */
  faq: { title: string; items: { q: string; a: string; projects?: boolean }[] };
  contact: { title: string };
}
