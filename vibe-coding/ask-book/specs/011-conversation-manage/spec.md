# Feature Specification: Conversation Rename and Delete

**Feature Branch**: `011-conversation-manage`
**Created**: 2026-03-13
**Status**: Draft
**Input**: User description: "在聊天侧边栏的对话列表中，为每个对话增加重命名和删除功能。用户可以点击对话项上的操作按钮来重命名对话标题或删除对话。删除对话时需要确认，重命名时支持内联编辑。后端需要提供对应的API支持对话的更新和删除操作。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Delete a Conversation (Priority: P1)

A user has accumulated several conversations in the sidebar and wants to clean up old or irrelevant ones. They click an action button on a conversation item, select "Delete", confirm the action, and the conversation is permanently removed from the list along with all its messages.

**Why this priority**: Deleting unwanted conversations is the most essential management action. Without it, the sidebar becomes cluttered and unusable over time. Deletion also has data implications (messages are removed), making it more impactful than rename.

**Independent Test**: Create several conversations by chatting. Click the delete action on one conversation. Confirm deletion. Verify the conversation disappears from the sidebar and its messages are no longer accessible.

**Acceptance Scenarios**:

1. **Given** a conversation exists in the sidebar, **When** the user clicks the action button and selects delete, **Then** a confirmation dialog appears asking the user to confirm.
2. **Given** the confirmation dialog is shown, **When** the user confirms deletion, **Then** the conversation and all its messages are permanently removed, and the sidebar list updates immediately.
3. **Given** the confirmation dialog is shown, **When** the user cancels, **Then** the conversation remains unchanged.
4. **Given** the user deletes the currently active conversation, **When** deletion completes, **Then** the chat area resets to the new conversation state (empty chat).
5. **Given** the user deletes a non-active conversation, **When** deletion completes, **Then** the currently active conversation remains selected and unaffected.

---

### User Story 2 - Rename a Conversation (Priority: P2)

A user wants to give a conversation a more descriptive title than the auto-generated one. They click an action button on a conversation item, select "Rename", and the title becomes an editable inline text field. They type the new name and press Enter (or click away) to save.

**Why this priority**: Renaming improves organization and findability but is less critical than deletion. The system already auto-generates titles from the first message, so conversations are usable without manual renaming.

**Independent Test**: Create a conversation by chatting. Click the rename action. Edit the title inline. Press Enter to save. Verify the new title persists in the sidebar and after page refresh.

**Acceptance Scenarios**:

1. **Given** a conversation exists in the sidebar, **When** the user clicks the action button and selects rename, **Then** the conversation title becomes an editable inline text field with the current title pre-filled and selected.
2. **Given** the title is in edit mode, **When** the user types a new name and presses Enter, **Then** the new title is saved and displayed in the sidebar.
3. **Given** the title is in edit mode, **When** the user presses Escape, **Then** the edit is cancelled and the original title is restored.
4. **Given** the title is in edit mode, **When** the user clicks outside the input, **Then** the new title is saved (same as pressing Enter).
5. **Given** the user enters an empty or whitespace-only title, **When** they try to save, **Then** the rename is rejected and the original title is restored.

---

### Edge Cases

- What if the user tries to delete the only conversation? The system should allow it and reset to the new conversation state.
- What if a network error occurs during deletion or rename? The system should show an error message and keep the conversation in its previous state.
- What if the conversation title is very long (e.g., 200 characters)? The rename input should allow reasonable lengths (up to 100 characters) and truncate display in the sidebar as before.
- What if two browser tabs are open and one deletes a conversation? The other tab should handle the missing conversation gracefully when it next refreshes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Each conversation item in the sidebar MUST display an action trigger (button or menu) for rename and delete operations
- **FR-002**: The delete action MUST show a confirmation dialog before proceeding
- **FR-003**: Deleting a conversation MUST permanently remove the conversation and all associated messages
- **FR-004**: The rename action MUST activate an inline editable text field on the conversation title
- **FR-005**: The inline edit MUST support saving via Enter key and cancelling via Escape key
- **FR-006**: Clicking outside the inline edit field MUST save the current value
- **FR-007**: Empty or whitespace-only titles MUST be rejected, restoring the original title
- **FR-008**: The conversation title MUST be limited to 100 characters
- **FR-009**: If the active conversation is deleted, the system MUST reset to a new conversation state
- **FR-010**: The sidebar list MUST update immediately after a successful rename or delete (no page refresh required)
- **FR-011**: Network errors during rename or delete MUST show a user-friendly error message

### Key Entities

- **Conversation**: Existing entity with a `title` attribute. Title is currently auto-generated from the first user message. This feature adds the ability to manually update the title and to delete the conversation along with its messages.

### Assumptions

- The action trigger is a small icon button that appears on hover (or always visible on mobile) next to each conversation item, consistent with common chat application patterns
- Deletion is permanent — there is no trash/undo mechanism
- The confirmation dialog uses the browser's native confirm dialog for simplicity, consistent with the existing document delete pattern
- Only the conversation owner can rename or delete (single-user system, so no permission check needed)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can delete any conversation in under 3 seconds (click action → confirm → conversation removed)
- **SC-002**: Users can rename any conversation in under 5 seconds (click action → edit title → save)
- **SC-003**: After deletion, the conversation and all its messages are no longer accessible or visible anywhere in the application
- **SC-004**: Renamed conversation titles persist across page refreshes and browser restarts
- **SC-005**: The feature works correctly on both desktop and mobile viewports (320px to 1920px)
