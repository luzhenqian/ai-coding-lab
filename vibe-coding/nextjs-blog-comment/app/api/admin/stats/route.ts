import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return errorResponse("Not authorized", 403);
    }

    const [articles, viewsResult, users, comments] = await Promise.all([
      prisma.article.count({
        where: { status: "PUBLISHED", deletedAt: null },
      }),
      prisma.article.aggregate({
        _sum: { viewCount: true },
        where: { deletedAt: null },
      }),
      prisma.user.count(),
      prisma.comment.count(),
    ]);

    return successResponse({
      articles,
      views: viewsResult._sum.viewCount || 0,
      users,
      comments,
    });
  } catch {
    return errorResponse("Failed to fetch stats", 500);
  }
}
