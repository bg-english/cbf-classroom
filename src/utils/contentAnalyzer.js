/**
 * contentAnalyzer — Analiza HTML de guías y recomienda un layout de renderizado.
 *
 * Reglas (en orden de prioridad):
 *  slide       — Un solo párrafo corto (<200 chars). Texto grande, centrado.
 *  key-points  — Lista dominante (2-6 items). Cada item como card.
 *  compact-list— Lista larga (7+ items). Lista compacta mejorada.
 *  feature     — Heading + contenido, sin lista. Título prominente.
 *  reading     — Texto largo (400+ chars), sin listas ni headings.
 *  sectioned   — Múltiples headings o heading + lista mezclados.
 *  default     — Cualquier otro caso. Card estándar.
 */
export function analyzeContent(html) {
  if (!html || html.replace(/<[^>]*>/g, '').trim() === '') {
    return { layout: 'empty' }
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const body = doc.body

  const paragraphs = [...body.querySelectorAll('p')].filter(p => p.textContent.trim())
  const lists      = [...body.querySelectorAll('ul, ol')]
  const listItems  = [...body.querySelectorAll('li')]
  const headings   = [...body.querySelectorAll('h1, h2, h3, h4')]
  const allText    = body.textContent.replace(/\s+/g, ' ').trim()
  const charCount  = allText.length

  // ── Slide: un solo párrafo corto ──────────────────────────────────────────
  if (
    paragraphs.length === 1 &&
    lists.length === 0 &&
    headings.length === 0 &&
    charCount < 200
  ) {
    return {
      layout: 'slide',
      text: paragraphs[0].innerHTML,
    }
  }

  // ── Key-points: lista de 2-6 items ────────────────────────────────────────
  if (
    lists.length > 0 &&
    listItems.length >= 2 &&
    listItems.length <= 6 &&
    headings.length <= 1 &&
    paragraphs.length <= 2
  ) {
    return {
      layout: 'key-points',
      heading:  headings[0]?.textContent.trim() || null,
      intro:    paragraphs.find(p => !p.closest('li'))?.innerHTML || null,
      items:    listItems.map(li => li.innerHTML),
    }
  }

  // ── Compact-list: lista larga (7+ items) ──────────────────────────────────
  if (
    lists.length > 0 &&
    listItems.length >= 7 &&
    headings.length <= 1
  ) {
    return {
      layout: 'compact-list',
      heading: headings[0]?.textContent.trim() || null,
    }
  }

  // ── Feature: heading + contenido, sin lista ───────────────────────────────
  if (headings.length >= 1 && lists.length === 0) {
    return { layout: 'feature' }
  }

  // ── Reading: texto largo sin estructura ───────────────────────────────────
  if (charCount > 400 && lists.length === 0 && headings.length === 0) {
    return { layout: 'reading' }
  }

  // ── Sectioned: múltiples headings o heading + lista ───────────────────────
  if (headings.length > 1 || (headings.length >= 1 && lists.length >= 1)) {
    return { layout: 'sectioned' }
  }

  return { layout: 'default' }
}
