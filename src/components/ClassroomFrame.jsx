import { useState, useEffect, useCallback } from 'react'
import TopBar from './TopBar'
import MomentCanvas from './MomentCanvas'
import BoardStrip from './BoardStrip'
import ToolsPanel from './ToolsPanel'
import Whiteboard from './Whiteboard'

/*
 * ABC del Encuentro Académico — Boston Flex Methodological Approach 2026
 * Orden y nombres alineados con la fuente oficial (pp. 58-59):
 *
 *  1 Encuentro   — coral:   saludo, vocab list, principio bíblico
 *  2 Tema del Día — teal:   tablero (fecha · tema · objetivo · principio)
 *  3 Motivación  — green:   WBT rules + pre-conocimiento + conexión temática
 *  4 Desarrollo  — violet:  habilidad del día, modelado, práctica
 *  5 Cierre      — amber:   verificación + reflexión bíblica
 *  6 Tarea       — sky-blue: Weekly Challenge / Assignment
 *
 * Colores: WCAG AA sobre texto blanco (#fff), visibles a 5m+ en pantalla 55"-100".
 */
const MOMENTS = [
  { id: 1, key: 'subject',    label: 'Encuentro',    color: '#dc2626', section: 'subject',    abc: 'Saluda a presenciales y virtuales · Presenta Vocabulary List · Anuncia el Principio Bíblico del mes' },
  { id: 2, key: 'motivation', label: 'Tema del Día', color: '#0891b2', section: 'motivation', abc: 'Escribe en el tablero: Fecha · Tema · Objetivo · Principio Bíblico · No borrar durante la clase' },
  { id: 3, key: 'activity',   label: 'Motivación',   color: '#16a34a', section: 'activity',   abc: 'Menciona Reglas WBT · Pre-conocimiento: conecta con la clase anterior · Activa saberes previos' },
  { id: 4, key: 'skill',      label: 'Desarrollo',   color: '#7c3aed', section: 'skill',      abc: 'Desarrolla la habilidad del día · Modela y practica · Explica el Principio Bíblico (5 min) · Recuerda la ES y la rúbrica' },
  { id: 5, key: 'closing',    label: 'Cierre',       color: '#d97706', section: 'closing',    abc: 'Verifica asimilación con preguntas · Conecta el aprendizaje con el Principio Bíblico como cierre natural' },
  { id: 6, key: 'assignment', label: 'Tarea',        color: '#2563eb', section: 'assignment', abc: 'Asigna tarea concreta y alcanzable · Virtual Campus / Flex App · Preparación para la siguiente clase' },
]

