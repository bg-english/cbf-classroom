import { supabase } from '../utils/supabase'

/**
 * useClassLibrary — cache read/write for AI-generated class content.
 *
 * Each piece of content is keyed by (planId, grade, classDate, contentKey).
 * This is a plain-function hook (no React state) — callers control their own state.
 */
export function useClassLibrary({ planId, grade, classDate }) {
  /**
   * Look up cached content. Returns content_data object or null if not found.
   */
  async function getContent(contentKey) {
    if (!planId || !grade || !classDate || !contentKey) return null

    const { data, error } = await supabase
      .from('generated_class_library')
      .select('content_data')
      .eq('plan_id', planId)
      .eq('grade', grade)
      .eq('class_date', classDate)
      .eq('content_key', contentKey)
      .single()

    if (error || !data) return null
    return data.content_data
  }

  /**
   * Save generated content to the library.
   * Uses upsert so re-running generation overwrites stale data.
   */
  async function saveContent(contentKey, contentData) {
    if (!planId || !grade || !classDate || !contentKey) return

    await supabase
      .from('generated_class_library')
      .upsert(
        { plan_id: planId, grade, class_date: classDate, content_key: contentKey, content_data: contentData },
        { onConflict: 'plan_id,grade,class_date,content_key' }
      )
  }

  return { getContent, saveContent }
}
