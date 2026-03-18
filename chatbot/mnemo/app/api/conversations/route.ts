import { NextResponse } from "next/server";
import {
  createConversation,
  listConversations,
} from "@/lib/db/queries/conversations";
import { DEFAULT_USER_ID } from "@/lib/constants";

/** List all non-deleted conversations for the default user. */
export async function GET() {
  try {
    const result = await listConversations(DEFAULT_USER_ID);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[conversations/GET] Failed to list conversations:", err);
    return NextResponse.json(
      { error: "Failed to load conversations" },
      { status: 500 }
    );
  }
}

/** Create a new conversation for the default user. */
export async function POST() {
  try {
    const conversation = await createConversation(DEFAULT_USER_ID);
    return NextResponse.json(conversation, { status: 201 });
  } catch (err) {
    console.error("[conversations/POST] Failed to create conversation:", err);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
