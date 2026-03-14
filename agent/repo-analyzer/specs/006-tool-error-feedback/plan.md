# Implementation Plan: 工具调用错误反馈

**Branch**: `006-tool-error-feedback` | **Date**: 2026-03-14 | **Spec**: [spec.md](./spec.md)

## Summary

在 ChatPanel 中，当工具调用状态为 `output-error` 时，读取 tool part 的 `errorText` 字段并展示在工具状态徽章下方。改动极小，仅涉及 ChatPanel.tsx 中工具渲染部分的扩展。

## Technical Context

**Language/Version**: TypeScript (strict mode)
**Primary Dependencies**: AI SDK v5 (`@ai-sdk/react`)
**Storage**: N/A
**Testing**: 手动验证
**Target Platform**: Browser (Next.js App Router)
**Project Type**: Web application (教学演示)
**Constraints**: 文件不超过 200 行，中文注释

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. 教学清晰度优先 | ✅ PASS | 改动直观，展示了如何处理工具调用错误 |
| II. 严格 TypeScript | ✅ PASS | 扩展现有类型断言，添加 errorText 字段 |
| III. 技术栈纪律 | ✅ PASS | 无新依赖 |
| IV. 代码可读性 | ✅ PASS | 中文注释说明错误处理逻辑 |
| V. 健壮的错误处理 | ✅ PASS | 正是本 feature 的核心目标 |
| VI. AI Agent 工程规范 | ✅ PASS | 完善了工具调用的错误反馈链路 |
| VII. 最小可运行原则 | ✅ PASS | 最小改动，仅修改一个文件 |

## Project Structure

### Source Code Changes

```text
src/app/components/
└── ChatPanel.tsx    # 修改：工具调用 output-error 状态时展示 errorText
```

## Implementation Details

在 ChatPanel.tsx 中，当前工具调用渲染代码已经处理了 `output-error` 状态（通过 ToolStatusBadge 显示"出错"标签）。需要扩展此处逻辑：

1. 在工具 part 的类型断言中添加 `errorText?: string` 字段
2. 当 `toolPart.state === 'output-error'` 且 `toolPart.errorText` 存在时，在 ToolStatusBadge 下方渲染错误信息
3. 错误信息使用红色背景样式，与现有的 ToolStatusBadge 错误状态配色一致

```tsx
// 扩展类型断言
const toolPart = part as {
  type: string
  toolCallId: string
  state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error'
  errorText?: string
}

// 渲染错误信息
return (
  <div key={toolPart.toolCallId ?? index} className="my-2">
    <ToolStatusBadge toolName={toolName} state={toolPart.state} />
    {toolPart.state === 'output-error' && toolPart.errorText && (
      <div className="mt-1 rounded bg-red-50 px-3 py-2 text-xs text-red-600">
        {toolPart.errorText}
      </div>
    )}
  </div>
)
```
