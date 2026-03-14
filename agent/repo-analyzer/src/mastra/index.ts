/**
 * Mastra 实例配置
 *
 * 做什么：创建和导出 Mastra 核心实例，注册 Agent、Workflow 和持久化存储
 * 为什么：Mastra 实例是 Agent 和 Workflow 的运行入口，
 *        所有 API 路由通过它来访问 Agent 和执行 Workflow
 */

import { Mastra } from '@mastra/core'
import { LibSQLStore } from '@mastra/libsql'
import { repoAnalyzerAgent } from './agents/repo-analyzer'
import { analyzeRepoWorkflow } from './workflows/analyze-repo'

/**
 * Mastra 单例实例
 * - storage: 使用 LibSQL 本地文件存储，用于 Workflow suspend/resume 状态持久化
 * - agents: 注册仓库分析 Agent，供 API 路由通过 agentId 访问
 * - workflows: 注册仓库分析 workflow，支持 HITL suspend/resume
 */
export const mastra = new Mastra({
  storage: new LibSQLStore({
    id: 'repo-analyzer-storage',
    url: 'file:./storage.db',
  }),
  agents: {
    repoAnalyzer: repoAnalyzerAgent,
  },
  workflows: {
    'analyze-repo': analyzeRepoWorkflow,
  },
})
