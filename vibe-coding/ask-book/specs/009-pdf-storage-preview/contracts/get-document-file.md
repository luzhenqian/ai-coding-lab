# API Contract: Get Document File

## GET /api/documents/[id]/file

Retrieve the original PDF binary data for a specific document.

### Request

**Method**: GET
**Path**: `/api/documents/{id}/file`
**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Document ID |

**Headers**: None required

### Responses

#### 200 OK — PDF file returned

**Headers**:

| Header | Value |
|--------|-------|
| Content-Type | application/pdf |
| Content-Disposition | inline; filename="{original_filename}" |
| Content-Length | {file_size_bytes} |

**Body**: Raw PDF binary data

#### 404 Not Found — Document does not exist

```json
{
  "error": "Document not found."
}
```

#### 404 Not Found — Document exists but has no stored file

```json
{
  "error": "File data not available for this document."
}
```

### Usage Example

```text
GET /api/documents/550e8400-e29b-41d4-a716-446655440000/file

Response: 200 OK
Content-Type: application/pdf
Content-Disposition: inline; filename="handbook.pdf"
[binary PDF data]
```

### Frontend Integration

The preview modal embeds the PDF using an iframe pointing directly to this endpoint:

```html
<iframe src="/api/documents/{id}/file" type="application/pdf" />
```

This leverages the browser's built-in PDF viewer for scroll, zoom, and page navigation.
