---
name: cover-thumbnail
description: Use when the user asks to make a video cover / thumbnail / 封面 for a technical YouTube / Bilibili episode in the N-Brand house style. Ensures every cover follows the same visual system (dark substrate + green/red accent + 6-layer pipeline composition + Noto Sans SC × JetBrains Mono pairing). Always edit content via the cover-generator React app, never freshly hand-roll HTML.
---

# Cover Thumbnail · House Style

## When to invoke

- User asks to "做一张封面" / "生成视频封面" / "制作 thumbnail" for any episode in the channel
- User shares a previous cover and asks for a new one in the same style
- User asks to update an existing cover with new content (new episode number, new title, etc.)
- User explicitly mentions "用我们的封面风格"

If the user just wants a generic graphic that does NOT need to match the channel's identity, this skill does not apply.

## The rule

**Never hand-roll a new HTML/CSS file from scratch.** The cover style is locked into a React app at `cover-generator/`. Each episode's content lives as a preset file under `cover-generator/src/lib/presets/`, and the app's top-bar dropdown switches between them at runtime.

### To add a new episode's cover

1. **Create** `cover-generator/src/lib/presets/ep0X-<slug>.ts`:
   ```ts
   import type {CoverContent} from '../types';

   export const ep0XSlug: CoverContent = {
     series: 'AI 编程实战 · BY NOAH',
     episode: 'EPISODE 0X',
     // ... fill in all fields per CoverContent type
   };
   ```

2. **Register** it in `cover-generator/src/lib/presets/index.ts` — add an entry to the `PRESETS` array, **at the top** (newest first):
   ```ts
   import {ep0XSlug} from './ep0X-<slug>';

   export const PRESETS: Preset[] = [
     {id: 'ep0X-<slug>', label: 'EP0X · <human label>', content: ep0XSlug},
     // ... existing entries below
   ];
   ```

3. **Run** `npm run dev` in `cover-generator/`. The dropdown picks up the new preset automatically. User selects it, optionally edits via sidebar, clicks 导出 PNG.

### To tweak an already-shipped episode

Edit its preset file in-place. Hot reload shows the change immediately.

### Why presets, not one default file

The dropdown lets the user switch between past covers without git-checkout-ing old commits. Every cover the channel has shipped should remain accessible — both as reference for visual rhythm and to re-export at a different resolution if needed.

## Why this matters

The channel's brand identity comes from **strict repetition** of a small visual vocabulary. The previous video uses N-Coral (#FF5E4D) on warm-dark; the cover series uses emerald (#10b981) on cool-dark with red accent. Both are deliberate. Don't drift.

## The visual system

### Canvas
- **Resolution**: 1280 × 720 (export scales: 1×, 2×, 3× = 4K, 4× = 5K)
- **Background**: `#090b11` (cool dark, almost black)
- **Aspect**: 16:9, no exceptions

### Color palette

| Role | Hex | Usage |
|------|-----|-------|
| Background | `#090b11` | Canvas |
| Primary accent | `#34d399` (emerald-400) | Series badge, primary stats, "PASS" layer, frame corners |
| Warning accent | `#f87171` (red-400) | "DENY" layer, danger stats |
| Caution accent | `#fbbf24` (amber-400) | "MODE" layer, info stats |
| Layer 1 | `#a78bfa` (violet-400) | "HOOK / INTERCEPT" layer |
| Layer 2 | `#38bdf8` (sky-400) | "AUTO" classifier layer |
| Layer 3 | `#f87171` (red-400) | "BLOCK / DENY" layer |
| Layer 4 | `#4ade80` (green-400) | "PASS / ALLOW" layer |
| Layer 5 | `#fbbf24` (amber-400) | "MODE / CONFIG" layer |
| Layer 6 | `#34d399` (emerald-400) | Final / "HUMAN" layer (highlighted with extra glow) |
| Text | `#f0f0f0` | Headlines |
| Text dim | `rgba(255,255,255,0.38)` | Subtitle |
| Text muted | `rgba(255,255,255,0.28)` | Stat labels |

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

When user asks for a new cover:

1. **Confirm the topic and key fields** — episode number, title (Chinese + highlighted word), one-sentence subtitle, three stats, six layers. If anything is missing, ask before editing.

2. **Create the preset** at `cover-generator/src/lib/presets/ep0X-<slug>.ts` and register it at the top of `presets/index.ts`. (See "To add a new episode's cover" above.)

3. **Tell the user** to run `npm run dev` (or just refresh — Vite hot-reloads). Pick the new entry in the dropdown, click 导出 PNG.

## Anti-patterns to refuse

- ❌ Generating a fresh standalone HTML cover file. The React app exists exactly to prevent style drift.
- ❌ Changing the canvas resolution to 1920×1080 or other aspects. We are 1280×720, scaled at export.
- ❌ Adding a new accent color outside the palette above. If the user wants a new color, propose mapping to one of the existing layer slots first.
- ❌ Replacing Noto Sans SC / JetBrains Mono. The typography pairing is part of the brand.
- ❌ Shipping a cover with fewer than 5 pipeline layers — the visual rhythm breaks.
