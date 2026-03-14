/**
 * GitHub REST API 客户端
 *
 * 做什么：封装 GitHub API 调用，获取仓库信息和目录结构
 * 为什么：将 API 调用逻辑集中管理，统一处理认证、错误和数据转换，
 *        供 Agent Tool 和 Workflow Step 复用
 */

import type { GitHubRepo, RepoTree, RepoTreeItem } from './schemas'

/** 构建 GitHub API 请求的通用 headers */
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'repo-analyzer',
  }
  const token = process.env.GITHUB_TOKEN
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

/** 统一处理 GitHub API 错误响应，返回中文错误信息 */
function handleApiError(status: number, owner: string, repo: string): never {
  if (status === 404) {
    throw new Error(
      `仓库 ${owner}/${repo} 不存在或为私有仓库，无法访问`
    )
  }
  if (status === 403) {
    throw new Error(
      'GitHub API 请求次数已达上限，请稍后重试或在 .env 中配置 GITHUB_TOKEN'
    )
  }
  throw new Error(`GitHub API 请求失败（状态码: ${status}）`)
}

/**
 * 获取仓库基础信息
 * 调用 GET https://api.github.com/repos/{owner}/{repo}
 */
export async function fetchRepoInfo(
  owner: string,
  repo: string
): Promise<GitHubRepo> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers: getHeaders() }
    )

    if (!response.ok) {
      handleApiError(response.status, owner, repo)
    }

    const data = await response.json()

    // 将 GitHub API 原始响应转换为我们的 schema 格式
    return {
      owner,
      repo,
      fullName: data.full_name,
      description: data.description,
      stars: data.stargazers_count,
      forks: data.forks_count,
      language: data.language,
      license: data.license?.spdx_id ?? null,
      topics: data.topics ?? [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      openIssues: data.open_issues_count,
      defaultBranch: data.default_branch,
      isArchived: data.archived,
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('仓库')) {
      throw error
    }
    if (error instanceof Error && error.message.includes('API')) {
      throw error
    }
    throw new Error(
      `获取仓库 ${owner}/${repo} 信息时发生网络错误，请检查网络连接`
    )
  }
}

/**
 * 获取仓库目录结构
 * 调用 GET https://api.github.com/repos/{owner}/{repo}/contents/{path}
 */
export async function fetchRepoTree(
  owner: string,
  repo: string,
  path: string = '',
  depth: number = 1
): Promise<RepoTree> {
  try {
    const items = await fetchContents(owner, repo, path)

    // 如果 depth > 1，递归获取子目录内容
    if (depth > 1) {
      const dirs = items.filter((item) => item.type === 'dir')
      const subResults = await Promise.all(
        dirs.map((dir) =>
          fetchContents(owner, repo, dir.path).catch(() => [])
        )
      )
      // 将子目录内容追加到结果中
      for (const subItems of subResults) {
        items.push(...subItems)
      }
    }

    return { owner, repo, path, items }
  } catch (error) {
    if (error instanceof Error && error.message.includes('仓库')) {
      throw error
    }
    if (error instanceof Error && error.message.includes('API')) {
      throw error
    }
    throw new Error(
      `获取仓库 ${owner}/${repo} 目录结构时发生网络错误，请检查网络连接`
    )
  }
}

/** 获取指定路径下的内容列表 */
async function fetchContents(
  owner: string,
  repo: string,
  path: string
): Promise<RepoTreeItem[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
  const response = await fetch(url, { headers: getHeaders() })

  if (!response.ok) {
    handleApiError(response.status, owner, repo)
  }

  const data = await response.json()

  if (!Array.isArray(data)) {
    return []
  }

  return data.map(
    (item: { name: string; path: string; type: string; size: number }) => ({
      name: item.name,
      path: item.path,
      type: item.type === 'dir' ? ('dir' as const) : ('file' as const),
      size: item.size ?? 0,
    })
  )
}
