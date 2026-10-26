// Every outbound link on the site lives here so the header, the story's
// call-to-action buttons and the FAQ always agree.

export const CONTACT = {
  email: "paulpupaza004@gmail.com",
  linkedin: "https://www.linkedin.com/in/paul-adrian-pupaza",
  github: "https://github.com/PaulAdrianPupaza",
} as const;

/**
 * Public path of the CV PDF (a file in `public/`), or null while there is
 * none: every CV button hides itself until this is set.
 */
export const CV_URL: string | null = "/Paul-Adrian-Pupaza-CV.pdf";

export type ProjectId = "bots" | "aios" | "construction";

/**
 * Per-project links. When a project has no repository or demo yet, its
 * buttons fall back to the GitHub profile.
 */
export const PROJECT_LINKS: Record<ProjectId, { code?: string; demo?: string }> = {
  bots: { code: "https://github.com/zigeng-zhu/BotsAndDragons" },
  aios: { code: "https://github.com/PaulAdrianPupaza/AI_OS" },
  construction: { code: "https://github.com/PaulAdrianPupaza/decoady-app" },
};
