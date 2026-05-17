import AperturaDevocional from './AperturaDevocional'
import SmartBlock from './SmartBlock'
import BlockRenderer from './blocks/BlockRenderer'
import VisualRenderer from './VisualRenderer'
import { analyzeContent } from '../utils/contentAnalyzer'

/** MomentCanvas — renders content for each of the 6 moments. */
export default function MomentCanvas({
  moment, sectionContent, plan, dayContent, classroomData,
  todayKey, combinedGrade, subject,
  onNext, onPrev, isFirst, isLast, m3SubStep,
  moments, activeMoment, onSetMoment,
  aiOverlay, onDismissAI, videoOverlay, onDismissVideo,
  transitionKey, transitionDir,
  onVerseSpotlight,
  t
}) {
  const biblicalPrinciple = classroomData?.biblicalPrinciple
    || plan?.content?.objetivo?.principio
    || null

  return (
    <main className="cc-canvas" style={{ '--moment-color': moment.color }}>

      {/* Minimal accent bar — moment color only */}
      <div className="cc-canvas-accent" style={{ background: moment.color }} />

      {/* Content area — keyed for transition animation */}
      <div
        key={transitionKey}
        className={`cc-canvas-content cc-anim-${transitionDir || 'next'}`}
      >
        {moment.id === 1 ? (
          <AperturaDevocional
            classroomData={classroomData}
            plan={plan}
            dayContent={dayContent}
            todayKey={todayKey}
            combinedGrade={combinedGrade}
            subject={subject}
            t={t}
            onVerseSpotlight={onVerseSpotlight}
          />
        ) : moment.id === 2 ? (
          <M2TemaDia
            moment={moment}
            plan={plan}
            dayContent={dayContent}
            todayKey={todayKey}
            combinedGrade={combinedGrade}
            subject={subject}
            classroomData={classroomData}
            sectionContent={sectionContent}
            t={t}
            onVerseSpotlight={onVerseSpotlight}
          />
        ) : moment.id === 3 && m3SubStep === 0 ? (
          <WBTRules t={t} />
        ) : (
          <>
            <SectionContent
              moment={moment}
              sectionContent={sectionContent}
              plan={plan}
              dayContent={dayContent}
              t={t}
            />
            {moment.id === 4 && biblicalPrinciple && (
              <BiblicalMidCard
                principle={biblicalPrinciple}
                classroomData={classroomData}
                t={t}
                onTap={() => onVerseSpotlight?.({ text: biblicalPrinciple, ref: classroomData?.indicatorVerseRef, label: t.bibPrincipleMonth })}
              />
            )}
            {moment.id === 6 && biblicalPrinciple && (
              <BiblicalCloseCard
                principle={biblicalPrinciple}
                classroomData={classroomData}
                t={t}
                onTap={() => onVerseSpotlight?.({ text: biblicalPrinciple, ref: classroomData?.indicatorVerseRef, label: t.bibClosingReflection })}
              />
            )}
          </>
        )}

        {/* YouTube video overlay */}
        {videoOverlay && (
          <div className="yt-overlay">
            <div className="yt-overlay-header">
              <span className="yt-overlay-badge" style={{ background: moment.color }}>
                ▶ YouTube
              </span>
              <button className="yt-overlay-dismiss" onClick={onDismissVideo}>✕</button>
            </div>
            <div className="yt-embed-wrap">
              <iframe
                className="yt-embed"
                src={`https://www.youtube.com/embed/${videoOverlay}?autoplay=1&rel=0&modestbranding=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="YouTube video"
              />
            </div>
          </div>
        )}

        {/* AI-generated overlay content */}
        {aiOverlay && !videoOverlay && (
          <div className="ai-overlay">
            <div className="ai-overlay-header">
              <span className="ai-overlay-badge" style={{ background: moment.color }}>
                ✦ {t.aiGenerated || 'AI Generated'}
              </span>
              <button className="ai-overlay-dismiss" onClick={onDismissAI}>✕</button>
            </div>
            {aiOverlay.visual && (
              <VisualRenderer visual={aiOverlay.visual} accent={moment.color} />
            )}
            {aiOverlay.blocks?.length > 0 && (
              <BlockRenderer blocks={aiOverlay.blocks} accent={moment.color} />
            )}
            {aiOverlay.smartBlock && (
              <SmartBlock block={aiOverlay.smartBlock} />
            )}
          </div>
        )}
      </div>

      {/* Navigation — prev | dots + grade | next */}
      <div className="cc-canvas-nav">
        <button
          className="cc-nav-btn cc-nav-prev"
          onClick={onPrev}
          disabled={isFirst}
        >
          {t.prev}
        </button>

        <div className="cc-nav-center">
          {moments && (
            <nav className="cc-moment-dots">
              {moments.map((m, i) => (
                <button
                  key={m.id}
                  className={`cc-dot${activeMoment === i ? ' active' : ''}${i < activeMoment ? ' done' : ''}`}
                  style={{ '--dot-color': m.color }}
                  onClick={() => onSetMoment?.(i)}
                  title={m.label}
                >
                  {m.id}
                </button>
              ))}
            </nav>
          )}
          {combinedGrade && (
            <span className="cc-bottom-grade">{combinedGrade}</span>
          )}
        </div>

        <button
          className="cc-nav-btn cc-nav-next"
          onClick={onNext}
          disabled={isLast}
          style={{ background: moment.color }}
        >
          {isLast ? t.endClass : t.next}
        </button>
      </div>
    </main>
  )
}

/** SectionContent — renders HTML + smartBlocks + media. */
function SectionContent({ moment, sectionContent, plan, dayContent, t }) {
  const hasBlocks      = sectionContent?.blocks?.length > 0
  const hasContent     = sectionContent?.content && sectionContent.content !== '<p></p>'
  const hasSmartBlocks = sectionContent?.smartBlocks?.length > 0
  const hasVideos      = sectionContent?.videos?.length > 0
  const hasAudios      = sectionContent?.audios?.length > 0
  const hasImages      = sectionContent?.images?.length > 0
  const imageLayout    = sectionContent?.image_layout || null

  if (!hasBlocks && !hasContent && !hasSmartBlocks && !hasVideos && !hasAudios) {
    return (
      <div className="cc-canvas-empty">
        <div className="cc-canvas-empty-icon" style={{ color: moment.color }}>
          {MOMENT_ICONS[moment.id] || '📋'}
        </div>
        <p>{t.noContent} <strong>{moment.label}</strong>.</p>
        {!plan && (
          <p className="cc-canvas-empty-hint">{t.createGuideHint}</p>
        )}
        {plan && !dayContent && (
          <p className="cc-canvas-empty-hint">{t.noContentToday.replace('{range}', plan.date_range || '')}</p>
        )}
        {plan && dayContent && (
          <p className="cc-canvas-empty-hint">{t.emptySectionHint}</p>
        )}
      </div>
    )
  }

  const analysis = hasContent ? analyzeContent(sectionContent.content) : { layout: 'empty' }

  return (
    <div className="sc-container">

      {/* ── Bloques estructurados (GXE Sprint 4) ── */}
      {hasBlocks && (
        <BlockRenderer
          blocks={sectionContent.blocks}
          accent={moment.color}
        />
      )}

      {/* ── Contenido HTML legacy — solo si no hay bloques ── */}
      {!hasBlocks && hasContent && (
        <ContentLayout
          analysis={analysis}
          html={sectionContent.content}
          moment={moment}
          images={hasImages ? sectionContent.images : []}
          imageLayout={imageLayout}
        />
      )}

      {/* ── Imágenes sin layout (cuando no hay imageLayout configurado) ── */}
      {hasImages && !imageLayout && analysis.layout !== 'key-points' && (
        <div className={`sc-images sc-images-${Math.min(sectionContent.images.length, 4)}`}>
          {sectionContent.images.map((img, i) => (
            <ImageWithLink key={i} img={img} />
          ))}
        </div>
      )}

      {/* ── Videos ── */}
      {hasVideos && (
        <div className="sc-media-section">
          {sectionContent.videos.map((vid, i) => (
            <MediaVideo key={i} video={vid} />
          ))}
        </div>
      )}

      {/* ── Audios ── */}
      {hasAudios && (
        <div className="sc-media-section">
          {sectionContent.audios.map((aud, i) => (
            <div key={i} className="sc-audio-item">
              {aud.name && <span className="sc-audio-label">{aud.name}</span>}
              <audio controls src={aud.url} className="sc-audio-player" />
            </div>
          ))}
        </div>
      )}

      {/* ── SmartBlocks ── */}
      {hasSmartBlocks && (
        <div className="sc-smartblocks">
          <div className="sc-smartblocks-header">
            <span className="sc-smartblocks-badge" style={{ background: moment.color }}>
              {t.interactiveActivity}
            </span>
          </div>
          {sectionContent.smartBlocks.map((block, i) => (
            <SmartBlock key={block.id || i} block={block} />
          ))}
        </div>
      )}
    </div>
  )
}

/** ContentLayout — picks layout based on content analysis. */
function ContentLayout({ analysis, html, moment, images, imageLayout }) {
  const accent = moment.color

  // Si hay imageLayout explícito, respetarlo sobre el análisis
  if (imageLayout && images.length > 0) {
    return (
      <div className="sc-content-card" style={{ '--card-accent': accent }}>
        <div className={`sc-layout sc-layout-${imageLayout}`}>
          <div className="cc-rich-content" dangerouslySetInnerHTML={{ __html: html }} />
          <div className="sc-layout-images">
            {images.map((img, i) => <ImageWithLink key={i} img={img} />)}
          </div>
        </div>
      </div>
    )
  }

  switch (analysis.layout) {

    // ── Slide: párrafo corto centrado ────────────────────────────────────────
    case 'slide':
      return (
        <div className="cl-slide" style={{ '--slide-accent': accent }}>
          <div
            className="cl-slide-text"
            dangerouslySetInnerHTML={{ __html: analysis.text }}
          />
          <div className="cl-slide-accent-bar" style={{ background: accent }} />
        </div>
      )

    // ── Key-points: items como cards visuales ────────────────────────────────
    case 'key-points':
      return (
        <div className="cl-keypoints" style={{ '--kp-accent': accent }}>
          {analysis.heading && (
            <div className="cl-keypoints-heading" style={{ borderLeftColor: accent }}>
              {analysis.heading}
            </div>
          )}
          {analysis.intro && (
            <div
              className="cl-keypoints-intro"
              dangerouslySetInnerHTML={{ __html: analysis.intro }}
            />
          )}
          <div className={`cl-keypoints-grid cl-kp-${Math.min(analysis.items.length, 4)}`}>
            {analysis.items.map((item, i) => (
              <div key={i} className="cl-kp-card" style={{ '--kp-accent': accent }}>
                <span className="cl-kp-num" style={{ color: accent }}>{i + 1}</span>
                <span className="cl-kp-text" dangerouslySetInnerHTML={{ __html: item }} />
              </div>
            ))}
          </div>
        </div>
      )

    // ── Compact-list: lista larga ────────────────────────────────────────────
    case 'compact-list':
      return (
        <div className="sc-content-card" style={{ '--card-accent': accent }}>
          {analysis.heading && (
            <div className="cl-feature-heading" style={{ color: accent }}>
              {analysis.heading}
            </div>
          )}
          <div className="cc-rich-content" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      )

    // ── Feature: heading prominente + contenido ──────────────────────────────
    case 'feature':
      return (
        <div className="cl-feature" style={{ '--feature-accent': accent }}>
          <div className="cc-rich-content cl-feature-content" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      )

    // ── Reading: texto largo con tipografía enhanced ─────────────────────────
    case 'reading':
      return (
        <div className="cl-reading" style={{ '--reading-accent': accent }}>
          <div className="cc-rich-content cl-reading-content" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      )

    // ── Sectioned: múltiples headings ────────────────────────────────────────
    case 'sectioned':
      return (
        <div className="cl-sectioned" style={{ '--section-accent': accent }}>
          <div className="cc-rich-content cl-sectioned-content" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      )

    // ── Default: card estándar ────────────────────────────────────────────────
    default:
      return (
        <div className="sc-content-card" style={{ '--card-accent': accent }}>
          <div className="cc-rich-content" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      )
  }
}

/**
 * ImageWithLink — renders image, optionally wrapped in a link
 */
function ImageWithLink({ img }) {
  const imgEl = <img src={img.url} alt={img.caption || img.name || ''} className="sc-image" />

  if (img.link) {
    return (
      <a href={img.link} target="_blank" rel="noopener noreferrer" className="sc-image-link">
        {imgEl}
      </a>
    )
  }
  return imgEl
}

/**
 * MediaVideo — renders video player or YouTube/Vimeo embed
 */
function MediaVideo({ video }) {
  const url = video.url || ''
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)

  if (ytMatch) {
    return (
      <div className="sc-video-embed">
        <iframe
          src={`https://www.youtube.com/embed/${ytMatch[1]}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={video.name || 'Video'}
        />
      </div>
    )
  }

  if (vimeoMatch) {
    return (
      <div className="sc-video-embed">
        <iframe
          src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={video.name || 'Video'}
        />
      </div>
    )
  }

  return (
    <div className="sc-video-item">
      {video.name && <span className="sc-video-label">{video.name}</span>}
      <video controls src={url} className="sc-video-player" />
    </div>
  )
}

/** M2TemaDia — Momento 2: board ritual (date · topic · objective · principle). */
function M2TemaDia({ moment, plan, dayContent, todayKey, combinedGrade, subject, classroomData, sectionContent, t, onVerseSpotlight }) {
  const dateLabel = todayKey
    ? new Date(todayKey + 'T12:00:00').toLocaleDateString('es-CO', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      })
    : ''
  const dayUnit = dayContent?.unit || subject || ''
  const objetivo = plan?.content?.objetivo || {}
  const indicadores = objetivo.indicadores || []
  const objectiveText = Array.isArray(indicadores) && indicadores.length > 0
    ? (typeof indicadores[0] === 'string' ? indicadores[0] : indicadores[0]?.habilidad || indicadores[0]?.texto_en || '')
    : (objetivo.general || '')
  const principio = classroomData?.biblicalPrinciple || objetivo.principio || null

  return (
    <div className="m2-container">
      <div className="m2-board">
        <div className="m2-board-header">
          <span className="m2-board-icon">🖊</span>
          <span>{t.classBoard}</span>
          <span className="m2-board-note">{t.doNotErase}</span>
        </div>
        <div className="m2-board-grid">
          <div className="m2-field">
            <span className="m2-label">{t.date}</span>
            <span className="m2-value">{dateLabel}</span>
          </div>
          <div className="m2-field">
            <span className="m2-label">{t.gradeSubject}</span>
            <span className="m2-value">{combinedGrade} · {subject}</span>
          </div>
          <div className="m2-field m2-full">
            <span className="m2-label">{t.topicOfDay}</span>
            <span className="m2-value m2-value-large">{dayUnit || t.noTopicAssigned}</span>
          </div>
          <div className="m2-field m2-full">
            <span className="m2-label">{t.objective}</span>
            <span className="m2-value m2-value-indicator">{objectiveText || t.noObjectiveAssigned}</span>
          </div>
          {principio && (
            <div
              className="m2-field m2-full m2-field-principle m2-principle-tappable"
              onClick={() => onVerseSpotlight?.({ text: principio, label: t.biblicalPrinciple })}
              role="button" tabIndex={0}
            >
              <span className="m2-label">{t.biblicalPrinciple} <span className="m2-tap-hint">↗</span></span>
              <span className="m2-value">{principio}</span>
            </div>
          )}
        </div>
      </div>

      {/* Plan content for M2 — complementary, shown below tablero */}
      {sectionContent?.content && sectionContent.content !== '<p></p>' && (
        <SectionContent
          moment={moment}
          sectionContent={sectionContent}
          plan={plan}
          dayContent={dayContent}
          t={t}
        />
      )}
    </div>
  )
}

/**
 * WBTRules — full-page class rules display (M3 sub-step 0).
 * Teacher clicks Next to proceed to the motivation content.
 */
function WBTRules({ t }) {
  return (
    <div className="wbt-fullpage">
      <div className="wbt-rules-card">
        <h2 className="wbt-rules-heading">{t.wbtTitle}</h2>
        <ol className="wbt-rules-list">
          {t.wbtRules.map((rule, i) => (
            <li key={i} className="wbt-rule-item">{rule}</li>
          ))}
        </ol>
      </div>
    </div>
  )
}

/** BiblicalMidCard — verse connection (Momento 4). */
function BiblicalMidCard({ principle, classroomData, t, onTap }) {
  return (
    <div className="bib-card bib-card-mid bib-card-tappable" onClick={onTap} role="button" tabIndex={0}>
      <div className="bib-card-badge">
        <span>✝</span> {t.bibPrincipleMonth}
      </div>
      <blockquote className="bib-card-text">{principle}</blockquote>
      {classroomData?.indicatorVerseRef && (
        <cite className="bib-card-ref">{classroomData.indicatorVerseRef}</cite>
      )}
      {classroomData?.biblicalReflection && (
        <div className="bib-card-reflection">💬 {classroomData.biblicalReflection}</div>
      )}
      <div className="bib-card-tap-hint">↗ Toca para ampliar</div>
    </div>
  )
}

/** BiblicalCloseCard — verse reflection (Momento 6). */
function BiblicalCloseCard({ principle, classroomData, t, onTap }) {
  return (
    <div className="bib-card bib-card-close bib-card-tappable" onClick={onTap} role="button" tabIndex={0}>
      <div className="bib-card-badge">
        <span>✝</span> {t.bibClosingReflection}
      </div>
      <p className="bib-card-prompt">
        {t.bibClosingPrompt}
      </p>
      <blockquote className="bib-card-text">{principle}</blockquote>
      {classroomData?.indicatorVerseRef && (
        <cite className="bib-card-ref">{classroomData.indicatorVerseRef}</cite>
      )}
      <div className="bib-card-tap-hint">↗ Toca para ampliar</div>
    </div>
  )
}

const MOMENT_ICONS = { 1: '✝', 2: '🗒', 3: '⚡', 4: '🎯', 5: '📝', 6: '🚪' }
