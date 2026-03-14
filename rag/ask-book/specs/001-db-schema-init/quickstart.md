# Quickstart: Database Schema Design & Initialization

**Feature**: 001-db-schema-init
**Date**: 2026-03-12

## Prerequisites

- Docker and Docker Compose v2 installed
- Node.js 20+ and pnpm installed
- Repository cloned locally

## Steps

### 1. Start the Database

```bash
docker compose up -d
```

This starts PostgreSQL 16 with pgvector pre-installed on port 5432.

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Default values work out of the box for local development:

```env
DATABASE_URL=postgresql://askbook:askbook@localhost:5432/askbook
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Run Migrations

```bash
pnpm drizzle-kit migrate
```

This creates the pgvector extension and all four tables (documents,
chunks, conversations, messages) with indexes.

### 5. Verify

Connect to the database and confirm:

```bash
pnpm drizzle-kit studio
```

Or via psql:

```bash
docker compose exec db psql -U askbook -d askbook -c "\dt"
```

Expected tables: `documents`, `chunks`, `conversations`, `messages`.

### 6. Verify Vector Index

```bash
docker compose exec db psql -U askbook -d askbook -c "\di"
```

Expected index: HNSW index on `chunks.embedding`.

## Common Issues

- **Port 5432 in use**: Change the port mapping in `docker-compose.yml`
  and update `DATABASE_URL` in `.env.local`.
- **pgvector extension error**: Ensure you're using the
  `pgvector/pgvector:pg16` image, not the plain `postgres` image.
- **Migration fails**: Run `docker compose down -v && docker compose up -d`
  to reset the database volume, then re-run migrations.
