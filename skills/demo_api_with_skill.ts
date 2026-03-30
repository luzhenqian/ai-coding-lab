/**
 * ============================================================================
 * 演示：通过 Anthropic Messages API 调用 Claude，并将 Skill 注入到系统提示词中
 * ============================================================================
 *
 * 【核心原理】
 * Skill 在 Claude Code 里是自动加载的，但通过 API 调用时，我们需要手动完成这个过程：
 *   1. 读取 SKILL.md 文件内容
 *   2. 将 skill 内容注入到 system prompt（系统提示词）中
 *   3. Claude 会严格按照 skill 里的规范来执行任务
 *
 * 这就像你在餐厅里把菜谱递给厨师——厨师（Claude）拿到菜谱（Skill）后，
 * 就知道该按什么标准来做菜了。
 *
 * 【提示词缓存（Prompt Caching）】
 * 当你多次调用同一个 skill 时，每次都要把 skill 内容发送给 API，这很浪费。
 * Anthropic 提供了 Prompt Caching 功能：
 *   - 首次调用：全价计费，skill 内容被缓存（费用 1.25x）
 *   - 后续调用：命中缓存，只收 0.1x 的费用（节省约 90%）
 *   - 缓存有效期：默认 5 分钟，每次命中自动续期；也可设为 1 小时
 *
 * 【运行方式】
 *   npx tsx demo_api_with_skill.ts
 *
 * 【前置条件】
 *   npm install
 *   复制 .env.example 为 .env，填入你的 API Key
 */

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

// ---------------------------------------------------------------------------
// 加载 .env 环境变量
// ---------------------------------------------------------------------------

// dotenv 会读取项目根目录下的 .env 文件，将其中的变量注入 process.env
// 这样就不需要每次手动 export ANTHROPIC_API_KEY 了
config();

// ---------------------------------------------------------------------------
// 路径配置
// ---------------------------------------------------------------------------

// 获取当前脚本所在的目录（ESM 模块没有 __dirname，需要手动构造）
const __dirname = dirname(fileURLToPath(import.meta.url));

// Skills 存放的根目录
const SKILLS_DIR = join(__dirname, ".claude", "skills");

// 从环境变量读取模型 ID，默认使用 claude-opus-4-6
// 你可以在 .env 中设置 MODEL_ID 来切换模型，比如 claude-sonnet-4-6
const MODEL_ID = process.env.MODEL_ID || "claude-opus-4-6";

/**
 * 创建 Anthropic 客户端。
 *
 * 支持通过 .env 配置：
 *   - ANTHROPIC_API_KEY：API 密钥（必填）
 *   - ANTHROPIC_BASE_URL：自定义 API 地址（可选，用于代理或兼容服务）
 *
 * 【为什么需要 baseURL？】
 * 有些场景下你可能不直接访问 Anthropic 官方 API：
 *   - 使用代理服务（比如国内网络环境需要中转）
 *   - 使用兼容 Anthropic API 的第三方服务
 *   - 企业内部的 API 网关
 * 这时候只需要在 .env 里设置 ANTHROPIC_BASE_URL 即可，代码不用改。
 */
function createClient(): Anthropic {
  const options: ConstructorParameters<typeof Anthropic>[0] = {};

  // 如果设置了自定义 base URL，传给客户端
  if (process.env.ANTHROPIC_BASE_URL) {
    options.baseURL = process.env.ANTHROPIC_BASE_URL;
  }

  return new Anthropic(options);
}

// ---------------------------------------------------------------------------
// 工具函数：加载和组装 Skill
// ---------------------------------------------------------------------------

/**
 * 读取指定 skill 的 SKILL.md 文件内容。
 *
 * @param skillName - skill 文件夹名称，例如 "chinese-blog-writer"
 * @returns SKILL.md 的完整文本内容
 * @throws 如果文件不存在，抛出错误
 *
 * 【原理】
 * 在 Claude Code 里，这一步是自动完成的——CLI 会扫描 .claude/skills/ 目录，
 * 读取 SKILL.md 的 name 和 description 来判断是否需要加载。
 * 通过 API 调用时，我们需要自己完成这个读取过程。
 */
