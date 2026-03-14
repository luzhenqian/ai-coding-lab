# Feature Specification: GitHub 仓库智能分析助手

**Feature Branch**: `001-repo-analyzer`
**Created**: 2026-03-13
**Status**: Draft
**Input**: User description: "构建一个 GitHub 仓库智能分析助手，展示 Tool Calling、Workflow 编排、Human-in-the-Loop 三个 AI Agent 核心概念"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 自由对话模式（展示 Tool Calling）(Priority: P1)

作为一个开发者，我希望在聊天界面中输入 GitHub 仓库 URL 或相关问题，AI 助手能自主判断并调用工具获取仓库信息，然后基于真实数据给出分析。

这是教学核心——展示 Agent 如何通过 Tool Calling 自主决策调用外部 API，是理解 AI Agent 最基础也最重要的概念。

**Why this priority**: Tool Calling 是 AI Agent 最基础的能力。没有 Tool Calling 的 Agent 只是一个聊天机器人。这个故事独立展示了 Agent 的"手"——通过工具与外部世界交互的能力，是后续所有功能的基础。

**Independent Test**: 启动应用后，在聊天界面输入 "帮我分析 https://github.com/vercel/next.js"，Agent 自动调用 GitHub API 获取仓库信息并返回中文分析结果。无需任何其他功能即可独立运行和演示。

**Acceptance Scenarios**:

1. **Given** 用户在聊天界面，**When** 输入 "帮我分析 https://github.com/vercel/next.js"，**Then** Agent 自动识别意图，调用 GitHub API 工具获取仓库基础信息（stars、forks、语言、license、描述等），以流式中文 Markdown 格式返回分析结果
2. **Given** Agent 已返回仓库基础分析，**When** 用户追问 "它的目录结构是怎样的？"，**Then** Agent 调用目录结构获取工具，返回根目录文件列表及简要说明
3. **Given** 用户输入包含仓库 URL 的消息，**When** 工具正在调用中，**Then** 界面实时显示工具调用状态标识（调用中 → 完成 / 失败）
4. **Given** 用户输入一个不存在的仓库 URL，**When** Agent 调用 GitHub API，**Then** 返回中文友好错误提示（如 "未找到该仓库，请检查 URL 是否正确"）
5. **Given** 用户输入非仓库相关的普通问题，**When** Agent 处理消息，**Then** Agent 正常回复，不强制调用 GitHub 工具

---

### User Story 2 - Workflow 分析流程（展示 Workflow 编排 + HITL）(Priority: P2)

作为一个开发者，我希望通过一个结构化流程对仓库进行深度分析，流程在关键步骤暂停等待我确认后再继续。

这个故事展示了两个进阶概念：Workflow 将多个步骤编排成可控流程，Human-in-the-Loop 让人类在关键节点介入决策。

**Why this priority**: Workflow 编排和 HITL 是 Agent 从"玩具"走向"生产"的关键能力。依赖 US-1 建立的 Tool Calling 基础认知，在此之上展示更复杂的编排模式。独立于 US-1 的实现，但教学上建议在理解 Tool Calling 后再学习。

**Independent Test**: 在 Workflow 模式下输入 "https://github.com/vercel/next.js"，观察流程自动执行前两步，在第三步暂停显示摘要卡片，点击"继续分析"后生成完整报告。

**Acceptance Scenarios**:

1. **Given** 用户在 Workflow 模式下，**When** 输入 GitHub 仓库 URL（如 "https://github.com/vercel/next.js"），**Then** 流程启动，按顺序执行：解析 URL → 获取数据 → 人工审批 → 生成报告
2. **Given** 流程执行到"解析 URL"步骤，**When** 步骤完成，**Then** 界面显示该步骤状态为"成功"，提取出的 owner/repo 信息可见，自动进入下一步
3. **Given** 流程执行到"获取数据"步骤，**When** 步骤完成，**Then** 并行获取仓库基础信息和目录结构，界面显示步骤状态为"成功"
4. **Given** 流程执行到"人工审批"步骤，**When** 步骤暂停，**Then** 界面显示仓库摘要卡片（仓库名、描述、stars、forks、主要语言、license）和两个按钮："继续分析"、"取消"
5. **Given** 用户在审批步骤看到摘要，**When** 点击"继续分析"，**Then** 流程恢复执行，AI 基于所有收集的数据生成结构化分析报告，报告以流式方式输出
6. **Given** 用户在审批步骤看到摘要，**When** 点击"取消"，**Then** 流程终止，界面显示友好提示（如 "分析已取消"），步骤状态更新为"已取消"
7. **Given** 流程正在执行，**When** 任意步骤执行中，**Then** 界面实时展示所有步骤的状态（等待 / 运行中 / 成功 / 暂停 / 失败 / 已取消）
8. **Given** 流程执行到"获取数据"步骤，**When** GitHub API 请求失败，**Then** 步骤状态显示"失败"，展示中文错误信息，流程终止

---

### User Story 3 - 模式切换 (Priority: P3)

作为一个开发者，我希望能在页面上自由切换自由对话模式和 Workflow 模式，直观体会两种 Agent 交互模式的区别。

**Why this priority**: 这是一个 UI 交互功能，将两个教学概念统一在一个应用中，方便读者对比学习。功能简单但教学价值高——让读者直观感受"自由对话"和"结构化流程"的差异。

