# Research: Persist Workflow Data

## Decision 1: Storage mechanism for workflow data

**Decision**: Extend existing `conversation-store.ts` (localStorage) to support a `type` field distinguishing `'chat'` vs `'workflow'` conversations, and add an optional `workflowState` field to store workflow-specific data.

**Rationale**: The project already uses localStorage for chat persistence. Using the same mechanism keeps the architecture simple and consistent. No new dependencies needed. The workflow state (steps, repoInfo, report) fits well within localStorage limits (reports are typically < 50KB).

**Alternatives considered**:
- Separate localStorage key for workflow data — rejected because it fragments the conversation list and requires separate management logic
- LibSQL server-side storage — rejected because it adds complexity and the frontend already owns the conversation list; server-side Mastra storage is for workflow engine state, not UI display

## Decision 2: Conversation type discrimination

**Decision**: Add a `type: 'chat' | 'workflow'` field to `StoredConversation` schema. Default to `'chat'` for backward compatibility with existing data.

**Rationale**: A simple discriminator field is the most straightforward way to distinguish conversation types. Using `.default('chat')` in zod ensures existing conversations without the field are treated as chat conversations.

**Alternatives considered**:
- Separate storage arrays for chat vs workflow — rejected due to unnecessary duplication of CRUD logic
- Using a naming convention in titles — rejected as fragile and not type-safe

## Decision 3: Workflow state shape for persistence

**Decision**: Store workflow state as a `workflowState` object within the conversation, containing: `runId`, `phase`, `steps`, `url`, `repoInfo`, `repoTree`, `report`, `error`.

**Rationale**: This captures everything needed to fully restore the WorkflowPanel UI to any phase. The `steps` array is small (4 items). The `report` is the largest field but typically under 50KB of markdown.

**Alternatives considered**:
- Store only the runId and re-fetch from server — rejected because the server-side state may have expired and it adds latency on restore

## Decision 4: Sidebar behavior in workflow mode

**Decision**: Show the ConversationList sidebar in both chat and workflow modes. Workflow conversations appear alongside chat conversations with a visual indicator (icon or prefix).

**Rationale**: Currently the sidebar is hidden in workflow mode. Showing it enables users to switch between workflow runs and chat conversations. This is essential for the feature — without the sidebar visible in workflow mode, users cannot access past workflow runs.

**Alternatives considered**:
- Keep sidebar hidden in workflow mode — rejected because it contradicts the core feature requirement of accessing past workflow runs
- Separate tabs for chat vs workflow — rejected as over-engineering; a unified list is simpler

## Decision 5: useWorkflow hook refactoring

**Decision**: Modify `useWorkflow` to accept an optional initial state and expose a state snapshot callback. The hook will call a provided `onStateChange` callback whenever its state changes, allowing `page.tsx` to persist the state via `conversation-store`.

**Rationale**: This mirrors the existing `onMessagesChange` pattern used by `ChatPanel`, keeping the architecture consistent. The hook remains focused on state management while persistence is handled by the parent.

**Alternatives considered**:
- Have useWorkflow persist directly — rejected because it couples the hook to a specific storage mechanism and breaks the established pattern
