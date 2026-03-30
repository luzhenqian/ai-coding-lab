## ADDED Requirements

### Requirement: Conversation history management
The system SHALL maintain a conversation history as an array of messages for the current session. Each message SHALL record the role (user/assistant), content, and associated routing metadata. The history SHALL be passed to handlers as context.

#### Scenario: Messages accumulate in session
- **WHEN** user sends multiple messages in a session
- **THEN** all previous messages are available in the conversation context passed to the handler

### Requirement: Clarifier re-routing with context
When the Clarifier triggers a re-routing flow, the system SHALL include the full conversation context (original vague input + clarifying questions + user's clarified response) when re-entering the routing pipeline. This allows the LLM router to make a more informed classification.

#### Scenario: Context improves routing confidence after clarification
- **WHEN** user's initial input was routed to Clarifier (confidence < 0.7), user responds with clarification
- **THEN** system re-routes with full context and achieves higher confidence classification
