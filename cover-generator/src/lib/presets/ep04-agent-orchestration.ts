import type {CoverContent, VideoMetadata} from '../types';

const cover: CoverContent = {
  variant: 'pipeline',
  theme: 'rose',
  series: 'AI 编程实战 · BY NOAH',
  episode: 'EPISODE 04',
  titleHighlight: 'Agent 编排',
  titleRest: '四种模式，到底谁说了算？',
  subtitleLine1: [
    {text: '4 种', accent: true},
    {text: ' 主流模式 · '},
    {text: '1 个', accent: true},
    {text: ' 核心问题'},
  ],
  subtitleLine2: '一个 Agent 装不下时，谁决定下一步谁干活？',
  stats: [
    {value: '4 种', label: '编排模式', color: 'green'},
    {value: '3 层', label: '混合嵌套', color: 'red'},
    {value: '7 分钟', label: '看懂工业级', color: 'yellow'},
  ],
  layers: [
    {
      layer: 'L1 · 核心问题',
      name: 'L1 · 核心问题',
      desc: '一个 Agent 装不下时 · 谁决定下一步？',
      badge: 'WHY',
      color: 'hook',
      icon: '?',
    },
    {
      layer: 'L2 · Supervisor',
      name: 'L2 · Supervisor',
      desc: '总管 LLM 派单 · 米其林总厨拆任务',
      badge: 'BOSS',
      color: 'classifier',
      icon: '◆',
    },
    {
      layer: 'L3 · Workflow',
      name: 'L3 · Workflow',
      desc: '你的代码决定路径 · 装配流水线',
      badge: 'CODE',
      color: 'mode',
      icon: '⚙',
    },
    {
      layer: 'L4 · Handoff',
      name: 'L4 · Handoff',
      desc: '当前 Agent 自己交棒 · 急诊分诊接力',
      badge: 'PASS',
      color: 'allow',
      icon: '→',
    },
    {
      layer: 'L5 · Council',
      name: 'L5 · Council',
      desc: '并行投票 · 没人决定，靠汇总',
      badge: 'VOTE',
      color: 'deny',
      icon: '◯',
    },
    {
      layer: 'L6 · 混合编排',
      name: 'L6 · 混合编排',
      desc: 'VIP 客服系统 · 三种模式套娃实战',
      badge: 'HYBRID',
      color: 'dialog',
      icon: '★',
    },
  ],
  techTags: [
    'LangGraph',
    'Mastra v1',
    'OpenAI Agents SDK',
    'Multi-Agent Pattern',
    'Supervisor / Workflow',
  ],
  ghostCodeTop: `interface Orchestrator {
  decideNext(state, history): Agent
  execute(agent, input): Promise<Result>
  handoff?(from: Agent, to: Agent): void
}`,
  ghostCodeBottom: `// 真实项目里的混合编排
const supervisor = createSupervisor()
  .branch(query, freeform)
  .branch(transaction, workflow.with(council))`,
};

const metadata: VideoMetadata = {
  topic: 'Agent 编排 · 四种模式',
  duration: '7:09',
  summary:
    '一个 Agent 装不下复杂任务时就要拆成多个 Agent — 而拆完之后立刻冒出一个核心问题：谁来决定下一步谁干活？这一期把 Supervisor / Workflow / Handoff / Council 四种主流编排模式一次讲清楚，并展示真实项目里它们如何混着用。',
  videoPath: 'motion-canvas-videos/agent-orchestration/output/project.mp4',

  bilibili: {
    title: 'Agent 编排的四种模式：到底谁说了算？| 7 分钟看懂工业级多 Agent 系统',
    description: `一个 Agent 装不下复杂任务时，必须拆成多个 Agent — 谁来决定下一步谁干活？

四种主流编排模式一次讲清楚：Supervisor / Workflow / Handoff / Council，并用 VIP 客服系统的混合编排展示真实项目里怎么用。

00:00 客服 Agent 30 工具抽风现场
00:34 频道介绍
00:56 核心问题：谁决定下一步？
01:29 Supervisor 总管模式
02:23 Workflow 工作流模式
03:07 Handoff 交接模式
04:09 Council 议会模式
05:04 实际项目怎么选
05:40 VIP 客服系统混合编排
06:25 总结 + 下期预告`,
    tags: [
      'Agent 编排',
      'Multi-Agent',
      'LangGraph',
      'Mastra',
      'OpenAI Agents SDK',
      'AI 编程',
      'Supervisor Pattern',
      '工作流',
      'AI 应用开发',
      '编程教程',
      'AI Agent',
      '架构设计',
    ],
    category: '知识 · 科学科普',
  },

  youtube: {
    title:
      'Agent Orchestration · 4 Patterns Explained (Supervisor / Workflow / Handoff / Council)',
    description: `When a single Agent can't hold a complex task, you split it into multiple Agents — and immediately face the core question: who decides who acts next?

This episode covers the four mainstream orchestration patterns and shows how a real VIP customer-service system mixes them together.

⏱ Chapters
0:00 Hook · 30 tools chaos
0:34 Intro
0:56 The core question
1:29 Supervisor — boss LLM dispatches
2:23 Workflow — your code dictates the path
3:07 Handoff — current Agent passes the baton
4:09 Council — parallel agents, vote to merge
5:04 How to choose in real projects
5:40 VIP customer-service · hybrid orchestration
6:25 Summary

🔗 Open-source repo: https://github.com/luzhenqian/ai-coding-lab
📺 Channel: AI 编程实战 by Noah`,
    tags: [
      'agent orchestration',
      'multi-agent',
      'langgraph',
      'mastra',
      'openai agents sdk',
      'ai engineering',
      'supervisor pattern',
      'workflow',
      'ai coding',
      'noah',
    ],
    hashtags: ['AIAgent', 'LangGraph', 'Mastra'],
  },

  xiaohongshu: {
    title: 'AI Agent 一直抽风？教你 4 招治好',
    body: `🤯 你写了一个 AI 客服 Agent，塞了 30 个工具，结果它开始抽风 ——

查订单调成催发货
催发货跳改地址
🤔 问题不是模型不够聪明，是一个 Agent 干了三个 Agent 的活

✨ 那拆成多个 Agent 之后呢？谁先做、谁后做、谁说了算？
这就是今天的主角：Agent 编排 · 4 种模式

1️⃣ Supervisor 总管模式 — LLM 决定
2️⃣ Workflow 工作流 — 代码决定
3️⃣ Handoff 交接 — 当前 Agent 自己决定
4️⃣ Council 议会 — 并行不决定，靠汇总

🚀 真实项目里这 4 种是混着用的
完整 7 分钟视频在主页 ➡️`,
    topics: [
      'AI编程',
      'AIAgent',
      '程序员',
      'AI开发',
      'AI应用',
      'LangGraph',
      'Mastra',
      'AI工具',
      '后端开发',
      '编程学习',
    ],
  },

  wechatChannels: {
    title: 'Agent 编排：4 种模式',
    description: `一个 Agent 装不下复杂任务时怎么拆？拆完后谁决定下一步谁干活？

7 分钟讲清楚 Supervisor / Workflow / Handoff / Council 四种模式，并用 VIP 客服系统展示混合编排。

#AI编程 #AIAgent #LangGraph #Mastra #AI应用开发`,
    tags: ['AI编程', 'AIAgent', 'LangGraph', 'Mastra', 'AI应用开发', '后端架构'],
  },
};

export const ep04AgentOrchestration = {cover, metadata};
