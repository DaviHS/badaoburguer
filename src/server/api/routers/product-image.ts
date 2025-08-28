import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { productImages } from "@/server/db/schema";
import { db } from "@/server/db";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export const productImageRouter = createTRPCRouter({
  listByProduct: publicProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, input.productId))
        .orderBy(productImages.order);
    }),

  create: publicProcedure
    .input(
      z.object({
        productId: z.number(),
        url: z.string().url(),
        fileName: z.string(),
        fileSize: z.number().optional(),
        order: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [image] = await db
        .insert(productImages)
        .values({
          productId: input.productId,
          url: input.url,
          fileName: input.fileName,
          fileSize: input.fileSize,
          order: input.order ?? 0,
        })
        .returning();
      return { success: true, image };
    }),

  update: publicProcedure
    .input(
      z.object({
        imageId: z.number(),
        order: z.number().optional(),
        status: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [image] = await db
        .update(productImages)
        .set({
          order: input.order,
          status: input.status,
        })
        .where(eq(productImages.imageId, input.imageId))
        .returning();
      return { success: true, image };
    }),

  delete: publicProcedure
    .input(z.object({ imageId: z.number() }))
    .mutation(async ({ input }) => {
      const [image] = await db
        .select()
        .from(productImages)
        .where(eq(productImages.imageId, input.imageId));

      if (!image) throw new Error("Imagem não encontrada");

      try {
        await utapi.deleteFiles(image.url);
      } catch (err) {
        console.error(err);
      }

      await db.delete(productImages).where(eq(productImages.imageId, input.imageId));

      return { success: true };
    }),
});
