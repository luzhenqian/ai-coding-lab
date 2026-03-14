# Implementation Plan: 大模型 Base URL 配置

**Branch**: `001-model-base-url` | **Date**: 2026-03-14 | **Spec**: [spec.md](./spec.md)

## Summary

为 AI 模型 provider 增加 Base URL 环境变量配置，支持用户通过 `OPENAI_BASE_URL` 和 `ANTHROPIC_BASE_URL` 使用中转站/代理服务访问大模型 API。

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: `@ai-sdk/openai`（`createOpenAI`）、`@ai-sdk/anthropic`（`createAnthropic`）
**Scope**: 3 个文件修改（`src/lib/model.ts`、`.env.example`、`README.md`）
**Breaking Changes**: 无 — 环境变量未设置时行为不变

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. 教学清晰度优先 | PASS | 配置方式简单直观 |
| II. 严格 TypeScript | PASS | 使用 SDK 提供的类型 |
| III. 技术栈纪律 | PASS | 无新依赖 |
| IV. 代码可读性 | PASS | 增加中文注释说明 |
| V. 健壮的错误处理 | PASS | 已有错误处理覆盖 |
| VI. AI Agent 工程规范 | PASS | 不影响 Agent 逻辑 |
| VII. 最小可运行原则 | PASS | 最小改动 |

## Implementation Approach

### 核心改动：`src/lib/model.ts`

将默认 provider 实例替换为通过工厂函数创建的实例：

- `import { openai } from '@ai-sdk/openai'` → `import { createOpenAI } from '@ai-sdk/openai'`
- `import { anthropic } from '@ai-sdk/anthropic'` → `import { createAnthropic } from '@ai-sdk/anthropic'`
- 读取 `OPENAI_BASE_URL` 和 `ANTHROPIC_BASE_URL` 环境变量
- 仅在环境变量有值时传入 `baseURL` 参数，否则使用 SDK 默认值

### 文档改动

- `.env.example`：新增 `OPENAI_BASE_URL` 和 `ANTHROPIC_BASE_URL` 及中文注释
- `README.md`：在环境变量说明表格中增加两个新变量

## File Structure (changes only)

```text
src/lib/model.ts          # 修改：createOpenAI/createAnthropic + baseURL
.env.example              # 修改：新增 Base URL 环境变量
README.md                 # 修改：环境变量表格新增两行
```
