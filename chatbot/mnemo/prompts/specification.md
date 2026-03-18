# Specification: Mnemo — 功能需求与技术规格

## 项目概述

Mnemo 是一个教学型全栈 Chatbot 应用，通过四个递进的 Phase 演示如何从零构建 LLM 记忆系统。每个 Phase 在前一个 Phase 的基础上增量开发，最终实现一个具备会话管理、上下文压缩、长期记忆、知识检索能力的智能对话助手。

---

## Phase 1: 基础对话 + 消息持久化

### 目标

一个能持久化对话历史、支持多会话管理的基础 Chatbot。

### 功能需求

**F1.1 聊天界面**
- 标准聊天 UI：消息列表、输入框、发送按钮
- 支持流式输出（Streaming），逐字显示 AI 回复
- 消息气泡区分用户和 AI，显示时间戳
- 支持 Markdown 渲染（AI 回复中的代码块、列表等）

**F1.2 会话管理**
- 侧边栏展示会话列表，按最近更新排序
- 新建会话按钮
- 点击切换会话，加载对应历史消息
- 删除会话（软删除）

**F1.3 消息持久化**
- 每轮对话（用户消息 + AI 回复）实时存入 PostgreSQL
- 页面刷新或重新访问时，从数据库恢复完整对话历史
- 存储字段包含：`role`, `content`, `createdAt`, `tokenCount`

**F1.4 基础上下文管理**
- 将该会话的历史消息作为上下文发送给 LLM
- 实现滑动窗口策略：只取最近 20 条消息作为上下文
- 当消息总 token 数超过预算（默认 8000 tokens）时，从最旧的消息开始裁剪

### 技术规格

**API Route**: `POST /api/chat`
- 请求体: `{ messages: Message[], conversationId: string }`
- 使用 Vercel AI SDK 的 `streamText` 返回流式响应
- 在 `onFinish` 回调中异步保存消息

**数据库 Schema (Phase 1)**:
- `conversations` 表: `id (uuid PK)`, `title (varchar)`, `userId (varchar)`, `createdAt`, `updatedAt`
- `messages` 表: `id (uuid PK)`, `conversationId (uuid FK)`, `role (enum: user/assistant/system)`, `content (text)`, `tokenCount (integer)`, `createdAt`

**Token 计算**:
- 使用简易估算：英文按 `字符数 / 4`，中文按 `字符数 / 1.5`
- 不需要引入 tiktoken，教学场景够用

---

## Phase 2: 会话摘要 + 上下文压缩

### 目标

解决长对话场景下上下文窗口溢出的问题，实现递进式摘要。

### 功能需求

**F2.1 自动摘要生成**
- 当会话消息数超过阈值（默认 20 条）时，自动触发摘要生成
- 摘要覆盖较旧的消息，最近 10 条消息保留原文
- 摘要更新不阻塞用户对话（异步执行）

**F2.2 递进式上下文组装**
- 上下文结构：`[System Prompt] + [会话摘要（如有）] + [最近 N 条原始消息] + [当前用户消息]`
- 摘要以 system 消息的形式注入，格式为：`"以下是之前对话的摘要：..."`
- 每次触发摘要时，将旧摘要 + 新累积的消息一起重新总结，生成更新的摘要

**F2.3 摘要可视化（教学用）**
- UI 中提供一个"Debug 面板"（可折叠），显示：
  - 当前会话的摘要内容
  - 本次请求的上下文组成：总 token 数、各部分占比
  - 最近一次摘要更新的时间

### 技术规格

**摘要生成逻辑**:
- 使用同一个 LLM (Claude) 生成摘要
- 摘要 Prompt 要求：保留关键事实、决策、用户偏好；丢弃寒暄和重复内容；输出不超过 500 tokens
- 触发条件：`未被摘要覆盖的消息数 >= 20`

**数据库新增 (Phase 2)**:
- `summaries` 表: `id (uuid PK)`, `conversationId (uuid FK)`, `content (text)`, `coveredMessageCount (integer)`, `tokenCount (integer)`, `createdAt`

**上下文组装函数**: `buildConversationContext(conversationId: string)`
- 返回: `{ messages: Message[], debugInfo: { totalTokens, summaryTokens, historyTokens } }`
- Token 预算: 可配置，默认 12000 tokens（为模型回复预留空间）

---

## Phase 3: 长期记忆系统

### 目标

