# Data Model: 双轨记忆提取

## Existing Entities (Unchanged)

### Memory
已有的 `memories` 表不需要修改。记忆的存储、检索和去重逻辑保持不变。

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | string | User identifier |
| content | string | Memory content |
| category | enum(preference, fact, behavior) | Memory category |
| embedding | vector(1536) | Semantic embedding |
| importanceScore | number | Importance weight |
| accessCount | number | Times retrieved |
| lastAccessedAt | timestamp | Last retrieval time |
| createdAt | timestamp | Creation time |
| updatedAt | timestamp | Last update time |

## New In-Memory Structures (No DB Changes)

### IdleTimerMap
进程内内存结构，不持久化到数据库。

```
Map<conversationId: string, timeoutHandle: NodeJS.Timeout>
```

- 每次收到用户消息时，清除该对话的旧定时器并创建新定时器
- 定时器到期（默认 2 分钟）后触发 Background 提取
- 进程重启时定时器自然丢失，这是可接受的（Background 是补充机制，非关键路径）

### MemoryWorthinessResult
Hot Path LLM 判断的返回结构。

| Field | Type | Description |
|-------|------|-------------|
| worthy | boolean | 是否值得提取记忆 |
| reason | string | 判断理由（debug 用，≤50字） |

## State Transitions

```
用户消息到达
    │
    ├─→ Hot Path (async, in after())
    │     ├─→ LLM 判断: worthy=true → extractMemories()
    │     └─→ LLM 判断: worthy=false → skip
    │
    └─→ Idle Timer
          ├─→ 重置定时器 (clearTimeout + setTimeout)
          └─→ 定时器到期 → Background extractMemories()
```
