import type {CoverContent, VideoMetadata} from '../types';

const cover: CoverContent = {
  variant: 'pipeline',
  theme: 'orange',
  series: 'CLAUDE CODE 源码深度解析',
  episode: 'EPISODE 01',
  titleHighlight: '512,000',
  titleRest: '行代码\n的 AI CLI 全景',
  subtitleLine1: [
    {text: '从泄露的 '},
    {text: '.map', accent: true},
    {text: ' 文件出发'},
  ],
  subtitleLine2: '拆解生产级 AI Agent 的完整架构蓝图',
  stats: [
    {value: '1,900', label: '源码文件', color: 'blue'},
    {value: '5 层', label: '架构分层', color: 'purple'},
    {value: '45+', label: 'Agent 工具', color: 'orange'},
  ],
  layers: [
    {
      layer: '入口层 · ENTRY',
      color: 'entry',
      modules: ['main.tsx', 'Commander.js', 'Ink Renderer'],
    },
    {
      layer: '命令层 · COMMANDS',
      color: 'commands',
      modules: ['commands.ts', '/commit', '/review', '/compact', '/insights', '50+ cmds'],
    },
    {
      layer: '工具层 · TOOLS',
      color: 'tools',
      modules: ['Tool.ts', 'tools.ts', 'Read', 'Write', 'Bash', 'Search', 'MCP'],
    },
    {
      layer: '🔥 引擎层 · ENGINE',
      color: 'engine',
      modules: ['QueryEngine.ts', 'query.ts', 'StreamingToolExecutor', 'async generator'],
    },
    {
      layer: '服务层 · SERVICES',
      color: 'services',
      modules: ['API Client', 'MCP Protocol', 'OAuth 2.0', 'Compact', 'LSP', 'Telemetry'],
    },
  ],
  techTags: [
    'Bun',
    'TypeScript',
    'React + Ink',
    'Zod v4',
    'MCP SDK',
    'OpenTelemetry',
  ],
  ghostCodeTop: `import { feature } from 'bun:bundle'
const coordinator = feature('COORD')
  ? require('./coordinator')
  : null`,
  ghostCodeBottom: `export function createStore<T>(
  initialState: T,
): Store<T> { ... }`,
};

const metadata: VideoMetadata = {
  topic: 'Claude Code 源码全景',
  duration: 'TBD',
  summary:
    '从泄露的 .map 文件出发，对 Anthropic Claude Code（512,000 行 AI CLI 源码）做架构级拆解 — 入口 / 命令 / 工具 / 引擎 / 服务 五层、1,900 个文件、45+ Agent 工具一次看清。',

  bilibili: {
    title: '50 万行代码的 AI CLI 全景：Claude Code 源码深度拆解 EP01',
    description: `Anthropic Claude Code 是市面上最贵也最复杂的 AI 编程工具之一。

借助一份意外泄露的 .map 文件，我们重建出 512,000 行源码的完整架构：
入口层 · 命令层 · 工具层 · 引擎层 · 服务层 — 5 层、1,900 文件、45+ Agent 工具。

这是源码深度解析系列的开篇，后续会逐层下钻每一个核心子系统。`,
    tags: [
      'Claude Code',
      'Anthropic',
      'AI Agent',
      '源码解析',
      'TypeScript',
      'AI 编程',
      'CLI',
      'Bun',
      'MCP',
      '架构设计',
      '逆向工程',
    ],
    category: '知识 · 科学科普',
  },

  youtube: {
    title:
      'Claude Code Source Map · 512K Lines of an AI CLI, Layer by Layer',
    description: `Anthropic Claude Code is one of the most expensive and complex AI coding tools shipped to date.

Using a leaked .map file, we reconstruct its full architecture: 512K lines, 1,900 files, 45+ Agent tools, organized across 5 layers (Entry · Commands · Tools · Engine · Services).

This kicks off a multi-episode source-code deep dive.`,
    tags: [
      'claude code',
      'anthropic',
      'ai agent',
      'source code',
      'reverse engineering',
      'typescript',
      'cli',
      'bun',
      'mcp protocol',
      'architecture',
    ],
    hashtags: ['ClaudeCode', 'Anthropic', 'AIAgent'],
  },

  xiaohongshu: {
    title: '50 万行 AI CLI 源码我帮你拆了',
    body: `Anthropic Claude Code — 当前最贵 AI 编程工具的真面目 ✨

🔍 借助一份泄露的 .map 文件，把 512,000 行源码完整还原成 5 层架构：

🎯 入口层 ENTRY · 1,900 个文件起点
🎮 命令层 COMMANDS · 50+ 命令系统
🔧 工具层 TOOLS · 45+ Agent 工具
🔥 引擎层 ENGINE · 流式状态机核心
📡 服务层 SERVICES · MCP / OAuth / LSP / Telemetry

下一期开始逐层下钻每个子系统 ➡️
关注主页不迷路`,
    topics: [
      'AI编程',
      'ClaudeCode',
      'Anthropic',
      '程序员',
      '源码解析',
      'TypeScript',
      'AI开发',
      'AIAgent',
      'CLI',
      '架构',
    ],
  },

  wechatChannels: {
    title: 'Claude Code 50 万行源码全景',
    description: `Anthropic Claude Code 完整架构拆解：5 层 · 1,900 文件 · 45+ Agent 工具，从泄露的 .map 文件还原。

这是源码深度解析系列开篇，后续逐层下钻。

#AI编程 #ClaudeCode #Anthropic #源码解析 #AIAgent`,
    tags: ['AI编程', 'ClaudeCode', 'Anthropic', '源码解析', 'AIAgent'],
  },
};

export const ep01Overview = {cover, metadata};
