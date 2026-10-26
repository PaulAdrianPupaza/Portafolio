# Crítica de diseño: portfolio de Paul Adrian Pupaza

Revisión de caja negra: solo he mirado el sitio en marcha, como lo vería un visitante. No he leído el código fuente.

- **URL revisada:** `http://localhost:3001/en` y `/es` (servidor de desarrollo)
- **Vistas:** escritorio 1440×900 y móvil 375×812, en inglés y en español
- **Audiencia de referencia:** recruiters y equipos técnicos que revisan candidaturas de prácticas para verano de 2027

> **Límites de la prueba.** El navegador que usé tenía el panel oculto, así que reducía la animación a unos 1,5 fps. Para ver los fotogramas tal como los vería un visitante, forcé el bucle de animación a unos 33 fps desde la consola. Por eso **no doy cifras de rendimiento** (fps, tiempos de carga): además, es un servidor de desarrollo. Las posiciones de scroll se refieren a escritorio 1440×900, donde la historia ocupa unos 18 245 px (unas 20 pantallas) y la FAQ empieza en 18 245 px. En móvil la página mide unos 17 470 px.

---

## Impresión general

La parte visual es lo mejor del sitio. Las ilustraciones son originales y coherentes, la paleta está muy cuidada y el astronauta tiene encanto. Se nota oficio y criterio, y eso ya es una señal positiva para un recruiter. El mayor problema es que **la historia se impone a la información**. Al cargar, la pantalla no dice quién eres. Lo importante (proyectos, CV, contacto) está repartido en unas 20 pantallas de scroll, sin forma de saltar, y los proyectos no enlazan a nada. Un recruiter dedica de 30 a 60 segundos a un portfolio. Ahora mismo, en ese tiempo ve una Tierra muy bonita y poco más.

---

## 🔴 Crítico

### C1. La primera pantalla no dice quién eres
- **Dónde:** al cargar (scroll 0), en escritorio y en móvil, en los dos idiomas.
- **Qué pasa:** solo se ven el Sol, la Tierra, el astronauta y la píldora «Scroll to explore». El nombre, «Software engineer» y «Backend · Data · LLM integration» aparecen al bajar unos 300 px. El `<h1>` existe, pero es solo para lectores de pantalla.
- **Por qué importa:** la regla de los 10 segundos falla en el segundo 0. Un recruiter que no hace scroll (o que lo ve como miniatura en LinkedIn o en un ATS) no sabe de quién es la web ni qué busca.
- **Propuesta:** muestra el bloque del nombre ya en el fotograma 0. La animación puede arrancar con el texto visible. Añade una línea con lo que buscas («Software Engineering student · Internship, summer 2027») y dos acciones visibles: **Download CV** y **Email**.

### C2. No hay pruebas de trabajo enlazables ni CV
- **Dónde:** capítulo Luna (Mission 01 a 03, unos 8 200 a 10 600 px), la FAQ «What have you built?», la escena final «Let's build something» y la cabecera.
- **Qué pasa:** cada proyecto se queda en un título, un stack y una frase. No hay enlace al repositorio, demo, captura ni vídeo. No hay CV descargable en ningún sitio. La llamada final («Questions and contact below») es texto, no un botón, y el contacto real está dos secciones más abajo, tras la FAQ.
- **Por qué importa:** para prácticas, lo que distingue a un candidato son las pruebas: código que se pueda abrir, algo que funcione y un CV que adjuntar al proceso. Ahora el recruiter tiene que creerte o ir a buscar tu GitHub por su cuenta.
- **Propuesta:**
  - Pon en cada misión de la Luna un enlace claro («View code ↗», «Live demo ↗») sobre el canvas, o una tarjeta HTML que aparezca con la misión.
  - Repite esos enlaces en la respuesta de la FAQ.
  - Añade **CV (PDF)** en la cabecera y en la escena final.
  - Convierte «Let's build something» en botones reales (Email, LinkedIn, CV).

