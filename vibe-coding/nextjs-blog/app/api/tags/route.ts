import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createTagSchema } from "@/lib/validations/category";
import { generateSlug } from "@/lib/slug";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { articles: true } } },
    });

    return successResponse({ data: tags });
  } catch {
    return errorResponse("Failed to fetch tags", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return errorResponse("Not authorized", 403);
    }

    const body = await request.json();
    const parsed = createTagSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.issues);
    }

    const slug = generateSlug(parsed.data.name);

    const existing = await prisma.tag.findUnique({ where: { slug } });
    if (existing) {
      return errorResponse("Tag already exists", 409);
    }

    const tag = await prisma.tag.create({
      data: { name: parsed.data.name, slug },
    });

    return successResponse(tag, 201);
  } catch {
    return errorResponse("Failed to create tag", 500);
  }
}
