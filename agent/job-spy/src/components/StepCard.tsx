'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DebugContent } from '@/components/DebugContent'
import { cn } from '@/lib/utils'
import type { StepStatus, StepDebug } from '@/lib/schemas'

import 'react18-json-view/src/style.css'
import 'react18-json-view/src/dark.css'

const JsonView = dynamic(() => import('react18-json-view'), { ssr: false })
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Bug,
  FileSearch,
  GitCompare,
  TrendingUp,
  Target,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react'

interface StepCardProps {
  name: string
  status: StepStatus
  output: unknown
  partialOutput: unknown
  debug: StepDebug | null
  stepIndex: number
}

const STEP_ICONS = [FileSearch, GitCompare, TrendingUp, Target]

const STEP_COLORS = [
  { accent: 'border-l-chart-1', badge: 'bg-chart-1/10 text-chart-1' },
  { accent: 'border-l-chart-2', badge: 'bg-chart-2/10 text-chart-2' },
  { accent: 'border-l-chart-3', badge: 'bg-chart-3/10 text-chart-3' },
  { accent: 'border-l-chart-4', badge: 'bg-chart-4/10 text-chart-4' },
]

export function StepCard({ name, status, output, partialOutput, debug, stepIndex }: StepCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const displayData = output || partialOutput
  const StepIcon = STEP_ICONS[stepIndex]
  const colors = STEP_COLORS[stepIndex]

  if (status === 'pending' || status === 'skipped') return null

  return (
    <div
      className={cn(
        'rounded-lg border border-border/40 bg-card/80 overflow-hidden transition-all',
        'border-l-[3px]',
        colors.accent,
        status === 'running' && 'shadow-md shadow-primary/5',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-card">
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex h-7 w-7 items-center justify-center rounded-md',
            colors.badge,
          )}>
            <StepIcon className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="text-sm font-semibold">
              Step {stepIndex + 1}
            </span>
            <span className="text-sm text-muted-foreground ml-2">{name}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {debug && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
              <Clock className="h-3 w-3" />
              {(debug.durationMs / 1000).toFixed(1)}s
            </span>
          )}
          {status === 'running' && (
            <Badge variant="default" className="text-xs gap-1 h-6">
              <Loader2 className="h-3 w-3 animate-spin" />
              处理中
            </Badge>
          )}
          {status === 'complete' && (
            <Badge variant="outline" className="text-xs gap-1 h-6 text-success border-success/30">
              <Check className="h-3 w-3" />
              完成
            </Badge>
          )}
          {status === 'error' && (
            <Badge variant="destructive" className="text-xs gap-1 h-6">
              <AlertCircle className="h-3 w-3" />
              出错
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      {displayData != null && (
        <div className="border-t border-border/30">
          {/* JSON output */}
          <div
            className={cn(
              'overflow-auto bg-background/50 px-4 py-3 transition-all text-xs',
              expanded ? 'max-h-[600px]' : 'max-h-[180px]',
            )}
          >
            <JsonView
              src={displayData as Record<string, unknown>}
              theme="a11y"
              dark
              collapsed={!expanded ? 2 : false}
              enableClipboard={false}
              style={{ fontSize: '12px', background: 'transparent' }}
            />
          </div>

          {/* Action bar */}
          <div className="flex gap-1.5 px-4 py-2 bg-card/50 border-t border-border/20">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="text-xs h-7 px-2.5 text-muted-foreground hover:text-foreground"
            >
              {expanded ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
              {expanded ? '收起' : '展开全部'}
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
        </div>
      )}

      {/* Debug panel */}
      {showDebug && debug && <DebugContent debug={debug} />}
    </div>
  )
}
