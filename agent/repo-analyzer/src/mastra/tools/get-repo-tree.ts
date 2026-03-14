/**
 * 获取仓库目录结构工具
 *
 * 做什么：封装 GitHub Contents API 调用，获取仓库的文件和目录列表
 * 为什么：Agent 分析仓库架构时需要了解目录结构，
 *        该工具支持指定路径和递归深度，让 Agent 能逐层探索仓库
 */

import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { RepoTreeSchema } from '@/lib/schemas'
import { fetchRepoTree } from '@/lib/github'

/**
 * 获取 GitHub 仓库目录结构的 Mastra Tool
 *
 * Agent 会在用户询问仓库结构、文件组织、技术栈判断等场景时自动调用此工具。
 * 支持指定子目录路径和递归深度，便于逐层分析大型仓库。
 */
export const getRepoTreeTool = createTool({
  id: 'get-repo-tree',
  description:
    '获取 GitHub 仓库的目录结构，返回指定路径下的文件和文件夹列表。' +
    '当用户询问仓库的项目结构、文件组织或需要分析技术栈时，应调用此工具。' +
    '可通过 path 参数查看子目录，通过 depth 参数控制递归层级（默认 1 层）。',
  inputSchema: z.object({
    /** 仓库所有者（GitHub 用户名或组织名） */
    owner: z.string().describe('仓库所有者，例如 "vercel"'),
    /** 仓库名称 */
    repo: z.string().describe('仓库名称，例如 "next.js"'),
    /** 要查看的目录路径，默认为仓库根目录 */
    path: z
      .string()
      .optional()
      .default('')
      .describe('要查看的目录路径，默认为根目录，例如 "src/components"'),
    /** 递归深度，1 表示只看当前层，2 表示展开一层子目录 */
    depth: z
      .number()
      .optional()
      .default(1)
      .describe('递归深度，1 只看当前层，2 展开子目录（默认 1，最大 2）'),
  }),
  outputSchema: RepoTreeSchema,
  execute: async (inputData) => {
    /** 调用 GitHub Contents API 获取目录结构，支持递归展开 */
    return fetchRepoTree(
      inputData.owner,
      inputData.repo,
      inputData.path,
      inputData.depth
    )
  },
})
