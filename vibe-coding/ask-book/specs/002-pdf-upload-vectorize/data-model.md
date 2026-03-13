# Data Model: PDF Upload, Parsing & Vectorization

**Feature**: 002-pdf-upload-vectorize
**Date**: 2026-03-12

## Entities

This feature uses the existing entities from 001-db-schema-init. No
new tables are needed. This document describes the data flow and
validation rules specific to the upload pipeline.

### Document (existing — no schema changes)

| Field | Type | Usage in this feature |
|-------|------|----------------------|
| id | UUID | Created on upload, used to track processing |
| filename | TEXT | Original PDF filename from upload |
| fileSize | INTEGER | File size in bytes, validated ≤ 10 MB |
| status | ENUM | Transitions: pending → processing → completed/failed |
| chunkCount | INTEGER | Updated to actual count after processing |
| createdAt | TIMESTAMP | Set on upload |
| updatedAt | TIMESTAMP | Updated on each status change |

### Chunk (existing — no schema changes)

| Field | Type | Usage in this feature |
|-------|------|----------------------|
| id | UUID | Auto-generated per chunk |
| documentId | UUID | FK to parent document |
| content | TEXT | Extracted text (~500 tokens) |
| embedding | VECTOR(1536) | Generated via text-embedding-3-small |
| metadata | JSONB | `{ page: number, section: string \| null }` |
| createdAt | TIMESTAMP | Set on chunk creation |

## Data Flow

```text
PDF File (user upload)
    │
    ▼
┌─────────────────────┐
│  Validate            │  Check: PDF type, ≤ 10 MB
│  (reject if invalid) │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Create Document     │  status: "pending"
│  record in DB        │  filename, fileSize
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Update status to    │  status: "processing"
│  "processing"        │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Extract text        │  pdf-parse → pages[]
│  (per page)          │  Detect headings
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Chunk text          │  ~500 tokens per chunk
│  with overlap        │  ~50 token overlap
│                      │  Attach: { page, section }
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Generate embeddings │  Batch via OpenAI
│  (batches of ~100)   │  text-embedding-3-small
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Persist chunks      │  Transaction: insert all
│  to database         │  chunks + embeddings
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Update document     │  status: "completed"
│  status + chunkCount │  chunkCount: N
└─────────────────────┘
```

## Error Flow

```text
Any stage fails
    │
    ▼
┌─────────────────────┐
│  Update document     │  status: "failed"
│  status              │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Clean up partial    │  Delete document record
│  data                │  (cascades to chunks)
└─────────────────────┘
```

Note: On failure, the document record is kept with status "failed"
so the user can see the error. Partial chunks (if any were inserted
before failure) are cleaned up by deleting them explicitly or by
not committing the transaction.

## Validation Rules

### Upload Validation (at API boundary)

- **File type**: MIME type MUST be `application/pdf`
- **File size**: MUST be ≤ 10,485,760 bytes (10 MB)
- **File content**: MUST contain extractable text (at least 1
  non-empty page)

### Chunk Validation (internal)

- **Content**: Non-empty string
- **Token count**: Target 400–600 tokens (soft limit, best-effort)
- **Overlap**: ~50 tokens prepended from previous chunk's tail
- **Embedding**: Exactly 1536 dimensions
- **Metadata page**: Positive integer ≥ 1
- **Metadata section**: String or null

## Metadata Schema

```typescript
interface ChunkMetadata {
  page: number;           // 1-based page number
  section: string | null; // Detected section heading or null
}
```
