# Implementation Plan: 对话历史系统

**Branch**: `005-conversation-history` | **Date**: 2026-03-14 | **Spec**: [spec.md](./spec.md)

## Summary

使用浏览器 localStorage 实现对话持久化和多对话管理。包括对话 CRUD 操作、基于首条消息的自动标题生成、可折叠的对话列表侧边栏，以及与 AI SDK v5 `useChat` hook 的 `initialMessages` 集成。

## Technical Context

| 项目 | 值 |
|------|-----|
| Language/Version | TypeScript (strict mode) |
| Primary Dependencies | React 19, Next.js 15 (App Router), Vercel AI SDK v5 (`@ai-sdk/react`) |
| Storage | localStorage (browser) |
| Testing | 手动验证（按 spec 中的 Acceptance Scenarios） |
| Target Platform | Browser |
| Project Type | Web application（教学演示） |
| Constraints | 文件不超过 200 行，中文注释，无额外 UI 组件库，仅 Tailwind CSS |

## Constitution Check

| # | 原则 | 通过 | 说明 |
|---|------|------|------|
| I | 教学清晰度优先 | ✅ | localStorage 是最直观的持久化方案，读者无需学习额外 API |
| II | 严格 TypeScript | ✅ | 所有实体使用显式类型定义，用 zod schema 校验从 localStorage 读取的数据 |
| III | 技术栈纪律 | ✅ | 不引入新依赖，仅使用已有的 React/Next.js/AI SDK/Tailwind/zod |
| IV | 代码可读性 | ✅ | 每个文件职责单一，关键函数有中文注释，文件不超过 200 行 |
| V | 健壮的错误处理 | ✅ | localStorage 读写用 try-catch 包裹，数据损坏时优雅降级为空列表 |
| VI | AI Agent 工程规范 | ✅ | 本功能不涉及 Agent/Tool 变更，不影响现有 Agent 行为 |
| VII | 最小可运行原则 | ✅ | 仅实现 spec 要求的功能，不添加搜索、导出、标签等额外功能 |

## Project Structure

### 新增文件

```
src/lib/conversation-store.ts    — localStorage CRUD 封装，对话的增删改查
src/app/components/ConversationList.tsx — 侧边栏对话列表组件
```

### 修改文件

```
src/app/components/ChatPanel.tsx  — 集成对话存储：加载/保存消息，接收 conversationId
src/app/page.tsx                  — 添加侧边栏布局，管理 activeConversationId 状态
```

## Data Model

详见 [data-model.md](./data-model.md)。

核心实体：

- **Conversation**：`{ id, title, createdAt, updatedAt, messages[] }`
- **Message**：复用 AI SDK 的 `UIMessage` 类型，序列化时只保留 `{ id, role, parts, createdAt }`

存储键：`repo-analyzer:conversations`（单个 JSON 数组存储所有对话）

## Implementation Details

### Phase 1: 数据层 — `conversation-store.ts`

**目标**：封装 localStorage 操作，提供类型安全的对话 CRUD API。

1. 定义 `StoredConversation` 类型和 `storedConversationSchema`（zod）
2. 实现以下函数：
   - `getAllConversations(): StoredConversation[]` — 读取并按 `updatedAt` 降序排列
   - `getConversationById(id: string): StoredConversation | null`
   - `createConversation(): StoredConversation` — 生成 `crypto.randomUUID()` 作为 ID
   - `updateConversation(id: string, updates: Partial<Pick<StoredConversation, 'title' | 'messages'>>): StoredConversation`
   - `deleteConversation(id: string): void`
3. 读取 localStorage 时用 zod 校验，校验失败则返回空数组（优雅降级）
4. 写入时捕获 `QuotaExceededError`，抛出中文提示让上层处理

**文件行数预估**：~120 行

### Phase 2: 对话列表 — `ConversationList.tsx`

**目标**：侧边栏展示对话列表，支持新建、切换、删除。

