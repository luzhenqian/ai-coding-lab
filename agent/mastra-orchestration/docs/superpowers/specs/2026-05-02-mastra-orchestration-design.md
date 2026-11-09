# Mastra Agent Orchestration Demos — Design Spec

## Overview

A teaching project demonstrating the 4 agent orchestration patterns (Supervisor, Workflow, Handoff, Council) + hybrid composition using Mastra. Each pattern has its own real-world scenario. A React Flow-based WebUI visualizes agent interactions in real time.

Located at: `agent/mastra-orchestration/`

## Goals

- Show how each orchestration pattern maps to Mastra code
- Provide runnable, real-world scenarios (not toy examples)
- Visualize agent orchestration with interactive node graphs
- Demonstrate hybrid composition — "不是四选一，是混着用"

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Agent framework**: Mastra (latest, `@mastra/core`)
- **LLM**: configurable via env vars (`OPENAI_API_KEY`, `OPENAI_BASE_URL`, `MODEL_ID`)
- **Frontend**: React + React Flow + Vite
- **Backend**: Mastra built-in HTTP server (`mastra.serve()`)
- **Structure**: Single package (monorepo-friendly, one `package.json`)

## Project Structure

```
agent/mastra-orchestration/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example              # OPENAI_API_KEY, OPENAI_BASE_URL, MODEL_ID
│
├── src/
│   ├── config.ts             # env var reader, exports model config
│   ├── mastra.ts             # Mastra instance, registers all agents/workflows
│   ├── server.ts             # HTTP server entry (mastra.serve() + static files)
│   │
│   ├── demos/
│   │   ├── 01-workflow/      # Blog Publishing Pipeline
│   │   │   ├── agents.ts
│   │   │   ├── workflow.ts
│   │   │   └── run.ts
│   │   │
│   │   ├── 02-supervisor/    # Deep Research Assistant
│   │   │   ├── agents.ts
│   │   │   ├── tools.ts
│   │   │   └── run.ts
│   │   │
│   │   ├── 03-handoff/       # Multi-Department Customer Service
│   │   │   ├── agents.ts
│   │   │   └── run.ts
│   │   │
│   │   ├── 04-council/       # Code Review Committee
│   │   │   ├── agents.ts
│   │   │   ├── workflow.ts
│   │   │   └── run.ts
│   │   │
│   │   └── 05-hybrid/        # Hiring Evaluation System
│   │       ├── agents.ts
│   │       ├── workflow.ts
│   │       └── run.ts
│   │
│   └── web/                  # React frontend
│       ├── index.html
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/
│       │   ├── DemoSelector.tsx    # sidebar to pick a demo
│       │   ├── FlowCanvas.tsx     # React Flow canvas
│       │   ├── AgentNode.tsx      # custom node: agent with status indicator
│       │   ├── StepNode.tsx       # custom node: workflow step
│       │   ├── AnimatedEdge.tsx   # custom edge: animated data flow
│       │   ├── InputPanel.tsx     # input form per demo
│       │   └── OutputPanel.tsx    # streaming output display
│       ├── layouts/
│       │   ├── workflow-layout.ts
│       │   ├── supervisor-layout.ts
│       │   ├── handoff-layout.ts
│       │   ├── council-layout.ts
│       │   └── hybrid-layout.ts
│       └── hooks/
│           └── useDemo.ts        # SSE connection, state management
```

## Environment Variables

```env
# .env.example
OPENAI_API_KEY=sk-your-key-here
OPENAI_BASE_URL=https://api.openai.com/v1
MODEL_ID=gpt-5.5
```

`src/config.ts` reads these and exports a model config object used by all agents. Users only configure once.

## Demo Designs

### 01-Workflow: Blog Publishing Pipeline (博客发布流水线)

**Pattern**: Workflow — fixed path, code decides

**Flow**:
```
Input(topic) → [Writer Agent] draft → [SEO Agent] optimize → [Social Agent] generate summaries → Output
```

**Steps** (strict sequential via `createWorkflow().then().then().then()`):
1. **Writer Agent**: takes topic string, outputs article markdown
2. **SEO Agent**: takes article, outputs `{ title, keywords, metaDescription, optimizedArticle }`
3. **Social Agent**: takes SEO-optimized article, outputs `{ twitter, xiaohongshu }`

**Final output**:
```ts
{
  article: string,
  seo: { title: string, keywords: string[], metaDescription: string },
  social: { twitter: string, xiaohongshu: string }
}
```

**Teaching point**: Path is hardcoded. Each step's input/output strictly typed via Zod schemas. Deterministic, testable.

---

### 02-Supervisor: Deep Research Assistant (深度调研助手)

**Pattern**: Supervisor — one LLM decides the next step

**Structure**:
```
Supervisor Agent
  ├── Search Agent (with webSearchTool)
  ├── Analysis Agent
  └── Writing Agent
```

**Implementation**: `new Agent({ agents: { searchAgent, analysisAgent, writingAgent } })`

- Supervisor receives a research question and dynamically decides: search first? analyze? search again? write?
- `webSearchTool` is a mock tool returning hardcoded results (no external API dependency)
- Uses `maxSteps: 10` to cap iterations

**Teaching point**: Same input can produce different execution paths. LLM has full autonomy over delegation order. Flexible but unpredictable.

---

### 03-Handoff: Multi-Department Customer Service (多部门客服)

**Pattern**: Handoff — no supervisor, current agent passes the baton

