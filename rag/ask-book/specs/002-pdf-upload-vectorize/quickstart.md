# Quickstart: PDF Upload, Parsing & Vectorization

**Feature**: 002-pdf-upload-vectorize
**Date**: 2026-03-12

## Prerequisites

- Feature 001 (db-schema-init) completed and migrated
- Docker running with PostgreSQL + pgvector
- `OPENAI_API_KEY` set in `.env.local`
- `pnpm install` completed (includes pdf-parse)

## Steps

### 1. Ensure Database is Running

```bash
docker compose up -d
```

### 2. Set Environment Variables

Ensure `.env.local` contains:

```env
DATABASE_URL=postgresql://askbook:askbook@localhost:5432/askbook
OPENAI_API_KEY=sk-your-actual-key-here
```

### 3. Start Development Server

```bash
pnpm dev
```

### 4. Upload a PDF

1. Navigate to `http://localhost:3000/upload`
2. Click "Choose File" and select a PDF (≤ 10 MB)
3. Click "Upload"
4. Watch the processing status update in real time
5. When status shows "completed", the document is ready for querying

### 5. Verify Processing

Check the document list on the upload page:
- Filename matches the uploaded file
- Status shows "completed"
- Chunk count is > 0

### 6. Verify in Database (optional)

```bash
docker compose exec db psql -U askbook -d askbook \
  -c "SELECT id, filename, status, chunk_count FROM documents;"

docker compose exec db psql -U askbook -d askbook \
  -c "SELECT id, document_id, length(content), metadata FROM chunks LIMIT 5;"
```

## Testing Validation

### Invalid File Type

Upload a `.txt` or `.docx` file. Expected: immediate rejection with
"Only PDF files are accepted."

### Oversized File

Upload a PDF > 10 MB. Expected: immediate rejection with "File size
must be under 10 MB."

### Image-Only PDF

Upload a scanned PDF with no text layer. Expected: document status
set to "failed" with error message.

## Common Issues

- **"OPENAI_API_KEY not set"**: Ensure `.env.local` has a valid
  OpenAI API key.
- **Upload hangs**: Check that the database is running and accessible.
- **"No text content found"**: The PDF is likely image-only. Use a
  PDF with a text layer.
- **Slow processing**: Embedding generation depends on OpenAI API
  latency. A 5 MB PDF should complete within 60 seconds.
