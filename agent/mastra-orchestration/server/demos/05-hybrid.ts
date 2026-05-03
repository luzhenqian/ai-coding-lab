/**
 * 05-Hybrid: 招聘评估系统
 *
 * 编排模式: 混合编排（Workflow + Council + Supervisor）
 * 核心理念: "不是四选一，是混着用" — 每一层选择最适合的模式
 *
 * 三层嵌套:
 *   第一层 Workflow: 简历解析（固定步骤）
 *   第二层 Council:  三维度并行评估（多视角独立打分）
 *   第三层 Supervisor: 终审决策（动态决定是否需要追问）
 */
import { Agent } from "@mastra/core/agent";
import { model } from "../config.js";
import type { Demo, EmitFn } from "../types.js";

// === 第一层: Workflow — 简历解析 ===
// 固定步骤，输入简历文本，输出结构化候选人数据
const parserAgent = new Agent({
  id: "parser",
  name: "Resume Parser",
  model,
  instructions: `You parse resumes into structured data. Given a resume text, extract and respond with ONLY valid JSON (no markdown code fences):
{"name": "string", "yearsOfExperience": number, "skills": ["skill1", "skill2"], "education": "highest degree + school", "recentRole": "most recent job title + company", "summary": "2-sentence professional summary"}`,
});

// === 第二层: Council — 三维度并行评估 ===
// 三个评估 Agent 各自从不同角度独立打分，互不影响

const techSkillsAgent = new Agent({
  id: "tech-evaluator",
  name: "Technical Skills Evaluator",
  model,
  instructions: `You evaluate a candidate's technical skills against a job description. Consider: skill match, depth of experience, relevant projects.
Respond with ONLY valid JSON (no markdown code fences):
{"score": 1-10, "reasoning": "2-3 sentence explanation"}`,
});

const cultureFitAgent = new Agent({
  id: "culture-evaluator",
  name: "Culture Fit Evaluator",
  model,
  instructions: `You evaluate a candidate's cultural fit based on their background. Consider: communication style, career trajectory, values alignment, team dynamics.
Respond with ONLY valid JSON (no markdown code fences):
{"score": 1-10, "reasoning": "2-3 sentence explanation"}`,
});

const growthAgent = new Agent({
  id: "growth-evaluator",
  name: "Growth Potential Evaluator",
  model,
  instructions: `You evaluate a candidate's growth potential. Consider: learning trajectory, career progression, breadth of experience, adaptability signals.
Respond with ONLY valid JSON (no markdown code fences):
{"score": 1-10, "reasoning": "2-3 sentence explanation"}`,
});

// === 第三层: Supervisor — 终审决策 ===
// 终审 Agent 综合所有评分，动态决定是否需要调用追问 Agent 补充信息

// 追问 Agent: 当评分模糊时，生成针对性的追问问题
const clarificationAgent = new Agent({
  id: "clarification",
  name: "Clarification Agent",
  model,
  description:
    "Generates follow-up questions about a candidate when more information is needed before making a final decision.",
  instructions: `You generate specific follow-up questions about a candidate based on gaps or concerns in the evaluation. Output 2-3 targeted questions.`,
});

// 终审 Agent: 用 Supervisor 模式，可选择性调用追问 Agent
const finalReviewAgent = new Agent({
  id: "final-reviewer",
  name: "Final Reviewer",
  model,
  instructions: `You are the hiring committee lead. Given a parsed resume and three evaluation scores (technical skills, cultural fit, growth potential), make a final hiring recommendation.

If scores are clear (all above 7 or all below 4), decide directly.
If scores are mixed or borderline, delegate to clarification agent to generate follow-up questions.

End with a clear recommendation: RECOMMEND, REJECT, or NEED_MORE_INFO.`,
  // Supervisor 模式: 可调度 clarificationAgent
  agents: { clarificationAgent },
});

interface EvalResult {
  score: number;
  reasoning: string;
}

function parseEval(text: string): EvalResult {
  try {
    return JSON.parse(text);
  } catch {
    return { score: 5, reasoning: text };
  }
}

/**
 * 混合编排的核心逻辑:
 * 三种模式各司其职，嵌套组合:
 *   Workflow  → 确定性流程（解析简历，不需要 LLM 判断顺序）
 *   Council   → 多视角评估（三个维度独立打分，避免单一偏见）
 *   Supervisor → 动态决策（终审时按需调用追问 Agent）
 */
