import { generateText } from 'ai';
import { z } from 'zod';
import type { RouterResult, Intent } from '../types/index.js';
import { ROUTER_SYSTEM_PROMPT } from '../config/prompts.js';
import { getModel } from '../config/model.js';

// LLM 输出校验 Schema
const routerSchema = z.object({
  intent: z.enum(['code_explain', 'bug_fix', 'code_generate', 'doc_search', 'unclear']),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

// 从 LLM 文本响应中提取 JSON
function extractJSON(text: string): unknown {
  // 尝试匹配 ```json ... ``` 代码块
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) return JSON.parse(codeBlock[1].trim());

  // 尝试匹配裸 JSON 对象
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) return JSON.parse(jsonMatch[0]);

  throw new Error(`无法从 LLM 响应中提取 JSON: ${text.slice(0, 200)}`);
}

// LLM 路由器：使用 LLM 对用户输入进行意图分类
// 使用 generateText + JSON 解析，兼容所有 OpenAI 兼容接口
export async function llmRoute(input: string): Promise<RouterResult> {
  const { text } = await generateText({
    model: getModel(),
    system: ROUTER_SYSTEM_PROMPT + '\n\n严格按 JSON 格式输出，不要包含其他内容：\n{"intent": "分类标签", "confidence": 0.0到1.0之间的数字, "reasoning": "一句话解释你的判断依据"}',
    prompt: `请分析以下用户请求的意图：\n\n${input}`,
    temperature: 0,
  });

  const parsed = routerSchema.parse(extractJSON(text));

  return {
    intent: parsed.intent as Intent,
    confidence: parsed.confidence,
    routedBy: 'llm',
    reasoning: parsed.reasoning,
  };
}
