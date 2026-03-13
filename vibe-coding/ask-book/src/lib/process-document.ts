import { parsePdf } from "@/lib/pdf-parser";
import { chunkText } from "@/lib/chunker";
import { generateEmbeddings } from "@/lib/embeddings";
import { updateDocumentStatus } from "@/db/queries/documents";
import {
  insertChunks,
  deleteChunksByDocumentId,
} from "@/db/queries/chunks";

export async function processDocument(
  documentId: string,
  buffer: Buffer
): Promise<void> {
  try {
    await updateDocumentStatus(documentId, "processing");

    const { pages } = await parsePdf(buffer);

    const textChunks = chunkText(pages);

    if (textChunks.length === 0) {
      throw new Error(
        "No text content found — PDF may be image-only or corrupted"
      );
    }

    const contents = textChunks.map((c) => c.content);
    const embeddings = await generateEmbeddings(contents);

    const chunksToInsert = textChunks.map((chunk, i) => ({
      content: chunk.content,
      embedding: embeddings[i],
      metadata: chunk.metadata,
    }));

    await insertChunks(documentId, chunksToInsert);

    await updateDocumentStatus(documentId, "completed", chunksToInsert.length);
  } catch (error) {
    await deleteChunksByDocumentId(documentId).catch(() => {});

    const message =
      error instanceof Error ? error.message : "Unknown processing error";
    await updateDocumentStatus(documentId, "failed").catch(() => {});

    console.error(
      `Document ${documentId} processing failed: ${message}`
    );
    if (error instanceof Error && error.cause) {
      console.error("Cause:", error.cause);
    }
  }
}