### C3. Pantalla negra por un error en la primera carga
- **Dónde:** la primera vez que abrí `/en` en esta sesión.
- **Qué pasa:** el canvas se quedó completamente negro y solo se veían la cabecera y «Scroll to explore». La consola mostraba `Uncaught TypeError: Cannot read properties of undefined (reading 'chapter')` en `Journey.draw`, y el indicador de Next marcaba «1 Issue». Al recargar funcionó, y no conseguí reproducirlo en las cargas siguientes (EN, ES y raíz). Pudo ser algo puntual del entorno de desarrollo, pero el resultado para el visitante es una web vacía.
- **Por qué importa:** si pasa en producción, el visitante ve una pantalla negra y se va. Además, todo el contenido visible depende del canvas.
- **Propuesta:** investiga ese error. Añade también un modo de respaldo: si el canvas falla (o no hay JS), muestra el contenido en HTML estático (nombre, resumen, proyectos y contacto). Ese contenido ya existe para lectores de pantalla, así que el respaldo es barato.

---

## 🟡 Importante

### I1. Recorrido demasiado largo y con zonas muertas
- **Dónde:** toda la historia. Son unas 20 pantallas en escritorio y unas 21 en móvil. Hay tramos sin texto, por ejemplo:
  - unos 900 a 1 500 px (entre el nombre y Barcelona)
  - unos 2 300 a 2 700 px
  - unos 7 400 a 7 900 px (llegada a la Luna)
  - unos 12 300 a 12 900 px (aproximación al Sol)
  - unos 16 450 a 16 880 px
- **Qué pasa:** en mi muestreo, aproximadamente un tercio del scroll no tiene ningún texto en pantalla. La Tierra aguanta cinco escenas seguidas con una composición casi igual.
- **Por qué importa:** cada tramo vacío invita a cerrar la pestaña. El contenido de más valor (proyectos, a partir del 45 % del recorrido, y contacto, al final) llega tarde.
- **Propuesta:** apunta a unas 10 a 12 pantallas. Acorta las transiciones entre capítulos y deja que el texto entre antes y aguante más. Plantéate fusionar «Home base» y «Studying at» en una sola escena.

### I2. No hay navegación ni indicador de progreso
- **Dónde:** la cabecera (solo tiene «FAQ» y «EN/ES») y toda la historia.
- **Qué pasa:** no se sabe cuánto falta, ni se puede saltar a «Projects» o «Contact». El único atajo, «FAQ», salta al final.
- **Propuesta:** añade un indicador de capítulos discreto (Tierra · Luna · Sol · Contacto), por ejemplo puntos en el lateral que también sirvan para navegar. Añade a la cabecera «Projects», «Contact» y «CV». Y pon tu nombre a la izquierda de la cabecera: ahora no hay marca de quién es la web.

### I3. Los textos se cortan y quedan «píldoras fantasma» en las transiciones
- **Dónde:**
  - 4 600 px: «400+ code review» cortado y «Teaching assistant · We…»
  - unos 7 600 px y 8 800 px: píldoras oscuras vacías sin texto
  - unos 9 450 px: «Missio» y «AI-O» a medio revelar
  - unos 2 400 px: una píldora vacía en mitad de la nada
- **Qué pasa:** la animación de barrido deja el fondo de la píldora visible mientras el texto todavía no ha entrado (o ya ha salido), o recorta palabras a medias.
- **Por qué importa:** parece un fallo de renderizado, no una transición, y quita pulido justo en lo que más se lee.
- **Propuesta:** haz que fondo y texto aparezcan y desaparezcan juntos, con un fundido más un pequeño desplazamiento en lugar de un recorte. Y que una escena no empiece a salir hasta que la siguiente esté lista para entrar.

### I4. Fogonazo blanco al atravesar el Sol
- **Dónde:** escritorio, unos 16 550 a 16 880 px. Móvil, unos 15 500 px.
- **Qué pasa:** la pantalla entera se vuelve de un crema pálido y sin forma durante un tercio de pantalla de scroll. Las píldoras de la cabecera se quedan grises sobre crema y pierden contraste.
- **Por qué importa:** tras 18 pantallas de azul oscuro, el salto de luminosidad molesta y puede afectar a personas fotosensibles. Además parece que la página se ha roto, y no encaja con el estilo plano y nítido del resto.
- **Propuesta:** suaviza el pico (un blanco cálido con menos opacidad, o un viñeteado naranja) y acórtalo. O sustitúyelo por una transición de corte limpio, como un iris o un zoom que se detenga en la corona.

### I5. La cabecera flota sin fondo y choca con el contenido
- **Dónde:**
  - escritorio, Mission 03 (unos 10 300 a 10 600 px): el astronauta se coloca encima de los botones «EN/ES»
  - móvil, FAQ abierta: el texto de las respuestas pasa por debajo de «FAQ · EN · ES» y se mezcla («connecting a JavaS[FAQ][EN]»)
