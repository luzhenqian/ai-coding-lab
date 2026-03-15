import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return errorResponse("Not authorized", 403);
    }

    const articles = await prisma.article.findMany({
      where: {
        comments: { some: {} },
      },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    });

    return successResponse(articles);
  } catch {
    return errorResponse("Failed to fetch articles", 500);
  }
}
