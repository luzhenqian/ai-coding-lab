import { createOpenAI } from '@ai-sdk/openai';

// 从环境变量读取模型配置，支持 OpenAI 兼容接口（如通义千问 Qwen）
const provider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.MODEL_BASE_URL,
});

const modelName = process.env.MODEL_NAME ?? 'qwen-plus';

export function getModel() {
  return provider(modelName);
}
