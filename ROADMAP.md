# ClassroomOS — Roadmap

> Sistema de aula digital para Colegio Boston Flexible.  
> Pantalla interactiva que transforma el salón de clases en un entorno de aprendizaje inmersivo, gamificado y medible.  
> **De cara al alumno:** experiencia de aprendizaje al nivel de las mejores plataformas del mundo.  
> **De cara al padre:** visibilidad total del progreso, participación y desempeño de su hijo.

---

## Completado

### Fase 0 — Infraestructura base (pre-existente)
- [x] Proyecto React + Vite configurado
- [x] Autenticación con Supabase Auth (email/password)
- [x] Tabla `teachers` con perfil, roles, school_id
- [x] Tabla `teacher_assignments` con schedule JSONB (día → periodos)
- [x] Tabla `schedule_slots` con horarios por periodo
- [x] Tabla `lesson_plans` con contenido JSONB por día
- [x] SmartBlocks interactivos: Grammar (fill-blank, choose), Reading, Vocab, Exit Ticket, Speaking Rubric
- [x] Resolución automática de clase por día/hora (`classResolver.js`)
- [x] ClassPicker como fallback cuando no se detecta clase
- [x] Navegador embebido (ToolsPanel) para herramientas externas
- [x] Fullscreen API para modo kiosco en pantallas de salón

