/**
 * periodUtils.js — Academic period dates and progress helpers.
 *
 * Boston Flex 2026 institutional calendar.
 * Update start/end each year when the calendar is published.
 */

const _year = new Date().getFullYear()

export const ACADEMIC_PERIODS = [
  { value: '1', label: `1.er Período ${_year}`, short: 'P1', start: `${_year}-02-04`, end: `${_year}-04-30` },
  { value: '2', label: `2.° Período ${_year}`,  short: 'P2', start: `${_year}-05-01`, end: `${_year}-08-21` },
  { value: '3', label: `3.er Período ${_year}`, short: 'P3', start: `${_year}-08-24`, end: `${_year}-11-13` },
]

/** Returns the active period for today, or null if between periods. */
export function getCurrentPeriod(today = new Date()) {
  return ACADEMIC_PERIODS.find(p => {
    if (!p.start || !p.end) return false
    const start = new Date(p.start + 'T00:00:00')
    const end   = new Date(p.end   + 'T23:59:59')
    return today >= start && today <= end
  }) || null
}

/** Returns progress stats: pct, remainingWeeks, remainingDays, isActive. */
export function getPeriodProgress(period, today = new Date()) {
  if (!period?.start || !period?.end) return null
  const start    = new Date(period.start + 'T00:00:00')
  const end      = new Date(period.end   + 'T23:59:59')
  const MS_DAY   = 1000 * 60 * 60 * 24
  const totalMs  = end - start
  const elapsedMs = Math.max(0, Math.min(today - start, totalMs))
  const remainMs  = Math.max(0, end - today)

  const totalDays     = Math.round(totalMs   / MS_DAY)
  const elapsedDays   = Math.round(elapsedMs / MS_DAY)
  const remainingDays = Math.round(remainMs  / MS_DAY)
  const remainingWeeks = Math.ceil(remainingDays * 5 / 7 / 5)
  const pct            = Math.min(100, Math.round((elapsedDays / totalDays) * 100))

  return { totalDays, elapsedDays, remainingDays, remainingWeeks, pct, isActive: today >= start && today <= end, isComplete: today > end }
}
