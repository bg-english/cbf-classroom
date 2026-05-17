/**
 * locale.js — Bilingual UI strings for ClassroomOS.
 *
 * English for MODELO_B subjects (Language Arts, Social Studies, Science, Lingua Skill).
 * Spanish for all other subjects.
 */

const ENGLISH_SUBJECTS = ['Language Arts', 'Social Studies', 'Science', 'Lingua Skill']

export function isEnglishSubject(subject) {
  return ENGLISH_SUBJECTS.includes(subject)
}

const strings = {
  en: {
    // Navigation
    prev: '← Previous',
    next: 'Next →',
    endClass: '✓ End class',
    noGuide: 'No guide this week',

    // Empty states
    noContent: 'No content for',
    createGuideHint: 'Create a guide in CBF Planner for it to appear here.',
    noContentToday: 'The guide "{range}" has no content for today.',
    emptySectionHint: 'This section is empty in the guide. Edit it in CBF Planner.',

    // M2 Board
    classBoard: 'Class Board',
    doNotErase: 'Do NOT erase during the class',
    date: 'Date',
    gradeSubject: 'Grade · Subject',
    topicOfDay: 'Topic of the Day',
    objective: 'Objective / Indicator',
    noTopicAssigned: 'No topic assigned',
    noObjectiveAssigned: 'No objective assigned',
    biblicalPrinciple: '✝ Biblical Principle',

    // BoardStrip
    bsDate: 'Date',
    bsTopic: 'Topic',
    bsObjective: 'Objective',
    bsPrinciple: 'Biblical Principle',
    bsNoTopic: 'No topic assigned',
    bsNoObjective: 'No objective assigned',
    bsNoPrinciple: 'No principle assigned',

    // WBT
    wbtTitle: 'Whole Brain Teaching — Class Rules',
    wbtRules: [
      '1 · Follow instructions quickly',
      '2 · Raise your hand to speak',
      '3 · Raise your hand to stand',
      '4 · Make smart choices',
      '5 · Be kind to your classmates',
    ],
    priorKnowledge: 'Prior knowledge:',
    priorKnowledgeQ: 'What did we learn last class?',

    // Biblical cards
    bibPrincipleMonth: '✝ Biblical Principle of the Month — 5 min',
    bibClosingReflection: '✝ Biblical Closing Reflection',
    bibClosingPrompt: 'Connect today\'s learning with the biblical principle as a natural class closing.',

    // Apertura
    verseYear: '✝ Verse of the Year',
    verseMonth: '📅 Verse of the Month',
    verseGuide: '📖 Guide Verse',
    principleIndicator: '🎯 Indicator Principle',
    project: 'Project',
    reflection: 'Reflection:',
    vocabList: '📋 Vocabulary List',
    configureVersesHint: 'Set up the yearly verse in Settings and the monthly verse in Principles within CBF Planner.',

    // Interactive
    interactiveActivity: 'Interactive Activity',

    // TopBar menu
    whiteboard: 'Whiteboard',
    tools: 'Tools',
    exitFullscreen: '⊡ Exit fullscreen',
    enterFullscreen: '⊞ Fullscreen',
    changeClass: '🔄 Change class',
    signOut: '↩ Sign out',

    // AI Panel
    aiTitle: 'AI Assistant',
    aiPlaceholder: 'What do you need for the class?',
    aiGenerating: 'Generating...',
    aiCancel: 'Cancel',
    aiPreview: 'Preview',
    aiProject: 'Project to screen',
    aiRegenerate: 'Regenerate',
    aiRefine: 'Refine',
    aiDiscard: 'Discard',
    aiRefinePrompt: 'How would you like to modify this?',
    aiGenerated: 'AI Generated',

    // Loading
    loading: 'Loading classroom...',
  },

  es: {
    prev: '← Anterior',
    next: 'Siguiente →',
    endClass: '✓ Finalizar clase',
    noGuide: 'Sin guía esta semana',

    noContent: 'No hay contenido para',
    createGuideHint: 'Crea una guía en CBF Planner para que aparezca aquí.',
    noContentToday: 'La guía "{range}" no tiene contenido para hoy.',
    emptySectionHint: 'Esta sección está vacía en la guía. Edítala en CBF Planner.',

    classBoard: 'Tablero de Clase',
    doNotErase: 'No borrar durante la clase',
    date: 'Fecha',
    gradeSubject: 'Grado · Materia',
    topicOfDay: 'Tema del Día',
    objective: 'Objetivo / Indicador',
    noTopicAssigned: 'Sin tema asignado',
    noObjectiveAssigned: 'Sin objetivo asignado',
    biblicalPrinciple: '✝ Principio Bíblico',

    bsDate: 'Fecha',
    bsTopic: 'Tema',
    bsObjective: 'Objetivo',
    bsPrinciple: 'Principio Bíblico',
    bsNoTopic: 'Sin tema asignado',
    bsNoObjective: 'Sin objetivo asignado',
    bsNoPrinciple: 'Sin principio asignado',

    wbtTitle: 'Whole Brain Teaching — Reglas de Clase',
    wbtRules: [
      '1 · Sigue instrucciones rápido',
      '2 · Levanta la mano para hablar',
      '3 · Levanta la mano para pararte',
      '4 · Toma decisiones inteligentes',
      '5 · Sé amable con tus compañeros',
    ],
    priorKnowledge: 'Pre-conocimiento:',
    priorKnowledgeQ: '¿Qué aprendimos en la clase anterior?',

    bibPrincipleMonth: '✝ Principio Bíblico del Mes — 5 min',
    bibClosingReflection: '✝ Reflexión Bíblica de Cierre',
    bibClosingPrompt: 'Conecta el aprendizaje de hoy con el principio bíblico como cierre natural de la clase.',

    verseYear: '✝ Versículo del Año',
    verseMonth: '📅 Versículo del Mes',
    verseGuide: '📖 Versículo de la Guía',
    principleIndicator: '🎯 Principio del Indicador',
    project: 'Proyecto',
    reflection: 'Reflexión:',
    vocabList: '📋 Lista de Vocabulario',
    configureVersesHint: 'Configura el versículo del año en Ajustes y el versículo del mes en Principios dentro de CBF Planner.',

    interactiveActivity: 'Actividad Interactiva',

    whiteboard: 'Pizarra',
    tools: 'Herramientas',
    exitFullscreen: '⊡ Salir de pantalla completa',
    enterFullscreen: '⊞ Pantalla completa',
    changeClass: '🔄 Cambiar clase',
    signOut: '↩ Salir',

    // AI Panel
    aiTitle: 'Asistente IA',
    aiPlaceholder: '¿Qué necesitas para la clase?',
    aiGenerating: 'Generando...',
    aiCancel: 'Cancelar',
    aiPreview: 'Vista previa',
    aiProject: 'Proyectar en pantalla',
    aiRegenerate: 'Regenerar',
    aiRefine: 'Refinar',
    aiDiscard: 'Descartar',
    aiRefinePrompt: '¿Cómo quieres modificar esto?',
    aiGenerated: 'Generado con IA',

    loading: 'Cargando aula...',
  },
}

export function getLocale(subject) {
  return isEnglishSubject(subject) ? strings.en : strings.es
}
