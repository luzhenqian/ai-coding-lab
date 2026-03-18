# Feature Specification: 双轨记忆提取（Dual-Track Memory Extraction）

**Feature Branch**: `012-dual-track-memory`
**Created**: 2026-03-18
**Status**: Draft
**Input**: 改造记忆提取机制，从固定周期+硬编码关键词升级为 Hot Path + Background 双轨方案

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 实时记忆捕获（Hot Path）(Priority: P1)

用户在对话中自然地提到个人信息（如"我是做前端的"、"我们团队有 12 个人"），系统自动识别这条消息包含值得记忆的内容，并立即提取和存储记忆。用户无需使用特定关键词，也无需等待固定轮次。

**Why this priority**: 这是核心改造点。当前硬编码关键词无法覆盖所有有价值的记忆场景，导致大量用户信息被遗漏。用 LLM 智能判断可以大幅提升记忆捕获的召回率。

**Independent Test**: 发送一条包含个人偏好但不含任何硬编码关键词的消息（如"周末我一般都在写代码"），验证系统能识别并提取记忆。

**Acceptance Scenarios**:

1. **Given** 用户正在对话中, **When** 用户发送"我们公司用的是飞书管理项目", **Then** 系统判断该消息值得记忆，触发记忆提取，并存储"用户公司使用飞书管理项目"这条记忆
2. **Given** 用户正在对话中, **When** 用户发送"今天天气真好", **Then** 系统判断该消息不含值得记忆的信息，不触发记忆提取
3. **Given** 记忆提取判断失败（LLM 调用出错）, **When** 用户发送任意消息, **Then** 聊天流程正常进行，不受影响

---

### User Story 2 - 后台批量记忆整理（Background）(Priority: P2)

用户在一段密集对话后停下来（空闲超过 2 分钟），系统自动在后台回顾最近的对话内容，批量提取可能被实时路径遗漏的记忆。这是对 Hot Path 的补充，确保不会遗漏重要信息。

**Why this priority**: 作为 Hot Path 的安全网。Hot Path 每次只看单条消息，可能遗漏需要多轮对话才能体现的模式或事实。后台批量提取可以从更完整的上下文中发现这些信息。

**Independent Test**: 进行多轮对话但不触及 Hot Path 的判定阈值，等待空闲超时后，检查数据库中是否有新提取的记忆。

**Acceptance Scenarios**:

1. **Given** 用户已有 10 轮以上的对话且最后一条消息距今超过 2 分钟, **When** 空闲检测触发, **Then** 系统异步回顾最近对话并批量提取记忆
2. **Given** 用户在空闲期间再次发送消息, **When** 后台提取正在进行, **Then** 后台提取继续完成，不影响新消息的处理
3. **Given** 对话消息数不足（少于 4 条）, **When** 空闲超时触发, **Then** 系统跳过本次后台提取（消息太少没有提取价值）

---

### User Story 3 - Debug 面板展示提取来源 (Priority: P3)

开发者在 Debug 面板中能看到记忆的提取来源（Hot Path 还是 Background），方便调试和验证双轨机制是否正常工作。

**Why this priority**: 辅助开发和调试，不影响核心功能。

**Independent Test**: 触发 Hot Path 和 Background 提取后，在 Debug 面板中查看记忆列表，确认每条记忆标注了提取来源。

**Acceptance Scenarios**:

1. **Given** 通过 Hot Path 提取了一条记忆, **When** 开发者打开 Debug 面板, **Then** 该记忆旁标注"实时提取"
2. **Given** 通过 Background 提取了一条记忆, **When** 开发者打开 Debug 面板, **Then** 该记忆旁标注"后台提取"

---

### Edge Cases

- 用户连续快速发送多条消息时，Hot Path 判断应逐条独立进行，不互相阻塞
- LLM 判断服务不可用时，应静默降级（不提取记忆），不影响聊天主流程
- 后台提取与 Hot Path 同时运行时，去重机制应防止产生重复记忆
- 用户在极短时间内（如 10 秒）发送大量消息时，Hot Path 的 LLM 调用不应造成显著延迟
- 后台提取过程中对话被删除时，提取应安全终止

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统 MUST 对每条用户消息进行智能判断，确定是否包含值得记忆的信息（替代硬编码关键词）
- **FR-002**: 当判断结果为"值得记忆"时，系统 MUST 立即触发记忆提取（Hot Path）
- **FR-003**: 当判断结果为"不值得记忆"时，系统 MUST 跳过记忆提取，不产生额外开销
- **FR-004**: 系统 MUST 在用户空闲超过可配置时长（默认 2 分钟）后，触发后台批量记忆提取（Background）
- **FR-005**: 后台提取 MUST 回顾最近的对话消息（至少最近 20 条），从完整上下文中提取记忆
- **FR-006**: Hot Path 的智能判断 MUST 不阻塞聊天响应流（异步执行或在 after() 回调中执行）
- **FR-007**: 双轨提取产生的记忆 MUST 经过现有去重机制，避免重复存储
- **FR-008**: LLM 判断或提取失败时，系统 MUST 静默降级，聊天主流程不受影响
- **FR-009**: 后台提取的空闲时长阈值 MUST 可通过常量配置
- **FR-010**: 系统 MUST 移除现有的硬编码关键词列表和固定周期触发逻辑

### Key Entities

- **记忆判断结果（Memory Worthiness Decision）**: 对单条用户消息的判断结果，包含是否值得记忆的布尔值
- **空闲计时器（Idle Timer）**: 跟踪每个对话的最后活跃时间，用于触发后台提取
- **提取来源标记（Extraction Source）**: 标识一条记忆是通过 Hot Path 还是 Background 提取的

## Assumptions

- Hot Path 的 LLM 判断调用足够轻量（仅返回布尔值），延迟可控
- 现有的 `extractMemories` 函数和去重逻辑满足双轨需求，无需修改
- 后台空闲检测在服务端实现，不依赖客户端心跳
- 单用户场景（DEFAULT_USER_ID），不考虑多用户并发

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 包含个人信息的用户消息被成功识别并提取记忆的比率达到 80% 以上（对比当前关键词方案的预估 30-40%）
- **SC-002**: 不含个人信息的闲聊消息不触发记忆提取的比率达到 90% 以上（避免无效提取）
- **SC-003**: Hot Path 的判断过程不增加用户可感知的聊天响应延迟（判断在后台异步完成）
- **SC-004**: 后台提取在空闲超时后 10 秒内启动
- **SC-005**: 双轨机制产生的重复记忆率低于 5%（依赖现有去重机制）
