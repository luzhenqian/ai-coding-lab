/**
 * Workflow 恢复 API
 *
 * 做什么：恢复处于 suspended 状态的 workflow，传递用户的审批决定
 * 为什么：HITL 审批后需要通知 workflow 继续执行或取消，
 *        通过 runId 找到挂起的 workflow 实例并 resume
 */

import { NextResponse } from 'next/server'
import { mastra } from '@/mastra'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { runId, approved } = body as { runId: string; approved: boolean }

    if (!runId) {
      return NextResponse.json(
        { error: '缺少 runId 参数' },
        { status: 400 }
      )
    }

    if (typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: '缺少 approved 参数' },
        { status: 400 }
      )
    }

    const workflow = mastra.getWorkflow('analyze-repo')
    const run = await workflow.createRun({ runId })

    // 恢复 human-approval 步骤，传递用户决定
    await run.resume({
      step: 'human-approval',
      resumeData: { approved },
    })

    if (!approved) {
      return NextResponse.json({
        runId,
        status: 'cancelled',
        message: '分析已取消',
      })
    }

    return NextResponse.json({
      runId,
      status: 'resumed',
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : '恢复分析流程时发生未知错误'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
