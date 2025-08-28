import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"
import { db } from "@/server/db"
import { orders, orderItems, products, orderStatus } from "@/server/db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"

export const orderRouter = createTRPCRouter({
  list: publicProcedure.query(async () => {
    return await db.select().from(orders).orderBy(orders.createdAt)
  }),

  getById: publicProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input }) => {
      const result = await db.select().from(orders).where(eq(orders.orderId, input.orderId))
      const order = result[0]
      if (!order) throw new Error("Pedido não encontrado")
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, input.orderId))
      return { ...order, items }
    }),

  create: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        items: z.array(
          z.object({
            productId: z.number(),
            quantity: z.number().min(1),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      let total = 0
      for (const item of input.items) {
        const productsFound = await db.select().from(products).where(eq(products.productId, item.productId))
        const product = productsFound[0]
        if (!product) throw new Error(`Produto ${item.productId} não encontrado`)
        total += Number(product.price) * item.quantity
      }

      const createdOrders = await db
        .insert(orders)
        .values({
          userId: input.userId,
          total: total.toString(),
          status: 0,
        })
        .returning()

      const order = createdOrders[0]
      if (!order) throw new Error("Falha ao criar pedido")

      for (const item of input.items) {
        const productsFound = await db.select().from(products).where(eq(products.productId, item.productId))
        const product = productsFound[0]
        if (!product) throw new Error(`Produto ${item.productId} não encontrado`)

        await db.insert(orderItems).values({
          orderId: order.orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        })

        await db
          .update(products)
          .set({ stock: product.stock - item.quantity })
          .where(eq(products.productId, item.productId))
      }

      return { success: true, orderId: order.orderId }
    }),

  updateStatus: publicProcedure
    .input(
      z.object({
        orderId: z.number(),
        statusId: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const statuses = await db.select().from(orderStatus).where(eq(orderStatus.statusId, input.statusId))
      const status = statuses[0]
      if (!status) throw new Error("Status inválido")

      const updatedOrders = await db
        .update(orders)
        .set({ status: input.statusId })
        .where(eq(orders.orderId, input.orderId))
        .returning()

      const order = updatedOrders[0]
      if (!order) throw new Error("Pedido não encontrado")

      return { success: true, order }
    }),

  delete: publicProcedure
    .input(z.object({ orderId: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(orderItems).where(eq(orderItems.orderId, input.orderId))
      await db.delete(orders).where(eq(orders.orderId, input.orderId))
      return { success: true }
    }),
})
