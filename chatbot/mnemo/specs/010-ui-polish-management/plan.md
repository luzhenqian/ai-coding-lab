# Implementation Plan: UI Polish for Memory & Document Management

**Branch**: `010-ui-polish-management` | **Date**: 2026-03-19 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/010-ui-polish-management/spec.md`

## Summary

Add four UI improvements to the memory and document management pages: (1) replace native `<select>` with a styled segmented category selector, (2) replace native file input with a drag-and-drop upload zone, (3) add AlertDialog confirmation before deleting memories or documents, (4) show chunk count with auto-refresh polling for processing documents.

## Technical Context

**Language/Version**: TypeScript 5 / React 19 / Next.js 16.1.6
**Primary Dependencies**: @base-ui/react v1.3.0 (AlertDialog), Lucide React v0.577.0, Tailwind CSS v4
**Storage**: N/A (no schema changes; existing APIs unchanged)
**Testing**: Manual testing (existing pattern; no test framework configured for UI)
**Target Platform**: Web (desktop + mobile browsers)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: N/A (UI-only changes, no performance-critical paths)
**Constraints**: Must use existing component library (@base-ui/react, shadcn/ui patterns)
**Scale/Scope**: 4 files modified, 0-1 new component files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Layered Memory Architecture | PASS | No changes to memory layers; UI-only |
| II. Progressive Complexity | PASS | Enhances existing pages; no new abstractions |
| III. Teaching First | PASS | Straightforward UI components; inline, not abstracted |
| IV. Async Non-Blocking | PASS | Polling for chunk count uses non-blocking interval |
| V. Token Budget Awareness | N/A | No LLM prompt changes |

**Exclusion note**: Constitution says "Production-grade UI" is out of scope, but user explicitly requested these UI improvements. User intent overrides the default exclusion.

## Project Structure

### Documentation (this feature)

```text
specs/010-ui-polish-management/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── spec.md              # Feature specification
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (files to modify)

```text
components/
├── memories/
│   ├── memory-editor.tsx    # Replace <select> with segmented selector
│   └── memory-list.tsx      # Add AlertDialog for delete confirmation
└── ui/
    └── (existing alert-dialog.tsx used as-is)

app/
└── documents/
    └── page.tsx             # Drag-drop upload + delete confirmation + chunk count polling
```

**Structure Decision**: All changes modify existing files. No new directories needed. The segmented selector and drop zone are inline in their respective components (Teaching First principle - avoid premature abstraction for single-use components).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| UI polish beyond "functional" | User explicitly requested these improvements | N/A - direct user request |
