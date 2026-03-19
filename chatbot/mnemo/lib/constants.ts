// ============================================================
// Token 预算
// 原因：所有上下文注入都受预算控制，以防止提示无限增长（宪法原则 V）。
// 这些值针对第1阶段调优；后续阶段会更新它们。
// ============================================================

/** 上下文窗口的总 token 预算（第4阶段：增加以容纳 RAG 内容） */
export const TOTAL_TOKEN_BUDGET = 16000;

// 原因：每部分预算防止任何单一部分垄断上下文窗口（宪法原则 V）
export const SYSTEM_PROMPT_BUDGET = 1500;
export const MEMORY_BUDGET = 500;
export const RAG_BUDGET = 2000;
export const SUMMARY_BUDGET = 800;
export const HISTORY_BUDGET = 6000;
export const CURRENT_MESSAGE_BUDGET = 1000;

/** 上下文中包含的最大近期消息数 */
export const SLIDING_WINDOW_SIZE = 20;

// ============================================================
// 摘要配置（第2阶段）
// ============================================================

/** 触发摘要生成前未覆盖的消息数量 */
export const SUMMARY_TRIGGER_THRESHOLD = 10;

/** 保留为原始文本（不摘要）的近期消息数量 */
export const RECENT_MESSAGES_TO_KEEP = 10;

/** 生成摘要的最大 token 数 */
export const MAX_SUMMARY_TOKENS = 500;

// ============================================================
// 记忆配置（第3阶段）
// ============================================================

/** 每次请求检索的最相关记忆数量 */
export const MEMORY_TOP_K = 5;

/** 将记忆纳入上下文的最低相似度分数 */
export const MEMORY_SIMILARITY_THRESHOLD = 0.3;

/** 高于此相似度阈值的新记忆将被视为重复 */
export const MEMORY_DEDUP_THRESHOLD = 0.85;

// ============================================================
// 双轨记忆提取配置
// ============================================================

/** 触发后台记忆提取前的空闲超时时间（毫秒） */
export const IDLE_TIMEOUT_MS = 120_000;

/** 后台提取运行前对话中的最少消息数 */
export const BACKGROUND_MIN_MESSAGES = 4;

// ============================================================
// RAG 配置（第4阶段）
// ============================================================

/** 文档分割的目标分块大小（以 token 计） */
export const CHUNK_MIN_TOKENS = 300;
export const CHUNK_MAX_TOKENS = 500;

/** 相邻分块之间的 token 重叠量 */
export const CHUNK_OVERLAP_TOKENS = 50;

/** 检索最相关文档分块的数量 */
export const RAG_TOP_K = 5;

/** 文档分块检索的最低相似度分数 */
export const RAG_SIMILARITY_THRESHOLD = 0.3;

// ============================================================
// 硬编码的用户 ID（按宪法规定不设认证系统）
// ============================================================
export const DEFAULT_USER_ID =
  process.env.DEFAULT_USER_ID || "demo-user";
