# Implementation Plan: Debug Panel Drag Resize & Markdown Rendering

**Branch**: `009-debug-panel-resize-markdown` | **Date**: 2026-03-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-debug-panel-resize-markdown/spec.md`

## Summary

Add drag-to-resize functionality and markdown rendering to the debug panel. The resize handle will be implemented with native pointer events (no new dependencies). Markdown rendering will reuse the existing Streamdown + @streamdown/code stack already used in message-bubble.tsx.

## Technical Context

**Language/Version**: TypeScript 5 / React 19 / Next.js 16.1.6
**Primary Dependencies**: Streamdown v2.4.0, @streamdown/code v1.1.0 (already installed), @base-ui/react Collapsible
**Storage**: sessionStorage for panel height persistence
**Testing**: Manual testing (no test framework configured)
**Target Platform**: Web browser (development mode only)
**Project Type**: web-service (Next.js app)
**Performance Goals**: Smooth 60fps drag interaction
**Constraints**: Dev-only feature, no production impact
**Scale/Scope**: Single component modification

## Constitution Check

*No constitution.md found — no gates to check.*

## Project Structure

### Documentation (this feature)

```text
specs/009-debug-panel-resize-markdown/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (N/A - no data model changes)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
components/chat/
├── debug-panel.tsx      # Modified: add resize handle + markdown rendering
└── chat-panel.tsx       # Modified: flex layout adjustment for resizable panel
```

**Structure Decision**: Single component modification. The debug-panel.tsx file gains a resize handle div at the top and swaps raw text for Streamdown markdown rendering. No new files needed.

## Design Decisions

### Resize Implementation
- **Decision**: Native pointer events (onPointerDown/onPointerMove/onPointerUp) with useRef for tracking drag state
- **Rationale**: No new dependency needed. Pointer events work on both mouse and touch. Simple enough for a single resize handle.
- **Alternatives rejected**: react-resizable (overkill for one handle), CSS resize property (limited control)

### Markdown Rendering
- **Decision**: Reuse Streamdown + @streamdown/code already used in message-bubble.tsx
- **Rationale**: Consistent rendering across the app, zero new dependencies
- **Alternatives rejected**: react-markdown (not installed, would add dependency), raw dangerouslySetInnerHTML with marked (security concerns)

### Height Persistence
- **Decision**: sessionStorage with key `debug-panel-height`
- **Rationale**: Persists across navigation within session but resets on new browser session, matching spec requirement

### Layout Approach
- **Decision**: Replace Collapsible wrapper with a fixed-bottom panel using explicit height state. Keep the toggle trigger.
- **Rationale**: Collapsible doesn't support height customization. A div with controlled height + overflow-y-auto achieves both collapse/expand and resize.
