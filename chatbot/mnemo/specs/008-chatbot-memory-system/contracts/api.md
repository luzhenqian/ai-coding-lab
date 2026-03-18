# API Contracts: Chatbot Memory System

**Feature**: 008-chatbot-memory-system
**Date**: 2026-03-15

## Phase 1: Core Chat & Conversations

### POST /api/chat

Stream a chat response for a conversation.

**Request**:
```typescript
{
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
  }>
  conversationId: string // uuid
}
```

**Response**: Vercel AI SDK data stream (`Content-Type: text/plain; charset=utf-8`)
- Stream of tokens via `streamText().toDataStreamResponse()`
- Client consumes via `useChat` hook

**Side effects** (async, non-blocking):
- Saves user message and assistant response to database
- Updates conversation `updatedAt`
- Generates conversation title (first message only)
- Phase 2+: Triggers summary generation if threshold met
- Phase 3+: Triggers memory extraction based on strategy
- Phase 4+: Performs memory + RAG retrieval before response

**Error responses**:
- `500` — LLM call failed (JSON: `{ error: string }`)

---

### GET /api/conversations

List all conversations for the current user.

**Response**:
```typescript
Array<{
  id: string
  title: string | null
  createdAt: string    // ISO 8601
  updatedAt: string    // ISO 8601
}>
```

Sorted by `updatedAt` descending. Excludes soft-deleted conversations.

---

### POST /api/conversations

Create a new conversation.

**Request**: Empty body (userId is hardcoded).

**Response**:
```typescript
{
  id: string
  title: null
  createdAt: string
  updatedAt: string
}
```

---

### DELETE /api/conversations/[id]

Soft-delete a conversation.

**Response**: `204 No Content`

---

### GET /api/conversations/[id]/messages

Load message history for a conversation.

**Response**:
```typescript
Array<{
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  tokenCount: number
  createdAt: string
}>
```

Sorted by `createdAt` ascending.

---

## Phase 2: Summary & Debug Info

### GET /api/conversations/[id]/debug

Get debug information for a conversation's context.

**Response**:
```typescript
{
  summary: {
    content: string | null
    coveredMessageCount: number
    tokenCount: number
    updatedAt: string | null
  }
  context: {
    totalTokens: number
    summaryTokens: number
    historyTokens: number
    systemPromptTokens: number
  }
}
```

---

## Phase 3: Memory Management

### GET /api/memories

List all memories for the current user.

**Response**:
```typescript
Array<{
  id: string
  content: string
  category: 'preference' | 'fact' | 'behavior'
  importanceScore: number
  accessCount: number
  lastAccessedAt: string | null
  createdAt: string
  updatedAt: string
}>
```

---

### POST /api/memories

Manually add a memory.

**Request**:
```typescript
{
  content: string
  category: 'preference' | 'fact' | 'behavior'
}
```

**Response**: Created memory object (same shape as GET item).

---

### PUT /api/memories/[id]

Update a memory's content or category.

**Request**:
```typescript
{
  content?: string
  category?: 'preference' | 'fact' | 'behavior'
}
```

**Response**: Updated memory object.

---

### DELETE /api/memories/[id]

Delete a memory.

**Response**: `204 No Content`

---

## Phase 4: Document Management

### POST /api/documents

Upload a document for RAG processing.

**Request**: `multipart/form-data` with `file` field (.txt or .md).

**Response**:
```typescript
{
  id: string
  filename: string
  status: 'processing'
  totalChunks: 0
  createdAt: string
}
```

Processing (chunking + embedding) runs asynchronously. Poll status via GET.

---

### GET /api/documents

List all documents for the current user.

**Response**:
```typescript
Array<{
  id: string
  filename: string
  status: 'processing' | 'ready' | 'error'
  totalChunks: number
  createdAt: string
}>
```

---

### DELETE /api/documents/[id]

Delete a document and all associated chunks/embeddings (cascade).

**Response**: `204 No Content`

---

### GET /api/conversations/[id]/debug (Phase 4 enhancement)

Extended debug response with memory and RAG retrieval details.

**Response** (extends Phase 2 response):
```typescript
{
  summary: { /* same as Phase 2 */ }
  context: {
    totalTokens: number
    systemPromptTokens: number
    memoryTokens: number      // NEW
    ragTokens: number         // NEW
    summaryTokens: number
    historyTokens: number
    currentMessageTokens: number  // NEW
  }
  memories: Array<{            // NEW
    id: string
    content: string
    category: string
    similarity: number
  }>
  ragChunks: Array<{           // NEW
    id: string
    content: string
    filename: string
    chunkIndex: number
    similarity: number
  }>
}
```
