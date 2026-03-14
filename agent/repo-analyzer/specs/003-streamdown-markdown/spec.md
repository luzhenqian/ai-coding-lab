# Feature Specification: Streamdown Markdown 流式渲染

**Feature Branch**: `003-streamdown-markdown`
**Created**: 2026-03-14
**Status**: Draft
**Input**: 集成 Streamdown 库实现 Markdown 流式渲染

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 聊天模式 AI 回复 Markdown 渲染 (Priority: P1)

用户在聊天模式中与 AI 对话，AI 返回包含 Markdown 格式的分析报告（包括标题、表格、列表、代码块等）。系统应实时将 Markdown 渲染为美观的富文本格式，而非显示原始 Markdown 符号。

**Why this priority**: 聊天模式是用户的主要交互方式，Markdown 原始文本严重影响阅读体验，尤其是表格和代码块。

**Independent Test**: 在聊天界面发送"分析 vercel/next.js"，观察 AI 回复中的标题、表格、代码块、列表是否正确渲染为富文本格式。

**Acceptance Scenarios**:

1. **Given** 用户在聊天模式中, **When** AI 回复包含 Markdown 表格, **Then** 表格以格式化的行列形式展示，而非原始管道符文本
2. **Given** AI 正在流式输出, **When** Markdown 内容逐字到达, **Then** 已到达的部分实时渲染为富文本，用户不需要等待完整输出
3. **Given** AI 回复包含代码块, **When** 代码块完整到达, **Then** 代码以等宽字体展示，并有可区分的背景色
4. **Given** AI 回复包含多级标题和列表, **When** 内容展示, **Then** 标题有明显的层级区分，列表有正确的缩进和符号

---

### User Story 2 - Workflow 模式报告 Markdown 渲染 (Priority: P2)

用户在 Workflow 分析模式中完成全部流程后，系统生成的分析报告同样以美观的 Markdown 富文本格式展示。

**Why this priority**: Workflow 模式产生的报告通常更长、结构更复杂，良好的渲染能提升阅读效率，但使用频率低于聊天模式。

**Independent Test**: 在 Workflow 模式中完成一次仓库分析，检查最终报告中的标题、表格、列表是否正确渲染。

**Acceptance Scenarios**:

1. **Given** Workflow 完成分析并生成报告, **When** 报告包含 Markdown 格式内容, **Then** 报告以富文本格式渲染展示
2. **Given** 报告正在流式生成, **When** 内容逐步到达, **Then** 已到达部分实时渲染为富文本

---

### Edge Cases

- 当 AI 回复不包含任何 Markdown 格式（纯文本）时，应正常显示文本，不出现渲染异常
- 当 Markdown 格式不完整（如流式传输中表格只到达一半）时，应优雅处理，不出现错误或布局崩溃
- 当 AI 回复包含超长代码块或超宽表格时，应有合理的溢出处理（如水平滚动），不破坏整体布局
- 用户发送的消息（气泡右侧）不应进行 Markdown 渲染，保持纯文本展示

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统 MUST 将 AI 回复中的 Markdown 内容渲染为富文本格式，包括：标题（h1-h6）、粗体/斜体、有序/无序列表、表格、代码块（含行内代码）、引用块、链接
- **FR-002**: 系统 MUST 在 AI 流式输出过程中实时渲染 Markdown，不等待完整内容到达
- **FR-003**: 系统 MUST 仅对 AI 回复（assistant 消息）进行 Markdown 渲染，用户消息保持纯文本
- **FR-004**: 系统 MUST 在聊天模式和 Workflow 报告模式中统一使用相同的 Markdown 渲染方案
- **FR-005**: 系统 MUST 在代码块中使用等宽字体和可区分的背景样式
- **FR-006**: 系统 MUST 对超宽内容（如宽表格、长代码行）提供水平滚动，不破坏页面布局

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: AI 回复中的 Markdown 表格、标题、代码块、列表 100% 正确渲染为对应的富文本元素
- **SC-002**: 流式输出过程中，每个文本片段到达后 100ms 内完成渲染更新，用户无感知延迟
- **SC-003**: 渲染后的页面在桌面端（1280px 宽度及以上）无水平溢出，超宽元素通过局部滚动处理
- **SC-004**: 用户消息（右侧气泡）保持纯文本展示，不受 Markdown 渲染影响

## Assumptions

- 项目已使用 Tailwind CSS，Markdown 渲染样式应与 Tailwind 配合工作
- Streamdown 库支持在浏览器端运行，兼容 React 组件模型
- 当前项目的 AI 回复通过 AI SDK v5 的 useChat hook 以 parts 数组形式提供文本内容
