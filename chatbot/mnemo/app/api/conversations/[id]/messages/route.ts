import { NextRequest, NextResponse } from "next/server";
import { listMessagesByConversation } from "@/lib/db/queries/messages";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** List all messages for a conversation, ordered by creation time. */
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
