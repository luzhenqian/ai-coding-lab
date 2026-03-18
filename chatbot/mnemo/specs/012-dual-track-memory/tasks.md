# Tasks: 双轨记忆提取（Dual-Track Memory Extraction）

**Input**: Design documents from `/specs/012-dual-track-memory/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add new constants and prompt template needed by both tracks

- [x] T001 [P] Add `MEMORY_WORTHINESS_PROMPT` prompt template in `lib/ai/prompts.ts` — a concise Chinese prompt asking the LLM to judge whether a single user message contains information worth remembering long-term, outputting `{ worthy: boolean, reason: string }`
- [x] T002 [P] Update constants in `lib/constants.ts` — remove `MEMORY_EXTRACTION_INTERVAL` and `MEMORY_TRIGGER_KEYWORDS`; add `IDLE_TIMEOUT_MS = 120_000` (2 minutes) and `BACKGROUND_MIN_MESSAGES = 4` (minimum messages before background extraction triggers)

**Checkpoint**: New prompt and constants ready — extraction logic can now be built

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the idle scheduler utility needed by Background track

**⚠️ CRITICAL**: User Story 2 (Background) depends on this; User Story 1 (Hot Path) does not

- [x] T003 Create idle scheduler in `lib/utils/idle-scheduler.ts` — export a `scheduleIdleExtraction(conversationId, callback)` function that maintains an in-memory `Map<string, NodeJS.Timeout>`, clears any existing timer for the conversation, and sets a new `setTimeout` with `IDLE_TIMEOUT_MS`. When the timer fires, call the callback. Also export `clearIdleTimer(conversationId)` for cleanup

**Checkpoint**: Idle scheduler ready — Background track can be wired up

---

## Phase 3: User Story 1 - 实时记忆捕获 Hot Path (Priority: P1) 🎯 MVP

**Goal**: Replace hardcoded keyword + fixed-interval trigger with LLM-based worthiness check that runs async after each user message

**Independent Test**: Send a message containing personal info but no trigger keyword (e.g., "周末我一般都在写代码"), verify memory is extracted. Send a trivial message (e.g., "今天天气真好"), verify no extraction triggered. Check server logs for `[memory-extractor] Hot path` entries.

### Implementation for User Story 1

- [x] T004 [US1] Add `shouldExtractMemory(userMessage: string)` function in `lib/ai/memory-extractor.ts` — uses `generateObject` with `chatModel` and `MEMORY_WORTHINESS_PROMPT` to return `{ worthy: boolean, reason: string }` via zod schema. Wrap in try-catch returning `{ worthy: false, reason: "error" }` on failure
- [x] T005 [US1] Remove `shouldTriggerExtraction` function from `lib/ai/memory-extractor.ts` — delete the function and its keyword/interval logic entirely
- [x] T006 [US1] Update `app/api/chat/route.ts` after() callback — replace the existing `shouldTriggerExtraction` call with: (1) call `shouldExtractMemory(userMessage.content)`, (2) if `worthy === true`, call existing `extractMemories` with the same parameters as before, (3) add `console.log("[memory-extractor] Hot path triggered:", result.reason)` or `"[memory-extractor] Hot path skipped:"` for debug logging

**Checkpoint**: Hot Path fully functional — LLM decides per-message whether to extract memories, no more hardcoded keywords

---

## Phase 4: User Story 2 - 后台批量记忆整理 Background (Priority: P2)

**Goal**: When user goes idle for 2+ minutes, asynchronously review recent conversation and batch-extract memories as a safety net for Hot Path misses

**Independent Test**: Have a conversation with 5+ messages, then wait 2 minutes without sending. Check server logs for `[memory-extractor] Background extraction triggered`. Verify new memories appear in database.

### Implementation for User Story 2

- [x] T007 [US2] Wire idle scheduler into `app/api/chat/route.ts` after() callback — after persisting messages, call `scheduleIdleExtraction(conversationId, async () => { ... })` where the callback: (1) checks message count >= `BACKGROUND_MIN_MESSAGES`, (2) fetches recent messages via `listMessagesByConversation`, (3) fetches existing memories via `listMemoriesByUser`, (4) calls `extractMemories` with last 20 messages, (5) logs `[memory-extractor] Background extraction triggered for ${conversationId}`
- [x] T008 [US2] Ensure graceful handling — if background extraction fails, log the error and do not crash. If conversation is deleted during extraction, handle missing data gracefully

**Checkpoint**: Background track functional — idle conversations trigger batch memory extraction

---

## Phase 5: User Story 3 - Debug 面板展示提取来源 (Priority: P3)

**Goal**: Show in the debug panel whether each memory was extracted via Hot Path or Background, aiding developer understanding

**Independent Test**: Trigger both Hot Path and Background extractions, then check the memories page or debug panel to see source labels.

### Implementation for User Story 3

- [x] T009 [US3] Add `source` field to memory extraction — in `lib/ai/memory-extractor.ts`, add an optional `source?: "hot-path" | "background"` parameter to `extractMemories`. Pass this through to `createMemory` calls. Update `lib/db/queries/memories.ts` `CreateMemoryData` interface to include optional `source` field. Note: since we are NOT changing the database schema, store the source by prepending a tag to the memory content (e.g., `[hot-path]`) or add it as a convention the debug panel can parse
- [x] T010 [US3] Update `app/api/chat/route.ts` — pass `"hot-path"` as source when calling extractMemories from the Hot Path block, and `"background"` when calling from the idle scheduler callback
- [x] T011 [US3] Update debug panel in `components/chat/debug-panel.tsx` — in the 检索记忆 section, if a memory's content starts with `[hot-path]` or `[background]`, display a small badge/label next to it indicating the extraction source

**Checkpoint**: Debug panel shows extraction source for each memory

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup and validation

- [x] T012 Remove unused imports — clean up any remaining references to `MEMORY_EXTRACTION_INTERVAL`, `MEMORY_TRIGGER_KEYWORDS`, and `shouldTriggerExtraction` across the codebase
- [x] T013 Run quickstart.md validation — follow the verification steps in `specs/012-dual-track-memory/quickstart.md` to confirm both tracks work end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — T001 and T002 can run in parallel immediately
- **Foundational (Phase 2)**: No strict dependency on Phase 1 (different files)
- **User Story 1 (Phase 3)**: Depends on T001 (prompt) and T002 (constants)
- **User Story 2 (Phase 4)**: Depends on T002 (constants) and T003 (idle scheduler)
- **User Story 3 (Phase 5)**: Depends on T004 (shouldExtractMemory exists) and T007 (background wired)
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent — can start after Setup
- **User Story 2 (P2)**: Independent — can start after Setup + Foundational
- **User Story 3 (P3)**: Depends on US1 and US2 being complete (needs both sources to exist)

### Parallel Opportunities

- T001 and T002 can run in parallel (different files)
- T003 can run in parallel with T001/T002 (different file)
- T004 and T005 should run sequentially (same file)
- US1 and US2 implementation can run in parallel after their prerequisites

---

## Parallel Example: Setup Phase

```bash
# Launch all setup tasks together (different files):
Task T001: "Add MEMORY_WORTHINESS_PROMPT in lib/ai/prompts.ts"
Task T002: "Update constants in lib/constants.ts"
Task T003: "Create idle scheduler in lib/utils/idle-scheduler.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001, T002)
2. Complete Phase 3: User Story 1 (T004, T005, T006)
3. **STOP and VALIDATE**: Test Hot Path independently — send messages with and without personal info
4. This alone replaces the hardcoded keyword system with intelligent LLM-based detection

### Incremental Delivery

1. Setup + US1 → LLM-based Hot Path working (MVP)
2. Add Foundational + US2 → Background batch extraction working
3. Add US3 → Debug panel shows extraction sources
4. Polish → Clean up unused code, validate end-to-end

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No database schema changes — all new structures are in-memory or convention-based
- The idle scheduler uses process-level memory; timers are lost on restart (acceptable for a teaching project)
- Commit after each task or logical group
