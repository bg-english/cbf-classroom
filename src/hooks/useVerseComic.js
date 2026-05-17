import { useState, useEffect, useRef } from 'react'
import { supabase } from '../utils/supabase'
import { useClassLibrary } from './useClassLibrary'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

/**
 * useVerseComic — fetches (or generates) content for one verse scene.
 *
 * type='comic'     → returns { panels: [{imageUrl, caption}], theme }
 * type='questions' → returns { questions: [string, string, string] }
 *
 * Cache-first: checks generated_class_library before calling the edge function.
 * On a HIT the response is instant. On a MISS it generates + saves automatically.
 */
export function useVerseComic({
  type = 'comic',        // 'comic' | 'questions'
  verseText,
  verseRef,
  verseType,             // content_key used for caching, e.g. 'verse_year_comic'
  topic,
  grade,
  subject,
  planId,
  classDate,
  enabled = true,        // set false to skip loading (scene not yet visible)
}) {
  const [panels,    setPanels]    = useState(null)   // comic panels array
  const [questions, setQuestions] = useState(null)   // indicator questions array
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const calledRef = useRef(false)

  const { getContent, saveContent } = useClassLibrary({ planId, grade, classDate })

  useEffect(() => {
    if (!enabled || !verseText || !planId || !classDate) return
    if (calledRef.current) return
    calledRef.current = true
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, verseText, planId, classDate])

  async function load() {
    setLoading(true)
    setError(null)

    // ── 1. Check cache ────────────────────────────────────────────────────────
    const cached = await getContent(verseType)

    if (type === 'questions' && cached?.questions) {
      setQuestions(cached.questions)
      setLoading(false)
      return
    }
    if (type === 'comic' && cached?.panels) {
      setPanels(cached.panels)
      setLoading(false)
      return
    }

    // ── 2. Generate via edge function ─────────────────────────────────────────
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-verse-comic`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          type,
          verseText,
          verseRef:  verseRef  || '',
          verseType: verseType || 'verse_comic',
          topic:     topic     || 'the lesson',
          grade:     grade     || 'K-12',
          subject:   subject   || 'class',
          planId,
          classDate,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')

      // ── 3. Save to cache + update state ────────────────────────────────────
      if (type === 'questions') {
        const q = data.questions || []
        await saveContent(verseType, { questions: q })
        setQuestions(q)
      } else {
        const p = data.panels || []
        await saveContent(verseType, { panels: p, theme: data.theme })
        setPanels(p)
      }
    } catch (e) {
      setError(e.message || 'Error generating content')
    } finally {
      setLoading(false)
    }
  }

  /** Force regeneration (ignores cache) */
  async function regenerate() {
    setPanels(null)
    setQuestions(null)
    // Delete cached entry so the next load() misses
    await supabase
      .from('generated_class_library')
      .delete()
      .eq('plan_id', planId)
      .eq('grade', grade)
      .eq('class_date', classDate)
      .eq('content_key', verseType)
    calledRef.current = false
    load()
  }

  return { panels, questions, loading, error, regenerate }
}
