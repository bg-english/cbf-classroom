import { useState, useEffect } from 'react'
import { getCurrentPeriod } from '../utils/periodUtils'

/**
 * PersistentHeader — always-visible top section (full width).
 * Row 1: Biblical verse — full text, wraps, tappable
 * Row 2: Clock · Date | Topic | Objective — all fully visible, no truncation
 */
export default function PersistentHeader({
  todayKey, dayContent, plan, classroomData,
  subject, combinedGrade, moment,
  onVerseSpotlight, t,
}) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const tick = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(tick)
  }, [])

  const dateLabel = todayKey
    ? new Date(todayKey + 'T12:00:00').toLocaleDateString('es-CO', {
        weekday: 'long', day: 'numeric', month: 'long',
      })
    : ''

  const dayUnit = dayContent?.unit || subject || ''

  const objetivo    = plan?.content?.objetivo || {}
  const indicadores = objetivo.indicadores || []
  const objectiveText = Array.isArray(indicadores) && indicadores.length > 0
    ? (typeof indicadores[0] === 'string'
        ? indicadores[0]
        : indicadores[0]?.habilidad || indicadores[0]?.texto_en || '')
    : (objetivo.general || '')

  const principio = classroomData?.biblicalPrinciple || objetivo.principio || null
  const verseRef  = classroomData?.indicatorVerseRef || null

  const clock = time.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

  const accent = moment?.color || 'var(--accent)'

  return (
    <div className="ph-header" style={{ '--ph-accent': accent }}>

      {/* ── ROW 1: Verse — full width, wraps completely ── */}
      <div
        className={`ph-verse-row ${principio ? 'ph-verse-tappable' : ''}`}
        onClick={principio
          ? () => onVerseSpotlight?.({ text: principio, ref: verseRef, label: t.bsPrinciple })
          : undefined}
        role={principio ? 'button' : undefined}
      >
        <span className="ph-verse-icon">✝</span>
        <span className="ph-verse-text">
          {principio || t.bsNoPrinciple}
          {verseRef && <span className="ph-verse-ref"> — {verseRef}</span>}
        </span>
        {principio && <span className="ph-verse-expand" aria-hidden="true">↗</span>}
      </div>

      {/* ── ROW 2: Clock·Date | Topic | Objective ── */}
      <div className="ph-info-row" style={{ borderTopColor: accent }}>

        {/* Clock + Date */}
        <div className="ph-info-block ph-datetime-block">
          <span className="ph-clock">{clock}</span>
          {dateLabel && <span className="ph-date">{dateLabel}</span>}
        </div>

        <div className="ph-info-divider" />

        {/* Topic */}
        <div className="ph-info-block">
          <span className="ph-info-label">{t.bsTopic}</span>
          <span className="ph-info-value">{dayUnit || t.bsNoTopic}</span>
        </div>

        <div className="ph-info-divider" />

        {/* Objective */}
        <div className="ph-info-block ph-objective-block">
          <span className="ph-info-label">{t.bsObjective}</span>
          <span className="ph-info-value">{objectiveText || t.bsNoObjective}</span>
        </div>

      </div>
    </div>
  )
}
