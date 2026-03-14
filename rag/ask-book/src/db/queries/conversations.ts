import { eq } from "drizzle-orm";
import { db } from "@/db";
import { conversations } from "@/db/schema";

export async function createConversation(title?: string) {
  const [conversation] = await db
    .insert(conversations)
    .values({ title: title ?? null })
    .returning();
  return conversation;
}

export async function getConversationById(id: string) {
  return db.query.conversations.findFirst({
    where: eq(conversations.id, id),
    with: { messages: true },
  });
}

export async function listConversations() {
  return db.query.conversations.findMany({
    orderBy: (conversations, { desc }) => [desc(conversations.updatedAt)],
  });
}

export async function updateConversationTitle(id: string, title: string) {
  const [conversation] = await db
    .update(conversations)
    .set({ title, updatedAt: new Date() })
    .where(eq(conversations.id, id))
    .returning();
  return conversation;
}

export async function deleteConversation(id: string) {
  const [conversation] = await db
    .delete(conversations)
    .where(eq(conversations.id, id))
    .returning();
  return conversation;
}
