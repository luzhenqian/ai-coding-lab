# Tasks: 工具调用错误反馈

**Feature**: 006-tool-error-feedback | **Plan**: [plan.md](./plan.md)

## Phase 1: User Story 1 — 工具调用失败时显示错误信息 (P1)

- [x] T001 [US1] Extend tool part type assertion to include `errorText` field and render error message below ToolStatusBadge when state is `output-error` in src/app/components/ChatPanel.tsx

## Phase 2: Verification

- [x] T002 Manual verification: trigger GitHub API rate limit and verify error message displays in chat
- [x] T003 Manual verification: request a non-existent repo and verify 404 error message displays

## Dependencies

T001 → T002, T003
