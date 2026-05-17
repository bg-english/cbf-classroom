/**
 * generate-verse-comic
 *
 * POST body:
 *   type        'comic' | 'questions'
 *   verseText   string   — raw verse text (HTML stripped)
 *   verseRef    string   — e.g. "Matthew 5:8"
 *   verseType   string   — 'verse_year_comic' | 'verse_month_comic' | etc.
 *   topic       string   — current lesson topic
 *   grade       string   — e.g. "9 A"
 *   subject     string
 *   planId      string
 *   classDate   string   — YYYY-MM-DD
 *
 * Returns (type='comic'):
 *   { panels: [{ imageUrl, caption }], theme }
 *
 * Returns (type='questions'):
 *   { questions: [string, string, string] }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY          = Deno.env.get('GEMINI_API_KEY')!
const ANTHROPIC_API_KEY       = Deno.env.get('ANTHROPIC_API_KEY')!
const SUPABASE_URL            = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY       = Deno.env.get('SUPABASE_ANON_KEY')!
const SUPABASE_SERVICE_ROLE   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const GEMINI_IMAGE_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent'
const ANTHROPIC_ENDPOINT = 'https://api.anthropic.com/v1/messages'
const BUCKET = 'class-library'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ── Claude: comic script ──────────────────────────────────────────────────────

async function buildComicScript(
  verseText: string, verseRef: string,
  topic: string, grade: string, subject: string
): Promise<{ theme: string; panels: { scene: string; caption: string }[] }> {

  const res = await fetch(ANTHROPIC_ENDPOINT, {
    method: 'POST',
    headers: {
      'x-api-key':        ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type':     'application/json',
    },
    body: JSON.stringify({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 700,
      messages: [{
        role:    'user',
        content: `Create a 3-panel educational comic strip script for a ${grade} ${subject} class.

Biblical verse: "${verseText}" — ${verseRef}
Lesson topic: "${topic}"

The comic should visually narrate the verse as a brief story (no abstract symbols).
Panel 1 — SETUP: A scene that establishes the world or the character's situation before the truth of the verse.
Panel 2 — TENSION: The character faces a challenge, choice, or temptation relevant to the verse.
Panel 3 — TRUTH: The verse's principle is lived out — the transformed outcome, the blessing, the right choice made.

Rules for scenes: flat illustration style, diverse K-12 students, real-world classroom or community settings, NO text or letters visible in image.
Captions: short English phrase (max 8 words), present tense, narrative voice.

Respond ONLY with valid JSON:
{
  "theme": "one-word English theme from the verse",
  "panels": [
    { "scene": "detailed image generation prompt", "caption": "short caption" },
    { "scene": "...", "caption": "..." },
    { "scene": "...", "caption": "..." }
  ]
}`,
      }],
    }),
  })

  const data = await res.json()
  const text: string = data.content?.[0]?.text || ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Claude returned no JSON for comic script')
  return JSON.parse(match[0])
}

// ── Claude: indicator questions ───────────────────────────────────────────────

async function buildIndicatorQuestions(
  verseText: string, verseRef: string,
  topic: string, grade: string, subject: string
): Promise<string[]> {

  const res = await fetch(ANTHROPIC_ENDPOINT, {
    method: 'POST',
    headers: {
      'x-api-key':        ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type':     'application/json',
    },
    body: JSON.stringify({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{
        role:    'user',
        content: `Generate 3 short discussion questions for a ${grade} ${subject} class that connect a biblical verse to the lesson topic.

Verse: "${verseText}" — ${verseRef}
Lesson topic: "${topic}"

Rules:
- Questions in English (or Spanish if subject is Spanish)
- Each question max 20 words
- Questions should spark thinking, not have a yes/no answer
- Connect the verse's moral/spiritual truth to the academic topic
- Age-appropriate for ${grade}

Respond ONLY with valid JSON array:
["question 1", "question 2", "question 3"]`,
      }],
    }),
  })

  const data = await res.json()
  const text: string = data.content?.[0]?.text || ''
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) throw new Error('Claude returned no JSON for questions')
  return JSON.parse(match[0])
}

// ── Gemini: generate one panel image ─────────────────────────────────────────

async function generatePanelImage(
  scene: string, grade: string
): Promise<{ base64: string; mimeType: string } | null> {

  const prompt =
    `${scene}. ` +
    `Flat vector illustration, vibrant warm colors, educational comic panel style, ` +
    `safe for ${grade} students, diverse characters, NO text or letters anywhere in the image, ` +
    `white background, clean lines, simple readable composition.`

  const res = await fetch(`${GEMINI_IMAGE_ENDPOINT}?key=${GEMINI_API_KEY}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents:         [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['IMAGE'] },
    }),
  })

  if (!res.ok) return null

  const data = await res.json()
  const parts = data?.candidates?.[0]?.content?.parts || []
  const img   = parts.find((p: { inlineData?: { mimeType: string; data: string } }) =>
    p.inlineData?.mimeType?.startsWith('image/')
  )
  return img ? { base64: img.inlineData.data, mimeType: img.inlineData.mimeType } : null
}

// ── Supabase Storage: upload one panel ───────────────────────────────────────

async function uploadPanel(
  supabaseAdmin: ReturnType<typeof createClient>,
  base64: string, mimeType: string,
  planId: string, grade: string, classDate: string, verseType: string, panelIndex: number
): Promise<string | null> {

  const ext  = mimeType.split('/')[1] || 'png'
  const path = `${planId}/${grade.replace(/\s/g, '_')}/${classDate}/${verseType}_${panelIndex}.${ext}`

  // Decode base64 → Uint8Array
  const binaryStr = atob(base64)
  const bytes     = new Uint8Array(binaryStr.length)
  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i)

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: mimeType, upsert: true })

  if (error) {
    console.error('Upload error:', error.message)
    return null
  }

  const { data: { publicUrl } } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path)
  return publicUrl
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders })

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  // Auth
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Missing authorization' }, 401)

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return json({ error: 'Unauthorized' }, 401)

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

  const body = await req.json()
  const {
    type = 'comic',
    verseText, verseRef = '', verseType = 'verse_comic',
    topic = 'the lesson', grade = 'K-12', subject = 'class',
    planId, classDate,
  } = body

  if (!verseText) return json({ error: 'verseText is required' }, 400)
  if (!ANTHROPIC_API_KEY) return json({ error: 'ANTHROPIC_API_KEY not configured' }, 500)

  // ── Questions mode (no images) ────────────────────────────────────────────
  if (type === 'questions') {
    const questions = await buildIndicatorQuestions(verseText, verseRef, topic, grade, subject)
    return json({ questions })
  }

  // ── Comic mode ────────────────────────────────────────────────────────────
  if (!GEMINI_API_KEY) return json({ error: 'GEMINI_API_KEY not configured' }, 500)

  const script = await buildComicScript(verseText, verseRef, topic, grade, subject)
  if (!script.panels?.length) return json({ error: 'Failed to generate comic script' }, 502)

  // Generate all 3 panel images in parallel
  const rawImages = await Promise.all(
    script.panels.map(panel => generatePanelImage(panel.scene, grade))
  )

  // Upload to Storage (sequential to avoid rate limits)
  const panels: { imageUrl: string | null; caption: string }[] = []

  for (let i = 0; i < script.panels.length; i++) {
    const caption = script.panels[i].caption
    const img     = rawImages[i]

    if (!img || !planId || !classDate) {
      // Return base64 data URI as fallback when storage not available
      const dataUrl = img ? `data:${img.mimeType};base64,${img.base64}` : null
      panels.push({ imageUrl: dataUrl, caption })
      continue
    }

    const url = await uploadPanel(supabaseAdmin, img.base64, img.mimeType, planId, grade, classDate, verseType, i)
    panels.push({ imageUrl: url ?? `data:${img.mimeType};base64,${img.base64}`, caption })
  }

  return json({ panels, theme: script.theme })
})
