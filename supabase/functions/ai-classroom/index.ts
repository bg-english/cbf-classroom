import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

const SYSTEM_PROMPT = `You are a classroom content assistant for a K-12 bilingual school (Colombian curriculum, Boston Flex methodology).
You generate structured content that will be projected on a large screen (55"-100") during a live class.

CRITICAL: You MUST respond with valid JSON only. No markdown, no prose, no code fences. Pure JSON.

The "action" field in the request determines your response format:

═══ ACTION: generate-blocks ═══
Return an array of typed blocks. Each block has a type and data object.
{
  "blocks": [
    {
      "type": "explanation|question|vocab|procedure|exit-ticket|pattern|model",
      "data": { ...type-specific... },
      "display": { "emphasis": "normal" }
    }
  ]
}

Block type schemas:
- explanation: { "text": "HTML string with <strong> for key terms", "grammarTarget": "optional grammar point" }
- question: { "question": "The question text", "subtype": "discussion|tps|individual|rhetorical", "guidance": "optional teacher guidance" }
- vocab: { "words": [{ "term": "word", "definition": "def", "example": "example sentence" }] }
- procedure: { "title": "Activity title", "steps": [{ "instruction": "Step text", "action": "listen|write|speak|read|do" }] }
- exit-ticket: { "question": "What did you learn?", "responseType": "thumbs|scale|written" }
- pattern: { "patternId": "think-pair-share|hook|three-two-one|guided-noticing|dictogloss|guided-writing|information-gap|model-text|picture-narration", "inputs": { ...pattern-specific... } }
- model: { "text": "Model text with grammar examples", "grammarTarget": "target structure", "annotations": "teacher notes" }

Pattern inputs:
- think-pair-share: { "question": "...", "thinkTime": 30, "pairTime": 60, "shareTime": 90 }
- hook: { "resource": "description", "detonatingQuestion": "..." }
- three-two-one: { "prompt3": "3 things you learned", "prompt2": "2 things you found interesting", "prompt1": "1 question you still have" }
- guided-noticing: { "examples": ["sentence 1", "sentence 2"], "rule": "The grammar rule", "question": "What pattern do you notice?" }
- dictogloss: { "passage": "Text to dictate", "focusStructure": "grammar focus" }
- guided-writing: { "prompt": "Write about...", "sentenceStarters": ["First,...", "Then,..."], "model": "optional model text" }

═══ ACTION: generate-smartblock ═══
Return a single interactive exercise block.
{
  "smartBlock": {
    "type": "GRAMMAR|READING|VOCAB|EXIT_TICKET|SPEAKING",
    "model": "fill-blank|choose|comprehension|matching|can-do|rubric",
    "data": { ...model-specific... }
  }
}

SmartBlock data schemas:
- GRAMMAR/fill-blank: { "grammar_point": "Present Perfect", "instructions": "Fill in the blanks", "sentences": [{ "sent": "She __ (go) to school", "answer": "has gone" }] }
- GRAMMAR/choose: { "grammar_point": "Subject-Verb Agreement", "items": [{ "sentence": "She __ happy", "options": ["is","are","am"], "answer": "is" }] }
- READING/comprehension: { "passage": "Multi-line text\\nLine 2", "questions": [{ "q": "What is the main idea?", "lines": "1-3" }] }
- VOCAB/matching: { "words": [{ "w": "word", "d": "definition", "e": "example sentence" }] }
- EXIT_TICKET/can-do: { "skills": ["I can identify the main idea", "I can use present perfect"] }
- SPEAKING/rubric: { "criteria": [{ "name": "Pronunciation", "pts": 5 }, { "name": "Fluency", "pts": 5 }] }

═══ ACTION: generate-visual ═══
Return a visual representation of the current topic. The "visualType" in the request specifies the format.
{
  "visual": {
    "type": "mind-map|bar-chart|comparison-table|timeline|hierarchy|flow-steps|key-concepts",
    "data": { "title": "...", ...type-specific... }
  }
}

Visual type schemas:

- mind-map: { "title": "Topic", "center": "Central concept", "branches": [{ "label": "Branch", "children": ["Sub-topic 1", "Sub-topic 2"] }] }
  Generate 4-6 branches, each with 2-4 children. Keep labels SHORT (2-4 words max for readability at 5m+).

- bar-chart: { "title": "Chart title", "items": [{ "label": "Item", "value": 85, "unit": "%" }], "source": "optional source" }
  Generate 4-8 items with realistic numeric values. Good for: statistics, percentages, quantities, comparisons.

- comparison-table: { "title": "Comparison", "headers": ["Criteria", "Option A", "Option B"], "rows": [["Speed", "Fast", "Slow"]] }
  Generate 4-7 rows comparing 2-3 items. Headers should be short. Good for: compare/contrast, pros/cons, before/after.

- timeline: { "title": "Timeline", "events": [{ "date": "1492", "label": "Event name", "description": "Brief detail" }] }
  Generate 4-8 chronological events. Good for: history, processes, sequences, evolution of concepts.

- hierarchy: { "title": "Classification", "root": { "label": "Top", "children": [{ "label": "Category", "children": [{ "label": "Item" }] }] } }
  Generate 2-3 levels deep, 2-4 children per node. Good for: taxonomies, classifications, org structures, grammar trees.

- flow-steps: { "title": "Process", "steps": [{ "label": "Step name", "detail": "Brief explanation" }] }
  Generate 4-7 sequential steps. Good for: processes, methods, algorithms, procedures, how things work.

- key-concepts: { "title": "Key Concepts", "concepts": [{ "icon": "🔬", "title": "Concept", "description": "1-2 sentence explanation" }] }
  Generate 3-6 concept cards with relevant emoji icons. Good for: vocabulary, definitions, main ideas, chapter summaries.

IMPORTANT for visuals:
- ALL text must be SHORT — this is projected on a huge screen, not read on paper
- Labels: 2-5 words max
- Descriptions: 1-2 short sentences max
- Use the language specified in context (English or Spanish)
- Content must be factually accurate and grade-appropriate
- Choose data that genuinely helps understand the topic

═══ ACTION: freeform ═══
Decide the best format (blocks, smartBlock, or visual) based on the request and return accordingly.
If the request is about exercises/practice → use smartBlock.
If the request is about explanations/activities/questions → use blocks.
If the request is about visualizing/diagramming/summarizing → use visual.

PEDAGOGICAL GUIDELINES:
- Content MUST be grade-appropriate
- For language subjects: target the specific grammar/vocabulary from the topic
- Keep text readable at 5+ meters (short sentences, clear structure)
- Exercises: 5-8 items (enough practice, not overwhelming)
- Generate ALL student-facing content in the language specified in context
- When connecting to biblical principle, do so naturally without being preachy
- For Colombian curriculum: align with DBA/EBC standards when relevant`

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

  // Validate auth
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

  if (!ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'AI not configured. Set ANTHROPIC_API_KEY in Supabase secrets.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Parse request
  const { action, context, prompt, previousResult } = await req.json()

  // Build user message
  let userMessage = `ACTION: ${action || 'freeform'}\n\n`

  if (context) {
    userMessage += `CONTEXT:\n`
    userMessage += `Grade: ${context.grade} ${context.section || ''}\n`
    userMessage += `Subject: ${context.subject}\n`
    userMessage += `Language: ${context.language} (generate content in this language)\n`
    userMessage += `Topic: ${context.topic || 'Not specified'}\n`
    userMessage += `Objective: ${context.objective || 'Not specified'}\n`
    userMessage += `Current moment: ${context.momentId} - ${context.momentLabel}\n`
    if (context.biblicalPrinciple) {
      userMessage += `Biblical principle: ${context.biblicalPrinciple}\n`
    }
    userMessage += `\n`
  }

  if (previousResult) {
    userMessage += `PREVIOUS RESULT (to refine):\n${JSON.stringify(previousResult)}\n\n`
  }

  userMessage += `REQUEST: ${prompt}`

  // Call Anthropic API with streaming
  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      stream: true,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!anthropicRes.ok) {
    const err = await anthropicRes.text()
    return new Response(JSON.stringify({ error: `AI error: ${anthropicRes.status}`, detail: err }), {
      status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Stream SSE back to client
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const reader = anthropicRes.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6)

            if (data === '[DONE]') {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
              continue
            }

            try {
              const event = JSON.parse(data)

              // Extract text deltas from Anthropic streaming format
              if (event.type === 'content_block_delta' && event.delta?.text) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`))
              }

              if (event.type === 'message_stop') {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'))
              }
            } catch {
              // Skip unparseable lines
            }
          }
        }
      } catch (err) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(err) })}\n\n`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
})
