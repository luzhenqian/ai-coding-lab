# GitHub 仓库智能分析助手

一个 AI Agent 教学演示项目，展示三个核心概念：**Tool Calling**、**Workflow 编排** 和 **Human-in-the-Loop (HITL)**。

> 本项目是 [ai-coding-lab](https://github.com/anthropics/ai-coding-lab) 开源教程系列的配套演示。

## 教学目标

| 概念 | 说明 | 对应代码 |
|------|------|----------|
| **Tool Calling** | Agent 自主决定调用哪个工具获取数据 | `src/mastra/tools/`、`src/mastra/agents/` |
| **Workflow 编排** | 多步骤结构化流程，步骤间数据传递 | `src/mastra/workflows/` |
| **Human-in-the-Loop** | 流程在关键节点暂停，等待人工审批后继续 | `src/mastra/workflows/steps/human-approval.ts` |

## 技术栈

- **框架**: Next.js 16 (App Router) + TypeScript (strict mode)
- **AI Agent**: [Mastra](https://mastra.ai) (`@mastra/core`) — Agent、Tool、Workflow
- **AI SDK**: [Vercel AI SDK v5](https://ai-sdk.dev) — 流式聊天、多模型支持
- **模型**: OpenAI / Anthropic（通过环境变量切换）
- **存储**: LibSQL（本地文件，Workflow 状态持久化）
- **样式**: Tailwind CSS
- **包管理**: pnpm

## 快速开始

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，填入你的 API Key

# 3. 启动开发服务器
pnpm dev
```

打开 http://localhost:3000，即可使用。

### 环境变量说明

| 变量 | 说明 | 示例 |
|------|------|------|
| `MODEL_PROVIDER` | 模型提供商 | `openai` 或 `anthropic` |
| `MODEL_NAME` | 模型名称 | `gpt-4o`、`claude-sonnet-4-5` |
| `OPENAI_API_KEY` | OpenAI API Key | `sk-...` |
| `ANTHROPIC_API_KEY` | Anthropic API Key | `sk-ant-...` |
| `MODEL_BASE_URL` | API 中转站地址（可选） | `https://your-proxy.example.com/v1` |
| `GITHUB_TOKEN` | GitHub Token（可选，提升速率限制：无 Token 60次/小时，有 Token 5000次/小时）。从 [GitHub Settings > Tokens](https://github.com/settings/tokens) 创建 | `ghp_...` |

## 两种交互模式

### 自由对话模式（Tool Calling）

在聊天界面输入仓库地址（如"分析一下 vercel/next.js"），Agent 会自主调用 `getRepoInfo` 和 `getRepoTree` 工具获取数据，然后给出分析。

**数据流**: 用户消息 → Agent 推理 → Tool Calling → GitHub API → Agent 总结 → 流式响应

### Workflow 分析模式（Workflow + HITL）

输入仓库 URL 后，系统按四个步骤执行：

1. **解析地址** — 解析 GitHub URL
2. **获取数据** — 并行获取仓库信息和目录结构
3. **人工审批** — 展示仓库摘要，等待用户确认是否继续
4. **生成报告** — AI 流式生成结构化分析报告

## 项目结构

```
src/
├── app/                        # Next.js App Router
│   ├── page.tsx                # 主页面（模式切换入口）
│   ├── api/
│   │   ├── chat/route.ts       # Agent 对话流式 API
│   │   └── workflow/
│   │       ├── start/route.ts  # Workflow 启动 API
│   │       ├── resume/route.ts # Workflow 恢复 API
│   │       └── report/route.ts # 报告流式生成 API
│   └── components/
│       ├── ChatPanel.tsx       # 自由对话面板
│       ├── WorkflowPanel.tsx   # Workflow 面板
│       ├── ModeSwitcher.tsx    # 模式切换按钮
│       ├── StepStatusBar.tsx   # 步骤进度条
│       ├── RepoSummaryCard.tsx # 仓库摘要审批卡片
│       └── ToolStatusBadge.tsx # 工具调用状态标识
├── mastra/                     # Mastra AI Agent 配置
│   ├── index.ts                # Mastra 实例（注册 Agent + Workflow）
│   ├── agents/
│   │   └── repo-analyzer.ts   # Agent 定义（角色、工具、约束）
│   ├── tools/
│   │   ├── get-repo-info.ts   # 获取仓库基础信息
│   │   └── get-repo-tree.ts   # 获取仓库目录结构
│   └── workflows/
│       ├── analyze-repo.ts    # Workflow 组合（4 步串联）
│       └── steps/             # 各步骤实现
│           ├── parse-url.ts
│           ├── fetch-data.ts
│           ├── human-approval.ts  # HITL suspend/resume
│           └── generate-report.ts
└── lib/                        # 共享工具函数
    ├── schemas.ts              # Zod schema 定义
    ├── github.ts               # GitHub API 客户端
    ├── url-parser.ts           # URL 解析
    └── model.ts                # 多模型提供商配置
```

## 核心概念与源码对照

### Tool Calling（工具调用）

Agent 根据用户输入自主决定调用哪个工具。工具的 `description` 是 Agent 决策的关键依据。

- 工具定义: `src/mastra/tools/get-repo-info.ts`、`get-repo-tree.ts`
- Agent 注册工具: `src/mastra/agents/repo-analyzer.ts`
- 前端展示工具状态: `src/app/components/ToolStatusBadge.tsx`

### Workflow 编排

将复杂任务拆分为多个 Step，每个 Step 有明确的 `inputSchema` / `outputSchema`，通过 `then()` 串联。

- Step 定义: `src/mastra/workflows/steps/`
- Workflow 组合: `src/mastra/workflows/analyze-repo.ts`
- 状态持久化: `src/mastra/index.ts`（LibSQLStore）

### Human-in-the-Loop

Workflow 在需要人工决策时调用 `suspend()` 暂停，前端展示审批界面，用户操作后通过 `resume()` 继续。

- 暂停逻辑: `src/mastra/workflows/steps/human-approval.ts`
- 恢复 API: `src/app/api/workflow/resume/route.ts`
- 审批 UI: `src/app/components/RepoSummaryCard.tsx`

## License

MIT
