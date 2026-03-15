## Why

博客已有评论数据模型和基础 API，但前端缺少评论交互功能——用户无法发表、编辑或删除评论，也没有嵌套回复和管理后台审核能力。完善评论系统是提升读者互动和社区粘性的关键一步。

## What Changes

- 在文章详情页添加评论表单组件，支持登录用户发表评论
- 支持评论的编辑和删除（评论作者可编辑/删除自己的评论）
- 添加嵌套回复功能（一级回复），扩展 Prisma Comment 模型增加 `parentId` 字段
- 补充评论相关 API：编辑评论（PUT）、获取文章评论列表（GET with pagination）
- 在管理后台添加评论管理页面，支持查看、删除评论
- 未登录用户可查看评论，点击发表时引导登录

## Capabilities

### New Capabilities
- `comment-interaction`: 前端评论交互组件（发表、编辑、删除、回复）
- `comment-moderation`: 管理后台评论审核与管理

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- **数据库**: Comment 模型新增 `parentId` 可选字段，需要数据库迁移
- **API**: 扩展 `/api/comments` 路由（增加 GET 分页查询、PUT 编辑）和 `/api/comments/[id]` 路由
- **前端**: 新增 `CommentForm`、`CommentList`、`CommentItem` 客户端组件
- **管理后台**: 新增 `/admin/comments` 页面
- **认证**: 评论操作需要登录状态，复用现有 NextAuth 认证
