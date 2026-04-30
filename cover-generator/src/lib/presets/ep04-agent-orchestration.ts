import type {CoverContent} from '../types';

export const ep04AgentOrchestration: CoverContent = {
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
