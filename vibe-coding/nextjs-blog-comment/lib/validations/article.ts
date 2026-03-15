import { z } from "zod";

export const createArticleSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1),
  content: z.string().min(1),
  summary: z.string().max(500).optional(),
  coverImage: z.string().optional(),
  categoryId: z.string().min(1),
  tagIds: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoImage: z.string().optional(),
});

export const updateArticleSchema = createArticleSchema.partial();
