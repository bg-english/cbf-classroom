/**
 * BoardStrip — persistent compact bar showing class essentials.
 *
 * ABC del encuentro académico: "Escribe lo siguiente en el tablero
 * (no borrar durante la clase)":
 *   1. Fecha
 *   2. El tema a desarrollar
 *   3. Objetivo de la lección
 *   4. Principio bíblico
 *
 * Always visible in moments 2-6 and tools mode.
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
      {/* 1. FECHA */}
      <div className="bs-item bs-date">
        <span className="bs-label">Fecha</span>
        <span className="bs-value">{dateLabel}</span>
      </div>

      <div className="bs-divider" />

      {/* 2. TEMA A DESARROLLAR */}
      <div className="bs-item bs-topic">
        <span className="bs-label">Tema</span>
        <span className="bs-value">{dayUnit || 'Sin tema asignado'}</span>
      </div>

      <div className="bs-divider" />

      {/* 3. OBJETIVO DE LA LECCIÓN */}
      <div className="bs-item bs-objective">
        <span className="bs-label">Objetivo</span>
        <span className="bs-value">{objectiveText || 'Sin objetivo asignado'}</span>
      </div>

      <div className="bs-divider" />

      {/* 4. PRINCIPIO BÍBLICO */}
      <div className="bs-item bs-principle">
        <span className="bs-label"><span className="bs-icon">✝</span> Principio Bíblico</span>
        <span className="bs-value bs-verse-text">
          {principio || 'Sin principio asignado'}
          {verseRef && <span className="bs-ref"> — {verseRef}</span>}
        </span>
      </div>
    </div>
  )
}
