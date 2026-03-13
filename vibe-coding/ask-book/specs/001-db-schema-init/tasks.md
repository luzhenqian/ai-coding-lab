# Tasks: Database Schema Design & Initialization

**Input**: Design documents from `/specs/001-db-schema-init/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: No test tasks included — tests were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, Docker environment, and dependency configuration

- [x] T001 Initialize Next.js 16+ project with TypeScript strict mode, Tailwind CSS, and pnpm in project root
- [x] T002 [P] Create `docker-compose.yml` with PostgreSQL 16 + pgvector service using `pgvector/pgvector:pg16` image, database `askbook`, user `askbook`, port `5432`
- [x] T003 [P] Create `.env.example` with `DATABASE_URL=postgresql://askbook:askbook@localhost:5432/askbook` and `OPENAI_API_KEY=sk-your-key-here`
- [x] T004 [P] Create `.env.local` entry in `.gitignore` to prevent secrets from being committed
- [x] T005 Install Drizzle ORM (`drizzle-orm`), Drizzle Kit (`drizzle-kit`), and PostgreSQL driver (`postgres`) as dependencies via pnpm
- [x] T006 Create `drizzle.config.ts` at project root with PostgreSQL connection from `DATABASE_URL` env var, schema path `src/db/schema.ts`, and migrations output to `src/db/migrations`

**Checkpoint**: Project scaffolded, Docker starts PostgreSQL + pgvector, Drizzle Kit configured

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database connection and pgvector extension — MUST be complete before ANY schema work

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create `src/db/index.ts` with Drizzle client initialization: import `postgres` driver, read `DATABASE_URL` from env, export typed `db` instance
- [x] T008 Create initial migration to enable pgvector extension via `CREATE EXTENSION IF NOT EXISTS vector` in `src/db/migrations/`

**Checkpoint**: Database connection works, pgvector extension enabled, `db` client importable

---

## Phase 3: User Story 1 — Local Development Environment Bootstrap (Priority: P1)

**Goal**: All four tables created via Drizzle schema + migrations; developer can stand up full DB with two commands.

**Independent Test**: Run `docker compose up -d` then `pnpm drizzle-kit migrate`; verify all four tables and the HNSW index exist via `\dt` and `\di` in psql.

### Implementation for User Story 1

- [x] T009 [US1] Define `statusEnum` pgEnum (`pending`, `processing`, `completed`, `failed`) in `src/db/schema.ts`
- [x] T010 [US1] Define `documents` table in `src/db/schema.ts` with columns: `id` (uuid PK, default `gen_random_uuid()`), `filename` (text, not null), `fileSize` (integer, not null), `status` (statusEnum, not null, default `pending`), `chunkCount` (integer, not null, default `0`), `createdAt` (timestamp with timezone, not null, default `now()`), `updatedAt` (timestamp with timezone, not null, default `now()`)
- [x] T011 [US1] Define `chunks` table in `src/db/schema.ts` with columns: `id` (uuid PK, default `gen_random_uuid()`), `documentId` (uuid, FK → documents.id, ON DELETE CASCADE, not null), `content` (text, not null), `embedding` (vector(1536), not null), `metadata` (jsonb, nullable), `createdAt` (timestamp with timezone, not null, default `now()`)
- [x] T012 [US1] Define `conversations` table in `src/db/schema.ts` with columns: `id` (uuid PK, default `gen_random_uuid()`), `title` (text, nullable), `createdAt` (timestamp with timezone, not null, default `now()`), `updatedAt` (timestamp with timezone, not null, default `now()`)
- [x] T013 [US1] Define `messages` table in `src/db/schema.ts` with columns: `id` (uuid PK, default `gen_random_uuid()`), `conversationId` (uuid, FK → conversations.id, ON DELETE CASCADE, not null), `role` (text, not null), `content` (text, not null), `sources` (jsonb, nullable), `createdAt` (timestamp with timezone, not null, default `now()`)
- [x] T014 [US1] Create HNSW vector index on `chunks.embedding` column using `vector_cosine_ops` operator class in `src/db/schema.ts`
- [x] T015 [US1] Export Drizzle relation definitions in `src/db/schema.ts`: documents → chunks (one-to-many), conversations → messages (one-to-many)
- [x] T016 [US1] Generate migration files via `pnpm drizzle-kit generate` and commit to `src/db/migrations/`
- [x] T017 [US1] Create `src/types/index.ts` with inferred TypeScript types exported from Drizzle schema: `Document`, `NewDocument`, `Chunk`, `NewChunk`, `Conversation`, `NewConversation`, `Message`, `NewMessage`
- [ ] T018 [US1] Verify full migration flow: `docker compose up -d` → `pnpm drizzle-kit migrate` → confirm all tables, constraints, and HNSW index via psql *(requires Docker — manual verification)*

**Checkpoint**: All four tables created with correct columns, types, constraints, foreign keys, and HNSW index. Developer can bootstrap from zero in two commands.

---

## Phase 4: User Story 2 — Document Metadata Persistence (Priority: P2)

**Goal**: Documents table supports full CRUD with default values and status transitions.

