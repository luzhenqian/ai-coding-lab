import { NextRequest, NextResponse } from "next/server";
import { deleteDocument } from "@/lib/db/queries/documents";

/** DELETE /api/documents/[id] — delete a document and its chunks (cascade). */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteDocument(id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[documents/DELETE] Failed to delete document:", err);
    return NextResponse.json(
      { error: "删除文档失败" },
      { status: 500 }
    );
  }
}
