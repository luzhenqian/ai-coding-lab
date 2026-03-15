import { z } from "zod/v4";

export const createArticleSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  summary: z.string().max(500).optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
  categoryId: z.string().min(1, "Category is required"),
  tagIds: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoImage: z.string().url().optional().or(z.literal("")),
});

export const updateArticleSchema = createArticleSchema.partial();

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
