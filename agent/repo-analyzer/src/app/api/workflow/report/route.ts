/**
 * 报告流式生成 API
 *
 * 做什么：接收仓库数据，使用 AI 模型流式生成中文分析报告
 * 为什么：报告生成耗时较长，流式传输可以让用户逐步看到内容，
 *        提升体验感。独立于 workflow 步骤，方便前端直接消费流
 */

import { streamText } from 'ai'
import { registry, getModelId } from '@/lib/model'
import type { GitHubRepo, RepoTree } from '@/lib/schemas'

/** 系统提示词：定义分析师角色和报告结构 */
const SYSTEM_PROMPT = `你是一个专业的 GitHub 仓库分析师。请根据提供的仓库信息和目录结构，
生成一份结构化的中文 Markdown 分析报告。报告应包含以下部分：

## 仓库概述
简要介绍仓库的用途、作者和基本情况。

## 技术栈分析
根据语言、目录结构和文件推断使用的技术栈和框架。

## 项目结构解读
分析目录结构，说明代码组织方式和各模块的职责。

## 综合评价
从代码组织、活跃度、文档完善度等维度给出综合评价。

请用清晰的中文撰写，语气专业但不生硬。`

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { repoInfo, repoTree } = body as {
      repoInfo: GitHubRepo
      repoTree: RepoTree
    }

    if (!repoInfo || !repoTree) {
      return new Response(
        JSON.stringify({ error: '缺少仓库数据' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const prompt = `请分析以下 GitHub 仓库：

仓库信息：
${JSON.stringify(repoInfo, null, 2)}

目录结构：
${JSON.stringify(repoTree, null, 2)}`

    // 使用 streamText 流式生成报告，前端可逐步展示
    // 类型断言：getModelId() 返回 "provider:model" 格式，符合 registry 要求
    const modelId = getModelId() as Parameters<typeof registry.languageModel>[0]
    const result = streamText({
      model: registry.languageModel(modelId),
      system: SYSTEM_PROMPT,
      prompt,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    const message =
      error instanceof Error ? error.message : '生成报告时发生未知错误'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
