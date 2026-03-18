# Feature Specification: PDF & DOC/DOCX Upload Support

**Feature Branch**: `011-pdf-doc-upload`
**Created**: 2026-03-17
**Status**: Draft
**Input**: User description: "Add PDF and DOC/DOCX file format support to the existing document upload system"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Upload a PDF document (Priority: P1)

A user has a PDF file containing reference material they want the chatbot to use for context. They navigate to the document management page, select the PDF file, and upload it. The system extracts the text content from the PDF and processes it through the existing chunking and embedding pipeline. The document appears in the list with "处理中" status, then transitions to "就绪".

**Why this priority**: PDF is the most common document format users encounter. Supporting it removes the biggest gap in the current upload feature.

**Independent Test**: Upload a multi-page PDF and verify that extracted text is searchable in chat conversations.

**Acceptance Scenarios**:

1. **Given** the user is on the document management page, **When** they select and upload a `.pdf` file under 10MB, **Then** the system accepts the file, extracts text, and processes it through the existing pipeline.
2. **Given** the user uploads a PDF, **When** the PDF contains only images (scanned document with no embedded text), **Then** the system sets the document status to "error" and displays an appropriate message indicating no text could be extracted.
3. **Given** the user uploads a PDF, **When** text extraction succeeds but yields empty content, **Then** the system returns a validation error ("文件内容为空").

---

### User Story 2 - Upload a DOCX document (Priority: P2)

A user has a Word document (.docx) they want to upload. They select the file and upload it. The system extracts the text content from the DOCX file and processes it normally.

**Why this priority**: DOCX is the second most common document format. It covers the majority of remaining use cases after PDF.

**Independent Test**: Upload a .docx file with formatted text (headings, lists, tables) and verify text is extracted and searchable.

**Acceptance Scenarios**:

1. **Given** the user is on the document management page, **When** they select and upload a `.docx` file under 10MB, **Then** the system accepts the file, extracts text, and processes it.
2. **Given** the user uploads a DOCX with tables and lists, **When** extraction completes, **Then** the text content preserves readable structure (not garbled).

---

### User Story 3 - Upload a legacy DOC document (Priority: P3)

A user has an older `.doc` format file. They upload it and the system extracts text content.

**Why this priority**: Legacy .doc files are less common but still encountered. Supporting it rounds out Word format coverage.

**Independent Test**: Upload a .doc file and verify text extraction and processing completes successfully.

**Acceptance Scenarios**:

1. **Given** the user uploads a `.doc` file, **When** extraction completes, **Then** the document is processed the same as .docx files.

---

### Edge Cases

- What happens when a PDF is password-protected? → System returns an error indicating the file is protected and cannot be processed.
- What happens when a PDF contains only images with no embedded text (scanned)? → System sets status to "error" since OCR is out of scope.
- What happens when a DOCX file is corrupted or not a valid DOCX? → System returns an extraction error.
- What happens when a very large PDF (e.g., 9MB, 500 pages) is uploaded? → System processes it within the existing 10MB limit; extraction may take longer but completes asynchronously.
- What happens when the file extension is .pdf but the content is not actually a PDF? → Extraction library fails gracefully and document status is set to "error".

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept `.pdf`, `.doc`, and `.docx` files in addition to existing `.txt` and `.md` formats.
- **FR-002**: The file picker in the upload interface MUST show PDF and Word document formats as selectable options.
- **FR-003**: System MUST extract plain text content from PDF files server-side before passing to the existing processing pipeline.
- **FR-004**: System MUST extract plain text content from DOCX files server-side, preserving readable text structure.
- **FR-005**: System MUST extract plain text content from legacy DOC files server-side.
- **FR-006**: System MUST reject files that exceed the existing 10MB size limit, regardless of format.
- **FR-007**: System MUST set document status to "error" when text extraction fails (corrupted file, password-protected PDF, empty content).
- **FR-008**: System MUST display a user-friendly error message in Chinese when extraction fails.
- **FR-009**: The existing processing pipeline (chunking, embedding generation) MUST remain unchanged — only the text extraction step is new.

### Key Entities

- **Document**: Existing entity — no schema changes needed. The `filename` field already stores the original name including extension.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully upload and process PDF files, with extracted text available for chat context retrieval.
- **SC-002**: Users can successfully upload and process DOCX and DOC files, with extracted text available for chat context retrieval.
- **SC-003**: Upload-to-ready processing time for a typical 5-page PDF or 10-page DOCX remains under 30 seconds.
- **SC-004**: Extraction errors (corrupted files, password-protected PDFs) are communicated clearly to the user without crashing the application.
- **SC-005**: All previously supported formats (.txt, .md) continue to work identically with no regressions.

## Assumptions

- OCR (optical character recognition) for scanned/image-only PDFs is out of scope. Only PDFs with embedded text are supported.
- The existing 10MB file size limit is sufficient for PDF and DOC/DOCX files.
- Text extraction happens server-side only; no client-side processing is needed.
- The existing asynchronous processing pattern (`after()`) is reused for binary format extraction.
