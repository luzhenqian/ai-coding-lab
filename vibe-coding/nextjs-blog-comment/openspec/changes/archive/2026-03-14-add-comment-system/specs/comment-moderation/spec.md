## ADDED Requirements

### Requirement: 管理员可以查看所有评论
ADMIN 用户 SHALL 能够在管理后台查看所有评论的列表，支持按文章筛选。

#### Scenario: 查看评论列表
- **WHEN** ADMIN 用户访问管理后台评论页面
- **THEN** 系统显示所有评论的分页列表，包含评论内容、作者、所属文章和发表时间

#### Scenario: 按文章筛选评论
- **WHEN** ADMIN 在评论管理页面选择特定文章筛选
- **THEN** 列表仅显示该文章下的评论

### Requirement: 管理员可以删除任何评论
ADMIN 用户 SHALL 能够删除系统中的任何评论。

#### Scenario: 管理员删除评论
- **WHEN** ADMIN 在评论管理页面点击删除按钮并确认
- **THEN** 该评论被删除，如果有子回复则一并删除

#### Scenario: 非管理员访问评论管理
- **WHEN** 非 ADMIN 用户尝试访问评论管理页面
- **THEN** 系统拒绝访问，重定向到首页

### Requirement: 文章作者可以删除文章下的评论
文章作者 SHALL 能够删除自己文章下的任何评论（复用已有 DELETE API 逻辑）。

#### Scenario: 文章作者删除评论
- **WHEN** 文章作者在文章详情页删除某条评论
- **THEN** 该评论被删除，评论计数更新
