# Research: Code Syntax Highlighting

## R-001: Streamdown Code Highlighting Plugin

**Decision**: Use `@streamdown/code` package (Shiki-based) as the highlighting engine

**Rationale**: Streamdown v2.4.0 already provides `<Streamdown>` component used in the project. The code highlighting is provided by a separate package `@streamdown/code` which integrates Shiki. This is purpose-built for streaming AI responses — handles incomplete code fences, progressive highlighting, and copy button state during streaming. No need for separate react-syntax-highlighter, Prism, or highlight.js.

**Alternatives considered**:
- `react-syntax-highlighter` — Known re-render performance bug (full re-parse on every render), devastating for streaming. Stagnant maintenance.
- `react-shiki` — Solid modern alternative with throttled highlighting, but Streamdown already bundles equivalent functionality with better streaming chunk handling.
- `Prism.js` — Lightweight but development stalled. Synchronous highlighting blocks rendering.
- `highlight.js` — Simple but lower quality than Shiki, synchronous.

## R-002: Theme Configuration

**Decision**: Use `shikiTheme` prop with tuple `["github-light", "github-dark"]` for dual theme support

**Rationale**: Streamdown accepts a `shikiTheme` prop as a `[lightTheme, darkTheme]` tuple. The `github-light` / `github-dark` themes are clean, widely recognized, and work well with the app's neutral oklch color system. Shiki automatically applies the correct theme based on the `.dark` CSS class on the document.

**Alternatives considered**:
- `catppuccin-latte` / `catppuccin-mocha` — More colorful but may clash with the app's minimalist design
- Custom theme objects — Overkill for the current needs; can be added later
- Single theme with CSS override — Shiki's dual theme approach is cleaner and first-class supported

## R-003: Required Setup Steps

**Decision**: Three setup steps needed:

1. **Install**: `pnpm add @streamdown/code`
2. **CSS imports**: Add `import "streamdown/styles.css"` and `@source` directives in globals.css
3. **Component config**: Pass `plugins={{ code }}`, `shikiTheme`, `controls`, and `isAnimating` props

**Rationale**: Streamdown separates the code plugin into `@streamdown/code` for tree-shaking. The styles.css provides animation keyframes. The `@source` directive is required for Tailwind v4 to scan Streamdown's class names.

## R-004: Built-in Code Block Chrome

**Decision**: Use Streamdown's built-in `CodeBlockHeader` (language label) and `CodeBlockCopyButton`

**Rationale**: Streamdown provides code block header with language label and copy button out of the box when the code plugin is enabled. The `controls` prop allows granular control (`{ code: { copy: true, download: false } }`). Copy button automatically disables during streaming via `isAnimating` prop.

## R-005: Streaming Handling

**Decision**: Use `isAnimating` prop to manage streaming state for code blocks

**Rationale**: Streamdown includes `remend` (patches unterminated code fences for partial rendering) and `useIsCodeFenceIncomplete()` hook. The `isAnimating` prop disables copy during streaming. These handle all edge cases: partial fences, incomplete blocks, progressive highlighting.
