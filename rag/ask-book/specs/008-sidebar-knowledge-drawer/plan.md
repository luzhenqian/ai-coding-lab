# Implementation Plan: Sidebar Knowledge Base Drawer

**Branch**: `008-sidebar-knowledge-drawer` | **Date**: 2026-03-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-sidebar-knowledge-drawer/spec.md`

## Summary

Replace the sidebar "知识库管理" `Link` (which navigates to `/upload`) with a button that opens a right-side drawer panel. The drawer reuses the existing `UploadZone`, `UploadProgress`, and `DocumentList` components from feature 005, allowing users to manage documents without leaving the chat page.

## Technical Context

**Language/Version**: TypeScript (strict mode) on Node.js 20+
**Primary Dependencies**: Next.js 16+ (App Router), React 19, Tailwind CSS
**Storage**: N/A (no data changes — reuses existing APIs)
**Testing**: Manual verification
**Target Platform**: Web (320px–1920px viewports)
**Project Type**: Web application (Next.js)
**Performance Goals**: Drawer open/close animation should feel instant (<200ms)
**Constraints**: Must not affect chat state; reuse existing components without modification
**Scale/Scope**: 1 new component (drawer), 2 modified files (sidebar + chat page)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. RAG Accuracy First | N/A | No retrieval/generation logic involved |
| II. Streaming UX | PASS | Drawer does not interrupt streaming chat responses |
| III. Type Safety | PASS | No new types needed; reusing existing component interfaces |
| IV. Simple Architecture | PASS | One new component (drawer container), modifying existing sidebar. No new abstractions. Client Component required for interactivity (useState for open/close). |
| V. Reproducible Local Dev | N/A | No infrastructure changes |

**Technology Constraints**: PASS — Using Tailwind CSS for drawer styling/animation. No new dependencies.

**Gate Result**: PASS — No violations.

## Project Structure

### Documentation (this feature)

```text
specs/008-sidebar-knowledge-drawer/
├── spec.md              # Feature specification
├── plan.md              # This file
├── quickstart.md        # Verification steps
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── chat/
│   │   └── chat-sidebar.tsx       # MODIFY: Replace Link with button + onOpenKnowledge callback
│   └── knowledge-drawer.tsx       # NEW: Drawer container component
└── app/
    └── chat/
        └── page.tsx               # MODIFY: Add drawer state + render KnowledgeDrawer
```

**Structure Decision**: One new component file for the drawer. Two existing files modified to wire up the drawer open/close state.

## Implementation Approach

### Component Design

**`KnowledgeDrawer`** (`src/components/knowledge-drawer.tsx`):
- Props: `open: boolean`, `onClose: () => void`
- Renders a fixed-position overlay with:
  - Semi-transparent backdrop (click to close)
  - Right-side panel (w-96 on desktop, full-width on mobile)
  - Slide-in/out CSS transition via Tailwind
  - Header with "知识库管理" title and close button
  - Body: reuses `UploadZone`/`UploadProgress`/`DocumentList` with same state pattern as `/upload` page
- Uses `"use client"` directive (interactive component)

**`ChatSidebar`** modification:
- Remove `Link` import (no longer needed)
- Replace the `<Link href="/upload">` with a `<button>` that calls a new `onOpenKnowledge` prop
- Add `onOpenKnowledge: () => void` to `ChatSidebarProps`

**`ChatPage`** modification:
- Add `knowledgeOpen` state (`useState<boolean>(false)`)
- Pass `onOpenKnowledge={() => setKnowledgeOpen(true)}` to `ChatSidebar`
- Render `<KnowledgeDrawer open={knowledgeOpen} onClose={() => setKnowledgeOpen(false)} />`

### Design Decisions

- **Drawer not modal**: Right-side drawer is better for list content and feels natural from sidebar entry
- **Reuse upload page pattern**: Copy the state management pattern (uploadDocId, refreshKey) into the drawer — don't abstract into a shared hook (YAGNI)
- **CSS transitions via Tailwind**: `translate-x-full` ↔ `translate-x-0` with `transition-transform duration-300` — no animation library needed
- **Backdrop scroll lock**: Not needed — chat page doesn't scroll independently; the drawer overlay is sufficient
- **Keep `/upload` page**: The standalone upload page remains; the drawer is an additional access point

## Complexity Tracking

No constitution violations. No complexity justifications needed.
