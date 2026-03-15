# Data Model: Personal Blog System

**Feature**: 001-personal-blog-system
**Date**: 2026-03-14

## Entity Relationship Overview

```text
User 1──* Article *──1 Category
  │          │
  │          *──* Tag (via ArticleTag join)
  │          │
  └──1───* Comment *──1 Article

User 1──* PasswordResetToken
```

## Entities

### User

| Field         | Type     | Constraints                          |
|---------------|----------|--------------------------------------|
| id            | String   | PK, cuid                            |
| name          | String   | Required                             |
| email         | String   | Unique, required                     |
| passwordHash  | String?  | Nullable (GitHub OAuth users)        |
| image         | String?  | Avatar URL                           |
| role          | Enum     | ADMIN, AUTHOR, READER; default READER |
| emailVerified | DateTime?| For NextAuth compatibility            |
| createdAt     | DateTime | Auto-set                             |
| updatedAt     | DateTime | Auto-updated                         |

**Relations**: Has many Articles (as author), has many Comments,
has many Accounts (NextAuth), has many PasswordResetTokens

**Notes**:
- `passwordHash` is null for users who only sign in via GitHub OAuth
- NextAuth `Account` and `Session` models follow the NextAuth Prisma adapter
  schema and are not detailed here (standard NextAuth tables)
- Email is the linking key for OAuth account association (FR-002)

### Article

| Field          | Type     | Constraints                         |
|----------------|----------|-------------------------------------|
| id             | String   | PK, cuid                           |
| title          | String   | Required, max 200 chars             |
| slug           | String   | Unique, required, URL-safe          |
| content        | String   | Required, Markdown text             |
| summary        | String?  | Optional, max 500 chars             |
| coverImage     | String?  | URL to cover image                  |
| status         | Enum     | DRAFT, PUBLISHED, ARCHIVED; default DRAFT |
| viewCount      | Int      | Default 0                           |
| seoTitle       | String?  | Custom SEO title                    |
| seoDescription | String?  | Custom meta description             |
| seoImage       | String?  | Custom og:image URL                 |
| publishedAt    | DateTime?| Set when status → PUBLISHED         |
| deletedAt      | DateTime?| Soft delete timestamp (FR-021)      |
| createdAt      | DateTime | Auto-set                            |
| updatedAt      | DateTime | Auto-updated                        |
| authorId       | String   | FK → User.id, required              |
| categoryId     | String   | FK → Category.id, required          |

**Relations**: Belongs to one User (author), belongs to one Category,
has many Tags (via ArticleTag), has many Comments

**State transitions**:
- DRAFT → PUBLISHED (sets `publishedAt`)
- PUBLISHED → ARCHIVED
- PUBLISHED → DRAFT (clears `publishedAt`)
- ARCHIVED → DRAFT
- Any status → soft-deleted (sets `deletedAt`)
- Soft-deleted → restored by admin (clears `deletedAt`, status unchanged)

**Uniqueness**: `slug` must be unique across all articles (including
soft-deleted to prevent URL conflicts)

### Category

| Field     | Type     | Constraints         |
|-----------|----------|---------------------|
| id        | String   | PK, cuid           |
| name      | String   | Unique, required    |
| slug      | String   | Unique, required    |
| createdAt | DateTime | Auto-set            |
| updatedAt | DateTime | Auto-updated        |

**Relations**: Has many Articles

**Deletion rule**: Cannot be deleted while any articles (including
soft-deleted) reference it

### Tag

| Field     | Type     | Constraints         |
|-----------|----------|---------------------|
| id        | String   | PK, cuid           |
| name      | String   | Unique, required    |
| slug      | String   | Unique, required    |
| createdAt | DateTime | Auto-set            |
| updatedAt | DateTime | Auto-updated        |

**Relations**: Has many Articles (via ArticleTag)

**Deletion rule**: Cannot be deleted while any articles (including
soft-deleted) reference it (FR-010)

### ArticleTag (Join Table)

| Field     | Type   | Constraints          |
|-----------|--------|----------------------|
| articleId | String | FK → Article.id, PK  |
| tagId     | String | FK → Tag.id, PK      |

**Composite PK**: (articleId, tagId)

### Comment

| Field     | Type     | Constraints              |
|-----------|----------|--------------------------|
| id        | String   | PK, cuid                |
| content   | String   | Required, max 2000 chars |
| createdAt | DateTime | Auto-set                 |
| articleId | String   | FK → Article.id, required |
| userId    | String   | FK → User.id, required   |

**Relations**: Belongs to one Article, belongs to one User

**Deletion**: Hard delete (comments are not soft-deleted)

### PasswordResetToken

| Field     | Type     | Constraints              |
|-----------|----------|--------------------------|
| id        | String   | PK, cuid                |
| token     | String   | Unique, hashed           |
| expiresAt | DateTime | Required (1 hour TTL)    |
| userId    | String   | FK → User.id, required   |
| createdAt | DateTime | Auto-set                 |

**Relations**: Belongs to one User

**Lifecycle**: Created on reset request, consumed on password change,
expired tokens cleaned up periodically

## Indexes

| Table   | Columns                | Type   | Purpose                    |
|---------|------------------------|--------|----------------------------|
| Article | slug                   | Unique | URL lookup                 |
| Article | status, publishedAt    | Index  | Homepage listing (published, newest) |
| Article | authorId               | Index  | Author's articles query    |
| Article | categoryId             | Index  | Category filter            |
| Article | deletedAt              | Index  | Soft delete filter         |
| User    | email                  | Unique | Auth lookup                |
| Category| slug                   | Unique | URL lookup                 |
| Tag     | slug                   | Unique | URL lookup                 |

## Seed Data

- One admin user (email/password from env vars or hardcoded for dev)
- One default category: "General" (slug: "general")
- Sample tags: "JavaScript", "TypeScript", "React", "Next.js"
