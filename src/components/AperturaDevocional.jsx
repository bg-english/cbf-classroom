/**
 * AperturaDevocional — Momento 1
 *
 * Implementa el ABC del encuentro académico Boston Flex:
 * 1. Saludo + Principio Bíblico
 * 2. Tablero: Fecha · Tema · Objetivo · Principio Bíblico · Reglas
 * 3. Versículo del Año + Versículo del Mes
 *
 * Datos desde: schools.year_verse · school_monthly_principles · news_projects
 */
export default function AperturaDevocional({ classroomData, plan, dayContent, todayKey, combinedGrade, subject }) {
  const objetivo = plan?.content?.objetivo || {}
  const indicadores = objetivo.indicadores || []
  const principio = objetivo.principio || null
  const guideVerse = plan?.content?.verse || null

  const dateLabel = todayKey
    ? new Date(todayKey + 'T12:00:00').toLocaleDateString('es-CO', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      })
    : ''

  // Get topic from dayContent
  const dayUnit = dayContent?.sections?.subject?.content
    ? stripHtml(dayContent.sections.subject.content).slice(0, 120)
    : (dayContent?.unit || subject || '')

  // Get first indicator text
  const firstIndicator = Array.isArray(indicadores) && indicadores.length > 0
    ? (typeof indicadores[0] === 'string' ? indicadores[0] : indicadores[0]?.habilidad || indicadores[0]?.texto_en || '')
    : (objetivo.general || '')

  return (
    <div className="ap-container">

      {/* ── VERSÍCULOS ── */}
      <div className="ap-verses">

        {/* Versículo del Año */}
        {classroomData?.yearVerse && (
          <div className="ap-verse ap-verse-year">
            <div className="ap-verse-badge">✝ Versículo del Año</div>
            <blockquote
              className="ap-verse-text"
              dangerouslySetInnerHTML={{ __html: classroomData.yearVerse }}
            />
            {classroomData.yearVerseRef && (
              <cite className="ap-verse-ref">{classroomData.yearVerseRef}</cite>
            )}
          </div>
        )}

        {/* Versículo del Mes */}
        {classroomData?.monthVerse && (
          <div className="ap-verse ap-verse-month">
            <div className="ap-verse-badge">📅 Versículo del Mes</div>
            <blockquote
              className="ap-verse-text"
              dangerouslySetInnerHTML={{ __html: classroomData.monthVerse }}
            />
            {classroomData.monthVerseRef && (
              <cite className="ap-verse-ref">{classroomData.monthVerseRef}</cite>
            )}
          </div>
        )}

        {/* Versículo de la Guía Semanal */}
        {guideVerse?.text && (
          <div className="ap-verse ap-verse-guide">
            <div className="ap-verse-badge">��� Versículo de la Guía</div>
            <blockquote className="ap-verse-text">{guideVerse.text}</blockquote>
            {guideVerse.ref && (
              <cite className="ap-verse-ref">{guideVerse.ref}</cite>
            )}
          </div>
        )}

        {/* Principio Bíblico del Indicador */}
        {classroomData?.biblicalPrinciple && (
          <div className="ap-verse ap-verse-indicator">
            <div className="ap-verse-badge">🎯 Principio del Indicador</div>
            {classroomData.newsProjectTitle && (
              <div className="ap-verse-project">Proyecto: {classroomData.newsProjectTitle}</div>
            )}
            <blockquote className="ap-verse-text">
              {classroomData.biblicalPrinciple}
            </blockquote>
            {classroomData.indicatorVerseRef && (
              <cite className="ap-verse-ref">{classroomData.indicatorVerseRef}</cite>
            )}
            {classroomData.biblicalReflection && (
              <div className="ap-verse-reflection">
                <span>💬 Reflexión:</span> {classroomData.biblicalReflection}
              </div>
            )}
          </div>
        )}

        {/* Principio del plan (fallback) */}
        {!classroomData?.biblicalPrinciple && principio && (
          <div className="ap-verse ap-verse-indicator">
            <div className="ap-verse-badge">🎯 Principio del Indicador</div>
            <blockquote className="ap-verse-text">{principio}</blockquote>
          </div>
        )}

        {/* Fallback — sin datos configurados */}
        {!classroomData?.yearVerse && !classroomData?.monthVerse && !guideVerse?.text && !classroomData?.biblicalPrinciple && !principio && (
          <div className="ap-empty-verses">
            <div className="ap-empty-icon">✝</div>
            <p>Configura el versículo del año en <strong>Ajustes</strong> y el versículo del mes en <strong>Principios</strong> dentro de CBF Planner.</p>
          </div>
        )}
      </div>

      {/* ── VOCABULARY LIST (contenido del encuentro) ── */}
      {dayContent?.sections?.subject?.content &&
       dayContent.sections.subject.content !== '<p></p>' && (
        <div className="ap-section-content">
          <div className="ap-section-label">📋 Lista de Vocabulario</div>
          <div
            className="cc-rich-content"
            dangerouslySetInnerHTML={{ __html: dayContent.sections.subject.content }}
          />
        </div>
      )}
    </div>
  )
}

function stripHtml(html) {
  return html?.replace(/<[^>]*>/g, '') || ''
}
