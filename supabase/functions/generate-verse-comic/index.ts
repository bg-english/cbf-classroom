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
        content: `Create a 3-panel comic strip that DIRECTLY ILLUSTRATES the content of this biblical verse for ${grade} students.

Biblical verse: "${verseText}" — ${verseRef}

Your job is to create a VISUAL STORY that shows what the verse LITERALLY describes or teaches.
The images must clearly connect to the verse so students understand its meaning by looking at the comic.

Panel 1 — Set the scene: illustrate the situation or context the verse describes.
Panel 2 — Show the action or teaching of the verse happening.
Panel 3 — Show the result or blessing described in the verse.

CRITICAL: The scenes must illustrate THIS SPECIFIC VERSE, not generic school scenes.
- If the verse talks about "light", show light/lamp/sun imagery.
- If the verse talks about "love your neighbor", show people helping each other.
- If the verse talks about "a shepherd", show a shepherd with sheep.
- If the verse talks about "planting seeds", show someone planting and harvesting.
- ALWAYS connect the visual directly to the verse's actual words and meaning.

Rules for scene descriptions (these go directly to an image generator — follow exactly):
- Describe ONLY what is VISIBLE: people, animals, objects, colors, setting, light, actions.
- Example: "A shepherd in a green field holding a small lamb, flock of sheep behind him, blue sky, warm sunlight"
- NO abstract concepts, NO emotions as words, NO narrative language.
- NEVER use these words in scene descriptions: God, Lord, Spirit, Holy, divine, sacred, angel, heaven, prayer, worship, sin, temptation, darkness, evil. Instead describe the PHYSICAL visual equivalent (e.g. "a glowing dove" not "the Holy Spirit", "bright sunlight breaking through clouds" not "God's light").
- All scenes must be POSITIVE, warm, and safe for children.
- Keep each scene description under 40 words. Be SPECIFIC and DETAILED.

Captions: short English phrase (max 8 words) that quotes or paraphrases the verse.

Respond ONLY with valid JSON:
{
  "theme": "one-word English theme from the verse",
  "panels": [
    { "scene": "detailed visual description directly from the verse content", "caption": "verse-related caption" },
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

// ── Claude: blended comic script (verse + lesson topic) ─────────────────────

async function buildBlendedComicScript(
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
        content: `Create a 3-panel comic strip for ${grade} ${subject} students that CONNECTS a biblical verse to the lesson topic.

Biblical verse: "${verseText}" — ${verseRef}
Lesson topic: "${topic}"

The comic must show HOW the verse's teaching applies to or connects with the lesson topic "${topic}".

Panel 1 — Show a scene related to the lesson topic "${topic}" (students learning, exploring, or working on it).
Panel 2 — Show the biblical verse's teaching being lived or applied in the context of "${topic}".
Panel 3 — Show the positive outcome when the verse's wisdom is applied to the topic — students succeeding, understanding, or growing.

CRITICAL: Both the verse content AND the topic "${topic}" must be VISUALLY PRESENT in the scenes.
- If the topic is "plants" and the verse talks about "bearing fruit", show students growing plants that bear fruit as a metaphor.
- If the topic is "math" and the verse talks about "wisdom", show students solving math with joy and discovery.
- The images must make the CONNECTION between verse and topic OBVIOUS to students.

Rules for scene descriptions (these go directly to an image generator — follow exactly):
- Describe ONLY what is VISIBLE: people, animals, objects, colors, setting, light, actions.
- NEVER use these words in scene descriptions: God, Lord, Spirit, Holy, divine, sacred, angel, heaven, prayer, worship, sin, temptation, darkness, evil. Instead describe the PHYSICAL visual equivalent (e.g. "a glowing dove" not "the Holy Spirit", "bright rays breaking through clouds" not "God's light").
- NO abstract concepts, NO emotions as words, NO narrative language.
- All scenes must be POSITIVE, warm, and safe for children.
- Keep each scene description under 40 words. Be SPECIFIC and DETAILED.

Captions: short English phrase (max 8 words) connecting verse and topic.

Respond ONLY with valid JSON:
{
  "theme": "one-word theme bridging verse and topic",
  "panels": [
    { "scene": "detailed visual description connecting verse and topic", "caption": "bridge caption" },
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
  if (!match) throw new Error('Claude returned no JSON for blended comic script')
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

// ── Gemini: generate one panel image (with retry on 429) ─────────────────────

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function generatePanelImage(
  scene: string, grade: string,
  attempt = 0
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

  if (res.status === 429 && attempt < 3) {
    // Rate limited — wait and retry (exponential backoff: 3s, 6s, 12s)
    await sleep(3000 * Math.pow(2, attempt))
    return generatePanelImage(scene, grade, attempt + 1)
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    console.error(`Gemini image error ${res.status}:`, errText.slice(0, 300))
    return null
  }

  const data = await res.json()
  const parts = data?.candidates?.[0]?.content?.parts || []
  const img   = parts.find((p: { inlineData?: { mimeType: string; data: string } }) =>
    p.inlineData?.mimeType?.startsWith('image/')
  )

  if (!img) {
    console.error('Gemini returned no image part. Response:', JSON.stringify(data).slice(0, 400))
    return null
  }

  return { base64: img.inlineData.data, mimeType: img.inlineData.mimeType }
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
    planId, classDate, blendTopic = false,
  } = body

  if (!verseText) return json({ error: 'verseText is required' }, 400)
  if (!ANTHROPIC_API_KEY) return json({ error: 'ANTHROPIC_API_KEY not configured' }, 500)

  // ── Questions mode ────────────────────────────────────────────────────────
  if (type === 'questions') {
    const questions = await buildIndicatorQuestions(verseText, verseRef, topic, grade, subject)
    return json({ questions })
  }

  // ── Script-only mode (no images) ─────────────────────────────────────────
  // Returns panel descriptions + captions so the frontend can generate
  // images individually via generate-image (faster, progressive UX).
  const script = blendTopic
    ? await buildBlendedComicScript(verseText, verseRef, topic, grade, subject)
    : await buildComicScript(verseText, verseRef, topic, grade, subject)
  if (!script.panels?.length) return json({ error: 'Failed to generate comic script' }, 502)

  return json({ panels: script.panels, theme: script.theme })
})
