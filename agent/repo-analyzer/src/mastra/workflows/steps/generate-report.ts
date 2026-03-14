/**
 * 报告生成步骤
 *
 * 做什么：使用 AI 模型分析仓库数据，生成结构化的中文 Markdown 分析报告
 * 为什么：这是 workflow 的核心价值步骤，将原始 GitHub 数据转化为有意义的分析，
 *        通过 Vercel AI SDK 的 generateText 调用 LLM 完成
 */

import { createStep } from '@mastra/core/workflows'
import { z } from 'zod'
import { generateText } from 'ai'
import { GitHubRepoSchema, RepoTreeSchema } from '@/lib/schemas'
import { registry, getModelId } from '@/lib/model'
import { getCurrentDateString } from '@/lib/date'

/** 步骤输入：经过审批的仓库信息和目录结构 */
const GenerateReportInputSchema = z.object({
  repoInfo: GitHubRepoSchema,
  repoTree: RepoTreeSchema,
})

/** 步骤输出：生成的 Markdown 报告 */
const GenerateReportOutputSchema = z.object({
  report: z.string(),
})

/** 系统提示词：定义 AI 分析师角色和输出格式 */
const SYSTEM_PROMPT = `当前日期：${getCurrentDateString()}。请基于此日期正确判断所有时间信息。

你是一个专业的 GitHub 仓库分析师。请根据提供的仓库信息和目录结构，
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

export const generateReportStep = createStep({
  id: 'generate-report',
  inputSchema: GenerateReportInputSchema,
  outputSchema: GenerateReportOutputSchema,
  execute: async ({ inputData }) => {
    // 将仓库数据序列化为 JSON 作为 prompt 上下文
    const prompt = `请分析以下 GitHub 仓库：

仓库信息：
${JSON.stringify(inputData.repoInfo, null, 2)}

目录结构：
${JSON.stringify(inputData.repoTree, null, 2)}`

    // 调用 AI 模型生成分析报告
    // 类型断言：getModelId() 返回 "provider:model" 格式，符合 registry 要求
    const modelId = getModelId() as Parameters<typeof registry.languageModel>[0]
    const { text } = await generateText({
      model: registry.languageModel(modelId),
      system: SYSTEM_PROMPT,
      prompt,
    })

    return { report: text }
  },
})
