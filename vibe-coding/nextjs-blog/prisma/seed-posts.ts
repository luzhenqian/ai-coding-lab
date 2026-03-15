import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) throw new Error("No admin user found. Run seed first.");

  const general = await prisma.category.findUnique({
    where: { slug: "general" },
  });
  if (!general) throw new Error("No 'General' category found.");

  // Create an "AI" category
  const aiCategory = await prisma.category.upsert({
    where: { slug: "ai" },
    update: {},
    create: { name: "AI", slug: "ai" },
  });

  // Create tags
  const aiTag = await prisma.tag.upsert({
    where: { slug: "ai" },
    update: {},
    create: { name: "AI", slug: "ai" },
  });
  const llmTag = await prisma.tag.upsert({
    where: { slug: "llm" },
    update: {},
    create: { name: "LLM", slug: "llm" },
  });
  const agentTag = await prisma.tag.upsert({
    where: { slug: "ai-agent" },
    update: {},
    create: { name: "AI Agent", slug: "ai-agent" },
  });

  // Post 1
  const post1 = await prisma.article.upsert({
    where: { slug: "ai-breakthroughs-march-2026" },
    update: {},
    create: {
      title: "2026 年 3 月 AI 领域重大突破：GPT-5.4、Gemini 3.1 与苹果全新 Siri",
      slug: "ai-breakthroughs-march-2026",
      summary:
        "OpenAI 发布 GPT-5.4，Google 推出 Gemini 3.1 Flash-Lite，苹果宣布全面重构 Siri——2026 年 3 月 AI 领域迎来密集更新。",
      content: `## 模型层面的突破

### OpenAI GPT-5.4

2026 年 3 月 5 日，OpenAI 正式发布了 GPT-5.4。这一版本在编程和推理能力上有了质的飞跃，API 层面支持高达 **100 万 token** 的上下文窗口，这意味着开发者可以一次性输入整个代码仓库或长篇文档，让模型进行全局理解和分析。

GPT-5.4 在以下方面表现突出：

- **长文档分析**：支持将整本书或完整技术规范一次性输入
- **复杂推理链**：在多步骤数学证明和逻辑推理中准确率显著提升
- **代码生成**：对大型项目的代码理解和生成能力大幅增强

### Google Gemini 3.1 Flash-Lite

Google 紧随其后推出了 Gemini 3.1 Flash-Lite，主打"快"和"便宜"：

- 响应速度提升 **2.5 倍**
- 输出生成速度快了 **45%**
- 价格低至每百万输入 token 仅 **$0.25**

这个定价策略直接瞄准了企业级批量推理场景——当你需要处理海量数据时，成本几乎可以忽略不计。

## 苹果重构 Siri

苹果宣布将推出全面 AI 化的 Siri，计划随 iOS 26.4 在 2026 年 3 月发布。新版 Siri 的核心变化：

1. **情境感知（On-screen Awareness）**：Siri 可以理解你当前屏幕上的内容
2. **跨应用集成**：无缝调用不同 App 的功能
3. **基于 Gemini 模型**：苹果与 Google 合作，利用 Gemini AI 模型在 Apple Private Cloud Compute 上运行

这是苹果在 AI 领域最激进的一步——将核心助手的底层从规则引擎切换为大语言模型。

## 硬件与基础设施

### Meta 自研 AI 芯片

Meta 一口气公布了四代自研 AI 芯片路线图：**MTIA 300、400、450、500**，计划在 2027 年底前部署到全球数据中心。这标志着大厂加速摆脱对 NVIDIA 的依赖。

### NVIDIA GTC 2026

NVIDIA GTC 2026 大会将于 3 月 16-19 日在圣何塞举行，预计发布：

- **Vera Rubin 架构**：下一代 GPU 架构
- **AI 工厂（AI Factories）**：面向企业的一体化 AI 推理解决方案
- **物理 AI**：机器人与自动驾驶领域的新突破

## 行业动态

Atlassian 宣布裁员约 10%，将资源重新投入 AI 开发。这反映了一个更大的趋势：**传统软件公司正在将 AI 作为核心战略**，而非附加功能。

---

2026 年的 AI 竞赛已经从"谁的模型更大"转向"谁能更快、更便宜、更深度地融入产品"。对于开发者来说，现在是拥抱这些新工具的最佳时机。`,
      coverImage: "",
      status: "PUBLISHED",
      publishedAt: new Date("2026-03-14T10:00:00Z"),
      viewCount: 42,
      seoTitle: "2026 年 3 月 AI 重大突破：GPT-5.4、Gemini 3.1、全新 Siri",
      seoDescription:
        "OpenAI GPT-5.4 百万 token 上下文、Google Gemini 3.1 Flash-Lite 极致性价比、苹果 AI Siri 重构——2026 年 3 月 AI 领域最值得关注的进展。",
      authorId: admin.id,
      categoryId: aiCategory.id,
      tags: {
        create: [{ tagId: aiTag.id }, { tagId: llmTag.id }],
      },
    },
  });

  // Post 2
  const post2 = await prisma.article.upsert({
    where: { slug: "ai-agent-frameworks-2026" },
    update: {},
    create: {
      title: "2026 年 AI Agent 框架全景：从开发到治理的新格局",
      slug: "ai-agent-frameworks-2026",
      summary:
        "AI Agent 正在从实验走向生产。本文梳理 2026 年主流 Agent 框架的最新进展、技术亮点以及全球治理动态。",
      content: `## 什么是 AI Agent？

AI Agent（AI 智能体）是指能够**自主感知环境、做出决策并执行操作**的 AI 系统。与传统的聊天机器人不同，Agent 可以使用工具、调用 API、操作文件系统，甚至协调多个子 Agent 并行完成复杂任务。

2026 年，AI Agent 已经从概念验证阶段进入生产部署阶段。

## 主流框架一览

### 第一梯队

| 框架 | 定位 | 亮点 |
|------|------|------|
| **LangChain** | 通用 Agent 管道 | 生态最完善，社区最大 |
| **CrewAI** | 多 Agent 协作编排 | 角色定义直观，适合团队模拟 |
| **AutoGen v0.4** | 微软出品，多 Agent 系统 | 支持真正的并行执行 |
| **LangGraph** | 状态化工作流 | 图结构编排，适合复杂流程 |

### 新锐力量

- **OpenClaw**：主打可靠性，引入了 ACP（Agent Communication Protocol）绑定机制——Agent 之间的通信链路在系统重启后能自动恢复，任务不会丢失
- **FastAgency**：快速原型开发框架，几行代码就能搭建 Agent 系统
- **Lindy**：无代码 Agent 平台，面向业务人员

## 关键技术趋势

### 1. 并行执行成为标配

AutoGen v0.4 带来了真正的并行能力——多个 Agent 可以**同时推理和响应**，而不是串行等待。这对于需要多角度分析的场景（如代码审查、市场调研）意义重大。

\`\`\`python
# AutoGen v0.4 并行执行示例
from autogen import ConversableAgent, GroupChat

researcher = ConversableAgent("researcher", ...)
analyst = ConversableAgent("analyst", ...)
writer = ConversableAgent("writer", ...)

# researcher 和 analyst 并行工作，writer 等待两者完成
chat = GroupChat(
    agents=[researcher, analyst, writer],
    execution_mode="parallel"  # v0.4 新增
)
\`\`\`

### 2. 语音交互增强

Rasa 2026 版本加入了**静音检测**和**对话状态管理**优化。之前语音 Agent 最头疼的问题是：用户停顿或背景噪音会打断对话流。现在框架层面就解决了这个问题。

### 3. 容错与可靠性

OpenClaw 框架的新特性让 Agent 通信具备了**持久化能力**：

- 通信链路在重启后自动恢复
- 断线重连机制
- 任务执行状态不丢失

这对于 7×24 小时运行的生产环境至关重要。

## 全球治理动态

### NIST AI Agent 标准倡议

美国国家标准与技术研究院（NIST）的 AI 标准和创新中心（CAISI）宣布启动 **AI Agent 标准倡议**，目标是确保自主 AI Agent 能够：

- 安全运行
- 跨系统互操作
- 获得广泛信任

### 新加坡：全球首个 Agentic AI 治理框架

新加坡信息通信媒体发展管理局（IMDA）发布了全球首个 **Agentic AI 模型治理框架**，为企业提供负责任地部署 AI Agent 的全面指南。这意味着 Agent 的治理已经从"要不要管"进入"怎么管"的阶段。

## 给开发者的建议

1. **入门推荐 LangChain + LangGraph**：生态完善，文档齐全，学习资源多
2. **多 Agent 场景选 CrewAI 或 AutoGen**：前者更直观，后者更强大
3. **生产环境关注可靠性**：优先选择支持容错和持久化的框架
4. **关注治理合规**：特别是面向欧盟、新加坡等有明确监管要求的市场

---

2026 年的 AI Agent 生态已经相当成熟。框架的竞争焦点从"能不能跑起来"转向了"够不够可靠、够不够快、够不够合规"。这对开发者来说是好消息——基础设施就绪，是时候专注于构建真正有价值的 Agent 应用了。`,
      coverImage: "",
      status: "PUBLISHED",
      publishedAt: new Date("2026-03-14T12:00:00Z"),
      viewCount: 28,
      seoTitle: "2026 年 AI Agent 框架全景：LangChain、AutoGen、CrewAI 与治理新格局",
      seoDescription:
        "全面梳理 2026 年 AI Agent 框架最新进展，包括 AutoGen 并行执行、OpenClaw 容错机制以及 NIST 和新加坡的治理框架。",
      authorId: admin.id,
      categoryId: aiCategory.id,
      tags: {
        create: [{ tagId: aiTag.id }, { tagId: agentTag.id }],
      },
    },
  });

  console.log(`Created post: ${post1.title}`);
  console.log(`Created post: ${post2.title}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
