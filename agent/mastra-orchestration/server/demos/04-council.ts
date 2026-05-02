import { Agent } from '@mastra/core/agent'
import { model } from '../config.js'
import type { Demo, EmitFn } from '../types.js'

const securityAgent = new Agent({
  id: 'security-reviewer',
  name: 'Security Reviewer',
  model,
  instructions: `You are a security-focused code reviewer. Analyze the code for security vulnerabilities including:
- Injection attacks (SQL, command, XSS)
- Authentication/authorization flaws
- Data exposure risks
- Insecure dependencies

Respond with ONLY valid JSON (no markdown code fences):
{"score": 1-10, "issues": ["issue1", "issue2"], "suggestion": "overall security recommendation"}`,
})

const performanceAgent = new Agent({
  id: 'performance-reviewer',
  name: 'Performance Reviewer',
  model,
  instructions: `You are a performance-focused code reviewer. Analyze the code for performance issues including:
- Algorithm complexity (time and space)
- Unnecessary allocations or copies
- N+1 queries or redundant I/O
- Missing caching opportunities

Respond with ONLY valid JSON (no markdown code fences):
{"score": 1-10, "issues": ["issue1", "issue2"], "suggestion": "overall performance recommendation"}`,
})

const readabilityAgent = new Agent({
  id: 'readability-reviewer',
  name: 'Readability Reviewer',
  model,
  instructions: `You are a readability-focused code reviewer. Analyze the code for readability including:
- Naming clarity (variables, functions, classes)
- Code structure and organization
- Unnecessary complexity
- Missing or excessive comments

Respond with ONLY valid JSON (no markdown code fences):
{"score": 1-10, "issues": ["issue1", "issue2"], "suggestion": "overall readability recommendation"}`,
})

const synthesisAgent = new Agent({
  id: 'synthesis',
  name: 'Synthesis Agent',
  model,
  instructions: `You are a lead code reviewer. Given three independent reviews (security, performance, readability), synthesize them into a final verdict.

Respond with ONLY valid JSON (no markdown code fences):
{"verdict": "approve" | "request-changes" | "reject", "overallScore": 1-10, "topIssues": ["most critical issue 1", "issue 2", "issue 3"], "summary": "2-3 sentence overall assessment"}`,
})

interface ReviewResult {
  score: number
  issues: string[]
  suggestion: string
}

function parseReview(text: string): ReviewResult {
  try {
    return JSON.parse(text)
  } catch {
    return { score: 5, issues: ['Unable to parse review'], suggestion: text }
  }
}

async function run(input: Record<string, string>, emit: EmitFn) {
  const { code } = input

  emit({ type: 'node:active', nodeId: 'security-reviewer' })
  emit({ type: 'node:active', nodeId: 'performance-reviewer' })
  emit({ type: 'node:active', nodeId: 'readability-reviewer' })

  const [securityResult, performanceResult, readabilityResult] = await Promise.all([
    securityAgent.generate([{ role: 'user', content: `Review this code for security:\n\n${code}` }]).then((r) => {
      emit({ type: 'node:complete', nodeId: 'security-reviewer' })
      return parseReview(r.text)
    }),
    performanceAgent.generate([{ role: 'user', content: `Review this code for performance:\n\n${code}` }]).then((r) => {
      emit({ type: 'node:complete', nodeId: 'performance-reviewer' })
      return parseReview(r.text)
    }),
    readabilityAgent.generate([{ role: 'user', content: `Review this code for readability:\n\n${code}` }]).then((r) => {
      emit({ type: 'node:complete', nodeId: 'readability-reviewer' })
      return parseReview(r.text)
    }),
  ])

  emit({ type: 'edge:active', edgeId: 'reviewers-to-synthesis' })
  emit({ type: 'edge:active', edgeId: 'perf-to-synthesis' })
  emit({ type: 'edge:active', edgeId: 'read-to-synthesis' })
  emit({ type: 'node:active', nodeId: 'synthesis' })

  const synthesisInput = `Security Review (score: ${securityResult.score}/10):
Issues: ${securityResult.issues.join('; ')}
Suggestion: ${securityResult.suggestion}

Performance Review (score: ${performanceResult.score}/10):
Issues: ${performanceResult.issues.join('; ')}
Suggestion: ${performanceResult.suggestion}

Readability Review (score: ${readabilityResult.score}/10):
Issues: ${readabilityResult.issues.join('; ')}
Suggestion: ${readabilityResult.suggestion}`

  const synthesisResult = await synthesisAgent.generate([{ role: 'user', content: synthesisInput }])
  emit({ type: 'edge:complete', edgeId: 'reviewers-to-synthesis' })
  emit({ type: 'edge:complete', edgeId: 'perf-to-synthesis' })
  emit({ type: 'edge:complete', edgeId: 'read-to-synthesis' })

  let verdict
  try {
    verdict = JSON.parse(synthesisResult.text)
  } catch {
    verdict = { verdict: 'request-changes', overallScore: 5, topIssues: [], summary: synthesisResult.text }
  }
  emit({ type: 'node:complete', nodeId: 'synthesis', output: verdict })

  return {
    reviews: { security: securityResult, performance: performanceResult, readability: readabilityResult },
    verdict,
  }
}

export const councilDemo: Demo = {
  meta: {
    id: '04-council',
    name: 'Code Review Committee',
    nameZh: '代码审查委员会',
    pattern: 'Council',
    description: 'Three agents review code in parallel (security, performance, readability), then a synthesis agent merges the verdicts.',
    inputs: [{ id: 'code', label: 'Code to Review', type: 'textarea', placeholder: 'Paste code here...' }],
  },
  run,
}
