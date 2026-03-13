# Feature Specification: Chat Page UI

**Feature Branch**: `006-chat-page-ui`
**Created**: 2026-03-12
**Status**: Draft
**Input**: User description: "聊天对话页面，路由 /chat，使用 useChat hook 对接 /api/chat，含侧边栏、消息流、流式 Markdown 渲染、引用来源、输入框、空状态、打字指示器"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Send a Question and Receive a Streaming Answer (Priority: P1)

A user navigates to `/chat`, types a question about the employee handbook (e.g., "加班费怎么算？") in the input box, and presses Enter or clicks the send button. The system sends the message to `/api/chat`, and the AI's reply streams in real-time on the left side of the chat area, rendered as formatted Markdown. The user's own message appears on the right side. While the AI is generating, a typing indicator is visible and the send button transforms into a stop button that can abort generation.

**Why this priority**: This is the core value proposition — asking questions and getting answers. Without this, the chat page has no purpose.

**Independent Test**: Navigate to `/chat`, type a question, press Enter. Verify the question appears on the right, the AI reply streams in on the left with proper Markdown formatting, and the typing indicator shows during generation.

**Acceptance Scenarios**:

1. **Given** the user is on `/chat` with documents uploaded, **When** they type "请假审批流程是什么？" and press Enter, **Then** the message appears right-aligned, an AI reply streams in left-aligned with Markdown formatting, and a typing indicator shows during generation.
2. **Given** the AI is actively generating a response, **When** the user clicks the stop button, **Then** generation stops immediately and the partial response remains visible.
3. **Given** the user is on `/chat`, **When** they press Enter with an empty input, **Then** no message is sent.
4. **Given** the AI reply references handbook content, **When** the reply finishes streaming, **Then** source citation tags appear below the reply showing filename and page number.

---

### User Story 2 - Welcome State with Example Questions (Priority: P2)

When a user opens `/chat` for the first time or starts a new conversation, the main area displays a welcome message and a set of example questions (e.g., "加班费怎么算？", "请假审批流程是什么？"). Clicking an example question immediately sends it as if the user had typed and submitted it.

**Why this priority**: First impressions matter. An empty chat screen is intimidating; example questions guide users and demonstrate what the system can do.

**Independent Test**: Navigate to `/chat` (fresh conversation). Verify welcome message and example questions are visible. Click an example question. Verify it is sent and the AI responds.

**Acceptance Scenarios**:

1. **Given** the user navigates to `/chat` with no active conversation, **When** the page loads, **Then** a welcome message and at least 3 example questions are displayed.
2. **Given** the welcome state is showing, **When** the user clicks "加班费怎么算？", **Then** the welcome state disappears, the question appears as a user message, and the AI begins responding.
3. **Given** a conversation has at least one message, **When** the user views the chat, **Then** the welcome state is not shown.

---

### User Story 3 - Conversation History Sidebar (Priority: P3)

A sidebar on the left displays a list of past conversations. Each entry shows the conversation title (derived from the first message). The user can click a conversation to load its messages, or click a "New Conversation" button to start fresh. On mobile, the sidebar is hidden by default and can be toggled with a menu button.

**Why this priority**: Multi-conversation support adds significant value but is not essential for the core ask-and-answer flow.

**Independent Test**: Have 2+ previous conversations. Open sidebar, verify conversations listed. Click one, verify its messages load. Click "New Conversation", verify empty chat with welcome state.

**Acceptance Scenarios**:

1. **Given** the user has previous conversations, **When** they view the sidebar, **Then** conversations are listed with titles, ordered by most recent first.
2. **Given** the sidebar shows conversations, **When** the user clicks a conversation, **Then** the chat area loads that conversation's messages.
3. **Given** any state, **When** the user clicks "新建会话", **Then** a new empty conversation starts with the welcome state.
4. **Given** the user is on a mobile viewport, **When** the page loads, **Then** the sidebar is hidden and a menu toggle button is visible.
5. **Given** the sidebar is hidden on mobile, **When** the user taps the menu button, **Then** the sidebar slides in as an overlay.

---

### User Story 4 - Source Citation Expansion (Priority: P4)

