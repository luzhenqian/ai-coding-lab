---
name: cover-thumbnail
description: Use when producing the deliverables for a video episode — the cover thumbnail AND/OR the per-platform marketing copy (Bilibili / YouTube / 小红书 / 视频号 titles, descriptions, tags). Both live as a single "preset" in creative/cover-generator/. Locks the channel's visual + editorial style. Always edit via the React app (cover-generator), never hand-roll HTML or copy-paste-edit per-platform copy from scratch.
---

# Episode Deliverables · House Style

## When to invoke

- User asks to "做一张封面" / "生成视频封面" / "制作 thumbnail"
- User asks for "标题/简介/标签 / metadata / 元数据 / 视频号 / B 站 / YouTube / 小红书 描述"
- User says "为这一期做发布素材" / "全平台发布"
- User shares a previous episode and wants the same shape of deliverables for a new one
- User explicitly mentions "用我们的封面风格" / "我们的发布模板"

If the user just wants a generic graphic that does NOT need to match the channel's identity, this skill does not apply.

## The rule

**Never hand-roll a new HTML/CSS file or per-platform marketing copy from scratch.** Every episode is one bundle, and bundles live as preset files under `creative/cover-generator/src/lib/presets/`. Each preset exports both:

- `cover` — `CoverContent` for the thumbnail
- `metadata` — `VideoMetadata` covering Bilibili / YouTube / 小红书 / 视频号 titles, descriptions, tags

The app's top-bar dropdown switches between bundles. The Tab toggle inside the app switches between **封面** (thumbnail editor + PNG export) and **元数据** (per-platform marketing-copy panel with character counters and one-click copy).

### To add a new episode

1. **Pick a theme and variant first.** Theme = chrome accent. Variant = right-side structure. Don't reuse the previous episode's theme — variation is the point.

2. **Create** `creative/cover-generator/src/lib/presets/ep0X-<slug>.ts`. Export both halves:
   ```ts
   import type {CoverContent, VideoMetadata} from '../types';

   const cover: CoverContent = {
     variant: 'pipeline',  // or 'state-machine'
     theme: 'orange',      // emerald / orange / indigo / rose / amber
     series: 'AI 编程实战 · BY NOAH',
     episode: 'EPISODE 0X',
     // ... all CoverContent fields
   };

   const metadata: VideoMetadata = {
     topic: '<theme>',
     duration: 'm:ss',
     summary: '<one-line, platform-neutral>',
     videoPath: 'creative/motion-canvas-videos/.../output/project.mp4',
     bilibili: { title, description, tags, category? },
     youtube:  { title, description, tags, hashtags },
     xiaohongshu: { title, body, topics },
     wechatChannels: { title, description, tags },
   };

   export const ep0XSlug = {cover, metadata};
   ```

2. **Register** it in `creative/cover-generator/src/lib/presets/index.ts` — prepend to `PRESETS` so it becomes the default:
   ```ts
   import {ep0XSlug} from './ep0X-<slug>';

   export const PRESETS: Preset[] = [
     {
       id: 'ep0X-<slug>',
       label: 'EP0X · <human label>',
       cover: ep0XSlug.cover,
       metadata: ep0XSlug.metadata,
     },
     // ...older entries
   ];
   ```

3. **Run** `npm run dev` (or just refresh — Vite hot-reloads). User picks the new entry from the dropdown, switches to **封面** for thumbnail export, and **元数据** for copy/paste-ready platform fields.

### To tweak an already-shipped episode

Edit its preset file in-place. Hot reload shows the change immediately.

### Per-platform writing voice (so all four don't sound identical)

| Platform | Tone | Length cues | Notes |
|----------|------|-------------|-------|
| Bilibili | 工程化向 / 干货语气 | 标题 ≤ 80, 简介 ≤ 250 | 简介里写 timestamps（`00:01:23 标题` 自动变锚点）；标签 ≤ 12 个，多放技术词 |
| YouTube | English-friendly, slightly more formal | title ≤ 100, description ≤ 5000 | Description first 3 hashtags float above title; chapter format `0:00 chapter title` |
| 小红书 | 口语 / 钩子式开场 / emoji 密度高 | 标题 ≤ 20 chars | Hook first line, body 用 emoji 分段；topics 写成 `#话题#` |
| 视频号 | 简短专业、品牌感强 | 标题 ≤ 22 chars | 描述里直接写 `#tag` inline；面向中文专业受众 |

