import { useState, useEffect, useRef } from 'react'

/**
 * GamesPanel — tap-only classroom dynamics toolkit.
 * Three tabs: Timer | Ruleta | Marcador
 *
 * Designed for 55"-100" touch screens. No typing. Big tap targets.
 */

const TIMER_PRESETS = [
  { label: '30s',  s: 30  },
  { label: '1:00', s: 60  },
  { label: '2:00', s: 120 },
  { label: '3:00', s: 180 },
  { label: '5:00', s: 300 },
  { label: '10:00',s: 600 },
]

const TEAMS = [
  { id: 'A', color: '#dc2626' },
  { id: 'B', color: '#2563eb' },
  { id: 'C', color: '#16a34a' },
  { id: 'D', color: '#d97706' },
]

export default function GamesPanel({ moment, classroomData, isEn, onClose }) {
  const [tab, setTab] = useState('timer')

  return (
    <div className="gp-panel">
      {/* Header */}
      <div className="gp-header">
        <div className="gp-title">
          <span>🎲</span>
          <span>{isEn ? 'Classroom Tools' : 'Dinámica de clase'}</span>
        </div>
        <button className="gp-close" onClick={onClose}>✕</button>
      </div>

      {/* Tabs */}
      <div className="gp-tabs">
        {[
          { id: 'timer',    label: isEn ? 'Timer'    : 'Temporizador' },
          { id: 'ruleta',   label: isEn ? 'Pick'     : 'Ruleta'       },
          { id: 'marcador', label: isEn ? 'Score'    : 'Marcador'     },
        ].map(t => (
          <button
            key={t.id}
            className={`gp-tab ${tab === t.id ? 'gp-tab-active' : ''}`}
            onClick={() => setTab(t.id)}
            style={tab === t.id ? { borderBottomColor: moment?.color } : {}}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="gp-body">
        {tab === 'timer'    && <GameTimer    moment={moment} isEn={isEn} />}
        {tab === 'ruleta'   && <SpinRuleta   moment={moment} classroomData={classroomData} isEn={isEn} />}
        {tab === 'marcador' && <TeamScoreboard moment={moment} isEn={isEn} />}
      </div>
    </div>
  )
}

/* ─── TIMER ─────────────────────────────────────────────── */

function GameTimer({ moment, isEn }) {
  const [total,     setTotal]     = useState(60)
  const [remaining, setRemaining] = useState(60)
  const [running,   setRunning]   = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) { setRunning(false); return 0 }
          return r - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  function setPreset(s) {
    setRunning(false)
    setTotal(s)
    setRemaining(s)
  }

  function toggle() {
    if (remaining === 0) { setRemaining(total); setRunning(true) }
    else setRunning(r => !r)
  }

  function reset() { setRunning(false); setRemaining(total) }

  function fmt(sec) {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${sec}s`
  }

  const pct   = total > 0 ? (remaining / total) * 100 : 0
  const isLow = remaining > 0 && remaining <= 10
  const isDone = remaining === 0
  const accent = isDone ? '#dc2626' : isLow ? '#d97706' : (moment?.color || '#2563eb')

  return (
    <div className="gt-timer">
      <div className={`gt-display ${isDone ? 'gt-done' : isLow ? 'gt-low' : ''}`}
        style={{ color: accent }}>
        {isDone ? (isEn ? 'Time!' : '¡Tiempo!') : fmt(remaining)}
      </div>

      <div className="gt-progress-track">
        <div className="gt-progress-fill"
          style={{ width: `${pct}%`, background: accent, transition: running ? 'width 1s linear' : 'none' }} />
      </div>

      <div className="gt-presets">
        {TIMER_PRESETS.map(p => (
          <button
            key={p.s}
            className={`gt-preset ${total === p.s ? 'gt-preset-active' : ''}`}
            onClick={() => setPreset(p.s)}
            style={total === p.s ? { borderColor: moment?.color, color: moment?.color } : {}}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="gt-controls">
        <button className="gt-btn-play" onClick={toggle} style={{ background: accent }}>
          {running ? '⏸' : isDone ? '↺' : '▶'}
        </button>
        <button className="gt-btn-reset" onClick={reset} title={isEn ? 'Reset' : 'Reiniciar'}>↺</button>
      </div>
    </div>
  )
}

/* ─── RULETA ─────────────────────────────────────────────── */

function SpinRuleta({ moment, classroomData, isEn }) {
  const [spinning, setSpinning]   = useState(false)
  const [display,  setDisplay]    = useState('?')
  const [result,   setResult]     = useState(null)
  const [count,    setCount]      = useState(30)

  // Use student names if available, otherwise numbers
  const items = classroomData?.students?.length > 0
    ? classroomData.students
    : Array.from({ length: count }, (_, i) => String(i + 1))

  function spin() {
    if (spinning) return
    setSpinning(true)
    setResult(null)

    const winner = items[Math.floor(Math.random() * items.length)]
    const flashes = 24
    let i = 0

    function flash() {
      if (i < flashes) {
        setDisplay(items[Math.floor(Math.random() * items.length)])
        i++
        const delay = 40 + (i / flashes) * 320
        setTimeout(flash, delay)
      } else {
        setDisplay(winner)
        setResult(winner)
        setSpinning(false)
      }
    }
    flash()
  }

  function adjustCount(delta) {
    setCount(c => Math.max(2, Math.min(40, c + delta)))
    setDisplay('?')
    setResult(null)
  }

  const hasStudentNames = classroomData?.students?.length > 0

  return (
    <div className="gt-ruleta">
      <div className={`gt-spin-display ${spinning ? 'gt-spinning' : ''} ${result && !spinning ? 'gt-result' : ''}`}
        style={{ borderColor: result && !spinning ? moment?.color : 'var(--border-light)', color: result && !spinning ? moment?.color : 'var(--text-secondary)' }}
      >
        {display}
      </div>

      {result && !spinning && (
        <p className="gt-winner-label" style={{ color: moment?.color }}>
          {hasStudentNames ? (isEn ? '🎉 Selected!' : '🎉 ¡Seleccionado!') : `#${result}`}
        </p>
      )}

      <button
        className="gt-spin-btn"
        onClick={spin}
        disabled={spinning}
        style={{ background: spinning ? 'var(--bg-600)' : moment?.color }}
      >
        {spinning ? (isEn ? 'Spinning…' : 'Girando…') : (isEn ? 'Spin!' : '¡Girar!')}
      </button>

      {!hasStudentNames && (
        <div className="gt-count-control">
          <span className="gt-count-label">{isEn ? 'Students:' : 'Estudiantes:'}</span>
          <button className="gt-count-btn" onClick={() => adjustCount(-1)}>−</button>
          <span className="gt-count-val">{count}</span>
          <button className="gt-count-btn" onClick={() => adjustCount(1)}>+</button>
        </div>
      )}
    </div>
  )
}

