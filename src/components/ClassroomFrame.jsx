import { useState, useEffect, useCallback, useMemo } from 'react'
import PersistentHeader from './PersistentHeader'
import LeftSidebar from './LeftSidebar'
import MomentCanvas from './MomentCanvas'
import ToolsPanel from './ToolsPanel'
import Whiteboard from './Whiteboard'
import AIPanel from './AIPanel'
import AssetBrowser from './AssetBrowser'
import GamesPanel from './GamesPanel'
import VerseSpotlight from './VerseSpotlight'
import { buildM1Scenes } from './AperturaDevocional'
import { playNext, playPrev, playVerse } from '../utils/sounds'
import { getLocale, isEnglishSubject } from '../utils/locale'

/* CBF Didactic Session — 6 moments */
const MOMENTS = [
  { id: 1, key: 'subject',    label: 'Topics',              color: '#dc2626', section: 'subject' },
  { id: 2, key: 'motivation', label: 'Subject to be Worked', color: '#0891b2', section: 'motivation' },
  { id: 3, key: 'activity',   label: 'Motivation',          color: '#16a34a', section: 'activity' },
  { id: 4, key: 'skill',      label: 'Skill Development',   color: '#7c3aed', section: 'skill' },
  { id: 5, key: 'assignment', label: 'Assignment',          color: '#2563eb', section: 'assignment' },
  { id: 6, key: 'closing',    label: 'Closing',             color: '#d97706', section: 'closing' },
]

