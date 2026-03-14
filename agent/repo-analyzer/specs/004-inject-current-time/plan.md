# Implementation Plan: 注入当前时间信息给大模型

**Branch**: `004-inject-current-time` | **Date**: 2026-03-14 | **Spec**: [spec.md](./spec.md)

## Summary

在 Agent 系统指令和 Workflow 报告生成步骤中注入当前日期时间，解决模型将真实日期误判为"未来日期"的问题。改动极小，仅涉及两处系统提示词的拼接。

## Technical Context

**Language/Version**: TypeScript (strict mode)
**Primary Dependencies**: Mastra (@mastra/core), Vercel AI SDK v5
**Storage**: N/A
**Testing**: 手动验证
**Target Platform**: Node.js 22+ / Next.js 16
**Project Type**: Web application (教学演示)
**Constraints**: 文件不超过 200 行，中文注释

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. 教学清晰度优先 | ✅ PASS | 改动直观，注释解释"为什么" |
| II. 严格 TypeScript | ✅ PASS | 无新类型，使用原生 Date API |
| III. 技术栈纪律 | ✅ PASS | 无新依赖 |
| IV. 代码可读性 | ✅ PASS | 新增函数有中文注释 |
| V. 健壮的错误处理 | ✅ PASS | Date 构造无异常场景 |
| VI. AI Agent 工程规范 | ✅ PASS | 丰富了 Agent instructions |
| VII. 最小可运行原则 | ✅ PASS | 最小改动解决问题 |

## Project Structure

### Source Code Changes

```text
src/
├── mastra/
│   ├── agents/
│   │   └── repo-analyzer.ts    # 修改：instructions 中注入当前日期
│   └── workflows/
│       └── steps/
│           └── generate-report.ts  # 修改：SYSTEM_PROMPT 中注入当前日期
└── lib/
    └── date.ts                 # 新增：获取格式化当前日期的工具函数
```

**Structure Decision**: 新增 `src/lib/date.ts` 作为日期格式化的共享工具函数，避免两处重复相同的日期逻辑。

## Implementation Details

### 1. `src/lib/date.ts` — 日期格式化工具函数

```typescript
/**
 * 获取当前日期的格式化字符串，用于注入到 AI 系统提示词中
 * 格式：YYYY-MM-DD (时区)
 */
export function getCurrentDateString(): string {
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0]
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  return `${dateStr} (${timezone})`
}
```

### 2. `src/mastra/agents/repo-analyzer.ts` — Agent instructions 注入

将 `instructions` 从静态字符串改为函数，在系统指令开头注入当前日期：

```typescript
import { getCurrentDateString } from '@/lib/date'

const instructions = `你是一个专业的 GitHub 仓库分析助手。

## 当前时间
今天是 ${getCurrentDateString()}。请基于此日期正确判断所有时间相关信息。

## 角色定位
...（其余不变）`
```

**注意**: Mastra Agent 的 `instructions` 支持字符串，在模块加载时执行模板字面量即可获取当前日期。由于 Next.js 开发模式下模块会被重新加载，日期会自动更新。

### 3. `src/mastra/workflows/steps/generate-report.ts` — SYSTEM_PROMPT 注入

在 `SYSTEM_PROMPT` 开头拼接当前日期：

```typescript
import { getCurrentDateString } from '@/lib/date'

const SYSTEM_PROMPT = `当前日期：${getCurrentDateString()}

你是一个专业的 GitHub 仓库分析师。...（其余不变）`
```

## Dependencies

无新增依赖。仅使用 JavaScript 原生 `Date` 和 `Intl` API。
