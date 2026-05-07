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
  { id: 1, key: 'subject',    label: 'Encuentro',    color: '#dc2626', section: 'subject'    },
  { id: 2, key: 'motivation', label: 'Tema del Día', color: '#0891b2', section: 'motivation' },
  { id: 3, key: 'activity',   label: 'Motivación',   color: '#16a34a', section: 'activity'   },
  { id: 4, key: 'skill',      label: 'Desarrollo',   color: '#7c3aed', section: 'skill'      },
  { id: 5, key: 'closing',    label: 'Cierre',       color: '#d97706', section: 'closing'    },
  { id: 6, key: 'assignment', label: 'Tarea',        color: '#2563eb', section: 'assignment' },
]

export default function ClassroomFrame({ teacher, resolved, classroomData, onChangeClass, onSignOut }) {
  const [activeMoment, setActiveMoment] = useState(0)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [whiteboardOpen, setWhiteboardOpen] = useState(false)
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
