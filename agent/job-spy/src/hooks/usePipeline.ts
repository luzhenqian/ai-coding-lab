'use client'

import { useReducer, useCallback, useRef } from 'react'
import type {
  ParsedJD,
  SkillMatch,
  CompetitivenessAnalysis,
  Strategy,
  StepStatus,
  StepDebug,
  PipelineOutputs,
  ResumeData,
} from '@/lib/schemas'
import {
  JD_PARSER_SYSTEM,
  JD_PARSER_USER,
  SKILL_MATCHER_SYSTEM,
  SKILL_MATCHER_USER,
  COMPETITIVENESS_SYSTEM,
  COMPETITIVENESS_USER,
  STRATEGY_SYSTEM,
  STRATEGY_USER,
} from '@/lib/prompts'

export const STEP_NAMES = ['JD 解析', '技能匹配', '竞争力分析', '求职策略'] as const

export interface PipelineState {
  phase: 'idle' | 'running' | 'done' | 'error'
  currentStep: number
  stepStatuses: [StepStatus, StepStatus, StepStatus, StepStatus]
  outputs: PipelineOutputs
  partialOutputs: {
    parsedJD: Partial<ParsedJD> | null
    skillMatch: Partial<SkillMatch> | null
    competitiveness: Partial<CompetitivenessAnalysis> | null
    strategy: Partial<Strategy> | null
  }
  debug: (StepDebug | null)[]
  error: string | null
}

type Action =
  | { type: 'START' }
  | { type: 'STEP_RUNNING'; step: number }
  | { type: 'STEP_PARTIAL'; step: number; data: unknown }
  | { type: 'STEP_COMPLETE'; step: number; data: unknown; debug: StepDebug }
  | { type: 'STEP_ERROR'; step: number; error: string }
  | { type: 'RESET' }

const initialState: PipelineState = {
  phase: 'idle',
  currentStep: -1,
  stepStatuses: ['pending', 'pending', 'pending', 'pending'],
  outputs: { parsedJD: null, skillMatch: null, competitiveness: null, strategy: null },
  partialOutputs: { parsedJD: null, skillMatch: null, competitiveness: null, strategy: null },
  debug: [null, null, null, null],
  error: null,
}

const outputKeys = ['parsedJD', 'skillMatch', 'competitiveness', 'strategy'] as const

