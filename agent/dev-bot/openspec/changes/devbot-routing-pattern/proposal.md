## Why

DevBot 是 AI 编程实战系列（Agent 设计模式精读）第 2 期"路由模式"的配套实战项目。需要构建一个面向开发者的智能助手路由系统，演示如何通过分层路由（规则快筛 + LLM 精分类）将用户请求自动分流到不同的专家处理器。该项目作为教学演示案例，需要代码结构清晰、模式体现充分。

## What Changes

- 新建完整的 DevBot TypeScript 项目，使用 Vercel AI SDK + Claude API
- 实现分层路由管道：规则预筛路由器 → LLM 意图分类路由器
- 实现 5 个专家处理器：Code Explainer、Bug Detective、Code Generator、Doc Searcher、Clarifier
- 实现路由决策日志和 Debug 可视化输出
- 实现对话上下文管理，支持 Clarifier 回流重路由
- 提供交互式 CLI 入口，可在终端中实时演示路由过程

## Capabilities

### New Capabilities
- `intent-routing`: 分层路由系统——规则预筛 + LLM 意图分类 + 置信度阈值 + 路由分发
- `expert-handlers`: 五个专家处理器（代码解释、Bug 侦探、代码生成、文档检索、意图澄清）
- `conversation-context`: 对话上下文管理与 Clarifier 回流重路由机制
- `routing-debug`: 路由决策日志记录与 Debug 面板输出

### Modified Capabilities
<!-- 全新项目，无已有能力需要修改 -->

## Impact

- 新增独立 TypeScript 项目，位于 `dev-bot/` 目录
- 依赖：`ai`（Vercel AI SDK）、`@ai-sdk/anthropic`、`zod`、`readline`
- 需要环境变量 `ANTHROPIC_API_KEY` 配置 Claude API 访问
