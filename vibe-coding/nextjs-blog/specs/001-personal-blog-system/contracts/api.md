# API Contracts: Personal Blog System

**Feature**: 001-personal-blog-system
**Date**: 2026-03-14

All endpoints use JSON request/response bodies unless noted. Error responses
follow the constitution-mandated shape: `{ error: string, details?: unknown }`.

## Authentication

### POST /api/auth/[...nextauth]
Standard NextAuth.js handler. Supports:
- `GET /api/auth/signin` — Sign-in page
- `POST /api/auth/callback/credentials` — Email/password login
- `GET /api/auth/callback/github` — GitHub OAuth callback
- `GET /api/auth/session` — Current session
- `POST /api/auth/signout` — Sign out

### POST /api/auth/register
Register a new user with email/password.

**Request**:
```json
{
  "name": "string (required)",
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars)"
}
```

**Response 201**:
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "READER"
}
```

**Errors**: 400 (validation), 409 (email exists)

### POST /api/auth/reset-password/request
Request a password reset link.

**Request**:
```json
{ "email": "string (required)" }
```

**Response 200**:
```json
{ "message": "If the email exists, a reset link has been sent." }
```

**Notes**: Always returns 200 to prevent email enumeration.

### POST /api/auth/reset-password/confirm
Reset password with token.

**Request**:
```json
{
  "token": "string (required)",
  "password": "string (required, min 8 chars)"
}
```

**Response 200**:
```json
{ "message": "Password updated successfully." }
```

**Errors**: 400 (invalid/expired token)

---

## Articles

### GET /api/posts
List published articles (public, paginated).

**Query params**:
- `page` (int, default 1)
- `pageSize` (int, default 10, max 50)
- `tag` (string, filter by tag slug)
- `category` (string, filter by category slug)
- `search` (string, keyword search in title + content)

**Response 200**:
```json
{
  "data": [
    {
      "id": "string",
      "title": "string",
      "slug": "string",
      "summary": "string | null",
      "coverImage": "string | null",
      "status": "PUBLISHED",
      "viewCount": 0,
      "publishedAt": "ISO8601",
      "author": { "id": "string", "name": "string", "image": "string | null" },
      "category": { "id": "string", "name": "string", "slug": "string" },
      "tags": [{ "id": "string", "name": "string", "slug": "string" }]
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

### POST /api/posts
Create a new article. **Auth**: author, admin.

**Request**:
```json
{
  "title": "string (required)",
  "slug": "string (optional, auto-generated if omitted)",
  "content": "string (required, Markdown)",
  "summary": "string (optional)",
  "coverImage": "string (optional, URL)",
  "categoryId": "string (required)",
  "tagIds": ["string"],
  "status": "DRAFT | PUBLISHED (default DRAFT)",
  "seoTitle": "string (optional)",
  "seoDescription": "string (optional)",
  "seoImage": "string (optional)"
}
```

**Response 201**: Full article object

**Errors**: 400 (validation), 401 (not authenticated), 403 (not author/admin),
409 (slug conflict)

### GET /api/posts/[id]
Get single article by ID. **Auth**: author (own) or admin for drafts;
public for published.

**Response 200**: Full article object with content

### PUT /api/posts/[id]
Update article. **Auth**: author (own) or admin.

**Request**: Same fields as POST (all optional, partial update)

**Response 200**: Updated article object

**Errors**: 400, 401, 403, 404, 409 (slug conflict)

### DELETE /api/posts/[id]
Soft-delete article. **Auth**: author (own) or admin.

**Response 200**:
```json
{ "message": "Article deleted successfully." }
```

**Errors**: 401, 403, 404

### POST /api/posts/[id]/restore
Restore soft-deleted article. **Auth**: admin only.

**Response 200**: Restored article object

**Errors**: 401, 403, 404

### POST /api/posts/[id]/views
Increment view count (with cookie deduplication).

**Response 200**:
```json
{ "viewCount": 43 }
```

---

## Categories

### GET /api/categories
List all categories. **Auth**: public.

**Response 200**:
```json
{
  "data": [
    { "id": "string", "name": "string", "slug": "string", "_count": { "articles": 5 } }
  ]
}
```

### POST /api/categories
Create category. **Auth**: admin.

**Request**:
```json
{ "name": "string (required)" }
```

**Response 201**: Category object (slug auto-generated)

**Errors**: 400, 401, 403, 409 (name exists)

### PUT /api/categories/[id]
Update category. **Auth**: admin.

**Request**:
```json
{ "name": "string (required)" }
```

**Response 200**: Updated category object

### DELETE /api/categories/[id]
Delete category. **Auth**: admin.

**Response 200**: `{ "message": "Category deleted." }`

**Errors**: 400 (has articles assigned), 401, 403, 404

---

## Tags

### GET /api/tags
List all tags. **Auth**: public.

**Response 200**:
```json
{
  "data": [
    { "id": "string", "name": "string", "slug": "string", "_count": { "articles": 3 } }
  ]
}
```

### POST /api/tags
Create tag. **Auth**: admin.

**Request**: `{ "name": "string (required)" }`

**Response 201**: Tag object

### PUT /api/tags/[id]
Update tag. **Auth**: admin.

**Request**: `{ "name": "string (required)" }`

**Response 200**: Updated tag object

### DELETE /api/tags/[id]
Delete tag. **Auth**: admin. Fails if tag is assigned to any article.

**Response 200**: `{ "message": "Tag deleted." }`

**Errors**: 400 (in use), 401, 403, 404

---

## Comments

### GET /api/posts/[postId]/comments
List comments for an article. **Auth**: public.

**Response 200**:
```json
{
  "data": [
    {
      "id": "string",
      "content": "string",
      "createdAt": "ISO8601",
      "user": { "id": "string", "name": "string", "image": "string | null" }
    }
  ]
}
```

### POST /api/comments
Create comment. **Auth**: any logged-in user.

**Request**:
```json
{
  "articleId": "string (required)",
  "content": "string (required, max 2000 chars)"
}
```

**Response 201**: Comment object

**Errors**: 400, 401, 404 (article not found or not published)

### DELETE /api/comments/[id]
Delete comment. **Auth**: article author (own article's comments) or admin.

**Response 200**: `{ "message": "Comment deleted." }`

**Errors**: 401, 403, 404

---

## Upload

### POST /api/upload
Upload an image file. **Auth**: author, admin.

**Request**: `multipart/form-data` with field `file`

**Constraints**: Max 5MB, JPEG/PNG/WebP/GIF only

**Response 201**:
```json
{ "url": "/uploads/abc123.jpg" }
```

**Errors**: 400 (invalid file type/size), 401, 403

---

## Users (Admin)

### GET /api/users
List all users. **Auth**: admin.

**Response 200**:
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "READER | AUTHOR | ADMIN",
      "createdAt": "ISO8601"
    }
  ]
}
```

### PUT /api/users/[id]
Update user role. **Auth**: admin.

**Request**:
```json
{ "role": "READER | AUTHOR | ADMIN" }
```

**Response 200**: Updated user object

**Errors**: 400, 401, 403, 404
