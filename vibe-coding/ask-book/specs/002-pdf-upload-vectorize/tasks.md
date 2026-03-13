# Tasks: PDF Upload, Parsing & Vectorization

**Input**: Design documents from `/specs/002-pdf-upload-vectorize/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/upload-api.md, quickstart.md

**Tests**: No test tasks included — tests were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install new dependencies and set up shared library modules

- [x] T001 Install `pdf-parse`, `ai`, and `@ai-sdk/openai` dependencies via pnpm
- [x] T002 [P] Add `OPENAI_API_KEY` to `.env.example` if not already present (verify current contents)
- [x] T003 [P] Extend `src/types/index.ts` with upload-specific types: `ChunkMetadata` (`{ page: number; section: string | null }`), `ChunkWithEmbedding` (`{ content: string; embedding: number[]; metadata: ChunkMetadata }`), and `ProcessingResult` (`{ documentId: string; chunkCount: number }`)

**Checkpoint**: Dependencies installed, shared types available for import

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core library functions that ALL user stories depend on — MUST complete before any user story

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create `src/lib/pdf-parser.ts` — export `parsePdf(buffer: Buffer): Promise<{ pages: { pageNumber: number; text: string }[] }>` that uses pdf-parse to extract text per page; throw descriptive error if no text content found
- [x] T005 Create `src/lib/chunker.ts` — export `chunkText(pages: { pageNumber: number; text: string }[]): ChunkWithEmbedding[]` (without embeddings yet, just content + metadata). Implement: detect section headings (all-caps lines < 80 chars, numbered headings, "Chapter/Section" patterns), split at heading boundaries then paragraph boundaries (double newline), split oversized chunks (> 600 tokens) at sentence boundaries, add ~50 token overlap from previous chunk tail, attach `{ page, section }` metadata. Use word count × 1.33 as token approximation.
- [x] T006 Create `src/lib/embeddings.ts` — export `generateEmbeddings(texts: string[]): Promise<number[][]>` that uses Vercel AI SDK `embedMany` with OpenAI `text-embedding-3-small` provider. Process in batches of 100. Return array of 1536-dim embedding vectors.

**Checkpoint**: pdf-parser, chunker, and embeddings modules individually importable and functional

---

## Phase 3: User Story 1 — Upload and Process a PDF (Priority: P1)

**Goal**: User uploads a PDF, system extracts text, chunks it, generates embeddings, stores in DB, and shows real-time progress.

**Independent Test**: Upload a sample PDF at `http://localhost:3000/upload`. Verify document record created with status transitioning pending → processing → completed. Check chunks in DB have content, 1536-dim embeddings, and page/section metadata. Verify chunk overlap between adjacent chunks.

### Implementation for User Story 1