- **Propuesta:** dale a la cabecera una barra con fondo translúcido y desenfoque (o un degradado) cuando se sale del canvas. Y define una zona segura arriba a la derecha que el astronauta no invada.

### I6. El mensaje de rol es ambiguo
- **Dónde:** la portada («Software engineer») y la pestaña («Paul Adrian Pupaza · Software Engineer»).
- **Qué pasa:** el sitio presenta un ingeniero, pero en realidad buscas prácticas como estudiante de último curso. Eso solo queda claro en la escena de La Salle y en la FAQ «What kind of role…».
- **Por qué importa:** un recruiter de prácticas filtra por eso, y uno de puestos senior se llevará una impresión equivocada.
- **Propuesta:** «Final-year Software Engineering student · Looking for a SWE internship (summer 2027)». Revisa también la métrica «+22 % submission quality»: sin contexto suena vaga. Explica brevemente cómo se midió (por ejemplo, «+22 % pass rate on first submission»).

### I7. Al recargar o al saltar, la animación se queda atrás
- **Dónde:** al recargar a mitad de página, al pulsar «FAQ» o al tabular hasta la FAQ.
- **Qué pasa:**
  - Tras recargar en unos 11 200 px (escena del Sol), el canvas seguía en la Tierra varios segundos mientras se ponía al día.
  - Al saltar a la FAQ, la píldora «Scroll to explore» seguía visible encima.
  - El cambio EN ↔ ES devuelve siempre al principio de la página: se pierde el punto en el que estabas.
- **Propuesta:** en saltos grandes, corta directamente a la escena de destino en lugar de reproducir todo el recorrido. Al cambiar de idioma, conserva la posición (con un ancla o guardando el progreso).

### I8. Accesibilidad que se puede observar
- **Foco:** el anillo de foco de la cabecera se ve bien. En la FAQ queda recortado por el contenedor: solo se ve la línea de abajo.
- **Objetivos táctiles:** «EN» y «ES» miden unos 29 px de alto. Lo recomendable son 44 px.
- **Movimiento:** no hay ningún control para pausar o saltarse la animación. No pude simular `prefers-reduced-motion` en esta prueba. Comprueba que ese modo ofrece una versión estática (escenas fijas con su texto), sobre todo por el fogonazo del punto I4.
- **Positivo:** el canvas está marcado como `aria-hidden`, y hay un `<h1>` y un resumen completo para lectores de pantalla. Está bien resuelto.

### I9. Móvil: bien adaptado, con algunos roces
- **Bien:** los textos se centran abajo, las ilustraciones se recolocan y no hay scroll horizontal.
- **A mejorar:**
  - El nombre se parte en dos píldoras separadas («Paul Adrian» / «Pupaza»). Mejor una sola píldora de dos líneas, o un tamaño menor en una línea.
  - El bloque de texto queda a un 85 % de la altura. Con la barra inferior de Safari o Chrome puede quedar tapado: respeta `safe-area-inset-bottom` y súbelo un poco.
  - El subtítulo de AI-OS ocupa dos líneas. Con «Construction platform» pasa lo mismo y el bloque crece mucho.
  - Se aplican igual C1, I4 e I5.

---

## 🟢 Deseable

### N1. Raya naranja en el terminador de la Tierra
En todas las escenas de la Tierra, en escritorio y en móvil, hay una línea naranja y rojiza muy marcada entre el día y la noche. Parece un artefacto de renderizado más que un crepúsculo. Suavízala (un degradado ancho y menos saturado) o quítala.

### N2. Las órbitas de habilidades no dicen nada por sí mismas
En el capítulo del Sol (unos 13 300 a 15 900 px), los cuerpos que orbitan son círculos genéricos. Las habilidades solo aparecen en el texto. Es la oportunidad perfecta para el estilo Kurzgesagt: pon iconos o etiquetas cortas en cada satélite (Python, FastAPI, PostgreSQL…), para que la ilustración también comunique.

### N3. Tipografía
Fredoka (redondeada, muy amable) va bien en titulares y encaja con el estilo. Pero en párrafos largos (respuestas de la FAQ, a 16 px y peso 600) cansa y resta seriedad. Usa una sans neutra para el texto corrido. Además, los subtítulos de las escenas (unos 15 px sobre un canvas de 1440) se quedan pequeños frente al titular: súbelos a unos 17 o 18 px.

