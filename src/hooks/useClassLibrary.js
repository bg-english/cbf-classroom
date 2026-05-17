import { supabase } from '../utils/supabase'

/**
 * useClassLibrary — cache read/write for AI-generated class content.
 *
 * Each piece of content is keyed by (planId, grade, classDate, contentKey).
 * This is a plain-function hook (no React state) — callers control their own state.
 *
 * _memCache: module-level Map so navigating back to a verse scene is instant
 * (no repeated DB queries within the same browser session).
 * Cache is keyed as `planId|grade|classDate|contentKey`.
 */

const _memCache = new Map()

export function useClassLibrary({ planId, grade, classDate }) {
  function _key(contentKey) {
    return `${planId}|${grade}|${classDate}|${contentKey}`
  }

  /**
   * Look up cached content. Returns content_data object or null if not found.
   * Hits memory first — DB only on cold access.
   */
  async function getContent(contentKey) {
    if (!planId || !grade || !classDate || !contentKey) return null

    const key = _key(contentKey)
    if (_memCache.has(key)) return _memCache.get(key)

    const { data, error } = await supabase
      .from('generated_class_library')
      .select('content_data')
      .eq('plan_id', planId)
      .eq('grade', grade)
      .eq('class_date', classDate)
      .eq('content_key', contentKey)
      .single()

    const result = (error || !data) ? null : data.content_data
    _memCache.set(key, result)
    return result
  }

  /**
   * Save generated content to the library.
   * Updates memory cache immediately, then persists to DB.
   */
  async function saveContent(contentKey, contentData) {
    if (!planId || !grade || !classDate || !contentKey) return

    _memCache.set(_key(contentKey), contentData)

    await supabase
      .from('generated_class_library')
      .upsert(
        { plan_id: planId, grade, class_date: classDate, content_key: contentKey, content_data: contentData },
        { onConflict: 'plan_id,grade,class_date,content_key' }
      )
  }

  return { getContent, saveContent }
}