1. Props 接口：
   ```typescript
   interface ConversationListProps {
     conversations: StoredConversation[]
     activeId: string | null
     onSelect: (id: string) => void
     onCreate: () => void
     onDelete: (id: string) => void
   }
   ```
2. UI 结构：
   - 顶部："新建对话" 按钮（`+ 新对话`）
   - 列表项：标题 + 相对时间（如 "3 分钟前"），当前活跃项高亮
   - 删除：每项右侧显示删除图标按钮，点击后直接删除（教学项目不需要确认弹窗）
3. 空状态：显示 "暂无对话记录"
4. 使用 Tailwind CSS 实现样式，宽度 `w-64`

**文件行数预估**：~100 行

### Phase 3: ChatPanel 改造

**目标**：让 ChatPanel 支持加载指定对话的历史消息，并在消息变化时自动保存。

1. 新增 Props：
   ```typescript
   interface ChatPanelProps {
     conversationId: string | null
     onMessagesChange?: (messages: UIMessage[]) => void
   }
   ```
2. 将 `useChat` 的 `initialMessages` 设为从 `conversation-store` 加载的历史消息
3. 使用 `useChat` 的 `onMessages` 回调（或 `useEffect` 监听 `messages`），在消息变化时调用 `onMessagesChange` 通知父组件保存
4. 当 `conversationId` 变化时（用 `key` prop 强制重新挂载），重新加载对应对话
5. 自动标题生成：当对话没有标题且出现第一条用户消息时，截取前 20 个字符作为标题

**文件行数预估**：~140 行（从现有 138 行改造）

### Phase 4: 页面布局集成 — `page.tsx`

**目标**：将侧边栏和聊天面板组合，管理全局对话状态。

1. 新增状态：
   - `conversations: StoredConversation[]` — 对话列表
   - `activeConversationId: string | null` — 当前活跃对话 ID
2. 初始化逻辑（`useEffect`）：
   - 加载所有对话
   - 若无对话，自动创建一个空对话
   - 设置最近的对话为活跃对话
3. 布局改造（仅 chat 模式时显示侧边栏）：
   ```
   ┌─────────────────────────────────────────────┐
   │  Header (标题栏 + 模式切换)                    │
   ├────────────┬────────────────────────────────┤
   │ 对话列表    │  ChatPanel / WorkflowPanel      │
   │ (w-64)     │  (flex-1)                       │
   └────────────┴────────────────────────────────┘
   ```
4. 事件处理：
   - `handleCreateConversation`：调用 `createConversation()`，添加到列表，设为活跃
   - `handleSelectConversation`：切换 `activeConversationId`
   - `handleDeleteConversation`：调用 `deleteConversation()`，若删除的是当前活跃对话则切换到下一个
   - `handleMessagesChange`：调用 `updateConversation()` 保存消息，同时更新标题

**文件行数预估**：~120 行（从现有 41 行扩展）

## Implementation Order

```
Phase 1 → Phase 2 → Phase 3 → Phase 4
  ↓          ↓          ↓          ↓
数据层      UI 组件    集成存储    组合验证
```

每个 Phase 完成后可独立验证：
- Phase 1：在浏览器 console 中手动调用函数验证 CRUD
- Phase 2：用 mock 数据验证列表渲染
- Phase 3：验证消息加载和保存
- Phase 4：端到端验证所有 User Story

## Risks & Mitigations

| 风险 | 缓解措施 |
|------|----------|
| localStorage 5MB 限制 | 单条对话消息通常 < 50KB，50 条对话约 2.5MB，足够使用；写入时捕获异常并提示用户 |
| AI SDK `useChat` 不支持 `initialMessages` 重新加载 | 使用 React `key` prop 强制 ChatPanel 重新挂载，确保 `initialMessages` 生效 |
| 消息序列化丢失 `parts` 信息 | 完整序列化 `UIMessage` 的 `parts` 数组，而非仅保存 `content` 字段 |
| ChatPanel 超过 200 行限制 | 将消息保存逻辑提取到 `useConversationSync` 自定义 hook 或保持在 page.tsx 中 |