**Structure**:
```
Triage Agent → classifies → hands off to:
  ├── Tech Support Agent
  ├── Refund Agent
  └── Billing Agent
```

**Implementation**: Workflow with `.branch()`:
1. Triage Agent step: takes user message, outputs `{ route: 'tech' | 'refund' | 'billing', summary: string }`
2. Branch step: routes to the matched specialist agent
3. Specialist agent handles independently — no callback to Triage

**Key difference from Supervisor**: Triage yields control entirely. It doesn't coordinate or receive results back. The specialist owns the rest of the interaction.

**Teaching point**: Control transfer vs delegation. Current agent decides the next agent. Natural for expert-switching scenarios.

---

### 04-Council: Code Review Committee (代码审查委员会)

**Pattern**: Council — parallel execution, results merged by aggregation

**Structure**:
```
Input(code) → parallel([Security Agent, Performance Agent, Readability Agent]) → Synthesis Agent → Output
```

**Implementation**: `createWorkflow().parallel([...]).then(synthesisStep)`

Each reviewer agent outputs:
```ts
{ score: number, issues: string[], suggestion: string }
```

Synthesis Agent merges three reviews into:
```ts
{ verdict: 'approve' | 'request-changes' | 'reject', overallScore: number, topIssues: string[], summary: string }
```

**Teaching point**: 3 agents work independently on the same input. Different perspectives catch different issues. Quality high, cost 3x.

---

### 05-Hybrid: Hiring Evaluation System (招聘评估系统)

**Pattern**: Workflow + Council + Supervisor nested

**Structure**:
```
Workflow outer pipeline:
  Step 1 (Workflow): Resume Parser Agent → structured candidate data
  Step 2 (Council): parallel evaluation
    ├── Technical Skills Agent → { score, reasoning }
    ├── Culture Fit Agent → { score, reasoning }
    └── Growth Potential Agent → { score, reasoning }
  Step 3 (Supervisor): Final Review Agent
    └── Has sub-agent: Clarification Agent (can ask follow-up questions)
    → Synthesizes council scores + raw data → recommend / reject / need-more-info
```

**Implementation**:
- Outer: `createWorkflow().then(parseStep).then(councilStep).then(supervisorStep)`
- `councilStep` internally runs a nested `parallel()` workflow
- `supervisorStep` uses `new Agent({ agents: { clarificationAgent } })` — may or may not invoke the clarification agent

**Teaching point**: Three patterns nested cleanly. Each layer uses the pattern that fits its job: fixed pipeline for the overall process, parallel voting for evaluation, dynamic decision-making for final review.

## WebUI Design

### Layout

```
┌──────────────────────────────────────────────────────┐
│  [Logo] Mastra Orchestration Demos                   │
├────────┬─────────────────────────────────────────────┤
│        │                                             │
│  Demo  │         React Flow Canvas                   │
│  List  │                                             │
│        │    [Agent nodes with status indicators]     │
│  01 ○  │    [Animated edges showing data flow]       │
│  02 ○  │    [Real-time highlighting of active node]  │
│  03 ○  │                                             │
│  04 ○  │                                             │
│  05 ○  │                                             │
│        ├─────────────────────────────────────────────┤
│        │  Input Panel          │  Output Panel       │
│        │  [form fields]        │  [streaming text]   │
│        │  [Run button]         │  [structured result]│
└────────┴─────────────────────────────────────────────┘
```

### Node Types

- **AgentNode**: rounded rectangle, shows agent name + role icon + status (idle / working / done / error). Glows when active.
- **StepNode**: rectangle for workflow steps, shows step name + progress.
- **InputNode / OutputNode**: entry/exit point markers.

### Edge Animations

- **Idle**: static gray dashed line
- **Active**: animated gradient flow (dots moving along the edge) in the demo's accent color
- **Complete**: solid line with checkmark

### Interaction

- Select demo from sidebar → canvas renders the corresponding flow graph
- Fill input form → click "Run" → backend executes via SSE
- SSE events update node states and edge animations in real time
- Output panel streams agent responses as they arrive

### SSE Event Protocol

Backend sends Server-Sent Events to the frontend:

```ts
type SSEEvent =
  | { type: 'node:active', nodeId: string }
  | { type: 'node:complete', nodeId: string, output: unknown }
  | { type: 'node:error', nodeId: string, error: string }
  | { type: 'edge:active', edgeId: string }
  | { type: 'edge:complete', edgeId: string }
  | { type: 'stream:chunk', nodeId: string, text: string }
  | { type: 'run:complete', result: unknown }
```

### Per-Demo Flow Layouts

Each demo has a predefined React Flow layout (node positions + edges):

1. **Workflow**: horizontal left-to-right pipeline (Input → Agent → Agent → Agent → Output)
2. **Supervisor**: star topology (Supervisor center-top, 3 specialists below, bidirectional edges)
3. **Handoff**: left-to-right with branch (Triage → 3 parallel targets, only active branch highlighted)
4. **Council**: fan-out fan-in (Input → 3 parallel agents → Synthesizer → Output)
5. **Hybrid**: nested groups — outer workflow pipeline with council and supervisor as expandable sub-graphs

## API Endpoints

```
POST /api/demos/:demoId/run    → starts execution, returns SSE stream
GET  /api/demos                → list available demos with metadata
```

## Running the Project

```bash
cd agent/mastra-orchestration
npm install
cp .env.example .env           # fill in API key and model config
npm run dev                    # starts both backend + Vite dev server
```

Single command, single port — Vite proxies API requests to the Mastra server.
