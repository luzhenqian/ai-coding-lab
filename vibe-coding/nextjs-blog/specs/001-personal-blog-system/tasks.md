---

description: "Task list for Personal Blog System implementation"
---

# Tasks: Personal Blog System

**Input**: Design documents from `/specs/001-personal-blog-system/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in the feature specification. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Project initialization, tooling, and base configuration

- [x] T001 Initialize Next.js 16 project with TypeScript strict mode, Tailwind CSS, and ESLint + Prettier in `vibe-coding/nextjs-blog/`
- [x] T002 [P] Configure `tsconfig.json` with `"strict": true` and path aliases (`@/` for root)
- [x] T003 [P] Install and configure Prisma with PostgreSQL provider in `prisma/schema.prisma`
- [x] T004 [P] Install core dependencies: `next-auth@5`, `bcryptjs`, `zod`, `slugify`, `react-markdown`, `remark-gfm`, `rehype-sanitize`, `rehype-highlight`, `@uiw/react-md-editor`, `resend`
- [x] T005 [P] Create `.env.example` with all required environment variables (DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, RESEND_API_KEY, EMAIL_FROM, ADMIN_EMAIL, ADMIN_PASSWORD)
- [x] T006 [P] Create root layout in `app/layout.tsx` with Tailwind globals, metadata, and session provider
- [x] T007 [P] Create Prisma client singleton in `lib/prisma.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, authentication, and middleware that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Define full Prisma schema in `prisma/schema.prisma` with models: User (id, name, email, passwordHash, image, role enum, emailVerified, timestamps), Account (NextAuth adapter), Session (NextAuth adapter), Article (id, title, slug unique, content, summary, coverImage, status enum, viewCount, seoTitle, seoDescription, seoImage, publishedAt, deletedAt, timestamps, authorId FK, categoryId FK), Category (id, name unique, slug unique, timestamps), Tag (id, name unique, slug unique, timestamps), ArticleTag (articleId + tagId composite PK), Comment (id, content, createdAt, articleId FK, userId FK), PasswordResetToken (id, token unique, expiresAt, userId FK, createdAt). Add indexes per data-model.md.
- [x] T009 Generate and run initial Prisma migration with `npx prisma migrate dev --name init`
- [x] T010 Create database seed script in `prisma/seed.ts` that creates admin user (from env vars), default "General" category, and sample tags ("JavaScript", "TypeScript", "React", "Next.js"). Configure seed command in `package.json`.
- [x] T011 Configure NextAuth.js v5 in `lib/auth.ts` with GitHub provider, Credentials provider (email/password with bcrypt verify), Prisma adapter, JWT strategy, and session callback extending JWT with `role` and `id` fields
- [x] T012 [P] Create Zod validation schemas: `lib/validations/auth.ts` (register: name+email+password min 8, login: email+password, resetRequest: email, resetConfirm: token+password), `lib/validations/article.ts` (create/update: title max 200, content required, slug optional, summary max 500, categoryId required, tagIds array, status enum, SEO fields optional), `lib/validations/comment.ts` (create: articleId+content max 2000), `lib/validations/category.ts` (create/update: name required)
- [x] T013 [P] Create slug generation utility in `lib/slug.ts` with `generateSlug(title: string): string` using `slugify` library, and `ensureUniqueSlug(slug: string, existingId?: string): Promise<string>` that appends numeric suffix on conflict by querying Prisma
- [x] T014 [P] Create HTML sanitization utility in `lib/sanitize.ts` wrapping `rehype-sanitize` for server-side Markdown sanitization
- [x] T015 [P] Create storage abstraction in `lib/storage/index.ts` (interface `StorageProvider` with `upload(file: File): Promise<string>`, `delete(key: string): Promise<void>`, `getUrl(key: string): string`) and local implementation in `lib/storage/local.ts` writing to `public/uploads/` with UUID filenames. Validate file type (JPEG/PNG/WebP/GIF) and size (≤5MB).
- [x] T016 Create auth API route handler for registration in `app/api/auth/register/route.ts`: validate with Zod, check email uniqueness, hash password with bcrypt, create user with READER role, return user object. Errors: 400 validation, 409 email exists.
- [x] T017 Create NextAuth catch-all route in `app/api/auth/[...nextauth]/route.ts` exporting GET and POST handlers from the auth config

