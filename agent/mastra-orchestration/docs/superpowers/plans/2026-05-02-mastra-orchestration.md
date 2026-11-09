# Mastra Agent Orchestration Demos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 5 runnable demos (Workflow, Supervisor, Handoff, Council, Hybrid) with a React Flow WebUI that visualizes agent orchestration in real time.

**Architecture:** Express backend orchestrates Mastra agents and streams SSE events. React + React Flow frontend renders interactive node graphs with live status updates. Each demo directly calls Mastra Agent APIs with event emission between steps — no `createWorkflow` abstraction layer, so the orchestration pattern is explicit in the code.

**Tech Stack:** TypeScript, Mastra (`@mastra/core`), `@ai-sdk/openai`, Express, React, `@xyflow/react`, Vite, Zod

---

## Task 1: Project Scaffolding

**Files:**
- Create: `agent/mastra-orchestration/package.json`
- Create: `agent/mastra-orchestration/tsconfig.json`
- Create: `agent/mastra-orchestration/vite.config.ts`
- Create: `agent/mastra-orchestration/.env.example`
- Create: `agent/mastra-orchestration/index.html`
- Create: `agent/mastra-orchestration/.gitignore`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "mastra-orchestration",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "concurrently \"tsx watch server/index.ts\" \"vite\"",
    "dev:server": "tsx watch server/index.ts",
    "dev:web": "vite",
    "build": "vite build",
    "cli": "tsx server/cli.ts"
  },
  "dependencies": {
    "@ai-sdk/openai": "latest",
    "@mastra/core": "latest",
    "@xyflow/react": "latest",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "zod": "^3.24.4"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.2",
    "@types/react": "^19.1.2",
    "@types/react-dom": "^19.1.2",
    "@vitejs/plugin-react": "^4.4.1",
    "concurrently": "^9.1.2",
    "tsx": "^4.19.4",
    "typescript": "^5.8.3",
    "vite": "^6.3.4"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": ".",
    "jsx": "react-jsx",
    "resolveJsonModule": true,
    "declaration": true
  },
  "include": ["server/**/*", "src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
```

- [ ] **Step 4: Create .env.example**

```env
OPENAI_API_KEY=sk-your-key-here
OPENAI_BASE_URL=https://api.openai.com/v1
MODEL_ID=gpt-5.5
```

- [ ] **Step 5: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mastra Orchestration Demos</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Create .gitignore**

```
node_modules/
dist/
.env
```

- [ ] **Step 7: Install dependencies**

Run: `cd agent/mastra-orchestration && npm install`

- [ ] **Step 8: Commit**

```bash
git add agent/mastra-orchestration/package.json agent/mastra-orchestration/tsconfig.json agent/mastra-orchestration/vite.config.ts agent/mastra-orchestration/.env.example agent/mastra-orchestration/index.html agent/mastra-orchestration/.gitignore
git commit -m "chore: scaffold mastra-orchestration project"
```

---

## Task 2: Server Infrastructure

**Files:**
- Create: `agent/mastra-orchestration/server/config.ts`
- Create: `agent/mastra-orchestration/server/types.ts`
- Create: `agent/mastra-orchestration/server/index.ts`
- Create: `agent/mastra-orchestration/server/cli.ts`

- [ ] **Step 1: Create config.ts — model configuration from env vars**

```typescript
import 'dotenv/config'
import { createOpenAI } from '@ai-sdk/openai'

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
})

export const model = openai(process.env.MODEL_ID || 'gpt-5.5')
```

- [ ] **Step 2: Create types.ts — shared types for demos and SSE events**

```typescript
export type SSEEvent =
  | { type: 'node:active'; nodeId: string }
  | { type: 'node:complete'; nodeId: string; output?: unknown }
  | { type: 'node:error'; nodeId: string; error: string }
  | { type: 'edge:active'; edgeId: string }
  | { type: 'edge:complete'; edgeId: string }
  | { type: 'stream:chunk'; nodeId: string; text: string }
  | { type: 'run:complete'; result: unknown }

export type EmitFn = (event: SSEEvent) => void

export interface DemoInput {
  id: string
  label: string
  type: 'text' | 'textarea'
  placeholder: string
}

export interface DemoMeta {
  id: string
  name: string
  nameZh: string
  pattern: string
  description: string
  inputs: DemoInput[]
}

export interface Demo {
  meta: DemoMeta
  run: (input: Record<string, string>, emit: EmitFn) => Promise<unknown>
}
```

- [ ] **Step 3: Create server/index.ts — Express server with SSE endpoint**

```typescript
import express from 'express'
import cors from 'cors'
import { demos } from './demos/index.js'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/demos', (_req, res) => {
  const list = Object.values(demos).map((d) => d.meta)
  res.json(list)
})

