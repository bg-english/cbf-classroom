import { useEffect, useState } from 'react'
import { resolveCurrentClass, loadTeacherAssignments, resolvePlanDay } from '../utils/classResolver'
import { supabase } from '../utils/supabase'
import ClassPicker from '../components/ClassPicker'
import ClassroomFrame from '../components/ClassroomFrame'

function getMondayOfDate(dateStr) {
  const date = new Date(dateStr + 'T12:00:00')
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(isoDate, n) {
  const date = new Date(isoDate + 'T12:00:00')
  date.setDate(date.getDate() + n)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function ClassroomApp({ session, teacher }) {
  const [resolving, setResolving] = useState(true)
  const [resolved, setResolved] = useState(null)
  const [classroomData, setClassroomData] = useState(null) // enriched data for moments
  const [assignments, setAssignments] = useState([])
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    autoResolve()
  }, [teacher.id])

  async function autoResolve() {
    setResolving(true)
    const result = await resolveCurrentClass(teacher)
    setResolved(result)
    const all = await loadTeacherAssignments(teacher)
    setAssignments(all)

    if (result) {
      const enriched = await loadEnrichedData(result)
      setClassroomData(enriched)
    }

    setResolving(false)
  }

  async function handlePickClass(assignment) {
    setShowPicker(false)
    setResolving(true)

    const today = new Date().toISOString().split('T')[0]
    const combinedGrade = `${assignment.grade} ${assignment.section}`

    const { data: plans } = await supabase
      .from('lesson_plans')
      .select('id, grade, subject, week_number, date_range, content, status, week_count, monday_date, news_project_id')
      .eq('teacher_id', teacher.id)
      .eq('grade', combinedGrade)
      .eq('subject', assignment.subject)
      .order('created_at', { ascending: false })
      .limit(5)

    // Match plan by monday_date when possible
    const mondayOfToday = getMondayOfDate(today)
    const plan = plans?.find(p => {
      if (!p.monday_date) return false
      if (p.monday_date === mondayOfToday) return true
      if (p.week_count === 2 && addDays(p.monday_date, 7) === mondayOfToday) return true
      return false
    }) || plans?.[0] || null

    const { dayContent, dayKey } = resolvePlanDay(plan, today)
    const result = { assignment, plan, todayKey: dayKey, dayContent, combinedGrade, scheduleSlot: null }

    setResolved(result)
    const enriched = await loadEnrichedData(result)
    setClassroomData(enriched)
    setResolving(false)
  }

  /**
   * Load extra data needed for classroom moments:
   * - Monthly biblical principle
   * - NEWS project biblical principle (from plan.news_project_id)
   */
  async function loadEnrichedData(result) {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    // Fetch monthly principle
    const { data: monthly } = await supabase
      .from('school_monthly_principles')
      .select('month_verse, month_verse_ref, indicator_principle')
      .eq('school_id', teacher.school_id)
      .eq('year', year)
      .eq('month', month)
      .single()

    // Fetch NEWS project for biblical principle
    let newsProject = null
    const newsProjectId = result.plan?.news_project_id
      || result.plan?.content?.objetivo?.news_project_id

    if (newsProjectId) {
      const { data } = await supabase
        .from('news_projects')
        .select('title, biblical_principle, indicator_verse_ref, biblical_reflection, target_indicador')
        .eq('id', newsProjectId)
        .single()
      newsProject = data
    }

    return {
      yearVerse: teacher.schools?.year_verse || null,
      yearVerseRef: teacher.schools?.year_verse_ref || null,
      monthVerse: monthly?.month_verse || null,
      monthVerseRef: monthly?.month_verse_ref || null,
      biblicalPrinciple: newsProject?.biblical_principle || null,
      indicatorVerseRef: newsProject?.indicator_verse_ref || null,
      biblicalReflection: newsProject?.biblical_reflection || null,
      newsProjectTitle: newsProject?.title || null,
      schoolName: teacher.schools?.name || 'Colegio Boston Flexible',
      schoolLogo: teacher.schools?.logo_url || null,
    }
  }

  if (resolving) {
    return (
      <div className="cc-loading-screen">
        <div className="cc-loading-logo">ETA</div>
        <p className="cc-loading-text">Loading classroom...</p>
        <div className="cc-loading-spinner" />
      </div>
    )
  }

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

  return (
    <ClassroomFrame
      teacher={teacher}
      resolved={resolved}
      classroomData={classroomData}
      onChangeClass={() => setShowPicker(true)}
      onSignOut={() => supabase.auth.signOut()}
    />
  )
}
