# Data Model: PDF & DOC/DOCX Upload Support

## Changes Required

**None.** The existing `documents` table already supports this feature without modification.

The `filename` column stores the original filename (including extension), which is sufficient to identify the file type. The `status` column already supports `"processing"` → `"ready"` | `"error"` transitions. No new columns or tables are needed.

## Existing Entity: Document

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| userId | text | Owner reference |
| filename | text | Original filename with extension (e.g., `report.pdf`) |
| status | enum | `processing` / `ready` / `error` |
| chunkCount | integer | Number of text chunks after processing |
| createdAt | timestamp | Upload time |

## New Utility: Text Extractor

A new utility module `lib/utils/text-extractor.ts` provides format-specific text extraction:

```
extractText(file: File) → Promise<string>
```

Dispatches to the appropriate extraction function based on file extension:
- `.txt`, `.md` → `file.text()` (existing behavior)
- `.pdf` → `unpdf.extractText()`
- `.docx` → `mammoth.extractRawText()`
- `.doc` → `word-extractor` extract
