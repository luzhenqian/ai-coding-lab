# Implementation Plan: Citation Click Opens PDF Preview

**Branch**: `012-citation-pdf-preview` | **Date**: 2026-03-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-citation-pdf-preview/spec.md`

## Summary

Make citation tags in chat messages clickable links that open the referenced PDF in a new browser tab at the correct page. Requires: (1) a new API endpoint to look up document ID by filename, (2) updating the citation component to render as links with `#page=N` fragment, and (3) removing the expand/collapse panel since the click action now navigates.

## Technical Context

**Language/Version**: TypeScript (strict mode) on Node.js 20+
**Primary Dependencies**: Next.js 16+ (App Router), React 19, Tailwind CSS, Drizzle ORM
**Storage**: PostgreSQL 16+ (existing `documents` table — lookup by filename)
**Testing**: Manual testing
**Target Platform**: Web (desktop + mobile)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: PDF opens in new tab within 2 seconds
**Constraints**: Single-user system, no auth
**Scale/Scope**: 1 component change + 1 new API endpoint + 1 new DB query

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. RAG Accuracy First | PASS | Feature improves source verification — users can see original PDF at cited page |
| II. Streaming UX | N/A | No streaming involved |
| III. Type Safety | PASS | Drizzle typed query, no new types needed |
| IV. Simple Architecture | PASS | Minimal change — update existing component, add one lookup endpoint |
| V. Reproducible Local Dev | PASS | No schema changes, no new env vars |

No violations.

## Project Structure

### Documentation (this feature)

```text
specs/012-citation-pdf-preview/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (from /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── api/
│       └── documents/
│           └── by-filename/
│               └── route.ts          # NEW: GET lookup document ID by filename
├── components/
│   └── chat/
│       └── source-citations.tsx      # MODIFY: citation tags become links opening new tab
└── db/
    └── queries/
        └── documents.ts              # ADD: getDocumentByFilename() query
```

**Structure Decision**: All changes fit within existing project structure. One new API route file, two existing files modified.

## Complexity Tracking

No violations to justify.
