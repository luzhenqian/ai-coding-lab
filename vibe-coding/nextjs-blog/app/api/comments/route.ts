import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createCommentSchema } from "@/lib/validations/comment";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Not authenticated", 401);

    const body = await request.json();
    const parsed = createCommentSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.issues);
    }

    const article = await prisma.article.findFirst({
      where: {
        id: parsed.data.articleId,
        status: "PUBLISHED",
        deletedAt: null,
      },
    });

    if (!article) {
      return errorResponse("Article not found", 404);
    }

    const comment = await prisma.comment.create({
      data: {
        content: parsed.data.content,
        articleId: parsed.data.articleId,
        userId: session.user.id,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return successResponse(comment, 201);
  } catch {
    return errorResponse("Failed to create comment", 500);
  }
}
