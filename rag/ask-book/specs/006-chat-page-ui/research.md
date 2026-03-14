# Research: Chat Page UI

## R1: Streaming Markdown Rendering — streamdown

**Decision**: Use `streamdown` package for incremental Markdown rendering during AI streaming.

**Rationale**: Constitution mandates streamdown. It's purpose-built for AI streaming: handles incomplete Markdown blocks gracefully via `remend` preprocessor, supports GFM (tables, task lists), and provides a `<Streamdown>` React component that avoids reflow on each token.

**API**:
```tsx
import { Streamdown } from 'streamdown';

<Streamdown
  mode="streaming"           // "streaming" or "static"
  isAnimating={boolean}      // true while tokens arriving
  parseIncompleteMarkdown={true}
>
  {markdownString}
</Streamdown>
```

**Alternatives considered**:
- `react-markdown`: No streaming support; full re-render on each token causes flicker
- `marked` + `dangerouslySetInnerHTML`: Security risk, no incremental support

**Installation**: `pnpm add streamdown` (not currently installed)

---

## R2: React Chat Hook — @ai-sdk/react useChat

**Decision**: Use `useChat` from `@ai-sdk/react` to connect to `/api/chat`.

**Rationale**: Official Vercel AI SDK React integration. Provides managed state for messages, input, streaming status, and abort. Pairs with `toUIMessageStreamResponse()` already used in our chat route.

**API**:
```tsx
import { useChat } from '@ai-sdk/react';

const {
  messages,          // UIMessage[] — full conversation
  input,             // string — current input value
  handleInputChange, // handler for <input onChange>
  handleSubmit,      // handler for <form onSubmit>
  sendMessage,       // send a custom message programmatically
  stop,              // abort active streaming
  status,            // 'submitted' | 'streaming' | 'ready' | 'error'
  error,             // Error | undefined
  setInput,          // update input state
  setMessages,       // replace message history
} = useChat({
  api: '/api/chat',
  body: { conversationId: '...' },  // extra data sent with each request
  onFinish: (message) => {},
  onError: (error) => {},
});
```

**Key detail**: `body` option sends extra fields (like `conversationId`) in every request. Our `/api/chat` already accepts `conversationId` in the request body.

**Alternatives considered**:
- Raw `fetch` + `ReadableStream`: More code, must manually parse SSE, manage message state
- `AbstractChat` from core `ai` package: Lower-level, requires manual React wiring

**Installation**: `pnpm add @ai-sdk/react` (not currently installed)

---

## R3: Conversation List API

**Decision**: Create `GET /api/conversations` and `GET /api/conversations/[id]/messages` API routes.

**Rationale**: The sidebar needs to list conversations and load messages when switching. DB queries already exist (`listConversations`, `getConversationById`, `getMessagesByConversationId`). Just need thin route handlers.

**Alternatives considered**:
- Server Components with direct DB access: Would work for initial load but sidebar needs client-side fetching for switching conversations without full page reload
- Single endpoint returning conversations+messages: Over-fetches; messages should only load on demand

---

## R4: Sidebar Responsive Pattern

**Decision**: CSS-based responsive sidebar — visible on `lg:` breakpoints, hidden + overlay on mobile with a toggle button.

**Rationale**: Constitution mandates Tailwind-only styling and no state management libraries. A simple `useState` toggle + Tailwind responsive classes handles this cleanly. No need for a drawer library.

**Pattern**:
- Desktop (`lg:+`): sidebar always visible, `lg:flex` layout
- Mobile (`<lg`): sidebar hidden by default, toggled via button, rendered as fixed overlay with backdrop

**Alternatives considered**:
- Headless UI dialog for mobile sidebar: Extra dependency, overkill for a simple slide-in
- Server-side responsive rendering: Not possible for interactive toggle

---

## R5: Source Citations in useChat Messages

**Decision**: Source citations will be extracted from the `data` field or message parts returned by the streaming response. The `/api/chat` route already uses `toUIMessageStreamResponse()` which streams UIMessage format. The `onFinish` callback persists messages with sources, but the client needs to access sources too.

**Rationale**: The current chat route stores sources in the DB via `onFinish`. For the client, we need to either: (a) include sources in the stream response via data annotations, or (b) fetch the persisted message after streaming completes. Option (b) is simpler and avoids modifying the working chat route.

**Decision**: After streaming completes, fetch the conversation's messages from `GET /api/conversations/[id]/messages` to get the full message with sources. The `sources` field on the message entity contains `SourceCitation[]`.

**Alternatives considered**:
- Stream sources as data annotations: Requires modifying the chat route's stream format; more complex
- Include sources in the message content as Markdown: Breaks separation of content and metadata