### N4. La FAQ y el cierre
- La unión entre el canvas y la FAQ es un corte seco de color: un degradado o un horizonte la integraría mejor.
- El indicador de cada pregunta es un cuadradito que pasa a rombo y no se lee como «desplegar». Usa un chevron o un «+».
- «What have you built?» es un bloque denso con los tres proyectos seguidos. Mejor en lista, con enlaces.
- El botón «Email» no muestra la dirección. Muchos recruiters prefieren copiarla: muéstrala, o añade un botón para copiarla.
- No hay pie de página (nombre, año, última actualización).

### N5. Metadatos para compartir
No hay `og:image` ni imagen de Twitter, así que el enlace pegado en LinkedIn, Slack o un ATS saldrá sin vista previa. Además, el favicon parece el de Next.js por defecto. Crea una imagen de 1200×630 con el astronauta, tu nombre y tu rol, y un favicon propio (por ejemplo, el casco del astronauta).

### N6. Retoques del texto en español
- «Haz scroll para explorar» → «Desliza para explorar».
- «Profesor asistente» es un calco de *teaching assistant*: mejor «Profesor ayudante» o «Asistente de docencia».
- «¿Qué has construido?» → «¿Qué proyectos has hecho?».

### N7. El Sol recortado detrás de los textos de la Tierra
En las escenas de la Tierra, los anillos del halo solar pasan por detrás de los textos de la izquierda. Las píldoras lo resuelven, pero la zona está muy cargada. Mueve el Sol un poco más arriba, o deja los textos sobre cielo limpio.

---

## ✅ Lo que funciona bien

- **Ilustración original y coherente:** la Tierra, la Luna, el Sol y el astronauta comparten trazo, paleta y nivel de detalle. No parecen imágenes de banco ni de IA. Es un elemento diferenciador de verdad.
- **La metáfora tiene sentido:** Tierra = quién soy, Luna = proyectos (una fase por misión), Sol = lo que me impulsa (habilidades). Los iconos que aparecen en la Luna (chat, terminal, bloques) son un detalle muy bueno.
- **Detalles narrativos que aportan:** el pin de Barcelona, los arcos entre países en la escena de idiomas y el anillo de partículas alrededor de la Tierra para las «400+ code reviews».
- **Un sistema de textos consistente:** la etiqueta superior en dorado, el título blanco grande y el subtítulo en azul claro, siempre en la misma posición. Se aprende rápido.
- **El contraste de los textos es bueno:** las píldoras oscuras garantizan la lectura sobre cualquier fondo.
- **Pensado para recruiters:** la FAQ responde justo lo que preguntan (rol, ubicación, permiso de trabajo en la UE e Irlanda, fecha de graduación).
- **Bilingüe y bien hecho:** la raíz redirige según el idioma del navegador, el `lang` es correcto, hay enlaces alternativos y canonical.
- **Accesibilidad básica cuidada:** contenido completo para lectores de pantalla, canvas oculto a la tecnología de apoyo, foco visible en la cabecera y la FAQ usable con teclado.
- **La versión móvil está realmente adaptada,** no es la de escritorio encogida.

---

## Top 5 de cambios, por prioridad

1. **Una portada que se entienda sin hacer scroll (C1, I6):** nombre, «Final-year SWE student · Internship summer 2027» y botones de **CV** y **Email** visibles desde el fotograma 0.
2. **Pruebas de trabajo y CV (C2):** enlaces a código y demos en cada misión de la Luna y en la FAQ, CV en PDF en la cabecera, y una escena final con botones reales de contacto.
3. **Un recorrido más corto y navegable (I1, I2):** reducir a unas 10 a 12 pantallas, quitar zonas muertas, añadir indicador de capítulos y atajos a Projects y Contact.
4. **Pulir lo que parece un fallo (C3, I3, I4, I5):** investigar el error que dejó el canvas en negro y añadir un respaldo estático; arreglar las píldoras fantasma y los textos cortados; suavizar el fogonazo del Sol; dar fondo a la cabecera.
5. **Accesibilidad y acabado (I8, N5):** modo estático con `prefers-reduced-motion`, anillo de foco completo en la FAQ, objetivos táctiles de 44 px, `og:image` y favicon propios.
