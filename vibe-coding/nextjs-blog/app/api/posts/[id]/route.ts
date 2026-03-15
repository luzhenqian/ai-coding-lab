import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updateArticleSchema } from "@/lib/validations/article";
import { generateSlug, ensureUniqueSlug } from "@/lib/slug";
import { successResponse, errorResponse } from "@/lib/api-response";
import { revalidatePath } from "next/cache";

type RouteParams = { params: Promise<{ id: string }> };

const articleInclude = {
  author: { select: { id: true, name: true, image: true } },
  category: { select: { id: true, name: true, slug: true } },
  tags: {
    include: {
      tag: { select: { id: true, name: true, slug: true } },
    },
  },
};

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const article = await prisma.article.findFirst({
      where: { OR: [{ id }, { slug: id }], deletedAt: null },
      include: {
        ...articleInclude,
        comments: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!article) {
      return errorResponse("Article not found", 404);
    }

    if (article.status !== "PUBLISHED") {
      const session = await auth();
      if (
        !session?.user ||
        (session.user.id !== article.authorId &&
          session.user.role !== "ADMIN")
      ) {
        return errorResponse("Article not found", 404);
      }
    }

    return successResponse({
      ...article,
      tags: article.tags.map((at) => at.tag),
    });
  } catch {
    return errorResponse("Failed to fetch article", 500);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Not authenticated", 401);

    const { id } = await params;

    const article = await prisma.article.findUnique({
      where: { id },
      select: { authorId: true, slug: true, status: true },
    });

    if (!article || article.authorId === undefined) {
      return errorResponse("Article not found", 404);
    }

    if (
      session.user.id !== article.authorId &&
      session.user.role !== "ADMIN"
    ) {
      return errorResponse("Not authorized", 403);
    }

    const body = await request.json();
    const parsed = updateArticleSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.issues);
    }

    const { tagIds, ...data } = parsed.data;

    if (data.slug && data.slug !== article.slug) {
      data.slug = await ensureUniqueSlug(data.slug, id);
    } else if (data.title && !data.slug) {
      // Keep existing slug if only title changed
    }

    const updateData: Record<string, unknown> = { ...data };

    if (data.status === "PUBLISHED" && article.status !== "PUBLISHED") {
      updateData.publishedAt = new Date();
    } else if (data.status === "DRAFT" && article.status === "PUBLISHED") {
      updateData.publishedAt = null;
    }

    if (tagIds !== undefined) {
      await prisma.articleTag.deleteMany({ where: { articleId: id } });
      updateData.tags = {
        create: tagIds.map((tagId: string) => ({ tagId })),
      };
    }

    const updated = await prisma.article.update({
      where: { id },
      data: updateData,
      include: articleInclude,
    });

    revalidatePath("/");
    revalidatePath(`/posts/${updated.slug}`);

    return successResponse({
      ...updated,
      tags: updated.tags.map((at) => at.tag),
    });
  } catch {
    return errorResponse("Failed to update article", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Not authenticated", 401);

    const { id } = await params;

    const article = await prisma.article.findUnique({
      where: { id },
      select: { authorId: true, slug: true, deletedAt: true },
    });

    if (!article || article.deletedAt) {
      return errorResponse("Article not found", 404);
    }

    if (
      session.user.id !== article.authorId &&
      session.user.role !== "ADMIN"
    ) {
      return errorResponse("Not authorized", 403);
    }

    await prisma.article.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/");
    revalidatePath(`/posts/${article.slug}`);

    return successResponse({ message: "Article deleted successfully." });
  } catch {
    return errorResponse("Failed to delete article", 500);
  }
}
