## 1. Project Setup

- [x] 1.1 Initialize TypeScript project with package.json, tsconfig.json, and install dependencies (ai, @ai-sdk/anthropic, zod, tsx)
- [x] 1.2 Create project directory structure: src/router/, src/handlers/, src/types/, src/config/, src/utils/
- [x] 1.3 Create .env.example with ANTHROPIC_API_KEY placeholder and add .env to .gitignore

## 2. Type Definitions

- [x] 2.1 Define core types in src/types/index.ts: Intent, RouterResult, Handler interface, RouteEntry, ConversationContext, Message

## 3. Configuration

- [x] 3.1 Create src/config/prompts.ts with all prompt templates: LLM router classification prompt, and system prompts for each of the 5 handlers
- [x] 3.2 Create src/config/routes.ts with route table configuration mapping Intent to handler descriptions

## 4. Router Layer

- [x] 4.1 Implement src/router/rule-router.ts: keyword pattern matching rules for bug_fix, code_explain, code_generate, doc_search; returns RouterResult or null
- [x] 4.2 Implement src/router/llm-router.ts: uses generateObject with Zod schema to classify intent via Claude; temperature 0; returns RouterResult
- [x] 4.3 Implement src/router/router-pipeline.ts: layered pipeline that runs rule router first, falls back to LLM router, forces unclear intent when confidence < 0.7

## 5. Expert Handlers

- [x] 5.1 Implement src/handlers/code-explainer.ts: structured explanation output (overview → walkthrough → key points)
- [x] 5.2 Implement src/handlers/bug-detective.ts: diagnostic output (symptom → root cause → fix → prevention)
- [x] 5.3 Implement src/handlers/code-generator.ts: code generation with higher temperature (0.3-0.5), output includes requirement confirmation + code + usage
- [x] 5.4 Implement src/handlers/doc-searcher.ts: simulated RAG flow, answer + source references
- [x] 5.5 Implement src/handlers/clarifier.ts: generates 1-2 clarifying questions instead of answering directly

## 6. Utilities

- [x] 6.1 Implement src/utils/logger.ts: route decision logging with input preview, routedBy, intent, confidence, handler name, latency ms
- [x] 6.2 Implement debug panel formatter: visually distinct CLI output showing routing decision chain

## 7. Main Entry & Conversation Loop

- [x] 7.1 Implement src/index.ts: assemble routing pipeline, register handlers in route table, start interactive readline loop
- [x] 7.2 Implement conversation context management: maintain message history, pass to handlers
- [x] 7.3 Implement Clarifier re-routing flow: detect clarifier response, re-enter pipeline with full context

## 8. Testing & Demo

- [x] 8.1 Create test/fixtures/ with sample inputs for each intent category (at least 3 per category)
- [x] 8.2 Implement test/router.test.ts: routing accuracy tests verifying rule router matches and LLM router classifications
- [ ] 8.3 Manual demo verification: run through the 4 demo scenarios from the documentation (rule match, LLM classify, low confidence → clarify, clarifier re-route)
