/**
 * verseThemes.js — Maps Bible verse keywords to visual themes.
 * Used by VerseSpotlight to choose the gradient + emoji.
 */

export const THEMES = {
  love: {
    gradient: 'linear-gradient(145deg, #7f1d1d 0%, #be185d 45%, #f59e0b 100%)',
    emoji: '❤️',
    stars: true,
  },
  light: {
    gradient: 'linear-gradient(145deg, #0c4a6e 0%, #0369a1 45%, #fbbf24 100%)',
    emoji: '☀️',
    stars: false,
  },
  peace: {
    gradient: 'linear-gradient(145deg, #0f4c75 0%, #1b6ca8 50%, #a5f3fc 100%)',
    emoji: '🕊️',
    stars: false,
  },
  hope: {
    gradient: 'linear-gradient(145deg, #312e81 0%, #7c3aed 50%, #f59e0b 100%)',
    emoji: '🌅',
    stars: true,
  },
  strength: {
    gradient: 'linear-gradient(145deg, #1e1b4b 0%, #4c1d95 50%, #be123c 100%)',
    emoji: '⚡',
    stars: true,
  },
  faith: {
    gradient: 'linear-gradient(145deg, #0f172a 0%, #1e3a5f 55%, #0d9488 100%)',
    emoji: '✝️',
    stars: true,
  },
  grace: {
    gradient: 'linear-gradient(145deg, #4a044e 0%, #86198f 50%, #c026d3 100%)',
    emoji: '🙏',
    stars: true,
  },
  truth: {
    gradient: 'linear-gradient(145deg, #1e3a8a 0%, #1d4ed8 55%, #0891b2 100%)',
    emoji: '📖',
    stars: false,
  },
  life: {
    gradient: 'linear-gradient(145deg, #052e16 0%, #15803d 55%, #0369a1 100%)',
    emoji: '🌿',
    stars: false,
  },
  shepherd: {
    gradient: 'linear-gradient(145deg, #451a03 0%, #92400e 50%, #ca8a04 100%)',
    emoji: '🐑',
    stars: false,
  },
  protection: {
    gradient: 'linear-gradient(145deg, #0f172a 0%, #1e3a5f 50%, #334155 100%)',
    emoji: '🛡️',
    stars: true,
  },
  wisdom: {
    gradient: 'linear-gradient(145deg, #1c1917 0%, #44403c 50%, #a16207 100%)',
    emoji: '💎',
    stars: true,
  },
  default: {
    gradient: 'linear-gradient(145deg, #0f172a 0%, #1e3a5f 50%, #312e81 100%)',
    emoji: '✦',
    stars: true,
  },
}

const KEYWORDS = {
  love:       ['love', 'amor', 'amó', 'amar', 'loved', 'charity', 'caridad', 'beloved', 'amado', 'ama'],
  light:      ['light', 'luz', 'shine', 'brillar', 'lamp', 'lámpara', 'sun', 'sol', 'dawn', 'amanecer', 'brillante'],
  peace:      ['peace', 'paz', 'rest', 'descanso', 'calm', 'tranquil', 'quietness', 'quietud', 'still', 'repose'],
  hope:       ['hope', 'esperanza', 'wait', 'esperar', 'future', 'futuro', 'expectation', 'await'],
  strength:   ['strong', 'strength', 'fuerte', 'fuerza', 'power', 'poder', 'mighty', 'poderoso', 'warrior'],
  faith:      ['faith', 'fe', 'believe', 'creer', 'trust', 'confiar', 'believing', 'creyendo'],
  grace:      ['grace', 'gracia', 'mercy', 'misericordia', 'forgive', 'perdón', 'compassion', 'compasión', 'favor'],
  truth:      ['truth', 'verdad', 'word', 'palabra', 'scripture', 'holy', 'santo', 'testigo'],
  life:       ['life', 'vida', 'live', 'vivir', 'born', 'nacer', 'bread', 'pan', 'eternal', 'eterno', 'resurrección'],
  shepherd:   ['shepherd', 'pastor', 'sheep', 'oveja', 'flock', 'rebaño', 'pasture', 'prado'],
  protection: ['protect', 'proteger', 'refuge', 'refugio', 'shield', 'escudo', 'fortress', 'fortaleza', 'deliver', 'librar'],
  wisdom:     ['wisdom', 'sabiduría', 'wise', 'sabio', 'understanding', 'entendimiento', 'knowledge', 'conocimiento'],
}

/**
 * Returns the visual theme for a given verse text + reference.
 */
export function getVerseTheme(text = '', ref = '') {
  const haystack = (text + ' ' + ref).toLowerCase()
  for (const [theme, kws] of Object.entries(KEYWORDS)) {
    if (kws.some(kw => haystack.includes(kw))) return THEMES[theme]
  }
  return THEMES.default
}
