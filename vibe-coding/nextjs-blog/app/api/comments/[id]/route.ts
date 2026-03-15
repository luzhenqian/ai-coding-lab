import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Not authenticated", 401);

    const { id } = await params;

    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        article: { select: { authorId: true } },
      },
    });

    if (!comment) return errorResponse("Comment not found", 404);

    const isArticleAuthor = comment.article.authorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isArticleAuthor && !isAdmin) {
      return errorResponse("Not authorized", 403);
    }

    await prisma.comment.delete({ where: { id } });

    return successResponse({ message: "Comment deleted." });
  } catch {
    return errorResponse("Failed to delete comment", 500);
  }
}
