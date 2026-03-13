import { eq, sql, desc } from "drizzle-orm";
import { db } from "@/db";
import { chunks, documents } from "@/db/schema";
import type { ChunkMetadata } from "@/types";

const INSERT_BATCH_SIZE = 10;

export async function insertChunks(
  documentId: string,
  items: { content: string; embedding: number[]; metadata?: unknown }[]
) {
  if (items.length === 0) return [];

  const allResults = [];

  for (let i = 0; i < items.length; i += INSERT_BATCH_SIZE) {
    const batch = items.slice(i, i + INSERT_BATCH_SIZE);
    const values = batch.map((item) => ({
      documentId,
      content: item.content,
      embedding: item.embedding,
      metadata: item.metadata ?? null,
    }));

    const result = await db.insert(chunks).values(values).returning();
    allResults.push(...result);
  }

  return allResults;
}

export async function getChunksByDocumentId(documentId: string) {
  return db.query.chunks.findMany({
    where: eq(chunks.documentId, documentId),
    orderBy: (chunks, { asc }) => [asc(chunks.createdAt)],
  });
}

export async function searchSimilarChunks(
  queryEmbedding: number[],
  limit: number = 5,
  threshold?: number
) {
  const similarity = sql<number>`1 - (${chunks.embedding} <=> ${JSON.stringify(queryEmbedding)}::vector)`;

  const query = db
    .select({
      id: chunks.id,
      documentId: chunks.documentId,
      content: chunks.content,
      metadata: chunks.metadata,
      similarity,
    })
    .from(chunks);

  if (threshold !== undefined) {
    return query
      .where(sql`1 - (${chunks.embedding} <=> ${JSON.stringify(queryEmbedding)}::vector) >= ${threshold}`)
      .orderBy(desc(similarity))
      .limit(limit);
  }

  return query.orderBy(desc(similarity)).limit(limit);
}

export async function searchChunksWithDocument(
  queryEmbedding: number[],
  limit: number = 5,
  threshold: number = 0.7
): Promise<
  {
    content: string;
    similarity: number;
    documentFilename: string;
    metadata: ChunkMetadata;
  }[]
> {
  const similarity = sql<number>`1 - (${chunks.embedding} <=> ${JSON.stringify(queryEmbedding)}::vector)`;

  const results = await db
    .select({
      content: chunks.content,
      similarity,
      documentFilename: documents.filename,
      metadata: chunks.metadata,
    })
    .from(chunks)
    .innerJoin(documents, eq(chunks.documentId, documents.id))
    .where(
      sql`1 - (${chunks.embedding} <=> ${JSON.stringify(queryEmbedding)}::vector) >= ${threshold}`
    )
    .orderBy(desc(similarity))
    .limit(limit);

  return results.map((row) => ({
    content: row.content,
    similarity: Number(row.similarity),
    documentFilename: row.documentFilename,
    metadata: row.metadata as ChunkMetadata,
  }));
}

export async function deleteChunksByDocumentId(documentId: string) {
  return db.delete(chunks).where(eq(chunks.documentId, documentId));
}
