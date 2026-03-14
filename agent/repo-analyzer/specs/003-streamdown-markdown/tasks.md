# Tasks: Streamdown Markdown 流式渲染

**Feature**: 003-streamdown-markdown | **Plan**: [plan.md](./plan.md)

## Phase 1: Setup

- [x] T001 Install streamdown packages (streamdown, @streamdown/code, @streamdown/cjk) via `pnpm add`
- [x] T002 Add `@source` directives for streamdown in `src/app/globals.css` (Tailwind v4 class scanning) and define CSS theme variables (--primary, --muted, --border, --radius)
- [x] T003 Import `streamdown/styles.css` in `src/app/layout.tsx` for streaming animation styles

## Phase 2: Foundational

- [x] T004 Create shared `StreamdownRenderer` component in `src/app/components/StreamdownRenderer.tsx` — accepts `content: string` and `isStreaming: boolean`, configures code + cjk plugins

## Phase 3: User Story 1 — 聊天模式 Markdown 渲染 (P1)

- [x] T005 [US1] Integrate StreamdownRenderer for AI messages in `src/app/components/ChatPanel.tsx` — replace `part.type === 'text'` rendering for assistant messages only, user messages stay plain text, pass `status === 'streaming'` as isStreaming

## Phase 4: User Story 2 — Workflow 报告 Markdown 渲染 (P2)

- [x] T006 [US2] Integrate StreamdownRenderer for report display in `src/app/components/WorkflowPanel.tsx` — replace prose/whitespace-pre-wrap div with StreamdownRenderer, pass `phase === 'streaming'` as isStreaming

## Phase 5: Polish & Verification

- [x] T007 Manual verification: test streaming Markdown rendering in chat mode (SC-001 tables/headings/code, SC-002 real-time rendering, SC-003 overflow scrolling, SC-004 user messages stay plain text, Edge-001 pure text, Edge-002 incomplete table)
- [x] T008 Manual verification: test report rendering in workflow mode (Workflow report renders as rich text, Workflow-Stream partial content renders in real-time)

## Dependencies

```
T001, T002, T003 → T004 (setup before component)
T004 → T005, T006 (component before integration)
T005 [P] T006 (parallel — different files, independent user stories)
T005 → T007 (chat integration before chat verification)
T006 → T008 (workflow integration before workflow verification)
```
