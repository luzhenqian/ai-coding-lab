/**
 * 模式切换组件
 *
 * 做什么：在"自由对话"和"Workflow 分析"两种模式之间切换的 Tab 按钮
 * 为什么：让用户自由选择 Agent 交互方式，体验 Tool Calling 和 Workflow 两种 AI 开发模式
 */

'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

/** 应用的两种交互模式 */
export type AppMode = 'chat' | 'workflow'

interface ModeSwitcherProps {
  mode: AppMode
  onModeChange: (mode: AppMode) => void
}

export function ModeSwitcher({ mode, onModeChange }: ModeSwitcherProps) {
  return (
    <Tabs value={mode} onValueChange={(v) => onModeChange(v as AppMode)}>
      <TabsList className="bg-secondary/50 backdrop-blur-sm border border-border">
        <TabsTrigger
          value="chat"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_12px_var(--neon-cyan-glow)]"
        >
          自由对话
        </TabsTrigger>
        <TabsTrigger
          value="workflow"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_12px_var(--neon-cyan-glow)]"
        >
          Workflow 分析
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
