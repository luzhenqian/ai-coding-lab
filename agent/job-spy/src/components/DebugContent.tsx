'use client'

import ReactMarkdown from 'react-markdown'
import type { StepDebug } from '@/lib/schemas'

interface DebugContentProps {
  debug: StepDebug
}

export function DebugContent({ debug }: DebugContentProps) {
  return (
    <div className="border-t border-border/30 bg-background/30 px-4 py-3 space-y-3">
      <div>
        <div className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
          System Prompt
        </div>
        <div className="max-h-[200px] overflow-auto rounded-md bg-muted/30 p-3 border border-border/20 prose-debug">
          <ReactMarkdown>{debug.systemPrompt}</ReactMarkdown>
        </div>
      </div>
      <div>
        <div className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
          User Input
        </div>
        <div className="max-h-[200px] overflow-auto rounded-md bg-muted/30 p-3 border border-border/20 prose-debug">
          <ReactMarkdown>{debug.userInput}</ReactMarkdown>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
        <span>耗时: <strong>{(debug.durationMs / 1000).toFixed(1)}s</strong></span>
      </div>
    </div>
  )
}
