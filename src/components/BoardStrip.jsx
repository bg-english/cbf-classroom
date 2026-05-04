/**
 * BoardStrip — persistent compact bar showing class essentials.
 *
 * Always visible in moments 2-6 and tools mode.
 * Shows: date · topic · biblical principle/verse.
 * Never disappears during the class session.
 */
export default function BoardStrip({ todayKey, dayContent, plan, classroomData, subject, combinedGrade }) {
  const dateLabel = todayKey
    ? new Date(todayKey + 'T12:00:00').toLocaleDateString('es-CO', {
        weekday: 'long', day: 'numeric', month: 'long'
      })
    : ''

  const dayUnit = dayContent?.unit || subject || ''

  const principio = classroomData?.biblicalPrinciple
    || plan?.content?.objetivo?.principio
    || null

  const verseRef = classroomData?.indicatorVerseRef || null

  return (
    <div className="bs-strip">
      <div className="bs-item bs-date">
        <span className="bs-label">Fecha</span>
        <span className="bs-value">{dateLabel}</span>
      </div>

      <div className="bs-divider" />

      <div className="bs-item bs-grade">
        <span className="bs-label">Clase</span>
        <span className="bs-value">{combinedGrade} · {subject}</span>
      </div>

      {dayUnit && dayUnit !== subject && (
        <>
          <div className="bs-divider" />
          <div className="bs-item bs-topic">
            <span className="bs-label">Tema</span>
            <span className="bs-value">{dayUnit}</span>
          </div>
        </>
      )}

      {principio && (
        <>
          <div className="bs-divider" />
          <div className="bs-item bs-principle">
            <span className="bs-icon">✝</span>
            <span className="bs-value bs-verse-text">{principio}</span>
            {verseRef && <span className="bs-ref">{verseRef}</span>}
          </div>
        </>
      )}
    </div>
  )
}
