import { eq, asc, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";

interface CreateMessageData {
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  tokenCount: number;
}

/** 向对话中插入一条消息。 */
export async function createMessage(data: CreateMessageData) {
  const [message] = await db.insert(messages).values(data).returning();
  return message;
}

/**
 * 按创建时间升序列出对话中的所有消息。
 * 原因：升序确保上下文构建器和摘要器按时间顺序读取消息，这对滑动窗口切片至关重要。
 */
export async function listMessagesByConversation(conversationId: string) {
  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));
}

/** 统计对话中的消息总数。 */
export async function countMessagesByConversation(
  conversationId: string
): Promise<number> {
  const [result] = await db
    .select({ value: count() })
    .from(messages)
    .where(eq(messages.conversationId, conversationId));

  return result.value;
}
