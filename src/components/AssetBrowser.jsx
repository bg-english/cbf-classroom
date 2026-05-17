import { useState } from 'react'
import { ASSETS, CATEGORIES, searchAssets } from '../assets/classroom/index.js'
import { useImageGen } from '../hooks/useImageGen'
import { buildAIContext } from '../utils/aiContext'

/**
 * AssetBrowser — tap-only panel for inserting images and SVGs onto the canvas.
 *
 * Tab 1 "Biblioteca": grid of local SVG/PNG/GIF assets, filterable by category.
 * Tab 2 "Generar": Gemini image generation via context-aware tap prompts.
 * No text input — teacher operates facing the screen with students behind them.
 */
export default function AssetBrowser({
  assignment, plan, dayContent, classroomData,
  moment, combinedGrade, todayKey,
  onProject, onClose,
}) {
  const [tab,      setTab]      = useState('library')  // 'library' | 'generate'
  const [category, setCategory] = useState('all')

  const { generate, imageUrl, loading, error, clear } = useImageGen()

  const context = buildAIContext({
    assignment, plan, dayContent, classroomData,
    moment, combinedGrade, todayKey,
  })

  const assets    = searchAssets('', category)
  const accentColor = moment?.color || 'var(--accent)'

  // ── AI image prompts — built from class context, zero typing ──────────────
  const topic      = context.topic       || 'the current lesson'
  const grade      = context.grade       || 'K-12'
  const sectionText = context.sectionText || ''
  const objective  = context.objective   || ''

  // "Ilustrar la actividad" — uses the actual section text so the image matches
  // what's happening in THIS moment, not just the general topic
  const activityPrompt = sectionText
    ? `Flat educational illustration for a ${grade} classroom. Topic: "${topic}". Activity: "${sectionText.slice(0, 300)}". Relevant visual scene, no text in image.`
    : `Educational illustration of "${topic}" activity for ${grade} students`

  const objectivePrompt = objective
    ? `Flat educational illustration that represents this learning objective: "${objective.slice(0, 200)}". Topic: "${topic}", grade ${grade}. No text in image.`
    : `Educational illustration of the learning objective for "${topic}", grade ${grade}`

  const AI_PROMPTS = [
    { id: 'activity',  icon: '🎯', label: `Actividad: ${moment?.label || topic}`, prompt: activityPrompt },
    { id: 'topic',     icon: '📚', label: `Tema: ${topic}`,                        prompt: `Flat vector educational illustration of "${topic}" concept for ${grade} students. Clear, simple, no text.` },
    { id: 'objective', icon: '🏆', label: 'Objetivo de la clase',                  prompt: objectivePrompt },
    { id: 'biblical',  icon: '✝',  label: 'Principio Bíblico',                     prompt: `Peaceful biblical illustration connecting faith and learning. Topic: "${topic}". Warm colors, hopeful, no text.` },
    { id: 'teamwork',  icon: '🤝', label: 'Trabajo en equipo',                     prompt: `Diverse ${grade} students collaborating in groups, working on a project together, teamwork, classroom setting, flat illustration.` },
    { id: 'celebrate', icon: '⭐', label: 'Celebrar logro',                        prompt: `Children celebrating academic achievement, stars, joy, school success, ${grade}, flat illustration.` },
  ]

  const ASPECT_OPTIONS = [
    { id: '16:9', label: '16 : 9', desc: 'Pantalla completa' },
    { id: '4:3',  label: '4 : 3',  desc: 'Cuadrado amplio' },
    { id: '1:1',  label: '1 : 1',  desc: 'Cuadrado' },
  ]
  const [aspect, setAspect] = useState('16:9')
  const [activePromptId, setActivePromptId] = useState(null)

  async function handleGenerate(promptItem) {
    setActivePromptId(promptItem.id)
    clear()
    await generate(promptItem.prompt, { topic: context.topic, grade }, aspect)
  }

  function handleProjectLibrary(asset) {
    onProject({ type: 'asset', src: asset.src, label: asset.label, assetType: asset.type })
  }

  function handleProjectGenerated() {
    if (!imageUrl) return
    const prompt = AI_PROMPTS.find(p => p.id === activePromptId)
    onProject({ type: 'image', src: imageUrl, label: prompt?.label || 'Imagen generada', assetType: 'png' })
  }

  return (
    <div className="ab-panel">

      {/* Header */}
      <div className="ab-header" style={{ borderTopColor: accentColor }}>
        <div className="ab-header-title">
          <span className="ab-header-icon">🖼️</span>
          <span>Imágenes y Assets</span>
        </div>
        <button className="ab-close-btn" onClick={onClose} title="Cerrar">✕</button>
      </div>

      {/* Tabs */}
      <div className="ab-tabs">
        <button
          className={`ab-tab ${tab === 'library' ? 'ab-tab-active' : ''}`}
          style={tab === 'library' ? { borderBottomColor: accentColor, color: accentColor } : {}}
          onClick={() => setTab('library')}
        >
          📁 Biblioteca
        </button>
        <button
          className={`ab-tab ${tab === 'generate' ? 'ab-tab-active' : ''}`}
          style={tab === 'generate' ? { borderBottomColor: accentColor, color: accentColor } : {}}
          onClick={() => setTab('generate')}
        >
          ✦ Generar con IA
        </button>
      </div>

      {/* ── TAB: LIBRARY ── */}
      {tab === 'library' && (
        <div className="ab-body">
          {/* Category filter */}
          <div className="ab-categories">
            {CATEGORIES.filter(c => c.id !== 'decorative').map(cat => (
              <button
                key={cat.id}
                className={`ab-cat-btn ${category === cat.id ? 'ab-cat-active' : ''}`}
                style={category === cat.id ? { background: accentColor, borderColor: accentColor } : {}}
                onClick={() => setCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Asset grid */}
          <div className="ab-grid">
            {assets.length === 0 && (
              <p className="ab-empty">No hay assets en esta categoría aún.</p>
            )}
            {assets.map(asset => (
              <button
                key={asset.id}
                className="ab-asset-card"
                onClick={() => handleProjectLibrary(asset)}
                title={`Proyectar: ${asset.label}`}
              >
                <img src={asset.src} alt={asset.label} className="ab-asset-img" />
                <span className="ab-asset-label">{asset.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: GENERATE ── */}
      {tab === 'generate' && (
        <div className="ab-body">

          {/* Aspect ratio selector */}
          <div className="ab-section-label">Proporción</div>
          <div className="ab-aspect-row">
            {ASPECT_OPTIONS.map(opt => (
              <button
                key={opt.id}
                className={`ab-aspect-btn ${aspect === opt.id ? 'ab-aspect-active' : ''}`}
                style={aspect === opt.id ? { borderColor: accentColor, color: accentColor } : {}}
                onClick={() => setAspect(opt.id)}
              >
                <span className="ab-aspect-ratio">{opt.label}</span>
                <span className="ab-aspect-desc">{opt.desc}</span>
              </button>
            ))}
          </div>

          {/* Quick prompt buttons */}
          <div className="ab-section-label">¿Qué generar?</div>
          <div className="ab-prompts">
            {AI_PROMPTS.map(p => (
              <button
                key={p.id}
                className={`ab-prompt-btn ${activePromptId === p.id ? 'ab-prompt-active' : ''}`}
                style={activePromptId === p.id ? { borderColor: accentColor, background: `${accentColor}18` } : {}}
                onClick={() => handleGenerate(p)}
                disabled={loading}
              >
                <span className="ab-prompt-icon">{p.icon}</span>
                <span className="ab-prompt-label">{p.label}</span>
              </button>
            ))}
          </div>

          {/* Loading state */}
          {loading && (
            <div className="ab-generating">
              <div className="ab-gen-spinner" style={{ borderTopColor: accentColor }} />
              <span>Generando imagen…</span>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="ab-error">⚠ {error}</div>
          )}

          {/* Preview + project */}
          {imageUrl && !loading && (
            <div className="ab-preview">
              <img src={imageUrl} alt="Imagen generada" className="ab-preview-img" />
              <div className="ab-preview-actions">
                <button
                  className="ab-project-btn"
                  style={{ background: accentColor }}
                  onClick={handleProjectGenerated}
                >
                  ▶ Proyectar
                </button>
                <button className="ab-discard-btn" onClick={clear}>
                  Descartar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
