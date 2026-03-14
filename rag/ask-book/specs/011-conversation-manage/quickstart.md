# Quickstart: Conversation Rename and Delete

## Prerequisites

- PostgreSQL running with existing `conversations` and `messages` tables
- Dev server running (`pnpm dev`)
- At least one conversation with messages in the sidebar

## Test Scenarios

### Scenario 1: Delete a conversation

1. Open chat page, verify sidebar shows conversations
2. Hover over a conversation item — action button (⋯) should appear
3. Click action button, select "删除"
4. Native confirm dialog appears: "确定要删除这个会话吗？删除后无法恢复。"
5. Click OK → conversation disappears from sidebar
6. If it was the active conversation → chat area resets to empty state

### Scenario 2: Delete the only conversation

1. Ensure only one conversation exists
2. Delete it using the flow above
3. Sidebar shows "暂无会话记录" empty state
4. Chat area resets to welcome/new conversation state

### Scenario 3: Rename a conversation

1. Hover over a conversation, click action button, select "重命名"
2. Title becomes an inline input field with current title pre-filled and selected
3. Type new title, press Enter → title saves and displays in sidebar
4. Refresh page → new title persists

### Scenario 4: Rename — cancel with Escape

1. Start rename flow (step 1-2 above)
2. Type something, press Escape
3. Original title is restored, input disappears

### Scenario 5: Rename — empty title rejected

1. Start rename flow
2. Clear the input field, press Enter
3. Original title is restored (empty title not saved)

### Scenario 6: Rename — click outside saves

1. Start rename flow
2. Type a new title
3. Click anywhere outside the input
4. New title is saved

### Scenario 7: Mobile viewport

1. Open on mobile viewport (< 1024px)
2. Open sidebar via hamburger menu
3. Action buttons should be visible (no hover needed)
4. Delete and rename flows work the same as desktop
