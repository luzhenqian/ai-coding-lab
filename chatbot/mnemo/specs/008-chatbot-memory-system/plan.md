# Implementation Plan: Chatbot Memory System

**Branch**: `008-chatbot-memory-system` | **Date**: 2026-03-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `chatbot/mnemo/chatbot/mnemo/specs/008-chatbot-memory-system/spec.md`

## Summary

Build a 4-phase teaching chatbot that progressively demonstrates LLM memory system architecture: basic chat with persistence (P1), conversation summarization (P2), cross-session long-term memory with vector search (P3), and RAG knowledge retrieval (P4). Each phase is independently runnable.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 16 (App Router), Vercel AI SDK (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/openai`), Drizzle ORM, shadcn/ui, Tailwind CSS, Streamdown (Markdown streaming renderer)
**Storage**: PostgreSQL 15+ with pgvector extension (hosted on Supabase)
**Testing**: Manual validation per quickstart.md (teaching project, no automated test suite)
**Target Platform**: Vercel (serverless) + Supabase (PostgreSQL)
**Project Type**: Full-stack web application (Next.js)
**Performance Goals**: TTFT < 1.5s, context assembly < 300ms, memory retrieval < 200ms
**Constraints**: Single-user (hardcoded userId), no auth, no LangChain, Chinese UI / English code
**Scale/Scope**: Single demo user, ~100s of conversations, ~1000s of messages, ~100s of memories, ~10s of documents

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Layered Memory Architecture | PASS | Four memory layers mapped to four phases, each with separate modules under `lib/ai/` and `lib/db/queries/` |
| II. Progressive Complexity | PASS | Each phase is independently runnable; Phase N does not introduce Phase N+1 abstractions |
| III. Teaching First | PASS | Explicit code preferred; comments explain "why"; no LangChain/complex abstractions |
| IV. Async Non-Blocking | PASS | `waitUntil` pattern for summaries, memory extraction; streaming responses start immediately |
| V. Token Budget Awareness | PASS | All context injection points have configurable token limits in `lib/constants.ts`; budget tracking in debug panel |

No violations. No entries needed in Complexity Tracking table.

## Project Structure

### Documentation (this feature)

```text
chatbot/mnemo/specs/008-chatbot-memory-system/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── api.md           # API contracts
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
chatbot/mnemo/
├── app/
│   ├── layout.tsx                    # Root layout with sidebar
│   ├── page.tsx                      # Main chat page
│   ├── memories/
│   │   └── page.tsx                  # Memory management (Phase 3)
│   ├── documents/
│   │   └── page.tsx                  # Document management (Phase 4)
│   └── api/
│       ├── chat/
│       │   └── route.ts              # POST /api/chat (streaming)
│       ├── conversations/
│       │   ├── route.ts              # GET/POST /api/conversations
│       │   └── [id]/
│       │       ├── route.ts          # DELETE /api/conversations/[id]
│       │       ├── messages/
│       │       │   └── route.ts      # GET messages
│       │       └── debug/
│       │           └── route.ts      # GET debug info (Phase 2+)
│       ├── memories/
│       │   ├── route.ts              # GET/POST /api/memories (Phase 3)
│       │   └── [id]/
│       │       └── route.ts          # PUT/DELETE (Phase 3)
│       └── documents/
│           ├── route.ts              # GET/POST /api/documents (Phase 4)
│           └── [id]/
│               └── route.ts          # DELETE (Phase 4)
├── components/
│   ├── chat/
│   │   ├── chat-panel.tsx
│   │   ├── message-list.tsx
│   │   ├── message-bubble.tsx
│   │   ├── chat-input.tsx
│   │   └── debug-panel.tsx           # Phase 2+
│   ├── sidebar/
│   │   ├── conversation-list.tsx
│   │   └── sidebar.tsx
│   ├── memories/
│   │   ├── memory-list.tsx           # Phase 3
│   │   └── memory-editor.tsx         # Phase 3
│   └── ui/                           # shadcn/ui components
├── lib/
│   ├── ai/
│   │   ├── provider.ts              # Anthropic provider config
│   │   ├── context-builder.ts       # Context assembly logic
│   │   ├── summarizer.ts            # Summary generation (Phase 2)
│   │   ├── memory-extractor.ts      # Memory extraction (Phase 3)
│   │   ├── document-processor.ts    # Document processing pipeline (Phase 4)
│   │   └── prompts.ts               # All prompt templates
│   ├── db/
│   │   ├── index.ts                 # Drizzle client init
│   │   ├── schema.ts                # All table schemas
│   │   ├── queries/
│   │   │   ├── conversations.ts
│   │   │   ├── messages.ts
│   │   │   ├── summaries.ts         # Phase 2
│   │   │   ├── memories.ts          # Phase 3
│   │   │   └── documents.ts         # Phase 4
│   │   └── migrations/
│   ├── utils/
│   │   ├── tokens.ts                # Token estimation
│   │   ├── embeddings.ts            # Embedding generation (Phase 3)
│   │   └── chunker.ts              # Document chunking utility (Phase 4)
│   └── constants.ts                 # Token budgets, thresholds
├── .env.example
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```

**Structure Decision**: Next.js App Router single-project layout. Business logic in `lib/` with clear separation: `lib/ai/` for AI operations, `lib/db/` for database, `lib/utils/` for shared utilities. API routes mirror REST resource structure. Components organized by feature area.

## Complexity Tracking

> No violations detected. Table intentionally left empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
