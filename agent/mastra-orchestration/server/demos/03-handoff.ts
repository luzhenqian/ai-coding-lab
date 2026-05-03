/**
 * 03-Handoff: 多部门客服
 *
 * 编排模式: Handoff（交接模式）
 * 核心特征: 没有总管，当前 Agent 自己决定把控制权交给谁
 * 与 Supervisor 的区别: Supervisor 委托后还保持控制权；Handoff 是彻底交棒，自己退出
 */
import { Agent } from "@mastra/core/agent";
import { model } from "../config.js";
import type { Demo, EmitFn } from "../types.js";

// 分诊 Agent: 分类用户消息，决定交给哪个专家
// 输出结构化 JSON，包含路由目标和问题摘要
const triageAgent = new Agent({
  id: "triage",
  name: "Triage Agent",
  model,
  instructions: `You are a customer service triage specialist. Classify the customer's message into exactly one category and respond with ONLY valid JSON (no markdown code fences):
{"route": "tech" | "refund" | "billing", "summary": "one-sentence summary of the issue"}

Classification rules:
- "tech": software bugs, setup issues, how-to questions, feature requests
- "refund": return requests, refund status, product dissatisfaction
- "billing": payment issues, invoice questions, subscription changes, pricing`,
});

// --- 三个专家 Agent，各自处理一个领域 ---

const techAgent = new Agent({
  id: "tech-support",
  name: "Tech Support Agent",
  model,
  instructions: `You are a technical support specialist. Help the customer resolve their technical issue with clear, step-by-step troubleshooting instructions. Be patient and thorough. If the issue requires escalation, say so clearly.`,
});

const refundAgent = new Agent({
  id: "refund",
  name: "Refund Agent",
  model,
  instructions: `You are a refund processing specialist. Handle refund requests professionally. Our policy: full refund within 30 days, 50% refund within 60 days, no refund after 60 days. Ask for order details if not provided. Be empathetic and solution-oriented.`,
});

const billingAgent = new Agent({
  id: "billing",
  name: "Billing Agent",
  model,
  instructions: `You are a billing support specialist. Help customers with payment issues, invoice questions, and subscription management. Be clear about pricing, explain charges, and offer solutions for billing disputes.`,
});

// 路由映射: triage 输出的 route 值 → 对应的专家 Agent
const specialists: Record<string, Agent> = {
  tech: techAgent,
  refund: refundAgent,
  billing: billingAgent,
};

/**
 * Handoff 模式的核心逻辑:
 * 1. 分诊 Agent 分类 → 输出 { route, summary }
 * 2. 根据 route 选择专家 Agent
 * 3. 专家 Agent 接管，独立处理（分诊 Agent 不再参与）
 *
 * 关键区别: 分诊 Agent 做完分类后就退场了，不像 Supervisor 那样持续协调
 */
async function run(input: Record<string, string>, emit: EmitFn) {
  const { message } = input;

  // 第一步: 分诊 — 分类用户消息
  emit({ type: "node:active", nodeId: "triage" });
  const triageResult = await triageAgent.generate([
    { role: "user", content: message },
  ]);
  let route: string;
  let summary: string;
  try {
    const parsed = JSON.parse(triageResult.text);
    route = parsed.route;
    summary = parsed.summary;
  } catch {
    route = "tech";
    summary = message;
  }
  emit({ type: "node:complete", nodeId: "triage", output: { route, summary } });

  // 第二步: 交接 — 选择对应的专家 Agent，移交控制权
  // specialistId 用于前端节点状态匹配（tech 的 agent id 是 tech-support）
  const specialistId = route === "tech" ? "tech-support" : route;
  emit({ type: "edge:active", edgeId: `triage-to-${specialistId}` });
  emit({ type: "node:active", nodeId: specialistId });

  // 专家 Agent 流式处理，分诊 Agent 已完全退出
  const specialist = specialists[route] || techAgent;
  const stream = await specialist.stream([
    {
      role: "user",
      content: `Customer issue (classified as ${route}): ${summary}\n\nOriginal message: ${message}`,
    },
  ]);
  let responseText = "";
  for await (const chunk of stream.textStream) {
    responseText += chunk;
    emit({ type: "stream:chunk", nodeId: specialistId, text: chunk });
  }

  emit({ type: "edge:complete", edgeId: `triage-to-${specialistId}` });
  emit({ type: "node:complete", nodeId: specialistId });

  return { route, summary, response: responseText };
}

export const handoffDemo: Demo = {
  meta: {
    id: "03-handoff",
    name: "Multi-Department Customer Service",
    nameZh: "多部门客服",
    pattern: "Handoff",
    description:
      "分诊 Agent 分类用户消息后，将控制权交给对应的专家 Agent。没有中心调度——当前 Agent 自己决定交棒给谁。",
    inputs: [
      {
        id: "message",
        label: "客户消息",
        type: "textarea",
        placeholder: "例如：上个月我的订阅被重复扣费了",
      },
    ],
  },
  run,
};
