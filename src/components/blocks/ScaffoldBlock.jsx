import { useState } from 'react'
import BlockRenderer from './BlockRenderer'

/**
 * ScaffoldBlock — tres fases del scaffold de instrucción.
 * Tabs: I DO (modelo) → WE DO (práctica guiada) → YOU DO (producción).
 * Cada fase contiene su propio array de bloques.
 */

const PHASES = [
  { key: 'i-do',   label: 'I DO',   emoji: '🎓', desc: 'Modelo del docente' },
  { key: 'we-do',  label: 'WE DO',  emoji: '🤝', desc: 'Práctica guiada' },
  { key: 'you-do', label: 'YOU DO', emoji: '⚡', desc: 'Producción independiente' },
]

export default function ScaffoldBlock({ data, accent, emphasis }) {
  const { phases = {} } = data
  const [activePhase, setActivePhase] = useState('i-do')

  const current = PHASES.find(p => p.key === activePhase)
  const phaseBlocks = phases[activePhase]?.blocks || []

  return (
    <div
      className={`br-scaffold br-emphasis-${emphasis}`}
      style={{ '--block-accent': accent }}
    >
      {/* Phase tabs */}
      <div className="br-scaffold-tabs">
        {PHASES.map(phase => {
          const hasContent = (phases[phase.key]?.blocks || []).length > 0
          return (
            <button
              key={phase.key}
              className={`br-scaffold-tab ${activePhase === phase.key ? 'br-tab-active' : ''} ${!hasContent ? 'br-tab-empty' : ''}`}
              style={activePhase === phase.key ? { borderBottomColor: accent, color: accent } : {}}
              onClick={() => setActivePhase(phase.key)}
            >
              <span className="br-tab-emoji">{phase.emoji}</span>
              <span className="br-tab-label">{phase.label}</span>
              <span className="br-tab-desc">{phase.desc}</span>
              {!hasContent && <span className="br-tab-empty-dot" />}
            </button>
          )
        })}
      </div>

      {/* Phase content */}
      <div className="br-scaffold-content" style={{ borderTopColor: accent }}>
        {phaseBlocks.length > 0 ? (
          <BlockRenderer blocks={phaseBlocks} accent={accent} />
        ) : (
          <div className="br-scaffold-empty">
            <span>{current?.emoji}</span>
            <p>No hay bloques en <strong>{current?.label}</strong> todavía.</p>
          </div>
        )}
      </div>
    </div>
  )
}
