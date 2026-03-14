# Research: Streamdown Markdown 流式渲染

**Feature Branch**: `003-streamdown-markdown`
**日期**: 2026-03-14

## 调研结论

### 1. Streamdown 是什么

[Streamdown](https://streamdown.ai/) 是 Vercel 开源的流式 Markdown 渲染 React 组件，专为 AI 流式输出场景设计。它是 `react-markdown` 的替代品，核心优势在于：

- **不完整 Markdown 的优雅处理**：AI 流式输出时，表格/代码块可能只到达一半，Streamdown 能自动检测并补全未关闭的语法
- **渐进式格式化**：对部分到达的内容实时应用样式，无需等待完整块
- **零配置默认值**：开箱即用，同时支持插件扩展

> **注意**：用户需求中提到 `@anthropic-ai/streamdown`，但该包不存在于 npm。实际包名为 `streamdown`（Vercel 维护）。计划中统一使用 `streamdown`。

### 2. 包名与安装

```bash
# 核心包
pnpm add streamdown

# 可选插件（按需安装）
pnpm add @streamdown/code      # 代码高亮（Shiki 驱动）
pnpm add @streamdown/cjk       # 中日韩文字支持（本项目需要）
```

**不安装的插件**（遵循最小可运行原则）：
- `@streamdown/mermaid` — 本项目不需要图表渲染
- `@streamdown/math` — 本项目不需要数学公式

### 3. 核心 API

```tsx
import { Streamdown } from 'streamdown'
import { code } from '@streamdown/code'
import { cjk } from '@streamdown/cjk'

<Streamdown
  plugins={{ code, cjk }}   // 插件对象
  isAnimating={true}         // 是否正在流式输出（控制动画）
>
  {markdownText}
</Streamdown>
```

**关键 Props**：

| Prop | 类型 | 说明 |
|------|------|------|
| `children` | `string` | Markdown 文本内容 |
| `isAnimating` | `boolean` | 是否正在流式生成，控制打字动画效果 |
| `plugins` | `object` | 插件配置：`{ code, cjk, mermaid, math }` |
| `mode` | `"static"` \| 默认 | 静态模式跳过流式优化 |

### 4. CSS / Tailwind 集成

Streamdown 依赖 Tailwind CSS 进行样式渲染。需要两步配置：

**步骤 1**：在 `globals.css` 中添加 `@source` 指令让 Tailwind v4 扫描 Streamdown 的类名：

```css
@import "tailwindcss";
@source "../node_modules/streamdown/dist/*.js";
@source "../node_modules/@streamdown/code/dist/*.js";
@source "../node_modules/@streamdown/cjk/dist/*.js";
```

**步骤 2**：在应用入口导入动画样式：

```tsx
// src/app/layout.tsx
import "streamdown/styles.css"
```

**CSS 变量**：Streamdown 使用 CSS 变量控制主题色，需在 `globals.css` 中定义：
- `--primary`：链接和强调色
- `--muted`：代码块、表头等背景色
- `--border`：边框和分割线
- `--radius`：圆角值

### 5. 与 AI SDK v5 useChat 的集成方案

当前 `ChatPanel.tsx` 使用 AI SDK v5 的 `useChat` hook，消息通过 `message.parts` 数组提供。集成方式：

```tsx
// 当前代码（纯文本渲染）
if (part.type === 'text') {
  return <div className="whitespace-pre-wrap">{part.text}</div>
}

// 改为 Streamdown 渲染（仅 assistant 消息）
if (part.type === 'text') {
  if (message.role === 'assistant') {
    return (
      <StreamdownRenderer
        content={part.text}
        isStreaming={status === 'streaming'}
      />
    )
  }
  return <div className="whitespace-pre-wrap">{part.text}</div>
}
```

**关键决策**：`isAnimating` 的值应根据 `useChat` 返回的 `status` 判断 —— 当 `status === 'streaming'` 时为 `true`，否则为 `false`。

### 6. 与 WorkflowPanel 报告的集成方案

`WorkflowPanel` 的报告通过 `useWorkflow` hook 中的 `report` 状态变量（string）和 `phase` 状态变量提供。当前代码：

```tsx
<div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-800">
  {report}
</div>
```

改为：

```tsx
<StreamdownRenderer
  content={report}
  isStreaming={phase === 'streaming'}
/>
```

### 7. 决策：创建共享 StreamdownRenderer 组件

**理由**：

1. ChatPanel 和 WorkflowPanel 都需要 Streamdown 渲染，插件配置（code + cjk）完全一致
2. 重复配置违反 DRY 原则（虽然 Constitution 说重复优于过早抽象，但这里已经明确有 2 个使用场景且配置完全相同）
3. 未来如果调整 Streamdown 配置（如添加/移除插件、修改主题），只需改一处
4. 组件本身很薄（< 30 行），不增加读者认知负担

**组件职责**：

- 导入 Streamdown 和所需插件
- 接受 `content: string` 和 `isStreaming: boolean` 两个 Props
- 封装插件配置，对外提供简洁接口

### 8. 依赖审查（Constitution III 要求）

| 审查项 | `streamdown` | `@streamdown/code` | `@streamdown/cjk` |
|--------|-------------|--------------------|--------------------|
| 教学目标所必需？ | ✅ 流式 Markdown 渲染是 spec 核心需求 | ✅ 代码分析报告必然含代码块 | ✅ 中文教学项目需要 CJK 支持 |
| 已有技术栈可替代？ | ❌ Tailwind 和原生 React 无法实现 | ❌ 需 Shiki 引擎 | ❌ 无替代 |
| 增加认知负担？ | 低 — API 简洁（单组件 + children） | 低 — 插件式导入 | 低 — 插件式导入 |

**结论**：三项审查全部通过，可以引入。
