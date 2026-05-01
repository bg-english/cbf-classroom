import { useEffect, useState } from 'react'
import { resolveCurrentClass, loadTeacherAssignments } from '../utils/classResolver'
import { supabase } from '../utils/supabase'
import ClassPicker from '../components/ClassPicker'
import ClassroomFrame from '../components/ClassroomFrame'

/**
 * ClassroomApp — main entry after auth.
 * Resolves the current class automatically, then renders the classroom frame.
 */
export default function ClassroomApp({ session, teacher }) {
  const [resolving, setResolving] = useState(true)
  const [resolved, setResolved] = useState(null)       // { assignment, plan, todayKey, dayContent, combinedGrade }
  const [assignments, setAssignments] = useState([])
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    autoResolve()
  }, [teacher.id])

  async function autoResolve() {
    setResolving(true)
    const result = await resolveCurrentClass(teacher)
    setResolved(result)

    // Always load assignments for manual picker fallback
    const all = await loadTeacherAssignments(teacher)
    setAssignments(all)

    setResolving(false)
  }

  async function handlePickClass(assignment) {
    setShowPicker(false)
    setResolving(true)

    // Find lesson plan for the manually selected assignment
    const today = new Date().toISOString().split('T')[0]
    const combinedGrade = `${assignment.grade} ${assignment.section}`

    const { data: plans } = await supabase
      .from('lesson_plans')
      .select('id, grade, subject, week_number, date_range, content, status, week_count')
      .eq('teacher_id', teacher.id)
      .eq('grade', combinedGrade)
      .eq('subject', assignment.subject)
      .order('created_at', { ascending: false })
      .limit(5)

    const plan = plans?.[0] || null
    const dayContent = plan?.content?.days?.[today] || null

    setResolved({ assignment, plan, todayKey: today, dayContent, combinedGrade, scheduleSlot: null })
    setResolving(false)
  }

  // Loading
  if (resolving) {
    return (
      <div className="cc-loading-screen">
        <div className="cc-loading-logo">ETA</div>
        <p className="cc-loading-text">Detectando clase...</p>
        <div className="cc-loading-spinner" />
      </div>
    )
  }

  // Manual picker (no class detected or teacher requests change)
  if (showPicker || !resolved) {
    return (
      <ClassPicker
        teacher={teacher}
        assignments={assignments}
        onSelect={handlePickClass}
        noAutoDetect={!resolved}
        onSignOut={() => supabase.auth.signOut()}
      />
    )
  }

  // Classroom active
  return (
    <ClassroomFrame
      teacher={teacher}
      resolved={resolved}
      onChangeClass={() => setShowPicker(true)}
      onSignOut={() => supabase.auth.signOut()}
    />
  )
}
