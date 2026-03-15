# Feature Specification: Personal Blog System

**Feature Branch**: `001-personal-blog-system`
**Created**: 2026-03-14
**Status**: Draft
**Input**: User description: "构建一个功能完整的个人博客系统"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reader Browses and Reads Articles (Priority: P1)

A visitor arrives at the blog homepage and sees a paginated list of the
latest published articles. They can click into an article to read the full
Markdown-rendered content, see the author's name, publish date, tags, and
view count. They can also filter articles by tag or category, and search
by keyword.

**Why this priority**: Reading is the core value proposition of a blog.
Without a functional public-facing reading experience, no other feature
matters.

**Independent Test**: Navigate to the homepage, verify articles appear
with pagination. Click an article, verify rendered content, metadata, and
view count increment. Filter by tag and category, verify correct results.

**Acceptance Scenarios**:

1. **Given** published articles exist, **When** a visitor opens the homepage,
   **Then** they see the latest articles sorted by publish date with pagination
2. **Given** an article with Markdown content, **When** a visitor opens the
   article detail page, **Then** the Markdown is rendered as HTML with author
   info, publish date, tags, and view count
3. **Given** articles tagged with "JavaScript", **When** a visitor clicks the
   "JavaScript" tag, **Then** only articles with that tag are displayed
4. **Given** articles in category "Tutorial", **When** a visitor navigates to
   that category page, **Then** only articles in that category are shown
5. **Given** the search input, **When** a visitor types "React hooks",
   **Then** articles matching the keyword in title or content are returned

---

### User Story 2 - Author Creates and Manages Articles (Priority: P1)

An author logs in (via GitHub OAuth or email/password), accesses the admin
panel, and creates a new article using a Markdown editor with live preview.
They set the title, summary, cover image, category, tags, and SEO metadata.
They can save as draft, publish, or archive. They can edit or delete their
own articles from the article management list.

**Why this priority**: Content creation is equally critical — without authors
producing articles, there is nothing for readers to consume.

**Independent Test**: Log in as an author, create an article with all fields,
save as draft, then publish. Verify it appears on the public homepage.
Edit the article, verify changes persist. Delete it, verify removal.

**Acceptance Scenarios**:

1. **Given** a logged-in author, **When** they open the article editor,
   **Then** they see a Markdown editor with real-time preview
2. **Given** an article in draft, **When** the author clicks "Publish",
   **Then** the article status changes to published and it appears on the
   public site
3. **Given** an author's published article, **When** the author edits it,
   **Then** changes are saved and reflected on the public detail page
4. **Given** an author's article, **When** they delete it, **Then** it is
   soft-deleted (hidden from the public site and the author's list, but
   recoverable by an admin)
5. **Given** the article editor, **When** the author fills in SEO fields
   (title, description, og:image), **Then** the article detail page renders
   correct meta tags

---

### User Story 3 - User Registers and Authenticates (Priority: P1)

A new user registers via email/password or signs in with GitHub OAuth.
Upon first login, they are assigned the "reader" role. The system supports
three roles: admin, author, and reader, each with distinct permissions.

**Why this priority**: Authentication underpins both the author workflow
(Story 2) and the admin workflow (Story 5). Without auth, neither can
function.

**Independent Test**: Register with email/password, verify login works.
Sign in with GitHub, verify account is created. Verify role-based access:
reader cannot access admin panel, author can only manage own articles.

**Acceptance Scenarios**:

1. **Given** the registration form, **When** a user submits valid email and
   password, **Then** an account is created with "reader" role and they are
   logged in
2. **Given** the login page, **When** a user clicks "Sign in with GitHub",
   **Then** they are redirected through OAuth flow and logged in
3. **Given** a logged-in reader, **When** they attempt to access the article
   editor, **Then** they are denied access
4. **Given** a logged-in author, **When** they attempt to delete another
   author's article, **Then** they are denied access
5. **Given** a user who forgot their password, **When** they request a
   password reset, **Then** a reset link is sent to their registered email