Keep the 内容核心 a single platform-neutral `summary`. Then re-cast it per platform — don't copy-paste the same body into all four cards.

### Why bundle, not separate skills

The dropdown + tabs let the user switch between past covers AND past marketing copy without git-checkout-ing old commits. The whole episode (cover + 4 platforms × ~3 fields = 13+ artefacts) is one unit; treating it as one preset prevents drift across artefacts.

## Why this matters

The channel's brand identity comes from **strict repetition of layout + typography + decoration vocabulary**, with **per-episode color and right-side-structure variation** to prevent every cover looking identical. Repeat the bones, vary the skin.

Concretely:
- **Always identical**: 1280×720 canvas, dark substrate, left-content + vertical-separator + right-diagram + bottom-tags composition, frame corners, scanlines, grid + 3 radial glows, Noto Sans SC × JetBrains Mono pairing.
- **Varies per episode**: theme (chrome accent + glow palette), right-side variant (pipeline vs state-machine), title gradient stops.

## The visual system

### Canvas
- **Resolution**: 1280 × 720 (export scales: 1×, 2×, 3× = 4K, 4× = 5K)
- **Background**: theme-tinted dark (each theme picks its own near-black, e.g. `#090b11`, `#08090d`, `#0a0b10`)
- **Aspect**: 16:9, no exceptions

### Themes (5 built-in)

Each theme controls the chrome (badge / frame corners / glows / title gradient stops). Layer slot colors are independent — a layer declared `color: 'engine'` is always orange, regardless of theme.

| Theme | Primary | Glows | Used for |
|-------|---------|-------|----------|
| `emerald` | `#34d399` green | green + red + green | Default. Permission / safety / verification topics. |
| `orange` | `#f4723d` coral | indigo + orange + sky | Architecture overview / "big map" episodes. |
| `indigo` | `#818cf8` violet | indigo + sky | State machines / async flows / streaming engines. |
| `rose` | `#fb7185` pink-red | rose + amber | Editorial / warm topics, brand-N-Coral-adjacent. |
| `amber` | `#fbbf24` yellow | amber + indigo | Performance / optimization / focus topics. |

Adding a new theme: extend `ThemeId` in `src/lib/types.ts`, add an entry to `THEMES` in `src/lib/design-tokens.ts`. CSS auto-picks up via `var(--cv-*)` indirection.

### Right-side variants

The right half of the canvas chooses between two structures:

- **`pipeline`** (default): a vertical stack of 5–6 layer cards joined by gradient arrow connectors. Each layer card is one of two sub-shapes:
  - **Row** (`name + desc + badge + icon`) — for permission-flow / decision-tree topics (EP03)
  - **Chips** (`label + module pills`) — for architecture / file-map topics (EP01)
- **`state-machine`**: free-form nodes at author-specified positions joined by SVG `<path>` edges. For irregular flows like recovery trees, generators, retries (EP02). Author writes coordinates and SVG path strings explicitly — automatic graph layout looks generic.

Pick variant based on topic:
- "5 things in a fixed order" → pipeline / row
- "Architecture map / module list per layer" → pipeline / chips
- "Branchy flow with loops, recovery, retries" → state-machine

### Layer slot palette (independent of theme)

| Slot | Hex | Best fit |
|------|-----|----------|
| `hook` | `#a78bfa` violet | "intercept / start / hook" semantics |
| `classifier` | `#38bdf8` sky | "auto / classify / analyze" |
| `deny` | `#f87171` red | "block / deny / fail" |
| `allow` | `#4ade80` green | "pass / allow / success" |
| `mode` | `#fbbf24` amber | "mode / config / option" |
| `dialog` | `#34d399` emerald (with glow) | Final slot — highlighted with extra glow |
| `entry` | `#38bdf8` sky | Architecture: entry layer (used in EP01 chips style) |
| `commands` | `#a855f7` purple | Architecture: command layer |
| `tools` | `#22c55e` green | Architecture: tools layer |
| `engine` | `#f4723d` orange (with glow) | Architecture: hot core / engine — auto-glows |
| `services` | `#ec4899` pink | Architecture: service layer |

