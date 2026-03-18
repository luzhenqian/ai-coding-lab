# Quickstart: Code Syntax Highlighting

## Prerequisites

- Node.js 18+, pnpm installed
- Project dependencies installed (`pnpm install`)

## Setup

1. Install the code highlighting plugin:

```bash
pnpm add @streamdown/code
```

2. The feature modifies two files:
   - `components/chat/message-bubble.tsx` — configure Streamdown with code plugin and themes
   - `app/globals.css` — add Streamdown CSS imports and Tailwind source directives

## Verification

1. Start the dev server: `pnpm dev`
2. Open a conversation and send: "Write a JavaScript function to sort an array"
3. Verify:
   - Code block has colored syntax (keywords, strings, etc.)
   - Language label ("javascript") appears in block header
   - Copy button appears (hover on desktop)
   - Toggle dark mode — code block theme updates accordingly
   - Inline code (backtick) has distinct background and monospace font
