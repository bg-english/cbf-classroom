import { useState, useCallback } from 'react'
import { supabase } from '../utils/supabase'

/**
 * useImageGen — generates classroom images via Gemini 2.0 Flash.
 *
 * Usage:
 *   const { generate, imageUrl, loading, error, clear } = useImageGen()
 *   await generate('A student reading a book', { topic: 'Reading', grade: '7' })
 *   // → imageUrl is a data: URI ready for <img src={imageUrl} />
 */
export function useImageGen() {
  const [imageUrl,  setImageUrl]  = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const [promptUsed, setPromptUsed] = useState(null)

  const generate = useCallback(async (prompt, context = {}, aspectRatio = '16:9') => {
    setLoading(true)
    setError(null)
    setImageUrl(null)
    setPromptUsed(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ prompt, context, aspectRatio }),
        }
      )

      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Image generation failed')
      }

      const dataUri = `data:${data.mimeType};base64,${data.imageBase64}`
      setImageUrl(dataUri)
      setPromptUsed(data.prompt)
      return dataUri

    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const clear = useCallback(() => {
    setImageUrl(null)
    setError(null)
    setPromptUsed(null)
  }, [])

  return { generate, imageUrl, loading, error, promptUsed, clear }
}
