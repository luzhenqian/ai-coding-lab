# Research: PDF Upload, Parsing & Vectorization

**Feature**: 002-pdf-upload-vectorize
**Date**: 2026-03-12

## R1: PDF Text Extraction with pdf-parse

**Decision**: Use `pdf-parse` to extract text from uploaded PDFs,
processing page by page to preserve page boundaries.

**Rationale**: pdf-parse is the constitution-mandated library. It
returns full text plus per-page text arrays, which is essential for
attaching page number metadata to chunks. It handles standard PDF
text layers reliably.

**Alternatives considered**:
- **pdf.js (pdfjs-dist)**: More powerful but heavier; overkill for
  text extraction. pdf-parse wraps pdf.js internally.
- **LangChain PDF loader**: Adds unnecessary dependency; constitution
  prohibits unnecessary abstractions.

## R2: Chunking Strategy

**Decision**: Split text at natural boundaries (section headings,
then paragraphs, then sentences) targeting ~500 tokens per chunk
with ~50 token overlap. Use word count × 1.33 as token approximation.

**Rationale**: Constitution Principle I requires semantic coherence
at chunk boundaries. Heading-based splitting preserves topical
integrity. Paragraph splitting is the fallback. Sentence splitting
handles oversized paragraphs. The overlap ensures that context at
boundaries is not lost during retrieval.

**Implementation approach**:
1. Split extracted text by page boundaries (from pdf-parse)
2. Within each page, detect section headings (heuristic: short
   all-caps lines, lines ending with colon, numbered headings)
3. Split at heading boundaries first, then paragraph boundaries
   (double newline)
4. If any chunk exceeds ~600 tokens, split at sentence boundaries
   (period + space)
5. Add ~50 token overlap by prepending the tail of the previous
   chunk to the next chunk
6. Attach metadata: `{ page: number, section: string | null }`

**Alternatives considered**:
- **Fixed character count splitting**: Rejected — violates
  Constitution Principle I (no mid-sentence splits).
- **tiktoken for precise token counting**: Rejected as primary
  approach — adds dependency for marginal accuracy gain. Word-based
  approximation is sufficient for ~500 target (spec allows 400–600
  range). Could be added later if chunk size precision becomes an
  issue.
- **LangChain text splitters**: Rejected — adds unnecessary
  dependency for something achievable with ~100 lines of code.

## R3: Batch Embedding Generation

**Decision**: Use Vercel AI SDK's `embed` function with the OpenAI
provider for `text-embedding-3-small` (1536 dimensions). Process
chunks in batches of up to 100 to respect API rate limits.

**Rationale**: Vercel AI SDK is the constitution-mandated AI SDK.
Its `embedMany` function handles batching internally. OpenAI's
embedding API accepts up to 2048 inputs per request, but batching
at 100 provides a good balance between throughput and error recovery.

**Alternatives considered**:
- **Direct OpenAI SDK calls**: Rejected — Vercel AI SDK is mandated
  and provides a cleaner interface with provider abstraction.
- **Single embedding per chunk**: Rejected — dramatically slower
  for documents with many chunks.

## R4: File Upload Handling in Next.js App Router

**Decision**: Use Next.js App Router Route Handler (`POST /api/upload`)
with the Web `Request` API to read `FormData`. Validate with Zod
before processing.

**Rationale**: Next.js App Router route handlers natively support
`Request.formData()` for file uploads. No additional middleware
(multer, formidable) is needed. Zod validates file type and size
at the boundary (Constitution Principle III).

**Alternatives considered**:
- **Server Action with `useFormState`**: Viable but route handlers
  are more explicit for API endpoints and easier to test
  independently.
- **Third-party upload libraries (uploadthing, filepond)**: Rejected
  — YAGNI; a simple `<input type="file">` with fetch is sufficient
  for single-file upload.

## R5: Progress Reporting Mechanism

**Decision**: Use polling from the client. The upload page polls
`GET /api/documents/:id` every 2 seconds to get the current
processing status. The server updates the document record's status
as processing progresses.

**Rationale**: Polling is the simplest approach that meets the
requirement (status visible within 2 seconds). Server-Sent Events
(SSE) would be more efficient but adds complexity for a feature
that processes one file at a time in a local dev context.

**Alternatives considered**:
- **Server-Sent Events (SSE)**: More efficient but adds streaming
  endpoint complexity. Could be upgraded later if needed.
- **WebSockets**: Overkill for one-directional status updates.
- **Next.js Server Actions with revalidation**: Would work but
  polling is more transparent and debuggable.

## R6: Atomic Persistence and Error Cleanup

**Decision**: Use a database transaction to insert all chunks
atomically. If embedding generation fails partway, delete the
document record (cascade deletes chunks) and set status to "failed".

**Rationale**: FR-008 requires atomic persistence. FR-012 requires
cleanup on failure. The existing cascade delete from 001-db-schema-init
handles chunk cleanup when a document is deleted. Wrapping chunk
inserts in a transaction ensures all-or-nothing semantics.

**Alternatives considered**:
- **Soft delete / retry queue**: Rejected — YAGNI for local dev
  single-user context.
- **Insert chunks one-by-one with rollback**: Rejected — slower
  and more error-prone than a single transactional batch insert.

## R7: Section Heading Detection Heuristic

**Decision**: Best-effort heading detection using text pattern
heuristics:
1. Lines that are all uppercase and under 80 characters
2. Lines matching common heading patterns (e.g., "Chapter X",
   "Section X.Y", numbered like "1.", "1.1")
3. Short lines (< 60 chars) followed by longer paragraphs

Track the current heading as state and attach it to each chunk.
If no heading is detected, use `null`.

**Rationale**: Employee handbooks typically use consistent heading
formats. A heuristic approach covers the 80% case without requiring
a PDF structure parser. The spec explicitly states this is
"best-effort".

**Alternatives considered**:
- **PDF structure/outline parsing**: More accurate but pdf-parse
  does not expose the document outline. Would require pdfjs-dist
  directly, adding complexity.
- **LLM-based heading extraction**: Overkill and slow; adds API
  cost for a preprocessing step.
