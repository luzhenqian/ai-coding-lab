import slugify from "slugify";
import { prisma } from "@/lib/prisma";

export function generateSlug(text: string): string {
  return slugify(text, { lower: true, strict: true });
}

export async function ensureUniqueSlug(
  slug: string,
  excludeId?: string
): Promise<string> {
  let candidate = slug;
  let counter = 1;

  while (true) {
    const existing = await prisma.article.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    if (!existing) return candidate;
    candidate = `${slug}-${counter}`;
    counter++;
  }
}
