<!--
  Sync Impact Report
  =====================
  Version change: N/A (initial) → 1.0.0
  Modified principles: N/A (initial creation)
  Added sections: Core Principles (5), Technology Constraints, Development Workflow, Governance
  Removed sections: None
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ no changes needed (generic Constitution Check gate)
    - .specify/templates/spec-template.md ✅ no changes needed (generic structure)
    - .specify/templates/tasks-template.md ✅ no changes needed (generic structure)
  Follow-up TODOs: None
-->

# AskBook Constitution

## Core Principles

### I. RAG Accuracy First

All retrieval and generation logic MUST prioritize answer faithfulness
over speed or feature breadth.

- Retrieved document chunks MUST be passed as explicit context to
  the LLM; the system MUST NOT rely on the model's parametric
  knowledge for handbook-specific answers.
- Chunk boundaries MUST preserve semantic coherence (no mid-sentence
  splits). Overlap between adjacent chunks is required.
- When no relevant chunks meet the similarity threshold, the system
  MUST respond with an explicit "I don't have enough information"
  message rather than hallucinate.
- Every answer MUST cite the source chunk(s) used, including the
  original PDF name and approximate page/section.

### II. Streaming UX

User-perceived latency MUST be minimized through streaming responses.

- Chat responses MUST stream token-by-token via the Vercel AI SDK
  `streamText` API; full-response buffering is prohibited.
- Markdown rendering MUST update incrementally using streamdown;
  the UI MUST NOT flash or reflow on each token.
- Upload progress and embedding generation MUST show real-time
  progress indicators; blocking the UI during processing is
  prohibited.

### III. Type Safety

TypeScript strict mode (`strict: true`) is mandatory across the
entire codebase.

- All database queries MUST use Drizzle ORM typed schema
  definitions; raw SQL is prohibited except inside Drizzle
  `sql` template literals with explicit type annotations.
- API route handlers MUST validate input with Zod schemas;
  `any` casts are prohibited at module boundaries.
- Shared types (e.g., chat messages, document metadata) MUST be
  defined in a central `types/` directory and imported — never
  duplicated.

### IV. Simple Architecture

Follow Next.js App Router conventions. Do not introduce unnecessary
abstraction layers.

- Server Components are the default; Client Components (`"use client"`)
  MUST only be used when browser APIs or interactivity are required.
- Business logic belongs in plain functions or server actions, not in
  class hierarchies or service layers unless complexity demands it.
- One concern per file. Route handlers, UI components, and data access
  MUST NOT be mixed in the same file.
- YAGNI applies: do not build admin dashboards, auth systems, or
  multi-tenant features unless explicitly specified in the feature spec.

### V. Reproducible Local Development

Every developer MUST be able to run the full stack locally with a
single `docker compose up` command.

- PostgreSQL + pgvector MUST run in Docker; the app MUST connect via
  environment variables defined in `.env.local` (git-ignored).
- Database migrations MUST be managed by Drizzle Kit and MUST be
  committed to the repository. Manual schema changes are prohibited.
- Seed scripts for test data (sample PDF chunks + embeddings) SHOULD
  be provided so the chatbot is usable without uploading a real PDF.
- All required environment variables MUST be documented in
  `.env.example` with placeholder values.

## Technology Constraints

The following technology choices are fixed and MUST NOT be changed
without a constitution amendment:

| Layer | Technology | Version/Model |
|-------|-----------|---------------|
| Framework | Next.js (App Router) | 16+ |
| Language | TypeScript | strict mode |
| Styling | Tailwind CSS | latest |
| Database | PostgreSQL + pgvector | 16+ / 0.7+ |
| ORM | Drizzle ORM + Drizzle Kit | latest |
| AI SDK | Vercel AI SDK | latest |
| Embeddings | OpenAI text-embedding-3-small | 1536 dims |
| Chat model | OpenAI gpt-5.4 | latest |
| PDF parsing | pdf-parse | latest |
| MD streaming | streamdown | latest |
| Local infra | Docker Compose | v2 |

Additional constraints:

- No additional ORMs or query builders (e.g., Prisma, Knex).
- No CSS-in-JS libraries; Tailwind utility classes only.
- No state management libraries (e.g., Redux, Zustand) unless the
  feature spec explicitly requires complex client state.

## Development Workflow

- **Branch strategy**: Feature branches off `main`; merge via PR.
- **Commit discipline**: Small, focused commits. Each commit MUST
  leave the app in a buildable state.
- **Testing**: Integration tests for RAG pipeline (embedding →
  retrieval → generation). Unit tests for utility functions.
  E2E tests for critical user flows (upload → chat).
- **Code quality**: ESLint + Prettier enforced. No warnings allowed
  in CI.
- **Environment**: `.env.local` for secrets (OPENAI_API_KEY,
  DATABASE_URL). Never committed to git.

## Governance

This constitution is the highest-authority document for the AskBook
project. All implementation decisions MUST comply with the principles
and constraints defined above.

- **Amendments**: Any change to this constitution MUST be documented
  with a version bump, rationale, and migration plan if breaking.
- **Versioning**: MAJOR for principle removal/redefinition, MINOR for
  new principles or material expansion, PATCH for clarifications.
- **Compliance**: Every PR review MUST verify that changes align with
  the Core Principles. Violations MUST be flagged and resolved before
  merge.
- **Runtime guidance**: See `CLAUDE.md` (if present) for agent-specific
  development guidance that supplements this constitution.

**Version**: 1.0.0 | **Ratified**: 2026-03-12 | **Last Amended**: 2026-03-12
