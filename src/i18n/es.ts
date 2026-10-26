import type { Dictionary } from "./types";

// Los textos en pantalla siguen la dirección de arte: mayúsculas y sin puntos finales.
const es: Dictionary = {
  meta: {
    title: "Paul Adrian Pupaza · Ingeniero de software",
    description:
      "Portafolio de Paul Adrian Pupaza, estudiante de último curso de Ingeniería de Software en Barcelona centrado en servicios backend, gestión de datos e integración de LLM.",
  },
  nav: { faq: "FAQ", languageLabel: "Idioma", scrollHint: "HAZ SCROLL PARA EXPLORAR" },
  story: {
    heading: "Paul Adrian Pupaza, ingeniero de software",
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
        { text: "BITÁCORA DE MISIONES", tone: "gold", size: "sm" },
        { text: "TRES PROYECTOS", tone: "white", size: "lg" },
        { text: "CADA FASE REVELA UNO", tone: "teal", size: "sm" },
      ],
      bots: [
        { text: "MISIÓN 01", tone: "gold", size: "sm" },
        { text: "BOTS&DRAGONS", tone: "white", size: "lg" },
        { text: "FASTAPI · PYTHON · JAVASCRIPT", tone: "teal", size: "sm" },
        { text: "UN LLM CONVIERTE EL CHAT EN MECÁNICAS DE JUEGO", tone: "teal", size: "sm" },
      ],
      aios: [
        { text: "MISIÓN 02", tone: "gold", size: "sm" },
        { text: "AI-OS", tone: "white", size: "lg" },
        { text: "RUST · TAURI · TYPESCRIPT", tone: "teal", size: "sm" },
        {
          text: "UN ASISTENTE DE ESCRITORIO QUE EJECUTA TAREAS DEL SISTEMA CON LENGUAJE NATURAL",
          tone: "teal",
          size: "sm",
        },
      ],
      construction: [
        { text: "MISIÓN 03", tone: "gold", size: "sm" },
        { text: "PLATAFORMA PARA UNA CONSTRUCTORA", tone: "white", size: "lg" },
        { text: "NEXT.JS · TYPESCRIPT · POSTGRESQL", tone: "teal", size: "sm" },
        { text: "RUTAS DE API PROTEGIDAS · VALIDACIÓN EN SERVIDOR", tone: "teal", size: "sm" },
      ],
      outro: [
        { text: "PRÓXIMA PARADA", tone: "teal", size: "sm" },
        { text: "EL SOL", tone: "white", size: "lg" },
        { text: "LO QUE ME IMPULSA", tone: "gold", size: "sm" },
      ],
    },
    sun: {
      approach: [
        { text: "MIS HERRAMIENTAS", tone: "gold", size: "sm" },
        { text: "LO QUE ME IMPULSA", tone: "white", size: "lg" },
        { text: "CUATRO ÓRBITAS DE HABILIDADES", tone: "teal", size: "sm" },
      ],
      languages: [
        { text: "LENGUAJES", tone: "gold", size: "sm" },
        { text: "PYTHON · TYPESCRIPT · RUST", tone: "white", size: "md" },
        { text: "SQL · PHP · JAVA Y C/C++ DE LA CARRERA", tone: "teal", size: "sm" },
      ],
      frameworks: [
        { text: "FRAMEWORKS Y HERRAMIENTAS", tone: "gold", size: "sm" },
        { text: "FASTAPI · NEXT.JS · NODE.JS · TAURI", tone: "white", size: "md" },
        { text: "DOCKER · GIT · ARCH LINUX", tone: "teal", size: "sm" },
      ],
      data: [
        { text: "DATOS", tone: "gold", size: "sm" },
        { text: "POSTGRESQL · MYSQL · SUPABASE", tone: "white", size: "md" },
        { text: "DISEÑO DE ESQUEMAS · VALIDACIÓN EN SERVIDOR", tone: "teal", size: "sm" },
      ],
      design: [
        { text: "DISEÑO DE SOFTWARE", tone: "gold", size: "sm" },
        { text: "ARQUITECTURA BACKEND", tone: "white", size: "md" },
        { text: "APIS REST · MVC · GESTIÓN DE ESTADO · CONCURRENCIA", tone: "teal", size: "sm" },
      ],
      finale: [
        { text: "CONSTRUYAMOS ALGO", tone: "white", size: "lg" },
        { text: "PREGUNTAS Y CONTACTO MÁS ABAJO", tone: "teal", size: "sm" },
      ],
    },
    earth: {
      intro: [
        { text: "PAUL ADRIAN PUPAZA", tone: "white", size: "xl" },
        { text: "INGENIERO DE SOFTWARE", tone: "gold", size: "md" },
        { text: "BACKEND · DATOS · INTEGRACIÓN DE LLM", tone: "teal", size: "sm" },
      ],
      home: [
        { text: "MI BASE", tone: "gold", size: "sm" },
        { text: "BARCELONA ESPAÑA", tone: "white", size: "lg" },
        { text: "AUTORIZADO PARA TRABAJAR EN TODA LA UE", tone: "teal", size: "sm" },
      ],
      study: [
        { text: "ESTUDIO EN", tone: "gold", size: "sm" },
        { text: "LA SALLE BCN", tone: "white", size: "lg" },
        { text: "INGENIERÍA DE SOFTWARE · ME GRADÚO EN JUNIO DE 2027", tone: "teal", size: "sm" },
      ],
      teach: [
        { text: "PROFESOR ASISTENTE · PROYECTOS WEB", tone: "gold", size: "sm" },
        { text: "+400 REVISIONES DE CÓDIGO", tone: "white", size: "lg" },
        { text: "CADA SEMESTRE · +22 % DE CALIDAD EN LAS ENTREGAS", tone: "teal", size: "sm" },
      ],
      languages: [
        { text: "HABLO", tone: "gold", size: "sm" },
        { text: "CUATRO IDIOMAS", tone: "white", size: "lg" },
        { text: "ESPAÑOL · CATALÁN · INGLÉS · RUMANO", tone: "teal", size: "sm" },
      ],
      outro: [
        { text: "PRÓXIMA PARADA", tone: "teal", size: "sm" },
        { text: "LA LUNA", tone: "white", size: "lg" },
        { text: "DONDE VIVEN LOS PROYECTOS", tone: "gold", size: "sm" },
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
        a: "Prácticas de ingeniería de software para el verano de 2027, sobre todo en servicios backend, datos e integración de LLM.",
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
        q: "¿Qué has construido?",
        a: "Bots&Dragons: una API REST con FastAPI que conecta un frontend en JavaScript con un backend en Python, con un LLM que convierte el chat en mecánicas de juego. AI-OS: un asistente de escritorio modular en Rust y Tauri que ejecuta tareas del sistema operativo a partir de órdenes en lenguaje natural mediante un pipeline de ejecución seguro. Una plataforma web para una constructora con Next.js, TypeScript y PostgreSQL en Supabase, con rutas de API protegidas y validación en el servidor.",
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
  contact: { title: "Escríbeme", email: "Email", linkedin: "LinkedIn", github: "GitHub" },
};

export default es;
