# Data Model: PDF Storage and In-Browser Preview

## Entity Changes

### documents (MODIFY)

Add one new column to the existing `documents` table:

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| file_data | bytea | YES | null | Original PDF binary data. Null for legacy documents uploaded before this feature. |

**Validation rules**:
- `file_data` must not exceed 20 MB (enforced at API layer, not database constraint)
- `file_data` is set once during upload and never updated
- When a document is deleted, `file_data` is deleted with it (same row)

**Query considerations**:
- `listDocuments()` MUST exclude `file_data` from SELECT to avoid loading binary data into memory
- `getDocumentFileData(id)` — new query that selects ONLY `id` and `file_data` for a given document
- `hasFileData` can be derived: documents with non-null `file_data` show the preview button

### No New Tables

No new tables required. The bytea column is added directly to the existing `documents` table for simplicity and automatic cascade delete.

### No New Relations

The file data is a scalar attribute of the document entity, not a separate entity.