**Checkpoint**: Database ready, auth working (register + login + GitHub OAuth), all shared utilities available

---

## Phase 3: User Story 1 - Reader Browses and Reads Articles (Priority: P1) 🎯 MVP

**Goal**: Public-facing blog with homepage, article detail, tag/category filtering, search, and view counting

**Independent Test**: Visit homepage → see paginated articles. Click article → see rendered Markdown with metadata. Filter by tag/category. Search by keyword. View count increments once per session.

### Implementation for User Story 1

- [x] T018 [US1] Create article list API in `app/api/posts/route.ts` GET handler: query published, non-deleted articles with pagination (page, pageSize params), optional filters (tag slug, category slug, search keyword via Prisma `contains` insensitive on title+content), include author (name, image), category (name, slug), tags (name, slug), order by publishedAt desc. Return `{ data, pagination: { page, pageSize, total, totalPages } }`.
- [x] T019 [P] [US1] Create article detail API in `app/api/posts/[id]/route.ts` GET handler: fetch article by ID (or slug via query param), include author, category, tags, comments with user info. Return 404 if not found or deleted. Published articles are public; draft/archived require author or admin auth.
- [x] T020 [P] [US1] Create view count API in `app/api/posts/[id]/views/route.ts` POST handler: read `viewed_posts` cookie (JSON array of article IDs), if article ID not in array, increment `viewCount` via Prisma, add ID to cookie array, set HttpOnly session cookie. Return `{ viewCount }`.
- [x] T021 [P] [US1] Create `ArticleCard` component in `components/blog/ArticleCard.tsx`: display title, summary, cover image, author name, publish date, category badge, tag list, view count. Link to `/posts/[slug]`.
- [x] T022 [P] [US1] Create `Pagination` component in `components/ui/Pagination.tsx`: previous/next buttons, page numbers, current page highlight. Accept `page`, `totalPages`, `onPageChange` props.
- [x] T023 [P] [US1] Create `TagList` component in `components/blog/TagList.tsx`: render list of tag badges as links to `/tags/[slug]`.
- [x] T024 [P] [US1] Create `SearchBar` component in `components/ui/SearchBar.tsx`: text input with debounce (300ms), navigates to `/search?q=query` on submit. Create `useDebounce` hook in `hooks/useDebounce.ts`.
- [x] T025 [US1] Create `MarkdownRenderer` component in `components/blog/MarkdownRenderer.tsx`: render Markdown string to HTML using `react-markdown` with `remark-gfm`, `rehype-sanitize`, `rehype-highlight` plugins. Handle code blocks with syntax highlighting.
- [x] T026 [US1] Create homepage in `app/(public)/page.tsx`: server component fetching paginated published articles, rendering `ArticleCard` list with `Pagination`. Add `SearchBar` and category/tag sidebar. Set `export const revalidate = 60` for ISR.
- [x] T027 [US1] Create article detail page in `app/(public)/posts/[slug]/page.tsx`: server component fetching article by slug, rendering `MarkdownRenderer` for content, showing author info, publish date, `TagList`, category link, view count. Call view increment API client-side on mount. Generate SEO metadata from article's seoTitle/seoDescription/seoImage fields via `generateMetadata`. Set ISR with `revalidate = 60`.
- [x] T028 [P] [US1] Create tag filter page in `app/(public)/tags/[slug]/page.tsx`: server component listing articles filtered by tag slug with pagination. Show tag name as heading. ISR with `revalidate = 60`.
- [x] T029 [P] [US1] Create category filter page in `app/(public)/categories/[slug]/page.tsx`: server component listing articles filtered by category slug with pagination. Show category name as heading. ISR with `revalidate = 60`.
- [x] T030 [US1] Create search results page in `app/(public)/search/page.tsx`: read `q` param from searchParams, fetch matching articles from API, render with `ArticleCard` list and `Pagination`. Show "No results" empty state.
- [x] T031 [US1] Create About page in `app/(public)/about/page.tsx`: static page with hardcoded or MDX content about the blog/author.

