/**
 * ClassPicker — fallback cuando no se detecta clase automáticamente.
 * Muestra todas las asignaciones del docente para selección manual.
 */
export default function ClassPicker({ teacher, assignments, onSelect, noAutoDetect, onSignOut }) {
  return (
    <div className="cc-picker-screen">
      <div className="cc-picker-card">
        <div className="cc-picker-header">
          <span className="cc-picker-logo">ETA Classroom</span>
          <button className="cc-picker-signout" onClick={onSignOut}>Salir</button>
        </div>

        <div className="cc-picker-greeting">
          <h2>Hola, {teacher.full_name?.split(' ')[0] || 'Docente'}</h2>
          {noAutoDetect
            ? <p>No se detectó una clase activa en este momento. Selecciona manualmente:</p>
            : <p>¿A cuál clase deseas entrar?</p>
          }
        </div>

        {assignments.length === 0 ? (
          <div className="cc-picker-empty">
            <p>No tienes asignaciones registradas.</p>
            <p>Pídele al coordinador que te asigne materias en CBF Planner.</p>
          </div>
        ) : (
          <div className="cc-picker-list">
            {assignments.map(a => (
              <button
                key={a.id}
                className="cc-picker-item"
                onClick={() => onSelect(a)}
              >
                <span className="cc-picker-grade">{a.grade} {a.section}</span>
                <span className="cc-picker-subject">{a.subject}</span>
                <span className="cc-picker-arrow">→</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
