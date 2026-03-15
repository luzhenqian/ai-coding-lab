import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createArticleSchema } from "@/lib/validations/article";
import { generateSlug, ensureUniqueSlug } from "@/lib/slug";
import { successResponse, errorResponse } from "@/lib/api-response";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("pageSize") || "10"))
    );
    const tag = searchParams.get("tag");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: Prisma.ArticleWhereInput = {
      status: "PUBLISHED",
      deletedAt: null,
    };

    if (tag) {
      where.tags = { some: { tag: { slug: tag } } };
    }

    if (category) {
      where.category = { slug: category };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, image: true } },
          category: { select: { id: true, name: true, slug: true } },
          tags: {
            include: {
              tag: { select: { id: true, name: true, slug: true } },
            },
          },
        },
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.article.count({ where }),
    ]);

    const data = articles.map((article) => ({
      ...article,
      tags: article.tags.map((at) => at.tag),
    }));

    return successResponse({
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch {
    return errorResponse("Failed to fetch articles", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errorResponse("Not authenticated", 401);
    }

    if (session.user.role !== "AUTHOR" && session.user.role !== "ADMIN") {
      return errorResponse("Not authorized", 403);
    }

    const body = await request.json();
    const parsed = createArticleSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.issues);
    }

    const { tagIds, ...data } = parsed.data;
    const slug = data.slug || generateSlug(data.title);
    const uniqueSlug = await ensureUniqueSlug(slug);

    const article = await prisma.article.create({
      data: {
        ...data,
        slug: uniqueSlug,
        authorId: session.user.id,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        tags: {
          create: tagIds.map((tagId) => ({ tagId })),
        },
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
        category: { select: { id: true, name: true, slug: true } },
        tags: {
          include: {
            tag: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    revalidatePath("/");
    revalidatePath(`/posts/${uniqueSlug}`);

    return successResponse(
      { ...article, tags: article.tags.map((at) => at.tag) },
      201
    );
  } catch {
    return errorResponse("Failed to create article", 500);
  }
}
