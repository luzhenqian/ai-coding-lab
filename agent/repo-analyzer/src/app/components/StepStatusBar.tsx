/**
 * 步骤状态进度条组件
 *
 * 做什么：以水平进度条形式展示 workflow 四个步骤的执行状态
 * 为什么：让用户直观了解当前分析进度，哪些步骤已完成、正在执行或等待中
 */

'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export type StepStatus =
  | 'waiting'
  | 'running'
  | 'success'
  | 'suspended'
  | 'failed'
  | 'cancelled'

export interface StepInfo {
  id: string
  label: string
  status: StepStatus
}

interface StepStatusBarProps {
  steps: StepInfo[]
}

const STATUS_STYLES: Record<StepStatus, { circle: string; text: string; line: string }> = {
  waiting: {
    circle: 'bg-secondary border-border text-muted-foreground',
    text: 'text-muted-foreground',
    line: 'bg-border',
  },
  running: {
    circle: 'bg-primary/20 border-primary text-primary shadow-[0_0_12px_var(--neon-cyan-glow)] animate-pulse',
    text: 'text-primary',
    line: 'bg-primary/30',
  },
  success: {
    circle: 'bg-neon-green/20 border-neon-green text-neon-green shadow-[0_0_8px_var(--neon-green-glow)]',
    text: 'text-neon-green',
    line: 'bg-neon-green/50',
  },
  suspended: {
    circle: 'bg-warning/20 border-warning text-warning shadow-[0_0_8px_oklch(0.80_0.16_85/30%)]',
    text: 'text-warning',
    line: 'bg-warning/30',
  },
  failed: {
    circle: 'bg-destructive/20 border-destructive text-destructive shadow-[0_0_8px_oklch(0.65_0.2_25/30%)]',
    text: 'text-destructive',
    line: 'bg-destructive/30',
  },
  cancelled: {
    circle: 'bg-secondary border-border text-muted-foreground',
    text: 'text-muted-foreground',
    line: 'bg-border',
  },
}

const STATUS_LABELS: Record<StepStatus, string> = {
  waiting: '等待中',
  running: '执行中',
  success: '已完成',
  suspended: '等待审批',
  failed: '失败',
  cancelled: '已取消',
}

export function StepStatusBar({ steps }: StepStatusBarProps) {
  return (
    <div className="flex items-center gap-2 w-full py-4">
      {steps.map((step, index) => {
        const style = STATUS_STYLES[step.status]
        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <motion.div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all duration-500',
                  style.circle,
                )}
                animate={step.status === 'running' ? {
                  boxShadow: [
                    '0 0 4px var(--neon-cyan-glow)',
                    '0 0 16px var(--neon-cyan-glow)',
                    '0 0 4px var(--neon-cyan-glow)',
                  ],
                } : {}}
                transition={step.status === 'running' ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
              >
                {index + 1}
              </motion.div>
              <span className={cn('text-xs mt-1 whitespace-nowrap transition-colors duration-300', style.text)}>
                {step.label}
              </span>
              <span className={cn('text-xs whitespace-nowrap opacity-70 transition-colors duration-300', style.text)}>
                {STATUS_LABELS[step.status]}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={cn('h-0.5 w-full mx-1 transition-colors duration-500', style.line)} />
            )}
          </div>
        )
      })}
    </div>
  )
}
