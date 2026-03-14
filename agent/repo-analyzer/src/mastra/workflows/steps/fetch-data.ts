/**
 * 数据获取步骤
 *
 * 做什么：并行调用 GitHub API 获取仓库基础信息和目录结构
 * 为什么：仓库信息和目录树是两个独立的 API 调用，并行执行可以减少等待时间，
 *        获取的数据将用于 HITL 审批展示和最终报告生成
 */

import { createStep } from '@mastra/core/workflows'
import { z } from 'zod'
import {
  ParsedGitHubUrlSchema,
  GitHubRepoSchema,
  RepoTreeSchema,
} from '@/lib/schemas'
import { fetchRepoInfo, fetchRepoTree } from '@/lib/github'

/** 输出 schema：包含仓库基础信息和目录结构 */
const FetchDataOutputSchema = z.object({
  repoInfo: GitHubRepoSchema,
  repoTree: RepoTreeSchema,
})

export const fetchDataStep = createStep({
  id: 'fetch-data',
  inputSchema: ParsedGitHubUrlSchema,
  outputSchema: FetchDataOutputSchema,
  execute: async ({ inputData }) => {
    const { owner, repo } = inputData

    // 并行获取仓库信息和目录结构，减少总等待时间
    const [repoInfo, repoTree] = await Promise.all([
      fetchRepoInfo(owner, repo),
      fetchRepoTree(owner, repo, '', 2),
    ])

    return { repoInfo, repoTree }
  },
})
