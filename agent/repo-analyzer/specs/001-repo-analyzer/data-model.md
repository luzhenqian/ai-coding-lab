# Data Model: GitHub 仓库智能分析助手

## 实体定义

### GitHubRepo（仓库基础信息）

从 GitHub API `GET /repos/{owner}/{repo}` 响应中提取。

```typescript
const GitHubRepoSchema = z.object({
  owner: z.string(),            // 仓库所有者
  repo: z.string(),             // 仓库名称
  fullName: z.string(),         // owner/repo 完整名称
  description: z.string().nullable(), // 仓库描述
  stars: z.number(),            // Star 数量
  forks: z.number(),            // Fork 数量
  language: z.string().nullable(),    // 主要编程语言
  license: z.string().nullable(),     // 许可证名称
  topics: z.array(z.string()),  // 主题标签
  createdAt: z.string(),        // 创建时间 ISO 8601
  updatedAt: z.string(),        // 最后更新时间 ISO 8601
  openIssues: z.number(),       // 开放 Issue 数量
  defaultBranch: z.string(),    // 默认分支名
  isArchived: z.boolean(),      // 是否已归档
})
```

### RepoTreeItem（目录结构条目）

从 GitHub API `GET /repos/{owner}/{repo}/contents/{path}` 响应中提取。

```typescript
const RepoTreeItemSchema = z.object({
  name: z.string(),             // 文件/目录名
  path: z.string(),             // 相对路径
  type: z.enum(['file', 'dir']),// 类型
  size: z.number(),             // 文件大小（字节），目录为 0
})

const RepoTreeSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  path: z.string(),             // 查询路径，根目录为 ""
  items: z.array(RepoTreeItemSchema),
})
```

### ParsedGitHubUrl（解析后的 URL）

```typescript
const ParsedGitHubUrlSchema = z.object({
  owner: z.string(),
  repo: z.string(),
})
```

## Workflow 步骤间数据流

### Step 1: 解析 URL

- **Input**: `{ url: string }`
- **Output**: `ParsedGitHubUrl`

### Step 2: 获取数据

- **Input**: `ParsedGitHubUrl`
- **Output**: `{ repoInfo: GitHubRepo, repoTree: RepoTree }`

### Step 3: 人工审批（HITL）

- **Input**: `{ repoInfo: GitHubRepo, repoTree: RepoTree }`
- **Suspend Payload**: `{ summary: GitHubRepo }` — 展示给用户的摘要
- **Resume Data**: `{ approved: boolean }`
- **Output**: `{ repoInfo: GitHubRepo, repoTree: RepoTree, approved: boolean }`

### Step 4: 生成报告

- **Input**: `{ repoInfo: GitHubRepo, repoTree: RepoTree, approved: boolean }`
- **Output**: `{ report: string }` — AI 生成的 Markdown 格式分析报告

## 状态管理

### Workflow 运行状态（由 Mastra + LibSQL 自动管理）

```
创建 → 运行中 → 暂停（等待审批）→ 恢复 → 完成
                                   → 取消（用户拒绝）
              → 失败（API 错误）
```

### 前端 UI 状态

```typescript
// 模式切换
type AppMode = 'chat' | 'workflow'

// Workflow 步骤状态
type StepStatus = 'waiting' | 'running' | 'success'
  | 'suspended' | 'failed' | 'cancelled'

// Workflow UI 状态
interface WorkflowUIState {
  runId: string | null
  steps: Array<{
    id: string
    label: string
    status: StepStatus
  }>
  suspendPayload: GitHubRepo | null  // 审批步骤的摘要数据
  report: string | null               // 最终报告
}
```
