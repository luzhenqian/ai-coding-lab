# Quickstart: Persist Workflow Data

## What changes

1. **conversation-store.ts** — Add `type` and `workflowState` fields to the schema. Add helper functions for creating/updating workflow conversations.

2. **useWorkflow.ts** — Accept optional initial state for restoration. Add `onStateChange` callback to expose state changes. Remove direct localStorage usage (persistence moves to parent).

3. **page.tsx** — Show sidebar in workflow mode. Manage workflow conversations in the same list as chat conversations. Pass state change handler to WorkflowPanel. Switch mode automatically when selecting a workflow conversation.

4. **WorkflowPanel.tsx** — Accept optional initial state and `onStateChange` prop. Forward these to useWorkflow hook.

5. **ConversationList.tsx** — Display a visual indicator for workflow conversations (icon or style).

## Implementation order

1. Extend `conversation-store.ts` schema (backward-compatible)
2. Refactor `useWorkflow.ts` to support external state init + callback
3. Update `WorkflowPanel.tsx` to accept new props
4. Update `page.tsx` to manage workflow conversations
5. Update `ConversationList.tsx` for workflow visual indicator
