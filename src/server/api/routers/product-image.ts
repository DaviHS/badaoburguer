import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { productImages } from "@/server/db/schema";
import { db } from "@/server/db";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
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
      // Verificar quantas imagens já existem para definir a ordem
      const existingImages = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, input.productId));

      const [image] = await db
        .insert(productImages)
        .values({
          productId: input.productId,
          url: input.url,
          fileName: input.fileName,
          fileSize: input.fileSize,
          order: input.order ?? existingImages.length,
          status: 1,
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
          updatedAt: new Date(),
        })
        .where(eq(productImages.imageId, input.imageId)) // ← imageId é number, não undefined
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
        // Extrair a key do URL do UploadThing - CORREÇÃO AQUI
        const url = new URL(image.url);
        const pathname = url.pathname;
        const fileKey = pathname.split('/').pop(); // Pega a última parte do caminho
        
        if (fileKey) {
          await utapi.deleteFiles(fileKey);
        }
      } catch (err) {
        console.error("Erro ao deletar arquivo:", err);
      }

      await db
        .delete(productImages)
        .where(eq(productImages.imageId, input.imageId));

      return { success: true };
    }),

  reorder: publicProcedure
    .input(z.object({
      productId: z.number(),
      imageIds: z.array(z.number())
    }))
    .mutation(async ({ input }) => {
      const validImageIds = input.imageIds.filter((id): id is number => 
        typeof id === 'number' && !isNaN(id)
      );

      for (let i = 0; i < validImageIds.length; i++) {
        const imageId = validImageIds[i];
        if (typeof imageId === 'number' && !isNaN(imageId)) {
          await db
            .update(productImages)
            .set({ order: i })
            .where(eq(productImages.imageId, imageId));
        }
      }
      
      return { success: true };
    }),
  listAll: publicProcedure
    .query(async () => {
      return await db
        .select()
        .from(productImages)
        .orderBy(productImages.productId, productImages.order);
    }),
});