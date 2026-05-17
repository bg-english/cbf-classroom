import { useState, useCallback } from 'react'
import { supabase } from '../utils/supabase'

export default function useYouTube() {
  const [loading, setLoading] = useState(false)
  const [videos, setVideos] = useState([])
  const [error, setError] = useState(null)

  const search = useCallback(async (query, { grade, language } = {}) => {
    if (!query) return
    setLoading(true)
    setError(null)
    setVideos([])

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) throw new Error('Not authenticated')

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      const res = await fetch(`${supabaseUrl}/functions/v1/youtube-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': anonKey,
        },
        body: JSON.stringify({ query, grade, language }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'YouTube search failed')
      setVideos(json.videos || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const clear = useCallback(() => {
    setVideos([])
    setError(null)
  }, [])

  return { loading, videos, error, search, clear }
}
