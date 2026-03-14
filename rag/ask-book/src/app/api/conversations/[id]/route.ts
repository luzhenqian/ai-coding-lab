import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getConversationById,
  deleteConversation,
  updateConversationTitle,
} from "@/db/queries/conversations";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  title: z.string().trim().min(1, "Title must not be empty.").max(100, "Title must be at most 100 characters."),
});

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

  return NextResponse.json(conversation);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const conversation = await updateConversationTitle(id, parsed.data.title);

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found." },
      { status: 404 }
    );
  }

  return NextResponse.json(conversation);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const conversation = await deleteConversation(id);

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found." },
      { status: 404 }
    );
  }

  return NextResponse.json(conversation);
}