实现跨会话的用户记忆——Chatbot 能"记住"用户在不同会话中透露的个人信息、偏好和事实。

### 功能需求

**F3.1 记忆自动提取**
- 在对话过程中，检测并提取值得长期记忆的用户事实
- 提取结果存储为独立的 memory 条目，每条是一个简洁的陈述句
- 每条记忆带有分类标签：`preference`（偏好）/ `fact`（事实）/ `behavior`（行为模式）

**F3.2 记忆检索与注入**
- 每次用户发送消息时，基于消息内容做语义搜索，找到 Top-K 条最相关的记忆
- 检索到的记忆注入 System Prompt 的指定位置
- 检索使用 pgvector 的余弦相似度

**F3.3 记忆管理界面**
- 独立的「记忆管理」页面，列出当前用户的所有记忆条目
- 每条记忆显示：内容、分类、创建时间、最后命中时间
- 支持手动编辑和删除记忆
- 支持手动添加记忆（用户主动告诉系统要记住什么）

**F3.4 记忆提取的触发策略**
- 不是每轮都做提取（成本考虑），按以下条件触发：
  - 每 5 轮对话做一次批量提取
  - 用户消息中包含关键词（"我是"、"我喜欢"、"记住"、"我住在"等）时立即触发
  - 会话结束时（用户长时间无操作或主动结束）做一次终结提取

**F3.5 记忆去重与更新**
- 新提取的记忆如果和已有记忆语义相似度 > 0.85，视为重复，执行更新而非新增
- 更新时保留旧版本记录（通过 `updatedAt` 字段追踪）

### 技术规格

**记忆提取 Prompt**:
- 输入：最近 N 条消息 + 已有记忆列表
- 输出：JSON 数组，每项包含 `{ content, category, action: "ADD" | "UPDATE", updateTargetId? }`
- 使用 Vercel AI SDK 的 `generateObject` + Zod schema 做结构化输出

**Embedding 生成**:
- 使用 `@ai-sdk/anthropic` 或 `@ai-sdk/openai` 的 embedding 模型
- 备选：OpenAI `text-embedding-3-small`（维度 1536）
- 每条记忆和每条用户消息都生成 embedding

**数据库新增 (Phase 3)**:
- `memories` 表: `id (uuid PK)`, `userId (varchar)`, `content (text)`, `category (enum: preference/fact/behavior)`, `embedding (vector(1536))`, `importanceScore (real, default 1.0)`, `accessCount (integer, default 0)`, `lastAccessedAt (timestamp)`, `createdAt`, `updatedAt`
- 在 `embedding` 列上创建 ivfflat 或 hnsw 索引

**检索参数**:
- Top-K: 5
- 相似度阈值: 0.3（低于此值的结果不注入）
- 注入格式: 在 System Prompt 中以 `## 关于当前用户` 段落呈现，每条记忆为一个列表项

---

## Phase 4: RAG 知识检索

### 目标

为 Chatbot 接入外部知识库，使其能基于特定文档回答问题，并与记忆系统协同工作。

### 功能需求

**F4.1 文档上传与处理**
- 支持上传 `.txt` 和 `.md` 格式的文档
- 上传后自动分块（chunking）、生成 embedding、存入向量数据库
- 分块策略：按段落分割，每块 300-500 tokens，相邻块有 50 tokens 重叠

**F4.2 RAG 检索**
- 用户提问时，同时检索知识库文档和长期记忆
- 检索到的文档块注入上下文，标注来源
- AI 回复中如果引用了文档内容，附带来源标注

**F4.3 完整上下文组装**
- 最终的上下文结构（按注入顺序）：
  1. System Prompt（角色定义、行为规则）
  2. 长期记忆（`## 关于当前用户`）
  3. RAG 检索结果（`## 参考知识`）
  4. 会话摘要（如有）
  5. 最近 N 条对话历史
  6. 当前用户消息
- 各部分有独立的 token 预算分配

**F4.4 Debug 面板增强**
- 在 Phase 2 的 Debug 面板基础上，新增：
  - 检索到的记忆条目（及相似度分数）
  - 检索到的文档块（及来源文件名、相似度分数）
  - 完整的 token 预算分配饼图

### 技术规格

