import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createTagSchema } from "@/lib/validations/category";
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
    const parsed = createTagSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.issues);
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: { name: parsed.data.name, slug: generateSlug(parsed.data.name) },
    });

    return successResponse(tag);
  } catch {
    return errorResponse("Failed to update tag", 500);
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

    const articleCount = await prisma.articleTag.count({
      where: { tagId: id },
    });

    if (articleCount > 0) {
      return errorResponse(
        `Cannot delete tag: ${articleCount} article(s) are using it`,
        400
      );
    }

    await prisma.tag.delete({ where: { id } });
    return successResponse({ message: "Tag deleted." });
  } catch {
    return errorResponse("Failed to delete tag", 500);
  }
}
