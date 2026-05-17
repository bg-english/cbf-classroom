/**
 * aiActions — per-moment quick action definitions.
 * Each action maps to a specific AI request (action + prompt template).
 */

const ACTIONS_EN = {
  1: [ // Topics
    { id: 'warmup',   icon: '🎯', label: 'Warm-up activity',   action: 'generate-blocks', prompt: 'Generate a short warm-up activity (hook pattern) related to the topic. Make it engaging and quick (2-3 minutes).' },
    { id: 'vocab',    icon: '🔤', label: 'Vocabulary preview',  action: 'generate-smartblock', prompt: 'Generate a vocabulary matching exercise with 6-8 key words related to the topic. Include definitions and example sentences.' },
  ],
  2: [ // Board
    { id: 'intro-q',  icon: '💬', label: 'Introductory question', action: 'generate-blocks', prompt: 'Generate a thought-provoking discussion question to introduce today\'s topic. Use the "question" block type with subtype "discussion".' },
    { id: 'simplify', icon: '✏️', label: 'Simplify objective',   action: 'generate-blocks', prompt: 'Rewrite the lesson objective in student-friendly language. Make it clear and measurable. Use an "explanation" block.' },
  ],
  3: [ // Motivation
    { id: 'hook',     icon: '🎣', label: 'Engagement hook',     action: 'generate-blocks', prompt: 'Generate an engaging hook activity (hook pattern) to grab students\' attention and connect to the topic. Include a detonating question.' },
    { id: 'tps',      icon: '💬', label: 'Think-Pair-Share',    action: 'generate-blocks', prompt: 'Generate a Think-Pair-Share activity related to the topic. Use the "pattern" block with patternId "think-pair-share". Include appropriate time allocations.' },
    { id: 'game',     icon: '🎮', label: 'Quick game',          action: 'generate-blocks', prompt: 'Generate a quick interactive game or competition activity related to the topic. Use a procedure block with clear steps. Keep it under 5 minutes.' },
  ],
  4: [ // Skill Development
    { id: 'practice', icon: '📝', label: 'Practice exercises',  action: 'generate-smartblock', prompt: 'Generate a fill-in-the-blank grammar exercise with 6 sentences targeting the topic/grammar point. Include correct answers.' },
    { id: 'explain',  icon: '💡', label: 'Explain concept',     action: 'generate-blocks', prompt: 'Generate a clear explanation of the key concept for this lesson. Use an explanation block with highlighted key terms. Make it visual and concise for large-screen projection.' },
    { id: 'drill',    icon: '🔄', label: 'Grammar drill',       action: 'generate-smartblock', prompt: 'Generate a multiple-choice grammar exercise with 6 items. Each item should have 3-4 options. Target the grammar point from the topic.' },
    { id: 'noticing', icon: '🔍', label: 'Guided noticing',     action: 'generate-blocks', prompt: 'Generate a guided-noticing pattern activity. Show 4-5 example sentences that demonstrate the grammar rule, then ask students to identify the pattern. Include the rule reveal.' },
  ],
  5: [ // Assignment
    { id: 'exit',     icon: '🎟️', label: 'Exit ticket',         action: 'generate-blocks', prompt: 'Generate an exit ticket (exit-ticket block) with a question that checks understanding of today\'s lesson. Use "thumbs" or "scale" response type.' },
    { id: 'quiz',     icon: '📋', label: 'Quick quiz',          action: 'generate-smartblock', prompt: 'Generate a quick 5-question multiple-choice quiz covering today\'s lesson content. Use GRAMMAR/choose format.' },
    { id: '321',      icon: '3️⃣', label: '3-2-1 Reflection',    action: 'generate-blocks', prompt: 'Generate a three-two-one reflection activity using the "pattern" block with patternId "three-two-one". Customize the prompts to today\'s topic.' },
  ],
  6: [ // Closing
    { id: 'close-q',  icon: '🤔', label: 'Closing question',    action: 'generate-blocks', prompt: 'Generate a reflective closing question that helps students consolidate what they learned today. Use a "question" block with subtype "discussion".' },
    { id: 'summary',  icon: '📄', label: 'Lesson summary',      action: 'generate-blocks', prompt: 'Generate a concise visual summary of today\'s lesson using key-points format. Use an explanation block with the main takeaways (3-4 points max).' },
    { id: 'bible',    icon: '✝',  label: 'Biblical connection',  action: 'generate-blocks', prompt: 'Generate a natural connection between today\'s topic and the biblical principle. Use a question block that helps students reflect on how the principle applies. Keep it authentic, not forced.' },
  ],
}

