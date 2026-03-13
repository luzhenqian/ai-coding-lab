import { embed } from "ai";
import { embeddingModel, embeddingProviderOptions } from "@/lib/ai";
import { searchChunksWithDocument } from "@/db/queries/chunks";
import type { RetrievalResult, RetrievalOptions } from "@/types";

const DEFAULT_TOP_K = 8;
const DEFAULT_SIMILARITY_THRESHOLD = 0.5;

async function embedQuery(question: string): Promise<number[]> {
  const { embedding } = await embed({
    model: embeddingModel,
    value: question,
    providerOptions: embeddingProviderOptions,
  });
  return embedding;
}

export async function retrieveRelevantChunks(
  question: string,
  options?: RetrievalOptions
): Promise<RetrievalResult[]> {
  const trimmed = question.trim();
  if (trimmed.length === 0) {
    throw new Error("Question text cannot be empty");
  }

  const topK = options?.topK ?? DEFAULT_TOP_K;
  if (!Number.isInteger(topK) || topK <= 0) {
    throw new Error("topK must be a positive integer");
  }

  const similarityThreshold =
    options?.similarityThreshold ?? DEFAULT_SIMILARITY_THRESHOLD;

  const queryEmbedding = await embedQuery(trimmed);

  return searchChunksWithDocument(queryEmbedding, topK, similarityThreshold);
}
