# Quickstart: Sidebar Knowledge Base Drawer

## Verification Steps

1. Start the dev server: `pnpm dev`
2. Navigate to `/chat`

### Desktop (≥1024px)

3. The sidebar is visible. At the bottom, verify "知识库管理" entry with folder icon is present.
4. Click "知识库管理" — verify a drawer slides in from the right with a semi-transparent backdrop.
5. The drawer shows a "知识库管理" header with a close (×) button.
6. Below the header: an upload area (drag-and-drop zone) and a document list.
7. Click the backdrop (outside the drawer) — verify the drawer closes.
8. Reopen the drawer — verify the chat messages behind it are unchanged.

### Upload within Drawer

9. Open the drawer, upload a PDF file.
10. Verify upload progress appears within the drawer.
11. After processing completes, verify the document appears in the list.
12. Delete a document — verify it is removed from the list.
13. Close the drawer — verify chat conversation state is preserved (messages, scroll position).

### Mobile (<1024px)

14. Tap the menu toggle to open the sidebar overlay.
15. Tap "知识库管理" — verify the drawer opens (full-width on mobile).
16. Verify upload and document list functionality works the same as desktop.
17. Close the drawer and verify return to chat.

## Expected Behavior

- The drawer slides in smoothly from the right (~300ms transition)
- Clicking the backdrop or the close button closes the drawer
- Chat streaming continues uninterrupted while the drawer is open
- Document list refreshes automatically after upload/delete operations
- The `/upload` standalone page still works independently
