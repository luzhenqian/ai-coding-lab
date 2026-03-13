# Implementation Plan: Vector Similarity Retrieval Module

**Branch**: `003-vector-retrieval` | **Date**: 2026-03-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-vector-retrieval/spec.md`

## Summary

Implement a `retrieveRelevantChunks` function in `src/lib/rag/retriever.ts` that converts a user question into an embedding vector, performs cosine similarity search against stored chunks using pgvector, and returns ranked results with source attribution (document filename, page, section). The function leverages existing infrastructure: Vercel AI SDK `embed` for single-query embedding, the existing `chunks` table with HNSW index, and a join to the `documents` table for filenames.

## Technical Context

**Language/Version**: TypeScript (strict mode) on Node.js 20+
**Primary Dependencies**: Drizzle ORM, Vercel AI SDK (`ai` + `@ai-sdk/openai`), pgvector (drizzle-orm/pg-core vector type)
**Storage**: PostgreSQL 16+ with pgvector 0.7+ (existing `chunks` and `documents` tables)
**Testing**: Manual verification via function call (no test framework specified)
**Target Platform**: Node.js server (Next.js App Router backend)
**Project Type**: Web service (internal library module for RAG pipeline)
**Performance Goals**: < 2 seconds for retrieval with < 10,000 chunks
**Constraints**: Must use existing embedding model (text-embedding-3-small, 1536 dims), cosine similarity via pgvector `<=>` operator
**Scale/Scope**: Single retrieval function + types, ~100 LOC

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. RAG Accuracy First | PASS | Core retrieval logic with similarity threshold, explicit "no results" handling when below threshold |
| II. Streaming UX | N/A | Pure backend module, no UI component |
| III. Type Safety | PASS | All inputs/outputs typed, Drizzle typed queries, Zod-style validation for parameters |
| IV. Simple Architecture | PASS | Single function in `src/lib/rag/`, no class hierarchy, no service layer — plain function |
| V. Reproducible Local Dev | PASS | Uses existing Docker PostgreSQL + pgvector setup, no new infrastructure |

**Technology Constraints Check**:
- Uses Drizzle ORM for queries: PASS
- Uses Vercel AI SDK `embed` for query embedding: PASS
- Uses OpenAI text-embedding-3-small: PASS
- No additional ORMs or query builders: PASS

All gates pass. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/003-vector-retrieval/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── retriever-api.md
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── lib/
│   └── rag/
│       └── retriever.ts     # retrieveRelevantChunks function
├── types/
│   └── index.ts             # RetrievalResult, RetrievalOptions types (extend existing)
└── db/
    └── queries/
        └── chunks.ts        # Extend searchSimilarChunks to join documents table
```

**Structure Decision**: This feature adds a single module at `src/lib/rag/retriever.ts` following the existing `src/lib/` pattern (pdf-parser.ts, chunker.ts, embeddings.ts). The `rag/` subdirectory scopes retrieval logic for the upcoming chat feature. Existing files (`src/types/index.ts`, `src/db/queries/chunks.ts`) are extended with new types and an enhanced query.
