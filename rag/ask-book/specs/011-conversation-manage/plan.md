# Implementation Plan: Conversation Rename and Delete

**Branch**: `011-conversation-manage` | **Date**: 2026-03-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-conversation-manage/spec.md`

## Summary

Add rename and delete actions to each conversation item in the chat sidebar. Delete requires confirmation via native `confirm()` dialog and removes conversation + messages. Rename uses inline text editing with Enter to save, Escape to cancel. Backend needs a PATCH endpoint for title updates; DELETE already exists.

## Technical Context

**Language/Version**: TypeScript (strict mode) on Node.js 20+
**Primary Dependencies**: Next.js 16+ (App Router), React 19, Tailwind CSS, Drizzle ORM, Zod
**Storage**: PostgreSQL 16+ with pgvector (existing `conversations` and `messages` tables)
**Testing**: Manual testing (no automated test infrastructure set up)
**Target Platform**: Web (desktop + mobile, 320px–1920px)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Delete < 3s, Rename < 5s (per success criteria)
**Constraints**: Single-user system, no auth needed
**Scale/Scope**: Single sidebar component + 1 new API endpoint + 1 new DB query

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. RAG Accuracy First | N/A | Feature doesn't touch RAG pipeline |
| II. Streaming UX | PASS | Sidebar updates immediately, no streaming needed |
| III. Type Safety | PASS | Zod validation on PATCH input, Drizzle typed queries, shared types |
| IV. Simple Architecture | PASS | No new abstractions; plain functions, inline editing in existing component |
| V. Reproducible Local Dev | PASS | No schema changes (title column already exists), no new env vars |

No violations. All gates pass.

## Project Structure

### Documentation (this feature)

```text
specs/011-conversation-manage/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── contracts/           # Phase 1 output
│   └── patch-conversation.md
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (from /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── api/
│       └── conversations/
│           └── [id]/
│               └── route.ts          # ADD: PATCH handler for rename
├── components/
│   └── chat/
│       └── chat-sidebar.tsx          # MODIFY: add rename/delete UI
├── db/
│   └── queries/
│       └── conversations.ts          # ADD: updateConversationTitle()
└── app/
    └── chat/
        └── page.tsx                  # MODIFY: add onDelete/onRename callbacks
```

**Structure Decision**: All changes fit within existing project structure. No new files needed except the contract doc. The feature modifies 4 existing files.

## Complexity Tracking

No violations to justify.
