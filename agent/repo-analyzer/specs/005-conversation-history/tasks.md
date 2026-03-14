# Tasks: 对话历史系统

**Feature**: 005-conversation-history | **Plan**: [plan.md](./plan.md)

## Phase 1: Setup — 数据层

- [x] T001 Define StoredConversation/StoredMessage types and zod schemas in src/lib/conversation-store.ts
- [x] T002 Implement localStorage CRUD functions (getAll, getById, create, update, delete) in src/lib/conversation-store.ts
- [x] T003 Implement toStoredMessage/toInitialMessage serialization helpers in src/lib/conversation-store.ts
- [x] T004 Implement generateTitle helper (truncate first user message to 20 chars) in src/lib/conversation-store.ts

## Phase 2: User Story 1 — 刷新页面后恢复对话 (P1)

- [x] T005 [US1] Add conversationId and onMessagesChange props to ChatPanel in src/app/components/ChatPanel.tsx
- [x] T006 [US1] Load initialMessages from conversation-store in ChatPanel's useChat hook in src/app/components/ChatPanel.tsx
- [x] T007 [US1] Save messages to localStorage via useEffect on messages change in src/app/components/ChatPanel.tsx
- [x] T008 [US1] Add conversation state (conversations, activeConversationId) and initialization logic to page.tsx in src/app/page.tsx
- [x] T009 [US1] Pass key={activeConversationId} and conversationId to ChatPanel in src/app/page.tsx
- [x] T010 [US1] Implement handleMessagesChange to persist messages and auto-generate title in src/app/page.tsx

## Phase 3: User Story 2 — 多对话管理 (P2)

- [x] T011 [US2] Create ConversationList sidebar component with props interface in src/app/components/ConversationList.tsx
- [x] T012 [US2] Render conversation list items with title, relative time, and active highlight in src/app/components/ConversationList.tsx
- [x] T013 [US2] Add "新对话" button and empty state display in src/app/components/ConversationList.tsx
- [x] T014 [US2] Add sidebar layout (ConversationList + ChatPanel) in chat mode in src/app/page.tsx
- [x] T015 [P] [US2] Implement handleCreateConversation in src/app/page.tsx
- [x] T016 [P] [US2] Implement handleSelectConversation in src/app/page.tsx

## Phase 4: User Story 3 — 删除对话 (P3)

- [x] T017 [US3] Add delete button to each conversation list item in src/app/components/ConversationList.tsx
- [x] T018 [US3] Implement handleDeleteConversation with auto-switch logic in src/app/page.tsx

## Phase 5: Verification

- [x] T019 Manual verification: send a message, refresh page, verify conversation persists with full history
- [x] T020 Manual verification: create multiple conversations, switch between them, verify independent message histories
- [x] T021 Manual verification: delete active conversation, verify auto-switch to next conversation
- [x] T022 Manual verification: delete all conversations, verify empty state and auto-creation of new conversation

## Dependencies

T001 → T002, T003, T004 (types/schemas must exist first)
T002, T003, T004 → T005, T006, T007, T008 (CRUD and helpers needed for integration)
T005, T006, T007 → T008, T009, T010 (ChatPanel changes needed before page integration)
T008, T009, T010 → T011, T012, T013, T014 (single conversation must work before multi-conversation)
T011, T012, T013 → T014 (sidebar component needed before layout integration)
T015 and T016 are parallel [P] (independent handlers in same file)
T014, T015, T016 → T017, T018 (multi-conversation management needed before delete)
T018 → T019, T020, T021, T022 (all features complete before verification)