export default function ClassroomFrame({ teacher, resolved, classroomData, onChangeClass, onSignOut }) {
  const FONT_STEPS = [1, 1.18, 1.38, 1.6]
  const [fontStep, setFontStep] = useState(0)

  const [activeMoment, setActiveMoment] = useState(0)
  const [m1SceneIndex, setM1SceneIndex] = useState(0) // which verse scene is active in Moment 1
  const [m3SubStep, setM3SubStep] = useState(0) // 0 = WBT rules, 1 = section content
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [whiteboardOpen, setWhiteboardOpen] = useState(false)
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [assetBrowserOpen, setAssetBrowserOpen] = useState(false)
  const [gamesPanelOpen, setGamesPanelOpen] = useState(false)
  const [aiOverlay, setAiOverlay] = useState(null)
  const [assetOverlay, setAssetOverlay] = useState(null)
  const [videoOverlay, setVideoOverlay] = useState(null)
  const [verseSpotlight, setVerseSpotlight] = useState(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [transitionDir, setTransitionDir] = useState('next')
  const [transitionKey, setTransitionKey] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const { assignment, plan, todayKey, dayContent, combinedGrade } = resolved
  const t = getLocale(assignment?.subject)

  // Determine day class status (backward compat: active===false → no_class)
  const classStatus = dayContent?.class_status
    || (dayContent?.active === false ? 'no_class' : 'normal')
  const isSpecialDay = classStatus !== 'normal'

  const moment = MOMENTS[activeMoment]
  const sectionContent = dayContent?.sections?.[moment.section] || null

  // Build scene list for Moment 1 (verse scenes)
  const m1Scenes = useMemo(
    () => buildM1Scenes({ classroomData, plan, dayContent, t }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [classroomData?.yearVerse, classroomData?.monthVerse, classroomData?.biblicalPrinciple,
     plan?.content?.verse?.text, dayContent?.sections?.subject?.content]
  )
  const m1Scene = m1Scenes[m1SceneIndex] || null

  // Reset sub-steps when changing moments
  useEffect(() => { setM3SubStep(0) }, [activeMoment])
  useEffect(() => { setM1SceneIndex(0) }, [activeMoment])

  // ── Fullscreen API ──
  const requestFullscreen = useCallback(() => {
    const el = document.documentElement
    const rfs = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen
    if (rfs) rfs.call(el).catch(() => {})
  }, [])

  const exitFullscreen = useCallback(() => {
    const efs = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen
    if (efs && document.fullscreenElement) efs.call(document).catch(() => {})
  }, [])

  function toggleFullscreen() {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      exitFullscreen()
    } else {
      requestFullscreen()
    }
  }

  useEffect(() => {
    requestFullscreen()

    function onFsChange() {
      setIsFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement))
    }
    document.addEventListener('fullscreenchange', onFsChange)
    document.addEventListener('webkitfullscreenchange', onFsChange)
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange)
      document.removeEventListener('webkitfullscreenchange', onFsChange)
    }
  }, [requestFullscreen])

  // Navigation with M1 scenes + M3 sub-step support + transitions + sounds
  function goNext() {
    setTransitionDir('next')
    setTransitionKey(k => k + 1)
    if (soundEnabled) playNext(activeMoment)
    if (activeMoment === 0 && m1SceneIndex < m1Scenes.length - 1) {
      setM1SceneIndex(i => i + 1)
    } else if (activeMoment === 2 && m3SubStep === 0) {
      setM3SubStep(1)
    } else {
      setActiveMoment(m => Math.min(m + 1, MOMENTS.length - 1))
    }
  }
  function goPrev() {
    setTransitionDir('prev')
    setTransitionKey(k => k + 1)
    if (soundEnabled) playPrev()
    if (activeMoment === 0 && m1SceneIndex > 0) {
      setM1SceneIndex(i => i - 1)
    } else if (activeMoment === 2 && m3SubStep === 1) {
      setM3SubStep(0)
    } else {
      setActiveMoment(m => Math.max(m - 1, 0))
    }
  }

  function handleVerseSpotlight(verse) {
    setVerseSpotlight(verse)
    if (soundEnabled) playVerse()
  }

  function handleKey(e) {
    if (toolsOpen || aiPanelOpen || gamesPanelOpen) return
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext() }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev() }
    if (e.key >= '1' && e.key <= '6') setActiveMoment(Number(e.key) - 1)
    if (e.key === 'Escape') { setToolsOpen(false); setAiPanelOpen(false); setGamesPanelOpen(false); setAiOverlay(null); setVideoOverlay(null); setVerseSpotlight(null) }
    if (e.key === 'm' || e.key === 'M') setSoundEnabled(s => !s)
    if (e.key === 'a' || e.key === 'A') { e.preventDefault(); setAiPanelOpen(o => !o) }
    if (e.key === 'F11') { e.preventDefault(); toggleFullscreen() }
  }

  return (
    <div className="cc-frame" tabIndex={0} onKeyDown={handleKey} style={{ outline: 'none', '--font-scale': FONT_STEPS[fontStep] }}>

      {/* ── ROW 1+2: Persistent Header (full width) ── */}
      <PersistentHeader
        todayKey={todayKey}
        dayContent={dayContent}
        plan={plan}
        classroomData={classroomData}
        subject={assignment?.subject}
        combinedGrade={combinedGrade}
        moment={moment}
        onVerseSpotlight={handleVerseSpotlight}
        t={t}
      />

      {/* ── ROW 3: Sidebar + Content ── */}
      <LeftSidebar
        moment={moment}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(o => !o)}
        onOpenTools={() => { setToolsOpen(true); setSidebarOpen(false) }}
        onOpenWhiteboard={() => { setWhiteboardOpen(true); setSidebarOpen(false) }}
        onOpenAI={() => { setAiPanelOpen(o => !o); setGamesPanelOpen(false); setAssetBrowserOpen(false); setSidebarOpen(false) }}
        onOpenAssets={() => { setAssetBrowserOpen(o => !o); setAiPanelOpen(false); setGamesPanelOpen(false); setSidebarOpen(false) }}
        onOpenGames={() => { setGamesPanelOpen(o => !o); setAiPanelOpen(false); setAssetBrowserOpen(false); setSidebarOpen(false) }}
        assetBrowserOpen={assetBrowserOpen}
        toolsOpen={toolsOpen}
        aiPanelOpen={aiPanelOpen}
        gamesPanelOpen={gamesPanelOpen}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(s => !s)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onChangeClass={onChangeClass}
        onSignOut={onSignOut}
        fontStep={fontStep}
        fontStepMax={FONT_STEPS.length - 1}
        onFontIncrease={() => setFontStep(s => Math.min(s + 1, FONT_STEPS.length - 1))}
        onFontDecrease={() => setFontStep(s => Math.max(s - 1, 0))}
        t={t}
      />

      <div className="cc-content-area">
        {toolsOpen ? (
          <ToolsPanel onClose={() => setToolsOpen(false)} />
        ) : isSpecialDay ? (
          <SpecialDayCanvas
            classStatus={classStatus}
            statusReason={dayContent?.status_reason}
            todayKey={todayKey}
            plan={plan}
            assignment={assignment}
            combinedGrade={combinedGrade}
          />
        ) : (
          <MomentCanvas
            moment={moment}
            sectionContent={sectionContent}
            plan={plan}
            dayContent={dayContent}
            classroomData={classroomData}
            todayKey={todayKey}
            combinedGrade={combinedGrade}
            subject={assignment?.subject}
            planId={plan?.id ? String(plan.id) : null}
            classDate={todayKey}
            m1Scene={m1Scene}
            m1SceneIndex={m1SceneIndex}
            m1SceneCount={m1Scenes.length}
            onNext={goNext}
            onPrev={goPrev}
            isFirst={activeMoment === 0 && m1SceneIndex === 0}
            isLast={activeMoment === MOMENTS.length - 1}
            m3SubStep={m3SubStep}
            moments={MOMENTS}
            activeMoment={activeMoment}
            onSetMoment={(i) => { setToolsOpen(false); setActiveMoment(i) }}
            aiOverlay={aiOverlay}
            onDismissAI={() => setAiOverlay(null)}
            assetOverlay={assetOverlay}
            onDismissAsset={() => setAssetOverlay(null)}
            videoOverlay={videoOverlay}
            onDismissVideo={() => setVideoOverlay(null)}
            transitionKey={transitionKey}
            transitionDir={transitionDir}
            onVerseSpotlight={handleVerseSpotlight}
            t={t}
          />
        )}
      </div>

      {aiPanelOpen && (
        <AIPanel
          assignment={assignment}
          plan={plan}
          dayContent={dayContent}
          classroomData={classroomData}
          moment={moment}
          combinedGrade={combinedGrade}
          todayKey={todayKey}
          onProject={(result) => { setAiOverlay(result); setVideoOverlay(null); setAiPanelOpen(false) }}
          onProjectVideo={(videoId) => { setVideoOverlay(videoId); setAiOverlay(null); setAiPanelOpen(false) }}
          onClose={() => setAiPanelOpen(false)}
          t={t}
        />
      )}

      {assetBrowserOpen && (
        <AssetBrowser
          assignment={assignment}
          plan={plan}
          dayContent={dayContent}
          classroomData={classroomData}
          moment={moment}
          combinedGrade={combinedGrade}
          todayKey={todayKey}
          onProject={(asset) => { setAssetOverlay(asset); setAssetBrowserOpen(false) }}
          onClose={() => setAssetBrowserOpen(false)}
        />
      )}

      {gamesPanelOpen && (
        <GamesPanel
          moment={moment}
          classroomData={classroomData}
          isEn={isEnglishSubject(assignment?.subject)}
          onClose={() => setGamesPanelOpen(false)}
        />
      )}

      {verseSpotlight && (
        <VerseSpotlight verse={verseSpotlight} onClose={() => setVerseSpotlight(null)} />
      )}

      {whiteboardOpen && <Whiteboard onClose={() => setWhiteboardOpen(false)} />}
    </div>
  )
}

