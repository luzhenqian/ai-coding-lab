# Research: 注入当前时间信息给大模型

## Decision: 日期格式

- **Decision**: 使用 `YYYY-MM-DD (timezone)` 格式
- **Rationale**: ISO 8601 日期格式是 LLM 最容易理解的格式，附加时区信息满足 FR-004
- **Alternatives considered**:
  - `toLocaleString()` — 输出因环境不同而变化，不可靠
  - Unix timestamp — 模型理解成本高

## Decision: 注入位置

- **Decision**: 在系统提示词（system prompt）开头注入
- **Rationale**: 系统提示词是模型最优先处理的上下文，放在开头确保模型注意到日期信息
- **Alternatives considered**:
  - 作为用户消息前缀 — 会污染用户消息，不优雅
  - 通过 tool 返回 — 需要模型主动调用，不如直接注入可靠

## Decision: 共享工具函数

- **Decision**: 新建 `src/lib/date.ts` 提供 `getCurrentDateString()`
- **Rationale**: Agent 和 Workflow 两处都需要日期注入，共享函数避免重复
- **Alternatives considered**:
  - 各自内联日期逻辑 — 违反 DRY 原则
