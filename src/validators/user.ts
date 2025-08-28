import { z } from "zod"

export const userSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  birthDate: z.string().optional(), 
  password: z.string().min(6),
  status: z.number().optional().default(1),
  type: z.number().optional().default(0),
})

export const userUpdateSchema = z.object({
  userId: z.number(),
  fullName: z.string().min(3),
  email: z.string().email(),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  birthDate: z.string().optional(),
  status: z.number().optional(),
  type: z.number().optional(),
})

export type UserInput = z.infer<typeof userSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>
