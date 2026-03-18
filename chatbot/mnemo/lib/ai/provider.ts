import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";

// Why: support two chat providers — Anthropic (default) or OpenAI-compatible.
// If OPENAI_CHAT_MODEL_ID is set, use the OpenAI provider for chat;
// otherwise fall back to Anthropic. This lets users plug in third-party
// providers (e.g., DashScope qwen-plus) via the OpenAI-compatible API.

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
