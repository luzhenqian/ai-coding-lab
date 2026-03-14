/**
 * 工具调用状态徽章组件
 *
 * 做什么：根据工具调用的不同状态显示对应的中文标签和颜色
 * 为什么：AI SDK v5 的 tool part 有多种状态，用户需要直观了解 Agent 正在执行什么工具
 */

'use client'

import { Wrench } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/** 工具调用的四种状态 */
type ToolState =
  | 'input-streaming'
  | 'input-available'
  | 'output-available'
  | 'output-error'

interface ToolStatusBadgeProps {
  toolName: string
  state: ToolState
}

const stateConfig: Record<ToolState, { label: string; className: string }> = {
  'input-streaming': {
    label: '准备中...',
    className: 'border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan shadow-[0_0_8px_var(--neon-cyan-glow)]',
  },
  'input-available': {
    label: '调用中...',
    className: 'border-warning/40 bg-warning/10 text-warning shadow-[0_0_8px_oklch(0.80_0.16_85/30%)]',
  },
  'output-available': {
    label: '已完成',
    className: 'border-neon-green/40 bg-neon-green/10 text-neon-green shadow-[0_0_8px_var(--neon-green-glow)]',
  },
  'output-error': {
    label: '出错',
    className: 'border-destructive/40 bg-destructive/10 text-destructive shadow-[0_0_8px_oklch(0.65_0.2_25/30%)]',
  },
}

function getToolDisplayName(toolName: string): string {
  const nameMap: Record<string, string> = {
    getRepoInfo: '获取仓库信息',
    getRepoTree: '获取目录结构',
  }
  return nameMap[toolName] ?? toolName
}

export function ToolStatusBadge({ toolName, state }: ToolStatusBadgeProps) {
  const config = stateConfig[state]
  const displayName = getToolDisplayName(toolName)

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all duration-300',
        config.className,
      )}
    >
      <Wrench className="h-3 w-3" />
      <span>{displayName}</span>
      <span>{config.label}</span>
    </Badge>
  )
}
