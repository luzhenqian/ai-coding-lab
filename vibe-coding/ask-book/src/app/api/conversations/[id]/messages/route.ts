import { NextResponse } from "next/server";
import { getConversationById } from "@/db/queries/conversations";
import { getMessagesByConversationId } from "@/db/queries/messages";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const conversation = await getConversationById(id);

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found." },
      { status: 404 }
    );
  }

  const messages = await getMessagesByConversationId(id);
  return NextResponse.json(messages);
}
