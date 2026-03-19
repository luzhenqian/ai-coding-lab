import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema";

/** 为指定用户插入新对话，返回创建的行。 */
export async function createConversation(userId: string) {
  const [conversation] = await db
    .insert(conversations)
    .values({ userId })
    .returning();

  return conversation;
}

/** 列出用户未删除的对话，按最近更新排序。 */
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

/** 按 ID 获取单个对话。未找到时返回 undefined。 */
export async function getConversationById(id: string) {
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id));

  return conversation;
}

/**
 * 通过将 isDeleted 设为 true 来软删除对话。
 * 原因：软删除保留数据以便恢复，并避免对消息、摘要等进行级联硬删除。
 */
export async function softDeleteConversation(id: string) {
  await db
    .update(conversations)
    .set({ isDeleted: true })
    .where(eq(conversations.id, id));
}

/** 更新对话标题。 */
export async function updateConversationTitle(id: string, title: string) {
  await db
    .update(conversations)
    .set({ title })
    .where(eq(conversations.id, id));
}

/** 将 updatedAt 更新为当前时间戳（标记对话为活跃）。 */
export async function touchConversation(id: string) {
  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, id));
}
