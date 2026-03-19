import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { streamText, generateText } from "ai";
import { chatModel } from "@/lib/ai/provider";
import { TITLE_GENERATION_PROMPT } from "@/lib/ai/prompts";
import { buildConversationContext } from "@/lib/ai/context-builder";
import { createMessage } from "@/lib/db/queries/messages";
import {
  countMessagesByConversation,
  listMessagesByConversation,
} from "@/lib/db/queries/messages";
import {
  touchConversation,
  updateConversationTitle,
} from "@/lib/db/queries/conversations";
import { getLatestSummary, createSummary } from "@/lib/db/queries/summaries";
import { generateSummary } from "@/lib/ai/summarizer";
import { estimateTokens } from "@/lib/utils/tokens";
import {
  extractMemories,
  shouldExtractMemory,
} from "@/lib/ai/memory-extractor";
import { listMemoriesByUser } from "@/lib/db/queries/memories";
import { scheduleIdleExtraction } from "@/lib/utils/idle-scheduler";
import {
  SUMMARY_TRIGGER_THRESHOLD,
  BACKGROUND_MIN_MESSAGES,
  DEFAULT_USER_ID,
} from "@/lib/constants";

interface ChatRequestBody {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  conversationId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const { messages: incomingMessages, conversationId } = body;

    if (!conversationId || !incomingMessages?.length) {
      return NextResponse.json(
        { error: "conversationId and messages are required" },
        { status: 400 }
      );
    }

    // 原因：数组中最后一条消息是新的用户消息
    const userMessage = incomingMessages[incomingMessages.length - 1];

    // 原因：传入当前用户消息，以便上下文构建器通过语义相似度检索相关记忆
    console.time("context-assembly");
    const context = await buildConversationContext(
      conversationId,
      userMessage.content
    );
    console.timeEnd("context-assembly");

    // 原因：记录上下文组成信息，用于调试 token 预算使用情况和检索效果
    console.log("[chat/POST] Context debug:", {
      totalTokens: context.debugInfo.totalTokens,
      systemPromptTokens: context.debugInfo.systemPromptTokens,
      summaryTokens: context.debugInfo.summaryTokens,
      historyTokens: context.debugInfo.historyTokens,
      memoryTokens: context.debugInfo.memoryTokens,
      ragTokens: context.debugInfo.ragTokens,
      memoriesRetrieved: context.retrievedMemories.length,
      ragChunksRetrieved: context.ragChunks.length,
    });

    // 追加尚未保存的当前用户消息
    const messagesForModel = [
      ...context.messages,
      { role: "user" as const, content: userMessage.content },
    ];

    const result = streamText({
      model: chatModel,
      messages: messagesForModel,
    });

