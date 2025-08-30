import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"
import { db } from "@/server/db"
import { orders, orderItems, products, orderStatus, users } from "@/server/db/schema"
import { eq, desc } from "drizzle-orm"
import { z } from "zod"

export const orderRouter = createTRPCRouter({
  list: publicProcedure.query(async () => {
    const ordersWithDetails = await db
      .select({
        orderId: orders.orderId,
        userId: orders.userId,
        total: orders.total,
        status: orders.status,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        statusName: orderStatus.name,
        statusDescription: orderStatus.description,
        customerName: users.fullName,
        customerPhone: users.phone,
        customerEmail: users.email,
      })
      .from(orders)
      .leftJoin(orderStatus, eq(orders.status, orderStatus.statusId))
      .leftJoin(users, eq(orders.userId, users.userId))
      .orderBy(desc(orders.createdAt))

    const ordersWithItems = await Promise.all(
      ordersWithDetails.map(async (order) => {
        const items = await db
          .select({
            orderItemId: orderItems.orderItemId,
            productId: orderItems.productId,
            quantity: orderItems.quantity,
            price: orderItems.price,
            productName: products.name,
          })
          .from(orderItems)
          .leftJoin(products, eq(orderItems.productId, products.productId))
          .where(eq(orderItems.orderId, order.orderId))

        return {
          ...order,
          items,
        }
      }),
    )

    return ordersWithItems
  }),

  getById: publicProcedure.input(z.object({ orderId: z.number() })).query(async ({ input }) => {
    const orderDetails = await db
      .select({
        orderId: orders.orderId,
        userId: orders.userId,
        total: orders.total,
        status: orders.status,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        statusName: orderStatus.name,
        customerName: users.fullName,
        customerPhone: users.phone,
        customerEmail: users.email,
      })
      .from(orders)
      .leftJoin(orderStatus, eq(orders.status, orderStatus.statusId))
      .leftJoin(users, eq(orders.userId, users.userId))
      .where(eq(orders.orderId, input.orderId))

    const order = orderDetails[0]
    if (!order) throw new Error("Pedido não encontrado")

    const items = await db
      .select({
        orderItemId: orderItems.orderItemId,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        productName: products.name,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.productId))
      .where(eq(orderItems.orderId, input.orderId))

    return { ...order, items }
  }),

  create: publicProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.number(),
            quantity: z.number().min(1),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      let total = 0

      // Validar produtos e calcular total
      for (const item of input.items) {
        const productsFound = await db.select().from(products).where(eq(products.productId, item.productId))

        const product = productsFound[0]
        if (!product) throw new Error(`Produto ${item.productId} não encontrado`)
        // if (product.stock < item.quantity) {
        //   throw new Error(`Estoque insuficiente para ${product.name}`)
        // }

        total += Number(product.price) * item.quantity
      }

      // Criar pedido
      const createdOrders = await db
        .insert(orders)
        .values({
          userId: ctx.session?.user.userId,
          total: total.toString(),
          status: 0, // Pendente
        })
        .returning()

      const order = createdOrders[0]
      if (!order) throw new Error("Falha ao criar pedido")

      // Criar itens do pedido e atualizar estoque
      for (const item of input.items) {
        const productsFound = await db.select().from(products).where(eq(products.productId, item.productId))

        const product = productsFound[0]
        if (!product) continue

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
      // Validar se status existe
      const statuses = await db.select().from(orderStatus).where(eq(orderStatus.statusId, input.statusId))

      const status = statuses[0]
      if (!status) throw new Error("Status inválido")

      // Atualizar pedido
      const updatedOrders = await db
        .update(orders)
        .set({
          status: input.statusId,
          updatedAt: new Date(),
        })
        .where(eq(orders.orderId, input.orderId))
        .returning()

      const order = updatedOrders[0]
      if (!order) throw new Error("Pedido não encontrado")

      return { success: true, order }
    }),

  getStatuses: publicProcedure.query(async () => {
    return await db.select().from(orderStatus).orderBy(orderStatus.statusId)
  }),

  delete: publicProcedure.input(z.object({ orderId: z.number() })).mutation(async ({ input }) => {
    await db.delete(orderItems).where(eq(orderItems.orderId, input.orderId))
    await db.delete(orders).where(eq(orders.orderId, input.orderId))
    return { success: true }
  }),
})
