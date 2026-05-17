import { useState, useCallback, useRef } from 'react'
import { supabase } from '../utils/supabase'

/**
 * useAI — manages AI generation state with SSE streaming.
 *
 * Returns: { loading, result, error, streamText, generate, cancel, clear, refine }
 */
export default function useAI() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [streamText, setStreamText] = useState('')
  const abortRef = useRef(null)
  const lastRequestRef = useRef(null)

  const generate = useCallback(async (action, prompt, context, previousResult = null) => {
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setResult(null)
    setError(null)
    setStreamText('')

    lastRequestRef.current = { action, prompt, context }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const res = await fetch(`${supabaseUrl}/functions/v1/ai-classroom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action, prompt, context, previousResult }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        throw new Error(errData.error || errData.detail || `Error ${res.status}`)
      }

      // Read SSE stream
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()

          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            if (parsed.error) throw new Error(parsed.error)
            if (parsed.text) {
              accumulated += parsed.text
              setStreamText(accumulated)
            }
          } catch (e) {
            if (e.message && !e.message.includes('JSON')) throw e
          }
        }
      }

      // Parse final accumulated JSON
      if (accumulated) {
        // Strip any markdown code fences the model might add
        let clean = accumulated.trim()
        if (clean.startsWith('```')) {
          clean = clean.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '')
        }
        const parsed = JSON.parse(clean)
        setResult(parsed)
      }
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message || 'AI generation failed')
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }, [])

  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    setLoading(false)
  }, [])

  const clear = useCallback(() => {
    setResult(null)
    setError(null)
    setStreamText('')
  }, [])

  const refine = useCallback((instruction) => {
    if (!lastRequestRef.current || !result) return
    const { action, context } = lastRequestRef.current
    generate(action, instruction, context, result)
  }, [generate, result])

  const regenerate = useCallback(() => {
    if (!lastRequestRef.current) return
    const { action, prompt, context } = lastRequestRef.current
    generate(action, prompt, context)
  }, [generate])

  return { loading, result, error, streamText, generate, cancel, clear, refine, regenerate }
}
