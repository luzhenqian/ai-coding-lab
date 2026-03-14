/**
 * Streamdown Markdown 渲染器
 *
 * 做什么：封装 Streamdown 组件，提供统一的流式 Markdown 渲染能力
 * 为什么：ChatPanel 和 WorkflowPanel 都需要渲染 AI 生成的 Markdown，
 *        将 Streamdown 的插件配置集中管理，避免两处重复配置
 */

'use client'

import { Streamdown } from 'streamdown'
import { code } from '@streamdown/code'
import { cjk } from '@streamdown/cjk'

/** Streamdown 插件配置 —— 代码高亮 + CJK 中文支持 */
const plugins = { code, cjk }

interface StreamdownRendererProps {
  content: string
  isStreaming: boolean
}

export function StreamdownRenderer({ content, isStreaming }: StreamdownRendererProps) {
  return (
    <div className="dark:prose-invert max-w-none [&_pre]:bg-secondary [&_pre]:border [&_pre]:border-border [&_code]:text-neon-cyan">
      <Streamdown plugins={plugins} isAnimating={isStreaming}>
        {content}
      </Streamdown>
    </div>
  )
}
