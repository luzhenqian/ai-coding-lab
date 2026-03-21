'use client'

import { StepCard } from '@/components/StepCard'
import { StrategyOutput } from '@/components/StrategyOutput'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DebugContent } from '@/components/DebugContent'
import { cn } from '@/lib/utils'
import type { SinglePromptState } from '@/hooks/useSinglePrompt'
import type { PipelineOutputs, StepStatus } from '@/lib/schemas'
import { Loader2, Check, AlertCircle, Zap, Bug, Clock } from 'lucide-react'
import { useState } from 'react'

interface SinglePromptViewProps {
  state: SinglePromptState
}

const STEP_NAMES = ['JD 解析', '技能匹配', '竞争力分析', '求职策略'] as const
const OUTPUT_KEYS = ['parsedJD', 'skillMatch', 'competitiveness', 'strategy'] as const

export function SinglePromptView({ state }: SinglePromptViewProps) {
  const [showDebug, setShowDebug] = useState(false)
  const data = state.output || state.partialOutput
  const isRunning = state.phase === 'running'
  const isDone = state.phase === 'done'

  return (
    <div className="space-y-5">
      {/* Status indicator */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all',
              isDone && 'bg-success text-success-foreground',
              isRunning && 'bg-primary text-primary-foreground',
              state.phase === 'error' && 'bg-destructive text-white',
              state.phase === 'idle' && 'bg-muted text-muted-foreground',
            )}>
              {isDone ? (
                <Check className="h-4 w-4" />
              ) : isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : state.phase === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
            </div>
            <div>
              <div className="text-sm font-medium">
                单提示词模式
              </div>
              <div className="text-xs text-muted-foreground">
                一次性生成全部分析
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {state.debug && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                <Clock className="h-3 w-3" />
                {(state.debug.durationMs / 1000).toFixed(1)}s
              </span>
            )}
            {isRunning && (
              <Badge variant="default" className="text-xs gap-1 h-6">
                <Loader2 className="h-3 w-3 animate-spin" />
                生成中
              </Badge>
            )}
            {isDone && (
              <Badge variant="outline" className="text-xs gap-1 h-6 text-success border-success/30">
                <Check className="h-3 w-3" />
                完成
              </Badge>
            )}
            {state.debug && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDebug(!showDebug)}
                className="text-xs h-7 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <Bug className="h-3 w-3 mr-1" />
                {showDebug ? '隐藏' : 'Debug'}
              </Button>
            )}
          </div>
        </div>
        {showDebug && state.debug && (
          <div className="mt-3">
            <DebugContent debug={state.debug} />
          </div>
        )}
      </div>

      {/* Error */}
      {state.error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{state.error}</p>
        </div>
      )}

      {/* Step cards - reuse existing components with extracted data */}
      {data && STEP_NAMES.slice(0, 3).map((name, i) => {
        const key = OUTPUT_KEYS[i]
        const output = state.output ? (state.output as unknown as Record<string, unknown>)[key] : null
        const partialOutput = state.partialOutput ? (state.partialOutput as unknown as Record<string, unknown>)[key] : null
        const hasData = output || partialOutput
        if (!hasData && !isRunning) return null

        const stepStatus: StepStatus = output ? 'complete' : (partialOutput || isRunning) ? 'running' : 'pending'

        return (
          <StepCard
            key={name}
            name={name}
            status={stepStatus}
            output={output}
            partialOutput={partialOutput}
            debug={null}
            stepIndex={i}
          />
        )
      })}

      {/* Strategy output */}
      {data && (data as Partial<PipelineOutputs>).strategy && (
        <StrategyOutput
          strategy={(data as Partial<PipelineOutputs>).strategy!}
          isStreaming={isRunning}
        />
      )}
    </div>
  )
}
