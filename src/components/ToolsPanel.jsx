import { useState, useRef } from 'react'

/**
 * ToolsPanel — embedded browser + quick-access links.
 *
 * Allows the teacher to browse YouTube, presentations, websites, etc.
 * without leaving the classroom interface. Sites that block iframes
 * (Gmail, some Google apps) open in a new window instead.
 */

const QUICK_LINKS = [
  { label: 'YouTube',        url: 'https://www.youtube.com',           icon: '▶',  color: '#d4605c' },
  { label: 'Google Drive',   url: 'https://drive.google.com',          icon: '📁', color: '#5a91e6' },
  { label: 'Google Slides',  url: 'https://slides.google.com',         icon: '📊', color: '#d4924a' },
  { label: 'Virtual Campus', url: 'https://bostonschoolsvirtualcampus.com/', icon: '🏫', color: '#3ea8b8' },
  { label: 'Cambridge',      url: 'https://www.cambridge.org',         icon: '📘', color: '#5da84a' },
  { label: 'Canva',          url: 'https://www.canva.com',             icon: '🎨', color: '#8768b8' },
]

// Sites known to block iframes — open in new window
const IFRAME_BLOCKED = [
  'mail.google.com',
  'accounts.google.com',
  'outlook.live.com',
  'outlook.office.com',
]

function isIframeBlocked(url) {
  try {
    const hostname = new URL(url).hostname
    return IFRAME_BLOCKED.some(h => hostname.includes(h))
  } catch {
    return false
  }
}

export default function ToolsPanel({ onClose }) {
  const [url, setUrl] = useState('')
  const [activeUrl, setActiveUrl] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const iframeRef = useRef(null)

  function navigate(targetUrl) {
    let finalUrl = targetUrl
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl
    }

    if (isIframeBlocked(finalUrl)) {
      window.open(finalUrl, '_blank', 'noopener')
      return
    }

    setActiveUrl(finalUrl)
    setUrl(finalUrl)
    setInputValue(finalUrl)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!inputValue.trim()) return
    navigate(inputValue.trim())
  }

  function handleQuickLink(link) {
    navigate(link.url)
  }

  function openInNewWindow() {
    if (activeUrl) {
      window.open(activeUrl, '_blank', 'noopener')
    }
  }

  return (
    <div className="tp-panel">
      {/* URL bar */}
      <div className="tp-toolbar">
        <button className="tp-back-btn" onClick={onClose} title="Volver a clase">
          ← Clase
        </button>

        <form className="tp-url-form" onSubmit={handleSubmit}>
          <input
            className="tp-url-input"
            type="text"
            placeholder="Escribe una URL o busca..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
          />
          <button className="tp-go-btn" type="submit">Ir</button>
        </form>

        {activeUrl && (
          <button className="tp-external-btn" onClick={openInNewWindow} title="Abrir en ventana nueva">
            ↗
          </button>
        )}
      </div>

      {/* Content area */}
      {activeUrl ? (
        <div className="tp-iframe-wrap">
          <iframe
            ref={iframeRef}
            src={activeUrl}
            className="tp-iframe"
            title="Navegador"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
          />
        </div>
      ) : (
        <div className="tp-home">
          <h2 className="tp-home-title">Herramientas</h2>
          <p className="tp-home-subtitle">Accede a recursos sin salir del aula</p>

          <div className="tp-quick-grid">
            {QUICK_LINKS.map(link => (
              <button
                key={link.label}
                className="tp-quick-btn"
                onClick={() => handleQuickLink(link)}
                style={{ '--link-color': link.color }}
              >
                <span className="tp-quick-icon">{link.icon}</span>
                <span className="tp-quick-label">{link.label}</span>
              </button>
            ))}
          </div>

          <div className="tp-home-hint">
            <p>También puedes escribir cualquier URL en la barra superior.</p>
            <p className="tp-home-note">Algunos sitios (Gmail, Outlook) se abrirán en una ventana nueva.</p>
          </div>
        </div>
      )}
    </div>
  )
}
