# Tasks: GitHub 仓库智能分析助手

**Input**: Design documents from `/specs/001-repo-analyzer/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api-routes.md

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize Next.js project, install dependencies, configure tooling

- [x] T001 Initialize Next.js 16 project with TypeScript and App Router using `pnpm create next-app@latest . --ts --app --tailwind --eslint --src-dir --import-alias "@/*"`, configure `tsconfig.json` with `"strict": true`
- [x] T002 Install Mastra and AI SDK dependencies: `pnpm add @mastra/core @mastra/ai-sdk @mastra/libsql @ai-sdk/react @ai-sdk/openai @ai-sdk/anthropic ai zod`
- [x] T003 [P] Create `.env.example` with all environment variables and Chinese comments: `MODEL_PROVIDER`, `MODEL_NAME`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GITHUB_TOKEN`
- [x] T004 [P] Create project directory structure per plan.md: `src/mastra/agents/`, `src/mastra/tools/`, `src/mastra/workflows/steps/`, `src/lib/`, `src/app/components/`, `src/app/api/chat/`, `src/app/api/workflow/start/`, `src/app/api/workflow/resume/`, `src/app/api/workflow/report/`

**Checkpoint**: Project scaffolding complete, `pnpm dev` starts without errors.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared schemas, utility functions, and Mastra instance — MUST complete before any user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Define shared zod schemas in `src/lib/schemas.ts`: `GitHubRepoSchema`, `RepoTreeItemSchema`, `RepoTreeSchema`, `ParsedGitHubUrlSchema` per data-model.md, export TypeScript types with `z.infer`
- [x] T006 [P] Implement GitHub URL parser in `src/lib/url-parser.ts`: `parseGitHubUrl(input: string): ParsedGitHubUrl` function supporting 4 URL formats (full URL, `.git` suffix, no protocol, `owner/repo` shorthand), throw descriptive Chinese error for invalid input
- [x] T007 [P] Implement GitHub API client in `src/lib/github.ts`: `fetchRepoInfo(owner, repo)` and `fetchRepoTree(owner, repo, path?, depth?)` functions using native `fetch`, read `GITHUB_TOKEN` from env for optional auth header, try-catch with Chinese error messages for 404/403/rate-limit
- [x] T008 [P] Configure multi-model provider in `src/lib/model.ts`: use `createProviderRegistry` from `ai` package, register `openai` and `anthropic` providers, export `getModelId()` that reads `MODEL_PROVIDER` + `MODEL_NAME` from env, export registry
- [x] T009 Create Mastra instance in `src/mastra/index.ts`: import `Mastra` from `@mastra/core`, configure `LibSQLStore` with `url: 'file:./storage.db'`, register agent and workflows (import placeholders for now, will be filled in US1/US2)

**Checkpoint**: Foundation ready — `src/lib/` utilities importable, Mastra instance configured.

---

## Phase 3: User Story 1 — 自由对话模式（展示 Tool Calling）(Priority: P1) 🎯 MVP

**Goal**: Agent 通过 Tool Calling 自主调用 GitHub API，流式返回中文分析结果

**Independent Test**: 启动应用，在聊天界面输入 "帮我分析 https://github.com/vercel/next.js"，Agent 调用工具并返回分析

### Implementation for User Story 1

- [x] T010 [P] [US1] Create `getRepoInfo` tool in `src/mastra/tools/get-repo-info.ts`: use `createTool` with id `get-repo-info`, Chinese description per contracts/api-routes.md, `inputSchema: z.object({ owner, repo })`, `outputSchema: GitHubRepoSchema`, execute calls `fetchRepoInfo` from `src/lib/github.ts`
- [x] T011 [P] [US1] Create `getRepoTree` tool in `src/mastra/tools/get-repo-tree.ts`: use `createTool` with id `get-repo-tree`, Chinese description per contracts/api-routes.md, `inputSchema: z.object({ owner, repo, path?, depth? })`, `outputSchema: RepoTreeSchema`, execute calls `fetchRepoTree` from `src/lib/github.ts`
- [x] T012 [US1] Define Agent in `src/mastra/agents/repo-analyzer.ts`: use `Agent` class with id `repo-analyzer`, Chinese instructions covering role definition (GitHub 仓库分析助手), responsibilities, tool usage guide (when to call each tool), negative constraints (不编造数据), model set to `getModelId()` from `src/lib/model.ts`, register both tools
- [x] T013 [US1] Update Mastra instance in `src/mastra/index.ts`: import and register `repoAnalyzerAgent`, remove placeholder imports
- [x] T014 [US1] Implement chat API route in `src/app/api/chat/route.ts`: POST handler using `handleChatStream` from `@mastra/ai-sdk`, import mastra instance, return `createUIMessageStreamResponse({ stream })`
- [x] T015 [US1] Build ChatPanel component in `src/app/components/ChatPanel.tsx`: use `useChat` from `@ai-sdk/react` with `DefaultChatTransport` pointing to `/api/chat`, render `message.parts` handling `text` and tool-call types, show input form with `sendMessage`, display streaming status
- [x] T016 [US1] Build ToolStatusBadge component in `src/app/components/ToolStatusBadge.tsx`: accept tool part `state` prop (`input-streaming`/`input-available`/`output-available`/`output-error`), render Chinese status label and visual indicator (调用中/完成/失败) with Tailwind styles
- [x] T017 [US1] Wire up main page in `src/app/page.tsx`: import and render ChatPanel as default view, add page title "GitHub 仓库智能分析助手", basic layout with Tailwind

