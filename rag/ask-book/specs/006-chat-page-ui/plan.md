# Implementation Plan: Chat Page UI

**Branch**: `006-chat-page-ui` | **Date**: 2026-03-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-chat-page-ui/spec.md`

## Summary

Build the `/chat` page — the primary user-facing interface for asking questions about employee handbooks. Uses Vercel AI SDK `useChat` hook for streaming chat, `streamdown` for incremental Markdown rendering, a responsive sidebar for conversation history, expandable source citations, and a welcome state with example questions.

## Technical Context

**Language/Version**: TypeScript (strict mode) on Node.js 20+
**Primary Dependencies**: Next.js 16+ (App Router), React 19, @ai-sdk/react (useChat), streamdown (Markdown streaming), Tailwind CSS
**Storage**: PostgreSQL 16+ with pgvector 0.7+ (existing conversations + messages tables)
**Testing**: Manual E2E (no test framework specified)
**Target Platform**: Web (desktop + mobile responsive)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: First AI token visible within 2 seconds of sending; conversation switch under 1 second
**Constraints**: No CSS-in-JS; no state management libraries; Tailwind-only styling
**Scale/Scope**: Single-user; ~10-50 conversations; ~100 messages per conversation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. RAG Accuracy First | PASS | Citations displayed via SourceCitation from existing chat route; no changes to RAG pipeline |
| II. Streaming UX | PASS | useChat streams token-by-token; streamdown renders incrementally; typing indicator during generation |
| III. Type Safety | PASS | Zod validation on new API routes; shared types from central types/; strict mode |
| IV. Simple Architecture | PASS | Client Components only where interactivity needed; plain functions for data access; no class hierarchies |
| V. Reproducible Local Dev | PASS | No new infra; existing Docker Compose + DB sufficient |

**Post-design re-check**: All gates still pass. No new abstraction layers introduced.

## Project Structure

### Documentation (this feature)

```text
specs/006-chat-page-ui/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── conversations-api.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── chat/
│   │   └── page.tsx                  # Chat page (Client Component)
│   └── api/
│       └── conversations/
│           ├── route.ts              # GET /api/conversations
│           └── [id]/
│               ├── route.ts          # GET/DELETE /api/conversations/[id]
│               └── messages/
│                   └── route.ts      # GET /api/conversations/[id]/messages
├── components/
│   ├── chat/
│   │   ├── chat-sidebar.tsx          # Conversation list sidebar
│   │   ├── chat-messages.tsx         # Message list with streaming
│   │   ├── chat-input.tsx            # Input box with send/stop button
│   │   ├── chat-welcome.tsx          # Welcome state with example questions
│   │   ├── message-bubble.tsx        # Single message (user or assistant)
│   │   └── source-citations.tsx      # Expandable citation tags
│   └── ...
└── types/
    └── index.ts                      # Extended with any new client types
```

**Structure Decision**: Components are grouped under `src/components/chat/` to keep the chat UI cohesive. Each component has a single responsibility. API routes follow Next.js App Router conventions with nested dynamic segments.

### New Dependencies

| Package | Purpose | Justification |
|---------|---------|---------------|
| `@ai-sdk/react` | `useChat` React hook | Constitution mandates Vercel AI SDK; this is the official React binding |
| `streamdown` | Streaming Markdown rendering | Constitution mandates streamdown for MD streaming |

## Complexity Tracking

No constitution violations. No complexity justifications needed.
