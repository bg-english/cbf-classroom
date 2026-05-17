import { useState, useEffect, useMemo } from 'react'
import { getCurrentPeriod, getPeriodProgress } from '../utils/periodUtils'

/**
 * TopBar — minimal header: subject + period (left), clock + tools + menu (right).
 * Moment navigation moved to bottom dots. Grade moved to bottom center.
 */
export default function TopBar({
  teacher, assignment, plan,
  onChangeClass, onSignOut, onOpenTools, onOpenWhiteboard, onOpenAI,
  toolsOpen, aiPanelOpen, isFullscreen, onToggleFullscreen, t
}) {
  const [time, setTime] = useState(new Date())
  const [elapsed, setElapsed] = useState(0)
  const [sessionStart] = useState(Date.now())
  const [menuOpen, setMenuOpen] = useState(false)

  const period   = useMemo(() => getCurrentPeriod(), [])
  const progress = useMemo(() => getPeriodProgress(period), [period])

  useEffect(() => {
    const tick = setInterval(() => {
      setTime(new Date())
      setElapsed(Math.floor((Date.now() - sessionStart) / 1000))
    }, 1000)
    return () => clearInterval(tick)
  }, [sessionStart])

  function formatTime(sec) {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  function formatClock(date) {
    return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <header className="cc-topbar">
      <div className="cc-topbar-left">
        <span className="cc-topbar-subject">{assignment?.subject}</span>
        {period && progress && (
          <span className="cc-period-badge" title={period.label}>
            {period.short}
          </span>
        )}
      </div>

      <div className="cc-topbar-right">
        <button
          className="cc-whiteboard-btn"
          onClick={onOpenWhiteboard}
          title={t.whiteboard}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
          </svg>
        </button>

        <button
          className={`cc-tools-btn ${toolsOpen ? 'cc-tools-active' : ''}`}
          onClick={onOpenTools}
          title={t.tools}
        >
          🌐
        </button>

        <button
          className={`cc-ai-btn ${aiPanelOpen ? 'cc-ai-active' : ''}`}
          onClick={onOpenAI}
          title={t.aiTitle || 'AI Assistant'}
        >
          ✦
        </button>

        <div className="cc-topbar-clock">
          <span className="cc-clock">{formatClock(time)}</span>
          <span className="cc-elapsed">{formatTime(elapsed)}</span>
        </div>

        <div className="cc-topbar-menu-wrap">
          <button
            className="cc-topbar-menu-btn"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
          >
            ⋯
          </button>
          {menuOpen && (
            <div className="cc-topbar-menu">
              <button onClick={() => { setMenuOpen(false); onOpenWhiteboard() }}>
                ✏ {t.whiteboard}
              </button>
              <button onClick={() => { setMenuOpen(false); onOpenTools() }}>
                🌐 {t.tools}
              </button>
              <button onClick={() => { setMenuOpen(false); onToggleFullscreen() }}>
                {isFullscreen ? t.exitFullscreen : t.enterFullscreen}
              </button>
              <button onClick={() => { setMenuOpen(false); onChangeClass() }}>
                {t.changeClass}
              </button>
              <button onClick={() => { setMenuOpen(false); onSignOut() }}>
                {t.signOut}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
