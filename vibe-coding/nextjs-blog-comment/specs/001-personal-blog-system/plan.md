# Implementation Plan: Personal Blog System

**Branch**: `001-personal-blog-system` | **Date**: 2026-03-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-personal-blog-system/spec.md`

## Summary

Build a full-featured personal blog system using Next.js 16 App Router with
TypeScript. The system provides a public-facing blog with Markdown article
rendering, tag/category filtering, search, and ISR-optimized pages. Behind
authentication (GitHub OAuth + email/password via NextAuth.js), authors create
and manage articles through a Markdown editor with live preview, while admins
manage categories, tags, users, and view a statistics dashboard. Data is
persisted in PostgreSQL via Prisma. All input is validated server-side with
Zod, and the UI is responsive via Tailwind CSS.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) on Node.js 20+
**Primary Dependencies**: Next.js 16 (App Router), NextAuth.js v5, Prisma 6,
Tailwind CSS 4, Zod, react-markdown + remark/rehype plugins, @uiw/react-md-editor
**Storage**: PostgreSQL (via Prisma ORM)
**Testing**: Vitest + Testing Library
**Target Platform**: Vercel (serverless, Edge-compatible)
**Project Type**: Web application (full-stack, single Next.js project)
**Performance Goals**: Homepage and article pages < 2s load via ISR,
100 concurrent readers without degradation
**Constraints**: Image upload ≤ 5MB per file; ISR revalidation for public pages;
cookie-based view deduplication
**Scale/Scope**: Personal blog scale (~1k articles, ~100 concurrent readers,
~10 pages/routes)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Functional Components Only | PASS | All components will be function components with hooks |
| II | App Router Route Handlers | PASS | All API endpoints under `app/api/` |
| III | Prisma-Only Database Access | PASS | All DB access through Prisma Client, no raw SQL |
| IV | Server-Side Input Validation | PASS | Zod schemas for all Route Handlers and server actions |
| V | API Error Handling | PASS | Consistent `{ error, details? }` shape with proper HTTP codes |
| VI | Conventional Commits | PASS | All commits follow conventional format |
| VII | Code Style Enforcement | PASS | ESLint + Prettier + `"strict": true` in tsconfig |

All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/001-personal-blog-system/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
app/
├── (public)/
│   ├── page.tsx                    # Homepage (article list + pagination)
│   ├── posts/[slug]/page.tsx       # Article detail page
│   ├── tags/[slug]/page.tsx        # Filter by tag
│   ├── categories/[slug]/page.tsx  # Filter by category
│   ├── search/page.tsx             # Search results
│   └── about/page.tsx              # Static about page
├── (auth)/
│   ├── login/page.tsx              # Login (email + GitHub OAuth)
│   ├── register/page.tsx           # Registration form
│   └── reset-password/page.tsx     # Password reset flow
├── admin/
│   ├── layout.tsx                  # Admin layout (role guard)
│   ├── page.tsx                    # Dashboard
│   ├── posts/
│   │   ├── page.tsx                # Article list management
│   │   ├── new/page.tsx            # Create article
│   │   └── [id]/edit/page.tsx      # Edit article
│   ├── categories/page.tsx         # Category CRUD
│   ├── tags/page.tsx               # Tag CRUD
│   └── users/page.tsx              # User management (admin only)
├── api/
│   ├── auth/[...nextauth]/route.ts # NextAuth handler
│   ├── posts/
│   │   ├── route.ts                # GET list, POST create
│   │   ├── [id]/route.ts           # GET, PUT, DELETE single
│   │   └── [id]/views/route.ts     # POST increment view
│   ├── categories/
│   │   ├── route.ts                # GET list, POST create
│   │   └── [id]/route.ts           # GET, PUT, DELETE single
│   ├── tags/
│   │   ├── route.ts                # GET list, POST create
│   │   └── [id]/route.ts           # GET, PUT, DELETE single
│   ├── comments/
│   │   ├── route.ts                # POST create
│   │   └── [id]/route.ts           # DELETE single
│   ├── upload/route.ts             # POST image upload
│   └── users/
│       └── [id]/route.ts           # PUT update role
├── layout.tsx                      # Root layout
└── globals.css                     # Tailwind global styles

components/
├── blog/
│   ├── ArticleCard.tsx             # Article preview card
│   ├── ArticleList.tsx             # Paginated article list
│   ├── MarkdownRenderer.tsx        # Markdown → HTML renderer
│   ├── CommentSection.tsx          # Comment list + form
│   └── TagList.tsx                 # Tag display/filter
├── admin/
│   ├── MarkdownEditor.tsx          # Markdown editor with preview
│   ├── ArticleForm.tsx             # Article create/edit form
│   ├── StatsCard.tsx               # Dashboard statistics card
│   └── DataTable.tsx               # Reusable admin table
├── auth/
│   ├── LoginForm.tsx               # Email/password login
│   ├── RegisterForm.tsx            # Registration form
│   └── AuthGuard.tsx               # Role-based access guard
└── ui/
    ├── Pagination.tsx              # Pagination component
    ├── SearchBar.tsx               # Search input
    └── ImageUpload.tsx             # Image upload widget

hooks/
├── useAuth.ts                      # Auth state hook
└── useDebounce.ts                  # Debounced search input

lib/
├── prisma.ts                       # Prisma client singleton
├── auth.ts                         # NextAuth configuration
├── validations/
│   ├── article.ts                  # Article Zod schemas
│   ├── auth.ts                     # Auth Zod schemas
│   ├── comment.ts                  # Comment Zod schemas
│   └── category.ts                 # Category/Tag Zod schemas
├── slug.ts                         # Slug generation utility
├── sanitize.ts                     # HTML sanitization
└── storage/
    ├── index.ts                    # Storage interface
    └── local.ts                    # Local file storage implementation

prisma/
├── schema.prisma                   # Database schema
├── seed.ts                         # Seed script (admin user, default category)
└── migrations/                     # Prisma migrations

__tests__/
├── api/                            # Route handler tests
├── components/                     # Component tests
└── lib/                            # Utility tests

public/
└── uploads/                        # Local image upload directory
```

**Structure Decision**: Single Next.js project following App Router conventions.
Public pages grouped under `(public)` route group, auth pages under `(auth)`,
and admin panel under `admin/` with layout-level role guarding. Shared code
lives in `lib/`, components organized by domain in `components/`.

## Complexity Tracking

No constitution violations. No complexity justifications needed.
