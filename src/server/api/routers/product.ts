import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"; 
import { categories, products } from "@/server/db/schema";
import { db } from "@/server/db";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { productSchema, productUpdateSchema } from "@/validators/product";

export const productRouter = createTRPCRouter({
  list: publicProcedure.query(async () => {
    return await db
      .select()
      .from(products)
      .where(eq(products.status, 1)) 
      .orderBy(products.name);
  }),

  getById: publicProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.productId, input.productId));
      if (!product) throw new Error("Produto não encontrado");
      return product;
    }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().nullable().optional(),
        categoryId: z.number(),
        price: z.number(),
        status: z.number().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [category] = await db
        .select()
        .from(categories)
        .where(eq(categories.categoryId, input.categoryId))
        .limit(1);

      if (!category) throw new Error("Categoria não encontrada");

      const prefix = category.code.toUpperCase();

      const existing = await db
        .select()
        .from(products)
        .where(eq(products.categoryId, input.categoryId));

      const nextNumber = (existing.length + 1).toString().padStart(3, "0");

      const code = `${prefix}-${nextNumber}`; 

      const [product] = await db
        .insert(products)
        .values({
          name: input.name,
          description: input.description,
          categoryId: input.categoryId,
          price: input.price.toString(),
          code,
          status: input.status ?? 1,
        })
        .returning();

      if (!product) throw new Error("Falha ao criar produto");

      return { success: true, product };
    }),

  update: publicProcedure
    .input(productUpdateSchema)
    .mutation(async ({ input }) => {
      const { productId, price, ...data } = input;
      const [product] = await db
        .update(products)
        .set({ ...data, price: price.toString() })
        .where(eq(products.productId, productId))
        .returning();
      return { success: true, product };
    }),

  updateStock: publicProcedure
    .input(
      z.object({
        productId: z.number(),
        stock: z.number().min(0),
      }),
    )
    .mutation(async ({ input }) => {
      const [product] = await db
        .update(products)
        .set({ stock: input.stock })
        .where(eq(products.productId, input.productId))
        .returning();
      return { success: true, product };
    }),

  delete: publicProcedure
    .input(z.object({ productId: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .update(products)
        .set({ status: 0 }) // 👈 muda o status de ativo (1) para inativo (0)
        .where(eq(products.productId, input.productId));

      return { success: true };
    }),
});
