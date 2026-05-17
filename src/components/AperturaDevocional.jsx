import VerseScene from './VerseScene'

/**
 * AperturaDevocional — Momento 1 (Topics)
 *
 * Renders one full-screen "scene" at a time (no scroll).
 * The teacher taps Next/Prev in the nav bar to advance through scenes.
 * Scenes are built from available verse data in the plan + classroomData.
 *
 * Scene order:
 *   1. Year Verse   → comic strip
 *   2. Month Verse  → comic strip
 *   3. Guide Verse  → comic strip  (if exists)
 *   4. Indicator Verse → discussion questions
 *   5. Vocabulary   → existing section content
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

  // 3 — Guide verse (from plan)
  const guideVerse = plan?.content?.verse
  if (guideVerse?.text) {
    scenes.push({
      type:      'comic',
      verseType: 'verse_guide_comic',
      badge:     t?.verseGuide || 'Versículo Guía',
      verseText: guideVerse.text,
      verseRef:  guideVerse.ref || '',
    })
  }

  // 4a — Indicator verse → comic (verse + lesson topic blended)
  const indicatorText = classroomData?.biblicalPrinciple
    || plan?.content?.objetivo?.principio
    || null
  if (indicatorText) {
    scenes.push({
      type:      'comic',
      verseType: 'indicator_comic',
      badge:     t?.principleIndicator || 'Principio Bíblico del Indicador',
      verseText: indicatorText,
      verseRef:  classroomData?.indicatorVerseRef || '',
      blendTopic: true,  // signals: mix verse + lesson topic in images
    })
  }

  // 4b — Indicator verse → discussion questions
  if (indicatorText) {
    scenes.push({
      type:      'questions',
      verseType: 'indicator_questions',
      badge:     t?.principleIndicator || 'Principio Bíblico del Indicador',
      verseText: indicatorText,
      verseRef:  classroomData?.indicatorVerseRef || '',
    })
  }

  // 5 — Vocabulary (existing lesson content for Moment 1)
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
