# Quickstart: Chat Page UI

## Prerequisites

- Database running with conversations and messages tables (feature 001)
- At least one PDF uploaded and processed (feature 002)
- `/api/chat` endpoint working (feature 004)

## Scenario 1: First Visit — Welcome State

1. Navigate to `/chat`
2. Verify: Welcome message and example questions displayed
3. Click "加班费怎么算？" example
4. Verify: Question appears as user message, AI response streams in with Markdown formatting

## Scenario 2: Send a Message via Input

1. Navigate to `/chat`
2. Type "请假审批流程是什么？" in the input box
3. Press Enter
4. Verify: User message appears right-aligned
5. Verify: AI response streams in left-aligned with proper Markdown
6. Verify: Typing indicator visible during streaming
7. Verify: Send button shows as stop button during streaming
8. Verify: Source citations appear below the AI response after streaming completes

## Scenario 3: Stop Generation

1. Send a question
2. While AI is streaming, click the stop button
3. Verify: Streaming stops immediately
4. Verify: Partial response remains visible
5. Verify: Input becomes available again

## Scenario 4: Expand Source Citations

1. Send a question that returns cited results
2. Wait for response to complete
3. Click a source citation tag (e.g., "《员工手册》第12页")
4. Verify: Expands to show original text excerpt
5. Click again
6. Verify: Collapses back to compact tag

## Scenario 5: Conversation History

1. Have 2+ previous conversations
2. Verify: Sidebar lists conversations with titles
3. Click a different conversation
4. Verify: Messages from that conversation load
5. Click "新建会话"
6. Verify: Chat clears, welcome state shown

## Scenario 6: Mobile Responsive

1. Resize to mobile viewport (< 1024px)
2. Verify: Sidebar hidden, menu toggle button visible
3. Tap menu button
4. Verify: Sidebar slides in as overlay
5. Tap a conversation
6. Verify: Sidebar closes, messages load
