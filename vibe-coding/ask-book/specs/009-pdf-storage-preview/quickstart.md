# Quickstart: PDF Storage and In-Browser Preview

## Prerequisites

- PostgreSQL 16+ running with pgvector extension
- Existing `documents` table from previous features
- Node.js 20+ with pnpm

## Setup

1. **Apply schema changes** (adds `file_data` bytea column):
   ```bash
   pnpm drizzle-kit push
   ```

2. **Start dev server**:
   ```bash
   pnpm dev
   ```

## Test Scenarios

### Scenario 1: Upload stores PDF binary

1. Open the knowledge drawer (click 知识库管理 in sidebar)
2. Upload a PDF file (under 20 MB)
3. Wait for upload to complete
4. Verify in database: `SELECT id, filename, octet_length(file_data) FROM documents WHERE file_data IS NOT NULL;`
5. Expected: The uploaded document has `file_data` with size matching the original file

### Scenario 2: Preview button appears for new documents

1. Upload a new PDF document
2. In the document list, observe the preview button (eye icon) next to the document
3. Expected: Preview button visible for the newly uploaded document

### Scenario 3: Preview button hidden for legacy documents

1. If any documents were uploaded before this feature (no `file_data`), check the document list
2. Expected: No preview button appears for those documents

### Scenario 4: In-browser PDF preview

1. Click the preview button on an uploaded document
2. Expected: A full-screen modal overlay opens showing the PDF content
3. Scroll through the PDF pages
4. Press Escape or click the close button
5. Expected: Modal closes, return to document list

### Scenario 5: File retrieval API

1. Get a document ID from the database
2. `curl http://localhost:3002/api/documents/{id}/file -o test.pdf`
3. Expected: Downloaded file is identical to the original uploaded PDF