export default function ClassroomFrame({ teacher, resolved, classroomData, onChangeClass, onSignOut }) {
  const [activeMoment, setActiveMoment] = useState(0)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [whiteboardOpen, setWhiteboardOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const { assignment, plan, todayKey, dayContent, combinedGrade } = resolved

  // Determine day class status (backward compat: active===false → no_class)
  const classStatus = dayContent?.class_status
    || (dayContent?.active === false ? 'no_class' : 'normal')
  const isSpecialDay = classStatus !== 'normal'

  const moment = MOMENTS[activeMoment]
  const sectionContent = dayContent?.sections?.[moment.section] || null

  // ── Fullscreen API ──
  const requestFullscreen = useCallback(() => {
    const el = document.documentElement
    const rfs = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen
    if (rfs) rfs.call(el).catch(() => {})
  }, [])

  const exitFullscreen = useCallback(() => {
    const efs = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen
    if (efs && document.fullscreenElement) efs.call(document).catch(() => {})
  }, [])

  function toggleFullscreen() {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      exitFullscreen()
    } else {
      requestFullscreen()
    }
  }

  // Auto-request fullscreen on mount (requires prior user gesture — works after login click)
  useEffect(() => {
    requestFullscreen()

    function onFsChange() {
      setIsFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement))
    }
    document.addEventListener('fullscreenchange', onFsChange)
    document.addEventListener('webkitfullscreenchange', onFsChange)
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange)
      document.removeEventListener('webkitfullscreenchange', onFsChange)
    }
  }, [requestFullscreen])

  function goNext() { setActiveMoment(m => Math.min(m + 1, MOMENTS.length - 1)) }
  function goPrev() { setActiveMoment(m => Math.max(m - 1, 0)) }

  function handleKey(e) {
    if (toolsOpen) return
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext() }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev() }
    if (e.key >= '1' && e.key <= '6') setActiveMoment(Number(e.key) - 1)
    if (e.key === 'Escape' && toolsOpen) setToolsOpen(false)
    if (e.key === 'F11') { e.preventDefault(); toggleFullscreen() }
  }

  // Board strip props — shared between BoardStrip instances
  const boardProps = {
    todayKey,
    dayContent,
    plan,
    classroomData,
    subject: assignment?.subject,
    combinedGrade,
  }

  // ABC: el tablero NUNCA se borra durante la clase — siempre visible
  const showBoardStrip = true

  return (
    <div className="cc-frame" tabIndex={0} onKeyDown={handleKey} style={{ outline: 'none' }}>
      <TopBar
        teacher={teacher}
        assignment={assignment}
        combinedGrade={combinedGrade}
        plan={plan}
        todayKey={todayKey}
        moments={MOMENTS}
        activeMoment={activeMoment}
        onSelectMoment={(i) => { setToolsOpen(false); setActiveMoment(i) }}
        onChangeClass={onChangeClass}
        onSignOut={onSignOut}
        onOpenTools={() => setToolsOpen(true)}
        onOpenWhiteboard={() => setWhiteboardOpen(true)}
        toolsOpen={toolsOpen}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {showBoardStrip && <BoardStrip {...boardProps} />}

      {toolsOpen ? (
        <ToolsPanel onClose={() => setToolsOpen(false)} />
      ) : isSpecialDay ? (
        <SpecialDayCanvas
          classStatus={classStatus}
          statusReason={dayContent?.status_reason}
          todayKey={todayKey}
          plan={plan}
          assignment={assignment}
          combinedGrade={combinedGrade}
        />
      ) : (
        <MomentCanvas
          moment={moment}
          sectionContent={sectionContent}
          plan={plan}
          dayContent={dayContent}
          classroomData={classroomData}
          todayKey={todayKey}
          combinedGrade={combinedGrade}
          subject={assignment?.subject}
          onNext={goNext}
          onPrev={goPrev}
          isFirst={activeMoment === 0}
          isLast={activeMoment === MOMENTS.length - 1}
        />
      )}

      {whiteboardOpen && <Whiteboard onClose={() => setWhiteboardOpen(false)} />}
    </div>
  )
}

// ── SpecialDayCanvas — shown when class_status !== 'normal' ───────────────────

const SPECIAL_DAY_CONFIG = {
  no_class: {
    icon: '🚫',
    title: 'No hubo clase',
    color: '#dc2626',
    bg: '#fef2f2',
    defaultReason: 'Día sin clase',
  },
  async: {
    icon: '🏠',
    title: 'Clase asincrónica',
    color: '#2563eb',
    bg: '#eff6ff',
    defaultReason: 'Los estudiantes trabajan desde casa',
  },
  interrupted: {
    icon: '⚑',
    title: 'Clase interrumpida',
    color: '#d97706',
    bg: '#fffbeb',
    defaultReason: 'Actividad institucional',
  },
}

function SpecialDayCanvas({ classStatus, statusReason, todayKey, plan, assignment, combinedGrade }) {
  const cfg = SPECIAL_DAY_CONFIG[classStatus] || SPECIAL_DAY_CONFIG.no_class

  const dateLabel = todayKey
    ? new Date(todayKey + 'T12:00:00').toLocaleDateString('es-CO', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : ''

  const subjectLabel = assignment?.subject || ''
  const gradeLabel   = combinedGrade || ''

  return (
    <main className="cc-canvas cc-special-day" style={{ '--moment-color': cfg.color }}>
      <div className="cc-special-day-inner" style={{ background: cfg.bg }}>

        {/* Icon */}
        <div className="cc-special-icon">{cfg.icon}</div>

        {/* Title */}
        <h2 className="cc-special-title" style={{ color: cfg.color }}>{cfg.title}</h2>

        {/* Date */}
        {dateLabel && (
          <p className="cc-special-date" style={{ color: cfg.color }}>
            {dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)}
          </p>
        )}

        {/* Reason */}
        <div className="cc-special-reason">
          {statusReason || cfg.defaultReason}
        </div>

        {/* Context */}
        {(subjectLabel || gradeLabel) && (
          <div className="cc-special-context">
            {gradeLabel && <span>{gradeLabel}</span>}
            {subjectLabel && <span>{subjectLabel}</span>}
            {plan?.week_number && <span>Semana {plan.week_number}</span>}
          </div>
        )}

        {/* Async instructions box */}
        {classStatus === 'async' && statusReason && (
          <div className="cc-special-async-box">
            <div className="cc-special-async-label">📋 Instrucciones para casa:</div>
            <div className="cc-special-async-text">{statusReason}</div>
          </div>
        )}
      </div>
    </main>
  )
}