### Fase 0.5 — Tema visual y ABC pedagógico (completado 2026-05-04)
- [x] **Tema claro** optimizado para salones iluminados
  - Fondo blanco cálido (#f8f9fc), texto oscuro (#1e2a3a)
  - Alto contraste WCAG AA, legibilidad a distancia (5+ metros)
  - Sombras suaves, sin elementos brillantes que distraigan
- [x] **BoardStrip permanente** (ABC del encuentro académico)
  - Siempre visible en los 6 momentos (no se borra durante la clase)
  - 4 elementos obligatorios: Fecha, Tema, Objetivo, Principio Bíblico
  - Estilo "pizarrón" con fondo crema y borde dorado
  - Responsive: grid 2x2 en pantallas pequeñas
- [x] **Pizarra digital (Whiteboard)**
  - Canvas de pantalla completa como overlay
  - Herramientas: lápiz, borrador
  - 6 colores de plumón (negro, azul, rojo, verde, naranja, morado)
  - 4 grosores de trazo (fino, medio, grueso, marcador)
  - Undo y limpiar todo
  - Soporte touch para pantallas táctiles
  - Accesible desde TopBar y menú
- [x] **Renderizado mejorado del contenido**
  - Tarjetas con borde de acento según momento
  - Badge "Actividad Interactiva" para SmartBlocks
  - Colores de momento más saturados para fondo claro
- [x] **Variables de entorno** configuradas (.env con Supabase URL + anon key)

---

## Pendiente

### Fase 0.7 — Guide Experience Engine (GXE)
> **Filosofía:** La guía NO es un documento — es el programa de instrucción ejecutable.  
> CBF Planner es el estudio de grabación. ClassroomOS es el escenario en vivo. El DOCX es solo la partitura impresa.  
> Cada dato en la guía lleva metadata de **qué mostrar** y **cómo mostrarlo**.  
> **Impacto docente:** "Mis guías son mejores solo porque las hago con esta App."  
> **Impacto alumno:** La pantalla del salón se ve como material de Cambridge o National Geographic Learning.

#### Estado actual (lo que ya existe y sus limitaciones)
- [x] Editor TipTap de texto libre por sección — funciona, pero es una caja vacía sin estructura
- [x] SmartBlocks (18 tipos) — funcionan, pero están desconectados de los patrones de actividad
- [x] ImageUploader — funciona, pero imágenes estáticas sin anotación
- [x] `contentAnalyzer.js` en ClassroomOS — detecta 7 layouts por estructura HTML, no por significado
- [x] Syllabus — CRUD básico funciona, pero no conecta con el editor
- [x] Biblioteca — upload funciona, pero fragmentos y anotación de PDF nunca se implementaron
- [x] Export DOCX — funciona, pero es el único output (debería ser solo la capa imprimible)

#### Cambios de arquitectura fundamentales
- El **Logro** es el elemento rey de la guía. Aparece prominente en el header impreso y en el editor. Los indicadores son hijos del Logro.
- El editor pasa de **HTML libre** a **bloques tipados** con metadata de presentación.
- Cada bloque lleva `display` (cómo se ve en ClassroomOS) y `printLayout` (cómo se imprime en DOCX).
- ClassroomOS lee bloques estructurados, no HTML crudo. Fallback a HTML para guías legacy.
- **Toggle ES/EN** en el editor — labels de momentos, fases y patrones en ambos idiomas.
- El flujo de diseño es **Objetivo → Recurso → Patrón**, nunca al revés.

---

#### GXE Sprint 1 — Modelo de bloques y schema de datos ✅
> Sin esto nada más funciona. Es el cambio de modelo de datos.

- [x] **`blockSchema.js`** (`cbf-planner/src/utils/blockSchema.js`) — schema completo con Zod:
  - 12 tipos de bloque: `explanation`, `procedure`, `vocab`, `model`, `image`, `question`, `teacher-note`, `media`, `scaffold`, `pattern`, `rich-text`, `smart-block`
  - 2 tipos adicionales Sprint 3: `exit-ticket`, `homework`
  - `STEP_ACTIONS`, `EMPHASIS`, `REVEAL_MODE`, `SCAFFOLD_PHASE` — constantes de display
  - `PRINT_LAYOUTS` — metadata de export por tipo
  - `createBlock()`, `validateBlock()`, `sectionHasBlocks()`, `createScaffoldBlock()`, `flattenBlocks()`
- [x] **Backward compat** — `section.blocks` coexiste con `section.content` (HTML legacy). Fallback automático.
- [x] **Validación con Zod** — schemas por tipo en `DATA_SCHEMAS`, `displaySchema`, `blockSchema`
- [x] **Corrección del Logro** en `exportDocx.js`:
  - Row 1: Header azul "LOGRO"
  - Row 2: Texto del logro prominente (24pt bold, fondo #EEF3FA)
  - Indicadores como secundarios debajo del logro
  - Principio bíblico en fila ámbar separada

---

#### GXE Sprint 2 — Catálogo de patrones de actividad ✅
> Los patrones son estructuras de interacción probadas que se llenan con contenido. No se inventan actividades — se aplican patrones al contenido del día.

- [x] **`activityPatterns.js`** (`cbf-planner/src/utils/activityPatterns.js`) — catálogo completo:
  - `PATTERN_FAMILIES`, `SKILLS`, `THINKING`, `INPUT_FIELD_TYPES`
  - `suggestPatterns({skills, keywords, family})` — scoring por skill match (×3) + keyword trigger (×2)
  - `getPattern(id)`, `getPatternsByFamily(family)`, `getPatternsForPhase(phase)`

- [x] **Patrones implementados (9):**

  **INPUT (I DO):**
  - [x] `guided-noticing` — Ejemplos que revelan la regla
  - [x] `model-text` — Texto modelo anotado
  - [x] `picture-narration` — Imagen anotada como ancla visual

  **PROCESSING (WE DO):**
  - [x] `information-gap` — A tiene lo que B necesita, cooperan hablando
  - [x] `dictogloss` — Escuchar → reconstruir → comparar
  - [x] `think-pair-share` — Individual → pareja → clase (con timer por fase)
  - [ ] `jigsaw`, `ranking`, `odd-one-out`, `categorizing`, `sequencing`, `matching`, `disappearing-text`, `sentence-auction`, `back-to-the-board` — pendientes

  **OUTPUT (YOU DO):**
  - [x] `guided-writing` — Escritura con modelo/scaffold/sentence starters
  - [ ] `role-play`, `presentation`, `creative-task`, `survey-interview`, `problem-solving`, `picture-description` — pendientes

  **ACTIVATION:**
  - [x] `hook` — Recurso provocador + pregunta detonadora
  - [ ] `kwl`, `brainstorm`, `prediction`, `quick-poll` — pendientes

  **ASSESSMENT:**
  - [x] `three-two-one` — 3 aprendí, 2 me interesaron, 1 pregunta
  - [ ] `exit-ticket` (patrón), `one-sentence-summary`, `thumbs-check` — pendientes

- [x] **Ayuda contextual completa** por patrón: nombre/desc ES/EN, "¿Por qué funciona?", pasos docente (antes/durante/después), pasos estudiante, `aiTriggers[]`, `classroomDisplay`, `printLayout`

---

#### GXE Sprint 2b — Editor de bloques UI (cbf-planner) ✅
> Los formularios, el editor canvas y el PatternPicker. El docente ve bloques tipados, no una caja vacía.

- [x] **`BlockEditor.jsx`** — editor orquestador:
  - `BlockCard` — tarjeta colapsable por bloque (header, summary, form, emphasis selector)
  - `BlockList` — lista + picker con tipos disponibles por fase/sección
  - `ScaffoldBlock` — 3 tabs (I DO / WE DO / YOU DO) con BlockList anidada por fase
  - `MomentoHint` — banner contextual (dismissable, desaparece al completar)
  - Toggle modo bloques / texto libre en `DayPanel.jsx`

- [x] **Formularios de bloque:**
  - `ExplanationForm` — texto + grammarTarget + highlightTerms dinámicos
  - `ProcedureForm` — pasos con ACTION (listen/read/write/speak/observe/think/do/check) + reorder
  - `ModelForm` — texto modelo + label + grammarTarget + fuente
  - `QuestionForm` — pregunta + 4 subtipos (discussion / TPS / individual / retórica) + guidance privada
  - `TeacherNoteForm` — nota privada con 3 niveles de prioridad
  - `PatternForm` — despacha al PatternPicker → llena inputs específicos del patrón elegido
  - `VocabForm` — términos (word/definition/example/pronunciation) + modo presentación (tarjetas/lista/compacto)
  - `ExitTicketForm` — pregunta + 4 tipos de respuesta + método de recolección
  - `HomeworkForm` — instrucción + plataforma (datalist) + URL validada + fecha + nota para padres

- [x] **`PatternPicker.jsx`** — slide-over panel completo:
  - Family tabs (I DO / WE DO / YOU DO / Activación / Cierre)
  - Pattern cards con description inline, skills chips, grouping, duration
  - Detail panel: "¿Por qué funciona?" + pasos docente + pasos estudiante + chips
  - AI suggestions strip (top 3 por match de skills/keywords)
  - Toggle ES / EN

- [x] **Catálogo momento-aware** (`SECTION_BLOCKS`):
  | Momento | Bloques disponibles |
  |---|---|
  | ENCUENTRO | Vocabulario, Pregunta, Nota docente, Texto libre |
  | TEMA DEL DÍA | Pregunta, Nota docente, Texto libre |
  | MOTIVACIÓN | Patrón, Pregunta, Procedimiento, Nota, Texto libre |
  | DESARROLLO | Scaffold I DO/WE DO/YOU DO |
  | CIERRE | Exit Ticket, Pregunta, Nota, Texto libre |
  | TAREA | Tarea, Nota docente, Texto libre |

- [x] **Empty states** con pista concreta por fase y sección
- [x] **RichText como fallback** con badge de advertencia
- [ ] Drag & drop para reordenar bloques — pendiente
- [ ] Preview en vivo "así se verá en ClassroomOS" — pendiente (Sprint 4)
- [ ] Anotador de imágenes (bloque `image`) — pendiente (Sprint 5)

---

#### GXE Sprint 3 — Canvas momento-aware + tipos por momento ✅
> Completado junto con Sprint 2b. Cada momento tiene su catálogo propio.

- [x] Canvas por momento con `SECTION_BLOCKS` y `MOMENTO_HINTS`
- [x] Tipos específicos: `exit-ticket` (CIERRE), `homework` (TAREA), `vocab` (ENCUENTRO)
- [x] Hints contextuales por momento con tip pedagógico específico
- [x] Indicadores de completitud por fase y sección vacía

---

#### GXE Sprint 4 — Renderer en ClassroomOS (cbf-classroom) ✅
> ClassroomOS lee bloques estructurados y los renderiza profesionalmente. Fallback a HTML legacy.

- [x] **`BlockRenderer.jsx`** (`cbf-classroom/src/components/blocks/`) — dispatcher principal:
  - `<ExplanationBlock>` — texto con highlights de grammarTarget
  - `<ProcedureBlock>` — timeline vertical con iconos de acción (listen/read/write/speak/observe/think/do/check)
  - `<VocabBlock>` — cards con reveal interactivo, tabla, o chips compactos
  - `<ModelBlock>` — blockquote prominente con grammarTarget resaltado
  - `<QuestionBlock>` — pregunta grande con área de escritura y guidance docente
  - `<TeacherNoteBlock>` — nota privada con 3 niveles de prioridad
  - `<PatternBlock>` — dispatcher por patternId
  - `<ScaffoldBlock>` — tabs I DO / WE DO / YOU DO con BlockRenderer recursivo
  - `<ExitTicketBlock>` — yes/no, escala 1-5, respuesta abierta
  - `<HomeworkBlock>` — instrucción + plataforma + URL + nota para padres
  - `<RichTextBlock>` — fallback HTML libre

- [x] **Renderers de patrones** (`PatternBlock.jsx` + inline renderers):
  - `<HookDisplay>` — recurso + pregunta detonadora
  - `<ThinkPairShareDisplay>` — 3 fases con timer SVG circular (play/pause/reset)
  - `<InformationGapDisplay>` — split A/B + useful language collapsible
  - `<DictoglossDisplay>` — 3 etapas: escuchar → reconstruir → comparar
  - `<GuidedWritingDisplay>` — prompt + starters + modelo collapsible + líneas
  - `<GuidedNoticingDisplay>` — ejemplos + reveal de la regla
  - `<ModelTextDisplay>` — texto modelo con annotation
  - `<ThreeTwoOneDisplay>` — 3 cards con líneas de escritura por fase
  - `<PictureNarrationDisplay>` — imagen + vocab chips + pregunta
  - `<GenericPatternDisplay>` — fallback para patrones sin renderer

- [x] **Fallback para guías legacy:**
  - Si `section.blocks` existe → usar BlockRenderer
  - Si solo `section.content` (HTML) existe → usar `contentAnalyzer.js` + `ContentLayout` actual
  - Transición transparente: guías viejas siguen funcionando sin migración manual

- [x] **CSS de bloques** (`src/blocks.css`) — 600+ líneas optimizadas para 15"–100":
  - Fluid scaling via clamp() heredado de :root
  - Iconografía contextual en ProcedureBlock
  - Timer SVG circular animado en ThinkPairShare
  - Highlight automático de grammarTarget en Explanation + Model
  - Selección de texto habilitada en todos los bloques de contenido

- [ ] AnnotatedImage (bloque `image`) — pendiente Sprint 5
- [ ] MediaBlock con cue points — pendiente Sprint 5

---

#### GXE Sprint 5 — Syllabus + Biblioteca conectados al editor ✅
> El Syllabus alimenta el editor con temas/objetivos. La Biblioteca provee recursos verificados.

- [x] **`SyllabusResourcePanel.jsx`** (`cbf-planner/src/components/editor/`) — nuevo componente activo:
  - Por cada tema del syllabus: badge de tipo, preview de descripción, botones de acción
  - "→ Tema del día" — llena `day.unit` del día activo con un clic
  - "→ [Sección]" — inserta descripción como HTML en la sección pedagógicamente correcta:
    - `grammar/skill` → Habilidad, `vocabulary` → Encuentro, `concept` → Motivación, `value` → Cierre
  - Append si la sección ya tiene contenido; reemplaza si está vacía
  - Mensaje guía cuando no hay día seleccionado
  - Por cada recurso de Biblioteca: "👁 Ver PDF" (abre file_url en nueva pestaña) + "📌 Insertar referencia" (inserta `<em>📖 Ref.: Libro, p.12, 13</em>` en Habilidad)

- [x] **`GuideEditorPage.jsx`** — tres cambios quirúrgicos:
  - Query `syllabusBookPages` ahora incluye `file_url` de `school_library`
  - Panel estático de book pages (solo texto) → `<SyllabusResourcePanel>` con acciones
  - Panel estático de syllabus topics (solo lectura) → `<SyllabusResourcePanel>` completo con topics + books
  - `DayPanel` recibe nuevo prop `syllabusTopics={linkedSyllabusTopics}`

- [x] **`DayPanel.jsx`** — hint de syllabus en campo "Asignatura / Unidad":
  - Cuando el campo está vacío y hay temas en el syllabus → chips clickeables para llenar el campo
  - Máximo 3 chips para no saturar la UI

- [ ] Auto-fill suggestion toast al abrir guía con topics pero secciones vacías — pendiente Sprint 6
- [ ] Fragment extraction UI (selección rectangular en PDF) — pendiente Sprint 6
- [ ] Flujo integrado Objetivo → Recurso → Patrón en PatternPicker — pendiente Sprint 6

---

#### GXE Sprint 6 — AI como copiloto (no como compositor)
> La AI sugiere desde lo que EXISTE, nunca desde la imaginación. No inventa recursos.

- [ ] **AI en matching de patrones:**
  - Dado el Logro + indicador + habilidad → sugiere los 3 mejores patrones de actividad
  - Ranking basado en: skill match, grouping, duration fit, variety (no repetir el mismo patrón)
  - Estrellas (⭐) junto a los patrones sugeridos en el editor

- [ ] **AI en generación de contenido DENTRO del patrón:**
  - Dado un patrón + tema + nivel → genera el contenido (cards A/B, preguntas, items, etc.)
  - SOLO usa vocabulario del syllabus y recursos de la biblioteca
  - El docente revisa y aprueba antes de guardar

- [ ] **AI en anotación de imágenes:**
  - Al subir una imagen, detecta objetos y sugiere etiquetas
  - El docente acepta, rechaza, o edita cada sugerencia

- [ ] **AI en validación de guía completa:**
  - Revisa si cada momento tiene contenido suficiente
  - Detecta si falta una fase del scaffold (I DO / WE DO / YOU DO)
  - Sugiere mejoras: "Tu WE DO es solo texto — considera agregar un patrón de actividad"
  - Verifica coherencia: ¿el contenido del WE DO practica lo que el I DO explica?

- [ ] **AI NUNCA hace esto:**
  - Inventar URLs de videos o recursos que no ha verificado
  - Generar actividades que requieran materiales inexistentes
  - Reemplazar el juicio del docente — siempre sugiere, nunca impone
  - Si no puede verificar un recurso, dice "necesitas subir o enlazar un recurso para esta parte"

---

#### GXE Sprint 7 — Export DOCX desde bloques (la capa imprimible)
> El DOCX es una proyección plana de la guía, no la guía misma.

- [ ] **Reescribir `exportDocx.js`** para leer bloques en vez de HTML:
  - Cada tipo de bloque tiene su propio renderer DOCX
  - Patrones de actividad → tabla con instrucciones + materiales
  - Imágenes anotadas → imagen + leyenda con descripción de anotaciones
  - Scaffold → secciones con headers "I DO / WE DO / YOU DO"
  - Teacher notes → texto en gris o itálica
  - **Logro prominente en el header** — más grande que indicadores

- [ ] **Fallback para bloques legacy** — si una guía tiene HTML viejo, exportar como antes

---

### Fase 1 — Fundamentos en tiempo real
> Objetivo: El docente ve quién está conectado a la clase en tiempo real.  
> Impacto padre: "Mi hijo está conectado y participando activamente."

- [ ] Integrar Supabase Realtime Presence en la sesión de clase
- [ ] Canal de clase (broadcast) — el docente emite, los estudiantes reciben
- [ ] Componente `PresencePanel` en el TopBar o lateral:
  - Lista de estudiantes conectados (avatar + nombre)
  - Indicador visual online/offline/away
  - Timestamp de última actividad
  - Badge de "estudiante remoto" vs "presencial"
- [ ] Registro de eventos de presencia en tabla `presence_events`
- [ ] Alertas cuando un estudiante remoto se desconecta
- [ ] Portal web del estudiante para "entrar" a la clase desde su dispositivo
- [ ] Notificación automática al padre si el estudiante remoto se desconecta más de X minutos

---

### Fase 2 — Motor de Juegos (Game Engine)
> Objetivo: Un engine reutilizable que alimenta todos los juegos con datos de las planeaciones.  
> Los juegos se generan automáticamente desde los SmartBlocks — el docente no tiene trabajo extra.

- [ ] **Game Engine Core:**
  - Parser de SmartBlocks → formato universal de preguntas
  - Sistema de puntaje configurable (por velocidad, precisión, streak)
  - Timer visual con animaciones
  - Sistema de sonidos (countdown, correct, wrong, victory, level-up)
  - Transiciones y animaciones entre preguntas
  - Persistencia de resultados en `student_activity_grades`
  - Analytics: tiempo de respuesta, porcentaje de acierto, progreso

- [ ] **Modos de juego base:**
  - Solo (pantalla proyectada, clase responde en grupo)
  - Multiplayer individual (cada uno en su celular)
  - Equipos (2-6 equipos compitiendo)
  - Class vs Teacher (toda la clase contra el docente)
  - Duelos 1v1 (bracket de eliminación)

---

### Fase 3 — Juegos de Vocabulario

#### 3.1 Word Blast (Tetris de palabras)
> Caen palabras en inglés, el estudiante toca la traducción/definición correcta antes de que llegue al fondo.
- [ ] Palabras caen con gravedad variable (dificultad progresiva)
- [ ] Vidas: 3 errores y pierdes
- [ ] Combo multiplier por respuestas consecutivas
- [ ] Fuente de datos: `VOCAB/matching` del SmartBlock
- [ ] Modo: proyectado + individual

#### 3.2 Picture Match (Imagen-Palabra)
> Se muestra una imagen, 4 opciones de palabra. Asociación visual.
- [ ] Usa imágenes de las guías (ya almacenadas en Supabase Storage)
- [ ] Round-based: 10 imágenes por ronda
- [ ] Bonus por velocidad
- [ ] Modo: proyectado + individual

#### 3.3 Crossword Builder (Crucigrama automático)
> Crucigrama generado desde el vocabulario semanal.
- [ ] Algoritmo de colocación automática de palabras
- [ ] Pistas = definiciones del vocabulario
- [ ] Timer opcional
- [ ] Modo: proyectado (clase resuelve en grupo) + individual

#### 3.4 Word Chain (Cadena de palabras)
> Un estudiante dice/escribe una palabra, el siguiente debe empezar con la última letra.
- [ ] Validación contra diccionario
- [ ] Categorías: solo verbos, solo adjetivos, temática libre
- [ ] Timer por turno
- [ ] Visualización de cadena en pantalla
- [ ] Modo: proyectado con turnos

#### 3.5 Memory Match (Parejas)
> Tablero de cartas boca abajo. Emparejar palabra inglés ↔ definición/traducción.
- [ ] Grid de 4x4 o 6x6 según dificultad
- [ ] Animación flip de carta
- [ ] Contador de intentos
- [ ] Modo: proyectado + equipos + individual

#### 3.6 Word Scramble (Anagrama)
> Letras desordenadas, el estudiante forma la palabra correcta.
- [ ] Pista: definición o imagen
- [ ] Drag & drop de letras (touch friendly)
- [ ] Dificultad progresiva (palabras más largas)
- [ ] Modo: proyectado + individual

#### 3.7 Hangman Reimagined (Ahorcado moderno)
> Versión moderna sin la horca — construyes algo positivo (torre, cohete, jardín).
- [ ] Letras en teclado visual grande
- [ ] Cada acierto agrega un elemento al dibujo
- [ ] Pista contextual después de 3 fallos
- [ ] Modo: proyectado (clase participa)

#### 3.8 Vocabulary Bingo
> Bingo con definiciones como pistas y palabras en las casillas.
- [ ] Generación aleatoria de cartones por estudiante
- [ ] El docente "canta" definiciones, los estudiantes marcan la palabra
- [ ] Detección automática de bingo
- [ ] Modo: multiplayer (cada uno su cartón en celular)

#### 3.9 Word Association Web
> Se muestra una palabra central, los estudiantes agregan palabras asociadas.
- [ ] Mapa mental visual en tiempo real
- [ ] Votación de mejores asociaciones
- [ ] Desarrolla redes semánticas
- [ ] Modo: multiplayer colaborativo

#### 3.10 Spelling Bee
> Se muestra definición (o se reproduce audio), el estudiante deletrea.
- [ ] Rondas eliminatorias
- [ ] "Can you use it in a sentence?" — el sistema da una oración ejemplo
- [ ] Pronunciación con Web Speech API
- [ ] Modo: proyectado con turnos

---

### Fase 4 — Juegos de Gramática

#### 4.1 Sentence Builder (Constructor de oraciones)
> Palabras desordenadas, arrastrar al orden correcto.
- [ ] Drag & drop con snap (touch-optimized)
- [ ] Múltiples oraciones por ronda
- [ ] Puntaje por velocidad + precisión
- [ ] Fuente: oraciones de `GRAMMAR/fill-blank`
- [ ] Modo: proyectado + individual

#### 4.2 Error Hunt (Caza errores)
> Oración con un error gramatical. Toca la palabra incorrecta.
- [ ] Timer: más rápido = más puntos
- [ ] 3 niveles: obvio, sutil, trampa (oración correcta)
- [ ] Explicación del error después de responder
- [ ] Modo: proyectado + individual + duelo

#### 4.3 Tense Timeline (Línea de tiempo verbal)
> Oración mostrada → el estudiante la ubica en past/present/future.
- [ ] Línea de tiempo visual horizontal con zonas de color
- [ ] Drag de la oración a la zona correcta
- [ ] Sub-tiempos: simple, continuous, perfect
- [ ] Modo: proyectado + individual

#### 4.4 Grammar Auction (Subasta gramatical)
> Equipos tienen "dinero virtual". Subastan por oraciones que creen correctas.
- [ ] Pool de oraciones (algunas correctas, otras no)
- [ ] Fase de subasta: equipos pujan
- [ ] Revelación: si es correcta, ganan el doble. Si no, pierden todo
- [ ] Estrategia + conocimiento gramatical
- [ ] Modo: equipos

#### 4.5 Conjugation Race (Carrera de conjugación)
> Se da un verbo + tiempo + persona. Responder la conjugación correcta.
- [ ] Velocidad progresiva
- [ ] Verbos irregulares como "power rounds"
- [ ] Visual: carros/cohetes avanzando
- [ ] Modo: multiplayer competitivo

#### 4.6 Transformation Challenge (Transformaciones)
> Oración dada → transformar a otro tiempo/voz/forma.
- [ ] "Make it negative", "Change to past", "Make it a question"
- [ ] Evaluar múltiples respuestas válidas
- [ ] Modo: individual + duelo

#### 4.7 Fill the Gap Race (Completar contra reloj)
> El clásico fill-in-the-blank pero gamificado con velocidad.
- [ ] Oraciones de los SmartBlocks existentes
- [ ] Opciones múltiples o escritura libre
- [ ] Streak bonus (5 correctas seguidas = x2)
- [ ] Modo: multiplayer

#### 4.8 Grammar Tetris
> Bloques caen con fragmentos de oración. Rotarlos y colocarlos en orden.
- [ ] Sujeto → verbo → complemento → puntuación
- [ ] Líneas completas = puntos
- [ ] Velocidad aumenta por nivel
- [ ] Modo: individual

#### 4.9 Clause Connector (Conector de cláusulas)
> Dos cláusulas sueltas + lista de conectores. Elegir el correcto.
- [ ] Because, although, however, therefore, etc.
- [ ] Contexto visual para cada oración
- [ ] Modo: proyectado + individual

---

### Fase 5 — Juegos de Listening & Speaking

#### 5.1 Dictation Race (Dictado competitivo)
> El sistema reproduce audio. Los estudiantes escriben lo que escuchan.
- [ ] Web Speech API (TTS) o audios pregrabados del docente
- [ ] Puntaje por precisión ortográfica (Levenshtein distance)
- [ ] Velocidad de reproducción configurable
- [ ] Replay limitado (máx 2 veces)
- [ ] Modo: multiplayer

#### 5.2 Pronunciation Challenge (Reto de pronunciación)
> Se muestra una palabra/frase. El estudiante la dice al micrófono.
- [ ] Web Speech Recognition API para evaluación
- [ ] Porcentaje de match
- [ ] Feedback visual: qué fonemas fallaron
- [ ] Tongue twisters como bonus rounds
- [ ] Modo: individual + proyectado (uno a la vez)

#### 5.3 Whisper Challenge
> Un estudiante ve la frase (en la pantalla solo para él), la dice. Los demás adivinan.
- [ ] Frase mostrada solo en el celular del "hablante"
- [ ] Los demás escriben lo que entendieron
- [ ] Puntos por cercanía a la frase original
- [ ] Modo: multiplayer con turnos

#### 5.4 Song Lyrics Fill (Completar letras de canciones)
> Se reproduce una canción. Algunas palabras están en blanco.
- [ ] Integración con audio (Spotify embed o archivos propios)
- [ ] Palabras clave removidas según gramática objetivo
- [ ] Puntaje por completar antes de que la canción avance
- [ ] Modo: proyectado (clase en grupo) + individual

#### 5.5 Audio Story Builder
> El sistema dice el inicio de una historia. Los estudiantes continúan.
- [ ] TTS lee la historia base
- [ ] Cada estudiante agrega una oración (escrita o hablada)
- [ ] La historia se construye colaborativamente
- [ ] Votación de mejor continuación
- [ ] Modo: multiplayer colaborativo

#### 5.6 Sound Effects Story
> Se reproducen efectos de sonido. Los estudiantes narran qué pasa usando target grammar.
- [ ] Biblioteca de sonidos (lluvia, puerta, pasos, etc.)
- [ ] Deben usar el tiempo verbal objetivo
- [ ] Desarrolla creatividad + gramática
- [ ] Modo: proyectado con turnos

---

### Fase 6 — Juegos de Reading & Comprehension

#### 6.1 Speed Reading Challenge
> Texto aparece palabra por palabra a velocidad controlada. Preguntas al final.
- [ ] WPM configurable (100, 150, 200, 250)
- [ ] Comprensión medida con preguntas
- [ ] Tracking de progreso (WPM promedio del estudiante)
- [ ] Fuente: `READING/comprehension` passages
- [ ] Modo: individual

#### 6.2 Story Puzzle (Rompecabezas narrativo)
> Párrafo dividido en oraciones desordenadas. Reconstruir la historia.
- [ ] Drag & drop de oraciones
- [ ] Pistas de cohesión (first, then, finally, however)
- [ ] Timer opcional
- [ ] Modo: proyectado + individual

#### 6.3 Context Clues Detective
> Texto con palabra desconocida/inventada. Deducir significado por contexto.
- [ ] 4 opciones de significado
- [ ] Highlight de pistas contextuales después de responder
- [ ] Desarrolla inferencia — habilidad #1 en reading
- [ ] Modo: proyectado + individual

#### 6.4 Headline News (Titulares)
> Se muestra un artículo. El estudiante debe escribir el mejor titular.
- [ ] Votación de la clase por mejor titular
- [ ] Enseña main idea + summarization
- [ ] Modo: multiplayer

#### 6.5 True/False/Not Given
> Estilo IELTS/Cambridge. Afirmaciones sobre un texto.
- [ ] True (el texto lo dice)
- [ ] False (el texto dice lo contrario)
- [ ] Not Given (el texto no menciona esto)
- [ ] Crucial para exámenes internacionales
- [ ] Modo: proyectado + individual

#### 6.6 Quote Attribution
> Se muestra una cita de un personaje del texto. ¿Quién lo dijo?
- [ ] Desarrolla atención al detalle
- [ ] Opciones: personajes de la lectura
- [ ] Modo: proyectado

#### 6.7 Sequencing Race
> Eventos del texto mostrados en desorden. Ordenar cronológicamente.
- [ ] Drag & drop
- [ ] Timer competitivo
- [ ] Modo: individual + equipos

---

### Fase 7 — Juegos de Writing & Creativity

#### 7.1 Mad Libs (Historias locas)
> El sistema pide partes del discurso. Genera una historia absurda.
- [ ] "Give me a verb in past tense", "Give me an adjective"
- [ ] Historia generada se proyecta — la clase se ríe
- [ ] Asociación emocional positiva con gramática
- [ ] Modo: proyectado (clase contribuye)

#### 7.2 Emoji Translator
> Frase en emojis → escribir en inglés. O frase en inglés → representar con emojis.
- [ ] Desarrolla comprensión semántica
- [ ] Votación de mejor traducción
- [ ] Modo: multiplayer

#### 7.3 Two Truths One Lie
> Cada estudiante escribe 3 oraciones sobre sí mismo. La clase vota cuál es mentira.
- [ ] Práctica de escritura en target grammar
- [ ] Speaking cuando explican la verdad
- [ ] Social + divertido
- [ ] Modo: multiplayer con turnos

#### 7.4 Story Relay (Historia en cadena)
> Cada estudiante agrega una oración a la historia.
- [ ] Timer por turno (30 segundos)
- [ ] Debe usar la estructura gramatical objetivo
- [ ] La historia se muestra en la pantalla en tiempo real
- [ ] Modo: multiplayer secuencial

#### 7.5 Caption Contest
> Se muestra una imagen (graciosa/interesante). Escribir el mejor caption.
- [ ] Votación anónima de la clase
- [ ] Debe usar vocabulario/gramática de la unidad
- [ ] Top 3 se muestran en pantalla con animación
- [ ] Modo: multiplayer

#### 7.6 Describe & Draw
> Un estudiante describe algo en inglés. Los demás dibujan.
- [ ] El "descriptor" ve la imagen en su celular
- [ ] Los demás dibujan en el Whiteboard o su celular
- [ ] Votación de dibujo más cercano
- [ ] Desarrolla giving instructions + spatial vocabulary
- [ ] Modo: multiplayer

#### 7.7 Formal vs Informal Transformer
> Se da una oración informal. Reescribir en registro formal (o viceversa).
- [ ] "sup bro wanna hang?" → "Would you like to spend some time together?"
- [ ] Puntaje por formalidad correcta
- [ ] Útil para letter writing (como el plan existente de 8.° Blue)
- [ ] Modo: individual + equipos

---

### Fase 8 — Juegos Competitivos de Alto Engagement

#### 8.1 Vocabulary Tower (Torre de bloques)
> Cada respuesta correcta = un bloque. Construye la torre más alta.
- [ ] Animación de bloques apilándose
- [ ] Error = bloque cae (pierde altura)
- [ ] Visual: torres de todos los jugadores en pantalla
- [ ] El primero en 15 bloques gana
- [ ] Modo: multiplayer

#### 8.2 Grammar Duel (Duelo 1v1)
> Dos estudiantes, misma pregunta, el más rápido gana.
- [ ] Bracket de eliminación
- [ ] Semi-finales y final proyectados
- [ ] La clase observa y aprende
- [ ] Espectadores pueden "apostar" puntos
- [ ] Modo: multiplayer (bracket)

#### 8.3 Class vs Teacher
> La clase acumula puntos contra el docente.
- [ ] El docente "juega" (responde preguntas difíciles)
- [ ] Si la clase gana: recompensa (no homework, free time, etc.)
- [ ] Genera energía colectiva y colaboración
- [ ] Modo: proyectado

#### 8.4 Territory Conquest (Conquista de territorio)
> Mapa dividido en territorios. Respuestas correctas = conquistas.
- [ ] Mapa visual con colores por equipo
- [ ] Estrategia: atacar territorios vecinos
- [ ] Preguntas más difíciles = territorios más valiosos
- [ ] Modo: equipos

#### 8.5 Survivor (Eliminación progresiva)
> Todos empiezan. Error = eliminado. Último en pie gana.
- [ ] Preguntas cada 15 segundos
- [ ] Dificultad aumenta conforme quedan menos
- [ ] "Revive" token: 1 por juego
- [ ] Tensión narrativa: "Quedan 5 estudiantes..."
- [ ] Modo: multiplayer

#### 8.6 Treasure Hunt (Búsqueda del tesoro)
> Pistas en inglés que llevan a "tesoros" virtuales.
- [ ] Cada pista resuelta desbloquea la siguiente
- [ ] Pistas usan gramática/vocabulario objetivo
- [ ] Mapa visual con progreso
- [ ] Modo: equipos

#### 8.7 Who Wants to Be a Millionaire (¿Quién quiere ser millonario?)
> Formato clásico adaptado.
- [ ] 15 preguntas de dificultad progresiva
- [ ] Comodines: 50/50, ask the class, skip
- [ ] Música y tensión dramática
- [ ] Modo: proyectado (un estudiante juega, clase es audiencia)

#### 8.8 Jeopardy Board
> Tablero de categorías y valores.
- [ ] Categorías: Grammar, Vocab, Listening, Culture, Wild Card
- [ ] Valores: 100, 200, 300, 400, 500
- [ ] Daily Double
- [ ] Modo: equipos

---

### Fase 9 — Juegos de Cultura & Conversación

#### 9.1 Culture Quiz
> Preguntas sobre cultura de países anglófonos.
- [ ] UK, USA, Australia, Canada, etc.
- [ ] Tradiciones, comida, expresiones, geografía
- [ ] Desarrolla competencia intercultural
- [ ] Modo: proyectado + multiplayer

#### 9.2 Idiom Illustrator
> Se muestra un idiom ("it's raining cats and dogs"). Dibujar el significado literal vs real.
- [ ] Hilario para los estudiantes
- [ ] Memoria visual del significado real
- [ ] Base de datos de 200+ idioms comunes
- [ ] Modo: proyectado

#### 9.3 Role Play Scenario
> Situación comunicativa. Los estudiantes improvisan diálogos.
- [ ] "You're at a restaurant. Order food for your family."
- [ ] Evaluación con rubric automática (speaking rubric existente)
- [ ] Timer por rol
- [ ] Modo: presencial (pantalla muestra escenario + rubric)

#### 9.4 Debate Timer
> Tema controversial (age-appropriate). Equipos a favor y en contra.
- [ ] Timer visual por equipo
- [ ] Scoring por argumentos (clase vota)
- [ ] Vocabulario de opinión: "I believe", "On the other hand", "Furthermore"
- [ ] Modo: proyectado + presencial

#### 9.5 Would You Rather (¿Preferirías?)
> Dos opciones. Los estudiantes eligen y justifican en inglés.
- [ ] "Would you rather live in the past or the future?"
- [ ] Pie chart en tiempo real de las respuestas
- [ ] Speaking: justificar usando target grammar
- [ ] Modo: multiplayer + proyectado

---

### Fase 10 — Portal del Padre & Reportes

> Objetivo: El padre ve en tiempo real el progreso de su hijo.

- [ ] **Dashboard del padre (web/móvil):**
  - Participación en clase (presencia, respuestas, engagement)
  - Resultados de juegos (puntajes, rankings, progreso)
  - Calificaciones actualizadas en tiempo real
  - Asistencia (presencial + remota)
  - Notificaciones push (desconexión, nota baja, logro desbloqueado)
- [ ] **Reportes automáticos:**
  - Reporte semanal enviado por email/WhatsApp
  - Gráficas de progreso por habilidad (grammar, vocab, reading, etc.)
  - Comparativa con el promedio de la clase (anónima)
  - Áreas de oportunidad identificadas por AI
- [ ] **Gamificación visible al padre:**
  - Badges/logros del estudiante
  - Streak de participación
  - Nivel y XP acumulado
  - Ranking (opcional, configurable por el colegio)

---

### Fase 11 — Split Screen + Sistema de Calificaciones

> Objetivo: El docente gestiona todo desde su celular. La pantalla refleja al instante.

- [ ] **Layout dividido** (split screen):
  - Panel principal (contenido/juego)
  - Panel lateral (lista de estudiantes + calificaciones)
  - Redimensionable con drag
  - Presets: 70/30, 50/50, solo juego, solo notas
- [ ] **Sistema de calificaciones nativo:**
  - Grid de estudiantes × actividades (como hoja de cálculo)
  - Entrada de notas desde celular del docente
  - Sincronización instantánea con la pantalla (Realtime)
  - Categorías: participación, quiz, tarea, examen, juegos
  - Cálculo automático de promedios ponderados
  - Auto-grade desde resultados de juegos
- [ ] Edición de nombres, observaciones desde el celular
- [ ] Indicador visual de cambios recientes (highlight animado)
- [ ] Exportación a formato del sistema de notas del colegio
- [ ] Historial de cambios (quién cambió qué, cuándo)

---

### Fase 12 — Video Remoto (LiveKit)

> Objetivo: El estudiante remoto es un ciudadano de primera clase en el salón.

- [ ] Integración con LiveKit SDK (ya hay tablas `livekit_rooms`, `livekit_participants`)
- [ ] Componente `RemoteStudentVideo`:
  - Thumbnail del estudiante remoto en un panel
  - Audio bidireccional (el estudiante escucha la clase, puede hablar)
  - Toggle de cámara/micrófono desde la pantalla del docente
- [ ] Layout adaptativo: el video se acomoda en el split screen
- [ ] Multi-estudiante: hasta N videos remotos simultáneos
- [ ] Indicador de calidad de conexión
- [ ] Fallback: si el video falla, se mantiene audio + avatar
- [ ] Grabación opcional de la sesión
- [ ] El estudiante remoto puede participar en los juegos igual que los presenciales
- [ ] Hand-raise virtual: el remoto "levanta la mano"

---

### Fase 13 — AI Integration

> Objetivo: Inteligencia artificial como copiloto del docente y tutor del estudiante.

- [ ] **Generación automática de contenido de juegos:**
  - AI genera preguntas adicionales basadas en el tema del día
  - Adapta dificultad según desempeño del grupo
  - Crea distractores inteligentes (errores comunes)
- [ ] **Feedback personalizado al estudiante:**
  - Después de cada juego, AI explica los errores
  - Sugiere práctica adicional en áreas débiles
  - Tono encouraging, alineado con valores cristianos
- [ ] **Asistente del docente:**
  - Sugiere qué juego usar según el contenido del día
  - Identifica estudiantes que necesitan atención
  - Resume el desempeño de la clase al final de la sesión
- [ ] **Evaluación de writing/speaking:**
  - AI evalúa respuestas abiertas (essays, speaking)
  - Rubric-based scoring automático
  - El docente aprueba/ajusta antes de publicar

---

## Arquitectura de datos existente (tablas relevantes)

| Tabla | Propósito |
|-------|-----------|
| `teachers` | Perfil del docente (nombre, email, school_id, roles) |
| `teacher_assignments` | Qué grado/sección/materia enseña + schedule JSONB |
| `schedule_slots` | Horarios por periodo (1st, 2nd, etc.) |
| `lesson_plans` | Planeaciones semanales con contenido JSONB por día |
| `school_monthly_principles` | Versículo/principio bíblico mensual |
| `news_projects` | Proyectos NEWS con principio bíblico por indicador |
| `classroom_sessions` | Sesiones activas de clase |
| `presence_events` | Registro de presencia |
| `livekit_rooms` / `livekit_participants` | Infraestructura de video |
| `student_activity_grades` | Calificaciones por actividad |
| `school_students` | Roster de estudiantes |
| `student_attendance` | Asistencia |

### Tablas nuevas necesarias

| Tabla | Propósito |
|-------|-----------|
| `game_sessions` | Sesión de juego activa (tipo, config, estado) |
| `game_participants` | Quién está jugando + puntaje en vivo |
| `game_results` | Resultados finales por estudiante por juego |
| `game_questions` | Pool de preguntas generadas (cache) |
| `student_achievements` | Badges, XP, streaks, niveles |
| `parent_accounts` | Cuentas de padres vinculadas a estudiantes |
| `parent_notifications` | Cola de notificaciones para padres |
| `grade_entries` | Registro granular de calificaciones |
| `grade_history` | Historial de cambios en notas |

---

## Stack tecnológico

- **Frontend:** React 19 + Vite 8
- **Backend/DB:** Supabase (PostgreSQL + Auth + Realtime + Storage + Edge Functions)
- **Video:** LiveKit (WebRTC SFU)
- **AI:** Claude API (generación de contenido, evaluación, feedback)
- **Audio:** Web Speech API (TTS + Speech Recognition)
- **Deploy:** GitHub Pages (estático) → migrar a Vercel/Cloudflare cuando se necesite SSR
- **Pantalla:** Optimizado para 55"-100" touch displays (Android/Windows)
- **Móvil:** PWA responsive (estudiantes + padres + docente)

---

## Principios de diseño

- **ABC del encuentro académico:** El tablero (Fecha, Tema, Objetivo, Principio Bíblico) NUNCA se borra durante la clase.
- **Eye-care:** Tema claro para salones iluminados. Sin fondos oscuros ni letras de colores neón.
- **Touch-first:** Botones mínimo 44px, sin hover-only interactions, soporte completo para gestos.
- **Offline-resilient:** Los juegos y contenido deben funcionar con conexión intermitente (cola de eventos).
- **Zero extra work for teachers:** Los juegos se alimentan automáticamente de las planeaciones existentes.
- **Data-driven:** Todo genera datos medibles. Cada interacción del estudiante se registra para analytics.
- **Parent-visible:** El padre puede ver el progreso sin necesidad de pedir reportes.
- **Inclusive:** El estudiante remoto participa exactamente igual que el presencial.
- **Joyful:** El aprendizaje debe ser divertido. Si el estudiante no quiere jugar, el juego falló.
