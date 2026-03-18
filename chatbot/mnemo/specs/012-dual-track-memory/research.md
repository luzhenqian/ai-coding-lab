# Research: 双轨记忆提取

## R1: Hot Path — LLM 判断方案选型

**Decision**: 使用 Vercel AI SDK 的 `generateObject` 配合 `zod` schema 返回结构化布尔值判断

**Rationale**:
- 项目已在 `memory-extractor.ts` 中使用 `generateObject` + `zod`，保持一致性
- 返回 `{ worthy: boolean, reason: string }` 结构，reason 字段辅助 debug
- 使用同一个 `chatModel`（Claude），无需引入额外 provider

**Alternatives considered**:
- **Embedding 相似度判断**：用 embedding 计算消息与"个人信息"模板的相似度。优点是无需 LLM 调用；缺点是准确率低，难以捕捉隐式个人信息
- **本地分类器**：训练轻量分类模型。优点是延迟低；缺点是需要训练数据和额外基础设施，违背教学项目的简洁原则
- **关键词 + 正则增强**：扩充关键词列表。优点是零延迟；缺点是本质上无法解决覆盖率问题

## R2: Background — 空闲检测方案选型

**Decision**: 使用 Node.js 进程内 `setTimeout` + 内存 Map 跟踪每个对话的最后活跃时间

**Rationale**:
- Next.js serverless 环境下，最简单的方案是在 `after()` 回调中为每次消息重置一个定时器
- 使用 `Map<conversationId, NodeJS.Timeout>` 存储活跃定时器
- 定时器到期时触发 `extractMemories`，模式与现有 `after()` 中的提取逻辑一致
- Vercel serverless 函数有执行时间限制，但 `after()` 回调可以延长执行窗口

**Alternatives considered**:
- **数据库轮询**：定时任务查数据库中的 `updatedAt`。优点是持久化；缺点是需要 cron job 基础设施，对教学项目过于复杂
- **客户端心跳**：前端发 heartbeat 请求。优点是准确检测用户在线；缺点是增加客户端复杂度和网络开销
- **WebSocket 连接状态**：通过 WS 断开检测空闲。优点是实时性好；缺点是项目不使用 WebSocket

## R3: Hot Path 判断 Prompt 设计

**Decision**: 使用简洁的中文 prompt 要求 LLM 判断单条用户消息是否包含值得长期记忆的用户信息

**Rationale**:
- Prompt 需要足够精简以降低延迟和 token 消耗
- 明确列出"值得记忆"和"不值得记忆"的例子，帮助 LLM 理解边界
- 只传入单条用户消息（不传对话历史），保持判断轻量

**Key design choices**:
- 输出 schema: `{ worthy: boolean, reason: string }`
- reason 字段限制 50 字以内，仅用于 debug 日志
- 不传助手回复，只评估用户消息

## R4: 双轨去重策略

**Decision**: 复用现有的 `findDuplicateMemory` 去重机制（embedding 相似度 > 0.85 即视为重复）

**Rationale**:
- 现有去重逻辑已在 `extractMemories` 函数中实现，Hot Path 和 Background 都会调用该函数
- 无需额外去重层；两条路径产生的记忆在写入前都会经过相同的重复检查
- 如果 Hot Path 已提取某条记忆，Background 再次尝试时会命中去重条件，自动更新而非重复插入
