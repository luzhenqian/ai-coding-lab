# Agent 编排的四种模式 · Motion Canvas

按脚本《Agent 编排的四种模式：到底谁说了算？》制作的讲解动画，约 5 分钟。

## 章节（按播放顺序）

| # | 文件 | 内容 | 时长 |
|---|------|------|------|
| 01 | `scenes/01-hook.tsx` | Hook · 单 Agent 30 工具混乱 → 标题卡 | ~25s |
| 02 | `scenes/02-intro.tsx` | 频道介绍 · 仓库链接 · 今天讲什么 | ~15s |
| 03 | `scenes/03-problem.tsx` | 核心问题：谁来决定下一步谁干活？ | ~30s |
| 04 | `scenes/04-supervisor.tsx` | 模式一 · Supervisor 总管模式 | ~38s |
| 05 | `scenes/05-workflow.tsx` | 模式二 · Workflow 工作流模式 | ~38s |
| 06 | `scenes/06-handoff.tsx` | 模式三 · Handoff 交接模式 | ~38s |
| 07 | `scenes/07-council.tsx` | 模式四 · Council 议会模式 | ~38s |
| 08 | `scenes/08-decision.tsx` | 决策矩阵 + "是混着用的" 转折 | ~25s |
| 09 | `scenes/09-hybrid.tsx` | VIP 客服 · Supervisor 套 Workflow 套 Council | ~25s |
| 10 | `scenes/10-outro.tsx` | 终极对比表 · 下期预告 · 片尾 | ~22s |

> 共享设计 token 在 `src/lib/design.tsx`（颜色、字体、复用组件）。

## 快速开始

```bash
npm install
npm run start
```

打开 http://localhost:9100/ 进入 Motion Canvas 编辑器：左上角"Scenes"面板可点击切换到任一章节单独预览，时间轴拖动 / 播放即可看效果。

## 导出 mp4

`@motion-canvas/ffmpeg` 已接入，需要系统 `ffmpeg`（macOS: `brew install ffmpeg`）。

操作：右侧 `VIDEO SETTINGS` → `Rendering` → `file type` 选 **video** → 点 `RENDER`，输出 mp4 落在项目根目录的 `output/` 下。

## 目录结构

```
src/
├── project.ts                # 项目入口，注册 10 个 scene
├── fonts.ts                  # 字体预加载（Noto Sans SC / JetBrains Mono）
├── global.css                # CSS 占位（字体由 fonts.ts 注入）
├── lib/
│   └── design.tsx            # 共享 COLORS / FONTS / 通用组件
└── scenes/
    ├── 01-hook.tsx
    ├── 02-intro.tsx
    ├── 03-problem.tsx
    ├── 04-supervisor.tsx
    ├── 05-workflow.tsx
    ├── 06-handoff.tsx
    ├── 07-council.tsx
    ├── 08-decision.tsx
    ├── 09-hybrid.tsx
    ├── 10-outro.tsx
    └── _archive/             # 早期 demo 版本，不进 build
```

## 配色（`src/lib/design.tsx`）

四种模式各自的主色——讲解时方便观众一眼分辨：

| 模式 | 颜色 | 含义 |
|------|------|------|
| Supervisor | `#ffb86b` (amber) | 总厨头巾 |
| Workflow | `#7eb6ff` (blue) | 工业蓝 |
| Handoff | `#ff7a9c` (pink-red) | 医院 / 急诊 |
| Council | `#84e1a4` (emerald) | 共识 / 议会 |

## 修改建议

- **改某一段的时长**：每个 scene 文件按 phase 注释分块（`// ---- phase X (~Ys) ----`），调 `waitFor(...)` 数值即可。
- **改文案**：搜对应中文字符串直接改。
- **替换 B-roll 占位**：脚本里提到的"餐厅总厨""流水线""急诊""code review"实拍空镜，目前用风格化卡片占位，后期可在 metaphor 段落对应位置剪入真实素材。
- **加新模式 / 新章节**：在 `scenes/` 新建 `NN-xxx.tsx`，在 `project.ts` 的 `scenes` 数组里按顺序加入即可。
