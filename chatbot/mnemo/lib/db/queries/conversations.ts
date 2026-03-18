import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema";

/** Insert a new conversation for the given user, return the created row. */
export async function createConversation(userId: string) {
  const [conversation] = await db
    .insert(conversations)
    .values({ userId })
    .returning();

  return conversation;
}

/** List non-deleted conversations for a user, most recently updated first. */
export async function listConversations(userId: string) {
  return db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.userId, userId),
        eq(conversations.isDeleted, false)
      )
    )
    .orderBy(desc(conversations.updatedAt));
}

/** Get a single conversation by its ID. Returns undefined if not found. */
export async function getConversationById(id: string) {
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id));

  return conversation;
}

/**
 * Soft-delete a conversation by setting isDeleted to true.
 * Why: soft-delete preserves data for potential recovery and avoids
 * cascading hard deletes on messages, summaries, etc.
 */
export async function softDeleteConversation(id: string) {
  await db
    .update(conversations)
    .set({ isDeleted: true })
    .where(eq(conversations.id, id));
}

/** Update the title of a conversation. */
export async function updateConversationTitle(id: string, title: string) {
  await db
    .update(conversations)
    .set({ title })
    .where(eq(conversations.id, id));
}

/** Bump updatedAt to the current timestamp (marks the conversation as active). */
export async function touchConversation(id: string) {
  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, id));
}
