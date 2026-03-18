# Research: Debug Panel Drag Resize & Markdown Rendering

## Resize with Pointer Events

- **Decision**: Use native `onPointerDown` on a resize handle div, then `pointermove`/`pointerup` on `document` to track drag
- **Rationale**: Pointer events unify mouse and touch. Adding listeners to `document` ensures drag continues even when cursor leaves the handle. `setPointerCapture` ensures reliable tracking.
- **Alternatives considered**: CSS `resize` property (no programmatic control, limited styling), react-resizable library (unnecessary dependency for one use case)

## Markdown Rendering in Debug Panel

- **Decision**: Reuse `Streamdown` component with `@streamdown/code` plugin, same as `message-bubble.tsx`
- **Rationale**: Already installed and proven in the project. Consistent rendering. Handles code blocks with Shiki syntax highlighting.
- **Alternatives considered**: `react-markdown` (not installed, would add ~50KB), raw HTML rendering (security risk)

## Height Persistence

- **Decision**: `sessionStorage` with key `debug-panel-height`, default 300px, min 120px, max 80vh
- **Rationale**: Simple, no state management needed. Session-scoped matches the spec requirement.
- **Alternatives considered**: localStorage (persists too long), React context (unnecessary complexity), URL params (clutters URL)
