# Quickstart: Streaming Chat API

## Prerequisites

- PostgreSQL + pgvector running (`docker compose up -d`)
- Database migrated (feature 001)
- At least one PDF uploaded and processed (feature 002)
- `OPENAI_API_KEY` and `DATABASE_URL` set in `.env.local`
- Next.js dev server running (`pnpm dev`)

## Scenario 1: Basic Chat Question

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "公司的年假政策是什么？" }
    ]
  }' \
  --no-buffer
```

**Expected**: Streaming response with Chinese Markdown answer about vacation policy, grounded in uploaded handbook content. A new conversation is auto-created.

## Scenario 2: With Conversation ID

```bash
# First message creates a conversation (capture the conversationId from DB)
# Then send follow-up:
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "公司的年假政策是什么？" },
      { "role": "assistant", "content": "根据员工手册..." },
      { "role": "user", "content": "那病假呢？" }
    ],
    "conversationId": "existing-conversation-uuid"
  }' \
  --no-buffer
```

**Expected**: Follow-up answer considers conversation history. Both messages persisted to the existing conversation.

## Scenario 3: No Relevant Context

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "今天天气怎么样？" }
    ]
  }' \
  --no-buffer
```

**Expected**: Polite Chinese response explaining that the uploaded documents don't contain weather information. No hallucinated answer.

## Scenario 4: Invalid Request

```bash
# Empty messages array
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{ "messages": [] }'
```

**Expected**: 400 response with error message.

## Scenario 5: useChat Hook (Frontend)

```typescript
import { useChat } from "ai/react";

function ChatComponent() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
  });
  // Tokens stream in automatically via messages array
}
```

**Expected**: Messages stream token-by-token into the `messages` array. No custom parsing needed.

## Verification Checklist

- [ ] Response streams token-by-token (not buffered)
- [ ] Answer is in Chinese with Markdown formatting
- [ ] Answer references actual handbook content
- [ ] User message persisted in messages table after stream completes
- [ ] AI message persisted with source citations in `sources` column
- [ ] New conversation auto-created when conversationId omitted
- [ ] No-context question gets "no information" response
- [ ] Empty messages array returns 400
- [ ] Response compatible with `useChat` hook
