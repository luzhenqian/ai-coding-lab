'use client'

import { useReducer, useCallback } from 'react'
import type { ComparisonResult, PipelineOutputs, CombinedAnalysis } from '@/lib/schemas'

export interface ComparisonState {
  phase: 'idle' | 'running' | 'done' | 'error'
  result: ComparisonResult | null
  partialResult: Partial<ComparisonResult> | null
  error: string | null
}

type Action =
  | { type: 'START' }
  | { type: 'PARTIAL'; data: Partial<ComparisonResult> }
  | { type: 'COMPLETE'; data: ComparisonResult }
  | { type: 'ERROR'; error: string }
  | { type: 'RESET' }

const initialState: ComparisonState = {
  phase: 'idle',
  result: null,
  partialResult: null,
  error: null,
}

function reducer(state: ComparisonState, action: Action): ComparisonState {
  switch (action.type) {
    case 'START':
      return { ...initialState, phase: 'running' }
    case 'PARTIAL':
      return { ...state, partialResult: action.data }
    case 'COMPLETE':
      return { ...state, phase: 'done', result: action.data, partialResult: null }
    case 'ERROR':
      return { ...state, phase: 'error', error: action.error }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

export function useComparison() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const run = useCallback(async (
    chainOutputs: PipelineOutputs,
    singleOutputs: CombinedAnalysis,
    rawJD: string,
    resume: string,
  ) => {
    dispatch({ type: 'START' })

    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chainOutputs: JSON.stringify(chainOutputs, null, 2),
          singleOutputs: JSON.stringify(singleOutputs, null, 2),
          rawJD,
          resume,
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Comparison failed (${res.status}): ${text.slice(0, 200)}`)
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let lastParsed: Partial<ComparisonResult> = {}

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

      dispatch({ type: 'COMPLETE', data: lastParsed as ComparisonResult })
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
