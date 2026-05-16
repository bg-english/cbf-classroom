/**
 * ProcedureBlock — timeline vertical con iconos de acción.
 * Los estudiantes pueden seguir los pasos de manera independiente.
 */

const ACTION_ICONS = {
  listen:  { icon: '👂', label: 'Escucha' },
  read:    { icon: '📖', label: 'Lee' },
  write:   { icon: '✏️', label: 'Escribe' },
  speak:   { icon: '🗣️', label: 'Habla' },
  observe: { icon: '👀', label: 'Observa' },
  think:   { icon: '🧠', label: 'Piensa' },
  do:      { icon: '👐', label: 'Haz' },
  check:   { icon: '✔️', label: 'Verifica' },
}

export default function ProcedureBlock({ data, accent, emphasis }) {
  const { steps = [], title } = data

  if (!steps.length) return null

  return (
    <div
      className={`br-procedure br-emphasis-${emphasis}`}
      style={{ '--block-accent': accent }}
    >
      <div className="br-block-header">
        <span className="br-block-icon">📋</span>
        <span className="br-block-label">{title || 'Procedimiento'}</span>
        <span className="br-block-chip">{steps.length} pasos</span>
      </div>

      <ol className="br-steps">
        {steps.map((step, i) => {
          const action = ACTION_ICONS[step.action] || { icon: '▶', label: step.action || '' }
          return (
            <li key={i} className="br-step">
              <div className="br-step-num" style={{ background: accent }}>
                {i + 1}
              </div>
              <div className="br-step-action" title={action.label}>
                {action.icon}
              </div>
              <div className="br-step-text">{step.text}</div>
              {step.duration && (
                <span className="br-step-duration">⏱ {step.duration}</span>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
