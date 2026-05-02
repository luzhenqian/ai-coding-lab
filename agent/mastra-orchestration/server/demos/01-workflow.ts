import { Agent } from '@mastra/core/agent'
import { model } from '../config.js'
import type { Demo, EmitFn } from '../types.js'

const writerAgent = new Agent({
  id: 'writer',
  name: 'writer',
  model,
  instructions: `You are a professional blog writer. Given a topic, write a blog post of about 300 words in Markdown format. Include a compelling title, clear structure with headings, and actionable insights. Write in a conversational yet informative tone.`,
})

const seoAgent = new Agent({
  id: 'seo',
  name: 'seo',
  model,
  instructions: `You are an SEO specialist. Given a blog article, optimize it and output ONLY valid JSON (no markdown code fences):
{"title": "SEO-optimized title", "keywords": ["keyword1", "keyword2", ...], "metaDescription": "150-char meta description", "optimizedArticle": "the full article with SEO improvements"}`,
})

const socialAgent = new Agent({
  id: 'social',
  name: 'social',
  model,
  instructions: `You are a social media copywriter. Given a blog article, create social media posts and output ONLY valid JSON (no markdown code fences):
{"twitter": "Tweet under 280 characters with hashtags", "xiaohongshu": "小红书 post with emoji-rich hook and body, under 500 chars"}`,
})

async function streamAgent(
  agent: Agent,
  messages: { role: 'user'; content: string }[],
  nodeId: string,
  emit: EmitFn,
): Promise<string> {
  const result = await agent.stream(messages)
  let fullText = ''
  for await (const chunk of result.textStream) {
    fullText += chunk
    emit({ type: 'stream:chunk', nodeId, text: chunk })
  }
  return fullText
}

async function run(input: Record<string, string>, emit: EmitFn) {
  const { topic } = input

  // Step 1: Write draft
  emit({ type: 'node:active', nodeId: 'writer' })
  const draft = await streamAgent(writerAgent, [{ role: 'user', content: `Write a blog post about: ${topic}` }], 'writer', emit)
  emit({ type: 'node:complete', nodeId: 'writer' })

  // Step 2: SEO optimization
  emit({ type: 'edge:active', edgeId: 'writer-to-seo' })
  emit({ type: 'node:active', nodeId: 'seo' })
  const seoText = await streamAgent(seoAgent, [{ role: 'user', content: draft }], 'seo', emit)
  let seo: { title: string; keywords: string[]; metaDescription: string; optimizedArticle: string }
  try {
    seo = JSON.parse(seoText)
  } catch {
    seo = { title: topic, keywords: [], metaDescription: '', optimizedArticle: draft }
  }
  emit({ type: 'edge:complete', edgeId: 'writer-to-seo' })
  emit({ type: 'node:complete', nodeId: 'seo', output: { title: seo.title, keywords: seo.keywords } })

  // Step 3: Social media posts
  emit({ type: 'edge:active', edgeId: 'seo-to-social' })
  emit({ type: 'node:active', nodeId: 'social' })
  const socialText = await streamAgent(socialAgent, [{ role: 'user', content: seo.optimizedArticle }], 'social', emit)
  let social: { twitter: string; xiaohongshu: string }
  try {
    social = JSON.parse(socialText)
  } catch {
    social = { twitter: '', xiaohongshu: '' }
  }
  emit({ type: 'edge:complete', edgeId: 'seo-to-social' })
  emit({ type: 'node:complete', nodeId: 'social', output: social })

  return { article: seo.optimizedArticle, seo: { title: seo.title, keywords: seo.keywords, metaDescription: seo.metaDescription }, social }
}

export const workflow: Demo = {
  meta: {
    id: '01-workflow',
    name: 'Blog Publishing Pipeline',
    nameZh: '博客发布流水线',
    pattern: 'Workflow',
    description: '固定顺序的流水线：写作 → SEO 优化 → 社交媒体。路径写死在代码里，确定性强。',
    inputs: [{ id: 'topic', label: '博客主题', type: 'text', placeholder: '例如：2026 年 AI 辅助编程的趋势' }],
  },
  run,
}
