import { NextResponse } from "next/server";
import { getDocumentFileData } from "@/db/queries/documents";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const document = await getDocumentFileData(id);

  if (!document) {
    return NextResponse.json(
      { error: "Document not found." },
      { status: 404 }
    );
  }

  if (!document.fileData) {
    return NextResponse.json(
      { error: "File data not available for this document." },
      { status: 404 }
    );
  }

  return new Response(new Uint8Array(document.fileData), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${encodeURIComponent(document.filename)}"`,
      "Content-Length": String(document.fileData.length),
    },
  });
}
