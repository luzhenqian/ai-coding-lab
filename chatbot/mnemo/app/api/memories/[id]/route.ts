import { NextRequest, NextResponse } from "next/server";
import { updateMemory, deleteMemory } from "@/lib/db/queries/memories";
import { generateEmbedding } from "@/lib/utils/embeddings";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** PUT /api/memories/:id — update a memory's content and/or category. */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = (await request.json()) as {
      content?: string;
      category?: "preference" | "fact" | "behavior";
    };

    if (!body.content && !body.category) {
      return NextResponse.json(
        { error: "At least one of content or category is required" },
        { status: 400 }
      );
    }

    if (body.category) {
      const validCategories = ["preference", "fact", "behavior"];
      if (!validCategories.includes(body.category)) {
        return NextResponse.json(
          { error: "category must be one of: preference, fact, behavior" },
          { status: 400 }
        );
      }
    }

    const updateData: {
      content?: string;
      category?: "preference" | "fact" | "behavior";
      embedding?: number[];
    } = {};

    if (body.content) {
      updateData.content = body.content;
      // Why: re-generate embedding when content changes so similarity
      // search stays accurate with the updated text
      updateData.embedding = await generateEmbedding(body.content);
    }
    if (body.category) {
      updateData.category = body.category;
    }

    const memory = await updateMemory(id, updateData);

    if (!memory) {
      return NextResponse.json(
        { error: "Memory not found" },
        { status: 404 }
      );
    }

    // Why: exclude embedding from response for consistency
    const { embedding: _, ...sanitized } = memory;

    return NextResponse.json(sanitized);
  } catch (error) {
    console.error("[memories/PUT] Failed to update memory:", error);
    return NextResponse.json(
      { error: "Failed to update memory" },
      { status: 500 }
    );
  }
}

/** DELETE /api/memories/:id — delete a memory. */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deleteMemory(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[memories/DELETE] Failed to delete memory:", error);
    return NextResponse.json(
      { error: "Failed to delete memory" },
      { status: 500 }
    );
  }
}
