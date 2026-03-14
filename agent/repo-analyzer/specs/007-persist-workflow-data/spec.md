# Feature Specification: Persist Workflow Data in Conversation History

**Feature Branch**: `007-persist-workflow-data`
**Created**: 2026-03-14
**Status**: Draft
**Input**: User description: "Persist Workflow analysis data in conversation history so it survives page refreshes"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Workflow Data Survives Page Refresh (Priority: P1)

A user runs a workflow analysis on a GitHub repository. After the analysis completes (or is in any phase), they refresh the page or close and reopen the browser. When they return, the workflow panel shows the same state it was in before — including all step statuses, the analyzed repository info, and the generated report.

**Why this priority**: This is the core problem. Without persistence, users lose their entire analysis on refresh, wasting time and API calls.

**Independent Test**: Run a complete workflow analysis, refresh the page, and verify the workflow panel restores with all steps marked complete and the report visible.

**Acceptance Scenarios**:

1. **Given** a completed workflow analysis with a generated report, **When** the user refreshes the page, **Then** the workflow panel displays the report and all steps show their completed status.
2. **Given** a workflow suspended at the human-approval step, **When** the user refreshes the page, **Then** the workflow panel shows the suspended state with the repo summary card ready for approval.
3. **Given** a workflow that ended in an error, **When** the user refreshes the page, **Then** the workflow panel shows the error state with the error message.

---

### User Story 2 - Workflow Runs as Conversations (Priority: P1)

Each workflow run is saved as a conversation entry in the sidebar conversation list. Users can switch between chat conversations and past workflow runs from the same list. Selecting a past workflow run restores the workflow panel with its saved state.

**Why this priority**: Without associating workflow runs with the conversation list, there is no way for users to access historical workflow results. This is equally critical to persistence itself.

**Independent Test**: Run a workflow, switch to chat mode, then click the workflow conversation in the sidebar to verify it restores the workflow view.

**Acceptance Scenarios**:

1. **Given** a user starts a workflow analysis, **When** the workflow begins, **Then** a new conversation entry appears in the sidebar with a title derived from the repository name (e.g., "Workflow: owner/repo").
2. **Given** multiple past workflow runs exist in the sidebar, **When** the user clicks on one, **Then** the application switches to workflow mode and displays that run's saved state.
3. **Given** a user is viewing a past workflow run, **When** they click "New Conversation", **Then** they return to a fresh chat or workflow input.

---

### User Story 3 - Delete Workflow History (Priority: P2)

Users can delete past workflow runs from the conversation list, just like they can delete chat conversations.

**Why this priority**: Provides housekeeping capability but is not essential for the core persistence feature.

**Independent Test**: Delete a workflow conversation entry and verify it is removed from the list and its data is cleaned up.

**Acceptance Scenarios**:

1. **Given** a past workflow run in the conversation list, **When** the user deletes it, **Then** it is removed from the list and its persisted data is cleared.

---

### Edge Cases

- What happens when the user refreshes during an actively running workflow (mid-execution)?
  - The workflow should show as interrupted/error since the server-side run may have continued or failed independently.
- What happens when storage quota is exceeded due to large reports?
  - The system should handle the error gracefully and notify the user that storage is full.
- What happens when a user tries to resume a suspended workflow from a past run but the server-side run has expired?
  - The system should detect the stale state and show an appropriate error message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST persist workflow run state (phase, steps, repoInfo, repoTree, report, error) alongside conversation data so it survives page refreshes.
- **FR-002**: System MUST create a conversation entry for each workflow run, identifiable as a workflow type (distinct from chat conversations).
- **FR-003**: System MUST restore the workflow panel to its last known state when a user returns to a workflow conversation.
- **FR-004**: System MUST save the generated report content so it can be displayed without re-running the analysis.
- **FR-005**: System MUST allow users to delete workflow conversation entries and their associated data.
- **FR-006**: System MUST update the persisted workflow state as each step progresses (not only at completion).
- **FR-007**: System MUST display workflow conversations in the sidebar with a distinguishable title format (e.g., "Workflow: owner/repo").

### Key Entities

- **WorkflowConversation**: A conversation entry of type "workflow" that stores the workflow run state including runId, phase, steps array, repoInfo, repoTree, report text, and error info.
- **Conversation (existing)**: Extended with a type field to distinguish between "chat" and "workflow" entries.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can refresh the page at any workflow phase and see the workflow restored to its last saved state within 1 second.
- **SC-002**: 100% of completed workflow reports are recoverable after page refresh without re-running the analysis.
- **SC-003**: Users can access any past workflow run from the conversation sidebar and view its results.
- **SC-004**: Workflow data persistence adds no noticeable delay (< 200ms) to the user experience during workflow execution.

## Assumptions

- The existing conversation storage mechanism has sufficient capacity for workflow data (reports are typically under 50KB).
- The existing conversation list UI can be extended to support a "workflow" conversation type without major redesign.
- Server-side workflow state in the database is not relied upon for frontend persistence — the frontend saves its own snapshot of the workflow state.
