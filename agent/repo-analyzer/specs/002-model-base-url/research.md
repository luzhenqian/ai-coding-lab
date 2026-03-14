# Research: 大模型 Base URL 配置

## R-001: AI SDK Provider baseURL 支持

**Decision**: 使用 `createOpenAI({ baseURL })` 和 `createAnthropic({ baseURL })` 工厂函数

**Rationale**:
- `@ai-sdk/openai` 的 `createOpenAI` 接受 `OpenAIProviderSettings.baseURL?: string`
- `@ai-sdk/anthropic` 的 `createAnthropic` 接受 `AnthropicProviderSettings.baseURL?: string`
- 两者 baseURL 未设置时均使用官方默认地址，天然向后兼容
- 当前代码使用默认实例 `import { openai }` / `import { anthropic }`，需改为工厂函数调用

**Alternatives considered**:
- 使用 `OPENAI_API_BASE` 等非标准环境变量名 → 不采用，SDK 文档用 baseURL
- 使用单一 `MODEL_BASE_URL` 统一配置 → 不采用，两个 provider 地址通常不同
