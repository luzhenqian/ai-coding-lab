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

// Why: use a single item schema with output:"array" mode so the LLM
// naturally returns an array without needing a wrapper object
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
 * Extract user memories from recent messages using structured LLM output.
 * Why: periodically mining conversations for durable user facts enables
 * the chatbot to personalize responses across sessions.
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

    // Why: use generateText + manual parse for compatibility with
    // OpenAI-compatible models that don't support structured output
    const extractionResult = await generateText({
      model: chatModel,
      prompt: prompt + '\n\n请严格按照以下 JSON 数组格式回复，不要输出其他内容：\n[{"content": "记忆内容", "category": "preference|fact|behavior", "action": "ADD|UPDATE", "updateTargetId": "可选ID"}]',
    });

    const rawExtraction = extractionResult.text.trim();

    // Why: extract JSON array from response — model may wrap it in markdown
    const arrayMatch = rawExtraction.match(/\[[\s\S]*\]/);
    if (!arrayMatch) {
      return;
    }

    const parsedArray = JSON.parse(arrayMatch[0]);
    const memories = z.array(memoryItemSchema).parse(parsedArray);

    for (const extracted of memories) {
      try {
        // Why: prepend a source tag so the debug panel can show
        // whether this memory came from hot-path or background.
        // The tag is stripped before embedding to avoid polluting
        // similarity search.
        const sourceTag = source ? `[${source}] ` : "";
        const taggedContent = `${sourceTag}${extracted.content}`;
        const embedding = await generateEmbedding(extracted.content);

        if (extracted.action === "UPDATE" && extracted.updateTargetId) {
          // Why: re-embed updated content so similarity search stays accurate
          await updateMemory(extracted.updateTargetId, {
            content: taggedContent,
            category: extracted.category,
            embedding,
          });
        } else {
          // Why: check for near-duplicates before inserting to avoid
          // cluttering the memory store with redundant entries
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

// Why: schema for the LLM worthiness check — kept minimal
// (boolean + short reason) to minimize token usage and latency
const worthinessSchema = z.object({
  worthy: z.boolean().describe("Whether the message is worth remembering"),
  reason: z
    .string()
    .max(50)
    .describe("Brief reason for the decision (for debug logs)"),
});

/**
 * Ask the LLM whether a single user message contains information
 * worth remembering long-term.
 *
 * Why: replaces the old hardcoded keyword list + fixed-interval
 * trigger with an intelligent check that can detect implicit
 * personal facts (e.g., "周末我一般都在写代码") that no keyword
 * list could cover.
 */
export async function shouldExtractMemory(
  userMessage: string
): Promise<{ worthy: boolean; reason: string }> {
  try {
    const prompt = MEMORY_WORTHINESS_PROMPT.replace(
      "{userMessage}",
      userMessage
    );

    // Why: use generateText + manual JSON parse instead of generateObject
    // because some OpenAI-compatible models (e.g., qwen-plus) don't
    // reliably support structured output / JSON mode
    const result = await generateText({
      model: chatModel,
      prompt: prompt + '\n\n请严格按照以下 JSON 格式回复，不要输出其他内容：\n{"worthy": true或false, "reason": "简短理由"}',
    });

    const raw = result.text.trim();

    // Why: extract JSON from response — model may wrap it in markdown code block
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { worthy: false, reason: "parse-error" };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const object = worthinessSchema.parse(parsed);
    return object;
  } catch (err) {
    // Why: if the worthiness check fails, default to not extracting
    // so we don't block or slow down the chat flow
    console.error("[memory-extractor] Worthiness check failed:", err);
    return { worthy: false, reason: "error" };
  }
}
