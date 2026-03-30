import type { Intent, RouterResult } from '../types/index.js';

// 规则定义：关键词模式 → 意图
interface Rule {
  intent: Intent;
  patterns: RegExp[];
  requiresCode?: boolean; // 是否要求输入中包含代码块
}

// 检测输入中是否包含代码块（``` 标记或 4 空格缩进代码）
function hasCodeBlock(input: string): boolean {
  return /```[\s\S]*```/.test(input) || /^    \S/m.test(input);
}

// 规则列表，按优先级排列
// 注意：\b 不适用于中文字符边界，中文关键词直接用字符串匹配
const rules: Rule[] = [
  {
    intent: 'bug_fix',
    patterns: [
      /\b(error|Error|TypeError|ReferenceError|SyntaxError|RangeError)\b/,
      /(报错|出错|异常)/,
      /\b(bug|Bug|BUG)\b/,
      /\b(traceback|stack\s*trace|Cannot read propert)/i,
      /\b(undefined is not|is not a function|is not defined)\b/,
      /(返回\s*\d{3}|status\s*\d{3}|接口.*报错)/,
      /(结果不对|跑不通|运行失败|编译失败)/,
    ],
  },
  {
    intent: 'code_explain',
    patterns: [
      /\bexplain\b/i,
      /(解释|什么意思|怎么理解|讲讲|看不懂|没看懂|没太看懂)/,
      /(这段代码|这个函数|这个方法).*(干什么|做什么|怎么工作|原理)/,
    ],
    requiresCode: false,
  },
  {
    intent: 'code_generate',
    patterns: [
      /\bgenerate\b/i,
      /(生成|帮我写|写一个|创建一个|实现一个|写个)/,
      /(帮我实现|帮我做一个|帮我搞一个|帮我造一个)/,
    ],
  },
  {
    intent: 'doc_search',
    patterns: [
      /\b(documentation|docs|API|api)\b/,
      /(文档|怎么用|用法)/,
      /(官方文档|使用方法|使用说明|参考手册)/,
      /(怎么做|如何实现).*(SSR|SSG|路由|认证|部署)/,
    ],
  },
];

// 规则路由器：检查输入是否匹配预定义规则
// 命中则返回 RouterResult（confidence 0.95），未命中返回 null
export function ruleRoute(input: string): RouterResult | null {
  for (const rule of rules) {
    if (rule.requiresCode && !hasCodeBlock(input)) {
      continue;
    }
    for (const pattern of rule.patterns) {
      if (pattern.test(input)) {
        return {
          intent: rule.intent,
          confidence: 0.95,
          routedBy: 'rule',
          reasoning: `规则匹配：${pattern.source}`,
        };
      }
    }
  }
  return null;
}
