import { chunkDocument } from "@/lib/utils/chunker";
import { generateEmbedding } from "@/lib/utils/embeddings";
import {
  batchCreateChunks,
  updateDocumentStatus,
} from "@/lib/db/queries/documents";

/**
 * Process an uploaded document: chunk, embed, and store.
 *
 * Why: this runs asynchronously (via next/server after()) so the
 * upload response returns immediately while heavy embedding work
 * happens in the background.
 */
export async function processDocument(
  documentId: string,
  text: string
): Promise<void> {
  try {
    const chunks = chunkDocument(text);

    // Why: batch embeddings in groups of 10 to avoid overwhelming
    // the OpenAI API with too many concurrent requests
    const BATCH_SIZE = 10;
    const embeddedChunks: Array<{
      documentId: string;
      content: string;
      chunkIndex: number;
      embedding: number[];
      tokenCount: number;
    }> = [];

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const embeddings = await Promise.all(
        batch.map((chunk) => generateEmbedding(chunk.content))
      );

      for (let j = 0; j < batch.length; j++) {
        embeddedChunks.push({
          documentId,
          content: batch[j].content,
          chunkIndex: i + j,
          embedding: embeddings[j],
          tokenCount: batch[j].tokenCount,
        });
      }
    }

    await batchCreateChunks(embeddedChunks);
    await updateDocumentStatus(documentId, "ready", embeddedChunks.length);
  } catch (error) {
    console.error(
      `[document-processor] Failed to process document ${documentId}:`,
      error
    );
    try {
      await updateDocumentStatus(documentId, "error");
    } catch (statusErr) {
      console.error(
        "[document-processor] Failed to update error status:",
        statusErr
      );
    }
  }
}
