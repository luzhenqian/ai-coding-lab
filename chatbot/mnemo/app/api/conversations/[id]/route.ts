import { NextRequest, NextResponse } from "next/server";
import { softDeleteConversation } from "@/lib/db/queries/conversations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** 根据 ID 软删除对话。 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await softDeleteConversation(id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[conversations/DELETE] Failed to delete conversation:", err);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}
