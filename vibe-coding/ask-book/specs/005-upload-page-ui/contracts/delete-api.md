# Contract: Delete Document API

**Endpoint**: `DELETE /api/documents/:id`
**Consumer**: Upload page document list (delete button)

## Request

### Method & Path
```
DELETE /api/documents/:id
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Document ID to delete |

## Responses

### 200 OK

```json
{
  "id": "uuid",
  "filename": "employee-handbook.pdf",
  "fileSize": 2456789,
  "status": "completed",
  "chunkCount": 42,
  "createdAt": "2026-03-12T10:30:00Z",
  "updatedAt": "2026-03-12T10:32:00Z"
}
```

Returns the deleted document record.

### 404 Not Found

```json
{
  "error": "Document not found."
}
```

Returned when the document ID does not exist.

## Side Effects

- Document record deleted from `documents` table
- All associated chunks deleted from `chunks` table (via CASCADE)
- Chunk embeddings removed (part of chunk deletion)

## Notes

- This handler is added to the existing `src/app/api/documents/[id]/route.ts` alongside the GET handler
- Uses existing `deleteDocument` query helper which returns the deleted record
- No request body needed