6. **Given** a valid reset link, **When** the user submits a new password,
   **Then** their password is updated and they can log in with it

---

### User Story 4 - Reader Comments on Articles (Priority: P2)

A logged-in reader can leave comments on published articles. Comments
appear below the article content in chronological order.

**Why this priority**: Comments add engagement but are not essential to the
core read/write loop. The blog is fully functional without them.

**Independent Test**: Log in as a reader, navigate to an article, submit a
comment, verify it appears below the article.

**Acceptance Scenarios**:

1. **Given** a published article and a logged-in reader, **When** they submit
   a comment, **Then** the comment appears below the article
2. **Given** an article with comments, **When** a visitor views the article,
   **Then** all comments are displayed in chronological order
3. **Given** a non-logged-in visitor, **When** they attempt to comment,
   **Then** they are prompted to log in
4. **Given** a comment on an author's article, **When** the author deletes
   it, **Then** the comment is removed from the article
5. **Given** any comment, **When** an admin deletes it, **Then** the comment
   is removed

---

### User Story 5 - Admin Manages Content and Users (Priority: P2)

An admin accesses the dashboard to see statistics (total articles, total
views). They manage all articles (any author), categories, and tags. They
can promote users to author role. Tags that are in use cannot be deleted.

**Why this priority**: Admin tools are needed for ongoing operations but
the blog can launch with a single admin/author managing content through
the author interface.

**Independent Test**: Log in as admin, verify dashboard shows correct stats.
Create/edit/delete a category. Attempt to delete a tag in use, verify
rejection. Change a user's role, verify new permissions take effect.

**Acceptance Scenarios**:

1. **Given** an admin on the dashboard, **When** they view statistics,
   **Then** they see total article count and total view count
2. **Given** the category management page, **When** an admin creates a new
   category, **Then** it becomes available for article assignment
3. **Given** a tag assigned to articles, **When** an admin attempts to delete
   it, **Then** the system rejects the deletion with an explanation
4. **Given** a user with "reader" role, **When** an admin promotes them to
   "author", **Then** the user gains access to the article editor

---

### User Story 6 - Author Uploads Images (Priority: P3)

An author can upload images while editing an article. Images are stored
locally with the system designed to support cloud storage in the future.
Uploaded images can be inserted into Markdown content.

**Why this priority**: Articles can function with external image URLs;
built-in upload is a convenience enhancement.

**Independent Test**: In the article editor, upload an image, verify it
appears in preview. Publish the article, verify the image renders on the
public page.

**Acceptance Scenarios**:

1. **Given** the article editor, **When** an author uploads an image,
   **Then** the image is stored and a URL is returned for Markdown insertion
2. **Given** an uploaded image in article content, **When** a visitor views
   the article, **Then** the image renders correctly

---

### Edge Cases

- What happens when a user registers with an email already linked to a
  GitHub OAuth account? Accounts are linked automatically by email address.
- What happens when an article's only category is deleted? The category
  cannot be deleted while articles are assigned to it.
- What happens when the view count is incremented by bots or repeated
  refreshes? View count increments once per unique visitor per article
  per session (cookie-based deduplication).
- What happens when Markdown content contains malicious HTML/scripts?
  All user-generated HTML is sanitized before rendering.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support user registration via email/password with
  validation (valid email format, minimum 8-character password)
- **FR-002**: System MUST support GitHub OAuth sign-in and automatic account
  linking by email
- **FR-019**: System MUST support email-based password reset via a
  time-limited reset link sent to the user's registered email address
- **FR-003**: System MUST enforce three roles (admin, author, reader) with
  distinct permission boundaries
- **FR-004**: System MUST provide a Markdown editor with real-time preview
  for article creation and editing
- **FR-005**: Articles MUST support title, content (Markdown), summary,
  cover image URL, category (single), tags (multiple), status
  (draft/published/archived), and a URL slug auto-generated from the title
  that authors can manually override. Slugs MUST be unique. Category
  assignment is mandatory — every article MUST belong to exactly one
  category.
