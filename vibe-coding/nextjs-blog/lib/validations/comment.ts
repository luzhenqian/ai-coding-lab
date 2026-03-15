import { z } from "zod/v4";

export const createCommentSchema = z.object({
  articleId: z.string().min(1, "Article ID is required"),
  content: z.string().min(1, "Content is required").max(2000),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
