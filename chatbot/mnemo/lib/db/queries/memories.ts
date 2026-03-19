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

/** 插入新记忆并返回。 */
export async function createMemory(data: CreateMemoryData) {
  const [memory] = await db.insert(memories).values(data).returning();
  return memory;
}

/** 更新记忆的内容、类别和/或嵌入向量。 */
export async function updateMemory(id: string, data: UpdateMemoryData) {
  const [memory] = await db
    .update(memories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(memories.id, id))
    .returning();
  return memory;
}

/** 根据 id 删除记忆。 */
export async function deleteMemory(id: string) {
  await db.delete(memories).where(eq(memories.id, id));
}

/** 列出用户的所有记忆，最新的排在前面。 */
export async function listMemoriesByUser(userId: string) {
  return db
    .select()
    .from(memories)
    .where(eq(memories.userId, userId))
    .orderBy(desc(memories.createdAt));
}

/**
 * 查找与查询嵌入向量语义相似的记忆。
 * 原因：使用 pgvector 余弦距离运算符（<=>）对嵌入列进行高效的近似最近邻搜索。
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
 * 查找与给定嵌入向量几乎相同的已有记忆。
 * 原因：在插入新记忆前检查语义相似度，防止存储重复记忆。
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
 * 增加访问计数并更新最后访问时间戳。
 * 原因：跟踪访问模式可以为未来的记忆相关性排序和清理从未被检索的过期记忆提供依据。
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
