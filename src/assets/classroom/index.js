/**
 * Classroom Asset Library — SVG, PNG, GIF catalog
 * Each asset: { id, category, label, tags[], src, type }
 *
 * Adding new assets:
 *  1. Drop the file into the correct category folder
 *  2. Import it here
 *  3. Add an entry to ASSETS array with relevant tags
 */

// ── Subjects ──────────────────────────────────────────────
import mathSvg     from './subjects/math.svg'
import englishSvg  from './subjects/english.svg'
import scienceSvg  from './subjects/science.svg'

// ── Classroom actions ──────────────────────────────────────
import speakSvg  from './actions/speak.svg'
import thinkSvg  from './actions/think.svg'
import writeSvg  from './actions/write.svg'

// ── Biblical ──────────────────────────────────────────────
import doveSvg      from './biblical/dove.svg'
import openBibleSvg from './biblical/open-bible.svg'

// ── Catalog ───────────────────────────────────────────────
export const ASSETS = [
  // Subjects
  { id: 'math',    category: 'subjects', label: 'Matemáticas',  tags: ['math','numbers','algebra','calculus','geometry'],   src: mathSvg,    type: 'svg' },
  { id: 'english', category: 'subjects', label: 'English',      tags: ['english','reading','writing','language','grammar'],  src: englishSvg, type: 'svg' },
  { id: 'science', category: 'subjects', label: 'Ciencias',     tags: ['science','biology','chemistry','physics','lab'],     src: scienceSvg, type: 'svg' },

  // Actions
  { id: 'speak', category: 'actions', label: 'Hablar / Speak', tags: ['speak','oral','voice','microphone','pronunciation'], src: speakSvg, type: 'svg' },
  { id: 'think', category: 'actions', label: 'Pensar / Think', tags: ['think','question','idea','reflect','brainstorm'],    src: thinkSvg, type: 'svg' },
  { id: 'write', category: 'actions', label: 'Escribir / Write', tags: ['write','pen','notebook','text','writing'],         src: writeSvg, type: 'svg' },

  // Biblical
  { id: 'dove',       category: 'biblical', label: 'Paloma / Holy Spirit', tags: ['dove','spirit','peace','holy','faith'], src: doveSvg,      type: 'svg' },
  { id: 'open-bible', category: 'biblical', label: 'Biblia abierta',       tags: ['bible','book','cross','word','faith'],  src: openBibleSvg, type: 'svg' },
]

export const CATEGORIES = [
  { id: 'all',      label: 'Todos' },
  { id: 'subjects', label: 'Materias' },
  { id: 'actions',  label: 'Actividades' },
  { id: 'biblical', label: 'Bíblico' },
  { id: 'decorative', label: 'Decorativo' },
]

/**
 * Search assets by query string (matches label + tags) and optional category.
 */
export function searchAssets(query = '', category = 'all') {
  const q = query.toLowerCase().trim()
  return ASSETS.filter(a => {
    const matchCat = category === 'all' || a.category === category
    const matchQ   = !q || a.label.toLowerCase().includes(q) || a.tags.some(t => t.includes(q))
    return matchCat && matchQ
  })
}

/**
 * Get a single asset by id.
 */
export function getAsset(id) {
  return ASSETS.find(a => a.id === id) || null
}
