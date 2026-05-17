import { useState, useEffect, useRef } from 'react'
import { supabase } from '../utils/supabase'
import { useClassLibrary } from './useClassLibrary'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

/**
 * useVerseComic — manages content for one verse scene.
 *
 * type='comic'     → { panels: [{imageUrl, caption}], theme }
 * type='questions' → { questions: [string, string, string] }
 *
 * Behavior:
 *  - On mount: checks cache once. If cached, shows it immediately. Does NOT auto-generate.
 *  - generate(): explicit call to create content (triggers API + saves to cache).
 *  - regenerate(): deletes cache entry, then calls generate() again.
 *
 * This way, navigating Next/Prev never triggers API calls — only explicit teacher action does.
 */
export function useVerseComic({
  type = 'comic',
  verseText,
  verseRef,
  verseType,
  topic,
  grade,
  subject,
  planId,
  classDate,
}) {
  const [panels,    setPanels]    = useState(null)
  const [questions, setQuestions] = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const [cached,    setCached]    = useState(false)  // true when content came from cache
  const fetchedRef = useRef(false)

  const { getContent, saveContent } = useClassLibrary({ planId, grade, classDate })

  // On mount: check cache only — do NOT generate
  useEffect(() => {
    if (!verseText || !planId || !classDate || fetchedRef.current) return
    fetchedRef.current = true
    checkCache()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verseText, planId, classDate])

  async function checkCache() {
    const data = await getContent(verseType)
    if (!data) return  // no cache — caller will show "Generar" button

    if (type === 'questions' && data.questions) {
      setQuestions(data.questions)
      setCached(true)
    } else if (type === 'comic' && data.panels) {
      setPanels(data.panels)
      setCached(true)
    }
  }

  async function callEdgeFunction() {
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
    return data
  }

  /** Explicit generation — called by teacher tapping "Generar" */
  async function generate() {
    if (loading) return
    setLoading(true)
    setError(null)
    setPanels(null)
    setQuestions(null)

    try {
      const data = await callEdgeFunction()

      if (type === 'questions') {
        const q = data.questions || []
        await saveContent(verseType, { questions: q })
        setQuestions(q)
        setCached(true)
      } else {
        const p = data.panels || []
        await saveContent(verseType, { panels: p, theme: data.theme })
        setPanels(p)
        setCached(true)
      }
    } catch (e) {
      setError(e.message || 'Error generating content')
    } finally {
      setLoading(false)
    }
  }

  /** Regenerate — deletes cache + generates fresh */
  async function regenerate() {
    if (loading) return
    setCached(false)
    setPanels(null)
    setQuestions(null)

    await supabase
      .from('generated_class_library')
      .delete()
      .eq('plan_id',    planId)
      .eq('grade',      grade)
      .eq('class_date', classDate)
      .eq('content_key', verseType)

    await generate()
  }

  const hasContent = type === 'questions' ? !!questions : !!panels

  return { panels, questions, loading, error, cached, hasContent, generate, regenerate }
}