**数据库新增 (Phase 4)**:
- `documents` 表: `id (uuid PK)`, `userId (varchar)`, `filename (varchar)`, `totalChunks (integer)`, `createdAt`
- `document_chunks` 表: `id (uuid PK)`, `documentId (uuid FK)`, `content (text)`, `chunkIndex (integer)`, `embedding (vector(1536))`, `tokenCount (integer)`, `createdAt`

**文档处理 Pipeline**:
- 上传 → 读取文本 → 分块 → 批量生成 embedding → 批量写入 DB
- 处理状态反馈给前端（processing / ready / error）

**上下文 Token 预算分配（总预算 16000 tokens）**:
- System Prompt: 最多 1500 tokens
- 长期记忆: 最多 500 tokens
- RAG 知识: 最多 2000 tokens
- 会话摘要: 最多 800 tokens
- 对话历史: 最多 6000 tokens
- 当前消息: 最多 1000 tokens
- 模型回复预留: 约 4200 tokens

**并行检索**:
- 记忆搜索和文档搜索并行执行（`Promise.all`）
- 总检索延迟目标: < 200ms

---

## 目录结构规划

```
mnemo/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                      # 主聊天页面
│   ├── memories/
│   │   └── page.tsx                  # 记忆管理页面 (Phase 3)
│   ├── documents/
│   │   └── page.tsx                  # 文档管理页面 (Phase 4)
│   └── api/
│       ├── chat/
│       │   └── route.ts              # 核心聊天 API
│       ├── conversations/
│       │   └── route.ts              # 会话 CRUD
│       ├── memories/
│       │   └── route.ts              # 记忆 CRUD (Phase 3)
│       └── documents/
│           └── route.ts              # 文档上传与管理 (Phase 4)
├── components/
│   ├── chat/
│   │   ├── chat-panel.tsx            # 聊天主面板
│   │   ├── message-list.tsx          # 消息列表
│   │   ├── message-bubble.tsx        # 单条消息
│   │   ├── chat-input.tsx            # 输入框
│   │   └── debug-panel.tsx           # Debug 信息面板 (Phase 2+)
│   ├── sidebar/
│   │   ├── conversation-list.tsx     # 会话列表
│   │   └── sidebar.tsx
│   ├── memories/
│   │   ├── memory-list.tsx           # 记忆列表 (Phase 3)
│   │   └── memory-editor.tsx         # 记忆编辑器 (Phase 3)
│   └── ui/                           # shadcn/ui 组件
├── lib/
│   ├── ai/
│   │   ├── provider.ts              # Anthropic provider 配置
│   │   ├── context-builder.ts       # 上下文组装核心逻辑
│   │   ├── summarizer.ts            # 摘要生成 (Phase 2)
│   │   ├── memory-extractor.ts      # 记忆提取 (Phase 3)
│   │   └── prompts.ts               # 所有 Prompt 模板集中管理
│   ├── db/
│   │   ├── index.ts                 # Drizzle 客户端初始化
│   │   ├── schema.ts                # 所有表的 schema 定义
│   │   ├── queries/
│   │   │   ├── conversations.ts     # 会话相关查询
│   │   │   ├── messages.ts          # 消息相关查询
│   │   │   ├── memories.ts          # 记忆相关查询 (Phase 3)
│   │   │   └── documents.ts         # 文档相关查询 (Phase 4)
│   │   └── migrations/              # Drizzle 迁移文件
│   ├── utils/
│   │   ├── tokens.ts                # Token 计算工具
│   │   └── embeddings.ts            # Embedding 生成工具 (Phase 3)
│   └── constants.ts                 # 全局常量（token 预算等）
├── .env.example
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```

---

## 非功能需求

**性能**:
- 首条 AI 回复的 token 流出延迟 (TTFT): < 1.5 秒
- 上下文组装耗时: < 300ms
- 记忆检索耗时: < 200ms

**可观测性**:
- 每次请求在 server console 打印：上下文总 token 数、各部分 token 数、检索命中数
- Debug 面板在开发环境默认展开，生产环境隐藏

**错误处理**:
- LLM 调用失败时，给用户显示友好错误消息并支持重试
- 数据库连接失败时，聊天功能降级为无记忆模式（仅使用当前输入）
- 记忆提取失败不影响正常对话，静默记录错误日志

**可配置性**:
- 以下参数通过 `lib/constants.ts` 集中配置：
  - 总 token 预算、各部分 token 分配
  - 滑动窗口大小、摘要触发阈值
  - 记忆提取触发间隔
  - 检索 Top-K 和相似度阈值
