# Tasks: Chatbot Memory System

**Input**: Design documents from `/specs/008-chatbot-memory-system/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api.md

**Tests**: No automated tests — manual validation per quickstart.md (teaching project).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. User stories map to the 4 progressive phases of the memory system.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Project initialization, dependencies, and tooling configuration

- [x] T001 Initialize Next.js 16 project with TypeScript strict mode and pnpm in `chatbot/mnemo/`
- [x] T002 Install core dependencies: `ai`, `@ai-sdk/anthropic`, `drizzle-orm`, `drizzle-kit`, `pg`, `@neondatabase/serverless` or `postgres` driver, `react-markdown`, `remark-gfm` in `chatbot/mnemo/package.json`
- [x] T003 [P] Configure Tailwind CSS and initialize shadcn/ui in `chatbot/mnemo/`
- [x] T004 [P] Create `.env.example` with documented environment variables (DATABASE_URL, ANTHROPIC_API_KEY, OPENAI_API_KEY, DEFAULT_USER_ID) in `chatbot/mnemo/.env.example`
- [x] T005 [P] Configure Drizzle with `drizzle.config.ts` pointing to `lib/db/schema.ts` in `chatbot/mnemo/drizzle.config.ts`
- [x] T006 [P] Add shadcn/ui components: Button, Input, ScrollArea, Sheet, Collapsible, Tabs via `npx shadcn-ui add` in `chatbot/mnemo/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared infrastructure that MUST be complete before ANY user story can begin

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create Drizzle client initialization with PostgreSQL connection in `chatbot/mnemo/lib/db/index.ts`
- [x] T008 [P] Define Phase 1 database schema (conversations, messages tables with enums and indexes) in `chatbot/mnemo/lib/db/schema.ts`
- [x] T009 [P] Implement token estimation utility (English chars/4, Chinese chars/1.5 with Unicode range detection) in `chatbot/mnemo/lib/utils/tokens.ts`
- [x] T010 [P] Create constants file with token budgets, sliding window size, thresholds in `chatbot/mnemo/lib/constants.ts`
- [x] T011 [P] Configure Anthropic Claude provider via Vercel AI SDK in `chatbot/mnemo/lib/ai/provider.ts`
- [x] T012 [P] Create system prompt and title generation prompt templates in `chatbot/mnemo/lib/ai/prompts.ts`
- [x] T013 Generate and run initial database migration (conversations + messages tables) via `pnpm db:generate && pnpm db:migrate`

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — 基础对话与消息持久化 (Priority: P1) 🎯 MVP

**Goal**: A working chatbot with persistent message history, multi-conversation management, streaming responses, and basic context window management.

**Independent Test**: Create a new conversation, send messages, receive streaming AI replies, refresh page and confirm messages persist, switch between conversations.

### Backend — US1

- [x] T014 [P] [US1] Implement conversation queries (create, list, softDelete, getById) in `chatbot/mnemo/lib/db/queries/conversations.ts`
- [x] T015 [P] [US1] Implement message queries (create, listByConversation, countByConversation) in `chatbot/mnemo/lib/db/queries/messages.ts`
- [x] T016 [US1] Implement basic context builder — sliding window (max 20 messages, max 8000 tokens, trim from oldest) in `chatbot/mnemo/lib/ai/context-builder.ts`
- [x] T017 [US1] Implement POST /api/chat route with streamText, onFinish message saving (ensure sequential insertion order for rapid sends), and async title generation via waitUntil in `chatbot/mnemo/app/api/chat/route.ts`
- [x] T018 [P] [US1] Implement GET/POST /api/conversations route (list and create) in `chatbot/mnemo/app/api/conversations/route.ts`
- [x] T019 [P] [US1] Implement DELETE /api/conversations/[id] route (soft delete) in `chatbot/mnemo/app/api/conversations/[id]/route.ts`
- [x] T020 [P] [US1] Implement GET /api/conversations/[id]/messages route in `chatbot/mnemo/app/api/conversations/[id]/messages/route.ts`

