# Tasks: Polished Chat UI/UX

**Input**: Design documents from `/specs/010-polished-chat-ux/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: No tests requested — test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Install shadcn components and shared infrastructure

- [x] T001 Install shadcn components via `pnpm dlx shadcn@latest add avatar tooltip alert-dialog skeleton textarea`
- [x] T002 Add typing indicator bounce `@keyframes` animation in `app/globals.css`
- [x] T003 Create date grouping utility function `groupConversationsByDate()` that returns groups "今天", "昨天", "最近7天", "更早" in `lib/utils/date-groups.ts`

---

## Phase 2: User Story 1 — Enhanced Message Experience (Priority: P1) 🎯 MVP

**Goal**: Messages have avatars, entrance animations, and a typing indicator while waiting for AI response

**Independent Test**: Send a message → user avatar appears, typing indicator shows, assistant response fades in with bot avatar

### Implementation

- [x] T004 [P] [US1] Create `TypingIndicator` component with 3 animated bouncing dots styled as an assistant message bubble in `components/chat/typing-indicator.tsx`
- [x] T005 [P] [US1] Update `MessageBubble` to add Avatar (User icon for user, Bot icon for assistant) beside the message content, and add entrance animation classes (`animate-in fade-in slide-in-from-bottom-2 animation-duration-300`) in `components/chat/message-bubble.tsx`
- [x] T006 [US1] Update `ChatPanel` to track `isWaiting` state (true after user sends, false when first assistant token arrives) and pass it to `MessageList` in `components/chat/chat-panel.tsx`
- [x] T007 [US1] Update `MessageList` to render `TypingIndicator` at the bottom when `isWaiting` is true, and ensure auto-scroll still works in `components/chat/message-list.tsx`

**Checkpoint**: Messages show avatars and animate in. Typing indicator appears while waiting for response.

---

## Phase 3: User Story 2 — Improved Chat Input (Priority: P1)

**Goal**: Multi-line textarea with auto-resize, Enter to send, Shift+Enter for newline

**Independent Test**: Type multi-line text with Shift+Enter → input grows. Press Enter → message sent, input resets.

### Implementation

- [x] T008 [US2] Replace `Input` with `Textarea` in `ChatInput`, implement auto-resize via `scrollHeight`, handle Enter/Shift+Enter key events, add placeholder "输入消息...", reset height on send, cap max height at 200px in `components/chat/chat-input.tsx`

**Checkpoint**: Chat input supports multi-line editing with auto-resize and correct key bindings.

---

## Phase 4: User Story 3 — Empty State with Suggestions (Priority: P2)

**Goal**: New conversations show welcome text and clickable suggestion chips

**Independent Test**: Open new conversation → see welcome + suggestion chips. Click one → sent as message.

### Implementation

- [x] T009 [US3] Update `MessageList` to show an empty state when messages array is empty: centered welcome text ("你好！我是 Mnemo，有什么可以帮你的？") and 3-4 hardcoded suggestion chips (e.g., "介绍一下你的记忆功能", "帮我写一段 Python 代码", "解释什么是 RAG", "总结我们之前的对话"). Clicking a chip calls `onSuggestionClick(text)` callback in `components/chat/message-list.tsx`
- [x] T010 [US3] Wire `onSuggestionClick` from `MessageList` through `ChatPanel` to trigger `handleSubmit` with the suggestion text in `components/chat/chat-panel.tsx`

**Checkpoint**: Empty state shows suggestions. Clicking a chip sends it as a message.

---

## Phase 5: User Story 4 — Tooltips on Action Buttons (Priority: P2)

**Goal**: All icon-only buttons show descriptive tooltips on hover

**Independent Test**: Hover over send, delete, new conversation, menu buttons → tooltips appear in Chinese.

### Implementation

- [x] T011 [P] [US4] Wrap the send button in `ChatInput` with `Tooltip` ("发送") in `components/chat/chat-input.tsx`
- [x] T012 [P] [US4] Wrap the delete button and new conversation button in `ConversationList` with `Tooltip` ("删除对话", "新建对话") in `components/sidebar/conversation-list.tsx`
- [x] T013 [P] [US4] Wrap the mobile hamburger menu button and nav link icons in `Sidebar` with `Tooltip` ("菜单", "记忆管理", "文档管理") in `components/sidebar/sidebar.tsx`

**Checkpoint**: All icon buttons show Chinese tooltips on hover.

---

## Phase 6: User Story 5 — Delete Confirmation Dialog (Priority: P2)

**Goal**: Deleting a conversation requires explicit confirmation

**Independent Test**: Click delete → dialog appears with "取消"/"确认". Cancel preserves, confirm deletes.

### Implementation

- [x] T014 [US5] Wrap the delete action in `ConversationList` with `AlertDialog`: trigger is the existing delete button, dialog content shows "确定要删除这个对话吗？" with "取消" (cancel) and "确认删除" (confirm) buttons. Only call `onDelete` on confirm in `components/sidebar/conversation-list.tsx`

**Checkpoint**: Delete requires confirmation. Cancel preserves conversation.

---

## Phase 7: User Story 6 — Skeleton Loading States (Priority: P3)

**Goal**: Skeleton placeholders appear during loading for conversation list and messages

**Independent Test**: Refresh page → skeleton items in sidebar and message area before real data loads.

### Implementation

- [x] T015 [P] [US6] Add skeleton loading state to `ConversationList`: when `isLoading` prop is true, render 4 skeleton items (matching conversation item shape: icon + two lines) instead of real conversations in `components/sidebar/conversation-list.tsx`
- [x] T016 [P] [US6] Add skeleton loading state to `MessageList`: when `isLoading` prop is true, render 3 skeleton message bubbles (alternating left/right alignment) in `components/chat/message-list.tsx`
- [x] T017 [US6] Pass `isLoading` state from page-level data fetching to `ConversationList` and `MessageList` in `app/page.tsx`

**Checkpoint**: Loading states show skeletons instead of blank content.

---

## Phase 8: User Story 7 — Conversation List Date Grouping (Priority: P3)

**Goal**: Conversations grouped by "今天", "昨天", "最近7天", "更早"

**Independent Test**: Conversations across multiple days appear under correct date group headings.

### Implementation

- [x] T018 [US7] Update `ConversationList` to use `groupConversationsByDate()` from `lib/utils/date-groups.ts`, render group headings as small muted labels between conversation items. Only show headings for groups that have conversations in `components/sidebar/conversation-list.tsx`

**Checkpoint**: Conversations are grouped by date with Chinese headings.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Responsive improvements and final validation

- [x] T019 Ensure all interactive elements have minimum 44x44px touch targets on mobile (audit button sizes in `components/chat/chat-input.tsx`, `components/sidebar/conversation-list.tsx`)
- [x] T020 Run quickstart.md validation — verify all 7 user stories work correctly end-to-end
- [x] T021 Verify build succeeds with `pnpm next build` and no TypeScript errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **US1 (Phase 2)**: Depends on Phase 1 (shadcn Avatar installed, keyframes added)
- **US2 (Phase 3)**: Depends on Phase 1 (shadcn Textarea installed)
- **US3 (Phase 4)**: Depends on Phase 2 (MessageList modifications) — must sequence after US1
- **US4 (Phase 5)**: Depends on Phase 1 (shadcn Tooltip installed). Independent of US1-US3.
- **US5 (Phase 6)**: Depends on Phase 1 (shadcn AlertDialog installed). Independent of US1-US4.
- **US6 (Phase 7)**: Depends on Phase 1 (shadcn Skeleton installed). Independent of other stories.
- **US7 (Phase 8)**: Depends on Phase 1 (date-groups.ts created). Independent of other stories.
- **Polish (Phase 9)**: After all user stories complete

### Parallel Opportunities

- T004 and T005 can run in parallel (different new/existing files)
- T011, T012, T013 can all run in parallel (different files)
- T015 and T016 can run in parallel (different files)
- After Phase 1, US4 (Tooltips), US5 (AlertDialog), US6 (Skeleton), and US7 (Date Grouping) are independent and can be worked in parallel
- US2 (Chat Input) is independent of US1 after Phase 1

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1: Install components + CSS + utility
2. Complete Phase 2: Avatars + animations + typing indicator
3. **STOP and VALIDATE**: Test message experience end-to-end
4. Proceed to remaining stories

### Incremental Delivery

1. T001-T003 → Setup ready
2. T004-T007 → Enhanced message experience (MVP!)
3. T008 → Multi-line chat input
4. T009-T010 → Empty state with suggestions
5. T011-T014 → Tooltips + delete confirmation
6. T015-T018 → Skeletons + date grouping
7. T019-T021 → Polish and validate

---

## Notes

- US1 and US3 share `message-list.tsx` — US3 must be implemented after US1 to avoid merge conflicts
- US4 (Tooltips), US5 (AlertDialog), US6 (Skeleton), and US7 (Date Grouping) all modify `conversation-list.tsx` — implement sequentially within that file
- shadcn CLI may prompt for overwrite confirmation if component files already exist — all 5 are new
- All UI text must be in Chinese (zh-CN) per constitution language policy
