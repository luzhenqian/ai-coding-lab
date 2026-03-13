import { NextResponse } from "next/server";
import { getDocumentById, deleteDocument } from "@/db/queries/documents";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const document = await getDocumentById(id);

  if (!document) {
    return NextResponse.json(
      { error: "Document not found." },
      { status: 404 }
    );
  }

  return NextResponse.json(document);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const document = await deleteDocument(id);

  if (!document) {
    return NextResponse.json(
      { error: "Document not found." },
      { status: 404 }
    );
  }

  return NextResponse.json(document);
}
