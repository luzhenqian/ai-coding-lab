# Constitution: Mnemo — Chatbot 记忆系统教学项目

## 项目定位

Mnemo（取自希腊记忆女神 Mnemosyne）是一个面向开发者的教学型 Chatbot 项目，核心目标是演示如何为 LLM 聊天应用构建完整的**记忆系统**与**上下文管理**能力。项目代码将作为配套教程的参考实现，因此代码清晰度和可读性优先于过度抽象。

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript (strict mode)
- **AI SDK**: Vercel AI SDK (最新稳定版)
- **LLM Provider**: OpenAI 和 Anthropic Claude，通过 `@ai-sdk/anthropic` 接入
- **数据库**: PostgreSQL + pgvector 扩展
- **ORM**: Drizzle ORM
- **样式**: Tailwind CSS + shadcn/ui
- **包管理**: pnpm
- **部署目标**: Vercel + Supabase (PostgreSQL)

## 架构原则

1. **分层清晰**: 记忆系统严格分为四层——工作记忆 (Working Memory，即 Context Window 管理)、短期记忆 (Session Memory，会话级消息与摘要)、长期记忆 (Long-term Memory，跨会话的用户事实与偏好)、语义记忆 (Semantic Memory，RAG 知识检索)。每层有独立的模块和接口，不混杂。
2. **渐进式复杂度**: 项目按 Phase 递增功能，每个 Phase 可独立运行和演示。不要在 Phase 1 引入 Phase 3 的复杂性。
3. **教学优先**: 宁可多写几行直白的代码，也不要用"聪明"但难理解的抽象。关键逻辑路径加注释说明"为什么这样做"。
4. **异步不阻塞**: 记忆提取、摘要更新等重计算操作绝不阻塞用户的实时聊天体验。使用 `waitUntil` 或后台任务处理。
5. **Token 意识**: 所有注入上下文的内容都必须经过 token 预算控制。永远不要无限制地往 prompt 里塞内容。

## 编码规范

- 文件命名: kebab-case (`memory-service.ts`, `chat-route.ts`)
- 组件命名: PascalCase (`ChatPanel.tsx`, `MemoryList.tsx`)
- 目录结构遵循 Next.js App Router 约定，业务逻辑放在 `lib/` 下
- 数据库相关代码统一放在 `lib/db/` 下，schema 定义在 `lib/db/schema.ts`
- AI 相关逻辑统一放在 `lib/ai/` 下
- 所有对外的 Service 函数使用明确的 TypeScript 类型，不用 `any`
- 错误处理: 数据库和 LLM 调用必须有 try-catch，给用户友好的错误提示
- 环境变量: 全部在 `.env.example` 中列出并注释说明用途

## 不做什么

- **不做用户认证系统**: 使用硬编码的 `userId` 做演示，教程聚焦记忆而非 auth
- **不做生产级 UI**: UI 够用即可，聚焦功能演示而非视觉设计
- **不做多模型切换**: 只用 Claude，不做 provider 抽象层
- **不引入 LangChain/LangGraph**: 保持技术栈精简，直接使用 Vercel AI SDK，避免增加学习负担
- **不做 Mem0 Cloud 集成**: 自建记忆系统是教学目的，不依赖第三方记忆服务
- **不做实时协作**: 单用户场景，不考虑多用户并发写入记忆的冲突

## 项目语言

- 代码：英文（变量名、注释）
- 文档和 UI 文案：中文
- Git Commit：英文，遵循 Conventional Commits
