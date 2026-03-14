# Tasks: Conversation Rename and Delete

**Input**: Design documents from `/specs/011-conversation-manage/`
**Prerequisites**: plan.md, spec.md, research.md, contracts/

## Phase 1: Setup

**Purpose**: No setup needed — all dependencies already installed, schema already exists.

(No tasks — project is already initialized with all required technologies.)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the database query function needed by both user stories

- [x] T001 Add `updateConversationTitle(id, title)` function in `src/db/queries/conversations.ts` that updates title and updatedAt, returns the updated conversation

**Checkpoint**: Database layer ready for both delete (already exists) and rename operations.

---

## Phase 3: User Story 1 — Delete a Conversation (Priority: P1) 🎯 MVP

**Goal**: Users can delete any conversation from the sidebar with confirmation. Active conversation deletion resets the chat area.

**Independent Test**: Create several conversations. Delete one non-active → it disappears, active stays. Delete the active conversation → chat resets to empty. Delete the only conversation → sidebar shows empty state.

### Implementation for User Story 1

- [x] T002 [US1] Add PATCH handler to `src/app/api/conversations/[id]/route.ts` with Zod validation for `{ title: string }` (trim, min 1, max 100) — this endpoint serves US2 but is in the same file as DELETE, so implement together
- [x] T003 [US1] Add `onDelete` and `onRename` callback props to `ChatSidebar` in `src/components/chat/chat-sidebar.tsx`. Add an action menu button (⋯) on each conversation item that shows on hover (always visible on mobile). Wire delete button to call `onDelete(id)` with native `confirm()` dialog
- [x] T004 [US1] Add `handleDeleteConversation` function in `src/app/chat/page.tsx` that calls `DELETE /api/conversations/[id]`, removes conversation from state, and resets chat area if the deleted conversation was active. Pass as `onDelete` prop to `ChatSidebar`

**Checkpoint**: Delete flow works end-to-end. Deleting active conversation resets chat. Deleting non-active leaves current chat intact.

---

## Phase 4: User Story 2 — Rename a Conversation (Priority: P2)

**Goal**: Users can rename any conversation via inline editing in the sidebar. Enter saves, Escape cancels, click-outside saves.

**Independent Test**: Click rename on a conversation. Title becomes editable input. Type new name, press Enter → saves. Press Escape → reverts. Clear field and Enter → reverts to original. Refresh page → new title persists.

### Implementation for User Story 2

- [x] T005 [US2] Add inline rename editing state and UI to `src/components/chat/chat-sidebar.tsx`: when rename is triggered, replace title with `<input>` (current title pre-filled and selected, max 100 chars). Handle Enter (save), Escape (cancel), blur (save). Call `onRename(id, newTitle)` on save, revert on empty/whitespace
- [x] T006 [US2] Add `handleRenameConversation` function in `src/app/chat/page.tsx` that calls `PATCH /api/conversations/[id]` with `{ title }`, updates conversation title in local state, and shows `alert()` on error. Pass as `onRename` prop to `ChatSidebar`

**Checkpoint**: Rename flow works end-to-end. Title persists after page refresh. Empty titles rejected.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Error handling and cleanup

- [x] T007 Run `pnpm lint` and fix any issues
- [x] T008 Verify mobile viewport (< 1024px): action buttons visible without hover, rename/delete work correctly in mobile sidebar overlay

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 2 (Foundational)**: No dependencies — start immediately
- **Phase 3 (US1)**: Depends on Phase 2 (needs updateConversationTitle for PATCH handler)
- **Phase 4 (US2)**: Depends on Phase 3 (sidebar UI with action menu already built)
- **Phase 5 (Polish)**: Depends on Phases 3–4

### Within Each User Story

- Backend (DB query → API route) before frontend (sidebar UI → page integration)
- T002 (PATCH handler) is implemented in US1 phase since it's in the same file as DELETE handler

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 2: Add updateConversationTitle query
2. Complete Phase 3: Delete flow (API + sidebar UI + page integration)
3. **VALIDATE**: Delete conversations, verify active/non-active/only-conversation cases

### Full Feature

4. Complete Phase 4: Rename flow (inline editing + page integration)
5. Complete Phase 5: Lint + mobile verification
6. **VALIDATE**: Full rename + delete on desktop and mobile

---

## Notes

- No new files created — all changes to existing files
- No schema changes — `title` column already exists on `conversations` table
- DELETE endpoint already exists — only PATCH is new
- `onDelete: cascade` on messages means deleting a conversation auto-deletes all messages
- 4 files modified: `conversations.ts` (query), `route.ts` (API), `chat-sidebar.tsx` (UI), `page.tsx` (state)
