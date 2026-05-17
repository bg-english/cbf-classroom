/** BoardStrip — persistent bar: date · topic · objective · biblical principle. */
export default function BoardStrip({ todayKey, dayContent, plan, classroomData, subject, combinedGrade, t }) {
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
        <span className="bs-label">{t.bsDate}</span>
        <span className="bs-value">{dateLabel}</span>
      </div>

      <div className="bs-divider" />

      {/* 2. SUBJECT TO BE WORKED */}
      <div className="bs-item bs-topic">
        <span className="bs-label">{t.bsTopic}</span>
        <span className="bs-value">{dayUnit || t.bsNoTopic}</span>
      </div>

      <div className="bs-divider" />

      {/* 3. LESSON OBJECTIVE */}
      <div className="bs-item bs-objective">
        <span className="bs-label">{t.bsObjective}</span>
        <span className="bs-value">{objectiveText || t.bsNoObjective}</span>
      </div>

      <div className="bs-divider" />

      {/* 4. BIBLICAL PRINCIPLE OF THE INDICATOR */}
      <div className="bs-item bs-principle">
        <span className="bs-label"><span className="bs-icon">✝</span> {t.bsPrinciple}</span>
        <span className="bs-value bs-verse-text">
          {principio || t.bsNoPrinciple}
          {verseRef && <span className="bs-ref"> — {verseRef}</span>}
        </span>
      </div>
    </div>
  )
}
