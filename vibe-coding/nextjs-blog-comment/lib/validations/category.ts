import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  slug: z.string().optional(),
});

export const createTagSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  slug: z.string().optional(),
});
