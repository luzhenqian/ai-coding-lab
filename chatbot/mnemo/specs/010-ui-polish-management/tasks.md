# Tasks: UI Polish for Memory & Document Management

**Input**: Design documents from `specs/010-ui-polish-management/`
**Prerequisites**: plan.md (required), spec.md (required), research.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: User Story 1 - Delete Confirmation Dialogs (Priority: P1)

**Goal**: Add AlertDialog confirmation before deleting any memory or document, preventing accidental data loss.

**Independent Test**: Click delete on a memory and a document; confirm dialog appears, cancel preserves item, confirm deletes item.

### Implementation

- [x] T001 [P] [US1] Add AlertDialog delete confirmation to memory list in `components/memories/memory-list.tsx`
- [x] T002 [P] [US1] Add AlertDialog delete confirmation to document list in `app/documents/page.tsx`

**Checkpoint**: Both memory and document deletion require user confirmation via dialog.

---

## Phase 2: User Story 2 - Custom Category Selector (Priority: P2)

**Goal**: Replace native `<select>` dropdown with a styled segmented button group for memory categories.

**Independent Test**: Open memory editor, verify segmented selector shows 3 categories with color coding, click to select, save with correct category.

### Implementation

- [x] T003 [US2] Replace native `<select>` with segmented button group in `components/memories/memory-editor.tsx`

**Checkpoint**: Memory category selection uses styled segmented buttons matching design system colors.

---

## Phase 3: User Story 3 - Drag-and-Drop Document Upload (Priority: P2)

**Goal**: Replace native file input with a drag-and-drop upload zone that supports click-to-browse fallback.

**Independent Test**: Drag a .pdf file onto the drop zone; verify visual feedback on drag-over, upload starts on drop, click zone to browse also works.

### Implementation

- [x] T004 [US3] Replace native file input with drag-and-drop upload zone in `app/documents/page.tsx`

**Checkpoint**: Documents can be uploaded via drag-and-drop or click-to-browse with visual feedback.

---

## Phase 4: User Story 4 - Chunk Count Display (Priority: P3)

**Goal**: Show processing indicator for documents being processed, auto-refresh to display actual chunk count when ready.

**Independent Test**: Upload a document, observe "处理中" indicator instead of "0 个分块", wait for auto-refresh to show actual chunk count.

### Implementation

- [x] T005 [US4] Add polling for processing documents and improve chunk count display in `app/documents/page.tsx`

**Checkpoint**: Processing documents show indicator; chunk count auto-updates when processing completes.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (US1)**: No dependencies - can start immediately
- **Phase 2 (US2)**: No dependencies - can start immediately
- **Phase 3 (US3)**: No dependencies - can start immediately
- **Phase 4 (US4)**: No dependencies - can start immediately

All user stories are independent and can be implemented in parallel.

### Parallel Opportunities

- T001 and T002 modify different files and can run in parallel
- All four phases are independent and can be worked on simultaneously
- T002, T004, T005 all modify `app/documents/page.tsx` — if done sequentially, apply in order T002 → T004 → T005

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001 + T002 (delete confirmations)
2. **STOP and VALIDATE**: Test both memory and document deletion dialogs
3. Proceed to remaining stories

### Incremental Delivery

1. US1: Delete confirmations → immediate safety improvement
2. US2: Category selector → visual polish for memory editor
3. US3: Drag-drop upload → improved upload UX
4. US4: Chunk count display → informational improvement

---

## Notes

- T001, T002 follow exact AlertDialog pattern from `components/sidebar/conversation-list.tsx`
- T003 uses color-coded buttons matching `categoryStyles` in `memory-list.tsx` (blue/green/purple)
- T004 uses native HTML5 DnD API (no new dependencies per research.md)
- T005 uses setInterval polling (3s) that auto-stops when no documents are processing
- All UI text in Chinese, consistent with existing interface
