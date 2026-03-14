# Feature Specification: Database Schema Design & Initialization

**Feature Branch**: `001-db-schema-init`
**Created**: 2026-03-12
**Status**: Draft
**Input**: User description: "Database schema design and initialization using Drizzle ORM with PostgreSQL + pgvector for HR Employee Handbook RAG Chatbot"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Local Development Environment Bootstrap (Priority: P1)

A developer clones the repository for the first time and needs to
stand up the full database environment locally. They run a single
Docker Compose command and the PostgreSQL instance starts with the
pgvector extension enabled. They then run the migration command and
all four tables are created with correct columns, constraints, and
indexes.

**Why this priority**: Without a working database and schema, no other
feature (PDF upload, embedding storage, chat) can function. This is
the foundational dependency for the entire application.

**Independent Test**: Can be fully tested by running
`docker compose up -d` followed by the migration command, then
verifying all tables exist with the expected structure via a database
client.

**Acceptance Scenarios**:

1. **Given** a freshly cloned repository with Docker installed,
   **When** the developer runs `docker compose up -d`,
   **Then** a PostgreSQL instance with pgvector extension starts and
   is accessible on the configured port.
2. **Given** the database is running,
   **When** the developer runs the Drizzle migration command,
   **Then** all four tables (documents, chunks, conversations,
   messages) are created with correct columns, types, and constraints.
3. **Given** migrations have been applied,
   **When** the developer inspects the chunks table,
   **Then** an HNSW vector index exists on the embedding column.

---

### User Story 2 - Document Metadata Persistence (Priority: P2)

The system needs to record metadata about uploaded PDF files so that
later features (upload processing, status tracking, document listing)
have a reliable data store. When a PDF is uploaded, a document record
is created capturing the filename, file size, processing status, and
chunk count.

**Why this priority**: The documents table is the entry point for the
RAG pipeline — chunks, conversations, and messages all depend on
documents existing first.

**Independent Test**: Can be tested by inserting a document record
with all required fields and verifying it persists correctly,
including default values for status and chunk count.

**Acceptance Scenarios**:

1. **Given** an empty documents table,
   **When** a new document record is inserted with filename and file
   size,
   **Then** the record is persisted with a default processing status
   of "pending" and chunk count of 0.
2. **Given** a document record exists,
   **When** the processing status is updated to "completed" with a
   chunk count of 42,
   **Then** the updated values are persisted correctly.
3. **Given** a document record exists,
   **When** a query retrieves it by ID,
   **Then** all fields (filename, size, status, chunk count,
   timestamps) are returned with correct types.

---

### User Story 3 - Vector Embedding Storage & Retrieval (Priority: P2)

The system stores document text chunks with their vector embeddings
so that later features can perform similarity search. Each chunk is
associated with a parent document and carries metadata (page number,
section title) in a flexible JSON structure.

**Why this priority**: The chunks table with vector embeddings is the
core of the RAG retrieval mechanism. The HNSW index enables fast
approximate nearest-neighbor queries at scale.

**Independent Test**: Can be tested by inserting chunk records with
1536-dimensional embedding vectors and verifying that cosine
similarity queries return results ordered by relevance.

**Acceptance Scenarios**:

1. **Given** a document record exists,
   **When** chunk records are inserted with text content, a
   1536-dimensional embedding vector, and metadata (page number,
   section),
   **Then** all chunks are persisted and correctly associated with
   the parent document.
2. **Given** multiple chunks with embeddings exist,
   **When** a cosine similarity search is performed with a query
   vector,
   **Then** results are returned ordered by similarity score, and
   the HNSW index is used (not a sequential scan).
3. **Given** a document is deleted,
   **When** the deletion cascades,
   **Then** all associated chunks are also removed.

---

### User Story 4 - Conversation & Message History (Priority: P3)

The system persists chat conversations and individual messages so
that users can maintain context across a chat session. Each message
records the role (user or assistant), content, and optional source
references (cited document chunks).

**Why this priority**: Conversation and message tables enable the
chat feature but are not blocking for the core RAG pipeline (upload
+ embedding + retrieval). They can be added after the document/chunk
foundation is in place.

**Independent Test**: Can be tested by creating a conversation,
adding user and assistant messages with source citations, and
verifying the message history is retrievable in chronological order.

