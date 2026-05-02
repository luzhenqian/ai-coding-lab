import type {CoverContent, VideoMetadata} from '../types';

const cover: CoverContent = {
  variant: 'pipeline',
  theme: 'emerald',
  series: 'CLAUDE CODE 源码深度解析',
  episode: 'EPISODE 03',
  titleHighlight: '工具系统',
  titleRest: 'AI 如何安全地操作世界',
  subtitleLine1: [
    {text: '45+', accent: true},
    {text: ' 工具定义 · '},
    {text: '6 层', accent: true},
    {text: '权限流水线'},
  ],
  subtitleLine2: '从并发编排到 DeepImmutable 安全模型',
  stats: [
    {value: '45+', label: 'Agent 工具', color: 'green'},
    {value: '6 层', label: '权限防线', color: 'red'},
    {value: '3 种', label: '处理器模式', color: 'yellow'},
  ],
  layers: [
    {
      layer: 'LAYER 1 · HOOK 预审',
      name: 'LAYER 1 · HOOK 预审',
      desc: 'PreToolUse hooks · shell 命令前置检查',
      badge: 'INTERCEPT',
      color: 'hook',
      icon: '⚡',
    },
    {
      layer: 'LAYER 2 · 自动分类器',
      name: 'LAYER 2 · 自动分类器',
      desc: 'BASH_CLASSIFIER · 命令安全自动判定',
      badge: 'AUTO',
      color: 'classifier',
      icon: '🤖',
    },
    {
      layer: 'LAYER 3 · ALWAYS DENY',
      name: 'LAYER 3 · ALWAYS DENY',
      desc: '不可覆盖的拒绝规则 · 策略/项目/用户三级来源',
      badge: 'BLOCK',
      color: 'deny',
      icon: '✕',
    },
    {
      layer: 'LAYER 4 · ALWAYS ALLOW',
      name: 'LAYER 4 · ALWAYS ALLOW',
      desc: '自动放行规则 · 匹配即通过',
      badge: 'PASS',
      color: 'allow',
      icon: '✓',
    },
    {
      layer: 'LAYER 5 · 权限模式',
      name: 'LAYER 5 · 权限模式',
      desc: 'default · plan · auto · bypassPermissions',
      badge: 'MODE',
      color: 'mode',
      icon: '⚙',
    },
    {
      layer: 'LAYER 6 · 交互式对话框',
      name: 'LAYER 6 · 交互式对话框',
      desc: '用户最终决策 · 允许 / 拒绝 / 总是允许',
      badge: 'HUMAN',
      color: 'dialog',
      icon: '👤',
    },
  ],
  techTags: [
    'Zod + JSON Schema',
    'DeepImmutable',
    'StreamingToolExecutor',
    'MCP Protocol',
    'ResolveOnce',
  ],
  ghostCodeTop: `type Tool<Input, Output> = {
  call(args, ctx): Promise<ToolResult>
  checkPermissions(input): PermissionResult
  isConcurrencySafe(input): boolean
}`,
  ghostCodeBottom: `canExecuteTool(safe: boolean) {
  return executing.length === 0 ||
    (safe && executing.every(t => t.safe))
}`,
};

const metadata: VideoMetadata = {
  topic: 'Claude Code 工具系统',
  duration: 'TBD',
  summary:
    'Claude Code 是怎么让 AI 安全地操作真实世界的？45+ 工具定义、6 层权限流水线、DeepImmutable 安全模型 — 一次拆开看清楚。',

  bilibili: {
    title: 'Claude Code 工具系统拆解：AI 如何安全地操作世界 | 6 层权限防线全解析',
    description: `Anthropic Claude Code 怎么让一个 AI Agent 安全地跑 shell、读写文件、调用 API？

这一期源码深度解析：45+ 工具定义、6 层权限流水线（HOOK → 分类器 → DENY → ALLOW → 模式 → 对话框）、DeepImmutable 安全模型、3 种处理器模式 — 一次讲清楚。

适合：AI 应用开发者 / Agent 框架研究者 / 安全敏感场景架构师`,
    tags: [
      'Claude Code',
      'Anthropic',
      'AI Agent',
      '工具系统',
      '权限',
      'AI 编程',
      '源码解析',
      'DeepImmutable',
      'MCP Protocol',
      'AI 安全',
      '架构设计',
      'TypeScript',
    ],
    category: '知识 · 科学科普',
  },

  youtube: {
    title:
      'Inside Claude Code · Tool System Deep Dive (45+ tools · 6-layer permissions · DeepImmutable)',
    description: `How does Claude Code let an AI safely run shell commands, read/write files, and hit APIs?

A source-code walkthrough: 45+ tool definitions, the 6-layer permission pipeline, the DeepImmutable safety model, and the three processor modes.

🔗 Repo: https://github.com/luzhenqian/ai-coding-lab`,
    tags: [
      'claude code',
      'anthropic',
      'ai agent',
      'tool calling',
      'permissions',
      'mcp protocol',
      'deepimmutable',
      'ai safety',
      'typescript',
      'source code review',
    ],
    hashtags: ['ClaudeCode', 'Anthropic', 'AIAgent'],
  },

  xiaohongshu: {
    title: 'AI Agent 怎么安全跑 shell？拆给你看',
    body: `Claude Code 这个 AI 工具能直接帮你写代码、跑命令、改文件 ——
你有没有想过它 凭什么 敢这么干？🤔

🔍 翻完源码，发现它有 6 层权限防线：

1️⃣ HOOK 预审：shell 命令先过一道用户钩子
2️⃣ 自动分类器：危险命令自动判定
3️⃣ ALWAYS DENY：策略级硬拒绝
4️⃣ ALWAYS ALLOW：白名单放行
5️⃣ 权限模式：plan / auto / bypass 切换
6️⃣ 对话框：最后让你拍板

加上 DeepImmutable 安全模型 + 45+ 工具定义
这才是工业级 AI Agent 的样子 ✨

完整源码拆解视频在主页 ➡️`,
    topics: [
      'AI编程',
      'ClaudeCode',
      'AIAgent',
      '程序员',
      'AI开发',
      '源码',
      'TypeScript',
      'AI工具',
      'AI安全',
      '架构',
    ],
  },

  wechatChannels: {
    title: 'Claude Code 工具系统拆解',
    description: `AI Agent 怎么安全操作真实世界？

Claude Code 源码深度解析：45+ 工具定义、6 层权限流水线、DeepImmutable 安全模型一次看清楚。

#AI编程 #ClaudeCode #AIAgent #源码解析 #AI安全`,
    tags: ['AI编程', 'ClaudeCode', 'AIAgent', '源码解析', 'AI安全', 'Anthropic'],
  },
};

export const ep03ToolSystem = {cover, metadata};
