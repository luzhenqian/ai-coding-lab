# Data Model: Database Schema Design & Initialization

**Feature**: 001-db-schema-init
**Date**: 2026-03-12

## Entities

### Document

Represents an uploaded PDF file and its processing lifecycle.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, default `gen_random_uuid()` | Unique identifier |
| filename | TEXT | NOT NULL | Original PDF filename |
| fileSize | INTEGER | NOT NULL | File size in bytes |
| status | ENUM(pending, processing, completed, failed) | NOT NULL, default `pending` | Processing lifecycle state |
| chunkCount | INTEGER | NOT NULL, default `0` | Number of chunks extracted |
| createdAt | TIMESTAMP WITH TIME ZONE | NOT NULL, default `now()` | Record creation time (UTC) |
| updatedAt | TIMESTAMP WITH TIME ZONE | NOT NULL, default `now()` | Last update time (UTC) |

### Chunk

A text segment extracted from a document, paired with its vector
embedding for similarity search.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, default `gen_random_uuid()` | Unique identifier |
| documentId | UUID | FK → documents.id, ON DELETE CASCADE, NOT NULL | Parent document |
| content | TEXT | NOT NULL | Extracted text content |
| embedding | VECTOR(1536) | NOT NULL | OpenAI text-embedding-3-small vector |
| metadata | JSONB | NULLABLE | Flexible metadata: `{ page?: number, section?: string }` |
| createdAt | TIMESTAMP WITH TIME ZONE | NOT NULL, default `now()` | Record creation time (UTC) |

**Indexes**:
- HNSW index on `embedding` using `vector_cosine_ops` for approximate nearest-neighbor search

### Conversation

A chat session grouping related messages.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, default `gen_random_uuid()` | Unique identifier |
| title | TEXT | NULLABLE | Optional conversation title (auto-generated or user-set) |
| createdAt | TIMESTAMP WITH TIME ZONE | NOT NULL, default `now()` | Session start time (UTC) |
| updatedAt | TIMESTAMP WITH TIME ZONE | NOT NULL, default `now()` | Last activity time (UTC) |

### Message

A single chat message within a conversation.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, default `gen_random_uuid()` | Unique identifier |
| conversationId | UUID | FK → conversations.id, ON DELETE CASCADE, NOT NULL | Parent conversation |
| role | TEXT | NOT NULL, CHECK IN ('user', 'assistant') | Message author role |
| content | TEXT | NOT NULL | Message text content |
| sources | JSONB | NULLABLE | Cited chunks: `[{ chunkId: string, content: string, page?: number, section?: string }]` |
| createdAt | TIMESTAMP WITH TIME ZONE | NOT NULL, default `now()` | Message creation time (UTC) |

## Relationships

```text
Document 1 ──── * Chunk
  (documents.id ← chunks.documentId, CASCADE DELETE)

Conversation 1 ──── * Message
  (conversations.id ← messages.conversationId, CASCADE DELETE)
```

- Documents and Conversations are independent top-level entities
  (no foreign key between them).
- Messages reference chunks indirectly via the `sources` JSONB field
  (not a foreign key — allows flexibility for deleted chunks).

## State Transitions

### Document.status

```text
pending → processing → completed
                    ↘ failed
```

- `pending`: Initial state after upload, before processing begins
- `processing`: PDF is being parsed and chunks are being embedded
- `completed`: All chunks extracted and embedded successfully
- `failed`: Processing encountered an unrecoverable error

## Validation Rules

- `filename`: Non-empty string
- `fileSize`: Positive integer (> 0)
- `chunkCount`: Non-negative integer (≥ 0)
- `embedding`: Exactly 1536 dimensions
- `role`: Must be either `'user'` or `'assistant'`
- `content` (chunk and message): Non-empty string
- `sources` (when present): Array of objects with at minimum a
  `chunkId` string field
