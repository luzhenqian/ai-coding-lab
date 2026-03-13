# API Contract: Conversations

## GET /api/conversations

List all conversations, ordered by most recently updated first.

### Response 200
```json
[
  {
    "id": "uuid",
    "title": "加班费怎么算？",
    "createdAt": "2026-03-12T10:00:00.000Z",
    "updatedAt": "2026-03-12T10:05:00.000Z"
  }
]
```

Returns empty array `[]` if no conversations exist.

---

## GET /api/conversations/[id]/messages

Fetch all messages for a specific conversation, ordered by creation time ascending.

### Response 200
```json
[
  {
    "id": "uuid",
    "conversationId": "uuid",
    "role": "user",
    "content": "加班费怎么算？",
    "sources": null,
    "createdAt": "2026-03-12T10:00:00.000Z"
  },
  {
    "id": "uuid",
    "conversationId": "uuid",
    "role": "assistant",
    "content": "根据《员工手册》第15页...",
    "sources": [
      {
        "filename": "员工手册2024.pdf",
        "page": 15,
        "section": "加班与调休"
      }
    ],
    "createdAt": "2026-03-12T10:00:05.000Z"
  }
]
```

### Response 404
```json
{ "error": "Conversation not found." }
```

---

## DELETE /api/conversations/[id]

Delete a conversation and all its messages (cascade).

### Response 200
```json
{
  "id": "uuid",
  "title": "加班费怎么算？",
  "createdAt": "2026-03-12T10:00:00.000Z",
  "updatedAt": "2026-03-12T10:05:00.000Z"
}
```

### Response 404
```json
{ "error": "Conversation not found." }
```
