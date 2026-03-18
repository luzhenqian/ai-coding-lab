# Feature Specification: Debug Panel Drag Resize & Markdown Rendering

**Feature Branch**: `009-debug-panel-resize-markdown`
**Created**: 2026-03-18
**Status**: Draft
**Input**: User description: "Debug面板支持拖动调整高度。支持markdown渲染"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Drag to Resize Debug Panel Height (Priority: P1)

As a developer debugging conversation context, I want to drag the top edge of the debug panel to adjust its height, so I can see more or less debug information depending on my current needs without toggling the panel open/closed.

**Why this priority**: The debug panel currently has a fixed height. When there are many retrieved memories or long document chunks, users must scroll extensively. Resizing gives users direct control over how much screen real estate the debug panel occupies, improving the debugging workflow significantly.

**Independent Test**: Can be fully tested by opening the debug panel, dragging the resize handle, and verifying the panel height changes smoothly. Delivers immediate value by letting developers customize their workspace layout.

**Acceptance Scenarios**:

1. **Given** the debug panel is expanded, **When** the user hovers over the top edge of the panel, **Then** the cursor changes to a vertical resize indicator.
2. **Given** the user is hovering over the resize handle, **When** the user clicks and drags upward, **Then** the panel height increases proportionally to the drag distance.
3. **Given** the user is dragging the resize handle, **When** the user releases the mouse button, **Then** the panel retains the new height.
4. **Given** the user has resized the panel, **When** the user navigates away and returns to the chat, **Then** the panel retains its last set height within the same session.
5. **Given** the panel is at its minimum height, **When** the user tries to drag it smaller, **Then** the panel stops shrinking and does not collapse below the minimum.
6. **Given** the panel is at its maximum height, **When** the user tries to drag it taller, **Then** the panel stops growing and does not exceed the maximum (leaving chat area visible).

---

### User Story 2 - Markdown Rendering in Debug Panel (Priority: P1)

As a developer reviewing debug information, I want the text content in the debug panel (summaries, memories, document chunks) to be rendered as markdown, so that structured content is more readable with proper headings, lists, bold text, and code formatting.

**Why this priority**: Debug content (especially conversation summaries and memory entries) often contains markdown-formatted text. Currently displayed as raw text, this makes it harder to read. Rendering markdown significantly improves readability and debugging efficiency.

**Independent Test**: Can be fully tested by loading a conversation with markdown-formatted summaries or memories and verifying that the debug panel renders headings, lists, bold/italic, inline code, and code blocks correctly.

**Acceptance Scenarios**:

1. **Given** a conversation summary contains markdown formatting (headings, lists, bold), **When** the debug panel displays the summary, **Then** the content is rendered as formatted markdown rather than raw text.
2. **Given** a retrieved memory contains markdown formatting, **When** the debug panel displays the memory content, **Then** the content is rendered as formatted markdown.
3. **Given** a retrieved document chunk contains markdown with code blocks, **When** the debug panel displays the chunk, **Then** code blocks are rendered with proper formatting.
4. **Given** debug content contains plain text without markdown, **When** the debug panel displays it, **Then** the text displays normally without rendering artifacts.

---

### Edge Cases

- What happens when the user resizes the browser window while the debug panel is at a custom height? The panel should adjust proportionally or clamp to valid bounds.
- What happens when markdown content contains extremely long unbroken strings or very large code blocks? The panel should handle overflow gracefully with horizontal scrolling or word wrapping.
- What happens on touch devices? Touch-based drag should work for resizing if the application supports mobile usage.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a visible drag handle at the top edge of the debug panel when it is expanded.
- **FR-002**: System MUST allow users to resize the debug panel height by clicking and dragging the handle vertically.
- **FR-003**: System MUST enforce a minimum panel height so that the panel header and at least a portion of content remain visible.
- **FR-004**: System MUST enforce a maximum panel height so that the chat message area remains usable (at least 20% of viewport height).
- **FR-005**: System MUST persist the user's chosen panel height within the current browser session.
- **FR-006**: System MUST render markdown-formatted text in the Summary Content section of the debug panel.
- **FR-007**: System MUST render markdown-formatted text in the Retrieved Memories section of the debug panel.
- **FR-008**: System MUST render markdown-formatted text in the Retrieved Documents section of the debug panel.
- **FR-009**: System MUST render code blocks within markdown content with proper formatting and visual distinction.
- **FR-010**: The resize interaction MUST provide visual feedback (cursor change) when hovering over the drag handle area.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can resize the debug panel height within 1 second of initiating a drag gesture, with smooth visual feedback during the drag.
- **SC-002**: Markdown content in the debug panel is rendered with correct formatting (headings, lists, bold, code blocks) matching standard markdown rendering expectations.
- **SC-003**: Panel height preference persists across panel open/close toggles within the same session with 100% reliability.
- **SC-004**: Debug panel resize does not cause layout shifts or visual glitches in the main chat interface during or after resizing.
- **SC-005**: Developers report improved readability of debug information compared to raw text display.

## Assumptions

- The debug panel is only used in development mode, so performance optimization for markdown rendering is not critical.
- Session-based persistence (e.g., sessionStorage or component state) is sufficient; cross-session persistence is not required.
- The existing Collapsible component behavior (expand/collapse) remains unchanged; drag resize is an addition, not a replacement.
- Standard markdown rendering is sufficient; advanced features like math equations or diagrams are not needed.