### Frontend — US1

- [x] T021 [P] [US1] Create ChatInput component (text input + send button, submit on Enter) in `chatbot/mnemo/components/chat/chat-input.tsx`
- [x] T022 [P] [US1] Create MessageBubble component (role-based styling, timestamp, Markdown rendering with react-markdown) in `chatbot/mnemo/components/chat/message-bubble.tsx`
- [x] T023 [US1] Create MessageList component (scrollable message list using ScrollArea, auto-scroll on new messages) in `chatbot/mnemo/components/chat/message-list.tsx`
- [x] T024 [US1] Create ChatPanel component (integrates useChat hook, MessageList, ChatInput; loads history on conversation switch) in `chatbot/mnemo/components/chat/chat-panel.tsx`
- [x] T025 [P] [US1] Create ConversationList component (fetches conversations, renders list items with title/time, new/delete actions) in `chatbot/mnemo/components/sidebar/conversation-list.tsx`
- [x] T026 [US1] Create Sidebar component (wraps ConversationList in Sheet for mobile, fixed panel for desktop) in `chatbot/mnemo/components/sidebar/sidebar.tsx`
- [x] T027 [US1] Create root layout with sidebar and main content area in `chatbot/mnemo/app/layout.tsx`
- [x] T028 [US1] Create main chat page that manages selected conversationId state and renders ChatPanel in `chatbot/mnemo/app/page.tsx`

**Checkpoint**: User Story 1 fully functional — basic chatbot with persistence and multi-conversation management

---

## Phase 4: User Story 2 — 会话摘要与上下文压缩 (Priority: P2)

**Goal**: Automatic conversation summarization when messages exceed threshold, progressive context compression, and a debug panel showing context composition.

**Independent Test**: Send 20+ messages in a conversation, confirm summary is generated asynchronously, check Debug panel shows summary content and token distribution.

### Backend — US2

- [x] T029 [US2] Add Summary table to database schema (id, conversationId, content, coveredMessageCount, tokenCount, createdAt) in `chatbot/mnemo/lib/db/schema.ts`
- [x] T030 [US2] Generate and run database migration for summaries table
- [x] T031 [P] [US2] Implement summary queries (create, getLatestByConversation) in `chatbot/mnemo/lib/db/queries/summaries.ts`
- [x] T032 [US2] Create summarizer — accepts old summary + uncovered messages, calls Claude to generate progressive summary (≤500 tokens), returns summary text in `chatbot/mnemo/lib/ai/summarizer.ts`
- [x] T033 [US2] Create summary prompt template (preserve key facts/decisions/preferences, discard small talk, ≤500 tokens output) in `chatbot/mnemo/lib/ai/prompts.ts` (extend existing file)
- [x] T034 [US2] Update context-builder to assemble: System Prompt + Summary (if exists) + recent 10 messages + current message, with token budget tracking and debug info return in `chatbot/mnemo/lib/ai/context-builder.ts`
- [x] T035 [US2] Update POST /api/chat route to trigger async summary generation via waitUntil when uncovered message count ≥ 20 in `chatbot/mnemo/app/api/chat/route.ts`
- [x] T036 [P] [US2] Update token budget constants for Phase 2: total 12000 tokens (up from 8000) to accommodate summary injection in `chatbot/mnemo/lib/constants.ts`
- [x] T037 [P] [US2] Implement GET /api/conversations/[id]/debug route returning summary content, token distribution, last update time in `chatbot/mnemo/app/api/conversations/[id]/debug/route.ts`

### Frontend — US2

- [x] T038 [US2] Create DebugPanel component (collapsible panel showing summary text, total tokens, per-section token breakdown, last summary update time) in `chatbot/mnemo/components/chat/debug-panel.tsx`
- [x] T039 [US2] Integrate DebugPanel into ChatPanel — fetch debug info after each response, show toggle button in `chatbot/mnemo/components/chat/chat-panel.tsx`

