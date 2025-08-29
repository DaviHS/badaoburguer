import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { userRoles } from "@/server/db/schema";
import { db } from "@/server/db";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { userRoleInputSchema, userRoleUpdateSchema } from "@/validators/userRoles";

export const userRoleRouter = createTRPCRouter({
  list: publicProcedure.query(async () => {
    return await db.select().from(userRoles).orderBy(userRoles.name);
  }),

  getById: publicProcedure
    .input(z.object({ roleId: z.number() }))
    .query(async ({ input }) => {
      const [role] = await db
        .select()
        .from(userRoles)
        .where(eq(userRoles.roleId, input.roleId));
      if (!role) throw new Error("Role não encontrada");
      return role;
    }),

  create: publicProcedure
    .input(userRoleInputSchema)
    .mutation(async ({ input }) => {
      const [role] = await db.insert(userRoles).values(input).returning();
      return { success: true, role };
    }),

  update: publicProcedure
    .input(userRoleUpdateSchema)
    .mutation(async ({ input }) => {
      const { roleId, ...data } = input;
      const [role] = await db
        .update(userRoles)
        .set(data)
        .where(eq(userRoles.roleId, roleId))
        .returning();
      return { success: true, role };
    }),

  delete: publicProcedure
    .input(z.object({ roleId: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(userRoles).where(eq(userRoles.roleId, input.roleId));
      return { success: true };
    }),
});
