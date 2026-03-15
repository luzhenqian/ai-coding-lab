import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod/v4";
import { successResponse, errorResponse } from "@/lib/api-response";

const updateRoleSchema = z.object({
  role: z.enum(["READER", "AUTHOR", "ADMIN"]),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return errorResponse("Not authorized", 403);
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateRoleSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.issues);
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role: parsed.data.role },
      select: { id: true, name: true, email: true, role: true },
    });

    return successResponse(user);
  } catch {
    return errorResponse("Failed to update user", 500);
  }
}