function loadSkill(skillName: string): string {
  const skillPath = join(SKILLS_DIR, skillName, "SKILL.md");

  if (!existsSync(skillPath)) {
    throw new Error(
      `Skill 不存在：${skillPath}\n` +
        `请确认 .claude/skills/${skillName}/SKILL.md 文件已创建。`,
    );
  }

  return readFileSync(skillPath, "utf-8");
}

/**
 * 将多个 skill 组合成系统提示词的文本块数组。
 *
 * 【为什么用数组格式而不是拼接成一个字符串？】
 * Anthropic Messages API 的 system 参数支持两种格式：
 *   1. 纯字符串：system: "你是一个助手..."
 *   2. 内容块数组：system: [{ type: "text", text: "...", cache_control: ... }]
 *
 * 数组格式的优势：
 *   - 可以对每个块单独设置 cache_control（提示词缓存）
 *   - 静态内容（skill 规范）和动态内容（当前任务上下文）可以分开管理
 *   - 缓存粒度更细，命中率更高
 *
 * 【缓存排列顺序很重要】
 * Anthropic 的缓存是前缀匹配（prefix matching）：
 *   tools → system → messages
 * 所以要把最稳定、不会变的内容放在最前面（比如 skill 规范），
 * 把会变的内容放在后面（比如动态上下文）。
 * 这样即使后面的内容变了，前面的缓存依然有效。
 *
 * @param skillNames - 要加载的 skill 名称列表
 * @returns Anthropic API 格式的 TextBlockParam 数组
 */
function buildSystemBlocks(
  ...skillNames: string[]
): Anthropic.TextBlockParam[] {
  const blocks: Anthropic.TextBlockParam[] = [];

  // 第一个块：基础角色设定（不缓存，因为内容很短，不值得缓存）
  blocks.push({
    type: "text",
    text: "你是一个专业的 AI 助手。请严格按照下方 <skill> 标签中的技能规范来完成用户的任务。",
  });

  // 后续块：每个 skill 单独一个块
  // 用 <skill> XML 标签包裹，方便 Claude 区分不同技能的指令边界
  for (const name of skillNames) {
    const content = loadSkill(name);
    blocks.push({
      type: "text",
      text: `<skill name="${name}">\n${content}\n</skill>`,
      // 【提示词缓存】
      // cache_control 告诉 API：这块内容是稳定的，请缓存它
      // "ephemeral" 类型：默认缓存 5 分钟，每次命中自动续期
      // 也可以设置 ttl: "1h" 来延长到 1 小时
      cache_control: { type: "ephemeral" },
    });
  }

  return blocks;
}

// ---------------------------------------------------------------------------
// 示例 1：基础调用 — 加载单个 Skill 生成博客（流式输出）
// ---------------------------------------------------------------------------

/**
 * 【示例 1：基础调用（流式输出）】
 *
 * 最简单的用法：读取 chinese-blog-writer skill，生成一篇技术博客。
 *
 * 流程：
 *   1. loadSkill() 读取 SKILL.md 文件
 *   2. buildSystemBlocks() 组装成 system prompt 的内容块
 *   3. client.messages.stream() 发送流式 API 请求
 *   4. 遍历 SSE 事件流，实时打印文本增量
 *
 * 【为什么用流式而不是非流式？】
 *   - 用户体验更好——不用盯着空白屏幕等 30-60 秒
 *   - 避免 HTTP 超时——非流式请求如果输出很长，可能超过 SDK 的超时限制
 *   - 可以提前中断——如果发现输出方向不对，可以随时终止
 *
 * 【API 区别】
 *   - 非流式：client.messages.create() → 等全部生成完，返回完整 Message
 *   - 流式：  client.messages.stream() → 逐字返回 SSE 事件流
 *
 * 【流式事件类型】
 *   - message_start：消息开始
 *   - content_block_start：内容块开始（可能是 text 或 thinking）
 *   - content_block_delta：增量内容（每个 token 一个事件）
 *   - content_block_stop：内容块结束
 *   - message_delta：消息级更新（包含 stop_reason 和 usage）
 *   - message_stop：消息结束
 *
 * 【关于 thinking（思考模式）】
 * 设置 thinking: { type: "adaptive" } 让 Claude 自己决定是否需要深度思考。
 * 对于复杂的写作任务，Claude 可能会先思考文章结构再开始写，
 * 这通常能产生质量更高的输出。
 */
