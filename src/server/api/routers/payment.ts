// server/api/routers/payment.ts - CORRIGIDO
import { z } from "zod"
import { MercadoPagoConfig, Preference, Payment } from "mercadopago"
import { createTRPCRouter, protectedProcedure } from "../trpc"
import { db } from "@/server/db"
import { orders } from "@/server/db/schema"
import { eq } from "drizzle-orm"
import { PaymentStatus } from "@/types/order"

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

export const paymentRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        amount: z.number(),
        description: z.string(),
        paymentMethod: z.enum(["card", "pix"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const roundedAmount = parseFloat(input.amount.toFixed(2))
        
        if (input.paymentMethod === "card") {
          const preference = new Preference(client)
          
          const result = await preference.create({
            body: {
              items: [
                {
                  id: input.orderId.toString(),
                  title: input.description,
                  quantity: 1,
                  unit_price: roundedAmount,
                  currency_id: "BRL",
                }
              ],
              back_urls: {
                success: `${process.env.NEXTAUTH_URL}/order/success`,
                failure: `${process.env.NEXTAUTH_URL}/order/failure`,
                pending: `${process.env.NEXTAUTH_URL}/order/pending`,
              },
              auto_return: "approved",
              external_reference: input.orderId.toString(),
              notification_url: `${process.env.NEXTAUTH_URL}/api/webhooks/mercadopago`,
              statement_descriptor: "BADAO GRILL",
            },
          })

          await db.update(orders)
            .set({
              paymentId: result.id,
              paymentStatus: "pending",
            })
            .where(eq(orders.orderId, input.orderId))

          return {
            paymentId: result.id,
            paymentUrl: result.init_point || result.sandbox_init_point,
          }

        } else if (input.paymentMethod === "pix") {
          const payment = new Payment(client)
          
          const result = await payment.create({
            body: {
              transaction_amount: roundedAmount,
              description: input.description,
              payment_method_id: "pix",
              payer: {
                email: ctx.session.user.email!,
                first_name: ctx.session.user.fullName?.split(' ')[0] || "Cliente",
                last_name: ctx.session.user.fullName?.split(' ').slice(1).join(' ') || "",
              },
              external_reference: input.orderId.toString(),
              notification_url: `${process.env.NEXTAUTH_URL}/api/webhooks/mercadopago`,
            },
          })

          await db.update(orders)
            .set({
              paymentId: result.id!.toString(),
              paymentStatus: "pending",
            })
            .where(eq(orders.orderId, input.orderId))

          return {
            qrCode: result.point_of_interaction?.transaction_data?.qr_code || "",
            qrCodeBase64: result.point_of_interaction?.transaction_data?.qr_code_base64 || "",
            transactionId: result.id!.toString(),
            expirationDate: result.date_of_expiration || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          }
        }

        throw new Error("Método de pagamento não suportado")

      } catch (error: any) {
        console.error("Erro ao criar pagamento:", error)
        if (error.response?.data) {
          console.error("Detalhes do erro MP:", error.response.data)
        }
        throw new Error(error.message || "Erro ao processar pagamento")
      }
    }),
  checkStatus: protectedProcedure
  .input(z.object({ orderId: z.number() }))
  .query(async ({ input, ctx }) => {
    const order = await db.query.orders.findFirst({
      where: eq(orders.orderId, input.orderId),
    })
    
    if (!order) {
      throw new Error("Pedido não encontrado")
    }
    
    return order.paymentStatus as PaymentStatus
  }),
})