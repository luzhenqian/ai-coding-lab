import { eq, asc, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";

interface CreateMessageData {
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  tokenCount: number;
}

/** Insert a single message into a conversation. */
export async function createMessage(data: CreateMessageData) {
  const [message] = await db.insert(messages).values(data).returning();
  return message;
}

/**
 * List all messages in a conversation, ordered by creation time ascending.
 * Why: ascending order ensures the context builder and summarizer see
 * messages in chronological sequence, which matters for sliding window slicing.
 */
export async function listMessagesByConversation(conversationId: string) {
  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));
}

/** Count the total number of messages in a conversation. */
export async function countMessagesByConversation(
  conversationId: string
): Promise<number> {
  const [result] = await db
    .select({ value: count() })
    .from(messages)
    .where(eq(messages.conversationId, conversationId));

  return result.value;
}
