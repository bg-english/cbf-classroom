import { isEnglishSubject } from './locale'

/**
 * buildAIContext — assembles the lesson context sent with every AI request.
 * Draws from the same data already available in ClassroomFrame.
 */
export function buildAIContext({ assignment, plan, dayContent, classroomData, moment, combinedGrade, todayKey }) {
  const subject = assignment?.subject || ''
  const language = isEnglishSubject(subject) ? 'English' : 'Spanish'

  const objetivo = plan?.content?.objetivo || {}
  const indicadores = objetivo.indicadores || []
  const objectiveText = Array.isArray(indicadores) && indicadores.length > 0
    ? (typeof indicadores[0] === 'string' ? indicadores[0] : indicadores[0]?.habilidad || indicadores[0]?.texto_en || '')
    : (objetivo.general || '')

  const topic = dayContent?.unit || subject

  const biblicalPrinciple = classroomData?.biblicalPrinciple
    || plan?.content?.objetivo?.principio
    || null

  // Extract section content for the current moment
  const sectionContent = dayContent?.sections?.[moment?.section] || null
  const hasPlannedContent = sectionContent?.content && sectionContent.content !== '<p></p>'
  const hasBlocks = sectionContent?.blocks?.length > 0
  const hasSmartBlocks = sectionContent?.smartBlocks?.length > 0

  // Plain text of the section — strip HTML tags, collapse whitespace, cap at 500 chars
  const sectionText = (sectionContent?.content || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500)

  return {
    grade: assignment?.grade || '',
    section: assignment?.section || '',
    subject,
    language,
    topic,
    objective: objectiveText,
    biblicalPrinciple,
    momentId: moment?.id,
    momentLabel: moment?.label,
    sectionText,
    weekNumber: plan?.week_number,
    date: todayKey,
    hasPlannedContent,
    hasBlocks,
    hasSmartBlocks,
  }
}
