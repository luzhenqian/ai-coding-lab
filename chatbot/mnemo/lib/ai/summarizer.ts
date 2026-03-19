import { generateText } from "ai";
import { chatModel } from "@/lib/ai/provider";
import { SUMMARY_PROMPT } from "@/lib/ai/prompts";
import { MAX_SUMMARY_TOKENS } from "@/lib/constants";

/**
 * 从可选的已有摘要和一批新消息中生成渐进式摘要。
 *
 * 原因：渐进式摘要将旧上下文与新消息合并，
 * 即使对话增长超出滑动窗口，也不会丢失重要信息。
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
    // 原因：如果摘要生成失败，返回旧摘要以免丢失已有上下文；如果没有旧摘要，返回空字符串
    return oldSummary ?? "";
  }
}
