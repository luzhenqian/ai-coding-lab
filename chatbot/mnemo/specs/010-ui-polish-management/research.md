# Research: UI Polish for Memory & Document Management

## Decision 1: Category Selector Component Approach

**Decision**: Use a segmented button group (inline styled `<button>` elements) instead of a custom Select component.

**Rationale**:
- Only 3 fixed options - a segmented control is more intuitive and visually informative than a dropdown
- Each category already has color coding in the memory list (blue/green/purple) - reuse those colors
- No need to install additional dependencies; plain buttons with Tailwind styling
- Follows Teaching First principle - simpler to understand than a Select primitive

**Alternatives considered**:
- @base-ui/react Select primitive: Overkill for 3 fixed options, adds complexity
- Radio button group: Less visually appealing, doesn't match design system
- Native `<select>` with custom styling: Limited cross-browser styling control

## Decision 2: Drag-and-Drop Upload Implementation

**Decision**: Use native HTML5 Drag and Drop API with React event handlers (onDragOver, onDragLeave, onDrop) plus a hidden file input for click-to-browse.

**Rationale**:
- HTML5 DnD API is well-supported in all modern browsers
- No additional dependency needed (no react-dropzone, etc.)
- Keeps bundle size minimal and code explicit (Teaching First)
- Hidden `<input type="file">` triggered by click provides the browse fallback

**Alternatives considered**:
- react-dropzone: Additional dependency; this project prefers minimal deps
- Native `<input>` with drag support: File inputs don't support custom drag-over styling

## Decision 3: Delete Confirmation Pattern

**Decision**: Use existing AlertDialog component from `components/ui/alert-dialog.tsx` following the exact pattern in `conversation-list.tsx`.

**Rationale**:
- AlertDialog component already exists and is used for conversation deletion
- Proven pattern with proper accessibility (focus trapping, escape to close)
- Consistent UX across the application

**Alternatives considered**:
- Browser `window.confirm()`: Native, ugly, inconsistent with design system
- Custom modal: Unnecessary when AlertDialog already exists

## Decision 4: Chunk Count Auto-Refresh

**Decision**: Use `setInterval` polling (every 3 seconds) for documents with "processing" status. Stop polling when no documents are processing.

**Rationale**:
- Simple and reliable approach
- The backend uses `after()` for async processing - no WebSocket/SSE endpoint available
- 3-second interval balances responsiveness with API load
- Auto-stop when all documents are ready prevents unnecessary polling

**Alternatives considered**:
- Server-Sent Events: Would require new API endpoint; overkill for this use case
- Manual refresh button: Poor UX; user shouldn't have to manually check
- Single delayed fetch: Processing time varies; could miss the update
