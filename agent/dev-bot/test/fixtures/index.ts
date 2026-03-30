import type { Intent } from '../../src/types/index.js';

export interface TestCase {
  input: string;
  expectedIntent: Intent;
  description: string;
}

// 规则路由器应命中的测试用例
export const ruleRouterCases: TestCase[] = [
  // bug_fix
  {
    input: '帮我看看这个报错：TypeError: Cannot read properties of undefined (reading "map")',
    expectedIntent: 'bug_fix',
    description: 'TypeError 关键词匹配',
  },
  {
    input: '运行时出错了，traceback 信息如下：...',
    expectedIntent: 'bug_fix',
    description: '出错 + traceback 关键词匹配',
  },
  {
    input: '这段代码运行结果不对，输出跟预期不一样',
    expectedIntent: 'bug_fix',
    description: '结果不对关键词匹配',
  },

  // code_explain
  {
    input: '解释一下这段递归函数的逻辑',
    expectedIntent: 'code_explain',
    description: '解释关键词匹配',
  },
  {
    input: 'explain this sorting algorithm to me',
    expectedIntent: 'code_explain',
    description: 'explain 英文关键词匹配',
  },
  {
    input: '这个设计模式什么意思？看不懂',
    expectedIntent: 'code_explain',
    description: '什么意思 + 看不懂关键词匹配',
  },

  // code_generate
  {
    input: '帮我写一个防抖函数',
    expectedIntent: 'code_generate',
    description: '帮我写关键词匹配',
  },
  {
    input: '生成一个 React 登录页面组件',
    expectedIntent: 'code_generate',
    description: '生成关键词匹配',
  },
  {
    input: '实现一个 LRU 缓存',
    expectedIntent: 'code_generate',
    description: '实现一个关键词匹配',
  },

  // doc_search
  {
    input: 'useEffect 的用法是什么？',
    expectedIntent: 'doc_search',
    description: '用法关键词匹配',
  },
  {
    input: '查一下 Next.js 的 API 文档',
    expectedIntent: 'doc_search',
    description: 'API + 文档关键词匹配',
  },
  {
    input: 'React Router 怎么用？有什么使用方法',
    expectedIntent: 'doc_search',
    description: '怎么用 + 使用方法关键词匹配',
  },
];

// 需要 LLM 路由器的模糊输入
export const llmRouterCases: TestCase[] = [
  {
    input: '这段代码的递归逻辑我没太看懂，能给我讲讲它到底在做什么吗？',
    expectedIntent: 'code_explain',
    description: '自然语言表达理解需求',
  },
  {
    input: '我的程序跑到一半就卡住了，数据库连接好像有问题',
    expectedIntent: 'bug_fix',
    description: '描述性的 bug 报告',
  },
  {
    input: '能不能给我搞一个发送邮件的工具函数',
    expectedIntent: 'code_generate',
    description: '口语化的代码生成需求',
  },
];

// 应路由到 Clarifier 的模糊输入
export const unclearCases: TestCase[] = [
  {
    input: '这个东西能不能优化一下',
    expectedIntent: 'unclear',
    description: '模糊的优化请求',
  },
  {
    input: '帮我看看',
    expectedIntent: 'unclear',
    description: '极度模糊的请求',
  },
  {
    input: '搞一下',
    expectedIntent: 'unclear',
    description: '无上下文的模糊指令',
  },
];