- **FR-006**: System MUST support article SEO metadata: custom title,
  description, and og:image per article
- **FR-007**: System MUST render the public homepage with paginated articles
  sorted by publish date (newest first)
- **FR-008**: System MUST support filtering articles by tag, by category,
  and by keyword search (matching title and content)
- **FR-009**: System MUST track and display per-article view counts with
  basic deduplication (one count per visitor per session)
- **FR-010**: System MUST provide CRUD operations for categories and tags,
  with deletion protection for tags currently assigned to articles
- **FR-011**: System MUST provide an admin dashboard displaying total
  article count and total view count
- **FR-012**: Authors MUST only manage (edit/delete) their own articles;
  admins can manage all articles
- **FR-021**: Article deletion MUST be a soft delete (hidden from all
  public and author views but retained in the database). Admins MUST be
  able to view and restore soft-deleted articles.
- **FR-013**: System MUST allow logged-in users to post comments on
  published articles
- **FR-020**: Authors MUST be able to delete comments on their own articles;
  admins MUST be able to delete any comment on any article
- **FR-014**: System MUST support image upload during article editing with
  local storage and an abstraction layer for future cloud storage
- **FR-015**: System MUST use ISR for the homepage and article detail pages
  to optimize performance
- **FR-016**: System MUST provide a responsive layout adapting to mobile
  and desktop viewports
- **FR-017**: System MUST sanitize all user-generated Markdown/HTML to
  prevent XSS attacks
- **FR-018**: System MUST provide an "About" static page

### Key Entities

- **User**: Represents a registered user with name, email, avatar, role
  (admin/author/reader), and authentication credentials
- **Article**: A blog post with title, slug (unique, URL-safe, auto-generated
  from title with manual override), Markdown content, summary, cover image,
  status, view count, SEO metadata, belonging to one category and one
  author, associated with multiple tags
- **Category**: A classification label for articles (one-to-many with
  articles)
- **Tag**: A keyword label for articles (many-to-many with articles)
- **Comment**: User-generated text associated with one article and one
  user, timestamped

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Visitors can find and read any published article within 3
  clicks from the homepage
- **SC-002**: Authors can create and publish a new article (including
  Markdown editing, tagging, and categorization) in under 5 minutes
- **SC-003**: Homepage and article detail pages load in under 2 seconds
  on a standard broadband connection
- **SC-004**: The system correctly enforces role-based access — 100% of
  unauthorized actions are blocked
- **SC-005**: All pages render correctly on viewports from 375px (mobile)
  to 1920px (desktop) without horizontal scrolling
- **SC-006**: Article search returns relevant results for keyword queries
  with at least 90% precision
- **SC-007**: The system handles 100 concurrent readers without performance
  degradation
- **SC-008**: View count deduplication prevents the same visitor from
  inflating counts on repeated page loads within a session

## Clarifications

### Session 2026-03-14

- Q: Password reset mechanism for email/password users? → A: Email-based password reset via time-limited reset link
- Q: Who can moderate (delete) comments? → A: Authors can delete comments on their own articles; admins can delete any comment
- Q: How are article URLs constructed? → A: Auto-generated slug from title, editable by author, must be unique
- Q: Is article deletion permanent or reversible? → A: Soft delete — hidden from all views but recoverable by admin
- Q: Is category assignment mandatory on articles? → A: Yes — every article must belong to exactly one category

## Assumptions

- New users registering via either method (email or GitHub OAuth) default
  to the "reader" role. Role promotion to "author" or "admin" is done
  manually by an admin.
- The initial admin account is seeded via a database seed script or
  environment variable configuration.
- Pagination uses a default page size of 10 articles.
- Article search is a simple keyword match (title and content); full-text
  search engine integration is out of scope for the initial version.
- Image upload size limit is 5MB per file, supporting JPEG, PNG, WebP, and
  GIF formats.
- Comments are flat (no threading/nesting) in the initial version.
- The "About" page content is editable only by modifying the source code
  or a static content file, not through the admin panel.
