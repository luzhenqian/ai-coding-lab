# Tasks: PDF Storage and In-Browser Preview

**Input**: Design documents from `/specs/009-pdf-storage-preview/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Phase 1: Setup

**Purpose**: Schema changes and shared infrastructure

- [x] T001 Add `fileData` bytea column (nullable) to documents table in `src/db/schema.ts`
- [x] T002 Run `pnpm drizzle-kit push` to apply schema changes to the database
- [x] T003 Update `listDocuments()` in `src/db/queries/documents.ts` to exclude `file_data` column from SELECT (use explicit column selection)
- [x] T004 Add `getDocumentFileData(id)` query in `src/db/queries/documents.ts` that selects only `id`, `filename`, and `file_data` for a given document
- [x] T005 Update `insertDocument()` in `src/db/queries/documents.ts` to accept optional `fileData` parameter

**Checkpoint**: Schema updated, queries ready — user story implementation can begin

---

## Phase 2: User Story 1 — Store Original PDF on Upload (Priority: P1) 🎯 MVP

**Goal**: When a user uploads a PDF, the original binary is stored in the database alongside metadata.

**Independent Test**: Upload a PDF, then query database to verify `file_data` is non-null and matches the original file size.

### Implementation for User Story 1

- [x] T006 [US1] Update upload route `src/app/api/upload/route.ts` to pass the PDF buffer to `insertDocument()` as `fileData`
- [x] T007 [US1] Update `MAX_FILE_SIZE` in upload route from 10 MB to 20 MB per spec FR-009

**Checkpoint**: Uploaded PDFs now store binary data in database. Verify with: `SELECT id, filename, octet_length(file_data) FROM documents WHERE file_data IS NOT NULL;`

---

## Phase 3: User Story 2 — In-Browser PDF Preview (Priority: P2)

**Goal**: Users can click a preview button in the document list to view the PDF in an in-browser modal overlay.

**Independent Test**: Navigate to document list, click preview button, verify PDF renders in modal. Close modal and verify return to list.

### Implementation for User Story 2

- [x] T008 [US2] Create `GET /api/documents/[id]/file` route in `src/app/api/documents/[id]/file/route.ts` — serves PDF binary with `Content-Type: application/pdf` and `Content-Disposition: inline`
- [x] T009 [P] [US2] Create `PdfPreviewModal` component in `src/components/pdf-preview-modal.tsx` — full-screen overlay with iframe, close button, and Escape key support
- [x] T010 [US2] Add preview button to `DocumentList` component in `src/components/document-list.tsx` — eye icon visible only when document has file data, opens `PdfPreviewModal`
- [x] T011 [US2] Update `GET /api/documents` response in `src/app/api/documents/route.ts` to include a `hasFileData` boolean field so frontend knows whether to show preview button

**Checkpoint**: Full preview flow works — upload → preview button visible → click → modal with PDF → close

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases and UX refinements

- [x] T012 Add loading indicator in `PdfPreviewModal` while PDF loads in iframe
- [x] T013 Add error handling in `PdfPreviewModal` for corrupted/missing PDF data (fallback download link)
- [x] T014 Ensure mobile responsiveness — preview modal works as full-screen overlay on small viewports
- [x] T015 Run `pnpm lint` and fix any issues

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (US1)**: Depends on Phase 1 completion
- **Phase 3 (US2)**: Depends on Phase 1 completion; works best after Phase 2 (needs uploaded files with data)
- **Phase 4 (Polish)**: Depends on Phase 3 completion

### Parallel Opportunities

- T009 (PdfPreviewModal component) can be built in parallel with T008 (API route)
- T003 and T004 can run in parallel (different query functions)

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1: Schema + queries
2. Complete Phase 2: Store PDF on upload
3. **VALIDATE**: Upload PDF, check database for stored binary

### Full Feature

4. Complete Phase 3: API endpoint + preview modal + document list button
5. Complete Phase 4: Polish edge cases
6. **VALIDATE**: Full preview flow end-to-end

---

## Notes

- `file_data` is nullable — legacy documents won't have it
- `listDocuments` must NEVER load `file_data` to avoid memory issues
- Browser's native PDF viewer handles scroll/zoom/pages automatically via iframe
- No new npm dependencies required
