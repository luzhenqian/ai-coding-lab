import { NextRequest, NextResponse } from "next/server";
import { listMemoriesByUser, createMemory } from "@/lib/db/queries/memories";
import { generateEmbedding } from "@/lib/utils/embeddings";
import { DEFAULT_USER_ID } from "@/lib/constants";

/** GET /api/memories — 列出当前用户的所有记忆。 */
export async function GET() {
  try {
    const memories = await listMemoriesByUser(DEFAULT_USER_ID);

    // 原因：从响应中排除嵌入向量 — 它很大（1536 个浮点数）且对客户端 UI 无用
    const sanitized = memories.map(({ embedding, ...rest }) => rest);

    return NextResponse.json(sanitized);
  } catch (error) {
    console.error("[memories/GET] Failed to list memories:", error);
    return NextResponse.json(
      { error: "Failed to list memories" },
      { status: 500 }
    );
  }
}

/** POST /api/memories — 手动添加记忆。 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      content?: string;
      category?: "preference" | "fact" | "behavior";
    };

    if (!body.content || !body.category) {
      return NextResponse.json(
        { error: "content and category are required" },
        { status: 400 }
      );
    }

    const validCategories = ["preference", "fact", "behavior"];
    if (!validCategories.includes(body.category)) {
      return NextResponse.json(
        { error: "category must be one of: preference, fact, behavior" },
        { status: 400 }
      );
    }

    const embedding = await generateEmbedding(body.content);

    const memory = await createMemory({
      userId: DEFAULT_USER_ID,
      content: body.content,
      category: body.category,
      embedding,
    });

    // 原因：从响应中排除嵌入向量，与 GET 接口保持一致
    const { embedding: _, ...sanitized } = memory;

    return NextResponse.json(sanitized, { status: 201 });
  } catch (error) {
    console.error("[memories/POST] Failed to create memory:", error);
    return NextResponse.json(
      { error: "Failed to create memory" },
      { status: 500 }
    );
  }
}
