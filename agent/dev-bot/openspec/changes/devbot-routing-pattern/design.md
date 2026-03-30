## Context

DevBot 是一个教学演示项目，展示 Agent 路由模式。用户在终端输入开发相关请求，系统通过分层路由自动分流到专家处理器。项目需要代码结构清晰，便于视频讲解和代码走读。

当前 `dev-bot/` 目录为空白项目，需从零搭建。

## Goals / Non-Goals

**Goals:**
- 完整演示分层路由模式（规则快筛 + LLM 精分类）
- 5 个专家处理器各自独立配置（不同 System Prompt、temperature）
- 路由决策过程可观测（日志 + Debug 输出）
- Clarifier 回流机制：低置信度 → 澄清 → 重新路由
- 交互式 CLI 可直接演示

**Non-Goals:**
- 不做 Web UI（仅 CLI 交互）
- 不实现真实的 RAG 向量检索（Doc Searcher 使用 LLM 模拟）
- 不实现嵌入路由或分类器路由（仅演示规则 + LLM 两层）
- 不做持久化存储或用户认证

## Decisions

### 1. 使用 Vercel AI SDK (`ai` + `@ai-sdk/anthropic`) 调用 LLM

**选择**: Vercel AI SDK
**理由**: 提供 `generateText` 等统一抽象，支持 structured output（`generateObject`），切换模型提供商只需换 provider。比直接用 Anthropic SDK 更符合教学目的——展示通用模式而非特定 API。
**替代方案**: 直接用 `@anthropic-ai/sdk`——更底层，但与教学系列的通用性定位不符。

### 2. 分层路由：规则层 → LLM 层 → 置信度阈值

**选择**: 两层管道，规则层优先
**理由**: 规则层零成本、零延迟处理明确意图（约 60-70% 请求）；LLM 层处理模糊输入；置信度 < 0.7 时兜底到 Clarifier。这是文档中明确要求的分层策略。
**替代方案**: 纯 LLM 路由——更简单但每次请求都有 API 开销，无法展示分层优势。

### 3. Handler 统一接口 + 路由表注册

**选择**: 所有处理器实现 `Handler` 接口，通过路由表 `Map<Intent, Handler>` 分发
**理由**: 策略模式，解耦路由器和处理器。新增处理器只需实现接口 + 注册到路由表，不修改路由逻辑。便于讲解设计模式。

### 4. LLM 路由使用 `generateObject` + Zod schema

**选择**: 使用 Vercel AI SDK 的 `generateObject` 让 LLM 直接输出结构化 JSON
**理由**: 比 `generateText` + 手动 JSON.parse 更可靠，自动校验输出格式。temperature 设为 0 保证分类确定性。

### 5. 项目结构：按职责分目录

```
src/
├── router/          # 路由层（rule-router, llm-router, pipeline）
├── handlers/        # 处理器层（5 个专家处理器）
├── types/           # 共享类型定义
├── config/          # Prompt 模板 + 路由表配置
├── utils/           # 日志工具
└── index.ts         # CLI 入口
```

**理由**: 与文档架构图一致，便于视频走读时按目录逐层讲解。

### 6. 对话上下文：内存数组，单会话

**选择**: 简单的 `Message[]` 数组维护当前会话历史
**理由**: 教学项目，无需持久化。Clarifier 回流时将完整上下文传入路由管道即可。

## Risks / Trade-offs

- **[LLM 路由延迟]** → 规则层优先处理大部分请求，只有模糊请求调用 LLM。可接受的教学演示延迟。
- **[规则路由误判]** → 规则仅匹配强信号关键词，宁可漏过交给 LLM 层，不做激进匹配。
- **[API Key 泄露风险]** → 通过环境变量配置，.env 文件加入 .gitignore。
- **[Doc Searcher 非真实 RAG]** → 明确标注为模拟实现，不影响路由模式的教学价值。
