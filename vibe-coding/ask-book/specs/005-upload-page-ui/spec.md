# Feature Specification: Upload Page UI

**Feature Branch**: `005-upload-page-ui`
**Created**: 2026-03-12
**Status**: Draft
**Input**: User description: "PDF 上传页面 — /upload route with drag-and-drop, progress tracking, document list, and delete"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Upload a PDF via Drag-and-Drop or File Picker (Priority: P1)

A user navigates to the upload page and selects a PDF file by either dragging it onto the upload zone or clicking to open a file picker. After selecting the file, they see the filename and size displayed, then click an upload button to start the process. The upload zone provides clear visual feedback during drag-over.

**Why this priority**: File selection and upload initiation is the fundamental interaction — without it, no documents can be added to the system.

**Independent Test**: Navigate to `/upload`, drag a PDF onto the upload zone (or click to select). Verify the filename and file size appear. Click upload. Verify the file is sent to the server and processing begins.

**Acceptance Scenarios**:

1. **Given** the upload page is loaded, **When** a user drags a PDF file over the upload zone, **Then** the zone visually highlights to indicate it accepts the drop.
2. **Given** a PDF is dragged onto the zone, **When** the user drops the file, **Then** the filename and human-readable file size (e.g., "2.4 MB") are displayed with an upload button.
3. **Given** the upload page is loaded, **When** a user clicks the upload zone, **Then** a file picker opens filtered to PDF files only.
4. **Given** a file is selected, **When** the user clicks the upload button, **Then** the file is sent to POST `/api/upload` and the upload zone transitions to a progress state.
5. **Given** a user selects a non-PDF file or a file larger than 10 MB, **When** they attempt to upload, **Then** an inline error message appears explaining the restriction, and the file is not sent.

---

### User Story 2 - Track Upload and Processing Progress (Priority: P2)

After the user initiates an upload, the page shows real-time progress through the processing pipeline: uploading → parsing → vectorizing → completed. If processing fails, the error is displayed clearly with an option to try again.

**Why this priority**: Progress feedback is essential for user confidence during a potentially long background process. Without it, users don't know if the system is working.

**Independent Test**: Upload a valid PDF. Verify the status updates from "上传中" → "解析中" → "向量化中" → "完成" as the backend processes the document. The status should update automatically without manual refresh.

**Acceptance Scenarios**:

1. **Given** a file upload has started, **When** the file is being sent to the server, **Then** the UI shows "上传中..." with a visual indicator.
2. **Given** the file has been received by the server, **When** the document is being processed, **Then** the UI polls for status and shows the current stage: "解析中" (pending/processing) → "向量化中" (processing) → "完成" (completed).
3. **Given** the processing has completed, **When** the status reaches "completed", **Then** the UI shows a success state with the chunk count, and the upload zone resets for a new upload.
4. **Given** processing fails, **When** the document status becomes "failed", **Then** the UI shows an error message with a "重新上传" (try again) button that resets the upload zone.

---

### User Story 3 - View and Manage Uploaded Documents (Priority: P3)

Below the upload zone, a document list shows all previously uploaded documents with their filename, chunk count, upload time, and processing status. Users can delete documents they no longer need. The list updates automatically when new documents are uploaded or when processing status changes.

**Why this priority**: Document management provides ongoing utility but requires upload functionality (US1) to be meaningful. Viewing history and cleaning up old documents supports long-term use of the system.

**Independent Test**: Upload two PDFs. Verify both appear in the document list with correct filename, chunk count (after processing), upload timestamp, and status badge. Delete one document and verify it is removed from the list.

**Acceptance Scenarios**:

