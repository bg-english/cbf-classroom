import VerseScene from './VerseScene'

/**
 * AperturaDevocional — Momento 1 (Topics)
 *
 * Renders one full-screen "scene" at a time (no scroll).
 * The teacher taps Next/Prev in the nav bar to advance through scenes.
 *
 * Scene order (exactly 3 biblical scenes + optional vocabulary):
 *   1. Principio del Año   → comic strip
 *   2. Principio del Mes   → comic strip
 *   3. Versículo del Indicador → comic strip (verse + lesson topic blended)
 *   4. Vocabulary          → existing section content (if any)
 */
export default function AperturaDevocional({
  classroomData, plan, dayContent,
  combinedGrade, subject,
  planId, classDate,
  currentScene,   // { type, verseType, badge, verseText, verseRef, vocabHtml }
  accentColor,
  t,
}) {
  if (!currentScene) return null

  const topic = dayContent?.unit || subject || ''
  const grade = combinedGrade || ''

  return (
    <VerseScene
      key={currentScene.verseType}
      type={currentScene.type}
      badge={currentScene.badge}
      verseText={currentScene.verseText}
      verseRef={currentScene.verseRef}
      verseType={currentScene.verseType}
      vocabHtml={currentScene.vocabHtml}
      topic={topic}
      grade={grade}
      subject={subject}
      planId={planId}
      classDate={classDate}
      accentColor={accentColor}
      blendTopic={currentScene.blendTopic || false}
      t={t}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// buildM1Scenes — compute the ordered list of scenes for Moment 1.
// Call this in ClassroomFrame so navigation knows the total count.
// ─────────────────────────────────────────────────────────────────────────────

export function buildM1Scenes({ classroomData, plan, dayContent, t }) {
  const scenes = []

  function stripHtml(html) {
    return (html || '').replace(/<[^>]*>/g, '').trim()
  }

  // 1 — Year verse
  if (classroomData?.yearVerse) {
    scenes.push({
      type:      'comic',
      verseType: 'verse_year_comic',
      badge:     t?.verseYear || 'Versículo del Año',
      verseText: stripHtml(classroomData.yearVerse),
      verseRef:  classroomData.yearVerseRef || '',
    })
  }

  // 2 — Month verse
  if (classroomData?.monthVerse) {
    scenes.push({
      type:      'comic',
      verseType: 'verse_month_comic',
      badge:     t?.verseMonth || 'Versículo del Mes',
      verseText: stripHtml(classroomData.monthVerse),
      verseRef:  classroomData.monthVerseRef || '',
    })
  }

  // 3 — Indicator verse (Versículo del Indicador — verse + lesson topic blended)
  const indicatorText = classroomData?.biblicalPrinciple
    || plan?.content?.objetivo?.principio
    || null
  if (indicatorText) {
    scenes.push({
      type:      'comic',
      verseType: 'indicator_comic',
      badge:     t?.principleIndicator || 'Versículo del Indicador',
      verseText: indicatorText,
      verseRef:  classroomData?.indicatorVerseRef || '',
      blendTopic: true,
    })
  }

  // 4 — Vocabulary (existing lesson content for Moment 1)
  const vocabHtml = dayContent?.sections?.subject?.content
  if (vocabHtml && vocabHtml !== '<p></p>') {
    scenes.push({
      type:      'vocabulary',
      verseType: 'vocabulary',
      badge:     t?.vocabList || 'Vocabulary',
      verseText: null,
      verseRef:  null,
      vocabHtml,
    })
  }

  return scenes
}
