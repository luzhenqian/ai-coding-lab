<!--
  Sync Impact Report
  ==================
  Version change: N/A (new) → 1.0.0
  Modified principles: N/A (initial creation)
  Added sections:
    - Core Principles (5 principles)
    - Technology Stack & Coding Standards
    - Explicit Exclusions
    - Governance
  Removed sections: N/A
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ no changes needed (Constitution Check is dynamic)
    - .specify/templates/spec-template.md ✅ no changes needed (generic template)
    - .specify/templates/tasks-template.md ✅ no changes needed (generic template)
    - .specify/templates/commands/*.md ✅ no command files exist
    - .specify/templates/agent-file-template.md ✅ no changes needed (generic template)
  Follow-up TODOs: None
-->

# Mnemo Constitution

## Core Principles

### I. Layered Memory Architecture

The memory system MUST be strictly separated into four layers,
each with its own module and interface:

- **Working Memory**: Context window management — what fits in the
  current prompt
- **Session Memory**: Conversation-level message history and summaries
- **Long-term Memory**: Cross-session user facts and preferences
- **Semantic Memory**: RAG-based knowledge retrieval via vector search

Layers MUST NOT be mixed within a single module. Each layer has its
own service file under `lib/ai/` (for AI logic like summarization,
memory extraction, context building) and `lib/db/queries/` (for
data access).

**Rationale**: Clear separation makes each memory type independently
testable, replaceable, and — most importantly — teachable. Readers
can study one layer without understanding the others.

### II. Progressive Complexity

The project is organized into sequential Phases. Each Phase MUST be
independently runnable and demonstrable.

- Phase N MUST NOT introduce abstractions or infrastructure that only
  become useful in Phase N+1 or later.
- When adding a new Phase, existing Phase code MUST continue to work
  without modification (unless explicitly refactoring).

**Rationale**: Learners follow the tutorial phase by phase. If Phase 1
requires understanding Phase 3 concepts, the learning curve breaks.

### III. Teaching First

Code clarity and readability MUST take priority over DRY or clever
abstractions.

- Prefer explicit, straightforward code over "smart" patterns that
  require deep framework knowledge.
- Key logic paths MUST include comments explaining *why* (not *what*)
  the code does something.
- Avoid premature abstraction: three similar code blocks are
  acceptable if an abstraction would obscure the teaching intent.

**Rationale**: This codebase is a reference implementation for a
tutorial. If a reader cannot understand the code without external
documentation, the project has failed its purpose.

### IV. Async Non-Blocking

Memory retrieval, summary generation, and other heavy computations
MUST NOT block the user's real-time chat experience.

- Use `waitUntil` or background task patterns for post-response work
  (e.g., saving memories, updating summaries).
- Streaming responses MUST begin before memory extraction completes
  when possible.
- LLM calls for memory operations (extraction, summarization) MUST
  run asynchronously after the primary response stream starts.

**Rationale**: Users expect instant chat responses. A 3-second delay
to extract memories before responding defeats the UX.

### V. Token Budget Awareness

All content injected into the LLM prompt MUST be governed by an
explicit token budget.

- Every context injection point (system prompt, memory context,
  RAG results) MUST have a configurable max-token limit.
- The total injected context MUST be tracked and capped before
  sending to the LLM.
- When budget is exceeded, content MUST be truncated or prioritized
  — never silently overflow.

**Rationale**: Unbounded context injection leads to degraded LLM
performance, increased costs, and unpredictable behavior. Token
budgets make the system predictable and cost-aware.

## Technology Stack & Coding Standards

### Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| AI SDK | Vercel AI SDK (latest stable) |
| LLM Provider | Anthropic Claude via `@ai-sdk/anthropic` |
| Database | PostgreSQL + pgvector |
| ORM | Drizzle ORM |
| Styling | Tailwind CSS + shadcn/ui |
| Package Manager | pnpm |
| Deploy Target | Vercel + Supabase (PostgreSQL) |

### Coding Conventions

- **File naming**: kebab-case (`memory-service.ts`, `chat-route.ts`)
- **Component naming**: PascalCase (`ChatPanel.tsx`, `MemoryList.tsx`)
- **Directory structure**: Next.js App Router conventions; business
  logic in `lib/`
- **Database code**: `lib/db/`, schema in `lib/db/schema.ts`
- **AI logic**: `lib/ai/`
- **Types**: All exported service functions MUST use explicit
  TypeScript types. `any` is prohibited.
- **Error handling**: Database and LLM calls MUST have try-catch with
  user-friendly error messages.
- **Environment variables**: All MUST be listed and documented in
  `.env.example`.

### Language Policy

- **Code** (variables, comments): English
- **Documentation and UI copy**: Chinese (中文)
- **Git commits**: English, Conventional Commits format

## Explicit Exclusions

The following are intentionally out of scope. Do NOT implement them:

| Exclusion | Reason |
|-----------|--------|
| User authentication | Use hardcoded `userId`; tutorial focuses on memory, not auth |
| Production-grade UI | UI is functional, not polished; focus on feature demonstration |
| Multi-model switching | Claude only; no provider abstraction layer |
| LangChain / LangGraph | Keep stack minimal; Vercel AI SDK is sufficient |
| Mem0 Cloud integration | Self-built memory system is the teaching goal |
| Real-time collaboration | Single-user scenario; no concurrent write conflict handling |

## Governance

- This constitution is the authoritative source of project principles.
  All implementation decisions MUST comply with the principles above.
- Amendments require:
  1. A documented rationale for the change.
  2. Version bump following semantic versioning (MAJOR for principle
     removal/redefinition, MINOR for additions, PATCH for
     clarifications).
  3. Updated `LAST_AMENDED_DATE`.
- Complexity beyond what a principle allows MUST be justified in the
  plan's "Complexity Tracking" table.
- Runtime development guidance (file patterns, commands, conventions)
  lives in the agent guidance file, not in this constitution.

**Version**: 1.0.1 | **Ratified**: 2026-03-15 | **Last Amended**: 2026-03-15
