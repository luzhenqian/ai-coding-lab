import { eq, desc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { documents, documentChunks } from "@/lib/db/schema";

interface CreateDocumentData {
  userId: string;
  filename: string;
}

interface CreateChunkData {
  documentId: string;
  content: string;
  chunkIndex: number;
  embedding: number[];
  tokenCount: number;
}

/**
 * 以 'processing' 状态插入新文档记录。
 * 原因：在分块/嵌入之前立即创建记录，这样 UI 可以马上显示带有"处理中"指示器的文档。
 */
export async function createDocument(data: CreateDocumentData) {
  const [document] = await db
    .insert(documents)
    .values({ userId: data.userId, filename: data.filename, totalChunks: 0 })
    .returning();
  return document;
}

/** 列出用户的所有文档，按最新排序。 */
export async function listDocumentsByUser(userId: string) {
  return db
    .select()
    .from(documents)
    .where(eq(documents.userId, userId))
    .orderBy(desc(documents.createdAt));
}

/** 按 ID 删除文档（级联删除其分块）。 */
export async function deleteDocument(id: string) {
  await db.delete(documents).where(eq(documents.id, id));
}

/** 更新文档状态，可选更新总分块数。 */
export async function updateDocumentStatus(
  id: string,
  status: "processing" | "ready" | "error",
  totalChunks?: number
) {
  const values: Record<string, unknown> = { status };
  if (totalChunks !== undefined) {
    values.totalChunks = totalChunks;
  }
  await db.update(documents).set(values).where(eq(documents.id, id));
}

/**
 * 批量插入文档分块。
 * 原因：在单条语句中插入所有分块比逐条插入快得多，尤其是对于分块较多的大文档。
 */
export async function batchCreateChunks(chunks: CreateChunkData[]) {
  // 原因：防止空数组导致 Drizzle 在空 VALUES 上报错
  if (chunks.length === 0) return;
  await db.insert(documentChunks).values(chunks);
}

/**
 * 通过余弦相似度搜索所有文档分块。
 * 原因：使用 pgvector 余弦距离运算符（<=>）在所有已上传文档中查找最相关的分块，
 * 并关联 documents 表以包含源文件名。
 */
export async function searchChunksBySimilarity(
  queryEmbedding: number[],
  limit: number,
  threshold: number
) {
  const embeddingStr = `[${queryEmbedding.join(",")}]`;

  const result = await db.execute(sql`
    SELECT dc.id, dc.content, dc.chunk_index, dc.token_count,
           d.filename,
           1 - (dc.embedding <=> ${embeddingStr}::vector) as similarity
    FROM document_chunks dc
    JOIN documents d ON d.id = dc.document_id
    WHERE d.status = 'ready'
      AND 1 - (dc.embedding <=> ${embeddingStr}::vector) > ${threshold}
    ORDER BY similarity DESC
    LIMIT ${limit}
  `);

  return result as unknown as Array<{
    id: string;
    content: string;
    chunk_index: number;
    token_count: number;
    filename: string;
    similarity: number;
  }>;
}