async function demoBasic(): Promise<void> {
  console.log("=".repeat(60));
  console.log("示例 1：基础调用 — 中文博客生成器");
  console.log("=".repeat(60));

  // 创建 Anthropic 客户端（支持 .env 中的 ANTHROPIC_BASE_URL）
  const client = createClient();

  // 组装系统提示词：加载 chinese-blog-writer skill
  const systemBlocks = buildSystemBlocks("chinese-blog-writer");

  console.log(`\n[配置] 模型: ${MODEL_ID}`);
  console.log(
    `[配置] Base URL: ${process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com (默认)"}`,
  );
  console.log(
    `[配置] Skill 内容长度: ${systemBlocks.map((b) => b.text.length).join(" + ")} 字符`,
  );
  console.log("[状态] 正在调用 API（流式输出）...\n");

  // 使用流式调用——内容会逐字打印，不用等整个博客生成完
  // 非流式的 create() 在长文本场景下可能要等 30-60 秒才有输出，
  // 用户会以为卡住了。流式输出几秒就能看到第一个字。
  const stream = client.messages.stream({
    model: MODEL_ID,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: systemBlocks,
    messages: [
      {
        role: "user",
        content:
          "帮我写一篇技术博客，主题是 Claude Skills，" +
          "要点包括：什么是 skill、skill 的文件结构、如何创建自定义 skill。",
      },
    ],
  });

  // 遍历流式事件，实时打印文本增量
  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      process.stdout.write(event.delta.text);
    }
  }

  // 流式结束后获取完整消息，打印 token 用量
  const finalMessage = await stream.finalMessage();
  console.log(
    `\n\n[Token 用量] 输入: ${finalMessage.usage.input_tokens}, ` +
      `输出: ${finalMessage.usage.output_tokens}`,
  );
}

// ---------------------------------------------------------------------------
// 示例 2：多 Skill 组合 — 同时加载博客生成器和 Commit 规范
// ---------------------------------------------------------------------------

/**
 * 【示例 2：多 Skill 组合】
 *
 * Skill 的设计哲学之一是"组合优于巨型"——
 * 不要做一个什么都能干的超级 skill，而是做多个聚焦的小 skill，
 * 在需要的时候组合使用。
 *
 * 这个示例同时加载两个 skill：
 *   - chinese-blog-writer：控制博客的写作风格和结构
 *   - commit-msg：控制 git commit message 的格式规范
 *
 * Claude 会在同一次对话中同时遵循两个 skill 的规范。
 *
 * 【缓存优化】
 * 因为每个 skill 是独立的 system block，且都标记了 cache_control，
 * 所以缓存是按块独立管理的。即使你下次只加载其中一个 skill，
 * 只要内容没变，之前的缓存依然有效。
 */
async function demoMultiSkill(): Promise<void> {
  console.log("\n" + "=".repeat(60));
  console.log("示例 2：多 Skill 组合 — 博客 + Commit Message");
  console.log("=".repeat(60));

  const client = createClient();

  // 同时加载两个 skill——buildSystemBlocks 接受可变参数
  const systemBlocks = buildSystemBlocks("chinese-blog-writer", "commit-msg");

  const stream = client.messages.stream({
    model: MODEL_ID,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: systemBlocks,
    messages: [
      {
        role: "user",
        content:
          "我做了两件事：\n" +
          "1. 写了一个 Redis 缓存模块，帮我写一篇技术博客分享。\n" +
          "2. 代码已经 git add 了，帮我生成 commit message。\n" +
          "git diff --staged 如下：\n" +
          "```\n" +
          "new file: src/cache/redis_client.py\n" +
          "+class RedisCache:\n" +
          '+    """Redis 缓存封装，支持过期时间和批量操作。"""\n' +
          "+    def __init__(self, host, port, db):\n" +
          "+        self.client = redis.Redis(host, port, db)\n" +
          "+    def get(self, key): ...\n" +
          "+    def set(self, key, value, ttl=None): ...\n" +
          "+    def batch_get(self, keys): ...\n" +
          "```",
      },
    ],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      process.stdout.write(event.delta.text);
    }
  }
  console.log();
}

