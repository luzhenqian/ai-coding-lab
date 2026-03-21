'use client'

import { useCallback } from 'react'
import { PipelineView } from '@/components/PipelineView'
import { StepCard } from '@/components/StepCard'
import { StrategyOutput } from '@/components/StrategyOutput'
import { SinglePromptView } from '@/components/SinglePromptView'
import { ComparisonResultView } from '@/components/ComparisonResult'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { STEP_NAMES, type PipelineState } from '@/hooks/usePipeline'
import type { SinglePromptState } from '@/hooks/useSinglePrompt'
import type { ComparisonState } from '@/hooks/useComparison'
import type { PipelineOutputs, CombinedAnalysis, ResumeData } from '@/lib/schemas'
import { BarChart3, Loader2, Link2, Zap } from 'lucide-react'

interface ComparisonPageProps {
  chainState: PipelineState
  singleState: SinglePromptState
  comparisonState: ComparisonState
  onRunComparison: (
    chainOutputs: PipelineOutputs,
    singleOutputs: CombinedAnalysis,
    rawJD: string,
    resume: string,
  ) => void
  rawJD: string
  resume: ResumeData | null
}

const OUTPUT_KEYS = ['parsedJD', 'skillMatch', 'competitiveness', 'strategy'] as const

export function ComparisonPage({
  chainState,
  singleState,
  comparisonState,
  onRunComparison,
  rawJD,
  resume,
}: ComparisonPageProps) {
  const chainDone = chainState.phase === 'done'
  const singleDone = singleState.phase === 'done'
  const bothDone = chainDone && singleDone

  const handleCompare = useCallback(() => {
    if (!bothDone || !resume) return
    onRunComparison(
      chainState.outputs,
      singleState.output!,
      rawJD,
      JSON.stringify(resume, null, 2),
    )
  }, [bothDone, chainState.outputs, singleState.output, rawJD, resume, onRunComparison])

  // Calculate durations
  const chainDuration = chainState.debug.reduce((sum, d) => sum + (d?.durationMs || 0), 0)
  const singleDuration = singleState.debug?.durationMs || 0

  return (
    <div className="space-y-6">
      {/* Side-by-side results */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Chain mode */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Link2 className="h-4 w-4 text-chart-1" />
            <h2 className="text-sm font-semibold">链式模式</h2>
            <Badge variant="outline" className="text-xs">4 步</Badge>
            {chainDone && chainDuration > 0 && (
              <span className="text-xs text-muted-foreground ml-auto tabular-nums">
                总耗时 {(chainDuration / 1000).toFixed(1)}s
              </span>
            )}
          </div>

          {chainState.phase === 'idle' ? (
            <div className="flex h-[200px] items-center justify-center rounded-xl border border-dashed border-border/40 bg-card/30">
              <p className="text-xs text-muted-foreground">等待开始分析...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <PipelineView state={chainState} />
              {chainState.error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                  <p className="text-sm text-destructive">{chainState.error}</p>
                </div>
              )}
              {STEP_NAMES.slice(0, 3).map((name, i) => (
                <StepCard
                  key={name}
                  name={name}
                  status={chainState.stepStatuses[i]}
                  output={chainState.outputs[OUTPUT_KEYS[i]]}
                  partialOutput={chainState.partialOutputs[OUTPUT_KEYS[i]]}
                  debug={chainState.debug[i]}
                  stepIndex={i}
                />
              ))}
              {(chainState.stepStatuses[3] === 'running' || chainState.stepStatuses[3] === 'complete') && (
                <StrategyOutput
                  strategy={chainState.outputs.strategy || chainState.partialOutputs.strategy}
                  isStreaming={chainState.stepStatuses[3] === 'running'}
                  debug={chainState.debug[3]}
                />
              )}
            </div>
          )}
        </div>

        {/* Right: Single prompt mode */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Zap className="h-4 w-4 text-chart-2" />
            <h2 className="text-sm font-semibold">单提示词模式</h2>
            <Badge variant="outline" className="text-xs">1 步</Badge>
            {singleDone && singleDuration > 0 && (
              <span className="text-xs text-muted-foreground ml-auto tabular-nums">
                总耗时 {(singleDuration / 1000).toFixed(1)}s
              </span>
            )}
          </div>

          {singleState.phase === 'idle' ? (
            <div className="flex h-[200px] items-center justify-center rounded-xl border border-dashed border-border/40 bg-card/30">
              <p className="text-xs text-muted-foreground">等待开始分析...</p>
            </div>
          ) : (
            <SinglePromptView state={singleState} />
          )}
        </div>
      </div>

      {/* Comparison section */}
      {bothDone && comparisonState.phase === 'idle' && (
        <div className="flex justify-center py-4">
          <Button onClick={handleCompare} size="lg" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            AI 对比分析
          </Button>
        </div>
      )}

      {comparisonState.phase !== 'idle' && (
        <ComparisonResultView
          state={comparisonState}
          chainDurationMs={chainDuration}
          singleDurationMs={singleDuration}
        />
      )}
    </div>
  )
}