**Checkpoint**: US1 fully functional — Agent chat with Tool Calling works end-to-end. Can demo independently.

---

## Phase 4: User Story 2 — Workflow 分析流程（展示 Workflow 编排 + HITL）(Priority: P2)

**Goal**: 四步结构化分析流程，在人工审批步骤暂停等待用户确认

**Independent Test**: 在 Workflow 模式输入仓库 URL，观察步骤执行，在审批步骤点击继续/取消

### Implementation for User Story 2

- [x] T018a [P] [US2] Create Workflow Step 1 `parse-url` in `src/mastra/workflows/steps/parse-url.ts`: use `createStep` with `inputSchema: z.object({ url: z.string() })`, `outputSchema: ParsedGitHubUrlSchema`, execute calls `parseGitHubUrl` from `src/lib/url-parser.ts`
- [x] T018b [P] [US2] Create Workflow Step 2 `fetch-data` in `src/mastra/workflows/steps/fetch-data.ts`: use `createStep` with `inputSchema: ParsedGitHubUrlSchema`, `outputSchema: z.object({ repoInfo: GitHubRepoSchema, repoTree: RepoTreeSchema })`, execute calls `fetchRepoInfo` + `fetchRepoTree` in parallel with `Promise.all`
- [x] T018c [P] [US2] Create Workflow Step 3 `human-approval` in `src/mastra/workflows/steps/human-approval.ts`: use `createStep` with `suspendSchema: z.object({ summary: GitHubRepoSchema })`, `resumeSchema: z.object({ approved: z.boolean() })`, execute checks `resumeData.approved` — if false call `bail()`, if undefined call `suspend()` with repo summary, if true pass through data
- [x] T018d [P] [US2] Create Workflow Step 4 `generate-report` in `src/mastra/workflows/steps/generate-report.ts`: use `createStep` with input from previous steps, execute uses `streamText` from `ai` package with `getModelId()` to generate Markdown analysis report, return `{ report: string }` for non-streaming path. Note: streaming handled separately via T021b
- [x] T018e [US2] Compose Workflow in `src/mastra/workflows/analyze-repo.ts`: import all 4 steps, use `createWorkflow({ id: 'analyze-repo', inputSchema, outputSchema }).then(parseUrl).then(fetchData).then(humanApproval).then(generateReport).commit()`
- [x] T019 [US2] Update Mastra instance in `src/mastra/index.ts`: import and register `analyzeRepoWorkflow` in workflows config
- [x] T020 [US2] Implement Workflow start API in `src/app/api/workflow/start/route.ts`: POST handler that reads `{ url }` from request body, gets workflow from mastra, creates run, starts with inputData, returns JSON with `{ runId, status, steps }` per contracts/api-routes.md, try-catch with Chinese error response
- [x] T021a [US2] Implement Workflow resume API in `src/app/api/workflow/resume/route.ts`: POST handler that reads `{ runId, approved }` from request body. If `approved === false`, resume with `{ approved: false }`, return JSON `{ status: 'cancelled' }`. If `approved === true`, resume with `{ approved: true }`, return JSON with `{ runId, status }` (step status only, report streamed separately). Try-catch with Chinese error response
- [x] T021b [US2] Implement Workflow report streaming API in `src/app/api/workflow/report/route.ts`: POST handler that reads `{ repoInfo, repoTree }` from request body, uses `streamText` from `ai` package with `getModelId()` and a Chinese system prompt to generate structured analysis report (仓库概述、技术栈分析、项目结构解读、综合评价), returns `result.toTextStreamResponse()` for streaming output
- [x] T022 [P] [US2] Build StepStatusBar component in `src/app/components/StepStatusBar.tsx`: accept `steps` array with `{ id, label, status }`, render horizontal progress bar with 4 steps, each showing Chinese label and status icon/color (等待=gray, 运行中=blue+animate, 成功=green, 暂停=yellow, 失败=red, 已取消=gray), Tailwind styled
- [x] T023 [P] [US2] Build RepoSummaryCard component in `src/app/components/RepoSummaryCard.tsx`: accept `GitHubRepo` data prop, render card with repo name, description, stars, forks, language, license, "继续分析" and "取消" buttons, emit `onApprove` and `onCancel` callbacks, Tailwind styled
- [x] T024 [US2] Build WorkflowPanel component in `src/app/components/WorkflowPanel.tsx`: URL input form at top, StepStatusBar below, conditionally show RepoSummaryCard when status is `suspended`, show report section when completed. Manage workflow state: call `/api/workflow/start` on submit, `/api/workflow/resume` on approve/cancel. On approve success, call `/api/workflow/report` and stream report text into UI. Persist `runId` to `localStorage` on workflow start; on component mount check `localStorage` for active `runId` and restore suspended state if found (supports page refresh recovery per FR-006). Display Chinese error messages on failure

