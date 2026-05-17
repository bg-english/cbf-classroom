# ClassroomOS — Roadmap

## Completado

- UI limpia: sin ETA, datos duplicados ni comentarios internos
- Navegacion por dots, grado centrado, M3 WBT Rules como sub-paso
- Escalado fluido clamp() para 15"-100"
- Bilingue: ingles Modelo B / espanol resto
- AIPanel tap-only: tabs Visual / Actividades / Video
- 7 formatos visuales con VisualRenderer CSS puro
- Edge Function ai-classroom -> Claude API SSE streaming
- Tab Video: busqueda YouTube automatica por tema, iframe en canvas
- GamesPanel: Temporizador / Ruleta / Marcador de equipos

## Proximo — Integracion Examen CBF Planner (Opcion C)

Ambas apps comparten Supabase vouxrqsiyoyllxgcriic.
Flujo: Momento 5 -> profesor lanza examen -> estudiantes responden
en sus dispositivos (CBF Planner) -> docente monitorea en pantalla grande.

PENDIENTE: Confirmar URL de produccion del CBF Planner.

Por construir:
- ExamLauncher.jsx: busca exam_sessions activas del grado/materia
- Pantalla grande: codigo de acceso + QR code + URL del planner
- ExamMonitor.jsx: Supabase Realtime en exam_instances
  (conectados / enviados / alertas de integridad high_risk)
- Boton en Momento 5 para abrir el launcher

## Juegos Interactivos (por implementar)

- Sopa de Letras: AI genera vocabulario, grid de letras, tap para seleccionar
- Ahorcado: AI elige palabra del tema, adivinan letra por letra en pantalla
- Ordenacion de Frases: frases desordenadas + timer visual

## Embeds Educativos (por implementar)

Panel de recursos web por materia (iframes):
- Anatomia / partes del cuerpo interactivo
- Quimica: tabla periodica, moleculas
- Mapas geograficos interactivos
URLs precargadas y filtrables por materia y grado

## Backlog

- Historial 5 generaciones AI por sesion
- Voice input (Web Speech API)
- Guardar contenido AI en la guia
- Flash cards vocabulario con flip animation
- Quiz interactivo con timer por pregunta
- Tabla ai_usage Supabase para analytics
