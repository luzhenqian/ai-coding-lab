# Feature Specification: Citation Click Opens PDF Preview

**Feature Branch**: `012-citation-pdf-preview`
**Created**: 2026-03-13
**Status**: Draft
**Input**: User description: "点击聊天消息底部的引用标签时，在新浏览器标签页中打开该PDF文件的预览，并自动定位到对应的页面位置。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Click Citation to Preview PDF at Page (Priority: P1)

A user is reading the AI's response about corporate culture and sees citation tags at the bottom (e.g., "Noah员工手册_V2.0.pdf 第4页"). They click a citation tag, and a new browser tab opens showing the PDF file, automatically scrolled to page 4 so they can verify the source content directly.

**Why this priority**: This is the core feature. Clicking a citation to see the original source at the exact page is the primary user need for verifying AI answers and building trust.

**Independent Test**: Chat with the AI to get a response with citations. Click a citation tag. Verify a new tab opens with the PDF displayed at the correct page.

**Acceptance Scenarios**:

1. **Given** a chat response with citation tags, **When** the user clicks a citation tag, **Then** a new browser tab opens showing the referenced PDF file at the specified page.
2. **Given** a citation referencing page 4, **When** the new tab opens, **Then** the PDF viewer is scrolled to page 4 (not page 1).
3. **Given** a citation referencing page 1, **When** the user clicks the citation, **Then** the PDF opens at the beginning.
4. **Given** multiple citations on the same message, **When** the user clicks different citation tags, **Then** each opens in a new tab at its respective page.

---

### Edge Cases

- What if the referenced document has been deleted from the knowledge base? The new tab should show the document-not-found error from the existing file API.
- What if the PDF file data was not stored (older documents uploaded before file storage was added)? The existing file API already returns a "file not available" error.
- What if the page number in the citation exceeds the actual PDF page count? The browser's PDF viewer handles this gracefully by showing the last page or the beginning.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Clicking a citation tag MUST open the referenced PDF in a new browser tab
- **FR-002**: The PDF MUST be displayed at the page number specified in the citation
- **FR-003**: The system MUST resolve the document filename from the citation to the correct document file for preview
- **FR-004**: Citation tags MUST visually indicate they are clickable links (cursor style, hover state)
- **FR-005**: The existing citation expand/collapse detail panel MUST be replaced by the new click-to-preview behavior (single click action per citation)

### Key Entities

- **SourceCitation**: Existing entity with `filename`, `page`, and `section` attributes. The filename is used to resolve the document for preview, and the page is used for navigation.
- **Document**: Existing entity. The system needs to look up the document ID by filename to construct the preview URL.

### Assumptions

- The PDF preview uses the browser's built-in PDF viewer in a new tab (not the existing in-page modal), since the user explicitly requested "new page"
- Page navigation uses the standard PDF URL fragment `#page=N`, supported by all major browsers' PDF viewers
- Document lookup by filename is sufficient since filenames are unique in the current single-user system
- The citation expand/collapse detail panel is removed since the click action now opens the PDF — there is no need for two competing click behaviors on the same element

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can click any citation tag and see the referenced PDF page within 2 seconds
- **SC-002**: The PDF opens at the correct page matching the citation's page number
- **SC-003**: 100% of citations for existing documents with stored file data successfully open the PDF preview
- **SC-004**: Citations for missing or unavailable documents show a clear error instead of a broken page
