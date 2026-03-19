import type { ModelMessage } from "ai";
import { listMessagesByConversation } from "@/lib/db/queries/messages";
import { getLatestSummary } from "@/lib/db/queries/summaries";
import {
  searchMemoriesBySimilarity,
  incrementAccessCount,
} from "@/lib/db/queries/memories";
import { searchChunksBySimilarity } from "@/lib/db/queries/documents";
import { estimateTokens } from "@/lib/utils/tokens";
import { generateEmbedding } from "@/lib/utils/embeddings";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts";
import {
  TOTAL_TOKEN_BUDGET,
  SLIDING_WINDOW_SIZE,
  RECENT_MESSAGES_TO_KEEP,
  MEMORY_TOP_K,
  MEMORY_SIMILARITY_THRESHOLD,
  RAG_TOP_K,
  RAG_SIMILARITY_THRESHOLD,
  MEMORY_BUDGET,
  RAG_BUDGET,
  DEFAULT_USER_ID,
} from "@/lib/constants";

interface RetrievedMemory {
  id: string;
  content: string;
  category: string;
  similarity: number;
}

interface RagChunk {
  content: string;
  filename: string;
  similarity: number;
}

interface ContextDebugInfo {
  totalTokens: number;
  historyTokens: number;
  systemPromptTokens: number;
  summaryTokens: number;
  memoryTokens: number;
  ragTokens: number;
}

interface ConversationContext {
  messages: ModelMessage[];
  debugInfo: ContextDebugInfo;
  retrievedMemories: RetrievedMemory[];
  ragChunks: RagChunk[];
}

/**
 * 构建对话的上下文窗口。
 *
 * 策略（第4阶段）：
 *   1. 检查该对话是否存在摘要
 *   2. 并行检索相关记忆和文档片段
 *   3. 如果存在摘要：系统提示 + 记忆 + RAG + 摘要 + 近期消息
 *   4. 如果没有摘要：回退到滑动窗口行为
 *   5. 应用 token 预算——从最旧的消息开始裁剪，直到总量符合预算
 */
