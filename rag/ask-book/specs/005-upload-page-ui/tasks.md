# Tasks: Upload Page UI

**Input**: Design documents from `/specs/005-upload-page-ui/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/delete-api.md, quickstart.md

**Tests**: No test tasks included — tests were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Create shared utilities used across components

- [x] T001 Create `src/lib/format.ts` — export `formatFileSize(bytes: number): string` that converts bytes to human-readable string (e.g., 1024 → "1.0 KB", 2560000 → "2.4 MB"). Export `formatDate(date: string | Date): string` that formats a timestamp as "YYYY-MM-DD HH:mm" in local time.

**Checkpoint**: Formatting utilities available for import

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the DELETE API endpoint that US3 depends on, and remove the old upload-form component

- [x] T002 Add DELETE handler to `src/app/api/documents/[id]/route.ts` — import `deleteDocument` from `@/db/queries/documents`. On DELETE: extract `id` from params, call `deleteDocument(id)`, return deleted document JSON or 404 `{ error: "Document not found." }` if not found. Keep existing GET handler unchanged.
- [x] T003 Delete the old `src/components/upload-form.tsx` file — it will be replaced by `upload-zone.tsx` and `upload-progress.tsx` in US1 and US2.

**Checkpoint**: DELETE API works via curl. Old component removed.

---

## Phase 3: User Story 1 — Upload a PDF via Drag-and-Drop or File Picker (Priority: P1)

**Goal**: User selects a PDF by drag-and-drop or click, sees filename/size, clicks upload to send to server.

**Independent Test**: Navigate to `/upload`, drag a PDF onto the zone, verify filename and size appear, click upload, verify file is sent to server.

### Implementation for User Story 1

- [x] T004 [US1] Create `src/components/upload-zone.tsx` — Client Component (`"use client"`) with a drop zone div that: (1) handles `onDragOver` (preventDefault, set `isDragOver` state for visual highlight), `onDragLeave` (remove highlight), `onDrop` (extract first PDF file from `dataTransfer.files`); (2) contains a hidden `<input type="file" accept=".pdf">` triggered on click; (3) validates file type (must be `application/pdf`) and size (≤ 10 MB) on selection — show inline error if invalid; (4) after valid selection, displays filename and formatted file size (using `formatFileSize`); (5) shows an "开始上传" button that calls `POST /api/upload` with FormData; (6) on successful upload response, calls `onUploadStart(documentId: string)` prop; (7) on error, shows error message with "重新选择" reset link. Style with Tailwind: dashed border, gray bg, blue highlight on drag-over, rounded corners. Accept props: `onUploadStart: (docId: string) => void`, `disabled?: boolean`.
- [x] T005 [US1] Update `src/app/upload/page.tsx` — rewrite as Client Component. Import `UploadZone` (and later `UploadProgress`, `DocumentList`). For now: render page title "上传员工手册", `<UploadZone>` with `onUploadStart` handler that stores the documentId in state. Basic layout with `max-w-3xl mx-auto px-4 py-8`.

**Checkpoint**: Drag-and-drop and click-to-select both work. File validation catches non-PDF and oversized files. Upload sends file to server.

---

## Phase 4: User Story 2 — Track Upload and Processing Progress (Priority: P2)

**Goal**: After upload starts, show real-time processing status that auto-updates via polling.

**Independent Test**: Upload a valid PDF. Verify status updates from "上传中" → "处理中" → "完成" automatically. On failure, verify error message with retry button.

### Implementation for User Story 2

- [x] T006 [US2] Create `src/components/upload-progress.tsx` — Client Component that accepts `documentId: string` and `onComplete: () => void` and `onReset: () => void` props. On mount, starts polling `GET /api/documents/:id` every 2 seconds. Displays status with Chinese labels and visual indicators: "处理中..." with pulsing animation for pending/processing, "完成" with green check and chunk count for completed, "处理失败" with red error and "重新上传" button for failed. On completed status: stop polling, call `onComplete`. On failed status: stop polling, show error with retry button that calls `onReset`. Clean up interval on unmount. Style with Tailwind: rounded card with status-appropriate background colors.
- [x] T007 [US2] Update `src/app/upload/page.tsx` — integrate `UploadProgress`. When `uploadDocId` state is set (from `onUploadStart`), render `<UploadProgress documentId={uploadDocId} onComplete={handleComplete} onReset={handleReset} />` instead of `<UploadZone>`. `handleComplete` clears `uploadDocId` and increments `refreshKey`. `handleReset` clears `uploadDocId` to show upload zone again.

**Checkpoint**: Full upload flow works: select file → upload → progress tracking → completion/failure. Upload zone reappears after completion or reset.

---

## Phase 5: User Story 3 — View and Manage Uploaded Documents (Priority: P3)

**Goal**: Document list below upload zone shows all documents with status badges, chunk count, date, and delete button.

**Independent Test**: Upload 2 PDFs. Verify both in list with correct data. Delete one, verify removed. Verify empty state when none remain.

### Implementation for User Story 3

- [x] T008 [US3] Rewrite `src/components/document-list.tsx` — Client Component that fetches `GET /api/documents` on mount and via `refreshKey` prop changes. Auto-polls every 5 seconds while any document has pending/processing status. Displays a table with columns: 文件名 (filename), 状态 (status badge with Chinese labels and colors per data-model.md), 分块数 (chunk count, or "—" if not completed), 上传时间 (formatted date via `formatDate`), 操作 (delete button). Delete button: calls `window.confirm("确定要删除这个文档吗？")`, then `DELETE /api/documents/:id`, then re-fetches the list. Empty state: "暂无已上传文档" centered text. Style with Tailwind: clean table with alternating row hints, rounded container, consistent padding.
- [x] T009 [US3] Update `src/app/upload/page.tsx` — add `<DocumentList refreshKey={refreshKey} />` section below the upload area with a "已上传文档" heading and divider.

**Checkpoint**: Document list shows all documents with correct data. Delete works with confirmation. Empty state displays correctly. List auto-refreshes for in-progress documents.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and visual refinement

- [x] T010 [P] Verify TypeScript compiles with zero errors via `pnpm tsc --noEmit`
- [x] T011 [P] Run ESLint and fix any warnings via `pnpm eslint src/`
- [x] T012 Run `pnpm build` to verify Next.js builds successfully with all new routes
- [ ] T013 Verify full UI flow end-to-end: navigate to `/upload`, upload a PDF via drag-and-drop, watch progress, verify it appears in document list, delete it, verify empty state

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Can start immediately (T002 is independent, T003 just deletes a file)
- **User Story 1 (Phase 3)**: Depends on Setup (T001 for formatFileSize)
- **User Story 2 (Phase 4)**: Depends on User Story 1 (needs upload zone + page structure)
- **User Story 3 (Phase 5)**: Depends on Foundational (T002 for DELETE API) and User Story 1 (needs page structure)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Setup — no other story dependencies
- **User Story 2 (P2)**: Depends on User Story 1 — adds progress component to page
- **User Story 3 (P3)**: Depends on User Story 1 and Foundational — needs page layout and DELETE API; can run in parallel with US2

### Within Each User Story

- Components before page integration
- Backend (API) before frontend (components that call it)

### Parallel Opportunities

- T001 and T002 can run in parallel (independent files)
- T004 and T006 and T008 are independent components (different files) but depend on different phases
- T010 and T011 can run in parallel (independent checks)
- US2 and US3 can theoretically start in parallel after US1 (different components)

---

## Parallel Example: Setup + Foundational

```bash
# Can start simultaneously:
Task: "T001 Create formatting utilities"
Task: "T002 Add DELETE API handler"
Task: "T003 Delete old upload-form.tsx"
```

## Parallel Example: Polish Phase

```bash
# Both can start simultaneously:
Task: "T010 TypeScript type check"
Task: "T011 ESLint check"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (formatting utilities)
2. Complete Phase 2: Foundational (DELETE API + remove old component)
3. Complete Phase 3: User Story 1 (drag-and-drop upload zone + page)
4. **STOP and VALIDATE**: Drag PDF onto zone, verify upload works
5. Core upload interaction is functional

### Incremental Delivery

1. Setup + Foundational → Utilities + DELETE API ready
2. User Story 1 → Drag-and-drop upload works (MVP!)
3. User Story 2 → Progress tracking during processing
4. User Story 3 → Document list with delete
5. Polish → Type checks, lint, build, E2E

### Sequential Strategy (Recommended)

1. Complete all phases sequentially
2. US2 extends the page created in US1 (adds progress component)
3. US3 extends the page further (adds document list)
4. Total: 4 new files, 3 rewritten files, 1 deleted file

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- This feature rewrites existing components from feature 002 (`upload-form.tsx` → `upload-zone.tsx` + `upload-progress.tsx`, `document-list.tsx` → rewritten, `upload/page.tsx` → rewritten)
- The old `upload-form.tsx` is deleted in T003; its functionality is split across `upload-zone.tsx` and `upload-progress.tsx`
- No new dependencies needed — Tailwind CSS and React already available
- No schema changes or migrations needed
- DELETE API uses existing `deleteDocument` query with CASCADE for chunk cleanup