function reducer(state: PipelineState, action: Action): PipelineState {
  switch (action.type) {
    case 'START':
      return { ...initialState, phase: 'running' }
    case 'STEP_RUNNING': {
      const statuses = [...state.stepStatuses] as PipelineState['stepStatuses']
      statuses[action.step] = 'running'
      return { ...state, currentStep: action.step, stepStatuses: statuses }
    }
    case 'STEP_PARTIAL': {
      const key = outputKeys[action.step]
      return {
        ...state,
        partialOutputs: { ...state.partialOutputs, [key]: action.data },
      }
    }
    case 'STEP_COMPLETE': {
      const statuses = [...state.stepStatuses] as PipelineState['stepStatuses']
      statuses[action.step] = 'complete'
      const key = outputKeys[action.step]
      const debug = [...state.debug]
      debug[action.step] = action.debug
      const isDone = action.step === 3
      return {
        ...state,
        phase: isDone ? 'done' : 'running',
        stepStatuses: statuses,
        outputs: { ...state.outputs, [key]: action.data },
        partialOutputs: { ...state.partialOutputs, [key]: null },
        debug,
      }
    }
    case 'STEP_ERROR': {
      const statuses = [...state.stepStatuses] as PipelineState['stepStatuses']
      statuses[action.step] = 'error'
      for (let i = action.step + 1; i < 4; i++) statuses[i] = 'skipped'
      return { ...state, phase: 'error', stepStatuses: statuses, error: action.error }
    }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

/** Read NDJSON stream, call onPartial for each line, return the last complete object */
async function callStep<T>(
  url: string,
  body: Record<string, unknown>,
  onPartial: (data: Partial<T>) => void,
): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Step failed (${res.status}): ${text.slice(0, 200)}`)
  }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let lastParsed: Partial<T> = {} as Partial<T>

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
        onPartial(parsed)
      } catch {
        // incomplete line, skip
      }
    }
  }

  if (buffer.trim()) {
    try {
      lastParsed = JSON.parse(buffer.trim())
      onPartial(lastParsed)
    } catch {
      // ignore
    }
  }

  return lastParsed as T
}

export function usePipeline() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const currentStepRef = useRef(0)

  const run = useCallback(async (rawJD: string, resume: ResumeData) => {
    dispatch({ type: 'START' })

    try {
      // Step 1: JD Parser
      currentStepRef.current = 0
      dispatch({ type: 'STEP_RUNNING', step: 0 })
      const t0 = Date.now()
      const parsedJD = await callStep<ParsedJD>(
        '/api/chain/parse-jd',
        { rawJD },
        (data) => dispatch({ type: 'STEP_PARTIAL', step: 0, data }),
      )
      dispatch({
        type: 'STEP_COMPLETE',
        step: 0,
        data: parsedJD,
        debug: {
          systemPrompt: JD_PARSER_SYSTEM,
          userInput: JD_PARSER_USER(rawJD),
          output: JSON.stringify(parsedJD, null, 2),
          durationMs: Date.now() - t0,
        },
      })

      // Step 2: Skill Matcher
      currentStepRef.current = 1
      dispatch({ type: 'STEP_RUNNING', step: 1 })
      const t1 = Date.now()
      const skillMatch = await callStep<SkillMatch>(
        '/api/chain/match-skills',
        { parsedJD, resume },
        (data) => dispatch({ type: 'STEP_PARTIAL', step: 1, data }),
      )
      dispatch({
        type: 'STEP_COMPLETE',
        step: 1,
        data: skillMatch,
        debug: {
          systemPrompt: SKILL_MATCHER_SYSTEM,
          userInput: SKILL_MATCHER_USER(
            JSON.stringify(parsedJD, null, 2),
            JSON.stringify(resume, null, 2),
          ),
          output: JSON.stringify(skillMatch, null, 2),
          durationMs: Date.now() - t1,
        },
      })

      // Step 3: Competitiveness Analyzer
      currentStepRef.current = 2
      dispatch({ type: 'STEP_RUNNING', step: 2 })
      const t2 = Date.now()
      const competitiveness = await callStep<CompetitivenessAnalysis>(
        '/api/chain/analyze',
        { parsedJD, skillMatch },
        (data) => dispatch({ type: 'STEP_PARTIAL', step: 2, data }),
      )
      dispatch({
        type: 'STEP_COMPLETE',
        step: 2,
        data: competitiveness,
        debug: {
          systemPrompt: COMPETITIVENESS_SYSTEM,
          userInput: COMPETITIVENESS_USER(
            JSON.stringify(parsedJD, null, 2),
            JSON.stringify(skillMatch, null, 2),
          ),
          output: JSON.stringify(competitiveness, null, 2),
          durationMs: Date.now() - t2,
        },
      })

      // Step 4: Strategy Generator
      currentStepRef.current = 3
      dispatch({ type: 'STEP_RUNNING', step: 3 })
      const t3 = Date.now()
      const strategy = await callStep<Strategy>(
        '/api/chain/strategize',
        { parsedJD, skillMatch, competitiveness },
        (data) => dispatch({ type: 'STEP_PARTIAL', step: 3, data }),
      )
      dispatch({
        type: 'STEP_COMPLETE',
        step: 3,
        data: strategy,
        debug: {
          systemPrompt: STRATEGY_SYSTEM,
          userInput: STRATEGY_USER(
            JSON.stringify(parsedJD, null, 2),
            JSON.stringify(skillMatch, null, 2),
            JSON.stringify(competitiveness, null, 2),
          ),
          output: JSON.stringify(strategy, null, 2),
          durationMs: Date.now() - t3,
        },
      })
    } catch (err) {
      dispatch({
        type: 'STEP_ERROR',
        step: currentStepRef.current,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }, [])

  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])

  return { state, run, reset }
}
