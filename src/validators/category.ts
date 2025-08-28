import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
  status: z.number().optional(),
});

export const categoryUpdateSchema = z.object({
  categoryId: z.number(),
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
  status: z.number().optional(),
});

export type CategorytInput = z.infer<typeof categorySchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
