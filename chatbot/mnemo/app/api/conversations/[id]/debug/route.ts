import { NextRequest, NextResponse } from "next/server";
import { getLatestSummary } from "@/lib/db/queries/summaries";
import { listMessagesByConversation } from "@/lib/db/queries/messages";
import { buildConversationContext } from "@/lib/ai/context-builder";

/**
 * GET /api/conversations/[id]/debug
 *
 * Why: exposes internal context-building state so developers can
 * inspect how the memory system assembles the prompt. This is a
 * teaching/debugging endpoint, not for production use.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;

    // Why: retrieve the last user message so buildConversationContext
    // can perform memory and RAG similarity search (it skips retrieval
    // when currentUserMessage is not provided)
    const messages = await listMessagesByConversation(conversationId);
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user");

    const [summary, context] = await Promise.all([
      getLatestSummary(conversationId),
      buildConversationContext(conversationId, lastUserMessage?.content),
    ]);

    return NextResponse.json({
      summary: summary
        ? {
            content: summary.content,
            coveredMessageCount: summary.coveredMessageCount,
            tokenCount: summary.tokenCount,
            updatedAt: summary.createdAt,
          }
        : null,
      context: {
        totalTokens: context.debugInfo.totalTokens,
        summaryTokens: context.debugInfo.summaryTokens,
        historyTokens: context.debugInfo.historyTokens,
        systemPromptTokens: context.debugInfo.systemPromptTokens,
        memoryTokens: context.debugInfo.memoryTokens,
        ragTokens: context.debugInfo.ragTokens,
      },
      // Why: expose retrieved memories and RAG chunks so the debug
      // panel can show what context was injected into the prompt
      memories: context.retrievedMemories,
      ragChunks: context.ragChunks,
    });
  } catch (err) {
    console.error("[debug] Failed to fetch debug info:", err);
    return NextResponse.json(
      { error: "Failed to fetch debug information" },
      { status: 500 }
    );
  }
}
