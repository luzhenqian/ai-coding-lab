# Implementation Plan: Upload Page UI

**Branch**: `005-upload-page-ui` | **Date**: 2026-03-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-upload-page-ui/spec.md`

## Summary

Replace the basic upload page (from feature 002) with an enhanced UI at `/upload` featuring: drag-and-drop upload zone with visual feedback, detailed processing progress (上传中 → 解析中 → 向量化中 → 完成), a document list table with status badges and delete functionality, and a new DELETE `/api/documents/:id` endpoint. All components use Tailwind CSS with a clean, minimal design. Existing components (`upload-form.tsx`, `document-list.tsx`, `upload/page.tsx`) are rewritten in place.

## Technical Context

**Language/Version**: TypeScript (strict mode) on Node.js 20+
**Primary Dependencies**: Next.js App Router, React 19, Tailwind CSS
**Storage**: PostgreSQL 16+ via Drizzle ORM (existing `documents` table)
**Testing**: Manual verification
**Target Platform**: Browser (modern, desktop + mobile responsive)
**Project Type**: Web application (frontend UI + one new API route)
**Performance Goals**: Status updates within 3 seconds of backend change (2s polling)
**Constraints**: Tailwind CSS only (no CSS-in-JS per constitution), Client Components for interactivity
**Scale/Scope**: 3 components rewritten, 1 new API route, ~400 LOC

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. RAG Accuracy First | N/A | UI feature, no RAG logic |
| II. Streaming UX | PASS | Real-time progress indicators via polling; UI never blocks during processing |
| III. Type Safety | PASS | All components typed; API route validates input; shared Document type from `@/types` |
| IV. Simple Architecture | PASS | Client Components only where interactivity needed; no state management libraries; plain functions |
| V. Reproducible Local Dev | PASS | No new infrastructure; uses existing API endpoints |

**Technology Constraints Check**:
- Tailwind CSS only (no CSS-in-JS): PASS
- No state management libraries: PASS
- Client Components only for interactivity: PASS

All gates pass. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/005-upload-page-ui/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── delete-api.md
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── upload/
│   │   └── page.tsx              # Upload page (rewrite existing)
│   └── api/
│       └── documents/
│           └── [id]/
│               └── route.ts      # Add DELETE handler (extend existing GET)
├── components/
│   ├── upload-zone.tsx           # New: drag-and-drop upload zone
│   ├── upload-progress.tsx       # New: processing status display
│   └── document-list.tsx         # Rewrite existing: add delete, better formatting
└── lib/
    └── format.ts                 # New: shared formatting utilities (file size, date)
```

**Structure Decision**: Follows existing Next.js App Router convention. The existing `upload-form.tsx` is replaced by two focused components (`upload-zone.tsx` for file selection/upload, `upload-progress.tsx` for status tracking), following the "one concern per file" principle. The DELETE handler is added to the existing `documents/[id]/route.ts`.
