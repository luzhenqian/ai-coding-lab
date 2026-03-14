# Research: Vector Similarity Retrieval Module

## R1: Single-Query Embedding with Vercel AI SDK

**Decision**: Use Vercel AI SDK `embed` (singular) instead of `embedMany` for single question embedding.

**Rationale**: The existing `generateEmbeddings` function in `src/lib/embeddings.ts` uses `embedMany` for batch processing during document ingestion. For a single user question, `embed` is the correct API — it takes a single `value` string and returns a single embedding vector. This avoids wrapping a single string in an array and unwrapping the result.

**Alternatives considered**:
- Reuse `generateEmbeddings([question])[0]`: Works but adds unnecessary array wrapping/unwrapping overhead and obscures intent.
- Direct OpenAI API call: Violates constitution (must use Vercel AI SDK).

## R2: Cosine Similarity Score Conversion

**Decision**: Use `1 - cosine_distance` to convert pgvector's `<=>` operator output to a 0-1 similarity score.

**Rationale**: pgvector's `<=>` operator returns cosine distance (0 = identical, 2 = opposite). The existing `searchSimilarChunks` in `src/db/queries/chunks.ts` already computes `1 - (embedding <=> query)` as similarity. This yields scores in the range [-1, 1] where 1 = identical. For normalized embeddings (which OpenAI text-embedding-3-small produces), scores will be in [0, 1]. The default threshold of 0.7 maps well to this scale.

**Alternatives considered**:
- Return raw distance and let caller convert: Leaks implementation detail, confusing API.
- Use inner product (`<#>`): Equivalent for normalized vectors but less intuitive naming.

## R3: Joining Chunks with Documents for Filename

**Decision**: Extend the chunk search query with a JOIN to the `documents` table to retrieve the filename in a single database round-trip.

**Rationale**: The spec requires each result to include the source document's filename. The existing `searchSimilarChunks` only returns chunk fields. A JOIN is more efficient than making a separate query per unique documentId. The existing Drizzle schema already defines the `documentsRelations` and `chunksRelations`, so we can use either a raw SQL join or Drizzle's relational query.

**Alternatives considered**:
- Separate query for document filenames: N+1 problem if results span many documents.
- Denormalize filename into chunks table: Violates normalization, adds data duplication and sync issues.

## R4: Function Location and Module Organization

**Decision**: Place the retrieval function at `src/lib/rag/retriever.ts`.

**Rationale**: The user explicitly specified `src/lib/rag/` as the module location. This creates a dedicated namespace for RAG-related logic, anticipating the upcoming chat feature that will also live under `src/lib/rag/`. Follows the existing `src/lib/` convention (pdf-parser.ts, chunker.ts, embeddings.ts).

**Alternatives considered**:
- `src/lib/retriever.ts` (flat): Works now but doesn't group related RAG functions.
- `src/services/rag.ts`: Constitution says "no service layers unless complexity demands it."

## R5: Input Validation Approach

**Decision**: Validate inputs with plain runtime checks (throw on empty question, non-positive topK) rather than Zod schemas.

**Rationale**: This is an internal library function, not an API boundary. The constitution mandates Zod at API route handlers (module boundaries), but internal functions should use simple validation to maintain simplicity (Principle IV). The calling API route will already have Zod validation.

**Alternatives considered**:
- Zod schema for RetrievalOptions: Over-engineering for an internal function with 2 optional params.
- No validation: Risks confusing errors from downstream (e.g., pgvector error on empty embedding).
