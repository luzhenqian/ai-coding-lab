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
 * Insert a new document record in 'processing' state.
 * Why: we create the record immediately (before chunking/embedding) so the
 * UI can show the document with a "processing" indicator right away.
 */
export async function createDocument(data: CreateDocumentData) {
  const [document] = await db
    .insert(documents)
    .values({ userId: data.userId, filename: data.filename, totalChunks: 0 })
    .returning();
  return document;
}

/** List all documents for a user, newest first. */
export async function listDocumentsByUser(userId: string) {
  return db
    .select()
    .from(documents)
    .where(eq(documents.userId, userId))
    .orderBy(desc(documents.createdAt));
}

/** Delete a document by id (cascade deletes its chunks). */
export async function deleteDocument(id: string) {
  await db.delete(documents).where(eq(documents.id, id));
}

/** Update document status and optionally the total chunk count. */
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
 * Batch insert document chunks.
 * Why: inserting all chunks in a single statement is significantly faster
 * than individual inserts, especially for large documents with many chunks.
 */
export async function batchCreateChunks(chunks: CreateChunkData[]) {
  // Why: guard against empty array to avoid a Drizzle error on empty VALUES
  if (chunks.length === 0) return;
  await db.insert(documentChunks).values(chunks);
}

/**
 * Search all document chunks by cosine similarity to the query embedding.
 * Why: uses pgvector cosine distance operator (<=>) to find the most
 * relevant chunks across all uploaded documents, joined with the
 * documents table to include the source filename.
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
