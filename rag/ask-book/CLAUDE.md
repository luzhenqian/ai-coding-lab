# ask-book Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-12

## Active Technologies
- TypeScript (strict mode) on Node.js 20+ + Next.js 16+ (App Router), pdf-parse, Vercel AI SDK (OpenAI provider), Drizzle ORM, Zod, Tailwind CSS (002-pdf-upload-vectorize)
- PostgreSQL 16+ with pgvector 0.7+ (existing schema from 001-db-schema-init) (002-pdf-upload-vectorize)
- TypeScript (strict mode) on Node.js 20+ + Drizzle ORM, Vercel AI SDK (`ai` + `@ai-sdk/openai`), pgvector (drizzle-orm/pg-core vector type) (003-vector-retrieval)
- PostgreSQL 16+ with pgvector 0.7+ (existing `chunks` and `documents` tables) (003-vector-retrieval)
- TypeScript (strict mode) on Node.js 20+ + Vercel AI SDK (`ai` + `@ai-sdk/openai`), Drizzle ORM, Next.js App Router (004-streaming-chat-api)
- PostgreSQL 16+ with pgvector (existing `conversations` and `messages` tables) (004-streaming-chat-api)
- TypeScript (strict mode) on Node.js 20+ + Next.js App Router, React 19, Tailwind CSS (005-upload-page-ui)
- PostgreSQL 16+ via Drizzle ORM (existing `documents` table) (005-upload-page-ui)
- TypeScript (strict mode) on Node.js 20+ + Next.js 16+ (App Router), React 19, @ai-sdk/react (useChat), streamdown (Markdown streaming), Tailwind CSS (006-chat-page-ui)
- PostgreSQL 16+ with pgvector 0.7+ (existing conversations + messages tables) (006-chat-page-ui)
- TypeScript (strict mode) on Node.js 20+ + Next.js 16+ (App Router), React 19, Tailwind CSS (007-sidebar-knowledge-entry)
- N/A (no data changes) (007-sidebar-knowledge-entry)
- N/A (no data changes — reuses existing APIs) (008-sidebar-knowledge-drawer)
- TypeScript (strict mode) on Node.js 20+ + Next.js 16+ (App Router), React 19, Drizzle ORM, Tailwind CSS (009-pdf-storage-preview)
- PostgreSQL 16+ with pgvector 0.7+ (existing `documents` table — add `file_data bytea` column) (009-pdf-storage-preview)
- TypeScript (strict mode) on Node.js 20+ + Next.js 16+ (App Router), gpt-tokenizer (new — pure JS tokenizer) (010-cjk-chunker-rewrite)
- PostgreSQL 16+ with pgvector 0.7+ (existing chunks table — no schema changes) (010-cjk-chunker-rewrite)
- TypeScript (strict mode) on Node.js 20+ + Next.js 16+ (App Router), React 19, Tailwind CSS, Drizzle ORM, Zod (011-conversation-manage)
- PostgreSQL 16+ (existing `documents` table — lookup by filename) (012-citation-pdf-preview)

- TypeScript (strict mode) on Node.js 20+ + Drizzle ORM, Drizzle Kit, drizzle-orm/pg-core, pgvector (drizzle-orm/pg-core vector type) (001-db-schema-init)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript (strict mode) on Node.js 20+: Follow standard conventions

## Recent Changes
- 012-citation-pdf-preview: Added TypeScript (strict mode) on Node.js 20+ + Next.js 16+ (App Router), React 19, Tailwind CSS, Drizzle ORM
- 011-conversation-manage: Added TypeScript (strict mode) on Node.js 20+ + Next.js 16+ (App Router), React 19, Tailwind CSS, Drizzle ORM, Zod
- 010-cjk-chunker-rewrite: Added TypeScript (strict mode) on Node.js 20+ + Next.js 16+ (App Router), gpt-tokenizer (new — pure JS tokenizer)


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
