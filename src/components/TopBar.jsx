import { useState, useEffect } from 'react'

/**
 * TopBar — always-visible header.
 * Contains: logo · class info · 5 moment pills · timer · menu
 */
export default function TopBar({
  teacher, assignment, combinedGrade, plan, todayKey,
  moments, activeMoment, onSelectMoment,
  onChangeClass, onSignOut
}) {
  const [time, setTime] = useState(new Date())
  const [elapsed, setElapsed] = useState(0) // seconds since session start
  const [sessionStart] = useState(Date.now())
  const [menuOpen, setMenuOpen] = useState(false)

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
        </div>
      </div>

      {/* Center: moment pills */}
      <nav className="cc-topbar-moments">
        {moments.map((m, i) => (
          <button
            key={m.id}
            className={`cc-moment-pill${activeMoment === i ? ' active' : ''}${i < activeMoment ? ' done' : ''}`}
            style={{ '--moment-color': m.color }}
            onClick={() => onSelectMoment(i)}
            title={m.label}
          >
            <span className="cc-moment-num">{m.short}</span>
            <span className="cc-moment-label">{m.label}</span>
          </button>
        ))}
      </nav>

      {/* Right: clock, timer, menu */}
      <div className="cc-topbar-right">
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
