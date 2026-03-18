import { embed } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

// Why: separate OpenAI provider instance for embeddings since
// the main chat uses Anthropic. baseURL is configurable for
// third-party API proxies.
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

const embeddingModelId =
  process.env.OPENAI_EMBEDDING_MODEL_ID || "text-embedding-3-small";

const embeddingModel = openai.embedding(embeddingModelId);

/**
 * Generate a 1536-dimensional embedding vector for the given text.
 * Used for both storing memories and querying similar ones.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const { embedding } = await embed({
      model: embeddingModel,
      value: text,
    });
    return embedding;
  } catch (error) {
    console.error("[embeddings] Failed to generate embedding:", error);
    throw error;
  }
}
