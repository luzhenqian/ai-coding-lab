# Implementation Plan: PDF Upload, Parsing & Vectorization

**Branch**: `002-pdf-upload-vectorize` | **Date**: 2026-03-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-pdf-upload-vectorize/spec.md`

## Summary

Build the PDF upload-to-vector pipeline for the AskBook HR RAG
Chatbot. Users upload employee handbook PDFs via a web page; the
system validates (PDF type, ≤10 MB), extracts text with pdf-parse,
splits into ~500-token chunks with ~50-token overlap at natural
paragraph/heading boundaries, generates 1536-dim embeddings via
OpenAI text-embedding-3-small, and persists document + chunks
atomically. The upload page shows real-time processing progress and
a document history list.

## Technical Context

**Language/Version**: TypeScript (strict mode) on Node.js 20+
**Primary Dependencies**: Next.js 16+ (App Router), pdf-parse, Vercel AI SDK (OpenAI provider), Drizzle ORM, Zod, Tailwind CSS
**Storage**: PostgreSQL 16+ with pgvector 0.7+ (existing schema from 001-db-schema-init)
**Testing**: Vitest (unit for chunking logic), manual E2E for upload flow
**Target Platform**: Next.js App Router (local dev via Docker Compose)
**Project Type**: Web application (Next.js full-stack)
**Performance Goals**: 5 MB PDF fully processed in < 60 seconds
**Constraints**: File size ≤ 10 MB, embedding dim = 1536, chunk target ~500 tokens with ~50 overlap
**Scale/Scope**: Single-user local dev; one file at a time

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. RAG Accuracy First | PASS | Chunks preserve semantic coherence (paragraph/heading boundaries). ~50-token overlap ensures context continuity. Metadata (page, section) enables source citation in future chat feature. |
| II. Streaming UX | PASS | Upload progress shows real-time status updates. UI is not blocked during processing. Progress indicators for extraction and embedding stages. |
| III. Type Safety | PASS | Zod validation on upload endpoint input. Drizzle typed queries for all DB operations. Shared types from `src/types/`. No `any` at boundaries. |
| IV. Simple Architecture | PASS | Plain functions for chunking/embedding logic. Next.js App Router route handler for upload API. Server Component for upload page with Client Component only for interactive upload form. One concern per file. |
| V. Reproducible Local Dev | PASS | Uses existing Docker Compose PostgreSQL + pgvector. OPENAI_API_KEY in `.env.local`. No new infra dependencies. |

**Gate result**: ALL PASS — proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/002-pdf-upload-vectorize/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── upload-api.md    # POST /api/upload contract
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── upload/
│   │   └── page.tsx           # Upload page (Server Component shell)
│   └── api/
│       ├── upload/
│       │   └── route.ts       # POST /api/upload handler
│       └── documents/
│           └── route.ts       # GET /api/documents handler
├── components/
│   ├── upload-form.tsx        # Client Component: file picker + submit
│   └── document-list.tsx      # Client Component: document history
├── lib/
│   ├── pdf-parser.ts          # pdf-parse wrapper, text extraction
│   ├── chunker.ts             # Text chunking with overlap logic
│   └── embeddings.ts          # OpenAI embedding batch generation
├── db/
│   ├── schema.ts              # (existing from 001)
│   ├── index.ts               # (existing from 001)
│   └── queries/
│       ├── documents.ts       # (existing from 001)
│       └── chunks.ts          # (existing from 001)
└── types/
    └── index.ts               # (extend with upload-specific types)
```

**Structure Decision**: Single Next.js project following App Router
conventions. New code adds route handlers, page components, and
library functions. Builds on existing `src/db/` from feature 001.

## Complexity Tracking

> No violations. All choices align with constitution principles.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none)    | —          | —                                   |