- [x] T007 [US1] Create `src/lib/process-document.ts` — export `processDocument(documentId: string, buffer: Buffer): Promise<void>` that orchestrates the full pipeline: (1) update document status to "processing", (2) call `parsePdf`, (3) call `chunkText`, (4) call `generateEmbeddings` for chunk contents, (5) call `insertChunks` in a transaction, (6) update document status to "completed" with chunkCount. On any error: update status to "failed", delete any partial chunks via `deleteChunksByDocumentId`.
- [x] T008 [US1] Create `src/app/api/upload/route.ts` — POST handler: read `FormData`, extract file, validate PDF MIME type and size ≤ 10 MB with Zod, call `insertDocument` with filename + fileSize, then call `processDocument` asynchronously (don't await — return 201 immediately with document record). Import validation from a Zod schema.
- [x] T009 [US1] Create `src/app/api/documents/[id]/route.ts` — GET handler: read `id` from params, call `getDocumentById`, return document JSON or 404.
- [x] T010 [US1] Create `src/components/upload-form.tsx` — Client Component (`"use client"`): file input (accept=".pdf"), upload button, fetch POST to `/api/upload` with FormData. On success, start polling `GET /api/documents/:id` every 2 seconds. Display current status ("pending", "processing", "completed", "failed"). Show chunk count when completed. Stop polling on terminal status. Style with Tailwind CSS.
- [x] T011 [US1] Create `src/app/upload/page.tsx` — Server Component shell that renders `<UploadForm />` and `<DocumentList />` components. Add basic page layout with heading "Upload Employee Handbook".

**Checkpoint**: Full upload → process → display flow works end-to-end. Document status transitions correctly. Chunks stored with embeddings and metadata.

---

## Phase 4: User Story 2 — Upload Validation and Error Handling (Priority: P2)

**Goal**: Invalid files are rejected immediately with clear messages. Processing failures are handled gracefully with cleanup.

**Independent Test**: Upload a .txt file (rejected with "Only PDF files are accepted"), a 15 MB PDF (rejected with "File size must be under 10 MB"), and a corrupted/image-only PDF (document status set to "failed" with error message, no orphaned chunks).

### Implementation for User Story 2

- [x] T012 [US2] Add client-side validation to `src/components/upload-form.tsx` — check file extension is `.pdf` and file size ≤ 10 MB before sending to server. Display inline error messages styled with Tailwind (red text). Disable upload button while processing.
- [x] T013 [US2] Enhance `src/lib/process-document.ts` error handling — wrap each stage (parse, chunk, embed, persist) in try/catch. On pdf-parse failure (corrupted/empty PDF), set status "failed" with error "No text content found — PDF may be image-only or corrupted". On embedding API failure, clean up any partial chunks, set status "failed" with error "Embedding generation failed". Ensure no orphaned data on any failure path.
- [x] T014 [US2] Enhance `src/components/upload-form.tsx` to display error state — when document status is "failed", show the error message in red with an option to dismiss and try again.

**Checkpoint**: All invalid file types and sizes rejected before processing. Processing failures show clear messages. No orphaned database records after any failure.

---

## Phase 5: User Story 3 — View Upload History and Document Status (Priority: P3)

**Goal**: Upload page shows a list of all previously uploaded documents with their status, filename, chunk count, and date.

**Independent Test**: Upload 2 documents, verify both appear in the list sorted by most recent first, with correct status, filename, and chunk count.

### Implementation for User Story 3

- [x] T015 [US3] Create `src/app/api/documents/route.ts` — GET handler: call `listDocuments()`, return JSON array sorted by createdAt descending.
- [x] T016 [US3] Create `src/components/document-list.tsx` — Client Component (`"use client"`): fetch `GET /api/documents` on mount and on interval (every 5 seconds while any document is "processing"). Display table with columns: filename, status (with colored badge), chunk count, upload date. Style with Tailwind CSS. Empty state: "No documents uploaded yet."
- [x] T017 [US3] Update `src/app/upload/page.tsx` to include `<DocumentList />` below the upload form with a visual separator.

**Checkpoint**: Document list shows all uploads with live status updates. New uploads appear immediately.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and integration

- [x] T018 [P] Verify TypeScript compiles with zero errors via `pnpm tsc --noEmit`
- [x] T019 [P] Run ESLint and fix any warnings via `pnpm eslint src/`
- [ ] T020 Verify full end-to-end flow: upload PDF → see progress → document appears in list with "completed" status and correct chunk count
- [ ] T021 Verify error flows: upload invalid file types, oversized files, and corrupted PDFs — confirm proper error messages and no orphaned data

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001 for dependencies, T003 for types) — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (T004, T005, T006)
- **User Story 2 (Phase 4)**: Depends on User Story 1 (enhances existing components)
- **User Story 3 (Phase 5)**: Depends on User Story 1 (needs upload page and documents in DB)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational (Phase 2) — no other story dependencies
- **User Story 2 (P2)**: Depends on User Story 1 — enhances upload-form and process-document
- **User Story 3 (P3)**: Depends on User Story 1 — needs upload page to exist; can run in parallel with US2

### Within Each User Story

- Library functions before route handlers
- Route handlers before UI components
- Backend before frontend within each story

### Parallel Opportunities

- T002 and T003 can run in parallel (independent files)
- T004, T005, T006 CANNOT run in parallel (T005 chunker depends on types from T004 parser output)
- T018 and T019 can run in parallel (independent checks)
- User Stories 2 and 3 can start in parallel after User Story 1 (though US2 modifies US1 files)

---

## Parallel Example: Setup Phase

```bash
# After T001 completes, launch in parallel:
Task: "T002 Add OPENAI_API_KEY to .env.example"
Task: "T003 Extend types in src/types/index.ts"
```

## Parallel Example: Polish Phase

```bash
# Both can start simultaneously:
Task: "T018 TypeScript type check"
Task: "T019 ESLint check"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (dependencies + types)
2. Complete Phase 2: Foundational (pdf-parser, chunker, embeddings)
3. Complete Phase 3: User Story 1 (upload endpoint + processing + UI)
4. **STOP and VALIDATE**: Upload a PDF, verify chunks in DB
5. Core pipeline is functional

### Incremental Delivery

1. Setup + Foundational → Library modules ready
2. User Story 1 → Full upload-to-vector pipeline (MVP!)
3. User Story 2 → Robust validation and error handling
4. User Story 3 → Document history list
5. Polish → Type checks, lint, E2E verification

### Sequential Strategy (Recommended)

This feature has more inter-dependencies than feature 001:

1. Complete all phases sequentially (Setup → Foundation → US1 → US2 → US3 → Polish)
2. US2 modifies US1 files (upload-form, process-document) so parallel execution is risky
3. US3 can start in parallel with US2 if a second developer is available

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- This feature builds on existing code from 001-db-schema-init (schema, queries, DB client)
- The `processDocument` function runs asynchronously — the upload endpoint returns immediately
- Commit after each task or logical group
- No test tasks generated — add via `/speckit.tasks` with test flag if needed later
