/**
 * QuestionBlock — pregunta prominente con espacio visual para respuesta.
 * Subtipos: discussion, tps (think-pair-share), individual, retórica.
 */

const SUBTYPE_LABELS = {
  discussion: { icon: '💬', label: 'Discusión en clase' },
  tps:        { icon: '👥', label: 'Think · Pair · Share' },
  individual: { icon: '✏️', label: 'Respuesta individual' },
  rhetorical: { icon: '🎯', label: 'Pregunta de reflexión' },
}

export default function QuestionBlock({ data, accent, emphasis }) {
  const { question, subtype = 'discussion', guidance } = data

  if (!question) return null

  const meta = SUBTYPE_LABELS[subtype] || SUBTYPE_LABELS.discussion

  return (
    <div
      className={`br-question br-emphasis-${emphasis}`}
      style={{ '--block-accent': accent }}
    >
      <div className="br-block-header">
        <span className="br-block-icon">{meta.icon}</span>
        <span className="br-block-label">{meta.label}</span>
      </div>

      <div className="br-question-text" style={{ borderLeftColor: accent }}>
        {question}
      </div>

      {subtype === 'individual' && (
        <div className="br-writing-area">
          {[0, 1, 2, 3].map(i => <div key={i} className="br-writing-line" />)}
        </div>
      )}

      {/* guidance es privado para el docente — solo cuando se activa modo docente */}
      {guidance && (
        <div className="br-question-guidance">
          <span className="br-guidance-label">💼 Docente:</span> {guidance}
        </div>
      )}
    </div>
  )
}
