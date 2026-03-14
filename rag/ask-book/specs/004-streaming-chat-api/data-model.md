# Data Model: Streaming Chat API

## Existing Entities (from feature 001, no changes)

### conversations
- `id`: UUID, primary key
- `title`: text, nullable (auto-generated from first user message)
- `createdAt`: timestamp with timezone
- `updatedAt`: timestamp with timezone

### messages
- `id`: UUID, primary key
- `conversationId`: UUID, FK → conversations.id (cascade delete)
- `role`: text ("user" | "assistant")
- `content`: text, the message content
- `sources`: JSONB, nullable — stores source citations for assistant messages
- `createdAt`: timestamp with timezone

## New Types (application-level, no schema changes)

### SourceCitation
Represents a single source reference attached to an AI response.

| Field | Type | Description |
|-------|------|-------------|
| filename | string | Source PDF document filename |
| page | number | Page number in the source document |
| section | string \| null | Section heading, or null if none detected |

### ChatRequestBody
The validated request body for POST `/api/chat`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| messages | Array<{role: string, content: string}> | Yes | Conversation message history |
| conversationId | string | No | Existing conversation ID; auto-created if omitted |

## Data Flow

1. **Request** → ChatRequestBody (validated via Zod)
2. **Retrieve** → Latest user message → `retrieveRelevantChunks` → `RetrievalResult[]`
3. **Generate** → System prompt + context + messages → `streamText` → streaming response
4. **Persist** (on stream finish):
   - User message → `addMessage(conversationId, "user", content)`
   - AI response → `addMessage(conversationId, "assistant", text, sources: SourceCitation[])`

## No Schema Changes Required

This feature uses existing `conversations` and `messages` tables. The `sources` JSONB column already supports storing structured citation data.
