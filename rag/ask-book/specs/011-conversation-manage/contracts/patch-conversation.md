# Contract: PATCH /api/conversations/[id]

**Purpose**: Update conversation title (rename)

## Request

```
PATCH /api/conversations/{id}
Content-Type: application/json

{
  "title": "New Conversation Title"
}
```

### Parameters

| Parameter | Location | Type | Required | Constraints |
|-----------|----------|------|----------|-------------|
| id | path | UUID | yes | Must be valid conversation ID |
| title | body | string | yes | 1–100 characters, trimmed, non-empty after trim |

### Validation (Zod Schema)

```typescript
const patchSchema = z.object({
  title: z.string().trim().min(1).max(100),
});
```

## Responses

### 200 OK — Title updated successfully

```json
{
  "id": "uuid",
  "title": "New Conversation Title",
  "createdAt": "2026-03-13T00:00:00.000Z",
  "updatedAt": "2026-03-13T00:00:00.000Z"
}
```

### 400 Bad Request — Invalid input

```json
{
  "error": "Title must be between 1 and 100 characters."
}
```

### 404 Not Found — Conversation does not exist

```json
{
  "error": "Conversation not found."
}
```

## Behavior

- Trims whitespace from title before saving
- Updates `updatedAt` timestamp
- Returns the full updated conversation object
- Empty or whitespace-only titles are rejected (Zod `trim().min(1)`)
