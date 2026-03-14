# Tasks: Streaming Chat API

**Input**: Design documents from `/specs/004-streaming-chat-api/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/chat-api.md, quickstart.md

**Tests**: No test tasks included — tests were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Add shared types needed across user stories

- [x] T001 Add `SourceCitation` interface to `src/types/index.ts` — fields: `filename: string`, `page: number`, `section: string | null`

**Checkpoint**: SourceCitation type available for import

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the prompt construction helper that all user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Create `src/lib/rag/prompt.ts` — export `buildSystemPrompt(chunks: RetrievalResult[]): string` that constructs the system prompt. When chunks are non-empty: instruct the AI to answer based only on provided document excerpts, respond in Chinese, use Markdown formatting, cite sources (filename, page, section), and not fabricate information. Format each chunk as a numbered excerpt with source attribution. When chunks are empty: instruct the AI to politely inform the user in Chinese that no relevant information was found in the uploaded documents and not attempt to answer from general knowledge.
- [x] T003 Export `formatChunksAsContext(chunks: RetrievalResult[]): string` from `src/lib/rag/prompt.ts` — format each chunk as `[来源: {filename}, 第{page}页, {section}]\n{content}` with numbered labels. This is called internally by `buildSystemPrompt` but exported for testability.

**Checkpoint**: Prompt builder produces correct system prompts for both with-context and no-context cases

---

## Phase 3: User Story 1 — Ask a Question and Get a Streamed Answer (Priority: P1)

**Goal**: User sends a question via POST `/api/chat`, system retrieves relevant chunks, streams a Chinese Markdown answer grounded in handbook content.

**Independent Test**: `curl -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"公司的年假政策是什么？"}]}' --no-buffer` — verify streaming response with Chinese Markdown content referencing uploaded handbook.

### Implementation for User Story 1

- [x] T004 [US1] Create `src/app/api/chat/route.ts` — POST handler that: (1) parses and validates request body with Zod schema (messages: non-empty array of `{role: string, content: string}`, conversationId: optional string), returns 400 on validation failure; (2) extracts latest user message (last message with role "user"); (3) calls `retrieveRelevantChunks(latestUserMessage)` to get relevant chunks; (4) calls `buildSystemPrompt(chunks)` to construct the system prompt; (5) calls Vercel AI SDK `streamText` with `openai("gpt-5.4")` model, the system prompt, and the messages array; (6) returns `result.toDataStreamResponse()` for useChat compatibility. Add `export const dynamic = "force-dynamic"`.
- [x] T005 [US1] Add 400 error handling to `src/app/api/chat/route.ts` — return `NextResponse.json({ error: "Messages array is required and must not be empty" }, { status: 400 })` when validation fails; return same for no user message found in array.

**Checkpoint**: Streaming chat works end-to-end: question → retrieval → grounded streaming response in Chinese Markdown

---

## Phase 4: User Story 2 — Persist Chat Messages with Source Citations (Priority: P2)

**Goal**: After streaming completes, persist user message and AI response with source citations to the database.

**Independent Test**: Send a chat message, wait for stream to complete, then check the `messages` table for both user and assistant messages with correct conversationId and sources field.

### Implementation for User Story 2

- [x] T006 [US2] Add conversation auto-creation to `src/app/api/chat/route.ts` — before streaming, check if `conversationId` is provided. If yes, verify it exists via `getConversationById`; if not found or not provided, create a new conversation via `createConversation` with title from first ~50 characters of the latest user message. Store the resolved conversationId for use in `onFinish`.
- [x] T007 [US2] Add `onFinish` callback to `streamText` call in `src/app/api/chat/route.ts` — in the callback: (1) persist the user message via `addMessage(conversationId, "user", latestUserMessage)`; (2) extract deduplicated source citations from retrieved chunks as `SourceCitation[]` (unique by filename+page+section); (3) persist the AI response via `addMessage(conversationId, "assistant", text, sources)`. Ensure this only fires on successful completion (not on disconnect/abort).

