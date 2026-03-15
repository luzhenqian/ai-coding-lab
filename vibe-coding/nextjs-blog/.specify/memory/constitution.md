<!--
  Sync Impact Report
  ==================
  Version change: 0.0.0 → 1.0.0 (MAJOR — initial ratification)

  Modified principles: N/A (initial version)

  Added sections:
    - 7 Core Principles (I–VII)
    - Technology Stack
    - Project Conventions
    - Governance

  Removed sections: None

  Templates requiring updates:
    - .specify/templates/plan-template.md        ✅ compatible (no changes needed)
    - .specify/templates/spec-template.md         ✅ compatible (no changes needed)
    - .specify/templates/tasks-template.md        ✅ compatible (no changes needed)
    - .specify/templates/commands/*.md            ✅ no command files exist yet

  Follow-up TODOs: None
-->

# Next.js Blog Constitution

## Core Principles

### I. Functional Components Only

All React components MUST be written as function components using React Hooks.
Class components are prohibited. This applies to pages, layouts, and all
reusable UI components without exception.

### II. App Router Route Handlers

All API endpoints MUST use Next.js App Router Route Handlers (`app/api/`).
Pages Router API routes (`pages/api/`) are prohibited. Every Route Handler
MUST return appropriate HTTP status codes and include structured error handling
with consistent error response shapes.

### III. Prisma-Only Database Access

All database operations MUST go through Prisma Client. Raw SQL queries
(`$queryRaw`, `$executeRaw`, or direct `pg` connections) are prohibited.
Schema changes MUST be expressed as Prisma schema modifications and applied
via `prisma migrate`.

### IV. Server-Side Input Validation

All user input MUST be validated on the server using Zod schemas before
processing. Client-side validation is permitted for UX but MUST NOT be
relied upon as a security boundary. Zod schemas SHOULD be co-located with
their corresponding Route Handlers or server actions.

### V. API Error Handling

Every API Route Handler MUST include a try/catch block with appropriate HTTP
status codes (400 for validation errors, 401/403 for auth errors, 404 for
not found, 500 for unexpected failures). Error responses MUST follow a
consistent shape: `{ error: string, details?: unknown }`.

### VI. Conventional Commits

All commit messages MUST follow the Conventional Commits specification
(`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `style:`,
`perf:`, `ci:`, `build:`). Commits without a valid prefix MUST be rejected.

### VII. Code Style Enforcement

All code MUST pass ESLint and Prettier checks before merging. Formatting
is non-negotiable — no PRs with linting errors or style violations. TypeScript
strict mode MUST be enabled in `tsconfig.json` (`"strict": true`).

## Technology Stack

| Layer          | Choice                                  |
|----------------|-----------------------------------------|
| Framework      | Next.js 16 (App Router)                 |
| Language       | TypeScript (strict mode)                |
| Database       | PostgreSQL                              |
| ORM            | Prisma                                  |
| Styling        | Tailwind CSS                            |
| Authentication | NextAuth.js (GitHub + Credentials)      |
| Testing        | Vitest + Testing Library                |
| Deployment     | Vercel                                  |

Deviations from this stack require explicit justification and constitution
amendment before adoption.

## Project Conventions

- Directory structure MUST follow Next.js App Router conventions
  (`app/`, `app/api/`, `app/(groups)/`, etc.)
- Reusable components MUST reside in `components/`, organized by feature
  domain in subdirectories (e.g., `components/blog/`, `components/auth/`)
- Custom hooks MUST reside in `hooks/`
- Prisma schema MUST be located at `prisma/schema.prisma`
- Environment variables MUST use `.env.local` for local development;
  a `.env.example` template MUST be maintained and kept in sync
- Tests MUST use Vitest as the runner and Testing Library for component
  tests; test files MUST be co-located or placed in `__tests__/` directories

## Governance

This constitution is the authoritative source for project standards. It
supersedes ad-hoc decisions and informal conventions.

**Amendment procedure**:

1. Propose the change with rationale in a PR modifying this file.
2. At least one project maintainer MUST approve the amendment.
3. Update the version following semantic versioning (see below).
4. Run the `/speckit.constitution` command to propagate changes.

**Versioning policy**:

- MAJOR: Principle removed, redefined, or backward-incompatible governance change.
- MINOR: New principle or section added, or material expansion of existing guidance.
- PATCH: Clarifications, wording improvements, non-semantic refinements.

**Compliance**: All PRs and code reviews MUST verify adherence to these
principles. Violations MUST be resolved before merge.

**Version**: 1.0.0 | **Ratified**: 2026-03-14 | **Last Amended**: 2026-03-14
