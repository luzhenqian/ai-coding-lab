# API Contract: Upload & Documents

**Feature**: 002-pdf-upload-vectorize
**Date**: 2026-03-12

## POST /api/upload

Upload a PDF file for processing.

### Request

- **Content-Type**: `multipart/form-data`
- **Body**:
  - `file` (required): PDF file, max 10 MB

### Responses

**201 Created** — File accepted, processing started

```json
{
  "id": "uuid",
  "filename": "employee-handbook.pdf",
  "fileSize": 2345678,
  "status": "pending",
  "chunkCount": 0,
  "createdAt": "2026-03-12T10:00:00.000Z"
}
```

**400 Bad Request** — Invalid file

```json
{
  "error": "Only PDF files are accepted."
}
```

```json
{
  "error": "File size must be under 10 MB."
}
```

**500 Internal Server Error** — Processing error

```json
{
  "error": "Failed to process PDF: <reason>"
}
```

---

## GET /api/documents

List all uploaded documents.

### Request

No parameters.

### Response

**200 OK**

```json
[
  {
    "id": "uuid",
    "filename": "employee-handbook.pdf",
    "fileSize": 2345678,
    "status": "completed",
    "chunkCount": 87,
    "createdAt": "2026-03-12T10:00:00.000Z",
    "updatedAt": "2026-03-12T10:00:45.000Z"
  }
]
```

Documents are sorted by `createdAt` descending (most recent first).

---

## GET /api/documents/[id]

Get a single document by ID (used for polling processing status).

### Request

- **Path parameter**: `id` (UUID)

### Responses

**200 OK**

```json
{
  "id": "uuid",
  "filename": "employee-handbook.pdf",
  "fileSize": 2345678,
  "status": "processing",
  "chunkCount": 0,
  "createdAt": "2026-03-12T10:00:00.000Z",
  "updatedAt": "2026-03-12T10:00:12.000Z"
}
```

**404 Not Found**

```json
{
  "error": "Document not found."
}
```