**Checkpoint**: Both messages persisted after stream completes. Sources field contains accurate citations. No persistence on interrupted streams.

---

## Phase 5: User Story 3 — Handle No-Context Gracefully (Priority: P3)

**Goal**: When retrieval returns zero chunks, the system responds with a "no relevant information" message instead of hallucinating.

**Independent Test**: Send an unrelated question (e.g., "今天天气怎么样？"). Verify the response politely states that no relevant information was found, in Chinese.

### Implementation for User Story 3

- [x] T008 [US3] Verify no-context handling in `src/app/api/chat/route.ts` — confirm that when `retrieveRelevantChunks` returns an empty array, `buildSystemPrompt([])` produces the no-context prompt variant, and the AI responds appropriately. The logic is already implemented via the prompt builder (T002) and the route handler (T004). This is a validation task — no new code expected unless the existing flow doesn't handle the empty case correctly.

**Checkpoint**: Unrelated questions get polite "no information" responses. No hallucinated answers.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation

- [x] T009 [P] Verify TypeScript compiles with zero errors via `pnpm tsc --noEmit`
- [x] T010 [P] Run ESLint and fix any warnings via `pnpm eslint src/`
- [ ] T011 Verify full chat flow end-to-end: upload a PDF, then send a chat question via curl to `/api/chat` and confirm streaming response with correct content, then verify messages persisted in database with source citations

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001 for SourceCitation type)
- **User Story 1 (Phase 3)**: Depends on Foundational (T002 for prompt builder)
- **User Story 2 (Phase 4)**: Depends on User Story 1 (adds persistence to existing route)
- **User Story 3 (Phase 5)**: Depends on User Story 1 (validates existing behavior)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational — no other story dependencies
- **User Story 2 (P2)**: Depends on User Story 1 — adds onFinish callback to existing route
- **User Story 3 (P3)**: Depends on User Story 1 — validates no-context path; can run in parallel with US2

### Within Each User Story

- Prompt builder before route handler
- Route handler before persistence logic
- Core streaming before edge case handling

### Parallel Opportunities

- T002 and T003 are in the same file, must be sequential
- T004 and T005 are in the same file, must be sequential
- T006 and T007 are in the same file, must be sequential
- T009 and T010 can run in parallel (independent checks)
- US2 and US3 can start in parallel after US1 (though US2 modifies the US1 file)

---

## Parallel Example: Polish Phase

```bash
# Both can start simultaneously:
Task: "T009 TypeScript type check"
Task: "T010 ESLint check"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (SourceCitation type)
2. Complete Phase 2: Foundational (prompt builder)
3. Complete Phase 3: User Story 1 (streaming chat route)
4. **STOP and VALIDATE**: curl the endpoint, verify streaming works
5. Core streaming RAG chat is functional

### Incremental Delivery

1. Setup + Foundational → Prompt builder ready
2. User Story 1 → Streaming RAG chat works (MVP!)
3. User Story 2 → Messages persisted with citations
4. User Story 3 → No-context edge case validated
5. Polish → Type checks, lint, E2E verification

### Sequential Strategy (Recommended)

This feature has tight coupling between tasks (all modifying the same route file):

1. Complete all phases sequentially (Setup → Foundation → US1 → US2 → US3 → Polish)
2. US2 adds onFinish callback to the route created in US1
3. US3 validates behavior already implemented in US1 + Foundation
4. Total implementation: 2 new files, 1 modified file

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- This feature builds on: feature 001 (conversations/messages tables + queries), feature 003 (retrieveRelevantChunks)
- The route file `src/app/api/chat/route.ts` is touched by US1 and US2, so they must be sequential
- Constitution mandates gpt-5.4 as the chat model (overrides user's gpt-4o-mini suggestion)
- No new dependencies needed — `ai` and `@ai-sdk/openai` already installed
- No schema changes or migrations needed