    // 原因：after() 在不阻塞流式响应的情况下执行后续任务。
    // 我们在此持久化消息、按需生成标题，并在对话超过阈值时触发摘要生成。
    after(async () => {
      try {
        const fullResponse = await result.text;

        // 持久化用户消息
        await createMessage({
          conversationId,
          role: "user",
          content: userMessage.content,
          tokenCount: estimateTokens(userMessage.content),
        });

        // 持久化助手消息
        await createMessage({
          conversationId,
          role: "assistant",
          content: fullResponse,
          tokenCount: estimateTokens(fullResponse),
        });

        await touchConversation(conversationId);

        // 原因：从第一轮对话自动生成标题，让侧边栏显示有意义的名称而非"新对话"
        const messageCount =
          await countMessagesByConversation(conversationId);
        // 等于 2 是因为我们刚插入了用户 + 助手这一对消息
        if (messageCount <= 2) {
          const titlePrompt = TITLE_GENERATION_PROMPT.replace(
            "{userMessage}",
            userMessage.content
          ).replace("{assistantMessage}", fullResponse);

          const titleResult = await generateText({
            model: chatModel,
            prompt: titlePrompt,
          });

          const title = titleResult.text.trim().slice(0, 200);
          if (title) {
            await updateConversationTitle(conversationId, title);
          }
        }

        // 原因：当未被摘要覆盖的消息数量超过阈值时触发摘要生成。
        // 这样可以保持上下文窗口在可控范围内，同时保留较早的对话知识。
        try {
          const latestSummary = await getLatestSummary(conversationId);
          const coveredCount = latestSummary?.coveredMessageCount ?? 0;
          const uncoveredCount = messageCount - coveredCount;

          if (uncoveredCount >= SUMMARY_TRIGGER_THRESHOLD) {
            // 原因：获取所有消息，然后只截取未被覆盖的部分（即尚未被任何摘要涵盖的消息）
            const allMessages =
              await listMessagesByConversation(conversationId);
            const uncoveredMessages = allMessages.slice(coveredCount);

            const summaryContent = await generateSummary(
              latestSummary?.content ?? null,
              uncoveredMessages.map((m) => ({
                role: m.role,
                content: m.content,
              }))
            );

            if (summaryContent) {
              await createSummary({
                conversationId,
                content: summaryContent,
                coveredMessageCount: allMessages.length,
                tokenCount: estimateTokens(summaryContent),
              });
            }
          }
        } catch (summaryErr) {
          // 原因：摘要生成失败不应中断主流程；对话仍可正常工作，只是没有更新摘要
          console.error(
            "[chat/after] Failed to generate summary:",
            summaryErr
          );
        }

        // ── 热路径：LLM 判断该消息是否值得记忆 ──
        // 原因：替代旧的硬编码关键词 + 固定间隔触发机制，
        // 采用智能的逐条消息检查，能捕获关键词列表无法覆盖的隐含个人信息。
        try {
          const worthiness = await shouldExtractMemory(userMessage.content);

          if (worthiness.worthy) {
            console.log(
              "[memory-extractor] Hot path triggered:",
              worthiness.reason
            );

            const recentMsgs =
              await listMessagesByConversation(conversationId);
            const msgsForExtraction = recentMsgs.slice(-20).map((m) => ({
              role: m.role,
              content: m.content,
            }));

            const existingMemories =
              await listMemoriesByUser(DEFAULT_USER_ID);
            const memoriesForExtraction = existingMemories.map((m) => ({
              id: m.id,
              content: m.content,
              category: m.category,
            }));

            await extractMemories(
              msgsForExtraction,
              memoriesForExtraction,
              DEFAULT_USER_ID,
              "hot-path"
            );
          } else {
            console.log(
              "[memory-extractor] Hot path skipped:",
              worthiness.reason
            );
          }
        } catch (memoryErr) {
          console.error(
            "[chat/after] Hot path memory extraction failed:",
            memoryErr
          );
        }

        // ── 后台：调度空闲提取作为安全网 ──
        // 原因：当用户停止聊天后，我们回顾完整的近期对话，以捕获逐条热路径遗漏的记忆。
        scheduleIdleExtraction(conversationId, async () => {
          try {
            const bgMessageCount =
              await countMessagesByConversation(conversationId);
            if (bgMessageCount < BACKGROUND_MIN_MESSAGES) {
              console.log(
                `[memory-extractor] Background skipped: only ${bgMessageCount} messages`
              );
              return;
            }

            console.log(
              `[memory-extractor] Background extraction triggered for ${conversationId}`
            );

            const recentMsgs =
              await listMessagesByConversation(conversationId);
            const msgsForExtraction = recentMsgs.slice(-20).map((m) => ({
              role: m.role,
              content: m.content,
            }));

            const existingMemories =
              await listMemoriesByUser(DEFAULT_USER_ID);
            const memoriesForExtraction = existingMemories.map((m) => ({
              id: m.id,
              content: m.content,
              category: m.category,
            }));

            await extractMemories(
              msgsForExtraction,
              memoriesForExtraction,
              DEFAULT_USER_ID,
              "background"
            );
          } catch (bgErr) {
            console.error(
              "[chat/after] Background memory extraction failed:",
              bgErr
            );
          }
        });
      } catch (err) {
        // 原因：after() 中的错误不会传递给客户端，所以我们在此记录日志
        console.error("[chat/after] Failed to persist messages:", err);
      }
    });

    // 原因：纯文本流比 UIMessageStream 协议更易于在客户端解析
    return result.toTextStreamResponse();
  } catch (err) {
    console.error("[chat/POST] Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
