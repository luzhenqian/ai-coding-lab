# Tasks: 大模型 Base URL 配置

**Input**: Design documents from `/specs/001-model-base-url/`
**Prerequisites**: plan.md (required), spec.md (required), research.md

**Tests**: Not requested — no test tasks generated.

**Organization**: Single user story, 3 tasks.

## Format: `[ID] [P?] Description`

---

## Phase 1: Implementation

**Purpose**: 修改 provider 初始化代码，支持 baseURL 配置

- [x] T001 [P] Update `src/lib/model.ts`: replace default `openai`/`anthropic` imports with `createOpenAI`/`createAnthropic` factory functions, read `OPENAI_BASE_URL` and `ANTHROPIC_BASE_URL` from env, pass `baseURL` option only when set, preserve `getModelId()` and `registry` exports unchanged
- [x] T002 [P] Update `.env.example`: add `OPENAI_BASE_URL` and `ANTHROPIC_BASE_URL` variables with Chinese comments explaining purpose and example values (中转站/代理地址)
- [x] T003 Update `README.md`: add `OPENAI_BASE_URL` and `ANTHROPIC_BASE_URL` rows to the environment variables table with Chinese descriptions

**Checkpoint**: TypeScript compilation passes, all existing functionality works unchanged.

---

## Dependencies & Execution Order

- T001 and T002 can run in parallel (different files)
- T003 depends on knowing the final variable names (T001/T002) but can also run in parallel since names are already decided

## Notes

- No new dependencies needed
- All 3 tasks modify different files → fully parallelizable
- File count: 3 files modified, all remain <200 lines
