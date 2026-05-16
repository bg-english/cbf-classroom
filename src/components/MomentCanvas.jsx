import AperturaDevocional from './AperturaDevocional'
import SmartBlock from './SmartBlock'
import BlockRenderer from './blocks/BlockRenderer'
import { analyzeContent } from '../utils/contentAnalyzer'

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
  const biblicalPrinciple = classroomData?.biblicalPrinciple
    || plan?.content?.objetivo?.principio
    || null

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
        {moment.abc && (
          <div className="cc-abc-hint" style={{ '--abc-color': moment.color }}>
            {moment.abc}
          </div>
        )}
      </div>

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
          />
        ) : (
          <>
            {moment.id === 3 && <WBTBanner />}
            <SectionContent
              moment={moment}
              sectionContent={sectionContent}
              plan={plan}
              dayContent={dayContent}
            />
            {moment.id === 4 && biblicalPrinciple && (
              <BiblicalMidCard principle={biblicalPrinciple} classroomData={classroomData} />
            )}
            {moment.id === 5 && biblicalPrinciple && (
              <BiblicalCloseCard principle={biblicalPrinciple} classroomData={classroomData} />
            )}
          </>
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
 * SectionContent — renders HTML content + smartBlocks + media for moments 2–6.
 * Uses contentAnalyzer to auto-detect the best layout for the HTML content.
 */
function SectionContent({ moment, sectionContent, plan, dayContent }) {
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
        <p>No hay contenido para <strong>{moment.label}</strong>.</p>
        {!plan && (
          <p className="cc-canvas-empty-hint">Crea una guía en CBF Planner para que aparezca aquí.</p>
        )}
        {plan && !dayContent && (
          <p className="cc-canvas-empty-hint">La guía <em>{plan.date_range}</em> no tiene contenido para hoy.</p>
        )}
        {plan && dayContent && (
          <p className="cc-canvas-empty-hint">Esta sección está vacía en la guía. Edítala en CBF Planner.</p>
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
              Actividad Interactiva
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

/**
 * ContentLayout — selecciona el componente de layout según el análisis.
 */
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

/**
 * M2TemaDia — Momento 2 (Tema del Día)
 * El tablero ES el contenido principal de este momento (ABC paso 2).
 * "Escribe en el tablero... no borrar durante la clase."
 */
function M2TemaDia({ moment, plan, dayContent, todayKey, combinedGrade, subject, classroomData, sectionContent }) {
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
          <span>Tablero de Clase</span>
          <span className="m2-board-note">No borrar durante la clase</span>
        </div>
        <div className="m2-board-grid">
          <div className="m2-field">
            <span className="m2-label">Fecha</span>
            <span className="m2-value">{dateLabel}</span>
          </div>
          <div className="m2-field">
            <span className="m2-label">Grado · Materia</span>
            <span className="m2-value">{combinedGrade} · {subject}</span>
          </div>
          <div className="m2-field m2-full">
            <span className="m2-label">Tema del Día</span>
            <span className="m2-value m2-value-large">{dayUnit || 'Sin tema asignado'}</span>
          </div>
          <div className="m2-field m2-full">
            <span className="m2-label">Objetivo / Indicador</span>
            <span className="m2-value m2-value-indicator">{objectiveText || 'Sin objetivo asignado'}</span>
          </div>
          {principio && (
            <div className="m2-field m2-full m2-field-principle">
              <span className="m2-label">✝ Principio Bíblico</span>
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
        />
      )}
    </div>
  )
}

/**
 * WBTBanner — Momento 3 (Motivación)
 * ABC paso 4: "Menciona las reglas de la clase (Whole Brain Teaching)"
 * ABC paso 5: "Pre-conocimiento - Conexión temática"
 */
function WBTBanner() {
  return (
    <div className="wbt-banner">
      <div className="wbt-section">
        <span className="wbt-icon">🧠</span>
        <div className="wbt-text">
          <span className="wbt-title">Whole Brain Teaching — Reglas de Clase</span>
          <div className="wbt-rules">
            <span>1 · Sigue instrucciones rápido</span>
            <span>2 · Levanta la mano para hablar</span>
            <span>3 · Levanta la mano para pararte</span>
            <span>4 · Toma decisiones inteligentes</span>
            <span>5 · Sé amable con tus compañeros</span>
          </div>
        </div>
      </div>
      <div className="wbt-precon">
        <span className="wbt-precon-icon">🔄</span>
        <span><strong>Pre-conocimiento:</strong> ¿Qué aprendimos en la clase anterior?</span>
      </div>
    </div>
  )
}

/**
 * BiblicalMidCard — Momento 4 (Desarrollo)
 * ABC: "Explica el principio bíblico del mes por 5 minutos
 *       y habla nuevamente de él antes de finalizar tu clase"
 */
function BiblicalMidCard({ principle, classroomData }) {
  return (
    <div className="bib-card bib-card-mid">
      <div className="bib-card-badge">
        <span>✝</span> Principio Bíblico del Mes — 5 min
      </div>
      <blockquote className="bib-card-text">{principle}</blockquote>
      {classroomData?.indicatorVerseRef && (
        <cite className="bib-card-ref">{classroomData.indicatorVerseRef}</cite>
      )}
      {classroomData?.biblicalReflection && (
        <div className="bib-card-reflection">💬 {classroomData.biblicalReflection}</div>
      )}
    </div>
  )
}

/**
 * BiblicalCloseCard — Momento 5 (Cierre)
 * ABC: "Conecta el aprendizaje del día con el principio bíblico como cierre natural"
 * Cosmovisión: "Presenta el principio bíblico durante el inicio, desarrollo y CIERRE"
 */
function BiblicalCloseCard({ principle, classroomData }) {
  return (
    <div className="bib-card bib-card-close">
      <div className="bib-card-badge">
        <span>✝</span> Cierre Bíblico
      </div>
      <p className="bib-card-prompt">
        Conecta el aprendizaje de hoy con el principio bíblico como cierre natural de la clase.
      </p>
      <blockquote className="bib-card-text">{principle}</blockquote>
      {classroomData?.indicatorVerseRef && (
        <cite className="bib-card-ref">{classroomData.indicatorVerseRef}</cite>
      )}
    </div>
  )
}

const MOMENT_ICONS = {
  1: '✝',   // Encuentro — principio bíblico + vocab
  2: '🗒',  // Tema del Día — tablero
  3: '⚡',  // Motivación — pre-conocimiento + WBT
  4: '🎯',  // Desarrollo — habilidad del día
  5: '🚪',  // Cierre — verificación + reflexión
  6: '📝',  // Tarea — assignment
}
