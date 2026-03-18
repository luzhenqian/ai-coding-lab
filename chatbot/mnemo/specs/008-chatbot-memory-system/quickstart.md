# 快速开始：Mnemo Chatbot Memory System

## 前置要求

- Node.js 20+
- pnpm 9+
- PostgreSQL 15+（需启用 pgvector 扩展）
- Anthropic API Key（用于 Claude 聊天）
- OpenAI API Key（用于 Embedding 生成，Phase 3+）

## 1. 环境准备

```bash
# 克隆项目并进入目录
cd chatbot/mnemo

# 安装依赖
pnpm install

# 复制环境变量模板
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 数据库（Supabase 或本地 PostgreSQL）
DATABASE_URL=postgresql://user:password@localhost:5432/mnemo

# Anthropic（聊天用）
ANTHROPIC_API_KEY=sk-ant-...

# OpenAI（Embedding 用，Phase 3+）
OPENAI_API_KEY=sk-...

# 硬编码用户 ID（教学用，无需认证）
DEFAULT_USER_ID=demo-user
```

## 2. 数据库初始化

```bash
# 确保 PostgreSQL 已启用 pgvector 扩展
# 在 psql 中执行：CREATE EXTENSION IF NOT EXISTS vector;

# 生成并执行数据库迁移
pnpm db:generate
pnpm db:migrate
```

## 3. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

## 4. 验证各 Phase 功能

### Phase 1: 基础对话

1. 打开应用，点击"新建会话"
2. 发送一条消息（如"你好，介绍一下你自己"）
3. 确认 AI 以流式方式回复
4. 刷新页面，确认消息仍在
5. 创建第二个会话，确认会话间独立

### Phase 2: 会话摘要

1. 在一个会话中连续发送 20+ 条消息
2. 打开 Debug 面板（右下角按钮）
3. 确认摘要内容已生成
4. 确认 token 分布信息正确显示

### Phase 3: 长期记忆

1. 在对话中说"我是一名前端工程师，住在北京"
2. 打开「记忆管理」页面（/memories）
3. 确认记忆条目已自动创建
4. 新建一个会话，问"你知道我是做什么的吗"
5. 确认 AI 能回忆你的信息

### Phase 4: RAG 知识检索

1. 打开「文档管理」页面（/documents）
2. 上传一个 .md 文件
3. 等待处理状态变为"ready"
4. 回到聊天，提问文档中的具体内容
5. 确认 AI 回复附带来源标注
6. 打开 Debug 面板查看检索结果和 token 分配

## 常用命令

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm db:generate  # 生成数据库迁移
pnpm db:migrate   # 执行数据库迁移
pnpm db:studio    # 打开 Drizzle Studio（数据库浏览器）
```
