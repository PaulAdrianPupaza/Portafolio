import type { Dictionary } from "./types";

// Textos en pantalla: mayúscula solo al inicio de frase y en nombres propios, sin puntos finales.
const es: Dictionary = {
  meta: {
    title: "Paul Adrian Pupaza · Estudiante de Ingeniería de Software",
    description:
      "Portafolio de Paul Adrian Pupaza, estudiante de último curso de Ingeniería de Software en Barcelona que busca prácticas de ingeniería de software. Servicios backend, gestión de datos e integración de LLM.",
  },
  nav: {
    languageLabel: "Idioma",
    chaptersLabel: "Capítulos",
    scrollHint: "DESLIZA PARA EXPLORAR",
    about: "Sobre mí",
    faq: "FAQ",
    projects: "Proyectos",
    skills: "Habilidades",
    contact: "Contacto",
  },
  actions: { email: "Email", linkedin: "LinkedIn", github: "GitHub", cv: "CV (PDF)", code: "Código", demo: "Demo" },
  projects: { bots: "Bots&Dragons", aios: "AI-OS", construction: "Plataforma para una constructora" },
  story: {
    heading: "Paul Adrian Pupaza, estudiante de último curso de Ingeniería de Software",
    summary: [
      "Estudiante de último curso de Ingeniería de Software centrado en servicios backend, gestión de datos e integración de LLM.",
      "Vive en Barcelona y tiene autorización para trabajar en la UE, incluida Irlanda.",
      "Estudia Ingeniería de Software en La Salle BCN y se gradúa en junio de 2027.",
      "Profesor asistente en Proyectos Web I y II: revisa más de 400 entregas de código por semestre y ha ayudado a mejorar su calidad un 22 %.",
      "Habla español y catalán como lenguas nativas, inglés (C1) y rumano (C1).",
      "Proyectos: Bots&Dragons, un backend de juego con FastAPI en el que un LLM convierte el chat en mecánicas de juego; AI-OS, un asistente de escritorio en Rust y Tauri que ejecuta tareas del sistema a partir de lenguaje natural; y una plataforma web para una constructora con Next.js, TypeScript y PostgreSQL.",
      "Habilidades: Python, TypeScript, Rust, SQL y PHP; FastAPI, Next.js, Node.js, Tauri, Docker y Git; PostgreSQL, MySQL y Supabase; arquitectura backend, diseño de APIs REST, MVC, gestión de estado y concurrencia.",
    ],
  },
  journey: {
    moon: {
      arrive: [
        { text: "Bitácora de misiones", tone: "gold", size: "sm" },
        { text: "Tres proyectos", tone: "white", size: "lg" },
        { text: "Cada fase revela uno", tone: "teal", size: "sm" },
      ],
      bots: [
        { text: "Misión 01", tone: "gold", size: "sm" },
        { text: "Bots&Dragons", tone: "white", size: "lg" },
        { text: "FastAPI · Python · JavaScript", tone: "teal", size: "sm" },
        { text: "Un LLM convierte el chat en mecánicas de juego", tone: "teal", size: "sm" },
      ],
      aios: [
        { text: "Misión 02", tone: "gold", size: "sm" },
        { text: "AI-OS", tone: "white", size: "lg" },
        { text: "Rust · Tauri · TypeScript", tone: "teal", size: "sm" },
        {
          text: "Un asistente de escritorio que ejecuta tareas del sistema con lenguaje natural",
          tone: "teal",
          size: "sm",
        },
      ],
      construction: [
        { text: "Misión 03", tone: "gold", size: "sm" },
        { text: "Plataforma para una constructora", tone: "white", size: "lg" },
        { text: "Next.js · TypeScript · PostgreSQL", tone: "teal", size: "sm" },
        { text: "Rutas de API protegidas · Validación en servidor", tone: "teal", size: "sm" },
      ],
      outro: [
        { text: "Próxima parada", tone: "teal", size: "sm" },
        { text: "El Sol", tone: "white", size: "lg" },
        { text: "Lo que me impulsa", tone: "gold", size: "sm" },
      ],
    },
    sun: {
      approach: [
        { text: "Mis herramientas", tone: "gold", size: "sm" },
        { text: "Lo que me impulsa", tone: "white", size: "lg" },
        { text: "Cuatro órbitas de habilidades", tone: "teal", size: "sm" },
      ],
      languages: [
        { text: "Lenguajes", tone: "gold", size: "sm" },
        { text: "Python · TypeScript · Rust", tone: "white", size: "md" },
        { text: "SQL · PHP · Java y C/C++ de la carrera", tone: "teal", size: "sm" },
      ],
      frameworks: [
        { text: "Frameworks y herramientas", tone: "gold", size: "sm" },
        { text: "FastAPI · Next.js · Node.js · Tauri", tone: "white", size: "md" },
        { text: "Docker · Git · Arch Linux", tone: "teal", size: "sm" },
      ],
      data: [
        { text: "Datos", tone: "gold", size: "sm" },
        { text: "PostgreSQL · MySQL · Supabase", tone: "white", size: "md" },
        { text: "Diseño de esquemas · Validación en servidor", tone: "teal", size: "sm" },
      ],
      design: [
        { text: "Diseño de software", tone: "gold", size: "sm" },
        { text: "Arquitectura backend", tone: "white", size: "md" },
        { text: "APIs REST · MVC · Gestión de estado · Concurrencia", tone: "teal", size: "sm" },
      ],
      finale: [
        { text: "Construyamos algo", tone: "white", size: "lg" },
        { text: "Preguntas y contacto más abajo", tone: "teal", size: "sm" },
      ],
    },
    earth: {
      intro: [
        { text: "Paul Adrian Pupaza", tone: "white", size: "xl" },
        { text: "Estudiante de último curso de Ingeniería de Software", tone: "gold", size: "md" },
        { text: "Busco prácticas de ingeniería de software", tone: "teal", size: "sm" },
      ],
      home: [
        { text: "Mi base", tone: "gold", size: "sm" },
        { text: "Barcelona, España", tone: "white", size: "lg" },
        { text: "Autorizado para trabajar en toda la UE", tone: "teal", size: "sm" },
      ],
      study: [
        { text: "Estudio en", tone: "gold", size: "sm" },
        { text: "La Salle BCN", tone: "white", size: "lg" },
        { text: "Ingeniería de Software · Me gradúo en junio de 2027", tone: "teal", size: "sm" },
      ],
      teach: [
        { text: "Profesor asistente · Proyectos Web", tone: "gold", size: "sm" },
        { text: "+400 revisiones de código", tone: "white", size: "lg" },
        { text: "Cada semestre · +22 % de calidad en las entregas", tone: "teal", size: "sm" },
      ],
      languages: [
        { text: "Hablo", tone: "gold", size: "sm" },
        { text: "Cuatro idiomas", tone: "white", size: "lg" },
        { text: "Español · Catalán · Inglés · Rumano", tone: "teal", size: "sm" },
      ],
      outro: [
        { text: "Próxima parada", tone: "teal", size: "sm" },
        { text: "La Luna", tone: "white", size: "lg" },
        { text: "Donde viven los proyectos", tone: "gold", size: "sm" },
      ],
    },
  },
  faq: {
    title: "Preguntas que me suelen hacer",
    items: [
      {
        q: "¿Quién eres?",
        a: "Soy Paul, estudiante de último curso de Ingeniería de Software en La Salle BCN, en Barcelona. Me centro en el diseño de software para servicios backend, la gestión de datos y la integración de LLM.",
      },
      {
        q: "¿Qué tipo de puesto buscas?",
        a: "Prácticas de ingeniería de software, sobre todo en servicios backend, datos e integración de LLM.",
      },
      {
        q: "¿Dónde vives? ¿Puedes trabajar en Irlanda o en otro país de la UE?",
        a: "Vivo en Barcelona. Tengo autorización para trabajar en cualquier país de la UE, incluida Irlanda, y no necesito patrocinio.",
      },
      {
        q: "¿Qué experiencia tienes?",
        a: "Desde septiembre de 2025 soy profesor asistente de Proyectos Web I y II en La Salle BCN. Reviso y califico más de 400 entregas de código por semestre de más de 100 estudiantes, les ayudo a depurar y a aplicar principios de ingeniería (lo que ha contribuido a mejorar la calidad de las entregas un 22 %) y diseño proyectos prácticos sobre APIs REST, MVC y buenas prácticas de backend.",
      },
      {
        q: "¿Qué proyectos has hecho?",
        a: "Bots&Dragons: una API REST con FastAPI que conecta un frontend en JavaScript con un backend en Python, con un LLM que convierte el chat en mecánicas de juego. AI-OS: un asistente de escritorio modular en Rust y Tauri que ejecuta tareas del sistema operativo a partir de órdenes en lenguaje natural mediante un pipeline de ejecución seguro. Una plataforma web para una constructora con Next.js, TypeScript y PostgreSQL en Supabase, con rutas de API protegidas y validación en el servidor.",
        projects: true,
      },
      {
        q: "¿Qué tecnologías usas?",
        a: "Python, JavaScript/TypeScript, Rust, SQL y PHP, además de Java y C/C++ de la carrera. FastAPI, Node.js, Next.js, Tauri, Docker, Git y Arch Linux. PostgreSQL, MySQL y Supabase.",
      },
      {
        q: "¿Qué idiomas hablas?",
        a: "Español y catalán como lenguas nativas, inglés (C1) y rumano (C1).",
      },
      {
        q: "¿Cuándo te gradúas?",
        a: "Espero terminar el grado en Ingeniería de Software en junio de 2027.",
      },
    ],
  },
  contact: { title: "Escríbeme" },
};

export default es;
