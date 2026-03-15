import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return errorResponse("Not authorized", 403);
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
    const articleId = searchParams.get("articleId");

    const where = articleId ? { articleId } : {};

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, image: true } },
          article: { select: { id: true, title: true, slug: true } },
        },
      }),
      prisma.comment.count({ where }),
    ]);

    return successResponse({
      comments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    return errorResponse("Failed to fetch comments", 500);
  }
}
