import { useState } from 'react'

/**
 * VocabBlock — tarjetas de vocabulario con reveal.
 * Modos: tarjetas (flip), lista (tabla), compacto (chips).
 * Projection: muestra word + definición visible.
 * Interactive: teacher activa reveal individual.
 */
export default function VocabBlock({ data, accent, emphasis }) {
  const { terms = [], presentationMode = 'cards', title } = data
  const [revealed, setRevealed] = useState({})
  const [interactive, setInteractive] = useState(false)

  if (!terms.length) return null

  const toggleReveal = (i) => {
    if (!interactive) return
    setRevealed(r => ({ ...r, [i]: !r[i] }))
  }

  return (
    <div
      className={`br-vocab br-emphasis-${emphasis}`}
      style={{ '--block-accent': accent }}
    >
      <div className="br-block-header">
        <span className="br-block-icon">📚</span>
        <span className="br-block-label">{title || 'Vocabulario'}</span>
        <span className="br-block-chip">{terms.length} términos</span>
        <button
          className={`br-interactive-toggle ${interactive ? 'br-interactive-on' : ''}`}
          style={interactive ? { background: accent } : {}}
          onClick={() => setInteractive(i => !i)}
        >
          {interactive ? '✋ Interactivo ON' : '▶ Proyección'}
        </button>
      </div>

      {presentationMode === 'cards' && (
        <div className={`br-vocab-grid br-vocab-grid-${Math.min(terms.length, 4)}`}>
          {terms.map((term, i) => (
            <div
              key={i}
              className={`br-vocab-card ${revealed[i] ? 'br-vocab-revealed' : ''}`}
              style={{ '--card-accent': accent }}
              onClick={() => toggleReveal(i)}
            >
              <div className="br-vocab-word">{term.word}</div>
              {term.pronunciation && (
                <div className="br-vocab-pron">/{term.pronunciation}/</div>
              )}
              <div className={`br-vocab-def ${revealed[i] || !interactive ? 'br-def-visible' : 'br-def-hidden'}`}>
                {term.definition}
              </div>
              {term.example && revealed[i] && (
                <div className="br-vocab-example">"{term.example}"</div>
              )}
              {interactive && !revealed[i] && (
                <div className="br-vocab-tap">Toca para revelar</div>
              )}
            </div>
          ))}
        </div>
      )}

      {presentationMode === 'list' && (
        <table className="br-vocab-table">
          <thead>
            <tr>
              <th style={{ color: accent }}>Término</th>
              <th style={{ color: accent }}>Definición</th>
              {terms.some(t => t.example) && <th style={{ color: accent }}>Ejemplo</th>}
            </tr>
          </thead>
          <tbody>
            {terms.map((term, i) => (
              <tr key={i}>
                <td className="br-vocab-term-cell">{term.word}
                  {term.pronunciation && <span className="br-pron-inline"> /{term.pronunciation}/</span>}
                </td>
                <td>{term.definition}</td>
                {terms.some(t => t.example) && <td className="br-example-cell">{term.example}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {presentationMode === 'compact' && (
        <div className="br-vocab-chips">
          {terms.map((term, i) => (
            <div key={i} className="br-vocab-chip" style={{ borderColor: accent }}>
              <span className="br-chip-word" style={{ color: accent }}>{term.word}</span>
              <span className="br-chip-sep">—</span>
              <span className="br-chip-def">{term.definition}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
