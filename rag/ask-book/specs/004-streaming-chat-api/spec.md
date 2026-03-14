# Feature Specification: Streaming Chat API

**Feature Branch**: `004-streaming-chat-api`
**Created**: 2026-03-12
**Status**: Draft
**Input**: User description: "流式聊天 API — POST /api/chat with RAG retrieval and streaming responses"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ask a Question and Get a Streamed Answer (Priority: P1)

A user sends a question about the employee handbook via the chat interface. The system retrieves relevant document chunks, constructs a grounded prompt, and streams the AI-generated answer token-by-token. The answer is based solely on uploaded handbook content, written in Chinese, and formatted in Markdown.

**Why this priority**: This is the core RAG chatbot functionality — without streaming chat, the product has no user-facing value. Everything else builds on this.

**Independent Test**: Send a POST request to `/api/chat` with a messages array containing a user question about vacation policy. Verify the response streams back token-by-token, the answer references handbook content, is in Chinese, uses Markdown formatting, and the response is compatible with the Vercel AI SDK `useChat` hook format.

**Acceptance Scenarios**:

1. **Given** employee handbook PDFs have been uploaded and processed, **When** a user sends a question about vacation policy via POST `/api/chat` with a messages array, **Then** the system streams back a Chinese-language Markdown answer grounded in the handbook content, with tokens arriving incrementally.
2. **Given** the handbook has been uploaded, **When** a user asks a question that is not covered in the handbook, **Then** the system streams back a response explicitly stating it does not have enough information to answer, rather than fabricating an answer.
3. **Given** a messages array with conversation history, **When** the user sends a follow-up question, **Then** the system considers the conversation context alongside freshly retrieved chunks to produce a coherent follow-up answer.

---

### User Story 2 - Persist Chat Messages with Source Citations (Priority: P2)

After the AI finishes generating a response, both the user's message and the AI's complete response are saved to the database, along with the source citations (document filename, page, section) used to generate the answer. This enables conversation history and source traceability.

**Why this priority**: Persistence enables conversation continuity and source auditing, but the core streaming experience (US1) must work first.

**Independent Test**: Send a chat message, wait for the stream to complete, then query the database to verify both the user message and AI response are stored in the messages table with the correct conversation ID. Verify the AI message includes source citations in the `sources` field.

**Acceptance Scenarios**:

1. **Given** a user sends a message via POST `/api/chat` with a `conversationId`, **When** the AI finishes streaming the response, **Then** both the user message (role: "user") and AI response (role: "assistant") are persisted in the messages table linked to the conversation.
2. **Given** a chat request retrieves chunks from two different documents, **When** the AI response is saved, **Then** the `sources` field contains citation metadata for each unique source document used (filename, page, section).
3. **Given** a chat request with no `conversationId`, **When** the request is processed, **Then** a new conversation is created automatically and the messages are linked to it.

---

### User Story 3 - Handle No-Context Gracefully (Priority: P3)

When no relevant document chunks are found for the user's question (all below similarity threshold), the system responds with a clear "I don't have enough information" message rather than hallucinating. This maintains user trust and answer quality.

**Why this priority**: This is a constitution requirement (RAG Accuracy First) but is a specific edge case of US1. The core happy path must work before refining edge case handling.

**Independent Test**: Send a question completely unrelated to any uploaded handbook content (e.g., "What is the weather today?"). Verify the system responds with a message indicating it cannot find relevant information in the uploaded documents, without attempting to answer the question.

**Acceptance Scenarios**:

1. **Given** no uploaded documents contain content relevant to the question, **When** the user asks "What is the capital of Mars?", **Then** the system streams back a polite Chinese-language message explaining that the uploaded documents do not contain information about this topic.
2. **Given** the retrieval module returns an empty array, **When** the system constructs the prompt, **Then** the system prompt explicitly instructs the AI to state it has no relevant information, and no document chunks are injected into the context.

---

### Edge Cases

- What happens when the messages array is empty or missing? The system returns a 400 error with a descriptive message.
- What happens when the messages array has no user message (only system/assistant messages)? The system returns a 400 error.
- What happens when the embedding API or chat model API is unavailable? The system returns a 500 error with a clear message; no partial data is persisted.
- What happens when the conversation ID does not exist in the database? A new conversation is created automatically.
- What happens when the streamed response is interrupted (client disconnects)? The partial response is not persisted — only complete responses are saved.
- What happens when the retrieved chunks are from multiple documents? All source documents are cited in the sources metadata.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST expose a POST `/api/chat` endpoint that accepts a JSON body with `messages` (array of `{role, content}`) and an optional `conversationId`.
- **FR-002**: System MUST extract the latest user message from the messages array and use it to retrieve relevant document chunks via the RAG retrieval module.
- **FR-003**: System MUST construct a system prompt that instructs the AI to: answer based only on provided document context, respond in Chinese, use Markdown formatting, and explicitly state when information is not available rather than fabricating answers.
- **FR-004**: System MUST inject retrieved document chunks into the prompt as structured context, including source attribution (filename, page, section) for each chunk.
- **FR-005**: System MUST stream the AI response token-by-token, returning a response format compatible with Vercel AI SDK's `useChat` hook.
- **FR-006**: System MUST persist the user message and complete AI response to the messages table after streaming completes, linked to the conversation.
- **FR-007**: System MUST include source citations (document filename, page, section) in the persisted AI message's `sources` field.
- **FR-008**: System MUST auto-create a new conversation if no `conversationId` is provided or the provided ID does not exist.
- **FR-009**: System MUST return a clear "no relevant information found" response (not an error) when retrieval produces zero results.
- **FR-010**: System MUST validate the request body, returning 400 for missing or empty messages array or missing user message.
- **FR-011**: System MUST NOT persist partial responses if the stream is interrupted before completion.

### Key Entities

- **ChatRequest**: The incoming request containing a messages array (conversation history) and an optional conversation identifier. Represents one turn of the conversation.
- **Source Citation**: Metadata about a document chunk used to generate an answer, including the document's filename, page number, and section title. Attached to the persisted AI message for traceability.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users see the first token of the AI response within 2 seconds of sending a question (time-to-first-token).
- **SC-002**: 100% of AI responses are grounded in retrieved document content — no fabricated answers when relevant documents exist.
- **SC-003**: When no relevant documents are found, 100% of responses explicitly communicate this to the user rather than hallucinating.
- **SC-004**: Every completed AI response is persisted with accurate source citations that match the chunks actually used.
- **SC-005**: The streaming response format is fully compatible with Vercel AI SDK `useChat` hook, requiring zero client-side adaptation.

## Assumptions

- The RAG retrieval module (`retrieveRelevantChunks` from feature 003) is available and functional.
- The `conversations` and `messages` tables (from feature 001) are available with the existing schema.
- The `createConversation` and `addMessage` query helpers (from feature 001) are available.
- The Vercel AI SDK `streamText` function handles the streaming protocol compatible with `useChat`.
- The chat model is specified by the constitution as gpt-5.4; the user's description mentions gpt-4o-mini — implementation will follow the constitution.
- The `onFinish` callback of `streamText` provides the complete response text for persistence.
