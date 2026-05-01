import { supabase } from './supabase'

/**
 * classResolver — detects the current class for a teacher based on:
 * 1. teacher_assignments.schedule JSONB × current day/time
 * 2. lesson_plans for this week + grade + subject
 * 3. content.days[today] from the lesson plan
 *
 * Returns: { assignment, plan, todayKey, dayContent } or null if no class now.
 */

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

/**
 * Get current day key (mon, tue, wed, thu, fri)
 */
function currentDayKey() {
  return DAY_KEYS[new Date().getDay()]
}

/**
 * Get today's date as YYYY-MM-DD
 */
function todayISO() {
  return new Date().toISOString().split('T')[0]
}

/**
 * Get ISO week number for a date string
 */
function isoWeekNumber(dateStr) {
  const date = new Date(dateStr)
  const jan4 = new Date(date.getFullYear(), 0, 4)
  const startOfWeek = new Date(jan4)
  startOfWeek.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7))
  const diff = date - startOfWeek
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1
}

/**
 * Parse time string "HH:MM" → minutes from midnight
 */
function timeToMin(timeStr) {
  if (!timeStr) return 0
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

/**
 * Get current time in minutes from midnight
 */
function nowInMinutes() {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

/**
 * Resolve current class for a teacher.
 * @param {object} teacher - teacher row from DB (id, school_id)
 * @param {object} [options] - { forceDate: 'YYYY-MM-DD', forceTime: 'HH:MM' } for testing
 * @returns {Promise<{assignment, plan, todayKey, dayContent, scheduleSlot} | null>}
 */
export async function resolveCurrentClass(teacher, options = {}) {
  const dayKey = options.forceDate
    ? DAY_KEYS[new Date(options.forceDate + 'T12:00:00').getDay()]
    : currentDayKey()

  const today = options.forceDate || todayISO()
  const nowMin = options.forceTime ? timeToMin(options.forceTime) : nowInMinutes()
  const weekNumber = isoWeekNumber(today)

  // 1. Load teacher assignments for this school
  const { data: assignments, error: aErr } = await supabase
    .from('teacher_assignments')
    .select('id, grade, section, subject, schedule')
    .eq('teacher_id', teacher.id)

  if (aErr || !assignments?.length) return null

  // 2. Load schedule slots to know class times
  const { data: slots } = await supabase
    .from('schedule_slots')
    .select('id, name, start_time, end_time')
    .eq('school_id', teacher.school_id)

  // 3. Find matching assignment for current day/time
  let matched = null
  let matchedSlot = null

  for (const assignment of assignments) {
    const schedule = assignment.schedule || {}
    const dayPeriods = schedule[dayKey] || []

    if (!dayPeriods.length) continue

    for (const periodName of dayPeriods) {
      const slot = slots?.find(s => s.name === periodName)
      if (!slot) continue

      const startMin = timeToMin(slot.start_time)
      const endMin = timeToMin(slot.end_time)

      // Match if currently in this period (with 30-min buffer before/after)
      if (nowMin >= startMin - 30 && nowMin <= endMin + 30) {
        matched = assignment
        matchedSlot = slot
        break
      }
    }
    if (matched) break
  }

  if (!matched) return null

  // 4. Find lesson plan for this grade+section+subject this week
  const combinedGrade = `${matched.grade} ${matched.section}`

  const { data: plans } = await supabase
    .from('lesson_plans')
    .select('id, grade, subject, week_number, date_range, content, status, week_count')
    .eq('teacher_id', teacher.id)
    .eq('grade', combinedGrade)
    .eq('subject', matched.subject)
    .order('created_at', { ascending: false })
    .limit(10)

  // Find plan whose week_number matches current week (or contains it for 2-week plans)
  const plan = plans?.find(p => {
    if (p.week_number === weekNumber) return true
    if (p.week_count === 2 && p.week_number === weekNumber - 1) return true
    return false
  }) || plans?.[0] || null

  // 5. Get today's content from the plan
  const dayContent = plan?.content?.days?.[today] || null

  return {
    assignment: matched,
    scheduleSlot: matchedSlot,
    plan,
    todayKey: today,
    dayContent,
    combinedGrade,
  }
}

/**
 * Load all assignments for a teacher (for manual class picker)
 */
export async function loadTeacherAssignments(teacher) {
  const { data, error } = await supabase
    .from('teacher_assignments')
    .select('id, grade, section, subject, schedule')
    .eq('teacher_id', teacher.id)
    .order('grade')

  if (error) return []
  return data || []
}
