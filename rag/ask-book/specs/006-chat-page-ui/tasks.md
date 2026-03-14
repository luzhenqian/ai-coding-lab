# Tasks: Chat Page UI

**Input**: Design documents from `/specs/006-chat-page-ui/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/conversations-api.md, quickstart.md

**Tests**: No test tasks included — tests were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Install new dependencies required by this feature

- [x] T001 Install `@ai-sdk/react` and `streamdown` via `pnpm add @ai-sdk/react streamdown`

**Checkpoint**: New dependencies available for import

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the API routes that the chat UI components depend on

- [x] T002 [P] Create `src/app/api/conversations/route.ts` — GET handler that calls `listConversations()` and returns JSON array of conversations ordered by most recent `updatedAt`. Set `export const dynamic = "force-dynamic"`.
- [x] T003 [P] Create `src/app/api/conversations/[id]/route.ts` — GET handler that calls `getConversationById(id)` and returns conversation JSON (or 404). DELETE handler that calls `deleteConversation(id)` and returns deleted conversation JSON (or 404). Set `export const dynamic = "force-dynamic"`.
- [x] T004 [P] Create `src/app/api/conversations/[id]/messages/route.ts` — GET handler that calls `getMessagesByConversationId(id)` and returns JSON array of messages ordered by `createdAt` ascending. Return 404 if conversation not found (check via `getConversationById` first). Set `export const dynamic = "force-dynamic"`.

**Checkpoint**: All three API routes work via curl. Conversation list, message fetch, and delete all return correct JSON.

---

## Phase 3: User Story 1 — Send a Question and Receive a Streaming Answer (Priority: P1) 🎯 MVP

**Goal**: User types a question, sees it right-aligned, AI reply streams in left-aligned with Markdown formatting, typing indicator during generation, stop button to abort.

**Independent Test**: Navigate to `/chat`, type a question, press Enter. Verify message appears, AI streams back with Markdown, typing indicator shows, stop button works.

### Implementation for User Story 1

- [x] T005 [P] [US1] Create `src/components/chat/message-bubble.tsx` — Client Component that renders a single message. Props: `role: "user" | "assistant"`, `content: string`, `isStreaming?: boolean`, `children?: ReactNode` (for citation slot). User messages: right-aligned with blue background, plain text. Assistant messages: left-aligned with gray background, content rendered via `<Streamdown>` from `streamdown` with `mode="streaming"` and `isAnimating={isStreaming}`. Apply Tailwind classes for rounded corners, padding, max-width constraint (~80% of container).
- [x] T006 [P] [US1] Create `src/components/chat/chat-input.tsx` — Client Component with props: `input: string`, `onChange: (e: ChangeEvent<HTMLInputElement>) => void`, `onSubmit: (e: FormEvent) => void`, `onStop: () => void`, `isLoading: boolean`. Renders a `<form>` with a text input and a submit/stop button. When `isLoading` is false: show send button (arrow icon). When `isLoading` is true: show stop button (square icon) that calls `onStop`. Input supports Enter to submit (default form behavior). Disable send button when input is empty. Style with Tailwind: sticky bottom, border-top, padding, rounded input field.
- [x] T007 [P] [US1] Create `src/components/chat/chat-messages.tsx` — Client Component that accepts `messages` array (from useChat) and `status` string. Maps messages to `<MessageBubble>` components. For the last assistant message when `status === "streaming"`, pass `isStreaming={true}`. Includes auto-scroll behavior: use a `useRef` on a bottom sentinel div and call `scrollIntoView({ behavior: "smooth" })` via `useEffect` whenever messages change or during streaming. Show a typing indicator (three animated dots) when `status === "submitted"` (waiting for first token). Container is a scrollable flex column with `flex-1 overflow-y-auto`.
- [x] T008 [US1] Create `src/app/chat/page.tsx` — Client Component (`"use client"`). Import `useChat` from `@ai-sdk/react`. Initialize `useChat({ api: "/api/chat" })`. Render a full-height flex column layout: `<ChatMessages>` in the main area and `<ChatInput>` at the bottom. Pass `messages`, `status` to ChatMessages. Pass `input`, `handleInputChange`, `handleSubmit`, `stop`, `isLoading` (derive from status) to ChatInput. Layout: `h-screen flex flex-col` (or `h-dvh` for mobile).

**Checkpoint**: Navigate to `/chat`, type a question, see it appear right-aligned. AI reply streams in left-aligned with Markdown formatting. Typing indicator shows. Stop button works.

---

## Phase 4: User Story 2 — Welcome State with Example Questions (Priority: P2)

**Goal**: Empty conversation shows a welcome message and clickable example questions that send immediately.

**Independent Test**: Navigate to `/chat` (fresh), see welcome + examples. Click one, verify it sends.

### Implementation for User Story 2

- [x] T009 [US2] Create `src/components/chat/chat-welcome.tsx` — Client Component with prop `onSendExample: (question: string) => void`. Displays a centered welcome section with: (1) a heading "👋 你好！我是员工手册问答助手" (or similar, without emoji if not requested); (2) a subtitle "你可以问我任何关于员工手册的问题"; (3) at least 3 example question buttons styled as clickable cards/chips: "加班费怎么算？", "请假审批流程是什么？", "试用期有多长？". On click, each calls `onSendExample(questionText)`. Style with Tailwind: centered in container, subtle card styling for examples, hover effects.
- [x] T010 [US2] Update `src/app/chat/page.tsx` — When `messages.length === 0`, render `<ChatWelcome>` instead of `<ChatMessages>`. The `onSendExample` handler should call `setInput(question)` then programmatically submit, or use `sendMessage({ text: question })` from the useChat hook. After the example is sent, messages become non-empty and the welcome state disappears automatically.

**Checkpoint**: Fresh `/chat` shows welcome + examples. Clicking an example sends it and the welcome disappears.

---

## Phase 5: User Story 3 — Conversation History Sidebar (Priority: P3)

**Goal**: Sidebar lists past conversations, supports creating new and switching between conversations. Responsive: hidden on mobile with toggle.

**Independent Test**: Have 2+ conversations. Open sidebar, switch between them, create new one. On mobile, toggle sidebar.

### Implementation for User Story 3

- [x] T011 [P] [US3] Create `src/components/chat/chat-sidebar.tsx` — Client Component with props: `conversations: Array<{ id: string; title: string | null; updatedAt: string }>`, `activeId: string | null`, `onSelect: (id: string) => void`, `onNew: () => void`, `onClose?: () => void`. Renders: (1) a header with "会话列表" title and a "新建会话" button that calls `onNew`; (2) a scrollable list of conversations showing title (or "新会话" fallback) with the active one highlighted; (3) each item calls `onSelect(id)` on click and `onClose?.()` on mobile. If `onClose` is provided, show a close (X) button in the header. Style with Tailwind: `w-64` fixed width, `bg-gray-50 border-r`, full height, overflow-y-auto for the list.
- [x] T012 [US3] Update `src/app/chat/page.tsx` — Major restructure to add sidebar layout and conversation management:
  1. Add state: `activeConversationId: string | null`, `sidebarOpen: boolean`, `conversations: Conversation[]` (fetched from `GET /api/conversations`).
  2. Fetch conversations on mount and after each chat completion (in `onFinish` callback of useChat).
  3. Pass `body: { conversationId: activeConversationId }` to useChat so the server associates messages with the right conversation.
  4. On `onSelect(id)`: set `activeConversationId`, fetch messages from `GET /api/conversations/[id]/messages`, convert to useChat format via `setMessages`.
  5. On `onNew()`: set `activeConversationId` to null, call `setMessages([])` to clear chat, close sidebar on mobile.
  6. Desktop layout (`lg:` breakpoint): sidebar always visible on the left, chat area on the right. Use `lg:flex` with sidebar as a fixed-width column.
  7. Mobile layout (`<lg`): sidebar hidden by default. Add a hamburger/menu button in a top bar that sets `sidebarOpen = true`. When open, render sidebar as fixed overlay with a semi-transparent backdrop. Clicking backdrop or a conversation closes it.
  8. Top bar for mobile: show menu toggle button and current conversation title (or "新会话").

**Checkpoint**: Sidebar lists conversations. Switching loads correct messages. New conversation clears chat. Mobile toggle works.

---

## Phase 6: User Story 4 — Source Citation Expansion (Priority: P4)

**Goal**: AI replies show expandable source citation tags with filename, page, and original text excerpt.

**Independent Test**: Send a question with cited results. Verify citation tags appear. Click to expand/collapse.

### Implementation for User Story 4

- [x] T013 [P] [US4] Create `src/components/chat/source-citations.tsx` — Client Component with prop `sources: SourceCitation[]` (from `@/types`). Renders a row of compact citation tags below an assistant message. Each tag shows "📄 {filename} 第{page}页" (or without emoji). Clicking a tag toggles an expanded panel showing the section title (if present) and page number. Use `useState` to track which citation index is expanded (or null). Style with Tailwind: small rounded tags with `bg-blue-50 text-blue-700`, expanded panel with border and padding below the tag row.
- [x] T014 [US4] Update `src/components/chat/message-bubble.tsx` — For assistant messages, accept an optional `sources?: SourceCitation[]` prop. When `sources` exists and has items and `isStreaming` is false (response complete), render `<SourceCitations sources={sources} />` below the Markdown content.
- [x] T015 [US4] Update `src/components/chat/chat-messages.tsx` — After streaming completes for an assistant message, fetch the persisted message's sources. Approach: when useChat's `status` transitions from `"streaming"` to `"ready"`, call `GET /api/conversations/[activeConversationId]/messages` to get the full messages with `sources` field. Store a `sourcesMap: Record<number, SourceCitation[]>` (keyed by message index) in state. Pass the matching `sources` array to each assistant `<MessageBubble>`.

**Checkpoint**: AI replies show citation tags after streaming. Click expands to show details. Click again collapses.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and build verification

- [x] T016 [P] Verify TypeScript compiles with zero errors via `pnpm tsc --noEmit`
- [x] T017 [P] Run ESLint and fix any warnings via `pnpm eslint src/`
- [x] T018 Run `pnpm build` to verify Next.js builds successfully with all new routes and components
- [ ] T019 Verify full UI flow end-to-end: navigate to `/chat`, see welcome state, click example question, watch streaming response with Markdown, check sidebar shows conversation, switch conversations, verify mobile responsive layout

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Can start immediately (API routes use existing DB queries)
- **User Story 1 (Phase 3)**: Depends on Setup (T001 for @ai-sdk/react and streamdown)
- **User Story 2 (Phase 4)**: Depends on User Story 1 (extends the chat page)
- **User Story 3 (Phase 5)**: Depends on Foundational (API routes) and User Story 1 (chat page structure)
- **User Story 4 (Phase 6)**: Depends on Foundational (messages API for sources) and User Story 1 (message bubble component)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Setup only — core chat functionality
- **User Story 2 (P2)**: Depends on User Story 1 — adds welcome state to existing page
- **User Story 3 (P3)**: Depends on User Story 1 + Foundational — restructures page layout, needs conversation APIs
- **User Story 4 (P4)**: Depends on User Story 1 + Foundational — extends message bubble, needs messages API for sources

### Within Each User Story

- Components before page integration
- Independent components (marked [P]) can be built in parallel
- Page integration task comes last in each story

### Parallel Opportunities

- T002, T003, T004 can run in parallel (independent API route files)
- T005, T006, T007 can run in parallel (independent component files)
- T011 and T013 can run in parallel (independent component files, different stories)
- T016 and T017 can run in parallel (independent checks)

---

## Parallel Example: Foundational Phase

```bash
# Can start simultaneously:
Task: "T002 Create GET /api/conversations route"
Task: "T003 Create GET/DELETE /api/conversations/[id] route"
Task: "T004 Create GET /api/conversations/[id]/messages route"
```

## Parallel Example: User Story 1 Components

```bash
# Can start simultaneously after T001:
Task: "T005 Create message-bubble.tsx"
Task: "T006 Create chat-input.tsx"
Task: "T007 Create chat-messages.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (install dependencies)
2. Complete Phase 2: Foundational (API routes — needed for US3/US4 but good to have early)
3. Complete Phase 3: User Story 1 (core chat with streaming)
4. **STOP and VALIDATE**: Type a question, see streaming Markdown response
5. Core chat functionality is usable

### Incremental Delivery

1. Setup + Foundational → Dependencies + API routes ready
2. User Story 1 → Streaming chat works (MVP!)
3. User Story 2 → Welcome state guides new users
4. User Story 3 → Conversation history and sidebar
5. User Story 4 → Source citations build trust
6. Polish → Type checks, lint, build, E2E

### Sequential Strategy (Recommended)

1. Complete all phases sequentially in priority order
2. US2 extends the page from US1 (adds welcome state)
3. US3 restructures the page layout (adds sidebar)
4. US4 extends message rendering (adds citations)
5. Total: 6 new component files, 3 new API route files, 1 new page file

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- The existing `/api/chat` route already returns `toUIMessageStreamResponse()` compatible with `useChat`
- The existing DB queries (`listConversations`, `getConversationById`, `getMessagesByConversationId`, `deleteConversation`) are already implemented — API routes are thin wrappers
- `streamdown` is used for Markdown rendering in message-bubble.tsx — constitution mandates its use
- No database migrations needed — conversations and messages tables already exist
- Source citations are stored in `messages.sources` JSONB field as `SourceCitation[]`
