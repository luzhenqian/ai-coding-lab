/**
 * URL 解析步骤
 *
 * 做什么：将用户输入的 GitHub URL 解析为 { owner, repo } 结构
 * 为什么：后续步骤需要 owner 和 repo 来调用 GitHub API，
 *        这是 workflow 的第一步，负责标准化用户输入
 */

import { createStep } from '@mastra/core/workflows'
import { z } from 'zod'
import { ParsedGitHubUrlSchema } from '@/lib/schemas'
import { parseGitHubUrl } from '@/lib/url-parser'

export const parseUrlStep = createStep({
  id: 'parse-url',
  inputSchema: z.object({ url: z.string() }),
  outputSchema: ParsedGitHubUrlSchema,
  execute: async ({ inputData }) => {
    // 调用 URL 解析器，将各种格式的 GitHub URL 统一为 { owner, repo }
    return parseGitHubUrl(inputData.url)
  },
})
