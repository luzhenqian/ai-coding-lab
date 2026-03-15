## Why

当前评论系统仅支持两层结构（顶级评论 + 直接回复）。API 会将回复的回复强制扁平化到顶级评论下，UI 也只在顶级评论上显示"回复"按钮。这限制了用户之间的深度讨论，无法形成有意义的对话线程。

## What Changes

- 移除 API 中的回复扁平化逻辑，允许评论回复任意层级的评论
- UI 上所有层级的评论都显示"回复"按钮
- 递归渲染评论树，支持无限嵌套缩进
- API 递归加载评论树（带深度限制以保护性能）
- 前端对深层嵌套评论进行视觉收敛（超过一定层级后不再增加缩进）

## Capabilities

### New Capabilities

- `nested-replies`: 无限层级评论回复的完整支持，包括递归数据加载、树形渲染、深度限制策略

### Modified Capabilities

（无现有 spec 需要修改）

## Impact

- **API**: `POST /api/comments` 移除扁平化逻辑；`GET /api/comments` 改为递归加载回复树
- **组件**: `CommentItem` 所有层级显示回复按钮并递归渲染；`CommentList` 支持深层状态管理
- **数据库**: 无需修改（Prisma schema 已支持自引用关系）
- **性能**: 需要考虑深层嵌套的查询性能和渲染性能
