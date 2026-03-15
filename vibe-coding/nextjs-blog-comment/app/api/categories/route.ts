import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createCategorySchema } from "@/lib/validations/category";
import { generateSlug } from "@/lib/slug";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { articles: true } } },
    });

    return successResponse({ data: categories });
  } catch {
    return errorResponse("Failed to fetch categories", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return errorResponse("Not authorized", 403);
    }

    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.issues);
    }

    const slug = generateSlug(parsed.data.name);

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return errorResponse("Category already exists", 409);
    }

    const category = await prisma.category.create({
      data: { name: parsed.data.name, slug },
    });

    return successResponse(category, 201);
  } catch {
    return errorResponse("Failed to create category", 500);
  }
}
