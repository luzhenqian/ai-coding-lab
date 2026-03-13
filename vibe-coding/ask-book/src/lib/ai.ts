import { createOpenAI } from "@ai-sdk/openai";

const provider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export const chatModel = provider(process.env.CHAT_MODEL ?? "gpt-4o");

export const embeddingModel = provider.embedding(
  process.env.EMBEDDING_MODEL ?? "text-embedding-3-small"
);

export const embeddingProviderOptions = process.env.EMBEDDING_DIMENSIONS
  ? ({ openai: { dimensions: parseInt(process.env.EMBEDDING_DIMENSIONS, 10) } } as const)
  : undefined;
