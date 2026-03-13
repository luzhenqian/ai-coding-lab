# Implementation Plan: PDF Storage and In-Browser Preview

**Branch**: `009-pdf-storage-preview` | **Date**: 2026-03-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-pdf-storage-preview/spec.md`

## Summary

Add a nullable `file_data` bytea column to the `documents` table to store the original PDF binary on upload. Expose a new API endpoint to serve the stored binary, and add a preview button in the document list that opens an in-browser PDF viewer modal.

## Technical Context

**Language/Version**: TypeScript (strict mode) on Node.js 20+
**Primary Dependencies**: Next.js 16+ (App Router), React 19, Drizzle ORM, Tailwind CSS
**Storage**: PostgreSQL 16+ with pgvector 0.7+ (existing `documents` table — add `file_data bytea` column)
**Testing**: npm test && npm run lint
**Target Platform**: Web (desktop + mobile, 320px–1920px viewports)
**Project Type**: Web application (Next.js full-stack)
**Performance Goals**: PDF preview loads within 3 seconds for files under 10 MB
**Constraints**: Max file size 20 MB; bytea storage (no external object storage)
**Scale/Scope**: Single-user local deployment; files stored directly in PostgreSQL

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. RAG Accuracy First | PASS | No changes to retrieval/generation pipeline |
| II. Streaming UX | PASS | Preview loading indicator required; upload progress already streams |
| III. Type Safety | PASS | New column uses Drizzle typed schema; API input validated with Zod |
| IV. Simple Architecture | PASS | Single bytea column, one new API route, modal overlay — minimal abstraction |
| V. Reproducible Local Dev | PASS | Schema change via Drizzle Kit migration; no new services |

**Technology Constraints**: All technologies used are from the fixed stack (Next.js, Drizzle ORM, PostgreSQL, Tailwind CSS). No new dependencies needed — browser native PDF rendering via `<object>` or `<iframe>` tag.

## Project Structure

### Documentation (this feature)

```text
specs/009-pdf-storage-preview/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (from /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── api/
│       └── documents/
│           └── [id]/
│               ├── route.ts          # Existing — no changes needed
│               └── file/
│                   └── route.ts      # NEW — serves PDF binary (GET)
├── components/
│   ├── document-list.tsx             # MODIFY — add preview button
│   └── pdf-preview-modal.tsx         # NEW — modal with embedded PDF viewer
├── db/
│   ├── schema.ts                     # MODIFY — add file_data column
│   └── queries/
│       └── documents.ts              # MODIFY — add file storage/retrieval queries
├── lib/
│   └── process-document.ts           # No changes (buffer already available)
└── types/
    └── index.ts                      # Types auto-inferred from schema
```

**Structure Decision**: Follows existing Next.js App Router conventions. New API route nested under `documents/[id]/file` for RESTful resource access. New modal component follows established pattern (similar to knowledge-drawer overlay).

## Complexity Tracking

No constitution violations — no entries needed.
