/**
 * ModelBlock — texto modelo anotado como blockquote prominente.
 * Resalta la estructura gramatical objetivo. Ideal para I DO del Scaffold.
 */
export default function ModelBlock({ data, accent, emphasis }) {
  const { text, label, grammarTarget, source, annotation } = data

  if (!text) return null

  // Highlight grammar target en el texto modelo
  let highlighted = text
  if (grammarTarget) {
    const escaped = grammarTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    highlighted = text.replace(
      new RegExp(`(${escaped})`, 'gi'),
      `<mark class="br-highlight" style="background:${accent}33;border-bottom:2.5px solid ${accent};border-radius:3px;padding:0 2px">$1</mark>`
    )
  }

  return (
    <div
      className={`br-model br-emphasis-${emphasis}`}
      style={{ '--block-accent': accent }}
    >
      <div className="br-block-header">
        <span className="br-block-icon">✍️</span>
        <span className="br-block-label">{label || 'Texto Modelo'}</span>
        {grammarTarget && (
          <span className="br-grammar-chip" style={{ background: accent }}>
            {grammarTarget}
          </span>
        )}
      </div>

      <blockquote
        className="br-model-text"
        style={{ borderLeftColor: accent }}
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />

      {annotation && (
        <div className="br-model-annotation" style={{ color: accent }}>
          💬 {annotation}
        </div>
      )}

      {source && (
        <cite className="br-model-source">— {source}</cite>
      )}
    </div>
  )
}
