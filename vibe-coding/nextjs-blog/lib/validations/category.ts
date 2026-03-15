import { z } from "zod/v4";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const createTagSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
