# Implementation Plan: GitHub 仓库智能分析助手

**Branch**: `001-repo-analyzer` | **Date**: 2026-03-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-repo-analyzer/spec.md`

## Summary

构建一个 GitHub 仓库智能分析助手，通过两种交互模式展示 AI Agent 开发的三个核心概念：Tool Calling（自由对话模式）、Workflow 编排和 Human-in-the-Loop（Workflow 分析模式）。使用 Mastra 作为 Agent 框架，Vercel AI SDK v5 构建流式聊天界面，Next.js 16 App Router 作为全栈框架。

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode, no `any`)
**Primary Dependencies**: Next.js 16 (App Router), Mastra (`@mastra/core`), Vercel AI SDK v5 (`ai`, `@ai-sdk/react`), `@mastra/ai-sdk`, `@mastra/libsql`, `@ai-sdk/openai`, `@ai-sdk/anthropic`, zod
**Storage**: LibSQL (local file `storage.db`) — Workflow 状态持久化
**Testing**: 不在初始范围内（教学演示项目）
**Target Platform**: Web (localhost 开发环境)
**Project Type**: Web application (Next.js 全栈)
**Performance Goals**: 流式响应 <10s 首字节 (SC-001)，Workflow 前三步 <15s (SC-002)
**Constraints**: 仅用 fetch 发 HTTP、禁止额外 UI 库、文件 <200 行
**Scale/Scope**: 单用户本地开发演示，1 个页面，2 种模式

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. 教学清晰度优先 | ✅ PASS | 项目结构按教学概念分层，README 中文 |
| II. 严格 TypeScript | ✅ PASS | strict mode, zod schema, 无 any |
| III. 技术栈纪律 | ✅ PASS | 所有依赖在批准列表内，fetch only |
| IV. 代码可读性 | ✅ PASS | 中文注释、单一职责、<200 行/文件 |
| V. 健壮的错误处理 | ✅ PASS | try-catch + 中文错误信息 |
| VI. AI Agent 工程规范 | ✅ PASS | Tool description 详细、schema 对齐、HITL 持久化、Agent instructions 完整 |
| VII. 最小可运行原则 | ✅ PASS | 两个工具、四步 Workflow、无过度抽象 |

**Gate Result: ALL PASS** — 无 violation，无需 Complexity Tracking。

## Project Structure

### Documentation (this feature)

```text
specs/001-repo-analyzer/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── api-routes.md
└── tasks.md                    # /speckit.tasks 生成
```

### Source Code (repository root)

```text
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # 根布局
│   ├── page.tsx                # 主页面（模式切换入口）
│   ├── globals.css             # Tailwind 全局样式
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts        # Agent 对话流式 API
│   │   └── workflow/
│   │       ├── start/
│   │       │   └── route.ts    # Workflow 启动 API
│   │       ├── resume/
│   │       │   └── route.ts    # Workflow 恢复 API
│   │       └── report/
│   │           └── route.ts    # 报告流式生成 API
│   └── components/
│       ├── ChatPanel.tsx       # 自由对话面板（useChat）
│       ├── WorkflowPanel.tsx   # Workflow 面板（URL 输入 + 状态）
│       ├── ModeSwitcher.tsx    # 模式切换按钮组
│       ├── StepStatusBar.tsx   # Workflow 步骤状态条
│       ├── RepoSummaryCard.tsx # 仓库摘要卡片（审批展示）
│       └── ToolStatusBadge.tsx # 工具调用状态标识
├── mastra/                     # Mastra 配置目录
│   ├── index.ts                # Mastra 实例注册
│   ├── agents/
│   │   └── repo-analyzer.ts   # Agent 定义
│   ├── tools/
│   │   ├── get-repo-info.ts   # getRepoInfo 工具
│   │   └── get-repo-tree.ts   # getRepoTree 工具
│   └── workflows/
│       ├── analyze-repo.ts    # Workflow 组合（4 步串联）
│       └── steps/
│           ├── parse-url.ts       # Step 1: 解析 URL
│           ├── fetch-data.ts      # Step 2: 获取数据
│           ├── human-approval.ts  # Step 3: 人工审批（HITL）
│           └── generate-report.ts # Step 4: 生成报告
└── lib/
    ├── github.ts               # GitHub API 封装
    ├── url-parser.ts           # URL 解析工具函数
    ├── model.ts                # 多模型提供商配置
    └── schemas.ts              # 共享 zod schema 定义
```

**Structure Decision**: Next.js App Router 单项目结构。`src/mastra/` 存放 AI Agent 相关代码（Agent、Tools、Workflows），`src/lib/` 存放共享工具函数，`src/app/components/` 存放页面级组件。按教学概念分层：Tool → Agent → Workflow → UI。

## Complexity Tracking

> No violations — section intentionally empty.
