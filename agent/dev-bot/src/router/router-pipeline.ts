import type { RouterResult } from '../types/index.js';
import { ruleRoute } from './rule-router.js';
import { llmRoute } from './llm-router.js';
import { CONFIDENCE_THRESHOLD } from '../config/routes.js';

// 分层路由管道
// 第一层：规则快筛 → 命中则直接返回，跳过 LLM 调用
// 第二层：LLM 精分类 → 置信度低于阈值时，强制路由到 Clarifier
export async function routeRequest(input: string): Promise<RouterResult> {
  // 第一层：规则路由
  const ruleResult = ruleRoute(input);
  if (ruleResult) {
    return ruleResult;
  }

  // 第二层：LLM 路由
  const llmResult = await llmRoute(input);

  // 置信度低于阈值，强制路由到 Clarifier
  if (llmResult.confidence < CONFIDENCE_THRESHOLD) {
    return {
      intent: 'unclear',
      confidence: llmResult.confidence,
      routedBy: 'llm',
      reasoning: `置信度 ${llmResult.confidence} 低于阈值 ${CONFIDENCE_THRESHOLD}，原始分类: ${llmResult.intent}。${llmResult.reasoning}`,
    };
  }

  return llmResult;
}
