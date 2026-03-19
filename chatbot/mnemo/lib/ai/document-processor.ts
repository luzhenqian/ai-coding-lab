import { chunkDocument } from "@/lib/utils/chunker";
import { generateEmbedding } from "@/lib/utils/embeddings";
import {
  batchCreateChunks,
  updateDocumentStatus,
} from "@/lib/db/queries/documents";

/**
 * 处理上传的文档：分块、嵌入和存储。
 *
 * 原因：此操作异步运行（通过 next/server after()），因此上传响应会立即返回，
 * 而繁重的嵌入工作在后台进行。
 */
export async function processDocument(
  documentId: string,
  text: string
): Promise<void> {
  try {
    const chunks = chunkDocument(text);

    // 原因：以10个为一组批量处理嵌入，避免过多并发请求压垮 OpenAI API
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
