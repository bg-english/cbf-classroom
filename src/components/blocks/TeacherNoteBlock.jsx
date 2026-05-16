/**
 * TeacherNoteBlock — nota privada del docente.
 * Styling discreto: fondo ámbar claro, letras en muted.
 * No distrae a los estudiantes pero el docente la ve en la pantalla.
 */

const PRIORITY_STYLES = {
  low:    { icon: '📌', border: '#94a3b8', bg: '#f8fafc' },
  normal: { icon: '💼', border: '#d97706', bg: '#fffbeb' },
  high:   { icon: '⚠️', border: '#dc2626', bg: '#fef2f2' },
}

export default function TeacherNoteBlock({ data }) {
  const { text, priority = 'normal' } = data
  const style = PRIORITY_STYLES[priority] || PRIORITY_STYLES.normal

  if (!text) return null

  return (
    <div
      className="br-teacher-note"
      style={{ borderLeftColor: style.border, background: style.bg }}
    >
      <span className="br-note-icon">{style.icon}</span>
      <div className="br-note-content">
        <span className="br-note-label">Nota docente</span>
        <p className="br-note-text">{text}</p>
      </div>
    </div>
  )
}
