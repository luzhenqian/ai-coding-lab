# 快速开始：GitHub 仓库智能分析助手

## 环境要求

- Node.js 22+
- pnpm 9+

## 安装步骤

```bash
# 1. 克隆项目
git clone <repo-url>
cd repo-analyzer

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env
```

## 环境变量配置

编辑 `.env` 文件：

```env
# === LLM 模型配置 ===
# 模型提供商：openai 或 anthropic
MODEL_PROVIDER=openai
# 模型名称：如 gpt-4o、claude-sonnet-4-5
MODEL_NAME=gpt-4o

# === API Key（根据 MODEL_PROVIDER 配置对应的 Key）===
OPENAI_API_KEY=sk-your-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here

# === GitHub 配置（可选，提升 API 速率限制）===
GITHUB_TOKEN=ghp_your-token-here
```

## 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

## 使用方式

### 自由对话模式（默认）

1. 在聊天输入框中输入消息，例如：
   - "帮我分析 https://github.com/vercel/next.js"
   - "这个仓库的目录结构是怎样的？"
2. 观察 Agent 自动调用工具获取数据并流式返回分析结果
3. 注意界面上的工具调用状态指示器

### Workflow 分析模式

1. 点击顶部"Workflow 分析"切换按钮
2. 在 URL 输入框中粘贴 GitHub 仓库地址
3. 观察四个步骤依次执行，步骤状态实时更新
4. 在"人工审批"步骤查看仓库摘要卡片
5. 点击"继续分析"生成完整报告，或"取消"终止流程

## 项目结构

```
src/
├── app/                        # Next.js App Router 页面和 API
│   ├── page.tsx                # 主页面（模式切换 + 两种 UI）
│   ├── api/
│   │   ├── chat/route.ts       # Agent 对话 API
│   │   └── workflow/
│   │       ├── start/route.ts  # Workflow 启动 API
│   │       └── resume/route.ts # Workflow 恢复 API
│   └── components/             # 页面级组件
│       ├── ChatPanel.tsx       # 自由对话面板
│       ├── WorkflowPanel.tsx   # Workflow 面板
│       ├── ModeSwitcher.tsx    # 模式切换器
│       └── StepStatusBar.tsx   # 步骤状态条
├── mastra/                     # Mastra AI Agent 配置
│   ├── index.ts                # Mastra 实例（Agent + Workflow 注册）
│   ├── agents/
│   │   └── repo-analyzer.ts   # Agent 定义（instructions + tools）
│   ├── tools/
│   │   ├── get-repo-info.ts   # 获取仓库信息工具
│   │   └── get-repo-tree.ts   # 获取目录结构工具
│   └── workflows/
│       └── analyze-repo.ts    # 仓库分析 Workflow（4 步）
└── lib/                        # 共享工具函数
    ├── github.ts               # GitHub API 封装（fetch）
    ├── url-parser.ts           # GitHub URL 解析
    └── model.ts                # LLM 模型配置（多提供商）
```

## 核心概念

| 概念 | 对应文件 | 说明 |
|------|---------|------|
| Tool Calling | `mastra/tools/*.ts` | Agent 通过工具与外部 API 交互 |
| Workflow 编排 | `mastra/workflows/analyze-repo.ts` | 多步骤结构化流程 |
| Human-in-the-Loop | 同上（step 3: human-approval） | 流程暂停等待人工决策 |
