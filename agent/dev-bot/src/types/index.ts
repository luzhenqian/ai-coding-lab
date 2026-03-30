// 五种意图类型 + 一个兜底
export type Intent = 'code_explain' | 'bug_fix' | 'code_generate' | 'doc_search' | 'unclear';

// 路由结果
export interface RouterResult {
  intent: Intent;
  confidence: number;        // 0-1，置信度
  routedBy: 'rule' | 'llm';  // 由哪一层路由器决定
  reasoning?: string;         // LLM 路由时的推理过程（可选，用于 debug）
}

// 对话消息
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  routing?: RouterResult;     // 该轮的路由决策（仅 assistant 消息）
}

// 对话上下文
export interface ConversationContext {
  messages: Message[];
  isReroute: boolean;         // 是否为 Clarifier 回流的重路由
}

// 流式处理结果
export interface StreamResult {
  stream: AsyncIterable<string>;  // 文本 chunk 流
  fullText: Promise<string>;      // 完整文本（流结束后 resolve）
}

// 处理器统一接口
export interface Handler {
  name: string;
  handle(input: string, context?: ConversationContext): StreamResult;
}

// 路由表条目
export interface RouteEntry {
  intent: Intent;
  handler: Handler;
  description: string;        // 人类可读描述，也用于 LLM 路由 Prompt
}

// 路由日志条目
export interface RouteLog {
  timestamp: Date;
  inputPreview: string;       // 用户输入前 100 个字符
  ruleMatch: boolean;
  routerResult: RouterResult;
  handlerName: string;
  latencyMs: number;
}
