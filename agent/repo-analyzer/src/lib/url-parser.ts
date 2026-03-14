/**
 * GitHub URL 解析器
 *
 * 做什么：将多种格式的 GitHub 仓库 URL 解析为 { owner, repo } 结构
 * 为什么：用户可能输入各种格式的 URL，需要统一解析后才能调用 GitHub API
 *
 * 支持的格式：
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo.git
 * - github.com/owner/repo
 * - owner/repo
 */

import type { ParsedGitHubUrl } from './schemas'

/**
 * 解析 GitHub 仓库 URL，提取 owner 和 repo
 * @throws 当输入格式无效时抛出中文错误信息
 */
export function parseGitHubUrl(input: string): ParsedGitHubUrl {
  const trimmed = input.trim()

  if (!trimmed) {
    throw new Error('请输入 GitHub 仓库地址')
  }

  // 尝试匹配各种 URL 格式
  // 格式 1: https://github.com/owner/repo 或 http://github.com/owner/repo
  // 格式 2: https://github.com/owner/repo.git
  // 格式 3: github.com/owner/repo
  // 格式 4: owner/repo（简写）
  const patterns = [
    /^https?:\/\/github\.com\/([^/]+)\/([^/.]+?)(?:\.git)?$/,
    /^github\.com\/([^/]+)\/([^/.]+?)(?:\.git)?$/,
    /^([^/]+)\/([^/]+)$/,
  ]

  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match) {
      const owner = match[1]
      const repo = match[2]

      // 基本校验：owner 和 repo 不能包含特殊字符
      if (/^[\w.-]+$/.test(owner) && /^[\w.-]+$/.test(repo)) {
        return { owner, repo }
      }
    }
  }

  throw new Error(
    '无法解析该 GitHub 地址。支持的格式：\n' +
      '• https://github.com/owner/repo\n' +
      '• github.com/owner/repo\n' +
      '• owner/repo'
  )
}
