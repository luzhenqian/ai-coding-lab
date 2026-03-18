# Implementation Plan: 双轨记忆提取（Dual-Track Memory Extraction）

**Branch**: `012-dual-track-memory` | **Date**: 2026-03-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-dual-track-memory/spec.md`

## Summary

将记忆提取机制从"固定周期 + 硬编码关键词"升级为"Hot Path + Background"双轨方案。Hot Path 使用轻量 LLM 调用（`generateObject` 返回布尔值）在每次用户发消息后异步判断是否值得提取记忆；Background 在用户空闲超过可配置时长后异步回顾最近对话批量提取。两条路径共享现有的 `extractMemories` 和去重逻辑。

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 16.1.6
**Primary Dependencies**: Vercel AI SDK (`ai`), `@ai-sdk/anthropic`, Drizzle ORM, `zod`
**Storage**: PostgreSQL + pgvector (existing, schema unchanged)
**Testing**: Manual testing via Debug 面板
**Target Platform**: Vercel serverless (Node.js runtime)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Hot Path 判断不阻塞聊天响应流；Background 提取在空闲后 10s 内启动
**Constraints**: LLM 判断必须在 `after()` 回调中异步执行；空闲检测在服务端实现
**Scale/Scope**: 单用户场景（DEFAULT_USER_ID）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Layered Memory Architecture | ✅ Pass | 改动集中在 Long-term Memory 层（`lib/ai/memory-extractor.ts`），不跨层 |
| II. Progressive Complexity | ✅ Pass | 在现有 Phase 3 记忆提取基础上增强，不引入未来才需要的抽象 |
| III. Teaching First | ✅ Pass | 保持显式代码，新增的判断函数和空闲检测逻辑清晰可读 |
| IV. Async Non-Blocking | ✅ Pass | Hot Path 判断在 `after()` 中异步执行；Background 使用定时器异步触发 |
| V. Token Budget Awareness | ✅ Pass | 不改变 context-builder 的 token 预算逻辑，仅改变提取触发时机 |

## Project Structure

### Documentation (this feature)

```text
specs/012-dual-track-memory/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
lib/
├── ai/
│   ├── memory-extractor.ts   # MODIFY: replace shouldTriggerExtraction, add shouldExtractMemory (LLM判断)
│   └── prompts.ts             # MODIFY: add MEMORY_WORTHINESS_PROMPT
├── constants.ts               # MODIFY: remove MEMORY_TRIGGER_KEYWORDS, MEMORY_EXTRACTION_INTERVAL; add IDLE_TIMEOUT_MS, BACKGROUND_MIN_MESSAGES
└── utils/
    └── idle-scheduler.ts      # NEW: 空闲检测调度器

app/
└── api/
    └── chat/
        └── route.ts           # MODIFY: replace old extraction trigger with Hot Path + Background hooks

components/
└── chat/
    └── debug-panel.tsx        # MODIFY: display extraction source (hot-path / background)
```

**Structure Decision**: 保持现有 Next.js App Router 结构不变。新增一个 `idle-scheduler.ts` 工具文件用于空闲检测；其余为对现有文件的修改。

## Complexity Tracking

No violations. All changes align with constitution principles.
