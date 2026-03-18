import { NextRequest, NextResponse } from "next/server";
import { listMemoriesByUser, createMemory } from "@/lib/db/queries/memories";
import { generateEmbedding } from "@/lib/utils/embeddings";
import { DEFAULT_USER_ID } from "@/lib/constants";

/** GET /api/memories — list all memories for the current user. */
export async function GET() {
  try {
    const memories = await listMemoriesByUser(DEFAULT_USER_ID);

    // Why: exclude the embedding vector from the response — it's large
    // (1536 floats) and not useful for the client UI
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

/** POST /api/memories — manually add a memory. */
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

    // Why: exclude embedding from response for consistency with GET
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