// ---------------------------------------------------------------------------
// 示例 3：Prompt Caching — 多次调用同一 Skill 的成本优化
// ---------------------------------------------------------------------------

/**
 * 【示例 3：Prompt Caching（提示词缓存）】
 *
 * 当你的应用会多次调用同一个 skill 时（比如发票生成器每天要生成几十张发票），
 * 每次都把 skill 内容发送给 API 会产生重复的 token 费用。
 *
 * Prompt Caching 的工作原理：
 *   1. 第一次请求：API 处理完整的 skill 内容，并在服务端缓存（写入费用 1.25x）
 *   2. 后续请求：如果 system prompt 的内容完全一致，API 直接从缓存读取（读取费用 0.1x）
 *   3. 综合下来，重复调用可以节省约 90% 的输入 token 成本
 *
 * 【缓存的前提条件】
 *   - 内容必须 100% 一致（包括空格和换行），任何修改都会导致缓存失效
 *   - 有最小 token 数要求（Opus: 4096, Sonnet: 2048），太短的内容不值得缓存
 *   - 缓存层级：tools → system → messages，前面的缓存不受后面内容变化影响
 *
 * 【如何验证缓存是否命中？】
 * 检查 response.usage 中的字段：
 *   - cache_creation_input_tokens > 0 → 首次缓存写入
 *   - cache_read_input_tokens > 0    → 缓存命中！
 *   - input_tokens                    → 未缓存的 token 数
 */
async function demoCaching(): Promise<void> {
  console.log("\n" + "=".repeat(60));
  console.log("示例 3：Prompt Caching — 多次调用发票生成器");
  console.log("=".repeat(60));

  const client = createClient();

  // 读取发票生成器 skill 的内容
  const skillContent = loadSkill("invoice-generator");

  // 构建带缓存的 system prompt
  // 注意：这里手动构建而不是用 buildSystemBlocks，
  // 是为了演示更精细的缓存控制
  const systemBlocks: Anthropic.TextBlockParam[] = [
    {
      type: "text",
      text: "你是一个专业的发票生成助手。请严格按照以下技能规范来完成任务。",
    },
    {
      type: "text",
      text: `<skill name="invoice-generator">\n${skillContent}\n</skill>`,
      // 标记为可缓存——这是关键！
      // 这个块的内容（skill 规范）在多次调用间不会变化，
      // 所以非常适合缓存
      cache_control: { type: "ephemeral" },
    },
  ];

  // 模拟连续两次不同的发票请求
  // 两次请求用的 system prompt 完全一致，所以第二次会命中缓存
  const invoiceRequests = [
    "帮我开一张发票，客户是杭州云端数据有限公司，" +
      "服务项目：小程序开发 ¥15,000，UI 设计 ¥5,000，税率 6%。",
    "再开一张发票，客户是北京字节未来科技有限公司，" +
      "AI 咨询服务 80 小时，时薪 ¥300，不含税。",
  ];

  for (let i = 0; i < invoiceRequests.length; i++) {
    console.log(`\n--- 第 ${i + 1} 次调用 ---`);

    // 使用流式输出——实时打印发票内容
    const stream = client.messages.stream({
      model: MODEL_ID,
      max_tokens: 16000,
      system: systemBlocks, // 每次传入相同的 system blocks
      messages: [{ role: "user", content: invoiceRequests[i] }],
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        process.stdout.write(event.delta.text);
      }
    }

    // 流式结束后获取完整消息，打印 token 用量和缓存信息
    const finalMessage = await stream.finalMessage();
    const usage = finalMessage.usage;
    console.log(
      `\n[Token] 输入: ${usage.input_tokens}, 输出: ${usage.output_tokens}`,
    );

    // 检查缓存状态
    const cacheRead = (usage as any).cache_read_input_tokens ?? 0;
    const cacheCreate = (usage as any).cache_creation_input_tokens ?? 0;

    if (cacheCreate > 0) {
      console.log(
        `[缓存] 写入缓存: ${cacheCreate} tokens（首次调用，1.25x 费率）`,
      );
    }
    if (cacheRead > 0) {
      console.log(
        `[缓存] 命中缓存: ${cacheRead} tokens（0.1x 费率，节省约 90%！）`,
      );
    }
    if (cacheCreate === 0 && cacheRead === 0) {
      console.log("[缓存] 未触发缓存（可能 skill 内容低于最小缓存 token 数）");
    }
  }
}

