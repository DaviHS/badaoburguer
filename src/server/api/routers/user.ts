import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"
import { users } from "@/server/db/schema"
import { userSchema, userUpdateSchema } from "@/validators/user"
import { db } from "@/server/db"
import { hash } from "bcrypt-ts"
import { eq, isNull } from "drizzle-orm"
import { z } from "zod"

export const userRouter = createTRPCRouter({
  list: publicProcedure.query(async () => {
    const allUsers = await db
      .select()
      .from(users)
      .where(isNull(users.deletedAt))
      .orderBy(users.fullName)
    return allUsers
  }),

  getById: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.userId, input.userId))
        .limit(1)
      if (!user[0] || user[0].deletedAt) throw new Error("Usuário não encontrado")
      return user[0]
    }),

  create: publicProcedure.input(userSchema).mutation(async ({ input }) => {
    const { fullName, email, phone, cpf, birthDate, password, status, roleId } = input

    const existingCpf = await db.select().from(users).where(eq(users.cpf, cpf!)).limit(1)
    if (existingCpf.length > 0) throw new Error("Já existe um usuário cadastrado com este CPF")

    const existingEmail = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (existingEmail.length > 0) throw new Error("Já existe um usuário cadastrado com este email")

    const existingPhone = await db.select().from(users).where(eq(users.phone, phone!)).limit(1)
    if (existingPhone.length > 0) throw new Error("Já existe um usuário cadastrado com este telefone")

    const passwordHash = await hash(password, 10)

    const [user] = await db
      .insert(users)
      .values({
        fullName,
        email,
        phone,
        cpf,
        birthDate: birthDate ? new Date(birthDate) : null,
        passwordHash,
        status,
        roleId,
      })
      .returning()

    return { success: true, user }
  }),

  update: publicProcedure.input(userUpdateSchema).mutation(async ({ input }) => {
    const { userId, fullName, email, phone, cpf, birthDate, status, roleId } = input

    const [user] = await db
      .update(users)
      .set({
        fullName,
        email,
        phone,
        cpf,
        birthDate: birthDate ? new Date(birthDate) : null,
        status,
        roleId,
        updatedAt: new Date(),
      })
      .where(eq(users.userId, userId))
      .returning()

    return { success: true, user }
  }),

  delete: publicProcedure.input(z.object({ userId: z.number() })).mutation(async ({ input }) => {
    await db
      .update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.userId, input.userId))

    return { success: true }
  }),
})
