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

    // Why: the last message in the array is the new user message
    const userMessage = incomingMessages[incomingMessages.length - 1];

    // Why: pass the current user message so context-builder can search
    // for relevant memories via semantic similarity
    console.time("context-assembly");
    const context = await buildConversationContext(
      conversationId,
      userMessage.content
    );
    console.timeEnd("context-assembly");

    // Why: log context composition for debugging token budget usage
    // and retrieval effectiveness in production
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

    // Append the current user message that hasn't been saved yet
    const messagesForModel = [
      ...context.messages,
      { role: "user" as const, content: userMessage.content },
    ];

    const result = streamText({
      model: chatModel,
      messages: messagesForModel,
    });

    // Why: after() runs post-response work without blocking the stream.
    // We persist messages, optionally generate a title, and trigger
    // summarization when the conversation grows beyond the threshold.
    after(async () => {
      try {
        const fullResponse = await result.text;

        // Persist the user message
        await createMessage({
          conversationId,
          role: "user",
          content: userMessage.content,
          tokenCount: estimateTokens(userMessage.content),
        });

        // Persist the assistant message
        await createMessage({
          conversationId,
          role: "assistant",
          content: fullResponse,
          tokenCount: estimateTokens(fullResponse),
        });

        await touchConversation(conversationId);

        // Why: auto-generate a title from the first exchange so the
        // sidebar shows a meaningful name instead of "New conversation"
        const messageCount =
          await countMessagesByConversation(conversationId);
        // 2 because we just inserted the user + assistant pair
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

        // Why: trigger summarization when the number of uncovered messages
        // exceeds the threshold. This keeps the context window manageable
        // while preserving older conversation knowledge.
        try {
          const latestSummary = await getLatestSummary(conversationId);
          const coveredCount = latestSummary?.coveredMessageCount ?? 0;
          const uncoveredCount = messageCount - coveredCount;

          if (uncoveredCount >= SUMMARY_TRIGGER_THRESHOLD) {
            // Why: fetch all messages, then slice out only uncovered ones
            // (those not yet captured by any summary)
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
          // Why: summarization failure should not break the main flow;
          // the conversation still works, just without an updated summary
          console.error(
            "[chat/after] Failed to generate summary:",
            summaryErr
          );
        }

        // ── Hot Path: LLM judges whether this message is worth remembering ──
        // Why: replaces the old hardcoded keyword + fixed-interval trigger
        // with an intelligent per-message check that catches implicit
        // personal facts no keyword list could cover.
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

        // ── Background: schedule idle extraction as safety net ──
        // Why: when the user stops chatting, we review the full recent
        // conversation to catch memories the per-message Hot Path missed.
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
        // Why: after() errors don't surface to the client, so we log them
        console.error("[chat/after] Failed to persist messages:", err);
      }
    });

    // Why: plain text stream is simpler to parse on the client
    // than the UIMessageStream protocol
    return result.toTextStreamResponse();
  } catch (err) {
    console.error("[chat/POST] Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
