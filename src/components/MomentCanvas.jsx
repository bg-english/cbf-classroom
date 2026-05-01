import AperturaDevocional from './AperturaDevocional'

/**
 * MomentCanvas — renders the appropriate content for each of the 5 moments.
 *
 * Momento 1 (Apertura): AperturaDevocional — versículos + tablero digital
 * Momentos 2–5: HTML content from lesson_plan sections
 */
export default function MomentCanvas({
  moment, sectionContent, plan, dayContent, classroomData,
  todayKey, combinedGrade, subject,
  onNext, onPrev, isFirst, isLast
}) {
  return (
    <main className="cc-canvas" style={{ '--moment-color': moment.color }}>

      {/* Moment header */}
      <div className="cc-canvas-header">
        <div className="cc-canvas-moment-badge" style={{ background: moment.color }}>
          Momento {moment.id}
        </div>
        <h2 className="cc-canvas-moment-title">{moment.label}</h2>
        {sectionContent?.time && (
          <span className="cc-canvas-time">⏱ {sectionContent.time} min</span>
        )}
      </div>

      {/* Content area */}
      <div className="cc-canvas-content">
        {moment.id === 1 ? (
          <AperturaDevocional
            classroomData={classroomData}
            plan={plan}
            dayContent={dayContent}
            todayKey={todayKey}
            combinedGrade={combinedGrade}
            subject={subject}
          />
        ) : (
          <SectionContent
            moment={moment}
            sectionContent={sectionContent}
            plan={plan}
            dayContent={dayContent}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="cc-canvas-nav">
        <button
          className="cc-nav-btn cc-nav-prev"
          onClick={onPrev}
          disabled={isFirst}
        >
          ← Anterior
        </button>

        <div className="cc-canvas-plan-info">
          {plan ? (
            <span className="cc-plan-label">
              {plan.date_range || `Semana ${plan.week_number}`}
            </span>
          ) : (
            <span className="cc-plan-label cc-plan-none">Sin guía esta semana</span>
          )}
        </div>

        <button
          className="cc-nav-btn cc-nav-next"
          onClick={onNext}
          disabled={isLast}
          style={{ background: moment.color }}
        >
          {isLast ? '✓ Finalizar clase' : 'Siguiente →'}
        </button>
      </div>
    </main>
  )
}

/**
 * SectionContent — renders HTML content from lesson_plan for moments 2–5
 */
function SectionContent({ moment, sectionContent, plan, dayContent }) {
  const hasContent = sectionContent?.content && sectionContent.content !== '<p></p>'

  if (hasContent) {
    return (
      <div className="sc-container">
        <div
          className="cc-rich-content"
          dangerouslySetInnerHTML={{ __html: sectionContent.content }}
        />

        {/* Images */}
        {sectionContent.images?.length > 0 && (
          <div className={`sc-images sc-images-${sectionContent.images.length}`}>
            {sectionContent.images.map((img, i) => (
              <img key={i} src={img.url} alt={img.caption || ''} className="sc-image" />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="cc-canvas-empty">
      <div className="cc-canvas-empty-icon" style={{ color: moment.color }}>
        {MOMENT_ICONS[moment.id] || '📋'}
      </div>
      <p>No hay contenido para <strong>{moment.label}</strong>.</p>
      {!plan && (
        <p className="cc-canvas-empty-hint">
          Crea una guía en CBF Planner para que aparezca aquí.
        </p>
      )}
      {plan && !dayContent && (
        <p className="cc-canvas-empty-hint">
          La guía <em>{plan.date_range}</em> no tiene contenido para hoy.
        </p>
      )}
      {plan && dayContent && (
        <p className="cc-canvas-empty-hint">
          Esta sección está vacía en la guía. Edítala en CBF Planner.
        </p>
      )}
    </div>
  )
}

const MOMENT_ICONS = {
  1: '✝',
  2: '🗒',
  3: '⚡',
  4: '🎯',
  5: '🚪',
}
