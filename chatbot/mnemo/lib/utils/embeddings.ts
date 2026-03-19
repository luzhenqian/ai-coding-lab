import { embed } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

// 原因：为嵌入使用单独的 OpenAI 提供商实例，因为主聊天使用 Anthropic。
// baseURL 可配置，以支持第三方 API 代理。
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

const embeddingModelId =
  process.env.OPENAI_EMBEDDING_MODEL_ID || "text-embedding-3-small";

const embeddingModel = openai.embedding(embeddingModelId);

/**
 * 为给定文本生成 1536 维嵌入向量。
 * 用于存储记忆和查询相似记忆。
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
