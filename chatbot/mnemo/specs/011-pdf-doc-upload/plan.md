# Implementation Plan: PDF & DOC/DOCX Upload Support

**Branch**: `011-pdf-doc-upload` | **Date**: 2026-03-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-pdf-doc-upload/spec.md`

## Summary

Extend the existing document upload system to accept PDF, DOC, and DOCX files. Add server-side text extraction using `pdf-parse` (for PDF) and `mammoth` (for DOCX/DOC), then feed extracted text into the existing chunking + embedding pipeline. No changes to the data model or processing pipeline.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 16.1.6
**Primary Dependencies**: `pdf-parse` (PDF text extraction), `mammoth` (DOCX/DOC text extraction)
**Storage**: PostgreSQL + pgvector (existing, unchanged)
**Testing**: Manual testing (existing pattern)
**Target Platform**: Vercel (Node.js serverless)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Upload-to-ready < 30s for typical documents
**Constraints**: 10MB file size limit (existing), no OCR
**Scale/Scope**: Single-user tutorial project

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Layered Memory Architecture | PASS | No changes to memory layers; only touches Semantic Memory's ingestion path |
| II. Progressive Complexity | PASS | Extends existing upload feature, no forward-looking abstractions |
| III. Teaching First | PASS | Simple extraction functions with clear comments; no clever abstractions |
| IV. Async Non-Blocking | PASS | Text extraction runs in existing `after()` background pattern |
| V. Token Budget Awareness | PASS | No changes to context injection; extracted text enters existing pipeline |

All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/011-pdf-doc-upload/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
lib/
└── utils/
    └── text-extractor.ts    # NEW: format-specific text extraction functions

app/
├── api/
│   └── documents/
│       └── route.ts         # MODIFY: accept new file types, use text extractor
└── documents/
    └── page.tsx             # MODIFY: update file input accept attribute
```

**Structure Decision**: Follows existing project layout. A single new utility file `lib/utils/text-extractor.ts` encapsulates all extraction logic, keeping the API route clean and focused.

## Complexity Tracking

No violations — table not needed.
