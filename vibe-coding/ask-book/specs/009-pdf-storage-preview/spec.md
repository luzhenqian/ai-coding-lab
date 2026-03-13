# Feature Specification: PDF Storage and In-Browser Preview

**Feature Branch**: `009-pdf-storage-preview`
**Created**: 2026-03-13
**Status**: Draft
**Input**: User description: "在documents表中增加bytea列存储PDF原始文件，上传时保存原始文件到数据库。前端文档列表中每个文档增加预览按钮，点击后通过API获取PDF二进制数据，在浏览器内嵌预览PDF。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Store Original PDF on Upload (Priority: P1)

When a user uploads a PDF document, the system stores the original file alongside the existing metadata in the database. This ensures the original document is preserved and can be retrieved later for preview or download, rather than only keeping the extracted text chunks.

**Why this priority**: Without storing the original file, preview is impossible. This is the foundational data change that all other stories depend on.

**Independent Test**: Upload a PDF document, verify the upload succeeds. Then check the database to confirm the original file binary data is stored alongside the document metadata.

**Acceptance Scenarios**:

1. **Given** the user uploads a PDF file, **When** the upload completes successfully, **Then** the original PDF binary data is stored in the database alongside the document metadata.
2. **Given** the user uploads a PDF file, **When** the upload completes, **Then** the stored binary data is identical to the original file (no corruption or truncation).
3. **Given** a previously uploaded document exists, **When** the document is deleted, **Then** the stored binary data is also deleted.

---

### User Story 2 - Preview PDF in Browser (Priority: P2)

A user sees a list of uploaded documents (either on the upload page or in the knowledge base drawer). Each document has a preview button. When the user clicks preview, the PDF opens in an in-browser viewer without downloading the file. The user can scroll through pages, zoom, and close the preview to return to the document list.

**Why this priority**: This is the primary user-facing feature — the reason for storing the original file. It enables users to verify document content without leaving the application.

**Independent Test**: Navigate to the document list, click the preview button on an uploaded document, verify the PDF renders in the browser with readable content. Close the preview and verify return to the document list.

**Acceptance Scenarios**:

1. **Given** the document list shows uploaded documents, **When** the user looks at a document entry, **Then** a preview button/icon is visible alongside the existing delete action.
2. **Given** the user clicks the preview button, **When** the PDF loads, **Then** the document is displayed in an in-browser viewer (not downloaded as a file).
3. **Given** the PDF viewer is open, **When** the user scrolls, **Then** they can navigate through all pages of the document.
4. **Given** the PDF viewer is open, **When** the user clicks close or presses Escape, **Then** the viewer closes and they return to the document list.
5. **Given** the user is on mobile, **When** they click the preview button, **Then** the PDF viewer works in a full-screen overlay.

---

### Edge Cases

- What if the PDF is very large (e.g., 10 MB)? The preview should show a loading indicator while the file is being fetched.
- What if the browser does not support in-browser PDF rendering? The system should fall back to offering a download link.
- What if the stored binary data is somehow corrupted? The preview should show an error message rather than a blank screen.
- What about documents uploaded before this feature was implemented (no stored file)? The preview button should not appear for documents that have no stored file data.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST store the original PDF file binary data in the database when a document is uploaded
- **FR-002**: The system MUST provide an endpoint to retrieve the original PDF binary data for a given document
- **FR-003**: The document list MUST display a preview button/icon for each document that has stored file data
- **FR-004**: Clicking the preview button MUST open an in-browser PDF viewer displaying the document content
- **FR-005**: The PDF viewer MUST support scrolling through pages and basic navigation
- **FR-006**: The PDF viewer MUST include a close mechanism (close button and/or Escape key)
- **FR-007**: The preview button MUST NOT appear for documents that do not have stored file data (legacy documents)
- **FR-008**: When a document is deleted, the stored file data MUST also be deleted
- **FR-009**: The system MUST support PDF files up to 20 MB in size for storage and preview

### Key Entities

- **Document**: Extended with a new attribute to store the original file binary data. This is a nullable field (null for documents uploaded before this feature).

### Assumptions

- The browser's native PDF rendering capability or an embedded viewer is sufficient for preview needs — no advanced annotation or editing is required
- The existing upload flow handles files up to 20 MB; no change to upload size limits is needed
- The preview opens in a modal/overlay rather than navigating to a new page, consistent with the drawer-based UX pattern established in feature 008
- Only PDF files need to be previewed (the system only accepts PDF uploads)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can preview any uploaded PDF document in the browser within 3 seconds of clicking the preview button (for files under 10 MB)
- **SC-002**: 100% of newly uploaded documents have their original file stored and available for preview
- **SC-003**: The preview experience works correctly on viewports from 320px to 1920px
- **SC-004**: Documents uploaded before this feature gracefully show no preview option (no errors or broken UI)
