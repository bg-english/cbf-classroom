import { useState } from 'react'

/**
 * SmartBlock — hybrid renderer for interactive lesson plan blocks.
 *
 * Modes:
 *  - projection (default): read-only, students copy from screen
 *  - interactive: teacher activates inputs for touch-screen interaction
 *
 * Supported types:
 *  GRAMMAR  → fill-blank, choose
 *  READING  → comprehension
 *  VOCAB    → matching
 *  EXIT_TICKET → can-do
 *  SPEAKING → rubric
 */
export default function SmartBlock({ block }) {
  const [interactive, setInteractive] = useState(false)

  if (!block?.type || !block?.data) return null

  const Renderer = RENDERERS[`${block.type}/${block.model}`] || RENDERERS[block.type]
  if (!Renderer) return null

  return (
    <div className={`sb-block sb-${block.type.toLowerCase()} ${interactive ? 'sb-interactive' : 'sb-projection'}`}>
      <div className="sb-header">
        <span className="sb-type-badge">{TYPE_LABELS[block.type] || block.type}</span>
        {block.data.grammar_point && <span className="sb-grammar-point">{block.data.grammar_point}</span>}
        {block.data.instructions && <p className="sb-instructions">{block.data.instructions}</p>}
        <button
          className={`sb-mode-toggle ${interactive ? 'sb-mode-active' : ''}`}
          onClick={() => setInteractive(i => !i)}
        >
          {interactive ? '👁 Modo proyección' : '✋ Activar interactivo'}
        </button>
      </div>
      <div className="sb-body">
        <Renderer data={block.data} interactive={interactive} />
      </div>
    </div>
  )
}

const TYPE_LABELS = {
  GRAMMAR: 'Gramática',
  READING: 'Lectura',
  VOCAB: 'Vocabulario',
  EXIT_TICKET: 'Exit Ticket',
  SPEAKING: 'Expresión Oral',
}

