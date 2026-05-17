/**
 * AperturaDevocional — Momento 1
 * Verses are now tappable → VerseSpotlight full-screen modal.
 */
export default function AperturaDevocional({
  classroomData, plan, dayContent, todayKey,
  combinedGrade, subject, t, onVerseSpotlight
}) {
  const objetivo    = plan?.content?.objetivo || {}
  const indicadores = objetivo.indicadores || []
  const principio   = objetivo.principio || null
  const guideVerse  = plan?.content?.verse || null

  const dayUnit = dayContent?.sections?.subject?.content
    ? stripHtml(dayContent.sections.subject.content).slice(0, 120)
    : (dayContent?.unit || subject || '')

  function spotlight(text, ref, label, html) {
    if (!text && !html) return
    onVerseSpotlight?.({ text, ref, label, html })
  }

  return (
    <div className="ap-container">

      {/* ── VERSÍCULOS ── */}
      <div className="ap-verses">

        {classroomData?.yearVerse && (
          <VerseCard
            badge={t.verseYear}
            html={classroomData.yearVerse}
            ref_={classroomData.yearVerseRef}
            onTap={() => spotlight(
              stripHtml(classroomData.yearVerse),
              classroomData.yearVerseRef,
              t.verseYear,
              classroomData.yearVerse
            )}
          />
        )}

        {classroomData?.monthVerse && (
          <VerseCard
            badge={t.verseMonth}
            html={classroomData.monthVerse}
            ref_={classroomData.monthVerseRef}
            onTap={() => spotlight(
              stripHtml(classroomData.monthVerse),
              classroomData.monthVerseRef,
              t.verseMonth,
              classroomData.monthVerse
            )}
          />
        )}

        {guideVerse?.text && (
          <VerseCard
            badge={t.verseGuide}
            text={guideVerse.text}
            ref_={guideVerse.ref}
            onTap={() => spotlight(guideVerse.text, guideVerse.ref, t.verseGuide)}
          />
        )}

        {classroomData?.biblicalPrinciple && (
          <VerseCard
            badge={t.principleIndicator}
            project={classroomData.newsProjectTitle ? `${t.project}: ${classroomData.newsProjectTitle}` : null}
            text={classroomData.biblicalPrinciple}
            ref_={classroomData.indicatorVerseRef}
            reflection={classroomData.biblicalReflection
              ? `💬 ${t.reflection} ${classroomData.biblicalReflection}`
              : null}
            onTap={() => spotlight(
              classroomData.biblicalPrinciple,
              classroomData.indicatorVerseRef,
              t.principleIndicator
            )}
          />
        )}

        {!classroomData?.biblicalPrinciple && principio && (
          <VerseCard
            badge={t.principleIndicator}
            text={principio}
            onTap={() => spotlight(principio, null, t.principleIndicator)}
          />
        )}

        {!classroomData?.yearVerse && !classroomData?.monthVerse && !guideVerse?.text && !classroomData?.biblicalPrinciple && !principio && (
          <div className="ap-empty-verses">
            <div className="ap-empty-icon">✝</div>
            <p>{t.configureVersesHint}</p>
          </div>
        )}
      </div>

      {/* ── VOCABULARY LIST ── */}
      {dayContent?.sections?.subject?.content &&
       dayContent.sections.subject.content !== '<p></p>' && (
        <div className="ap-section-content">
          <div className="ap-section-label">{t.vocabList}</div>
          <div
            className="cc-rich-content"
            dangerouslySetInnerHTML={{ __html: dayContent.sections.subject.content }}
          />
        </div>
      )}
    </div>
  )
}

/** VerseCard — tappable verse block with spotlight hint */
function VerseCard({ badge, text, html, ref_, project, reflection, onTap }) {
  return (
    <div className="ap-verse ap-verse-tappable" onClick={onTap} role="button" tabIndex={0}>
      <div className="ap-verse-badge">{badge}</div>
      {project && <div className="ap-verse-project">{project}</div>}
      {html
        ? <blockquote className="ap-verse-text" dangerouslySetInnerHTML={{ __html: html }} />
        : <blockquote className="ap-verse-text">{text}</blockquote>
      }
      {ref_ && <cite className="ap-verse-ref">{ref_}</cite>}
      {reflection && <div className="ap-verse-reflection">{reflection}</div>}
      <div className="ap-verse-tap-hint">↗ Toca para ampliar</div>
    </div>
  )
}

function stripHtml(html) {
  return html?.replace(/<[^>]*>/g, '') || ''
}
