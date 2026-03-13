# Research: Conversation Rename and Delete

**Feature**: 011-conversation-manage
**Date**: 2026-03-13

## Research Summary

This is a straightforward CRUD feature with no significant unknowns. All technologies are already in use in the project.

## Decisions

### 1. Inline Editing Pattern

**Decision**: Use a controlled `<input>` element that replaces the conversation title text when in rename mode. State managed locally in `ChatSidebar` component.

**Rationale**: Simplest approach using standard React patterns. No external library needed. The input appears in place of the title button, with the current title pre-filled and selected.

**Alternatives considered**:
- `contentEditable` div: More complex to manage, harder to validate/limit length
- Modal/dialog for rename: Spec explicitly requires inline editing

### 2. Delete Confirmation

**Decision**: Use native `window.confirm()` dialog.

**Rationale**: Spec explicitly states "consistent with existing document delete pattern" and "browser's native confirm dialog for simplicity." Already used in the document delete flow.

**Alternatives considered**:
- Custom modal component: Over-engineering for a simple yes/no confirmation
- Toast with undo: Spec says deletion is permanent, no undo mechanism

### 3. Action Trigger UI

**Decision**: Ellipsis (⋯) button that appears on hover for each conversation item. On mobile, always visible.

**Rationale**: Common pattern in chat applications (Slack, ChatGPT, etc.). Keeps the sidebar clean while providing access to actions. A simple dropdown or inline buttons appear on click.

**Alternatives considered**:
- Right-click context menu: Less discoverable, not mobile-friendly
- Always-visible buttons: Clutters the sidebar

### 4. API Design for Rename

**Decision**: Add PATCH handler to existing `/api/conversations/[id]/route.ts` with `{ title: string }` body validated by Zod.

**Rationale**: RESTful convention (PATCH for partial update). Endpoint file already exists with GET and DELETE handlers. Zod validation is required by constitution (Type Safety principle).

**Alternatives considered**:
- PUT with full conversation object: Over-engineering for a single-field update
- Server action: Would work but API route is more consistent with existing patterns

### 5. Error Handling

**Decision**: Use `window.alert()` for error messages on failed rename/delete operations. Revert optimistic UI changes on failure.

**Rationale**: Spec requires user-friendly error messages. Native alert is consistent with native confirm for delete. Simple and effective for a single-user app.

**Alternatives considered**:
- Toast notifications: Would require adding a toast library or building one — over-engineering
- Inline error messages: More complex UI state management for rare error cases
