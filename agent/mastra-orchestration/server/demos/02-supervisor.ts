import { Agent } from '@mastra/core/agent'
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { model } from '../config.js'
import type { Demo, EmitFn } from '../types.js'

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

const analysisAgent = new Agent({
  id: 'analysis-agent',
  name: 'Analysis Agent',
  model,
  description:
    'Analyzes and synthesizes information. Use this agent to identify patterns, compare findings, and extract key insights from raw data.',
  instructions:
    'You are a data analyst. Given raw research material, identify key trends, compare different perspectives, and extract actionable insights. Be specific and data-driven.',
})

const writingAgent = new Agent({
  id: 'writing-agent',
  name: 'Writing Agent',
  model,
  description:
    'Writes structured reports. Use this agent to produce the final research report from analyzed findings.',
  instructions:
    'You are a research writer. Given analyzed findings, produce a well-structured research report with: Executive Summary, Key Findings (3-5 bullet points), Detailed Analysis, and Recommendations. Use clear, professional language.',
})

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
  agents: { searchAgent, analysisAgent, writingAgent },
})

async function run(input: Record<string, string>, emit: EmitFn) {
  const { question } = input

  emit({ type: 'node:active', nodeId: 'supervisor' })

  const result = await supervisor.generate(
    [{ role: 'user', content: question }],
    {
      maxSteps: 10,
      delegation: {
        onDelegationStart: ({ primitiveId }) => {
          emit({ type: 'edge:active', edgeId: `supervisor-to-${primitiveId}` })
          emit({ type: 'node:active', nodeId: primitiveId })
        },
        onDelegationComplete: ({ primitiveId }) => {
          emit({ type: 'node:complete', nodeId: primitiveId })
          emit({
            type: 'edge:complete',
            edgeId: `supervisor-to-${primitiveId}`,
          })
        },
      },
    },
  )

  const text = await result.text
  emit({
    type: 'node:complete',
    nodeId: 'supervisor',
    output: { preview: text.slice(0, 200) },
  })
  return { report: text }
}

export const supervisorDemo: Demo = {
  meta: {
    id: '02-supervisor',
    name: 'Deep Research Assistant',
    nameZh: '深度调研助手',
    pattern: 'Supervisor',
    description:
      'One Supervisor LLM dynamically delegates to Search, Analysis, and Writing agents. The execution path is decided at runtime.',
    inputs: [
      {
        id: 'question',
        label: 'Research Question',
        type: 'textarea',
        placeholder:
          'e.g. What are the current trends in AI agent frameworks?',
      },
    ],
  },
  run,
}
