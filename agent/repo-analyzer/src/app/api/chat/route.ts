/**
 * Chat API 路由
 *
 * 做什么：接收前端 useChat 发送的消息，通过 Mastra Agent 处理并返回流式响应
 * 为什么：AI SDK v5 的 useChat 需要一个兼容的流式 API 端点，
 *        handleChatStream 负责将 Agent 执行结果转换为 AI SDK 兼容的流格式
 */

import { handleChatStream } from '@mastra/ai-sdk'
import { type UIMessageChunk, createUIMessageStreamResponse } from 'ai'
import { mastra } from '@/mastra'

/** 允许流式响应最多持续 60 秒（Vercel 部署时需要） */
export const maxDuration = 60

/**
 * POST /api/chat
 *
 * 接收 AI SDK useChat 发送的消息列表，
 * 交给 repo-analyzer Agent 处理，返回流式 UI 消息响应
 */
export async function POST(req: Request) {
  try {
    const params = await req.json()

    /** 使用 Mastra 的 handleChatStream 将 Agent 输出转为 AI SDK 流格式 */
    const stream = await handleChatStream({
      mastra,
      agentId: 'repo-analyzer',
      params,
    })

    /**
     * 将流包装为符合 AI SDK v5 UIMessage 协议的 Response
     * 类型断言：Mastra 返回的流与 AI SDK 的 UIMessageChunk 在运行时兼容，
     * 但由于两个包的 FinishReason 枚举定义略有差异，需要显式断言
     */
    return createUIMessageStreamResponse({
      stream: stream as ReadableStream<UIMessageChunk>,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '处理对话请求时发生错误'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