**Checkpoint**: Full public blog experience functional — browse, read, filter, search, view counts working

---

## Phase 4: User Story 2 - Author Creates and Manages Articles (Priority: P1)

**Goal**: Authors can create, edit, publish, archive, and soft-delete their own articles via admin panel with Markdown editor

**Independent Test**: Log in as author → create article with Markdown editor → save as draft → publish → verify on homepage → edit → soft-delete → verify removed from public

### Implementation for User Story 2

- [x] T032 [US2] Create admin layout in `app/admin/layout.tsx`: check session, redirect to login if unauthenticated, deny access if role is READER (show 403). Include admin sidebar navigation (Dashboard, Posts, Categories, Tags, Users).
- [x] T033 [P] [US2] Create `MarkdownEditor` component in `components/admin/MarkdownEditor.tsx`: wrap `@uiw/react-md-editor` with dynamic import (`ssr: false`), expose `value` and `onChange` props. Include split-pane preview mode.
- [x] T034 [P] [US2] Create `ArticleForm` component in `components/admin/ArticleForm.tsx`: form with fields for title, slug (auto-generated with manual override), content (using `MarkdownEditor`), summary, cover image URL (or upload widget), category select dropdown, tag multi-select, status radio (draft/published/archived), SEO fields (seoTitle, seoDescription, seoImage). Client-side Zod validation before submit.
- [x] T035 [US2] Create article POST handler in `app/api/posts/route.ts`: validate with Zod, verify auth (author/admin), auto-generate slug if not provided via `lib/slug.ts`, ensure slug uniqueness, set `publishedAt` if status is PUBLISHED, create article with tag connections via Prisma. Return 201 with article. Call `revalidatePath` for homepage and article page.
- [x] T036 [US2] Create article PUT handler in `app/api/posts/[id]/route.ts`: validate with Zod, verify auth (own article or admin), check slug uniqueness if changed, update article and tag connections via Prisma, set/clear `publishedAt` on status transitions. Call `revalidatePath` for affected pages.
- [x] T037 [US2] Create article DELETE handler in `app/api/posts/[id]/route.ts`: verify auth (own article or admin), set `deletedAt` timestamp (soft delete), do NOT hard delete. Call `revalidatePath`. Return success message.
- [x] T038 [US2] Create "New Article" page in `app/admin/posts/new/page.tsx`: render `ArticleForm` in create mode, submit to POST `/api/posts`, redirect to article list on success.
- [x] T039 [US2] Create "Edit Article" page in `app/admin/posts/[id]/edit/page.tsx`: fetch article by ID (only if own article or admin), render `ArticleForm` pre-filled, submit to PUT `/api/posts/[id]`, redirect to article list on success. Show 404 if not found.
- [x] T040 [US2] Create article list management page in `app/admin/posts/page.tsx`: fetch author's own articles (or all for admin) including drafts and archived (exclude soft-deleted for authors), display in `DataTable` with columns: title, status badge, category, publish date, view count, actions (edit, delete, status toggle). Add "New Article" button.
- [x] T041 [P] [US2] Create `DataTable` component in `components/admin/DataTable.tsx`: generic reusable table with columns config, row rendering, and action buttons. Support responsive layout (card view on mobile).

**Checkpoint**: Authors can create, edit, publish, and soft-delete articles through the admin panel

---

## Phase 5: User Story 3 - User Registers and Authenticates (Priority: P1)

**Goal**: Full auth flow with login, registration, GitHub OAuth, password reset, and role-based access

**Independent Test**: Register with email/password → login → verify reader role. Sign in with GitHub → verify account. Request password reset → use link → login with new password. Verify role restrictions.

### Implementation for User Story 3

