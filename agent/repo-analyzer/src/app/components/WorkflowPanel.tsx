/**
 * Workflow 控制面板
 *
 * 做什么：展示完整的仓库分析 workflow UI，包括 URL 输入、进度展示、审批和报告显示
 * 为什么：将 workflow 的所有 UI 渲染集中在一个组件中，
 *        状态管理逻辑委托给 useWorkflow hook，保持视图层简洁清晰
 */

'use client'

import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StepStatusBar } from './StepStatusBar'
import { RepoSummaryCard } from './RepoSummaryCard'
import { useWorkflow } from './useWorkflow'
import { StreamdownRenderer } from './StreamdownRenderer'
import type { WorkflowState } from '@/lib/conversation-store'

interface WorkflowPanelProps {
  /** 从持久化数据恢复的初始状态 */
  initialState?: WorkflowState | null
  /** 状态变化时的回调，父组件用此持久化数据 */
  onStateChange?: (state: WorkflowState) => void
}

export function WorkflowPanel({ initialState, onStateChange }: WorkflowPanelProps) {
  const {
    url, setUrl, phase, steps, repoInfo, report, error, loading,
    handleSubmit, handleApprove, handleCancel,
  } = useWorkflow({ initialState, onStateChange })

  return (
    <div className="h-full overflow-y-auto mx-auto max-w-4xl space-y-6 p-6">
      {/* URL 输入表单 */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="输入 GitHub 仓库地址，例如：owner/repo"
          className="flex-1 bg-input border-border focus-visible:ring-primary"
          disabled={phase === 'running' || phase === 'streaming'}
        />
        <Button
          type="submit"
          disabled={phase === 'running' || phase === 'streaming' || !url.trim()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_8px_var(--neon-cyan-glow)]"
        >
          <Search className="mr-2 h-4 w-4" />
          分析
        </Button>
      </form>

      {/* 步骤进度条 */}
      {phase !== 'idle' && <StepStatusBar steps={steps} />}

      {/* 错误提示 */}
      {phase === 'error' && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-4 text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      {/* 取消提示 */}
      {phase === 'cancelled' && (
        <Card className="border-border bg-secondary/50">
          <CardContent className="p-4 text-center text-muted-foreground">
            分析已取消
          </CardContent>
        </Card>
      )}

      {/* 审批卡片 */}
      {phase === 'suspended' && repoInfo && (
        <RepoSummaryCard
          repo={repoInfo}
          onApprove={handleApprove}
          onCancel={handleCancel}
          loading={loading}
        />
      )}

      {/* 报告展示 */}
      {(phase === 'streaming' || phase === 'done') && report && (
        <Card className="border-border/50 bg-card shadow-[0_0_20px_var(--neon-cyan-glow)]">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">分析报告</CardTitle>
          </CardHeader>
          <CardContent>
            <StreamdownRenderer
              content={report}
              isStreaming={phase === 'streaming'}
            />
            {phase === 'streaming' && (
              <div className="mt-2 animate-pulse text-sm text-primary">
                正在生成报告...
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
