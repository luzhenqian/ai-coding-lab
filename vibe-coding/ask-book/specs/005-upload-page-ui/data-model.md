# Data Model: Upload Page UI

## Existing Entities (no changes)

### documents
- `id`: UUID, primary key
- `filename`: text
- `fileSize`: integer (bytes)
- `status`: enum (pending, processing, completed, failed)
- `chunkCount`: integer
- `createdAt`: timestamp with timezone
- `updatedAt`: timestamp with timezone

## UI State Models (client-side only)

### UploadZoneState
State machine for the upload zone interaction.

| State | Description | Transitions to |
|-------|-------------|----------------|
| idle | Ready for file selection (drag or click) | file-selected |
| drag-over | File is being dragged over the zone (visual highlight) | idle, file-selected |
| file-selected | File chosen, showing name/size + upload button | idle (cancel), uploading |
| uploading | File being sent to server | processing, error |
| processing | Backend processing; polling for status | completed, error |
| completed | Processing finished successfully | idle (reset for new file) |
| error | Upload or processing failed | idle (try again) |

### DocumentListItem
Display model for each row in the document table.

| Field | Type | Source | Display |
|-------|------|--------|---------|
| id | string | documents.id | Hidden (used for delete API call) |
| filename | string | documents.filename | As-is |
| status | string | documents.status | Colored badge with Chinese label |
| chunkCount | number | documents.chunkCount | Number, or "—" if not completed |
| createdAt | string | documents.createdAt | Formatted date (e.g., "2026-03-12 14:30") |

### Status Badge Mapping

| Backend Status | Chinese Label | Badge Color |
|----------------|--------------|-------------|
| pending | 等待处理 | Gray |
| processing | 处理中 | Yellow/amber |
| completed | 完成 | Green |
| failed | 处理失败 | Red |

## No Schema Changes Required

This feature is purely frontend + one new API route. No database schema changes needed.
