import { useState, useEffect, useRef } from 'react'

/**
 * PatternBlock — renderiza un patrón de actividad específico.
 * Cada patrón tiene su propio display optimizado para salón de clase.
 *
 * Patrones implementados:
 *   hook, think-pair-share, information-gap, dictogloss,
 *   guided-writing, guided-noticing, model-text, three-two-one,
 *   picture-narration
 */
export default function PatternBlock({ data, accent, emphasis }) {
  const { patternId, inputs = {} } = data

  const RENDERERS = {
    'hook':              HookDisplay,
    'think-pair-share':  ThinkPairShareDisplay,
    'information-gap':   InformationGapDisplay,
    'dictogloss':        DictoglossDisplay,
    'guided-writing':    GuidedWritingDisplay,
    'guided-noticing':   GuidedNoticingDisplay,
    'model-text':        ModelTextDisplay,
    'three-two-one':     ThreeTwoOneDisplay,
    'picture-narration': PictureNarrationDisplay,
  }

  const Renderer = RENDERERS[patternId] || GenericPatternDisplay

  return (
    <div
      className={`br-pattern br-emphasis-${emphasis}`}
      style={{ '--block-accent': accent }}
    >
      <Renderer inputs={inputs} accent={accent} patternId={patternId} />
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// HOOK — Recurso provocador + pregunta detonadora
// ──────────────────────────────────────────────────────────────
function HookDisplay({ inputs, accent }) {
  return (
    <div className="br-pat-hook">
      <div className="br-block-header">
        <span className="br-block-icon">🎣</span>
        <span className="br-block-label">Hook — Detonador</span>
      </div>
      {inputs.resource && (
        <div className="br-hook-resource" style={{ borderColor: accent }}>
          <span className="br-hook-res-label">Recurso</span>
          <p>{inputs.resource}</p>
        </div>
      )}
      {inputs.question && (
        <div className="br-hook-question" style={{ background: `${accent}12`, borderLeftColor: accent }}>
          <span className="br-hook-q-icon">💭</span>
          <p className="br-hook-q-text">{inputs.question}</p>
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// THINK-PAIR-SHARE — 3 fases con timer visual
// ──────────────────────────────────────────────────────────────
function ThinkPairShareDisplay({ inputs, accent }) {
  const PHASES = [
    { key: 'think', label: 'Think', icon: '🧠', time: inputs.thinkTime || 120, color: '#7c3aed' },
    { key: 'pair',  label: 'Pair',  icon: '👥', time: inputs.pairTime  || 180, color: '#0891b2' },
    { key: 'share', label: 'Share', icon: '🗣️', time: null,                   color: '#16a34a' },
  ]
  const [activePhase, setActivePhase] = useState(0)
  const [running, setRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(PHASES[0].time)
  const timerRef = useRef(null)

  useEffect(() => {
    setTimeLeft(PHASES[activePhase].time)
    setRunning(false)
    clearInterval(timerRef.current)
  }, [activePhase])

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); setRunning(false); return 0 }
          return t - 1
        })
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [running])

  const phase = PHASES[activePhase]
  const total = phase.time || 1
  const pct = phase.time ? Math.round((timeLeft / total) * 100) : 100
  const mins = Math.floor((timeLeft || 0) / 60)
  const secs = String((timeLeft || 0) % 60).padStart(2, '0')

  return (
    <div className="br-pat-tps">
      <div className="br-block-header">
        <span className="br-block-icon">💬</span>
        <span className="br-block-label">Think · Pair · Share</span>
      </div>

      {inputs.question && (
        <div className="br-tps-question" style={{ borderLeftColor: accent }}>
          {inputs.question}
        </div>
      )}

      {/* Phase tabs */}
      <div className="br-tps-phases">
        {PHASES.map((p, i) => (
          <button
            key={p.key}
            className={`br-tps-phase-btn ${activePhase === i ? 'br-tps-active' : ''}`}
            style={activePhase === i ? { background: p.color, color: '#fff' } : {}}
            onClick={() => { setActivePhase(i) }}
          >
            <span>{p.icon}</span>
            <span>{p.label}</span>
            {p.time && <span className="br-tps-time-chip">{Math.floor(p.time / 60)}min</span>}
          </button>
        ))}
      </div>

      {/* Timer */}
      {phase.time && (
        <div className="br-timer-ring" style={{ '--timer-color': phase.color }}>
          <svg className="br-timer-svg" viewBox="0 0 120 120">
            <circle className="br-timer-track" cx="60" cy="60" r="52" />
            <circle
              className="br-timer-progress"
              cx="60" cy="60" r="52"
              strokeDasharray="327"
              strokeDashoffset={327 - (327 * pct / 100)}
              style={{ stroke: phase.color }}
            />
          </svg>
          <div className="br-timer-display">
            <span className="br-timer-digits">{mins}:{secs}</span>
            <span className="br-timer-phase-icon">{phase.icon}</span>
          </div>
        </div>
      )}

      {/* Phase instruction */}
      <div className="br-tps-instruction" style={{ background: `${phase.color}12` }}>
        {phase.key === 'think' && (inputs.thinkPrompt || 'Piensa individualmente. No hables todavía.')}
        {phase.key === 'pair'  && (inputs.pairPrompt  || 'Comparte tu respuesta con tu compañero.')}
        {phase.key === 'share' && (inputs.sharePrompt || 'Voluntarios comparten con la clase.')}
      </div>

      {/* Timer controls */}
      {phase.time && (
        <div className="br-timer-controls">
          <button
            className="br-timer-btn"
            style={{ background: running ? '#dc2626' : phase.color }}
            onClick={() => setRunning(r => !r)}
          >
            {running ? '⏸ Pausar' : timeLeft < phase.time ? '▶ Reanudar' : '▶ Iniciar'}
          </button>
          <button
            className="br-timer-btn br-timer-reset"
            onClick={() => { setRunning(false); setTimeLeft(phase.time) }}
          >
            ↺ Reset
          </button>
          {activePhase < PHASES.length - 1 && (
            <button
              className="br-timer-btn"
              style={{ background: accent }}
              onClick={() => setActivePhase(i => i + 1)}
            >
              Siguiente fase →
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// INFORMATION GAP — pantalla split A/B con useful language
// ──────────────────────────────────────────────────────────────
function InformationGapDisplay({ inputs, accent }) {
  const [showLanguage, setShowLanguage] = useState(false)

  return (
    <div className="br-pat-infogap">
      <div className="br-block-header">
        <span className="br-block-icon">🔄</span>
        <span className="br-block-label">Information Gap</span>
      </div>

      {inputs.instructions && (
        <p className="br-infogap-instructions">{inputs.instructions}</p>
      )}

      <div className="br-infogap-roles">
        <div className="br-role-card br-role-a" style={{ borderTopColor: accent }}>
          <div className="br-role-header" style={{ color: accent }}>
            <span>🅰</span> Estudiante A
          </div>
          <div className="br-role-content">
            {inputs.partnerA || 'Información del Estudiante A'}
          </div>
        </div>
        <div className="br-role-divider">⟷</div>
        <div className="br-role-card br-role-b" style={{ borderTopColor: '#7c3aed' }}>
          <div className="br-role-header" style={{ color: '#7c3aed' }}>
            <span>🅱</span> Estudiante B
          </div>
          <div className="br-role-content">
            {inputs.partnerB || 'Información del Estudiante B'}
          </div>
        </div>
      </div>

      {inputs.usefulLanguage?.length > 0 && (
        <div className="br-useful-language">
          <button
            className="br-lang-toggle"
            onClick={() => setShowLanguage(s => !s)}
            style={{ color: accent }}
          >
            {showLanguage ? '▲' : '▼'} Useful Language
          </button>
          {showLanguage && (
            <div className="br-lang-chips">
              {inputs.usefulLanguage.map((phrase, i) => (
                <span key={i} className="br-lang-chip" style={{ borderColor: accent }}>
                  "{phrase}"
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// DICTOGLOSS — escuchar → reconstruir → comparar
// ──────────────────────────────────────────────────────────────
function DictoglossDisplay({ inputs, accent }) {
  const STAGES = ['listen', 'reconstruct', 'compare']
  const [stage, setStage] = useState('listen')

  return (
    <div className="br-pat-dictogloss">
      <div className="br-block-header">
        <span className="br-block-icon">🎧</span>
        <span className="br-block-label">Dictogloss</span>
      </div>

      <div className="br-dicto-stages">
        {[
          { key: 'listen',      icon: '👂', label: 'Escuchar' },
          { key: 'reconstruct', icon: '✏️', label: 'Reconstruir' },
          { key: 'compare',     icon: '🔍', label: 'Comparar' },
        ].map((s, i) => (
          <button
            key={s.key}
            className={`br-dicto-stage ${stage === s.key ? 'br-stage-active' : ''}`}
            style={stage === s.key ? { background: accent, color: '#fff' } : {}}
            onClick={() => setStage(s.key)}
          >
            <span>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {stage === 'listen' && (
        <div className="br-dicto-panel">
          <div className="br-dicto-listen-icon">👂</div>
          <p className="br-dicto-instruction">
            Escucha el texto completo. NO escribas todavía. Solo palabras clave en mente.
          </p>
          {inputs.listeningCues && (
            <p className="br-dicto-cue">🎯 Enfócate en: <strong>{inputs.listeningCues}</strong></p>
          )}
        </div>
      )}

      {stage === 'reconstruct' && (
        <div className="br-dicto-panel">
          <div className="br-dicto-blank-page">
            <div className="br-dicto-icon">✏️</div>
            <p>Reconstruye el texto con tus propias palabras.</p>
            <div className="br-writing-area">
              {[0,1,2,3,4].map(i => <div key={i} className="br-writing-line" />)}
            </div>
          </div>
        </div>
      )}

      {stage === 'compare' && (
        <div className="br-dicto-panel">
          {inputs.passage ? (
            <div className="br-dicto-original" style={{ borderLeftColor: accent }}>
              <span className="br-dicto-orig-label" style={{ color: accent }}>Texto original</span>
              <p>{inputs.passage}</p>
            </div>
          ) : (
            <p className="br-dicto-instruction">El docente muestra el texto original para comparar.</p>
          )}
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// GUIDED WRITING — prompt + modelo + sentence starters
// ──────────────────────────────────────────────────────────────
function GuidedWritingDisplay({ inputs, accent }) {
  const [showModel, setShowModel] = useState(false)

  return (
    <div className="br-pat-gwriting">
      <div className="br-block-header">
        <span className="br-block-icon">📝</span>
        <span className="br-block-label">Guided Writing</span>
      </div>

      {inputs.prompt && (
        <div className="br-gw-prompt" style={{ borderLeftColor: accent }}>
          {inputs.prompt}
        </div>
      )}

      {inputs.structure && (
        <div className="br-gw-structure">
          <span className="br-gw-struct-label" style={{ color: accent }}>Estructura:</span>
          <span>{inputs.structure}</span>
        </div>
      )}

      {inputs.sentenceStarters?.length > 0 && (
        <div className="br-gw-starters">
          <div className="br-gw-starters-header" style={{ color: accent }}>
            💬 Sentence starters
          </div>
          <div className="br-gw-starters-list">
            {inputs.sentenceStarters.map((s, i) => (
              <span key={i} className="br-starter-chip" style={{ borderColor: accent }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {inputs.model && (
        <div className="br-gw-model-section">
          <button
            className="br-gw-model-toggle"
            style={{ color: accent }}
            onClick={() => setShowModel(s => !s)}
          >
            {showModel ? '▲ Ocultar' : '▼ Ver'} texto modelo
          </button>
          {showModel && (
            <blockquote className="br-gw-model-text" style={{ borderLeftColor: accent }}>
              {inputs.model}
            </blockquote>
          )}
        </div>
      )}

      <div className="br-writing-area">
        {[0,1,2,3,4].map(i => <div key={i} className="br-writing-line" />)}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// GUIDED NOTICING — ejemplos que revelan la regla
// ──────────────────────────────────────────────────────────────
function GuidedNoticingDisplay({ inputs, accent }) {
  const [ruleVisible, setRuleVisible] = useState(false)
  const { examples = [], rule, noticeQuestion } = inputs

  return (
    <div className="br-pat-noticing">
      <div className="br-block-header">
        <span className="br-block-icon">🔍</span>
        <span className="br-block-label">Guided Noticing</span>
      </div>

      {noticeQuestion && (
        <div className="br-notice-question" style={{ borderLeftColor: accent }}>
          🎯 {noticeQuestion}
        </div>
      )}

      {examples.length > 0 && (
        <div className="br-notice-examples">
          {examples.map((ex, i) => (
            <div key={i} className="br-notice-example" style={{ '--n-accent': accent }}>
              <span className="br-notice-num" style={{ color: accent }}>{i + 1}</span>
              <span className="br-notice-ex">{ex}</span>
            </div>
          ))}
        </div>
      )}

      <div className="br-notice-rule-section">
        <button
          className="br-rule-toggle"
          style={{ background: ruleVisible ? accent : 'transparent', borderColor: accent, color: ruleVisible ? '#fff' : accent }}
          onClick={() => setRuleVisible(v => !v)}
        >
          {ruleVisible ? '✓ La regla es...' : '? ¿Cuál es la regla?'}
        </button>
        {ruleVisible && rule && (
          <div className="br-rule-reveal" style={{ borderColor: accent, background: `${accent}0f` }}>
            {rule}
          </div>
        )}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// MODEL TEXT — texto modelo anotado (patrón)
// ──────────────────────────────────────────────────────────────
function ModelTextDisplay({ inputs, accent }) {
  const { text, annotation, grammarTarget } = inputs

  let highlighted = text || ''
  if (grammarTarget) {
    const escaped = grammarTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    highlighted = highlighted.replace(
      new RegExp(`(${escaped})`, 'gi'),
      `<mark style="background:${accent}25;border-bottom:2px solid ${accent};padding:0 2px;border-radius:2px">$1</mark>`
    )
  }

  return (
    <div className="br-pat-modeltext">
      <div className="br-block-header">
        <span className="br-block-icon">📄</span>
        <span className="br-block-label">Texto Modelo</span>
        {grammarTarget && (
          <span className="br-grammar-chip" style={{ background: accent }}>{grammarTarget}</span>
        )}
      </div>
      {text && (
        <blockquote
          className="br-modeltext-quote"
          style={{ borderLeftColor: accent }}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      )}
      {annotation && (
        <div className="br-modeltext-annotation" style={{ color: accent }}>
          💬 {annotation}
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// THREE-TWO-ONE — 3 aprendí, 2 me interesaron, 1 pregunta
// ──────────────────────────────────────────────────────────────
function ThreeTwoOneDisplay({ inputs, accent }) {
  const prompts = [
    { n: 3, label: inputs.prompt1 || '3 cosas que aprendí hoy', color: '#16a34a' },
    { n: 2, label: inputs.prompt2 || '2 cosas que me interesaron', color: '#0891b2' },
    { n: 1, label: inputs.prompt3 || '1 pregunta que me queda', color: accent },
  ]

  return (
    <div className="br-pat-321">
      <div className="br-block-header">
        <span className="br-block-icon">3️⃣</span>
        <span className="br-block-label">3 · 2 · 1 Reflection</span>
      </div>
      <div className="br-321-cards">
        {prompts.map(p => (
          <div key={p.n} className="br-321-card" style={{ borderTopColor: p.color }}>
            <div className="br-321-num" style={{ color: p.color }}>{p.n}</div>
            <div className="br-321-label">{p.label}</div>
            <div className="br-writing-area br-321-lines">
              {Array.from({ length: p.n }).map((_, i) => (
                <div key={i} className="br-writing-line" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// PICTURE NARRATION — imagen anotada como ancla visual
// ──────────────────────────────────────────────────────────────
function PictureNarrationDisplay({ inputs, accent }) {
  const { imageUrl, caption, vocabulary = [], question } = inputs

  return (
    <div className="br-pat-picture">
      <div className="br-block-header">
        <span className="br-block-icon">🖼️</span>
        <span className="br-block-label">Picture Narration</span>
      </div>

      {imageUrl && (
        <div className="br-picture-container">
          <img src={imageUrl} alt={caption || ''} className="br-picture-img" />
          {caption && <p className="br-picture-caption">{caption}</p>}
        </div>
      )}

      {vocabulary.length > 0 && (
        <div className="br-picture-vocab">
          {vocabulary.map((word, i) => (
            <span key={i} className="br-pic-vocab-chip" style={{ borderColor: accent, color: accent }}>
              {word}
            </span>
          ))}
        </div>
      )}

      {question && (
        <div className="br-picture-question" style={{ borderLeftColor: accent }}>
          💭 {question}
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// GENERIC — fallback para patrones sin renderer específico
// ──────────────────────────────────────────────────────────────
function GenericPatternDisplay({ inputs, patternId, accent }) {
  return (
    <div className="br-pat-generic">
      <div className="br-block-header">
        <span className="br-block-icon">🎯</span>
        <span className="br-block-label">{patternId || 'Actividad'}</span>
      </div>
      {Object.entries(inputs).map(([key, value]) => {
        if (!value || typeof value === 'object') return null
        return (
          <div key={key} className="br-generic-field">
            <span className="br-generic-key" style={{ color: accent }}>{key}:</span>
            <span className="br-generic-val">{String(value)}</span>
          </div>
        )
      })}
    </div>
  )
}
