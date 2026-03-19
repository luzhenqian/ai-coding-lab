import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";

// 原因：支持两种聊天提供商——Anthropic（默认）或 OpenAI 兼容。
// 如果设置了 OPENAI_CHAT_MODEL_ID，则使用 OpenAI 提供商进行聊天；
// 否则回退到 Anthropic。这允许用户通过 OpenAI 兼容 API
// 接入第三方提供商（如 DashScope qwen-plus）。

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL,
});

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export const chatModel = process.env.OPENAI_CHAT_MODEL_ID
  ? openai(process.env.OPENAI_CHAT_MODEL_ID)
  : anthropic(
      process.env.ANTHROPIC_MODEL_ID || "claude-sonnet-4-20250514"
    );
