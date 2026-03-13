# Tasks: Sidebar Knowledge Base Entry

**Input**: Design documents from `/specs/007-sidebar-knowledge-entry/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), quickstart.md

**Tests**: Not requested — no test tasks included.

**Organization**: Single user story feature. Minimal task set.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1)
- Include exact file paths in descriptions

## Phase 1: User Story 1 - Access Knowledge Base from Chat Sidebar (Priority: P1) 🎯 MVP

**Goal**: Add a "知识库管理" navigation entry to the bottom of the chat sidebar that links to the `/upload` page, with a folder icon and visual divider separating it from the conversation list.

**Independent Test**: Navigate to `/chat`, locate the "知识库管理" entry at the bottom of the sidebar, click it, verify navigation to `/upload`. On mobile, open sidebar via menu toggle and verify the entry is visible and clickable.

### Implementation for User Story 1

- [x] T001 [US1] Add "知识库管理" navigation link with folder icon to the bottom of the sidebar in src/components/chat/chat-sidebar.tsx — import `Link` from `next/link`, add a `border-t border-gray-200` divider section after the scrollable conversation list div, containing a `Link` to `/upload` with an inline folder SVG icon and "知识库管理" text label, styled with hover state consistent with sidebar theme

**Checkpoint**: The "知识库管理" entry is visible at the bottom of the sidebar on both desktop and mobile, and clicking it navigates to `/upload`.

---

## Phase 2: Polish & Cross-Cutting Concerns

**Purpose**: Validate the implementation

- [x] T002 Run type check with `npx tsc --noEmit` to verify no TypeScript errors
- [x] T003 Run lint with `npx next lint` to verify no lint errors
- [x] T004 Run quickstart.md validation — verify the sidebar link renders correctly and navigates to `/upload` on desktop and mobile viewports

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (User Story 1)**: No setup or foundational phase needed — modifying an existing component
- **Phase 2 (Polish)**: Depends on Phase 1 completion

### Within User Story 1

- Single task — no internal dependencies

### Parallel Opportunities

- T002 and T003 can run in parallel after T001 completes

---

## Implementation Strategy

### MVP (Complete Feature)

1. Complete T001: Add the sidebar link
2. Complete T002–T004: Validate type safety, lint, and manual verification
3. Done — this is the entire feature

---

## Notes

- This is a single-file change to an existing component
- No new files, no new dependencies, no data model changes, no API changes
- The `/upload` page already exists (feature 005)
- Commit after T001 completes
