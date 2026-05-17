import { useState, useEffect, useRef } from 'react'
import { supabase } from '../utils/supabase'
import { useClassLibrary } from './useClassLibrary'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

/**
 * useVerseComic — manages content for one verse scene.
 *
 * type='comic' generation — two-phase approach for progressive UX:
 *   Phase 1: Call generate-verse-comic (Claude only, ~3s)
 *            → get panel descriptions + captions, show structure immediately
 *   Phase 2: Call generate-image 3× sequentially (proven working function)
 *            → images appear one by one as each completes (~10-15s each)
 *   Save: write final panels to cache when all images are done
 *
 * type='questions': single Claude call, no images.
 *
 * Cache-first: on mount, checks generated_class_library.
 * If cached → instant display. If not → teacher taps "Generar".
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
  blendTopic = false,
}) {
  const [panels,        setPanels]        = useState(null)   // [{imageUrl, caption}]
  const [questions,     setQuestions]     = useState(null)
  const [loading,       setLoading]       = useState(false)  // true only during phase 1
  const [error,         setError]         = useState(null)
  const [cached,        setCached]        = useState(false)
  const [imageProgress, setImageProgress] = useState(0)      // 0-3 panels done
  const fetchedRef = useRef(false)

  const { getContent, saveContent } = useClassLibrary({ planId, grade, classDate })

  // On mount: check cache only
  useEffect(() => {
    if (!verseText || !planId || !classDate || fetchedRef.current) return
    fetchedRef.current = true
    checkCache()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verseText, planId, classDate])

  async function checkCache() {
    const data = await getContent(verseType)
    if (!data) return

    if (type === 'questions' && data.questions?.length) {
      setQuestions(data.questions)
      setCached(true)
    } else if (type === 'comic' && data.panels?.length) {
      // Only use cache if at least one panel has a real image
      const hasImages = data.panels.some(p => p.imageUrl)
      if (hasImages) {
        setPanels(data.panels)
        setCached(true)
      }
    }
  }

  async function getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }

  // ── Questions generation ──────────────────────────────────────────────────

  async function generateQuestions() {
    setLoading(true)
    setError(null)
    try {
      const session = await getSession()
      const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-verse-comic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({
          type: 'questions',
          verseText, verseRef: verseRef || '', verseType: verseType || 'indicator_questions',
          topic: topic || 'the lesson', grade: grade || 'K-12', subject: subject || 'class',
          planId, classDate,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate questions')
      const q = data.questions || []
      await saveContent(verseType, { questions: q })
      setQuestions(q)
      setCached(true)
    } catch (e) {
      setError(e.message || 'Error generating questions')
    } finally {
      setLoading(false)
    }
  }

  const delay = (ms) => new Promise(r => setTimeout(r, ms))

  // ── Comic generation — two phases ─────────────────────────────────────────

  async function generateComic() {
    setLoading(true)
    setError(null)
    setPanels(null)
    setImageProgress(0)

    let scriptPanels = null

    // ── Phase 1: Claude script (~3-5s) ───────────────────────────────────────
    try {
      const session = await getSession()
      const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-verse-comic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({
          type: 'comic',
          verseText, verseRef: verseRef || '', verseType: verseType || 'verse_comic',
          topic: topic || 'the lesson', grade: grade || 'K-12', subject: subject || 'class',
          planId, classDate, blendTopic,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate script')
      if (!data.panels?.length) throw new Error('No panels returned from script generation')
      scriptPanels = data.panels  // [{scene, caption}]
    } catch (e) {
      setError(e.message || 'Error generating comic script')
      setLoading(false)
      return
    }

    // ── Show structure immediately — panels with captions, images loading ────
    const initialPanels = scriptPanels.map(p => ({ imageUrl: null, caption: p.caption }))
    setPanels([...initialPanels])
    setLoading(false)  // stop the "big" loading state; images load progressively

    // ── Phase 2: generate-image for each panel (sequential, proven working) ──
    // Use only the scene description — generate-image already adds its own
    // style guide via buildPrompt(). No need to duplicate instructions.
    const finalPanels = [...initialPanels]

    for (let i = 0; i < scriptPanels.length; i++) {
      // Delay between calls to avoid Gemini 429 rate limiting
      if (i > 0) await delay(5000)

      try {
        const session = await getSession()

        // Keep prompt SHORT — scene description only. generate-image adds
        // "Flat vector illustration, no text, safe for school" automatically.
        const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
          body: JSON.stringify({
            prompt: scriptPanels[i].scene,
            context: blendTopic
              ? { topic: topic || 'lesson', grade: grade || 'K-12' }
              : { grade: grade || 'K-12' },
          }),
        })
        const imgData = await res.json()

        if (res.ok && imgData.imageBase64) {
          finalPanels[i] = {
            ...finalPanels[i],
            imageUrl: `data:${imgData.mimeType || 'image/png'};base64,${imgData.imageBase64}`,
          }
          setPanels([...finalPanels])  // update UI — image appears immediately
        } else {
          console.error(`Panel ${i} image generation failed:`, imgData.error || imgData.detail || 'Unknown error')
          finalPanels[i] = { ...finalPanels[i], imageUrl: 'error' }
          setPanels([...finalPanels])
        }
      } catch (e) {
        console.error(`Panel ${i} image fetch error:`, e)
        finalPanels[i] = { ...finalPanels[i], imageUrl: 'error' }
        setPanels([...finalPanels])
      }
      setImageProgress(i + 1)
    }

    // ── Save to cache when all panels are done ────────────────────────────────
    const hasAnyImage = finalPanels.some(p => p.imageUrl)
    if (hasAnyImage) {
      await saveContent(verseType, { panels: finalPanels })
      setCached(true)
    }
  }

  /** Explicit generation — called by teacher tapping "Generar" */
  async function generate() {
    if (loading) return
    if (type === 'questions') return generateQuestions()
    return generateComic()
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
      .eq('plan_id',     planId)
      .eq('grade',       grade)
      .eq('class_date',  classDate)
      .eq('content_key', verseType)

    fetchedRef.current = false
    generate()
  }

  const hasContent = type === 'questions'
    ? !!questions
    : panels?.some(p => p.imageUrl && p.imageUrl !== 'error')

  return { panels, questions, loading, error, cached, hasContent, imageProgress, generate, regenerate }
}
