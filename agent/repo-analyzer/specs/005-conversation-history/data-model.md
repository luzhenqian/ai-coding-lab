# Data Model: 对话历史系统

**Feature**: 005-conversation-history | **Date**: 2026-03-14

## 实体关系

```
┌─────────────────────────┐
│    StoredConversation    │
├─────────────────────────┤
│ id: string (UUID)       │
│ title: string           │
│ createdAt: string (ISO) │
│ updatedAt: string (ISO) │
│ messages: StoredMessage[]│
└──────────┬──────────────┘
           │ 1:N
           ▼
┌─────────────────────────┐
│     StoredMessage        │
├─────────────────────────┤
│ id: string               │
│ role: 'user' | 'assistant' | 'system' │
│ parts: unknown[]         │
│ createdAt?: string (ISO) │
└─────────────────────────┘
```

## StoredConversation

对话实体，代表一次完整的用户与 AI 的交互会话。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `string` | ✅ | 唯一标识，使用 `crypto.randomUUID()` 生成 |
| `title` | `string` | ✅ | 对话标题，自动从第一条用户消息截取前 20 字符生成，新建时为空字符串 |
| `createdAt` | `string` | ✅ | 创建时间，ISO 8601 格式（如 `"2026-03-14T10:30:00.000Z"`） |
| `updatedAt` | `string` | ✅ | 最后更新时间，每次保存消息时更新，用于对话列表排序 |
| `messages` | `StoredMessage[]` | ✅ | 对话中的所有消息，新建时为空数组 |

### Zod Schema

```typescript
import { z } from 'zod'

const storedMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  parts: z.array(z.unknown()),
  createdAt: z.string().optional(),
})

const storedConversationSchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  messages: z.array(storedMessageSchema),
})

/** 用于校验从 localStorage 读取的完整对话列表 */
const storedConversationListSchema = z.array(storedConversationSchema)

type StoredConversation = z.infer<typeof storedConversationSchema>
type StoredMessage = z.infer<typeof storedMessageSchema>
```

## StoredMessage

消息实体，对应 AI SDK v5 的 `UIMessage` 类型的持久化子集。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `string` | ✅ | 消息唯一标识，由 AI SDK 生成 |
| `role` | `'user' \| 'assistant' \| 'system'` | ✅ | 消息角色 |
| `parts` | `unknown[]` | ✅ | 消息内容部分，包含文本和工具调用信息 |
| `createdAt` | `string` | ❌ | 消息创建时间 |

### 与 AI SDK UIMessage 的映射

AI SDK v5 的 `UIMessage` 类型（来自 `@ai-sdk/react`）包含较多运行时字段。持久化时只保存渲染所需的核心字段：

```
UIMessage (AI SDK)          →  StoredMessage (持久化)
─────────────────────────       ─────────────────────
id: string                  →  id: string          ✅ 保留
role: string                →  role: enum           ✅ 保留
parts: MessagePart[]        →  parts: unknown[]     ✅ 保留（完整序列化）
createdAt: Date             →  createdAt: string    ✅ 转为 ISO 字符串
status: MessageStatus       →  （不保存）            ❌ 运行时状态
```

### 序列化与反序列化

**保存时**（UIMessage → StoredMessage）：

```typescript
function toStoredMessage(message: UIMessage): StoredMessage {
  return {
    id: message.id,
    role: message.role,
    parts: message.parts,
    createdAt: message.createdAt?.toISOString(),
  }
}
```

**恢复时**（StoredMessage → UIMessage 的 initialMessages 格式）：

```typescript
function toInitialMessage(stored: StoredMessage): UIMessage {
  return {
    id: stored.id,
    role: stored.role,
    parts: stored.parts as UIMessage['parts'],
    createdAt: stored.createdAt ? new Date(stored.createdAt) : undefined,
  }
}
```

> **注意**：`parts` 使用 `z.unknown()` 做宽松校验。AI SDK 的 `parts` 内部结构（`TextPart`、`ToolCallPart` 等）由 SDK 管理，过度约束会在 SDK 版本升级时导致校验失败。

## 存储结构

### localStorage Key

```
repo-analyzer:conversations
```

### 存储值格式

JSON 序列化的 `StoredConversation[]` 数组：

```json
[
  {
    "id": "a1b2c3d4-...",
    "title": "分析一下 vercel/next...",
    "createdAt": "2026-03-14T10:00:00.000Z",
    "updatedAt": "2026-03-14T10:05:30.000Z",
    "messages": [
      {
        "id": "msg-001",
        "role": "user",
        "parts": [{ "type": "text", "text": "分析一下 vercel/next.js" }],
        "createdAt": "2026-03-14T10:00:00.000Z"
      },
      {
        "id": "msg-002",
        "role": "assistant",
        "parts": [
          { "type": "text", "text": "我来帮你分析这个仓库..." },
          { "type": "tool-fetchRepoInfo", "toolCallId": "tc-001", "state": "output-available" }
        ],
        "createdAt": "2026-03-14T10:00:05.000Z"
      }
    ]
  }
]
```

## 容量估算

| 指标 | 估算值 |
|------|--------|
| 单条消息平均大小 | ~500 字节（含工具调用约 1KB） |
| 单个对话平均消息数 | 10-20 条 |
| 单个对话平均大小 | ~10KB |
| 50 个对话总大小 | ~500KB |
| localStorage 限制 | ~5MB |
| 安全使用上限 | ~200 个对话 |

容量充足，无需担心 localStorage 限制。写入时仍需捕获 `QuotaExceededError` 作为防御性编程。