1. **Given** documents have been uploaded previously, **When** the user navigates to `/upload`, **Then** a list of all documents is displayed showing filename, chunk count, formatted upload date, and a status badge (colored indicator for pending/processing/completed/failed).
2. **Given** documents are currently being processed, **When** the list is displayed, **Then** it auto-refreshes every few seconds to update the status of in-progress documents.
3. **Given** a document is listed, **When** the user clicks the delete button for that document, **Then** a confirmation prompt appears. Upon confirmation, the document and all its chunks are deleted, and the document is removed from the list.
4. **Given** no documents have been uploaded, **When** the user views the document list, **Then** an empty state message is shown: "暂无已上传文档" (No uploaded documents yet).

---

### Edge Cases

- What happens when a user drops multiple files at once? Only the first PDF is accepted; others are ignored with a message.
- What happens when the user navigates away during processing? Processing continues on the server; when they return, the document list shows the current status.
- What happens when the delete API call fails? An error toast/message appears and the document remains in the list.
- What happens when two documents have the same filename? Both are displayed — each has a unique ID so there is no conflict.
- What happens on slow network connections? The upload state shows a loading indicator; the UI remains responsive.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The page MUST be accessible at the `/upload` route.
- **FR-002**: The upload zone MUST support both drag-and-drop and click-to-select file input methods.
- **FR-003**: The upload zone MUST only accept PDF files (`.pdf` extension and `application/pdf` MIME type).
- **FR-004**: The upload zone MUST reject files larger than 10 MB with a clear inline error message.
- **FR-005**: After file selection, the UI MUST display the filename and human-readable file size before upload begins.
- **FR-006**: The upload button MUST be disabled while an upload/processing is in progress.
- **FR-007**: The UI MUST show real-time processing status by polling the document status endpoint, displaying stages: uploading → parsing → vectorizing → completed/failed.
- **FR-008**: On processing completion, the UI MUST display the chunk count and reset the upload zone for a new file.
- **FR-009**: On processing failure, the UI MUST display an error message with an option to try again.
- **FR-010**: The document list MUST display all uploaded documents with: filename, chunk count, formatted upload date, and status badge.
- **FR-011**: The document list MUST auto-refresh while any document has a non-terminal status (pending or processing).
- **FR-012**: Each document in the list MUST have a delete action that requires confirmation before execution.
- **FR-013**: Deleting a document MUST remove it and all associated chunks from the database.
- **FR-014**: The page MUST use a clean, minimal design style with consistent spacing and typography.
- **FR-015**: The page MUST display an empty state when no documents exist.
- **FR-016**: Visual feedback MUST be provided during drag-over (highlighted border/background on the drop zone).

### Key Entities

- **Upload Zone State**: Represents the current state of the upload interaction — idle (ready for file selection), file-selected (showing filename/size with upload button), uploading (sending to server), processing (polling for status), completed (success), or failed (error with retry).
- **Document List Item**: A row in the document list showing a document's filename, processing status (with colored badge), chunk count, and upload timestamp, with an action to delete.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete a PDF upload (from file selection to processing complete) in a single, uninterrupted flow without needing instructions.
- **SC-002**: Processing status updates appear within 3 seconds of a backend status change (polling interval).
- **SC-003**: 100% of invalid file selections (wrong type, oversized) are caught before any server request is made.
- **SC-004**: Users can identify the status of any document at a glance via colored status badges.
- **SC-005**: Document deletion provides confirmation to prevent accidental data loss.

## Assumptions

- The upload API (`POST /api/upload`) from feature 002 is available and returns a document record with ID.
- The document status API (`GET /api/documents/:id`) from feature 002 is available for polling.
- The document list API (`GET /api/documents`) from feature 002 is available.
- A document delete API endpoint will need to be created (`DELETE /api/documents/:id`) — this is new functionality.
- The existing `deleteDocument` query helper from feature 001 handles cascade deletion of chunks.
- Tailwind CSS is already configured in the project (from Next.js setup).
- Feature 002 already created `src/components/upload-form.tsx`, `src/components/document-list.tsx`, and `src/app/upload/page.tsx` — this feature will **replace** those basic implementations with the enhanced UI described here.
