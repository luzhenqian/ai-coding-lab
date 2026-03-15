# Research: Personal Blog System

**Feature**: 001-personal-blog-system
**Date**: 2026-03-14

## R1: NextAuth.js v5 with App Router

**Decision**: Use NextAuth.js v5 (Auth.js) with GitHub + Credentials providers

**Rationale**: NextAuth.js v5 is the recommended auth library for Next.js
App Router. It supports both OAuth providers (GitHub) and credential-based
auth natively. The Credentials provider requires manual password hashing
(bcrypt) and session management but gives full control over the email/password
flow including registration and password reset.

**Alternatives considered**:
- Clerk / Auth0: Hosted solutions with simpler setup but add external
  dependency, cost, and reduce control over the user model.
- Lucia Auth: Lightweight alternative but less ecosystem support and
  documentation for Next.js 16.

**Key implementation notes**:
- Use JWT strategy (not database sessions) for Vercel serverless compatibility
- Extend the JWT/session with `role` field for RBAC
- Password hashing via `bcryptjs` (pure JS, no native deps for Vercel)
- Password reset: generate a time-limited token stored in DB, send via
  email (Resend or Nodemailer)

## R2: Markdown Editor and Rendering

**Decision**: Use `@uiw/react-md-editor` for editing, `react-markdown` +
`remark-gfm` + `rehype-sanitize` + `rehype-highlight` for public rendering

**Rationale**: `@uiw/react-md-editor` provides a full-featured Markdown
editor with built-in split-pane preview, toolbar, and image paste support.
For public rendering, `react-markdown` with remark/rehype plugins gives
fine-grained control over sanitization and syntax highlighting.

**Alternatives considered**:
- Monaco Editor: Overkill for Markdown editing, large bundle size.
- TipTap / Slate: Rich-text editors, not Markdown-native.
- `markdown-it`: Server-side only, no React component model.

**Key implementation notes**:
- Editor is client-side only (use `dynamic` import with `ssr: false`)
- `rehype-sanitize` prevents XSS in rendered Markdown (FR-017)
- `rehype-highlight` for code block syntax highlighting
- Server-side rendering of Markdown for ISR pages uses `react-markdown`

## R3: ISR Strategy for Next.js 16

**Decision**: Use `revalidate` export in page components for ISR

**Rationale**: Next.js App Router supports ISR via `export const revalidate = N`
in page/layout files. Homepage revalidates every 60 seconds, article detail
pages use on-demand revalidation via `revalidatePath` when articles are
updated/published.

**Alternatives considered**:
- Full SSR: Higher latency per request, doesn't meet < 2s target under load.
- Full SSG: Requires rebuild for every content change, impractical for a blog
  with frequent updates.
- Client-side fetching (SWR/React Query): No SEO benefit, poor initial load.

**Key implementation notes**:
- Homepage: `export const revalidate = 60` (rebuild every 60s)
- Article detail: `generateStaticParams` for popular articles + on-demand
  revalidation via `revalidatePath('/posts/[slug]')` on publish/edit
- Tag/category pages: `revalidate = 60`
- Call `revalidatePath` in article CRUD API handlers after mutations

## R4: Image Upload Architecture

**Decision**: Local filesystem storage via `public/uploads/` with a storage
abstraction interface for future cloud migration

**Rationale**: Local storage is simplest for MVP and works on Vercel (with
caveats — files don't persist across deployments). The abstraction layer
(`StorageProvider` interface with `upload`, `delete`, `getUrl` methods)
allows swapping to S3/Cloudflare R2 later without changing business logic.

**Alternatives considered**:
- Direct S3/R2 from start: Adds complexity and cloud credentials management
  before it's needed.
- Base64 in database: Poor performance, bloats DB.
- External image service (Cloudinary/Imgix): External dependency for MVP.

**Key implementation notes**:
- `StorageProvider` interface: `upload(file: File): Promise<string>`,
  `delete(key: string): Promise<void>`, `getUrl(key: string): string`
- `LocalStorageProvider` writes to `public/uploads/` with UUID filenames
- File validation: max 5MB, JPEG/PNG/WebP/GIF only (checked server-side)
- API route handles `multipart/form-data` via Next.js built-in request parsing

## R5: View Count Deduplication

**Decision**: Cookie-based deduplication with server-side increment

**Rationale**: A cookie stores a set of viewed article IDs for the session.
The API checks the cookie before incrementing. This is simple, requires no
additional infrastructure, and prevents casual repeated counting.

**Alternatives considered**:
- IP-based deduplication: Privacy concerns, unreliable with NAT/VPN.
- Database-tracked views per user: Overengineered for a personal blog.
- Client-side localStorage: Bypassable, no server-side verification.

**Key implementation notes**:
- Cookie name: `viewed_posts`, stores JSON array of article IDs
- Set as `HttpOnly` cookie with session lifetime
- API route `POST /api/posts/[id]/views` checks cookie, increments if new
- View count stored as `viewCount` integer field on Article model

## R6: Search Implementation

**Decision**: Prisma `contains` query on title and content fields (case-insensitive)

**Rationale**: For a personal blog at expected scale (~1k articles), Prisma's
built-in string matching is sufficient. PostgreSQL's `ILIKE` (mapped by
Prisma's `contains` with `mode: 'insensitive'`) provides adequate performance
without additional infrastructure.

**Alternatives considered**:
- PostgreSQL full-text search (`tsvector`): Better relevance ranking but
  requires raw SQL, violating Constitution Principle III.
- Elasticsearch/Meilisearch: Overkill for personal blog scale.
- Client-side search (Fuse.js): Requires loading all content client-side.

**Key implementation notes**:
- Search query splits into words, matches against title and content
- Results ordered by publish date (newest first)
- Paginated with same page size as article listing (10)
- Future: if scale grows, migrate to PostgreSQL full-text search extension
  via Prisma (when supported without raw SQL)

## R7: Slug Generation

**Decision**: Auto-generate URL-safe slugs from article title using `slugify`
library, with manual override capability

**Rationale**: Consistent, SEO-friendly URLs. The `slugify` package handles
Unicode (including Chinese characters via transliteration), special characters,
and edge cases.

**Alternatives considered**:
- Custom regex replacement: Error-prone for international characters.
- Nanoid-based slugs: Not human-readable or SEO-friendly.

**Key implementation notes**:
- Generate slug on article creation from title
- Allow author to override in the article form
- Enforce uniqueness at database level (unique constraint on `slug`)
- On conflict, append numeric suffix (e.g., `my-post-2`)

## R8: Email Service for Password Reset

**Decision**: Use Resend as the email service provider

**Rationale**: Resend offers a simple API, generous free tier (100 emails/day),
first-class Next.js/Vercel integration, and requires minimal configuration.
Suitable for low-volume transactional emails (password reset).

**Alternatives considered**:
- Nodemailer + SMTP: Requires SMTP server setup, more configuration.
- SendGrid: More complex setup, heavier SDK.
- AWS SES: Requires AWS account and configuration.

**Key implementation notes**:
- Single email template for password reset
- Token-based reset: generate crypto-random token, store hashed in DB
  with expiry (1 hour)
- Environment variables: `RESEND_API_KEY`, `EMAIL_FROM`
