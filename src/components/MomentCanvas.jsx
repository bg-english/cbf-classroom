/**
 * MomentCanvas — the main content area.
 * Phase 0/1: renders lesson plan section content (HTML from RichEditor).
 * Phase 2: adds whiteboard, split-screen, slides modes.
 */
export default function MomentCanvas({
  moment, sectionContent, plan, dayContent,
  onNext, onPrev, isFirst, isLast
}) {
  const hasContent = sectionContent?.content && sectionContent.content !== '<p></p>'

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
        {hasContent ? (
          <div
            className="cc-rich-content"
            dangerouslySetInnerHTML={{ __html: sectionContent.content }}
          />
        ) : (
          <div className="cc-canvas-empty">
            <div className="cc-canvas-empty-icon">📋</div>
            <p>No hay contenido para este momento.</p>
            {!plan && (
              <p className="cc-canvas-empty-hint">
                Crea una guía en CBF Planner para que aparezca aquí.
              </p>
            )}
            {plan && !dayContent && (
              <p className="cc-canvas-empty-hint">
                La guía existe pero no tiene contenido para hoy ({plan.date_range}).
              </p>
            )}
          </div>
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
          {isLast ? 'Finalizar clase' : 'Siguiente →'}
        </button>
      </div>
    </main>
  )
}
