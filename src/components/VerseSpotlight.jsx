import { useEffect } from 'react'
import { getVerseTheme } from '../utils/verseThemes'

/**
 * VerseSpotlight — full-screen cinematic verse display.
 * Teacher taps any verse → this overlay fills the screen.
 * Beautiful gradient background derived from verse keywords.
 * Tap anywhere to dismiss.
 */
export default function VerseSpotlight({ verse, onClose }) {
  if (!verse) return null

  const theme = getVerseTheme(verse.text, verse.ref)

  // Escape key dismisses
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="vs-overlay"
      style={{ background: theme.gradient }}
      onClick={onClose}
    >
      {/* Noise texture overlay for depth */}
      <div className="vs-texture" />

      {/* Vignette for cinematic feel */}
      <div className="vs-vignette" />

      {/* Content — click propagation stopped so only the backdrop closes */}
      <div className="vs-content" onClick={e => e.stopPropagation()}>

        {/* Badge (verse category label) */}
        {verse.label && (
          <div className="vs-badge">{verse.label}</div>
        )}

        {/* Decorative ornament */}
        <div className="vs-ornament" aria-hidden="true">
          <span className="vs-ornament-emoji">{theme.emoji}</span>
          <div className="vs-ornament-line" />
        </div>

        {/* Verse text */}
        <blockquote className="vs-text">
          {verse.html
            ? <span dangerouslySetInnerHTML={{ __html: verse.html }} />
            : verse.text
          }
        </blockquote>

        {/* Reference */}
        {verse.ref && (
          <cite className="vs-ref">— {verse.ref}</cite>
        )}
      </div>

      {/* Close button */}
      <button
        className="vs-close"
        onClick={onClose}
        aria-label="Cerrar"
      >
        ✕
      </button>

      {/* Tap hint */}
      <div className="vs-hint" aria-hidden="true">
        Toca para cerrar
      </div>
    </div>
  )
}
