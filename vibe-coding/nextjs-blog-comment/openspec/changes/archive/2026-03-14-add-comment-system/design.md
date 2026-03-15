## Context

博客系统已有基础评论功能：Prisma `Comment` 模型（id, content, articleId, userId, createdAt）、POST 创建和 DELETE 删除 API。文章详情页以只读方式展示评论列表。但缺少前端交互组件、编辑功能、嵌套回复和管理后台。

技术栈：Next.js 16 (App Router) + React 19 + Prisma + PostgreSQL + NextAuth v5 + Tailwind CSS v4。

## Goals / Non-Goals

**Goals:**
- 提供完整的评论交互体验（发表、编辑、删除、回复）
- 支持一级嵌套回复（parentId）
- 管理后台可审核和管理所有评论
- 与现有认证系统无缝集成

**Non-Goals:**
- 不支持多级嵌套回复（仅一级）
- 不支持评论点赞/踩
- 不支持富文本评论（仅纯文本）
- 不支持匿名评论
- 不做实时推送通知

## Decisions

### 1. 嵌套回复采用单层 parentId 模式

在 Comment 模型中添加可选的 `parentId` 自引用外键，仅允许一级回复（回复的 parentId 必须指向顶级评论）。

**替代方案**: 多级嵌套（递归树结构）——增加查询复杂度和 UI 层级，对博客场景收益不大。

### 2. 评论组件采用客户端组件（Client Components）

`CommentForm`、`CommentList`、`CommentItem` 均为客户端组件，使用 `fetch` 调用 API 路由实现交互。评论列表初始数据通过服务端组件传入，后续操作（发表、编辑、删除）通过客户端 API 调用 + 乐观更新。

**替代方案**: Server Actions——可行但对于频繁的评论交互场景，客户端组件更灵活，支持乐观更新和即时反馈。

### 3. 评论分页采用 cursor-based 分页

使用 `cursor` + `take` 模式而非 offset 分页，避免在评论频繁增删时出现重复/遗漏。

### 4. 权限控制复用现有模式

- 评论作者可编辑/删除自己的评论
- 文章作者和 ADMIN 可删除任何评论
- 管理后台仅 ADMIN 可访问（复用现有 admin layout 的角色检查）

## Risks / Trade-offs

- **[数据迁移]** 添加 `parentId` 字段需要 Prisma migration → 字段为可选，不影响现有数据，可安全迁移
- **[乐观更新一致性]** 客户端乐观更新可能与服务端状态不一致 → 操作失败时回滚并显示错误提示
- **[评论数量性能]** 文章评论量大时列表渲染性能 → cursor 分页 + 每次加载 20 条限制
