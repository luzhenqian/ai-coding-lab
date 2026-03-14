/**
 * Workflow 启动 API
 *
 * 做什么：接收 GitHub URL，启动仓库分析 workflow
 * 为什么：前端通过此接口触发整个分析流程，返回 runId 用于后续 resume 操作
 */

import { NextResponse } from 'next/server'
import { mastra } from '@/mastra'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { url } = body as { url: string }

    if (!url) {
      return NextResponse.json(
        { error: '请提供 GitHub 仓库地址' },
        { status: 400 }
      )
    }

    // 从 Mastra 实例获取已注册的 workflow
    const workflow = mastra.getWorkflow('analyze-repo')
    const run = await workflow.createRun()

    // 启动 workflow，第一步会解析 URL
    const result = await run.start({ inputData: { url } })

    return NextResponse.json({
      runId: run.runId,
      status: result.status,
      steps: result.steps,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : '启动分析流程时发生未知错误'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
