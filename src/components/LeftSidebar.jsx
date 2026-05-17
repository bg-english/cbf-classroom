import { useState } from 'react'

/**
 * LeftSidebar — collapsible vertical icon bar in the content row.
 * Tap the toggle button to reveal/hide tools (top→bottom animation).
 */
export default function LeftSidebar({
  moment, sidebarOpen, onToggleSidebar,
  onOpenTools, onOpenWhiteboard, onOpenAI, onOpenAssets, onOpenGames,
  toolsOpen, aiPanelOpen, assetBrowserOpen, gamesPanelOpen,
  soundEnabled, onToggleSound,
  isFullscreen, onToggleFullscreen,
  onChangeClass, onSignOut,
  fontStep, fontStepMax, onFontIncrease, onFontDecrease,
  t,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const accent = moment?.color || 'var(--accent)'

  return (
    <aside className="cc-sidebar">
      {/* Moment color strip */}
      <div className="cc-sidebar-strip" style={{ background: accent }} />

      {/* Toggle button — always visible */}
      <button
        className={`cc-sidebar-toggle ${sidebarOpen ? 'cc-sidebar-toggle-open' : ''}`}
        onClick={onToggleSidebar}
        title={sidebarOpen ? 'Ocultar herramientas' : 'Herramientas'}
        style={sidebarOpen ? { color: accent } : {}}
      >
        <span className="cc-sidebar-toggle-icon">
          {sidebarOpen ? '✕' : '⋮'}
        </span>
      </button>

      {/* Collapsible panel — slides down when open */}
      <div className={`cc-sidebar-panel ${sidebarOpen ? 'cc-sidebar-panel-open' : ''}`}>
        <SidebarBtn
          icon={<WhiteboardIcon />}
          label={t.whiteboard}
          active={false}
          onClick={onOpenWhiteboard}
        />
        <SidebarBtn
          icon="🌐"
          label={t.tools}
          active={toolsOpen}
          onClick={onOpenTools}
          activeColor={accent}
        />
        <SidebarBtn
          icon="✦"
          label={t.aiTitle || 'AI'}
          active={aiPanelOpen}
          onClick={onOpenAI}
          activeColor={accent}
          isAI
        />
        <SidebarBtn
          icon="🖼️"
          label="Imágenes"
          active={assetBrowserOpen}
          onClick={onOpenAssets}
          activeColor={accent}
        />
        <SidebarBtn
          icon="🎲"
          label="Dinámica"
          active={gamesPanelOpen}
          onClick={onOpenGames}
          activeColor={accent}
        />

        <div className="cc-sidebar-divider" />

        {/* Font size control */}
        <div className="cc-sidebar-font-ctrl">
          <button
            className="cc-sidebar-font-btn"
            onClick={onFontDecrease}
            disabled={fontStep === 0}
            title="Reducir texto"
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>A</span>
          </button>
          <div className="cc-sidebar-font-dots">
            {Array.from({ length: fontStepMax + 1 }).map((_, i) => (
              <span
                key={i}
                className={`cc-sidebar-font-dot ${i === fontStep ? 'active' : ''}`}
                style={i === fontStep ? { background: accent } : {}}
              />
            ))}
          </div>
          <button
            className="cc-sidebar-font-btn"
            onClick={onFontIncrease}
            disabled={fontStep === fontStepMax}
            title="Aumentar texto"
          >
            <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>A</span>
          </button>
        </div>

        <div className="cc-sidebar-divider" />

        {/* Meta controls */}
        <div className="cc-sidebar-meta-wrap">
          <button
            className="cc-sidebar-meta-btn"
            onClick={() => setMenuOpen(o => !o)}
            title="Más opciones"
          >
            ⋯
          </button>
          {menuOpen && (
            <div className="cc-sidebar-dropdown" onClick={() => setMenuOpen(false)}>
              <button onClick={onToggleSound} title={soundEnabled ? 'Silenciar' : 'Activar sonido'}>
                {soundEnabled ? '🔔' : '🔕'}
              </button>
              <button onClick={onToggleFullscreen} title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}>
                {isFullscreen ? '⊡' : '⊞'}
              </button>
              <button onClick={onChangeClass} title={t.changeClass}>↩</button>
              <button onClick={onSignOut} title={t.signOut}>⏻</button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

function SidebarBtn({ icon, label, active, onClick, activeColor, isAI }) {
  return (
    <button
      className={`cc-sidebar-btn ${active ? 'cc-sidebar-btn-active' : ''} ${isAI ? 'cc-sidebar-ai' : ''}`}
      onClick={onClick}
      title={label}
      style={active && activeColor ? {
        color: activeColor,
        background: `${activeColor}18`,
        borderLeft: `2px solid ${activeColor}`,
      } : {}}
    >
      <span className="cc-sidebar-icon">{icon}</span>
    </button>
  )
}

function WhiteboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
    </svg>
  )
}
