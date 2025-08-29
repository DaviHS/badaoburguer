import { z } from "zod";

export const userRoleInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  isAdmin: z.boolean().optional().default(false),
});

export const userRoleUpdateSchema = userRoleInputSchema.extend({
  roleId: z.number(),
});

export type UserRoleInput = z.infer<typeof userRoleInputSchema>;
export type UserRoleUpdateInput = z.infer<typeof userRoleUpdateSchema>;
