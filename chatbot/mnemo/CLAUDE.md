# mnemo Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-18

## Active Technologies
- TypeScript 5 / React 19 / Next.js 16.1.6 + shadcn/ui v4 (base-nova style), @base-ui/react v1.3.0, tw-animate-css v1.4.0, Lucide React v0.577.0 (010-polished-chat-ux)
- N/A (no new data persistence; existing conversation/message APIs unchanged) (010-polished-chat-ux)
- TypeScript 5 / Next.js 16.1.6 + `pdf-parse` (PDF text extraction), `mammoth` (DOCX/DOC text extraction) (011-pdf-doc-upload)
- PostgreSQL + pgvector (existing, unchanged) (011-pdf-doc-upload)
- TypeScript 5 / Next.js 16.1.6 + Vercel AI SDK (`ai`), `@ai-sdk/anthropic`, Drizzle ORM, `zod` (012-dual-track-memory)
- PostgreSQL + pgvector (existing, schema unchanged) (012-dual-track-memory)

- TypeScript 5 / React 19 / Next.js 16.1.6 + Streamdown v2.4.0 (installed), `@streamdown/code` (to install), Shiki (bundled in @streamdown/code) (009-code-syntax-highlighting)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5 / React 19 / Next.js 16.1.6: Follow standard conventions

## Recent Changes
- 012-dual-track-memory: Added TypeScript 5 / Next.js 16.1.6 + Vercel AI SDK (`ai`), `@ai-sdk/anthropic`, Drizzle ORM, `zod`
- 011-pdf-doc-upload: Added TypeScript 5 / Next.js 16.1.6 + `pdf-parse` (PDF text extraction), `mammoth` (DOCX/DOC text extraction)
- 010-polished-chat-ux: Added TypeScript 5 / React 19 / Next.js 16.1.6 + shadcn/ui v4 (base-nova style), @base-ui/react v1.3.0, tw-animate-css v1.4.0, Lucide React v0.577.0


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