After an AI reply finishes, source citation tags are shown below the message (e.g., "《员工手册》第12页"). The user can click a citation tag to expand it and view the original text excerpt and page number. Clicking again collapses it.

**Why this priority**: Citations build trust and allow verification, but the chat is usable without interactive expansion.

**Independent Test**: Send a question that returns results with citations. Verify citation tags appear. Click one, verify the excerpt expands. Click again, verify it collapses.

**Acceptance Scenarios**:

1. **Given** an AI reply has source citations, **When** the reply finishes, **Then** citation tags are displayed below the message showing filename and page.
2. **Given** citation tags are visible, **When** the user clicks a tag, **Then** it expands to show the original text excerpt from that source.
3. **Given** a citation is expanded, **When** the user clicks it again, **Then** it collapses back to the compact tag.
4. **Given** an AI reply has no source citations, **When** the reply finishes, **Then** no citation section is shown.

---

### Edge Cases

- What happens when the network connection is lost during streaming? The partial response remains visible and an error message is shown with a retry option.
- What happens when `/api/chat` returns a server error? An inline error message appears in the chat with an option to retry the last question.
- What happens when the conversation list API fails to load? The sidebar shows an error state with a retry button; the main chat area remains functional.
- What happens when the user rapidly sends multiple messages? Each message is queued; the send button is disabled while a response is in progress.
- What happens on very long AI responses? The chat area scrolls automatically to follow new content during streaming.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render the chat page at the `/chat` route
- **FR-002**: System MUST use the Vercel AI SDK `useChat` hook to communicate with `POST /api/chat`
- **FR-003**: User messages MUST be displayed right-aligned; AI replies MUST be displayed left-aligned
- **FR-004**: AI replies MUST be rendered as formatted Markdown in real-time during streaming, using the `streamdown` library for incremental Markdown rendering (supporting tables, lists, code blocks, bold, etc.)
- **FR-005**: System MUST show a typing indicator while the AI is generating a response
- **FR-006**: The send button MUST transform into a stop button during AI generation, allowing the user to abort
- **FR-007**: The input box MUST support both Enter key and button click to send messages
- **FR-008**: System MUST display a welcome message and at least 3 clickable example questions when no messages exist in the current conversation
- **FR-009**: Clicking an example question MUST send it as a user message immediately
- **FR-010**: System MUST display a sidebar listing historical conversations, ordered by most recent first
- **FR-011**: Users MUST be able to create a new conversation from the sidebar
- **FR-012**: Users MUST be able to switch between conversations by clicking on them in the sidebar
- **FR-013**: The sidebar MUST be hidden by default on mobile viewports and togglable via a menu button
- **FR-014**: AI replies MUST display source citation tags (filename and page) below the message when citations are available
- **FR-015**: Users MUST be able to click a citation tag to expand/collapse the original text excerpt
- **FR-016**: The chat area MUST auto-scroll to follow new content during streaming
- **FR-017**: The layout MUST be responsive, working well on both desktop and mobile viewports
- **FR-018**: The send button MUST be disabled while a response is in progress to prevent duplicate sends
- **FR-019**: System MUST display inline error messages when API calls fail, with an option to retry

### Key Entities

- **Conversation**: A chat session with a title (derived from first message), creation timestamp, and ordered collection of messages
- **Message**: A single chat turn with a role (user or assistant), text content, optional source citations, and timestamp
- **Source Citation**: A reference to a handbook excerpt with filename, page number, section title, and original text content

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can send a question and see the first token of the AI response within 2 seconds
- **SC-002**: 95% of users can successfully send their first question without guidance (welcome state + example questions reduce onboarding friction)
- **SC-003**: Users can switch between conversations in under 1 second
- **SC-004**: The chat page renders correctly on viewports from 320px to 1920px wide
- **SC-005**: Users can verify AI answers by expanding source citations to view original handbook text
- **SC-006**: Users can abort a long-running AI generation and immediately regain control of the input

### Assumptions

- The `/api/chat` endpoint (feature 004) is already implemented and returns streaming responses with source citations
- The conversations and messages database tables (feature 001) already exist
- API endpoints for listing conversations and fetching conversation messages either exist or will be created as part of this feature's implementation plan
- The `streamdown` library is available for incremental Markdown rendering during streaming
- No authentication is required — the app is single-user
