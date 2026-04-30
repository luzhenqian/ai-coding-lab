import type {CoverContent} from '../types';

/** Original mockup content — kept here so it stays accessible after default-content.ts is rewritten for newer episodes. */
export const ep03ToolSystem: CoverContent = {
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