// ---------------------------------------------------------------------------
// 示例 4：多轮对话 — Skill 在对话上下文中持续生效
// ---------------------------------------------------------------------------

/**
 * 【示例 4：多轮对话】
 *
 * Anthropic Messages API 是无状态的（stateless），
 * 也就是说每次请求你都要把完整的对话历史发送过去。
 *
 * 对于 skill 的场景，这意味着：
 *   - system prompt（包含 skill 内容）在每次请求中都要传
 *   - 但因为有 Prompt Caching，重复的 system prompt 不会额外计费
 *   - 对话历史（messages）会越来越长，但这是 API 的正常工作方式
 *
 * 【对话消息的规则】
 *   - messages 数组中 role 必须在 "user" 和 "assistant" 之间交替
 *   - 第一条消息必须是 "user"
 *   - 发送上一轮的 assistant 回复时，要保留完整的 content 数组
 *    （不要只提取文本，否则 thinking block 等会丢失）
 */
async function demoMultiTurn(): Promise<void> {
  console.log("\n" + "=".repeat(60));
  console.log("示例 4：多轮对话 — Skill 持续生效");
  console.log("=".repeat(60));

  const client = createClient();
  const systemBlocks = buildSystemBlocks("chinese-blog-writer");

  // 用数组维护对话历史
  const messages: Anthropic.MessageParam[] = [];

  // 定义多轮对话的用户消息
  const userMessages = [
    "帮我写一篇关于 WebSocket 的技术博客的大纲",
    "很好，现在把第一部分'核心概念'展开写完整",
    "再把'实战演示'部分也写出来，用 Node.js 做例子",
  ];

  for (const userMsg of userMessages) {
    console.log(`\n👤 用户：${userMsg}\n`);

    // 将用户消息加入历史
    messages.push({ role: "user", content: userMsg });

    // 发送请求——每次都传完整的 system blocks 和 messages 历史
    // 使用流式输出，实时打印回复
    const stream = client.messages.stream({
      model: MODEL_ID,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      system: systemBlocks,
      messages: messages,
    });

    process.stdout.write("🤖 Claude：");
    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        process.stdout.write(event.delta.text);
      }
    }

    // 【关键】将 assistant 的完整回复加入历史
    // 必须用 finalMessage().content（完整数组），不要只传文本字符串
    // 因为 content 中可能包含 thinking block，在多轮对话中需要保留
    const finalMessage = await stream.finalMessage();
    messages.push({ role: "assistant", content: finalMessage.content });

    console.log(
      `\n[Token] 输入: ${finalMessage.usage.input_tokens}, ` +
        `输出: ${finalMessage.usage.output_tokens}`,
    );
  }
}

// ---------------------------------------------------------------------------
// 主入口
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  // 检查 API Key 是否设置
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      "❌ 请先设置环境变量：export ANTHROPIC_API_KEY='your-api-key'",
    );
    process.exit(1);
  }

  // 检查 skill 文件是否存在
  console.log("📋 检查 Skill 文件：\n");
  const skills = ["chinese-blog-writer", "commit-msg", "invoice-generator"];
  for (const skill of skills) {
    const path = join(SKILLS_DIR, skill, "SKILL.md");
    const exists = existsSync(path);
    console.log(`  ${exists ? "✓" : "✗"} ${skill}`);
  }
  console.log();

  // ========================================================================
  // 取消注释你想运行的示例
  // ========================================================================

  await demoBasic(); // 示例 1：基础调用（流式输出）
  // await demoMultiSkill();   // 示例 2：多 skill 组合
  // await demoCaching();      // 示例 3：提示词缓存
  // await demoMultiTurn();    // 示例 4：多轮对话
}

main().catch(console.error);
