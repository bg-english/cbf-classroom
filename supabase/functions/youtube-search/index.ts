import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

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

  if (!YOUTUBE_API_KEY) {
    return new Response(JSON.stringify({ error: 'YouTube not configured. Set YOUTUBE_API_KEY in Supabase secrets.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { query, grade, language } = await req.json()

  // Append educational context to improve relevance
  const searchQuery = language === 'English'
    ? `${query} ${grade} educational classroom`
    : `${query} ${grade} educativo clase`

  const url = new URL('https://www.googleapis.com/youtube/v3/search')
  url.searchParams.set('part', 'snippet')
  url.searchParams.set('q', searchQuery)
  url.searchParams.set('type', 'video')
  url.searchParams.set('maxResults', '6')
  url.searchParams.set('videoEmbeddable', 'true')
  url.searchParams.set('safeSearch', 'strict')
  url.searchParams.set('relevanceLanguage', language === 'English' ? 'en' : 'es')
  url.searchParams.set('key', YOUTUBE_API_KEY)

  const ytRes = await fetch(url.toString())
  if (!ytRes.ok) {
    const err = await ytRes.text()
    return new Response(JSON.stringify({ error: `YouTube error: ${ytRes.status}`, detail: err }), {
      status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const data = await ytRes.json()
  const videos = (data.items || []).map((item: any) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
  }))

  return new Response(JSON.stringify({ videos }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
