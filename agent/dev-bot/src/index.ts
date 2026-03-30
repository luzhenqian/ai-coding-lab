import * as readline from 'node:readline';
import chalk from 'chalk';
import boxen from 'boxen';
import ora from 'ora';
import { Marked } from 'marked';
import { markedTerminal } from 'marked-terminal';
import type { Handler, Intent, Message, ConversationContext } from './types/index.js';
import { routeRequest } from './router/router-pipeline.js';
import { logRouteDecision, formatDebugPanel } from './utils/logger.js';
import { codeExplainer } from './handlers/code-explainer.js';
import { bugDetective } from './handlers/bug-detective.js';
import { codeGenerator } from './handlers/code-generator.js';
import { docSearcher } from './handlers/doc-searcher.js';
import { clarifier } from './handlers/clarifier.js';

// Markdown 终端渲染器
const marked = new Marked(markedTerminal() as any);

// 路由表：Intent → Handler
const routeTable = new Map<Intent, Handler>([
  ['code_explain', codeExplainer],
  ['bug_fix', bugDetective],
  ['code_generate', codeGenerator],
  ['doc_search', docSearcher],
  ['unclear', clarifier],
]);

// 动态注册新路由（预留扩展）
export function registerHandler(intent: Intent, handler: Handler) {
  routeTable.set(intent, handler);
}

// 对话历史
const messages: Message[] = [];
let lastWasClarifier = false;

// 统计流式输出的行数，用于清屏回写
function countLines(text: string, columns: number): number {
  let lines = 0;
  for (const line of text.split('\n')) {
    lines += Math.max(1, Math.ceil((line.length || 1) / columns));
  }
  return lines;
}

// 处理单次用户输入
async function processInput(input: string) {
  const isReroute = lastWasClarifier;
  const context: ConversationContext = {
    messages: [...messages],
    isReroute,
  };

  // 路由阶段 — 带 spinner
  const routeSpinner = ora({
    text: chalk.dim('正在分析意图...'),
    spinner: 'dots',
  }).start();

  const routeStart = performance.now();
  const routerResult = await routeRequest(input);
  const routeLatency = Math.round(performance.now() - routeStart);

  routeSpinner.stop();

  // 查找处理器
  const handler = routeTable.get(routerResult.intent);
  if (!handler) {
    console.error(chalk.red(`未找到处理器: ${routerResult.intent}`));
    return;
  }

  // 展示路由决策 Debug 面板
  const log = logRouteDecision(input, routerResult, handler.name, routeLatency);
  console.log('');
  console.log(formatDebugPanel(log));
  console.log('');

  // 流式输出处理器响应
  const { stream, fullText } = handler.handle(input, context);

  // 阶段 1：流式输出原始文本（实时显示 token）
  let streamedText = '';
  for await (const chunk of stream) {
    process.stdout.write(chunk);
    streamedText += chunk;
  }

  // 阶段 2：流完成后，清除原始文本，用 Markdown 渲染替换
  const columns = process.stdout.columns || 80;
  const lineCount = countLines(streamedText, columns);

  // 向上移动光标并清除流式输出的内容
  process.stdout.write(`\x1b[${lineCount}A`);  // 上移 N 行
  process.stdout.write('\x1b[0J');               // 清除从光标到屏幕底部

  // 渲染 Markdown 并输出
  const fullResponse = await fullText;
  const rendered = (marked.parse(fullResponse) as string).trimEnd();
  console.log(rendered);

  // 更新对话历史
  messages.push({ role: 'user', content: input });
  messages.push({ role: 'assistant', content: fullResponse, routing: routerResult });

  // 标记是否为 Clarifier 回复
  lastWasClarifier = routerResult.intent === 'unclear';
}

// 启动交互循环
function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Banner
  const banner = `${chalk.bold('🤖 DevBot — 开发者智能助手')}\n${chalk.dim('Agent 路由模式实战 (Routing Pattern)')}`;
  console.log('');
  console.log(boxen(banner, {
    padding: { top: 0, bottom: 0, left: 2, right: 2 },
    margin: { top: 0, bottom: 0, left: 0, right: 0 },
    borderStyle: 'double',
    borderColor: 'cyan',
    textAlignment: 'center',
  }));
  console.log('');
  console.log(chalk.dim('  输入你的开发问题，DevBot 会自动路由到最合适的专家处理。'));
  console.log(chalk.dim('  输入 "exit" 或 "quit" 退出。'));
  console.log('');

  const prompt = () => {
    rl.question(chalk.cyan.bold('❯ '), async (input) => {
      const trimmed = input.trim();

      if (!trimmed) {
        prompt();
        return;
      }

      if (trimmed === 'exit' || trimmed === 'quit') {
        console.log(chalk.dim('\n  再见！👋\n'));
        rl.close();
        return;
      }

      try {
        await processInput(trimmed);
      } catch (err) {
        console.error(chalk.red('\n  处理请求时出错:'), err instanceof Error ? err.message : err);
      }

      console.log('');
      prompt();
    });
  };

  prompt();
}

main();
