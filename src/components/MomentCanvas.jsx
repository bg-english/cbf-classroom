import AperturaDevocional from './AperturaDevocional'
import SmartBlock from './SmartBlock'

/**
 * MomentCanvas — renders the appropriate content for each of the 6 moments.
 *
 * Momento 1 (Apertura): AperturaDevocional — versículos + tablero digital
 * Momentos 2–6: HTML content + smartBlocks + media from lesson_plan sections
 */
export default function MomentCanvas({
  moment, sectionContent, plan, dayContent, classroomData,
  todayKey, combinedGrade, subject,
  onNext, onPrev, isFirst, isLast
}) {
  const principio = plan?.content?.objetivo?.principio || null
  const biblicalPrinciple = classroomData?.biblicalPrinciple || principio

  return (
    <main className="cc-canvas" style={{ '--moment-color': moment.color }}>

      {/* Moment header */}
      <div className="cc-canvas-header">
        <div className="cc-canvas-moment-badge" style={{ background: moment.color }}>
          Momento {moment.id}
        </div>
        <h2 className="cc-canvas-moment-title">{moment.label}</h2>
        {sectionContent?.time && (
          <span className="cc-canvas-time">⏱ {sectionContent.time}</span>
        )}
      </div>

      {/* Biblical principle banner — visible in moments 2-6 */}
      {moment.id >= 2 && biblicalPrinciple && (
        <BiblicalBanner
          principio={biblicalPrinciple}
          verseRef={classroomData?.indicatorVerseRef}
        />
      )}

      {/* Content area */}
      <div className="cc-canvas-content">
        {moment.id === 1 ? (
          <AperturaDevocional
            classroomData={classroomData}
            plan={plan}
            dayContent={dayContent}
            todayKey={todayKey}
            combinedGrade={combinedGrade}
            subject={subject}
          />
        ) : (
          <SectionContent
            moment={moment}
            sectionContent={sectionContent}
            plan={plan}
            dayContent={dayContent}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="cc-canvas-nav">
        <button
          className="cc-nav-btn cc-nav-prev"
          onClick={onPrev}
          disabled={isFirst}
        >
          ← Anterior
        </button>

        <div className="cc-canvas-plan-info">
          {plan ? (
            <span className="cc-plan-label">
              {plan.date_range || `Semana ${plan.week_number}`}
            </span>
          ) : (
            <span className="cc-plan-label cc-plan-none">Sin guía esta semana</span>
          )}
        </div>

        <button
          className="cc-nav-btn cc-nav-next"
          onClick={onNext}
          disabled={isLast}
          style={{ background: moment.color }}
        >
          {isLast ? '✓ Finalizar clase' : 'Siguiente →'}
        </button>
      </div>
    </main>
  )
}

/**
 * BiblicalBanner — subtle reminder of the biblical principle for moments 2-6
 */
function BiblicalBanner({ principio, verseRef }) {
  return (
    <div className="cc-bible-banner">
      <span className="cc-bible-banner-icon">✝</span>
      <span className="cc-bible-banner-text">{principio}</span>
      {verseRef && <span className="cc-bible-banner-ref">{verseRef}</span>}
    </div>
  )
}

/**
 * SectionContent — renders HTML content + smartBlocks + media for moments 2–6
 */
function SectionContent({ moment, sectionContent, plan, dayContent }) {
  const hasContent = sectionContent?.content && sectionContent.content !== '<p></p>'
  const hasSmartBlocks = sectionContent?.smartBlocks?.length > 0
  const hasVideos = sectionContent?.videos?.length > 0
  const hasAudios = sectionContent?.audios?.length > 0
  const hasImages = sectionContent?.images?.length > 0
  const imageLayout = sectionContent?.image_layout || null

  if (hasContent || hasSmartBlocks || hasVideos || hasAudios) {
    return (
      <div className="sc-container">

        {/* Content + images with layout */}
        {hasContent && imageLayout && hasImages ? (
          <div className={`sc-layout sc-layout-${imageLayout}`}>
            <div
              className="cc-rich-content"
              dangerouslySetInnerHTML={{ __html: sectionContent.content }}
            />
            <div className="sc-layout-images">
              {sectionContent.images.map((img, i) => (
                <ImageWithLink key={i} img={img} />
              ))}
            </div>
          </div>
        ) : (
          <>
            {hasContent && (
              <div
                className="cc-rich-content"
                dangerouslySetInnerHTML={{ __html: sectionContent.content }}
              />
            )}

            {/* Images (no layout specified) */}
            {hasImages && !imageLayout && (
              <div className={`sc-images sc-images-${sectionContent.images.length}`}>
                {sectionContent.images.map((img, i) => (
                  <ImageWithLink key={i} img={img} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Videos */}
        {hasVideos && (
          <div className="sc-media-section">
            {sectionContent.videos.map((vid, i) => (
              <MediaVideo key={i} video={vid} />
            ))}
          </div>
        )}

        {/* Audios */}
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

        {/* SmartBlocks */}
        {hasSmartBlocks && (
          <div className="sc-smartblocks">
            {sectionContent.smartBlocks.map((block, i) => (
              <SmartBlock key={block.id || i} block={block} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="cc-canvas-empty">
      <div className="cc-canvas-empty-icon" style={{ color: moment.color }}>
        {MOMENT_ICONS[moment.id] || '📋'}
      </div>
      <p>No hay contenido para <strong>{moment.label}</strong>.</p>
      {!plan && (
        <p className="cc-canvas-empty-hint">
          Crea una guía en CBF Planner para que aparezca aquí.
        </p>
      )}
      {plan && !dayContent && (
        <p className="cc-canvas-empty-hint">
          La guía <em>{plan.date_range}</em> no tiene contenido para hoy.
        </p>
      )}
      {plan && dayContent && (
        <p className="cc-canvas-empty-hint">
          Esta sección está vacía en la guía. Edítala en CBF Planner.
        </p>
      )}
    </div>
  )
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

const MOMENT_ICONS = {
  1: '✝',
  2: '🗒',
  3: '⚡',
  4: '🎯',
  5: '📝',
  6: '🚪',
}
