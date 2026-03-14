/**
 * 共享 Zod Schema 定义
 *
 * 做什么：定义项目中所有共享的数据类型，包括 GitHub API 响应和 URL 解析结果
 * 为什么：通过 zod schema 统一管理类型，确保运行时类型安全，
 *        同时为 Mastra Tool 和 Workflow Step 提供 inputSchema/outputSchema
 */

import { z } from 'zod'

/** 解析后的 GitHub URL —— 从各种格式的 URL 中提取 owner 和 repo */
export const ParsedGitHubUrlSchema = z.object({
  owner: z.string(),
  repo: z.string(),
})
export type ParsedGitHubUrl = z.infer<typeof ParsedGitHubUrlSchema>

/** GitHub 仓库基础信息 —— 从 GET /repos/{owner}/{repo} 响应中提取 */
export const GitHubRepoSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  fullName: z.string(),
  description: z.string().nullable(),
  stars: z.number(),
  forks: z.number(),
  language: z.string().nullable(),
  license: z.string().nullable(),
  topics: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
  openIssues: z.number(),
  defaultBranch: z.string(),
  isArchived: z.boolean(),
})
export type GitHubRepo = z.infer<typeof GitHubRepoSchema>

/** 目录结构单条条目 —— 文件或目录 */
export const RepoTreeItemSchema = z.object({
  name: z.string(),
  path: z.string(),
  type: z.enum(['file', 'dir']),
  size: z.number(),
})
export type RepoTreeItem = z.infer<typeof RepoTreeItemSchema>

/** 仓库目录结构 —— 从 GET /repos/{owner}/{repo}/contents/{path} 响应中提取 */
export const RepoTreeSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  path: z.string(),
  items: z.array(RepoTreeItemSchema),
})
export type RepoTree = z.infer<typeof RepoTreeSchema>
