# UI Contracts: Dark Tech UI Upgrade

## Theme Provider Contract

The root layout wraps the application in a theme provider that:
- Accepts `attribute="class"` to toggle `dark` class on `<html>`
- Defaults to `"dark"` theme
- Enables system preference detection
- Prevents FOUC via inline script injection

## Theme Toggle Contract

A theme toggle button is placed in the header area and:
- Displays the current theme state visually (sun/moon icon)
- Cycles through: dark → light → system (or dark ↔ light)
- Triggers theme change within 300ms
- Persists choice to localStorage

## Component Styling Contract

All interactive components follow shadcn/ui conventions:
- Use CSS variables (`hsl(var(--primary))`) not hardcoded colors
- Support `dark:` variant via class strategy
- Accept `className` prop for composition
- Follow consistent sizing scale (sm, default, lg)

## Animation Contract

All animated components:
- Use framer-motion `motion.*` primitives
- Wrap conditional renders in `<AnimatePresence>`
- Check `useReducedMotion()` before applying animations
- Use consistent duration: enter 200-300ms, exit 150-200ms
- Use consistent easing: `[0.4, 0, 0.2, 1]` (Material ease)

## Streamdown Integration Contract

Markdown rendering:
- Inherits theme via CSS variable overrides on Streamdown's `--sd-*` variables
- Code blocks use theme-aware syntax highlighting
- Streaming mode continues to work with animated text appearance
- CJK plugin remains active

## shadcn/ui Components Required

| Component | Usage |
|-----------|-------|
| Button | Send message, approve/cancel workflow, new conversation |
| Input | Chat input, URL input |
| Card | Conversation items, repo summary, workflow cards |
| Badge | Tool status, topic tags, status indicators |
| Tabs | Mode switcher (chat/workflow) |
| ScrollArea | Chat message list, conversation sidebar |
| Tooltip | Icon buttons, status badges |
| Separator | Section dividers |
| DropdownMenu | Theme toggle (if 3-way: dark/light/system) |