**Checkpoint**: User Story 2 functional — long conversations automatically summarized, context compressed, debug panel visible

---

## Phase 5: User Story 3 — 长期记忆系统 (Priority: P3)

**Goal**: Cross-session memory extraction, semantic retrieval via pgvector, memory management UI, and intelligent trigger strategies.

**Independent Test**: Tell AI personal info in conversation A, create conversation B and ask about it — AI should recall. Check memory management page shows extracted memories.

### Backend — US3

- [x] T040 [US3] Add Memory table to database schema (with pgvector custom type for embedding column, enums, indexes including HNSW) in `chatbot/mnemo/lib/db/schema.ts`
- [x] T041 [US3] Generate and run database migration for memories table (including pgvector extension enable and HNSW index)
- [x] T042 [P] [US3] Implement embedding generation utility using OpenAI text-embedding-3-small via @ai-sdk/openai in `chatbot/mnemo/lib/utils/embeddings.ts`
- [x] T043 [US3] Implement memory queries (create, update, delete, listByUser, searchBySimilarity with cosine distance and threshold 0.3, findDuplicates with threshold 0.85, incrementAccessCount) in `chatbot/mnemo/lib/db/queries/memories.ts`
- [x] T044 [US3] Create memory extraction prompt (input: recent messages + existing memories, output: JSON array with content/category/action/updateTargetId) in `chatbot/mnemo/lib/ai/prompts.ts` (extend)
- [x] T045 [US3] Implement memory-extractor — uses generateObject with Zod schema, handles ADD/UPDATE actions, calls embedding generation, dedup check before save in `chatbot/mnemo/lib/ai/memory-extractor.ts`
- [x] T046 [US3] Implement trigger strategy logic: check message count divisible by 5 for batch extraction, detect Chinese trigger keywords ("我是", "我喜欢", "记住", "我住在" etc.) for immediate extraction, and session-end extraction (triggered via beforeunload/visibilitychange event calling a flush endpoint) in `chatbot/mnemo/lib/ai/memory-extractor.ts` (extend)
- [x] T047 [US3] Update context-builder to retrieve Top-5 memories by similarity, inject into System Prompt under "## 关于当前用户" section, track memory tokens in debug info in `chatbot/mnemo/lib/ai/context-builder.ts`
- [x] T048 [US3] Update POST /api/chat route to: (1) retrieve memories before streaming, (2) trigger memory extraction via waitUntil based on strategy in `chatbot/mnemo/app/api/chat/route.ts`
- [x] T049 [P] [US3] Implement GET/POST /api/memories routes (list all for user, manually add with auto-embedding) in `chatbot/mnemo/app/api/memories/route.ts`
- [x] T050 [P] [US3] Implement PUT/DELETE /api/memories/[id] routes (update content/category with re-embedding, delete) in `chatbot/mnemo/app/api/memories/[id]/route.ts`

### Frontend — US3

- [x] T051 [P] [US3] Create MemoryList component (table/list of memories with content, category badge, timestamps, delete button) in `chatbot/mnemo/components/memories/memory-list.tsx`
- [x] T052 [P] [US3] Create MemoryEditor component (form for adding/editing memory with content textarea and category select) in `chatbot/mnemo/components/memories/memory-editor.tsx`
- [x] T053 [US3] Create memory management page integrating MemoryList + MemoryEditor with fetch/mutate logic in `chatbot/mnemo/app/memories/page.tsx`
- [x] T054 [US3] Update DebugPanel to show retrieved memories with similarity scores in `chatbot/mnemo/components/chat/debug-panel.tsx`
- [x] T055 [US3] Update debug API route to include retrieved memories in response in `chatbot/mnemo/app/api/conversations/[id]/debug/route.ts`

**Checkpoint**: User Story 3 functional — AI remembers user facts across sessions, memories manageable via dedicated page

---

## Phase 6: User Story 4 — RAG 知识检索 (Priority: P4)

