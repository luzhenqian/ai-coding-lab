'use client'

import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { ComparisonState } from '@/hooks/useComparison'
import type { ComparisonDimension } from '@/lib/schemas'
import {
  BarChart3,
  Loader2,
  Trophy,
  Link2,
  Zap,
  ArrowRight,
  Check,
} from 'lucide-react'

interface ComparisonResultProps {
  state: ComparisonState
  chainDurationMs: number
  singleDurationMs: number
}

const WINNER_LABELS = {
  chain: '链式模式',
  single: '单提示词',
  tie: '平局',
}

const WINNER_COLORS = {
  chain: 'text-chart-1',
  single: 'text-chart-2',
  tie: 'text-muted-foreground',
}

function ScoreBar({ name, chainScore, singleScore, winner, analysis }: ComparisonDimension) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{name}</span>
        <Badge
          variant="outline"
          className={cn('text-xs', WINNER_COLORS[winner])}
        >
          {WINNER_LABELS[winner]}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Link2 className="h-3 w-3" />
              链式
            </span>
            <span className="tabular-nums font-medium">{chainScore}/10</span>
          </div>
          <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-chart-1 transition-all duration-500"
              style={{ width: `${chainScore * 10}%` }}
            />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              单次
            </span>
            <span className="tabular-nums font-medium">{singleScore}/10</span>
          </div>
          <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-chart-2 transition-all duration-500"
              style={{ width: `${singleScore * 10}%` }}
            />
          </div>
        </div>
      </div>
      {analysis && (
        <p className="text-xs text-muted-foreground leading-relaxed">{analysis}</p>
      )}
    </div>
  )
}

export function ComparisonResultView({ state, chainDurationMs, singleDurationMs }: ComparisonResultProps) {
  const data = state.result || state.partialResult
  const isRunning = state.phase === 'running'

  if (!data && !isRunning) return null

  return (
    <div className="rounded-xl border border-primary/20 bg-card/80 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-card border-b border-border/30">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <BarChart3 className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">AI 对比分析</h3>
          <p className="text-xs text-muted-foreground">多维度评估两种模式的输出质量</p>
        </div>
        {isRunning && (
          <Loader2 className="h-4 w-4 animate-spin text-primary ml-auto" />
        )}
        {state.phase === 'done' && data?.overallWinner && (
          <div className="ml-auto flex items-center gap-2">
            <Trophy className="h-4 w-4 text-chart-4" />
            <span className={cn('text-sm font-semibold', WINNER_COLORS[data.overallWinner])}>
              {WINNER_LABELS[data.overallWinner]}胜出
            </span>
          </div>
        )}
      </div>

      <div className="p-5 space-y-6 max-h-[700px] overflow-auto">
        {/* Time comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-border/30 bg-background/50 p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Link2 className="h-3 w-3" />
              链式模式耗时
            </div>
            <div className="text-lg font-bold tabular-nums">
              {(chainDurationMs / 1000).toFixed(1)}s
            </div>
          </div>
          <div className="rounded-lg border border-border/30 bg-background/50 p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Zap className="h-3 w-3" />
              单提示词耗时
            </div>
            <div className="text-lg font-bold tabular-nums">
              {(singleDurationMs / 1000).toFixed(1)}s
            </div>
          </div>
        </div>

        {/* Dimension scores */}
        {data?.dimensions && data.dimensions.length > 0 && (
          <section>
            <h4 className="text-sm font-semibold mb-4">维度评分</h4>
            <div className="space-y-5">
              {data.dimensions.map((dim, i) => (
                <ScoreBar key={i} {...dim} />
              ))}
            </div>
          </section>
        )}

        {data?.dimensions && data.consistencyAnalysis && <Separator className="opacity-50" />}

        {/* Consistency */}
        {data?.consistencyAnalysis && (
          <section>
            <h4 className="text-sm font-semibold mb-2">一致性分析</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {data.consistencyAnalysis}
            </p>
          </section>
        )}

        {/* Advantages */}
        {(data?.chainAdvantages || data?.singleAdvantages) && (
          <>
            <Separator className="opacity-50" />
            <div className="grid grid-cols-2 gap-4">
              {data?.chainAdvantages && data.chainAdvantages.length > 0 && (
                <section>
                  <h4 className="flex items-center gap-1.5 text-sm font-semibold mb-2">
                    <Link2 className="h-3.5 w-3.5 text-chart-1" />
                    链式模式优势
                  </h4>
                  <ul className="space-y-1.5">
                    {data.chainAdvantages.map((adv, i) => (
                      <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                        <Check className="h-3 w-3 shrink-0 mt-0.5 text-chart-1" />
                        {adv}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {data?.singleAdvantages && data.singleAdvantages.length > 0 && (
                <section>
                  <h4 className="flex items-center gap-1.5 text-sm font-semibold mb-2">
                    <Zap className="h-3.5 w-3.5 text-chart-2" />
                    单提示词优势
                  </h4>
                  <ul className="space-y-1.5">
                    {data.singleAdvantages.map((adv, i) => (
                      <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                        <Check className="h-3 w-3 shrink-0 mt-0.5 text-chart-2" />
                        {adv}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </>
        )}

        {/* Recommendation */}
        {data?.recommendation && (
          <>
            <Separator className="opacity-50" />
            <section>
              <h4 className="flex items-center gap-1.5 text-sm font-semibold mb-2">
                <ArrowRight className="h-3.5 w-3.5 text-primary" />
                综合建议
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {data.recommendation}
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
