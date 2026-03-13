import { NextResponse } from "next/server";
import { getDocumentByFilename } from "@/db/queries/documents";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json(
      { error: "Missing 'name' query parameter." },
      { status: 400 }
    );
  }

  const document = await getDocumentByFilename(name);

  if (!document) {
    return NextResponse.json(
      { error: "Document not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ id: document.id, filename: document.filename });
}
