# Implementation Plan: Streamdown Markdown 流式渲染

**Branch**: `003-streamdown-markdown` | **Date**: 2026-03-14 | **Spec**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

## Summary

集成 `streamdown`（Vercel 开源的流式 Markdown 渲染组件）到 ChatPanel 和 WorkflowPanel，实现 AI 回复和分析报告的实时富文本渲染。创建共享的 `StreamdownRenderer` 组件统一封装配置。

> **包名说明**：原需求提到 `@anthropic-ai/streamdown`，经调研该包不存在。实际使用 Vercel 维护的 `streamdown` 包，功能完全满足需求。

## Technical Context

| 项目 | 值 |
|------|------|
| Language/Version | TypeScript (strict mode) |
| Primary Dependencies | streamdown, @streamdown/code, @streamdown/cjk |
| Existing Stack | Mastra, Vercel AI SDK v5, React 19, Next.js 15, Tailwind CSS v4 |
| Storage | N/A |
| Testing | 手动验证（按 spec 中的 Acceptance Scenarios） |
| Target Platform | Browser (Next.js App Router) |
| Project Type | Web application（教学演示） |
| Constraints | 文件不超过 200 行，中文注释 |

## Constitution Check

| # | 原则 | 检查结果 |
|---|------|----------|
| I | 教学清晰度优先 | ✅ StreamdownRenderer 封装简洁，props 语义清晰，有中文注释说明"做什么"和"为什么" |
| II | 严格 TypeScript | ✅ StreamdownRenderer 的 Props 接口显式声明，无 `any` 类型 |
| III | 技术栈纪律 | ✅ `streamdown` 非原定技术栈，但属于用户明确请求引入的依赖。已通过三项依赖审查（见 [research.md](./research.md)） |
| IV | 代码可读性 | ✅ 关键函数有中文注释，StreamdownRenderer < 40 行，修改的文件均不超过 200 行 |
| V | 健壮的错误处理 | ✅ Streamdown 本身对不完整 Markdown 有容错处理，无需额外 try-catch |
| VI | AI Agent 工程规范 | N/A — 本 feature 不涉及 Agent/Tool/Workflow 后端逻辑 |
| VII | 最小可运行原则 | ✅ 仅安装必要的 3 个包（streamdown + code + cjk），不引入 mermaid/math |

## Project Structure

```
src/app/
├── globals.css                          # 修改：添加 @source 指令 + CSS 变量
├── layout.tsx                           # 修改：导入 streamdown/styles.css
├── components/
│   ├── StreamdownRenderer.tsx           # 新增：共享 Streamdown 封装组件
│   ├── ChatPanel.tsx                    # 修改：assistant 消息使用 StreamdownRenderer
│   └── WorkflowPanel.tsx               # 修改：报告使用 StreamdownRenderer
package.json                             # 修改：添加 streamdown 相关依赖
```

## Implementation Details

### Step 1：安装依赖

```bash
pnpm add streamdown @streamdown/code @streamdown/cjk
```

---

### Step 2：配置 CSS（globals.css）

在 `src/app/globals.css` 中添加 Streamdown 的 Tailwind v4 源扫描指令和主题 CSS 变量：

```css
@import "tailwindcss";

/* Streamdown 组件的 Tailwind 类名扫描 —— 让 Tailwind v4 识别 streamdown 内部使用的样式 */
@source "../node_modules/streamdown/dist/*.js";
@source "../node_modules/@streamdown/code/dist/*.js";
@source "../node_modules/@streamdown/cjk/dist/*.js";

/* Streamdown 主题变量 —— 控制 Markdown 渲染的颜色和圆角 */
@layer base {
  :root {
    --primary: 221.2 83.2% 53.3%;
    --muted: 210 40% 96.1%;
    --border: 214.3 31.8% 91.4%;
    --radius: 0.5rem;
  }
}
```

---

### Step 3：导入动画样式（layout.tsx）

在 `src/app/layout.tsx` 中导入 Streamdown 的流式动画 CSS：

```tsx
import "streamdown/styles.css"
```

在现有的 `import './globals.css'` 附近添加即可。

---

### Step 4：创建 StreamdownRenderer 组件（新文件）

创建 `src/app/components/StreamdownRenderer.tsx`：

```tsx
/**
 * Streamdown Markdown 渲染器
 *
 * 做什么：封装 Streamdown 组件，提供统一的流式 Markdown 渲染能力
 * 为什么：ChatPanel 和 WorkflowPanel 都需要渲染 AI 生成的 Markdown，
 *        将 Streamdown 的插件配置集中管理，避免两处重复配置
 */

'use client'

import { Streamdown } from 'streamdown'
import { code } from '@streamdown/code'
import { cjk } from '@streamdown/cjk'

/** Streamdown 插件配置 —— 代码高亮 + CJK 中文支持 */
const plugins = { code, cjk }

interface StreamdownRendererProps {
  /** 要渲染的 Markdown 文本内容 */
  content: string
  /** 是否正在流式生成（控制打字动画效果） */
  isStreaming: boolean
}

/**
 * 流式 Markdown 渲染组件
 *
 * 使用 Streamdown 将 Markdown 文本渲染为富文本格式：
 * - 支持标题、表格、列表、代码块、引用等常见 Markdown 语法
 * - 流式输出时实时渲染已到达的内容，不等待完整输出
 * - 自动处理不完整的 Markdown（如只到达一半的表格）
 */
export function StreamdownRenderer({ content, isStreaming }: StreamdownRendererProps) {
  return (
    <Streamdown plugins={plugins} isAnimating={isStreaming}>
      {content}
    </Streamdown>
  )
}
```

