'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Target, BookOpen, MessageSquare, TrendingUp, Mail, Loader2, Code, Bug } from 'lucide-react'
import { DebugContent } from '@/components/DebugContent'
import type { Strategy, StepDebug } from '@/lib/schemas'
import 'react18-json-view/src/style.css'
import 'react18-json-view/src/dark.css'

const JsonView = dynamic(() => import('react18-json-view'), { ssr: false })

interface StrategyOutputProps {
  strategy: Strategy | Partial<Strategy> | null
  isStreaming: boolean
  debug?: StepDebug | null
}

const PRIORITY_COLORS = {
  high: 'bg-destructive/10 text-destructive border-destructive/20',
  medium: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
  low: 'bg-muted text-muted-foreground border-border',
}

export function StrategyOutput({ strategy, isStreaming, debug }: StrategyOutputProps) {
  const [showJson, setShowJson] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  if (!strategy) return null

  return (
    <div className="rounded-lg border border-primary/20 bg-card/80 overflow-hidden border-l-[3px] border-l-primary">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border/30">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Target className="h-3.5 w-3.5" />
        </div>
        <span className="text-sm font-semibold">Step 4</span>
        <span className="text-sm text-muted-foreground">求职策略</span>
        {isStreaming && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary ml-auto" />
        )}
      </div>

      {/* Body */}
      <div className="p-5 space-y-6 max-h-[700px] overflow-auto">
        {/* Resume Optimization */}
        {strategy.resumeOptimization && strategy.resumeOptimization.length > 0 && (
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
              <BookOpen className="h-4 w-4 text-chart-1" />
              简历优化建议
            </h3>
            <div className="space-y-2 pl-6">
              {strategy.resumeOptimization.map((item, i) => (
                <div key={i} className="rounded-md border border-border/30 bg-background/50 p-3">
                  <span className="text-sm font-medium">{item.action}</span>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {strategy.resumeOptimization && strategy.interviewPrep && <Separator className="opacity-50" />}

        {/* Interview Prep */}
        {strategy.interviewPrep && (
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
              <MessageSquare className="h-4 w-4 text-chart-2" />
              面试准备
            </h3>
            <div className="space-y-4 pl-6">
              {strategy.interviewPrep.technicalQuestions && strategy.interviewPrep.technicalQuestions.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">技术问题</span>
                  <ul className="mt-2 space-y-1.5">
                    {strategy.interviewPrep.technicalQuestions.map((q, i) => (
                      <li key={i} className="text-sm pl-3 border-l-2 border-chart-1/30 py-0.5">{q}</li>
                    ))}
                  </ul>
                </div>
              )}
              {strategy.interviewPrep.behavioralQuestions && strategy.interviewPrep.behavioralQuestions.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">行为问题</span>
                  <ul className="mt-2 space-y-1.5">
                    {strategy.interviewPrep.behavioralQuestions.map((q, i) => (
                      <li key={i} className="text-sm pl-3 border-l-2 border-chart-2/30 py-0.5">{q}</li>
                    ))}
                  </ul>
                </div>
              )}
              {strategy.interviewPrep.tips && strategy.interviewPrep.tips.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">技巧提示</span>
                  <ul className="mt-2 space-y-1">
                    {strategy.interviewPrep.tips.map((t, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary shrink-0">*</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {strategy.interviewPrep && strategy.coverLetterPoints && <Separator className="opacity-50" />}

        {/* Cover Letter */}
        {strategy.coverLetterPoints && strategy.coverLetterPoints.length > 0 && (
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
              <Mail className="h-4 w-4 text-chart-3" />
              Cover Letter 要点
            </h3>
            <ul className="space-y-1.5 pl-6">
              {strategy.coverLetterPoints.map((point, i) => (
                <li key={i} className="text-sm pl-3 border-l-2 border-chart-3/30 py-0.5">{point}</li>
              ))}
            </ul>
          </section>
        )}

        {strategy.coverLetterPoints && strategy.skillDevelopmentPlan && <Separator className="opacity-50" />}

        {/* Skill Development */}
        {strategy.skillDevelopmentPlan && strategy.skillDevelopmentPlan.length > 0 && (
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
              <TrendingUp className="h-4 w-4 text-chart-4" />
              技能补强计划
            </h3>
            <div className="space-y-2 pl-6">
              {strategy.skillDevelopmentPlan.map((item, i) => (
                <div key={i} className="flex items-start gap-3 rounded-md border border-border/30 bg-background/50 p-3">
                  <Badge
                    variant="outline"
                    className={PRIORITY_COLORS[item.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.medium}
                  >
                    {item.priority === 'high' ? '高优' : item.priority === 'medium' ? '中优' : '低优'}
                  </Badge>
                  <div className="min-w-0">
                    <span className="text-sm font-medium">{item.skill}</span>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{item.resource}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Action bar: JSON + Debug */}
      {!isStreaming && (
        <div className="flex gap-1.5 px-4 py-2 border-t border-border/30 bg-card/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowJson(!showJson)}
            className="text-xs h-7 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <Code className="h-3 w-3 mr-1" />
            {showJson ? '隐藏 JSON' : '查看 JSON'}
          </Button>
          {debug && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDebug(!showDebug)}
              className="text-xs h-7 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Bug className="h-3 w-3 mr-1" />
              {showDebug ? '隐藏 Debug' : 'Debug'}
            </Button>
          )}
        </div>
      )}

      {/* Raw JSON view */}
      {showJson && (
        <div className="border-t border-border/30 bg-background/50 px-4 py-3 max-h-[400px] overflow-auto">
          <JsonView
            src={strategy as Record<string, unknown>}
            theme="a11y"
            dark
            collapsed={2}
            enableClipboard={false}
            style={{ fontSize: '12px', background: 'transparent' }}
          />
        </div>
      )}

      {/* Debug panel */}
      {showDebug && debug && <DebugContent debug={debug} />}
    </div>
  )
}