export async function buildConversationContext(
  conversationId: string,
  currentUserMessage?: string
): Promise<ConversationContext> {
  // 原因：用 try-catch 包裹整个函数体，以便数据库故障时优雅降级
  // 为"无记忆模式"，而不是让聊天崩溃
  try {
  const dbMessages = await listMessagesByConversation(conversationId);
  const summary = await getLatestSummary(conversationId);

  let memoryText = "";
  let memoryTokens = 0;
  let ragText = "";
  let ragTokens = 0;
  const retrievedMemories: RetrievedMemory[] = [];
  const ragChunks: RagChunk[] = [];

  if (currentUserMessage) {
    try {
      // 原因：只生成一次嵌入向量，同时用于记忆搜索和文档片段搜索
      const queryEmbedding = await generateEmbedding(currentUserMessage);

      // 原因：并行运行记忆和 RAG 搜索以减少延迟
      const [relevantMemories, relevantChunks] = await Promise.all([
        searchMemoriesBySimilarity(
          DEFAULT_USER_ID,
          queryEmbedding,
          MEMORY_TOP_K,
          MEMORY_SIMILARITY_THRESHOLD
        ),
        searchChunksBySimilarity(
          queryEmbedding,
          RAG_TOP_K,
          RAG_SIMILARITY_THRESHOLD
        ),
      ]);

      if (relevantMemories.length > 0) {
        // 原因：强制每个部分的 token 预算，防止记忆占用其他上下文部分所需的空间
        const memoryLines: string[] = [];
        let currentTokens = 0;
        for (const m of relevantMemories) {
          const line = `- ${m.content}`;
          const lineTokens = estimateTokens(line);
          if (currentTokens + lineTokens > MEMORY_BUDGET) break;
          memoryLines.push(line);
          currentTokens += lineTokens;
          retrievedMemories.push({
            id: m.id,
            content: m.content,
            category: m.category,
            similarity: m.similarity,
          });
        }
        if (memoryLines.length > 0) {
          memoryText = `## 关于当前用户\n${memoryLines.join("\n")}`;
          memoryTokens = estimateTokens(memoryText);
        }

        // 原因：即发即忘地更新访问计数——不够关键，无需阻塞响应
        for (const mem of relevantMemories) {
          incrementAccessCount(mem.id).catch(() => {});
        }
      }

      if (relevantChunks.length > 0) {
        // 原因：为 RAG 内容强制执行每部分的 token 预算
        const ragLines: string[] = [];
        let currentTokens = 0;
        for (const chunk of relevantChunks) {
          const line = `[来源: ${chunk.filename}]\n${chunk.content}`;
          const lineTokens = estimateTokens(line);
          if (currentTokens + lineTokens > RAG_BUDGET) break;
          ragLines.push(line);
          currentTokens += lineTokens;
          ragChunks.push({
            content: chunk.content,
            filename: chunk.filename,
            similarity: chunk.similarity,
          });
        }
        if (ragLines.length > 0) {
          ragText = `## 参考知识\n${ragLines.join("\n\n")}`;
          ragTokens = estimateTokens(ragText);
        }
      }
    } catch (retrievalErr) {
      console.error(
        "[context-builder] Failed to retrieve memories/RAG:",
        retrievalErr
      );
    }
  }

  const systemPromptTokens = estimateTokens(SYSTEM_PROMPT);
  let summaryTokens = 0;

  if (summary) {
    // 原因：第2阶段——使用摘要 + 近期消息保持上下文紧凑，同时保留较早的对话知识
    const summaryText = `以下是之前对话的摘要：\n${summary.content}`;
    summaryTokens = estimateTokens(summaryText);

    let remainingBudget =
      TOTAL_TOKEN_BUDGET -
      systemPromptTokens -
      summaryTokens -
      memoryTokens -
      ragTokens;

    // 原因：只保留最近的消息作为原始文本；较早的消息已包含在摘要中
    const recentMessages = dbMessages.slice(-RECENT_MESSAGES_TO_KEEP);

    // 原因：从前面（最旧的）开始裁剪，以保留最近的上下文
    const budgeted: typeof recentMessages = [];
    for (let i = recentMessages.length - 1; i >= 0; i--) {
      const msg = recentMessages[i];
      const tokens = msg.tokenCount;
      if (tokens <= remainingBudget) {
        budgeted.unshift(msg);
        remainingBudget -= tokens;
      } else {
        break;
      }
    }

    const historyTokens = budgeted.reduce((sum, m) => sum + m.tokenCount, 0);

    const coreMessages: ModelMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      // 原因：在系统提示之后注入记忆上下文，让模型在处理对话历史之前先了解用户
      ...(memoryText
        ? [{ role: "system" as const, content: memoryText }]
        : []),
      // 原因：注入 RAG 内容，让模型可以引用上传的文档
      ...(ragText
        ? [{ role: "system" as const, content: ragText }]
        : []),
      // 原因：以系统消息形式注入摘要，让模型将其视为权威上下文而非用户发言
      { role: "system", content: summaryText },
      ...budgeted.map(
        (m): ModelMessage => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        })
      ),
    ];

    return {
      messages: coreMessages,
      debugInfo: {
        totalTokens:
          systemPromptTokens +
          summaryTokens +
          memoryTokens +
          ragTokens +
          historyTokens,
        historyTokens,
        systemPromptTokens,
        summaryTokens,
        memoryTokens,
        ragTokens,
      },
      retrievedMemories,
      ragChunks,
    };
  }

  // 原因：第1阶段回退——尚无摘要，使用滑动窗口
  const windowed = dbMessages.slice(-SLIDING_WINDOW_SIZE);

  let remainingBudget =
    TOTAL_TOKEN_BUDGET - systemPromptTokens - memoryTokens - ragTokens;

  const budgeted: typeof windowed = [];
  for (let i = windowed.length - 1; i >= 0; i--) {
    const msg = windowed[i];
    const tokens = msg.tokenCount;
    if (tokens <= remainingBudget) {
      budgeted.unshift(msg);
      remainingBudget -= tokens;
    } else {
      break;
    }
  }

  const historyTokens = budgeted.reduce((sum, m) => sum + m.tokenCount, 0);

  const coreMessages: ModelMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    // 原因：在系统提示之后注入记忆上下文，让模型在处理对话历史之前先了解用户
    ...(memoryText
      ? [{ role: "system" as const, content: memoryText }]
      : []),
    // 原因：注入 RAG 内容，让模型可以引用上传的文档
    ...(ragText
      ? [{ role: "system" as const, content: ragText }]
      : []),
    ...budgeted.map(
      (m): ModelMessage => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })
    ),
  ];

  return {
    messages: coreMessages,
    debugInfo: {
      totalTokens:
        systemPromptTokens + memoryTokens + ragTokens + historyTokens,
      historyTokens,
      systemPromptTokens,
      summaryTokens: 0,
      memoryTokens,
      ragTokens,
    },
    retrievedMemories,
    ragChunks,
  };

  } catch (dbErr) {
    // 原因：如果数据库宕机，回退到仅包含系统提示和当前用户消息的最小上下文，
    // 让聊天可以在"无记忆模式"下继续，而不是完全失败
    console.error(
      "[context-builder] Database failure, falling back to memoryless mode:",
      dbErr
    );

    const systemPromptTokens = estimateTokens(SYSTEM_PROMPT);
    const fallbackMessages: ModelMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];
    if (currentUserMessage) {
      fallbackMessages.push({ role: "user", content: currentUserMessage });
    }

    return {
      messages: fallbackMessages,
      debugInfo: {
        totalTokens: systemPromptTokens,
        historyTokens: 0,
        systemPromptTokens,
        summaryTokens: 0,
        memoryTokens: 0,
        ragTokens: 0,
      },
      retrievedMemories: [],
      ragChunks: [],
    };
  }
}