**Acceptance Scenarios**:

1. **Given** an empty conversations table,
   **When** a new conversation is created,
   **Then** it receives a unique identifier and a creation timestamp.
2. **Given** a conversation exists,
   **When** a user message is inserted followed by an assistant
   message with source citations,
   **Then** both messages are persisted in order with correct roles,
   content, and the assistant message includes structured source
   references.
3. **Given** a conversation with multiple messages,
   **When** messages are queried by conversation ID,
   **Then** they are returned in chronological order with all fields
   intact.

---

### Edge Cases

- What happens when a 1536-dimensional vector of all zeros is
  inserted? The system MUST accept it (valid embedding edge case).
- What happens when the metadata JSON for a chunk is null or empty?
  The system MUST allow nullable metadata.
- What happens when two documents with identical filenames are
  uploaded? The system MUST allow duplicate filenames (they are
  different uploads tracked by unique IDs).
- What happens when the pgvector extension is not installed? The
  migration MUST fail with a clear error rather than silently
  creating a table without vector support.
- What happens when a conversation has no messages? The system MUST
  allow empty conversations (user may start and abandon a session).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a containerized configuration that
  starts a PostgreSQL instance with the pgvector extension enabled.
- **FR-002**: System MUST define a `documents` table with fields for:
  unique identifier, original filename, file size in bytes, processing
  status (pending/processing/completed/failed), chunk count, and
  created/updated timestamps.
- **FR-003**: System MUST define a `chunks` table with fields for:
  unique identifier, reference to parent document, text content,
  1536-dimensional vector embedding, JSONB metadata (page number,
  section title), and created timestamp.
- **FR-004**: System MUST create an HNSW index on the chunks embedding
  column to enable fast approximate nearest-neighbor similarity search.
- **FR-005**: System MUST define a `conversations` table with fields
  for: unique identifier and created/updated timestamps.
- **FR-006**: System MUST define a `messages` table with fields for:
  unique identifier, reference to parent conversation, role
  (user/assistant), text content, JSONB sources (array of cited chunk
  references), and created timestamp.
- **FR-007**: System MUST enforce referential integrity: chunks
  reference a valid document; messages reference a valid conversation.
  Deleting a parent MUST cascade to children.
- **FR-008**: System MUST provide migration configuration so that
  schema changes are version-controlled and reproducibly applied.
- **FR-009**: System MUST document all required environment variables
  (database connection string, port) in a `.env.example` file.
- **FR-010**: System MUST enable the pgvector extension via the
  migration (not manually) so it is reproducible.

### Key Entities

- **Document**: Represents an uploaded PDF file. Tracks filename,
  size, processing lifecycle status, and how many chunks were
  extracted. One document has many chunks.
- **Chunk**: A segment of extracted text from a document, paired with
  its vector embedding for similarity search. Carries flexible
  metadata (page, section). Belongs to one document.
- **Conversation**: A chat session grouping related messages. Has
  many messages.
- **Message**: A single chat message within a conversation. Has a
  role (user or assistant), text content, and optional source
  citations linking back to relevant chunks.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new developer can start the database and apply
  migrations in under 2 minutes with no manual steps beyond two
  commands.
- **SC-002**: All four tables are created with the correct columns,
  types, constraints, and indexes as verified by schema inspection.
- **SC-003**: A cosine similarity query against 10,000 chunk records
  returns the top 5 results in under 100 milliseconds using the
  vector index.
- **SC-004**: Cascade deletions correctly remove all child records
  (chunks when a document is deleted, messages when a conversation
  is deleted).
- **SC-005**: The migration is idempotent — running it multiple times
  on an already-migrated database produces no errors or duplicate
  objects.

## Assumptions

- UUIDs are used as primary keys for all tables (standard practice
  for distributed-friendly ID generation).
- The processing status for documents uses a text/enum with four
  values: pending, processing, completed, failed.
- The HNSW index uses cosine distance as the similarity metric
  (standard for OpenAI text-embedding-3-small).
- Timestamps use UTC timezone.
- The containerized setup is for local development only, not
  production deployment.
- No authentication or multi-tenancy is needed for this feature
  (single-user local development context).
