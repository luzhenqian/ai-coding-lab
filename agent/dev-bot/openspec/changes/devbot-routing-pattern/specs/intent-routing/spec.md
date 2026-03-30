## ADDED Requirements

### Requirement: Rule-based routing for strong signal inputs
The system SHALL provide a rule-based router that checks user input against predefined keyword patterns and code block markers. When a strong signal is detected, the system SHALL immediately return a routing result with confidence 0.95, bypassing the LLM router.

#### Scenario: Bug-related keywords trigger bug_fix intent
- **WHEN** user input contains keywords like "error", "TypeError", "报错", "traceback", "bug", "Cannot read properties", "undefined is not"
- **THEN** system routes to `bug_fix` intent with `routedBy: 'rule'` and `confidence: 0.95`

#### Scenario: Explanation keywords with code trigger code_explain intent
- **WHEN** user input contains explanation keywords ("explain", "解释", "什么意思", "怎么理解", "讲讲") AND contains a code block or code reference
- **THEN** system routes to `code_explain` intent with `routedBy: 'rule'` and `confidence: 0.95`

#### Scenario: Generation keywords trigger code_generate intent
- **WHEN** user input contains generation keywords ("generate", "生成", "帮我写", "创建一个", "实现一个")
- **THEN** system routes to `code_generate` intent with `routedBy: 'rule'` and `confidence: 0.95`

#### Scenario: Documentation keywords trigger doc_search intent
- **WHEN** user input contains documentation keywords ("文档", "怎么用", "API", "用法", "documentation")
- **THEN** system routes to `doc_search` intent with `routedBy: 'rule'` and `confidence: 0.95`

#### Scenario: No rule matches returns null
- **WHEN** user input does not match any predefined keyword pattern
- **THEN** rule router returns `null`, allowing the LLM router to process the input

### Requirement: LLM-based routing for ambiguous inputs
The system SHALL provide an LLM router that uses Claude to classify user intent into one of five categories: `code_explain`, `bug_fix`, `code_generate`, `doc_search`, or `unclear`. The LLM SHALL output structured JSON with intent, confidence (0-1), and reasoning fields. Temperature SHALL be set to 0 for deterministic classification.

#### Scenario: LLM classifies ambiguous natural language input
- **WHEN** rule router returns null AND user input is "这段代码的递归逻辑我没太看懂，能给我讲讲它到底在做什么吗？"
- **THEN** LLM router classifies as `code_explain` with confidence >= 0.8 and `routedBy: 'llm'`

#### Scenario: LLM returns low confidence for vague input
- **WHEN** user input is vague like "这个东西能不能优化一下"
- **THEN** LLM router returns `unclear` intent or a confidence below threshold

### Requirement: Layered routing pipeline
The system SHALL implement a pipeline that runs rule router first, then LLM router only if rules did not match. When LLM confidence is below 0.7, the system SHALL force-route to the `unclear` intent (Clarifier handler).

#### Scenario: Rule match short-circuits LLM call
- **WHEN** rule router returns a match
- **THEN** pipeline returns the rule result without invoking the LLM router

#### Scenario: Low confidence forces Clarifier routing
- **WHEN** LLM router returns confidence < 0.7
- **THEN** pipeline overrides the intent to `unclear` and routes to Clarifier

#### Scenario: High confidence LLM result is used directly
- **WHEN** LLM router returns confidence >= 0.7
- **THEN** pipeline uses the LLM result intent and routes to the corresponding handler

### Requirement: Route dispatch via route table
The system SHALL maintain a route table mapping each `Intent` to its corresponding `Handler`. The route table SHALL support dynamic registration of new handlers. After routing, the system SHALL invoke the matched handler's `handle` method with the user input and conversation context.

#### Scenario: Intent maps to correct handler
- **WHEN** routing result intent is `bug_fix`
- **THEN** system invokes the Bug Detective handler

#### Scenario: Unknown intent falls back to Clarifier
- **WHEN** routing result intent is `unclear`
- **THEN** system invokes the Clarifier handler
