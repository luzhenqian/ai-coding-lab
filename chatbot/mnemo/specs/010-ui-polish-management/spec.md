# Feature Specification: UI Polish for Memory & Document Management

**Feature Branch**: `010-ui-polish-management`
**Created**: 2026-03-19
**Status**: Draft
**Input**: User description: "UI polish for memory and document management: custom category selector, drag-drop upload, delete confirmations, chunk count display"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Delete Confirmation for Memories and Documents (Priority: P1)

A user managing their memories or documents clicks the delete button on an item. Instead of immediately deleting, the system presents a confirmation dialog asking them to confirm the action. This prevents accidental data loss.

**Why this priority**: Destructive actions without confirmation can lead to irreversible data loss, making this the highest priority safety improvement.

**Independent Test**: Can be fully tested by attempting to delete a memory or document and verifying the confirmation dialog appears, and that canceling preserves the item while confirming removes it.

**Acceptance Scenarios**:

1. **Given** a user is on the memory management page with existing memories, **When** they click the delete button on a memory, **Then** a confirmation dialog appears asking them to confirm the deletion.
2. **Given** the confirmation dialog is shown for a memory, **When** the user clicks "取消" (Cancel), **Then** the dialog closes and the memory remains.
3. **Given** the confirmation dialog is shown for a memory, **When** the user clicks "确认删除" (Confirm Delete), **Then** the memory is deleted and removed from the list.
4. **Given** a user is on the document management page with existing documents, **When** they click the delete button on a document, **Then** a confirmation dialog appears asking them to confirm the deletion.
5. **Given** the confirmation dialog is shown for a document, **When** the user clicks "取消", **Then** the dialog closes and the document remains.
6. **Given** the confirmation dialog is shown for a document, **When** the user clicks "确认删除", **Then** the document is deleted and removed from the list.

---

### User Story 2 - Custom Category Selector for Memories (Priority: P2)

When adding or editing a memory, the user selects a category using a styled segmented button group instead of a native browser dropdown. The three categories (偏好/事实/行为) are visually distinct with color-coded indicators, making the selection more intuitive and consistent with the application's design system.

**Why this priority**: Improves usability and visual consistency of a frequently used interaction, but no data loss risk.

**Independent Test**: Can be fully tested by opening the memory editor, selecting each category, and verifying the visual state and saved value are correct.

**Acceptance Scenarios**:

1. **Given** a user opens the "添加记忆" (Add Memory) form, **When** the form loads, **Then** the category selector displays three styled options: 偏好, 事实, 行为, with 偏好 selected by default.
2. **Given** the category selector is visible, **When** the user clicks on a different category, **Then** the selected category is visually highlighted and the others are deselected.
3. **Given** a user edits an existing memory with category "事实", **When** the editor opens, **Then** the 事实 option is pre-selected in the category selector.
4. **Given** a user selects a category and saves the memory, **When** the save completes, **Then** the memory is stored with the correct category.

---

### User Story 3 - Drag-and-Drop Document Upload (Priority: P2)

A user uploads documents by dragging files directly onto a drop zone area, or by clicking the zone to open a file browser. The drop zone provides visual feedback during drag-over and shows upload progress.

**Why this priority**: Significantly improves the document upload experience, which is a core workflow, but the existing file input is functional.

**Independent Test**: Can be fully tested by dragging a file onto the upload zone, clicking to browse, and verifying upload completes with visual feedback.

**Acceptance Scenarios**:

1. **Given** a user is on the document management page, **When** the page loads, **Then** a styled drop zone area is visible with instructions to drag files or click to browse.
2. **Given** the drop zone is visible, **When** the user drags a supported file (.txt, .md, .pdf, .doc, .docx) over the zone, **Then** the zone visually highlights to indicate it can accept the file.
3. **Given** a file is dragged over the zone, **When** the user drops the file, **Then** the upload begins and a loading indicator is shown.
4. **Given** the drop zone is visible, **When** the user clicks on it, **Then** a file browser opens allowing file selection.
5. **Given** a user drags an unsupported file type over the zone, **When** they drop it, **Then** the system rejects it and shows an appropriate message.

---

### User Story 4 - Chunk Count Display After Upload (Priority: P3)

After a document is uploaded and processing completes, the user sees the actual number of text chunks created from the document. During processing, a loading indicator is shown instead of "0 个分块".

**Why this priority**: Provides useful feedback about document processing results, but is informational rather than functional.

**Independent Test**: Can be fully tested by uploading a document and observing the chunk count update from processing state to the final count.

**Acceptance Scenarios**:

1. **Given** a document has just been uploaded with status "处理中", **When** the document list is displayed, **Then** the chunk count area shows a processing indicator instead of "0 个分块".
2. **Given** a document is being processed, **When** processing completes, **Then** the document list automatically updates to show the actual chunk count (e.g., "12 个分块").
3. **Given** a document has status "就绪" (ready), **When** viewing the document list, **Then** the correct chunk count is displayed.

---

### Edge Cases

- What happens when the user drops multiple files at once onto the upload zone? System should only accept one file per upload.
- What happens when an unsupported file type is dragged over? The zone should not highlight and the drop should be rejected.
- What happens when the user rapidly clicks delete on multiple items? Each should trigger its own confirmation dialog.
- What happens if document processing fails? The chunk count should show "—" or the error status badge handles this.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a confirmation dialog before deleting any memory item.
- **FR-002**: System MUST display a confirmation dialog before deleting any document.
- **FR-003**: Confirmation dialogs MUST include a cancel option that preserves the item and a confirm option that proceeds with deletion.
- **FR-004**: The memory category selector MUST present categories as a styled component (not a native browser dropdown).
- **FR-005**: The category selector MUST support three categories: 偏好 (preference), 事实 (fact), 行为 (behavior).
- **FR-006**: The category selector MUST pre-select the correct category when editing an existing memory.
- **FR-007**: The document upload area MUST accept files via drag-and-drop.
- **FR-008**: The document upload area MUST also support click-to-browse as a fallback.
- **FR-009**: The upload zone MUST provide visual feedback during file drag-over.
- **FR-010**: The upload zone MUST accept only .txt, .md, .pdf, .doc, .docx files.
- **FR-011**: During document processing, the system MUST show a processing indicator instead of "0 个分块".
- **FR-012**: After document processing completes, the system MUST display the actual chunk count.
- **FR-013**: The document list MUST auto-refresh to reflect updated processing status and chunk counts.
- **FR-014**: All UI text MUST be in Chinese, consistent with the existing interface.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users are prompted for confirmation on 100% of delete actions for memories and documents.
- **SC-002**: Category selection in the memory editor uses a styled component with visual differentiation between options.
- **SC-003**: Users can upload documents by dragging files onto the upload zone with visible feedback during the drag operation.
- **SC-004**: Chunk count displays accurate values for all documents with "就绪" status within 10 seconds of processing completion.
- **SC-005**: All four UI improvements are visually consistent with the existing application design system.
