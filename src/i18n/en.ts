import type { Dictionary } from "./types";

// On-screen captions: sentence case (capitals only for sentence starts and names), no full stops.
const en: Dictionary = {
  meta: {
    title: "Paul Adrian Pupaza · Software Engineer",
    description:
      "Portfolio of Paul Adrian Pupaza, final-year Software Engineering student in Barcelona focused on backend services, data handling and LLM integration.",
  },
  nav: { faq: "FAQ", languageLabel: "Language", scrollHint: "SCROLL TO EXPLORE" },
  story: {
    heading: "Paul Adrian Pupaza, Software Engineer",
    summary: [
      "Final-year Software Engineering student focused on backend services, data handling and LLM integration.",
      "Based in Barcelona, Spain, and authorised to work in the EU, including Ireland.",
      "Studying Software Engineering at La Salle BCN, graduating in June 2027.",
      "Teaching Assistant in Web Projects I and II: reviews over 400 code submissions per semester and helped raise submission quality by 22%.",
      "Speaks Spanish and Catalan natively, English at C1 and Romanian at C1.",
      "Projects: Bots&Dragons, a FastAPI game backend where an LLM turns chat into game mechanics; AI-OS, a Rust and Tauri desktop assistant that runs OS tasks from natural language; and a construction company web platform built with Next.js, TypeScript and PostgreSQL.",
      "Skills: Python, TypeScript, Rust, SQL and PHP; FastAPI, Next.js, Node.js, Tauri, Docker and Git; PostgreSQL, MySQL and Supabase; backend architecture, REST API design, MVC, state management and concurrency.",
    ],
  },
  journey: {
    moon: {
      arrive: [
        { text: "Mission log", tone: "gold", size: "sm" },
        { text: "Three projects", tone: "white", size: "lg" },
        { text: "Each phase reveals one", tone: "teal", size: "sm" },
      ],
      bots: [
        { text: "Mission 01", tone: "gold", size: "sm" },
        { text: "Bots&Dragons", tone: "white", size: "lg" },
        { text: "FastAPI · Python · JavaScript", tone: "teal", size: "sm" },
        { text: "An LLM turns chat into game mechanics", tone: "teal", size: "sm" },
      ],
      aios: [
        { text: "Mission 02", tone: "gold", size: "sm" },
        { text: "AI-OS", tone: "white", size: "lg" },
        { text: "Rust · Tauri · TypeScript", tone: "teal", size: "sm" },
        { text: "A desktop assistant that runs OS tasks from plain language", tone: "teal", size: "sm" },
      ],
      construction: [
        { text: "Mission 03", tone: "gold", size: "sm" },
        { text: "Construction platform", tone: "white", size: "lg" },
        { text: "Next.js · TypeScript · PostgreSQL", tone: "teal", size: "sm" },
        { text: "Secured API routes · Server-side validation", tone: "teal", size: "sm" },
      ],
      outro: [
        { text: "Next stop", tone: "teal", size: "sm" },
        { text: "The Sun", tone: "white", size: "lg" },
        { text: "What powers me", tone: "gold", size: "sm" },
      ],
    },
    sun: {
      approach: [
        { text: "My toolkit", tone: "gold", size: "sm" },
        { text: "What powers me", tone: "white", size: "lg" },
        { text: "Four orbits of skills", tone: "teal", size: "sm" },
      ],
      languages: [
        { text: "Languages", tone: "gold", size: "sm" },
        { text: "Python · TypeScript · Rust", tone: "white", size: "md" },
        { text: "SQL · PHP · Java and C/C++ from coursework", tone: "teal", size: "sm" },
      ],
      frameworks: [
        { text: "Frameworks and tools", tone: "gold", size: "sm" },
        { text: "FastAPI · Next.js · Node.js · Tauri", tone: "white", size: "md" },
        { text: "Docker · Git · Arch Linux", tone: "teal", size: "sm" },
      ],
      data: [
        { text: "Data", tone: "gold", size: "sm" },
        { text: "PostgreSQL · MySQL · Supabase", tone: "white", size: "md" },
        { text: "Schema design · Server-side validation", tone: "teal", size: "sm" },
      ],
      design: [
        { text: "Software design", tone: "gold", size: "sm" },
        { text: "Backend architecture", tone: "white", size: "md" },
        { text: "REST APIs · MVC · State management · Concurrency", tone: "teal", size: "sm" },
      ],
      finale: [
        { text: "Let's build something", tone: "white", size: "lg" },
        { text: "Questions and contact below", tone: "teal", size: "sm" },
      ],
    },
    earth: {
      intro: [
        { text: "Paul Adrian Pupaza", tone: "white", size: "xl" },
        { text: "Software engineer", tone: "gold", size: "md" },
        { text: "Backend · Data · LLM integration", tone: "teal", size: "sm" },
      ],
      home: [
        { text: "Home base", tone: "gold", size: "sm" },
        { text: "Barcelona, Spain", tone: "white", size: "lg" },
        { text: "Authorised to work across the EU", tone: "teal", size: "sm" },
      ],
      study: [
        { text: "Studying at", tone: "gold", size: "sm" },
        { text: "La Salle BCN", tone: "white", size: "lg" },
        { text: "Software Engineering · Graduating in June 2027", tone: "teal", size: "sm" },
      ],
      teach: [
        { text: "Teaching assistant · Web Projects", tone: "gold", size: "sm" },
        { text: "400+ code reviews", tone: "white", size: "lg" },
        { text: "Every semester · +22% submission quality", tone: "teal", size: "sm" },
      ],
      languages: [
        { text: "I speak", tone: "gold", size: "sm" },
        { text: "Four languages", tone: "white", size: "lg" },
        { text: "Spanish · Catalan · English · Romanian", tone: "teal", size: "sm" },
      ],
      outro: [
        { text: "Next stop", tone: "teal", size: "sm" },
        { text: "The Moon", tone: "white", size: "lg" },
        { text: "Where the projects live", tone: "gold", size: "sm" },
      ],
    },
  },
  faq: {
    title: "Questions people ask me",
    items: [
      {
        q: "Who are you?",
        a: "I'm Paul, a final-year Software Engineering student at La Salle BCN in Barcelona. I focus on software design for backend services, data handling and LLM integration.",
      },
      {
        q: "What kind of role are you looking for?",
        a: "Software engineering internships for summer 2027, especially work on backend services, data and LLM integration.",
      },
      {
        q: "Where are you based, and can you work in Ireland or elsewhere in the EU?",
        a: "I'm based in Barcelona. I'm authorised to work anywhere in the EU, including Ireland, and I don't need sponsorship.",
      },
      {
        q: "What experience do you have?",
        a: "Since September 2025 I've been a Teaching Assistant for Web Projects I and II at La Salle BCN. I review and grade over 400 code submissions per semester for 100+ students, help them debug and apply engineering principles (contributing to a 22% increase in submission quality), and design practical projects around REST APIs, MVC and backend best practices.",
      },
      {
        q: "What have you built?",
        a: "Bots&Dragons: a FastAPI REST API connecting a JavaScript frontend to a Python backend, with an LLM that turns chat input into game mechanics. AI-OS: a modular desktop assistant in Rust and Tauri that carries out OS-level tasks from natural-language commands through a secure execution pipeline. A construction company web platform built with Next.js, TypeScript and PostgreSQL on Supabase, with secured API routes and server-side validation.",
      },
      {
        q: "Which technologies do you use?",
        a: "Python, JavaScript/TypeScript, Rust, SQL and PHP, plus Java and C/C++ from coursework. FastAPI, Node.js, Next.js, Tauri, Docker, Git and Arch Linux. PostgreSQL, MySQL and Supabase.",
      },
      {
        q: "Which languages do you speak?",
        a: "Spanish and Catalan natively, English at C1 and Romanian at C1.",
      },
      {
        q: "When do you graduate?",
        a: "I expect to finish my Bachelor in Software Engineering in June 2027.",
      },
    ],
  },
  contact: { title: "Say hello", email: "Email", linkedin: "LinkedIn", github: "GitHub" },
};

export default en;
