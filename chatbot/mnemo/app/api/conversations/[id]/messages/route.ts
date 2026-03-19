import { NextRequest, NextResponse } from "next/server";
import { listMessagesByConversation } from "@/lib/db/queries/messages";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** 列出对话的所有消息，按创建时间排序。 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const result = await listMessagesByConversation(id);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[messages/GET] Failed to list messages:", err);
    return NextResponse.json(
      { error: "Failed to load messages" },
      { status: 500 }
    );
  }
}