Text colors:

| Role | Hex |
|------|-----|
| Text | `#f0f0f0` |
| Text dim | `rgba(255,255,255,0.38)` |
| Text muted | `rgba(255,255,255,0.28)` |

### Typography

- **CN headlines**: `'Noto Sans SC', sans-serif`, weight 900, size 54px (with `letter-spacing: -1px` for tight kerning on big type)
- **EN labels & code & badges**: `'JetBrains Mono', monospace`
- **Highlighted word in title**: rendered via inline SVG with `linearGradient` from emerald → red. Always keep the gradient direction top-left to bottom-right.

### Layout (the canonical composition)

```
┌─────────────────────────────────────────────────────────────┐
│  [series badge]                                             │
│  EPISODE 0X                                                 │
│                                       ┌─ LAYER 1 ─┐         │
│  ⚡ HIGHLIGHTED WORD                  │   ⚡ ...   │         │
│  + rest of the title                  └───────────┘         │
│                                            ↓                │
│  subtitle line 1 with accent           ┌─ LAYER 2 ─┐        │
│  subtitle line 2                      │   🤖 ...   │        │
│                                        └───────────┘        │
│  [stat]  [stat]  [stat]                    ↓                │
│                                       ... 6 layers total    │
│                                                             │
│  [tech tag] [tech tag] [tech tag]                           │
└─────────────────────────────────────────────────────────────┘
```

- **Left content** (~600px wide, vertically centered): series badge → episode number → title (highlighted word + rest) → subtitle → stats row
- **Right pipeline** (~500px wide, vertically centered): 6 layers stacked, each with icon + name + desc + badge, connected by 5 short gradient arrows
- **Bottom-left**: technical tags (5 items max)
- **Frame**: 1px corner brackets in emerald at 0.3 opacity
- **Background**: subtle 36px grid + 3 radial glows (top-right green, bottom-left red, mid-right green) + scanlines at 0.02 opacity

### The 6-layer pipeline pattern

The right side is a "pipeline" — a stack of decision steps the topic flows through. The default vocabulary fits security/permission topics:
- LAYER 1 = pre-check / hook
- LAYER 2 = auto classifier / heuristic
- LAYER 3 = always-deny
- LAYER 4 = always-allow
- LAYER 5 = mode / configuration
- LAYER 6 = human-in-the-loop / final decision

For non-pipeline topics (e.g. "数据流走向"), reuse the same layered card style but rename layers to fit.

**Always 5 or 6 layers.** Fewer feels sparse, more starts to crowd the canvas.

## Doing the edit

When user asks for a new episode bundle:

1. **Confirm the topic and key fields**:
   - Episode number, title (CN + highlighted word), one-sentence subtitle, three stats, six layers (for the cover)
   - Topic, duration, one-sentence summary
   - Whether the user wants you to draft platform copy (or only the cover and they'll fill copy later)
   If anything load-bearing is missing, ask before editing.

2. **Create the preset** at `creative/cover-generator/src/lib/presets/ep0X-<slug>.ts` exporting `{cover, metadata}` and **register** it in `presets/index.ts`.

3. **For platform copy**: respect the per-platform voice table above. Don't reuse the Bilibili description on YouTube — translate idea, recast tone. Keep `summary` as the source of truth so future edits stay consistent.

4. **Tell the user** to run `npm run dev` (or just refresh). Pick the new entry in dropdown, switch to **封面** to export PNG, switch to **元数据** to copy each platform's fields.

## Anti-patterns to refuse

- ❌ Generating a fresh standalone HTML cover file. The React app exists exactly to prevent style drift.
- ❌ Changing the canvas resolution to 1920×1080 or other aspects. We are 1280×720, scaled at export.
- ❌ Adding a new accent color outside the palette above. If the user wants a new color, propose mapping to one of the existing layer slots first.
- ❌ Replacing Noto Sans SC / JetBrains Mono. The typography pairing is part of the brand.
- ❌ Shipping a cover with fewer than 5 pipeline layers — the visual rhythm breaks.