- [x] T042 [US3] Create login page in `app/(auth)/login/page.tsx`: form with email/password fields, "Sign in with GitHub" button (NextAuth `signIn('github')`), "Forgot password?" link, "Register" link. Handle errors (invalid credentials, etc.).
- [x] T043 [P] [US3] Create `LoginForm` component in `components/auth/LoginForm.tsx`: email + password inputs with client-side Zod validation, submit via NextAuth `signIn('credentials')`, display error messages, loading state.
- [x] T044 [P] [US3] Create `RegisterForm` component in `components/auth/RegisterForm.tsx`: name + email + password inputs with client-side Zod validation (min 8 chars), submit to POST `/api/auth/register`, auto-login on success via `signIn('credentials')`, display errors (email exists, validation).
- [x] T045 [US3] Create registration page in `app/(auth)/register/page.tsx`: render `RegisterForm`, link to login page.
- [x] T046 [US3] Create password reset request API in `app/api/auth/reset-password/request/route.ts`: validate email with Zod, look up user, generate crypto-random token, hash it, store `PasswordResetToken` with 1-hour expiry in DB, send reset link via Resend email. Always return 200 (prevent email enumeration).
- [x] T047 [US3] Create password reset confirm API in `app/api/auth/reset-password/confirm/route.ts`: validate token + new password with Zod, find unexpired `PasswordResetToken` matching hash, update user's `passwordHash` with bcrypt, delete the token. Return 400 for invalid/expired tokens.
- [x] T048 [US3] Create password reset page in `app/(auth)/reset-password/page.tsx`: two views — (1) request form (email input, submit to request API, show success message) and (2) reset form (shown when `?token=` param present, new password input, submit to confirm API, redirect to login on success).
- [x] T049 [US3] Create `AuthGuard` component in `components/auth/AuthGuard.tsx`: wrapper that checks session and role, redirects to login if unauthenticated, shows 403 if role insufficient. Used in admin layout.
- [x] T050 [US3] Create `useAuth` hook in `hooks/useAuth.ts`: wraps NextAuth `useSession`, provides typed user object with `id`, `role`, `name`, `email`, `image` fields, and `isAdmin`, `isAuthor`, `isReader` boolean helpers.

**Checkpoint**: Full auth flow working — register, login, GitHub OAuth, password reset, role-based access enforced

---

## Phase 6: User Story 4 - Reader Comments on Articles (Priority: P2)

**Goal**: Logged-in users can post comments on articles; authors and admins can moderate

**Independent Test**: Log in as reader → navigate to article → submit comment → verify it appears. Log in as author → delete comment on own article. Log in as admin → delete any comment.

### Implementation for User Story 4

