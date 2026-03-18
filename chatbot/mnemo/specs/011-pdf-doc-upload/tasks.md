# Tasks: PDF & DOC/DOCX Upload Support

**Input**: Design documents from `/specs/011-pdf-doc-upload/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Install new dependencies required for text extraction

- [x] T001 Install extraction libraries: `pnpm add unpdf mammoth word-extractor`

---

## Phase 2: Foundational (Text Extractor Utility)

**Purpose**: Create the shared text extraction module that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Create text extractor utility with format dispatcher in `lib/utils/text-extractor.ts` — export an `extractText(file: File): Promise<string>` function that reads the file extension and delegates to the appropriate extraction method. For `.txt`/`.md`, use `file.text()`. For `.pdf`, use `unpdf`'s `extractText()` with `await file.arrayBuffer()`. For `.docx`, use `mammoth.extractRawText()` with Buffer from `file.arrayBuffer()`. For `.doc`, use `word-extractor` with Buffer from `file.arrayBuffer()`. Throw a descriptive error for unsupported extensions. Wrap each extraction in try-catch and throw user-friendly errors in Chinese (e.g., "PDF 文本提取失败").

**Checkpoint**: Text extractor utility ready — user story implementation can begin

---

## Phase 3: User Story 1 - Upload PDF (Priority: P1) 🎯 MVP

**Goal**: Users can upload PDF files and have text extracted and processed through the existing pipeline

**Independent Test**: Upload a multi-page PDF at `/documents`, verify it transitions from "处理中" to "就绪", then use it in chat

### Implementation for User Story 1

- [x] T003 [US1] Update backend validation in `app/api/documents/route.ts` — change the file extension check to accept `pdf`, `doc`, `docx` in addition to `txt` and `md`. Update the error message to "仅支持 .txt、.md、.pdf、.doc 和 .docx 文件". For binary formats (pdf/doc/docx), move text extraction into the `after()` block: pass the raw File (or its ArrayBuffer) to `extractText()` from `lib/utils/text-extractor.ts`, then pass the resulting text to `processDocument()`. For plain text formats, keep the existing `file.text()` call but also move it into `after()` for consistency. If extraction fails, catch the error and update document status to `"error"` using the existing database update function.
- [x] T004 [US1] Update frontend file input in `app/documents/page.tsx` — change the `accept` attribute from `".txt,.md"` to `".txt,.md,.pdf,.doc,.docx"`. Update the page comment to reflect the new supported formats.

**Checkpoint**: PDF upload should be fully functional and testable

---

## Phase 4: User Story 2 - Upload DOCX (Priority: P2)

**Goal**: Users can upload .docx files with text extracted preserving readable structure

**Independent Test**: Upload a .docx file with headings, lists, and tables at `/documents`, verify processing completes

*No additional tasks needed* — DOCX support is already implemented via the shared text extractor (T002) and the backend/frontend changes (T003, T004). This story is automatically satisfied.

**Checkpoint**: DOCX upload works alongside PDF

---

## Phase 5: User Story 3 - Upload legacy DOC (Priority: P3)

**Goal**: Users can upload legacy .doc format files

**Independent Test**: Upload a .doc file at `/documents`, verify processing completes

*No additional tasks needed* — DOC support is already implemented via the shared text extractor (T002) and the backend/frontend changes (T003, T004). This story is automatically satisfied.

**Checkpoint**: All three new formats (PDF, DOCX, DOC) work

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Error handling refinement and validation

- [x] T005 Verify error handling for edge cases in `app/api/documents/route.ts` — ensure password-protected PDFs, corrupted files, and image-only PDFs result in document status `"error"` with a meaningful error logged. Test that existing `.txt`/`.md` uploads still work with no regressions.
- [x] T006 Run quickstart.md validation — follow the steps in `specs/011-pdf-doc-upload/quickstart.md` to verify all formats work end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (libraries installed)
- **User Story 1 (Phase 3)**: Depends on Phase 2 (text extractor ready)
- **User Stories 2 & 3 (Phases 4-5)**: Automatically satisfied by Phases 2-3
- **Polish (Phase 6)**: Depends on Phase 3

### Within Phase 3

- T003 and T004 can run in parallel [P] (different files)

### Parallel Opportunities

```bash
# After T002, launch T003 and T004 in parallel:
Task: "Update backend validation in app/api/documents/route.ts"
Task: "Update frontend file input in app/documents/page.tsx"
```

---

## Implementation Strategy

### MVP First (PDF Only)

1. T001: Install dependencies
2. T002: Create text extractor
3. T003 + T004 (parallel): Backend + frontend changes
4. **STOP and VALIDATE**: Upload a PDF, verify it works
5. DOCX and DOC automatically work (same code path)

### Total: 6 tasks

- Phase 1 (Setup): 1 task
- Phase 2 (Foundational): 1 task
- Phase 3 (US1 - PDF): 2 tasks
- Phase 4-5 (US2/US3): 0 additional tasks (covered by shared implementation)
- Phase 6 (Polish): 2 tasks

---

## Notes

- The feature is compact because all three formats share the same extraction utility and API changes
- US2 and US3 require no separate tasks — they are satisfied by the foundational extractor + US1 backend/frontend changes
- Key risk: Turbopack compatibility with mammoth (Next.js #72863) — if issues arise, may need webpack fallback for dev
