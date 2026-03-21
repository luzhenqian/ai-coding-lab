'use client'

import { useState, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { JDInput } from '@/components/JDInput'
import { ResumePanel } from '@/components/ResumePanel'
import { PipelineView } from '@/components/PipelineView'
import { StepCard } from '@/components/StepCard'
import { StrategyOutput } from '@/components/StrategyOutput'
import { ComparisonPage } from '@/components/ComparisonPage'
import { usePipeline, STEP_NAMES } from '@/hooks/usePipeline'
import { useSinglePrompt } from '@/hooks/useSinglePrompt'
import { useComparison } from '@/hooks/useComparison'
import { saveAnalysis } from '@/lib/store'
import type { ResumeData, PipelineOutputs, CombinedAnalysis } from '@/lib/schemas'
import { Sparkles, RotateCcw, Link2, GitCompareArrows } from 'lucide-react'
import { cn } from '@/lib/utils'

type AppMode = 'chain' | 'compare'

export default function Home() {
  const [jdText, setJdText] = useState('')
  const [resume, setResume] = useState<ResumeData | null>(null)
  const [mode, setMode] = useState<AppMode>('chain')
  const { state, run, reset } = usePipeline()
  const { state: singleState, run: runSingle, reset: resetSingle } = useSinglePrompt()
  const { state: comparisonState, run: runComparison, reset: resetComparison } = useComparison()

  const handleRun = useCallback(() => {
    if (!jdText.trim() || !resume) return
    if (mode === 'compare') {
      // Run both in parallel
      run(jdText, resume)
      runSingle(jdText, resume)
    } else {
      run(jdText, resume)
    }
  }, [jdText, resume, run, runSingle, mode])

  const handleReset = useCallback(() => {
    reset()
    resetSingle()
    resetComparison()
  }, [reset, resetSingle, resetComparison])

  const handleRunComparison = useCallback((
    chainOutputs: PipelineOutputs,
    singleOutputs: CombinedAnalysis,
    rawJD: string,
    resumeStr: string,
  ) => {
    runComparison(chainOutputs, singleOutputs, rawJD, resumeStr)
  }, [runComparison])

  // Save to history when pipeline completes
  const isComplete = state.phase === 'done'
  const prevComplete = useState(false)
  if (isComplete && !prevComplete[0] && resume && state.outputs.parsedJD) {
    prevComplete[0] = true
    saveAnalysis({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      jobTitle: state.outputs.parsedJD.jobTitle,
      company: state.outputs.parsedJD.company,
      rawJD: jdText,
      outputs: state.outputs,
      resumeSnapshot: resume,
    })
  }
  if (!isComplete && prevComplete[0]) {
    prevComplete[0] = false
  }

  const noResume = !resume || !resume.name || resume.skills.length === 0
  const isRunning = state.phase === 'running' || singleState.phase === 'running'
  const isIdle = state.phase === 'idle' && singleState.phase === 'idle'
  const hasStarted = !isIdle

  const outputKeys = ['parsedJD', 'skillMatch', 'competitiveness', 'strategy'] as const

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <h1 className="text-base font-bold tracking-tight">JobSpy</h1>
            </div>

            {/* Mode switcher */}
            <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/30 p-0.5">
              <button
                onClick={() => { if (!isRunning) setMode('chain') }}
                disabled={isRunning}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                  mode === 'chain'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                  isRunning && 'opacity-50 cursor-not-allowed',
                )}
              >
                <Link2 className="h-3 w-3" />
                链式模式
              </button>
              <button
                onClick={() => { if (!isRunning) setMode('compare') }}
                disabled={isRunning}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                  mode === 'compare'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                  isRunning && 'opacity-50 cursor-not-allowed',
                )}
              >
                <GitCompareArrows className="h-3 w-3" />
                对比模式
              </button>
            </div>

            <div className="flex items-center gap-3">
              {hasStarted && (
                <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 text-xs">
                  <RotateCcw className="h-3 w-3" />
                  重置
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className={cn(
        'mx-auto px-6 py-6',
        mode === 'compare' ? 'max-w-[1400px]' : 'max-w-7xl',
      )}>
        <div className={cn(
          'grid gap-6',
          mode === 'compare' ? 'lg:grid-cols-[340px_1fr]' : 'lg:grid-cols-[380px_1fr]',
        )}>
          {/* Left Panel: Input */}
          <div className="space-y-4 lg:sticky lg:top-[60px] lg:self-start lg:max-h-[calc(100vh-84px)] lg:overflow-auto">
            <Tabs defaultValue="jd">
              <TabsList className="w-full">
                <TabsTrigger value="jd" className="flex-1">岗位描述</TabsTrigger>
                <TabsTrigger value="resume" className="flex-1">
                  我的简历
                  {noResume && <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-warning inline-block" />}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="jd" className="mt-3">
                <JDInput
                  value={jdText}
                  onChange={setJdText}
                  onRun={handleRun}
                  isRunning={isRunning}
                  disabled={noResume}
                />
                {noResume && (
                  <p className="mt-2 text-xs text-warning">
                    请先填写并保存简历信息
                  </p>
                )}
              </TabsContent>
              <TabsContent value="resume" className="mt-3">
                <ResumePanel resume={resume} onResumeChange={setResume} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel: Results */}
          <div className="min-w-0">
            {isIdle ? (
              <div className="flex h-[500px] items-center justify-center rounded-xl border border-dashed border-border/40 bg-card/30">
                <div className="text-center px-6">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50">
                    <Sparkles className="h-7 w-7 text-muted-foreground/30" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-muted-foreground">
                    粘贴岗位描述，开始 AI 分析
                  </p>
                  <p className="mt-1.5 text-xs text-muted-foreground/50">
                    {mode === 'compare'
                      ? '对比模式：并行执行链式和单提示词分析，AI 评估差异'
                      : '四步链式处理：JD 解析 → 技能匹配 → 竞争力分析 → 求职策略'}
                  </p>
                </div>
              </div>
            ) : mode === 'compare' ? (
              <ComparisonPage
                chainState={state}
                singleState={singleState}
                comparisonState={comparisonState}
                onRunComparison={handleRunComparison}
                rawJD={jdText}
                resume={resume}
              />
            ) : (
              <div className="space-y-5">
                {/* Pipeline Status Bar */}
                <PipelineView state={state} />

                {/* Error display */}
                {state.error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                    <p className="text-sm text-destructive">{state.error}</p>
                  </div>
                )}

                {/* Step Cards (Steps 1-3) */}
                {STEP_NAMES.slice(0, 3).map((name, i) => (
                  <StepCard
                    key={name}
                    name={name}
                    status={state.stepStatuses[i]}
                    output={state.outputs[outputKeys[i]]}
                    partialOutput={state.partialOutputs[outputKeys[i]]}
                    debug={state.debug[i]}
                    stepIndex={i}
                  />
                ))}

                {/* Strategy Output (Step 4) */}
                {(state.stepStatuses[3] === 'running' || state.stepStatuses[3] === 'complete') && (
                  <StrategyOutput
                    strategy={state.outputs.strategy || state.partialOutputs.strategy}
                    isStreaming={state.stepStatuses[3] === 'running'}
                    debug={state.debug[3]}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