**Independent Test**: 页面加载后默认在自由对话模式，点击切换按钮进入 Workflow 模式，再点击切回，验证状态正确清空和切换。

**Acceptance Scenarios**:

1. **Given** 页面加载完成，**When** 初始渲染，**Then** 默认显示自由对话模式（聊天界面），顶部有"自由对话"和"Workflow 分析"两个切换按钮，"自由对话"为选中状态
2. **Given** 用户在自由对话模式下已有对话记录，**When** 点击"Workflow 分析"按钮，**Then** 切换到 Workflow 模式，自由对话的消息记录被清空，显示 URL 输入框 + 步骤状态面板
3. **Given** 用户在 Workflow 模式下流程已在执行，**When** 点击"自由对话"按钮，**Then** 切换到自由对话模式，Workflow 的状态被清空，显示空的聊天界面

---

### Edge Cases

- 用户输入各种格式的 GitHub URL：`https://github.com/owner/repo`、`https://github.com/owner/repo.git`、`github.com/owner/repo`、`owner/repo`
- 用户输入私有仓库 URL → 返回中文提示 "该仓库不存在或为私有仓库，无法访问"
- GitHub API 速率限制触发 → 返回中文提示 "GitHub API 请求次数已达上限，请稍后重试或配置 Personal Access Token"
- Workflow 步骤中网络中断 → 对应步骤显示失败状态和错误信息
- 用户在 Workflow 流程暂停期间刷新页面 → 流程状态从持久化存储恢复（LibSQL），用户可继续操作
- 用户快速连续提交多个仓库 URL（自由对话模式）→ 按顺序处理，不丢失消息

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统 MUST 提供基于 Mastra Agent 的自由对话界面，Agent 通过 Tool Calling 自主决策调用 GitHub API
- **FR-002**: 系统 MUST 提供两个 Agent Tool：获取仓库基础信息（`getRepoInfo`）、获取仓库目录结构（`getRepoTree`，支持 depth 参数，默认 1）
- **FR-003**: Agent Tool 的 description MUST 清晰描述功能和参数，使 Agent 能正确决策何时调用
- **FR-004**: 系统 MUST 提供基于 Mastra Workflow 的结构化分析流程，包含四个步骤：解析 URL、获取数据、人工审批、生成报告
- **FR-005**: Workflow 的"人工审批"步骤 MUST 使用 Mastra 的 suspend/resume 机制实现暂停和恢复
- **FR-006**: Workflow 状态 MUST 持久化到本地 LibSQL 数据库，支持页面刷新后恢复
- **FR-007**: 系统 MUST 支持解析多种 GitHub URL 格式：完整 URL、带 `.git` 后缀、不带协议、`owner/repo` 简写
- **FR-008**: 所有 AI 响应 MUST 以流式方式输出（streaming）
- **FR-009**: 界面 MUST 实时显示工具调用状态（自由对话模式）和步骤执行状态（Workflow 模式）
- **FR-010**: 系统 MUST 支持可选的 GitHub Personal Access Token 配置以提升 API 速率限制
- **FR-011**: 所有面向用户的错误信息和 AI 回复 MUST 使用中文
- **FR-012**: 界面 MUST 提供模式切换功能，切换时清空对方模式的状态
- **FR-013**: 系统 MUST 支持多 LLM 模型（如 OpenAI、Anthropic），通过环境变量 `MODEL_PROVIDER` 和 `MODEL_NAME` 切换，`.env.example` 中列出所有支持的配置

### Key Entities

- **GitHubRepo**: 仓库基础信息实体，包含 owner、repo name、description、stars count、forks count、primary language、license、topics、created date、updated date
- **RepoTree**: 仓库目录结构实体，包含文件/目录名、类型（file/dir）、路径、查询深度（depth，默认 1，可由 Agent 传参指定）
- **WorkflowRun**: Workflow 执行实例，包含 run ID、当前步骤、各步骤状态、收集的数据、暂停/恢复状态
- **AnalysisReport**: AI 生成的分析报告，包含仓库概述、技术栈分析、项目结构解读、综合评价

## Clarifications

### Session 2026-03-13

- Q: Agent 使用的 LLM 模型？ → A: 同时支持多模型（如 OpenAI、Anthropic），通过环境变量切换
- Q: Workflow 模式的输入界面形态？ → A: 独立 URL 输入框 + 步骤状态面板（非聊天界面），与自由对话模式的聊天界面形成对比
- Q: getRepoTree 工具返回的目录深度？ → A: 可配置深度，默认根目录（depth=1），Agent 可通过参数指定更深层级

## Out of Scope

- 用户认证/登录系统
- 数据库持久化分析结果（仅用 LibSQL 存储 Workflow 运行状态）
- 移动端响应式适配
- 国际化（仅支持中文）
- GitHub OAuth 认证（仅支持可选的 Personal Access Token）
- 仓库深度分析（如代码质量评分、依赖安全审计等）

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 用户输入仓库 URL 后，自由对话模式在 10 秒内开始流式返回分析结果
- **SC-002**: Workflow 模式从启动到人工审批暂停，全流程在 15 秒内完成前三步
- **SC-003**: 读者能在 README 指引下 5 分钟内完成项目启动（`pnpm install` → 配置 `.env` → `pnpm dev`）
- **SC-004**: 代码结构清晰到读者能在 30 分钟内理解 Tool Calling、Workflow、HITL 三个核心概念的实现方式
