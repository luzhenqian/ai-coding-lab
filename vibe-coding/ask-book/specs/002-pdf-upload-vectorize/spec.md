# Feature Specification: PDF Upload, Parsing & Vectorization

**Feature Branch**: `002-pdf-upload-vectorize`
**Created**: 2026-03-12
**Status**: Draft
**Input**: User description: "PDF upload, text extraction, smart chunking with overlap, batch embedding generation, and database persistence with progress tracking"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Upload and Process a PDF (Priority: P1)

An HR administrator navigates to the upload page, selects an employee
handbook PDF file from their computer, and submits it. The system
validates the file (PDF type, under 10 MB), extracts the text content,
splits it into semantically coherent chunks with overlap, generates
vector embeddings for each chunk, and stores everything in the
database. The administrator sees the processing status update in
real time on the page.

**Why this priority**: This is the core pipeline that enables the
entire RAG chatbot. Without documents uploaded and vectorized, no
questions can be answered.

**Independent Test**: Upload a sample PDF and verify that the document
record is created, chunks appear in the database with correct metadata
(page numbers, sections), embeddings are 1536-dimensional vectors,
and the document status transitions from pending → processing →
completed.

**Acceptance Scenarios**:

1. **Given** the upload page is displayed,
   **When** the user selects a valid PDF file (under 10 MB) and
   clicks upload,
   **Then** the system accepts the file, creates a document record
   with status "pending", and begins processing.
2. **Given** a PDF is being processed,
   **When** the text extraction and chunking complete,
   **Then** each chunk contains approximately 500 tokens of text with
   ~50 token overlap between adjacent chunks, and metadata includes
   page number and section title (if detectable).
3. **Given** chunking is complete,
   **When** embedding generation finishes,
   **Then** every chunk has a 1536-dimensional vector embedding stored
   alongside it, and the document status is updated to "completed"
   with the correct chunk count.
