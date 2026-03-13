# Tasks: Vector Similarity Retrieval Module

**Input**: Design documents from `/specs/003-vector-retrieval/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/retriever-api.md, quickstart.md

**Tests**: No test tasks included — tests were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Add new types shared across all user stories

- [x] T001 [P] Add `RetrievalResult` and `RetrievalOptions` interfaces to `src/types/index.ts` — `RetrievalResult` has fields: `content: string`, `similarity: number`, `documentFilename: string`, `metadata: ChunkMetadata`. `RetrievalOptions` has fields: `topK?: number` (default 5), `similarityThreshold?: number` (default 0.7)
- [x] T002 [P] Create directory `src/lib/rag/` for RAG-related modules

**Checkpoint**: Types available for import, rag directory exists

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the data access and embedding primitives that all user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create `searchChunksWithDocument` query function in `src/db/queries/chunks.ts` — performs cosine similarity search JOINing `chunks` with `documents` table to include `documents.filename` in results. Accept parameters: `queryEmbedding: number[]`, `limit: number`, `threshold: number`. Return array of `{ content, similarity, documentFilename, metadata }`. Use `1 - (embedding <=> query::vector)` for similarity score. Filter by threshold. Order by similarity descending.
- [x] T004 Create `embedQuery` function in `src/lib/rag/retriever.ts` — a thin wrapper that uses Vercel AI SDK `embed` (singular, not `embedMany`) with `openai.embedding("text-embedding-3-small")` to convert a single question string into a 1536-dim embedding vector. Return `number[]`.

**Checkpoint**: Query and embedding primitives independently importable

---

## Phase 3: User Story 1 — Retrieve Relevant Chunks by Question (Priority: P1)

**Goal**: Pass a natural-language question, receive the most semantically relevant text chunks with similarity scores, source document filenames, and metadata.

**Independent Test**: Call `retrieveRelevantChunks("What is the company vacation policy?")` against a database with an uploaded employee handbook. Verify results contain relevant content, similarity scores, document filenames, page numbers, and section titles, ordered by similarity descending.

### Implementation for User Story 1

- [x] T005 [US1] Implement `retrieveRelevantChunks` function in `src/lib/rag/retriever.ts` — accepts `question: string` and optional `RetrievalOptions`. Validates question is non-empty (throw `Error("Question text cannot be empty")`). Validates topK is positive integer if provided (throw `Error("topK must be a positive integer")`). Calls `embedQuery` to get question embedding, then calls `searchChunksWithDocument` with the embedding, topK (default 5), and similarityThreshold (default 0.7). Returns `RetrievalResult[]` (may be empty if no chunks meet threshold).

**Checkpoint**: Full retrieval pipeline works: question → embedding → similarity search → ranked results with source attribution

---

## Phase 4: User Story 2 — Filter Out Low-Relevance Results (Priority: P2)

**Goal**: Results below a configurable similarity threshold are automatically excluded. Empty array returned when nothing is relevant.

**Independent Test**: Query with a question unrelated to any uploaded content. Verify empty array returned. Query with custom threshold of 0.5 and verify more results included.

### Implementation for User Story 2

- [x] T006 [US2] Verify threshold filtering in `src/lib/rag/retriever.ts` — ensure `searchChunksWithDocument` correctly applies the threshold filter via the SQL `WHERE` clause, that custom threshold values override the default (0.7), and that an empty array is returned when no chunks meet the threshold. No new code expected — this validates T003 and T005 work correctly together for the threshold use case.

**Checkpoint**: Threshold filtering confirmed working. Empty results for irrelevant queries.

---

## Phase 5: User Story 3 — Include Document Context in Results (Priority: P3)

**Goal**: Each retrieved chunk includes its source document's filename alongside page and section metadata.

**Independent Test**: Upload two different PDFs. Query with a question relevant to both. Verify each result has the correct source document filename, page number, and section (or null).

### Implementation for User Story 3

- [x] T007 [US3] Verify document context in `src/lib/rag/retriever.ts` — ensure the JOIN in `searchChunksWithDocument` correctly maps each chunk's `documentId` to the parent document's `filename`, that `metadata.page` and `metadata.section` are correctly extracted from the JSONB column, and that `section: null` is preserved (not converted to empty string or omitted). No new code expected — this validates T003 produces correct document context.

**Checkpoint**: Source attribution confirmed: filename, page, section all present and accurate.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation

- [x] T008 [P] Verify TypeScript compiles with zero errors via `pnpm tsc --noEmit`
- [x] T009 [P] Run ESLint and fix any warnings via `pnpm eslint src/`
- [ ] T010 Verify full retrieval flow end-to-end: upload a PDF (feature 002), then call `retrieveRelevantChunks` with a relevant question and confirm results are accurate, ordered, and include source attribution

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001 for types, T002 for directory)
- **User Story 1 (Phase 3)**: Depends on Foundational (T003, T004)
- **User Story 2 (Phase 4)**: Depends on User Story 1 (validates existing behavior)
- **User Story 3 (Phase 5)**: Depends on User Story 1 (validates existing behavior)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational — no other story dependencies
- **User Story 2 (P2)**: Depends on User Story 1 — validates threshold behavior
- **User Story 3 (P3)**: Depends on User Story 1 — validates document context; can run in parallel with US2

### Within Each User Story

- Query function before retriever function
- Embedding helper before retriever function
- Core implementation before validation tasks

### Parallel Opportunities

- T001 and T002 can run in parallel (independent files/directories)
- T003 and T004 CANNOT run in parallel (T004 depends on T002 directory existing)
- T006 and T007 can run in parallel (independent validation of different aspects)
- T008 and T009 can run in parallel (independent checks)

---

## Parallel Example: Setup Phase

```bash
# Both can start simultaneously:
Task: "T001 Add RetrievalResult and RetrievalOptions types"
Task: "T002 Create src/lib/rag/ directory"
```

## Parallel Example: Validation Phase

```bash
# US2 and US3 validation can run in parallel:
Task: "T006 Verify threshold filtering"
Task: "T007 Verify document context"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types + directory)
2. Complete Phase 2: Foundational (query with JOIN + embed helper)
3. Complete Phase 3: User Story 1 (retriever function)
4. **STOP and VALIDATE**: Call `retrieveRelevantChunks` with a test question
5. Core retrieval pipeline is functional

### Incremental Delivery

1. Setup + Foundational → Primitives ready
2. User Story 1 → Full retrieval pipeline (MVP!)
3. User Story 2 → Threshold filtering validated
4. User Story 3 → Document context validated
5. Polish → Type checks, lint, E2E verification

### Sequential Strategy (Recommended)

This is a small, focused feature (~100 LOC of new code):

1. Complete all phases sequentially (Setup → Foundation → US1 → US2 → US3 → Polish)
2. US2 and US3 are validation-only phases — they verify behavior already implemented in US1
3. Total estimated implementation: 3 files modified, 1 file created

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- This feature builds on existing code from features 001 (schema, queries) and 002 (embeddings)
- US2 and US3 are validation tasks — the core logic is all in US1's implementation
- The `searchChunksWithDocument` query is the key new database function; `retrieveRelevantChunks` orchestrates
- No new dependencies needed — `ai` and `@ai-sdk/openai` already installed in feature 002
- No schema changes or migrations needed
