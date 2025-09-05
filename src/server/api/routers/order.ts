import { getErrorMessage } from "@/lib/helper/error"
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"
import { db } from "@/server/db"
import { orders, orderItems, products, orderStatus, users } from "@/server/db/schema"
import { NotificationService } from "@/services/notification-service"
import { OrderStatusService } from "@/services/order-status-service"
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
        paymentMethod: orders.paymentMethod,
        observations: orders.observations,
        paymentId: orders.paymentId,
        paymentStatus: orders.paymentStatus,
        userFullName: users.fullName,
        userPhone: users.phone,
        userEmail: users.email,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        statusName: orderStatus.name,
        statusDescription: orderStatus.description,
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
          customerName: order.userFullName,
          customerPhone: order.userPhone,
          customerEmail: order.userEmail,
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
        paymentMethod: orders.paymentMethod,
        observations: orders.observations,
        paymentId: orders.paymentId,
        paymentStatus: orders.paymentStatus,
        userFullName: users.fullName,
        userPhone: users.phone,
        userEmail: users.email,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        statusName: orderStatus.name,
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

    return { 
      ...order,
      items,
      customerName: order.userFullName,
      customerPhone: order.userPhone,
      customerEmail: order.userEmail,
    }
  }),

  listByUser: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.userId) throw new Error("Usuário não autenticado")
    const userId = ctx.session.user.userId

    const userOrders = await db
      .select({
        orderId: orders.orderId,
        total: orders.total,
        status: orders.status,
        paymentMethod: orders.paymentMethod,
        observations: orders.observations,
        paymentId: orders.paymentId,
        paymentStatus: orders.paymentStatus,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        statusName: orderStatus.name,
      })
      .from(orders)
      .leftJoin(orderStatus, eq(orders.status, orderStatus.statusId))
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))

    const ordersWithItems = await Promise.all(
      userOrders.map(async (order) => {
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

  create: publicProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.number(),
            quantity: z.number().min(1),
          }),
        ),
        paymentMethod: z.enum(["dinheiro", "pix", "cartao"]),
        observations: z.string().optional(),
        total: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user?.userId) {
        throw new Error("Usuário não autenticado")
      }

      let totalCalculated = 0

      for (const item of input.items) {
        const productsFound = await db.select().from(products).where(eq(products.productId, item.productId))
        const product = productsFound[0]
        if (!product) throw new Error(`Produto ${item.productId} não encontrado`)
        
        totalCalculated += Number(product.price) * item.quantity
      }

      const frontendTotal = Number(input.total)
      const difference = Math.abs(totalCalculated - frontendTotal)
      
      if (difference > 0.01) {
        console.error("Total inválido - Diferença:", difference)
        console.error("Frontend:", frontendTotal, "Backend:", totalCalculated)
        throw new Error(`Total inválido. Esperado: ${frontendTotal}, Calculado: ${totalCalculated}`)
      }

      const createdOrders = await db
        .insert(orders)
        .values({
          userId: ctx.session.user.userId, 
          total: input.total, 
          status: 0,
          paymentMethod: input.paymentMethod,
          observations: input.observations,
          paymentStatus: "pending",
        })
        .returning()

      const order = createdOrders[0]
      if (!order) throw new Error("Falha ao criar pedido")

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

      await NotificationService.notifyNewOrder(
        order.orderId,
        ctx.session.user.fullName,
        input.total
      );

      return { success: true, orderId: order.orderId }
    }),

  updatePayment: publicProcedure
    .input(
      z.object({
        orderId: z.number(),
        paymentId: z.string(),
        paymentStatus: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const updatedOrders = await db.update(orders)
        .set({
          paymentId: input.paymentId,
          paymentStatus: input.paymentStatus,
          updatedAt: new Date(),
        })
        .where(eq(orders.orderId, input.orderId))
        .returning()

      const order = updatedOrders[0]
      if (!order) throw new Error("Pedido não encontrado")

      return { success: true, order }
    }),

  updateStatus: publicProcedure
    .input(
      z.object({
        orderId: z.number(),
        statusId: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [currentOrder] = await db.select().from(orders).where(eq(orders.orderId, input.orderId));
      if (!currentOrder) throw new Error("Pedido não encontrado");

      OrderStatusService.validateTransition(currentOrder!.status!, input.statusId);

      const [status] = await db.select().from(orderStatus).where(eq(orderStatus.statusId, input.statusId));
      if (!status) throw new Error("Status inválido");

      if (input.statusId === 6 && currentOrder.status !== 6) {
        const orderItemsList = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, input.orderId));

        for (const item of orderItemsList) {
          if (item.productId !== null) {
            const [product] = await db
              .select()
              .from(products)
              .where(eq(products.productId, item.productId));

            if (product) {
              await db
                .update(products)
                .set({ stock: product.stock + item.quantity })
                .where(eq(products.productId, item.productId));
            }
          }
        }
      }

      const updatedOrders = await db
        .update(orders)
        .set({
          status: input.statusId,
          updatedAt: new Date(),
        })
        .where(eq(orders.orderId, input.orderId))
        .returning();

      const order = updatedOrders[0];
      if (!order) throw new Error("Pedido não encontrado");

      await NotificationService.notifyOrderUpdate(
        order.userId!,
        order.orderId,
        input.statusId
      );

      // const [user] = await db.select().from(users).where(eq(users.userId, order.userId!));
      // if (user) {
      //   await NotificationService.notifyAdminOrderUpdate(
      //     order.orderId,
      //     user.fullName,
      //     currentOrder.status!, 
      //     input.statusId     
      //   );
      // }

      return { success: true, order };
    }),

  getNextStatuses: publicProcedure
    .input(z.object({ currentStatus: z.number() }))
    .query(async ({ input }) => {
      return OrderStatusService.getNextPossibleStatuses(input.currentStatus);
    }),

  getStatuses: publicProcedure.query(async () => {
    return await db.select().from(orderStatus).orderBy(orderStatus.statusId)
  }),

  delete: publicProcedure.input(z.object({ orderId: z.number() })).mutation(async ({ input }) => {
    await db.delete(orderItems).where(eq(orderItems.orderId, input.orderId))
    await db.delete(orders).where(eq(orders.orderId, input.orderId))
    return { success: true }
  }),

  syncOfflineOrders: publicProcedure
    .input(z.array(z.object({
      orderId: z.number().optional(),
      items: z.array(z.object({
        productId: z.number(),
        quantity: z.number(),
      })),
      paymentMethod: z.enum(["dinheiro", "pix", "cartao"]),
      observations: z.string().optional(),
      total: z.string(),
      offlineId: z.number(),
    })))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user?.userId) {
        throw new Error("Usuário não autenticado")
      }

      const results = []
      
      for (const offlineOrder of input) {
        try {
          let totalCalculated = 0

          for (const item of offlineOrder.items) {
            const productsFound = await db.select().from(products).where(eq(products.productId, item.productId))
            const product = productsFound[0]
            if (!product) continue
            
            totalCalculated += Number(product.price) * item.quantity
          }

          const createdOrders = await db
            .insert(orders)
            .values({
              userId: ctx.session.user.userId,
              total: offlineOrder.total,
              status: 0,
              paymentMethod: offlineOrder.paymentMethod,
              observations: offlineOrder.observations,
              paymentStatus: "pending",
            })
            .returning()

          const order = createdOrders[0]
          if (!order) continue

          for (const item of offlineOrder.items) {
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

          results.push({ 
            success: true, 
            orderId: order.orderId, 
            offlineId: offlineOrder.offlineId 
          })
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          
          results.push({ 
            success: false, 
            offlineId: offlineOrder.offlineId, 
            error: errorMessage 
          })
        }
      }

      return results
    }),
})