# Quickstart: Sidebar Knowledge Base Entry

## Verification Steps

1. Start the dev server: `pnpm dev`
2. Navigate to `/chat`
3. **Desktop (≥1024px)**: The sidebar is visible. Scroll to the bottom — verify "知识库管理" entry is visible with a folder icon, separated from the conversation list by a divider line.
4. Click "知识库管理" — verify navigation to `/upload` page showing the document management interface.
5. Use browser back button — verify return to `/chat`.
6. **Mobile (<1024px)**: Tap the menu toggle to open the sidebar overlay. Verify "知识库管理" entry is visible and clickable. Tap it — verify navigation to `/upload`.

## Expected Behavior

- The "知识库管理" entry is always at the bottom of the sidebar, regardless of conversation count
- It does not scroll with the conversation list — it stays pinned at the bottom
- Clicking it navigates to `/upload` via client-side navigation (no full page reload)
- The entry has a hover state consistent with other sidebar elements
