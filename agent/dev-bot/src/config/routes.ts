import type { Intent } from '../types/index.js';

// 路由表描述配置：每个意图的人类可读描述
// 用于 LLM 路由 Prompt 构建和 Debug 面板展示
export const ROUTE_DESCRIPTIONS: Record<Intent, string> = {
  code_explain: '代码解释器 — 用通俗语言解释代码逻辑',
  bug_fix: 'Bug 侦探 — 分析报错信息，定位原因，给出修复建议',
  code_generate: '代码生成器 — 根据自然语言需求生成代码',
  doc_search: '文档检索 — 搜索 API/框架/库的使用文档',
  unclear: '意图澄清 — 通过追问帮助用户明确需求',
};

// 置信度阈值：低于此值时路由到 Clarifier
export const CONFIDENCE_THRESHOLD = 0.7;
