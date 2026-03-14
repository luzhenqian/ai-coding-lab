# Research: Streaming Chat API

## R1: Vercel AI SDK streamText + onFinish for Persistence

**Decision**: Use `streamText` from Vercel AI SDK with the `onFinish` callback to persist the completed AI response after streaming ends.

**Rationale**: `streamText` returns a `StreamTextResult` which can be converted to a streaming response via `.toDataStreamResponse()`. The `onFinish` callback fires when generation completes and provides `{ text, usage, finishReason }`. This is the correct hook for persisting the full response — it only fires on successful completion, satisfying FR-011 (don't persist partial responses on disconnect).

**Alternatives considered**:
- `generateText` (non-streaming): Violates constitution Principle II (Streaming UX — full-response buffering is prohibited).
- Manual stream consumption + persistence: Over-engineered; `onFinish` handles this natively.

## R2: Chat Model Selection

**Decision**: Use OpenAI `gpt-5.4` as specified in the constitution technology constraints table.

**Rationale**: The user's description mentioned gpt-4o-mini, but the constitution explicitly specifies `gpt-5.4` as the chat model. Constitution is the highest-authority document. Using `openai("gpt-5.4")` via Vercel AI SDK.

**Alternatives considered**:
- gpt-4o-mini (user suggestion): Overridden by constitution.
- Make model configurable via env var: YAGNI — constitution says gpt-5.4 is fixed.

## R3: System Prompt Strategy

**Decision**: Build the system prompt dynamically based on whether retrieval returned results or not.

**Rationale**: Two prompt variants are needed:
1. **With context**: Instruct the AI to answer based only on the provided document excerpts, cite sources, respond in Chinese Markdown.
2. **Without context** (empty retrieval): Instruct the AI to politely state it has no relevant information, in Chinese.

This directly satisfies FR-003, FR-009, and constitution Principle I (RAG Accuracy First — explicit "I don't have enough information" when no relevant chunks).

**Alternatives considered**:
- Single prompt with conditional "if no context provided" clause: Less reliable — the LLM may still attempt to answer.
- Separate endpoint for no-context case: Over-engineered.

## R4: Conversation Auto-Creation

**Decision**: If `conversationId` is not provided or the provided ID is not found in the database, create a new conversation automatically. Use the first user message (truncated) as the conversation title.

**Rationale**: Simplifies the client — it doesn't need a separate "create conversation" step before chatting. The `createConversation` helper already exists from feature 001. Using the first ~50 characters of the user message as title provides useful context in conversation lists.

**Alternatives considered**:
- Require conversationId always: Breaks the simple "just start chatting" UX.
- Return error if ID not found: Poor UX for new conversations.

## R5: Source Citation Format

**Decision**: Store source citations as a JSON array in the `sources` JSONB column of the messages table, with each entry containing `{ filename, page, section }`.

**Rationale**: The `messages` table already has a `sources` column (JSONB, nullable) from feature 001. Storing an array of `{ filename, page, section }` objects provides structured citation data. Deduplicate sources by filename+page+section to avoid repeating the same source.

**Alternatives considered**:
- Inline citations in response text: Harder to parse programmatically.
- Separate citations table: Over-engineered for current needs.

## R6: Request Validation

**Decision**: Use Zod schema to validate the request body at the API boundary.

**Rationale**: Constitution Principle III requires Zod validation at API route handlers. The schema validates `messages` as a non-empty array of `{ role: string, content: string }` objects and `conversationId` as an optional string.

**Alternatives considered**:
- Manual validation with if/else: Violates constitution (Zod required at API boundaries).
- Vercel AI SDK's built-in message types: Good for typing but doesn't provide runtime validation.

## R7: useChat Compatibility

**Decision**: Return `result.toDataStreamResponse()` from the route handler to produce a response compatible with Vercel AI SDK's `useChat` hook.

**Rationale**: `streamText` returns a `StreamTextResult` object. Calling `.toDataStreamResponse()` produces a `Response` with the correct streaming protocol that `useChat` expects on the client side. This is the standard Vercel AI SDK pattern and requires no custom formatting.

**Alternatives considered**:
- `.toTextStreamResponse()`: Returns plain text stream, not compatible with `useChat` data protocol.
- Custom SSE implementation: Reinventing the wheel.
