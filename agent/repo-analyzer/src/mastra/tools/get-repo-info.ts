/**
 * 获取仓库基础信息工具
 *
 * 做什么：封装 GitHub API 调用，获取仓库的 star 数、语言、描述等基础信息
 * 为什么：Agent 需要通过 Tool Calling 获取真实数据，而不是凭空编造，
 *        该工具让 Agent 能在对话中按需调用 GitHub API
 */

import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { GitHubRepoSchema } from '@/lib/schemas'
import { fetchRepoInfo } from '@/lib/github'

/**
 * 获取 GitHub 仓库基础信息的 Mastra Tool
 *
 * Agent 会在用户询问某个仓库的概况、star 数、语言、license 等信息时自动调用此工具
 */
export const getRepoInfoTool = createTool({
  id: 'get-repo-info',
  description:
    '获取 GitHub 仓库的基础信息，包括 star 数、fork 数、主语言、license、描述等。' +
    '当用户询问某个仓库的概况或基本数据时，应调用此工具获取真实数据。',
  inputSchema: z.object({
    /** 仓库所有者（GitHub 用户名或组织名） */
    owner: z.string().describe('仓库所有者，例如 "vercel"'),
    /** 仓库名称 */
    repo: z.string().describe('仓库名称，例如 "next.js"'),
  }),
  outputSchema: GitHubRepoSchema,
  execute: async (inputData) => {
    /** 调用 GitHub REST API 获取仓库信息并返回结构化数据 */
    return fetchRepoInfo(inputData.owner, inputData.repo)
  },
})
