# Quickstart: Personal Blog System

**Feature**: 001-personal-blog-system

## Prerequisites

- Node.js 20+
- PostgreSQL 15+ (local or cloud instance)
- GitHub OAuth App (for GitHub login)
- Resend account (for password reset emails, free tier sufficient)

## Setup

1. **Clone and install**:
   ```bash
   cd vibe-coding/nextjs-blog
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env.local
   ```

   Fill in `.env.local`:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/nextjs_blog"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

   # GitHub OAuth
   GITHUB_CLIENT_ID="your-github-app-client-id"
   GITHUB_CLIENT_SECRET="your-github-app-client-secret"

   # Email (Resend)
   RESEND_API_KEY="re_xxxxx"
   EMAIL_FROM="noreply@yourdomain.com"

   # Admin Seed
   ADMIN_EMAIL="admin@example.com"
   ADMIN_PASSWORD="your-admin-password"
   ```

3. **Initialize database**:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Verify Setup

1. **Homepage**: Visit `/` — should show empty article list with "No articles yet"
2. **Login**: Visit `/login` — should see email/password form and GitHub button
3. **Admin**: Log in with seed admin credentials → access `/admin` dashboard
4. **Create article**: From admin, create a test article → publish → verify
   it appears on homepage
5. **GitHub login**: Click "Sign in with GitHub" → complete OAuth flow →
   verify new user created with READER role

## Key Commands

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check
npm run format       # Prettier format
npm run test         # Run Vitest
npx prisma studio    # Visual database browser
npx prisma migrate dev  # Run pending migrations
npx prisma db seed   # Seed database
```

## Project URLs

| Page               | URL                           | Auth Required |
|--------------------|-------------------------------|---------------|
| Homepage           | `/`                           | No            |
| Article detail     | `/posts/[slug]`               | No            |
| Tag filter         | `/tags/[slug]`                | No            |
| Category filter    | `/categories/[slug]`          | No            |
| Search             | `/search?q=keyword`           | No            |
| About              | `/about`                      | No            |
| Login              | `/login`                      | No            |
| Register           | `/register`                   | No            |
| Admin Dashboard    | `/admin`                      | Admin/Author  |
| Article Management | `/admin/posts`                | Admin/Author  |
| New Article        | `/admin/posts/new`            | Admin/Author  |
| Edit Article       | `/admin/posts/[id]/edit`      | Admin/Author  |
| Category Mgmt      | `/admin/categories`           | Admin         |
| Tag Management     | `/admin/tags`                 | Admin         |
| User Management    | `/admin/users`                | Admin         |
