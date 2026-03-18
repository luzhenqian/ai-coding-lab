# Quickstart: Polished Chat UI/UX

## Prerequisites

- Node.js 18+, pnpm installed
- Project dependencies installed (`pnpm install`)

## Setup

1. Install new shadcn components:

```bash
pnpm dlx shadcn@latest add avatar tooltip alert-dialog skeleton textarea
```

2. Feature modifies these existing files:
   - `components/chat/chat-input.tsx` — Textarea with auto-resize
   - `components/chat/chat-panel.tsx` — Typing indicator state
   - `components/chat/message-bubble.tsx` — Avatars + entrance animation
   - `components/chat/message-list.tsx` — Typing indicator + empty state suggestions
   - `components/sidebar/conversation-list.tsx` — Date grouping + delete confirmation + skeleton
   - `components/sidebar/sidebar.tsx` — Tooltips on nav icons
   - `app/globals.css` — Typing indicator keyframes

3. New files created:
   - `components/chat/typing-indicator.tsx`
   - `lib/utils/date-groups.ts`

## Verification

1. Start the dev server: `pnpm dev`
2. Verify each improvement:

**Message Experience**:
- Open a conversation → messages have avatars (user icon, bot icon)
- Send a message → new message fades in with slide-up animation
- While waiting for response → typing indicator (bouncing dots) appears
- When response starts streaming → typing indicator replaced by actual content

**Chat Input**:
- Press Shift+Enter → new line inserted, input area grows
- Press Enter → message sent, input resets to single line
- Empty input shows placeholder "输入消息..."

**Empty State**:
- Open new conversation → welcome text + suggestion chips displayed
- Click a suggestion chip → message sent, empty state disappears

**Tooltips**:
- Hover over send button → tooltip "发送" appears
- Hover over delete button → tooltip "删除对话" appears
- Hover over new conversation button → tooltip "新建对话" appears

**Delete Confirmation**:
- Click delete on conversation → confirmation dialog appears
- Click "取消" → dialog closes, conversation preserved
- Click "确认" → conversation deleted

**Loading States**:
- Refresh page → skeleton placeholders in conversation list and message area

**Date Grouping**:
- Conversations grouped under "今天", "昨天", "最近7天", "更早"
