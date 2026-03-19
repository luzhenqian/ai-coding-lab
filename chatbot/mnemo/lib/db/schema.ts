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

// 原因：pgvector 将嵌入向量存储为 drizzle-orm 原生不支持的自定义类型，
// 因此我们定义一个自定义列类型来处理与传输格式之间的序列化/反序列化。
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
// 第1阶段：对话与消息
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
// 第2阶段：对话摘要
// 原因：当对话超出滑动窗口时，我们生成渐进式摘要，
// 在不消耗全部 token 预算的情况下保留较早的上下文。
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
// 第3阶段：长期用户记忆
// 原因：跨会话记忆让聊天机器人能够跨对话记住用户的偏好、事实和行为。
// 嵌入向量通过 pgvector 实现语义相似度搜索。
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

// 注意：向量相似度搜索的 HNSW 索引必须通过原始 SQL 迁移创建，
// 而不是在 Drizzle schema 定义中创建：
// CREATE INDEX memories_embedding_idx ON memories
//   USING hnsw (embedding vector_cosine_ops);

// ============================================================
// 第4阶段：文档上传与 RAG
// 原因：用户可以上传文档（.txt、.md），这些文档会被分块、
// 嵌入并存储，用于检索增强生成。
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

// 注意：文档分块嵌入的 HNSW 索引必须通过原始 SQL 迁移创建：
// CREATE INDEX document_chunks_embedding_idx ON document_chunks
//   USING hnsw (embedding vector_cosine_ops);
