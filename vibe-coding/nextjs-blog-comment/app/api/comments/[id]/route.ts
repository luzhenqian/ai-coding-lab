import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updateCommentSchema } from "@/lib/validations/comment";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Not authenticated", 401);

    const { id } = await params;

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) return errorResponse("Comment not found", 404);

    if (comment.userId !== session.user.id) {
      return errorResponse("Not authorized", 403);
    }

    const body = await request.json();
    const parsed = updateCommentSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.issues);
    }

    const updated = await prisma.comment.update({
      where: { id },
      data: { content: parsed.data.content },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return successResponse(updated);
  } catch {
    return errorResponse("Failed to update comment", 500);
  }
}

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

    const isCommentAuthor = comment.userId === session.user.id;
    const isArticleAuthor = comment.article.authorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isCommentAuthor && !isArticleAuthor && !isAdmin) {
      return errorResponse("Not authorized", 403);
    }

    // Cascade delete is handled by Prisma's onDelete: Cascade on the parentId relation
    await prisma.comment.delete({ where: { id } });

    return successResponse({ message: "Comment deleted." });
  } catch {
    return errorResponse("Failed to delete comment", 500);
  }
}
