import { useState } from 'react'
import ExplanationBlock from './ExplanationBlock'
import ProcedureBlock from './ProcedureBlock'
import VocabBlock from './VocabBlock'
import ModelBlock from './ModelBlock'
import QuestionBlock from './QuestionBlock'
import TeacherNoteBlock from './TeacherNoteBlock'
import PatternBlock from './PatternBlock'
import ScaffoldBlock from './ScaffoldBlock'

/**
 * BlockRenderer — recibe un array de bloques tipados y delega al componente correcto.
 * Fallback automático a HTML si el tipo no está soportado.
 *
 * Sprint 4: GXE — ClassroomOS lee bloques estructurados del cbf-planner.
 */
export default function BlockRenderer({ blocks, accent }) {
  if (!blocks?.length) return null

  return (
    <div className="br-container">
      {blocks.map((block, i) => (
        <BlockItem key={block.id || i} block={block} accent={accent} />
      ))}
    </div>
  )
}

function BlockItem({ block, accent }) {
  const props = {
    data: block.data || {},
    accent,
    emphasis: block.display?.emphasis || 'normal',
  }

  switch (block.type) {
    case 'explanation':  return <ExplanationBlock {...props} />
    case 'procedure':    return <ProcedureBlock {...props} />
    case 'vocab':        return <VocabBlock {...props} />
    case 'model':        return <ModelBlock {...props} />
    case 'question':     return <QuestionBlock {...props} />
    case 'teacher-note': return <TeacherNoteBlock {...props} />
    case 'pattern':      return <PatternBlock {...props} />
    case 'scaffold':     return <ScaffoldBlock {...props} />
    case 'exit-ticket':  return <ExitTicketBlock {...props} />
    case 'homework':     return <HomeworkBlock {...props} />
    case 'rich-text':    return <RichTextBlock {...props} />
    case 'image':        return <ImageBlock {...props} />
    default:
      if (block.data?.html) return <RichTextBlock data={{ html: block.data.html }} accent={accent} emphasis="normal" />
      return null
  }
}

// ──────────────────────────────────────────────────────────
// Bloques inline simples (no necesitan archivo propio)
// ──────────────────────────────────────────────────────────

function RichTextBlock({ data, accent }) {
  if (!data?.html) return null
  return (
    <div className="br-rich-text" style={{ '--block-accent': accent }}>
      <div className="cc-rich-content" dangerouslySetInnerHTML={{ __html: data.html }} />
    </div>
  )
}

function ExitTicketBlock({ data, accent }) {
  const [selection, setSelection] = useState(null)
  return (
    <div className="br-exit-ticket" style={{ '--block-accent': accent }}>
      <div className="br-block-header">
        <span className="br-block-icon">🎟️</span>
        <span className="br-block-label">Exit Ticket</span>
        {data.collectionMethod && (
          <span className="br-block-chip">{data.collectionMethod}</span>
        )}
      </div>

      {data.question && <p className="br-exit-question">{data.question}</p>}

      {data.responseType === 'yes-no' && (
        <div className="br-exit-options">
          {['✓ Sí, lo entendí', '~ Más o menos', '✗ Necesito ayuda'].map((opt, i) => (
            <button
              key={i}
              className={`br-exit-opt ${selection === i ? 'br-exit-opt-active' : ''}`}
              style={selection === i ? { background: accent, color: '#fff' } : {}}
              onClick={() => setSelection(i)}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {data.responseType === 'scale' && (
        <div className="br-exit-scale">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              className={`br-exit-scale-btn ${selection === n ? 'br-exit-scale-active' : ''}`}
              style={selection === n ? { background: accent, color: '#fff' } : {}}
              onClick={() => setSelection(n)}
            >
              {n}
            </button>
          ))}
          <span className="br-scale-labels">
            <span>Poco</span><span>Mucho</span>
          </span>
        </div>
      )}

      {data.responseType === 'open' && (
        <div className="br-exit-open">
          <div className="br-writing-lines">
            {[0, 1, 2].map(i => <div key={i} className="br-writing-line" />)}
          </div>
        </div>
      )}
    </div>
  )
}

function HomeworkBlock({ data, accent }) {
  return (
    <div className="br-homework" style={{ '--block-accent': accent }}>
      <div className="br-block-header">
        <span className="br-block-icon">📝</span>
        <span className="br-block-label">Tarea</span>
        {data.date && <span className="br-hw-date">📅 {data.date}</span>}
      </div>
      {data.instruction && <p className="br-hw-instruction">{data.instruction}</p>}
      {data.platform && <div className="br-hw-platform">{data.platform}</div>}
      {data.url && (
        <div className="br-hw-url">
          <span className="br-hw-url-icon">🔗</span>
          <span className="br-hw-link">{data.url}</span>
        </div>
      )}
      {data.parentNote && (
        <div className="br-hw-parent">
          <span>👨‍👩‍👧</span>
          <span><strong>Para padres:</strong> {data.parentNote}</span>
        </div>
      )}
    </div>
  )
}

function ImageBlock({ data, accent }) {
  if (!data?.url) return null
  return (
    <div className="br-image-block" style={{ '--block-accent': accent }}>
      <img src={data.url} alt={data.caption || data.alt || ''} className="br-image" />
      {data.caption && <p className="br-image-caption">{data.caption}</p>}
    </div>
  )
}
