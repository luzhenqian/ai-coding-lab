# Data Model: Chatbot Memory System

**Feature**: 008-chatbot-memory-system
**Date**: 2026-03-15

## Entity Relationship Overview

```
User (hardcoded userId)
 ├── Conversation (1:N)
 │    ├── Message (1:N)
 │    └── Summary (1:1, latest)
 ├── Memory (1:N)
 └── Document (1:N)
      └── DocumentChunk (1:N)
```

## Entities

### Conversation

Represents a single chat session.

| Field       | Type                  | Constraints                        | Phase |
|-------------|-----------------------|------------------------------------|-------|
| id          | uuid                  | PK, auto-generated                 | 1     |
| userId      | varchar(64)           | NOT NULL, indexed                  | 1     |
| title       | varchar(200)          | nullable (set async after 1st msg) | 1     |
| isDeleted   | boolean               | NOT NULL, default false            | 1     |
| createdAt   | timestamp with tz     | NOT NULL, default now()            | 1     |
| updatedAt   | timestamp with tz     | NOT NULL, default now()            | 1     |

**Notes**:
- Soft delete via `isDeleted` flag; queries filter `isDeleted = false` by default
- `updatedAt` refreshed on each new message (for sidebar sort order)
- `title` starts as null; populated asynchronously by LLM after first exchange

### Message

A single message within a conversation.

| Field          | Type                       | Constraints                    | Phase |
|----------------|----------------------------|--------------------------------|-------|
| id             | uuid                       | PK, auto-generated            | 1     |
| conversationId | uuid                       | FK → conversations.id, indexed| 1     |
| role           | enum('user','assistant','system') | NOT NULL              | 1     |
| content        | text                       | NOT NULL                       | 1     |
| tokenCount     | integer                    | NOT NULL                       | 1     |
| createdAt      | timestamp with tz          | NOT NULL, default now()        | 1     |

**Notes**:
- `tokenCount` computed on insert using character-based estimation
- Messages ordered by `createdAt` ascending within a conversation
- No soft delete — messages persist; conversation-level soft delete hides them

### Summary

Progressive conversation summary for context compression.

| Field               | Type              | Constraints                     | Phase |
|---------------------|-------------------|---------------------------------|-------|
| id                  | uuid              | PK, auto-generated             | 2     |
| conversationId      | uuid              | FK → conversations.id, indexed | 2     |
| content             | text              | NOT NULL                        | 2     |
| coveredMessageCount | integer           | NOT NULL                        | 2     |
| tokenCount          | integer           | NOT NULL                        | 2     |
| createdAt           | timestamp with tz | NOT NULL, default now()         | 2     |

**Notes**:
- Each conversation has zero or one active summary (latest by `createdAt`)
- Old summaries are retained for audit/debugging (not deleted on update)
- `coveredMessageCount` tracks how many messages have been summarized
- New summary = LLM(old summary + uncovered messages)

### Memory

Cross-session user facts, preferences, and behavior patterns.

| Field           | Type                                 | Constraints                | Phase |
|-----------------|--------------------------------------|----------------------------|-------|
| id              | uuid                                 | PK, auto-generated        | 3     |
| userId          | varchar(64)                          | NOT NULL, indexed          | 3     |
| content         | text                                 | NOT NULL                   | 3     |
| category        | enum('preference','fact','behavior') | NOT NULL                   | 3     |
| embedding       | vector(1536)                         | NOT NULL                   | 3     |
| importanceScore | real                                 | NOT NULL, default 1.0      | 3     |
| accessCount     | integer                              | NOT NULL, default 0        | 3     |
| lastAccessedAt  | timestamp with tz                    | nullable                   | 3     |
| createdAt       | timestamp with tz                    | NOT NULL, default now()    | 3     |
| updatedAt       | timestamp with tz                    | NOT NULL, default now()    | 3     |

**Notes**:
- `embedding` column uses pgvector `vector(1536)` type (OpenAI text-embedding-3-small)
- HNSW index on `embedding` for cosine similarity: `USING hnsw (embedding vector_cosine_ops)`
- Deduplication: new memory with cosine similarity > 0.85 to existing → update existing record
- `accessCount` and `lastAccessedAt` updated on each retrieval hit
- `updatedAt` tracks when content was last modified (for dedup tracking)

### Document

Uploaded knowledge base document metadata.

| Field       | Type              | Constraints                 | Phase |
|-------------|-------------------|-----------------------------|-------|
| id          | uuid              | PK, auto-generated         | 4     |
| userId      | varchar(64)       | NOT NULL, indexed           | 4     |
| filename    | varchar(255)      | NOT NULL                    | 4     |
| totalChunks | integer           | NOT NULL                    | 4     |
| status      | enum('processing','ready','error') | NOT NULL, default 'processing' | 4 |
| createdAt   | timestamp with tz | NOT NULL, default now()     | 4     |

**Notes**:
- `status` tracks processing pipeline state (shown in frontend)
- Deleting a document cascades to all associated chunks (ON DELETE CASCADE)

### DocumentChunk

Individual text chunk from a document, with vector embedding.

| Field      | Type              | Constraints                      | Phase |
|------------|-------------------|----------------------------------|-------|
| id         | uuid              | PK, auto-generated              | 4     |
| documentId | uuid              | FK → documents.id, ON DELETE CASCADE, indexed | 4 |
| content    | text              | NOT NULL                         | 4     |
| chunkIndex | integer           | NOT NULL                         | 4     |
| embedding  | vector(1536)      | NOT NULL                         | 4     |
| tokenCount | integer           | NOT NULL                         | 4     |
| createdAt  | timestamp with tz | NOT NULL, default now()          | 4     |

**Notes**:
- HNSW index on `embedding` for cosine similarity search
- `chunkIndex` preserves original document ordering
- Chunks are 300-500 tokens with 50-token overlap between adjacent chunks

## Indexes

| Table           | Index                              | Type   | Phase |
|-----------------|------------------------------------|--------|-------|
| conversations   | (userId, isDeleted, updatedAt DESC)| btree  | 1     |
| messages        | (conversationId, createdAt ASC)    | btree  | 1     |
| summaries       | (conversationId, createdAt DESC)   | btree  | 2     |
| memories        | (userId)                           | btree  | 3     |
| memories        | (embedding)                        | hnsw   | 3     |
| document_chunks | (documentId)                       | btree  | 4     |
| document_chunks | (embedding)                        | hnsw   | 4     |

## State Transitions

### Document Processing Pipeline

```
processing → ready    (all chunks embedded successfully)
processing → error    (embedding generation or DB write failed)
```

### Conversation Lifecycle

```
active (isDeleted=false) → deleted (isDeleted=true)
```

No reverse transition; soft-deleted conversations are not restorable via UI.
