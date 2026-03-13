# Quickstart: Upload Page UI

## Prerequisites

- PostgreSQL + pgvector running (`docker compose up -d`)
- Database migrated (feature 001)
- `OPENAI_API_KEY` and `DATABASE_URL` set in `.env.local`
- Next.js dev server running (`pnpm dev`)

## Scenario 1: Drag-and-Drop Upload

1. Navigate to `http://localhost:3000/upload`
2. Drag a PDF file (< 10 MB) onto the upload zone
3. Verify: zone highlights during drag-over, filename and size display after drop
4. Click "开始上传" button
5. Verify: status progresses through 上传中 → 处理中 → 完成
6. Verify: chunk count shown on completion, upload zone resets

## Scenario 2: Click-to-Select Upload

1. Click anywhere in the upload zone
2. Select a PDF from the file picker
3. Verify: same flow as drag-and-drop (filename/size → upload → progress → complete)

## Scenario 3: Invalid File Handling

1. Drag a `.txt` file onto the upload zone
2. Verify: error message "仅支持 PDF 文件" appears
3. Select a PDF > 10 MB
4. Verify: error message "文件大小不能超过 10 MB" appears

## Scenario 4: Processing Failure

1. Upload a corrupted PDF (or an image-only PDF)
2. Verify: status shows "处理失败" with error message and "重新上传" button
3. Click "重新上传" — verify upload zone resets to idle state

## Scenario 5: Document List and Delete

1. Upload 2 documents successfully
2. Verify: both appear in the document list with filename, chunk count, date, and green "完成" badge
3. Click the delete button on one document
4. Verify: confirmation dialog appears
5. Confirm deletion — verify document is removed from the list

## Scenario 6: Empty State

1. Delete all documents (or start fresh)
2. Verify: document list shows "暂无已上传文档"

## Scenario 7: Delete API via curl

```bash
# Delete a document by ID
curl -X DELETE http://localhost:3000/api/documents/{document-id}
```

**Expected**: 200 with deleted document JSON, or 404 if not found.

## Verification Checklist

- [ ] Drag-and-drop works with visual highlight on drag-over
- [ ] Click-to-select opens file picker filtered to PDFs
- [ ] File validation catches non-PDF and oversized files
- [ ] Filename and size display after file selection
- [ ] Upload button disabled during processing
- [ ] Processing status updates automatically (polling)
- [ ] Success state shows chunk count
- [ ] Error state shows message with retry button
- [ ] Document list shows all documents with correct data
- [ ] Document list auto-refreshes for in-progress documents
- [ ] Delete requires confirmation
- [ ] Delete removes document from list
- [ ] Empty state displayed when no documents
- [ ] Clean, minimal design with consistent Tailwind styling
