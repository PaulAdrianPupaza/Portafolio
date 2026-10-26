import type { StoryLink } from "@/components/StoryCanvas";
import type { Dictionary } from "@/i18n/types";
import { CONTACT, CV_URL, PROJECT_LINKS, type ProjectId } from "./links";

/** Contact buttons in priority order; the CV only appears once a file is set. */
export function contactLinks(dict: Dictionary): StoryLink[] {
  return [
    { label: dict.actions.email, href: `mailto:${CONTACT.email}`, primary: true },
    { label: dict.actions.linkedin, href: CONTACT.linkedin, external: true },
    { label: dict.actions.github, href: CONTACT.github, external: true },
    ...(CV_URL ? [{ label: dict.actions.cv, href: CV_URL, external: true }] : []),
  ];
}

/** Code and demo buttons for a project; without a repository yet, the GitHub profile stands in. */
export function projectLinks(dict: Dictionary, id: ProjectId): StoryLink[] {
  const { code, demo } = PROJECT_LINKS[id];
  return [
    code
      ? { label: `${dict.actions.code} ↗`, href: code, external: true, primary: true }
      : { label: `${dict.actions.github} ↗`, href: CONTACT.github, external: true, primary: true },
    ...(demo ? [{ label: `${dict.actions.demo} ↗`, href: demo, external: true }] : []),
  ];
}

/** Buttons that appear over the story while each beat is on screen. */
export function storyLinks(dict: Dictionary): Record<string, StoryLink[]> {
  return {
    "earth · intro": [
      { label: dict.nav.projects, href: "#projects", primary: true },
      ...contactLinks(dict).map((l) => ({ ...l, primary: false })),
    ],
    "moon · bots": projectLinks(dict, "bots"),
    "moon · aios": projectLinks(dict, "aios"),
    "moon · construction": projectLinks(dict, "construction"),
    "sun · finale": contactLinks(dict),
  };
}
