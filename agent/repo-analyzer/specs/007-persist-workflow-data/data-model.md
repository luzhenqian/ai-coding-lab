# Data Model: Persist Workflow Data

## Entity: StoredConversation (extended)

Existing entity extended with workflow support.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | Yes | Unique identifier |
| title | string | Yes | Display title |
| type | 'chat' \| 'workflow' | Yes | Conversation type discriminator (default: 'chat') |
| createdAt | string (ISO) | Yes | Creation timestamp |
| updatedAt | string (ISO) | Yes | Last update timestamp |
| messages | StoredMessage[] | Yes | Chat messages (empty for workflow type) |
| workflowState | WorkflowState \| null | No | Workflow-specific state (null for chat type) |

**Backward compatibility**: Existing conversations without `type` field default to `'chat'`. Existing conversations without `workflowState` default to `null`.

## Entity: WorkflowState (new)

Captures the full state of a workflow run for UI restoration.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| runId | string | Yes | Mastra workflow run identifier |
| url | string | Yes | GitHub URL that was analyzed |
| phase | WorkflowPhase | Yes | Current workflow phase |
| steps | StepInfo[] | Yes | 4-element array of step statuses |
| repoInfo | GitHubRepo \| null | No | Repository metadata (after fetch) |
| repoTree | RepoTree \| null | No | Repository directory tree (after fetch) |
| report | string | No | Generated markdown report (after generation) |
| error | string | No | Error message (if phase is error) |

## Entity: WorkflowPhase (existing, unchanged)

`'idle' | 'running' | 'suspended' | 'streaming' | 'done' | 'error' | 'cancelled'`

## Entity: StepInfo (existing, unchanged)

| Field | Type | Description |
|-------|------|-------------|
| id | string | Step identifier (e.g., 'parse-url') |
| label | string | Display label (e.g., '解析地址') |
| status | StepStatus | 'waiting' \| 'running' \| 'success' \| 'failed' \| 'suspended' \| 'cancelled' |

## State Transitions

```
idle → running (user submits URL)
running → suspended (workflow reaches HITL)
running → error (workflow fails)
suspended → streaming (user approves)
suspended → cancelled (user cancels)
streaming → done (report complete)
streaming → error (report generation fails)
```

## Validation Rules

- `type === 'workflow'` conversations MUST have a non-null `workflowState`
- `type === 'chat'` conversations MUST have `workflowState` as null/undefined
- `workflowState.steps` MUST always contain exactly 4 elements
- `workflowState.runId` MUST be non-empty
