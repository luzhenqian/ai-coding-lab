import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { summaries } from "@/lib/db/schema";

interface CreateSummaryData {
  conversationId: string;
  content: string;
  coveredMessageCount: number;
  tokenCount: number;
}

/** Insert a new summary for a conversation. */
export async function createSummary(data: CreateSummaryData) {
  const [summary] = await db.insert(summaries).values(data).returning();
  return summary;
}

/**
 * Get the most recent summary for a conversation.
 * Why: we only need the latest summary because each new summary
 * progressively incorporates the previous one.
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
