/**
 * 仓库分析 Workflow
 *
 * 做什么：将 URL 解析 → 数据获取 → 人工审批 → 报告生成 四个步骤串联成完整流程
 * 为什么：Workflow 编排让复杂流程变得可控、可观测、可恢复，
 *        特别是 HITL 审批步骤需要 suspend/resume 机制支持
 *
 * 流程：
 * 1. parseUrlStep: 解析 GitHub URL → { owner, repo }
 * 2. fetchDataStep: 并行获取仓库信息和目录结构
 * 3. humanApprovalStep: 暂停等待用户确认（HITL）
 * 4. generateReportStep: AI 生成分析报告
 */

import { createWorkflow } from '@mastra/core/workflows'
import { z } from 'zod'
import { parseUrlStep } from './steps/parse-url'
import { fetchDataStep } from './steps/fetch-data'
import { humanApprovalStep } from './steps/human-approval'
import { generateReportStep } from './steps/generate-report'

export const analyzeRepoWorkflow = createWorkflow({
  id: 'analyze-repo',
  inputSchema: z.object({ url: z.string() }),
  outputSchema: z.object({ report: z.string() }),
})
  .then(parseUrlStep)
  .then(fetchDataStep)
  .then(humanApprovalStep)
  .then(generateReportStep)
  .commit()
