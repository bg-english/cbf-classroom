/**
 * BoardStrip — persistent compact bar showing class essentials.
 *
 * Board ritual (NEVER erased during class):
 *   1. Date
 *   2. Subject to be worked (topic)
 *   3. Lesson objective
 *   4. Biblical principle of the indicator
 *
 * Always visible in ALL moments and tools mode.
 * The biblical verse permeates the entire session — this bar is its anchor.
 * Never disappears during the class session.
 */
export default function BoardStrip({ todayKey, dayContent, plan, classroomData, subject, combinedGrade }) {
  const dateLabel = todayKey
    ? new Date(todayKey + 'T12:00:00').toLocaleDateString('es-CO', {
        weekday: 'long', day: 'numeric', month: 'long'
      })
    : ''

  // Tema: from day content or subject name
  const dayUnit = dayContent?.unit || subject || ''

  // Objetivo: from plan indicators or general objective
  const objetivo = plan?.content?.objetivo || {}
  const indicadores = objetivo.indicadores || []
  const objectiveText = Array.isArray(indicadores) && indicadores.length > 0
    ? (typeof indicadores[0] === 'string' ? indicadores[0] : indicadores[0]?.habilidad || indicadores[0]?.texto_en || '')
    : (objetivo.general || '')

  // Principio bíblico: from NEWS project, plan, or enriched data
  const principio = classroomData?.biblicalPrinciple
    || plan?.content?.objetivo?.principio
    || null

  const verseRef = classroomData?.indicatorVerseRef || null

  return (
    <div className="bs-strip">
      {/* 1. DATE */}
      <div className="bs-item bs-date">
        <span className="bs-label">Date</span>
        <span className="bs-value">{dateLabel}</span>
      </div>

      <div className="bs-divider" />

      {/* 2. SUBJECT TO BE WORKED */}
      <div className="bs-item bs-topic">
        <span className="bs-label">Topic</span>
        <span className="bs-value">{dayUnit || 'No topic assigned'}</span>
      </div>

      <div className="bs-divider" />

      {/* 3. LESSON OBJECTIVE */}
      <div className="bs-item bs-objective">
        <span className="bs-label">Objective</span>
        <span className="bs-value">{objectiveText || 'No objective assigned'}</span>
      </div>

      <div className="bs-divider" />

      {/* 4. BIBLICAL PRINCIPLE OF THE INDICATOR */}
      <div className="bs-item bs-principle">
        <span className="bs-label"><span className="bs-icon">✝</span> Biblical Principle</span>
        <span className="bs-value bs-verse-text">
          {principio || 'No principle assigned'}
          {verseRef && <span className="bs-ref"> — {verseRef}</span>}
        </span>
      </div>
    </div>
  )
}
