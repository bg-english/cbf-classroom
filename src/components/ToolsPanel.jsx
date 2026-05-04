import { useState, useRef } from 'react'

/**
 * ToolsPanel — embedded browser + quick-access links.
 *
 * Strategy for iframe restrictions:
 *  - YouTube URLs → convert to embed format (works in iframe)
 *  - Google Slides/Docs/Sheets → convert to embed format
 *  - Sites that allow iframes → load directly
 *  - Everything else → open in popup window (most sites block iframes)
 *
 * The teacher can always force "open in new window" with the ↗ button.
 */

const QUICK_LINKS = [
  { label: 'YouTube',        url: 'https://www.youtube.com',                  icon: '▶',  color: '#d4605c', mode: 'popup' },
  { label: 'Google Drive',   url: 'https://drive.google.com',                 icon: '📁', color: '#5a91e6', mode: 'popup' },
  { label: 'Google Slides',  url: 'https://slides.google.com',                icon: '📊', color: '#d4924a', mode: 'popup' },
  { label: 'Virtual Campus', url: 'https://bostonschoolsvirtualcampus.com/',   icon: '🏫', color: '#3ea8b8', mode: 'popup' },
  { label: 'Cambridge',      url: 'https://www.cambridge.org',                icon: '📘', color: '#5da84a', mode: 'popup' },
  { label: 'Canva',          url: 'https://www.canva.com',                    icon: '🎨', color: '#8768b8', mode: 'popup' },
]

/**
 * Try to convert a URL to an embeddable format.
 * Returns { embedUrl, canEmbed } — if canEmbed is false, open in popup.
 */
function resolveEmbed(url) {
  try {
    const u = new URL(url)

    // YouTube watch → embed
    const ytWatch = u.hostname.match(/(?:www\.)?youtube\.com/) && u.searchParams.get('v')
    if (ytWatch) {
      return { embedUrl: `https://www.youtube.com/embed/${ytWatch}?autoplay=1`, canEmbed: true }
    }

    // YouTube short URL
    const ytShort = u.hostname === 'youtu.be' && u.pathname.slice(1)
    if (ytShort) {
      return { embedUrl: `https://www.youtube.com/embed/${ytShort}?autoplay=1`, canEmbed: true }
    }

    // YouTube embed (already embed format)
    if (u.hostname.match(/(?:www\.)?youtube\.com/) && u.pathname.startsWith('/embed/')) {
      return { embedUrl: url, canEmbed: true }
    }

    // Google Slides → embed
    if (u.hostname === 'docs.google.com' && u.pathname.includes('/presentation/')) {
      const embedUrl = url.replace(/\/edit.*$/, '/embed?start=false&loop=false&delayms=3000')
      return { embedUrl, canEmbed: true }
    }

    // Google Docs → embed
    if (u.hostname === 'docs.google.com' && u.pathname.includes('/document/')) {
      const embedUrl = url.replace(/\/edit.*$/, '/preview')
      return { embedUrl, canEmbed: true }
    }

    // Google Sheets → embed
    if (u.hostname === 'docs.google.com' && u.pathname.includes('/spreadsheets/')) {
      const embedUrl = url.replace(/\/edit.*$/, '/preview')
      return { embedUrl, canEmbed: true }
    }

    // Google Forms → embed (already works)
    if (u.hostname === 'docs.google.com' && u.pathname.includes('/forms/')) {
      return { embedUrl: url, canEmbed: true }
    }

    // Canva presentations/designs (published links work)
    if (u.hostname.includes('canva.com') && u.pathname.includes('/design/')) {
      return { embedUrl: url + '?embed', canEmbed: true }
    }

    // Vimeo → embed
    const vimeoMatch = u.hostname === 'vimeo.com' && u.pathname.match(/^\/(\d+)/)
    if (vimeoMatch) {
      return { embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`, canEmbed: true }
    }

    // Everything else → popup (most sites block iframes)
    return { embedUrl: url, canEmbed: false }
  } catch {
    return { embedUrl: url, canEmbed: false }
  }
}

export default function ToolsPanel({ onClose }) {
  const [activeUrl, setActiveUrl] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [iframeError, setIframeError] = useState(false)
  const iframeRef = useRef(null)

  function navigate(targetUrl) {
    let finalUrl = targetUrl
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl
    }

    const { embedUrl, canEmbed } = resolveEmbed(finalUrl)

    if (canEmbed) {
      setActiveUrl(embedUrl)
      setInputValue(finalUrl)
      setIframeError(false)
    } else {
      // Open in popup window — stays accessible, teacher can alt-tab back
      openPopup(finalUrl)
    }
  }

  function openPopup(url) {
    const w = Math.round(window.screen.width * 0.9)
    const h = Math.round(window.screen.height * 0.85)
    const left = Math.round((window.screen.width - w) / 2)
    const top = Math.round((window.screen.height - h) / 2)
    window.open(url, 'classroom-tools', `width=${w},height=${h},left=${left},top=${top},noopener`)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!inputValue.trim()) return
    navigate(inputValue.trim())
  }

  function handleQuickLink(link) {
    if (link.mode === 'popup') {
      openPopup(link.url)
    } else {
      navigate(link.url)
    }
  }

  function openInNewWindow() {
    if (activeUrl) openPopup(activeUrl)
  }

  function goHome() {
    setActiveUrl(null)
    setInputValue('')
    setIframeError(false)
  }

  return (
    <div className="tp-panel">
      {/* URL bar */}
      <div className="tp-toolbar">
        <button className="tp-back-btn" onClick={onClose} title="Volver a clase">
          ← Clase
        </button>

        {activeUrl && (
          <button className="tp-home-btn" onClick={goHome} title="Inicio herramientas">
            ⌂
          </button>
        )}

        <form className="tp-url-form" onSubmit={handleSubmit}>
          <input
            className="tp-url-input"
            type="text"
            placeholder="Pega un enlace de YouTube, Google Slides, o cualquier URL..."
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
      {activeUrl && !iframeError ? (
        <div className="tp-iframe-wrap">
          <iframe
            ref={iframeRef}
            src={activeUrl}
            className="tp-iframe"
            title="Contenido"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            onError={() => setIframeError(true)}
          />
        </div>
      ) : activeUrl && iframeError ? (
        <div className="tp-error">
          <p>Este sitio no permite ser embebido.</p>
          <button className="tp-error-btn" onClick={openInNewWindow}>
            Abrir en ventana nueva ↗
          </button>
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
            <p>Pega un enlace de YouTube o Google Slides para verlo aquí dentro.</p>
            <p className="tp-home-note">Los demás sitios se abren en una ventana aparte para garantizar compatibilidad.</p>
          </div>
        </div>
      )}
    </div>
  )
}
