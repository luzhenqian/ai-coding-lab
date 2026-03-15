import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createCommentSchema } from "@/lib/validations/comment";
import { successResponse, errorResponse } from "@/lib/api-response";

const userSelect = { id: true, name: true, image: true } as const;

function buildRepliesInclude(depth: number): Record<string, unknown> {
  if (depth <= 0) return {};
  return {
    replies: {
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: userSelect },
        ...buildRepliesInclude(depth - 1),
      },
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get("articleId");
    const cursor = searchParams.get("cursor");
    const take = 20;

    if (!articleId) {
      return errorResponse("articleId is required", 400);
    }

    const comments = await prisma.comment.findMany({
      where: { articleId, parentId: null },
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: userSelect },
        ...buildRepliesInclude(5),
      },
    });

    const hasMore = comments.length > take;
    const data = hasMore ? comments.slice(0, take) : comments;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return successResponse({ comments: data, nextCursor });
  } catch {
    return errorResponse("Failed to fetch comments", 500);
  }
}

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

    if (parsed.data.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parsed.data.parentId },
      });

      if (!parentComment || parentComment.articleId !== parsed.data.articleId) {
        return errorResponse("Parent comment not found", 404);
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: parsed.data.content,
        articleId: parsed.data.articleId,
        userId: session.user.id,
        ...(parsed.data.parentId ? { parentId: parsed.data.parentId } : {}),
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
