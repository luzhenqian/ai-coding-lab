# Data Model: Vector Similarity Retrieval Module

## Existing Entities (from feature 001)

### chunks
- `id`: UUID, primary key
- `documentId`: UUID, FK → documents.id (cascade delete)
- `content`: text, the chunk's text content
- `embedding`: vector(1536), the embedding vector
- `metadata`: JSONB, contains `{ page: number, section: string | null }`
- `createdAt`: timestamp with timezone

### documents
- `id`: UUID, primary key
- `filename`: text, original uploaded PDF filename
- `fileSize`: integer
- `status`: enum (pending, processing, completed, failed)
- `chunkCount`: integer
- `createdAt`: timestamp with timezone
- `updatedAt`: timestamp with timezone

## New Types (application-level, no schema changes)

### RetrievalResult
Represents a single search result returned by the retrieval function.

| Field | Type | Description |
|-------|------|-------------|
| content | string | The chunk's text content |
| similarity | number | Cosine similarity score (0-1, higher = more similar) |
| documentFilename | string | Filename of the source PDF document |
| metadata | ChunkMetadata | `{ page: number, section: string \| null }` |

### RetrievalOptions
Optional configuration for a retrieval query.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| topK | number | 5 | Maximum number of results to return |
| similarityThreshold | number | 0.7 | Minimum similarity score; results below are excluded |

## Relationships Used

- `chunks.documentId` → `documents.id`: JOIN to retrieve `documents.filename` for source attribution.

## No Schema Changes Required

This feature uses existing tables and indices. No new migrations needed. The HNSW index on `chunks.embedding` (created in feature 001) supports the cosine similarity search.
