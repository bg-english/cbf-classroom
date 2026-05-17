import { useState, useEffect } from 'react'
import useAI from '../hooks/useAI'
import useYouTube from '../hooks/useYouTube'
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
 * Three tabs: "Visual" (diagrams, charts, maps), "Activity" (exercises, questions),
 * and "Video" (YouTube search by topic).
 * One tap → AI generates / videos load → preview → tap "Proyectar" → appears on canvas.
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
  onProject, onProjectVideo, onClose, t
}) {
  const [tab, setTab] = useState('visual') // 'visual' | 'activity' | 'video'
  const { loading, result, error, generate, cancel, clear, regenerate } = useAI()
  const { loading: ytLoading, videos, error: ytError, search: ytSearch, clear: ytClear } = useYouTube()

  const context = buildAIContext({
    assignment, plan, dayContent, classroomData,
    moment, combinedGrade, todayKey,
  })

  const quickActions = getQuickActions(moment?.id, context.language)
  const isEn = context.language === 'English'

  // Auto-search YouTube when Video tab is opened
  useEffect(() => {
    if (tab === 'video' && context.topic && !videos.length && !ytLoading) {
      ytSearch(context.topic, { grade: context.grade, language: context.language })
    }
  }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

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

  function handleProjectVideo(videoId) {
    onProjectVideo(videoId)
    ytClear()
  }

  function handleVideoTabRefresh() {
    ytClear()
    ytSearch(context.topic, { grade: context.grade, language: context.language })
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
        <button
          className={`ai-tab ${tab === 'video' ? 'ai-tab-active' : ''}`}
          onClick={() => setTab('video')}
          style={tab === 'video' ? { borderBottomColor: moment?.color } : {}}
        >
          {isEn ? 'Video' : 'Video'}
        </button>
      </div>

      {/* Content area — scrollable */}
      <div className="ai-panel-body">

        {/* ── VIDEO TAB ── */}
        {tab === 'video' && (
          <div className="ai-video-tab">
            {ytLoading && (
              <div className="ai-loading">
                <div className="ai-loading-dots">
                  <span style={{ background: moment?.color }} />
                  <span style={{ background: moment?.color }} />
                  <span style={{ background: moment?.color }} />
                </div>
                <span className="ai-loading-text">{isEn ? 'Searching YouTube…' : 'Buscando en YouTube…'}</span>
              </div>
            )}

            {ytError && (
              <div className="ai-error">
                <span>{ytError}</span>
                <button onClick={ytClear}>✕</button>
              </div>
            )}

            {!ytLoading && !ytError && videos.length > 0 && (
              <>
                <div className="ai-video-topic">
                  <span>🔍</span>
                  <span>{context.topic}</span>
                  <button className="ai-video-refresh" onClick={handleVideoTabRefresh} title={isEn ? 'Refresh' : 'Actualizar'}>↻</button>
                </div>
                <div className="ai-video-grid">
                  {videos.map(video => (
                    <button
                      key={video.id}
                      className="ai-video-card"
                      onClick={() => handleProjectVideo(video.id)}
                    >
                      <div className="ai-video-thumb">
                        <img src={video.thumbnail} alt={video.title} loading="lazy" />
                        <span className="ai-video-play">▶</span>
                      </div>
                      <div className="ai-video-info">
                        <span className="ai-video-title">{video.title}</span>
                        <span className="ai-video-channel">{video.channel}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {!ytLoading && !ytError && videos.length === 0 && !context.topic && (
              <p className="ai-video-empty">
                {isEn ? 'No topic found in today\'s lesson guide.' : 'No se encontró un tema en la guía de hoy.'}
              </p>
            )}
          </div>
        )}

        {/* ── AI TABS (visual / activity) ── */}
        {tab !== 'video' && (
          <>
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
          </>
        )}
      </div>

      {/* Bottom action bar — visible when AI result exists */}
      {hasResult && !loading && tab !== 'video' && (
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
