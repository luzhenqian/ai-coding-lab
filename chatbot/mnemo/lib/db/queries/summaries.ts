import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { summaries } from "@/lib/db/schema";

interface CreateSummaryData {
  conversationId: string;
  content: string;
  coveredMessageCount: number;
  tokenCount: number;
}

/** 为对话插入新摘要。 */
export async function createSummary(data: CreateSummaryData) {
  const [summary] = await db.insert(summaries).values(data).returning();
  return summary;
}

/**
 * 获取对话的最新摘要。
 * 原因：我们只需要最新的摘要，因为每条新摘要都会渐进式地包含前一条。
 */
export async function getLatestSummary(conversationId: string) {
  const [summary] = await db
    .select()
    .from(summaries)
    .where(eq(summaries.conversationId, conversationId))
    .orderBy(desc(summaries.createdAt))
    .limit(1);

  return summary ?? null;
}
