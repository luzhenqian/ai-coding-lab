import { eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { messages } from "@/db/schema";

export async function addMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  sources?: unknown
) {
  const [message] = await db
    .insert(messages)
    .values({
      conversationId,
      role,
      content,
      sources: sources ?? null,
    })
    .returning();
  return message;
}

export async function getMessagesByConversationId(conversationId: string) {
  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));
}
