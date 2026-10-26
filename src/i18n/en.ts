import type { Dictionary } from "./types";

// On-screen captions follow the art direction: caps, no full stops.
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
        { text: "MISSION LOG", tone: "gold", size: "sm" },
        { text: "THREE PROJECTS", tone: "white", size: "lg" },
        { text: "EACH PHASE REVEALS ONE", tone: "teal", size: "sm" },
      ],
      bots: [
        { text: "MISSION 01", tone: "gold", size: "sm" },
        { text: "BOTS&DRAGONS", tone: "white", size: "lg" },
        { text: "FASTAPI · PYTHON · JAVASCRIPT", tone: "teal", size: "sm" },
        { text: "AN LLM TURNS CHAT INTO GAME MECHANICS", tone: "teal", size: "sm" },
      ],
      aios: [
        { text: "MISSION 02", tone: "gold", size: "sm" },
        { text: "AI-OS", tone: "white", size: "lg" },
        { text: "RUST · TAURI · TYPESCRIPT", tone: "teal", size: "sm" },
        { text: "A DESKTOP ASSISTANT THAT RUNS OS TASKS FROM PLAIN LANGUAGE", tone: "teal", size: "sm" },
      ],
      construction: [
        { text: "MISSION 03", tone: "gold", size: "sm" },
        { text: "CONSTRUCTION PLATFORM", tone: "white", size: "lg" },
        { text: "NEXT.JS · TYPESCRIPT · POSTGRESQL", tone: "teal", size: "sm" },
        { text: "SECURED API ROUTES · SERVER SIDE VALIDATION", tone: "teal", size: "sm" },
      ],
      outro: [
        { text: "NEXT STOP", tone: "teal", size: "sm" },
        { text: "THE SUN", tone: "white", size: "lg" },
        { text: "WHAT POWERS ME", tone: "gold", size: "sm" },
      ],
    },
    sun: {
      approach: [
        { text: "MY TOOLKIT", tone: "gold", size: "sm" },
        { text: "WHAT POWERS ME", tone: "white", size: "lg" },
        { text: "FOUR ORBITS OF SKILLS", tone: "teal", size: "sm" },
      ],
      languages: [
        { text: "LANGUAGES", tone: "gold", size: "sm" },
        { text: "PYTHON · TYPESCRIPT · RUST", tone: "white", size: "md" },
        { text: "SQL · PHP · JAVA AND C/C++ FROM COURSEWORK", tone: "teal", size: "sm" },
      ],
      frameworks: [
        { text: "FRAMEWORKS AND TOOLS", tone: "gold", size: "sm" },
        { text: "FASTAPI · NEXT.JS · NODE.JS · TAURI", tone: "white", size: "md" },
        { text: "DOCKER · GIT · ARCH LINUX", tone: "teal", size: "sm" },
      ],
      data: [
        { text: "DATA", tone: "gold", size: "sm" },
        { text: "POSTGRESQL · MYSQL · SUPABASE", tone: "white", size: "md" },
        { text: "SCHEMA DESIGN · SERVER SIDE VALIDATION", tone: "teal", size: "sm" },
      ],
      design: [
        { text: "SOFTWARE DESIGN", tone: "gold", size: "sm" },
        { text: "BACKEND ARCHITECTURE", tone: "white", size: "md" },
        { text: "REST APIS · MVC · STATE MANAGEMENT · CONCURRENCY", tone: "teal", size: "sm" },
      ],
      finale: [
        { text: "LET'S BUILD SOMETHING", tone: "white", size: "lg" },
        { text: "QUESTIONS AND CONTACT BELOW", tone: "teal", size: "sm" },
      ],
    },
    earth: {
      intro: [
        { text: "PAUL ADRIAN PUPAZA", tone: "white", size: "xl" },
        { text: "SOFTWARE ENGINEER", tone: "gold", size: "md" },
        { text: "BACKEND · DATA · LLM INTEGRATION", tone: "teal", size: "sm" },
      ],
      home: [
        { text: "HOME BASE", tone: "gold", size: "sm" },
        { text: "BARCELONA SPAIN", tone: "white", size: "lg" },
        { text: "AUTHORISED TO WORK ACROSS THE EU", tone: "teal", size: "sm" },
      ],
      study: [
        { text: "STUDYING AT", tone: "gold", size: "sm" },
        { text: "LA SALLE BCN", tone: "white", size: "lg" },
        { text: "SOFTWARE ENGINEERING · GRADUATING JUNE 2027", tone: "teal", size: "sm" },
      ],
      teach: [
        { text: "TEACHING ASSISTANT · WEB PROJECTS", tone: "gold", size: "sm" },
        { text: "400+ CODE REVIEWS", tone: "white", size: "lg" },
        { text: "EVERY SEMESTER · +22% SUBMISSION QUALITY", tone: "teal", size: "sm" },
      ],
      languages: [
        { text: "I SPEAK", tone: "gold", size: "sm" },
        { text: "FOUR LANGUAGES", tone: "white", size: "lg" },
        { text: "SPANISH · CATALAN · ENGLISH · ROMANIAN", tone: "teal", size: "sm" },
      ],
      outro: [
        { text: "NEXT STOP", tone: "teal", size: "sm" },
        { text: "THE MOON", tone: "white", size: "lg" },
        { text: "WHERE THE PROJECTS LIVE", tone: "gold", size: "sm" },
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
