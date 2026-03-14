# Implementation Plan: Sidebar Knowledge Base Entry

**Branch**: `007-sidebar-knowledge-entry` | **Date**: 2026-03-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-sidebar-knowledge-entry/spec.md`

## Summary

Add a "知识库管理" navigation entry to the bottom of the existing chat sidebar (`ChatSidebar` component) that links to the `/upload` page. The entry includes a folder/document icon, is separated from the conversation list by a divider, and works on both desktop and mobile viewports.

## Technical Context

**Language/Version**: TypeScript (strict mode) on Node.js 20+
**Primary Dependencies**: Next.js 16+ (App Router), React 19, Tailwind CSS
**Storage**: N/A (no data changes)
**Testing**: Manual verification — navigate from `/chat` sidebar to `/upload`
**Target Platform**: Web (320px–1920px viewports)
**Project Type**: Web application (Next.js)
**Performance Goals**: N/A (static link, no computation)
**Constraints**: Single component modification, no new files needed
**Scale/Scope**: 1 component change (~10 lines added)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. RAG Accuracy First | N/A | No retrieval/generation logic involved |
| II. Streaming UX | N/A | No streaming involved |
| III. Type Safety | PASS | No new types needed; using Next.js `Link` component |
| IV. Simple Architecture | PASS | Single component change, no new abstractions, follows YAGNI |
| V. Reproducible Local Dev | N/A | No infrastructure changes |

**Technology Constraints**: PASS — Using existing Tailwind CSS for styling, Next.js `Link` for navigation. No new dependencies.

**Gate Result**: PASS — No violations.

## Project Structure

### Documentation (this feature)

```text
specs/007-sidebar-knowledge-entry/
├── spec.md              # Feature specification
├── plan.md              # This file
├── quickstart.md        # Integration test scenario
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
src/
└── components/
    └── chat/
        └── chat-sidebar.tsx   # MODIFY: Add 知识库管理 link at bottom
```

**Structure Decision**: No new files. Single modification to the existing `ChatSidebar` component in `src/components/chat/chat-sidebar.tsx`.

## Implementation Approach

### Change Details

Modify `src/components/chat/chat-sidebar.tsx`:

1. Import `Link` from `next/link`
2. Add a bottom section after the scrollable conversation list (`flex-1 overflow-y-auto` div)
3. The bottom section contains:
   - A `border-t border-gray-200` divider (visual separation from conversation list)
   - A `Link` to `/upload` with a folder/document SVG icon and "知识库管理" text label
   - Styled consistently with the sidebar theme (gray-50 bg, hover state)

### Design Decisions

- **Use `Link` not `<a>`**: Next.js client-side navigation for fast page transitions
- **Position at bottom**: Using flex layout — conversation list takes `flex-1`, knowledge base link sits below it
- **Icon choice**: Folder icon (SVG inline) — simple, universally recognized
- **No new component**: The link is simple enough to inline in the sidebar; extracting a component would be over-engineering

## Complexity Tracking

No constitution violations. No complexity justifications needed.
