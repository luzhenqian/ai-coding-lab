# Tasks: Code Syntax Highlighting

**Input**: Design documents from `/specs/009-code-syntax-highlighting/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: No tests requested — test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Install dependencies and configure CSS infrastructure

- [x] T001 Install `@streamdown/code` package via `pnpm add @streamdown/code`
- [x] T002 Add Streamdown CSS import (`streamdown/styles.css`) and `@source` directives for Tailwind v4 scanning in `app/globals.css`

---

## Phase 2: User Story 1 + 2 — Syntax Highlighting with Theme Support (Priority: P1) 🎯 MVP

**Goal**: Code blocks in AI responses render with language-appropriate syntax coloring and adapt to light/dark theme

**Independent Test**: Send "Write a JavaScript function to sort an array" → code block shows colored tokens. Toggle dark mode → colors update.

### Implementation

- [x] T003 [US1] [US2] Configure `<Streamdown>` component with `@streamdown/code` plugin, `shikiTheme` dual themes (`["github-light", "github-dark"]`), and `controls` prop in `components/chat/message-bubble.tsx`

**Checkpoint**: Code blocks render with syntax highlighting in both light and dark modes. Language label visible. Streaming works without flicker.

---

## Phase 3: User Story 3 — Copy Code to Clipboard (Priority: P2)

**Goal**: Users can copy code block content with a single click and receive visual feedback

**Independent Test**: Click copy button on a code block → paste in text editor → raw code appears without markup

### Implementation

- [x] T004 [US3] Verify copy button and visual feedback are enabled via Streamdown `controls` config in `components/chat/message-bubble.tsx` (copy is enabled by default with `@streamdown/code`; ensure `isAnimating` prop disables copy during streaming)

**Checkpoint**: Copy button works on all code blocks, shows checkmark feedback, disabled during streaming.

---

## Phase 4: User Story 4 — Inline Code Styling (Priority: P3)

**Goal**: Inline code (single backtick) is visually distinct with background color and monospace font in both themes

**Independent Test**: Send "What does `const x = 1` do?" → inline code has distinct background and monospace font

### Implementation

- [x] T005 [US4] Add CSS styles for inline code elements (`prose code:not(pre code)`) with theme-aware background, padding, border-radius, and monospace font in `app/globals.css`

**Checkpoint**: Inline code styled distinctly in both light and dark modes.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases and overflow handling

- [x] T006 Add CSS for horizontal scrolling on code blocks that exceed container width (`pre` overflow-x) in `app/globals.css`
- [x] T007 Run quickstart.md validation — verify all scenarios (highlighting, theme switching, copy, inline code, horizontal scroll)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **US1+US2 (Phase 2)**: Depends on Phase 1 (package installed + CSS configured)
- **US3 (Phase 3)**: Part of Phase 2 Streamdown config — verify after Phase 2
- **US4 (Phase 4)**: Independent of Phase 2/3 — only needs Phase 1 CSS setup
- **Polish (Phase 5)**: After all user stories complete

### Parallel Opportunities

- T005 (inline code CSS) can run in parallel with T003 (Streamdown config) since they modify different sections of different files
- T004 is a verification step after T003 — may be combined

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Install package + CSS setup
2. Complete Phase 2: Configure Streamdown component
3. **STOP and VALIDATE**: Test highlighting + theme switching
4. Proceed to copy verification (Phase 3) and inline code (Phase 4)

### Incremental Delivery

1. T001 + T002 → Dependencies ready
2. T003 → Syntax highlighting + themes working (MVP!)
3. T004 → Copy button verified
4. T005 → Inline code styled
5. T006 + T007 → Polish and validate

---

## Notes

- This feature is unusually compact: 2 files modified, 1 package added
- US1 and US2 are combined in Phase 2 because they're both satisfied by the same Streamdown configuration (shikiTheme handles dual themes)
- US3 (copy) is largely built-in to @streamdown/code — the task is verification + streaming state
- Commit after each phase for clean git history