app.post('/api/demos/:id/run', async (req, res) => {
  const demo = demos[req.params.id]
  if (!demo) {
    res.status(404).json({ error: 'Demo not found' })
    return
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const emit: import('./types.js').EmitFn = (event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`)
  }

  try {
    const result = await demo.run(req.body, emit)
    emit({ type: 'run:complete', result })
  } catch (err) {
    emit({ type: 'node:error', nodeId: 'system', error: String(err) })
  } finally {
    res.end()
  }
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
```

- [ ] **Step 4: Create server/cli.ts — CLI runner for testing demos**

```typescript
import 'dotenv/config'
import { demos } from './demos/index.js'
import type { SSEEvent } from './types.js'

const demoId = process.argv[2]
const inputJson = process.argv[3] || '{}'

if (!demoId) {
  console.log('Usage: npx tsx server/cli.ts <demo-id> [input-json]')
  console.log('Available demos:', Object.keys(demos).join(', '))
  process.exit(0)
}

const demo = demos[demoId]
if (!demo) {
  console.error(`Unknown demo: ${demoId}`)
  process.exit(1)
}

const input = JSON.parse(inputJson)
const emit = (event: SSEEvent) => {
  const tag = event.type.padEnd(14)
  if (event.type === 'stream:chunk') {
    process.stdout.write(event.text)
  } else if (event.type === 'node:active') {
    console.log(`\n⚡ ${tag} ${event.nodeId}`)
  } else if (event.type === 'node:complete') {
    console.log(`✅ ${tag} ${event.nodeId}`)
  } else if (event.type === 'node:error') {
    console.log(`❌ ${tag} ${event.nodeId}: ${event.error}`)
  } else if (event.type === 'run:complete') {
    console.log(`\n\n=== Result ===`)
    console.log(JSON.stringify(event.result, null, 2))
  }
}

demo.run(input, emit).catch(console.error)
```

- [ ] **Step 5: Create placeholder demos/index.ts**

```typescript
import type { Demo } from '../types.js'

export const demos: Record<string, Demo> = {}
```

This will be populated as each demo is implemented.

- [ ] **Step 6: Verify server starts**

Run: `cd agent/mastra-orchestration && npx tsx server/index.ts`
Expected: `Server running on http://localhost:3001`
Ctrl+C to stop.

- [ ] **Step 7: Commit**

```bash
git add agent/mastra-orchestration/server/
git commit -m "feat: add server infrastructure (config, types, Express SSE, CLI runner)"
```

---

## Task 3: Demo 01 — Workflow: Blog Publishing Pipeline

**Files:**
- Create: `agent/mastra-orchestration/server/demos/01-workflow.ts`
- Modify: `agent/mastra-orchestration/server/demos/index.ts`

- [ ] **Step 1: Create 01-workflow.ts**

```typescript
import { Agent } from '@mastra/core/agent'
import { model } from '../config.js'
import type { Demo, EmitFn } from '../types.js'

const writerAgent = new Agent({
  id: 'writer',
  model,
  instructions: `You are a professional blog writer. Given a topic, write a blog post of about 300 words in Markdown format. Include a compelling title, clear structure with headings, and actionable insights. Write in a conversational yet informative tone.`,
})

const seoAgent = new Agent({
  id: 'seo',
  model,
  instructions: `You are an SEO specialist. Given a blog article, optimize it and output ONLY valid JSON (no markdown code fences):
{"title": "SEO-optimized title", "keywords": ["keyword1", "keyword2", ...], "metaDescription": "150-char meta description", "optimizedArticle": "the full article with SEO improvements"}`,
})

const socialAgent = new Agent({
  id: 'social',
  model,
  instructions: `You are a social media copywriter. Given a blog article, create social media posts and output ONLY valid JSON (no markdown code fences):
{"twitter": "Tweet under 280 characters with hashtags", "xiaohongshu": "小红书 post with emoji-rich hook and body, under 500 chars"}`,
})

async function run(input: Record<string, string>, emit: EmitFn) {
  const { topic } = input

  // Step 1: Write draft
  emit({ type: 'node:active', nodeId: 'writer' })
  const draft = await writerAgent.generate([{ role: 'user', content: `Write a blog post about: ${topic}` }])
  emit({ type: 'node:complete', nodeId: 'writer', output: { preview: draft.text.slice(0, 150) + '...' } })

  // Step 2: SEO optimization
  emit({ type: 'edge:active', edgeId: 'writer-to-seo' })
  emit({ type: 'node:active', nodeId: 'seo' })
  const seoResult = await seoAgent.generate([{ role: 'user', content: draft.text }])
  let seo: { title: string; keywords: string[]; metaDescription: string; optimizedArticle: string }
  try {
    seo = JSON.parse(seoResult.text)
  } catch {
    seo = { title: topic, keywords: [], metaDescription: '', optimizedArticle: draft.text }
  }
  emit({ type: 'edge:complete', edgeId: 'writer-to-seo' })
  emit({ type: 'node:complete', nodeId: 'seo', output: { title: seo.title, keywords: seo.keywords } })

  // Step 3: Social media posts
  emit({ type: 'edge:active', edgeId: 'seo-to-social' })
  emit({ type: 'node:active', nodeId: 'social' })
  const socialResult = await socialAgent.generate([{ role: 'user', content: seo.optimizedArticle }])
  let social: { twitter: string; xiaohongshu: string }
  try {
    social = JSON.parse(socialResult.text)
  } catch {
    social = { twitter: '', xiaohongshu: '' }
  }
  emit({ type: 'edge:complete', edgeId: 'seo-to-social' })
  emit({ type: 'node:complete', nodeId: 'social', output: social })

  return { article: seo.optimizedArticle, seo: { title: seo.title, keywords: seo.keywords, metaDescription: seo.metaDescription }, social }
}

export const workflow: Demo = {
  meta: {
    id: '01-workflow',
    name: 'Blog Publishing Pipeline',
    nameZh: '博客发布流水线',
    pattern: 'Workflow',
    description: 'Fixed sequential pipeline: Writer → SEO → Social Media. Path is hardcoded — code decides the order.',
    inputs: [{ id: 'topic', label: 'Blog Topic', type: 'text', placeholder: 'e.g. AI-assisted programming in 2026' }],
  },
  run,
}
```

- [ ] **Step 2: Register in demos/index.ts**

```typescript
import type { Demo } from '../types.js'
import { workflow } from './01-workflow.js'

export const demos: Record<string, Demo> = {
  '01-workflow': workflow,
}
```

- [ ] **Step 3: Verify via CLI**

Run: `cd agent/mastra-orchestration && npx tsx server/cli.ts 01-workflow '{"topic":"AI programming"}'`
Expected: See ⚡/✅ events for writer → seo → social, then JSON result.

- [ ] **Step 4: Commit**

```bash
git add agent/mastra-orchestration/server/demos/
git commit -m "feat: add demo 01 — Workflow (Blog Publishing Pipeline)"
```

---

## Task 4: Demo 02 — Supervisor: Deep Research Assistant

**Files:**
- Create: `agent/mastra-orchestration/server/demos/02-supervisor.ts`
- Modify: `agent/mastra-orchestration/server/demos/index.ts`

- [ ] **Step 1: Create 02-supervisor.ts**

```typescript
import { Agent } from '@mastra/core/agent'
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { model } from '../config.js'
import type { Demo, EmitFn } from '../types.js'

const webSearchTool = createTool({
  id: 'web-search',
  description: 'Search the web for information on any topic. Returns a list of relevant results with titles and snippets.',
  inputSchema: z.object({ query: z.string().describe('The search query') }),
  outputSchema: z.object({
    results: z.array(z.object({ title: z.string(), snippet: z.string(), url: z.string() })),
  }),
  execute: async ({ context: { query } }) => ({
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
  model,
  description: 'Searches the web for information. Use this agent when you need to find facts, data, or current information on a topic.',
  instructions: 'You are a search specialist. Use the web-search tool to find relevant information. Return the raw search results with your brief commentary on relevance.',
  tools: { webSearchTool },
})

const analysisAgent = new Agent({
  id: 'analysis-agent',
  model,
  description: 'Analyzes and synthesizes information. Use this agent to identify patterns, compare findings, and extract key insights from raw data.',
  instructions: 'You are a data analyst. Given raw research material, identify key trends, compare different perspectives, and extract actionable insights. Be specific and data-driven.',
})

const writingAgent = new Agent({
  id: 'writing-agent',
  model,
  description: 'Writes structured reports. Use this agent to produce the final research report from analyzed findings.',
  instructions: 'You are a research writer. Given analyzed findings, produce a well-structured research report with: Executive Summary, Key Findings (3-5 bullet points), Detailed Analysis, and Recommendations. Use clear, professional language.',
})

const supervisor = new Agent({
  id: 'supervisor',
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

  const result = await supervisor.generate([{ role: 'user', content: question }], {
    maxSteps: 10,
    onStepFinish: (step) => {
      for (const toolCall of step.toolCalls || []) {
        const agentId = toolCall.toolName.replace('agent-', '')
        emit({ type: 'edge:active', edgeId: `supervisor-to-${agentId}` })
        emit({ type: 'node:active', nodeId: agentId })
      }
      for (const toolResult of step.toolResults || []) {
        const agentId = toolResult.toolName.replace('agent-', '')
        emit({ type: 'node:complete', nodeId: agentId })
        emit({ type: 'edge:complete', edgeId: `supervisor-to-${agentId}` })
      }
    },
  })

  emit({ type: 'node:complete', nodeId: 'supervisor', output: { preview: result.text.slice(0, 200) } })
  return { report: result.text }
}

export const supervisorDemo: Demo = {
  meta: {
    id: '02-supervisor',
    name: 'Deep Research Assistant',
    nameZh: '深度调研助手',
    pattern: 'Supervisor',
    description: 'One Supervisor LLM dynamically delegates to Search, Analysis, and Writing agents. The execution path is decided at runtime.',
    inputs: [{ id: 'question', label: 'Research Question', type: 'textarea', placeholder: 'e.g. What are the current trends in AI agent frameworks?' }],
  },
  run,
}
```

Note: the `onStepFinish` callback is the AI SDK's standard hook for monitoring tool calls in multi-step agent execution. If Mastra's `agent.generate()` does not support `onStepFinish` directly, the implementing agent should check the Mastra docs for the equivalent — it may be `delegation.onDelegationStart` / `delegation.onDelegationComplete` instead. The key behavior is: emit `node:active` when a sub-agent starts, emit `node:complete` when it finishes.

- [ ] **Step 2: Register in demos/index.ts — add the import and entry**

Add to `demos/index.ts`:
```typescript
import { supervisorDemo } from './02-supervisor.js'
```

And add to the `demos` record:
```typescript
'02-supervisor': supervisorDemo,
```

- [ ] **Step 3: Verify via CLI**

Run: `cd agent/mastra-orchestration && npx tsx server/cli.ts 02-supervisor '{"question":"What are the latest trends in AI agent frameworks?"}'`
Expected: See supervisor activate, then delegate to search/analysis/writing agents dynamically.

- [ ] **Step 4: Commit**

```bash
git add agent/mastra-orchestration/server/demos/
git commit -m "feat: add demo 02 — Supervisor (Deep Research Assistant)"
```

---

## Task 5: Demo 03 — Handoff: Multi-Department Customer Service

**Files:**
- Create: `agent/mastra-orchestration/server/demos/03-handoff.ts`
- Modify: `agent/mastra-orchestration/server/demos/index.ts`

- [ ] **Step 1: Create 03-handoff.ts**

```typescript
import { Agent } from '@mastra/core/agent'
import { model } from '../config.js'
import type { Demo, EmitFn } from '../types.js'

const triageAgent = new Agent({
  id: 'triage',
  model,
  instructions: `You are a customer service triage specialist. Classify the customer's message into exactly one category and respond with ONLY valid JSON (no markdown code fences):
{"route": "tech" | "refund" | "billing", "summary": "one-sentence summary of the issue"}

Classification rules:
- "tech": software bugs, setup issues, how-to questions, feature requests
- "refund": return requests, refund status, product dissatisfaction
- "billing": payment issues, invoice questions, subscription changes, pricing`,
})

const techAgent = new Agent({
  id: 'tech-support',
  model,
  instructions: `You are a technical support specialist. Help the customer resolve their technical issue with clear, step-by-step troubleshooting instructions. Be patient and thorough. If the issue requires escalation, say so clearly.`,
})

const refundAgent = new Agent({
  id: 'refund',
  model,
  instructions: `You are a refund processing specialist. Handle refund requests professionally. Our policy: full refund within 30 days, 50% refund within 60 days, no refund after 60 days. Ask for order details if not provided. Be empathetic and solution-oriented.`,
})

const billingAgent = new Agent({
  id: 'billing',
  model,
  instructions: `You are a billing support specialist. Help customers with payment issues, invoice questions, and subscription management. Be clear about pricing, explain charges, and offer solutions for billing disputes.`,
})

const specialists: Record<string, Agent> = {
  tech: techAgent,
  refund: refundAgent,
  billing: billingAgent,
}

async function run(input: Record<string, string>, emit: EmitFn) {
  const { message } = input

  // Step 1: Triage — classify the message
  emit({ type: 'node:active', nodeId: 'triage' })
  const triageResult = await triageAgent.generate([{ role: 'user', content: message }])
  let route: string
  let summary: string
  try {
    const parsed = JSON.parse(triageResult.text)
    route = parsed.route
    summary = parsed.summary
  } catch {
    route = 'tech'
    summary = message
  }
  emit({ type: 'node:complete', nodeId: 'triage', output: { route, summary } })

  // Step 2: Hand off to specialist — triage yields control entirely
  const specialistId = route === 'tech' ? 'tech-support' : route
  emit({ type: 'edge:active', edgeId: `triage-to-${specialistId}` })
  emit({ type: 'node:active', nodeId: specialistId })

  const specialist = specialists[route] || techAgent
  const response = await specialist.generate([
    { role: 'user', content: `Customer issue (classified as ${route}): ${summary}\n\nOriginal message: ${message}` },
  ])

  emit({ type: 'edge:complete', edgeId: `triage-to-${specialistId}` })
  emit({ type: 'node:complete', nodeId: specialistId, output: { preview: response.text.slice(0, 150) } })

  return { route, summary, response: response.text }
}

export const handoffDemo: Demo = {
  meta: {
    id: '03-handoff',
    name: 'Multi-Department Customer Service',
    nameZh: '多部门客服',
    pattern: 'Handoff',
    description: 'Triage Agent classifies the message and hands off to the right specialist. No supervisor — the current agent decides who takes over.',
    inputs: [{ id: 'message', label: 'Customer Message', type: 'textarea', placeholder: 'e.g. I was charged twice for my subscription last month' }],
  },
  run,
}
```

- [ ] **Step 2: Register in demos/index.ts**

Add import and entry for `handoffDemo` with key `'03-handoff'`.

- [ ] **Step 3: Verify via CLI**

Run: `cd agent/mastra-orchestration && npx tsx server/cli.ts 03-handoff '{"message":"I was charged twice for my subscription last month"}'`
Expected: Triage classifies as "billing", hands off to billing agent.

- [ ] **Step 4: Commit**

```bash
git add agent/mastra-orchestration/server/demos/
git commit -m "feat: add demo 03 — Handoff (Multi-Department Customer Service)"
```

---

## Task 6: Demo 04 — Council: Code Review Committee

**Files:**
- Create: `agent/mastra-orchestration/server/demos/04-council.ts`
- Modify: `agent/mastra-orchestration/server/demos/index.ts`

- [ ] **Step 1: Create 04-council.ts**

```typescript
import { Agent } from '@mastra/core/agent'
import { model } from '../config.js'
import type { Demo, EmitFn } from '../types.js'

const securityAgent = new Agent({
  id: 'security-reviewer',
  model,
  instructions: `You are a security-focused code reviewer. Analyze the code for security vulnerabilities including:
- Injection attacks (SQL, command, XSS)
- Authentication/authorization flaws
- Data exposure risks
- Insecure dependencies

Respond with ONLY valid JSON (no markdown code fences):
{"score": 1-10, "issues": ["issue1", "issue2"], "suggestion": "overall security recommendation"}`,
})

const performanceAgent = new Agent({
  id: 'performance-reviewer',
  model,
  instructions: `You are a performance-focused code reviewer. Analyze the code for performance issues including:
- Algorithm complexity (time and space)
- Unnecessary allocations or copies
- N+1 queries or redundant I/O
- Missing caching opportunities

Respond with ONLY valid JSON (no markdown code fences):
{"score": 1-10, "issues": ["issue1", "issue2"], "suggestion": "overall performance recommendation"}`,
})

const readabilityAgent = new Agent({
  id: 'readability-reviewer',
  model,
  instructions: `You are a readability-focused code reviewer. Analyze the code for readability including:
- Naming clarity (variables, functions, classes)
- Code structure and organization
- Unnecessary complexity
- Missing or excessive comments

Respond with ONLY valid JSON (no markdown code fences):
{"score": 1-10, "issues": ["issue1", "issue2"], "suggestion": "overall readability recommendation"}`,
})

const synthesisAgent = new Agent({
  id: 'synthesis',
  model,
  instructions: `You are a lead code reviewer. Given three independent reviews (security, performance, readability), synthesize them into a final verdict.

Respond with ONLY valid JSON (no markdown code fences):
{"verdict": "approve" | "request-changes" | "reject", "overallScore": 1-10, "topIssues": ["most critical issue 1", "issue 2", "issue 3"], "summary": "2-3 sentence overall assessment"}`,
})

interface ReviewResult {
  score: number
  issues: string[]
  suggestion: string
}

function parseReview(text: string): ReviewResult {
  try {
    return JSON.parse(text)
  } catch {
    return { score: 5, issues: ['Unable to parse review'], suggestion: text }
  }
}

async function run(input: Record<string, string>, emit: EmitFn) {
  const { code } = input

  // Step 1: Three reviewers in parallel
  emit({ type: 'node:active', nodeId: 'security-reviewer' })
  emit({ type: 'node:active', nodeId: 'performance-reviewer' })
  emit({ type: 'node:active', nodeId: 'readability-reviewer' })

  const [securityResult, performanceResult, readabilityResult] = await Promise.all([
    securityAgent.generate([{ role: 'user', content: `Review this code for security:\n\n${code}` }]).then((r) => {
      emit({ type: 'node:complete', nodeId: 'security-reviewer' })
      return parseReview(r.text)
    }),
    performanceAgent.generate([{ role: 'user', content: `Review this code for performance:\n\n${code}` }]).then((r) => {
      emit({ type: 'node:complete', nodeId: 'performance-reviewer' })
      return parseReview(r.text)
    }),
    readabilityAgent.generate([{ role: 'user', content: `Review this code for readability:\n\n${code}` }]).then((r) => {
      emit({ type: 'node:complete', nodeId: 'readability-reviewer' })
      return parseReview(r.text)
    }),
  ])

  // Step 2: Synthesize reviews
  emit({ type: 'edge:active', edgeId: 'reviewers-to-synthesis' })
  emit({ type: 'edge:active', edgeId: 'perf-to-synthesis' })
  emit({ type: 'edge:active', edgeId: 'read-to-synthesis' })
  emit({ type: 'node:active', nodeId: 'synthesis' })

  const synthesisInput = `Security Review (score: ${securityResult.score}/10):
Issues: ${securityResult.issues.join('; ')}
Suggestion: ${securityResult.suggestion}

Performance Review (score: ${performanceResult.score}/10):
Issues: ${performanceResult.issues.join('; ')}
Suggestion: ${performanceResult.suggestion}

Readability Review (score: ${readabilityResult.score}/10):
Issues: ${readabilityResult.issues.join('; ')}
Suggestion: ${readabilityResult.suggestion}`

  const synthesisResult = await synthesisAgent.generate([{ role: 'user', content: synthesisInput }])
  emit({ type: 'edge:complete', edgeId: 'reviewers-to-synthesis' })
  emit({ type: 'edge:complete', edgeId: 'perf-to-synthesis' })
  emit({ type: 'edge:complete', edgeId: 'read-to-synthesis' })

  let verdict
  try {
    verdict = JSON.parse(synthesisResult.text)
  } catch {
    verdict = { verdict: 'request-changes', overallScore: 5, topIssues: [], summary: synthesisResult.text }
  }
  emit({ type: 'node:complete', nodeId: 'synthesis', output: verdict })

  return {
    reviews: { security: securityResult, performance: performanceResult, readability: readabilityResult },
    verdict,
  }
}

export const councilDemo: Demo = {
  meta: {
    id: '04-council',
    name: 'Code Review Committee',
    nameZh: '代码审查委员会',
    pattern: 'Council',
    description: 'Three agents review code in parallel (security, performance, readability), then a synthesis agent merges the verdicts.',
    inputs: [{ id: 'code', label: 'Code to Review', type: 'textarea', placeholder: 'Paste code here...' }],
  },
  run,
}
```

- [ ] **Step 2: Register in demos/index.ts**

Add import and entry for `councilDemo` with key `'04-council'`.

- [ ] **Step 3: Verify via CLI**

Run: `cd agent/mastra-orchestration && npx tsx server/cli.ts 04-council '{"code":"function login(user, pass) { const query = \"SELECT * FROM users WHERE name=\\\"\" + user + \"\\\" AND pass=\\\"\" + pass + \"\\\"\"; return db.execute(query); }"}'`
Expected: Three reviewers activate in parallel, then synthesis produces verdict. Security should flag SQL injection.

- [ ] **Step 4: Commit**

```bash
git add agent/mastra-orchestration/server/demos/
git commit -m "feat: add demo 04 — Council (Code Review Committee)"
```

---

## Task 7: Demo 05 — Hybrid: Hiring Evaluation System

**Files:**
- Create: `agent/mastra-orchestration/server/demos/05-hybrid.ts`
- Modify: `agent/mastra-orchestration/server/demos/index.ts`

- [ ] **Step 1: Create 05-hybrid.ts**

```typescript
import { Agent } from '@mastra/core/agent'
import { model } from '../config.js'
import type { Demo, EmitFn } from '../types.js'

// --- Workflow Step 1: Resume Parser ---
const parserAgent = new Agent({
  id: 'parser',
  model,
  instructions: `You parse resumes into structured data. Given a resume text, extract and respond with ONLY valid JSON (no markdown code fences):
{"name": "string", "yearsOfExperience": number, "skills": ["skill1", "skill2"], "education": "highest degree + school", "recentRole": "most recent job title + company", "summary": "2-sentence professional summary"}`,
})

// --- Council: Three Evaluators ---
const techSkillsAgent = new Agent({
  id: 'tech-evaluator',
  model,
  instructions: `You evaluate a candidate's technical skills against a job description. Consider: skill match, depth of experience, relevant projects.
Respond with ONLY valid JSON (no markdown code fences):
{"score": 1-10, "reasoning": "2-3 sentence explanation"}`,
})

const cultureFitAgent = new Agent({
  id: 'culture-evaluator',
  model,
  instructions: `You evaluate a candidate's cultural fit based on their background. Consider: communication style, career trajectory, values alignment, team dynamics.
Respond with ONLY valid JSON (no markdown code fences):
{"score": 1-10, "reasoning": "2-3 sentence explanation"}`,
})

const growthAgent = new Agent({
  id: 'growth-evaluator',
  model,
  instructions: `You evaluate a candidate's growth potential. Consider: learning trajectory, career progression, breadth of experience, adaptability signals.
Respond with ONLY valid JSON (no markdown code fences):
{"score": 1-10, "reasoning": "2-3 sentence explanation"}`,
})

// --- Supervisor Step 3: Final Reviewer ---
const clarificationAgent = new Agent({
  id: 'clarification',
  model,
  description: 'Generates follow-up questions about a candidate when more information is needed before making a final decision.',
  instructions: `You generate specific follow-up questions about a candidate based on gaps or concerns in the evaluation. Output 2-3 targeted questions.`,
})

const finalReviewAgent = new Agent({
  id: 'final-reviewer',
  model,
  instructions: `You are the hiring committee lead. Given a parsed resume and three evaluation scores (technical skills, cultural fit, growth potential), make a final hiring recommendation.

If scores are clear (all above 7 or all below 4), decide directly.
If scores are mixed or borderline, delegate to clarification agent to generate follow-up questions.

End with a clear recommendation: RECOMMEND, REJECT, or NEED_MORE_INFO.`,
  agents: { clarificationAgent },
})

interface EvalResult {
  score: number
  reasoning: string
}

function parseEval(text: string): EvalResult {
  try {
    return JSON.parse(text)
  } catch {
    return { score: 5, reasoning: text }
  }
}

async function run(input: Record<string, string>, emit: EmitFn) {
  const { resume, jobDescription } = input

  // === WORKFLOW STEP 1: Parse Resume ===
  emit({ type: 'node:active', nodeId: 'parser' })
  const parseResult = await parserAgent.generate([{ role: 'user', content: resume }])
  let candidate
  try {
    candidate = JSON.parse(parseResult.text)
  } catch {
    candidate = { name: 'Unknown', summary: parseResult.text }
  }
  emit({ type: 'node:complete', nodeId: 'parser', output: candidate })

  // === COUNCIL STEP 2: Parallel Evaluation ===
  const evalPrompt = `Job Description:\n${jobDescription}\n\nCandidate:\n${JSON.stringify(candidate, null, 2)}`

  emit({ type: 'edge:active', edgeId: 'parser-to-council' })
  emit({ type: 'edge:active', edgeId: 'parser-to-culture' })
  emit({ type: 'edge:active', edgeId: 'parser-to-growth' })
  emit({ type: 'node:active', nodeId: 'tech-evaluator' })
  emit({ type: 'node:active', nodeId: 'culture-evaluator' })
  emit({ type: 'node:active', nodeId: 'growth-evaluator' })

  const [techScore, cultureScore, growthScore] = await Promise.all([
    techSkillsAgent.generate([{ role: 'user', content: `Evaluate technical skills:\n${evalPrompt}` }]).then((r) => {
      emit({ type: 'node:complete', nodeId: 'tech-evaluator' })
      return parseEval(r.text)
    }),
    cultureFitAgent.generate([{ role: 'user', content: `Evaluate cultural fit:\n${evalPrompt}` }]).then((r) => {
      emit({ type: 'node:complete', nodeId: 'culture-evaluator' })
      return parseEval(r.text)
    }),
    growthAgent.generate([{ role: 'user', content: `Evaluate growth potential:\n${evalPrompt}` }]).then((r) => {
      emit({ type: 'node:complete', nodeId: 'growth-evaluator' })
      return parseEval(r.text)
    }),
  ])

  emit({ type: 'edge:complete', edgeId: 'parser-to-council' })
  emit({ type: 'edge:complete', edgeId: 'parser-to-culture' })
  emit({ type: 'edge:complete', edgeId: 'parser-to-growth' })

  // === SUPERVISOR STEP 3: Final Review ===
  emit({ type: 'edge:active', edgeId: 'council-to-reviewer' })
  emit({ type: 'edge:active', edgeId: 'culture-to-reviewer' })
  emit({ type: 'edge:active', edgeId: 'growth-to-reviewer' })
  emit({ type: 'node:active', nodeId: 'final-reviewer' })

  const reviewInput = `Candidate: ${candidate.name}
Resume Summary: ${candidate.summary}

Evaluation Scores:
- Technical Skills: ${techScore.score}/10 — ${techScore.reasoning}
- Cultural Fit: ${cultureScore.score}/10 — ${cultureScore.reasoning}
- Growth Potential: ${growthScore.score}/10 — ${growthScore.reasoning}

Average Score: ${((techScore.score + cultureScore.score + growthScore.score) / 3).toFixed(1)}/10

Make your final recommendation.`

  const finalResult = await finalReviewAgent.generate([{ role: 'user', content: reviewInput }], {
    maxSteps: 3,
    onStepFinish: (step) => {
      for (const toolCall of step.toolCalls || []) {
        emit({ type: 'node:active', nodeId: 'clarification' })
      }
      for (const toolResult of step.toolResults || []) {
        emit({ type: 'node:complete', nodeId: 'clarification' })
      }
    },
  })

  emit({ type: 'edge:complete', edgeId: 'council-to-reviewer' })
  emit({ type: 'edge:complete', edgeId: 'culture-to-reviewer' })
  emit({ type: 'edge:complete', edgeId: 'growth-to-reviewer' })
  emit({ type: 'node:complete', nodeId: 'final-reviewer', output: { preview: finalResult.text.slice(0, 200) } })

  return {
    candidate,
    scores: { technical: techScore, cultureFit: cultureScore, growth: growthScore },
    recommendation: finalResult.text,
  }
}

export const hybridDemo: Demo = {
  meta: {
    id: '05-hybrid',
    name: 'Hiring Evaluation System',
    nameZh: '招聘评估系统',
    pattern: 'Hybrid (Workflow + Council + Supervisor)',
    description: 'Workflow pipeline → Council parallel evaluation → Supervisor final review. Three patterns nested in one system.',
    inputs: [
      { id: 'resume', label: 'Resume', type: 'textarea', placeholder: 'Paste candidate resume here...' },
      { id: 'jobDescription', label: 'Job Description', type: 'textarea', placeholder: 'Paste job description here...' },
    ],
  },
  run,
}
```

- [ ] **Step 2: Register in demos/index.ts**

Add import and entry for `hybridDemo` with key `'05-hybrid'`.

- [ ] **Step 3: Verify via CLI**

Run: `cd agent/mastra-orchestration && npx tsx server/cli.ts 05-hybrid '{"resume":"John Doe, 5 years experience in Python, React, AWS. Senior Engineer at Acme Corp. MS in Computer Science from MIT.","jobDescription":"Looking for a senior full-stack engineer with 3+ years of React and cloud experience."}'`
Expected: Parser → 3 parallel evaluators → final reviewer (may or may not call clarification agent).

- [ ] **Step 4: Commit**

```bash
git add agent/mastra-orchestration/server/demos/
git commit -m "feat: add demo 05 — Hybrid (Hiring Evaluation System)"
```

---

## Task 8: Frontend Scaffolding

**Files:**
- Create: `agent/mastra-orchestration/src/main.tsx`
- Create: `agent/mastra-orchestration/src/App.tsx`
- Create: `agent/mastra-orchestration/src/App.css`
- Create: `agent/mastra-orchestration/src/types.ts`

- [ ] **Step 1: Create src/types.ts — frontend type definitions**

Mirror the server's SSE event types and demo metadata types for the frontend:

```typescript
export type SSEEvent =
  | { type: 'node:active'; nodeId: string }
  | { type: 'node:complete'; nodeId: string; output?: unknown }
  | { type: 'node:error'; nodeId: string; error: string }
  | { type: 'edge:active'; edgeId: string }
  | { type: 'edge:complete'; edgeId: string }
  | { type: 'stream:chunk'; nodeId: string; text: string }
  | { type: 'run:complete'; result: unknown }

export interface DemoInput {
  id: string
  label: string
  type: 'text' | 'textarea'
  placeholder: string
}

export interface DemoMeta {
  id: string
  name: string
  nameZh: string
  pattern: string
  description: string
  inputs: DemoInput[]
}

export type NodeStatus = 'idle' | 'active' | 'complete' | 'error'
export type EdgeStatus = 'idle' | 'active' | 'complete'
```

- [ ] **Step 2: Create src/main.tsx**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './App.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 3: Create src/App.tsx — main app shell**

```tsx
import { useState, useEffect } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { DemoSelector } from './components/DemoSelector'
import { FlowCanvas } from './components/FlowCanvas'
import { InputPanel } from './components/InputPanel'
import { OutputPanel } from './components/OutputPanel'
import { useDemo } from './hooks/useDemo'
import type { DemoMeta } from './types'

export default function App() {
  const [demoList, setDemoList] = useState<DemoMeta[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const { nodeStates, edgeStates, logs, result, running, runDemo } = useDemo()

  useEffect(() => {
    fetch('/api/demos')
      .then((r) => r.json())
      .then((list: DemoMeta[]) => {
        setDemoList(list)
        if (list.length > 0) setSelectedId(list[0].id)
      })
  }, [])

  const selectedDemo = demoList.find((d) => d.id === selectedId)

  return (
    <div className="app">
      <header className="app-header">
        <h1>Mastra Orchestration Demos</h1>
      </header>
      <div className="app-body">
        <DemoSelector demos={demoList} selectedId={selectedId} onSelect={setSelectedId} />
        <div className="app-main">
          <ReactFlowProvider>
            <div className="canvas-area">
              <FlowCanvas demoId={selectedId} nodeStates={nodeStates} edgeStates={edgeStates} />
            </div>
          </ReactFlowProvider>
          <div className="panels">
            <InputPanel
              demo={selectedDemo}
              running={running}
              onRun={(input) => runDemo(selectedId, input)}
            />
            <OutputPanel logs={logs} result={result} />
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create src/App.css — dark theme layout**

```css
:root {
  --bg-primary: #0a0b10;
  --bg-secondary: #12131a;
  --bg-tertiary: #1a1b24;
  --border: #2a2b36;
  --text: #e0e0e0;
  --text-dim: rgba(255, 255, 255, 0.5);
  --accent: #34d399;
  --accent-dim: rgba(52, 211, 153, 0.2);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, sans-serif;
  background: var(--bg-primary);
  color: var(--text);
}

.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  padding: 12px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-secondary);
}

.app-header h1 {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent);
  font-family: 'JetBrains Mono', monospace;
}

.app-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.canvas-area {
  flex: 1;
  min-height: 0;
}

.panels {
  display: flex;
  height: 260px;
  border-top: 1px solid var(--border);
}

/* DemoSelector sidebar */
.demo-selector {
  width: 220px;
  border-right: 1px solid var(--border);
  background: var(--bg-secondary);
  overflow-y: auto;
  padding: 8px;
}

.demo-item {
  padding: 10px 12px;
  margin-bottom: 4px;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s;
}

.demo-item:hover {
  background: var(--bg-tertiary);
}

.demo-item.active {
  background: var(--accent-dim);
  border-color: var(--accent);
}

.demo-item .pattern {
  font-size: 11px;
  color: var(--accent);
  font-family: 'JetBrains Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.demo-item .name {
  font-size: 13px;
  margin-top: 2px;
}

/* Input/Output panels */
.input-panel, .output-panel {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
}

.input-panel {
  border-right: 1px solid var(--border);
}

.input-panel label {
  display: block;
  font-size: 12px;
  color: var(--text-dim);
  margin-bottom: 4px;
}

.input-panel input,
.input-panel textarea {
  width: 100%;
  padding: 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text);
  font-size: 13px;
  font-family: inherit;
  margin-bottom: 8px;
  resize: vertical;
}

