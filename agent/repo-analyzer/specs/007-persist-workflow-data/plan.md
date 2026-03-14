# Implementation Plan: Persist Workflow Data

**Branch**: `007-persist-workflow-data` | **Date**: 2026-03-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-persist-workflow-data/spec.md`

## Summary

Workflow analysis data (steps, repo info, report) is lost on page refresh because it's only kept in React state. This plan extends the existing localStorage-based conversation store to persist workflow runs alongside chat conversations, enabling full state restoration on page reload and historical access via the sidebar.

## Technical Context

**Language/Version**: TypeScript (strict mode), Node.js 22+
**Primary Dependencies**: Next.js 15 (App Router), React 19, Mastra, Vercel AI SDK v6, zod
**Storage**: localStorage (browser-side conversation persistence), LibSQL (server-side Mastra workflow state)
**Testing**: Manual browser testing
**Target Platform**: Web browser (desktop)
**Project Type**: Web application (teaching/demo project)
**Performance Goals**: State restoration < 1 second, persistence overhead < 200ms
**Constraints**: No new dependencies; localStorage size limit (~5MB); files < 200 lines
**Scale/Scope**: Single-user local app, ~10 conversations typical

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. 教学清晰度优先 | PASS | Extends existing pattern (conversation-store), easy to follow |
| II. 严格 TypeScript | PASS | All new types use zod schemas, no `any` |
| III. 技术栈纪律 | PASS | No new dependencies introduced |
| IV. 代码可读性 | PASS | Chinese comments on key functions, files kept under 200 lines |
| V. 健壮的错误处理 | PASS | Graceful degradation on storage errors, Chinese error messages |
| VI. AI Agent 工程规范 | PASS | No changes to Agent/Tool/Workflow definitions |
| VII. 最小可运行原则 | PASS | Minimal changes — extends existing store, no premature abstractions |

**Post-design re-check**: All gates still pass. No new abstractions or dependencies introduced.

## Project Structure

### Documentation (this feature)

```text
specs/007-persist-workflow-data/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (files modified)

```text
src/
├── lib/
│   └── conversation-store.ts    # Extended schema + workflow helpers
└── app/
    ├── page.tsx                  # Unified conversation management, sidebar in both modes
    └── components/
        ├── useWorkflow.ts        # Accept init state + onStateChange callback
        ├── WorkflowPanel.tsx     # Accept init state + onStateChange props
        └── ConversationList.tsx  # Visual indicator for workflow conversations
```

**Structure Decision**: This is a frontend-only change modifying 5 existing files. No new files needed. The existing Next.js App Router single-project structure is maintained.
