# Contract: Chat API

**Endpoint**: `POST /api/chat`
**Consumer**: Frontend chat UI via Vercel AI SDK `useChat` hook

## Request

### Method & Path
```
POST /api/chat
Content-Type: application/json
```

### Body

```json
{
  "messages": [
    { "role": "user", "content": "公司的年假政策是什么？" }
  ],
  "conversationId": "optional-uuid"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| messages | Array<{role: string, content: string}> | Yes | Non-empty array; must contain at least one message with role "user" |
| conversationId | string | No | UUID of existing conversation. If omitted or not found, a new conversation is created |

## Responses

### 200 OK — Streaming Response

Returns a streaming response in Vercel AI SDK data stream protocol format, compatible with `useChat` hook.

**Content-Type**: `text/plain; charset=utf-8` (AI SDK data stream format)

The stream delivers tokens incrementally. When streaming completes:
- User message persisted to messages table
- AI response persisted to messages table with `sources` field

### 400 Bad Request

```json
{
  "error": "Messages array is required and must not be empty"
}
```

Returned when:
- `messages` is missing, not an array, or empty
- No message with role "user" exists in the array

### 500 Internal Server Error

```json
{
  "error": "An error occurred while processing your request"
}
```

Returned when:
- Embedding API fails
- Chat model API fails
- Database error during persistence

## Side Effects

### On Successful Stream Completion

1. If `conversationId` not provided or not found: new conversation created with title from first ~50 chars of user message
2. User message saved: `{ role: "user", content: <latest user message>, sources: null }`
3. AI message saved: `{ role: "assistant", content: <full response text>, sources: <SourceCitation[]> }`

### Source Citation Format (in persisted message)

```json
[
  {
    "filename": "employee-handbook-2024.pdf",
    "page": 15,
    "section": "VACATION POLICY"
  },
  {
    "filename": "employee-handbook-2024.pdf",
    "page": 16,
    "section": null
  }
]
```

### On Stream Interruption

No messages persisted. No conversation created.

## System Prompt Behavior

### With Retrieved Context
The AI is instructed to:
- Answer based solely on the provided document excerpts
- Respond in Chinese
- Use Markdown formatting
- Cite source documents in its answer
- Not fabricate information beyond what the documents contain

### Without Retrieved Context (empty retrieval)
The AI is instructed to:
- Politely inform the user that no relevant information was found in the uploaded documents
- Respond in Chinese
- Not attempt to answer the question from general knowledge
