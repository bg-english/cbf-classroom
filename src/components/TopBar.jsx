import { useState, useEffect, useMemo } from 'react'
import { getCurrentPeriod, getPeriodProgress } from '../utils/periodUtils'

/**
 * TopBar — always-visible header.
 * Contains: logo · class info · 6 moment pills · tools button · timer · menu
 */
export default function TopBar({
  teacher, assignment, combinedGrade, plan, todayKey,
  moments, activeMoment, onSelectMoment,
  onChangeClass, onSignOut, onOpenTools, onOpenWhiteboard, toolsOpen,
  isFullscreen, onToggleFullscreen
}) {
  const [time, setTime] = useState(new Date())
  const [elapsed, setElapsed] = useState(0) // seconds since session start
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

  const dateLabel = todayKey
    ? new Date(todayKey + 'T12:00:00').toLocaleDateString('es-CO', {
        weekday: 'long', day: 'numeric', month: 'long'
      })
    : ''

  return (
    <header className="cc-topbar">
      {/* Left: identity */}
      <div className="cc-topbar-left">
        <div className="cc-topbar-brand">ETA</div>
        <div className="cc-topbar-info">
          <span className="cc-topbar-grade">{combinedGrade}</span>
          <span className="cc-topbar-subject">{assignment?.subject}</span>
          <span className="cc-topbar-date">{dateLabel}</span>
          {period && progress && (
            <span className="cc-period-badge" title={period.label}>
              {period.short}
              {progress.remainingWeeks > 0 && (
                <span className="cc-period-weeks"> · {progress.remainingWeeks}sem</span>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Center: moment pills */}
      <nav className="cc-topbar-moments">
        {moments.map((m, i) => (
          <button
            key={m.id}
            className={`cc-moment-pill${!toolsOpen && activeMoment === i ? ' active' : ''}${!toolsOpen && i < activeMoment ? ' done' : ''}`}
            style={{ '--moment-color': m.color }}
            onClick={() => onSelectMoment(i)}
            title={m.label}
          >
            <span className="cc-moment-num">{m.id}</span>
            <span className="cc-moment-label">{m.label}</span>
          </button>
        ))}
      </nav>

      {/* Right: whiteboard, tools, clock, timer, menu */}
      <div className="cc-topbar-right">
        <button
          className="cc-whiteboard-btn"
          onClick={onOpenWhiteboard}
          title="Pizarra"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
          </svg>
        </button>

        <button
          className={`cc-tools-btn ${toolsOpen ? 'cc-tools-active' : ''}`}
          onClick={onOpenTools}
          title="Herramientas"
        >
          🌐
        </button>

        <div className="cc-topbar-clock">
          <span className="cc-clock">{formatClock(time)}</span>
          <span className="cc-elapsed">{formatTime(elapsed)}</span>
        </div>

        <div className="cc-topbar-menu-wrap">
          <button
            className="cc-topbar-menu-btn"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menú"
          >
            ⋯
          </button>
          {menuOpen && (
            <div className="cc-topbar-menu">
              <button onClick={() => { setMenuOpen(false); onOpenWhiteboard() }}>
                ✏ Pizarra
              </button>
              <button onClick={() => { setMenuOpen(false); onOpenTools() }}>
                🌐 Herramientas
              </button>
              <button onClick={() => { setMenuOpen(false); onToggleFullscreen() }}>
                {isFullscreen ? '⊡ Salir de pantalla completa' : '⊞ Pantalla completa'}
              </button>
              <button onClick={() => { setMenuOpen(false); onChangeClass() }}>
                🔄 Cambiar clase
              </button>
              <button onClick={() => { setMenuOpen(false); onSignOut() }}>
                ↩ Salir
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
