import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  real,
  timestamp,
  pgEnum,
  index,
  customType,
} from "drizzle-orm/pg-core";

// Why: pgvector stores embeddings as a custom type not natively
// supported by drizzle-orm, so we define a custom column type
// that handles serialization to/from the wire format.
const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return "vector(1024)";
  },
  toDriver(value: number[]): string {
    return `[${value.join(",")}]`;
  },
  fromDriver(value: unknown): number[] {
    return JSON.parse(value as string);
  },
});

// ============================================================
// Phase 1: Conversations & Messages
// ============================================================

export const messageRoleEnum = pgEnum("message_role", [
  "user",
  "assistant",
  "system",
]);

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("user_id", { length: 64 }).notNull(),
    title: varchar("title", { length: 200 }),
    isDeleted: boolean("is_deleted").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("conversations_user_idx").on(
      table.userId,
      table.isDeleted,
      table.updatedAt
    ),
  ]
);

// ============================================================
// Phase 2: Conversation Summaries
// Why: when a conversation exceeds the sliding window, we
// generate a progressive summary so older context is preserved
// without consuming the full token budget.
// ============================================================

export const summaries = pgTable(
  "summaries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id),
    content: text("content").notNull(),
    coveredMessageCount: integer("covered_message_count").notNull(),
    tokenCount: integer("token_count").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("summaries_conversation_idx").on(
      table.conversationId,
      table.createdAt
    ),
  ]
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id),
    role: messageRoleEnum("role").notNull(),
    content: text("content").notNull(),
    tokenCount: integer("token_count").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("messages_conversation_idx").on(
      table.conversationId,
      table.createdAt
    ),
  ]
);

// ============================================================
// Phase 3: Long-term User Memory
// Why: cross-session memory lets the chatbot remember user
// preferences, facts, and behaviors across conversations.
// Embeddings enable semantic similarity search via pgvector.
// ============================================================

export const memoryCategoryEnum = pgEnum("memory_category", [
  "preference",
  "fact",
  "behavior",
]);

export const memories = pgTable(
  "memories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("user_id", { length: 64 }).notNull(),
    content: text("content").notNull(),
    category: memoryCategoryEnum("category").notNull(),
    embedding: vector("embedding").notNull(),
    importanceScore: real("importance_score").notNull().default(1.0),
    accessCount: integer("access_count").notNull().default(0),
    lastAccessedAt: timestamp("last_accessed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("memories_user_idx").on(table.userId)]
);

// Note: HNSW index for vector similarity search must be created
// via raw SQL migration, not in the Drizzle schema definition:
// CREATE INDEX memories_embedding_idx ON memories
//   USING hnsw (embedding vector_cosine_ops);

// ============================================================
// Phase 4: Document Upload & RAG
// Why: users can upload documents (.txt, .md) which are chunked,
// embedded, and stored for retrieval-augmented generation.
// ============================================================

export const documentStatusEnum = pgEnum("document_status", [
  "processing",
  "ready",
  "error",
]);

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id", { length: 64 }).notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  totalChunks: integer("total_chunks").notNull().default(0),
  status: documentStatusEnum("status").notNull().default("processing"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const documentChunks = pgTable(
  "document_chunks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    chunkIndex: integer("chunk_index").notNull(),
    embedding: vector("embedding").notNull(),
    tokenCount: integer("token_count").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("document_chunks_document_idx").on(table.documentId),
  ]
);

// Note: HNSW index for document chunk embeddings must be created
// via raw SQL migration:
// CREATE INDEX document_chunks_embedding_idx ON document_chunks
//   USING hnsw (embedding vector_cosine_ops);
