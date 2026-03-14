# Tasks: Citation Click Opens PDF Preview

**Input**: Design documents from `/specs/012-citation-pdf-preview/`
**Prerequisites**: plan.md, spec.md, research.md

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Add database query and API endpoint to resolve filename → document ID

- [x] T001 Add `getDocumentByFilename(filename)` function in `src/db/queries/documents.ts` that returns document `id` and `filename` by matching filename, or null if not found
- [x] T002 Create `GET /api/documents/by-filename` endpoint in `src/app/api/documents/by-filename/route.ts` that accepts `?name=` query parameter, calls `getDocumentByFilename`, returns `{ id, filename }` on success or 404

**Checkpoint**: `GET /api/documents/by-filename?name=Noah员工手册_V2.0.pdf` returns the document ID.

---

## Phase 2: User Story 1 — Click Citation to Preview PDF at Page (Priority: P1) 🎯 MVP

**Goal**: Clicking a citation tag opens the referenced PDF in a new browser tab at the correct page.

**Independent Test**: Chat to get citations. Click a citation tag. New tab opens with PDF at the cited page.

### Implementation for User Story 1

- [x] T003 [US1] Rewrite `src/components/chat/source-citations.tsx`: replace `<button>` with `<a>` tags that have `target="_blank"` and `rel="noopener noreferrer"`. Each citation link href should be constructed by fetching document ID from `/api/documents/by-filename?name={filename}` and building `/api/documents/{id}/file#page={page}`. Remove the expand/collapse state and detail panel. Keep the existing visual styling (icon + filename + page number).
- [x] T004 [US1] Verify citation links work: click a citation in the chat UI, confirm new tab opens with PDF at correct page

**Checkpoint**: Citations are clickable links. Clicking opens PDF in new tab at the correct page. Missing documents show browser error.

---

## Phase 3: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup and validation

- [x] T005 Run `pnpm lint` and fix any issues
- [x] T006 Test on mobile viewport — citation links should be tappable and open PDF in new tab

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Foundational)**: No dependencies — start immediately
- **Phase 2 (US1)**: Depends on Phase 1 (needs filename lookup API)
- **Phase 3 (Polish)**: Depends on Phase 2

### Within User Story 1

- T001 (DB query) → T002 (API endpoint) → T003 (UI component) → T004 (verify)

---

## Implementation Strategy

### MVP (User Story 1)

1. Complete Phase 1: Add filename lookup query + API endpoint
2. Complete Phase 2: Update citation component to render as links
3. **VALIDATE**: Click citation → PDF opens at correct page in new tab

---

## Notes

- 3 files modified/created: `documents.ts` (query), `by-filename/route.ts` (new API), `source-citations.tsx` (UI)
- No schema changes
- PDF page navigation uses standard `#page=N` URL fragment — browser handles natively
- The expand/collapse detail panel is removed since click now navigates to PDF
- Citation component needs to resolve filename → documentId asynchronously (fetch on mount or on click)
