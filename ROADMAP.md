# ClassroomOS — Roadmap

> Sistema de aula digital para Colegio Boston Flexible.  
> Pantalla interactiva para docentes que muestra planeaciones, juegos didácticos y herramientas en tiempo real.

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

### Fase 1 — Fundamentos en tiempo real
> Objetivo: El docente ve quién está conectado a la clase en tiempo real.

- [ ] Integrar Supabase Realtime Presence en la sesión de clase
- [ ] Canal de clase (broadcast) — el docente emite, los estudiantes reciben
- [ ] Componente `PresencePanel` en el TopBar o lateral:
  - Lista de estudiantes conectados (avatar + nombre)
  - Indicador visual online/offline/away
  - Timestamp de última actividad
  - Badge de "estudiante remoto" vs "presencial"
- [ ] Registro de eventos de presencia en tabla `presence_events`
- [ ] Alertas cuando un estudiante remoto se desconecta
- [ ] Endpoint o página web para que el estudiante "entre" a la clase desde su dispositivo

### Fase 2 — Juegos proyectados (pantalla del docente)
> Objetivo: Convertir SmartBlocks existentes en juegos interactivos para toda la clase.

- [ ] **Quiz Engine** que consume datos de SmartBlocks automáticamente
  - Transforma GRAMMAR/fill-blank → preguntas de completar
  - Transforma GRAMMAR/choose → preguntas de opción múltiple
  - Transforma VOCAB/matching → juego de asociación
  - Transforma READING/comprehension → quiz de comprensión
- [ ] **Modos de juego proyectados:**
  - Kahoot-style: pregunta con timer, 4 opciones con colores, animaciones
  - Spelling Bee: se muestra definición, clase dice la palabra
  - Grammar Race: completar oraciones contra reloj
  - Vocabulary Match: conectar palabras con definiciones
- [ ] Animaciones de respuesta correcta/incorrecta
- [ ] Tabla de posiciones (equipos o individual)
- [ ] Sonidos de countdown, victoria, error
- [ ] El docente controla el ritmo (siguiente pregunta manual o automático)

### Fase 3 — Juegos multiplayer (celulares de estudiantes)
> Objetivo: Cada estudiante juega desde su celular, resultados en vivo en la pantalla.

- [ ] Código de sala para unirse (6 dígitos, QR code)
- [ ] Interfaz móvil para el estudiante (responsive, solo opciones grandes)
- [ ] Sync de respuestas en tiempo real (Supabase Realtime)
- [ ] Leaderboard en vivo en pantalla del docente
- [ ] Power-ups y streak bonuses
- [ ] Resultados guardados en `student_activity_grades`
- [ ] Historial de partidas por clase
- [ ] Modo equipo vs individual

### Fase 4 — Split screen + Sistema de calificaciones
> Objetivo: El docente gestiona notas desde su celular y se reflejan en la pantalla.

- [ ] **Layout dividido** (split screen):
  - Panel principal (contenido/juego)
  - Panel lateral (lista de estudiantes + calificaciones)
  - Redimensionable con drag
- [ ] **Sistema de calificaciones nativo:**
  - Grid de estudiantes × actividades (como hoja de cálculo)
  - Entrada de notas desde celular del docente
  - Sincronización instantánea con la pantalla (Realtime)
  - Categorías: participación, quiz, tarea, examen
  - Cálculo automático de promedios
- [ ] Edición de nombres, observaciones desde el celular
- [ ] Indicador visual de cambios recientes (highlight animado)
- [ ] Exportación a formato compatible con el sistema de notas del colegio

### Fase 5 — Video remoto (LiveKit)
> Objetivo: El estudiante remoto aparece en la pantalla del salón, sin Google Meet/Classroom.

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
| `presence_events` | Registro de presencia (para Fase 1) |
| `livekit_rooms` / `livekit_participants` | Infraestructura de video (para Fase 5) |
| `student_activity_grades` | Calificaciones por actividad (para Fase 4) |
| `school_students` | Roster de estudiantes |
| `student_attendance` | Asistencia |

---

## Stack tecnológico

- **Frontend:** React 19 + Vite 8
- **Backend/DB:** Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Video:** LiveKit (WebRTC SFU)
- **Deploy:** GitHub Pages (estático) — considerar Vercel/Cloudflare para SSR si se necesita
- **Pantalla:** Optimizado para 55"-100" touch displays (Android/Windows)

---

## Notas de diseño

- **ABC del encuentro académico:** El tablero (Fecha, Tema, Objetivo, Principio Bíblico) NUNCA se borra durante la clase.
- **Eye-care:** Tema claro para salones iluminados. Sin fondos oscuros ni letras de colores neón.
- **Touch-first:** Botones mínimo 44px, sin hover-only interactions, soporte completo para gestos.
- **Offline-resilient:** Los juegos y contenido deben funcionar con conexión intermitente (cola de eventos).