/* ─── GRAMMAR / fill-blank ─── */
function GrammarFillBlank({ data, interactive }) {
  const [answers, setAnswers] = useState({})

  function updateAnswer(i, value) {
    setAnswers(prev => ({ ...prev, [i]: value }))
  }

  function checkAnswer(i) {
    if (!answers[i]) return ''
    return answers[i].trim().toLowerCase() === data.sentences[i].answer.toLowerCase()
      ? 'sb-correct' : 'sb-incorrect'
  }

  return (
    <ol className="sb-sentences">
      {data.sentences?.map((item, i) => {
        const parts = item.sent.split(/_{2,}/)
        return (
          <li key={i} className={`sb-sentence-item ${interactive ? checkAnswer(i) : ''}`}>
            <span className="sb-sentence-text">
              {parts.map((part, j) => (
                <span key={j}>
                  {part}
                  {j < parts.length - 1 && (
                    interactive ? (
                      <input
                        className="sb-fill-input"
                        type="text"
                        placeholder="..."
                        value={answers[i] || ''}
                        onChange={e => updateAnswer(i, e.target.value)}
                      />
                    ) : (
                      <span className="sb-blank">{'_'.repeat(12)}</span>
                    )
                  )}
                </span>
              ))}
            </span>
            {interactive && answers[i] && (
              <span className={`sb-check-icon ${checkAnswer(i)}`}>
                {checkAnswer(i) === 'sb-correct' ? '✓' : '✗'}
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}

/* ─── GRAMMAR / choose ─── */
function GrammarChoose({ data, interactive }) {
  const [selected, setSelected] = useState({})

  function checkAnswer(i) {
    if (!selected[i]) return ''
    return selected[i] === data.items[i].answer ? 'sb-correct' : 'sb-incorrect'
  }

  return (
    <ol className="sb-sentences">
      {data.items?.map((item, i) => {
        const parts = item.sentence.split(/_{2,}/)
        return (
          <li key={i} className={`sb-sentence-item ${interactive ? checkAnswer(i) : ''}`}>
            <span className="sb-sentence-text">
              {parts.map((part, j) => (
                <span key={j}>
                  {part}
                  {j < parts.length - 1 && !interactive && (
                    <span className="sb-blank">{'_'.repeat(12)}</span>
                  )}
                  {j < parts.length - 1 && interactive && (
                    <span className="sb-inline-select">
                      {selected[i]
                        ? <span className={`sb-selected-answer ${checkAnswer(i)}`}>{selected[i]}</span>
                        : '___'
                      }
                    </span>
                  )}
                </span>
              ))}
            </span>
            <div className="sb-options-row">
              {item.options?.map(opt => (
                <button
                  key={opt}
                  className={`sb-option-btn ${interactive && selected[i] === opt ? (checkAnswer(i) || 'sb-chosen') : ''}`}
                  disabled={!interactive}
                  onClick={() => interactive && setSelected(prev => ({ ...prev, [i]: opt }))}
                >
                  {opt}
                </button>
              ))}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/* ─── READING / comprehension ─── */
function ReadingComprehension({ data, interactive }) {
  const [answers, setAnswers] = useState({})

  return (
    <div className="sb-reading">
      <div className="sb-passage">
        {data.passage?.split('\n').map((line, i) => (
          <p key={i} className="sb-passage-line">
            <span className="sb-line-num">{i + 1}</span>
            {line}
          </p>
        ))}
      </div>
      <div className="sb-questions">
        {data.questions?.map((q, i) => (
          <div key={i} className="sb-question-item">
            <div className="sb-question-text">
              <span className="sb-q-num">{i + 1}.</span>
              {q.q}
              {q.lines && <span className="sb-q-lines">(lines {q.lines})</span>}
            </div>
            {interactive && (
              <textarea
                className="sb-answer-input"
                rows={2}
                placeholder="Write your answer..."
                value={answers[i] || ''}
                onChange={e => setAnswers(prev => ({ ...prev, [i]: e.target.value }))}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── VOCAB / matching ─── */
function VocabMatching({ data, interactive }) {
  const [revealed, setRevealed] = useState({})

  return (
    <div className="sb-vocab-grid">
      {data.words?.map((w, i) => (
        <div
          key={i}
          className={`sb-vocab-card ${interactive && revealed[i] ? 'sb-revealed' : ''}`}
          onClick={() => interactive && setRevealed(prev => ({ ...prev, [i]: !prev[i] }))}
        >
          <div className="sb-vocab-word">{w.w}</div>
          <div className="sb-vocab-def">{w.d}</div>
          {(interactive ? revealed[i] : true) && w.e && (
            <div className="sb-vocab-example">"{w.e}"</div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ─── EXIT_TICKET / can-do ─── */
function ExitTicketCanDo({ data, interactive }) {
  const [checked, setChecked] = useState({})

  function toggle(i) {
    if (!interactive) return
    setChecked(prev => ({ ...prev, [i]: !prev[i] }))
  }

  return (
    <div className="sb-exit-ticket">
      {data.date && <div className="sb-et-date">{data.date}</div>}
      <ul className="sb-et-skills">
        {data.skills?.map((skill, i) => (
          <li
            key={i}
            className={`sb-et-skill ${checked[i] ? 'sb-et-checked' : ''}`}
            onClick={() => toggle(i)}
          >
            <span className={`sb-et-checkbox ${interactive ? 'sb-et-clickable' : ''}`}>
              {checked[i] ? '✓' : '○'}
            </span>
            <span className="sb-et-text">{skill}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ─── SPEAKING / rubric ─── */
function SpeakingRubric({ data, interactive }) {
  const [scores, setScores] = useState({})

  function toggleScore(i) {
    if (!interactive) return
    setScores(prev => ({ ...prev, [i]: !prev[i] }))
  }

  const totalPossible = data.criteria?.reduce((s, c) => s + c.pts, 0) || 0
  const totalEarned = data.criteria?.reduce((s, c, i) => s + (scores[i] ? c.pts : 0), 0) || 0

  return (
    <div className="sb-rubric">
      {data.date && <div className="sb-rubric-date">{data.date}</div>}
      <table className="sb-rubric-table">
        <thead>
          <tr>
            <th>Criteria</th>
            <th>Points</th>
            {interactive && <th>Achieved</th>}
          </tr>
        </thead>
        <tbody>
          {data.criteria?.map((c, i) => (
            <tr
              key={i}
              className={scores[i] ? 'sb-rubric-achieved' : ''}
              onClick={() => toggleScore(i)}
            >
              <td className="sb-rubric-name">{c.name}</td>
              <td className="sb-rubric-pts">{c.pts}</td>
              {interactive && (
                <td className="sb-rubric-check">
                  <span className="sb-et-checkbox sb-et-clickable">
                    {scores[i] ? '✓' : '○'}
                  </span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {interactive && (
        <div className="sb-rubric-total">
          Score: <strong>{totalEarned}</strong> / {totalPossible}
        </div>
      )}
    </div>
  )
}

/* ─── Renderer map ─── */
const RENDERERS = {
  'GRAMMAR/fill-blank': GrammarFillBlank,
  'GRAMMAR/choose': GrammarChoose,
  'READING/comprehension': ReadingComprehension,
  'VOCAB/matching': VocabMatching,
  'EXIT_TICKET/can-do': ExitTicketCanDo,
  'SPEAKING/rubric': SpeakingRubric,
}
