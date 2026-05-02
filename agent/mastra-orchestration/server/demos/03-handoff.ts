import { Agent } from '@mastra/core/agent'
import { model } from '../config.js'
import type { Demo, EmitFn } from '../types.js'

const triageAgent = new Agent({
  id: 'triage',
  name: 'Triage Agent',
  model,
  instructions: `You are a customer service triage specialist. Classify the customer's message into exactly one category and respond with ONLY valid JSON (no markdown code fences):
{"route": "tech" | "refund" | "billing", "summary": "one-sentence summary of the issue"}

Classification rules:
- "tech": software bugs, setup issues, how-to questions, feature requests
- "refund": return requests, refund status, product dissatisfaction
- "billing": payment issues, invoice questions, subscription changes, pricing`,
})

const techAgent = new Agent({
  id: 'tech-support',
  name: 'Tech Support Agent',
  model,
  instructions: `You are a technical support specialist. Help the customer resolve their technical issue with clear, step-by-step troubleshooting instructions. Be patient and thorough. If the issue requires escalation, say so clearly.`,
})

const refundAgent = new Agent({
  id: 'refund',
  name: 'Refund Agent',
  model,
  instructions: `You are a refund processing specialist. Handle refund requests professionally. Our policy: full refund within 30 days, 50% refund within 60 days, no refund after 60 days. Ask for order details if not provided. Be empathetic and solution-oriented.`,
})

const billingAgent = new Agent({
  id: 'billing',
  name: 'Billing Agent',
  model,
  instructions: `You are a billing support specialist. Help customers with payment issues, invoice questions, and subscription management. Be clear about pricing, explain charges, and offer solutions for billing disputes.`,
})

const specialists: Record<string, Agent> = {
  tech: techAgent,
  refund: refundAgent,
  billing: billingAgent,
}

async function run(input: Record<string, string>, emit: EmitFn) {
  const { message } = input

  emit({ type: 'node:active', nodeId: 'triage' })
  const triageResult = await triageAgent.generate([{ role: 'user', content: message }])
  let route: string
  let summary: string
  try {
    const parsed = JSON.parse(triageResult.text)
    route = parsed.route
    summary = parsed.summary
  } catch {
    route = 'tech'
    summary = message
  }
  emit({ type: 'node:complete', nodeId: 'triage', output: { route, summary } })

  const specialistId = route === 'tech' ? 'tech-support' : route
  emit({ type: 'edge:active', edgeId: `triage-to-${specialistId}` })
  emit({ type: 'node:active', nodeId: specialistId })

  const specialist = specialists[route] || techAgent
  const response = await specialist.generate([
    { role: 'user', content: `Customer issue (classified as ${route}): ${summary}\n\nOriginal message: ${message}` },
  ])

  emit({ type: 'edge:complete', edgeId: `triage-to-${specialistId}` })
  emit({ type: 'node:complete', nodeId: specialistId, output: { preview: response.text.slice(0, 150) } })

  return { route, summary, response: response.text }
}

export const handoffDemo: Demo = {
  meta: {
    id: '03-handoff',
    name: 'Multi-Department Customer Service',
    nameZh: '多部门客服',
    pattern: 'Handoff',
    description: 'Triage Agent classifies the message and hands off to the right specialist. No supervisor — the current agent decides who takes over.',
    inputs: [{ id: 'message', label: 'Customer Message', type: 'textarea', placeholder: 'e.g. I was charged twice for my subscription last month' }],
  },
  run,
}
