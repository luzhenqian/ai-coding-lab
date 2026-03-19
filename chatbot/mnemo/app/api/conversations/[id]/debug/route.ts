import { NextRequest, NextResponse } from "next/server";
import { getLatestSummary } from "@/lib/db/queries/summaries";
import { listMessagesByConversation } from "@/lib/db/queries/messages";
import { buildConversationContext } from "@/lib/ai/context-builder";

/**
 * GET /api/conversations/[id]/debug
 *
 * 原因：暴露内部上下文构建状态，方便开发者检查记忆系统如何组装提示词。
 * 这是一个教学/调试端点，不用于生产环境。
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;

    // 原因：获取最后一条用户消息，以便 buildConversationContext
    // 可以进行记忆和 RAG 相似度搜索（未提供 currentUserMessage 时会跳过检索）
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
      // 原因：暴露检索到的记忆和 RAG 分块，以便调试面板显示注入提示词的上下文内容
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
