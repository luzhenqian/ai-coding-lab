/**
 * 人工审批步骤 (HITL - Human-in-the-Loop)
 *
 * 做什么：在生成报告前暂停 workflow，展示仓库摘要让用户决定是否继续
 * 为什么：AI 生成报告消耗 token 和时间，让用户先确认目标仓库正确，
 *        避免浪费资源分析错误的仓库。这也是 Mastra suspend/resume 的核心教学点
 */

import { createStep } from '@mastra/core/workflows'
import { z } from 'zod'
import { GitHubRepoSchema, RepoTreeSchema } from '@/lib/schemas'

/** 步骤输入：包含仓库信息和目录结构 */
const HumanApprovalInputSchema = z.object({
  repoInfo: GitHubRepoSchema,
  repoTree: RepoTreeSchema,
})

/** suspend 时发送给前端的数据：仓库摘要 */
const SuspendPayloadSchema = z.object({
  summary: GitHubRepoSchema,
})

/** resume 时前端发送的数据：用户是否批准 */
const ResumePayloadSchema = z.object({
  approved: z.boolean(),
})

/** 步骤输出：与输入相同，通过审批后原样传递给下一步 */
const HumanApprovalOutputSchema = z.object({
  repoInfo: GitHubRepoSchema,
  repoTree: RepoTreeSchema,
})

export const humanApprovalStep = createStep({
  id: 'human-approval',
  inputSchema: HumanApprovalInputSchema,
  outputSchema: HumanApprovalOutputSchema,
  resumeSchema: ResumePayloadSchema,
  suspendSchema: SuspendPayloadSchema,
  execute: async ({ inputData, resumeData, suspend }) => {
    // 情况 1：用户已做出决定（workflow 被 resume）
    if (resumeData) {
      if (!resumeData.approved) {
        // 用户取消分析，抛出错误中断 workflow
        throw new Error('用户取消了分析')
      }
      // 用户批准，将数据原样传递给报告生成步骤
      return {
        repoInfo: inputData.repoInfo,
        repoTree: inputData.repoTree,
      }
    }

    // 情况 2：首次执行，暂停 workflow 等待用户审批
    // suspend() 会将仓库摘要发送给前端展示
    await suspend({ summary: inputData.repoInfo })

    // suspend 后的代码不会执行，但 TypeScript 需要返回值
    return {
      repoInfo: inputData.repoInfo,
      repoTree: inputData.repoTree,
    }
  },
})
