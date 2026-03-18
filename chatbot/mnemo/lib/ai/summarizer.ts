import { generateText } from "ai";
import { chatModel } from "@/lib/ai/provider";
import { SUMMARY_PROMPT } from "@/lib/ai/prompts";
import { MAX_SUMMARY_TOKENS } from "@/lib/constants";

/**
 * Generate a progressive summary from an optional existing summary
 * and a batch of new messages.
 *
 * Why: progressive summarization merges old context with new messages
 * so we never lose important information even as conversations grow
 * beyond the sliding window.
 */
export async function generateSummary(
  oldSummary: string | null,
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  try {
    const existingSummaryBlock = oldSummary
      ? `已有的摘要：\n${oldSummary}\n\n请将以下新内容与已有摘要合并，形成更新后的完整摘要。`
      : "这是第一次生成摘要，没有已有摘要。";

    const newMessagesBlock = messages
      .map((m) => `${m.role === "user" ? "用户" : "助手"}：${m.content}`)
      .join("\n");

    const prompt = SUMMARY_PROMPT.replace(
      "{existingSummary}",
      existingSummaryBlock
    ).replace("{newMessages}", newMessagesBlock);

    const result = await generateText({
      model: chatModel,
      prompt,
      maxOutputTokens: MAX_SUMMARY_TOKENS,
    });

    return result.text.trim();
  } catch (err) {
    console.error("[summarizer] Failed to generate summary:", err);
    // Why: if summarization fails, return old summary so we don't lose
    // existing context; if there's no old summary, return empty string
    return oldSummary ?? "";
  }
}
