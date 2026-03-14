# Feature Specification: 注入当前时间信息给大模型

**Feature Branch**: `004-inject-current-time`
**Created**: 2026-03-14
**Status**: Draft
**Input**: 为 AI 大模型注入当前时间信息，避免模型对日期产生困惑

## User Scenarios & Testing *(mandatory)*

### User Story 1 - AI 正确感知当前日期 (Priority: P1)

用户与 AI 对话时，AI 应知道当前的真实日期和时间。当 AI 分析仓库数据中包含日期信息（如仓库创建时间、最近更新时间）时，不会错误地将真实日期标注为"未来日期"或"异常数据"。

**Why this priority**: 这是核心功能缺陷——当前 AI 不知道今天的日期，导致对所有日期信息的判断都可能出错，严重影响分析报告的准确性和专业性。

**Independent Test**: 在聊天模式中发送"分析一个近期创建的仓库"，验证 AI 在回复中正确引用日期，不出现"这是未来日期"或类似的错误判断。

**Acceptance Scenarios**:

1. **Given** 用户请求分析一个仓库, **When** AI 获取到仓库的创建时间和更新时间, **Then** AI 正确理解这些日期与当前日期的关系（如"3 天前创建"而非"未来日期"）
2. **Given** 用户询问"今天是几号", **When** AI 回复, **Then** AI 给出正确的当前日期
3. **Given** AI 在分析报告中引用日期数据, **When** 报告生成完成, **Then** 报告中不出现将真实日期误判为异常或未来日期的描述

---

### Edge Cases

- 服务器时区与用户时区不同时，日期信息应基于服务器时区（UTC 或服务器本地时间），保持一致性
- 当 Workflow 模式跨越午夜执行时，注入的时间应反映流程开始时的时间

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统 MUST 在每次 AI 对话请求中包含当前日期和时间信息
- **FR-002**: 系统 MUST 在 Workflow 模式的 AI 生成步骤中同样包含当前日期和时间信息
- **FR-003**: 注入的时间信息 MUST 对用户透明——用户不需要手动输入或配置任何时间相关设置
- **FR-004**: 时间信息 MUST 包含年、月、日，以及时区标识

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: AI 在分析报告中对日期的描述 100% 准确，不再出现将当年日期误判为"未来日期"的情况
- **SC-002**: 用户询问"今天是几号"时，AI 能给出正确答案
- **SC-003**: 时间注入对用户完全透明，不增加任何用户操作步骤

## Assumptions

- AI 模型本身具备理解和使用系统提示（system prompt）中日期信息的能力
- 服务器端可以获取到准确的系统时间
- 时间精度到"日"级别即可满足需求，不需要秒级精度
