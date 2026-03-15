## nested-replies

无限层级评论回复功能。

## ADDED Requirements

### REQ-1: 无限层级回复创建

`POST /api/comments` 接受 `parentId` 参数，创建对任意层级评论的回复，不进行扁平化处理。

#### Scenario: 回复一个子评论

- Given 存在一个顶级评论 A 和 A 的回复 B
- When 用户对 B 发送回复，parentId 设为 B 的 ID
- Then 创建的评论的 parentId 为 B 的 ID（不被替换为 A 的 ID）

### REQ-2: 回复父评论验证

`POST /api/comments` 验证 `parentId` 对应的评论存在且 `articleId` 与新评论一致。

#### Scenario: parentId 指向不存在的评论

- Given 提交的 parentId 不存在
- Then 返回 404 错误

### REQ-3: 递归嵌套评论树返回

`GET /api/comments` 返回递归嵌套的评论树结构，每个评论包含 `replies` 数组。

#### Scenario: 加载多层嵌套评论

- Given 文章有 3 层嵌套评论
- When 请求 GET /api/comments?articleId=xxx
- Then 返回的评论树包含 3 层嵌套的 replies

### REQ-4: 加载深度限制

评论树初始加载深度为 5 层（Prisma 嵌套 include）。

#### Scenario: 超过 5 层的评论

- Given 文章有 7 层嵌套评论
- When 请求评论列表
- Then 只返回前 5 层的嵌套数据

### REQ-5: 级联删除

删除父评论时级联删除所有子回复（由数据库 onDelete: Cascade 保证）。

#### Scenario: 删除有回复的评论

- Given 评论 A 有回复 B，B 有回复 C
- When 删除评论 A
- Then B 和 C 也被删除

### REQ-6: 所有层级显示回复按钮

所有层级的评论都显示"回复"按钮，不仅限于顶级评论。

#### Scenario: 回复按钮可见性

- Given 用户已登录
- When 查看任意层级的评论
- Then 该评论显示"Reply"按钮

### REQ-7: 内联回复表单

点击"回复"按钮在该评论下方内联显示回复表单。

#### Scenario: 打开回复表单

- When 点击某评论的"Reply"按钮
- Then 在该评论下方出现回复输入框

### REQ-8: 层级缩进与收敛

评论根据层级缩进显示，最大缩进 5 层（depth 0-4 递增缩进，depth 5+ 缩进固定）。

#### Scenario: 深层缩进收敛

- Given 评论嵌套到第 6 层
- Then 第 6 层与第 5 层的缩进相同

### REQ-9: 深层回复 @用户名前缀

深层回复（depth 5+）在评论内容前显示 `@用户名` 前缀以标识回复对象。

#### Scenario: @前缀显示

- Given depth >= 5 的回复
- Then 评论内容前显示 @父评论作者名

### REQ-10: 即时树更新

提交回复后，新回复立即出现在正确的树位置，无需刷新页面。

#### Scenario: 深层回复即时出现

- Given 用户对 depth=3 的评论提交回复
- Then 新回复立即出现在该评论的 replies 列表中

### REQ-11: 性能约束

单篇文章评论加载不应超过 500ms（100 条评论以内）。

#### Scenario: 评论加载性能

- Given 文章有 100 条评论
- Then 评论加载时间不超过 500ms

### REQ-12: 无额外网络请求

前端渲染评论树时使用递归组件，初始 5 层内无需额外网络请求。

#### Scenario: 递归渲染

- Given 评论树深度为 4 层
- Then 渲染过程中不发起额外 API 请求