---

### Step 5：修改 ChatPanel.tsx

修改 `src/app/components/ChatPanel.tsx` 中 assistant 消息的文本渲染部分。

**改动点**：仅替换 `part.type === 'text'` 的渲染逻辑，对 assistant 消息使用 StreamdownRenderer，用户消息保持纯文本。

**新增导入**：

```tsx
import { StreamdownRenderer } from './StreamdownRenderer'
```

**替换文本渲染部分**（约第 66-71 行）：

```tsx
// 修改前：
if (part.type === 'text') {
  return (
    <div key={index} className="whitespace-pre-wrap">
      {part.text}
    </div>
  )
}

// 修改后：
if (part.type === 'text') {
  /** 用户消息保持纯文本，仅 AI 回复使用 Markdown 渲染 */
  if (message.role === 'assistant') {
    return (
      <div key={index}>
        <StreamdownRenderer
          content={part.text}
          isStreaming={status === 'streaming'}
        />
      </div>
    )
  }
  return (
    <div key={index} className="whitespace-pre-wrap">
      {part.text}
    </div>
  )
}
```

**注意事项**：
- `status` 来自 `useChat()` 的返回值，当前代码已解构获取
- 需要在渲染 assistant 消息时将 `status` 传递进来判断是否正在流式输出
- 用户消息（`message.role === 'user'`）保持原有的 `whitespace-pre-wrap` 纯文本渲染

---

### Step 6：修改 WorkflowPanel.tsx

修改 `src/app/components/WorkflowPanel.tsx` 中报告展示部分。

**新增导入**：

```tsx
import { StreamdownRenderer } from './StreamdownRenderer'
```

**替换报告渲染部分**（约第 70-76 行）：

```tsx
// 修改前：
{(phase === 'streaming' || phase === 'done') && report && (
  <div className="rounded-lg border bg-white p-6 shadow-sm">
    <h2 className="mb-4 text-lg font-bold text-gray-900">分析报告</h2>
    <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-800">
      {report}
    </div>
    {phase === 'streaming' && (
      <div className="mt-2 animate-pulse text-sm text-blue-500">
        正在生成报告...
      </div>
    )}
  </div>
)}

// 修改后：
{(phase === 'streaming' || phase === 'done') && report && (
  <div className="rounded-lg border bg-white p-6 shadow-sm">
    <h2 className="mb-4 text-lg font-bold text-gray-900">分析报告</h2>
    <StreamdownRenderer
      content={report}
      isStreaming={phase === 'streaming'}
    />
    {phase === 'streaming' && (
      <div className="mt-2 animate-pulse text-sm text-blue-500">
        正在生成报告...
      </div>
    )}
  </div>
)}
```

**改动说明**：
- 移除 `prose prose-sm max-w-none whitespace-pre-wrap text-gray-800` 样式类 —— Streamdown 自带排版样式
- `isStreaming` 由 `phase === 'streaming'` 判断，与现有的进度提示逻辑一致

## 文件行数预估

| 文件 | 当前行数 | 修改后预估 | 是否超 200 行 |
|------|---------|-----------|-------------|
| StreamdownRenderer.tsx | 新文件 | ~35 行 | ✅ 远低于限制 |
| ChatPanel.tsx | 139 行 | ~150 行 | ✅ 安全 |
| WorkflowPanel.tsx | 85 行 | ~83 行 | ✅ 安全 |
| globals.css | 1 行 | ~15 行 | ✅ 安全 |

## 手动验证清单

按照 spec 中的 Acceptance Scenarios 逐项验证：

- [ ] **SC-001**：聊天模式发送"分析一下 vercel/next.js"，检查 AI 回复中的表格、标题、代码块、列表是否渲染为富文本
- [ ] **SC-002**：流式输出过程中，已到达的内容是否实时渲染（无明显延迟）
- [ ] **SC-003**：超宽表格或长代码行是否有局部水平滚动，不破坏页面布局
- [ ] **SC-004**：用户消息（右侧蓝色气泡）是否保持纯文本，不受 Markdown 渲染影响
- [ ] **Edge-001**：AI 回复纯文本（无 Markdown）时是否正常显示
- [ ] **Edge-002**：流式传输中表格只到达一半时，是否优雅处理（不报错、不崩溃）
- [ ] **Workflow**：Workflow 模式完成分析后，报告是否以富文本格式渲染
- [ ] **Workflow-Stream**：报告流式生成过程中，已到达部分是否实时渲染
