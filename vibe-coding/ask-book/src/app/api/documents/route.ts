import { NextResponse } from "next/server";
import { listDocuments } from "@/db/queries/documents";

export const dynamic = "force-dynamic";

export async function GET() {
  const documents = await listDocuments();
  return NextResponse.json(documents);
}
