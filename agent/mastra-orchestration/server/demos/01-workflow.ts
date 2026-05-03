/**
 * 01-Workflow: 博客发布流水线
 *
 * 编排模式: Workflow（工作流）
 * 核心特征: 路径写死在代码里，步骤严格串行，每步输出是下一步的输入
 * 流程: 写作 Agent → SEO Agent → 社媒 Agent
 */
import { Agent } from "@mastra/core/agent";
import { model } from "../config.js";
import type { Demo, EmitFn } from "../types.js";

// --- 定义三个专职 Agent，各自负责流水线中的一个环节 ---

// 写作 Agent: 根据主题生成博客初稿
const writerAgent = new Agent({
  id: "writer",
  name: "writer",
  model,
  instructions: `You are a professional blog writer. Given a topic, write a blog post of about 300 words in Markdown format. Include a compelling title, clear structure with headings, and actionable insights. Write in a conversational yet informative tone.`,
});

// SEO Agent: 优化标题/关键词/meta，输出结构化 JSON
const seoAgent = new Agent({
  id: "seo",
  name: "seo",
  model,
  instructions: `You are an SEO specialist. Given a blog article, optimize it and output ONLY valid JSON (no markdown code fences):
{"title": "SEO-optimized title", "keywords": ["keyword1", "keyword2", ...], "metaDescription": "150-char meta description", "optimizedArticle": "the full article with SEO improvements"}`,
});

// 社媒 Agent: 根据文章生成各平台的发布文案
const socialAgent = new Agent({
  id: "social",
  name: "social",
  model,
  instructions: `You are a social media copywriter. Given a blog article, create social media posts and output ONLY valid JSON (no markdown code fences):
{"twitter": "Tweet under 280 characters with hashtags", "xiaohongshu": "小红书 post with emoji-rich hook and body, under 500 chars"}`,
});

// 流式调用 Agent 并实时推送文本到前端
async function streamAgent(
  agent: Agent,
  messages: { role: "user"; content: string }[],
  nodeId: string,
  emit: EmitFn,
): Promise<string> {
  const result = await agent.stream(messages);
  let fullText = "";
  for await (const chunk of result.textStream) {
    fullText += chunk;
    emit({ type: "stream:chunk", nodeId, text: chunk });
  }
  return fullText;
}

/**
 * Workflow 模式的核心逻辑:
 * 三步严格串行 — 代码决定执行顺序，不需要 LLM 判断"下一步该干什么"
 * 每个 Agent 的输出直接传给下一个 Agent 作为输入
 */
async function run(input: Record<string, string>, emit: EmitFn) {
  const { topic } = input;

  // 第一步: 写作 Agent 生成初稿
  emit({ type: "node:active", nodeId: "writer" });
  const draft = await streamAgent(
    writerAgent,
    [{ role: "user", content: `Write a blog post about: ${topic}` }],
    "writer",
    emit,
  );
  emit({ type: "node:complete", nodeId: "writer" });

  // 第二步: SEO Agent 优化文章，输出结构化数据
  emit({ type: "edge:active", edgeId: "writer-to-seo" });
  emit({ type: "node:active", nodeId: "seo" });
  const seoText = await streamAgent(
    seoAgent,
    [{ role: "user", content: draft }],
    "seo",
    emit,
  );
  let seo: {
    title: string;
    keywords: string[];
    metaDescription: string;
    optimizedArticle: string;
  };
  try {
    seo = JSON.parse(seoText);
  } catch {
    // JSON 解析失败时降级: 保留原始初稿
    seo = {
      title: topic,
      keywords: [],
      metaDescription: "",
      optimizedArticle: draft,
    };
  }
  emit({ type: "edge:complete", edgeId: "writer-to-seo" });
  emit({
    type: "node:complete",
    nodeId: "seo",
    output: { title: seo.title, keywords: seo.keywords },
  });

  // 第三步: 社媒 Agent 生成多平台发布文案
  emit({ type: "edge:active", edgeId: "seo-to-social" });
  emit({ type: "node:active", nodeId: "social" });
  const socialText = await streamAgent(
    socialAgent,
    [{ role: "user", content: seo.optimizedArticle }],
    "social",
    emit,
  );
  let social: { twitter: string; xiaohongshu: string };
  try {
    social = JSON.parse(socialText);
  } catch {
    social = { twitter: "", xiaohongshu: "" };
  }
  emit({ type: "edge:complete", edgeId: "seo-to-social" });
  emit({ type: "node:complete", nodeId: "social", output: social });

  return {
    article: seo.optimizedArticle,
    seo: {
      title: seo.title,
      keywords: seo.keywords,
      metaDescription: seo.metaDescription,
    },
    social,
  };
}

export const workflow: Demo = {
  meta: {
    id: "01-workflow",
    name: "Blog Publishing Pipeline",
    nameZh: "博客发布流水线",
    pattern: "Workflow",
    description:
      "固定顺序的流水线：写作 → SEO 优化 → 社交媒体。路径写死在代码里，确定性强。",
    inputs: [
      {
        id: "topic",
        label: "博客主题",
        type: "text",
        placeholder: "例如：2026 年 AI 辅助编程的趋势",
      },
    ],
  },
  run,
};
