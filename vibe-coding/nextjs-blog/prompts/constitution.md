## 技术栈
- 框架：Next.js 14 (App Router)
- 语言：TypeScript（严格模式）
- 数据库：PostgreSQL
- ORM：Prisma
- 样式：Tailwind CSS
- 认证：NextAuth.js (GitHub + Credentials Provider)
- 部署：Vercel

## 非协商原则
- 所有组件使用函数式组件 + React Hooks
- API 使用 Next.js App Router 的 Route Handlers (app/api/)
- 数据库操作必须通过 Prisma Client，禁止裸 SQL
- 所有用户输入必须做服务端验证（使用 Zod）
- 每个 API 端点必须有错误处理和适当的 HTTP 状态码
- 提交信息使用 Conventional Commits 规范
- 代码风格遵循 ESLint + Prettier 配置

## 项目约定
- 目录结构遵循 Next.js App Router 约定
- 组件放在 components/ 下，按功能域分子目录
- 可复用 hooks 放在 hooks/
- Prisma schema 放在 prisma/schema.prisma
- 环境变量使用 .env.local，提供 .env.example 模板
- 测试使用 Vitest + Testing Library
