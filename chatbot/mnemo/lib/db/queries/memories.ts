import { eq, desc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { memories } from "@/lib/db/schema";

interface CreateMemoryData {
  userId: string;
  content: string;
  category: "preference" | "fact" | "behavior";
  embedding: number[];
}

interface UpdateMemoryData {
  content?: string;
  category?: "preference" | "fact" | "behavior";
  embedding?: number[];
}

/** Insert a new memory and return it. */
export async function createMemory(data: CreateMemoryData) {
  const [memory] = await db.insert(memories).values(data).returning();
  return memory;
}

/** Update a memory's content, category, and/or embedding. */
export async function updateMemory(id: string, data: UpdateMemoryData) {
  const [memory] = await db
    .update(memories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(memories.id, id))
    .returning();
  return memory;
}

/** Delete a memory by id. */
export async function deleteMemory(id: string) {
  await db.delete(memories).where(eq(memories.id, id));
}

/** List all memories for a user, newest first. */
export async function listMemoriesByUser(userId: string) {
  return db
    .select()
    .from(memories)
    .where(eq(memories.userId, userId))
    .orderBy(desc(memories.createdAt));
}

/**
 * Find memories semantically similar to the query embedding.
 * Why: uses pgvector cosine distance operator (<=>) for efficient
 * approximate nearest neighbor search on the embedding column.
 */
export async function searchMemoriesBySimilarity(
  userId: string,
  queryEmbedding: number[],
  limit: number,
  threshold: number
) {
  const embeddingStr = `[${queryEmbedding.join(",")}]`;

  const result = await db.execute(sql`
    SELECT id, user_id, content, category, importance_score,
           access_count, last_accessed_at, created_at, updated_at,
           1 - (embedding <=> ${embeddingStr}::vector) as similarity
    FROM memories
    WHERE user_id = ${userId}
      AND 1 - (embedding <=> ${embeddingStr}::vector) > ${threshold}
    ORDER BY similarity DESC
    LIMIT ${limit}
  `);

  return result as unknown as Array<{
    id: string;
    user_id: string;
    content: string;
    category: string;
    importance_score: number;
    access_count: number;
    last_accessed_at: string | null;
    created_at: string;
    updated_at: string;
    similarity: number;
  }>;
}

/**
 * Find an existing memory that is nearly identical to the given embedding.
 * Why: prevents storing duplicate memories by checking semantic similarity
 * before inserting a new one.
 */
export async function findDuplicateMemory(
  userId: string,
  embedding: number[],
  threshold: number
) {
  const embeddingStr = `[${embedding.join(",")}]`;

  const result = await db.execute(sql`
    SELECT id, user_id, content, category, importance_score,
           access_count, last_accessed_at, created_at, updated_at,
           1 - (embedding <=> ${embeddingStr}::vector) as similarity
    FROM memories
    WHERE user_id = ${userId}
      AND 1 - (embedding <=> ${embeddingStr}::vector) > ${threshold}
    ORDER BY similarity DESC
    LIMIT 1
  `);

  const rows = result as unknown as Array<{
    id: string;
    content: string;
    category: string;
    similarity: number;
  }>;

  return rows[0] ?? null;
}

/**
 * Increment access count and update last accessed timestamp.
 * Why: tracking access patterns enables future memory relevance ranking
 * and pruning of stale memories that are never retrieved.
 */
export async function incrementAccessCount(id: string) {
  await db
    .update(memories)
    .set({
      accessCount: sql`${memories.accessCount} + 1`,
      lastAccessedAt: new Date(),
    })
    .where(eq(memories.id, id));
}
