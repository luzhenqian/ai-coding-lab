# Implementation Plan: CJK-Compatible Text Chunker Rewrite

**Branch**: `010-cjk-chunker-rewrite` | **Date**: 2026-03-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-cjk-chunker-rewrite/spec.md`

## Summary

Rewrite `src/lib/chunker.ts` to properly handle Chinese/CJK text by replacing the whitespace-based token estimator with `gpt-tokenizer` for precise counts, and adopting a recursive separator strategy (Microsoft/LangChain CJK pattern) that splits on Chinese and English punctuation boundaries. Preserves heading detection for both languages and maintains backward-compatible output format.

## Technical Context

**Language/Version**: TypeScript (strict mode) on Node.js 20+
**Primary Dependencies**: Next.js 16+ (App Router), gpt-tokenizer (new — pure JS tokenizer)
**Storage**: PostgreSQL 16+ with pgvector 0.7+ (existing chunks table — no schema changes)
**Testing**: npm test && npm run lint
**Target Platform**: Web (server-side text processing in Next.js API routes)
**Project Type**: Web application (Next.js full-stack)
**Performance Goals**: Chunking a 20-page document under 5 seconds
**Constraints**: No native dependencies (pure JS only — must work in Next.js serverless)
**Scale/Scope**: Single file rewrite (`src/lib/chunker.ts`) + new dependency

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. RAG Accuracy First | PASS | This feature directly improves RAG accuracy — chunks will contain coherent semantic units instead of oversized merged blocks |
| II. Streaming UX | PASS | No UI changes; chunking is server-side processing |
| III. Type Safety | PASS | gpt-tokenizer has TypeScript types; chunker maintains typed output interface |
| IV. Simple Architecture | PASS | Single file rewrite, one new dependency, no new abstractions |
| V. Reproducible Local Dev | PASS | gpt-tokenizer is a pure JS npm package — no native compilation, no Docker changes |

**Technology Constraints**: `gpt-tokenizer` is a new dependency not in the fixed technology list, but it is a pure utility (tokenizer) that does not replace any fixed technology. It supplements the existing text processing pipeline.

**Post-Phase 1 Re-check**: PASS — no changes to architecture, data model, or API contracts.

## Project Structure

### Documentation (this feature)

```text
specs/010-cjk-chunker-rewrite/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (from /speckit.tasks)
```

### Source Code (repository root)

```text
src/
└── lib/
    └── chunker.ts           # REWRITE — recursive separator strategy with gpt-tokenizer
```

**Structure Decision**: This is a single-file rewrite of an existing module. No new files, directories, or architectural changes. The public interface (`chunkText(pages: ParsedPage[]): TextChunk[]`) remains identical. Only adding `gpt-tokenizer` as a new npm dependency.

## Complexity Tracking

No constitution violations — no entries needed.
