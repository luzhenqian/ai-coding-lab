# Implementation Plan: Streaming Chat API

**Branch**: `004-streaming-chat-api` | **Date**: 2026-03-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-streaming-chat-api/spec.md`

## Summary

Implement a POST `/api/chat` endpoint that accepts a messages array and optional conversationId, retrieves relevant document chunks via the RAG retrieval module (feature 003), constructs a grounded system prompt in Chinese, and streams the AI response token-by-token using Vercel AI SDK `streamText`. After streaming completes, both the user message and AI response (with source citations) are persisted to the database. The response format is compatible with Vercel AI SDK's `useChat` hook.

## Technical Context

**Language/Version**: TypeScript (strict mode) on Node.js 20+
**Primary Dependencies**: Vercel AI SDK (`ai` + `@ai-sdk/openai`), Drizzle ORM, Next.js App Router
**Storage**: PostgreSQL 16+ with pgvector (existing `conversations` and `messages` tables)
**Testing**: Manual verification (no test framework specified)
**Target Platform**: Node.js server (Next.js App Router API route)
**Project Type**: Web service (API endpoint)
**Performance Goals**: < 2 seconds time-to-first-token
**Constraints**: Must use `streamText` (not buffered responses), must use constitution-specified chat model (gpt-5.4), must respond in Chinese with Markdown
**Scale/Scope**: Single API route + prompt builder helper, ~150 LOC

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. RAG Accuracy First | PASS | Retrieved chunks passed as explicit context; system prompt prohibits hallucination; no-context case handled with explicit "I don't know" response; source citations preserved |
| II. Streaming UX | PASS | Uses `streamText` for token-by-token streaming; no full-response buffering; compatible with `useChat` hook |
| III. Type Safety | PASS | Request validated with Zod at API boundary; typed Drizzle queries; all types in central `types/` |
| IV. Simple Architecture | PASS | Single route handler + one helper function for prompt building; no service layer or class hierarchy |
| V. Reproducible Local Dev | PASS | Uses existing Docker PostgreSQL setup; no new infrastructure |

**Technology Constraints Check**:
- Uses Vercel AI SDK `streamText`: PASS
- Uses OpenAI model per constitution (gpt-5.4): PASS
- Uses Drizzle ORM for persistence: PASS
- No additional ORMs: PASS
- Zod validation at API boundary: PASS

All gates pass. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/004-streaming-chat-api/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── chat-api.md
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── api/
│       └── chat/
│           └── route.ts         # POST /api/chat handler
├── lib/
│   └── rag/
│       ├── retriever.ts         # Existing (feature 003)
│       └── prompt.ts            # System prompt builder
└── types/
    └── index.ts                 # Extend with ChatRequest type (if needed)
```

**Structure Decision**: Follows existing Next.js App Router convention. The chat route lives at `src/app/api/chat/route.ts`. Prompt construction is extracted to `src/lib/rag/prompt.ts` to keep the route handler focused on request/response flow (one concern per file, per constitution Principle IV).
