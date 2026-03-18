# Research: Chatbot Memory System

**Feature**: 008-chatbot-memory-system
**Date**: 2026-03-15

## R1: Vercel AI SDK Streaming with Next.js 16 App Router

**Decision**: Use `streamText` from `ai` package with `@ai-sdk/anthropic` provider in a Route Handler (`app/api/chat/route.ts`).

**Rationale**: Vercel AI SDK provides first-class streaming support for Next.js App Router. `streamText` returns a `StreamTextResult` that can be converted to a streaming `Response` via `.toDataStreamResponse()`. The `useChat` React hook on the client side handles streaming consumption automatically.

**Alternatives considered**:
- `generateText` (non-streaming) — rejected; TTFT requirement demands streaming
- Raw SSE implementation — rejected; unnecessary complexity when AI SDK handles it
- Server Actions — rejected; Route Handlers are the standard pattern for streaming AI responses

## R2: Drizzle ORM with PostgreSQL + pgvector

**Decision**: Use Drizzle ORM with `drizzle-orm/pg-core` for schema definition and `drizzle-kit` for migrations. Use `pgvector` extension via custom SQL for vector columns.

**Rationale**: Drizzle offers type-safe schema definitions in TypeScript, lightweight query building, and good migration tooling. pgvector is the standard PostgreSQL extension for vector similarity search, supported by Supabase out of the box.

**Alternatives considered**:
- Prisma — rejected; heavier ORM, less transparent SQL, pgvector support less mature
- Raw SQL with `pg` — rejected; loses type safety, more boilerplate
- Separate vector DB (Pinecone, Weaviate) — rejected; pgvector keeps architecture simpler for teaching

**Key findings**:
- Drizzle does not have built-in pgvector column type; use `customType` or raw SQL for `vector(1536)` columns
- For vector indexes, use raw SQL migration: `CREATE INDEX ... USING hnsw (embedding vector_cosine_ops)`
- Cosine similarity query: `1 - (embedding <=> $queryVector)` in SQL

## R3: Token Estimation Strategy

**Decision**: Use character-based estimation — English: `chars / 4`, Chinese: `chars / 1.5`. Implement a simple function that detects character ranges to apply the appropriate ratio.

**Rationale**: For a teaching project, exact token counts are unnecessary. The estimation is close enough for budget enforcement (within ~10-20% of actual). Avoids adding `tiktoken` (WASM binary, ~4MB) as a dependency.

**Alternatives considered**:
- `tiktoken` / `js-tiktoken` — rejected; adds complexity and bundle size for marginal accuracy gain
- `gpt-tokenizer` — rejected; same reasoning
- Fixed ratio (chars/4 for all) — rejected; would significantly undercount Chinese text

## R4: Embedding Model Selection

**Decision**: Use OpenAI `text-embedding-3-small` (1536 dimensions) via `@ai-sdk/openai` for embedding generation.

**Rationale**: Anthropic Claude does not offer an embedding model. OpenAI's `text-embedding-3-small` is cost-effective ($0.02/1M tokens), fast, and produces good quality embeddings for semantic search. The 1536-dimension output is well-supported by pgvector.

**Alternatives considered**:
- `text-embedding-3-large` (3072 dims) — rejected; higher cost and storage, marginal quality improvement for this use case
- `text-embedding-ada-002` — rejected; older model, same 1536 dims but lower quality
- Open-source models (e.g., via Hugging Face) — rejected; adds hosting complexity, not aligned with teaching simplicity

## R5: Async Background Tasks in Next.js

**Decision**: Use `waitUntil` from `next/server` for post-response async work (saving memories, generating summaries). For Vercel deployment, this keeps the serverless function alive after the response is sent.

**Rationale**: `waitUntil` is the Next.js-native way to extend the lifetime of a serverless function invocation beyond the response. It's available in Route Handlers and supported on Vercel.

**Alternatives considered**:
- `after()` from Next.js 15+ — viable alternative, similar semantics; `waitUntil` is more widely documented
- Separate background job queue (BullMQ, Inngest) — rejected; overkill for teaching project, adds infrastructure
- Fire-and-forget promises — rejected; may be terminated prematurely in serverless environments

**Key findings**:
- `waitUntil` accepts a Promise; the runtime keeps the function alive until it resolves
- Multiple `waitUntil` calls can be made per request
- Pattern: stream response first, then `waitUntil(saveMessages(...))` and `waitUntil(extractMemories(...))`

## R6: Document Chunking Strategy

**Decision**: Paragraph-based splitting with target chunk size of 300-500 tokens and 50-token overlap between adjacent chunks.

**Rationale**: Paragraph boundaries preserve semantic coherence better than fixed-size splitting. The overlap ensures that information at paragraph boundaries isn't lost during retrieval.

**Alternatives considered**:
- Fixed character splits — rejected; breaks mid-sentence, poor retrieval quality
- Recursive text splitter (LangChain style) — rejected; would need to implement or import, paragraph splitting is simpler and sufficient
- Sentence-level splitting — rejected; chunks too small, too many embeddings to generate and store

**Implementation approach**:
1. Split by double newlines (`\n\n`) to get paragraphs
2. Merge small paragraphs until reaching ~300 tokens
3. Split large paragraphs at sentence boundaries if > 500 tokens
4. Create overlapping windows by prepending last ~50 tokens of previous chunk

## R7: Conversation Title Auto-Generation

**Decision**: After the first assistant response completes, use a lightweight LLM call to generate a short title (≤10 Chinese characters or ≤30 English characters) from the first user message + assistant reply.

**Rationale**: Generating the title after the first exchange gives the LLM enough context to create a meaningful title. Using the same Claude model avoids adding another provider dependency.

**Alternatives considered**:
- Extract first N characters of user message — rejected; often too terse or ambiguous for a title
- Generate title before responding — rejected; adds latency to first response
- Let user name conversations — rejected; friction, most users won't bother

**Implementation**: Run title generation in `waitUntil` after `onFinish` callback, update conversation record asynchronously.

## R8: shadcn/ui Component Strategy

**Decision**: Use shadcn/ui for base UI components (Button, Input, ScrollArea, Sheet, Dialog, Collapsible, Tabs). Install only needed components via `npx shadcn-ui add <component>`.

**Rationale**: shadcn/ui provides copy-paste components built on Radix UI primitives with Tailwind CSS styling. Components are owned by the project (not a dependency), making them easy to understand and modify — ideal for a teaching codebase.

**Alternatives considered**:
- Build all UI from scratch — rejected; too much boilerplate for non-teaching UI code
- Material UI / Ant Design — rejected; heavier dependencies, opinionated styling
- Headless UI — rejected; shadcn/ui already uses Radix (headless) under the hood with pre-built styles
