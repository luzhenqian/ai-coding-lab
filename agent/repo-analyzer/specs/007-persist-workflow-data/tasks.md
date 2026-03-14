# Tasks: Persist Workflow Data in Conversation History

**Input**: Design documents from `/specs/007-persist-workflow-data/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: No setup needed — this feature modifies existing files only. No new dependencies or project configuration.

*(No tasks in this phase)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend the conversation store schema to support workflow data. This MUST be complete before any user story work.

- [x] T001 Extend StoredConversation schema with `type` field ('chat' | 'workflow', default 'chat') and `workflowState` optional field in `src/lib/conversation-store.ts`
- [x] T002 Add WorkflowState zod schema (runId, url, phase, steps, repoInfo, repoTree, report, error) in `src/lib/conversation-store.ts`
- [x] T003 Add helper functions `createWorkflowConversation(title: string)` and `updateWorkflowState(id: string, state: WorkflowState)` in `src/lib/conversation-store.ts`

**Checkpoint**: Store schema extended, backward compatible with existing chat conversations.

---

## Phase 3: User Story 1 — Workflow Data Survives Page Refresh (Priority: P1) 🎯 MVP

**Goal**: Workflow state (phase, steps, repo info, report) persists across page refreshes.

**Independent Test**: Run a complete workflow, refresh the page, verify the workflow panel restores with all steps and the report visible.

### Implementation for User Story 1

- [x] T004 [US1] Refactor `useWorkflow` hook to accept optional `initialState: WorkflowState` parameter and restore all state fields from it on mount in `src/app/components/useWorkflow.ts`
- [x] T005 [US1] Add `onStateChange` callback parameter to `useWorkflow` hook, call it whenever phase, steps, repoInfo, repoTree, report, or error change in `src/app/components/useWorkflow.ts`
- [x] T006 [US1] Remove direct localStorage read/write (`STORAGE_KEY`) from `useWorkflow` — persistence now handled by parent via `onStateChange` in `src/app/components/useWorkflow.ts`
- [x] T007 [US1] Update `WorkflowPanel` to accept `initialState` and `onStateChange` props and forward them to `useWorkflow` hook in `src/app/components/WorkflowPanel.tsx`
- [x] T008 [US1] In `page.tsx`, create workflow conversation on workflow submit, update workflow state on every `onStateChange` callback via `updateWorkflowState()` in `src/app/page.tsx`
- [x] T009 [US1] In `page.tsx`, on selecting a workflow conversation, load its `workflowState` and pass as `initialState` to `WorkflowPanel` in `src/app/page.tsx`

**Checkpoint**: Workflow data persists across page refresh. User can refresh at any phase and see the workflow restored.

---

## Phase 4: User Story 2 — Workflow Runs as Conversations (Priority: P1)

**Goal**: Workflow runs appear in the sidebar conversation list. Clicking one restores the workflow view.

**Independent Test**: Run a workflow, switch to chat, click the workflow entry in sidebar, verify it switches to workflow mode with saved state.

### Implementation for User Story 2

- [x] T010 [US2] Show `ConversationList` sidebar in workflow mode (remove `mode === 'chat'` condition) in `src/app/page.tsx`
- [x] T011 [US2] Auto-switch `mode` to `'workflow'` when selecting a workflow conversation, and to `'chat'` when selecting a chat conversation in `src/app/page.tsx`
- [x] T012 [US2] Set workflow conversation title to `Workflow: owner/repo` format using repoInfo from workflow state in `src/app/page.tsx`
- [x] T013 [US2] Add visual indicator (icon or style) for workflow-type conversations in `src/app/components/ConversationList.tsx`

**Checkpoint**: Workflow runs appear in sidebar with distinguishable styling. Clicking switches between chat and workflow modes.

---

## Phase 5: User Story 3 — Delete Workflow History (Priority: P2)

**Goal**: Users can delete workflow conversation entries from the sidebar.

**Independent Test**: Delete a workflow conversation from the list, verify it's removed.

### Implementation for User Story 3

- [x] T014 [US3] Ensure `deleteConversation` in `conversation-store.ts` cleans up workflow conversations properly (verify no orphaned data) in `src/lib/conversation-store.ts`
- [x] T015 [US3] Handle edge case: if deleting the active workflow conversation, reset to idle state or create new chat conversation in `src/app/page.tsx`

**Checkpoint**: Workflow conversations can be deleted, with proper state cleanup.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases and quality improvements.

- [x] T016 Handle edge case: page refresh during actively running workflow — show error/interrupted state in `src/app/components/useWorkflow.ts`
- [x] T017 Handle localStorage quota exceeded error gracefully with Chinese error message in `src/lib/conversation-store.ts`
- [x] T018 Add Chinese comments to all new/modified functions explaining "做什么" and "为什么" across all modified files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — can start immediately
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion
- **User Story 2 (Phase 4)**: Depends on Phase 3 (needs workflow conversations to exist)
- **User Story 3 (Phase 5)**: Depends on Phase 4 (needs workflow entries in sidebar)
- **Polish (Phase 6)**: Depends on Phase 5

### Within Each Phase

- T001 → T002 → T003 (sequential — same file, schema first, then helpers)
- T004 → T005 → T006 (sequential — same file, add init → add callback → remove old storage)
- T007 depends on T004-T006
- T008, T009 depend on T007
- T010-T013: T010 first, then T011-T012 in parallel, then T013

### Parallel Opportunities

- T001 and reading existing code can happen in parallel
- T010 and T013 modify different files and can run in parallel
- T016 and T017 modify different files and can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (schema extension)
2. Complete Phase 3: User Story 1 (persistence via useWorkflow refactor)
3. **STOP and VALIDATE**: Refresh page at each workflow phase, verify restoration
4. This alone solves the core problem of data loss on refresh

### Incremental Delivery

1. Phase 2 → Foundation ready
2. Phase 3 (US1) → Workflow persists on refresh (MVP!)
3. Phase 4 (US2) → Workflows visible in sidebar, switchable
4. Phase 5 (US3) → Workflow entries deletable
5. Phase 6 → Edge cases handled, comments added

---

## Notes

- All changes are in existing files — no new files created
- Backward compatibility: existing chat conversations without `type` field default to `'chat'`
- Files affected: `conversation-store.ts`, `useWorkflow.ts`, `WorkflowPanel.tsx`, `page.tsx`, `ConversationList.tsx`
- Keep each file under 200 lines per constitution