const ACTIONS_ES = {
  1: [
    { id: 'warmup',   icon: '🎯', label: 'Actividad de apertura', action: 'generate-blocks', prompt: 'Genera una actividad corta de apertura (patrón hook) relacionada con el tema. Que sea atractiva y rápida (2-3 minutos).' },
    { id: 'vocab',    icon: '🔤', label: 'Preview de vocabulario', action: 'generate-smartblock', prompt: 'Genera un ejercicio de vocabulario con 6-8 palabras clave del tema. Incluye definiciones y oraciones de ejemplo.' },
  ],
  2: [
    { id: 'intro-q',  icon: '💬', label: 'Pregunta introductoria', action: 'generate-blocks', prompt: 'Genera una pregunta de discusión provocadora para introducir el tema de hoy. Usa bloque tipo "question" con subtipo "discussion".' },
    { id: 'simplify', icon: '✏️', label: 'Simplificar objetivo',   action: 'generate-blocks', prompt: 'Reescribe el objetivo de la lección en lenguaje amigable para estudiantes. Que sea claro y medible. Usa un bloque "explanation".' },
  ],
  3: [
    { id: 'hook',     icon: '🎣', label: 'Enganche',              action: 'generate-blocks', prompt: 'Genera una actividad de enganche (patrón hook) para captar la atención de los estudiantes y conectar con el tema. Incluye una pregunta detonante.' },
    { id: 'tps',      icon: '💬', label: 'Think-Pair-Share',       action: 'generate-blocks', prompt: 'Genera una actividad Think-Pair-Share relacionada con el tema. Usa bloque "pattern" con patternId "think-pair-share". Incluye tiempos apropiados.' },
    { id: 'game',     icon: '🎮', label: 'Juego rápido',           action: 'generate-blocks', prompt: 'Genera un juego rápido interactivo relacionado con el tema. Usa un bloque procedure con pasos claros. Que no dure más de 5 minutos.' },
  ],
  4: [
    { id: 'practice', icon: '📝', label: 'Ejercicios de práctica', action: 'generate-smartblock', prompt: 'Genera un ejercicio de completar espacios en blanco con 6 oraciones sobre el tema/punto gramatical. Incluye respuestas correctas.' },
    { id: 'explain',  icon: '💡', label: 'Explicar concepto',      action: 'generate-blocks', prompt: 'Genera una explicación clara del concepto clave de la lección. Usa un bloque explanation con términos clave resaltados. Conciso y visual para proyección.' },
    { id: 'drill',    icon: '🔄', label: 'Ejercicio de práctica',  action: 'generate-smartblock', prompt: 'Genera un ejercicio de selección múltiple con 6 ítems. Cada ítem con 3-4 opciones. Apunta al punto gramatical del tema.' },
    { id: 'noticing', icon: '🔍', label: 'Guided noticing',        action: 'generate-blocks', prompt: 'Genera una actividad guided-noticing. Muestra 4-5 oraciones ejemplo que demuestren la regla gramatical, luego pide a los estudiantes identificar el patrón. Incluye la regla.' },
  ],
  5: [
    { id: 'exit',     icon: '🎟️', label: 'Exit ticket',           action: 'generate-blocks', prompt: 'Genera un exit ticket (bloque exit-ticket) con una pregunta que verifique la comprensión de la lección de hoy. Usa responseType "thumbs" o "scale".' },
    { id: 'quiz',     icon: '📋', label: 'Quiz rápido',            action: 'generate-smartblock', prompt: 'Genera un quiz rápido de 5 preguntas de selección múltiple sobre el contenido de hoy. Usa formato GRAMMAR/choose.' },
    { id: '321',      icon: '3️⃣', label: 'Reflexión 3-2-1',       action: 'generate-blocks', prompt: 'Genera una actividad de reflexión tres-dos-uno usando bloque "pattern" con patternId "three-two-one". Personaliza los prompts al tema de hoy.' },
  ],
  6: [
    { id: 'close-q',  icon: '🤔', label: 'Pregunta de cierre',    action: 'generate-blocks', prompt: 'Genera una pregunta reflexiva de cierre que ayude a los estudiantes a consolidar lo aprendido. Usa bloque "question" con subtipo "discussion".' },
    { id: 'summary',  icon: '📄', label: 'Resumen de la lección',  action: 'generate-blocks', prompt: 'Genera un resumen visual conciso de la lección usando formato de puntos clave. Usa un bloque explanation con los principales aprendizajes (3-4 puntos máximo).' },
    { id: 'bible',    icon: '✝',  label: 'Conexión bíblica',      action: 'generate-blocks', prompt: 'Genera una conexión natural entre el tema de hoy y el principio bíblico. Usa un bloque question que ayude a los estudiantes a reflexionar. Que sea auténtico, no forzado.' },
  ],
}

export function getQuickActions(momentId, language) {
  const actions = language === 'English' ? ACTIONS_EN : ACTIONS_ES
  return actions[momentId] || []
}