// ── SpecialDayCanvas — shown when class_status !== 'normal' ───────────────────

const SPECIAL_DAY_CONFIG = {
  no_class: {
    icon: '🚫',
    title: 'No hubo clase',
    color: '#dc2626',
    bg: '#fef2f2',
    defaultReason: 'Día sin clase',
  },
  async: {
    icon: '🏠',
    title: 'Clase asincrónica',
    color: '#2563eb',
    bg: '#eff6ff',
    defaultReason: 'Los estudiantes trabajan desde casa',
  },
  interrupted: {
    icon: '⚑',
    title: 'Clase interrumpida',
    color: '#d97706',
    bg: '#fffbeb',
    defaultReason: 'Actividad institucional',
  },
}

function SpecialDayCanvas({ classStatus, statusReason, todayKey, plan, assignment, combinedGrade }) {
  const cfg = SPECIAL_DAY_CONFIG[classStatus] || SPECIAL_DAY_CONFIG.no_class

  const dateLabel = todayKey
    ? new Date(todayKey + 'T12:00:00').toLocaleDateString('es-CO', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : ''

  const subjectLabel = assignment?.subject || ''
  const gradeLabel   = combinedGrade || ''

  return (
    <main className="cc-canvas cc-special-day" style={{ '--moment-color': cfg.color }}>
      <div className="cc-special-day-inner" style={{ background: cfg.bg }}>

        {/* Icon */}
        <div className="cc-special-icon">{cfg.icon}</div>

        {/* Title */}
        <h2 className="cc-special-title" style={{ color: cfg.color }}>{cfg.title}</h2>

        {/* Date */}
        {dateLabel && (
          <p className="cc-special-date" style={{ color: cfg.color }}>
            {dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)}
          </p>
        )}

        {/* Reason */}
        <div className="cc-special-reason">
          {statusReason || cfg.defaultReason}
        </div>

        {/* Context */}
        {(subjectLabel || gradeLabel) && (
          <div className="cc-special-context">
            {gradeLabel && <span>{gradeLabel}</span>}
            {subjectLabel && <span>{subjectLabel}</span>}
            {plan?.week_number && <span>Semana {plan.week_number}</span>}
          </div>
        )}

        {/* Async instructions box */}
        {classStatus === 'async' && statusReason && (
          <div className="cc-special-async-box">
            <div className="cc-special-async-label">📋 Instrucciones para casa:</div>
            <div className="cc-special-async-text">{statusReason}</div>
          </div>
        )}
      </div>
    </main>
  )
}
