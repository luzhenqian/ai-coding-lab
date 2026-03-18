// ============================================================
// Token Budgets
// Why: All context injection is budget-controlled to prevent
// unbounded prompt growth (Constitution Principle V).
// These values are tuned for Phase 1; later phases update them.
// ============================================================

/** Total token budget for the context window (Phase 4: increased to accommodate RAG content) */
export const TOTAL_TOKEN_BUDGET = 16000;

// Why: per-section budgets prevent any single section from
// monopolizing the context window (Constitution Principle V)
export const SYSTEM_PROMPT_BUDGET = 1500;
export const MEMORY_BUDGET = 500;
export const RAG_BUDGET = 2000;
export const SUMMARY_BUDGET = 800;
export const HISTORY_BUDGET = 6000;
export const CURRENT_MESSAGE_BUDGET = 1000;

/** Maximum number of recent messages to include in context */
export const SLIDING_WINDOW_SIZE = 20;

// ============================================================
// Summary Configuration (Phase 2)
// ============================================================

/** Number of uncovered messages before triggering summary generation */
export const SUMMARY_TRIGGER_THRESHOLD = 10;

/** Number of recent messages to keep as raw text (not summarized) */
export const RECENT_MESSAGES_TO_KEEP = 10;

/** Maximum tokens for a generated summary */
export const MAX_SUMMARY_TOKENS = 500;

// ============================================================
// Memory Configuration (Phase 3)
// ============================================================

/** Number of most-relevant memories to retrieve per request */
export const MEMORY_TOP_K = 5;

/** Minimum similarity score to include a memory in context */
export const MEMORY_SIMILARITY_THRESHOLD = 0.3;

/** Similarity threshold above which a new memory is treated as duplicate */
export const MEMORY_DEDUP_THRESHOLD = 0.85;

// ============================================================
// Dual-Track Memory Extraction Configuration
// ============================================================

/** Idle timeout before triggering background memory extraction (ms) */
export const IDLE_TIMEOUT_MS = 120_000;

/** Minimum messages in a conversation before background extraction runs */
export const BACKGROUND_MIN_MESSAGES = 4;

// ============================================================
// RAG Configuration (Phase 4)
// ============================================================

/** Target chunk size in tokens for document splitting */
export const CHUNK_MIN_TOKENS = 300;
export const CHUNK_MAX_TOKENS = 500;

/** Token overlap between adjacent chunks */
export const CHUNK_OVERLAP_TOKENS = 50;

/** Number of most-relevant document chunks to retrieve */
export const RAG_TOP_K = 5;

/** Minimum similarity score for document chunk retrieval */
export const RAG_SIMILARITY_THRESHOLD = 0.3;

// ============================================================
// Hardcoded User ID (no auth system per constitution)
// ============================================================
export const DEFAULT_USER_ID =
  process.env.DEFAULT_USER_ID || "demo-user";
