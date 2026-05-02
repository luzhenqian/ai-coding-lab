/**
 * 02-Supervisor: 深度调研助手
 *
 * 编排模式: Supervisor（总管模式）
 * 核心特征: 一个 Supervisor LLM 掌控全局，动态决定调用哪个子 Agent、调用几次、以什么顺序
 * 与 Workflow 的区别: 执行路径不是代码写死的，而是 LLM 在运行时自行判断
 */
import { Agent } from '@mastra/core/agent'
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { model } from '../config.js'
import type { Demo, EmitFn } from '../types.js'

// --- 工具定义: 模拟的网页搜索工具 ---
// 真实项目中可接入 Serper/Tavily 等搜索 API，这里用硬编码结果避免外部依赖
const webSearchTool = createTool({
  id: 'web-search',
  description:
    'Search the web for information on any topic. Returns a list of relevant results with titles and snippets.',
  inputSchema: z.object({ query: z.string().describe('The search query') }),
  outputSchema: z.object({
    results: z.array(
      z.object({ title: z.string(), snippet: z.string(), url: z.string() }),
    ),
  }),
  // createTool 的 execute 直接接收 inputSchema 解析后的对象
  execute: async ({ query }) => ({
    results: [
      {
        title: `Latest developments in ${query}`,
        snippet: `Recent research shows significant progress in ${query}. Key findings include improved methodologies and novel applications across multiple domains.`,
        url: `https://example.com/research/${encodeURIComponent(query)}`,
      },
      {
        title: `${query}: Industry Analysis 2026`,
        snippet: `Market analysis indicates growing adoption of ${query} across enterprises. Current trends suggest a 40% increase in implementation over the past year.`,
        url: `https://example.com/analysis/${encodeURIComponent(query)}`,
      },
      {
        title: `Expert perspectives on ${query}`,
        snippet: `Leading researchers highlight both opportunities and challenges in ${query}. Ethical considerations and scalability remain key discussion points.`,
        url: `https://example.com/experts/${encodeURIComponent(query)}`,
      },
    ],
  }),
})

// --- 定义三个子 Agent ---
// description 字段很关键: Supervisor 靠它决定什么时候调用哪个 Agent

// 搜索 Agent: 配备了 webSearchTool，负责信息检索
const searchAgent = new Agent({
  id: 'search-agent',
  name: 'Search Agent',
  model,
  description:
    'Searches the web for information. Use this agent when you need to find facts, data, or current information on a topic.',
  instructions:
    'You are a search specialist. Use the web-search tool to find relevant information. Return the raw search results with your brief commentary on relevance.',
  tools: { webSearchTool },
})

// 分析 Agent: 从原始数据中提取趋势和洞察
const analysisAgent = new Agent({
  id: 'analysis-agent',
  name: 'Analysis Agent',
  model,
  description:
    'Analyzes and synthesizes information. Use this agent to identify patterns, compare findings, and extract key insights from raw data.',
  instructions:
    'You are a data analyst. Given raw research material, identify key trends, compare different perspectives, and extract actionable insights. Be specific and data-driven.',
})

// 写作 Agent: 将分析结果整理成结构化报告
const writingAgent = new Agent({
  id: 'writing-agent',
  name: 'Writing Agent',
  model,
  description:
    'Writes structured reports. Use this agent to produce the final research report from analyzed findings.',
  instructions:
    'You are a research writer. Given analyzed findings, produce a well-structured research report with: Executive Summary, Key Findings (3-5 bullet points), Detailed Analysis, and Recommendations. Use clear, professional language.',
})

/**
 * Supervisor Agent — 通过 agents 属性注册子 Agent
 * Mastra 内部会把每个子 Agent 转成 tool（名为 agent-<key>）
 * Supervisor 的 LLM 自行决定何时调用哪个 tool，实现动态调度
 */
const supervisor = new Agent({
  id: 'supervisor',
  name: 'Supervisor',
  model,
  instructions: `You are a research coordinator. Your job is to produce a comprehensive research report by delegating to your team:
- search-agent: to find information (can be called multiple times with different queries)
- analysis-agent: to analyze and synthesize the search results
- writing-agent: to produce the final report

Typical flow: search → search (different angle) → analyze all results → write report.
Adapt your strategy based on the topic complexity. Always end by delegating to the writing agent for the final report.`,
  // 关键: agents 属性让 Supervisor 可以调度这些子 Agent
  agents: { searchAgent, analysisAgent, writingAgent },
})

async function run(input: Record<string, string>, emit: EmitFn) {
  const { question } = input

  emit({ type: 'node:active', nodeId: 'supervisor' })

  // 用 stream() 而非 generate()，实时输出 Supervisor 的最终报告
  // maxSteps 限制最大调度轮次，防止无限循环
  const result = await supervisor.stream(
    [{ role: 'user', content: question }],
    {
      maxSteps: 10,
      // delegation 钩子: Mastra 在 Supervisor 调度子 Agent 时触发
      delegation: {
        // 子 Agent 开始执行时触发，primitiveId 是子 Agent 的 id
        onDelegationStart: ({ primitiveId, prompt }) => {
          emit({ type: 'edge:active', edgeId: `supervisor-to-${primitiveId}` })
          emit({ type: 'node:active', nodeId: primitiveId })
          // 输出 Supervisor 给子 Agent 的任务摘要
          if (prompt) {
            const preview = typeof prompt === 'string' ? prompt.slice(0, 150) : JSON.stringify(prompt).slice(0, 150)
            emit({ type: 'stream:chunk', nodeId: primitiveId, text: `[${primitiveId}] ${preview}...\n` })
          }
        },
        // 子 Agent 执行完毕时触发，携带返回结果
        onDelegationComplete: ({ primitiveId, result: delegationResult }) => {
          if (delegationResult) {
            const text = typeof delegationResult === 'string' ? delegationResult : JSON.stringify(delegationResult)
            emit({ type: 'stream:chunk', nodeId: primitiveId, text: text.slice(0, 500) + (text.length > 500 ? '...' : '') + '\n' })
          }
          emit({ type: 'node:complete', nodeId: primitiveId })
          emit({ type: 'edge:complete', edgeId: `supervisor-to-${primitiveId}` })
        },
      },
    },
  )

  // 流式输出 Supervisor 的最终报告
  let fullText = ''
  for await (const chunk of result.textStream) {
    fullText += chunk
    emit({ type: 'stream:chunk', nodeId: 'supervisor', text: chunk })
  }

  emit({ type: 'node:complete', nodeId: 'supervisor' })
  return { report: fullText }
}

export const supervisorDemo: Demo = {
  meta: {
    id: '02-supervisor',
    name: 'Deep Research Assistant',
    nameZh: '深度调研助手',
    pattern: 'Supervisor',
    description: '一个 Supervisor LLM 动态调度搜索、分析、写作三个 Agent。执行路径由 LLM 在运行时决定。',
    inputs: [
      {
        id: 'question',
        label: '调研问题',
        type: 'textarea',
        placeholder: '例如：AI Agent 框架的最新趋势是什么？',
      },
    ],
  },
  run,
}