async function run(input: Record<string, string>, emit: EmitFn) {
  const { resume, jobDescription } = input;

  // === 第一层 Workflow: 解析简历 ===
  emit({ type: "node:active", nodeId: "parser" });
  const parseResult = await parserAgent.generate([
    { role: "user", content: resume },
  ]);
  let candidate;
  try {
    candidate = JSON.parse(parseResult.text);
  } catch {
    candidate = { name: "Unknown", summary: parseResult.text };
  }
  emit({ type: "node:complete", nodeId: "parser", output: candidate });

  // === 第二层 Council: 三维度并行评估 ===
  const evalPrompt = `Job Description:\n${jobDescription}\n\nCandidate:\n${JSON.stringify(candidate, null, 2)}`;

  // 三条连线同时激活，三个评估 Agent 同时启动
  emit({ type: "edge:active", edgeId: "parser-to-council" });
  emit({ type: "edge:active", edgeId: "parser-to-culture" });
  emit({ type: "edge:active", edgeId: "parser-to-growth" });
  emit({ type: "node:active", nodeId: "tech-evaluator" });
  emit({ type: "node:active", nodeId: "culture-evaluator" });
  emit({ type: "node:active", nodeId: "growth-evaluator" });

  // Promise.all 并行执行三个评估
  const [techScore, cultureScore, growthScore] = await Promise.all([
    techSkillsAgent
      .generate([
        { role: "user", content: `Evaluate technical skills:\n${evalPrompt}` },
      ])
      .then((r) => {
        emit({ type: "node:complete", nodeId: "tech-evaluator" });
        return parseEval(r.text);
      }),
    cultureFitAgent
      .generate([
        { role: "user", content: `Evaluate cultural fit:\n${evalPrompt}` },
      ])
      .then((r) => {
        emit({ type: "node:complete", nodeId: "culture-evaluator" });
        return parseEval(r.text);
      }),
    growthAgent
      .generate([
        { role: "user", content: `Evaluate growth potential:\n${evalPrompt}` },
      ])
      .then((r) => {
        emit({ type: "node:complete", nodeId: "growth-evaluator" });
        return parseEval(r.text);
      }),
  ]);

  emit({ type: "edge:complete", edgeId: "parser-to-council" });
  emit({ type: "edge:complete", edgeId: "parser-to-culture" });
  emit({ type: "edge:complete", edgeId: "parser-to-growth" });

  // === 第三层 Supervisor: 终审决策 ===
  emit({ type: "edge:active", edgeId: "council-to-reviewer" });
  emit({ type: "edge:active", edgeId: "culture-to-reviewer" });
  emit({ type: "edge:active", edgeId: "growth-to-reviewer" });
  emit({ type: "node:active", nodeId: "final-reviewer" });

  // 将三维度评分汇总，交给终审 Agent
  const reviewInput = `Candidate: ${candidate.name}
Resume Summary: ${candidate.summary}

Evaluation Scores:
- Technical Skills: ${techScore.score}/10 — ${techScore.reasoning}
- Cultural Fit: ${cultureScore.score}/10 — ${cultureScore.reasoning}
- Growth Potential: ${growthScore.score}/10 — ${growthScore.reasoning}

Average Score: ${((techScore.score + cultureScore.score + growthScore.score) / 3).toFixed(1)}/10

Make your final recommendation.`;

  // 终审 Agent 用 Supervisor 模式: 可能调用 clarificationAgent，也可能直接决策
  const finalResult = await finalReviewAgent.generate(
    [{ role: "user", content: reviewInput }],
    {
      maxSteps: 3,
      delegation: {
        onDelegationStart: ({ primitiveId }) => {
          emit({ type: "node:active", nodeId: primitiveId });
        },
        onDelegationComplete: ({ primitiveId }) => {
          emit({ type: "node:complete", nodeId: primitiveId });
        },
      },
    },
  );

  emit({ type: "edge:complete", edgeId: "council-to-reviewer" });
  emit({ type: "edge:complete", edgeId: "culture-to-reviewer" });
  emit({ type: "edge:complete", edgeId: "growth-to-reviewer" });
  emit({
    type: "node:complete",
    nodeId: "final-reviewer",
    output: { preview: finalResult.text.slice(0, 200) },
  });

  return {
    candidate,
    scores: {
      technical: techScore,
      cultureFit: cultureScore,
      growth: growthScore,
    },
    recommendation: finalResult.text,
  };
}

export const hybridDemo: Demo = {
  meta: {
    id: "05-hybrid",
    name: "Hiring Evaluation System",
    nameZh: "招聘评估系统",
    pattern: "Hybrid (Workflow + Council + Supervisor)",
    description:
      "Workflow 流水线 → Council 并行评估 → Supervisor 终审。三种编排模式嵌套在一个系统中。",
    inputs: [
      {
        id: "resume",
        label: "候选人简历",
        type: "textarea",
        placeholder: "在此粘贴简历...",
      },
      {
        id: "jobDescription",
        label: "职位描述",
        type: "textarea",
        placeholder: "在此粘贴 JD...",
      },
    ],
  },
  run,
};
