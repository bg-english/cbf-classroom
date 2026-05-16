/**
 * ExplanationBlock — tipografía de lectura con highlights de términos gramaticales.
 * Se ve como un bloque de "explicación del docente" — claro, legible desde 5+ metros.
 */
export default function ExplanationBlock({ data, accent, emphasis }) {
  const { text, grammarTarget, highlightTerms = [] } = data

  if (!text) return null

  // Resaltar términos en el texto
  let highlighted = text
  if (highlightTerms.length > 0) {
    const pattern = highlightTerms
      .filter(Boolean)
      .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|')
    highlighted = text.replace(
      new RegExp(`(${pattern})`, 'gi'),
      `<mark class="br-highlight" style="background:${accent}22;border-bottom:2px solid ${accent}">$1</mark>`
    )
  }

  return (
    <div
      className={`br-explanation br-emphasis-${emphasis}`}
      style={{ '--block-accent': accent }}
    >
      <div className="br-block-header">
        <span className="br-block-icon">💡</span>
        <span className="br-block-label">Explicación</span>
        {grammarTarget && (
          <span className="br-grammar-chip" style={{ background: accent }}>
            {grammarTarget}
          </span>
        )}
      </div>

      <div
        className="br-explanation-text"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </div>
  )
}
