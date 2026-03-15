import slugify from "slugify";
import { prisma } from "@/lib/prisma";

export function generateSlug(title: string): string {
  return slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  });
}

export async function ensureUniqueSlug(
  slug: string,
  existingId?: string
): Promise<string> {
  let candidate = slug;
  let counter = 1;

  while (true) {
    const existing = await prisma.article.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === existingId) {
      return candidate;
    }

    counter++;
    candidate = `${slug}-${counter}`;
  }
}
