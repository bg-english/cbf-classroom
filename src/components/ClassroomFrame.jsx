import { useState, useEffect, useCallback } from 'react'
import TopBar from './TopBar'
import MomentCanvas from './MomentCanvas'
import BoardStrip from './BoardStrip'
import ToolsPanel from './ToolsPanel'
import Whiteboard from './Whiteboard'
import AIPanel from './AIPanel'
import { getLocale } from '../utils/locale'

/* CBF Didactic Session — 6 moments */
const MOMENTS = [
  { id: 1, key: 'subject',    label: 'Topics',              color: '#dc2626', section: 'subject' },
  { id: 2, key: 'motivation', label: 'Subject to be Worked', color: '#0891b2', section: 'motivation' },
  { id: 3, key: 'activity',   label: 'Motivation',          color: '#16a34a', section: 'activity' },
  { id: 4, key: 'skill',      label: 'Skill Development',   color: '#7c3aed', section: 'skill' },
  { id: 5, key: 'assignment', label: 'Assignment',          color: '#2563eb', section: 'assignment' },
  { id: 6, key: 'closing',    label: 'Closing',             color: '#d97706', section: 'closing' },
]

export default function ClassroomFrame({ teacher, resolved, classroomData, onChangeClass, onSignOut }) {
  const [activeMoment, setActiveMoment] = useState(0)
  const [m3SubStep, setM3SubStep] = useState(0) // 0 = WBT rules, 1 = section content
  const [toolsOpen, setToolsOpen] = useState(false)
  const [whiteboardOpen, setWhiteboardOpen] = useState(false)
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [aiOverlay, setAiOverlay] = useState(null)
  const [videoOverlay, setVideoOverlay] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const { assignment, plan, todayKey, dayContent, combinedGrade } = resolved
  const t = getLocale(assignment?.subject)

  // Determine day class status (backward compat: active===false → no_class)
  const classStatus = dayContent?.class_status
    || (dayContent?.active === false ? 'no_class' : 'normal')
  const isSpecialDay = classStatus !== 'normal'

  const moment = MOMENTS[activeMoment]
  const sectionContent = dayContent?.sections?.[moment.section] || null

  // Reset M3 sub-step when changing moments
  useEffect(() => { setM3SubStep(0) }, [activeMoment])

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

  // Navigation with M3 sub-step support
  function goNext() {
    if (activeMoment === 2 && m3SubStep === 0) {
      setM3SubStep(1)
    } else {
      setActiveMoment(m => Math.min(m + 1, MOMENTS.length - 1))
    }
  }
  function goPrev() {
    if (activeMoment === 2 && m3SubStep === 1) {
      setM3SubStep(0)
    } else {
      setActiveMoment(m => Math.max(m - 1, 0))
    }
  }

  function handleKey(e) {
    if (toolsOpen || aiPanelOpen) return
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext() }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev() }
    if (e.key >= '1' && e.key <= '6') setActiveMoment(Number(e.key) - 1)
    if (e.key === 'Escape') { setToolsOpen(false); setAiPanelOpen(false); setAiOverlay(null); setVideoOverlay(null) }
    if (e.key === 'a' || e.key === 'A') { e.preventDefault(); setAiPanelOpen(o => !o) }
    if (e.key === 'F11') { e.preventDefault(); toggleFullscreen() }
  }

  const boardProps = {
    todayKey,
    dayContent,
    plan,
    classroomData,
    subject: assignment?.subject,
    combinedGrade,
  }

  return (
    <div className="cc-frame" tabIndex={0} onKeyDown={handleKey} style={{ outline: 'none' }}>
      <TopBar
        teacher={teacher}
        assignment={assignment}
        plan={plan}
        onChangeClass={onChangeClass}
        onSignOut={onSignOut}
        onOpenTools={() => setToolsOpen(true)}
        onOpenWhiteboard={() => setWhiteboardOpen(true)}
        onOpenAI={() => setAiPanelOpen(o => !o)}
        toolsOpen={toolsOpen}
        aiPanelOpen={aiPanelOpen}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        t={t}
      />

      <BoardStrip {...boardProps} t={t} />

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
          m3SubStep={m3SubStep}
          aiOverlay={aiOverlay}
          onDismissAI={() => setAiOverlay(null)}
          videoOverlay={videoOverlay}
          onDismissVideo={() => setVideoOverlay(null)}
          t={t}
        />
      )}

      {aiPanelOpen && (
        <AIPanel
          assignment={assignment}
          plan={plan}
          dayContent={dayContent}
          classroomData={classroomData}
          moment={moment}
          combinedGrade={combinedGrade}
          todayKey={todayKey}
          onProject={(result) => { setAiOverlay(result); setVideoOverlay(null); setAiPanelOpen(false) }}
          onProjectVideo={(videoId) => { setVideoOverlay(videoId); setAiOverlay(null); setAiPanelOpen(false) }}
          onClose={() => setAiPanelOpen(false)}
          t={t}
        />
      )}

      {whiteboardOpen && <Whiteboard onClose={() => setWhiteboardOpen(false)} />}

      {/* Bottom bar: moment dots + grade */}
      <footer className="cc-bottom-bar">
        <nav className="cc-moment-dots">
          {MOMENTS.map((m, i) => (
            <button
              key={m.id}
              className={`cc-dot${activeMoment === i ? ' active' : ''}${i < activeMoment ? ' done' : ''}`}
              style={{ '--dot-color': m.color }}
              onClick={() => { setToolsOpen(false); setActiveMoment(i) }}
              title={m.label}
            >
              {m.id}
            </button>
          ))}
        </nav>
        <span className="cc-bottom-grade">{combinedGrade}</span>
      </footer>
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
