import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { sendPasswordResetEmail } from "@/lib/email";
import { eq, and, gt } from "drizzle-orm";
import { users } from "@/server/db/schema";
import { hash } from "bcrypt-ts";
import crypto from "node:crypto";

export const authRouter = createTRPCRouter({
  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      if (!user) return { success: true };

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 3600 * 1000);

      await ctx.db
        .update(users)
        .set({
          resetToken: token,
          resetTokenExpires: expiresAt,
        })
        .where(eq(users.userId, user.userId));

      await sendPasswordResetEmail(user.email, token);

      return { success: true };
    }),

  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        newPassword: z.string().min(8),
        confirmPassword: z.string().min(8),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.newPassword !== input.confirmPassword) {
        throw new Error("As senhas não coincidem");
      }

      const user = await ctx.db.query.users.findFirst({
        where: and(
          eq(users.resetToken, input.token),
          gt(users.resetTokenExpires, new Date())
        ),
      });

      if (!user) {
        throw new Error("Token inválido ou expirado");
      }

      const passwordHash = await hash(input.newPassword, 10);

      await ctx.db
        .update(users)
        .set({
          passwordHash,
          resetToken: null,
          resetTokenExpires: null,
        })
        .where(eq(users.userId, user.userId));

      return { success: true };
    }),
});