.input-panel textarea {
  min-height: 60px;
}

.run-btn {
  padding: 8px 20px;
  background: var(--accent);
  color: #000;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  font-size: 13px;
}

.run-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.output-panel pre {
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--text-dim);
  line-height: 1.6;
}

.output-panel .log-active { color: #fbbf24; }
.output-panel .log-complete { color: #4ade80; }
.output-panel .log-error { color: #f87171; }
.output-panel .log-result { color: var(--text); }

/* React Flow overrides */
.react-flow__background {
  background: var(--bg-primary) !important;
}
```

- [ ] **Step 5: Verify frontend compiles**

Run: `cd agent/mastra-orchestration && npx vite build --mode development 2>&1 | head -20`
Expected: Build may show warnings about missing components (they'll be created in subsequent tasks), but no TypeScript syntax errors.

Note: the build will fail until the component files referenced in App.tsx are created. That's expected — they are implemented in Tasks 9-11.

- [ ] **Step 6: Commit**

```bash
git add agent/mastra-orchestration/src/ agent/mastra-orchestration/index.html
git commit -m "feat: add frontend scaffolding (App shell, styles, types)"
```

---

## Task 9: React Flow Components

**Files:**
- Create: `agent/mastra-orchestration/src/components/DemoSelector.tsx`
- Create: `agent/mastra-orchestration/src/components/AgentNode.tsx`
- Create: `agent/mastra-orchestration/src/components/AnimatedEdge.tsx`
- Create: `agent/mastra-orchestration/src/components/FlowCanvas.tsx`
- Create: `agent/mastra-orchestration/src/components/InputPanel.tsx`
- Create: `agent/mastra-orchestration/src/components/OutputPanel.tsx`

- [ ] **Step 1: Create DemoSelector.tsx**

```tsx
import type { DemoMeta } from '../types'

interface Props {
  demos: DemoMeta[]
  selectedId: string
  onSelect: (id: string) => void
}

export function DemoSelector({ demos, selectedId, onSelect }: Props) {
  return (
    <div className="demo-selector">
      {demos.map((demo) => (
        <div
          key={demo.id}
          className={`demo-item ${demo.id === selectedId ? 'active' : ''}`}
          onClick={() => onSelect(demo.id)}
        >
          <div className="pattern">{demo.pattern}</div>
          <div className="name">{demo.nameZh}</div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create AgentNode.tsx — custom React Flow node**

```tsx
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { NodeStatus } from '../types'

export interface AgentNodeData {
  label: string
  sublabel?: string
  status: NodeStatus
  [key: string]: unknown
}

const statusColors: Record<NodeStatus, string> = {
  idle: '#2a2b36',
  active: '#fbbf24',
  complete: '#4ade80',
  error: '#f87171',
}

export function AgentNode({ data }: NodeProps) {
  const nodeData = data as AgentNodeData
  const status = nodeData.status || 'idle'
  const borderColor = statusColors[status]
  const isActive = status === 'active'

  return (
    <div
      style={{
        background: '#12131a',
        border: `2px solid ${borderColor}`,
        borderRadius: 8,
        padding: '10px 16px',
        minWidth: 140,
        textAlign: 'center',
        boxShadow: isActive ? `0 0 16px ${borderColor}40` : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: borderColor }} />
      <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e0e0' }}>{nodeData.label}</div>
      {nodeData.sublabel && (
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{nodeData.sublabel}</div>
      )}
      {isActive && (
        <div style={{ fontSize: 10, color: '#fbbf24', marginTop: 4 }}>working...</div>
      )}
      <Handle type="source" position={Position.Bottom} style={{ background: borderColor }} />
    </div>
  )
}
```

- [ ] **Step 3: Create AnimatedEdge.tsx — custom React Flow edge**

```tsx
import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react'
import type { EdgeStatus } from '../types'

export interface AnimatedEdgeData {
  status: EdgeStatus
  [key: string]: unknown
}

export function AnimatedEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data } = props
  const edgeData = data as AnimatedEdgeData | undefined
  const status = edgeData?.status || 'idle'

  const [edgePath] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition })

  const colors: Record<EdgeStatus, string> = {
    idle: '#2a2b36',
    active: '#fbbf24',
    complete: '#4ade80',
  }

  return (
    <BaseEdge
      path={edgePath}
      style={{
        stroke: colors[status],
        strokeWidth: status === 'idle' ? 1 : 2,
        strokeDasharray: status === 'active' ? '6 4' : 'none',
        animation: status === 'active' ? 'dash 0.6s linear infinite' : 'none',
        transition: 'stroke 0.3s ease',
      }}
    />
  )
}
```

Add the dash animation in `App.css`:
```css
@keyframes dash {
  to { stroke-dashoffset: -20; }
}
```

- [ ] **Step 4: Create FlowCanvas.tsx — React Flow wrapper**

```tsx
import { useMemo } from 'react'
import { ReactFlow, Background, type Node, type Edge } from '@xyflow/react'
import { AgentNode } from './AgentNode'
import { AnimatedEdge } from './AnimatedEdge'
import { getLayout } from '../layouts/index'
import type { NodeStatus, EdgeStatus } from '../types'

const nodeTypes = { agent: AgentNode }
const edgeTypes = { animated: AnimatedEdge }

interface Props {
  demoId: string
  nodeStates: Record<string, NodeStatus>
  edgeStates: Record<string, EdgeStatus>
}

export function FlowCanvas({ demoId, nodeStates, edgeStates }: Props) {
  const { nodes, edges } = useMemo(() => {
    const layout = getLayout(demoId)
    if (!layout) return { nodes: [], edges: [] }

    const n: Node[] = layout.nodes.map((node) => ({
      ...node,
      type: 'agent',
      data: { ...node.data, status: nodeStates[node.id] || 'idle' },
    }))

    const e: Edge[] = layout.edges.map((edge) => ({
      ...edge,
      type: 'animated',
      data: { ...edge.data, status: edgeStates[edge.id] || 'idle' },
    }))

    return { nodes: n, edges: e }
  }, [demoId, nodeStates, edgeStates])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      proOptions={{ hideAttribution: true }}
    >
      <Background color="#1a1b24" gap={24} />
    </ReactFlow>
  )
}
```

- [ ] **Step 5: Create InputPanel.tsx**

```tsx
import { useState } from 'react'
import type { DemoMeta } from '../types'

interface Props {
  demo: DemoMeta | undefined
  running: boolean
  onRun: (input: Record<string, string>) => void
}

export function InputPanel({ demo, running, onRun }: Props) {
  const [values, setValues] = useState<Record<string, string>>({})

  if (!demo) return <div className="input-panel" />

  const handleRun = () => {
    onRun(values)
  }

  return (
    <div className="input-panel">
      {demo.inputs.map((inp) => (
        <div key={inp.id}>
          <label>{inp.label}</label>
          {inp.type === 'textarea' ? (
            <textarea
              placeholder={inp.placeholder}
              value={values[inp.id] || ''}
              onChange={(e) => setValues({ ...values, [inp.id]: e.target.value })}
            />
          ) : (
            <input
              type="text"
              placeholder={inp.placeholder}
              value={values[inp.id] || ''}
              onChange={(e) => setValues({ ...values, [inp.id]: e.target.value })}
            />
          )}
        </div>
      ))}
      <button className="run-btn" disabled={running} onClick={handleRun}>
        {running ? 'Running...' : 'Run'}
      </button>
    </div>
  )
}
```

- [ ] **Step 6: Create OutputPanel.tsx**

```tsx
interface LogEntry {
  type: string
  text: string
  className: string
}

interface Props {
  logs: LogEntry[]
  result: unknown
}

export function OutputPanel({ logs, result }: Props) {
  return (
    <div className="output-panel">
      <pre>
        {logs.map((log, i) => (
          <div key={i} className={log.className}>{log.text}</div>
        ))}
        {result && (
          <div className="log-result">
            {'\n=== Result ===\n'}
            {JSON.stringify(result, null, 2)}
          </div>
        )}
      </pre>
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add agent/mastra-orchestration/src/components/
git commit -m "feat: add React Flow components (AgentNode, AnimatedEdge, FlowCanvas, panels)"
```

---

## Task 10: Demo Layouts

**Files:**
- Create: `agent/mastra-orchestration/src/layouts/index.ts`
- Create: `agent/mastra-orchestration/src/layouts/workflow.ts`
- Create: `agent/mastra-orchestration/src/layouts/supervisor.ts`
- Create: `agent/mastra-orchestration/src/layouts/handoff.ts`
- Create: `agent/mastra-orchestration/src/layouts/council.ts`
- Create: `agent/mastra-orchestration/src/layouts/hybrid.ts`

Each layout defines node positions and edges for a demo's flow graph. Nodes use `type: 'agent'`, edges use `type: 'animated'`.

- [ ] **Step 1: Create layouts/workflow.ts**

```typescript
export const workflowLayout = {
  nodes: [
    { id: 'writer', position: { x: 0, y: 100 }, data: { label: 'Writer Agent', sublabel: 'Draft Article' } },
    { id: 'seo', position: { x: 250, y: 100 }, data: { label: 'SEO Agent', sublabel: 'Optimize' } },
    { id: 'social', position: { x: 500, y: 100 }, data: { label: 'Social Agent', sublabel: 'Generate Posts' } },
  ],
  edges: [
    { id: 'writer-to-seo', source: 'writer', target: 'seo' },
    { id: 'seo-to-social', source: 'seo', target: 'social' },
  ],
}
```

Note: Handle positions for horizontal layouts — the implementing agent should adjust `AgentNode` to support `Position.Left` / `Position.Right` handles, or reposition nodes vertically. Choose whichever looks better in the canvas. The core requirement is: the layout must visually communicate the pattern (sequential for workflow, star for supervisor, fan-out/fan-in for council, etc).

- [ ] **Step 2: Create layouts/supervisor.ts**

```typescript
export const supervisorLayout = {
  nodes: [
    { id: 'supervisor', position: { x: 250, y: 0 }, data: { label: 'Supervisor', sublabel: 'Coordinator' } },
    { id: 'searchAgent', position: { x: 0, y: 180 }, data: { label: 'Search Agent', sublabel: 'Web Search' } },
    { id: 'analysisAgent', position: { x: 250, y: 180 }, data: { label: 'Analysis Agent', sublabel: 'Data Analysis' } },
    { id: 'writingAgent', position: { x: 500, y: 180 }, data: { label: 'Writing Agent', sublabel: 'Report Writing' } },
  ],
  edges: [
    { id: 'supervisor-to-searchAgent', source: 'supervisor', target: 'searchAgent' },
    { id: 'supervisor-to-analysisAgent', source: 'supervisor', target: 'analysisAgent' },
    { id: 'supervisor-to-writingAgent', source: 'supervisor', target: 'writingAgent' },
  ],
}
```

- [ ] **Step 3: Create layouts/handoff.ts**

```typescript
export const handoffLayout = {
  nodes: [
    { id: 'triage', position: { x: 0, y: 100 }, data: { label: 'Triage Agent', sublabel: 'Classify' } },
    { id: 'tech-support', position: { x: 300, y: 0 }, data: { label: 'Tech Support', sublabel: 'Technical Issues' } },
    { id: 'refund', position: { x: 300, y: 100 }, data: { label: 'Refund Agent', sublabel: 'Refund Requests' } },
    { id: 'billing', position: { x: 300, y: 200 }, data: { label: 'Billing Agent', sublabel: 'Billing Questions' } },
  ],
  edges: [
    { id: 'triage-to-tech-support', source: 'triage', target: 'tech-support' },
    { id: 'triage-to-refund', source: 'triage', target: 'refund' },
    { id: 'triage-to-billing', source: 'triage', target: 'billing' },
  ],
}
```

- [ ] **Step 4: Create layouts/council.ts**

```typescript
export const councilLayout = {
  nodes: [
    { id: 'security-reviewer', position: { x: 0, y: 0 }, data: { label: 'Security Reviewer', sublabel: 'Vulnerabilities' } },
    { id: 'performance-reviewer', position: { x: 250, y: 0 }, data: { label: 'Performance Reviewer', sublabel: 'Optimization' } },
    { id: 'readability-reviewer', position: { x: 500, y: 0 }, data: { label: 'Readability Reviewer', sublabel: 'Code Quality' } },
    { id: 'synthesis', position: { x: 250, y: 180 }, data: { label: 'Synthesis Agent', sublabel: 'Final Verdict' } },
  ],
  edges: [
    { id: 'reviewers-to-synthesis', source: 'security-reviewer', target: 'synthesis' },
    { id: 'perf-to-synthesis', source: 'performance-reviewer', target: 'synthesis' },
    { id: 'read-to-synthesis', source: 'readability-reviewer', target: 'synthesis' },
  ],
}
```

- [ ] **Step 5: Create layouts/hybrid.ts**

```typescript
export const hybridLayout = {
  nodes: [
    { id: 'parser', position: { x: 250, y: 0 }, data: { label: 'Resume Parser', sublabel: 'Step 1: Workflow' } },
    { id: 'tech-evaluator', position: { x: 0, y: 150 }, data: { label: 'Tech Skills', sublabel: 'Council' } },
    { id: 'culture-evaluator', position: { x: 250, y: 150 }, data: { label: 'Culture Fit', sublabel: 'Council' } },
    { id: 'growth-evaluator', position: { x: 500, y: 150 }, data: { label: 'Growth Potential', sublabel: 'Council' } },
    { id: 'final-reviewer', position: { x: 250, y: 300 }, data: { label: 'Final Reviewer', sublabel: 'Step 3: Supervisor' } },
    { id: 'clarification', position: { x: 500, y: 300 }, data: { label: 'Clarification', sublabel: 'Sub-agent' } },
  ],
  edges: [
    { id: 'parser-to-council', source: 'parser', target: 'tech-evaluator' },
    { id: 'parser-to-culture', source: 'parser', target: 'culture-evaluator' },
    { id: 'parser-to-growth', source: 'parser', target: 'growth-evaluator' },
    { id: 'council-to-reviewer', source: 'tech-evaluator', target: 'final-reviewer' },
    { id: 'culture-to-reviewer', source: 'culture-evaluator', target: 'final-reviewer' },
    { id: 'growth-to-reviewer', source: 'growth-evaluator', target: 'final-reviewer' },
    { id: 'reviewer-to-clarification', source: 'final-reviewer', target: 'clarification' },
  ],
}
```

- [ ] **Step 6: Create layouts/index.ts**

```typescript
import { workflowLayout } from './workflow'
import { supervisorLayout } from './supervisor'
import { handoffLayout } from './handoff'
import { councilLayout } from './council'
import { hybridLayout } from './hybrid'

const layouts: Record<string, typeof workflowLayout> = {
  '01-workflow': workflowLayout,
  '02-supervisor': supervisorLayout,
  '03-handoff': handoffLayout,
  '04-council': councilLayout,
  '05-hybrid': hybridLayout,
}

export function getLayout(demoId: string) {
  return layouts[demoId]
}
```

- [ ] **Step 7: Commit**

```bash
git add agent/mastra-orchestration/src/layouts/
git commit -m "feat: add React Flow layouts for all 5 demos"
```

---

## Task 11: useDemo Hook & Integration

**Files:**
- Create: `agent/mastra-orchestration/src/hooks/useDemo.ts`

- [ ] **Step 1: Create useDemo.ts — SSE connection and state management**

```typescript
import { useState, useCallback, useRef } from 'react'
import type { SSEEvent, NodeStatus, EdgeStatus } from '../types'

interface LogEntry {
  type: string
  text: string
  className: string
}

export function useDemo() {
  const [nodeStates, setNodeStates] = useState<Record<string, NodeStatus>>({})
  const [edgeStates, setEdgeStates] = useState<Record<string, EdgeStatus>>({})
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [result, setResult] = useState<unknown>(null)
  const [running, setRunning] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const addLog = (type: string, text: string, className: string) => {
    setLogs((prev) => [...prev, { type, text, className }])
  }

  const handleEvent = useCallback((event: SSEEvent) => {
    switch (event.type) {
      case 'node:active':
        setNodeStates((prev) => ({ ...prev, [event.nodeId]: 'active' }))
        addLog(event.type, `⚡ ${event.nodeId} started`, 'log-active')
        break
      case 'node:complete':
        setNodeStates((prev) => ({ ...prev, [event.nodeId]: 'complete' }))
        addLog(event.type, `✅ ${event.nodeId} complete`, 'log-complete')
        break
      case 'node:error':
        setNodeStates((prev) => ({ ...prev, [event.nodeId]: 'error' }))
        addLog(event.type, `❌ ${event.nodeId}: ${event.error}`, 'log-error')
        break
      case 'edge:active':
        setEdgeStates((prev) => ({ ...prev, [event.edgeId]: 'active' }))
        break
      case 'edge:complete':
        setEdgeStates((prev) => ({ ...prev, [event.edgeId]: 'complete' }))
        break
      case 'stream:chunk':
        addLog(event.type, event.text, '')
        break
      case 'run:complete':
        setResult(event.result)
        break
    }
  }, [])

  const runDemo = useCallback(async (demoId: string, input: Record<string, string>) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setNodeStates({})
    setEdgeStates({})
    setLogs([])
    setResult(null)
    setRunning(true)

    try {
      const res = await fetch(`/api/demos/${demoId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: controller.signal,
      })

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event: SSEEvent = JSON.parse(line.slice(6))
              handleEvent(event)
            } catch {
              // skip malformed events
            }
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        addLog('error', `Connection error: ${err}`, 'log-error')
      }
    } finally {
      setRunning(false)
    }
  }, [handleEvent])

  return { nodeStates, edgeStates, logs, result, running, runDemo }
}
```

- [ ] **Step 2: Verify full frontend builds**

Run: `cd agent/mastra-orchestration && npx vite build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add agent/mastra-orchestration/src/hooks/
git commit -m "feat: add useDemo hook for SSE connection and state management"
```

---

## Task 12: End-to-End Verification

- [ ] **Step 1: Copy .env.example to .env and configure**

The user will configure the `.env` file with their API key and model settings. Skip this step if `.env` already exists.

- [ ] **Step 2: Start the dev environment**

Run: `cd agent/mastra-orchestration && npm run dev`
Expected: Both server (port 3001) and Vite (port 5173) start successfully.

- [ ] **Step 3: Verify API endpoint**

Open: `http://localhost:5173`
Expected: The app loads with the demo selector on the left showing all 5 demos.

- [ ] **Step 4: Test Demo 01 (Workflow)**

Select "博客发布流水线", enter a topic (e.g. "AI programming"), click Run.
Expected: Nodes light up sequentially (writer → seo → social), edges animate between them, output panel shows logs, result appears when complete.

- [ ] **Step 5: Test Demo 02 (Supervisor)**

Select "深度调研助手", enter a research question, click Run.
Expected: Supervisor node activates, then sub-agent nodes light up as they are delegated to. Order may vary between runs.

- [ ] **Step 6: Test Demo 03 (Handoff)**

Select "多部门客服", enter a customer message about billing, click Run.
Expected: Triage activates → classifies → billing agent activates (only one branch lights up).

- [ ] **Step 7: Test Demo 04 (Council)**

Select "代码审查委员会", paste some code, click Run.
Expected: Three reviewer nodes activate simultaneously, then synthesis node activates after all three complete.

- [ ] **Step 8: Test Demo 05 (Hybrid)**

Select "招聘评估系统", enter resume + JD, click Run.
Expected: Parser → 3 evaluators in parallel → final reviewer → possibly clarification agent.

- [ ] **Step 9: Fix any issues found during testing**

Address any rendering, SSE connection, or agent execution issues discovered during manual testing.

- [ ] **Step 10: Commit all fixes**

```bash
git add -A
git commit -m "fix: address issues found during end-to-end testing"
```
