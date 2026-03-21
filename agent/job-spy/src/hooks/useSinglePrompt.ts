'use client'

import { useReducer, useCallback } from 'react'
import type {
  CombinedAnalysis,
  StepDebug,
  ResumeData,
} from '@/lib/schemas'
import { SINGLE_PROMPT_SYSTEM, SINGLE_PROMPT_USER } from '@/lib/prompts'

export interface SinglePromptState {
  phase: 'idle' | 'running' | 'done' | 'error'
  output: CombinedAnalysis | null
  partialOutput: Partial<CombinedAnalysis> | null
  debug: StepDebug | null
  error: string | null
}

type Action =
  | { type: 'START' }
  | { type: 'PARTIAL'; data: Partial<CombinedAnalysis> }
  | { type: 'COMPLETE'; data: CombinedAnalysis; debug: StepDebug }
  | { type: 'ERROR'; error: string }
  | { type: 'RESET' }

const initialState: SinglePromptState = {
  phase: 'idle',
  output: null,
  partialOutput: null,
  debug: null,
  error: null,
}

function reducer(state: SinglePromptState, action: Action): SinglePromptState {
  switch (action.type) {
    case 'START':
      return { ...initialState, phase: 'running' }
    case 'PARTIAL':
      return { ...state, partialOutput: action.data }
    case 'COMPLETE':
      return { ...state, phase: 'done', output: action.data, partialOutput: null, debug: action.debug }
    case 'ERROR':
      return { ...state, phase: 'error', error: action.error }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

export function useSinglePrompt() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const run = useCallback(async (rawJD: string, resume: ResumeData) => {
    dispatch({ type: 'START' })

    try {
      const resumeStr = JSON.stringify(resume, null, 2)
      const t0 = Date.now()

      const res = await fetch('/api/single-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawJD, resume: resumeStr }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Single prompt failed (${res.status}): ${text.slice(0, 200)}`)
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let lastParsed: Partial<CombinedAnalysis> = {}

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const parsed = JSON.parse(line)
            lastParsed = parsed
            dispatch({ type: 'PARTIAL', data: parsed })
          } catch {
            // incomplete line
          }
        }
      }

      if (buffer.trim()) {
        try {
          lastParsed = JSON.parse(buffer.trim())
          dispatch({ type: 'PARTIAL', data: lastParsed })
        } catch {
          // ignore
        }
      }

      dispatch({
        type: 'COMPLETE',
        data: lastParsed as CombinedAnalysis,
        debug: {
          systemPrompt: SINGLE_PROMPT_SYSTEM,
          userInput: SINGLE_PROMPT_USER(rawJD, resumeStr),
          output: JSON.stringify(lastParsed, null, 2),
          durationMs: Date.now() - t0,
        },
      })
    } catch (err) {
      dispatch({
        type: 'ERROR',
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }, [])

  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])

  return { state, run, reset }
}
