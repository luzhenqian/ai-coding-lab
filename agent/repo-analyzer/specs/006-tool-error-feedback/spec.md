# Feature Specification: 工具调用错误反馈

**Feature Branch**: `006-tool-error-feedback`
**Created**: 2026-03-14
**Status**: Draft
**Input**: 当 GitHub API 工具调用失败时，将错误信息反馈给前端用户

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 工具调用失败时显示错误信息 (Priority: P1)

用户在聊天模式中请求分析一个 GitHub 仓库，Agent 调用工具时因 API 请求次数达上限（HTTP 403）而失败。当前前端只显示一个红色的"出错"徽章，但不展示具体错误原因。用户无法知道是什么原因导致失败，也不知道该如何解决。

**Why this priority**: 这是核心体验问题——工具执行失败是常见场景（特别是未配置 GITHUB_TOKEN 时），用户必须看到具体错误原因才能采取行动。

**Independent Test**: 不配置 GITHUB_TOKEN，连续请求分析多个仓库直到触发 GitHub API 限流，验证前端展示了具体的错误信息。

**Acceptance Scenarios**:

1. **Given** Agent 调用工具时发生错误, **When** 工具返回 output-error 状态, **Then** 前端在工具状态徽章下方展示具体的中文错误信息
2. **Given** GitHub API 返回 403 限流错误, **When** 错误信息传递到前端, **Then** 用户看到"GitHub API 请求次数已达上限，请稍后重试或在 .env 中配置 GITHUB_TOKEN"
3. **Given** 仓库不存在（404）, **When** 错误信息传递到前端, **Then** 用户看到"仓库 xxx 不存在或为私有仓库"

---

### Edge Cases

- 错误信息过长时应截断或换行显示，不破坏聊天气泡布局
- 多个工具调用中只有部分失败时，成功的工具应正常显示结果，失败的工具显示错误

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统 MUST 在工具调用失败（state === 'output-error'）时，将错误文本（errorText）展示在工具状态徽章附近
- **FR-002**: 错误信息展示 MUST 使用醒目的错误样式（红色背景或边框），与正常状态有明显区分
- **FR-003**: 系统 MUST 保持已有的工具状态徽章显示（"出错"标签），在其下方额外展示错误详情

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 工具调用失败时，100% 的错误场景在前端有具体错误信息展示
- **SC-002**: 错误信息在工具调用失败后 1 秒内显示在聊天界面中

## Assumptions

- AI SDK v5 的工具 part 在 state 为 `output-error` 时包含 `errorText` 字段
- 错误信息已在服务端（github.ts）翻译为中文，前端无需额外处理
