# Implementation Plan: Blog UI Polish

**Branch**: `002-blog-ui-polish` | **Date**: 2026-03-14 | **Spec**: [spec.md](./spec.md)

## Summary

Polish the blog's frontend UI to achieve a modern, professional look. The core
issue is that Markdown content renders as unstyled plain text. This plan adds
Tailwind Typography plugin for prose styling, syntax highlighting themes for
code blocks, refined card designs, coherent dark mode, and polished navigation
chrome. No new routes, APIs, or data model changes.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Tailwind CSS 4, @tailwindcss/typography, rehype-highlight,
highlight.js themes
**Storage**: N/A (no data changes)
**Testing**: Visual verification
**Target Platform**: Vercel (web, responsive 375px–1920px)
**Project Type**: Frontend styling only
**Constraints**: Must work with existing Tailwind v4 + PostCSS setup; dark mode
via system preference (`prefers-color-scheme`)

## Constitution Check

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Functional Components Only | PASS | No component structure changes |
| II | App Router Route Handlers | N/A | No API changes |
| III | Prisma-Only Database Access | N/A | No DB changes |
| IV | Server-Side Input Validation | N/A | No input changes |
| V | API Error Handling | N/A | No API changes |
| VI | Conventional Commits | PASS | Will follow format |
| VII | Code Style Enforcement | PASS | ESLint + Prettier enforced |

## Project Structure

### Files to modify (no new files except CSS)

```text
app/globals.css                          # Typography, code highlight, dark mode styles
components/blog/MarkdownRenderer.tsx     # Add prose classes
components/blog/ArticleCard.tsx          # Refine card design
components/blog/CommentSection.tsx       # Polish comment styles
components/ui/Header.tsx                 # Refine header styling
components/ui/Footer.tsx                 # Refine footer styling
components/ui/Pagination.tsx             # Polish pagination
app/(public)/page.tsx                    # Homepage layout polish
app/(public)/posts/[slug]/page.tsx       # Article detail layout polish
app/(public)/tags/[slug]/page.tsx        # Tag page polish
app/(public)/categories/[slug]/page.tsx  # Category page polish
app/(public)/search/page.tsx             # Search page polish
```

## Complexity Tracking

No constitution violations. No complexity justifications needed.
