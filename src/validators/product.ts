import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().nullable().optional(),
  price: z.number(),
  categoryId: z.number(),
  stock: z.number().optional(),
  minStock: z.number().optional(),
  status: z.number().nullable().optional(),
});

export const productUpdateSchema = z.object({
  productId: z.number(),
  name: z.string().min(1),
  code: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  price: z.number(),
  categoryId: z.number(),
  stock: z.number().optional(),
  minStock: z.number().optional(),
  status: z.number().nullable().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
