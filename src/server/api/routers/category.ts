import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { categories } from "@/server/db/schema";
import { db } from "@/server/db";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { categorySchema, categoryUpdateSchema } from "@/validators/category";

export const categoryRouter = createTRPCRouter({
  list: publicProcedure.query(async () => {
    return await db.select().from(categories).orderBy(categories.name);
  }),

  getById: publicProcedure
    .input(z.object({ categoryId: z.number() }))
    .query(async ({ input }) => {
      const [category] = await db.select().from(categories).where(eq(categories.categoryId, input.categoryId));
      if (!category) throw new Error("Categoria não encontrada");
      return category;
    }),

  create: publicProcedure
    .input(categorySchema)
    .mutation(async ({ input }) => {
      const [category] = await db.insert(categories).values(input).returning();
      return { success: true, category };
    }),

  update: publicProcedure
    .input(categoryUpdateSchema)
    .mutation(async ({ input }) => {
      const { categoryId, ...data } = input;
      const [category] = await db.update(categories).set(data).where(eq(categories.categoryId, categoryId)).returning();
      return { success: true, category };
    }),

  delete: publicProcedure
    .input(z.object({ categoryId: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(categories).where(eq(categories.categoryId, input.categoryId));
      return { success: true };
    }),
});
