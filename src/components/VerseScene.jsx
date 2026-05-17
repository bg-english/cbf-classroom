import { useState, useEffect } from 'react'
import { useVerseComic } from '../hooks/useVerseComic'

/**
 * VerseScene — full-screen, no-scroll scene for a single verse.
 *
 * type='comic'     → verse header + 3-panel comic strip (or "Generar" button if not cached)
 * type='questions' → verse header + 3 discussion questions
 * type='vocabulary' → vocabulary HTML content
 *
 * Generation is ALWAYS explicit — teacher taps "Generar" to create content.
 * Navigating Next/Prev never triggers API calls.
 * Once generated, content is auto-saved to the class library (cache).
 */
export default function VerseScene({
  type,
  badge,
  verseText,
  verseRef,
  verseType,
  vocabHtml,
  topic,
  grade,
  subject,
  planId,
  classDate,
  accentColor,
  blendTopic,
  t,
}) {
  const isComic     = type === 'comic'
  const isQuestions = type === 'questions'
  const isVocab     = type === 'vocabulary'

  const { panels, questions, loading, error, cached, hasContent, imageProgress, generate, regenerate } = useVerseComic({
    type:      isQuestions ? 'questions' : 'comic',
    verseText,
    verseRef,
    verseType,
    topic,
    grade,
    subject,
    planId,
    classDate,
    blendTopic,
  })

  // For comic: reveal panels one by one on tap.
  // Auto-reveal first panel as soon as the structure arrives (even before images load).
  const [revealedCount, setRevealedCount] = useState(0)
  useEffect(() => {
    if (panels?.length && revealedCount === 0) {
      const timer = setTimeout(() => setRevealedCount(1), 300)
      return () => clearTimeout(timer)
    }
  }, [panels?.length]) // eslint-disable-line react-hooks/exhaustive-deps

  function revealNext() {
    if (panels && revealedCount < panels.length) setRevealedCount(c => c + 1)
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

  // ── Shared layout wrapper ─────────────────────────────────────────────────
  return (
    <div className="vs-scene" style={{ '--vs-accent': accentColor }}>

      {/* Verse header — always visible */}
      <VerseHeader badge={badge} verseText={verseText} verseRef={verseRef} accentColor={accentColor} />

      {/* Body depends on state */}
      {loading ? (
        <LoadingStrip isQuestions={isQuestions} accentColor={accentColor} phase={1} />

      ) : error ? (
        <ErrorBody error={error} onRetry={generate} accentColor={accentColor} />

      ) : !hasContent ? (
        // ── Empty state: teacher must tap Generar ────────────────────────────
        <div className="vs-empty">
          <div className="vs-empty-icon">
            {isQuestions ? '💬' : '🎨'}
          </div>
          <p className="vs-empty-hint">
            {isQuestions
              ? 'Genera preguntas de conexión con el tema'
              : 'Genera la tira ilustrada para este versículo'}
          </p>
          <button
            className="vs-generate-btn"
            style={{ background: accentColor }}
            onClick={generate}
          >
            {isQuestions ? '✦ Generar preguntas' : '✦ Generar tira ilustrada'}
          </button>
        </div>

      ) : isQuestions && questions ? (
        // ── Questions ────────────────────────────────────────────────────────
        <div className="vs-questions-section">
          <div className="vs-questions-label" style={{ color: accentColor }}>
            💬 {t?.connectionQuestions || 'Conexión con el Tema'}
          </div>
          <div className="vs-questions-list">
            {questions.map((q, i) => (
              <div
                key={i}
                className="vs-question-card"
                style={{ borderLeftColor: accentColor, animationDelay: `${i * 0.15}s` }}
              >
                <span className="vs-question-num" style={{ background: accentColor }}>{i + 1}</span>
                <span className="vs-question-text">{q}</span>
              </div>
            ))}
          </div>
          <button className="vs-regen-btn vs-regen-subtle" onClick={regenerate} title="Regenerar preguntas">↺</button>
        </div>

      ) : isComic && panels ? (
        // ── Comic strip (progressive — images appear one by one) ─────────────
        <>
        {/* Phase 2 progress: panels exist but some images still generating */}
        {panels.some(p => p.imageUrl === null) && (() => {
          const doneCount = panels.filter(p => p.imageUrl !== null).length
          const total = panels.length
          const pct = Math.round((doneCount / total) * 100)
          return (
            <div className="vs-progress-wrap">
              <div className="vs-progress-label">Generando imagen {doneCount + 1} de {total}…</div>
              <div className="vs-progress-bar">
                <div className="vs-progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="vs-progress-counter">{doneCount} de {total} listas</div>
            </div>
          )
        })()}
        <div
          className="vs-comic-strip"
          onClick={revealedCount < panels.length ? revealNext : undefined}
          style={{ cursor: revealedCount < panels.length ? 'pointer' : 'default' }}
        >
          {panels.map((panel, i) => (
            <div
              key={i}
              className={`vs-panel ${i < revealedCount ? 'vs-panel-visible' : 'vs-panel-hidden'}`}
              style={{ '--panel-delay': `${i * 0.08}s` }}
            >
              <div className="vs-panel-img-wrap">
                {panel.imageUrl && panel.imageUrl !== 'error' ? (
                  <img src={panel.imageUrl} alt={panel.caption} className="vs-panel-img" />
                ) : panel.imageUrl === 'error' ? (
                  <div className="vs-panel-no-img">⚠</div>
                ) : (
                  <div className="vs-panel-generating">
                    <span className="vs-panel-gen-dot" />
                    <span className="vs-panel-gen-dot" />
                    <span className="vs-panel-gen-dot" />
                    <span style={{ marginLeft: 6, fontSize: '0.75em', opacity: 0.7 }}>
                      Imagen {i + 1} de {panels.length}…
                    </span>
                  </div>
                )}
              </div>
              <div className="vs-panel-caption">{panel.caption}</div>
            </div>
          ))}

          {revealedCount < panels.length && (
            <div className="vs-reveal-hint" style={{ color: accentColor }}>
              Toca para continuar →
            </div>
          )}

          <button className="vs-regen-btn vs-regen-subtle" onClick={(e) => { e.stopPropagation(); regenerate() }} title="Regenerar tira">
            ↺
          </button>
        </div>
        </>

      ) : null}

      {/* Cached badge — subtle indicator that content is saved */}
      {cached && hasContent && !loading && (
        <div className="vs-cached-badge">✓ guardado</div>
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

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

function LoadingStrip({ isQuestions, accentColor, phase = 1 }) {
  return (
    <div className="vs-generating">
      <div className="vs-gen-strip">
        {(isQuestions ? [0] : [0, 1, 2]).map(i => (
          <div key={i} className="vs-panel-skeleton" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
      <div className="vs-gen-label">
        <span className="vs-gen-dot" style={{ background: accentColor }} />
        <span className="vs-gen-dot" style={{ background: accentColor }} />
        <span className="vs-gen-dot" style={{ background: accentColor }} />
        <span style={{ marginLeft: 10, opacity: 0.6, fontSize: '0.85em' }}>
          {isQuestions
            ? 'Generando preguntas…'
            : phase === 1
              ? 'Creando guión…'
              : 'Creando tira ilustrada…'}
        </span>
      </div>
    </div>
  )
}

function ErrorBody({ error, onRetry, accentColor }) {
  return (
    <div className="vs-error-body">
      <span className="vs-error-icon">⚠</span>
      <span>{error}</span>
      <button
        className="vs-generate-btn"
        style={{ background: accentColor }}
        onClick={onRetry}
      >
        Reintentar
      </button>
    </div>
  )
}
