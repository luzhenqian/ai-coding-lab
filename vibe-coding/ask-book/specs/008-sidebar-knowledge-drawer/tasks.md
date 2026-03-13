# Tasks: Sidebar Knowledge Base Drawer

**Input**: Design documents from `/specs/008-sidebar-knowledge-drawer/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), quickstart.md

**Tests**: Not requested — no test tasks included.

**Organization**: Two user stories. US1 builds the drawer and wires sidebar. US2 adds upload progress support within the drawer (reuses existing components).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: User Story 1 - Open Knowledge Base Drawer from Chat (Priority: P1) 🎯 MVP

**Goal**: Click "知识库管理" in the sidebar → drawer slides in from the right showing document list and upload area. Close via backdrop click or close button. Chat state preserved.

**Independent Test**: Navigate to `/chat`, click "知识库管理", verify drawer opens with document list and upload zone. Close drawer, verify chat unchanged.

### Implementation for User Story 1

- [x] T001 [US1] Create KnowledgeDrawer component in src/components/knowledge-drawer.tsx — a fixed-position right-side drawer with semi-transparent backdrop, slide-in/out animation (Tailwind translate-x + transition), close button, header "知识库管理", body containing UploadZone and DocumentList components (reusing state pattern from src/app/upload/page.tsx: uploadDocId, refreshKey, handleUploadStart, handleComplete, handleReset). On mobile (<lg) drawer is full-width; on desktop drawer is w-96. Props: `open: boolean`, `onClose: () => void`.
- [x] T002 [US1] Modify ChatSidebar in src/components/chat/chat-sidebar.tsx — replace the `Link` to `/upload` with a `<button>` that calls a new `onOpenKnowledge` prop. Remove `Link` import from `next/link`. Add `onOpenKnowledge: () => void` to `ChatSidebarProps`.
- [x] T003 [US1] Wire drawer state in src/app/chat/page.tsx — add `knowledgeOpen` state (useState<boolean>(false)), pass `onOpenKnowledge={() => setKnowledgeOpen(true)}` to ChatSidebar, render `<KnowledgeDrawer open={knowledgeOpen} onClose={() => setKnowledgeOpen(false)} />`.

**Checkpoint**: Drawer opens/closes from sidebar entry. Document list and upload zone visible. Chat state preserved.

---

## Phase 2: User Story 2 - Upload Document with Progress in Drawer (Priority: P2)

**Goal**: Upload a PDF within the drawer and see real-time progress. Document appears in list after processing.

**Independent Test**: Open drawer, upload a PDF, verify progress indicator appears, verify document shows in list after completion.

### Implementation for User Story 2

> Note: US2 is already covered by T001's implementation — the KnowledgeDrawer component includes UploadZone, UploadProgress, and DocumentList with the same state management pattern as the upload page. No additional tasks needed.

**Checkpoint**: Upload with progress works within drawer. Error states handled by existing components.

---

## Phase 3: Polish & Cross-Cutting Concerns

**Purpose**: Validate the implementation

- [x] T004 Run type check with `npx tsc --noEmit` to verify no TypeScript errors
- [x] T005 Run lint with `pnpm run lint` to verify no lint errors
- [x] T006 Run quickstart.md validation — verify drawer functionality on desktop and mobile viewports

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (US1)**: T001 can start immediately (new file). T002 can start immediately (different file) [P]. T003 depends on T001 + T002.
- **Phase 2 (US2)**: Already implemented within T001.
- **Phase 3 (Polish)**: Depends on Phase 1 completion.

### Parallel Opportunities

- T001 and T002 can run in parallel (different files)
- T004 and T005 can run in parallel after T003

---

## Parallel Example: User Story 1

```bash
# Launch in parallel (different files):
Task T001: "Create KnowledgeDrawer component in src/components/knowledge-drawer.tsx"
Task T002: "Modify ChatSidebar in src/components/chat/chat-sidebar.tsx"

# Then sequential (depends on T001 + T002):
Task T003: "Wire drawer state in src/app/chat/page.tsx"
```

---

## Implementation Strategy

### MVP (User Story 1)

1. T001 + T002 in parallel: Create drawer component + modify sidebar
2. T003: Wire up in chat page
3. T004–T006: Validate
4. Done — both user stories delivered (US2 is inherently part of US1's component)

---

## Notes

- US2 does not require separate tasks because the KnowledgeDrawer component in T001 already includes UploadProgress with the same pattern as the upload page
- The `/upload` standalone page remains unchanged — this feature adds an alternative access point
- No new dependencies, no data model changes, no new API endpoints
