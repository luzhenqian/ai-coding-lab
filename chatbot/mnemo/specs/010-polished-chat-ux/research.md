# Research: Polished Chat UI/UX

## R-001: Component Library Approach

**Decision**: Add shadcn/ui components (Avatar, Tooltip, AlertDialog, Skeleton, Textarea) rather than introducing Radix Themes

**Rationale**: The project already uses shadcn/ui v4 with `base-nova` style (Base UI primitives). Adding Radix Themes would create CSS conflicts with the existing Tailwind v4 + shadcn setup. shadcn components use the same `@base-ui/react` primitives already installed, so they integrate seamlessly.

**Alternatives considered**:
- Radix Themes — Pre-styled but conflicts with Tailwind CSS resets, different theming paradigm, not recommended alongside shadcn/ui
- assistant-ui — Purpose-built chat UI library, but adds heavy abstraction layer on top of already-built chat components
- Headless UI — Different primitive library, would require replacing Base UI

## R-002: Animation Strategy

**Decision**: Use `tw-animate-css` composable animation classes already installed in the project

**Rationale**: `tw-animate-css` v1.4.0 provides a composable system: combine `animate-in` with modifiers like `fade-in` and `slide-in-from-bottom-2`. This avoids adding another animation library and keeps everything in Tailwind utility classes.

**Key patterns**:
- Message entrance: `animate-in fade-in slide-in-from-bottom-2 animation-duration-300`
- Typing indicator: CSS `@keyframes` for bouncing dots (custom, small addition)
- Skeleton pulse: Built into shadcn Skeleton component

## R-003: shadcn Component Installation

**Decision**: Install 5 new shadcn components via CLI

**Command**: `pnpm dlx shadcn@latest add avatar tooltip alert-dialog skeleton textarea`

**Rationale**: The shadcn CLI generates `base-nova` style components using `@base-ui/react` (already in package.json at `^1.3.0`). No new primitive library needed.

**Components and their use**:
- Avatar → Message bubbles (user/bot icons)
- Tooltip → All icon-only buttons (send, delete, new conversation, menu)
- AlertDialog → Delete conversation confirmation
- Skeleton → Conversation list and message loading states
- Textarea → Replace single-line Input in chat-input.tsx

## R-004: Typing Indicator Design

**Decision**: Custom CSS-only typing indicator with 3 bouncing dots

**Rationale**: No library needed for this. A simple `@keyframes bounce` animation on 3 small circles, staggered with `animation-delay`, creates the standard typing indicator pattern. This is rendered as a special message bubble in the assistant area.

## R-005: Auto-resize Textarea

**Decision**: Use `scrollHeight`-based auto-resize with a max height cap

**Rationale**: Standard pattern: on `input` event, reset height to `auto`, then set height to `scrollHeight`. Cap with `max-h-[200px]` and `overflow-y-auto` when exceeding. Reset to default on send. No library needed.

## R-006: Conversation Date Grouping

**Decision**: Client-side grouping using relative date comparison

**Rationale**: Group conversations into 4 buckets: "今天" (today), "昨天" (yesterday), "最近7天" (last 7 days), "更早" (older). Compare conversation `createdAt` timestamps against current date. Pure utility function, no external dependency needed.
