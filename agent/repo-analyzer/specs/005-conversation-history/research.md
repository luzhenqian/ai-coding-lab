# Research: 对话历史系统技术决策

**Feature**: 005-conversation-history | **Date**: 2026-03-14

## Decision 1: 存储方案 — localStorage vs IndexedDB

### 对比分析

| 维度 | localStorage | IndexedDB |
|------|-------------|-----------|
| API 复杂度 | 同步 API，`getItem`/`setItem` 即可 | 异步 API，需要打开数据库、创建事务、操作 object store |
| 存储容量 | ~5MB | ~50MB+ |
| 数据结构 | 纯字符串，需要 JSON 序列化 | 支持结构化数据，原生对象存储 |
| 查询能力 | 无，需要全量加载后在内存中过滤 | 支持索引和游标查询 |
| 学习成本 | 极低，前端基础知识 | 中等，API 较为复杂 |
| 浏览器兼容性 | 全部支持 | 全部支持 |

### 决策：选择 localStorage

**理由**：

1. **教学清晰度**（Constitution 第一原则）：localStorage 是前端开发者最熟悉的存储 API，读者无需额外学习
2. **数据量评估**：spec 假设单对话不超过 100 条消息，总对话数通常 < 50 条。按每条消息平均 500 字节估算，50 条对话 × 100 条消息 × 500B ≈ 2.5MB，远在 5MB 限制内
3. **最小可运行原则**（Constitution 第七原则）：localStorage 的同步 API 避免了异步状态管理的复杂性，代码更简洁
4. **不需要复杂查询**：对话列表按时间排序 + 按 ID 查找，在内存中操作足够

**权衡**：如果未来对话数据量增长（如保存大量工具调用结果），可以迁移到 IndexedDB。但当前教学场景不需要。

---

## Decision 2: 数据结构设计

### 方案 A：每个对话一个 localStorage key

```
repo-analyzer:conversation:abc123 → { id, title, ... }
repo-analyzer:conversation:def456 → { id, title, ... }
repo-analyzer:conversation-ids → ["abc123", "def456"]
```

### 方案 B：所有对话存储在单个 key 中

```
repo-analyzer:conversations → [{ id, title, messages, ... }, ...]
```

### 决策：选择方案 B（单个 key）

**理由**：

1. **简单直观**：一次 `getItem` 获取所有数据，无需维护索引 key
2. **原子性**：列表操作（新增、删除）在单次 `setItem` 中完成，不会出现索引与数据不一致
3. **性能足够**：50 条对话的 JSON 解析在毫秒级完成，满足 SC-002（500ms）的要求
4. **代码量更少**：不需要管理多个 key 的同步问题

**权衡**：方案 A 在对话量极大时性能更好（只加载需要的对话），但超出了教学项目的实际使用范围。

### 存储 key 命名

使用 `repo-analyzer:conversations` 作为存储键名，添加应用前缀避免与其他应用冲突。

---

## Decision 3: 与 AI SDK v5 useChat 的集成方式

### 核心问题

AI SDK v5 的 `useChat` hook 接受 `initialMessages` 参数来初始化消息列表。但 `initialMessages` 仅在 hook 初始化时读取，后续更改不会生效。

### 当前 ChatPanel 的 useChat 用法

```typescript
const { messages, sendMessage, status, stop } = useChat({ transport })
```

### 集成方案：key prop 强制重新挂载

当切换对话时，通过改变 ChatPanel 的 React `key` prop 强制组件卸载并重新挂载：

```tsx
{/* page.tsx 中 */}
<ChatPanel key={activeConversationId} conversationId={activeConversationId} />
```

ChatPanel 内部使用 `initialMessages`：

```typescript
// 从 store 加载历史消息
const storedConversation = conversationId
  ? getConversationById(conversationId)
  : null

const { messages, sendMessage, status, stop } = useChat({
  transport,
  initialMessages: storedConversation?.messages ?? [],
})
```

**为什么选择 key prop 方案**：

1. 这是 React 的标准模式，用于在 prop 变化时重置组件状态
2. 避免手动管理 `useChat` 的内部状态（如调用 `setMessages`）
3. 代码改动最小，ChatPanel 只需新增 props 和 `initialMessages` 配置

### 消息保存时机

使用 `useEffect` 监听 `messages` 数组的变化，通过父组件回调保存到 localStorage：

```typescript
useEffect(() => {
  if (messages.length > 0 && onMessagesChange) {
    onMessagesChange(messages)
  }
}, [messages, onMessagesChange])
```

**注意**：为避免频繁写入 localStorage，可以考虑 debounce，但在教学项目中直接写入即可，因为 `setItem` 是同步操作且数据量小。

---

## Decision 4: 自动标题生成策略

### 方案对比

| 方案 | 实现复杂度 | 效果 |
|------|-----------|------|
| A. 截取第一条用户消息前 N 个字符 | 极低 | 足够辨识，但可能截断 |
| B. 调用 AI 生成标题 | 高（需额外 API 调用） | 标题更自然 |
| C. 使用固定格式 "对话 #N" | 极低 | 辨识度低 |

### 决策：选择方案 A（截取首条消息）

**实现**：

```typescript
/** 从第一条用户消息生成对话标题，截取前 20 个字符 */
function generateTitle(firstUserMessage: string): string {
  const maxLength = 20
  const trimmed = firstUserMessage.trim()
  if (trimmed.length <= maxLength) return trimmed
  return trimmed.slice(0, maxLength) + '...'
}
```

**理由**：

1. 零额外 API 调用，不增加成本
2. spec 要求 "基于第一条用户消息的内容"，方案 A 完全符合
3. 用户通常以仓库地址或问题开头（如 "分析一下 vercel/next.js"），截取前 20 字符已有足够辨识度
4. 最小可运行原则：方案 B 需要额外的 AI 调用和错误处理，复杂度不适合教学项目

---

## Decision 5: 消息序列化策略

### 问题

AI SDK v5 的 `UIMessage` 类型包含 `parts` 数组（文本、工具调用等），需要完整序列化才能在恢复时正确渲染。

### 决策：序列化完整 UIMessage

保存时序列化以下字段：`id`, `role`, `parts`, `createdAt`。

**不保存**的字段：
- `toolInvocations`（已包含在 `parts` 中）
- 流式状态相关字段（恢复后不需要）

### 校验

使用 zod schema 校验从 localStorage 读取的消息数据。校验失败的消息跳过（不阻塞整个对话加载），并在 console 中输出警告。

```typescript
const storedMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  parts: z.array(z.unknown()),  // parts 结构复杂，使用宽松校验
  createdAt: z.string().datetime().optional(),
})
```

**理由**：`parts` 内部结构由 AI SDK 管理且可能跨版本变化，使用 `z.unknown()` 数组做宽松校验，确保基本结构正确但不过度约束。
