import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY  = Deno.env.get('GEMINI_API_KEY')
const SUPABASE_URL    = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

const IMAGE_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
const MAX_RETRIES = 3

/**
 * Builds a classroom-safe prompt for educational image generation.
 * Gemini imagen style guide: flat illustration, no text, safe-for-school.
 */
function buildPrompt(userPrompt: string, context: Record<string, string> = {}): string {
  const styleGuide = [
    'Flat vector illustration style, vibrant colors, clean lines.',
    'Educational, age-appropriate, safe for school (K-12).',
    'No text or letters in the image.',
    'White or transparent background.',
    'Simple, clear composition readable at 5 meters distance.',
  ].join(' ')

  const ctx = context.topic
    ? `Topic: ${context.topic}. Grade: ${context.grade || 'K-12'}.`
    : ''

  return `${userPrompt}. ${ctx} ${styleGuide}`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  // Auth
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing authorization' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'Gemini not configured. Set GEMINI_API_KEY in Supabase secrets.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { prompt, context, aspectRatio = '16:9', listModels } = await req.json()

  // Diagnostic: list available models for this API key
  if (listModels) {
    const modelsRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}&pageSize=100`
    )
    const modelsData = await modelsRes.json()
    const imageModels = (modelsData.models || [])
      .filter((m: { name: string; supportedGenerationMethods?: string[] }) =>
        m.name.includes('imagen') ||
        m.name.includes('image') ||
        (m.supportedGenerationMethods || []).includes('predict')
      )
      .map((m: { name: string; supportedGenerationMethods?: string[] }) => ({
        name: m.name,
        methods: m.supportedGenerationMethods,
      }))
    return new Response(
      JSON.stringify({ allModels: modelsData.models?.map((m: { name: string }) => m.name), imageModels }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (!prompt) {
    return new Response(JSON.stringify({ error: 'prompt is required' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const fullPrompt = buildPrompt(prompt, context || {})

  // Call Gemini 2.5 Flash Image via generateContent (with retry on 429)
  let imageRes: Response | null = null
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    imageRes = await fetch(`${IMAGE_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: { responseModalities: ['IMAGE'] },
      }),
    })

    if (imageRes.status === 429 && attempt < MAX_RETRIES) {
      const wait = 4000 * Math.pow(2, attempt) // 4s, 8s, 16s
      console.log(`Gemini 429 rate limited, retry ${attempt + 1}/${MAX_RETRIES} after ${wait}ms`)
      await sleep(wait)
      continue
    }
    break
  }

  if (!imageRes!.ok) {
    const err = await imageRes!.text()
    return new Response(JSON.stringify({ error: `Gemini Image error: ${imageRes!.status}`, detail: err }), {
      status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const imageData = await imageRes!.json()

  // Extract base64 image from generateContent response
  const parts = imageData?.candidates?.[0]?.content?.parts || []
  const imagePart = parts.find((p: { inlineData?: { mimeType: string; data: string } }) =>
    p.inlineData?.mimeType?.startsWith('image/')
  )

  if (!imagePart) {
    return new Response(JSON.stringify({ error: 'No image returned', raw: imageData }), {
      status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  return new Response(
    JSON.stringify({
      imageBase64: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType,
      prompt: fullPrompt,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  )
})
