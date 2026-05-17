import { useState, useEffect } from 'react'
import { useVerseComic } from '../hooks/useVerseComic'

/**
 * VerseScene — full-screen, no-scroll scene for a single verse.
 *
 * type='comic'     → shows 3-panel animated comic strip below the verse text
 * type='questions' → shows 3 discussion questions below the verse text
 * type='vocabulary' → shows vocabulary HTML content (existing lesson content)
 *
 * The teacher taps/clicks a panel to reveal it (optional step-through inside scene).
 * The scene fills the full available height — zero scroll.
 */
export default function VerseScene({
  type,           // 'comic' | 'questions' | 'vocabulary'
  badge,          // e.g. "Versículo del Año"
  verseText,
  verseRef,
  verseType,      // cache key, e.g. 'verse_year_comic'
  topic,
  grade,
  subject,
  planId,
  classDate,
  // vocabulary-only
  vocabHtml,
  // styling
  accentColor,
  t,
}) {
  const isComic     = type === 'comic'
  const isQuestions = type === 'questions'
  const isVocab     = type === 'vocabulary'

  const { panels, questions, loading, error, regenerate } = useVerseComic({
    type:     isQuestions ? 'questions' : 'comic',
    verseText,
    verseRef,
    verseType,
    topic,
    grade,
    subject,
    planId,
    classDate,
    enabled: !isVocab && !!verseText,
  })

  // For comic: reveal panels one by one on tap
  const [revealedCount, setRevealedCount] = useState(0)
  useEffect(() => {
    if (panels?.length) {
      // Auto-reveal first panel after a short delay
      const t = setTimeout(() => setRevealedCount(1), 600)
      return () => clearTimeout(t)
    }
  }, [panels])

  function revealNext() {
    if (panels && revealedCount < panels.length) {
      setRevealedCount(c => c + 1)
    }
  }

  // ── Vocabulary scene ──────────────────────────────────────────────────────
  if (isVocab) {
    return (
      <div className="vs-scene vs-vocab">
        <div className="vs-vocab-label" style={{ color: accentColor }}>
          {t?.vocabList || 'Vocabulary'}
        </div>
        <div
          className="cc-rich-content vs-vocab-body"
          dangerouslySetInnerHTML={{ __html: vocabHtml || '' }}
        />
      </div>
    )
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="vs-scene vs-loading" style={{ '--vs-accent': accentColor }}>
        <VerseHeader badge={badge} verseText={verseText} verseRef={verseRef} accentColor={accentColor} />
        <div className="vs-generating">
          <div className="vs-gen-strip">
            {[0, 1, 2].map(i => (
              <div key={i} className="vs-panel-skeleton" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
          <div className="vs-gen-label">
            <span className="vs-gen-dot" />
            <span className="vs-gen-dot" />
            <span className="vs-gen-dot" />
            <span style={{ marginLeft: 10, opacity: 0.6, fontSize: '0.85em' }}>
              {isQuestions ? 'Generando preguntas…' : 'Creando tira ilustrada…'}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="vs-scene vs-error" style={{ '--vs-accent': accentColor }}>
        <VerseHeader badge={badge} verseText={verseText} verseRef={verseRef} accentColor={accentColor} />
        <div className="vs-error-body">
          <span className="vs-error-icon">⚠</span>
          <span>{error}</span>
          <button className="vs-regen-btn" style={{ borderColor: accentColor, color: accentColor }} onClick={regenerate}>
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  // ── Questions scene ───────────────────────────────────────────────────────
  if (isQuestions && questions) {
    return (
      <div className="vs-scene vs-questions" style={{ '--vs-accent': accentColor }}>
        <VerseHeader badge={badge} verseText={verseText} verseRef={verseRef} accentColor={accentColor} />
        <div className="vs-questions-section">
          <div className="vs-questions-label" style={{ color: accentColor }}>
            💬 {t?.connectionQuestions || 'Conexión con el Tema'}
          </div>
          <div className="vs-questions-list">
            {questions.map((q, i) => (
              <div key={i} className="vs-question-card" style={{ borderLeftColor: accentColor, animationDelay: `${i * 0.15}s` }}>
                <span className="vs-question-num" style={{ background: accentColor }}>
                  {i + 1}
                </span>
                <span className="vs-question-text">{q}</span>
              </div>
            ))}
          </div>
        </div>
        <button className="vs-regen-btn vs-regen-subtle" onClick={regenerate} title="Regenerar preguntas">
          ↺
        </button>
      </div>
    )
  }

  // ── Comic scene ───────────────────────────────────────────────────────────
  if (isComic && panels) {
    const canRevealMore = revealedCount < panels.length
    return (
      <div className="vs-scene vs-comic" style={{ '--vs-accent': accentColor }}>
        <VerseHeader badge={badge} verseText={verseText} verseRef={verseRef} accentColor={accentColor} />

        <div className="vs-comic-strip" onClick={canRevealMore ? revealNext : undefined}>
          {panels.map((panel, i) => (
            <div
              key={i}
              className={`vs-panel ${i < revealedCount ? 'vs-panel-visible' : 'vs-panel-hidden'}`}
              style={{ '--panel-delay': `${i * 0.1}s` }}
            >
              <div className="vs-panel-img-wrap">
                {panel.imageUrl ? (
                  <img src={panel.imageUrl} alt={panel.caption} className="vs-panel-img" />
                ) : (
                  <div className="vs-panel-no-img">🖼</div>
                )}
              </div>
              <div className="vs-panel-caption">{panel.caption}</div>
            </div>
          ))}

          {canRevealMore && (
            <div className="vs-reveal-hint" style={{ color: accentColor }}>
              Toca para continuar →
            </div>
          )}
        </div>

        <button className="vs-regen-btn vs-regen-subtle" onClick={regenerate} title="Regenerar tira">
          ↺
        </button>
      </div>
    )
  }

  // Fallback: empty state (verseText provided but no panels yet)
  return (
    <div className="vs-scene" style={{ '--vs-accent': accentColor }}>
      <VerseHeader badge={badge} verseText={verseText} verseRef={verseRef} accentColor={accentColor} />
    </div>
  )
}

// ── Shared verse header ───────────────────────────────────────────────────────

function VerseHeader({ badge, verseText, verseRef, accentColor }) {
  return (
    <div className="vs-verse-header" style={{ borderLeftColor: accentColor }}>
      {badge && (
        <div className="vs-verse-badge" style={{ background: accentColor }}>
          ✝ {badge}
        </div>
      )}
      <blockquote className="vs-verse-text">{verseText}</blockquote>
      {verseRef && (
        <cite className="vs-verse-ref" style={{ color: accentColor }}>— {verseRef}</cite>
      )}
    </div>
  )
}
