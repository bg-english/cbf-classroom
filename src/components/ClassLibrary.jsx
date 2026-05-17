import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

/**
 * ClassLibrary — panel de gestión de clases preparadas con IA.
 *
 * Muestra todas las sesiones guardadas en generated_class_library,
 * agrupadas por (plan_id + grade + class_date), con sus escenas preparadas.
 * El docente puede eliminar una sesión (borra DB + Storage).
 */

const SCENE_LABELS = {
  verse_year_comic:    'Versículo del Año',
  verse_month_comic:   'Versículo del Mes',
  verse_guide_comic:   'Versículo Guía',
  indicator_questions: 'Principio del Indicador',
  vocabulary:          'Vocabulario',
}

export default function ClassLibrary({ onClose }) {
  const [sessions,  setSessions]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [deleting,  setDeleting]  = useState(null)   // sessionKey being deleted
  const [expandedKey, setExpanded] = useState(null)  // expanded card

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)

    // All library entries, newest first
    const { data: entries } = await supabase
      .from('generated_class_library')
      .select('plan_id, grade, class_date, content_key, created_at')
      .order('class_date', { ascending: false })

    if (!entries?.length) { setSessions([]); setLoading(false); return }

    // Group by session key
    const map = {}
    for (const e of entries) {
      const k = `${e.plan_id}|${e.grade}|${e.class_date}`
      if (!map[k]) map[k] = { planId: e.plan_id, grade: e.grade, classDate: e.class_date, scenes: [], latestAt: e.created_at }
      map[k].scenes.push(e.content_key)
      if (e.created_at > map[k].latestAt) map[k].latestAt = e.created_at
    }

    // Fetch plan metadata (subject + week) for each unique plan
    const planIds = [...new Set(entries.map(e => e.plan_id))]
    const { data: plans } = await supabase
      .from('lesson_plans')
      .select('id, subject, week_number')
      .in('id', planIds)

    const planMeta = {}
    for (const p of (plans || [])) planMeta[p.id] = p

    const list = Object.entries(map).map(([k, s]) => ({
      ...s,
      key:        k,
      subject:    planMeta[s.planId]?.subject    || '—',
      weekNumber: planMeta[s.planId]?.week_number || null,
    }))

    setSessions(list)
    setLoading(false)
  }

  async function deleteSession(session) {
    setDeleting(session.key)

    // Delete from DB
    await supabase
      .from('generated_class_library')
      .delete()
      .eq('plan_id',    session.planId)
      .eq('grade',      session.grade)
      .eq('class_date', session.classDate)

    // Delete images from Storage
    const prefix = `${session.planId}/${session.grade.replace(/\s/g, '_')}/${session.classDate}`
    const { data: files } = await supabase.storage.from('class-library').list(prefix)
    if (files?.length) {
      const paths = files.map(f => `${prefix}/${f.name}`)
      await supabase.storage.from('class-library').remove(paths)
    }

    setDeleting(null)
    setSessions(prev => prev.filter(s => s.key !== session.key))
  }

  const totalScenes = sessions.reduce((sum, s) => sum + s.scenes.length, 0)

  return (
    <div className="cl-panel">

      {/* Header */}
      <div className="cl-header">
        <div className="cl-header-title">
          <span className="cl-header-icon">📚</span>
          <div>
            <span className="cl-header-name">Biblioteca de Clases</span>
            {!loading && (
              <span className="cl-header-count">
                {sessions.length} {sessions.length === 1 ? 'sesión' : 'sesiones'} · {totalScenes} escenas
              </span>
            )}
          </div>
        </div>
        <button className="cl-close-btn" onClick={onClose}>✕</button>
      </div>

      {/* Body */}
      <div className="cl-body">
        {loading ? (
          <div className="cl-loading">
            <div className="cl-spinner" />
            <span>Cargando biblioteca…</span>
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="cl-list">
            {sessions.map(session => (
              <SessionCard
                key={session.key}
                session={session}
                isDeleting={deleting === session.key}
                isExpanded={expandedKey === session.key}
                onToggle={() => setExpanded(k => k === session.key ? null : session.key)}
                onDelete={() => deleteSession(session)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Session card ──────────────────────────────────────────────────────────────

function SessionCard({ session, isDeleting, isExpanded, onToggle, onDelete }) {
  const dateLabel = new Date(session.classDate + 'T12:00:00').toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
  const dateShort = new Date(session.classDate + 'T12:00:00').toLocaleDateString('es-CO', {
    day: 'numeric', month: 'short',
  })
  const updatedLabel = new Date(session.latestAt).toLocaleDateString('es-CO', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className={`cl-card ${isDeleting ? 'cl-card-deleting' : ''}`}>
      {/* Card header — tap to expand */}
      <button className="cl-card-main" onClick={onToggle}>
        <div className="cl-card-left">
          <div className="cl-card-subject">{session.subject}</div>
          <div className="cl-card-grade">{session.grade}</div>
          <div className="cl-card-date-row">
            <span className="cl-card-date">{dateLabel}</span>
            {session.weekNumber && (
              <span className="cl-card-week">Semana {session.weekNumber}</span>
            )}
          </div>
        </div>
        <div className="cl-card-right">
          <div className="cl-card-scene-count">
            <span className="cl-scene-num">{session.scenes.length}</span>
            <span className="cl-scene-word">{session.scenes.length === 1 ? 'escena' : 'escenas'}</span>
          </div>
          <span className="cl-card-chevron">{isExpanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="cl-card-detail">
          <div className="cl-detail-scenes">
            {session.scenes.map(k => (
              <span key={k} className="cl-scene-chip">
                <span className="cl-chip-check">✓</span>
                {SCENE_LABELS[k] || k}
              </span>
            ))}
          </div>
          <div className="cl-detail-footer">
            <span className="cl-detail-updated">Actualizado: {updatedLabel}</span>
            <button
              className="cl-delete-btn"
              onClick={onDelete}
              disabled={isDeleting}
              title="Eliminar clase guardada"
            >
              {isDeleting ? '…' : '🗑 Eliminar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="cl-empty">
      <div className="cl-empty-icon">📚</div>
      <p className="cl-empty-title">Biblioteca vacía</p>
      <p className="cl-empty-hint">
        Cuando generes el contenido de una clase en el Momento 1 (versículos e ilustraciones),
        quedará guardado aquí automáticamente para reutilizarlo sin necesidad de volver a generarlo.
      </p>
    </div>
  )
}
