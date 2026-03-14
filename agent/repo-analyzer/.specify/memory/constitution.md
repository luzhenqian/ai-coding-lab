<!--
Sync Impact Report
===================
- Version change: N/A → 1.0.0 (initial ratification)
- Added principles:
  1. 教学清晰度优先 (Teaching Clarity First)
  2. 严格 TypeScript (Strict TypeScript)
  3. 技术栈纪律 (Technology Stack Discipline)
  4. 代码可读性 (Code Readability)
  5. 健壮的错误处理 (Robust Error Handling)
  6. AI Agent 工程规范 (AI Agent Engineering Standards)
  7. 最小可运行原则 (Minimal Viable Principle)
- Added sections:
  - 技术栈约束详情 (Technology Stack Constraints)
  - 教学与文档规范 (Teaching & Documentation Standards)
  - Governance
- Removed sections: N/A
- Templates requiring updates:
  - .specify/templates/plan-template.md — ✅ no updates needed
    (Constitution Check section is generic; gates derived at runtime)
  - .specify/templates/spec-template.md — ✅ no updates needed
    (Template is domain-agnostic; principles enforced at review time)
  - .specify/templates/tasks-template.md — ✅ no updates needed
    (Phase structure accommodates teaching-oriented projects)
  - .specify/templates/checklist-template.md — ✅ no updates needed
  - .specify/templates/agent-file-template.md — ✅ no updates needed
  - .specify/templates/commands/ — N/A (directory empty)
- Follow-up TODOs: None
-->

# AI Agent 教学演示项目 Constitution

## Core Principles

### I. 教学清晰度优先

项目优先级排序：**教学清晰度 > 功能完整度 > 性能优化**。

- 所有技术决策 MUST 以"读者是否容易理解"为首要判断标准
- 目标读者：有前端基础、刚接触 AI/Agent 开发的中文开发者
- 代码结构 MUST 清晰分层，方便读者理解各模块的职责边界
- 当教学清晰度与功能完整度冲突时，MUST 优先保障教学清晰度

### II. 严格 TypeScript

TypeScript 是唯一开发语言，MUST 启用严格模式。

- MUST NOT 使用 `any` 类型，所有类型 MUST 显式声明
- Schema 校验 MUST 使用 zod，确保运行时类型安全
- 接口和类型定义 MUST 与 zod schema 保持一致

### III. 技术栈纪律

技术选型已锁定，MUST NOT 引入未列出的依赖。

- 运行时：Node.js 22+
- 框架：Next.js 16（App Router）、Mastra（AI Agent 框架）、
  Vercel AI SDK v5
- 包管理：pnpm（MUST NOT 使用 npm 或 yarn）
- 样式：Tailwind CSS（MUST NOT 引入额外 UI 组件库）
- HTTP 请求：MUST 只用原生 `fetch`，MUST NOT 安装 axios
  或其他 HTTP 库

### IV. 代码可读性

代码 MUST 对教学读者友好，遵循以下规范：

- 关键函数和模块 MUST 有中文注释，解释"做什么"和"为什么"
- 每个文件职责单一，MUST NOT 超过 200 行
- 所有环境变量 MUST 在 `.env.example` 中列出并用中文注释说明
- 变量和函数命名 MUST 语义清晰，避免缩写

### V. 健壮的错误处理

面向用户的错误信息 MUST 使用中文。

- 所有 API 调用 MUST 使用 try-catch 包裹
- 错误信息 MUST 对用户友好，使用中文描述问题和建议操作
- MUST NOT 将原始错误堆栈暴露给终端用户

### VI. AI Agent 工程规范

Agent 相关代码 MUST 遵循以下工程标准：

- Tool 的 `description` MUST 清晰描述功能、参数含义和返回值，
  这是 Agent 决策的核心依据
- Workflow Step 之间的 `inputSchema` / `outputSchema`
  MUST 严格对齐，类型不匹配 MUST 在编译期暴露
- Human-in-the-Loop 的 suspend/resume MUST 配置持久化存储，
  MUST NOT 仅依赖内存状态
- Agent instructions MUST 覆盖四个方面：角色定义、职责范围、
  工具使用指南、负面约束（明确禁止的行为）

### VII. 最小可运行原则

MUST 避免过度工程，保持最小可运行的教学示例。

- MUST NOT 为假设的未来需求添加抽象层
- 每个示例 MUST 聚焦于单一教学目标
- 重复代码优于过早抽象——除非重复已达 3 次以上
- MUST NOT 添加与教学目标无关的生产级优化

## 技术栈约束详情

| 类别 | 选型 | 约束 |
|------|------|------|
| 语言 | TypeScript (strict) | 禁止 `any` |
| 运行时 | Node.js 22+ | — |
| 前端框架 | Next.js 16 (App Router) | MUST 使用 App Router |
| AI Agent | Mastra | — |
| AI SDK | Vercel AI SDK v5 | — |
| 包管理 | pnpm | 禁止 npm/yarn |
| Schema | zod | — |
| 样式 | Tailwind CSS | 禁止额外 UI 库 |
| HTTP | 原生 fetch | 禁止 axios 等 |

新增依赖 MUST 经过以下审查：
1. 该依赖是否为教学目标所必需？
2. 是否有已有技术栈可替代的方案？
3. 引入后是否增加读者的认知负担？

三项全部通过方可引入。

## 教学与文档规范

- README MUST 用中文编写，包含项目结构说明和核心概念解释
- 每个独立模块/功能 SHOULD 有对应的中文说明文档
- 代码示例 MUST 可直接运行，MUST NOT 省略关键步骤
- 项目结构 MUST 反映教学的递进关系，从简单到复杂

## Governance

- 本 Constitution 是项目最高开发准则，所有 PR 和代码审查
  MUST 验证是否符合上述原则
- 修改 Constitution MUST 包含：变更说明、影响评估、迁移计划
- 版本管理遵循语义化版本：
  - MAJOR：原则删除或不兼容的重新定义
  - MINOR：新增原则或实质性扩展
  - PATCH：措辞澄清、格式修正
- 运行时开发指南参见 `.specify/templates/agent-file-template.md`

**Version**: 1.0.0 | **Ratified**: 2026-03-13 | **Last Amended**: 2026-03-13