**Goal**: Document upload with automatic chunking and embedding, semantic retrieval integrated with memory search, source-attributed AI responses, and full debug visualization.

**Independent Test**: Upload a .md document, ask about its content, AI answers with source citations. Debug panel shows retrieved chunks and full token budget breakdown.

### Backend — US4

- [x] T056 [US4] Add Document and DocumentChunk tables to database schema (with pgvector embedding, cascade delete, HNSW index) in `chatbot/mnemo/lib/db/schema.ts`
- [x] T057 [US4] Generate and run database migration for documents and document_chunks tables
- [x] T058 [US4] Implement document queries (create, listByUser, delete with cascade, updateStatus) and chunk queries (batchCreate, searchBySimilarity) in `chatbot/mnemo/lib/db/queries/documents.ts`
- [x] T059 [US4] Implement document chunking utility — paragraph-based splitting (split on \n\n, merge small paras to 300-500 tokens, split large paras at sentence boundaries, 50-token overlap) in `chatbot/mnemo/lib/utils/chunker.ts`
- [x] T060 [US4] Implement document processing pipeline — read text → chunk → batch embed → batch insert chunks → update document status in `chatbot/mnemo/lib/ai/document-processor.ts`
- [x] T061 [US4] Implement POST /api/documents route (multipart file upload, validate .txt/.md, create document record, trigger async processing via waitUntil) in `chatbot/mnemo/app/api/documents/route.ts`
- [x] T062 [P] [US4] Implement GET /api/documents route (list documents with status) in `chatbot/mnemo/app/api/documents/route.ts` (add GET handler)
- [x] T063 [P] [US4] Implement DELETE /api/documents/[id] route (cascade delete document + chunks) in `chatbot/mnemo/app/api/documents/[id]/route.ts`
- [x] T064 [US4] Update context-builder to: (1) parallel retrieve memories + document chunks via Promise.all, (2) assemble full context in order: System Prompt → memories → RAG results → summary → history → current message, (3) apply per-section token budgets from constants, (4) include source attribution hints in RAG section in `chatbot/mnemo/lib/ai/context-builder.ts`
- [x] T065 [US4] Update POST /api/chat route to pass RAG results into context builder, add source citation instruction to system prompt in `chatbot/mnemo/app/api/chat/route.ts`
- [x] T066 [US4] Update token budget constants for Phase 4: total 16000, system 1500, memory 500, RAG 2000, summary 800, history 6000, current 1000 in `chatbot/mnemo/lib/constants.ts`

### Frontend — US4

- [x] T067 [P] [US4] Create document management page with upload form (file input for .txt/.md), document list with status badges, delete button in `chatbot/mnemo/app/documents/page.tsx`
- [x] T068 [US4] Update DebugPanel to show: retrieved memories (with scores), RAG chunks (with source filename and scores), full token budget breakdown per section in `chatbot/mnemo/components/chat/debug-panel.tsx`
- [x] T069 [US4] Update debug API route to return full context info including memories, RAG chunks, and per-section token counts in `chatbot/mnemo/app/api/conversations/[id]/debug/route.ts`
- [x] T070 [US4] Add navigation links to sidebar for Memory and Document management pages in `chatbot/mnemo/components/sidebar/sidebar.tsx`