/* ─── SCOREBOARD ─────────────────────────────────────────── */

function TeamScoreboard({ moment, isEn }) {
  const [scores, setScores] = useState({ A: 0, B: 0, C: 0, D: 0 })

  function add(id) { setScores(s => ({ ...s, [id]: s[id] + 1 })) }
  function sub(id) { setScores(s => ({ ...s, [id]: Math.max(0, s[id] - 1) })) }
  function reset()  { setScores({ A: 0, B: 0, C: 0, D: 0 }) }

  const maxScore = Math.max(...Object.values(scores), 1)

  return (
    <div className="gt-scoreboard">
      {TEAMS.map(team => {
        const isLeader = scores[team.id] === maxScore && scores[team.id] > 0
        return (
          <div key={team.id} className={`gt-team-card ${isLeader ? 'gt-leader' : ''}`}
            style={{ borderTopColor: team.color }}>
            <div className="gt-team-top">
              <span className="gt-team-name" style={{ color: team.color }}>
                {isLeader && '👑 '}
                {isEn ? 'Team' : 'Equipo'} {team.id}
              </span>
              <span className="gt-team-score">{scores[team.id]}</span>
            </div>
            <div className="gt-team-bar-track">
              <div className="gt-team-bar-fill"
                style={{ width: `${(scores[team.id] / maxScore) * 100}%`, background: team.color }} />
            </div>
            <div className="gt-team-btns">
              <button className="gt-score-add" onClick={() => add(team.id)}
                style={{ background: team.color }}>+</button>
              <button className="gt-score-sub" onClick={() => sub(team.id)}>−</button>
            </div>
          </div>
        )
      })}
      <button className="gt-reset-all" onClick={reset}>
        {isEn ? 'Reset All' : 'Reiniciar todo'}
      </button>
    </div>
  )
}
