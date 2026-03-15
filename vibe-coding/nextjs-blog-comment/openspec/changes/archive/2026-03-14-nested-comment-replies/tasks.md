## Tasks

- [x] Task 1: 移除 API 回复扁平化逻辑

**File**: `app/api/comments/route.ts`

移除 POST handler 中查找顶级父评论并替换 `parentId` 的扁平化代码（约第 68-80 行）。保留 `parentId` 存在性验证和 `articleId` 一致性验证。

**验证**: 发送 `parentId` 指向一个子评论时，创建的评论的 `parentId` 应保持不变（不被替换为顶级父评论的 ID）。

**Implements**: REQ-1, REQ-2

---

- [x] Task 2: 修改 API 评论查询为递归嵌套加载

**File**: `app/api/comments/route.ts`

修改 GET handler 的 Prisma 查询，将 `replies` 的 include 从单层扩展为 5 层嵌套 include。构造递归的 include 对象：

```
replies: {
  include: {
    user: { select: { id, name, image } },
    replies: {
      include: {
        user: ...,
        replies: { ... }  // 继续嵌套到 5 层
      }
    }
  }
}
```

同步修改 `app/(public)/posts/[slug]/page.tsx` 中 `getArticle` 函数的评论查询，使用相同的递归 include 结构。

**验证**: GET 请求返回的评论树包含多层嵌套的 replies 数组。

**Implements**: REQ-3, REQ-4

---

- [x] Task 3: CommentItem 支持所有层级显示回复按钮

**File**: `components/comments/CommentItem.tsx`

1. 添加 `depth` prop（默认值 0）
2. 移除"回复"按钮仅在非回复评论上显示的条件限制（移除 `isReply` 相关判断）
3. 根据 `depth` 计算缩进：`depth < 5 ? depth * 32 : 5 * 32`（像素值），使用 `ml-` 或 `style={{ marginLeft }}`
4. 当 `depth >= 5` 时，在评论内容前添加 `@{parentComment.user.name}` 前缀
5. 递归渲染 `replies` 时传递 `depth + 1`

**Implements**: REQ-6, REQ-7, REQ-8, REQ-9

---

- [x] Task 4: CommentList 支持深层树操作

**File**: `components/comments/CommentList.tsx`

修改 `handleSubmit`、`handleEdit`、`handleDelete` 方法，支持在任意深度的评论树中操作：

1. 实现递归查找函数 `findAndUpdate(comments, targetId, updater)` 遍历整棵评论树
2. `handleSubmit`：当 `parentId` 存在时，递归找到目标评论并在其 `replies` 中追加新回复
3. `handleEdit`：递归找到目标评论并更新 `content`
4. `handleDelete`：递归找到目标评论并移除，同时更新计数

**Implements**: REQ-10

---

- [x] Task 5: 集成验证

手动验证所有功能正常：

1. 在文章页面创建顶级评论
2. 回复顶级评论
3. 回复回复（第 3 层）
4. 继续嵌套到第 5 层以上，确认缩进收敛
5. 编辑和删除各层级评论
6. 确认级联删除正常工作
7. 页面刷新后评论树结构保持正确

**Implements**: REQ-11, REQ-12
