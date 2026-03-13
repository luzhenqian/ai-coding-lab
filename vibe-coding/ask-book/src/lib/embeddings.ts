import { embedMany } from "ai";
import { embeddingModel, embeddingProviderOptions } from "@/lib/ai";

const BATCH_SIZE = 10;

export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);

    const { embeddings } = await embedMany({
      model: embeddingModel,
      values: batch,
      providerOptions: embeddingProviderOptions,
    });

    allEmbeddings.push(...embeddings);
  }

  return allEmbeddings;
}
