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

async function run(input: Record<string, string>, emit: EmitFn) {
  const { topic } = input

  // Step 1: Write draft
  emit({ type: 'node:active', nodeId: 'writer' })
  const draft = await writerAgent.generate([{ role: 'user', content: `Write a blog post about: ${topic}` }])
  emit({ type: 'node:complete', nodeId: 'writer', output: { preview: draft.text.slice(0, 150) + '...' } })

  // Step 2: SEO optimization
  emit({ type: 'edge:active', edgeId: 'writer-to-seo' })
  emit({ type: 'node:active', nodeId: 'seo' })
  const seoResult = await seoAgent.generate([{ role: 'user', content: draft.text }])
  let seo: { title: string; keywords: string[]; metaDescription: string; optimizedArticle: string }
  try {
    seo = JSON.parse(seoResult.text)
  } catch {
    seo = { title: topic, keywords: [], metaDescription: '', optimizedArticle: draft.text }
  }
  emit({ type: 'edge:complete', edgeId: 'writer-to-seo' })
  emit({ type: 'node:complete', nodeId: 'seo', output: { title: seo.title, keywords: seo.keywords } })

  // Step 3: Social media posts
  emit({ type: 'edge:active', edgeId: 'seo-to-social' })
  emit({ type: 'node:active', nodeId: 'social' })
  const socialResult = await socialAgent.generate([{ role: 'user', content: seo.optimizedArticle }])
  let social: { twitter: string; xiaohongshu: string }
  try {
    social = JSON.parse(socialResult.text)
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
    description: 'Fixed sequential pipeline: Writer → SEO → Social Media. Path is hardcoded — code decides the order.',
    inputs: [{ id: 'topic', label: 'Blog Topic', type: 'text', placeholder: 'e.g. AI-assisted programming in 2026' }],
  },
  run,
}
