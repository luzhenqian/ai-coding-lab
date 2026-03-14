# Feature Specification: 大模型 Base URL 配置

**Feature Branch**: `001-model-base-url`
**Created**: 2026-03-14
**Status**: Draft
**Input**: 增加环境变量支持自定义大模型 API 的 Base URL（中转站/代理地址）

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 配置中转站地址访问大模型 API (Priority: P1)

作为中国开发者，我希望通过环境变量配置 OpenAI 或 Anthropic API 的中转站地址，这样即使在网络受限的环境下也能正常使用本项目的 AI 功能。

**Why this priority**: 这是本功能的唯一核心需求，中国开发者直连海外 API 常遇到网络不稳定问题，配置中转站是最常见的解决方案。

**Independent Test**: 在 `.env` 中配置 `OPENAI_BASE_URL=https://my-proxy.example.com/v1`，启动应用后在自由对话模式输入仓库地址，验证 Agent 能正常调用 API 返回分析结果。

**Acceptance Scenarios**:

1. **Given** 用户在 `.env` 中配置了 `OPENAI_BASE_URL`，**When** 使用 OpenAI 模型发起对话，**Then** API 请求发送到配置的中转站地址而非官方地址
2. **Given** 用户在 `.env` 中配置了 `ANTHROPIC_BASE_URL`，**When** 使用 Anthropic 模型发起对话，**Then** API 请求发送到配置的中转站地址
3. **Given** 用户未配置任何 Base URL 环境变量，**When** 发起对话，**Then** 系统使用各提供商的默认官方地址，行为与配置前完全一致

---

### Edge Cases

- 用户配置了 Base URL 但地址不可达时，系统应返回清晰的中文网络错误信息（已有的错误处理机制覆盖）
- 用户配置的 Base URL 末尾带或不带斜杠，系统均应正常工作（由 SDK 内部处理）
- 仅配置了 `OPENAI_BASE_URL` 但使用 Anthropic 模型时，Anthropic 仍使用默认地址（互不影响）

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统 MUST 支持通过 `OPENAI_BASE_URL` 环境变量配置 OpenAI API 的请求地址
- **FR-002**: 系统 MUST 支持通过 `ANTHROPIC_BASE_URL` 环境变量配置 Anthropic API 的请求地址
- **FR-003**: 当 Base URL 环境变量未设置时，系统 MUST 使用各提供商的默认官方 API 地址
- **FR-004**: `.env.example` MUST 包含新增环境变量的说明和中文注释
- **FR-005**: 项目文档 MUST 更新环境变量说明，告知用户如何配置中转站

### Assumptions

- 中转站 API 与官方 API 接口完全兼容，无需额外的请求/响应转换
- AI SDK 的 OpenAI 和 Anthropic provider 均支持 `baseURL` 配置参数
- Base URL 的格式校验由各 SDK provider 内部处理，无需应用层额外验证

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 配置中转站地址后，所有 AI 功能（自由对话 + Workflow 报告生成）均可正常工作
- **SC-002**: 未配置中转站地址时，系统行为与修改前完全一致（向后兼容）
- **SC-003**: 新增环境变量在 `.env.example` 和 README 中有清晰的中文说明
