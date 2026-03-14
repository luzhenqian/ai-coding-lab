# Tasks: 注入当前时间信息给大模型

**Feature**: 004-inject-current-time | **Plan**: [plan.md](./plan.md)

## Phase 1: Setup

- [x] T001 Create date utility function `getCurrentDateString()` in src/lib/date.ts

## Phase 2: User Story 1 — AI 正确感知当前日期 (P1)

- [x] T002 [US1] Inject current date into Agent instructions in src/mastra/agents/repo-analyzer.ts
- [x] T003 [P] [US1] Inject current date into Workflow SYSTEM_PROMPT in src/mastra/workflows/steps/generate-report.ts

## Phase 3: Verification

- [x] T004 Manual verification: ask AI "今天是几号" and verify correct answer
- [x] T005 Manual verification: analyze a recent repo and verify no "future date" errors in report

## Dependencies

T001 → T002, T003 (date utility must exist first)
T002 and T003 are parallel [P] (different files, no dependency)