4. **Given** processing is in progress,
   **When** the user views the upload page,
   **Then** the current processing status and progress are displayed
   in real time (e.g., "Extracting text...", "Generating embeddings
   42/87...").

---

### User Story 2 - Upload Validation and Error Handling (Priority: P2)

A user attempts to upload an invalid file — either not a PDF, or
larger than 10 MB, or a corrupted/empty PDF. The system rejects
the file with a clear, user-friendly error message without crashing
or leaving orphaned database records.

**Why this priority**: Robust validation prevents data corruption and
provides a good user experience. Without it, bad files could break
the processing pipeline.

**Independent Test**: Attempt uploads with a .txt file, a 15 MB PDF,
an empty PDF, and a corrupted file. Verify each is rejected with an
appropriate error message and no database records are created.

**Acceptance Scenarios**:

1. **Given** the upload page is displayed,
   **When** the user selects a non-PDF file (e.g., .txt, .docx),
   **Then** the system rejects the upload immediately with the
   message "Only PDF files are accepted."
2. **Given** the upload page is displayed,
   **When** the user selects a PDF larger than 10 MB,
   **Then** the system rejects the upload with the message "File size
   must be under 10 MB."
3. **Given** the user uploads a valid PDF,
   **When** text extraction fails (corrupted or image-only PDF),
   **Then** the document status is set to "failed", an error message
   is shown, and no chunks are created.

---

### User Story 3 - View Upload History and Document Status (Priority: P3)

A user returns to the upload page and sees a list of previously
uploaded documents with their processing status, filename, upload
date, and chunk count. This allows them to track which handbooks
have been processed and are ready for querying.

**Why this priority**: Provides visibility into the document library
but is not required for the core upload-and-process pipeline.

**Independent Test**: Upload two documents, verify both appear in the
list with correct status, filename, and chunk count after processing
completes.

**Acceptance Scenarios**:

1. **Given** multiple documents have been uploaded,
   **When** the user visits the upload page,
   **Then** a list of all documents is displayed with filename,
   status, chunk count, and upload date, sorted by most recent first.
2. **Given** a document is currently being processed,
   **When** the user views the document list,
   **Then** the document shows its current status (e.g., "processing")
   and updates in real time when processing completes.

---

### Edge Cases

- What happens when a PDF contains only images with no extractable
  text? The system MUST mark the document as "failed" with an
  appropriate error message (e.g., "No text content found — PDF may
  be image-only").
- What happens when the embedding service is temporarily unavailable?
  The system MUST mark the document as "failed" and allow the user
  to see the error. Already-created chunks without embeddings MUST
  be cleaned up.
- What happens when a PDF has no detectable chapter/section headings?
  The system MUST still chunk by paragraph boundaries and use page
  number as the primary metadata.
- What happens when a single paragraph exceeds 500 tokens? The system
  MUST split it at sentence boundaries to stay within the target
  chunk size.
- What happens when the user uploads a duplicate filename? The system
  MUST accept it as a separate document (different upload, different
  ID).
- What happens when the browser connection drops during upload? The
  upload MUST fail gracefully; no partial document records should
  remain in a "pending" state indefinitely.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept PDF file uploads via a dedicated
  upload endpoint, rejecting non-PDF files immediately.
- **FR-002**: System MUST reject files larger than 10 MB with a clear
  error message before processing begins.
- **FR-003**: System MUST extract full text content from uploaded PDF
  files, preserving page boundaries.
- **FR-004**: System MUST split extracted text into chunks of
  approximately 500 tokens each, using natural paragraph or section
  heading boundaries as split points.
- **FR-005**: System MUST maintain approximately 50 tokens of overlap
  between adjacent chunks to preserve context continuity.
- **FR-006**: System MUST attach metadata to each chunk including the
  source page number and section title (when detectable).
- **FR-007**: System MUST generate a 1536-dimensional vector embedding
  for each chunk using a batch embedding process.
- **FR-008**: System MUST persist the document record and all chunks
  (with embeddings and metadata) to the database atomically — either
  all chunks are stored or none are.
- **FR-009**: System MUST update the document processing status
  through the lifecycle: pending → processing → completed (or failed).
- **FR-010**: System MUST update the document's chunk count upon
  successful completion.
- **FR-011**: System MUST display real-time processing progress to the
  user on the upload page (current step and, where possible, numeric
  progress).
- **FR-012**: System MUST clean up partial data (chunks without
  embeddings, orphaned records) if processing fails at any stage.
- **FR-013**: System MUST display a list of all uploaded documents
  with their status, filename, chunk count, and upload date.

### Key Entities

- **Document**: An uploaded PDF file. Tracks filename, file size,
  processing status (pending/processing/completed/failed), chunk
  count, and timestamps. One document produces many chunks.
- **Chunk**: A segment of extracted text paired with its vector
  embedding. Carries metadata (page number, section title). Belongs
  to one document.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can upload a 5 MB PDF and have it fully processed
  (text extracted, chunked, embedded, and stored) within 60 seconds.
- **SC-002**: 100% of uploaded PDFs with extractable text are
  successfully processed end-to-end without manual intervention.
- **SC-003**: Chunk sizes stay within 400–600 tokens for 90% of
  chunks, with overlap of 40–60 tokens between adjacent chunks.
- **SC-004**: The user sees processing status updates within 2 seconds
  of each stage change.
- **SC-005**: Invalid files (wrong type, too large, corrupted) are
  rejected within 1 second with a clear error message.
- **SC-006**: No orphaned or partial data remains in the database
  after a failed processing attempt.

## Assumptions

- Only single-file upload is supported per submission (no batch/multi-
  file upload in this feature).
- The upload page is accessible without authentication (single-user
  local development context, consistent with the project constitution).
- Chunk size target of ~500 tokens uses a simple whitespace/word-based
  approximation (1 token ≈ 0.75 words) rather than a precise tokenizer.
- Section title detection is best-effort based on text formatting cues
  (e.g., all-caps lines, short lines followed by longer paragraphs).
  If no headings are detected, page number alone is used as metadata.
- The embedding batch size is determined by the service's rate limits
  and is handled internally (not user-configurable).
- Progress reporting uses polling or server-sent events — the specific
  mechanism is an implementation detail.
