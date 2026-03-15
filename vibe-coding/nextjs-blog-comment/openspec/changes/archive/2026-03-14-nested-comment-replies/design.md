## Overview

将评论系统从两层扁平结构升级为无限层级嵌套回复。数据库已支持自引用关系，核心工作在 API 层（移除扁平化、递归加载）和 UI 层（全层级回复、树形渲染、视觉收敛）。

## Design Decisions

### 递归加载策略

**方案**: 服务端递归加载，最大深度 5 层。

Prisma 不支持递归 include，采用固定深度方案：
1. 查询顶级评论（`parentId: null`），include 固定 5 层的 replies（Prisma 嵌套 include）

实际博客场景中超过 5 层嵌套已非常罕见，5 层深度完全满足需求。

### UI 缩进策略

**方案**: 最大缩进 5 层，之后视觉上不再增加缩进但保持线程关系。

```
评论 (depth 0)
  └─ 回复 (depth 1)  ml-8
    └─ 回复 (depth 2)  ml-16
      └─ 回复 (depth 3)  ml-24
        └─ 回复 (depth 4)  ml-32
        └─ 回复 (depth 5+) ml-32 (不再增加)
```

超过 5 层后缩进固定，通过 `@用户名` 前缀标识回复对象。

### 回复扁平化移除

直接删除 `POST /api/comments` 中查找顶级父评论并替换 `parentId` 的逻辑。保留 `parentId` 验证（确认父评论存在且属于同一文章）。

### 状态管理

CommentList 已使用递归结构管理评论树。扩展现有的 `handleSubmit`、`handleEdit`、`handleDelete` 方法，支持在任意深度插入/修改/删除节点。使用递归查找目标节点。

## Data Flow

```
GET /api/comments?articleId=xxx
        │
        ▼
  查询 parentId=null 的顶级评论
  嵌套 include replies 5 层深
        │
        ▼
  返回 { comments: Comment[], nextCursor }

  Comment {
    id, content, user, createdAt, updatedAt
    parentId, depth (计算字段)
    replies: Comment[]   ← 递归结构
  }
```

```
POST /api/comments
  { content, articleId, parentId? }
        │
        ▼
  验证 parentId 存在且属于同一 articleId
  (不再扁平化到顶级父评论)
        │
        ▼
  创建评论，返回新评论
```

## Components

```
CommentList
  ├─ CommentForm (顶级评论输入)
  └─ CommentItem (depth=0)
       ├─ CommentForm (回复，内联)
       └─ replies[]
            └─ CommentItem (depth=1)
                 ├─ CommentForm (回复，内联)
                 └─ replies[]
                      └─ CommentItem (depth=2)
                           └─ ...递归
```

## Non-Goals

- 不实现评论折叠/展开功能（可后续迭代）
- 不实现 @mention 通知系统
- 不修改管理后台的评论管理界面
- 不引入 WebSocket 实时更新