**Checkpoint**: US2 fully functional — Workflow with HITL works end-to-end. Can demo independently.

---

## Phase 5: User Story 3 — 模式切换 (Priority: P3)

**Goal**: 页面顶部切换按钮，在自由对话和 Workflow 模式间自由切换

**Independent Test**: 点击切换按钮，验证两种模式正确切换，状态正确清空

### Implementation for User Story 3

- [x] T025 [US3] Build ModeSwitcher component in `src/app/components/ModeSwitcher.tsx`: accept `mode` (`chat` | `workflow`) and `onModeChange` callback, render two tab-style buttons "自由对话" and "Workflow 分析", highlight active tab, Tailwind styled
- [x] T026 [US3] Update main page `src/app/page.tsx`: add `mode` state (`chat` | `workflow`, default `chat`), render ModeSwitcher at top, conditionally render ChatPanel or WorkflowPanel based on mode, clear respective state on mode switch (reset useChat messages, reset workflow UI state)

**Checkpoint**: All 3 user stories functional — full application works as designed.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality checks aligned with Constitution principles

- [x] T027 [P] Review and finalize `.env.example` in project root: ensure all env vars listed with Chinese comments explaining purpose, default values, and how to obtain API keys
- [x] T028 [P] Review all `src/` files for Chinese comments: verify key functions and modules have comments explaining "做什么" and "为什么" per Constitution IV
- [x] T029 [P] Review error handling across `src/lib/github.ts`, `src/lib/url-parser.ts`, API routes: verify all API calls have try-catch, error messages are in Chinese, no raw stack traces exposed per Constitution V
- [x] T030 Verify file length compliance: check no file exceeds 200 lines per Constitution IV, refactor if needed
- [x] T031 Create `README.md` in project root: Chinese documentation per Constitution 教学与文档规范, include project introduction (教学目标: Tool Calling / Workflow / HITL), tech stack overview, project structure tree from plan.md, quick start guide (pnpm install → .env → pnpm dev), core concepts explanation mapping each concept to its source file, screenshots placeholder

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001, T002)
- **User Story 1 (Phase 3)**: Depends on Foundational (T005-T009)
- **User Story 2 (Phase 4)**: Depends on Foundational (T005-T009), shares `src/lib/` with US1 but no code dependency on US1 components
- **User Story 3 (Phase 5)**: Depends on US1 (T015-T017) and US2 (T022-T024) components existing
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational — no dependency on other stories
- **User Story 2 (P2)**: Can start after Foundational — no dependency on US1 implementation (reuses `src/lib/` only)
- **User Story 3 (P3)**: Depends on US1 and US2 components (integrates both panels into one page)

### Within Each User Story

- Tools/Models before Agent/Workflow definition
- Agent/Workflow before API routes
- API routes before frontend components
- Core components before page integration

### Parallel Opportunities

- T003 + T004 (Setup phase, different files)
- T006 + T007 + T008 (Foundational, independent utility files)
- T010 + T011 (US1 tools, independent files)
- T018a + T018b + T018c + T018d (US2 workflow steps, independent files)
- T022 + T023 (US2 display components, independent files)
- T027 + T028 + T029 (Polish, independent review tasks)
- US1 (Phase 3) and US2 (Phase 4) can run in parallel after Foundational

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Tool Calling)
4. **STOP and VALIDATE**: Test Agent chat end-to-end
5. Deploy/demo if ready — already demonstrates Tool Calling concept

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Agent chat with Tool Calling (MVP!)
3. Add User Story 2 → Workflow + HITL demo
4. Add User Story 3 → Unified mode switching
5. Polish → Final quality review

### Parallel Execution Example

```bash
# After Foundational phase, launch US1 and US2 in parallel:

# Stream 1 (US1):
Task: T010 "Create getRepoInfo tool in src/mastra/tools/get-repo-info.ts"
Task: T011 "Create getRepoTree tool in src/mastra/tools/get-repo-tree.ts"
Task: T012 "Define Agent in src/mastra/agents/repo-analyzer.ts"
...

# Stream 2 (US2):
Task: T018a "Create Step 1 parse-url in src/mastra/workflows/steps/parse-url.ts"
Task: T018b "Create Step 2 fetch-data in src/mastra/workflows/steps/fetch-data.ts"
Task: T018c "Create Step 3 human-approval in src/mastra/workflows/steps/human-approval.ts"
Task: T018d "Create Step 4 generate-report in src/mastra/workflows/steps/generate-report.ts"
...
```

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No test tasks generated (testing not in scope per plan.md)
- File count: ~20 source files, all <200 lines per Constitution IV
- Commit after each task or logical group
