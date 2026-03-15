import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { revalidatePath } from "next/cache";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return errorResponse("Not authorized", 403);
    }

    const { id } = await params;

    const article = await prisma.article.findUnique({
      where: { id },
      select: { deletedAt: true, slug: true },
    });

    if (!article || !article.deletedAt) {
      return errorResponse("Article not found or not deleted", 404);
    }

    const restored = await prisma.article.update({
      where: { id },
      data: { deletedAt: null },
    });

    revalidatePath("/");
    revalidatePath(`/posts/${restored.slug}`);

    return successResponse(restored);
  } catch {
    return errorResponse("Failed to restore article", 500);
  }
}
