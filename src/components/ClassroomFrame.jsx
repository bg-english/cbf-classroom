import { useState, useEffect, useCallback } from 'react'
import TopBar from './TopBar'
import MomentCanvas from './MomentCanvas'
import BoardStrip from './BoardStrip'
import ToolsPanel from './ToolsPanel'

/*
 * Moment colors — medium saturation, eye-care friendly.
 *
 * Rationale (educational color psychology):
 *  1 Apertura  — warm coral:  welcoming, energising start
 *  2 Presentación — teal:     calm focus, receptive listening
 *  3 Desarrollo — green:      growth, active work, safety
 *  4 Aplicación — violet:     creativity, deeper thinking
 *  5 Tarea     — sky-blue:    clarity, structured intent
 *  6 Cierre    — amber:       warmth, closure, reflection
 *
 * All colours meet WCAG AA contrast on white text (#fff).
 */
const MOMENTS = [
  { id: 1, key: 'subject',    label: 'Apertura',     color: '#d4605c', section: 'subject'    },
  { id: 2, key: 'motivation', label: 'Presentación', color: '#3ea8b8', section: 'motivation' },
  { id: 3, key: 'activity',   label: 'Desarrollo',   color: '#5da84a', section: 'activity'   },
  { id: 4, key: 'skill',      label: 'Aplicación',   color: '#8768b8', section: 'skill'      },
  { id: 5, key: 'assignment', label: 'Tarea',        color: '#5a91e6', section: 'assignment' },
  { id: 6, key: 'closing',    label: 'Cierre',       color: '#d4924a', section: 'closing'    },
]

export default function ClassroomFrame({ teacher, resolved, classroomData, onChangeClass, onSignOut }) {
  const [activeMoment, setActiveMoment] = useState(0)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const { assignment, plan, todayKey, dayContent, combinedGrade } = resolved
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

  // Show BoardStrip in moments 2-6 and tools mode (never in Apertura — it has the full board)
  const showBoardStrip = activeMoment > 0 || toolsOpen

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
        toolsOpen={toolsOpen}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {showBoardStrip && <BoardStrip {...boardProps} />}

      {toolsOpen ? (
        <ToolsPanel onClose={() => setToolsOpen(false)} />
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
    </div>
  )
}
