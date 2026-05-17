import { useState } from 'react'
import useAI from '../hooks/useAI'
import { buildAIContext } from '../utils/aiContext'
import { getQuickActions } from '../utils/aiActions'
import BlockRenderer from './blocks/BlockRenderer'
import SmartBlock from './SmartBlock'
import VisualRenderer from './VisualRenderer'

/**
 * AIPanel — tap-only toolbar for real-time AI content generation.
 *
 * Design for classroom reality: teacher stands facing a 55"-100" touch screen,
 * students behind them. NO TYPING. Only large tappable buttons.
 *
 * Two tabs: "Visual" (diagrams, charts, maps) and "Activity" (exercises, questions).
 * One tap → AI generates → preview → tap "Proyectar" → appears on canvas.
 */

const VISUAL_FORMATS = [
  { id: 'mind-map',          icon: '🧠', labelEn: 'Mind Map',       labelEs: 'Mapa Mental' },
  { id: 'key-concepts',      icon: '💡', labelEn: 'Key Concepts',   labelEs: 'Conceptos Clave' },
  { id: 'flow-steps',        icon: '🔄', labelEn: 'Process',        labelEs: 'Proceso' },
  { id: 'hierarchy',         icon: '🌳', labelEn: 'Classification', labelEs: 'Clasificación' },
  { id: 'comparison-table',  icon: '⚖️', labelEn: 'Compare',       labelEs: 'Comparar' },
  { id: 'timeline',          icon: '📅', labelEn: 'Timeline',       labelEs: 'Línea de Tiempo' },
  { id: 'bar-chart',         icon: '📊', labelEn: 'Chart',          labelEs: 'Gráfico' },
]

export default function AIPanel({
  assignment, plan, dayContent, classroomData,
  moment, combinedGrade, todayKey,
  onProject, onClose, t
}) {
  const [tab, setTab] = useState('visual') // 'visual' | 'activity'
  const { loading, result, error, generate, cancel, clear, regenerate } = useAI()

  const context = buildAIContext({
    assignment, plan, dayContent, classroomData,
    moment, combinedGrade, todayKey,
  })

  const quickActions = getQuickActions(moment?.id, context.language)
  const isEn = context.language === 'English'

  function handleVisual(formatId) {
    const prompt = isEn
      ? `Generate a ${formatId} visualization about the current topic: "${context.topic}". Context: grade ${context.grade}, subject ${context.subject}. The objective is: ${context.objective || 'general understanding'}.`
      : `Genera una visualización tipo ${formatId} sobre el tema actual: "${context.topic}". Contexto: grado ${context.grade}, materia ${context.subject}. El objetivo es: ${context.objective || 'comprensión general'}.`
    generate('generate-visual', prompt, { ...context, visualType: formatId })
  }

  function handleQuickAction(qa) {
    generate(qa.action, qa.prompt, context)
  }

  function handleProject() {
    if (!result) return
    onProject(result)
    clear()
  }

  const hasBlocks = result?.blocks?.length > 0
  const hasSmartBlock = !!result?.smartBlock
  const hasVisual = !!result?.visual
  const hasResult = hasBlocks || hasSmartBlock || hasVisual

  return (
    <div className="ai-panel">
      {/* Header */}
      <div className="ai-panel-header">
        <div className="ai-panel-title">
          <span className="ai-panel-icon">✦</span>
          <span>{t.aiTitle}</span>
        </div>
        <button className="ai-panel-close" onClick={onClose} aria-label="Close">✕</button>
      </div>

      {/* Context badge */}
      <div className="ai-panel-context">
        <span>{context.grade}{context.section}</span>
        <span>·</span>
        <span>{context.subject}</span>
        <span>·</span>
        <span style={{ color: moment?.color }}>{moment?.label}</span>
        {context.topic && context.topic !== context.subject && (
          <>
            <span>·</span>
            <span className="ai-context-topic">{context.topic}</span>
          </>
        )}
      </div>

      {/* Tab switcher */}
      <div className="ai-tabs">
        <button
          className={`ai-tab ${tab === 'visual' ? 'ai-tab-active' : ''}`}
          onClick={() => setTab('visual')}
          style={tab === 'visual' ? { borderBottomColor: moment?.color } : {}}
        >
          {isEn ? 'Visual' : 'Visual'}
        </button>
        <button
          className={`ai-tab ${tab === 'activity' ? 'ai-tab-active' : ''}`}
          onClick={() => setTab('activity')}
          style={tab === 'activity' ? { borderBottomColor: moment?.color } : {}}
        >
          {isEn ? 'Activities' : 'Actividades'}
        </button>
      </div>

      {/* Content area — scrollable */}
      <div className="ai-panel-body">
        {/* Error */}
        {error && (
          <div className="ai-error">
            <span>{error}</span>
            <button onClick={clear}>✕</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="ai-loading">
            <div className="ai-loading-dots">
              <span style={{ background: moment?.color }} />
              <span style={{ background: moment?.color }} />
              <span style={{ background: moment?.color }} />
            </div>
            <span className="ai-loading-text">{t.aiGenerating}</span>
            <button className="ai-cancel-btn" onClick={cancel}>{t.aiCancel}</button>
          </div>
        )}

        {/* Visual formats grid */}
        {tab === 'visual' && !loading && !hasResult && (
          <div className="ai-format-grid">
            {VISUAL_FORMATS.map(fmt => (
              <button
                key={fmt.id}
                className="ai-format-btn"
                onClick={() => handleVisual(fmt.id)}
                style={{ '--fmt-color': moment?.color }}
              >
                <span className="ai-format-icon">{fmt.icon}</span>
                <span className="ai-format-label">{isEn ? fmt.labelEn : fmt.labelEs}</span>
              </button>
            ))}
          </div>
        )}

        {/* Activity quick actions */}
        {tab === 'activity' && !loading && !hasResult && (
          <div className="ai-format-grid">
            {quickActions.map(qa => (
              <button
                key={qa.id}
                className="ai-format-btn"
                onClick={() => handleQuickAction(qa)}
                style={{ '--fmt-color': moment?.color }}
              >
                <span className="ai-format-icon">{qa.icon}</span>
                <span className="ai-format-label">{qa.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Preview */}
        {hasResult && !loading && (
          <div className="ai-preview">
            <div className="ai-preview-content">
              {hasVisual && (
                <VisualRenderer visual={result.visual} accent={moment?.color} />
              )}
              {hasBlocks && (
                <BlockRenderer blocks={result.blocks} accent={moment?.color} />
              )}
              {hasSmartBlock && (
                <SmartBlock block={result.smartBlock} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom action bar — always visible when result exists */}
      {hasResult && !loading && (
        <div className="ai-bottom-actions">
          <button
            className="ai-action-project"
            onClick={handleProject}
            style={{ background: moment?.color }}
          >
            {t.aiProject}
          </button>
          <button className="ai-action-secondary" onClick={regenerate}>
            ↻
          </button>
          <button className="ai-action-discard" onClick={clear}>
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
