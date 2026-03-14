# Tasks: CJK-Compatible Text Chunker Rewrite

**Input**: Design documents from `/specs/010-cjk-chunker-rewrite/`
**Prerequisites**: plan.md, spec.md, research.md

## Phase 1: Setup

**Purpose**: Install dependency and prepare for rewrite

- [x] T001 Install `gpt-tokenizer` package via `pnpm add gpt-tokenizer`

**Checkpoint**: Dependency installed and available for import

---

## Phase 2: User Story 1 — Accurate Chunking of Chinese Documents (Priority: P1) 🎯 MVP

**Goal**: Chinese PDF documents are split into 20+ coherent chunks instead of 3, with proper token counting and punctuation-aware splitting.

**Independent Test**: Upload a 20-page Chinese employee handbook. Verify 20+ chunks produced. Ask "加班费怎么算？" and get a correct answer.

### Implementation for User Story 1

- [x] T002 [US1] Rewrite `estimateTokens` → `countTokens` function in `src/lib/chunker.ts` using `gpt-tokenizer` `encode().length` for precise token counting
- [x] T003 [US1] Implement recursive text splitter function in `src/lib/chunker.ts` with CJK-aware separator hierarchy: `\n\n` → `\n` → `。．` → `.` → `！!` → `？?` → `；;` → `，,` → `、` → ` ` → character-level fallback. Use lookbehind to keep punctuation with preceding segment.
- [x] T004 [US1] Update `isHeading` function in `src/lib/chunker.ts` to detect Chinese heading patterns: `第X章/节/条`, `一、/二、`, `（一）/（二）`, `\d+\.\d+\s`. Add guard against lines >80 chars or table-like lines containing `|`.
- [x] T005 [US1] Rewrite `chunkText` main function in `src/lib/chunker.ts` to: (1) split pages into segments at headings, (2) recursively split oversized segments using the separator hierarchy, (3) merge undersized segments up to TARGET_TOKENS, (4) add ~20% overlap between consecutive chunks. Update constants: TARGET_TOKENS=512, MAX_TOKENS=600, OVERLAP_TOKENS=100.
- [x] T006 [US1] Rewrite `getOverlapText` function in `src/lib/chunker.ts` to use `gpt-tokenizer` for measuring overlap size instead of whitespace-based word counting.
- [x] T007 [US1] Ensure `chunkText` returns empty array (no error) when given empty pages or pages with only whitespace in `src/lib/chunker.ts`

**Checkpoint**: Upload Chinese PDF → 20+ chunks produced. Chat answers questions about all sections including overtime policy.

---

## Phase 3: User Story 2 — English and Mixed-Language Compatibility (Priority: P2)

**Goal**: English and mixed Chinese-English documents chunk correctly without regression.

**Independent Test**: Upload an English PDF. Verify chunk count is comparable to before. Upload a mixed-language document and verify both languages are retrievable.

### Implementation for User Story 2

- [x] T008 [US2] Verify existing English heading detection (`Chapter/Section/Part`, ALL CAPS, numbered sections) still works in the rewritten `isHeading` in `src/lib/chunker.ts` — adjust regex if needed
- [x] T009 [US2] Verify the recursive splitter handles English-only text (falls through CJK separators to `.`, `!`, `?`, `,`, space) correctly in `src/lib/chunker.ts`

**Checkpoint**: English PDFs produce reasonable chunks. Mixed-language content handled without corruption.

---

## Phase 4: User Story 3 — Precise Token Counting (Priority: P3)

**Goal**: All chunks respect the configured token limit when measured by the real tokenizer.

**Independent Test**: After uploading any document, verify no chunk exceeds MAX_TOKENS when measured by `gpt-tokenizer`.

### Implementation for User Story 3

- [x] T010 [US3] Add a safety check in the `chunkText` merge loop in `src/lib/chunker.ts`: if any final chunk exceeds MAX_TOKENS after merging + overlap, re-split it using the recursive splitter before emitting
- [x] T011 [US3] Verify `countTokens` is used consistently in all size comparisons throughout `src/lib/chunker.ts` — no remaining calls to the old `estimateTokens` function

**Checkpoint**: No chunk in the database exceeds 600 tokens when measured by gpt-tokenizer.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup and validation

- [x] T012 Remove the old `estimateTokens`, `splitAtSentences`, and unused helper functions from `src/lib/chunker.ts`
- [x] T013 Run `pnpm lint` and fix any issues
- [x] T014 Verify the `TextChunk` export interface and `ChunkMetadata` type remain unchanged in `src/lib/chunker.ts` (backward compatibility)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (US1)**: Depends on Phase 1 (needs gpt-tokenizer installed)
- **Phase 3 (US2)**: Depends on Phase 2 (tests against the rewritten chunker)
- **Phase 4 (US3)**: Depends on Phase 2 (validates token limits on the rewritten chunker)
- **Phase 5 (Polish)**: Depends on Phases 2–4

### Parallel Opportunities

- T008 and T009 (US2 verification) can run in parallel
- T010 and T011 (US3 safety checks) can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1: Install gpt-tokenizer
2. Complete Phase 2: Rewrite chunker with CJK support
3. **VALIDATE**: Upload Chinese handbook, verify 20+ chunks, ask "加班费怎么算？"

### Full Feature

4. Complete Phase 3: Verify English/mixed compatibility
5. Complete Phase 4: Token limit safety checks
6. Complete Phase 5: Cleanup
7. **VALIDATE**: Upload Chinese, English, and mixed docs — all chunk correctly

---

## Notes

- This is a single-file rewrite: `src/lib/chunker.ts`
- Public interface (`chunkText(pages): TextChunk[]`) does NOT change
- No database schema changes
- No API changes
- The `gpt-tokenizer` package is ~2MB, pure JS, zero native deps
- Existing chunks in the database from old chunker will NOT be re-processed automatically — user must delete and re-upload documents
