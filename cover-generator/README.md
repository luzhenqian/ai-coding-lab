# Cover Generator

为 AI 编程实战系列视频生成统一风格的封面（1280×720，可导出 720p / 2K / 4K / 5K）。

视觉规范由 `.claude/skills/cover-thumbnail/SKILL.md` 锁定 —— 不要绕过这个工具直接写新 HTML，否则会破坏品牌一致性。

## 快速开始

```bash
npm install
npm run dev
```

打开 http://localhost:9200/ 后：
1. 左边侧栏改内容（系列名、集数、标题、副标题、统计、6 层管道、底部标签）
2. 右边实时预览
3. 顶部下拉选分辨率，点 **导出 PNG** 即可下载

## 目录结构

```
src/
├── main.tsx                 # React 入口
├── App.tsx                  # 应用壳（编辑器 + 预览 + 工具栏）
├── Cover.tsx                # 封面本体（1:1 复刻原 HTML）
├── Editor.tsx               # 左侧表单编辑器
├── lib/
│   ├── types.ts             # CoverContent 类型定义
│   ├── design-tokens.ts     # 颜色 / 字体 / 分辨率 常量
│   ├── default-content.ts   # 默认内容（EP03 工具系统）—— 改这里换掉默认例子
│   └── export.ts            # html2canvas 导出 PNG 逻辑
└── styles/
    ├── app.css              # 应用壳样式
    └── cover.css            # 封面本体样式（不要改这里来"做不同的封面"）
```

## 设计系统（要点）

- **画布固定 1280×720**：所有定位是绝对像素值，导出 PNG 像素稳定
- **配色限定 6 个 layer slot**：`hook / classifier / deny / allow / mode / dialog`，对应紫/天蓝/红/绿/琥珀/翠绿
- **字体**：`Noto Sans SC` 大标题 · `JetBrains Mono` 一切英文/代码/标签
- **标题高亮词** 用 SVG 内联渐变实现（CSS `background-clip: text` 在 html2canvas 里不可靠）
- **建议管道层 5–6 个**：少了画面散，多了拥挤

完整规范见 `.claude/skills/cover-thumbnail/SKILL.md`。

## 给将来的自己 / Claude 的提示

新一期视频要做封面时：

1. **不要重新写 HTML**。这就是这个工具存在的意义
2. 在编辑器里改字段，或者直接编辑 `src/lib/default-content.ts` —— 后者改完热加载就能看到
3. 改完点导出，把 PNG 留在视频项目里
4. 如果想保留这一期的内容做后续参考，把 default-content.ts 复制成 `src/lib/presets/ep0X-{topic}.ts`

## 限制

- 中文字体加载从 Google Fonts CDN，离线环境会 fallback 到系统字体
- html2canvas 对 CSS `background-clip: text` 不友好，所以渐变文字必须走 SVG（已经在 Cover.tsx 里处理）
- 导出 5K 时画面较大，html2canvas 渲染需要几秒，按钮会显示"渲染中..."
