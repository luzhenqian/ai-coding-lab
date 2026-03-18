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
 * Build the context window for a conversation.
 *
 * Strategy (Phase 4):
 *   1. Check if a summary exists for this conversation
 *   2. Retrieve relevant memories AND document chunks in parallel
 *   3. If summary exists: System Prompt + memory + RAG + summary + recent messages
 *   4. If no summary: fall back to sliding window behavior
 *   5. Apply token budget — trim oldest messages until total fits
 */
export async function buildConversationContext(
  conversationId: string,
  currentUserMessage?: string
): Promise<ConversationContext> {
  // Why: wrap entire body in try-catch so a database failure degrades
  // gracefully to "memoryless mode" instead of crashing the chat
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
      // Why: generate the embedding once and reuse it for both
      // memory search and document chunk search
      const queryEmbedding = await generateEmbedding(currentUserMessage);

      // Why: run memory and RAG searches in parallel to minimize latency
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
        // Why: enforce per-section token budget so memories don't
        // consume space needed by other context sections
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

        // Why: fire-and-forget access count updates — not critical
        // enough to block the response
        for (const mem of relevantMemories) {
          incrementAccessCount(mem.id).catch(() => {});
        }
      }

      if (relevantChunks.length > 0) {
        // Why: enforce per-section token budget for RAG content
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
    // Why: Phase 2 — use summary + recent messages to keep context compact
    // while preserving older conversation knowledge
    const summaryText = `以下是之前对话的摘要：\n${summary.content}`;
    summaryTokens = estimateTokens(summaryText);

    let remainingBudget =
      TOTAL_TOKEN_BUDGET -
      systemPromptTokens -
      summaryTokens -
      memoryTokens -
      ragTokens;

    // Why: keep only the most recent messages as raw text;
    // older messages are captured in the summary
    const recentMessages = dbMessages.slice(-RECENT_MESSAGES_TO_KEEP);

    // Why: trim from the front (oldest) so the most recent context survives
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
      // Why: inject memory context after system prompt so the model
      // knows about the user before processing conversation history
      ...(memoryText
        ? [{ role: "system" as const, content: memoryText }]
        : []),
      // Why: inject RAG content so the model can reference uploaded documents
      ...(ragText
        ? [{ role: "system" as const, content: ragText }]
        : []),
      // Why: inject summary as a system message so the model treats it
      // as authoritative context rather than a user turn
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

  // Why: Phase 1 fallback — no summary yet, use sliding window
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
    // Why: inject memory context after system prompt so the model
    // knows about the user before processing conversation history
    ...(memoryText
      ? [{ role: "system" as const, content: memoryText }]
      : []),
    // Why: inject RAG content so the model can reference uploaded documents
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
    // Why: if the database is down, fall back to a minimal context with
    // just the system prompt and the current user message so the chat
    // can continue in "memoryless mode" rather than failing entirely
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
