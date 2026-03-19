import { generateText } from "ai";
import { z } from "zod";
import { chatModel } from "@/lib/ai/provider";
import {
  MEMORY_EXTRACTION_PROMPT,
  MEMORY_WORTHINESS_PROMPT,
} from "@/lib/ai/prompts";
import { generateEmbedding } from "@/lib/utils/embeddings";
import {
  createMemory,
  updateMemory,
  findDuplicateMemory,
} from "@/lib/db/queries/memories";
import { MEMORY_DEDUP_THRESHOLD } from "@/lib/constants";

// 原因：使用单项 schema 配合 output:"array" 模式，让 LLM
// 自然返回数组而无需包装对象
const memoryItemSchema = z.object({
  content: z.string().describe("The memory content to store"),
  category: z
    .enum(["preference", "fact", "behavior"])
    .describe("The category of memory"),
  action: z
    .enum(["ADD", "UPDATE"])
    .describe("Whether to add a new memory or update an existing one"),
  updateTargetId: z
    .string()
    .optional()
    .describe("The id of the existing memory to update (for UPDATE action)"),
});

interface SimpleMessage {
  role: string;
  content: string;
}

interface ExistingMemory {
  id: string;
  content: string;
  category: string;
}

/**
 * 使用结构化 LLM 输出从近期消息中提取用户记忆。
 * 原因：定期从对话中挖掘持久的用户事实，使聊天机器人能够跨会话个性化回复。
 */
export type ExtractionSource = "hot-path" | "background";

export async function extractMemories(
  recentMessages: SimpleMessage[],
  existingMemories: ExistingMemory[],
  userId: string,
  source?: ExtractionSource
): Promise<void> {
  try {
    const existingMemoriesText =
      existingMemories.length > 0
        ? existingMemories
            .map((m) => `- [${m.id}] (${m.category}) ${m.content}`)
            .join("\n")
        : "（暂无已有记忆）";

    const recentMessagesText = recentMessages
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    const prompt = MEMORY_EXTRACTION_PROMPT.replace(
      "{existingMemories}",
      existingMemoriesText
    ).replace("{recentMessages}", recentMessagesText);

    // 原因：使用 generateText + 手动解析，以兼容不支持结构化输出的 OpenAI 兼容模型
    const extractionResult = await generateText({
      model: chatModel,
      prompt: prompt + '\n\n请严格按照以下 JSON 数组格式回复，不要输出其他内容：\n[{"content": "记忆内容", "category": "preference|fact|behavior", "action": "ADD|UPDATE", "updateTargetId": "可选ID"}]',
    });

    const rawExtraction = extractionResult.text.trim();

    // 原因：从响应中提取 JSON 数组——模型可能会用 markdown 包裹它
    const arrayMatch = rawExtraction.match(/\[[\s\S]*\]/);
    if (!arrayMatch) {
      return;
    }

    const parsedArray = JSON.parse(arrayMatch[0]);
    const memories = z.array(memoryItemSchema).parse(parsedArray);

    for (const extracted of memories) {
      try {
        // 原因：前置来源标签，让调试面板可以显示该记忆来自热路径还是后台。
        // 标签在嵌入前会被去除，避免污染相似度搜索。
        const sourceTag = source ? `[${source}] ` : "";
        const taggedContent = `${sourceTag}${extracted.content}`;
        const embedding = await generateEmbedding(extracted.content);

        if (extracted.action === "UPDATE" && extracted.updateTargetId) {
          // 原因：重新嵌入更新后的内容，以保持相似度搜索的准确性
          await updateMemory(extracted.updateTargetId, {
            content: taggedContent,
            category: extracted.category,
            embedding,
          });
        } else {
          // 原因：插入前检查近似重复项，避免冗余条目堆积在记忆存储中
          const duplicate = await findDuplicateMemory(
            userId,
            embedding,
            MEMORY_DEDUP_THRESHOLD
          );

          if (duplicate) {
            await updateMemory(duplicate.id, {
              content: taggedContent,
              category: extracted.category,
              embedding,
            });
          } else {
            await createMemory({
              userId,
              content: taggedContent,
              category: extracted.category,
              embedding,
            });
          }
        }
      } catch (memErr) {
        console.error(
          "[memory-extractor] Failed to process extracted memory:",
          memErr
        );
      }
    }
  } catch (error) {
    console.error("[memory-extractor] Failed to extract memories:", error);
  }
}

// 原因：LLM 价值判断的 schema——保持最小化（布尔值 + 简短理由）以减少 token 用量和延迟
const worthinessSchema = z.object({
  worthy: z.boolean().describe("Whether the message is worth remembering"),
  reason: z
    .string()
    .max(50)
    .describe("Brief reason for the decision (for debug logs)"),
});

/**
 * 让 LLM 判断单条用户消息是否包含值得长期记忆的信息。
 *
 * 原因：替换旧的硬编码关键词列表 + 固定间隔触发机制，
 * 使用智能检查来检测隐含的个人事实（如"周末我一般都在写代码"），
 * 这是任何关键词列表都无法覆盖的。
 */
export async function shouldExtractMemory(
  userMessage: string
): Promise<{ worthy: boolean; reason: string }> {
  try {
    const prompt = MEMORY_WORTHINESS_PROMPT.replace(
      "{userMessage}",
      userMessage
    );

    // 原因：使用 generateText + 手动 JSON 解析代替 generateObject，
    // 因为某些 OpenAI 兼容模型（如 qwen-plus）不能可靠地支持结构化输出 / JSON 模式
    const result = await generateText({
      model: chatModel,
      prompt: prompt + '\n\n请严格按照以下 JSON 格式回复，不要输出其他内容：\n{"worthy": true或false, "reason": "简短理由"}',
    });

    const raw = result.text.trim();

    // 原因：从响应中提取 JSON——模型可能会用 markdown 代码块包裹它
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { worthy: false, reason: "parse-error" };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const object = worthinessSchema.parse(parsed);
    return object;
  } catch (err) {
    // 原因：如果价值判断失败，默认不提取，以免阻塞或拖慢聊天流程
    console.error("[memory-extractor] Worthiness check failed:", err);
    return { worthy: false, reason: "error" };
  }
}