- [x] T051 [US4] Create comment POST API in `app/api/comments/route.ts`: validate with Zod (articleId, content max 2000), verify auth (any logged-in user), verify article exists and is published, create comment linked to article and user. Return 201.
- [x] T052 [US4] Create comment DELETE API in `app/api/comments/[id]/route.ts`: verify auth, check permission (article author for own article's comments, or admin for any), hard delete comment. Return 200 or 403.
- [x] T053 [US4] Create comments list API in `app/api/posts/[postId]/comments/route.ts` GET handler: fetch comments for article ordered by createdAt asc, include user (name, image). Return `{ data }`.
- [x] T054 [US4] Create `CommentSection` component in `components/blog/CommentSection.tsx`: fetch and display comments chronologically with user avatar, name, timestamp. Show comment form (textarea + submit) for logged-in users, "Login to comment" prompt for guests. Show delete button for article author's comments (if current user is the article author) and for admins. Handle optimistic updates on submit/delete.
- [x] T055 [US4] Integrate `CommentSection` into article detail page `app/(public)/posts/[slug]/page.tsx`: add below article content, pass article ID and author ID.

**Checkpoint**: Comments working — create, display, moderate (author + admin)

---

## Phase 7: User Story 5 - Admin Manages Content and Users (Priority: P2)

**Goal**: Admin dashboard with stats, category/tag CRUD, user role management, soft-deleted article recovery

**Independent Test**: Log in as admin → dashboard shows stats → create/edit/delete category → create/delete tag (blocked if in use) → change user role → restore soft-deleted article.

### Implementation for User Story 5

- [x] T056 [US5] Create dashboard stats API in `app/api/admin/stats/route.ts`: verify admin auth, query Prisma for total published article count, total view count sum, total user count, total comment count. Return `{ articles, views, users, comments }`.
- [x] T057 [US5] Create admin dashboard page in `app/admin/page.tsx`: fetch stats from API, render `StatsCard` components for each metric. Show recent articles list.
- [x] T058 [P] [US5] Create `StatsCard` component in `components/admin/StatsCard.tsx`: display label, value, and optional icon. Responsive grid layout.
- [x] T059 [US5] Create category API routes in `app/api/categories/route.ts` (GET list with article counts, POST create — admin only, auto-generate slug) and `app/api/categories/[id]/route.ts` (PUT update — admin only, DELETE — admin only, reject if articles assigned).
- [x] T060 [US5] Create category management page in `app/admin/categories/page.tsx`: list categories in `DataTable` with name, slug, article count, edit/delete actions. Inline create form or modal. Show error on delete when articles exist.
- [x] T061 [US5] Create tag API routes in `app/api/tags/route.ts` (GET list with article counts, POST create — admin only, auto-generate slug) and `app/api/tags/[id]/route.ts` (PUT update — admin only, DELETE — admin only, reject if articles assigned per FR-010).
- [x] T062 [US5] Create tag management page in `app/admin/tags/page.tsx`: list tags in `DataTable` with name, slug, article count, edit/delete actions. Show error on delete when tag is in use.
- [x] T063 [US5] Create user API routes in `app/api/users/route.ts` (GET list — admin only) and `app/api/users/[id]/route.ts` (PUT update role — admin only, validate role enum).
- [x] T064 [US5] Create user management page in `app/admin/users/page.tsx`: list users in `DataTable` with name, email, role badge, created date. Role dropdown to change role (READER/AUTHOR/ADMIN). Admin only.
- [x] T065 [US5] Create article restore API in `app/api/posts/[id]/restore/route.ts` POST handler: verify admin auth, find soft-deleted article, clear `deletedAt`, return restored article. Call `revalidatePath`.
- [x] T066 [US5] Add "Deleted Articles" view to admin article list `app/admin/posts/page.tsx`: admin-only tab/filter showing soft-deleted articles with restore action button.

**Checkpoint**: Full admin panel — dashboard stats, category/tag CRUD with protection, user management, article recovery

---

## Phase 8: User Story 6 - Author Uploads Images (Priority: P3)

**Goal**: Image upload during article editing with local storage and cloud-ready abstraction

**Independent Test**: In article editor → upload image → see preview → publish → verify image renders on public page.

### Implementation for User Story 6

- [x] T067 [US6] Create upload API in `app/api/upload/route.ts` POST handler: verify auth (author/admin), parse multipart form data, validate file type (JPEG/PNG/WebP/GIF) and size (≤5MB) with Zod, call `StorageProvider.upload()`, return `{ url }`. Return 400 for invalid files.
- [x] T068 [US6] Create `ImageUpload` component in `components/ui/ImageUpload.tsx`: drag-and-drop zone + file picker, client-side file type/size preview validation, upload to `/api/upload` with progress indicator, return URL on success. Display uploaded image preview.
- [x] T069 [US6] Integrate `ImageUpload` into `ArticleForm` (`components/admin/ArticleForm.tsx`): add upload widget for cover image field, add toolbar button in `MarkdownEditor` to insert uploaded image as Markdown `![alt](url)`.
- [x] T070 [US6] Create `public/uploads/` directory with `.gitkeep`, add `public/uploads/*` (except `.gitkeep`) to `.gitignore`

**Checkpoint**: Image upload working — upload in editor, preview, render on public page

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Responsive design, performance, error states, and final cleanup

- [x] T071 [P] Create responsive navigation header in `components/ui/Header.tsx`: logo/site name, nav links (Home, Tags, Categories, About), search bar, auth buttons (Login/Register or user menu with avatar + logout). Mobile hamburger menu.
- [x] T072 [P] Create footer component in `components/ui/Footer.tsx`: copyright, social links, responsive layout.
- [x] T073 Add responsive Tailwind styling across all public pages: article cards grid (1 col mobile, 2 col tablet, 3 col desktop), article detail max-width prose, admin sidebar collapsible on mobile.
- [x] T074 [P] Add loading states: skeleton loaders for article list, article detail, and admin tables using React Suspense boundaries and `loading.tsx` files.
- [x] T075 [P] Add error handling pages: `app/not-found.tsx` (404), `app/error.tsx` (500), `app/admin/error.tsx` (admin errors). Consistent error UI.
- [x] T076 [P] Add empty states: "No articles yet" on homepage, "No results found" on search, "No comments yet" on article detail.
- [x] T077 Configure ISR revalidation calls in all article/category/tag mutation API handlers: call `revalidatePath('/')`, `revalidatePath('/posts/[slug]')`, `revalidatePath('/tags/[slug]')`, `revalidatePath('/categories/[slug]')` as appropriate after create/update/delete operations.
- [x] T078 Add global error response middleware: create utility in `lib/api-response.ts` with `successResponse(data, status)` and `errorResponse(error, status, details?)` helpers matching constitution error shape `{ error: string, details?: unknown }`. Refactor all Route Handlers to use these helpers.
- [x] T079 Run `npx prisma migrate dev` final validation, run `npm run build` to verify production build succeeds, run `npm run lint` to verify ESLint passes.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Story 1 (Phase 3, P1)**: Depends on Foundational
- **User Story 2 (Phase 4, P1)**: Depends on Foundational (and partially on US1 components: ArticleCard, Pagination)
- **User Story 3 (Phase 5, P1)**: Depends on Foundational (auth config from T011, T016, T017)
- **User Story 4 (Phase 6, P2)**: Depends on US1 (article detail page) and US3 (auth)
- **User Story 5 (Phase 7, P2)**: Depends on US2 (admin layout) and US3 (admin auth)
- **User Story 6 (Phase 8, P3)**: Depends on US2 (article form and editor)
- **Polish (Phase 9)**: Depends on all user stories being complete

### Recommended Execution Order

```text
Phase 1 → Phase 2 → Phase 3 (US1) + Phase 5 (US3) in parallel
                   → Phase 4 (US2) after US3 auth is ready
                   → Phase 6 (US4) after US1 + US3
                   → Phase 7 (US5) after US2 + US3
                   → Phase 8 (US6) after US2
                   → Phase 9
```

### Within Each User Story

- Models/schema before services
- API routes before pages
- Components before page integration
- Core implementation before edge cases

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002–T007)
- Foundational utilities T012–T015 can run in parallel
- Within US1: T019–T024 can run in parallel (independent components/APIs)
- Within US2: T033, T034, T041 can run in parallel
- Within US3: T043, T044 can run in parallel
- Within US5: T058 parallel with other tasks
- Polish: T071, T072, T074, T075, T076 all parallel

---

## Implementation Strategy

### MVP First (User Story 1 + 3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 5: User Story 3 (Auth — needed for seeded admin to create content)
4. Complete Phase 3: User Story 1 (Public reading experience)
5. **STOP and VALIDATE**: Seed articles via Prisma Studio, test public reading flow
6. Deploy MVP if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US3 (Auth) → Register, login, GitHub OAuth working
3. Add US1 (Reader) → Public blog functional → Deploy (MVP!)
4. Add US2 (Author) → Content creation → Deploy
5. Add US4 (Comments) → Engagement → Deploy
6. Add US5 (Admin) → Full management → Deploy
7. Add US6 (Upload) → Image support → Deploy
8. Polish → Final quality pass → Deploy

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Soft delete (FR-021) applies to articles only; comments are hard deleted
- All API Route Handlers must follow constitution error shape: `{ error: string, details?: unknown }`
- ISR revalidation must be called in all mutation handlers (T077 ensures this)
