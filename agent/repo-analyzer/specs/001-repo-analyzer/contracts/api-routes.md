# API Routes Contract: GitHub 仓库智能分析助手

## 1. 自由对话（Agent Chat）

### POST /api/chat

Agent 流式对话接口，由 Mastra `handleChatStream` 处理。

**Request**:
```typescript
{
  messages: UIMessage[]         // Vercel AI SDK v5 UIMessage 格式
}
```

**Response**: `UIMessageStreamResponse`（SSE 流式响应）

**流式内容包含**:
- 文本部分（`text` part）
- 工具调用部分（`tool-getRepoInfo` / `tool-getRepoTree` part）
  - 状态流转：input-streaming → input-available → output-available / output-error

---

## 2. Workflow 启动

### POST /api/workflow/start

启动仓库分析 Workflow。

**Request**:
```typescript
{
  url: string                   // GitHub 仓库 URL（任意格式）
}
```

**Response**:
```typescript
// 正常执行到暂停
{
  runId: string,
  status: 'suspended',
  steps: {
    'parse-url': { status: 'success', output: { owner, repo } },
    'fetch-data': { status: 'success', output: { repoInfo, repoTree } },
    'human-approval': {
      status: 'suspended',
      suspendPayload: GitHubRepo    // 用于 UI 展示摘要卡片
    }
  }
}

// 异常情况
{
  runId: string,
  status: 'failed',
  steps: {
    'parse-url': { status: 'success', output: { owner, repo } },
    'fetch-data': { status: 'failed', error: string }
  }
}
```

---

## 3. Workflow 恢复（审批）

### POST /api/workflow/resume

恢复暂停的 Workflow（用户审批后）。

**Request**:
```typescript
{
  runId: string,
  approved: boolean             // true = 继续分析，false = 取消
}
```

**Response**:
```typescript
// 继续分析（approved = true）
{
  runId: string,
  status: 'resumed'
}

// 取消（approved = false）
{
  runId: string,
  status: 'cancelled',
  message: '分析已取消'
}
```

---

## 4. 报告流式生成

### POST /api/workflow/report

在 Workflow 审批通过后，流式生成分析报告。由前端在 resume 成功后调用。

**Request**:
```typescript
{
  repoInfo: GitHubRepo,         // 从 workflow/start 响应中获取
  repoTree: RepoTree            // 从 workflow/start 响应中获取
}
```

**Response**: `TextStreamResponse`（流式文本响应）

报告结构（由 AI 生成的 Markdown）：
- 仓库概述
- 技术栈分析
- 项目结构解读
- 综合评价

---

## Agent Tools Contract

### getRepoInfo

| 字段 | 值 |
|------|-----|
| id | `get-repo-info` |
| description | `获取 GitHub 仓库的基础信息，包括 star 数、fork 数、主要编程语言、许可证、描述等。当用户提到一个 GitHub 仓库并想了解其基本情况时调用此工具。` |
| inputSchema | `{ owner: string, repo: string }` |
| outputSchema | `GitHubRepo` |

### getRepoTree

| 字段 | 值 |
|------|-----|
| id | `get-repo-tree` |
| description | `获取 GitHub 仓库的目录结构。当用户想查看仓库的文件和文件夹组织结构时调用此工具。默认返回根目录，可通过 path 和 depth 参数查看子目录。` |
| inputSchema | `{ owner: string, repo: string, path?: string, depth?: number }` |
| outputSchema | `RepoTree` |
