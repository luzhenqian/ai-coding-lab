# Research: Database Schema Design & Initialization

**Feature**: 001-db-schema-init
**Date**: 2026-03-12

## R1: Drizzle ORM pgvector Integration

**Decision**: Use `drizzle-orm/pg-core` with the `vector` column type
from `pgvector` Drizzle integration.

**Rationale**: Drizzle ORM has built-in pgvector support via
`customType` or the community `pgvector` column helper. This provides
full type safety for 1536-dimensional vectors without raw SQL. The
`vector(1536)` column type maps directly to pgvector's `vector(1536)`
PostgreSQL type.

**Alternatives considered**:
- **Raw SQL for vector columns**: Rejected — violates Constitution
  Principle III (Type Safety) which prohibits raw SQL outside Drizzle
  `sql` template literals.
- **Prisma with pgvector**: Rejected — Constitution locks ORM to
  Drizzle; no additional ORMs allowed.

## R2: HNSW Index Configuration

**Decision**: Create an HNSW index on `chunks.embedding` using cosine
distance operator (`vector_cosine_ops`).

**Rationale**: HNSW (Hierarchical Navigable Small World) provides the
best query-time performance for approximate nearest-neighbor search.
Cosine distance is the standard metric for OpenAI
text-embedding-3-small embeddings. Default HNSW parameters
(`m = 16`, `ef_construction = 64`) are suitable for up to ~100k
vectors; no custom tuning needed at this scale.

**Alternatives considered**:
- **IVFFlat index**: Rejected — requires training step (`CREATE INDEX
  ... WITH (lists = ...)`) and is less performant for small-to-medium
  datasets. HNSW works out-of-the-box.
- **No index (sequential scan)**: Rejected — spec requires < 100ms
  top-5 query on 10k chunks; sequential scan would not meet this.

## R3: UUID Primary Keys

**Decision**: Use `uuid` type with `gen_random_uuid()` default for all
primary keys.

**Rationale**: UUIDs avoid sequential ID guessing, are safe for
distributed systems, and are the standard approach for modern web
applications. PostgreSQL 16+ has built-in `gen_random_uuid()` without
requiring the `uuid-ossp` extension.

**Alternatives considered**:
- **Serial/BIGSERIAL**: Rejected — exposes record count and ordering
  to clients; less future-proof for distributed scenarios.
- **ULID/CUID**: Rejected — adds external dependency; UUID is
  sufficient and natively supported.

## R4: Document Processing Status

**Decision**: Use a PostgreSQL `text` column with application-level
enum validation (Drizzle `pgEnum` or Zod), values:
`pending | processing | completed | failed`.

**Rationale**: Drizzle ORM supports `pgEnum` which creates a native
PostgreSQL enum type. This provides database-level constraint
enforcement. Four states cover the full lifecycle: initial upload
(pending), active processing (processing), success (completed), and
error (failed).

**Alternatives considered**:
- **Text column with CHECK constraint**: Rejected — Drizzle `pgEnum`
  is more idiomatic and provides TypeScript type inference.
- **Integer status codes**: Rejected — less readable, requires
  mapping layer.

## R5: Docker Compose pgvector Image

**Decision**: Use `pgvector/pgvector:pg16` Docker image.

**Rationale**: Official pgvector Docker image extends the official
PostgreSQL image with pgvector pre-installed. No manual extension
compilation needed. The `pg16` tag aligns with our PostgreSQL 16+
requirement.

**Alternatives considered**:
- **Official postgres image + manual pgvector install**: Rejected —
  requires custom Dockerfile with build tools; unnecessarily complex.
- **Supabase postgres image**: Rejected — includes many extensions
  we don't need; heavier image.

## R6: Cascade Delete Strategy

**Decision**: Use `ON DELETE CASCADE` for `chunks → documents` and
`messages → conversations` foreign keys.

**Rationale**: When a document is deleted, all its chunks become
orphaned and meaningless. Same for conversation → messages. Cascade
delete ensures referential integrity without application-level
cleanup logic. This aligns with Constitution Principle IV (Simple
Architecture).

**Alternatives considered**:
- **Soft delete**: Rejected — YAGNI; no requirement for data recovery
  in the spec.
- **Application-level cascade**: Rejected — error-prone; database
  constraints are more reliable.

## R7: Migration Strategy

**Decision**: Use `drizzle-kit generate` to create SQL migration files,
`drizzle-kit migrate` to apply them. The pgvector extension is
enabled via a custom migration SQL (`CREATE EXTENSION IF NOT EXISTS
vector`).

**Rationale**: Drizzle Kit generates deterministic SQL migrations from
schema diffs. Committing migration files to the repo ensures
reproducibility (Constitution Principle V). The extension creation
is idempotent via `IF NOT EXISTS`.

**Alternatives considered**:
- **`drizzle-kit push`** (schema push without migration files):
  Rejected — not reproducible; Constitution requires committed
  migrations.
- **Manual SQL files**: Rejected — loses Drizzle schema-diff
  benefits and type safety.