**Independent Test**: Insert a document with filename and fileSize; verify defaults (status=pending, chunkCount=0). Update status to completed with chunkCount=42; verify persistence. Query by ID; verify all fields and types.

### Implementation for User Story 2

- [x] T019 [US2] Create `src/db/queries/documents.ts` with typed query helpers: `insertDocument(data)`, `getDocumentById(id)`, `updateDocumentStatus(id, status, chunkCount?)`, `listDocuments()`, `deleteDocument(id)` — all using Drizzle typed API

**Checkpoint**: Document records can be created, read, updated (status transitions), and deleted with cascade.

---

## Phase 5: User Story 3 — Vector Embedding Storage & Retrieval (Priority: P2)

**Goal**: Chunks can be stored with embeddings and retrieved via cosine similarity search.

**Independent Test**: Insert chunks with 1536-dim vectors; run cosine similarity query; verify results ordered by score and HNSW index is used.

### Implementation for User Story 3

- [x] T020 [US3] Create `src/db/queries/chunks.ts` with typed query helpers: `insertChunks(documentId, chunks[])` (batch insert), `getChunksByDocumentId(documentId)`, `searchSimilarChunks(queryEmbedding, limit, threshold?)` using Drizzle `sql` with `<=>` cosine distance operator, `deleteChunksByDocumentId(documentId)`

**Checkpoint**: Chunks with embeddings stored and retrievable via similarity search. Cascade delete from document works.

---

## Phase 6: User Story 4 — Conversation & Message History (Priority: P3)

**Goal**: Conversations and messages can be persisted and retrieved in chronological order with source citations.

**Independent Test**: Create conversation; add user + assistant messages with sources JSONB; query messages by conversationId; verify chronological order and source data integrity.

### Implementation for User Story 4

- [x] T021 [P] [US4] Create `src/db/queries/conversations.ts` with typed query helpers: `createConversation(title?)`, `getConversationById(id)`, `listConversations()`, `deleteConversation(id)`
- [x] T022 [P] [US4] Create `src/db/queries/messages.ts` with typed query helpers: `addMessage(conversationId, role, content, sources?)`, `getMessagesByConversationId(conversationId)` (ordered by createdAt ASC)

**Checkpoint**: Full conversation + message CRUD works. Messages returned in chronological order with optional source citations.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation

- [ ] T023 [P] Validate quickstart flow end-to-end: fresh `docker compose up -d` → `pnpm drizzle-kit migrate` → confirm schema via Drizzle Studio *(requires Docker — manual verification)*
- [x] T024 [P] Verify `.env.example` is complete with all required environment variables and placeholder values
- [ ] T025 Run `pnpm drizzle-kit migrate` twice on same database to confirm idempotency (no errors on second run) *(requires Docker — manual verification)*

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T005, T006) — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase — schema definitions
- **User Story 2 (Phase 4)**: Depends on User Story 1 (tables must exist)
- **User Story 3 (Phase 5)**: Depends on User Story 1 (tables must exist)
- **User Story 4 (Phase 6)**: Depends on User Story 1 (tables must exist)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational (Phase 2) — no other story dependencies
- **User Story 2 (P2)**: Depends on User Story 1 — needs documents table to exist
- **User Story 3 (P2)**: Depends on User Story 1 — needs chunks table to exist
- **User Story 4 (P3)**: Depends on User Story 1 — needs conversations + messages tables to exist
- **User Stories 2, 3, 4**: Can run in parallel after User Story 1 completes

### Within Each User Story

- Models/schema before query helpers
- Query helpers before integration tests
- Story complete before moving to next priority

### Parallel Opportunities

- T002, T003, T004 can run in parallel (independent files)
- T021 and T022 can run in parallel (different files, no dependencies)
- T023, T024 can run in parallel (independent validations)
- User Stories 2, 3, 4 can start in parallel after User Story 1

---

## Parallel Example: Setup Phase

```bash
# After T001 completes, launch in parallel:
Task: "T002 Create docker-compose.yml"
Task: "T003 Create .env.example"
Task: "T004 Create .gitignore entry"
```

## Parallel Example: User Story 4

```bash
# Both can start simultaneously:
Task: "T021 Create conversations query helpers"
Task: "T022 Create messages query helpers"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (DB connection + pgvector extension)
3. Complete Phase 3: User Story 1 (all 4 table schemas + migration)
4. **STOP and VALIDATE**: Run quickstart flow, verify tables and index
5. Schema is ready for other features to build on

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. User Story 1 → Schema defined and migrated (MVP!)
3. User Story 2 → Document CRUD query helpers
4. User Story 3 → Vector similarity search query helpers
5. User Story 4 → Conversation/message query helpers
6. Polish → End-to-end validation

### Parallel Team Strategy

With multiple developers after User Story 1 completes:

1. Team completes Setup + Foundational + User Story 1 together
2. Once schema is migrated:
   - Developer A: User Story 2 (document queries)
   - Developer B: User Story 3 (chunk/vector queries)
   - Developer C: User Story 4 (conversation/message queries)
3. All query helper modules are independent files

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable after US1
- Commit after each task or logical group
- Stop at any checkpoint to validate independently
- No test tasks generated — add via `/speckit.tasks` with test flag if needed later
