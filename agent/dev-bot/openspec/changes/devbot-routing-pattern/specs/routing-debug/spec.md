## ADDED Requirements

### Requirement: Route decision logging
The system SHALL log every routing decision with: truncated user input (first 100 chars), whether the rule layer matched, LLM classification result (if invoked), confidence score, selected handler name, and total routing latency in milliseconds.

#### Scenario: Log entry for rule-routed request
- **WHEN** a request is routed by the rule layer
- **THEN** log entry shows `routedBy: 'rule'`, matched intent, confidence 0.95, handler name, and latency

#### Scenario: Log entry for LLM-routed request
- **WHEN** a request is routed by the LLM layer
- **THEN** log entry shows `routedBy: 'llm'`, classified intent, confidence score, reasoning, handler name, and latency

### Requirement: Debug panel output in CLI
The system SHALL display a formatted debug panel in the terminal after each routing decision, showing the routing process: rule layer result → LLM classification result → confidence → selected handler. This SHALL be visually distinct from the handler's response output (e.g., using colored/boxed formatting).

#### Scenario: Debug panel shows routing flow
- **WHEN** a request completes routing and handler execution
- **THEN** terminal displays a debug section above the response showing the routing decision chain

#### Scenario: Debug panel can be toggled
- **WHEN** user starts the CLI with or without a debug flag
- **THEN** debug panel display is controlled by the flag (shown by default for educational purposes)
