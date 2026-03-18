# Contract: Document Upload API

## POST /api/documents

**Change**: Extend accepted file types from `.txt, .md` to `.txt, .md, .pdf, .doc, .docx`.

### Request

- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `file` field containing the uploaded file

### Validation (unchanged behavior, extended types)

| Check | Condition | Error (Chinese) | Status |
|-------|-----------|-----------------|--------|
| File present | `file` field exists and is a File | 请上传一个文件 | 400 |
| File size | ≤ 10MB | 文件大小不能超过 10MB | 400 |
| File type | Extension is `.txt`, `.md`, `.pdf`, `.doc`, or `.docx` | 仅支持 .txt、.md、.pdf、.doc 和 .docx 文件 | 400 |

### Response

**201 Created** (unchanged):
```json
{
  "id": "uuid",
  "filename": "report.pdf",
  "status": "processing",
  "chunkCount": 0,
  "createdAt": "2026-03-17T..."
}
```

**400 Bad Request** (unchanged structure):
```json
{ "error": "仅支持 .txt、.md、.pdf、.doc 和 .docx 文件" }
```

### Processing

Text extraction now happens inside the `after()` block:
1. For `.txt`/`.md`: `file.text()` (existing)
2. For `.pdf`/`.doc`/`.docx`: Binary extraction via dedicated libraries
3. If extraction fails → document status set to `"error"`
4. If extraction succeeds → existing chunking + embedding pipeline
