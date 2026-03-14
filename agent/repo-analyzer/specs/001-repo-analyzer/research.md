# Research: GitHub 仓库智能分析助手

## R-001: Mastra Agent + Tool Calling 模式

**Decision**: 使用 `@mastra/core` 的 `Agent` 类和 `createTool` 定义 Agent 和工具

**Rationale**:
- Mastra 提供 TypeScript-first 的 Agent 框架，`createTool` 使用 zod 定义 inputSchema/outputSchema
- 与 Vercel AI SDK v5 通过 `@mastra/ai-sdk` 桥接，`handleChatStream` 处理流式响应
- Agent 通过 `instructions` 配置系统提示，`tools` 以命名对象形式传入

**关键 API**:
```typescript
// 工具定义
import { createTool } from '@mastra/core/tools'
createTool({ id, description, inputSchema, outputSchema, execute })

// Agent 定义
import { Agent } from '@mastra/core/agent'
new Agent({ id, name, instructions, model, tools })

// 流式桥接
import { handleChatStream } from '@mastra/ai-sdk'
handleChatStream({ mastra, agentId, params })
```

**Alternatives considered**:
- 直接使用 Vercel AI SDK 的 `streamText` + `tool()` — 缺少 Mastra 的 Workflow 能力
- LangChain.js — 过于复杂，不符合最小可运行原则

---

## R-002: Mastra Workflow + Human-in-the-Loop

**Decision**: 使用 `createWorkflow` + `createStep` 编排四步流程，`suspend/resume` 实现 HITL

**Rationale**:
- `createWorkflow` 支持 `.then()` 链式编排，每步有独立的 inputSchema/outputSchema
- `suspend(payload)` 暂停执行并持久化状态，`run.resume({ step, resumeData })` 恢复
- `suspendSchema` / `resumeSchema` 提供类型安全的暂停/恢复数据校验
- 使用 `stateSchema` 在步骤间共享可变状态（如收集的仓库数据）

**关键 API**:
```typescript
import { createWorkflow, createStep } from '@mastra/core/workflows'

// 步骤 execute 签名
execute: async ({ inputData, resumeData, suspend, bail, state, setState })

// 启动和恢复
const run = await workflow.createRun()
const result = await run.start({ inputData })
// result.status === 'suspended' 时：
await run.resume({ step: 'approval', resumeData: { approved: true } })
```

**Alternatives considered**:
- 手写状态机 — 缺乏持久化和类型安全
- Temporal/Inngest — 引入额外基础设施，过于复杂

---

## R-003: 持久化存储（LibSQL）

**Decision**: 使用 `@mastra/libsql` 的 `LibSQLStore` 配置本地 SQLite 文件存储

**Rationale**:
- `LibSQLStore({ url: 'file:./storage.db' })` 零配置本地存储
- 自动创建 `mastra_workflow_snapshot` 等表
- suspend 时自动持久化，resume 时通过 runId 恢复
- 无需外部数据库服务，教学友好

**配置**:
```typescript
import { LibSQLStore } from '@mastra/libsql'
new Mastra({
  storage: new LibSQLStore({ url: 'file:./storage.db' }),
})
```

---

## R-004: Vercel AI SDK v5 聊天界面

**Decision**: 使用 `useChat` hook + `message.parts` 渲染工具调用状态

**Rationale**:
- v5 的 `useChat` 返回 `sendMessage()` 和 `status`（ready/submitted/streaming/error）
- 消息通过 `message.parts` 数组渲染，工具调用为 `tool-{toolName}` 类型
- 工具部分有 `state` 属性：input-streaming → input-available → output-available / output-error
- 非常适合展示工具调用实时状态

**关键变更（v5 vs v4）**:
- `sendMessage()` 替代 `handleSubmit`
- `message.parts` 替代 `message.content` + `toolInvocations`
- `convertToModelMessages()` 替代直接传 messages（需 await）
- `toUIMessageStreamResponse()` 替代 `toDataStreamResponse()`
- `stopWhen: stepCountIs(n)` 替代 `maxSteps`
- `inputSchema` 替代 `parameters`

---

## R-005: 多模型提供商支持

**Decision**: 使用 `createProviderRegistry` 创建模型注册表，通过环境变量切换

**Rationale**:
- `createProviderRegistry({ openai, anthropic })` 注册多个提供商
- `registry.languageModel('anthropic:claude-sonnet-4-5')` 统一调用
- 环境变量 `MODEL_PROVIDER` + `MODEL_NAME` 组合为模型 ID
- Mastra Agent 的 `model` 参数接受 `provider/model` 格式字符串

**配置**:
```typescript
import { createProviderRegistry } from 'ai'
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'

const registry = createProviderRegistry({ openai, anthropic })
const MODEL_ID = `${process.env.MODEL_PROVIDER}:${process.env.MODEL_NAME}`
```

---

## R-006: GitHub REST API v3 使用

**Decision**: 直接使用 `fetch` 调用 GitHub REST API，不使用 SDK

**Rationale**:
- Constitution 要求只用原生 fetch，禁止 axios 等
- 仅需两个端点，无需完整 SDK
- 可选 Authorization header 传入 Personal Access Token

**端点**:
- `GET https://api.github.com/repos/{owner}/{repo}` — 仓库基础信息
- `GET https://api.github.com/repos/{owner}/{repo}/contents/{path}` — 目录内容

**速率限制**:
- 无认证：60 次/小时
- 有 Token：5000 次/小时