**Checkpoint**: All 4 user stories complete — full memory system with working memory, session memory, long-term memory, and semantic memory (RAG)

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T071 [P] Add error handling for LLM failures in chat route — return user-friendly error message with retry support in `chatbot/mnemo/app/api/chat/route.ts`
- [x] T072 [P] Add database connection failure graceful degradation — fall back to memoryless chat mode in `chatbot/mnemo/lib/ai/context-builder.ts`
- [x] T073 [P] Add server-side console logging for each request: total tokens, per-section tokens, retrieval hit counts, and context assembly latency (console.time) in `chatbot/mnemo/app/api/chat/route.ts`
- [x] T074 [P] Ensure DebugPanel defaults to expanded in development, hidden in production in `chatbot/mnemo/components/chat/debug-panel.tsx`
- [x] T075 Validate all edge cases: single-message conversations, rapid message sending, empty/tiny document uploads, sub-threshold similarity results in relevant files
- [x] T076 Review and add "why" comments on key logic paths per Teaching First principle across all `lib/ai/` and `lib/db/queries/` files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational phase completion
- **US2 (Phase 4)**: Depends on US1 completion (extends chat route, context builder)
- **US3 (Phase 5)**: Depends on US2 completion (extends context builder with memory layer)
- **US4 (Phase 6)**: Depends on US3 completion (extends context builder with RAG layer, uses embedding utils)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational — No dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 — extends chat route and context builder
- **User Story 3 (P3)**: Depends on US2 — extends context builder, adds memory retrieval before summary
- **User Story 4 (P4)**: Depends on US3 — extends context builder, adds RAG layer alongside memory

> **Note**: Unlike typical story-per-feature projects, Mnemo's phases are strictly sequential because each phase extends the context builder and chat route from the previous phase. This is by design (Constitution Principle II: Progressive Complexity).

### Within Each User Story

- Schema changes before queries
- Queries before API routes
- API routes before frontend components
- Backend before frontend (API must exist for frontend to consume)
- Core implementation before integration

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003-T006)
- All Foundational tasks marked [P] can run in parallel (T008-T012)
- Within US1: Backend queries (T014, T015) can run in parallel; frontend components (T021, T022, T025) can run in parallel
- Within US2: Token budget update (T036) and debug route (T037) can run in parallel
- Within US3: Embedding utility (T042), API routes (T049, T050), and frontend components (T051, T052) have parallel groups
- Within US4: Document routes (T062, T063) and frontend (T067) have parallel groups
- All Polish tasks marked [P] can run in parallel (T071-T074)

---

## Parallel Example: User Story 1

```bash
# Launch parallel backend queries:
Task: "Implement conversation queries in lib/db/queries/conversations.ts"  # T014
Task: "Implement message queries in lib/db/queries/messages.ts"            # T015

# Then sequential: context builder → chat route
Task: "Implement context builder in lib/ai/context-builder.ts"             # T016
Task: "Implement POST /api/chat route in app/api/chat/route.ts"           # T017

# Launch parallel API routes:
Task: "Implement GET/POST /api/conversations in route.ts"                  # T018
Task: "Implement DELETE /api/conversations/[id] in route.ts"               # T019
Task: "Implement GET messages in route.ts"                                 # T020

# Launch parallel frontend components:
Task: "Create ChatInput component"                                         # T021
Task: "Create MessageBubble component"                                     # T022
Task: "Create ConversationList component"                                  # T025

# Then sequential frontend assembly:
Task: "Create MessageList → ChatPanel → Sidebar → Layout → Page"          # T023-T028
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test per quickstart.md Phase 1 checklist
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Validate → Deploy (MVP — basic chatbot)
3. Add User Story 2 → Validate → Deploy (smart context management)
4. Add User Story 3 → Validate → Deploy (cross-session memory)
5. Add User Story 4 → Validate → Deploy (full memory system with RAG)
6. Each story adds a memory layer without breaking previous layers

---

## Post-Implementation Changes

### 2026-03-15: Markdown 渲染替换

- **变更**: 将 `react-markdown` + `remark-gfm` 替换为 `streamdown`（Vercel 出品）
- **原因**: Streamdown 专为 AI 流式输出设计，能优雅处理不完整的 Markdown 片段，避免流式渲染时的闪烁问题
- **影响文件**: `components/chat/message-bubble.tsx`, `package.json`
- **依赖变更**: 移除 `react-markdown`, `remark-gfm`；新增 `streamdown`

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Stories are **sequential** (not parallel) due to progressive complexity architecture
- Verify each checkpoint before moving to next story
- Commit after each task or logical group
- Manual testing per quickstart.md at each checkpoint
- Avoid: introducing Phase N+1 concepts in Phase N (Constitution Principle II)
