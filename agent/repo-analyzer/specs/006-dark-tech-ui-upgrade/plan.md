# Implementation Plan: Dark Tech UI Upgrade

**Feature Branch**: `006-dark-tech-ui-upgrade`
**Created**: 2026-03-14
**Spec**: [spec.md](./spec.md)

## Technical Context

| Aspect | Detail |
|--------|--------|
| Framework | Next.js 15 (App Router) + TypeScript strict |
| Styling | Tailwind CSS v4 (PostCSS) — no custom config file |
| Current UI | 8 custom components, pure Tailwind utilities, no component library |
| AI Integration | Mastra agents + Vercel AI SDK v5 (useChat, streaming) |
| Markdown | Streamdown v2.4 with code + CJK plugins |
| State | React hooks + localStorage for conversations |

## New Dependencies

| Package | Purpose | Version |
|---------|---------|---------|
| shadcn/ui | Component library (via CLI) | latest |
| next-themes | Theme switching (dark/light/system) | ^0.4 |
| motion (framer-motion) | Rich animations | ^11 |
| class-variance-authority | Component variants | ^0.7 |
| clsx | Class composition | ^2 |
| tailwind-merge | Tailwind class deduplication | ^2 |
| lucide-react | Icon library (shadcn/ui default) | latest |

## Architecture Decisions

### AD-1: Component Migration Strategy
Migrate components incrementally — install shadcn/ui base components first, then replace existing components one by one. Keep existing components working during migration to avoid breaking changes.

### AD-2: CSS Variable Architecture
Use shadcn/ui's HSL CSS variable system in globals.css. Define dark theme as default (`:root`), light theme under `.dark` inverted. Extend with custom neon accent variables for the dark tech aesthetic.

### AD-3: Animation Layering
Apply animations in layers:
1. CSS transitions for simple hover/focus states (via Tailwind)
2. framer-motion for component mount/unmount and layout transitions
3. AnimatePresence for mode switching and conditional content

### AD-4: Theme-First Approach
Implement theme system before visual redesign so all new styles use CSS variables from the start.

## Implementation Phases

### Phase 1: Foundation (shadcn/ui + Theme System)
1. Initialize shadcn/ui (`npx shadcn@latest init`)
2. Install next-themes, configure ThemeProvider in layout.tsx
3. Define dark tech color palette as CSS variables in globals.css
4. Install base shadcn/ui components: Button, Input, Card, Badge, Tabs, ScrollArea, Tooltip, Separator
5. Create ThemeToggle component
6. Verify: app renders in dark mode by default, theme toggle works

### Phase 2: Layout & Navigation Redesign
1. Redesign root layout with dark tech aesthetic
2. Redesign header with new typography, theme toggle placement
3. Migrate ModeSwitcher to shadcn/ui Tabs with dark tech styling
4. Redesign ConversationList sidebar with ScrollArea, Card components
5. Verify: layout looks correct in both themes, no broken styling

### Phase 3: Chat Mode Upgrade
1. Migrate ChatPanel to use shadcn/ui components (Input, Button, ScrollArea)
2. Redesign message bubbles with dark tech aesthetic (neon accents, glass effects)
3. Migrate ToolStatusBadge to shadcn/ui Badge with glow effects
4. Update StreamdownRenderer theme variables for dark/light compatibility
5. Verify: chat mode fully functional, streaming works, tool calls display correctly

### Phase 4: Workflow Mode Upgrade
1. Migrate WorkflowPanel to use shadcn/ui components
2. Redesign StepStatusBar with animated progress and glow effects
3. Redesign RepoSummaryCard with dark tech card styling
4. Style approval buttons and workflow states
5. Verify: workflow mode fully functional, HITL approval works

### Phase 5: Animations & Polish
1. Install framer-motion, create animation utilities
2. Add AnimatePresence for mode switching transitions
3. Add mount/unmount animations for messages, cards, sidebar items
4. Add hover micro-interactions (lift, glow, scale)
5. Add workflow step transition animations
6. Implement reduced-motion support
7. Verify: all animations smooth, no jank, reduced-motion respected

### Phase 6: Final Integration & QA
1. Full visual audit in dark mode
2. Full visual audit in light mode
3. Theme switching stress test (rapid toggling, during streaming)
4. Verify all existing functionality (chat, workflow, HITL, conversations)
5. Performance check (load time, animation fps)
6. Streamdown rendering in both themes

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| shadcn/ui + Tailwind v4 compatibility | Use latest shadcn CLI which supports v4 |
| Streamdown style conflicts | Override `--sd-*` variables in theme CSS |
| Animation performance | Use `transform` and `opacity` only, avoid layout triggers |
| FOUC on theme load | next-themes injects inline script to prevent flash |
| Breaking existing functionality | Migrate components incrementally, test after each phase |
