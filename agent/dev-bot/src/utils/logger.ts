import chalk from 'chalk';
import boxen from 'boxen';
import Table from 'cli-table3';
import type { RouteLog, RouterResult } from '../types/index.js';

// 路由日志存储
const logs: RouteLog[] = [];

// 记录路由决策
export function logRouteDecision(
  input: string,
  result: RouterResult,
  handlerName: string,
  latencyMs: number,
): RouteLog {
  const entry: RouteLog = {
    timestamp: new Date(),
    inputPreview: input.slice(0, 100),
    ruleMatch: result.routedBy === 'rule',
    routerResult: result,
    handlerName,
    latencyMs,
  };
  logs.push(entry);
  return entry;
}

// 获取所有日志
export function getLogs(): RouteLog[] {
  return logs;
}

// 意图配置：emoji + 中文名 + 颜色
const INTENT_CONFIG: Record<string, { emoji: string; label: string; color: (s: string) => string }> = {
  code_explain: { emoji: '🔍', label: '代码解释', color: chalk.cyan },
  bug_fix:      { emoji: '🐛', label: 'Bug 修复',  color: chalk.red },
  code_generate:{ emoji: '📝', label: '代码生成', color: chalk.green },
  doc_search:   { emoji: '📚', label: '文档检索', color: chalk.blue },
  unclear:      { emoji: '🤔', label: '需要澄清', color: chalk.yellow },
};

function formatConfidence(confidence: number): string {
  const pct = `${(confidence * 100).toFixed(0)}%`;
  if (confidence >= 0.8) return chalk.green.bold(pct);
  if (confidence >= 0.7) return chalk.yellow.bold(pct);
  return chalk.red.bold(pct);
}

// Debug 面板：使用 boxen + cli-table3 格式化路由决策
export function formatDebugPanel(log: RouteLog): string {
  const config = INTENT_CONFIG[log.routerResult.intent] ?? { emoji: '❓', label: '未知', color: chalk.gray };

  const table = new Table({
    chars: {
      'top': '', 'top-mid': '', 'top-left': '', 'top-right': '',
      'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
      'left': '', 'left-mid': '', 'mid': '', 'mid-mid': '',
      'right': '', 'right-mid': '', 'middle': ' ',
    },
    style: { 'padding-left': 1, 'padding-right': 1 },
    colWidths: [12, null],
  });

  table.push(
    [chalk.dim('路由层'), log.ruleMatch ? chalk.green.bold('⚡ 规则命中') : chalk.yellow.bold('🧠 LLM 分类')],
    [chalk.dim('意图'),   `${config.emoji}  ${config.color(config.label)} ${chalk.dim(`(${log.routerResult.intent})`)}`],
    [chalk.dim('置信度'), formatConfidence(log.routerResult.confidence)],
    [chalk.dim('处理器'), chalk.white.bold(log.handlerName)],
    [chalk.dim('耗时'),   log.latencyMs < 10 ? chalk.green(`${log.latencyMs}ms`) : chalk.yellow(`${log.latencyMs}ms`)],
  );

  if (log.routerResult.reasoning) {
    table.push(
      [chalk.dim('推理'), chalk.dim(log.routerResult.reasoning)],
    );
  }

  return boxen(table.toString(), {
    title: chalk.cyan.bold('路由决策'),
    titleAlignment: 'left',
    padding: { top: 0, bottom: 0, left: 1, right: 1 },
    margin: { top: 0, bottom: 0, left: 0, right: 0 },
    borderStyle: 'round',
    borderColor: 'cyan',
    dimBorder: true,
  });
}
