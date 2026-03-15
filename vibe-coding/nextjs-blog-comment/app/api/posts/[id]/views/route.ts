import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const article = await prisma.article.findUnique({
      where: { id, deletedAt: null, status: "PUBLISHED" },
      select: { id: true, viewCount: true },
    });

    if (!article) {
      return errorResponse("Article not found", 404);
    }

    const cookieName = "viewed_posts";
    const viewedCookie = request.cookies.get(cookieName)?.value;
    let viewedPosts: string[] = [];

    try {
      viewedPosts = viewedCookie ? JSON.parse(viewedCookie) : [];
    } catch {
      viewedPosts = [];
    }

    if (viewedPosts.includes(id)) {
      return successResponse({ viewCount: article.viewCount });
    }

    const updated = await prisma.article.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      select: { viewCount: true },
    });

    viewedPosts.push(id);
    const response = successResponse({ viewCount: updated.viewCount });
    response.cookies.set(cookieName, JSON.stringify(viewedPosts), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch {
    return errorResponse("Failed to increment view count", 500);
  }
}
