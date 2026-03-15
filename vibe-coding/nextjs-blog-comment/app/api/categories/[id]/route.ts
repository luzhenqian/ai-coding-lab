import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createCategorySchema } from "@/lib/validations/category";
import { generateSlug } from "@/lib/slug";
import { successResponse, errorResponse } from "@/lib/api-response";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return errorResponse("Not authorized", 403);
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.issues);
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name: parsed.data.name, slug: generateSlug(parsed.data.name) },
    });

    return successResponse(category);
  } catch {
    return errorResponse("Failed to update category", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return errorResponse("Not authorized", 403);
    }

    const { id } = await params;

    const articleCount = await prisma.article.count({
      where: { categoryId: id },
    });

    if (articleCount > 0) {
      return errorResponse(
        `Cannot delete category: ${articleCount} article(s) are assigned to it`,
        400
      );
    }

    await prisma.category.delete({ where: { id } });
    return successResponse({ message: "Category deleted." });
  } catch {
    return errorResponse("Failed to delete category", 500);
  }
}
