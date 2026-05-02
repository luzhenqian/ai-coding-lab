import type {CoverContent, VideoMetadata} from '../types';

const cover: CoverContent = {
  variant: 'state-machine',
  theme: 'indigo',
  series: 'CLAUDE CODE 源码深度解析',
  episode: 'EPISODE 02',
  titleHighlight: '查询引擎',
  titleRest: '一次对话的完整生命周期',
  subtitleLine1: [
    {text: '深入 '},
    {text: 'QueryEngine.ts', accent: true},
    {text: ' + '},
    {text: 'query.ts', accent: true},
  ],
  subtitleLine2: '异步生成器驱动的流式状态机',
  stats: [
    {value: '3,024', label: '核心代码行', color: 'indigo'},
    {value: '4 级', label: '恢复策略', color: 'cyan'},
    {value: '∞', label: '流式循环', color: 'amber'},
  ],
  // State-machine variant doesn't use `layers`. Coordinates below live in
  // a 460×500 area on the right side of the canvas.
  stateNodes: [
    {
      id: 'stream',
      label: '⚡ API Streaming',
      position: [155, 0],
      color: 'primary',
      emphasis: 'primary',
    },
    {
      id: 'tool',
      label: '🔧 Tool Execute',
      position: [20, 100],
      color: 'success',
    },
    {
      id: 'inject',
      label: 'inject results',
      position: [310, 100],
      color: 'success',
      fontSize: 10,
    },
    {
      id: 'recovery',
      label: '⚠️ Recovery Check',
      position: [155, 210],
      color: 'warning',
      fontSize: 10,
    },
    {
      id: 'escalate',
      label: '↑ 64K Tokens',
      position: [10, 300],
      color: 'danger',
      fontSize: 9,
    },
    {
      id: 'compact',
      label: '🗜 Compact',
      position: [170, 300],
      color: 'danger',
      fontSize: 9,
    },
    {
      id: 'fallback',
      label: '↻ Fallback',
      position: [330, 300],
      color: 'danger',
      fontSize: 9,
    },
    {
      id: 'complete',
      label: '✓ Complete',
      position: [160, 410],
      color: 'final',
      emphasis: 'final',
    },
  ],
  stateEdges: [
    // Stream → Tool
    {path: 'M 180 40 Q 100 70 100 95', color: 'success'},
    // Stream → Inject (dashed peek)
    {path: 'M 280 40 Q 360 70 360 95', color: 'success', style: 'dashed'},
    // Tool → Inject
    {path: 'M 170 115 L 300 115', color: 'success'},
    // Inject → Stream (loop back, dashed)
    {path: 'M 420 95 Q 450 50 310 25', color: 'primary', style: 'dashed'},
    // Stream → Recovery
    {path: 'M 230 40 L 230 200', color: 'warning'},
    // Recovery → Escalate
    {path: 'M 180 230 Q 100 270 80 295', color: 'danger'},
    // Recovery → Compact
    {path: 'M 230 245 L 230 295', color: 'danger'},
    // Recovery → Fallback
    {path: 'M 280 230 Q 340 270 350 295', color: 'danger'},
    // Escalate → Stream (dashed long loop back)
    {path: 'M 40 295 Q 10 160 155 30', color: 'primary', style: 'dashed'},
    // Compact → Complete
    {path: 'M 230 330 Q 230 380 230 400', color: 'final'},
  ],
  streamingLines: true,
  yieldBadge: 'yield* → yield* → yield*',
  techTags: [
    'async function*',
    'yield*',
    'AbortController',
    'State Machine',
    'Recovery',
    'Streaming',
  ],
  ghostCodeTop: `async function* query(params) {
  const terminal = yield* queryLoop()
  return terminal
}`,
  ghostCodeBottom: `while (true) {
  const stream = await api.stream()
  yield* processStream(stream)
}`,
};

const metadata: VideoMetadata = {
  topic: 'Claude Code 查询引擎 · 流式状态机',
  duration: 'TBD',
  summary:
    'Claude Code 一次对话的背后，是一个由 async generator 驱动的流式状态机 — 3,024 行核心代码、4 级恢复策略、无限流式循环。这一期把 QueryEngine.ts + query.ts 完整拆开。',

  bilibili: {
    title: '一次对话的完整生命周期：Claude Code 查询引擎深度解析 EP02',
    description: `Claude Code 一次对话从你按下 Enter 到拿到结果，背后到底跑了什么？

QueryEngine.ts + query.ts 一共 3,024 行核心代码，由异步生成器（async function*）驱动，构成一个流式状态机：API Streaming → Tool Execute → 注入结果 → 循环回流；遇到上下文超限时 4 级 fallback（升级到 64K Tokens / Compact 压缩 / 降级 Fallback）。

这一期把整个引擎一帧一帧拆开。`,
    tags: [
      'Claude Code',
      'Anthropic',
      'AI Agent',
      '查询引擎',
      'async generator',
      '状态机',
      '源码解析',
      'TypeScript',
      'Streaming',
      'AI 编程',
      '架构',
    ],
    category: '知识 · 科学科普',
  },

  youtube: {
    title:
      'Claude Code Query Engine · A Streaming State Machine Driven by async function*',
    description: `What actually runs between you pressing Enter and getting a response in Claude Code?

QueryEngine.ts + query.ts (3,024 LOC) form a streaming state machine driven entirely by async generators: API Streaming → Tool Execute → inject results → loop back. Plus 4 levels of recovery (escalate to 64K, Compact, Fallback) when context blows up.

A frame-by-frame walkthrough.`,
    tags: [
      'claude code',
      'query engine',
      'async generator',
      'state machine',
      'streaming',
      'typescript',
      'ai agent',
      'source code',
      'recovery',
    ],
    hashtags: ['ClaudeCode', 'AIAgent', 'StateMachine'],
  },

  xiaohongshu: {
    title: 'AI 一次对话背后跑了什么？',
    body: `Claude Code 一次对话从按 Enter 到出结果，
中间这 3,024 行代码到底干了啥？🤔

✨ 一个由 async generator 驱动的流式状态机

⚡ API Streaming（流式输出）
🔧 Tool Execute（工具调用）
↻ 注入结果回流（再次进入流）
⚠️ 4 级恢复策略（64K → Compact → Fallback → Complete）

整个引擎是一个 yield* 串起来的无限循环 ♾️

完整源码逐帧拆解视频在主页 ➡️`,
    topics: [
      'AI编程',
      'ClaudeCode',
      'AIAgent',
      '源码解析',
      'TypeScript',
      'asyncgenerator',
      '状态机',
      '程序员',
      '后端开发',
      '编程学习',
    ],
  },

  wechatChannels: {
    title: 'Claude Code 查询引擎拆解',
    description: `一次对话背后跑了什么？3,024 行 async generator + 4 级恢复策略，构成一个流式状态机。

QueryEngine.ts + query.ts 完整拆开。

#AI编程 #ClaudeCode #源码解析 #StateMachine`,
    tags: ['AI编程', 'ClaudeCode', '源码解析', '状态机', 'AIAgent'],
  },
};

export const ep02QueryEngine = {cover, metadata};
